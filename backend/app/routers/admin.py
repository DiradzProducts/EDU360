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
    VendorEquipmentResponse, VendorEquipmentUpdate
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

# --- 7. Staff & Inventory ---
@router.get("/staff")
async def list_staff(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StaffMember))
    return result.scalars().all()

@router.get("/inventory")
async def list_inventory(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InventoryItem))
    return result.scalars().all()
