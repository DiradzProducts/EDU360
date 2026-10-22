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
    FeeMilestone, Student, Notification
)
from app.schemas.schemas import (
    FeeDefaulterResponse, FeeDefaulterCreate, FeeDefaulterUpdate,
    VendorInvoiceResponse, VendorInvoiceCreate, VendorInvoiceUpdate,
    PaymentTransactionResponse, PaymentTransactionCreate,
    FinanceDispatchLogResponse, FinanceDashboardStats,
    ApplyWaiverRequest, RecordFeePaymentRequest, BulkReminderRequest
)
from app.routers.notifications import create_system_notification

logger = logging.getLogger("edu360.finance")

router = APIRouter(prefix="/api/finance", tags=["finance"])


# =========================================================================
# 1. DASHBOARD STATS
# =========================================================================

@router.get("/stats", response_model=FinanceDashboardStats)
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

@router.get("/defaulters", response_model=List[FeeDefaulterResponse])
async def get_fee_defaulters(
    aging_tier: Optional[str] = Query(None, description="ALL, 0-15, 16-30, 30+"),
    status: Optional[str] = Query(None, description="Overdue, Partially Paid, Paid, Waived"),
    class_name: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    List student fee defaulters with real-time aging, payment history, and waiver state.
    """
    query = select(FeeDefaulter)

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


@router.post("/defaulters/{id}/pay", response_model=FeeDefaulterResponse)
async def record_fee_payment(
    id: int,
    req: RecordFeePaymentRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Records an incoming offline or manual fee payment (Cash, Cheque, DD, manual UPI).
    Deducts balance, updates status to 'Partially Paid' or 'Paid', and appends to payment history.
    Also creates a PaymentTransaction for ledger continuity.
    """
    res = await db.execute(select(FeeDefaulter).where(FeeDefaulter.id == id))
    defaulter = res.scalars().first()
    if not defaulter:
        raise HTTPException(status_code=404, detail="Defaulter record not found")

    new_amount_due = max(0.0, defaulter.amount_due - req.amount_paid)
    
    # Update payment history JSON
    history = []
    if defaulter.payment_history_json:
        try:
            history = json.loads(defaulter.payment_history_json)
        except Exception:
            history = []

    tx_date_str = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
    utr_code = req.utr_or_cheque_no or f"REC-MANUAL-{int(datetime.datetime.utcnow().timestamp())}"
    
    history.append({
        "date": tx_date_str,
        "amount": req.amount_paid,
        "method": req.payment_method,
        "utr_or_cheque": utr_code,
        "received_by": req.received_by,
        "notes": req.notes
    })
    defaulter.payment_history_json = json.dumps(history)
    defaulter.amount_due = new_amount_due

    if new_amount_due == 0:
        defaulter.status = "Paid"
    else:
        defaulter.status = "Partially Paid"

    # Also insert an auto-reconciled manual transaction into the transaction ledger
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
        notes=f"Counter collection: {req.notes or 'Fee payment'}"
    )
    db.add(new_tx)

    await db.commit()
    await db.refresh(defaulter)
    return defaulter


@router.post("/defaulters/{id}/waiver", response_model=FeeDefaulterResponse)
async def apply_fee_waiver(
    id: int,
    req: ApplyWaiverRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Grants a management fee concession / hardship waiver.
    Reduces amount due and logs approval trail.
    """
    res = await db.execute(select(FeeDefaulter).where(FeeDefaulter.id == id))
    defaulter = res.scalars().first()
    if not defaulter:
        raise HTTPException(status_code=404, detail="Defaulter record not found")

    defaulter.waiver_amount += req.waiver_amount
    defaulter.waiver_reason = req.reason
    defaulter.waiver_approved_by = req.approved_by
    defaulter.waiver_approved_at = datetime.datetime.utcnow()

    remaining = max(0.0, defaulter.amount_due - req.waiver_amount)
    defaulter.amount_due = remaining

    if remaining == 0:
        defaulter.status = "Waived"
    else:
        defaulter.status = "Partially Paid"

    await db.commit()
    await db.refresh(defaulter)
    return defaulter


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
    """
    query = select(PaymentTransaction).where(PaymentTransaction.reconciled == False)
    if transaction_ids and len(transaction_ids) > 0:
        query = query.where(PaymentTransaction.id.in_(transaction_ids))

    res = await db.execute(query)
    txs = res.scalars().all()

    now = datetime.datetime.utcnow()
    for tx in txs:
        tx.reconciled = True
        tx.reconciled_at = now
        tx.reconciled_by = reconciled_by

    await db.commit()
    return {
        "status": "success",
        "reconciled_count": len(txs),
        "message": f"Successfully reconciled {len(txs)} transactions."
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
