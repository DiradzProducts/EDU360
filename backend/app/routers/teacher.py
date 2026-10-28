import datetime
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.models.models import (
    LiveClass, AttendanceRecord, Student, Homework, HomeworkSubmission,
    FocusTable, LeaveRequest
)
from app.schemas.schemas import (
    LiveClassResponse, AttendanceRecordResponse, AttendanceJoinSimulate, AttendanceOverride,
    HomeworkResponse, HomeworkSubmissionResponse, HomeworkSubmissionGrade, HomeworkCreate,
    FocusTableResponse, FocusTableUpdate, BacklogEventResponse,
    LeaveRequestResponse, LeaveRequestReview,
    TeacherPersonalScheduleResponse, FacultyDutyTaskResponse, 
    UpdateDutyPaperCountRequest, ToggleDutyChecklistRequest,
    ParentTeacherNoteCreate, ParentTeacherNoteResponse,
    PTMEventConfigResponse, PTMSlotResponse, PTMSlotBookRequest
)
from app.services.ai_analytics import evaluate_attendance_rule
from app.routers.notifications import create_system_notification

router = APIRouter(prefix="/api/teacher", tags=["teacher"])

# --- 1. Live Class & 10-Minute Auto-Attendance Rule ---
@router.get("/live-classes", response_model=list[LiveClassResponse])
async def get_teacher_classes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LiveClass).order_by(LiveClass.id.asc()))
    return result.scalars().all()

@router.post("/live-classes/{class_id}/start", response_model=LiveClassResponse)
async def start_live_class(class_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LiveClass).where(LiveClass.id == class_id))
    cls = result.scalars().first()
    if not cls:
        raise HTTPException(status_code=404, detail="Live class not found")
    cls.status = "live"
    cls.started_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(cls)
    return cls

@router.get("/live-classes/{class_id}/attendance", response_model=list[AttendanceRecordResponse])
async def get_class_attendance(class_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AttendanceRecord).where(AttendanceRecord.class_id == class_id))
    return result.scalars().all()

@router.post("/live-classes/{class_id}/simulate-join")
async def simulate_student_join(class_id: int, req: AttendanceJoinSimulate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AttendanceRecord).where(
            AttendanceRecord.class_id == class_id,
            AttendanceRecord.student_id == req.student_id
        )
    )
    record = result.scalars().first()
    if not record:
        # Check if student exists
        s_res = await db.execute(select(Student).where(Student.id == req.student_id))
        st = s_res.scalars().first()
        student_name = st.name if st else f"Student #{req.student_id}"
        record = AttendanceRecord(
            class_id=class_id,
            student_id=req.student_id,
            student_name=student_name,
            date=datetime.date.today().isoformat()
        )
        db.add(record)
    
    status, rationale = evaluate_attendance_rule(req.minutes_elapsed)
    record.minutes_late = req.minutes_elapsed
    record.status = status
    record.join_timestamp = f"+{req.minutes_elapsed:.1f}m ({datetime.datetime.utcnow().strftime('%H:%M:%S')})"
    record.teacher_override = False
    
    await db.commit()
    await db.refresh(record)

    # 🔔 Dispatch In-App Notification if student is late or absent
    if status in ["Late", "Absent"]:
        try:
            await create_system_notification(
                db=db,
                recipient_user_id=2,  # Teacher
                recipient_role="teacher",
                sender_name="Live Attendance Engine",
                sender_role="system",
                title=f"Live Class {status}: {record.student_name}",
                message=f"{record.student_name} joined +{req.minutes_elapsed:.1f}m into session ({rationale}). 1-click teacher review pending.",
                notification_type="LATE_JOIN_APPROVAL",
                priority="URGENT" if status == "Late" else "NORMAL",
                action_url=f"/teacher/live-class/{class_id}?tab=attendance",
                metadata_dict={"student_id": req.student_id, "minutes_late": req.minutes_elapsed, "status": status}
            )
        except Exception as e:
            print(f"Failed to dispatch attendance notification: {e}")

    return {
        "success": True,
        "record": record,
        "rationale": rationale,
        "rule_triggered": "10-Minute Auto-Attendance Engine"
    }

@router.post("/live-classes/{class_id}/attendance/{record_id}/override", response_model=AttendanceRecordResponse)
async def override_attendance_record(class_id: int, record_id: int, req: AttendanceOverride, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AttendanceRecord).where(AttendanceRecord.id == record_id))
    record = result.scalars().first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    record.status = req.status
    record.teacher_override = True
    await db.commit()
    await db.refresh(record)
    return record

# --- 2. Inline Homework Grading Canvas ---
@router.get("/homework", response_model=list[HomeworkResponse])
async def list_teacher_homework(task_type: str = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Homework)
    if task_type:
        stmt = stmt.where(Homework.task_type == task_type)
    result = await db.execute(stmt.order_by(Homework.id.desc()))
    return result.scalars().all()

@router.post("/homework", response_model=HomeworkResponse)
async def create_teacher_homework(req: HomeworkCreate, db: AsyncSession = Depends(get_db)):
    new_hw = Homework(
        title=req.title,
        subject=req.subject,
        class_name=req.class_name,
        description=req.description,
        task_type=req.task_type,
        due_date=req.due_date,
        due_time=req.due_time,
        status="PENDING",
        assigned_date=datetime.date.today().isoformat(),
        teacher_id=req.teacher_id,
        teacher_name=req.teacher_name,
        max_marks=req.max_marks,
        resource_url=req.resource_url,
        weightage=req.weightage,
        progress_pct=req.progress_pct or 0.0
    )
    db.add(new_hw)
    await db.commit()
    await db.refresh(new_hw)
    return new_hw

@router.get("/homework/{homework_id}/submissions", response_model=list[HomeworkSubmissionResponse])
async def get_homework_submissions(homework_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomeworkSubmission).where(HomeworkSubmission.homework_id == homework_id))
    return result.scalars().all()

@router.get("/submissions/{submission_id}", response_model=HomeworkSubmissionResponse)
async def get_single_submission(submission_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomeworkSubmission).where(HomeworkSubmission.id == submission_id))
    sub = result.scalars().first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub

@router.post("/submissions/{submission_id}/grade", response_model=HomeworkSubmissionResponse)
async def grade_homework_inline(submission_id: int, req: HomeworkSubmissionGrade, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomeworkSubmission).where(HomeworkSubmission.id == submission_id))
    sub = result.scalars().first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    sub.marks_obtained = req.marks_obtained
    sub.teacher_remarks = req.teacher_remarks
    sub.annotations_json = req.annotations_json
    sub.annotated_file_url = req.annotated_file_url or sub.original_file_url
    sub.status = "graded"
    sub.graded_at = datetime.datetime.utcnow()
    
    await db.commit()
    await db.refresh(sub)
    return sub

# --- 3. Per-Student "Focus Table" ---
@router.get("/focus-table", response_model=list[FocusTableResponse])
async def get_focus_tables(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FocusTable).order_by(FocusTable.updated_at.desc()))
    return result.scalars().all()

@router.get("/focus-table/{student_id}", response_model=FocusTableResponse)
async def get_student_focus_table(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FocusTable).where(FocusTable.student_id == student_id))
    ft = result.scalars().first()
    if not ft:
        raise HTTPException(status_code=404, detail="No Focus Table found for student")
    return ft

@router.patch("/focus-table/{table_id}", response_model=FocusTableResponse)
async def update_focus_table(table_id: int, req: FocusTableUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FocusTable).where(FocusTable.id == table_id))
    ft = result.scalars().first()
    if not ft:
        raise HTTPException(status_code=404, detail="Focus Table not found")
    if req.status:
        ft.status = req.status
    if req.teacher_action:
        ft.teacher_action = req.teacher_action
    if req.parent_check_completed is not None:
        ft.parent_check_completed = req.parent_check_completed
    ft.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(ft)
    return ft

# --- 4. Parent Connection Hub & Leave Approvals ---
@router.get("/leave-requests", response_model=list[LeaveRequestResponse])
async def list_leave_requests(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaveRequest).order_by(LeaveRequest.applied_at.desc()))
    return result.scalars().all()

@router.post("/leave-requests/{request_id}/review", response_model=LeaveRequestResponse)
async def review_leave_request(request_id: int, req: LeaveRequestReview, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == request_id))
    lr = result.scalars().first()
    if not lr:
        raise HTTPException(status_code=404, detail="Leave request not found")
    lr.status = req.status
    if req.teacher_notes:
        lr.teacher_notes = req.teacher_notes
    await db.commit()
    await db.refresh(lr)
    return lr

@router.get("/parent-context/{student_id}")
async def get_parent_chat_context(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).where(Student.id == student_id))
    st = result.scalars().first()
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")
    return {
        "student_name": st.name,
        "class_name": f"{st.class_name}-{st.section}",
        "attendance_pct": st.attendance_pct,
        "academic_average_pct": st.academic_average_pct,
        "parent_name": st.guardian_name,
        "parent_phone": st.guardian_phone,
        "parent_email": st.guardian_email,
        "fee_status": "Up to Date (Milestone 2 Pending)",
        "recent_grades": [
            {"subject": "Mathematics", "score": "52%", "alert": "In Focus Table"},
            {"subject": "Physics", "score": "78%", "alert": "Normal"},
            {"subject": "English Literature", "score": "88%", "alert": "Excellent"}
        ]
    }

# --- 5. Student Roster (Class 8B & 9A) ---
@router.get("/students")
async def list_teacher_students(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student))
    students = result.scalars().all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "roll_no": s.roll_no,
            "class_name": f"{s.class_name}-{s.section}",
            "attendance_pct": s.attendance_pct,
            "academic_average_pct": s.academic_average_pct,
            "guardian_name": s.guardian_name,
            "guardian_phone": s.guardian_phone,
            "has_focus_table": s.id == 1,
            "homework_status": "Submitted" if s.id != 3 else "Pending",
            "last_active": "Today, 10:15 AM"
        }
        for s in students
    ]

# --- 6. Weekly Class Timetable & Schedule ---
_teacher_schedule = [
    {"period": 1, "time": "08:30 - 09:15", "subject": "Mathematics", "class_name": "Class 8-B", "room": "Room 204", "status": "Completed"},
    {"period": 2, "time": "09:20 - 10:05", "subject": "Quadratic Equations (Live)", "class_name": "Class 8-B", "room": "Virtual Studio A", "status": "Live Now", "is_live": True},
    {"period": 3, "time": "10:15 - 11:00", "subject": "Math Remedial / Focus", "class_name": "Zero Period (8-B)", "room": "Math Lab", "status": "Upcoming"},
    {"period": 4, "time": "11:15 - 12:00", "subject": "Coordinate Geometry", "class_name": "Class 9-A", "room": "Room 302", "status": "Upcoming"},
    {"period": 5, "time": "12:45 - 01:30", "subject": "Calculus Foundations", "class_name": "Class 10-C", "room": "Room 401", "status": "Upcoming"},
    {"period": 6, "time": "01:35 - 02:20", "subject": "Annual Day Rehearsal", "class_name": "Auditorium", "room": "Stage Area", "status": "Upcoming"}
]

@router.get("/schedule")
async def get_teacher_schedule():
    return _teacher_schedule

# --- 7. Institutional Duties & Annual Day ---
_teacher_duties = [
    {
        "id": 1,
        "event_title": "Annual Cultural Day 2026 (Navarasa)",
        "role": "Stage & Lighting Committee Lead",
        "date": "14 Nov 2026",
        "venue": "Main School Auditorium",
        "student_volunteers": ["Meera Nambiar (7C)", "Rohan Deshmukh (9B)"],
        "assigned_by": "Dr. Sunita Kapoor (Principal)",
        "progress_pct": 75,
        "key_deliverables": "Coordinate with Horizon AV Tech for P3.9 LED Backdrop and sound checks by 10 Nov."
    },
    {
        "id": 2,
        "event_title": "Inter-School Mathematics Olympiad",
        "role": "Evaluation Jury & Question Moderator",
        "date": "28 Nov 2026",
        "venue": "Academic Block A",
        "student_volunteers": ["Aarav Sharma (8B)"],
        "assigned_by": "Vice Principal Academics",
        "progress_pct": 40,
        "key_deliverables": "Finalize 25 Rapid Mental Math & Geometry Problem Sets."
    }
]

@router.get("/duties")
async def get_teacher_duties():
    return _teacher_duties

# --- 8. Teacher Leave & Short-Permission Self Service ---
_my_permissions = [
    {
        "id": 1,
        "teacher_name": "Mrs. Ananya Verma",
        "type": "Short Permission (1.5 hrs)",
        "reason": "Family medical appointment at Apollo Clinic.",
        "status": "Pending",
        "date": "Today, 11:30 AM - 01:00 PM",
        "applied_at": "Today, 08:15 AM"
    },
    {
        "id": 4,
        "teacher_name": "Mrs. Ananya Verma",
        "type": "Casual Leave (1 Day)",
        "reason": "Personal family celebration out of station.",
        "status": "Approved",
        "date": "02 Oct 2026",
        "applied_at": "28 Sep 2026"
    }
]

@router.get("/my-permissions")
async def get_my_permissions():
    return _my_permissions

@router.post("/apply-permission")
async def apply_teacher_permission(req: dict, db: AsyncSession = Depends(get_db)):
    new_perm = {
        "id": len(_my_permissions) + 10,
        "teacher_name": req.get("teacher_name", "Mrs. Ananya Verma"),
        "type": req.get("type", "Short Permission (1 hr)"),
        "reason": req.get("reason", "Personal errand"),
        "status": "Pending",
        "date": req.get("date", "Tomorrow"),
        "shift": req.get("shift", "Morning Shift (08:30 AM - 12:30 PM)"),
        "affected_periods": req.get("affected_periods", "Period 2 & Period 4"),
        "suggested_substitute": req.get("suggested_substitute", "Mrs. Neha Roy (TGT Science)"),
        "applied_at": datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
    }
    _my_permissions.insert(0, new_perm)

    # Cross-Role Interlock: push directly into Admin permissions queue
    try:
        from app.routers.admin import _teacher_permissions
        _teacher_permissions.insert(0, {
            "id": new_perm["id"],
            "teacher_name": new_perm["teacher_name"],
            "type": new_perm["type"],
            "reason": new_perm["reason"],
            "status": "Pending",
            "date": new_perm["date"],
            "shift": new_perm["shift"],
            "affected_periods": new_perm["affected_periods"],
            "suggested_substitute": new_perm["suggested_substitute"]
        })
    except Exception as ex:
        print("Admin permissions queue sync warning:", ex)

    # Persist in SQLite staff_permissions table
    try:
        from app.models.models import StaffPermission
        perm_record = StaffPermission(
            staff_id=1,
            staff_name=new_perm["teacher_name"],
            role="Teacher",
            permission_type=new_perm["type"],
            from_date=new_perm["date"],
            to_date=new_perm["date"],
            affected_periods="Period 3 (Class 8-B)",
            reason=new_perm["reason"],
            status="Pending"
        )
        db.add(perm_record)
        await db.commit()
    except Exception as ex:
        print("StaffPermission DB persist warning:", ex)

    return {"success": True, "permission": new_perm}

# --- 9. Teacher-Centric Chronological Personal Schedule ---
_personal_schedule = [
    {
        "id": "sched-1",
        "period_number": 1,
        "start_time": "08:30 AM",
        "end_time": "09:15 AM",
        "day_of_week": "Friday",
        "activity_type": "TEACHING_SESSION",
        "class_grade": "Grade 8",
        "section": "B",
        "subject_name": "Mathematics",
        "room_number": "Room 204",
        "is_current_active_period": False,
        "notes": "Chapter 4 Quadratic Equations test review & homework check"
    },
    {
        "id": "sched-2",
        "period_number": 2,
        "start_time": "09:20 AM",
        "end_time": "10:05 AM",
        "day_of_week": "Friday",
        "activity_type": "TEACHING_SESSION",
        "class_grade": "Grade 8",
        "section": "B",
        "subject_name": "Mathematics (Live Studio)",
        "room_number": "Virtual Studio A",
        "is_current_active_period": True,
        "notes": "Live streamed quadratic formula derivation with interactive chat"
    },
    {
        "id": "sched-3",
        "period_number": 3,
        "start_time": "10:15 AM",
        "end_time": "11:00 AM",
        "day_of_week": "Friday",
        "activity_type": "FREE_PREP_PERIOD",
        "class_grade": None,
        "section": None,
        "subject_name": None,
        "room_number": "Math Dept Staffroom",
        "is_current_active_period": False,
        "notes": "Grade 8 Unit Test 2 Focus Table remediation plans & answer script prep"
    },
    {
        "id": "sched-4",
        "period_number": 4,
        "start_time": "11:15 AM",
        "end_time": "12:00 PM",
        "day_of_week": "Friday",
        "activity_type": "SUBSTITUTION_COVER",
        "class_grade": "Grade 7",
        "section": "C",
        "subject_name": "General Science (Proxy)",
        "room_number": "Room 108",
        "is_current_active_period": False,
        "notes": "Covering for Mr. Rajesh Sharma (Medical Leave). Exercise 4.2 revision."
    },
    {
        "id": "sched-5",
        "period_number": 5,
        "start_time": "12:45 PM",
        "end_time": "01:30 PM",
        "day_of_week": "Friday",
        "activity_type": "LAB_SESSION",
        "class_grade": "Grade 9",
        "section": "A",
        "subject_name": "Coordinate Geometry Lab",
        "room_number": "Computing Lab 2",
        "is_current_active_period": False,
        "notes": "GeoGebra distance formula & collinearity hands-on practicals"
    },
    {
        "id": "sched-6",
        "period_number": 6,
        "start_time": "01:35 PM",
        "end_time": "02:20 PM",
        "day_of_week": "Friday",
        "activity_type": "EXAM_INVIGILATION",
        "class_grade": "Grade 10",
        "section": "All",
        "subject_name": "Board Mock Invigilation",
        "room_number": "Examination Hall B (Seats 45-90)",
        "is_current_active_period": False,
        "notes": "CBSE mock test supervisor duty. Collect all OMR sheets at 02:20 PM."
    },
    {
        "id": "sched-7",
        "period_number": 7,
        "start_time": "02:25 PM",
        "end_time": "03:10 PM",
        "day_of_week": "Friday",
        "activity_type": "TEACHING_SESSION",
        "class_grade": "Grade 10",
        "section": "C",
        "subject_name": "Calculus Foundations",
        "room_number": "Room 401",
        "is_current_active_period": False,
        "notes": "Introduction to Limits and Differential Rate of Change"
    }
]

@router.get("/personal-schedule", response_model=list[TeacherPersonalScheduleResponse])
async def get_teacher_personal_schedule(day_of_week: str = "Friday"):
    return [s for s in _personal_schedule if s["day_of_week"].lower() == day_of_week.lower()] or _personal_schedule

# --- 10. Consolidated Faculty Duties & Task Center ---
_faculty_duty_tasks = [
    {
        "id": "duty-1",
        "teacher_id": "ananya",
        "category": "EXAM_INVIGILATION",
        "title": "Term 1 Class 10 Board Mock Invigilation",
        "sub_category": "Main Examination Hall Duty",
        "event_or_exam_name": "Midterm Exams 2026",
        "scheduled_date": "16 Oct 2026",
        "time_window": "09:30 AM - 12:30 PM",
        "location_or_venue": "Examination Hall B (Seats 45-90)",
        "status": "IN_PROGRESS",
        "priority": "CRITICAL",
        "papers_assigned": None,
        "papers_completed": None,
        "submission_deadline": None,
        "assigned_by": "Vice Principal Academics",
        "is_weekly": False,
        "day_of_week": "Friday",
        "frequency": "ONE_TIME",
        "action_checklist": [
            {"item": "Collect sealed question packets from Strong Room by 09:10 AM", "completed": True},
            {"item": "Verify student admit cards and photo ID barcodes", "completed": True},
            {"item": "Distribute OMR supplementary answer booklets", "completed": False},
            {"item": "Hand over signed attendance register to Chief Examiner", "completed": False}
        ]
    },
    {
        "id": "duty-3",
        "teacher_id": "ananya",
        "category": "EVENT_COMMITTEE",
        "title": "Annual Cultural Day 2026 (Navarasa) - Stage & AV Tech Lead",
        "sub_category": "Cultural Committee",
        "event_or_exam_name": "Annual Day 2026",
        "scheduled_date": "24 Oct 2026",
        "time_window": "03:00 PM - 06:00 PM",
        "location_or_venue": "Main School Auditorium",
        "status": "IN_PROGRESS",
        "priority": "NORMAL",
        "papers_assigned": None,
        "papers_completed": None,
        "submission_deadline": None,
        "assigned_by": "Dr. Sunita Kapoor (Principal)",
        "is_weekly": False,
        "day_of_week": "Saturday",
        "frequency": "ONE_TIME",
        "action_checklist": [
            {"item": "Coordinate with Horizon AV Tech for P3.9 LED Backdrop and sound checks", "completed": True},
            {"item": "Review stage lighting transitions for Classical Dance sequence", "completed": True},
            {"item": "Assign student green room escorts (Meera Nambiar & Rohan)", "completed": False},
            {"item": "Final technical run-through with Chief Guest protocol team", "completed": False}
        ]
    },
    {
        "id": "duty-4",
        "teacher_id": "ananya",
        "category": "CAMPUS_SUBSTITUTION",
        "title": "Period 4 Emergency Proxy Coverage (Class 7-C Science)",
        "sub_category": "Peer Substitution",
        "event_or_exam_name": "Daily Operations",
        "scheduled_date": "Today, 16 Oct 2026",
        "time_window": "11:15 AM - 12:00 PM",
        "location_or_venue": "Room 108",
        "status": "PENDING",
        "priority": "NORMAL",
        "papers_assigned": None,
        "papers_completed": None,
        "submission_deadline": None,
        "assigned_by": "Admin Office (Timetable Proxy Matrix)",
        "is_weekly": False,
        "day_of_week": "Friday",
        "frequency": "DAILY",
        "action_checklist": [
            {"item": "Report to classroom promptly at 11:15 bell", "completed": False},
            {"item": "Supervise Exercise 4.2 revision questions from textbook page 78", "completed": False}
        ]
    },
    {
        "id": "duty-5",
        "teacher_id": "ananya",
        "category": "WEEKLY_ROUTINE",
        "title": "Weekly Focus Table Remedial Audit & Parent Sign-Off",
        "sub_category": "Weekly Academic Intervention Loop",
        "event_or_exam_name": "Weekly Focus Table Review Cycle",
        "scheduled_date": "Every Friday (Weekly Cadence)",
        "time_window": "03:15 PM - 04:00 PM",
        "location_or_venue": "Faculty Desk 12 / Student Focus Hub",
        "status": "IN_PROGRESS",
        "priority": "CRITICAL",
        "papers_assigned": None,
        "papers_completed": None,
        "submission_deadline": None,
        "assigned_by": "Academic Dean & Homeroom Lead",
        "is_weekly": True,
        "day_of_week": "Friday",
        "frequency": "WEEKLY",
        "action_checklist": [
            {"item": "Audit weekly mastery score delta for 4 assigned Focus Table students", "completed": True},
            {"item": "Dispatch targeted parent advisory notes with concept tag [Algebraic Fractions]", "completed": True},
            {"item": "Log zero-period remedial attendance in SIS Backlog Engine", "completed": False},
            {"item": "Submit weekly intervention sign-off to Academic Dean by 04:30 PM", "completed": False}
        ]
    },
    {
        "id": "duty-6",
        "teacher_id": "ananya",
        "category": "WEEKLY_ROUTINE",
        "title": "Weekly Unit Lesson Plan & Question Bank Submission",
        "sub_category": "Curriculum & Academic QA",
        "event_or_exam_name": "Weekly Lesson Plan Governance",
        "scheduled_date": "Every Monday (Weekly Routine)",
        "time_window": "By 09:00 AM (Weekly)",
        "location_or_venue": "Academic ERP Curriculum Portal",
        "status": "PENDING",
        "priority": "NORMAL",
        "papers_assigned": None,
        "papers_completed": None,
        "submission_deadline": None,
        "assigned_by": "HOD Mathematics",
        "is_weekly": True,
        "day_of_week": "Monday",
        "frequency": "WEEKLY",
        "action_checklist": [
            {"item": "Upload Class 10 Calculus Chapter 5 lecture slides & activity worksheets", "completed": False},
            {"item": "Contribute 15 Higher Order Thinking (HOTS) questions to Central Bank", "completed": False},
            {"item": "Obtain digital HOD approval sign-off for next week's labs", "completed": False}
        ]
    },
    {
        "id": "duty-7",
        "teacher_id": "ananya",
        "category": "WEEKLY_ROUTINE",
        "title": "Weekly Science & Mathematics Department Sync",
        "sub_category": "Inter-Departmental Curriculum Sync",
        "event_or_exam_name": "Weekly Academic Alignment",
        "scheduled_date": "Every Wednesday (Weekly Routine)",
        "time_window": "03:30 PM - 04:15 PM",
        "location_or_venue": "Staff Conference Room 2",
        "status": "COMPLETED",
        "priority": "NORMAL",
        "papers_assigned": None,
        "papers_completed": None,
        "submission_deadline": None,
        "assigned_by": "Principal Dr. Sunita Kapoor",
        "is_weekly": True,
        "day_of_week": "Wednesday",
        "frequency": "WEEKLY",
        "action_checklist": [
            {"item": "Review cross-disciplinary STEM physics-calculus integration milestones", "completed": True},
            {"item": "Align midterm assessment windows to prevent multiple exams on single days", "completed": True},
            {"item": "Sign off department meeting minutes in faculty portal", "completed": True}
        ]
    }
]

@router.get("/duty-tasks", response_model=list[FacultyDutyTaskResponse])
async def get_faculty_duty_tasks(category: str = None):
    if category and category != "ALL":
        return [d for d in _faculty_duty_tasks if d["category"] == category]
    return _faculty_duty_tasks

@router.post("/duty-tasks/{task_id}/update-papers")
async def update_duty_papers(task_id: str, req: UpdateDutyPaperCountRequest):
    for task in _faculty_duty_tasks:
        if task["id"] == task_id:
            task["papers_completed"] = req.papers_completed
            if task["papers_assigned"] and task["papers_completed"] >= task["papers_assigned"]:
                task["status"] = "COMPLETED"
            return {"success": True, "task": task}
    raise HTTPException(status_code=404, detail="Duty task not found")

@router.post("/duty-tasks/{task_id}/toggle-checklist")
async def toggle_duty_checklist(task_id: str, req: ToggleDutyChecklistRequest):
    for task in _faculty_duty_tasks:
        if task["id"] == task_id and task.get("action_checklist"):
            if 0 <= req.item_index < len(task["action_checklist"]):
                task["action_checklist"][req.item_index]["completed"] = req.completed
                all_done = all(item["completed"] for item in task["action_checklist"])
                if all_done:
                    task["status"] = "COMPLETED"
                return {"success": True, "task": task}
    raise HTTPException(status_code=404, detail="Duty checklist item not found")

# --- 11. Dual-Mode Parental Connection Notes & Focus Table Sync ---
_parent_teacher_notes = [
    {
        "id": "note-1",
        "interaction_scope": "HOMEROOM_CLASS",
        "student_id": 1,
        "student_name": "Aarav Sharma",
        "student_class": "8-B",
        "parent_id": "rajesh_sharma",
        "parent_name": "Mr. Rajesh Sharma",
        "parent_phone": "+91 98450 12345",
        "teacher_id": "ananya",
        "teacher_name": "Mrs. Ananya Verma",
        "subject_id": None,
        "subject_name": None,
        "homeroom_teacher_id": "ananya",
        "note_type": "BEHAVIORAL",
        "content": "Aarav demonstrated exemplary sportsmanship during inter-house athletics trials. Please ensure hydration during morning practice.",
        "created_at": "14 Oct 2026, 04:30 PM",
        "is_focus_table_evidence": False,
        "focus_concept_tag": None
    },
    {
        "id": "note-2",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "student_id": 1,
        "student_name": "Aarav Sharma",
        "student_class": "8-B",
        "parent_id": "rajesh_sharma",
        "parent_name": "Mr. Rajesh Sharma",
        "parent_phone": "+91 98450 12345",
        "teacher_id": "ananya",
        "teacher_name": "Mrs. Ananya Verma",
        "subject_id": "math_8",
        "subject_name": "Mathematics",
        "homeroom_teacher_id": "ananya",
        "note_type": "ACADEMIC_CONCERN",
        "content": "Aarav made sign errors expanding negative roots in Worksheet #4 (Q4). Remedial review scheduled for Thursday zero period.",
        "created_at": "12 Oct 2026, 05:15 PM",
        "is_focus_table_evidence": True,
        "focus_concept_tag": "Quadratic Equations - Sign Rules"
    },
    {
        "id": "note-3",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "student_id": 2,
        "student_name": "Tanvi Deshmukh",
        "student_class": "8-B",
        "parent_id": "priya_deshmukh",
        "parent_name": "Mrs. Priya Deshmukh",
        "parent_phone": "+91 98450 67890",
        "teacher_id": "ananya",
        "teacher_name": "Mrs. Ananya Verma",
        "subject_id": "math_8",
        "subject_name": "Mathematics",
        "homeroom_teacher_id": "ananya",
        "note_type": "APPRECIATION",
        "content": "Tanvi scored 19/20 on quadratic factorization with outstanding algebraic proof clarity.",
        "created_at": "15 Oct 2026, 02:40 PM",
        "is_focus_table_evidence": False,
        "focus_concept_tag": None
    }
]

@router.get("/parent-notes", response_model=list[ParentTeacherNoteResponse])
async def get_parent_teacher_notes(scope: str = None):
    if scope and scope != "ALL":
        return [n for n in _parent_teacher_notes if n["interaction_scope"] == scope]
    return _parent_teacher_notes

@router.post("/parent-notes", response_model=ParentTeacherNoteResponse)
async def create_parent_teacher_note(req: ParentTeacherNoteCreate, db: AsyncSession = Depends(get_db)):
    note_id = f"note-{len(_parent_teacher_notes) + 101}"
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
        "created_at": datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p"),
        "is_focus_table_evidence": req.is_focus_table_evidence,
        "focus_concept_tag": req.focus_concept_tag
    }
    _parent_teacher_notes.insert(0, new_note)

    # Closed-loop sync: If marked as Focus Table evidence, sync to Focus Table DB!
    if req.is_focus_table_evidence:
        ft_res = await db.execute(select(FocusTable).where(FocusTable.student_id == req.student_id))
        ft = ft_res.scalars().first()
        if ft:
            ft.teacher_action = f"[Telemetry Evidence {new_note['created_at']}]: {req.content}"
            ft.updated_at = datetime.datetime.utcnow()
            await db.commit()

    return new_note

# --- 12. Strict 10-Minute Sliding PTM Scheduler Engine ---
_ptm_event_config = {
    "id": "ptm-conf-2026-term1",
    "title": "Post-Midterm Parent-Teacher Conference (AY 2026–27)",
    "event_date": "Saturday, 24 Oct 2026",
    "school_start_time": "09:00",
    "school_end_time": "15:30",
    "slot_duration_mins": 10,
    "buffer_mins": 2,
    "blackout_windows": [
        {"start": "11:00", "end": "11:15", "title": "Faculty Morning Tea Break"},
        {"start": "13:00", "end": "13:45", "title": "Faculty Lunch Break"}
    ]
}

_ptm_slots = [
    {
        "id": "slot-01",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "09:00 AM",
        "end_time": "09:10 AM",
        "status": "BOOKED",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": 1,
        "booked_student_name": "Aarav Sharma",
        "booked_class": "8-B",
        "booked_parent_id": "rajesh_sharma",
        "booked_parent_name": "Mr. Rajesh Sharma",
        "subject_name": "Mathematics & Class 8-B Homeroom",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-aarav-8b",
        "focus_table_agenda": [
            "Review Mid-Term Exam (52%) Q7 & Q9 Sign Errors",
            "Worksheet #4 Backlog Evidence (#EVD-BKLOG-884)",
            "Day 3 Rough Notebook Parent Sign-off Inspection"
        ]
    },
    {
        "id": "slot-02",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "raman",
        "start_time": "09:12 AM",
        "end_time": "09:22 AM",
        "status": "BOOKED",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": 1,
        "booked_student_name": "Aarav Sharma",
        "booked_class": "8-B",
        "booked_parent_id": "rajesh_sharma",
        "booked_parent_name": "Mr. Rajesh Sharma",
        "subject_name": "Physics (Dr. K. Raman)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-aarav-physics",
        "focus_table_agenda": [
            "Optics Ray Tracing Lab Backlog (#EVD-BKLOG-902)",
            "Mid-Term Q3 Concave Mirror Focal Point Reflection Error"
        ]
    },
    {
        "id": "slot-03",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "09:24 AM",
        "end_time": "09:34 AM",
        "status": "BOOKED",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": 2,
        "booked_student_name": "Kabir Mehta",
        "booked_class": "8-B",
        "booked_parent_id": "rekha_mehta",
        "booked_parent_name": "Mrs. Rekha Mehta",
        "subject_name": "Mathematics",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-kabir-math",
        "focus_table_agenda": [
            "Review Exam Score 48% (Flagged Q3, Q5, Q8)",
            "Linear Inequalities Backlog (#EVD-BKLOG-715)",
            "Negative Division Sign Inversion Rule"
        ]
    },
    {
        "id": "slot-04",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "09:36 AM",
        "end_time": "09:56 AM",
        "status": "BOOKED",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": 1,
        "booked_student_name": "Aarav Sharma",
        "booked_class": "8-B",
        "booked_parent_id": "rajesh_sharma",
        "booked_parent_name": "Mr. Rajesh Sharma",
        "subject_name": "Class 8-B Homeroom & Junior Sibling Consultation",
        "is_sibling_combo": True,
        "sibling_student_id": 8,
        "sibling_student_name": "Aarav Kumar (Class 3-A Junior)",
        "meeting_url": "https://meet.google.com/edu-sharma-sibling-ptm",
        "focus_table_agenda": [
            "Aarav's 1-Week Remedial Pacing & Zero-period Support",
            "Aarav Junior's Phonics Reading Booster & Magic Chest Stars"
        ]
    },
    {
        "id": "slot-05",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "sen",
        "start_time": "10:00 AM",
        "end_time": "10:10 AM",
        "status": "BOOKED",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": 2,
        "booked_student_name": "Kabir Mehta",
        "booked_class": "8-B",
        "booked_parent_id": "rekha_mehta",
        "booked_parent_name": "Mrs. Rekha Mehta",
        "subject_name": "Chemistry (Mrs. S. Sen)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-kabir-chem",
        "focus_table_agenda": [
            "Redox Equations Balancing Practice Backlog (#EVD-BKLOG-716)",
            "Stoichiometric Balancing Deficit"
        ]
    },
    {
        "id": "slot-05b",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "sunitha",
        "start_time": "10:12 AM",
        "end_time": "10:22 AM",
        "status": "BOOKED",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": 4,
        "booked_student_name": "Siddharth Verma",
        "booked_class": "8-A",
        "booked_parent_id": "alok_verma",
        "booked_parent_name": "Mr. Alok Verma",
        "subject_name": "English Literature (Mrs. Sunitha Rao)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-siddharth-english",
        "focus_table_agenda": [
            "The Merchant of Venice Essay Backlog (#EVD-BKLOG-821)",
            "Act IV Scene 1 Textual Citations"
        ]
    },
    {
        "id": "slot-05c",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "10:24 AM",
        "end_time": "10:34 AM",
        "status": "BOOKED",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": 4,
        "booked_student_name": "Siddharth Verma",
        "booked_class": "8-A",
        "booked_parent_id": "alok_verma",
        "booked_parent_name": "Mr. Alok Verma",
        "subject_name": "Mathematics",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-siddharth-math",
        "focus_table_agenda": [
            "Arithmetic Progressions Common Difference Backlog (#EVD-BKLOG-820)",
            "Exam Score 44% Decreasing Sequence Diagnostic"
        ]
    },
    {
        "id": "slot-break-tea",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "11:00 AM",
        "end_time": "11:15 AM",
        "status": "BREAK",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Faculty Morning Tea Break",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": None,
        "focus_table_agenda": []
    },
    {
        "id": "slot-06",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "11:20 AM",
        "end_time": "11:30 AM",
        "status": "AVAILABLE",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": None,
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-06",
        "focus_table_agenda": []
    },
    {
        "id": "slot-break-lunch",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "01:00 PM",
        "end_time": "01:45 PM",
        "status": "BREAK",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Faculty Lunch Break",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": None,
        "focus_table_agenda": []
    },
    {
        "id": "slot-07",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "02:00 PM",
        "end_time": "02:10 PM",
        "status": "AVAILABLE",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Mathematics",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-07",
        "focus_table_agenda": []
    }
]

@router.get("/ptm/event-config", response_model=PTMEventConfigResponse)
@router.get("/ptm/config", response_model=PTMEventConfigResponse)
async def get_ptm_event_config():
    return _ptm_event_config

@router.get("/ptm/slots", response_model=list[PTMSlotResponse])
async def get_ptm_slots(scope: str = None):
    if scope and scope != "ALL":
        return [s for s in _ptm_slots if s["interaction_scope"] == scope or s["status"] == "BREAK"]
    return _ptm_slots

@router.post("/ptm/slots/{slot_id}/hold")
async def hold_ptm_slot(slot_id: str):
    for slot in _ptm_slots:
        if slot["id"] == slot_id:
            if slot["status"] != "AVAILABLE":
                raise HTTPException(status_code=400, detail="Slot is not available")
            slot["status"] = "HELD"
            return {"success": True, "message": "Slot held for 5 minutes", "slot": slot}
    raise HTTPException(status_code=404, detail="PTM slot not found")

@router.post("/ptm/slots/book", response_model=PTMSlotResponse)
async def book_ptm_slot(req: PTMSlotBookRequest, db: AsyncSession = Depends(get_db)):
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
            slot["meeting_url"] = f"https://meet.google.com/edu-ptm-{req.slot_id}-{req.booked_student_id}"

            # Closed-loop sync: If focus table agenda provided, log to Focus Table!
            if req.focus_table_agenda and req.booked_student_id:
                ft_res = await db.execute(select(FocusTable).where(FocusTable.student_id == req.booked_student_id))
                ft = ft_res.scalars().first()
                if ft:
                    agenda_str = ", ".join(req.focus_table_agenda)
                    ft.teacher_action = f"[PTM Agenda Booked for 24 Oct]: {agenda_str}"
                    ft.updated_at = datetime.datetime.utcnow()
                    await db.commit()

            return slot
    raise HTTPException(status_code=404, detail="PTM slot not found")

# --- 14. Teacher Curriculum Delivery & Timetable Proxy Sync ---
def inject_substitution_period(period_num: int, class_name: str, subject: str, absent_teacher: str, time_slot: str):
    for p in _personal_schedule:
        if p["period_number"] == period_num:
            p["activity_type"] = "SUBSTITUTION_COVER"
            p["class_grade"] = class_name
            p["subject_name"] = f"{subject} (Proxy Cover)"
            p["notes"] = f"Covering for absent faculty {absent_teacher} (Leave Approved)"
            return
    _personal_schedule.append({
        "id": f"sub-cover-{period_num}",
        "period_number": period_num,
        "start_time": time_slot.split("-")[0].strip() if "-" in time_slot else "10:30 AM",
        "end_time": time_slot.split("-")[1].strip() if "-" in time_slot else "11:15 AM",
        "day_of_week": "Today",
        "activity_type": "SUBSTITUTION_COVER",
        "class_grade": class_name,
        "section": "B",
        "subject_name": f"{subject} (Proxy Cover)",
        "room_number": "Room 204",
        "is_current_active_period": False,
        "notes": f"Covering for absent faculty {absent_teacher} (Leave Approved)"
    })

@router.post("/curriculum/log-unit")
async def teacher_log_curriculum_unit(req: dict):
    from app.routers.admin import _curriculum_pacing_items, _add_audit_log
    class_name = req.get("class_name", "Class 8-B")
    subject = req.get("subject", "Mathematics")
    units_to_add = req.get("units_to_add", 1)
    lesson_title = req.get("lesson_title")
    
    for item in _curriculum_pacing_items:
        if item["class_name"] == class_name and item["subject"] == subject:
            item["completed_units"] = min(item["total_units"], item["completed_units"] + units_to_add)
            item["completion_pct"] = round((item["completed_units"] / item["total_units"]) * 100, 1)
            diff = item["completed_units"] - item["calendar_target_units"]
            if diff >= 1:
                item["status"] = f"Ahead (+{diff} Unit{'s' if diff > 1 else ''})"
            elif diff < 0:
                item["status"] = f"Lagging ({abs(diff)} Unit{'s' if abs(diff) > 1 else ''} Behind)"
            else:
                item["status"] = "On Track"
            if lesson_title:
                item["last_lesson_title"] = lesson_title
            
            _add_audit_log(
                actor_name=item["teacher_name"],
                actor_role="teacher",
                action_type="LESSON_DELIVERY_CHECKOFF",
                target_entity=f"{item['class_name']} {item['subject']}",
                status="VERIFIED",
                details=f"Faculty checked off unit delivery: {item['completed_units']}/{item['total_units']} ({item['completion_pct']}%)."
            )
            return {"success": True, "item": item}
    raise HTTPException(status_code=404, detail="Course not found in curriculum tracker")


