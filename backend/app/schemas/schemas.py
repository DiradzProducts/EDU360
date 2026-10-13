from typing import List, Optional, Any
from pydantic import BaseModel
import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: str
    role: str
    school_code: Optional[str] = "EDU-GLOBAL-360"
    avatar: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class SchoolCodeVerifyRequest(BaseModel):
    code: str

class SchoolCodeVerifyResponse(BaseModel):
    valid: bool
    school_name: str
    code: str
    campus_city: str
    affiliation: str

class UserRegisterRequest(BaseModel):
    school_code: str
    name: str
    email: str
    password: str
    role: str
    identifier: Optional[str] = None
    phone: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str
    password: str
    school_code: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    message: str
    user: UserResponse
    portal_redirect: str

# --- Student Schemas ---
class StudentBase(BaseModel):
    name: str
    roll_no: str
    class_name: str
    section: str
    admission_no: str
    guardian_name: str
    guardian_phone: str
    guardian_email: str
    attendance_pct: float
    bus_route_id: Optional[int] = None
    academic_average_pct: float = 78.4
    status: str = "Active"

class StudentResponse(StudentBase):
    id: int
    user_id: Optional[int] = None
    class Config:
        from_attributes = True

# --- Official Document Schemas ---
class OfficialDocumentBase(BaseModel):
    title: str
    doc_type: str
    file_url: str
    is_official: bool = True
    uploaded_by_role: str = "admin"
    status: str = "Verified"
    verified_stamp: str = "EDU360 Official Seal"

class OfficialDocumentCreate(OfficialDocumentBase):
    student_id: int

class OfficialDocumentResponse(OfficialDocumentBase):
    id: int
    student_id: int
    upload_date: datetime.datetime
    class Config:
        from_attributes = True

# --- Triage Alert Schemas ---
class TriageAlertBase(BaseModel):
    level: str
    category: str
    title: str
    description: str
    count_affected: int
    action_label: str
    action_endpoint: str
    resolved: bool = False
    resolution_note: Optional[str] = None

class TriageActionRequest(BaseModel):
    action_type: str
    notes: Optional[str] = None

class TriageAlertResponse(TriageAlertBase):
    id: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# --- Admin Task Schemas ---
class AdminTaskCreate(BaseModel):
    title: str
    category: str = "urgent"
    due_date: str
    assigned_to: str
    priority: str = "High"

class AdminTaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None

class AdminTaskResponse(BaseModel):
    id: int
    title: str
    category: str
    due_date: str
    assigned_to: str
    status: str
    priority: str
    class Config:
        from_attributes = True

# --- CRM Schemas ---
class AdmissionEnquiryCreate(BaseModel):
    student_name: str
    parent_name: str
    email: str
    phone: str
    target_grade: str
    notes: Optional[str] = None

class AdmissionEnquiryUpdate(BaseModel):
    stage: Optional[str] = None
    notes: Optional[str] = None

class AdmissionEnquiryResponse(BaseModel):
    id: int
    student_name: str
    parent_name: str
    email: str
    phone: str
    target_grade: str
    stage: str
    chat_transcript: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# --- Event Schemas ---
class EventResponse(BaseModel):
    id: int
    title: str
    date: str
    location: str
    description: str
    banner_url: Optional[str] = None
    status: str
    class Config:
        from_attributes = True

class EventAssignmentResponse(BaseModel):
    id: int
    event_id: int
    staff_id: int
    staff_name: str
    committee_role: str
    student_volunteers: Optional[str] = None
    class Config:
        from_attributes = True

class VendorEquipmentUpdate(BaseModel):
    status: Optional[str] = None
    handover_timestamp: Optional[str] = None
    returned_timestamp: Optional[str] = None
    notes: Optional[str] = None

class VendorEquipmentResponse(BaseModel):
    id: int
    event_id: int
    equipment_name: str
    vendor_name: str
    vendor_phone: str
    status: str
    handover_timestamp: Optional[str] = None
    returned_timestamp: Optional[str] = None
    notes: Optional[str] = None
    class Config:
        from_attributes = True

# --- Exit Clearance Schemas ---
class ExitClearanceDigitalSign(BaseModel):
    parent_confirmation: bool
    confirmation_text: str

class ExitClearancePhysicalUpload(BaseModel):
    physical_scan_url: str

class ExitClearanceResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    class_name: str
    fee_cleared: bool
    library_cleared: bool
    inventory_cleared: bool
    tc_ready: bool
    digital_parent_approved: bool
    digital_approval_timestamp: Optional[str] = None
    physical_scan_url: Optional[str] = None
    physical_sign_verified: bool
    status: str
    class Config:
        from_attributes = True

# --- Live Class & Attendance Schemas ---
class LiveClassResponse(BaseModel):
    id: int
    title: str
    subject: str
    class_name: str
    teacher_id: int
    teacher_name: str
    scheduled_time: str
    duration_mins: int
    status: str
    meet_url: Optional[str] = None
    class Config:
        from_attributes = True

class AttendanceJoinSimulate(BaseModel):
    student_id: int
    minutes_elapsed: float  # e.g., 5.0 for on time, 12.5 for late

class AttendanceOverride(BaseModel):
    status: str  # Present, Late, Absent

class AttendanceRecordResponse(BaseModel):
    id: int
    class_id: Optional[int] = None
    student_id: int
    student_name: str
    join_timestamp: Optional[str] = None
    minutes_late: float
    status: str
    teacher_override: bool
    date: str
    class Config:
        from_attributes = True

# --- Homework Schemas ---
class HomeworkResponse(BaseModel):
    id: int
    title: str
    subject: str
    class_name: str
    description: str
    due_date: str
    teacher_id: int
    teacher_name: str
    max_marks: int
    class Config:
        from_attributes = True

class HomeworkSubmissionGrade(BaseModel):
    marks_obtained: float
    teacher_remarks: str
    annotations_json: str  # Drawing strokes, stamps, and remarks
    annotated_file_url: Optional[str] = None

class HomeworkSubmissionResponse(BaseModel):
    id: int
    homework_id: int
    student_id: int
    student_name: str
    original_file_url: str
    annotated_file_url: Optional[str] = None
    annotations_json: Optional[str] = None
    marks_obtained: Optional[float] = None
    teacher_remarks: Optional[str] = None
    status: str
    submitted_at: datetime.datetime
    graded_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

# --- Focus Table Schemas ---
class FocusTableUpdate(BaseModel):
    status: Optional[str] = None
    teacher_action: Optional[str] = None
    parent_check_completed: Optional[bool] = None

class FocusTableResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    subject: str
    weak_concept: str
    current_score_pct: float
    target_score_pct: float
    revision_plan_json: str
    teacher_action: str
    parent_check_completed: bool
    status: str
    updated_at: datetime.datetime
    class Config:
        from_attributes = True

# --- Leave Request Schemas ---
class LeaveRequestCreate(BaseModel):
    student_id: int
    student_name: str
    parent_name: str
    from_date: str
    to_date: str
    reason: str

class LeaveRequestReview(BaseModel):
    status: str  # Approved or Rejected
    teacher_notes: Optional[str] = None

class LeaveRequestResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    parent_name: str
    from_date: str
    to_date: str
    reason: str
    status: str
    teacher_notes: Optional[str] = None
    applied_at: datetime.datetime
    class Config:
        from_attributes = True

# --- Fee Schemas ---
class FeePayRequest(BaseModel):
    payment_method: str = "UPI"  # UPI, Card, NetBanking

class FeeMilestoneResponse(BaseModel):
    id: int
    student_id: int
    title: str
    amount: float
    due_date: str
    status: str
    receipt_no: Optional[str] = None
    paid_at: Optional[str] = None
    payment_method: Optional[str] = None
    class Config:
        from_attributes = True

# --- Bus Route Schemas ---
class BusRouteResponse(BaseModel):
    id: int
    route_number: str
    driver_name: str
    driver_phone: str
    vehicle_no: str
    stops_json: str
    current_stop_idx: int
    live_status: str
    eta_mins: int
    class Config:
        from_attributes = True

# --- Student Portfolio Schemas ---
class StudentPortfolioCreate(BaseModel):
    student_id: int
    category: str
    title: str
    event_name: str
    date: str
    proof_url: Optional[str] = None
    description: Optional[str] = None

class StudentPortfolioResponse(BaseModel):
    id: int
    student_id: int
    category: str
    title: str
    event_name: str
    date: str
    proof_url: Optional[str] = None
    verified_by_school: bool
    description: Optional[str] = None
    class Config:
        from_attributes = True

# --- Class Recording Schemas ---
class ClassRecordingResponse(BaseModel):
    id: int
    title: str
    subject: str
    chapter: str
    teacher_name: str
    duration: str
    video_url: str
    thumbnail: Optional[str] = None
    date: str
    class Config:
        from_attributes = True
