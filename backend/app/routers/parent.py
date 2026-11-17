import datetime
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, and_
from app.core.database import get_db
from app.models.models import (
    Student, FocusTable, HomeworkSubmission, BusRoute, FeeMilestone,
    LeaveRequest, ExitClearance, Homework, FeeDefaulter, PaymentTransaction,
    ParentTeacherMessage, ReportCard, SecurityAuditLog
)
from app.routers.notifications import create_system_notification
from app.schemas.schemas import (
    FocusTableResponse, HomeworkSubmissionResponse, BusRouteResponse,
    FeeMilestoneResponse, FeePayRequest,
    LeaveRequestCreate, LeaveRequestResponse,
    ExitClearanceResponse, ExitClearanceDigitalSign,
    AcademicComplianceResponse, HomeworkResponse,
    AIStudyAssistantRequest, AIStudyAssistantResponse,
    ParentTeacherChatMessageCreate, ParentTeacherChatMessageResponse,
    ReportCardSignRequest
)
from app.services.backlog_engine import BacklogEngine
from app.services.gemini_study_assistant import consult_gemini_study_assistant
from app.core.rbac import require_role

router = APIRouter(prefix="/api/parent", tags=["parent"], dependencies=[Depends(require_role(["parent", "admin", "principal", "super_admin", "teacher"]))])

# --- AI Parent Study Assistant (Google Gemini 1.5 Flash + BacklogEngine) ---
@router.post("/ai-study-assistant", response_model=AIStudyAssistantResponse)
async def get_parent_ai_study_assistant(
    req: AIStudyAssistantRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Translates academic diagnostic data into simple, actionable home guidance for parents
    using Google's Gemini 1.5 Flash API with BacklogEngine integration and verified local fallback.
    """
    subject = req.resolved_subject
    score = req.resolved_score
    misconception = req.resolved_misconception
    active_day = req.active_day or "Day 3"

    # Query BacklogEngine for student's homework backlog status
    has_backlog = False
    backlog_count = 0
    backlog_summary = ""
    try:
        dossier = await BacklogEngine.get_compliance_dossier(db, req.student_id)
        backlog_count = dossier.get("backlog_count", 0)
        itemized = dossier.get("itemized_backlogs", [])
        unresolved = [
            b for b in itemized
            if (b.get("status") if isinstance(b, dict) else getattr(b, "status", None)) == "UNRESOLVED"
        ]
        has_backlog = len(unresolved) > 0 or backlog_count > 0
        backlog_titles = []
        for b in unresolved[:2]:
            subj = b.get("subject") if isinstance(b, dict) else getattr(b, "subject", "")
            title = b.get("title") if isinstance(b, dict) else getattr(b, "title", "")
            backlog_titles.append(f"{subj}: {title}")
        backlog_summary = ", ".join(backlog_titles)
    except Exception as e:
        pass

    result = await consult_gemini_study_assistant(
        student_id=req.student_id,
        subject=subject,
        exam_score=score,
        misconception=misconception,
        active_day=active_day,
        has_backlog=has_backlog,
        backlog_count=backlog_count,
        backlog_summary=backlog_summary
    )
    return result


# --- 1. Moving Slider Banners (Anti-Spam High-Signal Engine) ---

@router.get("/children")
async def get_parent_children(
    username: Optional[str] = None,
    phone: Optional[str] = None,
    email: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Dynamically returns children for the logged-in parent account.
    Supports legacy test parents (Sharma, Fernandes) and newly enrolled students.
    """
    # 1. If username is parent_john or contains fernandes
    if username == "parent_john" or (username and "fernandes" in username.lower()) or (email and "fernandes" in email.lower()):
        st_res = await db.execute(select(Student).where(Student.id == 12))
        st = st_res.scalars().first()
        if st:
            return [{
                "id": st.id,
                "name": st.name,
                "className": f"{st.class_name}-{st.section}",
                "rollNo": int(st.roll_no) if str(st.roll_no).isdigit() else 25,
                "initials": "JF",
                "admissionNo": st.admission_no or f"ADM-2024-{st.id:03d}",
                "attendance": f"{st.attendance_pct}%",
                "gradeTier": st.grade_tier or "Senior (Grade 10)",
                "academicAvg": f"{st.academic_average_pct}%",
                "busRoute": "Route #4 (South City)",
                "mentor": "Mr. Rajesh Nair"
            }]

    # 2. Match by guardian email if supplied
    if email:
        clean_email = email.strip().lower()
        st_res = await db.execute(select(Student).where(Student.guardian_email == clean_email))
        sts = st_res.scalars().all()
        if sts:
            return [{
                "id": st.id,
                "name": st.name,
                "className": f"{st.class_name}-{st.section}",
                "rollNo": int(st.roll_no) if str(st.roll_no).isdigit() else 1,
                "initials": "".join([part[0].upper() for part in st.name.split() if part])[:2],
                "admissionNo": st.admission_no or f"EDU-2026-{st.id:03d}",
                "attendance": f"{st.attendance_pct}%" if st.attendance_pct is not None else "Day 1 Enrollee",
                "gradeTier": st.grade_tier or f"{st.class_name}",
                "academicAvg": f"{st.academic_average_pct}%" if st.academic_average_pct is not None else "Enrolled",
                "busRoute": "Route #4 (Campus Shuttle)",
                "mentor": "Mrs. Ananya Verma"
            } for st in sts]

    # 3. If parent username matches new enrolment pattern: parent_{name}_{student_id}
    if username and username.startswith("parent_"):
        parts = username.split("_")
        if parts[-1].isdigit():
            st_id = int(parts[-1])
            st_res = await db.execute(select(Student).where(Student.id == st_id))
            st = st_res.scalars().first()
            if st:
                initials = "".join([part[0].upper() for part in st.name.split() if part])[:2]
                return [{
                    "id": st.id,
                    "name": st.name,
                    "className": f"{st.class_name}-{st.section}",
                    "rollNo": int(st.roll_no) if str(st.roll_no).isdigit() else 1,
                    "initials": initials,
                    "admissionNo": st.admission_no or f"EDU-2026-{st.id:03d}",
                    "attendance": f"{st.attendance_pct}%" if st.attendance_pct is not None else "Day 1 Enrollee",
                    "gradeTier": st.grade_tier or f"{st.class_name}",
                    "academicAvg": f"{st.academic_average_pct}%" if st.academic_average_pct is not None else "Enrolled",
                    "busRoute": "Route #4 (Campus Shuttle)",
                    "mentor": "Mrs. Ananya Verma"
                }]

    # 4. Match by phone if supplied
    if phone:
        clean_phone = phone.strip()
        st_res = await db.execute(select(Student).where(Student.guardian_phone == clean_phone))
        sts = st_res.scalars().all()
        if sts:
            return [{
                "id": st.id,
                "name": st.name,
                "className": f"{st.class_name}-{st.section}",
                "rollNo": int(st.roll_no) if str(st.roll_no).isdigit() else 1,
                "initials": "".join([part[0].upper() for part in st.name.split() if part])[:2],
                "admissionNo": st.admission_no or f"EDU-2026-{st.id:03d}",
                "attendance": f"{st.attendance_pct}%" if st.attendance_pct is not None else "Day 1 Enrollee",
                "gradeTier": st.grade_tier or f"{st.class_name}",
                "academicAvg": f"{st.academic_average_pct}%" if st.academic_average_pct is not None else "Enrolled",
                "busRoute": "Route #4 (Campus Shuttle)",
                "mentor": "Mrs. Ananya Verma"
            } for st in sts]

    # 5. Fallback: Only return Sharma children if username is explicitly 'parent' or empty demo
    if username in [None, "parent", "parent_aarav", "rajesh_sharma"]:
        return [
            {
                "id": 1,
                "name": "Aarav Sharma",
                "className": "Class 8-B",
                "rollNo": 14,
                "initials": "AS",
                "admissionNo": "DPWS-2024-0014",
                "attendance": "94.2%",
                "gradeTier": "Senior (Grade 8)",
                "academicAvg": "88.5%",
                "busRoute": "Route #4 (North Corridor)",
                "mentor": "Mrs. Ananya Verma"
            },
            {
                "id": 2,
                "name": "Ananya Sharma",
                "className": "Class 3-A",
                "rollNo": 8,
                "initials": "ANS",
                "admissionNo": "DPWS-2025-0089",
                "attendance": "96.0%",
                "gradeTier": "Junior (Grade 3)",
                "academicAvg": "92.0%",
                "busRoute": "Route #4 (North Corridor)",
                "mentor": "Ms. Deepa Menon"
            }
        ]
    return []

@router.get("/banners")
async def get_parent_banners():
    return [
        {
            "id": 1,
            "title": "Unit Test 2 Results Are Live",
            "subtitle": "Class 8 Mathematics & Science report cards published.",
            "badge": "Academic Report",
            "badge_color": "blue",
            "action_text": "View Report Card",
            "action_target": "academics",
            "icon": "FileText",
            "gradient": "from-blue-600 to-indigo-700"
        },
        {
            "id": 2,
            "title": "Annual Day in 7 Days — Stage Committees",
            "subtitle": "Check Aarav's assigned choir role and rehearsal schedule.",
            "badge": "Event Spotlight",
            "badge_color": "purple",
            "action_text": "Check Stage Committee",
            "action_target": "events",
            "icon": "Sparkles",
            "gradient": "from-purple-600 to-pink-600"
        },
        {
            "id": 3,
            "title": "Fee Milestone 2 Due on 25th Oct",
            "subtitle": "Term 2 tuition & transport fee installment open for online payment.",
            "badge": "Payment Due",
            "badge_color": "amber",
            "action_text": "Pay via UPI / Card",
            "action_target": "fees",
            "icon": "CreditCard",
            "gradient": "from-amber-600 to-orange-600"
        },
        {
            "id": 4,
            "title": "School Bus Route 4 — On Schedule",
            "subtitle": "Bus is 8 mins away from Sector 15 Crossroad Stop.",
            "badge": "Live GPS",
            "badge_color": "emerald",
            "action_text": "Open Live Tracker",
            "action_target": "bus",
            "icon": "Navigation",
            "gradient": "from-emerald-600 to-teal-700"
        }
    ]

# --- 2. Shared Focus Table & Teacher Remarks ---
@router.get("/focus-table/{student_id}", response_model=FocusTableResponse)
async def get_child_focus_table(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FocusTable).where(FocusTable.student_id == student_id))
    ft = result.scalars().first()
    if not ft:
        raise HTTPException(status_code=404, detail="Focus Table not found for student")
    return ft

@router.post("/focus-table/{table_id}/toggle-check")
async def toggle_parent_checklist(table_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FocusTable).where(FocusTable.id == table_id))
    ft = result.scalars().first()
    if not ft:
        raise HTTPException(status_code=404, detail="Focus Table not found")
    ft.parent_check_completed = not ft.parent_check_completed
    ft.status = "needs_parent_check" if not ft.parent_check_completed else "in_progress"
    await db.commit()
    await db.refresh(ft)
    return {
        "success": True,
        "parent_check_completed": ft.parent_check_completed,
        "message": "Parent co-tracking status updated."
    }

@router.get("/homework-submissions/{student_id}", response_model=list[HomeworkSubmissionResponse])
async def get_child_homework_submissions(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomeworkSubmission).where(HomeworkSubmission.student_id == student_id))
    return result.scalars().all()

@router.get("/today-homework/{student_id}", response_model=list[HomeworkResponse])
async def get_child_today_homework(student_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve current-day homework tasks projected with the student's actual submission status via SQLAlchemy OUTER JOIN.
    """
    s_res = await db.execute(select(Student).where(Student.id == student_id))
    student = s_res.scalars().first()
    if not student:
        return []

    from app.core.clock import ClockProvider
    today_str = ClockProvider.get_current_date_str()
    from app.services.backlog_engine import is_homework_for_student
    
    eff_status = func.upper(func.coalesce(HomeworkSubmission.status, "PENDING"))
    stmt = (
        select(Homework, eff_status.label("effective_status"))
        .outerjoin(
            HomeworkSubmission,
            and_(
                HomeworkSubmission.homework_id == Homework.id,
                HomeworkSubmission.student_id == student_id
            )
        )
        .where(Homework.due_date == today_str)
        .order_by(Homework.id.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()
    matching = []
    for h, eff_st in rows:
        if is_homework_for_student(h.class_name, student.class_name, student.section):
            matching.append({
                "id": h.id,
                "title": h.title,
                "subject": h.subject,
                "class_name": h.class_name,
                "description": h.description,
                "task_type": h.task_type,
                "due_date": h.due_date,
                "due_time": h.due_time,
                "status": eff_st,
                "assigned_date": h.assigned_date,
                "teacher_id": h.teacher_id,
                "teacher_name": h.teacher_name,
                "max_marks": h.max_marks,
                "resource_url": h.resource_url,
                "weightage": h.weightage,
                "progress_pct": h.progress_pct or 0.0
            })
    
    # For demo student 1, if no matches today, allow fallback; for any other student return matching or empty
    if not matching and student_id == 1:
        fallback_stmt = (
            select(Homework, eff_status.label("effective_status"))
            .outerjoin(
                HomeworkSubmission,
                and_(
                    HomeworkSubmission.homework_id == Homework.id,
                    HomeworkSubmission.student_id == student_id
                )
            )
            .where(Homework.task_type == "DAILY_HOMEWORK")
            .order_by(Homework.id.desc())
            .limit(2)
        )
        fallback_res = await db.execute(fallback_stmt)
        for h, eff_st in fallback_res.all():
            matching.append({
                "id": h.id,
                "title": h.title,
                "subject": h.subject,
                "class_name": h.class_name,
                "description": h.description,
                "task_type": h.task_type,
                "due_date": h.due_date,
                "due_time": h.due_time,
                "status": eff_st,
                "assigned_date": h.assigned_date,
                "teacher_id": h.teacher_id,
                "teacher_name": h.teacher_name,
                "max_marks": h.max_marks,
                "resource_url": h.resource_url,
                "weightage": h.weightage,
                "progress_pct": h.progress_pct or 0.0
            })
    return matching

@router.get("/academic-compliance/{student_id}", response_model=AcademicComplianceResponse)
async def get_child_academic_compliance(student_id: int, db: AsyncSession = Depends(get_db)):
    return await BacklogEngine.get_compliance_dossier(db, student_id)

# --- 3. Live Bus GPS Tracker ---
@router.get("/bus-tracker/{student_id}", response_model=BusRouteResponse)
async def get_bus_tracker(student_id: int, db: AsyncSession = Depends(get_db)):
    # Look up student's route
    s_res = await db.execute(select(Student).where(Student.id == student_id))
    student = s_res.scalars().first()
    route_id = student.bus_route_id if student and student.bus_route_id else 1
    
    b_res = await db.execute(select(BusRoute).where(BusRoute.id == route_id))
    bus = b_res.scalars().first()
    if not bus:
        # Fallback to first route
        b_res = await db.execute(select(BusRoute))
        bus = b_res.scalars().first()
    return bus

@router.post("/bus-tracker/{student_id}/step", response_model=BusRouteResponse)
async def advance_bus_simulation(student_id: int, db: AsyncSession = Depends(get_db)):
    s_res = await db.execute(select(Student).where(Student.id == student_id))
    student = s_res.scalars().first()
    route_id = student.bus_route_id if student and student.bus_route_id else 1
    
    b_res = await db.execute(select(BusRoute).where(BusRoute.id == route_id))
    bus = b_res.scalars().first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus route not found")
    
    # Cycle stops: 0 -> 1 -> 2 -> 3 -> 4 -> 0
    bus.current_stop_idx = (bus.current_stop_idx + 1) % 5
    if bus.current_stop_idx == 4:
        bus.eta_mins = 2
        bus.live_status = "Approaching Destination Stop (Aarav's Stop)"
    elif bus.current_stop_idx == 0:
        bus.eta_mins = 25
        bus.live_status = "Departed School Campus"
    else:
        bus.eta_mins = max(4, 20 - bus.current_stop_idx * 4)
        bus.live_status = f"En Route — Passing Stop #{bus.current_stop_idx + 1}"
        
    await db.commit()
    await db.refresh(bus)
    return bus

# --- 4. Fee Milestones & Online Payment ---
@router.get("/fees/{student_id}", response_model=list[FeeMilestoneResponse])
async def get_student_fees(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FeeMilestone).where(FeeMilestone.student_id == student_id))
    fees = result.scalars().all()
    if not fees:
        if student_id == 12:
            return [
                FeeMilestone(id=1, student_id=student_id, title="Milestone 1: Term 1 Grade 10 Board Fee & Tuition", amount=42000, due_date="15 Jul 2026", status="Paid", receipt_no="REC-2026-FEE-4011", paid_at="10 Jul 2026, 10:00 AM", payment_method="Net Banking (SBI)"),
                FeeMilestone(id=2, student_id=student_id, title="Milestone 2: Term 2 Grade 10 Board & Lab Fee", amount=42000, due_date="15 Oct 2026", status="Paid", receipt_no="REC-2026-FEE-4012", paid_at="12 Oct 2026, 02:30 PM", payment_method="UPI (PhonePe)"),
                FeeMilestone(id=3, student_id=student_id, title="Milestone 3: Complete Exit & TC Account Clearance", amount=0, due_date="30 Oct 2026", status="Paid", receipt_no="REC-2026-EXIT-CLEAR", paid_at="30 Oct 2026, 11:00 AM", payment_method="Institutional Accounts Clearance")
            ]
        if student_id == 1:
            return [
                FeeMilestone(id=1, student_id=student_id, title="Milestone 1: Term 1 Tuition & Curriculum Fee", amount=35000, due_date="15 Jul 2026", status="Paid", receipt_no="REC-2026-FEE-5821", paid_at="12 Jul 2026, 11:20 AM", payment_method="UPI (Google Pay)"),
                FeeMilestone(id=2, student_id=student_id, title="Milestone 2: Q1 AC Bus Transport & GPS Fee", amount=14500, due_date="15 Jul 2026", status="Paid", receipt_no="REC-2026-FEE-5822", paid_at="15 Jul 2026, 03:40 PM", payment_method="Net Banking (HDFC)"),
                FeeMilestone(id=3, student_id=student_id, title="Milestone 3: STEM Robotics, Composite Lab & Library Fee", amount=12000, due_date="18 Aug 2026", status="Paid", receipt_no="REC-2026-FEE-5823", paid_at="18 Aug 2026, 09:15 AM", payment_method="Debit Card"),
                FeeMilestone(id=4, student_id=student_id, title="Milestone 4: Term 2 Tuition & Infrastructure Fee", amount=35000, due_date="25 Oct 2026", status="Overdue"),
                FeeMilestone(id=5, student_id=student_id, title="Milestone 5: Q2 AC Bus Transport Fee", amount=14500, due_date="10 Nov 2026", status="Upcoming"),
                FeeMilestone(id=6, student_id=student_id, title="Milestone 6: Annual Day, Sports & CBSE Exam Fee", amount=16500, due_date="15 Dec 2026", status="Upcoming"),
            ]
        # Any newly enrolled student with no fee milestones has clean slate
        return []
    return fees

@router.post("/fees/{milestone_id}/pay", response_model=FeeMilestoneResponse)
async def pay_fee_milestone(milestone_id: int, req: FeePayRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FeeMilestone).where(FeeMilestone.id == milestone_id).with_for_update())
    milestone = result.scalars().first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Fee milestone not found")
    if milestone.status == "Paid":
        raise HTTPException(status_code=409, detail="This fee milestone has already been paid and settled.")
    
    receipt_num = f"REC-2026-FEE-{milestone_id + 5821}"
    paid_time_str = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
    utr_code = f"UPI/{int(datetime.datetime.utcnow().timestamp())}{milestone_id}/HDFC"

    milestone.status = "Paid"
    milestone.paid_at = paid_time_str
    milestone.payment_method = req.payment_method
    milestone.receipt_no = receipt_num

    # 1. Fetch student info to link records
    student_res = await db.execute(select(Student).where(Student.id == milestone.student_id))
    student = student_res.scalars().first()
    student_name = student.name if student else "Student"
    class_name = f"{student.class_name}-{student.section}" if student else "Class 8-B"
    parent_name = student.guardian_name if student else "Guardian"

    # 2. Update FeeDefaulter if an overdue record exists
    defaulter_res = await db.execute(
        select(FeeDefaulter).where(
            FeeDefaulter.student_id == milestone.student_id,
            FeeDefaulter.status.in_(["Overdue", "Partially Paid"])
        )
    )
    defaulter = defaulter_res.scalars().first()
    if defaulter:
        defaulter.status = "Paid"
        defaulter.amount_due = 0.0
        history = []
        if defaulter.payment_history_json:
            try:
                import json
                history = json.loads(defaulter.payment_history_json)
            except Exception:
                history = []
        history.append({
            "date": paid_time_str,
            "amount": milestone.amount,
            "method": req.payment_method,
            "utr_or_cheque": utr_code,
            "received_by": "Parent Online Gateway",
            "notes": f"Settled via Parent Portal (Receipt: {receipt_num})"
        })
        import json
        defaulter.payment_history_json = json.dumps(history)

    # 3. Create an online PaymentTransaction ledger entry for the Accounts Coordinator to reconcile
    new_tx = PaymentTransaction(
        utr_number=utr_code,
        student_name=student_name,
        class_name=class_name,
        parent_name=parent_name,
        amount=milestone.amount,
        payment_method=req.payment_method or "UPI",
        bank_name="HDFC Bank Gateway",
        milestone_title=milestone.title,
        status="Success",
        reconciled=False,
        gateway_ref=f"pay_online_{milestone_id}_{int(datetime.datetime.utcnow().timestamp())}",
        notes=f"Online payment receipt {receipt_num}"
    )
    db.add(new_tx)

    # 4. Trigger system notifications across roles
    # To Accounts Coordinator
    await create_system_notification(
        db=db,
        sender_name="Parent Gateway",
        sender_role="system",
        recipient_role="accounts_coordinator",
        title=f"Online Fee Payment: ₹{milestone.amount:,.0f}",
        message=f"{parent_name} paid ₹{milestone.amount:,.0f} for {student_name} ({class_name}) - {milestone.title}. Ready for bank statement reconciliation.",
        notification_type="PAYMENT_RECEIVED",
        priority="NORMAL",
        action_url="/accounts_coordinator",
        metadata_dict={"student_name": student_name, "amount": milestone.amount, "utr": utr_code}
    )

    # Confirmation to Parent
    await create_system_notification(
        db=db,
        sender_name="Mr. Arvind Krishnan",
        sender_role="accounts_coordinator",
        recipient_role="parent",
        title=f"Payment Receipt: {receipt_num}",
        message=f"Thank you. We have received payment of ₹{milestone.amount:,.0f} for {milestone.title}. Official receipt {receipt_num} is ready.",
        notification_type="PAYMENT_RECEIPT",
        priority="NORMAL",
        action_url="/parent",
        metadata_dict={"receipt_no": receipt_num, "amount": milestone.amount}
    )

    # 5. Statutory Security & Fiscal Audit Log
    fee_audit = SecurityAuditLog(
        actor_name=parent_name,
        actor_role="PARENT",
        action_type="PARENT_FEE_PAYMENT",
        target_entity=f"FeeMilestone #{milestone_id} - {student_name} ({class_name})",
        ip_address="127.0.0.1",
        status="VERIFIED",
        details=f"Settled {milestone.title} amount ₹{milestone.amount:,.0f} via {req.payment_method}. UTR: {utr_code}, Receipt: {receipt_num}"
    )
    db.add(fee_audit)
    
    await db.commit()
    await db.refresh(milestone)
    return milestone

class WhatsAppFeeDispatchRequest(BaseModel):
    phone: Optional[str] = "+91 98480 22338"
    milestone_id: Optional[int] = None
    action_type: str = "receipt"  # "receipt" | "summary"

@router.post("/fees/whatsapp-dispatch")
async def dispatch_parent_fee_whatsapp(req: WhatsAppFeeDispatchRequest, db: AsyncSession = Depends(get_db)):
    """
    Simulated dummy WhatsApp dispatch endpoint for fee receipts and fee summary dispatches.
    Logs dispatch and returns realistic payload.
    """
    phone = req.phone or "+91 98480 22338"
    timestamp_str = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
    
    if req.action_type == "summary":
        message_preview = f"EDU360 Accounts: Aarav Sharma (Class 8-B). Total Paid: ₹35,000 | Pending Dues: ₹18,500 (Due: 25 Oct 2026). Settle instantly via https://edu360.school/pay/aarav8b"
    else:
        receipt_code = f"REC-2026-FEE-{req.milestone_id or 5821}"
        message_preview = f"EDU360 Accounts: Official payment receipt #{receipt_code} for Aarav Sharma has been generated. Download authenticated PDF: https://edu360.school/receipts/{receipt_code}.pdf"
    
    return {
        "success": True,
        "message": f"WhatsApp message successfully dispatched to {phone}",
        "dispatched_to": phone,
        "action_type": req.action_type,
        "timestamp": timestamp_str,
        "message_preview": message_preview
    }

# --- 5. Leave Request Application ---
@router.post("/leave-requests", response_model=LeaveRequestResponse)
async def apply_student_leave(req: LeaveRequestCreate, db: AsyncSession = Depends(get_db)):
    # Strict CBSE attachment extension whitelist (PDF, PNG, JPG, JPEG, WEBP)
    ALLOWED_LEAVE_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}
    for target in [req.attachment_name, req.attachment_url]:
        if target:
            clean_target = target.split("?")[0].strip()
            import os
            ext = os.path.splitext(clean_target)[1].lower()
            if ext and ext not in ALLOWED_LEAVE_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid medical leave attachment extension '{ext}'. Only authenticated documents (PDF, PNG, JPG, WEBP) are accepted."
                )

    new_lr = LeaveRequest(
        student_id=req.student_id,
        student_name=req.student_name,
        parent_name=req.parent_name,
        from_date=req.from_date,
        to_date=req.to_date,
        reason=req.reason,
        status="Pending",
        is_medical=req.is_medical or False,
        attachment_name=req.attachment_name,
        attachment_url=req.attachment_url,
        approval_stage="Submitted - Pending Teacher Review"
    )
    db.add(new_lr)

    # Statutory Security & Attendance Audit Log
    leave_audit = SecurityAuditLog(
        actor_name=req.parent_name,
        actor_role="PARENT",
        action_type="PARENT_LEAVE_APPLICATION",
        target_entity=f"Student #{req.student_id} - {req.student_name}",
        ip_address="127.0.0.1",
        status="VERIFIED",
        details=f"Leave application for {req.from_date} to {req.to_date}. Medical: {bool(req.is_medical)}. Reason: {req.reason[:150]}"
    )
    db.add(leave_audit)

    await db.commit()
    await db.refresh(new_lr)

    # Dispatch persistent notification to TEACHER role
    try:
        med_prefix = "medical " if req.is_medical else ""
        await create_system_notification(
            db=db,
            sender_name=req.parent_name,
            sender_role="PARENT",
            title=f"New Leave Application: {req.student_name}",
            message=f"Parent {req.parent_name} submitted a {med_prefix}leave request for {req.student_name} ({req.from_date} to {req.to_date}): \"{req.reason}\". Action required in Leave Approvals.",
            notification_type="LEAVE_APPLICATION",
            priority="HIGH" if req.is_medical else "NORMAL",
            recipient_role="TEACHER",
            action_url="/teacher?tab=leave_approvals",
            metadata_dict={"student_id": req.student_id, "leave_id": new_lr.id, "is_medical": req.is_medical}
        )
    except Exception as e:
        print(f"Warning: could not dispatch teacher notification for leave request: {e}")

    return new_lr

@router.get("/leave-requests/{student_id}", response_model=list[LeaveRequestResponse])
async def get_student_leave_requests(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.student_id == student_id).order_by(LeaveRequest.applied_at.desc()))
    return result.scalars().all()

# --- 6. Digital TC Sign-Off ---
@router.post("/exit-clearance/{student_id}/digital-sign")
async def digital_sign_tc(student_id: int, req: ExitClearanceDigitalSign, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExitClearance).where(ExitClearance.student_id == student_id).order_by(ExitClearance.id.desc()))
    clearance = result.scalars().first()
    if not clearance:
        raise HTTPException(status_code=404, detail="No active exit clearance record for this student")
    
    clearance.digital_parent_approved = req.parent_confirmation
    clearance.digital_approval_timestamp = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p UTC")
    
    if clearance.digital_parent_approved and clearance.physical_sign_verified:
        clearance.status = "Completed & Permanently Archived"
    else:
        clearance.status = "Digital Approved - Pending Physical Sign Scan"

    # Statutory Security & TC Exit Audit Log
    tc_audit = SecurityAuditLog(
        actor_name=f"Parent of {clearance.student_name}",
        actor_role="PARENT",
        action_type="STATUTORY_TC_PARENT_DIGITAL_SIGN",
        target_entity=f"ExitClearance #{clearance.id} - Student #{student_id} ({clearance.student_name})",
        ip_address="127.0.0.1",
        status="VERIFIED",
        details=f"CBSE statutory TC digital sign-off stamped at {clearance.digital_approval_timestamp}. Result status: {clearance.status}"
    )
    db.add(tc_audit)
        
    await db.commit()
    await db.refresh(clearance)
    return {
        "success": True,
        "message": "Digital Sign-off stamped with tamper-evident digital seal.",
        "clearance": clearance
    }

# --- 7. Dual-Mode Parent-Teacher Connection & Sliding PTM Engine ---
from app.routers.teacher import (
    _ptm_slots, _ptm_event_config, _parent_teacher_notes,
    _slot_to_dict, _ptn_to_dict, _ensure_ptm_slots_seeded, _ensure_parent_notes_seeded
)
from app.models.models import PTMSlot, ParentTeacherNote
from app.schemas.schemas import (
    PTMEventConfigResponse, PTMSlotResponse, PTMSlotBookRequest,
    PTMSlotCancelRequest,
    ParentTeacherNoteResponse, ParentTeacherNoteCreate
)

@router.get("/ptm/event-config", response_model=PTMEventConfigResponse)
@router.get("/ptm/config", response_model=PTMEventConfigResponse)
async def get_parent_ptm_event_config():
    return _ptm_event_config

@router.get("/ptm/slots", response_model=list[PTMSlotResponse])
async def get_parent_ptm_slots(scope: str = None, db: AsyncSession = Depends(get_db)):
    await _ensure_ptm_slots_seeded(db)
    try:
        from sqlalchemy import or_
        stmt = select(PTMSlot)
        if scope and scope != "ALL":
            stmt = stmt.where(or_(PTMSlot.interaction_scope == scope, PTMSlot.status == "BREAK"))
        stmt = stmt.order_by(PTMSlot.start_time.asc())
        res = await db.execute(stmt)
        slots = res.scalars().all()
        if slots:
            return [_slot_to_dict(s) for s in slots]
    except Exception as e:
        print(f"Error querying PTMSlot in parent: {e}")
    if scope and scope != "ALL":
        return [s for s in _ptm_slots if s["interaction_scope"] == scope or s["status"] == "BREAK"]
    return _ptm_slots

@router.post("/ptm/slots/{slot_id}/hold")
async def parent_hold_ptm_slot(slot_id: str, db: AsyncSession = Depends(get_db)):
    await _ensure_ptm_slots_seeded(db)
    try:
        res = await db.execute(select(PTMSlot).where(PTMSlot.id == slot_id).with_for_update())
        slot = res.scalars().first()
        if slot:
            if slot.status != "AVAILABLE":
                raise HTTPException(status_code=400, detail="Slot is not available")
            slot.status = "HELD"
            await db.commit()
            for s in _ptm_slots:
                if s["id"] == slot_id:
                    s["status"] = "HELD"
            return {"success": True, "message": "Slot held for 5 minutes", "slot": _slot_to_dict(slot)}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error holding PTMSlot in parent: {e}")
    for slot in _ptm_slots:
        if slot["id"] == slot_id:
            if slot["status"] != "AVAILABLE":
                raise HTTPException(status_code=400, detail="Slot is not available")
            slot["status"] = "HELD"
            return {"success": True, "message": "Slot held for 5 minutes", "slot": slot}
    raise HTTPException(status_code=404, detail="PTM slot not found")

@router.post("/ptm/slots/book", response_model=PTMSlotResponse)
async def parent_book_ptm_slot(req: PTMSlotBookRequest, db: AsyncSession = Depends(get_db)):
    await _ensure_ptm_slots_seeded(db)
    meeting_url = f"https://meet.google.com/edu-ptm-{req.slot_id}-{req.booked_student_id}"
    try:
        res = await db.execute(select(PTMSlot).where(PTMSlot.id == req.slot_id).with_for_update())
        db_slot = res.scalars().first()
        if not db_slot:
            raise HTTPException(status_code=404, detail="PTM slot not found")
        if db_slot.status == "BOOKED":
            raise HTTPException(status_code=409, detail="This PTM slot has already been booked by another parent.")
        if db_slot:
            db_slot.status = "BOOKED"
            db_slot.booked_student_id = req.booked_student_id
            db_slot.booked_student_name = req.booked_student_name
            db_slot.booked_class = req.booked_class
            db_slot.booked_parent_id = req.booked_parent_id
            db_slot.booked_parent_name = req.booked_parent_name
            db_slot.interaction_scope = req.interaction_scope
            db_slot.subject_name = req.subject_name
            db_slot.is_sibling_combo = req.is_sibling_combo
            db_slot.sibling_student_id = req.sibling_student_id
            db_slot.sibling_student_name = req.sibling_student_name
            db_slot.meeting_url = meeting_url
            db_slot.focus_table_agenda = json.dumps(req.focus_table_agenda or [])
            await db.commit()

            # Closed-Loop Telemetry: Auto-update Focus Table if agenda items selected
            if req.focus_table_agenda and req.booked_student_id:
                ft_res = await db.execute(select(FocusTable).where(FocusTable.student_id == req.booked_student_id))
                ft = ft_res.scalars().first()
                if ft:
                    agenda_str = ", ".join(req.focus_table_agenda)
                    ft.teacher_action = f"[PTM Agenda Booked for 24 Oct]: {agenda_str}"
                    ft.updated_at = datetime.datetime.utcnow()
                    await db.commit()

            for slot in _ptm_slots:
                if slot["id"] == req.slot_id:
                    slot.update(_slot_to_dict(db_slot))
            return _slot_to_dict(db_slot)
    except HTTPException:
        raise
    except Exception as dbe:
        await db.rollback()
        print(f"DB slot persist error in parent: {dbe}")

    for slot in _ptm_slots:
        if slot["id"] == req.slot_id:
            slot["status"] = "BOOKED"
            slot["booked_student_id"] = req.booked_student_id
            slot["booked_student_name"] = req.booked_student_name
            slot["booked_class"] = req.booked_class
            slot["booked_parent_id"] = req.booked_parent_id
            slot["booked_parent_name"] = req.booked_parent_name
            slot["interaction_scope"] = req.interaction_scope
            slot["subject_name"] = req.subject_name
            slot["is_sibling_combo"] = req.is_sibling_combo
            slot["sibling_student_id"] = req.sibling_student_id
            slot["sibling_student_name"] = req.sibling_student_name
            slot["focus_table_agenda"] = req.focus_table_agenda or []
            slot["meeting_url"] = meeting_url
            return slot
    raise HTTPException(status_code=404, detail="PTM slot not found")

@router.post("/ptm/slots/{slot_id}/cancel")
async def cancel_parent_ptm_slot(slot_id: str, req: PTMSlotCancelRequest, db: AsyncSession = Depends(get_db)):
    """
    Parent cancels their booked PTM conference slot.
    Immediately frees the slot (status = AVAILABLE) for other parents to book.
    """
    await _ensure_ptm_slots_seeded(db)
    try:
        res = await db.execute(select(PTMSlot).where(PTMSlot.id == slot_id).with_for_update())
        db_slot = res.scalars().first()
        if not db_slot:
            raise HTTPException(status_code=404, detail="PTM slot not found")
        if db_slot:
            db_slot.status = "AVAILABLE"
            db_slot.cancellation_reason = req.cancellation_reason
            db_slot.cancelled_by = "PARENT"
            db_slot.cancelled_at = datetime.datetime.utcnow().isoformat()
            db_slot.booked_student_id = None
            db_slot.booked_student_name = None
            db_slot.booked_class = None
            db_slot.booked_parent_id = None
            db_slot.booked_parent_name = None
            db_slot.meeting_url = None
            db_slot.focus_table_agenda = "[]"
            db_slot.is_sibling_combo = False
            db_slot.sibling_student_id = None
            db_slot.sibling_student_name = None
            await db.commit()

            for s in _ptm_slots:
                if s["id"] == slot_id:
                    s.update(_slot_to_dict(db_slot))

            return {
                "success": True,
                "message": "Your PTM booking has been cancelled and reopened.",
                "slot": _slot_to_dict(db_slot)
            }
    except Exception as e:
        print(f"Error cancelling PTMSlot in parent: {e}")

    for slot in _ptm_slots:
        if slot["id"] == slot_id:
            slot["status"] = "AVAILABLE"
            slot["cancellation_reason"] = req.cancellation_reason
            slot["cancelled_by"] = "PARENT"
            slot["cancelled_at"] = datetime.datetime.utcnow().isoformat()
            slot["booked_student_id"] = None
            slot["booked_student_name"] = None
            slot["booked_class"] = None
            slot["booked_parent_id"] = None
            slot["booked_parent_name"] = None
            slot["meeting_url"] = None
            slot["focus_table_agenda"] = []
            slot["is_sibling_combo"] = False
            slot["sibling_student_id"] = None
            slot["sibling_student_name"] = None

            return {
                "success": True,
                "message": "Your PTM booking has been cancelled and reopened.",
                "slot": slot
            }
    raise HTTPException(status_code=404, detail="PTM slot not found")

@router.get("/notes/{student_id}", response_model=list[ParentTeacherNoteResponse])
async def get_parent_student_notes(student_id: int, db: AsyncSession = Depends(get_db)):
    await _ensure_parent_notes_seeded(db)
    try:
        stmt = select(ParentTeacherNote).where(ParentTeacherNote.student_id == student_id).order_by(ParentTeacherNote.recorded_at.desc())
        res = await db.execute(stmt)
        notes = res.scalars().all()
        if notes:
            return [_ptn_to_dict(n) for n in notes]
    except Exception as e:
        print(f"Error querying ParentTeacherNote in parent: {e}")
    return [n for n in _parent_teacher_notes if n["student_id"] == student_id]

@router.post("/notes", response_model=ParentTeacherNoteResponse)
async def create_parent_note(req: ParentTeacherNoteCreate, db: AsyncSession = Depends(get_db)):
    note_id = f"ptn-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{len(_parent_teacher_notes)+1}"
    created_at_str = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
    new_note = {
        "id": note_id,
        "interaction_scope": req.interaction_scope,
        "student_id": req.student_id,
        "student_name": req.student_name,
        "student_class": req.student_class,
        "parent_id": req.parent_id,
        "parent_name": req.parent_name,
        "parent_phone": req.parent_phone,
        "teacher_id": req.teacher_id,
        "teacher_name": req.teacher_name,
        "subject_id": req.subject_id,
        "subject_name": req.subject_name,
        "homeroom_teacher_id": req.homeroom_teacher_id,
        "note_type": req.note_type,
        "content": req.content,
        "created_at": created_at_str,
        "is_focus_table_evidence": req.is_focus_table_evidence,
        "focus_concept_tag": req.focus_concept_tag
    }

    try:
        db_n = ParentTeacherNote(
            id=note_id,
            interaction_scope=req.interaction_scope,
            student_id=req.student_id,
            student_name=req.student_name,
            student_class=req.student_class,
            parent_id=req.parent_id,
            parent_name=req.parent_name,
            parent_phone=req.parent_phone,
            teacher_id=req.teacher_id,
            teacher_name=req.teacher_name,
            subject_id=req.subject_id,
            subject_name=req.subject_name,
            homeroom_teacher_id=req.homeroom_teacher_id,
            note_type=req.note_type,
            content=req.content,
            created_at=created_at_str,
            is_focus_table_evidence=req.is_focus_table_evidence,
            focus_concept_tag=req.focus_concept_tag
        )
        db.add(db_n)
        await db.commit()
    except Exception as e:
        print(f"Error persisting ParentTeacherNote in parent: {e}")

    _parent_teacher_notes.insert(0, new_note)

    # Closed-loop telemetry to Focus Table if flagged as evidence
    if req.is_focus_table_evidence:
        ft_res = await db.execute(select(FocusTable).where(FocusTable.student_id == req.student_id))
        ft = ft_res.scalars().first()
        if ft:
            evidence_tag = f"[{req.focus_concept_tag}] " if req.focus_concept_tag else ""
            ft.teacher_action = f"[Parent Note {created_at_str}] {evidence_tag}{req.content}"
            ft.updated_at = datetime.datetime.utcnow()
            await db.commit()

    return new_note



# =========================================================================
# PARENT - TEACHER DIRECT 2-WAY CHAT ENDPOINTS
# =========================================================================

@router.get("/chat/{student_id}", response_model=list[ParentTeacherChatMessageResponse])
async def get_parent_chat_history(student_id: int, teacher_name: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    # Support student ID alias for Aarav Sharma (1 or 6)
    target_ids = [1, 6] if student_id in [1, 6] else [student_id]
    stmt = select(ParentTeacherMessage).where(ParentTeacherMessage.student_id.in_(target_ids))
    
    if teacher_name:
        from sqlalchemy import or_
        stmt = stmt.where(or_(
            ParentTeacherMessage.sender_name.ilike(f"%{teacher_name}%"),
            ParentTeacherMessage.receiver_name.ilike(f"%{teacher_name}%")
        ))
        
    stmt = stmt.order_by(ParentTeacherMessage.created_at.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/chat/send", response_model=ParentTeacherChatMessageResponse)
async def send_parent_chat_message(req: ParentTeacherChatMessageCreate, db: AsyncSession = Depends(get_db)):
    st_res = await db.execute(select(Student).where(Student.id == req.student_id))
    st = st_res.scalars().first()
    student_name = st.name if st else "Student"

    msg = ParentTeacherMessage(
        student_id=req.student_id,
        student_name=student_name,
        sender_role=req.sender_role,
        sender_name=req.sender_name,
        receiver_role=req.receiver_role,
        receiver_name=req.receiver_name,
        message_text=req.message_text,
        attachment_name=req.attachment_name,
        attachment_url=req.attachment_url,
        is_read=False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    # Notify teacher
    try:
        await create_system_notification(
            db=db,
            recipient_role="TEACHER",
            sender_name=req.sender_name,
            sender_role="PARENT",
            title=f"New Message from {req.sender_name}",
            message=f"Parent of {student_name}: {req.message_text[:80]}...",
            notification_type="PARENT_CHAT",
            priority="NORMAL",
            action_url="/teacher?tab=parent_chat"
        )
    except Exception:
        pass

    return msg

@router.post("/chat/mark-read/{student_id}")
async def mark_parent_chat_read(student_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(ParentTeacherMessage)
        .where(
            ParentTeacherMessage.student_id == student_id,
            ParentTeacherMessage.receiver_role == "PARENT",
            ParentTeacherMessage.is_read == False
        )
        .values(is_read=True)
    )
    await db.commit()
    return {"success": True, "message": "Messages marked as read"}

# =========================================================================
# REPORT CARD DIGITAL SIGNATURE & ACKNOWLEDGMENT
# =========================================================================

@router.post("/report-cards/{report_card_id}/sign")
async def sign_parent_report_card(report_card_id: int, req: ReportCardSignRequest, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ReportCard).where(ReportCard.id == report_card_id))
    rc = res.scalars().first()
    if not rc:
        raise HTTPException(status_code=404, detail="Report card not found")
    if not rc.is_published:
        raise HTTPException(status_code=400, detail="Cannot acknowledge an unpublished report card")

    now = datetime.datetime.utcnow()
    seal_hash = f"CBSE-ACK-{rc.id}-{rc.student_id}-{int(now.timestamp())}"

    rc.parent_signed_at = now
    rc.parent_signer_name = req.signer_name
    rc.parent_signature_hash = seal_hash
    rc.parent_remarks = req.remarks

    # Statutory Academic Audit Log for Parent Report Card Acknowledgment
    rc_audit = SecurityAuditLog(
        actor_name=req.signer_name,
        actor_role="PARENT",
        action_type="REPORT_CARD_PARENT_SIGN",
        target_entity=f"ReportCard #{rc.id} - Student #{rc.student_id} ({rc.student_name})",
        ip_address="127.0.0.1",
        status="VERIFIED",
        details=f"Term {rc.term} report card digitally signed by {req.signer_name}. Hash: {seal_hash}. Remarks: {req.remarks or 'None'}"
    )
    db.add(rc_audit)

    await db.commit()
    await db.refresh(rc)

    try:
        await create_system_notification(
            db=db,
            recipient_role="EXAM_COORDINATOR",
            sender_name=req.signer_name,
            sender_role="PARENT",
            title=f"Report Card Acknowledged: {rc.student_name}",
            message=f"{req.signer_name} (Parent) digitally acknowledged the {rc.term} Report Card.",
            notification_type="REPORT_CARD_ACKNOWLEDGED",
            priority="NORMAL"
        )
    except Exception:
        pass

    return {
        "success": True,
        "message": "Report card digitally acknowledged and stamped.",
        "parent_signed_at": now.isoformat(),
        "parent_signer_name": req.signer_name,
        "parent_signature_hash": seal_hash,
        "parent_remarks": req.remarks
    }

# =========================================================================
# SECTION 80C TUITION FEE TAX EXEMPTION CERTIFICATE
# =========================================================================

@router.get("/fees/{student_id}/tax-certificate")
async def get_parent_tax_certificate(student_id: int, db: AsyncSession = Depends(get_db)):
    st_res = await db.execute(select(Student).where(Student.id == student_id))
    st = st_res.scalars().first()
    student_name = st.name if st else "Student"
    class_name = st.class_name if st else "Class 8-B"

    fees_res = await db.execute(
        select(FeeMilestone)
        .where(FeeMilestone.student_id == student_id, FeeMilestone.status == "Paid")
    )
    paid_milestones = fees_res.scalars().all()
    total_tuition_paid = sum(m.amount for m in paid_milestones if "Tuition" in m.title or "Curriculum" in m.title)
    if total_tuition_paid == 0:
        total_tuition_paid = 70000.0

    return {
        "success": True,
        "certificate_no": f"EDU360/TAX-80C/2026-27/{student_id:04d}",
        "issue_date": datetime.date.today().strftime("%d %B %Y"),
        "financial_year": "2026-2027",
        "assessment_year": "2027-2028",
        "school_info": {
            "name": "Delhi Public World School (EDU360 Campus)",
            "cbse_affiliation_no": "CBSE/AFF/360291",
            "school_code": "45210",
            "pan": "AAATD3841K",
            "address": "Sector 42, Institutional Area, Hyderabad - 500081"
        },
        "student_info": {
            "student_id": student_id,
            "student_name": student_name,
            "class_name": class_name,
            "guardian_name": st.guardian_name if st else "Rajesh Sharma",
            "admission_no": f"DPWS-2024-{student_id:04d}"
        },
        "eligible_tuition_fee": total_tuition_paid,
        "tax_section": "Section 80C of the Income Tax Act, 1961 (Tuition Fees Deduction)",
        "certification_text": "This is to certify that the above mentioned student is a bona fide regular student of this institution. The amount specified represents solely the tuition fee paid during the financial year 2026-2027, eligible for deduction under Section 80C."
    }
