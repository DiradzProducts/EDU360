import datetime
import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_

from app.core.database import get_db
from app.core.rbac import require_role
from app.models.models import (
    CurriculumPacing, PTMEvent, PTMSlot, ExamSyncRequest, StaffMember, SecurityAuditLog,
    StudentPortfolio, Student
)
from app.schemas.schemas import (
    ExamSyncCreateRequest, ExamSyncResolveRequest, ExamSyncResponse,
    PTMFacultyAttendanceSummaryResponse, PTMFacultyAttendanceItem,
    PTMEventCreate, PTMEventResponse
)
from app.routers.notifications import create_system_notification

logger = logging.getLogger("edu360.academic")

router = APIRouter(
    prefix="/api/academic",
    tags=["academic"],
    dependencies=[Depends(require_role(["academic_coordinator", "exam_coordinator", "admin", "principal", "super_admin", "teacher"]))]
)


def _to_utc_iso(dt: Optional[datetime.datetime]) -> Optional[str]:
    if not dt:
        return None
    iso = dt.isoformat()
    return iso if iso.endswith("Z") else f"{iso}Z"


# =========================================================================
# 1. INTER-COORDINATOR EXAM & SYLLABUS SYNC PROTOCOL
# =========================================================================

@router.post("/exam-sync/request", response_model=ExamSyncResponse)
async def request_exam_coordinator_sync(
    req: ExamSyncCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Dispatched by Academic Coordinator (Prof. Rajeshwari Nair) or Exam Coordinator (Dr. Hemanth Sen).
    Requests an alignment meeting or syllabus cut-off adjustment when course pacing is lagging.
    """
    req_name = req.requested_by_name or "Prof. Rajeshwari Nair"
    req_role = req.requested_by_role or "academic_coordinator"
    new_req = ExamSyncRequest(
        title=req.title,
        class_name=req.class_name,
        subject=req.subject,
        curriculum_lag_units=req.curriculum_lag_units,
        current_completion_pct=req.current_completion_pct,
        proposed_resolution=req.proposed_resolution,
        notes=req.notes,
        status="PENDING_MEETING",
        requested_by_name=req_name,
        requested_by_role=req_role,
        meeting_date=req.meeting_date or "Tomorrow, 03:00 PM",
        meeting_venue=req.meeting_venue or "Exam Cell Conference / Virtual Room A",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_req)
    await db.commit()
    await db.refresh(new_req)

    # 🔔 Dispatch In-App Notifications
    try:
        if req_role == "exam_coordinator":
            # Exam Coordinator raised alert -> Notify Academic Coordinator & Class Faculty
            await create_system_notification(
                db=db,
                recipient_user_id=8,
                recipient_role="academic_coordinator",
                sender_name=req_name,
                sender_role="exam_coordinator",
                title=f"Syllabus Pacing Alert: {req.subject} ({req.class_name})",
                message=f"Exam Cell flagged syllabus lag ({req.curriculum_lag_units} units behind, {req.current_completion_pct}% done). Proposed action: {req.proposed_resolution.replace('_', ' ')}. Requesting sync meeting {req.meeting_date}.",
                notification_type="EXAM_SYNC_REQUEST",
                priority="HIGH",
                action_url="/academic_coordinator?tab=curriculum",
                metadata_dict={
                    "sync_request_id": new_req.id,
                    "class_name": req.class_name,
                    "subject": req.subject,
                    "proposed_resolution": req.proposed_resolution
                }
            )
            # Notify Faculty
            await create_system_notification(
                db=db,
                recipient_user_id=2,
                recipient_role="teacher",
                sender_name=req_name,
                sender_role="exam_coordinator",
                title=f"Urgent Syllabus Pacing Directive: {req.subject}",
                message=f"Exam Cell has requested pacing acceleration for {req.subject} ({req.class_name}). Current completion: {req.current_completion_pct}%.",
                notification_type="PACING_LAG_CRITICAL",
                priority="HIGH",
                action_url="/teacher?tab=schedule",
                metadata_dict={"class_name": req.class_name, "subject": req.subject}
            )
        else:
            # Academic Coordinator raised request -> Notify Exam Coordinator
            await create_system_notification(
                db=db,
                recipient_user_id=8,
                recipient_role="exam_coordinator",
                sender_name="Prof. Rajeshwari Nair",
                sender_role="academic_coordinator",
                title=f"Academic Sync Requested: {req.subject} ({req.class_name})",
                message=f"Pacing lag detected ({req.curriculum_lag_units} units behind, {req.current_completion_pct}% done). Proposed action: {req.proposed_resolution.replace('_', ' ')}. Requesting sync meeting {req.meeting_date}.",
                notification_type="EXAM_SYNC_REQUEST",
                priority="HIGH",
                action_url="/exam_coordinator?tab=academic_sync",
                metadata_dict={
                    "sync_request_id": new_req.id,
                    "class_name": req.class_name,
                    "subject": req.subject,
                    "proposed_resolution": req.proposed_resolution
                }
            )
    except Exception as e:
        logger.warning(f"Failed to dispatch exam sync notification: {e}")

    # Immutable Audit Log
    audit = SecurityAuditLog(
        actor_name=req_name,
        actor_role=req_role,
        action_type="EXAM_SYNC_REQUESTED",
        target_entity=f"ExamSyncRequest #{new_req.id} ({req.class_name} {req.subject})",
        status="VERIFIED",
        details=f"Dispatched consultation request: {req.title}. Proposed resolution: {req.proposed_resolution}."
    )
    db.add(audit)
    await db.commit()


    return ExamSyncResponse(
        id=new_req.id,
        title=new_req.title,
        class_name=new_req.class_name,
        subject=new_req.subject,
        curriculum_lag_units=new_req.curriculum_lag_units,
        current_completion_pct=new_req.current_completion_pct,
        proposed_resolution=new_req.proposed_resolution,
        notes=new_req.notes,
        status=new_req.status,
        requested_by_name=new_req.requested_by_name,
        requested_by_role=new_req.requested_by_role,
        meeting_date=new_req.meeting_date,
        meeting_venue=new_req.meeting_venue,
        resolution_notes=new_req.resolution_notes,
        created_at=_to_utc_iso(new_req.created_at),
        resolved_at=_to_utc_iso(new_req.resolved_at)
    )


@router.get("/exam-sync/requests", response_model=List[ExamSyncResponse])
async def list_exam_sync_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db)
):
    """Lists all consultation requests between Academic Office and Exam Cell."""
    stmt = select(ExamSyncRequest).order_by(ExamSyncRequest.id.desc())
    if status_filter and status_filter.lower() != "all":
        stmt = stmt.where(ExamSyncRequest.status.ilike(status_filter))
    res = await db.execute(stmt)
    rows = res.scalars().all()
    return [
        ExamSyncResponse(
            id=r.id,
            title=r.title,
            class_name=r.class_name,
            subject=r.subject,
            curriculum_lag_units=r.curriculum_lag_units,
            current_completion_pct=r.current_completion_pct,
            proposed_resolution=r.proposed_resolution,
            notes=r.notes,
            status=r.status,
            requested_by_name=r.requested_by_name,
            requested_by_role=r.requested_by_role,
            meeting_date=r.meeting_date,
            meeting_venue=r.meeting_venue,
            resolution_notes=r.resolution_notes,
            created_at=_to_utc_iso(r.created_at),
            resolved_at=_to_utc_iso(r.resolved_at)
        )
        for r in rows
    ]


@router.post("/exam-sync/{request_id}/resolve", response_model=ExamSyncResponse)
async def resolve_exam_sync_request(
    request_id: int,
    req: ExamSyncResolveRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Exam Coordinator (Dr. Hemanth Sen) confirms a meeting time or resolves a sync request.
    """
    res = await db.execute(select(ExamSyncRequest).where(ExamSyncRequest.id == request_id))
    sync_req = res.scalars().first()
    if not sync_req:
        raise HTTPException(status_code=404, detail="Exam sync request not found")

    sync_req.status = req.status
    if req.meeting_date:
        sync_req.meeting_date = req.meeting_date
    if req.meeting_venue:
        sync_req.meeting_venue = req.meeting_venue
    if req.resolution_notes:
        sync_req.resolution_notes = req.resolution_notes
    sync_req.resolved_at = datetime.datetime.utcnow()

    await db.commit()
    await db.refresh(sync_req)

    # 🔔 Notify Academic Coordinator of meeting confirmation / resolution
    try:
        await create_system_notification(
            db=db,
            recipient_user_id=6,
            recipient_role="academic_coordinator",
            sender_name="Dr. Hemanth Sen",
            sender_role="exam_coordinator",
            title=f"Exam Sync Confirmed: {sync_req.subject} ({sync_req.class_name})",
            message=f"Exam Cell has {req.status.replace('_', ' ').lower()} your sync request. Meeting: {sync_req.meeting_date} at {sync_req.meeting_venue}.",
            notification_type="EXAM_SYNC_RESOLVED",
            priority="HIGH",
            action_url="/academic_coordinator?tab=calendar_clearance",
            metadata_dict={"sync_request_id": sync_req.id, "status": req.status}
        )
    except Exception as e:
        logger.warning(f"Failed to dispatch exam sync resolve notification: {e}")

    audit = SecurityAuditLog(
        actor_name="Dr. Hemanth Sen",
        actor_role="exam_coordinator",
        action_type="EXAM_SYNC_RESOLVED",
        target_entity=f"ExamSyncRequest #{sync_req.id}",
        status="VERIFIED",
        details=f"Updated sync request status to '{req.status}'. Notes: {req.resolution_notes}"
    )
    db.add(audit)
    await db.commit()

    return ExamSyncResponse(
        id=sync_req.id,
        title=sync_req.title,
        class_name=sync_req.class_name,
        subject=sync_req.subject,
        curriculum_lag_units=sync_req.curriculum_lag_units,
        current_completion_pct=sync_req.current_completion_pct,
        proposed_resolution=sync_req.proposed_resolution,
        notes=sync_req.notes,
        status=sync_req.status,
        requested_by_name=sync_req.requested_by_name,
        requested_by_role=sync_req.requested_by_role,
        meeting_date=sync_req.meeting_date,
        meeting_venue=sync_req.meeting_venue,
        resolution_notes=sync_req.resolution_notes,
        created_at=_to_utc_iso(sync_req.created_at),
        resolved_at=_to_utc_iso(sync_req.resolved_at)
    )


# =========================================================================
# 2. PTM FACULTY ATTENDANCE GOVERNANCE & MEETING TRACKING
# =========================================================================

@router.get("/ptm/faculty-attendance", response_model=PTMFacultyAttendanceSummaryResponse)
async def get_ptm_faculty_attendance_summary(
    event_id: Optional[str] = Query(default="ptm-conf-2026-term1"),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculates live faculty attendance and completed meeting metrics across all PTM slots in PostgreSQL.
    Enables Academic Coordinator to monitor whether all faculty attended scheduled parent conferences.
    """
    resolved_event_id = event_id if isinstance(event_id, str) else "ptm-conf-2026-term1"
    # 1. Fetch event title
    ev_res = await db.execute(select(PTMEvent).where(PTMEvent.id == 1))
    ev = ev_res.scalars().first()
    event_title = ev.title if ev else "Term-1 Post Mid-Term Parent-Teacher Meeting"

    # 2. Query all PTMSlots
    slots_res = await db.execute(select(PTMSlot))
    all_slots = slots_res.scalars().all()

    # 3. Query StaffMembers to map teacher IDs to real names & departments
    staff_res = await db.execute(select(StaffMember))
    staff_dict = {str(s.id): s for s in staff_res.scalars().all()}
    # Known alias fallbacks
    name_alias = {
        "ananya": "Mrs. Ananya Verma",
        "suresh": "Dr. Suresh Babu",
        "raman": "Dr. K. Raman",
        "sunita": "Ms. Sunita Roy",
        "arvind": "Mr. Arvind Saxena",
        "neha": "Mrs. Neha Roy"
    }

    # 4. Group slots by teacher
    teacher_slots_map = {}
    for s in all_slots:
        tid = str(s.teacher_id or "ananya").lower()
        if tid not in teacher_slots_map:
            teacher_slots_map[tid] = []
        teacher_slots_map[tid].append(s)

    faculty_items: List[PTMFacultyAttendanceItem] = []
    total_slots_count = len(all_slots)
    total_booked_count = 0
    total_completed_count = 0

    for tid, t_slots in teacher_slots_map.items():
        total_s = len(t_slots)
        booked = sum(1 for s in t_slots if s.status == "BOOKED")
        completed = sum(1 for s in t_slots if s.attendance_status == "COMPLETED" or s.teacher_attended)
        scheduled = sum(1 for s in t_slots if s.status == "BOOKED" and s.attendance_status == "SCHEDULED" and not s.teacher_attended)
        teacher_absent = sum(1 for s in t_slots if s.attendance_status == "TEACHER_ABSENT")
        parent_no_show = sum(1 for s in t_slots if s.attendance_status == "PARENT_NO_SHOW")

        total_booked_count += booked
        total_completed_count += completed

        att_rate = round((completed / booked * 100), 1) if booked > 0 else (100.0 if total_s > 0 else 0.0)

        t_name = name_alias.get(tid, None)
        t_dept = "Academics"
        if tid in staff_dict:
            t_name = staff_dict[tid].name
            t_dept = staff_dict[tid].department

        if not t_name:
            t_name = f"Faculty ({tid.capitalize()})"

        faculty_items.append(
            PTMFacultyAttendanceItem(
                teacher_id=tid,
                teacher_name=t_name,
                department=t_dept,
                total_slots=total_s,
                booked_slots=booked,
                completed_slots=completed,
                scheduled_slots=scheduled,
                teacher_absent_slots=teacher_absent,
                parent_no_show_slots=parent_no_show,
                attendance_rate_pct=att_rate,
                is_fully_attended=(completed >= booked and booked > 0)
            )
        )

    # Sort faculty: lowest attendance rate first so lagging teachers appear at the top
    faculty_items.sort(key=lambda x: (x.attendance_rate_pct, -x.booked_slots))

    overall_rate = round((total_completed_count / total_booked_count * 100), 1) if total_booked_count > 0 else 100.0

    return PTMFacultyAttendanceSummaryResponse(
        event_id=resolved_event_id,
        event_title=event_title,
        total_faculty_count=len(faculty_items),
        total_slots_count=total_slots_count,
        total_booked_count=total_booked_count,
        total_completed_count=total_completed_count,
        overall_attendance_rate_pct=overall_rate,
        faculty_attendance=faculty_items
    )


@router.post("/ptm/slots/{slot_id}/mark-attendance")
async def mark_ptm_slot_attendance(
    slot_id: str,
    teacher_attended: bool = Query(True),
    parent_attended: bool = Query(True),
    attendance_status: str = Query("COMPLETED"), # COMPLETED, TEACHER_ABSENT, PARENT_NO_SHOW
    meeting_notes: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Teacher or Academic Coordinator checks off attendance for a specific PTM consultation slot.
    """
    res = await db.execute(select(PTMSlot).where(PTMSlot.id == slot_id))
    slot = res.scalars().first()
    if not slot:
        raise HTTPException(status_code=404, detail="PTM Slot not found")

    slot.teacher_attended = teacher_attended
    slot.parent_attended = parent_attended
    slot.attendance_status = attendance_status
    if meeting_notes:
        slot.meeting_notes = meeting_notes
    if attendance_status == "COMPLETED":
        slot.completed_at = datetime.datetime.utcnow()

    await db.commit()
    await db.refresh(slot)

    # Dispatch notification to parent if meeting concluded
    if slot.booked_parent_id and attendance_status == "COMPLETED":
        try:
            await create_system_notification(
                db=db,
                recipient_user_id=1,
                recipient_role="parent",
                sender_name=slot.teacher_id,
                sender_role="teacher",
                title=f"PTM Session Concluded: {slot.booked_student_name}",
                message=f"Consultation notes logged: '{slot.meeting_notes or 'Meeting completed successfully.'}'.",
                notification_type="PTM_COMPLETED",
                priority="NORMAL",
                action_url="/parent?tab=ptm",
                metadata_dict={"slot_id": slot.id}
            )
        except Exception:
            pass

    return {
        "success": True,
        "slot_id": slot.id,
        "teacher_attended": slot.teacher_attended,
        "parent_attended": slot.parent_attended,
        "attendance_status": slot.attendance_status,
        "meeting_notes": slot.meeting_notes
    }


# =========================================================================
# 3. PTM EVENT PERSISTENCE (POSTGRESQL-BACKED)
# =========================================================================

@router.post("/ptm/events", response_model=PTMEventResponse)
async def declare_ptm_event_postgres(
    req: PTMEventCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Declares a new institutional PTM event with 100% PostgreSQL persistence.
    Broadcasts slot publishing tasks to all academic homeroom teachers.
    """
    target_classes_str = json.dumps(req.target_classes)
    new_event = PTMEvent(
        title=req.title,
        academic_term=req.academic_term or "Term 1",
        start_date=req.start_date,
        end_date=req.end_date,
        start_time=req.start_time or "09:00 AM",
        end_time=req.end_time or "01:00 PM",
        slot_duration_mins=req.slot_duration_mins or 10,
        target_classes=target_classes_str,
        status="Open_For_Parents",
        created_by_name="Prof. Rajeshwari Nair",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)

    # Broadcast task to teachers
    try:
        from app.models.models import AdminTask
        for teacher_name in ["Mrs. Ananya Verma", "Dr. Suresh Babu", "Mrs. Neha Roy", "Mr. Arvind Saxena"]:
            mandate_task = AdminTask(
                title=f"PTM Mandate: Publish Slots for {req.title}",
                description=f"Institutional PTM declared for {', '.join(req.target_classes)} on {req.start_date} ({req.start_time} - {req.end_time}). Confirm your {req.slot_duration_mins}-min slots.",
                category="urgent",
                domain="academic",
                due_date="Thursday, 5:00 PM",
                assigned_to=teacher_name,
                assigned_to_role="teacher",
                created_by_name="Prof. Rajeshwari Nair",
                created_by_role="academic_coordinator",
                status="Pending",
                priority="High",
                sla_hours=48,
                is_auto_generated=True,
                task_type="PTM_SLOT_PUBLISHING"
            )
            db.add(mandate_task)
        await db.commit()
    except Exception as e:
        logger.warning(f"Could not broadcast PTM mandate tasks: {e}")

    audit = SecurityAuditLog(
        actor_name="Prof. Rajeshwari Nair",
        actor_role="academic_coordinator",
        action_type="PTM_EVENT_DECLARED",
        target_entity=req.title,
        status="VERIFIED",
        details=f"Declared PTM event #{new_event.id} in PostgreSQL for {', '.join(req.target_classes)}."
    )
    db.add(audit)
    await db.commit()

    return PTMEventResponse(
        id=new_event.id,
        title=new_event.title,
        academic_term=new_event.academic_term,
        start_date=new_event.start_date,
        end_date=new_event.end_date,
        start_time=new_event.start_time,
        end_time=new_event.end_time,
        slot_duration_mins=new_event.slot_duration_mins,
        target_classes=req.target_classes,
        status=new_event.status,
        created_by_name=new_event.created_by_name,
        created_at=new_event.created_at
    )


@router.get("/ptm/events", response_model=List[PTMEventResponse])
async def list_ptm_events_postgres(
    db: AsyncSession = Depends(get_db)
):
    """Returns all declared PTM events from PostgreSQL."""
    res = await db.execute(select(PTMEvent).order_by(PTMEvent.id.desc()))
    events = res.scalars().all()
    results = []
    for ev in events:
        try:
            target_cls = json.loads(ev.target_classes) if isinstance(ev.target_classes, str) else ev.target_classes
        except Exception:
            target_cls = ["Class 8-A", "Class 8-B", "Class 9-A"]
        results.append(
            PTMEventResponse(
                id=ev.id,
                title=ev.title,
                academic_term=ev.academic_term,
                start_date=ev.start_date,
                end_date=ev.end_date,
                start_time=ev.start_time,
                end_time=ev.end_time,
                slot_duration_mins=ev.slot_duration_mins,
                target_classes=target_cls,
                status=ev.status,
                created_by_name=ev.created_by_name,
                created_at=ev.created_at
            )
        )
    return results


# =========================================================================
# STUDENT PORTFOLIO VERIFICATION & SIS GOVERNANCE
# =========================================================================

@router.get("/portfolio")
async def list_pending_portfolio_items(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    List student portfolio submissions for Academic Coordinator verification.
    """
    stmt = select(StudentPortfolio)
    if status == "pending":
        stmt = stmt.where(StudentPortfolio.verified_by_school == False)
    elif status == "verified":
        stmt = stmt.where(StudentPortfolio.verified_by_school == True)
    stmt = stmt.order_by(StudentPortfolio.id.desc())
    res = await db.execute(stmt)
    items = res.scalars().all()
    return items


@router.post("/portfolio/{item_id}/verify")
async def verify_portfolio_item(
    item_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Academic Coordinator reviews and verifies student achievement/participation.
    Locks verified stamp into permanent SIS transcript and notifies the student.
    """
    res = await db.execute(select(StudentPortfolio).where(StudentPortfolio.id == item_id))
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    item.verified_by_school = True
    await db.commit()
    await db.refresh(item)

    try:
        st_res = await db.execute(select(Student).where(Student.id == item.student_id))
        st = st_res.scalars().first()
        student_uid = st.user_id if st else None

        await create_system_notification(
            db=db,
            recipient_user_id=student_uid,
            recipient_role="student",
            sender_name="Academic Coordinator",
            sender_role="academic_coordinator",
            title=f"🎉 Portfolio Achievement Verified: {item.title}",
            message=f"Your achievement '{item.title}' has been officially verified by the Academic Coordinator and added to your permanent SIS transcript.",
            notification_type="PORTFOLIO_VERIFIED",
            priority="HIGH",
            action_url="/student?tab=portfolio",
            metadata_dict={"portfolio_id": item.id, "title": item.title}
        )
    except Exception as e:
        logger.warning(f"Failed to dispatch portfolio verification notification: {e}")

    return {
        "success": True,
        "message": f"Portfolio entry '{item.title}' verified successfully.",
        "item": item
    }

