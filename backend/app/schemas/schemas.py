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
    grade_tier: Optional[str] = None
    is_junior_k5: Optional[bool] = None
    student_id: Optional[int] = None
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
    grade_tier: Optional[str] = "secondary"
    is_junior_k5: Optional[bool] = False
    student_id: Optional[int] = None

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
    grade_tier: str = "secondary"
    age: Optional[int] = 14
    avatar_character_url: Optional[str] = None

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
class HomeworkCreate(BaseModel):
    title: str
    subject: str
    class_name: str
    description: str
    task_type: str = "DAILY_HOMEWORK"  # DAILY_HOMEWORK or ASSIGNMENT
    due_date: str
    due_time: str = "17:00"
    teacher_id: int = 1
    teacher_name: str = "Mrs. Ananya Verma"
    max_marks: int = 20
    resource_url: Optional[str] = None
    weightage: Optional[str] = None
    progress_pct: Optional[float] = 0.0

class HomeworkResponse(BaseModel):
    id: int
    title: str
    subject: str
    class_name: str
    description: str
    task_type: str = "DAILY_HOMEWORK"
    due_date: str
    due_time: str = "17:00"
    status: str = "PENDING"
    assigned_date: Optional[str] = None
    teacher_id: int
    teacher_name: str
    max_marks: int
    resource_url: Optional[str] = None
    weightage: Optional[str] = None
    progress_pct: Optional[float] = 0.0
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
    late_submission: bool = False
    is_backlog: bool = False
    class Config:
        from_attributes = True

class BacklogEventResponse(BaseModel):
    id: int
    student_id: int
    homework_id: int
    focus_table_id: Optional[int] = None
    evidence_code: str
    subject: str
    title: str
    task_type: str
    due_date: str
    due_time: str
    status: str
    detected_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None
    late_submission: bool = False
    teacher_name: Optional[str] = None
    notes: Optional[str] = None
    class Config:
        from_attributes = True

class AcademicComplianceResponse(BaseModel):
    student_id: int
    student_name: str
    total_assigned: int
    on_time_submissions: int
    late_submissions: int
    backlog_count: int
    compliance_pct: float
    itemized_backlogs: list[BacklogEventResponse]

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
    backlog_count: int = 0
    academic_compliance_json: Optional[str] = None
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

# --- Junior Gamification Schemas (K-5 Junior Explorer) ---

class GamificationProfileResponse(BaseModel):
    id: int
    student_id: int
    level: int
    level_title: str
    xp_points: int
    total_stars: int
    attendance_streak_days: int
    sound_effects_enabled: bool
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

class DailyQuestResponse(BaseModel):
    id: int
    student_id: int
    title: str
    subject: str
    xp_reward: int
    stars_reward: int
    status: str
    teacher_reaction: str
    proof_image_url: Optional[str] = None
    due_date: str
    created_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

class DailyQuestCreate(BaseModel):
    student_id: int
    title: str
    subject: str
    xp_reward: int = 25
    stars_reward: int = 50
    due_date: str
    teacher_reaction: Optional[str] = "Super Star! ⭐ - Ms. Priya"
    proof_image_url: Optional[str] = None

class DailyQuestCompleteRequest(BaseModel):
    proof_image_url: Optional[str] = None

class DailyQuestCompleteResponse(BaseModel):
    success: bool
    message: str
    quest_id: int
    status: str
    awarded_stars: int
    awarded_xp: int
    total_stars: int
    xp_points: int
    level: int

class MagicBoosterChestResponse(BaseModel):
    id: int
    student_id: int
    concept_title: str
    day_number: int
    day_task_title: str
    status: str  # completed_claimed, ready_to_open, locked
    chest_stars: int
    parent_signed: bool
    created_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

class ChestUnlockRequest(BaseModel):
    notes: Optional[str] = None

class CelebrationPayload(BaseModel):
    trigger: str = "sparkles_and_confetti"
    badge: str = "Treasure Hunter ⭐"
    sound_effect: str = "treasure_fanfare.mp3"
    animation: str = "golden_glow_burst"
    dialog_title: str = "Chest Unlocked! 🎉"
    dialog_message: str = "You earned shiny stars and bonus XP!"

class ChestUnlockResponse(BaseModel):
    success: bool
    message: str
    chest_id: int
    status: str
    awarded_stars: int
    awarded_xp: int
    total_stars: int
    xp_points: int
    level: int
    level_title: str
    level_up: bool
    celebration: CelebrationPayload

class SoundToggleRequest(BaseModel):
    sound_effects_enabled: bool

class AdventureTimetableItem(BaseModel):
    id: int
    time: str
    title: str
    subject: str
    island_theme: str  # Phonics Island, Number Castle, Snack Oasis, Art Treehouse
    mascot_at_node: bool
    icon: str
    duration_mins: int = 45
    teacher_name: str
    room: str = "Rainbow Hall"
    completed: bool = False

class BusCoords(BaseModel):
    lat: float
    lng: float

class JuniorBusRadarResponse(BaseModel):
    route_no: str
    driver_name: str
    driver_phone: str
    eta_mins: int
    stops_away: int
    current_coords: BusCoords
    is_moving: bool
    vehicle_no: str = "KA-01-EB-4412"
    current_stop_name: str = "Bellandur EcoSpace Gate 2"
    next_stop_name: str = "Sector 15 Crossroad (Child Stop)"
    bus_mascot_icon: str = "🚌✨"
    status_badge: str = "On Safe Track"

class JuniorDashboardOverviewResponse(BaseModel):
    student_id: int
    student_name: str
    class_name: str
    grade_tier: str
    avatar_character_url: Optional[str] = None
    profile: GamificationProfileResponse
    active_quests: List[DailyQuestResponse]
    magic_booster_chests: List[MagicBoosterChestResponse]
    attendance_streak_days: int
    attendance_pct: float
    bus_route_id: Optional[int] = None

# --- Faculty Substitution & Period Coverage Schemas ---
class AvailableFacultyItem(BaseModel):
    id: int
    name: str
    department: str
    free_periods_today: int
    is_subject_match: bool
    current_status: str

class SubstitutionSlotResponse(BaseModel):
    id: int
    absent_teacher_id: int
    absent_teacher_name: str
    absent_reason: str
    date: str
    period_number: int
    time_slot: str
    class_name: str
    subject: str
    substitute_teacher_id: Optional[int] = None
    substitute_teacher_name: Optional[str] = None
    status: str = "Unassigned"  # 'Unassigned' | 'Assigned' | 'Completed'
    priority: str = "High"

class AssignSubstitutionRequest(BaseModel):
    slot_id: int
    substitute_teacher_id: int
    substitute_teacher_name: str
    notes: Optional[str] = None

# --- Security & Regulatory Compliance Audit Schemas ---
class SecurityAuditLogResponse(BaseModel):
    id: int
    timestamp: str
    actor_name: str
    actor_role: str
    action_type: str
    target_entity: str
    ip_address: str
    status: str
    details: str

# --- Fee Milestone Financial Analytics Schemas ---
class AgingSummary(BaseModel):
    days_0_to_15: float
    days_16_to_30: float
    days_over_30: float

class FeeFinancialAnalyticsResponse(BaseModel):
    total_target: float
    total_collected: float
    total_overdue: float
    collection_rate_pct: float
    aging_summary: AgingSummary
    defaulters_count: int
    reminders_dispatched_today: int
    active_milestone_title: str
    milestone_deadline: str

# --- Academic Rollover & Promotion Schemas ---
class AcademicRolloverClassResponse(BaseModel):
    class_id: int
    from_class: str
    to_class: str
    total_students: int
    eligible_for_promotion: int
    retention_review: int
    tc_requested: int
    status: str

class ExecuteRolloverRequest(BaseModel):
    class_id: int
    academic_year: str = "2027-2028"
    confirm_audit_seal: bool = True

# --- Teacher Personal Schedule & Duty Center Schemas ---
class TeacherPersonalScheduleResponse(BaseModel):
    id: str
    period_number: int
    start_time: str
    end_time: str
    day_of_week: str
    activity_type: str
    class_grade: Optional[str] = None
    section: Optional[str] = None
    subject_name: Optional[str] = None
    room_number: str
    is_current_active_period: bool = False
    notes: Optional[str] = None

class ActionChecklistItem(BaseModel):
    item: str
    completed: bool

class FacultyDutyTaskResponse(BaseModel):
    id: str
    teacher_id: str
    category: str
    title: str
    sub_category: Optional[str] = None
    event_or_exam_name: str
    scheduled_date: str
    time_window: str
    location_or_venue: str
    status: str
    priority: str
    papers_assigned: Optional[int] = None
    papers_completed: Optional[int] = None
    submission_deadline: Optional[str] = None
    assigned_by: str
    action_checklist: Optional[List[ActionChecklistItem]] = None
    is_weekly: Optional[bool] = False
    day_of_week: Optional[str] = None
    frequency: Optional[str] = None

class UpdateDutyPaperCountRequest(BaseModel):
    papers_completed: int

class ToggleDutyChecklistRequest(BaseModel):
    item_index: int
    completed: bool

# --- Dual-Mode Parent-Teacher Notes Schemas ---
class ParentTeacherNoteCreate(BaseModel):
    interaction_scope: str
    student_id: int
    student_name: str
    student_class: str
    parent_id: str
    parent_name: str
    parent_phone: str
    teacher_id: str
    teacher_name: str
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    homeroom_teacher_id: str = "ananya"
    note_type: str
    content: str
    is_focus_table_evidence: bool = False
    focus_concept_tag: Optional[str] = None

class ParentTeacherNoteResponse(BaseModel):
    id: str
    interaction_scope: str
    student_id: int
    student_name: str
    student_class: str
    parent_id: str
    parent_name: str
    parent_phone: str
    teacher_id: str
    teacher_name: str
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    homeroom_teacher_id: str
    note_type: str
    content: str
    created_at: str
    is_focus_table_evidence: bool = False
    focus_concept_tag: Optional[str] = None

# --- Strict 10-Minute Sliding PTM Scheduler Schemas ---
class BlackoutWindowItem(BaseModel):
    start: str
    end: str
    title: str

class PTMEventConfigResponse(BaseModel):
    id: str
    title: str
    event_date: str
    school_start_time: str
    school_end_time: str
    slot_duration_mins: int = 10
    buffer_mins: int = 2
    blackout_windows: List[BlackoutWindowItem]

class PTMSlotResponse(BaseModel):
    id: str
    event_id: str
    teacher_id: str
    start_time: str
    end_time: str
    status: str
    interaction_scope: str
    booked_student_id: Optional[int] = None
    booked_student_name: Optional[str] = None
    booked_class: Optional[str] = None
    booked_parent_id: Optional[str] = None
    booked_parent_name: Optional[str] = None
    subject_name: Optional[str] = None
    is_sibling_combo: Optional[bool] = False
    sibling_student_id: Optional[int] = None
    sibling_student_name: Optional[str] = None
    meeting_url: Optional[str] = None
    focus_table_agenda: Optional[List[str]] = None

class PTMSlotBookRequest(BaseModel):
    slot_id: str
    booked_student_id: int
    booked_student_name: str
    booked_class: str
    booked_parent_id: str
    booked_parent_name: str
    interaction_scope: str
    subject_name: Optional[str] = None
    is_sibling_combo: bool = False
    sibling_student_id: Optional[int] = None
    sibling_student_name: Optional[str] = None
    focus_table_agenda: Optional[List[str]] = None

