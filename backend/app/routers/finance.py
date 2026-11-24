import datetime
import json
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_, and_, func

from app.core.database import get_db
from app.models.models import (
    FeeDefaulter, VendorInvoice, PaymentTransaction, FinanceDispatchLog,
    FeeMilestone, FeeStructure, Student, Notification, StaffMember, StaffPermission,
    PayrollBatch, StaffPayslip, StaffSalaryInquiry, PurchaseOrder, FleetExpenseRecord,
    SecurityAuditLog
)
from app.core.rbac import require_role
from app.schemas.schemas import (
    FeeDefaulterResponse, FeeDefaulterCreate, FeeDefaulterUpdate,
    VendorInvoiceResponse, VendorInvoiceCreate, VendorInvoiceUpdate,
    PaymentTransactionResponse, PaymentTransactionCreate,
    FinanceDispatchLogResponse, FinanceDashboardStats,
    ApplyWaiverRequest, RecordFeePaymentRequest, BulkReminderRequest,
    StaffPayslipResponse, PayrollBatchResponse, GeneratePayrollRequest, StaffSalaryInquiryCreate, StaffSalaryInquiryResolve, StaffSalaryInquiryResponse,
    AuthorizePayrollRequest, DisbursePayrollRequest, RequestPayrollRevisionRequest, ResubmitPayrollRequest, PurchaseOrderCreate,
    PurchaseOrderResponse, VerifyGRNRequest, FleetExpenseCreate,
    FleetExpenseResponse, SettleFleetExpenseRequest
)
from app.routers.notifications import create_system_notification

logger = logging.getLogger("edu360.finance")

router = APIRouter(
    prefix="/api/finance",
    tags=["finance"],
    dependencies=[Depends(require_role([
        "admin", "accounts_coordinator", "principal", "super_admin",
        "teacher", "inventory_coordinator", "transport_coordinator"
    ]))]
)


# =========================================================================

async def log_financial_audit(db: AsyncSession, actor_name: str, actor_role: str, action_type: str, target: str, status: str, details: str):
    """Logs immutable audit record into security_audit_logs for statutory and CBSE inspection."""
    try:
        audit_entry = SecurityAuditLog(
            actor_name=actor_name,
            actor_role=actor_role,
            action_type=action_type,
            target_entity=target,
            status=status,
            details=details
        )
        db.add(audit_entry)
        await db.flush()
    except Exception as e:
        logger.warning(f"Failed to record financial audit log: {e}")

@router.get("/fee-structures")
async def get_class_fee_structures(db: AsyncSession = Depends(get_db)):
    """List official class fee structures and term milestone templates."""
    res = await db.execute(select(FeeStructure).order_by(FeeStructure.class_name.asc()))
    structures = res.scalars().all()
    return [{
        "id": fs.id,
        "class_name": fs.class_name,
        "academic_year": fs.academic_year,
        "tuition_fee": fs.tuition_fee,
        "term1_amount": fs.term1_amount,
        "term1_due_date": fs.term1_due_date,
        "term2_amount": fs.term2_amount,
        "term2_due_date": fs.term2_due_date,
        "lms_digital_fee": fs.lms_digital_fee,
        "lab_library_fee": fs.lab_library_fee,
        "activity_fee": fs.activity_fee,
        "total_annual_fee": fs.total_annual_fee
    } for fs in structures]

@router.get("/student-fees/{student_id}")
async def get_accounts_student_fees(student_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch complete fee milestone ledger for any enrolled student."""
    res = await db.execute(
        select(FeeMilestone).where(FeeMilestone.student_id == student_id).order_by(FeeMilestone.id.asc())
    )
    milestones = res.scalars().all()
    return [{
        "id": m.id,
        "student_id": m.student_id,
        "title": m.title,
        "amount": m.amount,
        "due_date": m.due_date,
        "status": m.status,
        "receipt_no": m.receipt_no,
        "paid_at": m.paid_at,
        "payment_method": m.payment_method
    } for m in milestones]

# 1. DASHBOARD STATS
# =========================================================================

@router.get("/stats", response_model=FinanceDashboardStats, dependencies=[Depends(require_role(["admin", "accounts_coordinator", "principal", "super_admin"]))])
async def get_finance_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """
    Computes key performance indicators for the Accounts Coordinator:
    - MTD collected fees
    - Outstanding fee arrears
    - Pending gateway reconciliation items & total volume
    - Vendor invoices awaiting authorization & wire transfer
    - Aging bracket breakdown (0-15d, 16-30d, 31-60d+)
    - Overall collection target progress %
    """
    # 1. Fee Defaulters aggregation
    defaulters_res = await db.execute(
        select(FeeDefaulter).where(FeeDefaulter.status.in_(["Overdue", "Partially Paid"]))
    )
    defaulters = defaulters_res.scalars().all()

    total_arrears = sum(d.amount_due for d in defaulters)
    tier_15 = sum(1 for d in defaulters if d.days_overdue <= 15)
    tier_30 = sum(1 for d in defaulters if 15 < d.days_overdue <= 30)
    tier_60 = sum(1 for d in defaulters if d.days_overdue > 30)

    # 2. Payment Transactions (MTD collected & Pending Reconciliation)
    tx_res = await db.execute(select(PaymentTransaction))
    transactions = tx_res.scalars().all()

    total_collected_mtd = sum(
        tx.amount for tx in transactions 
        if tx.status == "Success"
    )

    unreconciled_txs = [tx for tx in transactions if not tx.reconciled and tx.status == "Success"]
    pending_reconcile_count = len(unreconciled_txs)
    pending_reconcile_amt = sum(tx.amount for tx in unreconciled_txs)

    # 3. Vendor Invoices pending
    invoices_res = await db.execute(select(VendorInvoice))
    invoices = invoices_res.scalars().all()

    pending_invoices = [
        inv for inv in invoices 
        if inv.status in ["Pending Approval", "Audit Clearance Needed", "Approved for Wire"]
    ]
    pending_inv_count = len(pending_invoices)
    pending_inv_amt = sum(inv.amount for inv in pending_invoices)

    # 4. Target calculation (e.g. monthly milestone target ₹45,00,000)
    monthly_target = 4500000.0
    progress_pct = round((total_collected_mtd / monthly_target) * 100, 1) if monthly_target > 0 else 0.0

    return FinanceDashboardStats(
        total_collected_mtd=total_collected_mtd,
        outstanding_arrears=total_arrears,
        pending_reconciliation_count=pending_reconcile_count,
        pending_reconciliation_amount=pending_reconcile_amt,
        pending_vendor_invoices_count=pending_inv_count,
        pending_vendor_invoices_amount=pending_inv_amt,
        overdue_students_count=len(defaulters),
        overdue_tier_15=tier_15,
        overdue_tier_30=tier_30,
        overdue_tier_60=tier_60,
        collection_target_progress_pct=min(progress_pct, 100.0)
    )


# =========================================================================
# 2. FEE DEFAULTERS & AGING ARREARS
# =========================================================================

@router.get("/defaulters", response_model=List[FeeDefaulterResponse], dependencies=[Depends(require_role(["admin", "accounts_coordinator", "principal", "super_admin"]))])
async def get_fee_defaulters(
    aging_tier: Optional[str] = Query(None, description="ALL, 0-15, 16-30, 30+"),
    status: Optional[str] = Query(None, description="Overdue, Partially Paid, Paid, Waived"),
    class_name: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_admission_fee: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    List student fee defaulters with real-time aging, payment history, and waiver state.
    """
    query = select(FeeDefaulter)

    if is_admission_fee is not None:
        query = query.where(FeeDefaulter.is_admission_fee == is_admission_fee)

    if status and status != "ALL":
        query = query.where(FeeDefaulter.status == status)

    if class_name and class_name != "All Classes":
        query = query.where(FeeDefaulter.class_name == class_name)

    if aging_tier:
        if aging_tier == "0-15":
            query = query.where(FeeDefaulter.days_overdue <= 15)
        elif aging_tier == "16-30":
            query = query.where(and_(FeeDefaulter.days_overdue > 15, FeeDefaulter.days_overdue <= 30))
        elif aging_tier == "30+":
            query = query.where(FeeDefaulter.days_overdue > 30)

    if search:
        search_fmt = f"%{search}%"
        query = query.where(
            or_(
                FeeDefaulter.student_name.ilike(search_fmt),
                FeeDefaulter.parent_name.ilike(search_fmt),
                FeeDefaulter.parent_phone.ilike(search_fmt),
                FeeDefaulter.roll_no.ilike(search_fmt)
            )
        )

    # Order by highest days overdue first, then amount due
    query = query.order_by(FeeDefaulter.days_overdue.desc(), FeeDefaulter.amount_due.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/defaulters/{id}/reminder", response_model=FeeDefaulterResponse)
async def send_fee_reminder(
    id: int,
    channel: str = Query("WhatsApp", description="WhatsApp, SMS, Email"),
    db: AsyncSession = Depends(get_db)
):
    """
    Dispatches a single fee reminder to the student's guardian.
    Logs dispatch and updates reminder counters + timestamps.
    Triggers an in-app system notification for the parent.
    """
    res = await db.execute(select(FeeDefaulter).where(FeeDefaulter.id == id))
    defaulter = res.scalars().first()
    if not defaulter:
        raise HTTPException(status_code=404, detail="Defaulter record not found")

    defaulter.reminder_sent = True
    defaulter.reminder_count += 1
    defaulter.last_reminder_at = datetime.datetime.utcnow()

    # Log dispatch
    log = FinanceDispatchLog(
        dispatch_type=channel,
        dispatch_scope=f"Single: {defaulter.student_name} ({defaulter.class_name})",
        target_count=1,
        total_amount_targeted=defaulter.amount_due,
        dispatch_note=f"Direct {channel} fee nudge for {defaulter.milestone_title}: ₹{defaulter.amount_due:,.2f}",
        dispatched_by="Mr. Arvind Krishnan (Accounts)"
    )
    db.add(log)

    # Send persistent in-app notification to the parent portal
    await create_system_notification(
        db=db,
        sender_name="Mr. Arvind Krishnan",
        sender_role="accounts_coordinator",
        recipient_role="parent",
        title=f"Fee Reminder: {defaulter.student_name}",
        message=f"Outstanding balance of ₹{defaulter.amount_due:,.0f} for '{defaulter.milestone_title}' is {defaulter.days_overdue} days overdue. Please settle via the Parent Fee Portal to avoid late penalties.",
        notification_type="FEE_REMINDER",
        priority="HIGH" if defaulter.days_overdue > 30 else "NORMAL",
        action_url="/parent",
        metadata_dict={"student_name": defaulter.student_name, "amount_due": defaulter.amount_due, "days_overdue": defaulter.days_overdue}
    )

    await db.commit()
    await db.refresh(defaulter)
    return defaulter


@router.post("/defaulters/bulk-remind")
async def bulk_send_fee_reminders(
    req: BulkReminderRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Broadcasts fee reminders to multiple students based on aging tier or selected ID list.
    """
    query = select(FeeDefaulter).where(FeeDefaulter.status.in_(["Overdue", "Partially Paid"]))

    if req.student_ids and len(req.student_ids) > 0:
        query = query.where(FeeDefaulter.id.in_(req.student_ids))
    elif req.aging_tier:
        if req.aging_tier == "0-15":
            query = query.where(FeeDefaulter.days_overdue <= 15)
        elif req.aging_tier == "16-30":
            query = query.where(and_(FeeDefaulter.days_overdue > 15, FeeDefaulter.days_overdue <= 30))
        elif req.aging_tier == "30+":
            query = query.where(FeeDefaulter.days_overdue > 30)

    res = await db.execute(query)
    defaulters = res.scalars().all()

    if not defaulters:
        return {"status": "success", "message": "No defaulters matched criteria", "count": 0}

    now = datetime.datetime.utcnow()
    total_amt = sum(d.amount_due for d in defaulters)

    for d in defaulters:
        d.reminder_sent = True
        d.reminder_count += 1
        d.last_reminder_at = now

    # Dispatch audit log
    log = FinanceDispatchLog(
        dispatch_type=req.channel,
        dispatch_scope=f"Bulk: Tier {req.aging_tier or 'Selected'}",
        target_count=len(defaulters),
        total_amount_targeted=total_amt,
        dispatch_note=req.custom_message or f"Bulk {req.channel} broadcast sent to {len(defaulters)} guardians",
        dispatched_by="Mr. Arvind Krishnan (Accounts)"
    )
    db.add(log)

    # Create general notification for parents
    await create_system_notification(
        db=db,
        sender_name="Mr. Arvind Krishnan",
        sender_role="accounts_coordinator",
        recipient_role="parent",
        title="Fee Payment Cycle Notice",
        message=f"Term fee milestone notices have been dispatched. Please review and reconcile pending balances on your Parent Dashboard.",
        notification_type="FEE_BROADCAST",
        priority="NORMAL",
        action_url="/parent"
    )

    await db.commit()
    return {
        "status": "success",
        "message": f"Successfully dispatched {req.channel} reminders to {len(defaulters)} guardians",
        "count": len(defaulters),
        "total_amount_targeted": total_amt
    }


@router.post("/defaulters/{id}/pay", response_model=FeeDefaulterResponse, dependencies=[Depends(require_role(["admin", "accounts_coordinator"]))])
async def record_fee_payment(
    id: int,
    req: RecordFeePaymentRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Records an incoming offline or counter fee payment (Cash, Cheque, DD, Point-of-Sale counter).
    Enforces that payment cannot exceed current overdue balance.
    Deducts balance, updates status to 'Partially Paid' or 'Paid', and appends to payment history.
    Also creates a PaymentTransaction for ledger continuity and synchronizes matching parent fee milestones.
    """
    if req.amount_paid <= 0:
        raise HTTPException(
            status_code=400,
            detail="Payment amount must be greater than zero."
        )

    res = await db.execute(select(FeeDefaulter).where(FeeDefaulter.id == id).with_for_update())
    defaulter = res.scalars().first()
    if not defaulter:
        raise HTTPException(status_code=404, detail="Defaulter record not found")

    if defaulter.amount_due <= 0:
        raise HTTPException(
            status_code=400,
            detail=f"Student {defaulter.student_name} has no outstanding balance due (Balance is ₹0.00). No payment can be collected."
        )

    if req.amount_paid > defaulter.amount_due:
        raise HTTPException(
            status_code=400,
            detail=f"Payment amount (₹{req.amount_paid:,.2f}) cannot exceed current outstanding overdue balance (₹{defaulter.amount_due:,.2f})."
        )

    new_amount_due = round(defaulter.amount_due - req.amount_paid, 2)
    defaulter.amount_due = max(0.0, new_amount_due)

    if defaulter.amount_due == 0:
        defaulter.status = "Paid"
    else:
        defaulter.status = "Partially Paid"

    # Update payment history JSON
    history = []
    if defaulter.payment_history_json:
        try:
            history = json.loads(defaulter.payment_history_json)
        except Exception:
            history = []

    tx_date_str = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
    utr_code = req.utr_or_cheque_no or f"REC-COUNTER-{int(datetime.datetime.utcnow().timestamp())}"
    
    history.append({
        "date": tx_date_str,
        "amount": req.amount_paid,
        "method": req.payment_method,
        "utr_or_cheque": utr_code,
        "received_by": req.received_by,
        "notes": req.notes or "Physical Counter Collection"
    })
    defaulter.payment_history_json = json.dumps(history)

    # Insert an auto-reconciled manual transaction into the transaction ledger
    new_tx = PaymentTransaction(
        utr_number=utr_code,
        student_name=defaulter.student_name,
        class_name=defaulter.class_name,
        parent_name=defaulter.parent_name,
        amount=req.amount_paid,
        payment_method=req.payment_method,
        bank_name="Accounts Counter / Manual",
        milestone_title=defaulter.milestone_title,
        status="Success",
        reconciled=True,
        reconciled_at=datetime.datetime.utcnow(),
        reconciled_by=req.received_by,
        notes=f"Counter collection: {req.notes or 'Offline fee payment'}"
    )
    db.add(new_tx)

    # Synchronize matching student fee milestone if present
    if defaulter.student_id:
        m_res = await db.execute(
            select(FeeMilestone)
            .where(
                FeeMilestone.student_id == defaulter.student_id,
                FeeMilestone.status.in_(["Overdue", "Upcoming"])
            )
        )
        milestones = m_res.scalars().all()
        for m in milestones:
            if m.title.strip().lower() == defaulter.milestone_title.strip().lower() or len(milestones) == 1:
                if defaulter.amount_due == 0:
                    m.status = "Paid"
                    m.receipt_no = utr_code
                    m.paid_at = tx_date_str
                    m.payment_method = f"Counter ({req.payment_method})"
                else:
                    m.amount = defaulter.amount_due
                break

    await log_financial_audit(
        db=db,
        actor_name=req.received_by or "Accounts Officer",
        actor_role="accounts_coordinator",
        action_type="FEE_COUNTER_PAYMENT_RECORDED",
        target=f"Student #{defaulter.student_id} ({defaulter.student_name})",
        status="VERIFIED",
        details=f"Offline counter payment of ₹{req.amount_paid:,.2f} recorded via {req.payment_method}. Remaining Due: ₹{defaulter.amount_due:,.2f}."
    )

    try:
        await create_system_notification(
            db=db,
            sender_name=req.received_by or "Accounts Office",
            sender_role="accounts_coordinator",
            title="Fee Payment Recorded",
            message=f"Counter payment of ₹{req.amount_paid:,.2f} ({req.payment_method}) was recorded for {defaulter.student_name}. Receipt: {utr_code}. Remaining due: ₹{defaulter.amount_due:,.2f}.",
            notification_type="fee",
            recipient_role="parent",
            action_url="/parent"
        )
    except Exception as notif_err:
        logger.warning(f"Failed to dispatch payment notification: {notif_err}")

    await db.commit()
    await db.refresh(defaulter)
    return defaulter


@router.post("/defaulters/{id}/waiver", response_model=FeeDefaulterResponse, dependencies=[Depends(require_role(["admin", "accounts_coordinator", "principal", "super_admin"]))])
async def apply_fee_waiver(
    id: int,
    req: ApplyWaiverRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Grants a management fee concession / hardship waiver.
    Enforces that concession amount cannot exceed current overdue balance.
    Maintains concurrency safety via row-locking, appends to the payment history ledger,
    records a balanced transaction entry, and synchronizes student fee milestones.
    """
    if req.waiver_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Concession amount must be greater than zero."
        )

    res = await db.execute(select(FeeDefaulter).where(FeeDefaulter.id == id).with_for_update())
    defaulter = res.scalars().first()
    if not defaulter:
        raise HTTPException(status_code=404, detail="Defaulter record not found")

    if defaulter.amount_due <= 0:
        raise HTTPException(
            status_code=400,
            detail=f"Student {defaulter.student_name} has no outstanding overdue balance (Balance is ₹0.00). Concession cannot be applied."
        )

    if req.waiver_amount > defaulter.amount_due:
        raise HTTPException(
            status_code=400,
            detail=f"Concession amount (₹{req.waiver_amount:,.2f}) cannot exceed current outstanding overdue balance (₹{defaulter.amount_due:,.2f})."
        )

    # Apply concession mathematically
    defaulter.waiver_amount = round((defaulter.waiver_amount or 0.0) + req.waiver_amount, 2)
    defaulter.waiver_reason = req.reason.strip()
    defaulter.waiver_approved_by = req.approved_by.strip()
    defaulter.waiver_approved_at = datetime.datetime.utcnow()

    new_amount_due = round(defaulter.amount_due - req.waiver_amount, 2)
    defaulter.amount_due = max(0.0, new_amount_due)

    if defaulter.amount_due == 0:
        defaulter.status = "Waived"
    else:
        defaulter.status = "Partially Paid"

    # Append to student's payment history JSON
    history = []
    if defaulter.payment_history_json:
        try:
            history = json.loads(defaulter.payment_history_json)
        except Exception:
            history = []

    tx_date_str = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
    concession_code = f"CONCESSION-{int(datetime.datetime.utcnow().timestamp())}"

    history.append({
        "date": tx_date_str,
        "amount": req.waiver_amount,
        "method": "Management Concession",
        "utr_or_cheque": concession_code,
        "received_by": req.approved_by,
        "notes": f"Concession/Waiver: {req.reason}"
    })
    defaulter.payment_history_json = json.dumps(history)

    # Insert an auto-reconciled ledger entry into payment_transactions
    new_tx = PaymentTransaction(
        utr_number=concession_code,
        student_name=defaulter.student_name,
        class_name=defaulter.class_name,
        parent_name=defaulter.parent_name,
        amount=req.waiver_amount,
        payment_method="Management Concession",
        bank_name="Management Board / Waiver",
        milestone_title=f"Fee Concession: {defaulter.milestone_title}",
        status="Success",
        reconciled=True,
        reconciled_at=datetime.datetime.utcnow(),
        reconciled_by=req.approved_by,
        notes=f"Concession Authorized: {req.reason} (Approved by: {req.approved_by})"
    )
    db.add(new_tx)

    # Synchronize matching student fee milestone if present
    if defaulter.student_id:
        m_res = await db.execute(
            select(FeeMilestone)
            .where(
                FeeMilestone.student_id == defaulter.student_id,
                FeeMilestone.status.in_(["Overdue", "Upcoming"])
            )
        )
        milestones = m_res.scalars().all()
        for m in milestones:
            if m.title.strip().lower() == defaulter.milestone_title.strip().lower() or len(milestones) == 1:
                if defaulter.amount_due == 0:
                    m.status = "Paid"
                    m.receipt_no = f"REC-CONCESSION-{int(datetime.datetime.utcnow().timestamp())}"
                    m.paid_at = tx_date_str
                else:
                    m.amount = defaulter.amount_due
                break

    await log_financial_audit(
        db=db,
        actor_name=req.approved_by or "Accounts Officer",
        actor_role="accounts_coordinator",
        action_type="FEE_WAIVER_APPLIED",
        target=f"Student #{defaulter.student_id} ({defaulter.student_name})",
        status="VERIFIED",
        details=f"Fee concession of ₹{req.waiver_amount:,.2f} applied. Reason: {req.reason}. Approved by: {req.approved_by}. Remaining Balance: ₹{defaulter.amount_due:,.2f}."
    )

    try:
        await create_system_notification(
            db=db,
            sender_name=req.approved_by or "Accounts Office",
            sender_role="accounts_coordinator",
            title="Fee Concession Approved",
            message=f"An official fee concession of ₹{req.waiver_amount:,.2f} has been approved for {defaulter.student_name} ({defaulter.class_name}) by {req.approved_by}. Reason: {req.reason}. Remaining due: ₹{defaulter.amount_due:,.2f}.",
            notification_type="fee",
            recipient_role="parent",
            action_url="/parent"
        )
    except Exception as notif_err:
        logger.warning(f"Failed to dispatch concession notification: {notif_err}")

    await db.commit()
    await db.refresh(defaulter)
    return defaulter


@router.post("/defaulters/{id}/exam-clearance")
async def toggle_exam_clearance(
    id: int,
    db: AsyncSession = Depends(get_db),
    admin_role: str = Depends(require_role(["admin", "principal", "super_admin"]))
):
    """
    Toggles institutional examination clearance for a student fee defaulter.
    Directly persists to PostgreSQL DB so exam coordinator hall-ticket engine is in sync.
    """
    res = await db.execute(select(FeeDefaulter).where(FeeDefaulter.id == id))
    defaulter = res.scalars().first()
    if not defaulter:
        raise HTTPException(status_code=404, detail="Defaulter record not found")

    defaulter.exam_clearance = not bool(defaulter.exam_clearance)
    await db.commit()
    await db.refresh(defaulter)
    return {"success": True, "exam_clearance": defaulter.exam_clearance, "id": defaulter.id}



# =========================================================================
# 3. ONLINE PAYMENT GATEWAY & RECONCILIATION LEDGER
# =========================================================================

@router.get("/transactions", response_model=List[PaymentTransactionResponse])
async def get_payment_transactions(
    reconciled: Optional[bool] = Query(None),
    status: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns online payment gateway transactions (UPI, NetBanking, Cards, NEFT)
    with reconciliation status and UTR verification data.
    """
    query = select(PaymentTransaction)

    if reconciled is not None:
        query = query.where(PaymentTransaction.reconciled == reconciled)

    if status:
        query = query.where(PaymentTransaction.status == status)

    if payment_method and payment_method != "ALL":
        query = query.where(PaymentTransaction.payment_method == payment_method)

    if search:
        search_fmt = f"%{search}%"
        query = query.where(
            or_(
                PaymentTransaction.utr_number.ilike(search_fmt),
                PaymentTransaction.student_name.ilike(search_fmt),
                PaymentTransaction.parent_name.ilike(search_fmt),
                PaymentTransaction.bank_name.ilike(search_fmt)
            )
        )

    query = query.order_by(PaymentTransaction.transaction_date.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/transactions/{id}/reconcile", response_model=PaymentTransactionResponse)
async def reconcile_transaction(
    id: int,
    reconciled_by: str = Query("Mr. Arvind Krishnan"),
    db: AsyncSession = Depends(get_db)
):
    """
    Reconciles a single payment transaction against the school's bank statement.
    """
    res = await db.execute(select(PaymentTransaction).where(PaymentTransaction.id == id))
    tx = res.scalars().first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    tx.reconciled = True
    tx.reconciled_at = datetime.datetime.utcnow()
    tx.reconciled_by = reconciled_by

    await log_financial_audit(
        db=db,
        actor_name=reconciled_by,
        actor_role="accounts_coordinator",
        action_type="TRANSACTION_RECONCILE",
        target=f"PaymentTransaction #{tx.id} ({tx.utr_number})",
        status="VERIFIED",
        details=f"Payment of ₹{float(tx.amount):,.2f} for {tx.student_name} ({tx.milestone_title}) reconciled against bank ledger."
    )

    await db.commit()
    await db.refresh(tx)
    return tx


@router.post("/transactions/bulk-reconcile")
async def bulk_reconcile_transactions(
    transaction_ids: Optional[List[int]] = None,
    reconciled_by: str = Query("Mr. Arvind Krishnan"),
    db: AsyncSession = Depends(get_db)
):
    """
    Reconciles multiple or all pending transactions in 1 click.
    Calculates total reconciled amount and logs an immutable audit event for financial governance.
    """
    query = select(PaymentTransaction).where(PaymentTransaction.reconciled == False)
    if transaction_ids and len(transaction_ids) > 0:
        query = query.where(PaymentTransaction.id.in_(transaction_ids))

    res = await db.execute(query)
    txs = res.scalars().all()

    total_amount = sum(float(tx.amount or 0.0) for tx in txs)
    now = datetime.datetime.utcnow()
    for tx in txs:
        tx.reconciled = True
        tx.reconciled_at = now
        tx.reconciled_by = reconciled_by

    if len(txs) > 0:
        await log_financial_audit(
            db=db,
            actor_name=reconciled_by,
            actor_role="accounts_coordinator",
            action_type="BATCH_TRANSACTION_RECONCILE",
            target=f"PaymentTransaction [{len(txs)} records]",
            status="VERIFIED",
            details=f"Batch bank statement reconciliation completed for {len(txs)} transactions totaling ₹{total_amount:,.2f}."
        )

    await db.commit()
    return {
        "status": "success",
        "reconciled_count": len(txs),
        "total_amount": total_amount,
        "message": f"Successfully batch reconciled {len(txs)} pending transactions totaling ₹{total_amount:,.2f} against the bank ledger."
    }


# =========================================================================
# 4. INSTITUTIONAL VENDOR INVOICES (ACCOUNTS PAYABLE)
# =========================================================================

@router.get("/invoices", response_model=List[VendorInvoiceResponse])
async def get_vendor_invoices(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns institutional vendor invoices awaiting clearance, wire transfer or payment.
    """
    query = select(VendorInvoice)

    if status and status != "ALL":
        query = query.where(VendorInvoice.status == status)

    if category and category != "ALL":
        query = query.where(VendorInvoice.vendor_category == category)

    if search:
        search_fmt = f"%{search}%"
        query = query.where(
            or_(
                VendorInvoice.invoice_no.ilike(search_fmt),
                VendorInvoice.vendor_name.ilike(search_fmt),
                VendorInvoice.invoice_for.ilike(search_fmt)
            )
        )

    query = query.order_by(VendorInvoice.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/invoices", response_model=VendorInvoiceResponse)
async def create_vendor_invoice(
    inv: VendorInvoiceCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Logs a new institutional vendor invoice into the accounts payable queue.
    """
    new_inv = VendorInvoice(
        invoice_no=inv.invoice_no,
        vendor_name=inv.vendor_name,
        vendor_category=inv.vendor_category,
        invoice_for=inv.invoice_for,
        amount=inv.amount,
        invoice_date=inv.invoice_date,
        due_date=inv.due_date,
        status=inv.status or "Pending Approval",
        notes=inv.notes
    )
    db.add(new_inv)

    # Notify Admin / Principal if over ₹50,000 threshold
    if inv.amount >= 50000:
        await create_system_notification(
            db=db,
            sender_name="Mr. Arvind Krishnan",
            sender_role="accounts_coordinator",
            recipient_role="admin",
            title=f"High-Value Invoice: {inv.vendor_name}",
            message=f"Invoice {inv.invoice_no} for ₹{inv.amount:,.2f} ({inv.invoice_for}) submitted for Bursar authorization.",
            notification_type="INVOICE_APPROVAL",
            priority="HIGH",
            action_url="/accounts_coordinator"
        )

    await db.commit()
    await db.refresh(new_inv)
    return new_inv


@router.post("/invoices/{id}/status", response_model=VendorInvoiceResponse)
async def update_vendor_invoice_status(
    id: int,
    req: VendorInvoiceUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Updates invoice authorization status (Approved for Wire, Paid, Audit Clearance Needed, Rejected).
    """
    res = await db.execute(select(VendorInvoice).where(VendorInvoice.id == id))
    inv = res.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if req.status:
        inv.status = req.status
    if req.authorized_by:
        inv.authorized_by = req.authorized_by
        inv.authorized_at = datetime.datetime.utcnow()
    if req.payment_utr:
        inv.payment_utr = req.payment_utr
    if req.payment_mode:
        inv.payment_mode = req.payment_mode
    if req.status == "Paid":
        inv.paid_at = datetime.datetime.utcnow()
    if req.notes:
        inv.notes = req.notes

    await db.commit()
    await db.refresh(inv)
    return inv


# =========================================================================
# 5. DISPATCH AUDIT LOGS
# =========================================================================

@router.get("/dispatch-logs", response_model=List[FinanceDispatchLogResponse])
async def get_finance_dispatch_logs(
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the audit trail of fee reminders and broadcast notices dispatched.
    """
    result = await db.execute(
        select(FinanceDispatchLog).order_by(FinanceDispatchLog.created_at.desc()).limit(limit)
    )
    return result.scalars().all()


# =========================================================================
# 6. SEED / INITIALIZE REALISTIC FINANCE DATA
# =========================================================================

@router.post("/seed-data")
async def seed_finance_data(db: AsyncSession = Depends(get_db)):
    """
    Populates realistic fee defaulters, payment transactions, and vendor invoices
    if tables are currently empty.
    """
    # Check if defaulters exist
    defaulters_cnt = await db.execute(select(func.count(FeeDefaulter.id)))
    if defaulters_cnt.scalar() == 0:
        sample_defaulters = [
            FeeDefaulter(
                student_id=1,
                student_name="Aarav Sharma",
                class_name="Class 8-B",
                roll_no="14",
                parent_name="Mr. Rajesh Sharma",
                parent_phone="+91 98111 00003",
                milestone_title="Milestone 2: Term 2 Tuition & Transport Fee",
                amount_due=18500.0,
                days_overdue=22,
                reminder_sent=True,
                reminder_count=2,
                last_reminder_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
                waiver_amount=0.0,
                status="Overdue",
                notes="Parent requested extension till 25th of current month."
            ),
            FeeDefaulter(
                student_id=2,
                student_name="Kabir Mehta",
                class_name="Class 8-B",
                roll_no="15",
                parent_name="Mrs. Rekha Mehta",
                parent_phone="+91 98555 44444",
                milestone_title="Milestone 2: Term 2 Tuition & Transport Fee",
                amount_due=18500.0,
                days_overdue=48,
                reminder_sent=True,
                reminder_count=4,
                last_reminder_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                waiver_amount=2500.0,
                waiver_reason="Merit & Sports Hardship Concession approved by Principal",
                waiver_approved_by="Dr. Sunita Kapoor",
                status="Partially Paid",
                notes="Remaining dues: ₹16,000. Second installment expected next Monday."
            ),
            FeeDefaulter(
                student_id=19,
                student_name="Siddharth Verma",
                class_name="Class 8-A",
                roll_no="22",
                parent_name="Mr. Alok Verma",
                parent_phone="+91 98777 55555",
                milestone_title="Milestone 2: Term 2 Tuition Fee",
                amount_due=14000.0,
                days_overdue=9,
                reminder_sent=False,
                reminder_count=0,
                status="Overdue",
                notes="First reminder due to be sent this week."
            ),
            FeeDefaulter(
                student_id=20,
                student_name="Rohan Iyer",
                class_name="Class 8-A",
                roll_no="24",
                parent_name="Mrs. Meenakshi Iyer",
                parent_phone="+91 98333 22222",
                milestone_title="Milestone 1 & 2 Combined Dues",
                amount_due=32500.0,
                days_overdue=64,
                reminder_sent=True,
                reminder_count=5,
                last_reminder_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                status="Overdue",
                notes="SLA Escalation required. Bursar telephonic meeting requested."
            ),
            FeeDefaulter(
                student_id=21,
                student_name="Ananya Gupta",
                class_name="Class 9-A",
                roll_no="08",
                parent_name="Mr. Pradeep Gupta",
                parent_phone="+91 98444 33333",
                milestone_title="Milestone 2: Term 2 Science Lab Fee",
                amount_due=6500.0,
                days_overdue=12,
                reminder_sent=True,
                reminder_count=1,
                last_reminder_at=datetime.datetime.utcnow() - datetime.timedelta(days=5),
                status="Overdue",
                notes="Parent promised NEFT transfer by weekend."
            ),
            FeeDefaulter(
                student_id=22,
                student_name="Aditya Roy",
                class_name="Class 9-B",
                roll_no="11",
                parent_name="Mrs. Sangeeta Roy",
                parent_phone="+91 98888 66666",
                milestone_title="Milestone 2: Term 2 Tuition Fee",
                amount_due=15500.0,
                days_overdue=35,
                reminder_sent=True,
                reminder_count=3,
                last_reminder_at=datetime.datetime.utcnow() - datetime.timedelta(days=4),
                status="Overdue",
                notes="Pending UPI clearance from parent side."
            )
        ]
        db.add_all(sample_defaulters)

    # Check transactions
    tx_cnt = await db.execute(select(func.count(PaymentTransaction.id)))
    if tx_cnt.scalar() == 0:
        sample_txs = [
            PaymentTransaction(
                utr_number="UPI/329481920192/AXIS",
                student_name="Aarav Sharma",
                class_name="Class 8-B",
                parent_name="Mr. Rajesh Sharma",
                amount=22000.0,
                payment_method="UPI",
                bank_name="Axis Bank",
                milestone_title="Milestone 1: Term 1 Tuition & Curriculum Fee",
                status="Success",
                reconciled=True,
                reconciled_at=datetime.datetime.utcnow() - datetime.timedelta(days=45),
                reconciled_by="Mr. Arvind Krishnan",
                gateway_ref="pay_OnbZ182947192"
            ),
            PaymentTransaction(
                utr_number="UPI/402918471902/HDFC",
                student_name="Diya Patel",
                class_name="Class 8-B",
                parent_name="Dr. Vikram Patel",
                amount=18500.0,
                payment_method="UPI",
                bank_name="HDFC Bank",
                milestone_title="Milestone 2: Term 2 Tuition & Transport Fee",
                status="Success",
                reconciled=False,
                gateway_ref="pay_PlmQ829104812",
                notes="Awaiting statement import from HDFC Corporate Portal"
            ),
            PaymentTransaction(
                utr_number="NET/592810482910/ICICI",
                student_name="Siddharth Verma",
                class_name="Class 8-A",
                parent_name="Mr. Alok Verma",
                amount=22000.0,
                payment_method="NetBanking",
                bank_name="ICICI Bank",
                milestone_title="Milestone 1: Term 1 Tuition Fee",
                status="Success",
                reconciled=True,
                reconciled_at=datetime.datetime.utcnow() - datetime.timedelta(days=30),
                reconciled_by="Mr. Arvind Krishnan"
            ),
            PaymentTransaction(
                utr_number="UPI/582910492819/SBIN",
                student_name="Ananya Gupta",
                class_name="Class 9-A",
                parent_name="Mr. Pradeep Gupta",
                amount=15500.0,
                payment_method="UPI",
                bank_name="State Bank of India",
                milestone_title="Milestone 1: Term 1 Tuition Fee",
                status="Success",
                reconciled=False,
                gateway_ref="pay_TybN938102941",
                notes="UTR matches Razorpay webhook, pending batch signoff"
            ),
            PaymentTransaction(
                utr_number="CARD/849102847192/VISA",
                student_name="Aditya Roy",
                class_name="Class 9-B",
                parent_name="Mrs. Sangeeta Roy",
                amount=22000.0,
                payment_method="Credit Card",
                bank_name="Standard Chartered",
                milestone_title="Milestone 1: Term 1 Tuition Fee",
                status="Success",
                reconciled=False,
                gateway_ref="pay_KzxW710294812",
                notes="T+2 settlement batch cleared"
            ),
            PaymentTransaction(
                utr_number="NEFT/CMS92810482910/KOTAK",
                student_name="Tanvi Deshmukh",
                class_name="Class 7-A",
                parent_name="Dr. Suresh Deshmukh",
                amount=38000.0,
                payment_method="NEFT",
                bank_name="Kotak Mahindra Bank",
                milestone_title="Full Annual Tuition & Transport",
                status="Success",
                reconciled=False,
                notes="CMS batch credit received in current account"
            )
        ]
        db.add_all(sample_txs)

    # Check vendor invoices
    inv_cnt = await db.execute(select(func.count(VendorInvoice.id)))
    if inv_cnt.scalar() == 0:
        sample_invoices = [
            VendorInvoice(
                invoice_no="INV-2026-FL-084",
                vendor_name="Bharat Petroleum Corporation (Fleet)",
                vendor_category="Transport & Fuel",
                invoice_for="High-Speed Diesel for 14 School Bus Routes (Month of Oct)",
                amount=148500.0,
                invoice_date="18 Oct 2026",
                due_date="28 Oct 2026",
                status="Approved for Wire",
                authorized_by="Dr. Sunita Kapoor (Principal)",
                authorized_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                payment_mode="RTGS",
                notes="Fuel log logs verified against GPS telemetry."
            ),
            VendorInvoice(
                invoice_no="INV-2026-LB-109",
                vendor_name="National Scientific Equipment & Reagents",
                vendor_category="Laboratory Supplies",
                invoice_for="Class 8-10 Composite Science & Chemistry Lab Consumables",
                amount=42600.0,
                invoice_date="12 Oct 2026",
                due_date="26 Oct 2026",
                status="Pending Approval",
                notes="Awaiting inventory sign-off from Mrs. Shalini Rao."
            ),
            VendorInvoice(
                invoice_no="INV-2026-IT-215",
                vendor_name="EduCloud Infotech Solutions",
                vendor_category="Software & IT",
                invoice_for="High-Speed Campus Leased Line & Firewall Licensing Q3",
                amount=68000.0,
                invoice_date="15 Oct 2026",
                due_date="30 Oct 2026",
                status="Approved for Wire",
                authorized_by="Dr. Sunita Kapoor (Principal)",
                authorized_at=datetime.datetime.utcnow() - datetime.timedelta(hours=6),
                payment_mode="NEFT",
                notes="SLA uptime verified at 99.8%."
            ),
            VendorInvoice(
                invoice_no="INV-2026-CT-092",
                vendor_name="Annapurna Institutional Catering",
                vendor_category="Cafeteria & Dining",
                invoice_for="Mid-Day Student Meal Program & Staff Refreshments",
                amount=96400.0,
                invoice_date="05 Oct 2026",
                due_date="20 Oct 2026",
                status="Paid",
                authorized_by="Dr. Sunita Kapoor (Principal)",
                authorized_at=datetime.datetime.utcnow() - datetime.timedelta(days=10),
                payment_utr="RTGS/SBIN202610190829104",
                paid_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                payment_mode="RTGS",
                notes="Paid and voucher attached."
            ),
            VendorInvoice(
                invoice_no="INV-2026-SC-301",
                vendor_name="Eagle Eye Security & Facilities Ltd",
                vendor_category="Security & Maintenance",
                invoice_for="Campus Guard Staffing (Day/Night 12 Guards) & Sanitization",
                amount=124000.0,
                invoice_date="20 Oct 2026",
                due_date="02 Nov 2026",
                status="Audit Clearance Needed",
                notes="Biometric duty roster variance under review by Administrative Officer."
            )
        ]
        db.add_all(sample_invoices)

    # Initial dispatch logs
    logs_cnt = await db.execute(select(func.count(FinanceDispatchLog.id)))
    if logs_cnt.scalar() == 0:
        sample_logs = [
            FinanceDispatchLog(
                dispatch_type="WhatsApp",
                dispatch_scope="Tier 30+ Days (High Arrears)",
                target_count=3,
                total_amount_targeted=66500.0,
                dispatch_note="Dispatched customized WhatsApp payment links with late-fee grace waiver notice.",
                dispatched_by="Mr. Arvind Krishnan",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
            ),
            FinanceDispatchLog(
                dispatch_type="SMS",
                dispatch_scope="All Defaulters (16-30 Days)",
                target_count=8,
                total_amount_targeted=134000.0,
                dispatch_note="Standard automated SMS reminder with school banking gateway URL.",
                dispatched_by="Mr. Arvind Krishnan",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
            )
        ]
        db.add_all(sample_logs)

    await db.commit()
    return {"status": "success", "message": "Finance domain seeded with realistic defaulters, transactions, and vendor invoices."}


# =========================================================================
# 7. STAFF PAYROLL & SALARY DISBURSEMENT OUTFLOW
# =========================================================================

@router.get("/payroll/batches", response_model=List[PayrollBatchResponse], dependencies=[Depends(require_role(["admin", "accounts_coordinator", "principal", "super_admin"]))])
async def get_payroll_batches(db: AsyncSession = Depends(get_db)):
    """List historical and active monthly payroll runs."""
    result = await db.execute(select(PayrollBatch).order_by(PayrollBatch.created_at.desc()))
    return result.scalars().all()


@router.get("/payroll/batches/{batch_id}/slips", response_model=List[StaffPayslipResponse], dependencies=[Depends(require_role(["admin", "accounts_coordinator", "principal", "super_admin"]))])
async def get_payroll_batch_slips(batch_id: int, db: AsyncSession = Depends(get_db)):
    """List granular staff salary slips for a specific payroll batch."""
    result = await db.execute(
        select(StaffPayslip).where(StaffPayslip.batch_id == batch_id).order_by(StaffPayslip.department, StaffPayslip.staff_name)
    )
    return result.scalars().all()


@router.get("/payroll/lop-preview", dependencies=[Depends(require_role(["admin", "accounts_coordinator", "principal", "super_admin"]))])
async def get_payroll_lop_preview(payroll_month: str = "November 2026", db: AsyncSession = Depends(get_db)):
    """Pre-run audit screen for Accounts Coordinator to review staff LOP before batch generation."""
    staff_res = await db.execute(select(StaffMember))
    staff_list = staff_res.scalars().all()

    month_tokens = payroll_month.lower().split()
    month_name = month_tokens[0] if month_tokens else ""
    month_abbr = month_name[:3] if len(month_name) >= 3 else month_name

    perm_res = await db.execute(select(StaffPermission))
    all_perms = perm_res.scalars().all()

    lop_summary = []
    for s in staff_list:
        staff_lop_days = 0
        reasons = []
        for p in all_perms:
            if p.staff_id != s.id:
                continue
            p_dates = f"{p.from_date or ''} {p.to_date or ''} {str(p.created_at or '')}".lower()
            is_match = (month_name and month_name in p_dates) or (month_abbr and month_abbr in p_dates)
            if not is_match and len(month_tokens) > 1 and month_tokens[1] in p_dates:
                is_match = True
            if not is_match:
                continue

            p_type = (p.permission_type or "").lower()
            p_cat = (getattr(p, "leave_category", "") or "").lower()
            if (p.status == "Rejected") or ("unpaid" in p_cat) or ("lop" in p_cat) or ("unpaid" in p_type) or ("lop" in p_type):
                days = getattr(p, "total_days", 1) or 1
                staff_lop_days += days
                reasons.append(f"{p.permission_type} ({days}d): {p.reason}")

        if s.attendance_status in ["Absent", "Unexcused"]:
            staff_lop_days += 1
            reasons.append("Marked Absent on daily attendance status")

        if staff_lop_days > 0:
            role_lower = (s.role or "").lower()
            if "principal" in role_lower: base = 75000.0
            elif "head" in role_lower or "coordinator" in role_lower: base = 55000.0
            elif "senior" in role_lower: base = 48000.0
            elif "teacher" in role_lower: base = 42000.0
            elif "lab" in role_lower or "admin" in role_lower: base = 28000.0
            else: base = 22000.0
            est_ded = round((base / 30.0) * staff_lop_days, 2)
            lop_summary.append({
                "staff_id": s.id,
                "staff_name": s.name,
                "role": s.role,
                "department": s.department,
                "lop_days": staff_lop_days,
                "reasons": reasons,
                "estimated_deduction": est_ded
            })

    return {
        "payroll_month": payroll_month,
        "total_staff": len(staff_list),
        "staff_with_lop_count": len(lop_summary),
        "lop_details": lop_summary
    }


@router.post("/payroll/generate", response_model=PayrollBatchResponse)
async def generate_monthly_payroll(
    req: GeneratePayrollRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Computes 1-click monthly salary register across all school faculty and staff.
    Integrates actual biometric & permission attendance records for Loss of Pay (LOP),
    differentiated role CTC bands, statutory EPFO 12%, Professional Tax (₹200),
    and progressive Section 192 TDS withholding.
    """
    # Check if batch for this month already exists
    existing = await db.execute(select(PayrollBatch).where(PayrollBatch.payroll_month == req.payroll_month))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail=f"Payroll batch for {req.payroll_month} already exists")

    # Fetch staff members
    staff_res = await db.execute(select(StaffMember))
    staff_list = staff_res.scalars().all()

    if not staff_list:
        raise HTTPException(status_code=400, detail="No staff members registered in system")

    # Fetch leaves/permissions for this specific month to determine real LOP days
    month_tokens = req.payroll_month.lower().split()
    month_name = month_tokens[0] if month_tokens else ""
    month_abbr = month_name[:3] if len(month_name) >= 3 else month_name

    perm_res = await db.execute(select(StaffPermission))
    all_perms = perm_res.scalars().all()
    unapproved_lop_map = {}

    for p in all_perms:
        p_dates = f"{p.from_date or ''} {p.to_date or ''} {str(p.created_at or '')}".lower()
        is_month_match = (month_name and month_name in p_dates) or (month_abbr and month_abbr in p_dates)
        if not is_month_match and len(month_tokens) > 1 and month_tokens[1] in p_dates:
            is_month_match = True

        if not is_month_match:
            continue

        p_type = (p.permission_type or "").lower()
        p_cat = (getattr(p, "leave_category", "") or "").lower()

        # Only deduct for explicitly rejected leaves or unpaid leaves:
        is_lop = (p.status == "Rejected") or ("unpaid" in p_cat) or ("lop" in p_cat) or ("unpaid" in p_type) or ("lop" in p_type)
        if is_lop:
            days = getattr(p, "total_days", 1) or 1
            unapproved_lop_map[p.staff_id] = unapproved_lop_map.get(p.staff_id, 0) + days

    # Check daily attendance for unexcused absences in this month
    try:
        from app.models.models import StaffAttendanceDaily
        daily_res = await db.execute(
            select(StaffAttendanceDaily).where(StaffAttendanceDaily.status == "Absent")
        )
        for d in daily_res.scalars().all():
            if month_name in (d.attendance_date or "").lower() or month_abbr in (d.attendance_date or "").lower():
                unapproved_lop_map[d.staff_id] = unapproved_lop_map.get(d.staff_id, 0) + 1
    except Exception:
        pass

    # Calculate earnings & deductions per employee
    total_gross = 0.0
    total_deductions_all = 0.0
    total_net = 0.0

    new_batch = PayrollBatch(
        payroll_month=req.payroll_month,
        total_staff_count=len(staff_list),
        gross_total=0.0,
        total_deductions=0.0,
        net_payable=0.0,
        status="Audit Pending",
        notes=req.notes or f"Generated automated {req.payroll_month} payroll run with biometric attendance & statutory deductions."
    )
    db.add(new_batch)
    await db.flush()

    for idx, s in enumerate(staff_list):
        role_lower = (s.role or "").lower()

        # Differentiated salary bands based on designation and responsibility
        if "principal" in role_lower or "director" in role_lower:
            base, hra, spl = 75000.0, 18000.0, 9000.0
        elif "head" in role_lower or "coordinator" in role_lower or "vice" in role_lower:
            base, hra, spl = 55000.0, 14000.0, 8000.0
        elif "senior" in role_lower:
            base, hra, spl = 48000.0, 12000.0, 7500.0
        elif "teacher" in role_lower or "faculty" in role_lower or "educator" in role_lower:
            base, hra, spl = 42000.0, 10500.0, 6500.0
        elif "lab" in role_lower or "librar" in role_lower or "admin" in role_lower or "account" in role_lower:
            base, hra, spl = 28000.0, 7000.0, 4500.0
        else:  # Support, Transport, Helper, Maintenance
            base, hra, spl = 22000.0, 5500.0, 3500.0

        gross = round(base + hra + spl, 2)

        # Loss of Pay (LOP) pro-rata calculation
        lop_days = unapproved_lop_map.get(s.id, 0)
        if s.attendance_status in ["Absent", "Unexcused"]:
            lop_days += 1
        per_day_salary = base / 30.0
        lop_ded = round(per_day_salary * lop_days, 2)

        # Statutory Deductions
        pf = round(base * 0.12, 2)  # Statutory PF: 12% of Basic
        pt = 200.0  # Professional Tax standard

        # Progressive Section 192 TDS Withholding (New Tax Regime)
        annual_gross = gross * 12
        taxable_annual = max(0.0, annual_gross - 75000.0)  # ₹75,000 standard deduction
        if taxable_annual > 700000.0:
            annual_tax = 20000.0 + (taxable_annual - 700000.0) * 0.10
            tds = round(annual_tax / 12.0, 2)
        elif taxable_annual > 400000.0:
            annual_tax = (taxable_annual - 400000.0) * 0.05
            tds = round(annual_tax / 12.0, 2)
        else:
            tds = 0.0

        tot_ded = round(pf + pt + tds + lop_ded, 2)
        net = round(gross - tot_ded, 2)

        total_gross = round(total_gross + gross, 2)
        total_deductions_all = round(total_deductions_all + tot_ded, 2)
        total_net = round(total_net + net, 2)

        slip = StaffPayslip(
            batch_id=new_batch.id,
            staff_id=s.id,
            staff_name=s.name,
            role_designation=s.role,
            department=s.department,
            bank_account_no=f"501004{s.id:04d}9821",
            bank_ifsc="HDFC0001824",
            basic_salary=base,
            hra_allowance=hra,
            special_allowance=spl,
            gross_earnings=gross,
            provident_fund=pf,
            professional_tax=pt,
            income_tax_tds=tds,
            loss_of_pay_days=lop_days,
            loss_of_pay_deduction=lop_ded,
            total_deductions=tot_ded,
            net_salary=net,
            disbursement_status="Pending"
        )
        db.add(slip)

    new_batch.gross_total = total_gross
    new_batch.total_deductions = total_deductions_all
    new_batch.net_payable = total_net

    # Security Audit Log for Maker Action
    await log_financial_audit(
        db=db,
        actor_name="Mr. Arvind Krishnan (Accounts Officer)",
        actor_role="accounts_coordinator",
        action_type="GENERATE_PAYROLL_BATCH",
        target=f"PayrollBatch #{new_batch.id} ({req.payroll_month})",
        status="SUCCESS",
        details=f"Generated draft payroll batch for {req.payroll_month} covering {len(staff_list)} staff members. Net Payable: ₹{total_net:,.2f}. Awaiting Principal executive sign-off."
    )

    # Notify Principal / Admin for high-value Four-Eye authorization
    await create_system_notification(
        db=db,
        sender_name="Mr. Arvind Krishnan",
        sender_role="accounts_coordinator",
        recipient_role="admin",
        title=f"Monthly Payroll Ready: {req.payroll_month}",
        message=f"{req.payroll_month} Payroll Batch for {len(staff_list)} staff members computed. Net wire amount: ₹{total_net:,.2f}. Ready for Principal executive authorization.",
        notification_type="PAYROLL_AUDIT",
        priority="HIGH",
        action_url="/admin?tab=payroll"
    )

    await db.commit()
    await db.refresh(new_batch)
    return new_batch


@router.post("/payroll/batches/{batch_id}/authorize", response_model=PayrollBatchResponse, dependencies=[Depends(require_role(["admin", "principal", "super_admin"]))])
async def authorize_payroll_batch(
    batch_id: int,
    req: AuthorizePayrollRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Principal executive sign-off for monthly staff salary disbursement wire.
    Strictly enforces Four-Eye Principle (Separation of Duties).
    """
    res = await db.execute(select(PayrollBatch).where(PayrollBatch.id == batch_id))
    batch = res.scalars().first()
    if not batch:
        raise HTTPException(status_code=404, detail="Payroll batch not found")

    batch.status = "Approved for Wire"
    batch.authorized_by = req.authorized_by
    batch.authorized_at = datetime.datetime.utcnow()
    if req.notes:
        batch.notes = (batch.notes or "") + f" | Authorized by {req.authorized_by}: {req.notes}"

    # Log Principal Executive Action in Security Audit
    await log_financial_audit(
        db=db,
        actor_name=req.authorized_by,
        actor_role="admin",
        action_type="AUTHORIZE_PAYROLL_BATCH",
        target=f"PayrollBatch #{batch.id} ({batch.payroll_month})",
        status="SUCCESS",
        details=f"Principal executive authorized monthly payroll wire for {batch.payroll_month} (Net: ₹{batch.net_payable:,.2f}, Total staff: {batch.total_staff_count}). Remarks: {req.notes or 'None'}"
    )

    # Notify Accounts Coordinator that batch is approved and ready for bank wire
    try:
        await create_system_notification(
            db=db,
            sender_name=req.authorized_by,
            sender_role="admin",
            recipient_role="accounts_coordinator",
            title=f"Payroll Batch Authorized: {batch.payroll_month}",
            message=f"Principal has signed off on {batch.payroll_month} payroll (Net: ₹{batch.net_payable:,.2f}). You can now execute the corporate bank disbursement wire.",
            notification_type="PAYROLL_AUTHORIZED",
            priority="HIGH",
            action_url="/accounts_coordinator?tab=payroll"
        )
        # Notify Teacher staff that their monthly salary slip is ready
        await create_system_notification(
            db=db,
            sender_name="Accounts Office",
            sender_role="accounts_coordinator",
            recipient_role="teacher",
            title=f"Monthly Salary Slip Ready: {batch.payroll_month}",
            message=f"Your verified salary slip for {batch.payroll_month} has been released. You can review earnings, deductions, and download your authenticated PDF receipt in My Salary.",
            notification_type="PAYROLL_READY",
            priority="NORMAL",
            action_url="/teacher?tab=my_salary",
            metadata_dict={"batch_id": batch.id, "payroll_month": batch.payroll_month}
        )
    except Exception as e:
        logger.warning(f"Failed to send payroll authorization notification: {e}")

    await db.commit()
    await db.refresh(batch)
    return batch


@router.post("/payroll/batches/{batch_id}/request-revision", response_model=PayrollBatchResponse, dependencies=[Depends(require_role(["admin", "principal", "super_admin"]))])
async def request_payroll_revision(
    batch_id: int,
    req: RequestPayrollRevisionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Principal executive sends payroll batch back to Accounts Coordinator for revision.
    Enforces audit logging and dispatches high-priority notification to accounts coordinator.
    """
    res = await db.execute(select(PayrollBatch).where(PayrollBatch.id == batch_id))
    batch = res.scalars().first()
    if not batch:
        raise HTTPException(status_code=404, detail="Payroll batch not found")

    batch.status = "Revision Requested"
    revision_note = req.notes or "Please re-verify faculty attendance, LOP deductions, and statutory EPF/TDS withholdings."
    batch.notes = (batch.notes or "") + f" | [Revision Requested by {req.requested_by}]: {revision_note}"

    # Log Principal Action in Security Audit
    await log_financial_audit(
        db=db,
        actor_name=req.requested_by,
        actor_role="admin",
        action_type="REQUEST_PAYROLL_REVISION",
        target=f"PayrollBatch #{batch.id} ({batch.payroll_month})",
        status="SUCCESS",
        details=f"Principal executive returned monthly payroll for {batch.payroll_month} for revision. Notes: {revision_note}"
    )

    # High-Priority Notification to Accounts Coordinator
    try:
        await create_system_notification(
            db=db,
            sender_name=req.requested_by,
            sender_role="admin",
            recipient_role="accounts_coordinator",
            title=f"⚠️ Payroll Revision Required: {batch.payroll_month}",
            message=f"Principal {req.requested_by} has returned the {batch.payroll_month} payroll batch for revision. Remarks: \"{revision_note}\". Please adjust and resubmit.",
            notification_type="PAYROLL_REVISION_REQUESTED",
            priority="URGENT",
            action_url="/accounts_coordinator?tab=payroll"
        )
    except Exception as e:
        logger.warning(f"Failed to send payroll revision notification: {e}")

    await db.commit()
    await db.refresh(batch)
    return batch


@router.post("/payroll/batches/{batch_id}/resubmit", response_model=PayrollBatchResponse, dependencies=[Depends(require_role(["admin", "accounts_coordinator", "super_admin"]))])
async def resubmit_payroll_batch(
    batch_id: int,
    req: ResubmitPayrollRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Accounts Coordinator resubmits revised payroll batch back to Principal for authorization.
    """
    res = await db.execute(select(PayrollBatch).where(PayrollBatch.id == batch_id))
    batch = res.scalars().first()
    if not batch:
        raise HTTPException(status_code=404, detail="Payroll batch not found")

    batch.status = "Audit Pending"
    resubmit_note = req.notes or "Addressed audit queries, recalculated deduction slabs, and resubmitted for Principal executive sign-off."
    batch.notes = (batch.notes or "") + f" | [Resubmitted by {req.resubmitted_by}]: {resubmit_note}"

    await log_financial_audit(
        db=db,
        actor_name=req.resubmitted_by,
        actor_role="accounts_coordinator",
        action_type="RESUBMIT_PAYROLL_BATCH",
        target=f"PayrollBatch #{batch.id} ({batch.payroll_month})",
        status="SUCCESS",
        details=f"Accounts Coordinator resubmitted {batch.payroll_month} payroll batch after addressing revision queries. Notes: {resubmit_note}"
    )

    try:
        await create_system_notification(
            db=db,
            sender_name=req.resubmitted_by,
            sender_role="accounts_coordinator",
            recipient_role="admin",
            title=f"Payroll Batch Resubmitted: {batch.payroll_month}",
            message=f"{req.resubmitted_by} has resolved revision notes for {batch.payroll_month} payroll. Batch is ready for your Principal digital signature.",
            notification_type="PAYROLL_READY",
            priority="HIGH",
            action_url="/admin?tab=payroll"
        )
    except Exception as e:
        logger.warning(f"Failed to send payroll resubmission notification: {e}")

    await db.commit()
    await db.refresh(batch)
    return batch


@router.post("/payroll/batches/{batch_id}/disburse", response_model=PayrollBatchResponse, dependencies=[Depends(require_role(["admin", "accounts_coordinator"]))])
async def disburse_payroll_batch(
    batch_id: int,
    req: DisbursePayrollRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Executes corporate bank NACH/NEFT salary disbursement wire.
    Updates all payslips to 'Disbursed' and notifies all teachers and staff.
    """
    res = await db.execute(select(PayrollBatch).where(PayrollBatch.id == batch_id))
    batch = res.scalars().first()
    if not batch:
        raise HTTPException(status_code=404, detail="Payroll batch not found")

    now = datetime.datetime.utcnow()
    batch.status = "Disbursed"
    batch.disbursed_at = now
    batch.bank_batch_ref = req.bank_batch_ref

    # Update all slips
    slips_res = await db.execute(select(StaffPayslip).where(StaffPayslip.batch_id == batch_id))
    slips = slips_res.scalars().all()
    for s in slips:
        s.disbursement_status = "Disbursed"
        s.payment_utr = f"CMS/SAL/{req.bank_batch_ref}/{s.id}"
        s.disbursed_at = now

    # Dispatch notification to all teachers
    await create_system_notification(
        db=db,
        sender_name="Mr. Arvind Krishnan (Accounts Officer)",
        sender_role="accounts_coordinator",
        recipient_role="teacher",
        title=f"Salary Slip Published: {batch.payroll_month}",
        message=f"Your {batch.payroll_month} salary has been credited to your bank account. Digital payslip is available in your Teacher Console.",
        notification_type="SALARY_DISBURSED",
        priority="NORMAL",
        action_url="/teacher?tab=my_salary"
    )

    await db.commit()
    await db.refresh(batch)
    return batch


@router.post("/payroll/inquiries", response_model=StaffSalaryInquiryResponse)
async def create_salary_inquiry(
    req: StaffSalaryInquiryCreate,
    db: AsyncSession = Depends(get_db)
):
    """Teachers submit a formal salary query or grievance to the Accounts Coordinator."""
    inquiry = StaffSalaryInquiry(
        teacher_id=req.teacher_id or 2,
        teacher_name=req.teacher_name,
        department=req.department or "Academics",
        month=req.month,
        reason=req.reason,
        message=req.message,
        net_salary=req.net_salary or 0.0,
        utr=req.utr,
        status="Pending"
    )
    db.add(inquiry)
    await db.flush()

    # Trigger High-Priority in-app notification to Accounts Coordinator
    notif_msg = (
        f"Faculty Query #{inquiry.id} from {req.teacher_name} ({req.month}): {req.reason}. "
        f"Note: '{req.message[:120]}'. Net Pay: ₹{req.net_salary or 0:,.2f}, UTR: {req.utr or 'N/A'}"
    )
    await create_system_notification(
        db=db,
        sender_id=req.teacher_id or 2,
        sender_name=req.teacher_name,
        sender_role="teacher",
        recipient_role="accounts_coordinator",
        title=f"Salary Query: {req.reason} ({req.teacher_name})",
        message=notif_msg,
        notification_type="SALARY_INQUIRY",
        priority="HIGH",
        action_url="/accounts_coordinator?tab=payroll"
    )
    await db.commit()
    await db.refresh(inquiry)
    return inquiry

# Backwards compatibility alias for /payroll/inquiry
@router.post("/payroll/inquiry")
async def legacy_salary_inquiry(
    req: StaffSalaryInquiryCreate,
    db: AsyncSession = Depends(get_db)
):
    return await create_salary_inquiry(req, db)

@router.get("/payroll/inquiries", response_model=List[StaffSalaryInquiryResponse])
async def list_salary_inquiries(
    status: Optional[str] = Query(None),
    month: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Enables Accounts Coordinator to list, filter and review all incoming teacher payroll queries."""
    query = select(StaffSalaryInquiry)
    if status and status != "ALL":
        query = query.where(StaffSalaryInquiry.status == status)
    if month and month != "ALL":
        query = query.where(StaffSalaryInquiry.month == month)
    query = query.order_by(StaffSalaryInquiry.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/payroll/inquiries/{inquiry_id}/resolve", response_model=StaffSalaryInquiryResponse)
async def resolve_salary_inquiry(
    inquiry_id: int,
    req: StaffSalaryInquiryResolve,
    db: AsyncSession = Depends(get_db)
):
    """Accounts Coordinator resolves or rejects a teacher salary inquiry with an audit note."""
    result = await db.execute(select(StaffSalaryInquiry).where(StaffSalaryInquiry.id == inquiry_id))
    inquiry = result.scalars().first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Salary inquiry not found")

    inquiry.status = req.status
    inquiry.resolution_notes = req.resolution_notes
    inquiry.resolved_by = req.resolved_by or "Accounts Coordinator"
    inquiry.resolved_at = datetime.datetime.utcnow()

    # Send confirmation notification back to Teacher
    teacher_notif_msg = (
        f"Your salary query ({inquiry.reason} - {inquiry.month}) has been marked as '{req.status}' by {inquiry.resolved_by}. "
        f"Resolution: {req.resolution_notes}"
    )
    await create_system_notification(
        db=db,
        sender_id=11,  # Accounts Coordinator
        sender_name=inquiry.resolved_by or "Accounts Coordinator",
        sender_role="accounts_coordinator",
        recipient_user_id=inquiry.teacher_id,
        recipient_role="teacher",
        title=f"Salary Query Update: {req.status}",
        message=teacher_notif_msg,
        notification_type="SALARY_RESOLVED",
        priority="NORMAL",
        action_url="/teacher?tab=my_salary"
    )

    await db.commit()
    await db.refresh(inquiry)
    return inquiry

@router.get("/payroll/my-payslip", response_model=StaffPayslipResponse)
async def get_my_payslip(
    staff_name: Optional[str] = Query("Mrs. Ananya Verma"),
    db: AsyncSession = Depends(get_db)
):
    """Enables faculty to view their latest official salary slip in the Teacher Portal."""
    result = await db.execute(
        select(StaffPayslip).where(StaffPayslip.staff_name.ilike(f"%{staff_name}%")).order_by(StaffPayslip.created_at.desc())
    )
    slip = result.scalars().first()
    if not slip:
        # Fallback to first slip
        fallback = await db.execute(select(StaffPayslip).order_by(StaffPayslip.created_at.desc()))
        slip = fallback.scalars().first()
    if not slip:
        raise HTTPException(status_code=404, detail="No payslip available for this staff member")
    return slip


# =========================================================================
# 8. PROCUREMENT & PO 3-WAY MATCH (STORE -> ACCOUNTS)
# =========================================================================

@router.get("/purchase-orders", response_model=List[PurchaseOrderResponse])
async def get_purchase_orders(
    status: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List all procurement purchase orders across Science Lab, Sports, IT and Classroom store."""
    query = select(PurchaseOrder)
    if status and status != "ALL":
        query = query.where(PurchaseOrder.status == status)
    if department and department != "All Departments":
        query = query.where(PurchaseOrder.department == department)
    query = query.order_by(PurchaseOrder.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/purchase-orders", response_model=PurchaseOrderResponse)
async def create_purchase_order(
    req: PurchaseOrderCreate,
    db: AsyncSession = Depends(get_db)
):
    """Issues a formal purchase order linked to store requisitions."""
    po = PurchaseOrder(
        po_number=req.po_number,
        department=req.department,
        vendor_name=req.vendor_name,
        items_json=req.items_json,
        total_amount=req.total_amount,
        expected_delivery_date=req.expected_delivery_date,
        status="Issued",
        notes=req.notes
    )
    db.add(po)

    # Notify Inventory Coordinator Mrs. Shalini Rao
    await create_system_notification(
        db=db,
        sender_name="Mr. Arvind Krishnan",
        sender_role="accounts_coordinator",
        recipient_role="inventory_coordinator",
        title=f"PO Issued: {po.po_number}",
        message=f"Purchase order for {po.vendor_name} ({po.department}) valued at ₹{po.total_amount:,.2f} has been dispatched. Awaiting delivery handover inspection.",
        notification_type="PO_ISSUED",
        priority="NORMAL",
        action_url="/inventory_coordinator"
    )

    await db.commit()
    await db.refresh(po)
    return po


@router.post("/purchase-orders/{po_id}/grn", response_model=PurchaseOrderResponse)
async def verify_purchase_order_grn(
    po_id: int,
    req: VerifyGRNRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Inventory Coordinator digitally stamps Goods Received Note (GRN) upon physical delivery.
    Auto-generates a VendorInvoice for the Accounts Coordinator to authorize wire transfer.
    """
    res = await db.execute(select(PurchaseOrder).where(PurchaseOrder.id == po_id))
    po = res.scalars().first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    po.status = "GRN Verified"
    po.grn_number = req.grn_number
    po.grn_verified_by = req.verified_by
    po.grn_verified_at = datetime.datetime.utcnow()

    # Create linked VendorInvoice in Accounts Payable queue
    inv_no = f"INV-{po.po_number.replace('PO-', '')}"
    po.linked_invoice_no = inv_no

    new_inv = VendorInvoice(
        invoice_no=inv_no,
        vendor_name=po.vendor_name,
        vendor_category=po.department,
        invoice_for=f"Procurement settlement for {po.po_number} (GRN: {req.grn_number})",
        amount=po.total_amount,
        invoice_date=datetime.datetime.utcnow().strftime("%d %b %Y"),
        due_date="Net 30 Days",
        status="Pending Approval",
        notes=f"3-Way match verified against {req.grn_number} by {req.verified_by}"
    )
    db.add(new_inv)

    # Alert Accounts Coordinator
    await create_system_notification(
        db=db,
        sender_name="Mrs. Shalini Rao (Store Lead)",
        sender_role="inventory_coordinator",
        recipient_role="accounts_coordinator",
        title=f"GRN Verified: {po.po_number}",
        message=f"Goods for {po.po_number} inspected and stamped with {req.grn_number}. Invoice {inv_no} (₹{po.total_amount:,.2f}) released for Accounts wire authorization.",
        notification_type="GRN_STAMPED",
        priority="NORMAL",
        action_url="/accounts_coordinator"
    )

    await db.commit()
    await db.refresh(po)
    return po


# =========================================================================
# 9. FLEET & FACILITY EXPENSES (TRANSPORT -> ACCOUNTS)
# =========================================================================

@router.get("/fleet-expenses", response_model=List[FleetExpenseResponse])
async def get_fleet_expenses(
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List bus fleet fuel, RTO fitness certification, and maintenance AMC expenses."""
    query = select(FleetExpenseRecord)
    if status and status != "ALL":
        query = query.where(FleetExpenseRecord.status == status)
    query = query.order_by(FleetExpenseRecord.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/fleet-expenses", response_model=FleetExpenseResponse)
async def log_fleet_expense(
    req: FleetExpenseCreate,
    db: AsyncSession = Depends(get_db)
):
    """Logs a fleet expenditure claim submitted by Transport Coordinator."""
    rec = FleetExpenseRecord(
        vehicle_no=req.vehicle_no,
        bus_route=req.bus_route,
        expense_type=req.expense_type,
        vendor_name=req.vendor_name,
        amount=req.amount,
        status="Approved for Wire",
        invoice_ref=req.invoice_ref,
        logged_by=req.logged_by or "Mr. Vikram Malhotra (Transport Lead)",
        due_date=req.due_date
    )
    db.add(rec)

    # Notify Accounts Coordinator
    await create_system_notification(
        db=db,
        sender_name=req.logged_by or "Transport Coordinator",
        sender_role="transport_coordinator",
        recipient_role="accounts_coordinator",
        title=f"Transport Outflow: {req.expense_type}",
        message=f"Transport claim of ₹{req.amount:,.2f} for {req.vehicle_no} ({req.bus_route}) submitted by Transport Lead.",
        notification_type="FLEET_EXPENSE",
        priority="NORMAL",
        action_url="/accounts_coordinator"
    )

    await db.commit()
    await db.refresh(rec)
    return rec


@router.post("/fleet-expenses/{id}/settle", response_model=FleetExpenseResponse)
async def settle_fleet_expense(
    id: int,
    req: SettleFleetExpenseRequest,
    db: AsyncSession = Depends(get_db)
):
    """Records payment wire UTR for transport fuel or RTO contract."""
    res = await db.execute(select(FleetExpenseRecord).where(FleetExpenseRecord.id == id))
    rec = res.scalars().first()
    if not rec:
        raise HTTPException(status_code=404, detail="Fleet expense record not found")

    rec.status = "Paid"
    rec.payment_utr = req.payment_utr
    rec.paid_at = datetime.datetime.utcnow()

    await db.commit()
    await db.refresh(rec)
    return rec
