import datetime
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.core.database import get_db
from app.models.models import (
    TriageAlert, AdminTask, AdmissionEnquiry, Student, OfficialDocument,
    ExitClearance, Event, EventStaffAssignment, VendorEquipment,
    StaffMember, InventoryItem
)
from app.schemas.schemas import (
    TriageAlertResponse, TriageActionRequest,
    AdminTaskResponse, AdminTaskCreate, AdminTaskUpdate,
    AdmissionEnquiryResponse, AdmissionEnquiryCreate, AdmissionEnquiryUpdate,
    StudentResponse, OfficialDocumentResponse, OfficialDocumentCreate,
    ExitClearanceResponse, ExitClearancePhysicalUpload,
    EventResponse, EventAssignmentResponse,
    VendorEquipmentResponse, VendorEquipmentUpdate,
    SubstitutionSlotResponse, AssignSubstitutionRequest, AvailableFacultyItem,
    SecurityAuditLogResponse, FeeFinancialAnalyticsResponse,
    AcademicRolloverClassResponse, ExecuteRolloverRequest
)

router = APIRouter(prefix="/api/admin", tags=["admin"])

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

# --- 2. Admin Task Manager ---
@router.get("/tasks", response_model=list[AdminTaskResponse])
async def list_admin_tasks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminTask).order_by(AdminTask.status.desc(), AdminTask.id.asc()))
    return result.scalars().all()

@router.post("/tasks", response_model=AdminTaskResponse)
async def create_admin_task(task_in: AdminTaskCreate, db: AsyncSession = Depends(get_db)):
    new_task = AdminTask(**task_in.model_dump())
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

@router.patch("/tasks/{task_id}", response_model=AdminTaskResponse)
async def update_admin_task(task_id: int, task_up: AdminTaskUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminTask).where(AdminTask.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task_up.status is not None:
        task.status = task_up.status
    if task_up.priority is not None:
        task.priority = task_up.priority
    await db.commit()
    await db.refresh(task)
    return task

# --- 3. Admissions CRM ---
@router.get("/crm/enquiries", response_model=list[AdmissionEnquiryResponse])
async def list_enquiries(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdmissionEnquiry).order_by(AdmissionEnquiry.created_at.desc()))
    return result.scalars().all()

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
    await db.commit()
    await db.refresh(enquiry)
    return enquiry

@router.post("/crm/enquiries/{enquiry_id}/convert")
async def convert_enquiry_to_student(enquiry_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdmissionEnquiry).where(AdmissionEnquiry.id == enquiry_id))
    enquiry = result.scalars().first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    enquiry.stage = "converted"
    enquiry.notes = (enquiry.notes or "") + " | Converted to Active SIS Student Profile"
    
    # Generate Admission Number and create Student record
    adm_no = f"EDU-{datetime.datetime.utcnow().year}-{enquiry_id + 100:03d}"
    new_student = Student(
        name=enquiry.student_name,
        roll_no=str(enquiry_id + 30),
        class_name=enquiry.target_grade,
        section="A",
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
    await db.commit()
    await db.refresh(new_student)
    
    return {
        "success": True,
        "message": f"Successfully enrolled {new_student.name} into SIS ({new_student.class_name}-{new_student.section}) with Admission #{adm_no}",
        "student": new_student
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
            "name": i.name,
            "category": i.category,
            "total_stock": i.total_quantity,
            "issued_count": i.issued_quantity,
            "damaged_count": i.damaged_quantity,
            "location": "Main Store Room / Block B",
            "last_audited": "05 Oct 2026",
            "status": i.status
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
async def review_teacher_permission(perm_id: int, req: dict):
    status = req.get("status", "Approved")
    for p in _teacher_permissions:
        if p["id"] == perm_id:
            p["status"] = status
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
            
            _add_audit_log(
                actor_name="Academic Vice Principal",
                actor_role="admin",
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

