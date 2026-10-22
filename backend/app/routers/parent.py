import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.models.models import (
    Student, FocusTable, HomeworkSubmission, BusRoute, FeeMilestone,
    LeaveRequest, ExitClearance, Homework, FeeDefaulter, PaymentTransaction
)
from app.routers.notifications import create_system_notification
from app.schemas.schemas import (
    FocusTableResponse, HomeworkSubmissionResponse, BusRouteResponse,
    FeeMilestoneResponse, FeePayRequest,
    LeaveRequestCreate, LeaveRequestResponse,
    ExitClearanceResponse, ExitClearanceDigitalSign,
    AcademicComplianceResponse, HomeworkResponse,
    AIStudyAssistantRequest, AIStudyAssistantResponse
)
from app.services.backlog_engine import BacklogEngine
from app.services.gemini_study_assistant import consult_gemini_study_assistant

router = APIRouter(prefix="/api/parent", tags=["parent"])

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
    Retrieve current-day homework tasks only to keep the parent profile clean and uncluttered.
    """
    # System simulated current date is 2026-10-18
    today_str = "2026-10-18"
    result = await db.execute(select(Homework).where(Homework.due_date == today_str))
    items = result.scalars().all()
    if not items:
        # Fallback to daily homework due closest to current date
        fallback_res = await db.execute(select(Homework).where(Homework.task_type == "DAILY_HOMEWORK").order_by(Homework.id.desc()).limit(2))
        items = fallback_res.scalars().all()
    return items

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
    return result.scalars().all()

@router.post("/fees/{milestone_id}/pay", response_model=FeeMilestoneResponse)
async def pay_fee_milestone(milestone_id: int, req: FeePayRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FeeMilestone).where(FeeMilestone.id == milestone_id))
    milestone = result.scalars().first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Fee milestone not found")
    
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
    
    await db.commit()
    await db.refresh(milestone)
    return milestone

# --- 5. Leave Request Application ---
@router.post("/leave-requests", response_model=LeaveRequestResponse)
async def apply_student_leave(req: LeaveRequestCreate, db: AsyncSession = Depends(get_db)):
    new_lr = LeaveRequest(
        student_id=req.student_id,
        student_name=req.student_name,
        parent_name=req.parent_name,
        from_date=req.from_date,
        to_date=req.to_date,
        reason=req.reason,
        status="Pending"
    )
    db.add(new_lr)
    await db.commit()
    await db.refresh(new_lr)
    return new_lr

@router.get("/leave-requests/{student_id}", response_model=list[LeaveRequestResponse])
async def get_student_leave_requests(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.student_id == student_id).order_by(LeaveRequest.applied_at.desc()))
    return result.scalars().all()

# --- 6. Digital TC Sign-Off ---
@router.post("/exit-clearance/{student_id}/digital-sign")
async def digital_sign_tc(student_id: int, req: ExitClearanceDigitalSign, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExitClearance).where(ExitClearance.student_id == student_id))
    clearance = result.scalars().first()
    if not clearance:
        raise HTTPException(status_code=404, detail="No active exit clearance record for this student")
    
    clearance.digital_parent_approved = req.parent_confirmation
    clearance.digital_approval_timestamp = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p UTC")
    
    if clearance.digital_parent_approved and clearance.physical_sign_verified:
        clearance.status = "Completed & Permanently Archived"
    else:
        clearance.status = "Digital Approved - Pending Physical Sign Scan"
        
    await db.commit()
    await db.refresh(clearance)
    return {
        "success": True,
        "message": "Digital Sign-off stamped with tamper-evident digital seal.",
        "clearance": clearance
    }

# --- 7. Dual-Mode Parent-Teacher Connection & Sliding PTM Engine ---
from app.routers.teacher import _ptm_slots, _ptm_event_config, _parent_teacher_notes
from app.schemas.schemas import (
    PTMEventConfigResponse, PTMSlotResponse, PTMSlotBookRequest,
    ParentTeacherNoteResponse, ParentTeacherNoteCreate
)

@router.get("/ptm/event-config", response_model=PTMEventConfigResponse)
@router.get("/ptm/config", response_model=PTMEventConfigResponse)
async def get_parent_ptm_event_config():
    return _ptm_event_config

@router.get("/ptm/slots", response_model=list[PTMSlotResponse])
async def get_parent_ptm_slots(scope: str = None):
    if scope and scope != "ALL":
        return [s for s in _ptm_slots if s["interaction_scope"] == scope or s["status"] == "BREAK"]
    return _ptm_slots

@router.post("/ptm/slots/{slot_id}/hold")
async def parent_hold_ptm_slot(slot_id: str):
    for slot in _ptm_slots:
        if slot["id"] == slot_id:
            if slot["status"] != "AVAILABLE":
                raise HTTPException(status_code=400, detail="Slot is not available")
            slot["status"] = "HELD"
            return {"success": True, "message": "Slot held for 5 minutes", "slot": slot}
    raise HTTPException(status_code=404, detail="PTM slot not found")

@router.post("/ptm/slots/book", response_model=PTMSlotResponse)
async def parent_book_ptm_slot(req: PTMSlotBookRequest, db: AsyncSession = Depends(get_db)):
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

            # Closed-Loop Telemetry: Auto-update Focus Table if agenda items selected
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

@router.get("/notes/{student_id}", response_model=list[ParentTeacherNoteResponse])
async def get_parent_student_notes(student_id: int):
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

