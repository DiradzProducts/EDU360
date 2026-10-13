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
    HomeworkResponse, HomeworkSubmissionResponse, HomeworkSubmissionGrade,
    FocusTableResponse, FocusTableUpdate,
    LeaveRequestResponse, LeaveRequestReview
)
from app.services.ai_analytics import evaluate_attendance_rule

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
async def list_teacher_homework(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Homework).order_by(Homework.id.desc()))
    return result.scalars().all()

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
