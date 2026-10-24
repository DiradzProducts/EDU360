import datetime
import json
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.core.database import get_db
from app.models.models import (
    TriageAlert, AdminTask, AdmissionEnquiry, Student, OfficialDocument,
    ExitClearance, Event, EventStaffAssignment, VendorEquipment,
    StaffMember, InventoryItem, PTMEvent, PaymentTransaction, FeeDefaulter
)
from app.routers.notifications import create_system_notification
from app.schemas.schemas import (
    TriageAlertResponse, TriageActionRequest,
    AdminTaskResponse, AdminTaskCreate, AdminTaskUpdate,
    EscalateTaskRequest, AutoTriggerTaskRequest, TaskExecutiveCockpitResponse,
    AdmissionEnquiryResponse, AdmissionEnquiryCreate, AdmissionEnquiryUpdate, CallLogPayload,
    StudentResponse, OfficialDocumentResponse, OfficialDocumentCreate,
    ExitClearanceResponse, ExitClearancePhysicalUpload,
    EventResponse, EventAssignmentResponse,
    VendorEquipmentResponse, VendorEquipmentUpdate,
    SubstitutionSlotResponse, AssignSubstitutionRequest, AvailableFacultyItem,
    SecurityAuditLogResponse, FeeFinancialAnalyticsResponse,
    AcademicRolloverClassResponse, ExecuteRolloverRequest,
    CurriculumPacingItem, LogLessonRequest,
    TaskReliefRequest, ApproveReliefRequest, ExtendSlaRequest, PTMGovernanceStatus,
    PTMEventCreate, PTMEventResponse,
    ExecutivePulseResponse, QuickActionCounts, AdmissionsPulse, AccountsPulse, ExamsPulse, StaffAndPacingPulse
)

router = APIRouter(prefix="/api/admin", tags=["admin"])

# --- 0. Executive Command Center Pulse ---
@router.get("/executive-pulse", response_model=ExecutivePulseResponse)
async def get_executive_pulse(db: AsyncSession = Depends(get_db)):
    """
    Consolidated Executive Pulse for the School Head / Principal.
    Provides instant morning vitals across Inflows, Accounts, Exams, and Staff/Pacing
    in a single non-blocking payload.
    """
    # 1. Quick Action Counts
    pending_tc_count = 2
    try:
        tc_result = await db.execute(select(ExitClearance).where(ExitClearance.status != "Completed"))
        pending_tcs_list = tc_result.scalars().all()
        if pending_tcs_list:
            pending_tc_count = len(pending_tcs_list)
    except Exception:
        pass

    # Check pending staff permissions from in-memory / DB
    pending_perm_count = sum(1 for p in _teacher_permissions if p.get("status") == "Pending")

    # Check escalated tasks
    sla_escalations_count = 0
    try:
        tasks_result = await db.execute(select(AdminTask).where(AdminTask.is_escalated == True))
        escalated_tasks = tasks_result.scalars().all()
        sla_escalations_count = len(escalated_tasks)
    except Exception:
        pass

    # 2. Admissions Inflows / Outflows
    total_enquiries = 45
    active_followups = 18
    try:
        enquiries_result = await db.execute(select(AdmissionEnquiry))
        enquiries = enquiries_result.scalars().all()
        if enquiries:
            total_enquiries = len(enquiries)
            active_followups = sum(1 for e in enquiries if e.status in ["New", "Campus Visit Scheduled", "Documents Verified"])
    except Exception:
        pass

    # Students count
    enrolled_count = 142
    try:
        students_res = await db.execute(select(Student))
        students = students_res.scalars().all()
        if students:
            enrolled_count = len(students)
    except Exception:
        pass

    # Grade capacities breakdown
    grade_capacities = [
        {"grade": "Class 8", "enrolled": 92, "capacity": 100},
        {"grade": "Class 9", "enrolled": 78, "capacity": 100},
        {"grade": "Class 10", "enrolled": 84, "capacity": 100}
    ]

    # 3. Accounts & Collections
    accounts_data = {
        "today_collections": 145000.0,
        "today_transactions_count": 12,
        "aging": {
            "under_30_days": 210000.0,
            "days_30_to_60": 140000.0,
            "over_60_days_critical": 65000.0
        },
        "payroll": {
            "batch_month": "October 2026",
            "total_staff": 44,
            "total_amount": 1820000.0,
            "status": "Ready_For_Authorization"
        },
        "gateway_settlement_pipeline": 85000.0
    }

    # 4. Exams & Academics
    exams_data = {
        "active_exams": [
            {"class_name": "Class 10", "subject": "Pre-Board Mathematics", "time": "09:30 AM – 12:30 PM", "status": "In Progress"},
            {"class_name": "Class 8", "subject": "General Science Periodic", "time": "10:00 AM – 11:30 AM", "status": "In Progress"}
        ],
        "upcoming_exams": [
            {"class_name": "Class 9", "subject": "English Literature", "date": "Monday, 27 Oct"},
            {"class_name": "Class 8", "subject": "Social Studies", "date": "Wednesday, 29 Oct"}
        ],
        "grading_queue_pending_papers": 120,
        "trajectory": [
            {"class_name": "Class 8", "prev_avg": 68.0, "current_avg": 74.0, "change_pct": 6.0, "status": "Improved"},
            {"class_name": "Class 9", "prev_avg": 73.0, "current_avg": 66.0, "change_pct": -7.0, "status": "Alert"},
            {"class_name": "Class 10", "prev_avg": 81.0, "current_avg": 83.0, "change_pct": 2.0, "status": "Stable"}
        ],
        "remedial_student_count": 8
    }

    # 5. Staff & Syllabus Lag Sentinel
    lagging_items = [
        {"class_name": item["class_name"], "subject": item["subject"], "teacher_name": item["teacher_name"], "lag_units": abs(item["completed_units"] - item["calendar_target_units"])}
        for item in _curriculum_pacing_items
        if (item["calendar_target_units"] - item["completed_units"]) >= 2
    ]

    staff_and_pacing_data = {
        "staff_present": 42,
        "staff_total": 44,
        "attendance_pct": 95.5,
        "pacing_lag_alerts_count": len(lagging_items),
        "lagging_classes": lagging_items if lagging_items else [
            {"class_name": "Class 9-A", "subject": "Physics", "teacher_name": "Mr. Vikram Sharma", "lag_units": 2}
        ]
    }

    return {
        "quick_action_counts": {
            "pending_tcs": pending_tc_count,
            "pending_staff_permissions": pending_perm_count,
            "pending_fee_waivers": 1,
            "sla_escalations": sla_escalations_count
        },
        "admissions": {
            "new_inflows_mtd": total_enquiries,
            "active_followups": active_followups,
            "total_enrolled": enrolled_count,
            "total_capacity": 180,
            "capacity_percentage": round((enrolled_count / 180) * 100, 1),
            "exits_count_ytd": 2,
            "grade_capacities": grade_capacities
        },
        "accounts": accounts_data,
        "exams": exams_data,
        "staff_and_pacing": staff_and_pacing_data
    }

# --- 1. Priority Triage Command Center ---
@router.get("/triage", response_model=list[TriageAlertResponse])
async def get_triage_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TriageAlert).order_by(TriageAlert.resolved.asc(), TriageAlert.id.asc()))
    return result.scalars().all()

@router.post("/triage/{alert_id}/act")
async def execute_triage_action(alert_id: int, req: TriageActionRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TriageAlert).where(TriageAlert.id == alert_id))
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = True
    alert.resolution_note = req.notes or f"Action '{alert.action_label}' executed at {datetime.datetime.utcnow().strftime('%H:%M:%S UTC')}."
    await db.commit()
    await db.refresh(alert)
    return {
        "success": True,
        "message": f"Triage action completed: {alert.action_label}",
        "alert": alert
    }

# --- 2. Admin & Coordinator Operational Task Manager ---
@router.get("/tasks", response_model=list[AdminTaskResponse])
async def list_admin_tasks(
    domain: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    is_escalated: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(AdminTask)
    if domain and domain.lower() != "all":
        query = query.where(AdminTask.domain == domain.lower())
    if status and status.lower() != "all":
        query = query.where(AdminTask.status == status)
    if category:
        query = query.where(AdminTask.category == category)
    if is_escalated is not None:
        query = query.where(AdminTask.is_escalated == is_escalated)
    query = query.order_by(AdminTask.is_escalated.desc(), AdminTask.id.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/tasks/executive-cockpit", response_model=TaskExecutiveCockpitResponse)
async def get_task_executive_cockpit(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminTask).order_by(AdminTask.id.desc()))
    tasks = result.scalars().all()

    total_open = sum(1 for t in tasks if (t.status or "").lower() not in ["completed", "done"])
    critical_escalations = sum(1 for t in tasks if t.is_escalated or (t.priority or "").lower() == "critical")
    overdue_count = sum(1 for t in tasks if "urgent" in (t.category or "").lower() and (t.status or "").lower() not in ["completed", "done"])
    auto_generated_count = sum(1 for t in tasks if t.is_auto_generated)

    domains = ["academic", "exam", "transport", "inventory", "admissions", "finance", "executive"]
    domain_labels = {
        "academic": "Academic & Curriculum",
        "exam": "Examination Cell",
        "transport": "Yellow Bus Fleet",
        "inventory": "Asset & Lab Store",
        "admissions": "Admissions & CRM",
        "finance": "Finance & Bursar",
        "executive": "Executive Mandates"
    }

    dept_stats = []
    for d in domains:
        d_tasks = [t for t in tasks if (t.domain or "academic").lower() == d]
        open_d = sum(1 for t in d_tasks if (t.status or "").lower() not in ["completed", "done"])
        completed_d = sum(1 for t in d_tasks if (t.status or "").lower() in ["completed", "done"])
        total_d = len(d_tasks)
        rate = round((completed_d / total_d) * 100, 1) if total_d > 0 else 100.0
        dept_stats.append({
            "domain": d,
            "label": domain_labels.get(d, d.title()),
            "total_tasks": total_d,
            "open_tasks": open_d,
            "completed_tasks": completed_d,
            "completion_rate_pct": rate
        })

    return TaskExecutiveCockpitResponse(
        total_open=total_open,
        critical_escalations=critical_escalations,
        overdue_count=overdue_count,
        auto_generated_count=auto_generated_count,
        department_stats=dept_stats,
        recent_tasks=tasks[:10]
    )

@router.post("/tasks", response_model=AdminTaskResponse)
async def create_admin_task(task_in: AdminTaskCreate, db: AsyncSession = Depends(get_db)):
    task_dict = task_in.model_dump()
    new_task = AdminTask(**task_dict)
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)

    # 🔔 Persistent Notification to Assigned Faculty / Role
    try:
        assignee = new_task.assigned_to or ""
        is_teacher = any(term in assignee.lower() for term in ["verma", "teacher", "ananya", "faculty", "math"])
        role = "teacher" if is_teacher else (new_task.department or "teacher")
        user_id = 2 if is_teacher else None

        await create_system_notification(
            db=db,
            recipient_user_id=user_id,
            recipient_role=role,
            sender_name="Prof. Rajeshwari Nair",
            sender_role="academic_coordinator",
            title=f"New Task Delegated: {new_task.title}",
            message=f"You have been assigned: '{new_task.title}'. SLA Target: {new_task.sla_hours} hours. Priority: {new_task.priority}.",
            notification_type="TASK_ASSIGNED",
            priority="URGENT" if new_task.priority in ["Critical", "High"] else "NORMAL",
            action_url=f"/teacher?tab=duties&taskId={new_task.id}",
            metadata_dict={"task_id": new_task.id, "priority": new_task.priority}
        )
    except Exception as e:
        print(f"Failed to create notification for admin task: {e}")

    return new_task

@router.patch("/tasks/{task_id}", response_model=AdminTaskResponse)
async def update_admin_task(task_id: int, task_up: AdminTaskUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminTask).where(AdminTask.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_up.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        if val is not None and hasattr(task, key):
            setattr(task, key, val)
    
    task.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return task

@router.post("/tasks/{task_id}/escalate", response_model=AdminTaskResponse)
async def escalate_admin_task(task_id: int, req: EscalateTaskRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminTask).where(AdminTask.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.is_escalated = True
    task.escalation_reason = req.reason
    task.priority = "Critical"
    task.updated_at = datetime.datetime.utcnow()
    
    # Push into Super Admin's Priority Triage Command Center
    triage_alert = TriageAlert(
        level="red",
        category="compliance",
        title=f"ACADEMIC ESCALATION: {task.title}",
        description=f"Prof. Rajeshwari Nair escalated task #{task.id}: {req.reason}. Assigned to: {task.assigned_to}.",
        action_label="Review Academic Breach",
        action_endpoint=f"/admin?tab=tasks&taskId={task.id}",
        resolved=False
    )
    db.add(triage_alert)
    await db.commit()
    await db.refresh(task)
    return task

@router.post("/tasks/{task_id}/request-relief", response_model=AdminTaskResponse)
async def request_task_relief(task_id: int, req: TaskReliefRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminTask).where(AdminTask.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.relief_requested = True
    task.relief_reason = req.relief_reason
    task.relief_justification = req.justification
    task.suggested_peer_teacher = req.suggested_peer_teacher
    task.status = "Relief Requested"
    task.updated_at = datetime.datetime.utcnow()
    
    _add_audit_log(
        actor_name=task.assigned_to,
        actor_role="teacher",
        action_type="TASK_RELIEF_REQUESTED",
        target_entity=task.title,
        status="PENDING",
        details=f"Faculty requested relief due to {req.relief_reason}: {req.justification} (Suggested Peer: {req.suggested_peer_teacher or 'None'})."
    )
    await db.commit()
    await db.refresh(task)
    return task

@router.post("/tasks/{task_id}/approve-relief", response_model=AdminTaskResponse)
async def approve_task_relief(task_id: int, req: ApproveReliefRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminTask).where(AdminTask.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    old_assignee = task.assigned_to
    task.assigned_to = req.new_assigned_to
    task.assigned_to_role = "teacher"
    task.relief_requested = False
    task.status = "Pending"
    task.sla_hours = req.new_sla_hours or 48
    task.updated_at = datetime.datetime.utcnow()
    
    _add_audit_log(
        actor_name="Academic Coordinator",
        actor_role="academic_coordinator",
        action_type="TASK_MIGRATION_APPROVED",
        target_entity=task.title,
        status="VERIFIED",
        details=f"Reassigned academic mandate from {old_assignee} to {req.new_assigned_to} (SLA: {task.sla_hours}h). Reason: {task.relief_reason or 'Workload Relief'}."
    )
    await db.commit()
    await db.refresh(task)
    return task

@router.post("/tasks/{task_id}/extend-sla", response_model=AdminTaskResponse)
async def extend_task_sla(task_id: int, req: ExtendSlaRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminTask).where(AdminTask.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.sla_hours = (task.sla_hours or 24) + req.additional_hours
    task.status = "Pending"
    task.relief_requested = False
    task.updated_at = datetime.datetime.utcnow()
    
    _add_audit_log(
        actor_name="Academic Coordinator",
        actor_role="academic_coordinator",
        action_type="TASK_SLA_EXTENDED",
        target_entity=task.title,
        status="VERIFIED",
        details=f"Granted +{req.additional_hours}h SLA extension. Justification: {req.extension_reason}."
    )
    await db.commit()
    await db.refresh(task)
    return task

@router.post("/tasks/auto-trigger", response_model=AdminTaskResponse)
async def auto_trigger_operational_task(req: AutoTriggerTaskRequest, db: AsyncSession = Depends(get_db)):
    if req.event_type == "exam_concluded":
        task = AdminTask(
            title=f"Term 1 Exam Concluded: Publish Grade Moderation & Verification Dossier ({req.entity_id or 'Secondary Tier'})",
            description=req.notes or "Automated event trigger: Exam cycle ended. Collect all unmoderated subject marks sheets within 5 working days.",
            category="urgent",
            domain="exam",
            due_date="Within 5 Days",
            assigned_to="Dr. Hemanth Sen (Exam Controller)",
            assigned_to_role="exam_coordinator",
            created_by_name="EDU360 Event Engine",
            created_by_role="system",
            priority="High",
            sla_hours=120,
            is_auto_generated=True,
            trigger_event="exam_concluded"
        )
    elif req.event_type == "bus_rto_fitness":
        task = AdminTask(
            title=f"Statutory Fleet Audit: Bus Route #{req.entity_id or '4'} RTO Fitness Certificate Due in 15 Days",
            description=req.notes or "Automated compliance trigger: Vehicle fitness certificate expires this month. Complete RTO brake, speed governor, and emissions check.",
            category="urgent",
            domain="transport",
            due_date="Within 10 Days",
            assigned_to="Mr. Vikram Malhotra (Transport Lead)",
            assigned_to_role="transport_coordinator",
            created_by_name="EDU360 Event Engine",
            created_by_role="system",
            priority="Critical",
            sla_hours=72,
            is_auto_generated=True,
            trigger_event="bus_rto_fitness"
        )
    elif req.event_type == "absence_streak":
        task = AdminTask(
            title=f"Welfare Intervention: Student #{req.entity_id or 'Roll 15'} Absent 3+ Consecutive Days",
            description=req.notes or "Automated attendance trigger: Student has missed 3 consecutive class days without parent leave note. Initiate welfare phone check.",
            category="urgent",
            domain="academic",
            due_date="Today, 4:00 PM",
            assigned_to="Mrs. Ananya Verma (Class Teacher)",
            assigned_to_role="teacher",
            created_by_name="EDU360 Event Engine",
            created_by_role="system",
            priority="High",
            sla_hours=8,
            is_auto_generated=True,
            trigger_event="absence_streak"
        )
    elif req.event_type == "stock_low":
        task = AdminTask(
            title=f"Low Stock Reorder Trigger: Chemistry Lab Consumables Below Threshold ({req.entity_id or 'Reagents'})",
            description=req.notes or "Automated inventory alert: Acid stock and filter papers below minimum reorder buffer. Generate vendor purchase order.",
            category="upcoming",
            domain="inventory",
            due_date="Within 48 Hours",
            assigned_to="Mrs. Shalini Rao (Store Lead)",
            assigned_to_role="inventory_coordinator",
            created_by_name="EDU360 Event Engine",
            created_by_role="system",
            priority="Medium",
            sla_hours=48,
            is_auto_generated=True,
            trigger_event="stock_low"
        )
    else:
        task = AdminTask(
            title=f"Institutional Operations Trigger: {req.event_type}",
            description=req.notes or f"Triggered from event {req.event_type}",
            category="upcoming",
            domain="executive",
            due_date="Within 48 Hours",
            assigned_to="Dr. Sunita Kapoor (Principal)",
            assigned_to_role="admin",
            created_by_name="EDU360 Event Engine",
            created_by_role="system",
            priority="Medium",
            sla_hours=48,
            is_auto_generated=True,
            trigger_event=req.event_type
        )
    
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task

# --- 3. Admissions CRM ---
@router.get("/crm/enquiries", response_model=list[AdmissionEnquiryResponse])
async def list_enquiries(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdmissionEnquiry).order_by(AdmissionEnquiry.created_at.desc()))
    return result.scalars().all()

@router.post("/crm/enquiries", response_model=AdmissionEnquiryResponse)
async def create_enquiry(req: AdmissionEnquiryCreate, db: AsyncSession = Depends(get_db)):
    enquiry = AdmissionEnquiry(
        student_name=req.student_name,
        parent_name=req.parent_name,
        email=req.email,
        phone=req.phone,
        target_grade=req.target_grade,
        lead_temperature=req.lead_temperature or "warm",
        source=req.source or "Website",
        doc_report_card=req.doc_report_card or False,
        doc_birth_cert=req.doc_birth_cert or False,
        doc_transfer_cert=req.doc_transfer_cert or False,
        notes=req.notes,
        next_followup_date=req.next_followup_date,
        stage="new"
    )
    db.add(enquiry)
    await db.commit()
    await db.refresh(enquiry)
    return enquiry

@router.patch("/crm/enquiries/{enquiry_id}/stage", response_model=AdmissionEnquiryResponse)
async def update_enquiry_stage(enquiry_id: int, req: AdmissionEnquiryUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdmissionEnquiry).where(AdmissionEnquiry.id == enquiry_id))
    enquiry = result.scalars().first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    if req.stage:
        enquiry.stage = req.stage
    if req.notes:
        enquiry.notes = req.notes
    if req.lead_temperature:
        enquiry.lead_temperature = req.lead_temperature
    if req.source:
        enquiry.source = req.source
    if req.doc_report_card is not None:
        enquiry.doc_report_card = req.doc_report_card
    if req.doc_birth_cert is not None:
        enquiry.doc_birth_cert = req.doc_birth_cert
    if req.doc_transfer_cert is not None:
        enquiry.doc_transfer_cert = req.doc_transfer_cert
    if req.next_followup_date:
        enquiry.next_followup_date = req.next_followup_date
    if req.drop_reason:
        enquiry.drop_reason = req.drop_reason
    await db.commit()
    await db.refresh(enquiry)
    return enquiry

@router.patch("/crm/enquiries/{enquiry_id}/followup", response_model=AdmissionEnquiryResponse)
async def schedule_followup(enquiry_id: int, req: AdmissionEnquiryUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdmissionEnquiry).where(AdmissionEnquiry.id == enquiry_id))
    enquiry = result.scalars().first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    enquiry.stage = "followup"
    if req.next_followup_date:
        enquiry.next_followup_date = req.next_followup_date
    if req.notes:
        enquiry.notes = f"{enquiry.notes or ''} | {req.notes}".strip(" | ")
    await db.commit()
    await db.refresh(enquiry)
    return enquiry

@router.patch("/crm/enquiries/{enquiry_id}/drop", response_model=AdmissionEnquiryResponse)
async def drop_enquiry(enquiry_id: int, req: AdmissionEnquiryUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdmissionEnquiry).where(AdmissionEnquiry.id == enquiry_id))
    enquiry = result.scalars().first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    enquiry.stage = "dropped"
    if req.drop_reason:
        enquiry.drop_reason = req.drop_reason
    if req.notes:
        enquiry.notes = f"{enquiry.notes or ''} | Drop: {req.drop_reason} ({req.notes})".strip(" | ")
    await db.commit()
    await db.refresh(enquiry)
    return enquiry

@router.post("/crm/enquiries/{enquiry_id}/log-call", response_model=AdmissionEnquiryResponse)
async def log_call_outcome(enquiry_id: int, req: CallLogPayload, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdmissionEnquiry).where(AdmissionEnquiry.id == enquiry_id))
    enquiry = result.scalars().first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    timestamp = datetime.datetime.utcnow().strftime("%d %b, %I:%M %p")
    call_entry = f"[{timestamp}] {req.outcome}: {req.note or 'Call concluded'}"
    enquiry.notes = f"{enquiry.notes}\n• {call_entry}" if enquiry.notes else f"• {call_entry}"
    
    if req.stage:
        enquiry.stage = req.stage
    elif req.outcome == "Not Interested":
        enquiry.stage = "dropped"
        enquiry.drop_reason = req.drop_reason or "Not Interested"
    elif req.outcome in ["Connected - Positive", "Callback Requested", "Ringing / No Answer"]:
        enquiry.stage = "followup"
    
    if req.next_followup_date:
        enquiry.next_followup_date = req.next_followup_date
    elif req.outcome == "Ringing / No Answer":
        tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
        enquiry.next_followup_date = tomorrow
        
    await db.commit()
    await db.refresh(enquiry)
    return enquiry

class ConvertEnquiryPayload(BaseModel):
    section: Optional[str] = "A"
    admission_fee: Optional[float] = 25000.0
    fee_status: Optional[str] = "Paid"  # "Paid" | "Pending"
    payment_method: Optional[str] = "UPI"

@router.post("/crm/enquiries/{enquiry_id}/convert")
async def convert_enquiry_to_student(
    enquiry_id: int, 
    payload: Optional[ConvertEnquiryPayload] = None, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AdmissionEnquiry).where(AdmissionEnquiry.id == enquiry_id))
    enquiry = result.scalars().first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    section_val = payload.section if payload and payload.section else "A"
    fee_amt = payload.admission_fee if payload and payload.admission_fee is not None else 25000.0
    fee_status = payload.fee_status if payload and payload.fee_status else "Paid"
    payment_method = payload.payment_method if payload and payload.payment_method else "UPI"

    enquiry.stage = "converted"
    enquiry.notes = (enquiry.notes or "") + f" | Converted to SIS ({section_val}). Admission Fee: ₹{fee_amt:,.0f} ({fee_status})"
    
    # Generate Admission Number and create Student record
    adm_no = f"EDU-{datetime.datetime.utcnow().year}-{enquiry_id + 100:03d}"
    new_student = Student(
        name=enquiry.student_name,
        roll_no=str(enquiry_id + 30),
        class_name=enquiry.target_grade,
        section=section_val,
        admission_no=adm_no,
        guardian_name=enquiry.parent_name,
        guardian_phone=enquiry.phone,
        guardian_email=enquiry.email,
        attendance_pct=100.0,
        bus_route_id=4,
        academic_average_pct=85.0,
        status="Active"
    )
    db.add(new_student)
    await db.flush()

    # Route fee to Accounts Coordinator
    if fee_status == "Paid":
        receipt_code = f"REC-ADM-2026-{new_student.id + 100}"
        new_tx = PaymentTransaction(
            utr_number=f"UPI/{int(datetime.datetime.utcnow().timestamp())}{new_student.id}/ADMISSION",
            student_name=new_student.name,
            class_name=f"{new_student.class_name}-{new_student.section}",
            parent_name=new_student.guardian_name,
            amount=fee_amt,
            payment_method=payment_method,
            bank_name="HDFC School Collections Gateway",
            milestone_title=f"One-Time Admission & Registration Fee ({receipt_code})",
            status="Success",
            reconciled=False,
            notes=f"New Enrolment Intake Admission Fee • Receipt #{receipt_code}"
        )
        db.add(new_tx)
    else:
        new_defaulter = FeeDefaulter(
            student_id=new_student.id,
            student_name=new_student.name,
            class_name=f"{new_student.class_name}-{new_student.section}",
            roll_no=new_student.roll_no,
            parent_name=new_student.guardian_name,
            parent_phone=new_student.guardian_phone,
            milestone_title="One-Time Admission & Registration Fee",
            amount_due=fee_amt,
            days_overdue=0,
            reminder_sent=False,
            is_admission_fee=True,
            exam_clearance=True,
            status="Overdue"
        )
        db.add(new_defaulter)

    # In-App notification to Accounts Coordinator
    await create_system_notification(
        db=db,
        sender_name="Admissions Desk",
        sender_role="admissions_coordinator",
        recipient_role="accounts_coordinator",
        title=f"🎓 New Enrolment: {new_student.name} ({new_student.class_name}-{new_student.section})",
        message=f"Student converted from CRM. Admission fee ₹{fee_amt:,.0f} status: {fee_status}. Profile added to Accounts Queue.",
        notification_type="NEW_ENROLMENT",
        priority="HIGH" if fee_status == "Pending" else "NORMAL",
        action_url="/accounts_coordinator"
    )

    await db.commit()
    await db.refresh(new_student)
    
    return {
        "success": True,
        "message": f"Successfully enrolled {new_student.name} into SIS ({new_student.class_name}-{new_student.section}) with Admission #{adm_no}",
        "student": new_student,
        "admission_fee": fee_amt,
        "fee_status": fee_status
    }

# --- 4. SIS & Strict Document Control ---
@router.get("/students", response_model=list[StudentResponse])
async def list_students(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).order_by(Student.id.asc()))
    return result.scalars().all()

@router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student_profile(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.get("/students/{student_id}/documents", response_model=list[OfficialDocumentResponse])
async def get_student_documents(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OfficialDocument).where(OfficialDocument.student_id == student_id))
    return result.scalars().all()

@router.post("/documents", response_model=OfficialDocumentResponse)
async def upload_official_document(doc_in: OfficialDocumentCreate, db: AsyncSession = Depends(get_db)):
    # STRICT RULE: Only Admin can create/upload official documents
    new_doc = OfficialDocument(**doc_in.model_dump())
    new_doc.uploaded_by_role = "admin"
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)
    return new_doc

@router.delete("/documents/{doc_id}")
async def delete_official_document(doc_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OfficialDocument).where(OfficialDocument.id == doc_id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    await db.commit()
    return {"success": True, "message": "Document deleted by Administrator"}

# --- 5. Exit Clearance & Dual Signature Verification ---
@router.get("/exit-clearances", response_model=list[ExitClearanceResponse])
async def list_exit_clearances(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExitClearance).order_by(ExitClearance.id.asc()))
    return result.scalars().all()

@router.post("/exit-clearances/{clearance_id}/verify-physical")
async def verify_physical_signature(clearance_id: int, req: ExitClearancePhysicalUpload, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExitClearance).where(ExitClearance.id == clearance_id))
    clearance = result.scalars().first()
    if not clearance:
        raise HTTPException(status_code=404, detail="Exit clearance record not found")
    
    clearance.physical_scan_url = req.physical_scan_url or "/assets/signed_tc_handover_slip.pdf"
    clearance.physical_sign_verified = True
    if clearance.digital_parent_approved and clearance.physical_sign_verified:
        clearance.status = "Completed & Permanently Archived"
    else:
        clearance.status = "Physical Verified - Awaiting Digital"
    
    await db.commit()
    await db.refresh(clearance)
    return {
        "success": True,
        "message": "Physical handover register scan verified and locked in school legal vault.",
        "clearance": clearance
    }

# --- 6. Event & Vendor Command Center ---
@router.get("/events", response_model=list[EventResponse])
async def list_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).order_by(Event.id.asc()))
    return result.scalars().all()

@router.get("/events/{event_id}/assignments", response_model=list[EventAssignmentResponse])
async def get_event_assignments(event_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EventStaffAssignment).where(EventStaffAssignment.event_id == event_id))
    return result.scalars().all()

@router.get("/events/{event_id}/equipment", response_model=list[VendorEquipmentResponse])
async def get_event_equipment(event_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VendorEquipment).where(VendorEquipment.event_id == event_id))
    return result.scalars().all()

@router.patch("/events/equipment/{item_id}", response_model=VendorEquipmentResponse)
async def update_vendor_equipment(item_id: int, req: VendorEquipmentUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VendorEquipment).where(VendorEquipment.id == item_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment item not found")
    if req.status:
        item.status = req.status
    if req.handover_timestamp:
        item.handover_timestamp = req.handover_timestamp
    if req.returned_timestamp:
        item.returned_timestamp = req.returned_timestamp
    if req.notes:
        item.notes = req.notes
    await db.commit()
    await db.refresh(item)
    return item

# --- 7. Staff, Permissions & Inventory ---
@router.get("/staff")
async def list_staff(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaffMember))
    staff_rows = result.scalars().all()
    # Map to frontend StaffMemberItem shape
    return [
        {
            "id": s.id,
            "name": s.name,
            "role": s.role,
            "department": s.department,
            "phone": s.phone,
            "email": s.email,
            "status": s.attendance_status or "Present",
            "assigned_duties": "Class Mentor & Event Logistics Lead" if s.role == "Teacher" else "Campus Operations & Facility Management",
            "salary": 78000 if "Senior" in s.role or "Head" in s.role else (65000 if s.role == "Teacher" else 35000),
            "qualification": "M.Sc., B.Ed" if s.role == "Teacher" else "Professional Certification"
        }
        for s in staff_rows
    ]

@router.get("/inventory")
async def list_inventory(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InventoryItem))
    items = result.scalars().all()
    return [
        {
            "id": i.id,
            "asset_tag": i.asset_tag,
            "name": i.name,
            "category": i.category,
            "sub_category": i.sub_category,
            "total_stock": i.total_stock,
            "available_stock": i.available_stock,
            "issued_count": i.issued_count,
            "damaged_count": i.damaged_count,
            "reorder_level": i.reorder_level,
            "unit_of_measure": i.unit_of_measure,
            "location": i.location,
            "last_audited": i.last_audited or "20 Oct 2026",
            "condition": i.condition,
            "amc_vendor": i.amc_vendor,
            "amc_valid_until": i.amc_valid_until,
            "status": "In Stock" if i.available_stock > i.reorder_level else "Low Stock"
        }
        for i in items
    ]

# In-memory stores for dynamic permissions and defaulters if table doesn't exist
_teacher_permissions = [
    {
        "id": 1,
        "teacher_name": "Mrs. Ananya Verma",
        "type": "Short Permission (1.5 hrs)",
        "reason": "Family medical appointment at Apollo Clinic.",
        "status": "Pending",
        "date": "Today, 11:30 AM - 01:00 PM"
    },
    {
        "id": 2,
        "teacher_name": "Dr. K. Raman",
        "type": "Casual Leave (1 Day)",
        "reason": "Attending State Science Fair as invited jury member.",
        "status": "Pending",
        "date": "Tomorrow, Full Day"
    },
    {
        "id": 3,
        "teacher_name": "Ms. Priya Sen",
        "type": "Short Permission (1 hr)",
        "reason": "Costume collection for Annual Day play from vendor studio.",
        "status": "Approved",
        "date": "Yesterday, 02:00 PM"
    }
]

@router.get("/teacher-permissions")
async def list_teacher_permissions():
    return _teacher_permissions

@router.post("/teacher-permissions/{perm_id}/review")
async def review_teacher_permission(perm_id: int, req: dict, db: AsyncSession = Depends(get_db)):
    status = req.get("status", "Approved")
    
    # DB persistence update
    try:
        from app.models.models import StaffPermission
        await db.execute(
            update(StaffPermission)
            .where(StaffPermission.id == perm_id)
            .values(status=status, approved_by="Dr. Sunita Kapoor (Principal)", reviewed_at=datetime.datetime.utcnow())
        )
        await db.commit()
    except Exception:
        pass

    for p in _teacher_permissions:
        if p["id"] == perm_id:
            p["status"] = status
            
            # --- CROSS-ROLE INTERLOCK ---
            # If Admin approves teacher leave, automatically generate:
            # 1. Unassigned SubstitutionSlot for the Academic Coordinator to assign
            # 2. High-priority SLA task in Academic Coordinator's task queue
            # 3. Security Audit Log
            if status == "Approved":
                new_slot_id = max([s["id"] for s in _substitutions_slots], default=0) + 1
                new_slot = {
                    "id": new_slot_id,
                    "absent_teacher_id": perm_id,
                    "absent_teacher_name": p["teacher_name"],
                    "absent_reason": f"{p['type']} - {p['reason']}",
                    "date": "Today, 19 Oct 2026",
                    "period_number": 3,
                    "time_slot": "10:30 AM - 11:15 AM",
                    "class_name": "Class 8-B",
                    "subject": "Mathematics" if "Verma" in p["teacher_name"] else "Physics",
                    "substitute_teacher_id": None,
                    "substitute_teacher_name": None,
                    "status": "Unassigned",
                    "priority": "High"
                }
                _substitutions_slots.insert(0, new_slot)
                
                new_task_id = max([t["id"] for t in _in_memory_tasks], default=0) + 1
                auto_task = {
                    "id": new_task_id,
                    "title": f"Assign Proxy Cover: {p['teacher_name']} ({p['type']})",
                    "description": f"Admin approved {p['type']}. Class 8-B requires immediate proxy teacher coverage for Period 3.",
                    "category": "urgent",
                    "domain": "academic",
                    "due_date": "Today, 10:15 AM",
                    "assigned_to": "Prof. Rajeshwari Nair",
                    "assigned_to_role": "academic_coordinator",
                    "created_by_name": "Dr. Sunita Kapoor",
                    "created_by_role": "admin",
                    "status": "Pending",
                    "priority": "Critical",
                    "sla_hours": 2,
                    "is_auto_generated": True,
                    "trigger_event": "teacher_leave_approved",
                    "is_escalated": False,
                    "escalation_reason": None,
                    "completion_proof_url": None,
                    "created_at": datetime.datetime.utcnow().isoformat(),
                    "updated_at": datetime.datetime.utcnow().isoformat()
                }
                _in_memory_tasks.insert(0, auto_task)
                
                _add_audit_log(
                    actor_name="Principal & Administrator",
                    actor_role="admin",
                    action_type="LEAVE_APPROVED_SUB_MANDATE",
                    target_entity=f"{p['teacher_name']} ({p['type']})",
                    status="VERIFIED",
                    details=f"Leave approved by Principal. Auto-dispatched proxy coverage task to Academic Coordinator."
                )

            return {"success": True, "permission": p}
    raise HTTPException(status_code=404, detail="Permission request not found")

_fee_defaulters = [
    {
        "id": 1,
        "student_name": "Aarav Sharma",
        "class_name": "Class 8-A",
        "parent_name": "Mr. Rajesh Sharma",
        "parent_phone": "+91 98450 12345",
        "milestone": "Milestone 2 (Term 2 Tuition)",
        "amount_due": 18500,
        "due_date": "25 Oct 2026",
        "days_overdue": 12,
        "reminder_sent": False
    },
    {
        "id": 2,
        "student_name": "Rohan Deshmukh",
        "class_name": "Class 9-B",
        "parent_name": "Dr. Sunil Deshmukh",
        "parent_phone": "+91 98450 99881",
        "milestone": "Milestone 2 (Term 2 Tuition + Transport)",
        "amount_due": 24000,
        "due_date": "20 Oct 2026",
        "days_overdue": 17,
        "reminder_sent": True
    },
    {
        "id": 3,
        "student_name": "Meera Nambiar",
        "class_name": "Class 7-C",
        "parent_name": "Mrs. Anita Nambiar",
        "parent_phone": "+91 98450 55442",
        "milestone": "Milestone 2 (Term 2 Tuition)",
        "amount_due": 18500,
        "due_date": "25 Oct 2026",
        "days_overdue": 12,
        "reminder_sent": False
    }
]

@router.get("/fees/defaulters")
async def list_fee_defaulters():
    return _fee_defaulters

@router.post("/fees/defaulters/{defaulter_id}/remind")
async def remind_fee_defaulter(defaulter_id: int):
    for d in _fee_defaulters:
        if d["id"] == defaulter_id:
            d["reminder_sent"] = True
            # Log to audit trail
            _add_audit_log(
                actor_name="Accounts Officer",
                actor_role="admin",
                action_type="FEE_REMINDER_DISPATCH",
                target_entity=f"Student #{d['id']} ({d['student_name']})",
                status="VERIFIED",
                details=f"Dispatched WhatsApp payment reminder to {d['parent_phone']} for {d['milestone']} (₹{d['amount_due']:,})"
            )
            return {"success": True, "message": f"WhatsApp fee reminder dispatched to {d['parent_phone']}"}
    raise HTTPException(status_code=404, detail="Defaulter record not found")

@router.get("/fees/analytics", response_model=FeeFinancialAnalyticsResponse)
async def get_fee_financial_analytics():
    total_due = sum(d["amount_due"] for d in _fee_defaulters)
    reminders_count = sum(1 for d in _fee_defaulters if d["reminder_sent"])
    return {
        "total_target": 5450000.0,
        "total_collected": 4310000.0,
        "total_overdue": float(total_due),
        "collection_rate_pct": 79.08,
        "aging_summary": {
            "days_0_to_15": 37000.0,
            "days_16_to_30": 24000.0,
            "days_over_30": 0.0
        },
        "defaulters_count": len(_fee_defaulters),
        "reminders_dispatched_today": reminders_count,
        "active_milestone_title": "Milestone 2 (Term 2 Tuition & Activities)",
        "milestone_deadline": "25 Oct 2026"
    }

@router.post("/fees/remind-all")
async def remind_all_fee_defaulters():
    dispatched = 0
    for d in _fee_defaulters:
        d["reminder_sent"] = True
        dispatched += 1
    _add_audit_log(
        actor_name="Super Administrator",
        actor_role="admin",
        action_type="FEE_REMINDER_DISPATCH",
        target_entity="All Defaulters Batch",
        status="VERIFIED",
        details=f"Dispatched high-priority payment reminders to {dispatched} pending student accounts."
    )
    return {
        "success": True,
        "message": f"Dispatched targeted WhatsApp reminders to {dispatched} parents with pending dues."
    }

# --- 8. Teacher Substitution & Period Coverage Engine ---
_substitutions_slots = [
    {
        "id": 1,
        "absent_teacher_id": 1,
        "absent_teacher_name": "Mrs. Ananya Verma",
        "absent_reason": "Short Permission (1.5 hrs) - Family medical appointment",
        "date": "Today, 16 Oct 2026",
        "period_number": 2,
        "time_slot": "09:45 AM - 10:30 AM",
        "class_name": "Class 8-B",
        "subject": "Mathematics",
        "substitute_teacher_id": None,
        "substitute_teacher_name": None,
        "status": "Unassigned",
        "priority": "High"
    },
    {
        "id": 2,
        "absent_teacher_id": 2,
        "absent_teacher_name": "Dr. K. Raman",
        "absent_reason": "Casual Leave - State Science Fair Jury Member",
        "date": "Today, 16 Oct 2026",
        "period_number": 4,
        "time_slot": "11:30 AM - 12:15 PM",
        "class_name": "Class 9-A",
        "subject": "Physics",
        "substitute_teacher_id": None,
        "substitute_teacher_name": None,
        "status": "Unassigned",
        "priority": "High"
    },
    {
        "id": 3,
        "absent_teacher_id": 3,
        "absent_teacher_name": "Ms. Priya Sen",
        "absent_reason": "Short Permission - Annual Day Costume studio pickup",
        "date": "Today, 16 Oct 2026",
        "period_number": 5,
        "time_slot": "01:00 PM - 01:45 PM",
        "class_name": "Class 7-A",
        "subject": "English Literature",
        "substitute_teacher_id": 4,
        "substitute_teacher_name": "Mr. Deepak Rao",
        "status": "Assigned",
        "priority": "Medium"
    },
    {
        "id": 4,
        "absent_teacher_id": 2,
        "absent_teacher_name": "Dr. K. Raman",
        "absent_reason": "Casual Leave - State Science Fair Jury Member",
        "date": "Today, 16 Oct 2026",
        "period_number": 6,
        "time_slot": "01:45 PM - 02:30 PM",
        "class_name": "Class 10-A",
        "subject": "Chemistry Lab",
        "substitute_teacher_id": None,
        "substitute_teacher_name": None,
        "status": "Unassigned",
        "priority": "High"
    }
]

_available_faculty = [
    {
        "id": 4,
        "name": "Mr. Deepak Rao",
        "department": "Humanities & English",
        "free_periods_today": 3,
        "is_subject_match": True,
        "current_status": "Free (Period 2 & 4)"
    },
    {
        "id": 5,
        "name": "Ms. Sunita Roy",
        "department": "Sciences & Biology",
        "free_periods_today": 2,
        "is_subject_match": True,
        "current_status": "Free (Period 4 & 6)"
    },
    {
        "id": 6,
        "name": "Mr. Arvind Swamy",
        "department": "Mathematics",
        "free_periods_today": 4,
        "is_subject_match": True,
        "current_status": "Free (Period 2 & 5)"
    },
    {
        "id": 7,
        "name": "Mrs. Shalini Nair",
        "department": "Computer Science",
        "free_periods_today": 2,
        "is_subject_match": False,
        "current_status": "Free (Period 4 & 6)"
    }
]

@router.get("/substitutions", response_model=list[SubstitutionSlotResponse])
async def list_substitution_slots():
    return _substitutions_slots

@router.get("/substitutions/available-faculty", response_model=list[AvailableFacultyItem])
async def list_available_faculty():
    return _available_faculty

@router.post("/substitutions/assign")
async def assign_substitution(req: AssignSubstitutionRequest):
    for slot in _substitutions_slots:
        if slot["id"] == req.slot_id:
            slot["substitute_teacher_id"] = req.substitute_teacher_id
            slot["substitute_teacher_name"] = req.substitute_teacher_name
            slot["status"] = "Assigned"
            
            # Sync to proxy teacher's personal schedule
            try:
                from app.routers.teacher import inject_substitution_period
                inject_substitution_period(
                    period_num=slot["period_number"],
                    class_name=slot["class_name"],
                    subject=slot["subject"],
                    absent_teacher=slot["absent_teacher_name"],
                    time_slot=slot["time_slot"]
                )
            except Exception:
                pass

            # Auto-complete any pending coordinator tasks for this teacher/slot
            for task in _in_memory_tasks:
                if task.get("is_auto_generated") and slot["absent_teacher_name"] in task.get("title", ""):
                    task["status"] = "Completed"
            
            _add_audit_log(
                actor_name="Academic Coordinator",
                actor_role="academic_coordinator",
                action_type="SUBSTITUTION_ASSIGN",
                target_entity=f"Period {slot['period_number']} ({slot['class_name']} {slot['subject']})",
                status="VERIFIED",
                details=f"Assigned {req.substitute_teacher_name} as proxy for absent faculty {slot['absent_teacher_name']}."
            )
            return {
                "success": True,
                "message": f"Successfully assigned {req.substitute_teacher_name} to {slot['class_name']} {slot['subject']} (Period {slot['period_number']})",
                "slot": slot
            }
    raise HTTPException(status_code=404, detail="Substitution slot not found")

@router.post("/substitutions/auto-resolve")
async def auto_resolve_substitutions():
    resolved_count = 0
    for slot in _substitutions_slots:
        if slot["status"] == "Unassigned":
            # Find matching available faculty
            match = next((f for f in _available_faculty if f["is_subject_match"] and f["free_periods_today"] > 0), None)
            if not match:
                match = next((f for f in _available_faculty if f["free_periods_today"] > 0), None)
            if match:
                slot["substitute_teacher_id"] = match["id"]
                slot["substitute_teacher_name"] = match["name"]
                slot["status"] = "Assigned"
                match["free_periods_today"] -= 1
                resolved_count += 1
                
                try:
                    from app.routers.teacher import inject_substitution_period
                    inject_substitution_period(
                        period_num=slot["period_number"],
                        class_name=slot["class_name"],
                        subject=slot["subject"],
                        absent_teacher=slot["absent_teacher_name"],
                        time_slot=slot["time_slot"]
                    )
                except Exception:
                    pass

                # Auto-complete matching task
                for task in _in_memory_tasks:
                    if task.get("is_auto_generated") and slot["absent_teacher_name"] in task.get("title", ""):
                        task["status"] = "Completed"
    
    _add_audit_log(
        actor_name="AI Timetable Governor",
        actor_role="system",
        action_type="SUBSTITUTION_AUTO_RESOLVE",
        target_entity="All Unassigned Slots",
        status="VERIFIED",
        details=f"Auto-resolved {resolved_count} timetable proxy gaps based on free-period optimization."
    )
    return {
        "success": True,
        "message": f"Auto-resolved {resolved_count} unmanned class periods with optimal faculty matches.",
        "slots": _substitutions_slots
    }

# --- 9. Security & Regulatory Compliance Audit Trail ---
_security_audit_logs = [
    {
        "id": 1,
        "timestamp": "Today, 08:32 AM",
        "actor_name": "Super Administrator (Bhargav)",
        "actor_role": "admin",
        "action_type": "DOCUMENT_UPLOAD",
        "target_entity": "Student #1 (Aarav Sharma)",
        "ip_address": "192.168.1.10",
        "status": "VERIFIED",
        "details": "Uploaded verified Bonafide Certificate & Seal for passport verification."
    },
    {
        "id": 2,
        "timestamp": "Today, 08:15 AM",
        "actor_name": "Accounts Officer (Rekha S.)",
        "actor_role": "admin",
        "action_type": "FEE_REMINDER_DISPATCH",
        "target_entity": "Student #2 (Rohan Deshmukh)",
        "ip_address": "192.168.1.18",
        "status": "VERIFIED",
        "details": "Triggered WhatsApp reminder for Milestone 2 dues (₹24,000)."
    },
    {
        "id": 3,
        "timestamp": "Yesterday, 04:30 PM",
        "actor_name": "Principal & Legal Trustee",
        "actor_role": "admin",
        "action_type": "EXIT_TC_APPROVAL",
        "target_entity": "Student #2 (Karan Malhotra)",
        "ip_address": "192.168.1.5",
        "status": "VERIFIED",
        "details": "Dual-sign verified: Physical handover register scan permanently locked in vault."
    },
    {
        "id": 4,
        "timestamp": "Yesterday, 02:14 PM",
        "actor_name": "Academic Registrar",
        "actor_role": "admin",
        "action_type": "SIS_RECORD_EDIT",
        "target_entity": "Student #3 (Meera Nambiar)",
        "ip_address": "192.168.1.14",
        "status": "VERIFIED",
        "details": "Updated emergency contact and blood group to B+ with doctor letter."
    },
    {
        "id": 5,
        "timestamp": "14 Oct 2026, 11:20 AM",
        "actor_name": "System Security Watchdog",
        "actor_role": "system",
        "action_type": "DOCUMENT_DOWNLOAD_AUDIT",
        "target_entity": "Official Transfer Certificate #2026-08",
        "ip_address": "49.207.210.12",
        "status": "VERIFIED",
        "details": "Verified authenticated single-use download token generated for verified parent."
    }
]

def _add_audit_log(actor_name: str, actor_role: str, action_type: str, target_entity: str, status: str, details: str):
    new_log = {
        "id": len(_security_audit_logs) + 1,
        "timestamp": f"Today, {datetime.datetime.utcnow().strftime('%I:%M %p')}",
        "actor_name": actor_name,
        "actor_role": actor_role,
        "action_type": action_type,
        "target_entity": target_entity,
        "ip_address": "192.168.1.10",
        "status": status,
        "details": details
    }
    _security_audit_logs.insert(0, new_log)

@router.get("/audit-logs", response_model=list[SecurityAuditLogResponse])
async def list_security_audit_logs():
    return _security_audit_logs

@router.post("/audit-logs/export")
async def export_security_audit_logs():
    return {
        "success": True,
        "export_url": "/api/admin/audit-logs/export/cbse-compliance-2026.csv",
        "records_count": len(_security_audit_logs),
        "checksum": "SHA256:7f9a2b8e3c1d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"
    }

# --- 10. Academic Promotion & Annual Rollover Engine ---
_rollover_classes = [
    {
        "class_id": 1,
        "from_class": "Class 1-A",
        "to_class": "Class 2-A",
        "total_students": 30,
        "eligible_for_promotion": 30,
        "retention_review": 0,
        "tc_requested": 0,
        "status": "Ready to Roll"
    },
    {
        "class_id": 2,
        "from_class": "Class 3-A (Junior K-5)",
        "to_class": "Class 4-A (Junior K-5)",
        "total_students": 32,
        "eligible_for_promotion": 31,
        "retention_review": 1,
        "tc_requested": 0,
        "status": "Pending Review"
    },
    {
        "class_id": 3,
        "from_class": "Class 8-A",
        "to_class": "Class 9-A",
        "total_students": 35,
        "eligible_for_promotion": 33,
        "retention_review": 1,
        "tc_requested": 1,
        "status": "Pending Review"
    },
    {
        "class_id": 4,
        "from_class": "Class 9-B",
        "to_class": "Class 10-B (Board Year)",
        "total_students": 34,
        "eligible_for_promotion": 34,
        "retention_review": 0,
        "tc_requested": 0,
        "status": "Ready to Roll"
    }
]

@router.get("/rollover/preview", response_model=list[AcademicRolloverClassResponse])
async def get_rollover_preview():
    return _rollover_classes

@router.post("/rollover/promote")
async def execute_academic_rollover(req: ExecuteRolloverRequest):
    for c in _rollover_classes:
        if c["class_id"] == req.class_id:
            c["status"] = "Rolled Over"
            _add_audit_log(
                actor_name="Academic Dean & Super Admin",
                actor_role="admin",
                action_type="ACADEMIC_ROLLOVER",
                target_entity=f"{c['from_class']} -> {c['to_class']}",
                status="VERIFIED",
                details=f"Batch promoted {c['eligible_for_promotion']} students to {c['to_class']} for Academic Year {req.academic_year}."
            )
            return {
                "success": True,
                "message": f"Successfully completed academic rollover for {c['from_class']} -> {c['to_class']} ({c['eligible_for_promotion']} students promoted).",
                "class": c
            }
    raise HTTPException(status_code=404, detail="Class rollover target not found")

# --- 11. Academic Curriculum Pacing Engine ---
_curriculum_pacing_items = [
    {
        "id": 1,
        "class_name": "Class 8-B",
        "subject": "Mathematics",
        "teacher_name": "Mrs. Ananya Verma",
        "completed_units": 18,
        "total_units": 22,
        "calendar_target_units": 18,
        "completion_pct": 81.8,
        "status": "On Track",
        "last_lesson_title": "Linear Equations in Two Variables (Practice Ex 3.4)",
        "next_milestone_date": "24 Oct 2026 (Unit Assessment 3)"
    },
    {
        "id": 2,
        "class_name": "Class 8-B",
        "subject": "Science",
        "teacher_name": "Dr. Suresh Babu",
        "completed_units": 14,
        "total_units": 20,
        "calendar_target_units": 16,
        "completion_pct": 70.0,
        "status": "Lagging (2 Units Behind)",
        "last_lesson_title": "Light & Reflection Principles",
        "next_milestone_date": "28 Oct 2026 (Mid-Term Lab Practical)"
    },
    {
        "id": 3,
        "class_name": "Class 9-A",
        "subject": "English Literature",
        "teacher_name": "Mrs. Neha Roy",
        "completed_units": 16,
        "total_units": 18,
        "calendar_target_units": 15,
        "completion_pct": 88.9,
        "status": "Ahead (+1 Unit)",
        "last_lesson_title": "The Road Not Taken - Critical Appreciation",
        "next_milestone_date": "30 Oct 2026 (Poetry Essay Submission)"
    },
    {
        "id": 4,
        "class_name": "Class 10-A",
        "subject": "Social Studies",
        "teacher_name": "Mr. Arvind Saxena",
        "completed_units": 21,
        "total_units": 24,
        "calendar_target_units": 20,
        "completion_pct": 87.5,
        "status": "On Track",
        "last_lesson_title": "Federalism & Decentralization in India",
        "next_milestone_date": "05 Nov 2026 (Pre-Board Milestone 1)"
    },
    {
        "id": 5,
        "class_name": "Class 10-B",
        "subject": "Physics",
        "teacher_name": "Dr. Radhika Sen",
        "completed_units": 19,
        "total_units": 20,
        "calendar_target_units": 18,
        "completion_pct": 95.0,
        "status": "Ahead (+1 Unit)",
        "last_lesson_title": "Magnetic Effects of Electric Current",
        "next_milestone_date": "02 Nov 2026 (Board Numerical Workshop)"
    },
    {
        "id": 6,
        "class_name": "Class 7-A",
        "subject": "Hindi",
        "teacher_name": "Mrs. Rekha Sharma",
        "completed_units": 12,
        "total_units": 18,
        "calendar_target_units": 14,
        "completion_pct": 66.7,
        "status": "Lagging (2 Units Behind)",
        "last_lesson_title": "Grammar: Sandhi and Samas",
        "next_milestone_date": "26 Oct 2026 (Class Diagnostic Quiz)"
    }
]

@router.get("/academic/curriculum-pacing", response_model=list[CurriculumPacingItem])
async def get_curriculum_pacing():
    return _curriculum_pacing_items

@router.post("/academic/curriculum-pacing/{item_id}/log-lesson")
async def log_curriculum_lesson(item_id: int, req: LogLessonRequest):
    for item in _curriculum_pacing_items:
        if item["id"] == item_id:
            new_completed = min(item["total_units"], item["completed_units"] + req.units_to_add)
            item["completed_units"] = new_completed
            pct = round((new_completed / item["total_units"]) * 100, 1)
            item["completion_pct"] = pct
            
            diff = new_completed - item["calendar_target_units"]
            if diff >= 1:
                item["status"] = f"Ahead (+{diff} Unit{'s' if diff > 1 else ''})"
            elif diff < 0:
                item["status"] = f"Lagging ({abs(diff)} Unit{'s' if abs(diff) > 1 else ''} Behind)"
            else:
                item["status"] = "On Track"
                
            if req.lesson_title:
                item["last_lesson_title"] = req.lesson_title
                
            _add_audit_log(
                actor_name="Academic Coordinator",
                actor_role="academic_coordinator",
                action_type="CURRICULUM_PACING_UPDATE",
                target_entity=f"{item['class_name']} {item['subject']}",
                status="VERIFIED",
                details=f"Logged unit completion: {item['completed_units']}/{item['total_units']} ({item['completion_pct']}%, status: {item['status']})"
            )
            return {"success": True, "item": item}
    raise HTTPException(status_code=404, detail="Curriculum pacing item not found")

@router.post("/academic/curriculum-pacing/{item_id}/intervene")
async def create_curriculum_intervention(item_id: int):
    for item in _curriculum_pacing_items:
        if item["id"] == item_id:
            new_task_id = max([t["id"] for t in _in_memory_tasks], default=0) + 1
            intervention_task = {
                "id": new_task_id,
                "title": f"Curriculum Remediation: {item['class_name']} {item['subject']}",
                "description": f"Syllabus pacing is lagging ({item['completed_units']}/{item['total_units']} vs target {item['calendar_target_units']}). Review lesson planner with {item['teacher_name']} and schedule zero-hour catchup session.",
                "category": "urgent",
                "domain": "academic",
                "due_date": "Tomorrow, 4:00 PM",
                "assigned_to": item["teacher_name"],
                "assigned_to_role": "teacher",
                "created_by_name": "Prof. Rajeshwari Nair",
                "created_by_role": "academic_coordinator",
                "status": "Pending",
                "priority": "High",
                "sla_hours": 48,
                "is_auto_generated": True,
                "created_at": "Today, 01:45 PM",
                "is_escalated": False
            }
            _in_memory_tasks.insert(0, intervention_task)
            
            _add_audit_log(
                actor_name="Academic Coordinator",
                actor_role="academic_coordinator",
                action_type="CURRICULUM_INTERVENTION_TASK",
                target_entity=f"{item['class_name']} {item['subject']}",
                status="VERIFIED",
                details=f"Created urgent pacing remediation task for faculty {item['teacher_name']}."
            )
            return {"success": True, "task": intervention_task, "message": f"Remediation task created for {item['teacher_name']}"}
    raise HTTPException(status_code=404, detail="Curriculum pacing item not found")

# --- 12. Institutional PTM Governance Engine ---
_ptm_governance_data = {
    "active_event_title": "Term-2 Mid-Term Parent-Teacher Meeting",
    "event_date": "Saturday, 24 Oct 2026",
    "time_window": "09:00 AM – 01:00 PM",
    "slot_duration_mins": 10,
    "total_teachers": 30,
    "published_teachers_count": 28,
    "readiness_percentage": 93.3,
    "unready_teachers": ["Dr. Suresh Babu (Science)", "Mrs. Rekha Sharma (Hindi)"],
    "focus_students_requiring_brief": 6
}

_declared_ptm_events = [
    {
        "id": 1,
        "title": "Term-2 Mid-Term Parent-Teacher Meeting",
        "academic_term": "Term 2",
        "start_date": "2026-10-24",
        "end_date": "2026-10-24",
        "start_time": "09:00 AM",
        "end_time": "01:00 PM",
        "slot_duration_mins": 10,
        "target_classes": ["Class 8-A", "Class 8-B", "Class 9-A", "Class 9-B"],
        "status": "Open_For_Parents",
        "created_by_name": "Academic Coordinator",
        "created_at": datetime.datetime.utcnow()
    }
]

@router.get("/ptm/events", response_model=List[PTMEventResponse])
async def list_ptm_events():
    return _declared_ptm_events

@router.post("/ptm/events", response_model=PTMEventResponse)
async def declare_ptm_event(req: PTMEventCreate, db: AsyncSession = Depends(get_db)):
    new_id = len(_declared_ptm_events) + 1
    event_dict = {
        "id": new_id,
        "title": req.title,
        "academic_term": req.academic_term or "Term 1",
        "start_date": req.start_date,
        "end_date": req.end_date,
        "start_time": req.start_time or "09:00 AM",
        "end_time": req.end_time or "01:00 PM",
        "slot_duration_mins": req.slot_duration_mins or 10,
        "target_classes": req.target_classes,
        "status": "Open_For_Parents",
        "created_by_name": "Prof. Rajeshwari Nair",
        "created_at": datetime.datetime.utcnow()
    }
    _declared_ptm_events.insert(0, event_dict)
    
    # Dynamically update governance status
    _ptm_governance_data["active_event_title"] = req.title
    _ptm_governance_data["event_date"] = f"{req.start_date} to {req.end_date}" if req.start_date != req.end_date else req.start_date
    _ptm_governance_data["time_window"] = f"{req.start_time} – {req.end_time}"
    _ptm_governance_data["slot_duration_mins"] = req.slot_duration_mins or 10
    _ptm_governance_data["readiness_percentage"] = 85.0
    _ptm_governance_data["published_teachers_count"] = 25
    _ptm_governance_data["unready_teachers"] = ["Dr. Suresh Babu (Science)", "Mrs. Rekha Sharma (Hindi)"]
    
    # Broadcast Mandate Tasks to Teachers of Declared Classes
    for teacher_name in ["Mrs. Ananya Verma", "Dr. Suresh Babu", "Mrs. Neha Roy", "Mr. Arvind Saxena"]:
        mandate_task = AdminTask(
            title=f"PTM Mandate: Publish Slots for {req.title}",
            description=f"Institutional PTM declared for {', '.join(req.target_classes)} on {_ptm_governance_data['event_date']} ({_ptm_governance_data['time_window']}). Confirm your {req.slot_duration_mins}-min slots for parent self-booking.",
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
    
    _add_audit_log(
        actor_name="Prof. Rajeshwari Nair",
        actor_role="academic_coordinator",
        action_type="PTM_EVENT_DECLARED",
        target_entity=req.title,
        status="VERIFIED",
        details=f"Declared PTM on {req.start_date} for {', '.join(req.target_classes)}. Broadcasted slot opening alerts to faculty and parents."
    )
    
    return event_dict

@router.get("/ptm/governance", response_model=PTMGovernanceStatus)
async def get_ptm_governance():
    return _ptm_governance_data

@router.post("/ptm/remind-unready")
async def remind_unready_ptm_teachers(db: AsyncSession = Depends(get_db)):
    unready = ["Dr. Suresh Babu", "Mrs. Rekha Sharma"]
    for t_name in unready:
        new_task = AdminTask(
            title=f"URGENT PTM SLA: Publish Available 10-Min Slots",
            description="The Academic Office has opened PTM slot booking for parents. You must publish your available slots for Saturday 24 Oct immediately.",
            category="urgent",
            domain="academic",
            due_date="Today, 05:00 PM",
            assigned_to=t_name,
            assigned_to_role="teacher",
            created_by_name="Prof. Rajeshwari Nair",
            created_by_role="academic_coordinator",
            status="Pending",
            priority="Critical",
            sla_hours=6,
            is_auto_generated=True,
            task_type="PTM_SLOT_PUBLISHING"
        )
        db.add(new_task)
    await db.commit()
    
    _add_audit_log(
        actor_name="Prof. Rajeshwari Nair",
        actor_role="academic_coordinator",
        action_type="PTM_READINESS_REMINDER_BROADCAST",
        target_entity="Unready Faculty (Dr. Suresh Babu, Mrs. Rekha Sharma)",
        status="VERIFIED",
        details="Dispatched urgent 6-hour SLA task to publish PTM slots before parent booking deadline."
    )
    return {"success": True, "message": "Dispatched urgent 6-hour SLA task to 2 defaulting teachers"}


