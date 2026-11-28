import datetime
import json
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, and_, or_
from app.core.database import get_db
from app.models.models import (
    Student, FocusTable, HomeworkSubmission, BusRoute, FeeMilestone,
    LeaveRequest, ExitClearance, Homework, FeeDefaulter, PaymentTransaction,
    ParentTeacherMessage, ReportCard, SecurityAuditLog, OfficialDocument, AdmissionEnquiry,
    User
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
    Prioritizes direct relational link (Student.parent_user_id), then falls back
    to legacy test parents (Sharma, Fernandes) and phone/email queries.
    """
    # 0. Primary relational lookup: Match Student by parent_user_id
    if username or email:
        clean_u = (username or "").strip().lower()
        clean_e = (email or "").strip().lower()
        user_query = select(User).where(or_(
            User.username.ilike(clean_u) if clean_u else False,
            User.email.ilike(clean_e) if clean_e else False
        ))
        u_res = await db.execute(user_query)
        parent_user = u_res.scalars().first()
        if parent_user:
            rel_res = await db.execute(
                select(Student).where(Student.parent_user_id == parent_user.id).order_by(Student.id.asc())
            )
            rel_students = rel_res.scalars().all()
            if rel_students:
                return [{
                    "id": st.id,
                    "name": st.name,
                    "className": f"{st.class_name}-{st.section}",
                    "rollNo": int(st.roll_no) if str(st.roll_no).isdigit() else 1,
                    "initials": "".join([part[0].upper() for part in st.name.split() if part])[:2],
                    "admissionNo": st.admission_no or f"EDU-2026-{st.id:03d}",
                    "attendance": f"{st.attendance_pct}%" if st.attendance_pct is not None else "100.0%",
                    "gradeTier": st.grade_tier or f"{st.class_name}",
                    "academicAvg": f"{st.academic_average_pct}%" if st.academic_average_pct is not None else "Enrolled",
                    "busRoute": "Route #4 (Campus Shuttle)",
                    "mentor": "Mrs. Ananya Verma"
                } for st in rel_students]

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
            "subtitle": "Term 2 tuition & academic curriculum fee installment open for online payment.",
            "badge": "Payment Due",
            "badge_color": "amber",
            "action_text": "Pay via UPI / Card",
            "action_target": "fees",
            "icon": "CreditCard",
            "gradient": "from-amber-600 to-orange-600"
        },
        {
            "id": 4,
            "title": "Annual STEM & Robotics Exhibition 2026",
            "subtitle": "Inter-school science showcase registrations open for Middle & Senior wings.",
            "badge": "Campus Event",
            "badge_color": "purple",
            "action_text": "View Campus Calendar",
            "action_target": "events",
            "icon": "Calendar",
            "gradient": "from-purple-600 to-indigo-700"
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
    result = await db.execute(select(FeeMilestone).where(FeeMilestone.student_id == student_id).order_by(FeeMilestone.id.asc()))
    fees = result.scalars().all()
    if not fees:
        if student_id == 12:
            default_rows = [
                {"title": "Milestone 1: Term 1 Grade 10 Board Fee & Tuition", "amount": 42000, "due_date": "15 Jul 2026", "status": "Paid", "receipt_no": "REC-2026-FEE-4011", "paid_at": "10 Jul 2026, 10:00 AM", "payment_method": "Net Banking (SBI)"},
                {"title": "Milestone 2: Term 2 Grade 10 Board & Lab Fee", "amount": 42000, "due_date": "15 Oct 2026", "status": "Paid", "receipt_no": "REC-2026-FEE-4012", "paid_at": "12 Oct 2026, 02:30 PM", "payment_method": "UPI (PhonePe)"},
                {"title": "Milestone 3: Complete Exit & TC Account Clearance", "amount": 0, "due_date": "30 Oct 2026", "status": "Paid", "receipt_no": "REC-2026-EXIT-CLEAR", "paid_at": "30 Oct 2026, 11:00 AM", "payment_method": "Institutional Accounts Clearance"}
            ]
        elif student_id in [7, 2, 5, 8]:
            default_rows = [
                {"title": "Milestone 1: Primary Term 1 Tuition & Curriculum (15% Sibling Concession Applied)", "amount": 15300, "due_date": "15 Jul 2026", "status": "Paid", "receipt_no": "REC-2026-FEE-9102", "paid_at": "12 Jul 2026, 11:25 AM", "payment_method": "UPI (Google Pay)"},
                {"title": "Milestone 2: Early Learning Kit, Phonics Readers & Art Stationery", "amount": 6200, "due_date": "15 Jul 2026", "status": "Paid", "receipt_no": "REC-2026-FEE-9103", "paid_at": "15 Jul 2026, 03:45 PM", "payment_method": "Net Banking (HDFC)"},
                {"title": "Milestone 3: Primary Activity & Discovery Hub Lab Fee", "amount": 4500, "due_date": "18 Aug 2026", "status": "Paid", "receipt_no": "REC-2026-FEE-9104", "paid_at": "18 Aug 2026, 09:20 AM", "payment_method": "Debit Card"},
                {"title": "Milestone 4: Primary Term 2 Tuition & Activity (15% Sibling Concession Applied)", "amount": 15300, "due_date": "25 Oct 2026", "status": "Overdue", "receipt_no": None, "paid_at": None, "payment_method": None},
                {"title": "Milestone 5: Junior Annual Concert, Sports & Stage Performance", "amount": 5000, "due_date": "15 Dec 2026", "status": "Upcoming", "receipt_no": None, "paid_at": None, "payment_method": None}
            ]
        else:
            default_rows = [
                {"title": "Milestone 1: Term 1 Tuition & Curriculum Fee", "amount": 35000, "due_date": "15 Jul 2026", "status": "Paid", "receipt_no": "REC-2026-FEE-5821", "paid_at": "12 Jul 2026, 11:20 AM", "payment_method": "UPI (Google Pay)"},
                {"title": "Milestone 2: Digital Learning Platform & Cloud LMS Fee", "amount": 14500, "due_date": "15 Jul 2026", "status": "Paid", "receipt_no": "REC-2026-FEE-5822", "paid_at": "15 Jul 2026, 03:40 PM", "payment_method": "Net Banking (HDFC)"},
                {"title": "Milestone 3: STEM Robotics, Composite Lab & Library Fee", "amount": 12000, "due_date": "18 Aug 2026", "status": "Paid", "receipt_no": "REC-2026-FEE-5823", "paid_at": "18 Aug 2026, 09:15 AM", "payment_method": "Debit Card"},
                {"title": "Milestone 4: Term 2 Tuition & Infrastructure Fee", "amount": 35000, "due_date": "25 Oct 2026", "status": "Overdue", "receipt_no": None, "paid_at": None, "payment_method": None},
                {"title": "Milestone 5: Interactive Virtual Labs & AI Proctoring Fee", "amount": 14500, "due_date": "10 Nov 2026", "status": "Upcoming", "receipt_no": None, "paid_at": None, "payment_method": None},
                {"title": "Milestone 6: Annual Day, Sports & CBSE Exam Fee", "amount": 16500, "due_date": "15 Dec 2026", "status": "Upcoming", "receipt_no": None, "paid_at": None, "payment_method": None},
            ]

        # Verify if student exists in database before bulk inserting
        st_res = await db.execute(select(Student.id).where(Student.id == student_id))
        if st_res.scalars().first():
            for d in default_rows:
                db.add(FeeMilestone(
                    student_id=student_id,
                    title=d["title"],
                    amount=d["amount"],
                    due_date=d["due_date"],
                    status=d["status"],
                    receipt_no=d["receipt_no"],
                    paid_at=d["paid_at"],
                    payment_method=d["payment_method"]
                ))
            await db.commit()
            result = await db.execute(select(FeeMilestone).where(FeeMilestone.student_id == student_id).order_by(FeeMilestone.id.asc()))
            fees = result.scalars().all()
        else:
            return [FeeMilestone(id=i+1, student_id=student_id, **d) for i, d in enumerate(default_rows)]
    return fees

@router.post("/fees/reset")
async def reset_fee_demo_data(db: AsyncSession = Depends(get_db)):
    """
    Resets all demo fee payments and test receipts back to the initial pending dues state.
    Milestones 1-3 remain Paid, Milestone 4 becomes Overdue, Milestones 5-6 become Upcoming.
    """
    try:
        # Delete any test milestones dynamically added with ID >= 4
        res = await db.execute(select(FeeMilestone).where(FeeMilestone.id >= 4))
        for m in res.scalars().all():
            await db.delete(m)

        # Re-initialize or reset student 1 milestone 4
        res4 = await db.execute(select(FeeMilestone).where(FeeMilestone.id == 4))
        m4 = res4.scalars().first()
        if m4:
            m4.status = "Overdue"
            m4.receipt_no = None
            m4.paid_at = None
            m4.payment_method = None

        # Clean test transactions
        tx_res = await db.execute(select(PaymentTransaction).where(PaymentTransaction.gateway_ref.like("REC-2026-FEE-%")))
        for tx in tx_res.scalars().all():
            await db.delete(tx)

        # Restore FeeDefaulters for demo students
        def_res = await db.execute(select(FeeDefaulter).where(FeeDefaulter.student_id.in_([1, 2, 5, 7, 8])))
        for d in def_res.scalars().all():
            d.status = "Overdue"
            d.amount_due = 35000.0 if d.student_id == 1 else 15300.0

        await db.commit()
    except Exception as e:
        await db.rollback()
        return {"success": False, "error": str(e)}

    return {"success": True, "message": "Fee milestones reset to default pending dues state"}

@router.post("/fees/{milestone_id}/pay", response_model=FeeMilestoneResponse)
async def pay_fee_milestone(milestone_id: int, req: FeePayRequest, db: AsyncSession = Depends(get_db)):
    if req.amount is not None and req.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero")
    result = await db.execute(select(FeeMilestone).where(FeeMilestone.id == milestone_id).with_for_update())
    milestone = result.scalars().first()
    
    # If not found by exact ID, query by title or first unpaid milestone
    if not milestone:
        result = await db.execute(select(FeeMilestone).where(FeeMilestone.status != "Paid").order_by(FeeMilestone.id.asc()).limit(1))
        milestone = result.scalars().first()

    now_local = datetime.datetime.now()
    paid_time_str = now_local.strftime("%d %b %Y, %I:%M %p")
    utr_code = f"UPI/{int(now_local.timestamp())}{milestone_id}/HDFC"

    if milestone:
        milestone.status = "Paid"
        milestone.paid_at = paid_time_str
        milestone.payment_method = req.payment_method
        st_id = milestone.student_id
        amount = req.amount or milestone.amount
        milestone.amount = amount
        m_title = req.title or milestone.title
        milestone.title = m_title
        receipt_num = f"REC-2026-FEE-{st_id}-{milestone.id}"
        milestone.receipt_no = receipt_num
    else:
        st_id = req.student_id or 1
        amount = req.amount or (14500.0 if milestone_id == 5 else 15300.0 if milestone_id in [104, 4] and st_id in [2, 5, 7, 8] else 35000.0)
        m_title = req.title or ("Interactive Virtual Labs & AI Proctoring Fee" if milestone_id == 5 else "Primary Term 2 Tuition & Activity" if milestone_id in [104, 4] and st_id in [2, 5, 7, 8] else "Term 2 Tuition & Infrastructure Fee")
        receipt_num = f"REC-2026-FEE-{st_id}-{milestone_id}"
        milestone = FeeMilestone(
            student_id=st_id,
            title=m_title,
            amount=amount,
            due_date="25 Oct 2026",
            status="Paid",
            receipt_no=receipt_num,
            paid_at=paid_time_str,
            payment_method=req.payment_method
        )
        db.add(milestone)

    # 1. Fetch student info to link records
    student_res = await db.execute(select(Student).where(Student.id == st_id))
    student = student_res.scalars().first()
    student_name = req.student_name or (student.name if student else f"Student #{st_id}")
    class_name = req.class_name or (f"{student.class_name}-{student.section}" if student else "Class 8-B")
    parent_name = req.parent_name or (student.guardian_name if student and student.guardian_name else "Parent / Guardian")

    # 2. Update FeeDefaulter if an overdue record exists
    defaulter_res = await db.execute(
        select(FeeDefaulter).where(
            FeeDefaulter.student_id == st_id,
            FeeDefaulter.status.in_(["Overdue", "Partially Paid"])
        )
    )
    defaulter = defaulter_res.scalars().first()
    if defaulter:
        new_amount_due = max(0.0, round(float(defaulter.amount_due) - float(amount), 2))
        defaulter.amount_due = new_amount_due
        if new_amount_due <= 0.0:
            defaulter.status = "Paid"
            defaulter.days_overdue = 0
            defaulter.exam_clearance = True
        else:
            defaulter.status = "Partially Paid"
        history = []
        if defaulter.payment_history_json:
            try:
                import json
                history = json.loads(defaulter.payment_history_json)
            except Exception:
                history = []
        history.append({
            "date": paid_time_str,
            "amount": amount,
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
        amount=amount,
        payment_method=req.payment_method or "UPI",
        bank_name="HDFC Bank Gateway",
        milestone_title=m_title,
        status="Success",
        reconciled=False,
        transaction_date=datetime.datetime.utcnow(),
        gateway_ref=receipt_num,
        notes=f"Online payment receipt {receipt_num}"
    )
    db.add(new_tx)

    # 4. Trigger system notifications across roles
    # Notification to Accounts Coordinator
    await create_system_notification(
        db=db,
        sender_name="Fee Gateway",
        sender_role="system",
        recipient_role="accounts_coordinator",
        title=f"Online Fee Payment: ₹{amount:,.0f}",
        message=f"{parent_name} paid ₹{amount:,.0f} for {student_name} ({class_name}) - {m_title}. Receipt #{receipt_num}. Ready for bank reconciliation.",
        notification_type="ONLINE_PAYMENT",
        priority="NORMAL",
        action_url="/accounts_coordinator?tab=reconciliation",
        metadata_dict={"student_name": student_name, "class_name": class_name, "amount": amount, "utr": utr_code, "receipt_no": receipt_num}
    )

    # Notification to Admin
    await create_system_notification(
        db=db,
        sender_name="Fee Gateway",
        sender_role="system",
        recipient_role="admin",
        title=f"Fee Collected: ₹{amount:,.0f} ({student_name})",
        message=f"{parent_name} paid ₹{amount:,.0f} for {student_name} ({class_name}) - {m_title}. Receipt #{receipt_num}. Logged into today's ledger.",
        notification_type="ONLINE_PAYMENT",
        priority="NORMAL",
        action_url="/admin?tab=fees",
        metadata_dict={"student_name": student_name, "class_name": class_name, "amount": amount, "utr": utr_code, "receipt_no": receipt_num}
    )

    # Confirmation to Parent
    await create_system_notification(
        db=db,
        sender_name="Oakridge Accounts",
        sender_role="accounts_coordinator",
        recipient_role="parent",
        title=f"Payment Receipt: {receipt_num}",
        message=f"Thank you. Payment of ₹{amount:,.0f} received for {m_title}. Official receipt {receipt_num} is ready.",
        notification_type="PAYMENT_RECEIPT",
        priority="NORMAL",
        action_url="/parent?tab=fees",
        metadata_dict={"receipt_no": receipt_num, "amount": amount, "student_name": student_name}
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
    Logs dispatch and returns realistic payload grounded in DB student/milestone records.
    """
    phone = req.phone or "+91 98480 22338"
    timestamp_str = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")

    student_name = "Student"
    class_name = "Class 8-B"
    total_paid = 0.0
    total_due = 0.0
    due_date = "25 Oct 2026"
    student_id = 1

    if req.milestone_id:
        m_res = await db.execute(select(FeeMilestone).where(FeeMilestone.id == req.milestone_id))
        ms = m_res.scalars().first()
        if ms and ms.student_id:
            student_id = ms.student_id
            due_date = ms.due_date or due_date
    elif req.phone:
        s_res = await db.execute(select(Student).where(Student.guardian_phone == req.phone))
        st_match = s_res.scalars().first()
        if st_match:
            student_id = st_match.id

    st_res = await db.execute(select(Student).where(Student.id == student_id))
    st = st_res.scalars().first()
    if st:
        student_name = st.name
        class_name = f"{st.class_name}-{st.section}" if st.section else (st.class_name or class_name)
        phone = req.phone or st.guardian_phone or phone

    ms_res = await db.execute(select(FeeMilestone).where(FeeMilestone.student_id == student_id))
    for m in ms_res.scalars().all():
        if m.status == "Paid":
            total_paid += float(m.amount or 0)
        else:
            total_due += float(m.amount or 0)

    slug = student_name.lower().replace(" ", "")[:10]
    if req.action_type == "summary":
        message_preview = f"EDU360 Accounts: {student_name} ({class_name}). Total Paid: ₹{total_paid:,.0f} | Pending Dues: ₹{total_due:,.0f} (Due: {due_date}). Settle instantly via https://edu360.school/pay/{slug}"
    else:
        receipt_code = f"REC-2026-FEE-{req.milestone_id or 5821}"
        message_preview = f"EDU360 Accounts: Official payment receipt #{receipt_code} for {student_name} has been generated. Download authenticated PDF: https://edu360.school/receipts/{receipt_code}.pdf"
    
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

    st_res = await db.execute(select(Student).where(Student.id == req.student_id))
    st_row = st_res.scalars().first()
    resolved_student_name = (req.student_name or "").strip() or (st_row.name if st_row else f"Student #{req.student_id}")
    resolved_parent_name = (req.parent_name or "").strip() or (st_row.guardian_name if st_row and st_row.guardian_name else "Parent / Guardian")

    new_lr = LeaveRequest(
        student_id=req.student_id,
        student_name=resolved_student_name,
        parent_name=resolved_parent_name,
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
        actor_name=resolved_parent_name,
        actor_role="PARENT",
        action_type="PARENT_LEAVE_APPLICATION",
        target_entity=f"Student #{req.student_id} - {resolved_student_name}",
        ip_address="127.0.0.1",
        status="VERIFIED",
        details=f"Leave application for {req.from_date} to {req.to_date}. Medical: {bool(req.is_medical)}. Reason: {req.reason[:150]}"
    )
    db.add(leave_audit)

    await db.commit()
    await db.refresh(new_lr)

    # Dispatch persistent notification to Homeroom Teacher
    try:
        med_prefix = "medical " if req.is_medical else ""
        # Resolve student's homeroom teacher UID
        homeroom_uid = 2  # Default to Class 8-B Homeroom (Mrs. Ananya Verma)
        if req.student_id in [4]:
            homeroom_uid = 14  # Class 8-A Mrs. Sunitha Rao
        elif req.student_id in [7, 8]:
            homeroom_uid = 14  # Junior Primary Sections
        
        await create_system_notification(
            db=db,
            sender_name=resolved_parent_name,
            sender_role="parent",
            title=f"New Leave Application: {resolved_student_name}",
            message=f"Parent {resolved_parent_name} submitted a {med_prefix}leave request for {resolved_student_name} ({req.from_date} to {req.to_date}): \"{req.reason}\". Action required in Leave Approvals.",
            notification_type="LEAVE_APPLICATION",
            priority="HIGH" if req.is_medical else "NORMAL",
            recipient_user_id=homeroom_uid,
            recipient_role="teacher",
            action_url="/teacher?tab=leave_approvals",
            metadata_dict={"student_id": req.student_id, "leave_id": new_lr.id, "is_medical": req.is_medical}
        )
    except Exception as e:
        print(f"Warning: could not dispatch teacher notification for leave request: {e}")

    return new_lr

@router.get("/leave-requests", response_model=list[LeaveRequestResponse])
@router.get("/leave-requests/{student_id}", response_model=list[LeaveRequestResponse])
async def get_student_leave_requests(student_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    if student_id:
        stmt = select(LeaveRequest).where(LeaveRequest.student_id == student_id)
    else:
        stmt = select(LeaveRequest)
    result = await db.execute(stmt.order_by(LeaveRequest.applied_at.desc()))
    return result.scalars().all()

# --- 6. Digital TC Sign-Off & Exit Clearance ---
@router.get("/exit-clearance/{student_id}", response_model=Optional[ExitClearanceResponse])
async def get_parent_student_exit_clearance(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ExitClearance)
        .where(ExitClearance.student_id == student_id)
        .order_by(ExitClearance.id.desc())
    )
    return result.scalars().first()

@router.get("/exit-clearances", response_model=list[ExitClearanceResponse])
async def list_parent_exit_clearances(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ExitClearance)
        .order_by(ExitClearance.id.desc())
    )
    return result.scalars().all()

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
        # Terminate active SIS lifecycle and transition student status to Withdrawn
        st_res = await db.execute(select(Student).where(Student.id == student_id))
        student = st_res.scalars().first()
        if student:
            student.status = "Withdrawn"
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
    _slot_to_dict, _ptn_to_dict, _ensure_ptm_slots_seeded, _ensure_parent_notes_seeded,
    _parse_time_sort_key
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
        res = await db.execute(stmt)
        slots = res.scalars().all()
        if slots:
            slot_dicts = [_slot_to_dict(s) for s in slots]
            slot_dicts.sort(key=lambda s: _parse_time_sort_key(s.get("start_time", "")))
            return slot_dicts
    except Exception as e:
        print(f"Error querying PTMSlot in parent: {e}")
    res_list = [s for s in _ptm_slots if scope != "ALL" and scope and (s["interaction_scope"] == scope or s["status"] == "BREAK")] if (scope and scope != "ALL") else list(_ptm_slots)
    res_list.sort(key=lambda s: _parse_time_sort_key(s.get("start_time", "")))
    return res_list

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

async def _resolve_teacher_user_id(teacher_id_str: Optional[str], subject_name: Optional[str], db: AsyncSession) -> int:
    """
    Resolve teacher user ID from PTMSlot.teacher_id or subject_name.
    Maps known staff codes and queries database as fallback.
    Defaults to 2 (Mrs. Ananya Verma - Lead Homeroom Teacher).
    """
    KNOWN_TEACHERS = {
        "ananya": 2,
        "raman": 12,
        "sen": 13,
        "sunitha": 14,
        "kalyani": 15,
        "shalini": 16,
    }
    if teacher_id_str:
        tid_lower = str(teacher_id_str).lower().strip()
        if tid_lower in KNOWN_TEACHERS:
            return KNOWN_TEACHERS[tid_lower]
        if tid_lower.isdigit():
            return int(tid_lower)
        try:
            res = await db.execute(
                select(User.id).where(
                    and_(
                        User.role == "teacher",
                        or_(
                            User.username.ilike(f"%{tid_lower}%"),
                            User.name.ilike(f"%{tid_lower}%")
                        )
                    )
                ).limit(1)
            )
            uid = res.scalar_one_or_none()
            if uid:
                return uid
        except Exception:
            pass

    if subject_name:
        sub_lower = subject_name.lower()
        for key, uid in KNOWN_TEACHERS.items():
            if key in sub_lower:
                return uid

    return 2


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

            # DISPATCH IN-APP NOTIFICATION TO SUBJECT TEACHER
            try:
                teacher_uid = await _resolve_teacher_user_id(db_slot.teacher_id, req.subject_name, db)
                time_range = f"{db_slot.start_time} - {db_slot.end_time}"
                agenda_items = req.focus_table_agenda or []
                agenda_desc = f"Agenda: {', '.join(agenda_items)}" if agenda_items else "General Academic Review & Progress"
                scope_label = "Homeroom" if req.interaction_scope == "HOMEROOM_CLASS" else (req.subject_name or "Subject-Specific")

                await create_system_notification(
                    db=db,
                    sender_name=req.booked_parent_name or "Parent",
                    sender_role="parent",
                    recipient_user_id=teacher_uid,
                    recipient_role="teacher",
                    title=f"PTM Slot Booked: {req.booked_student_name} ({req.booked_class})",
                    message=f"{req.booked_parent_name} has scheduled a 10-minute PTM conference on 24 Oct ({time_range}) for {req.booked_student_name} ({req.booked_class}). Scope: {scope_label}. {agenda_desc}.",
                    notification_type="PTM_SLOT_BOOKED",
                    priority="URGENT",
                    action_url="/teacher?tab=parent_hub",
                    metadata_dict={
                        "slot_id": req.slot_id,
                        "student_id": req.booked_student_id,
                        "student_name": req.booked_student_name,
                        "class": req.booked_class,
                        "parent_name": req.booked_parent_name,
                        "start_time": db_slot.start_time,
                        "end_time": db_slot.end_time,
                        "interaction_scope": req.interaction_scope,
                        "subject_name": req.subject_name,
                        "meeting_url": meeting_url,
                        "agenda": agenda_items
                    }
                )
            except Exception as notif_err:
                print(f"Error dispatching PTM booking notification to teacher: {notif_err}")

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

            # Memory fallback notification dispatch
            try:
                teacher_uid = await _resolve_teacher_user_id(slot.get("teacher_id"), req.subject_name, db)
                time_range = f"{slot.get('start_time')} - {slot.get('end_time')}"
                await create_system_notification(
                    db=db,
                    sender_name=req.booked_parent_name or "Parent",
                    sender_role="parent",
                    recipient_user_id=teacher_uid,
                    recipient_role="teacher",
                    title=f"PTM Slot Booked: {req.booked_student_name} ({req.booked_class})",
                    message=f"{req.booked_parent_name} has scheduled a 10-minute PTM conference on 24 Oct ({time_range}) for {req.booked_student_name}.",
                    notification_type="PTM_SLOT_BOOKED",
                    priority="URGENT",
                    action_url="/teacher?tab=parent_hub",
                    metadata_dict={"slot_id": req.slot_id, "student_name": req.booked_student_name}
                )
            except Exception:
                pass

            return slot
    raise HTTPException(status_code=404, detail="PTM slot not found")

@router.post("/ptm/slots/{slot_id}/cancel")
async def cancel_parent_ptm_slot(slot_id: str, req: PTMSlotCancelRequest, db: AsyncSession = Depends(get_db)):
    """
    Parent cancels their booked PTM conference slot.
    Immediately frees the slot (status = AVAILABLE) for other parents to book.
    Dispatches real-time in-app notification to the subject teacher.
    """
    await _ensure_ptm_slots_seeded(db)
    try:
        res = await db.execute(select(PTMSlot).where(PTMSlot.id == slot_id).with_for_update())
        db_slot = res.scalars().first()
        if not db_slot:
            raise HTTPException(status_code=404, detail="PTM slot not found")
        if db_slot:
            prev_student_name = db_slot.booked_student_name or "Student"
            prev_student_id = db_slot.booked_student_id
            prev_class = db_slot.booked_class or "Class 8-B"
            prev_parent_name = db_slot.booked_parent_name or "Parent"
            prev_teacher_id = db_slot.teacher_id
            prev_subject = db_slot.subject_name
            slot_time = f"{db_slot.start_time} - {db_slot.end_time}"
            cancellation_reason = req.cancellation_reason or "Parent-Initiated Cancellation"

            db_slot.status = "AVAILABLE"
            db_slot.cancellation_reason = cancellation_reason
            db_slot.cancelled_by = "PARENT"
            db_slot.cancelled_at = datetime.datetime.utcnow().isoformat() + "Z"
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

            # DISPATCH IN-APP NOTIFICATION TO SUBJECT TEACHER
            try:
                teacher_uid = await _resolve_teacher_user_id(prev_teacher_id, prev_subject, db)
                await create_system_notification(
                    db=db,
                    sender_name=prev_parent_name,
                    sender_role="parent",
                    recipient_user_id=teacher_uid,
                    recipient_role="teacher",
                    title=f"PTM Slot Cancelled: {prev_student_name} ({prev_class})",
                    message=f"{prev_parent_name} has cancelled their PTM slot on 24 Oct ({slot_time}) for {prev_student_name}. Reason: {cancellation_reason}. The slot has been automatically reopened as AVAILABLE.",
                    notification_type="PTM_SLOT_CANCELLED",
                    priority="HIGH",
                    action_url="/teacher?tab=parent_hub",
                    metadata_dict={
                        "slot_id": slot_id,
                        "student_id": prev_student_id,
                        "student_name": prev_student_name,
                        "class": prev_class,
                        "parent_name": prev_parent_name,
                        "slot_time": slot_time,
                        "cancellation_reason": cancellation_reason
                    }
                )
            except Exception as notif_err:
                print(f"Error dispatching PTM cancellation notification to teacher: {notif_err}")

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
            prev_student_name = slot.get("booked_student_name") or "Student"
            prev_student_id = slot.get("booked_student_id")
            prev_class = slot.get("booked_class") or "Class 8-B"
            prev_parent_name = slot.get("booked_parent_name") or "Parent"
            prev_teacher_id = slot.get("teacher_id")
            prev_subject = slot.get("subject_name")
            slot_time = f"{slot.get('start_time')} - {slot.get('end_time')}"
            cancellation_reason = req.cancellation_reason or "Parent-Initiated Cancellation"

            slot["status"] = "AVAILABLE"
            slot["cancellation_reason"] = cancellation_reason
            slot["cancelled_by"] = "PARENT"
            slot["cancelled_at"] = datetime.datetime.utcnow().isoformat() + "Z"
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

            try:
                teacher_uid = await _resolve_teacher_user_id(prev_teacher_id, prev_subject, db)
                await create_system_notification(
                    db=db,
                    sender_name=prev_parent_name,
                    sender_role="parent",
                    recipient_user_id=teacher_uid,
                    recipient_role="teacher",
                    title=f"PTM Slot Cancelled: {prev_student_name} ({prev_class})",
                    message=f"{prev_parent_name} has cancelled their PTM slot on 24 Oct ({slot_time}) for {prev_student_name}. Reason: {cancellation_reason}. Slot has been reopened.",
                    notification_type="PTM_SLOT_CANCELLED",
                    priority="HIGH",
                    action_url="/teacher?tab=parent_hub",
                    metadata_dict={"slot_id": slot_id, "student_name": prev_student_name, "reason": cancellation_reason}
                )
            except Exception:
                pass

            return {
                "success": True,
                "message": "Your PTM booking has been cancelled and reopened.",
                "slot": slot
            }
    raise HTTPException(status_code=404, detail="PTM slot not found")

@router.get("/notes", response_model=list[ParentTeacherNoteResponse])
@router.get("/notes/{student_id}", response_model=list[ParentTeacherNoteResponse])
async def get_parent_student_notes(student_id: Optional[int] = 1, db: AsyncSession = Depends(get_db)):
    target_student_id = student_id or 1
    await _ensure_parent_notes_seeded(db)
    try:
        stmt = select(ParentTeacherNote).where(ParentTeacherNote.student_id == target_student_id).order_by(ParentTeacherNote.recorded_at.desc())
        res = await db.execute(stmt)
        notes = res.scalars().all()
        if notes:
            return [_ptn_to_dict(n) for n in notes]
    except Exception as e:
        print(f"Error querying ParentTeacherNote in parent: {e}")
    return [n for n in _parent_teacher_notes if n["student_id"] == target_student_id]

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

    # Dispatch in-app notification to the targeted teacher
    try:
        teacher_ref = req.teacher_id or req.teacher_name or req.homeroom_teacher_id
        target_teacher_uid = await _resolve_teacher_user_id(teacher_ref, req.subject_name, db)
        note_type_label = req.note_type.replace('_', ' ').title() if req.note_type else "Intervention Note"
        priority_level = "HIGH" if req.is_focus_table_evidence else "NORMAL"
        evidence_prefix = f"[{req.focus_concept_tag}] " if req.focus_concept_tag else ""

        await create_system_notification(
            db=db,
            sender_name=req.parent_name or "Parent",
            sender_role="parent",
            recipient_user_id=target_teacher_uid,
            recipient_role="teacher",
            title=f"New Parent Note: {req.student_name} ({req.student_class or 'Class 8-B'})",
            message=f"{req.parent_name} posted a {note_type_label}: \"{evidence_prefix}{req.content[:140]}\"",
            notification_type="PARENT_NOTE",
            priority=priority_level,
            action_url="/teacher?tab=parent_hub",
            metadata_dict={
                "note_id": note_id,
                "student_id": req.student_id,
                "student_name": req.student_name,
                "note_type": req.note_type,
                "is_focus_table_evidence": req.is_focus_table_evidence
            }
        )
    except Exception as notif_err:
        print(f"Error dispatching parent note notification: {notif_err}")

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

    # Notify specific teacher
    try:
        teacher_uid = await _resolve_teacher_user_id(req.receiver_name, None, db)
        await create_system_notification(
            db=db,
            recipient_user_id=teacher_uid,
            recipient_role="teacher",
            sender_name=req.sender_name,
            sender_role="parent",
            title=f"New Message from {req.sender_name}",
            message=f"Parent of {student_name}: {req.message_text[:80]}...",
            notification_type="PARENT_CHAT",
            priority="NORMAL",
            action_url=f"/teacher?tab=parent_chat&studentId={req.student_id}"
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

# =========================================================================
# 30-DAY TC UNDERTAKING PARENT SUBMISSION GATEWAY
# =========================================================================

class ParentTcSubmitRequest(BaseModel):
    previous_school_name: Optional[str] = "St. Xavier High School"
    tc_serial_number: Optional[str] = None
    file_name: Optional[str] = None
    remarks: Optional[str] = None

@router.post("/students/{student_id}/tc-submit")
async def submit_parent_tc(
    student_id: int,
    req: ParentTcSubmitRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Parent submits pending Transfer Certificate (TC) scan under the 30-day provisional undertaking.
    Sets status to 'Pending Verification' awaiting physical original verification by school registrar.
    """
    st_res = await db.execute(select(Student).where(Student.id == student_id))
    student = st_res.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    doc_slug = student.name.lower().replace(" ", "_")
    doc_res = await db.execute(
        select(OfficialDocument).where(
            OfficialDocument.student_id == student_id,
            OfficialDocument.doc_type == "Transfer Certificate"
        )
    )
    existing_tc = doc_res.scalars().first()
    
    file_name = req.file_name or f"tc_submission_{doc_slug}.pdf"
    file_url = f"/documents/{file_name}"
    serial_info = f" (TC Ref: {req.tc_serial_number})" if req.tc_serial_number else ""
    stamp = f"Parent Submission{serial_info} - Awaiting School Registrar Physical Verification"

    if existing_tc:
        existing_tc.title = f"Transfer Certificate (Submitted by Parent - Pending Verification) - {student.name}"
        existing_tc.status = "Pending Verification"
        existing_tc.is_official = True
        existing_tc.uploaded_by_role = "parent"
        existing_tc.upload_date = datetime.datetime.utcnow()
        existing_tc.file_url = file_url
        existing_tc.verified_stamp = stamp
        target_doc = existing_tc
    else:
        target_doc = OfficialDocument(
            student_id=student.id,
            title=f"Transfer Certificate (Submitted by Parent - Pending Verification) - {student.name}",
            doc_type="Transfer Certificate",
            file_url=file_url,
            is_official=True,
            uploaded_by_role="parent",
            upload_date=datetime.datetime.utcnow(),
            status="Pending Verification",
            verified_stamp=stamp
        )
        db.add(target_doc)

    # 1. Statutory Security Audit Log
    audit_rec = SecurityAuditLog(
        actor_name=student.guardian_name or "Parent",
        actor_role="PARENT",
        action_type="PARENT_TC_SUBMISSION",
        target_entity=f"Student #{student.id} - {student.name} (TC Submission)",
        ip_address="127.0.0.1",
        status="VERIFIED",
        details=f"Parent submitted pending TC for {student.name}. Prev School: {req.previous_school_name or 'N/A'}, TC Serial: {req.tc_serial_number or 'N/A'}. Verification requested."
    )
    db.add(audit_rec)

    # 2. Notify Central Administration
    try:
        await create_system_notification(
            db=db,
            sender_name=student.guardian_name or "Parent",
            sender_role="PARENT",
            title=f"Transfer Certificate Submitted: {student.name}",
            message=f"Parent of {student.name} ({student.class_name}) has uploaded the Transfer Certificate{serial_info} from {req.previous_school_name or 'previous school'}. Please verify against physical original and affix official seal.",
            notification_type="TC_SUBMISSION_ALERT",
            priority="HIGH",
            recipient_role="ADMIN",
            action_url=f"/admin?tab=sis&student_id={student.id}",
            metadata_dict={"student_id": student.id, "tc_serial": req.tc_serial_number}
        )
    except Exception as e:
        print(f"Warning: could not dispatch admin TC notification: {e}")

    await db.commit()
    await db.refresh(target_doc)
    return {
        "success": True,
        "message": f"Transfer Certificate for {student.name} submitted successfully. School Registrar will verify against physical original.",
        "document": {
            "id": target_doc.id,
            "student_id": target_doc.student_id,
            "title": target_doc.title,
            "doc_type": target_doc.doc_type,
            "status": target_doc.status,
            "file_url": target_doc.file_url,
            "verified_stamp": target_doc.verified_stamp,
            "uploaded_by_role": target_doc.uploaded_by_role
        }
    }
