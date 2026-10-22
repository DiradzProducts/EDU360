import datetime
import json
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_, and_, desc

from app.core.database import get_db
from app.models.models import (
    InventoryItem, InventoryMovement, AssetCustodyLog,
    PurchaseOrder, Student, Notification
)
from app.schemas.schemas import (
    InventoryItemCreate, InventoryItemResponse,
    StockAdjustmentRequest, RequisitionPORequest,
    InventoryMovementResponse, AssetCustodyCheckoutRequest,
    AssetCustodyReturnRequest, AssetCustodyLogResponse,
    ClearanceCheckResponse, PurchaseOrderResponse
)
from app.routers.notifications import create_system_notification

logger = logging.getLogger("edu360.inventory")

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


# =========================================================================
# 1. INVENTORY ITEMS & REAGENTS LEDGER
# =========================================================================

@router.get("/items", response_model=List[InventoryItemResponse])
async def get_inventory_items(
    category: Optional[str] = Query(None, description="Filter by category"),
    condition: Optional[str] = Query(None, description="Filter by condition"),
    search: Optional[str] = Query(None, description="Search by name, tag or location"),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch all inventory items, lab consumables, and digital hardware with optional filters.
    """
    query = select(InventoryItem).order_by(InventoryItem.category, InventoryItem.name)

    if category and category.lower() != "all":
        query = query.where(InventoryItem.category == category)
    if condition and condition.lower() != "all":
        query = query.where(InventoryItem.condition == condition)
    if search:
        s = f"%{search.strip()}%"
        query = query.where(
            or_(
                InventoryItem.name.ilike(s),
                InventoryItem.asset_tag.ilike(s),
                InventoryItem.location.ilike(s)
            )
        )

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/items", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    payload: InventoryItemCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Provision a new inventory item or lab chemical asset into the database.
    """
    # Check for duplicate asset tag
    existing = await db.execute(select(InventoryItem).where(InventoryItem.asset_tag == payload.asset_tag))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail=f"Asset Tag '{payload.asset_tag}' already exists in inventory register."
        )

    available = max(0, payload.total_stock - payload.issued_count - payload.damaged_count)
    cond = payload.condition
    if available <= payload.reorder_level:
        cond = "Low Buffer"

    item = InventoryItem(
        asset_tag=payload.asset_tag,
        name=payload.name,
        category=payload.category,
        sub_category=payload.sub_category,
        location=payload.location,
        total_stock=payload.total_stock,
        available_stock=available,
        issued_count=payload.issued_count,
        damaged_count=payload.damaged_count,
        reorder_level=payload.reorder_level,
        unit_of_measure=payload.unit_of_measure,
        unit_cost=payload.unit_cost,
        amc_vendor=payload.amc_vendor,
        amc_valid_until=payload.amc_valid_until,
        condition=cond,
        last_audited=payload.last_audited or datetime.datetime.utcnow().strftime("%d %b %Y")
    )
    db.add(item)
    await db.flush()

    # Log initial movement
    movement = InventoryMovement(
        item_id=item.id,
        movement_type="Initial Stock Provision",
        quantity=payload.total_stock,
        reference_no=item.asset_tag,
        recorded_by="Mrs. Shalini Rao (Store Lead)",
        notes=f"Initial provisioning of {item.name} in {item.location}"
    )
    db.add(movement)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/items/{item_id}/stock", response_model=InventoryItemResponse)
async def adjust_inventory_stock(
    item_id: int,
    payload: StockAdjustmentRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Quick stock adjustment (+/- count) for laboratory consumption, breakages, or manual restock.
    """
    item = await db.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found.")

    new_total = max(0, item.total_stock + payload.delta)
    item.total_stock = new_total
    item.available_stock = max(0, new_total - item.issued_count - item.damaged_count)

    # Condition state machine
    if item.available_stock <= item.reorder_level:
        item.condition = "Low Buffer"
    elif item.damaged_count > 0 and item.damaged_count >= item.total_stock * 0.5:
        item.condition = "Needs Attention"
    else:
        item.condition = "Optimal"

    item.last_audited = datetime.datetime.utcnow().strftime("%d %b %Y")

    # Log movement
    movement = InventoryMovement(
        item_id=item.id,
        movement_type=payload.reason,
        quantity=payload.delta,
        reference_no=f"ADJ-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M')}",
        recorded_by=payload.recorded_by or "Mrs. Shalini Rao (Store Lead)",
        notes=payload.notes or f"Stock adjusted by {payload.delta} {item.unit_of_measure} for {payload.reason}"
    )
    db.add(movement)
    await db.commit()
    await db.refresh(item)
    return item


# =========================================================================
# 2. 1-CLICK REQUISITION TO ACCOUNTS PO BRIDGE
# =========================================================================

@router.post("/items/{item_id}/requisition-po", response_model=PurchaseOrderResponse)
async def create_requisition_purchase_order(
    item_id: int,
    payload: RequisitionPORequest,
    db: AsyncSession = Depends(get_db)
):
    """
    1-Click Requisition PO bridge: When an item reaches low buffer, auto-drafts a pending
    Purchase Order for the Accounts Coordinator (Mr. Arvind Krishnan) to authorize.
    """
    item = await db.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found.")

    po_count_res = await db.execute(select(PurchaseOrder))
    existing_count = len(po_count_res.scalars().all())
    po_no = f"PO-2026-OCT-{100 + existing_count + 1}"

    items_data = [
        {
            "item_id": item.id,
            "asset_tag": item.asset_tag,
            "item_name": item.name,
            "quantity": payload.quantity,
            "unit_price": payload.unit_price,
            "total": payload.quantity * payload.unit_price,
            "unit": item.unit_of_measure
        }
    ]

    total_amount = payload.quantity * payload.unit_price

    po = PurchaseOrder(
        po_number=po_no,
        department=payload.department or item.category,
        vendor_name=payload.vendor_name,
        items_json=json.dumps(items_data),
        total_amount=total_amount,
        expected_delivery_date=payload.expected_delivery_date or "Within 5 Working Days",
        status="Issued",
        notes=payload.notes or f"Auto-requisitioned by Store Lead: Buffer replenishment for {item.name}"
    )
    db.add(po)

    # In-App Notification for Accounts Coordinator
    try:
        await create_system_notification(
            db=db,
            user_id=1,  # Super admin / Accounts broadcast
            title=f"New Purchase Requisition: {po_no}",
            message=f"Store Lead requisitioned ₹{total_amount:,.2f} for {payload.quantity} {item.unit_of_measure} of {item.name}.",
            category="Procurement",
            link="/accounts_coordinator"
        )
    except Exception as e:
        logger.warning(f"Failed to emit notification: {e}")

    await db.commit()
    await db.refresh(po)
    return po


# =========================================================================
# 3. DAILY EQUIPMENT CUSTODY REGISTER (CHECK-IN / CHECK-OUT)
# =========================================================================

@router.get("/custody", response_model=List[AssetCustodyLogResponse])
async def get_custody_logs(
    status: Optional[str] = Query(None, description="Active or Returned"),
    borrower_role: Optional[str] = Query(None, description="Teacher, Student, or Staff"),
    search: Optional[str] = Query(None, description="Search borrower name or item"),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch daily asset loans and active custody records.
    """
    query = (
        select(AssetCustodyLog, InventoryItem.name, InventoryItem.asset_tag)
        .join(InventoryItem, AssetCustodyLog.item_id == InventoryItem.id)
        .order_by(desc(AssetCustodyLog.checkout_time))
    )

    if status and status.lower() != "all":
        query = query.where(AssetCustodyLog.status == status)
    if borrower_role and borrower_role.lower() != "all":
        query = query.where(AssetCustodyLog.borrower_role == borrower_role)
    if search:
        s = f"%{search.strip()}%"
        query = query.where(
            or_(
                AssetCustodyLog.borrower_name.ilike(s),
                AssetCustodyLog.class_room.ilike(s),
                InventoryItem.name.ilike(s),
                InventoryItem.asset_tag.ilike(s)
            )
        )

    result = await db.execute(query)
    rows = result.all()

    logs = []
    for log, item_name, asset_tag in rows:
        logs.append(
            AssetCustodyLogResponse(
                id=log.id,
                item_id=log.item_id,
                item_name=item_name,
                asset_tag=asset_tag,
                borrower_name=log.borrower_name,
                borrower_role=log.borrower_role,
                borrower_ref_id=log.borrower_ref_id,
                class_room=log.class_room,
                quantity=log.quantity,
                checkout_time=log.checkout_time,
                expected_return_time=log.expected_return_time,
                actual_return_time=log.actual_return_time,
                condition_on_return=log.condition_on_return,
                fine_assessed=log.fine_assessed,
                status=log.status
            )
        )
    return logs


@router.post("/custody/checkout", response_model=AssetCustodyLogResponse)
async def checkout_asset(
    payload: AssetCustodyCheckoutRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Check-out equipment or tablets to a teacher, class or student.
    Decrements available stock and creates an active custody log.
    """
    item = await db.get(InventoryItem, payload.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found.")

    if item.available_stock < payload.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient available stock. Requested: {payload.quantity}, Available: {item.available_stock}."
        )

    # Decrement available, increment issued
    item.available_stock = max(0, item.available_stock - payload.quantity)
    item.issued_count = item.issued_count + payload.quantity

    custody = AssetCustodyLog(
        item_id=item.id,
        borrower_name=payload.borrower_name,
        borrower_role=payload.borrower_role,
        borrower_ref_id=payload.borrower_ref_id,
        class_room=payload.class_room,
        quantity=payload.quantity,
        checkout_time=datetime.datetime.utcnow(),
        expected_return_time=payload.expected_return_time or (datetime.datetime.utcnow() + datetime.timedelta(hours=6)),
        condition_on_return="Pending Return",
        fine_assessed=0.0,
        status="Active"
    )
    db.add(custody)
    await db.flush()

    movement = InventoryMovement(
        item_id=item.id,
        movement_type="Issued on Loan",
        quantity=-payload.quantity,
        reference_no=f"CUST-0{custody.id}",
        recorded_by="Mrs. Shalini Rao (Store Lead)",
        notes=f"Issued {payload.quantity} {item.unit_of_measure} to {payload.borrower_name} ({payload.class_room or payload.borrower_role})"
    )
    db.add(movement)
    await db.commit()
    await db.refresh(custody)

    return AssetCustodyLogResponse(
        id=custody.id,
        item_id=item.id,
        item_name=item.name,
        asset_tag=item.asset_tag,
        borrower_name=custody.borrower_name,
        borrower_role=custody.borrower_role,
        borrower_ref_id=custody.borrower_ref_id,
        class_room=custody.class_room,
        quantity=custody.quantity,
        checkout_time=custody.checkout_time,
        expected_return_time=custody.expected_return_time,
        actual_return_time=custody.actual_return_time,
        condition_on_return=custody.condition_on_return,
        fine_assessed=custody.fine_assessed,
        status=custody.status
    )


@router.post("/custody/{log_id}/return", response_model=AssetCustodyLogResponse)
async def return_asset(
    log_id: int,
    payload: AssetCustodyReturnRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Check-in returned equipment: restores available stock, marks custody log 'Returned',
    and records any damaged count or assessed fee.
    """
    custody = await db.get(AssetCustodyLog, log_id)
    if not custody:
        raise HTTPException(status_code=404, detail="Custody log not found.")

    if custody.status == "Returned":
        raise HTTPException(status_code=400, detail="This custody loan has already been closed and returned.")

    item = await db.get(InventoryItem, custody.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Linked inventory item not found.")

    custody.status = "Returned"
    custody.actual_return_time = datetime.datetime.utcnow()
    custody.condition_on_return = payload.condition_on_return
    custody.fine_assessed = payload.fine_assessed

    # Calculate restored stock
    returned_intact = max(0, custody.quantity - payload.damaged_qty)
    item.issued_count = max(0, item.issued_count - custody.quantity)
    item.available_stock = item.available_stock + returned_intact
    if payload.damaged_qty > 0:
        item.damaged_count = item.damaged_count + payload.damaged_qty

    # Recheck condition
    if item.available_stock <= item.reorder_level:
        item.condition = "Low Buffer"
    else:
        item.condition = "Optimal"

    movement = InventoryMovement(
        item_id=item.id,
        movement_type="Loan Check-in",
        quantity=returned_intact,
        reference_no=f"RET-0{custody.id}",
        recorded_by="Mrs. Shalini Rao (Store Lead)",
        notes=payload.notes or f"Returned {returned_intact} intact, {payload.damaged_qty} damaged. Condition: {payload.condition_on_return}"
    )
    db.add(movement)
    await db.commit()
    await db.refresh(custody)

    return AssetCustodyLogResponse(
        id=custody.id,
        item_id=item.id,
        item_name=item.name,
        asset_tag=item.asset_tag,
        borrower_name=custody.borrower_name,
        borrower_role=custody.borrower_role,
        borrower_ref_id=custody.borrower_ref_id,
        class_room=custody.class_room,
        quantity=custody.quantity,
        checkout_time=custody.checkout_time,
        expected_return_time=custody.expected_return_time,
        actual_return_time=custody.actual_return_time,
        condition_on_return=custody.condition_on_return,
        fine_assessed=custody.fine_assessed,
        status=custody.status
    )


# =========================================================================
# 4. TRANSFER CERTIFICATE (TC) EXIT CLEARANCE ASSET AUDIT
# =========================================================================

@router.get("/clearance/student/{student_id}", response_model=ClearanceCheckResponse)
async def check_student_asset_clearance(
    student_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Checks if a departing student has any unreturned lab apparatus, sports gear,
    or coding tablets before Transfer Certificate (TC) release.
    """
    student = await db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    # Match by student name or roll number
    query = (
        select(AssetCustodyLog, InventoryItem.name)
        .join(InventoryItem, AssetCustodyLog.item_id == InventoryItem.id)
        .where(
            AssetCustodyLog.status == "Active",
            or_(
                AssetCustodyLog.borrower_name.ilike(f"%{student.name}%"),
                AssetCustodyLog.borrower_ref_id == student.roll_no,
                AssetCustodyLog.borrower_ref_id == student.admission_no
            )
        )
    )
    result = await db.execute(query)
    active_holds = result.all()

    pending_items = []
    total_fines = 0.0
    for log, item_name in active_holds:
        pending_items.append(f"{log.quantity}x {item_name} (Borrowed {log.checkout_time.strftime('%d %b')})")
        total_fines += log.fine_assessed

    is_cleared = (len(active_holds) == 0)

    return ClearanceCheckResponse(
        student_id=student.id,
        student_name=student.name,
        is_cleared=is_cleared,
        active_hold_count=len(active_holds),
        pending_items=pending_items,
        total_unpaid_fines=total_fines
    )
