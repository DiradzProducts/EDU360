from typing import List, Optional, Any
from pydantic import BaseModel
import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    username: Optional[str] = None
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
    username: Optional[str] = None
    email: str
    password: str
    role: str
    identifier: Optional[str] = None
    phone: Optional[str] = None

class UserLoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
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

# --- Admin & Coordinator Operational Task Schemas ---
class AdminTaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "urgent"  # urgent, upcoming
    domain: Optional[str] = "academic"  # academic, exam, transport, inventory, admissions, finance, executive
    due_date: str
    assigned_to: str
    assigned_to_role: Optional[str] = None
    created_by_name: Optional[str] = "Administrator"
    created_by_role: Optional[str] = "admin"
    priority: str = "High"  # Low, Medium, High, Critical
    sla_hours: Optional[int] = 48
    is_auto_generated: Optional[bool] = False
    trigger_event: Optional[str] = None

class AdminTaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    assigned_to_role: Optional[str] = None
    due_date: Optional[str] = None
    is_escalated: Optional[bool] = None
    escalation_reason: Optional[str] = None
    completion_proof_url: Optional[str] = None

class AdminTaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    domain: Optional[str] = "academic"
    due_date: str
    assigned_to: str
    assigned_to_role: Optional[str] = None
    created_by_name: Optional[str] = "Administrator"
    created_by_role: Optional[str] = "admin"
    status: str
    priority: str
    sla_hours: Optional[int] = 48
    is_auto_generated: Optional[bool] = False
    trigger_event: Optional[str] = None
    is_escalated: Optional[bool] = False
    escalation_reason: Optional[str] = None
    completion_proof_url: Optional[str] = None
    relief_requested: Optional[bool] = False
    relief_reason: Optional[str] = None
    relief_justification: Optional[str] = None
    suggested_peer_teacher: Optional[str] = None
    task_type: Optional[str] = None
    escalated_at: Optional[datetime.datetime] = None
    resolved_at: Optional[datetime.datetime] = None
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

class EscalateTaskRequest(BaseModel):
    reason: str

class ResolveEscalationRequest(BaseModel):
    resolution_notes: Optional[str] = "Principal reviewed and de-escalated task."
    new_priority: Optional[str] = "High"

class TaskReliefRequest(BaseModel):
    relief_reason: str  # 'Medical Leave' | 'Academic Workload Surge' | 'Family Emergency'
    justification: str
    suggested_peer_teacher: Optional[str] = None

class ApproveReliefRequest(BaseModel):
    new_assigned_to: str
    new_sla_hours: Optional[int] = 48
    notes: Optional[str] = None

class ExtendSlaRequest(BaseModel):
    additional_hours: int = 24
    extension_reason: str

class AutoTriggerTaskRequest(BaseModel):
    event_type: str  # exam_concluded, bus_rto_fitness, absence_streak, stock_low
    entity_id: Optional[str] = None
    notes: Optional[str] = None

class TaskExecutiveCockpitResponse(BaseModel):
    total_open: int
    critical_escalations: int
    overdue_count: int
    auto_generated_count: int
    department_stats: List[dict]
    recent_tasks: List[AdminTaskResponse]

# --- CRM Schemas ---
class AdmissionEnquiryCreate(BaseModel):
    student_name: str
    parent_name: str
    email: str
    phone: str
    target_grade: str
    lead_temperature: Optional[str] = "warm"
    source: Optional[str] = "Website"
    doc_report_card: Optional[bool] = False
    doc_birth_cert: Optional[bool] = False
    doc_transfer_cert: Optional[bool] = False
    notes: Optional[str] = None
    next_followup_date: Optional[str] = None

class AdmissionEnquiryUpdate(BaseModel):
    stage: Optional[str] = None
    lead_temperature: Optional[str] = None
    source: Optional[str] = None
    doc_report_card: Optional[bool] = None
    doc_birth_cert: Optional[bool] = None
    doc_transfer_cert: Optional[bool] = None
    notes: Optional[str] = None
    next_followup_date: Optional[str] = None
    drop_reason: Optional[str] = None

class CallLogPayload(BaseModel):
    outcome: str
    note: Optional[str] = None
    next_followup_date: Optional[str] = None
    stage: Optional[str] = None
    lead_temperature: Optional[str] = None
    drop_reason: Optional[str] = None

class AdmissionEnquiryResponse(BaseModel):
    id: int
    student_name: str
    parent_name: str
    email: str
    phone: str
    target_grade: str
    stage: str
    lead_temperature: Optional[str] = "warm"
    source: Optional[str] = "Website"
    doc_report_card: Optional[bool] = False
    doc_birth_cert: Optional[bool] = False
    doc_transfer_cert: Optional[bool] = False
    chat_transcript: Optional[str] = None
    notes: Optional[str] = None
    next_followup_date: Optional[str] = None
    drop_reason: Optional[str] = None
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

# --- Academic Curriculum Pacing Schemas ---
class CurriculumPacingItem(BaseModel):
    id: int
    class_name: str
    subject: str
    teacher_name: str
    completed_units: int
    total_units: int
    calendar_target_units: int
    completion_pct: float
    status: str
    last_lesson_title: str
    next_milestone_date: str

class LogLessonRequest(BaseModel):
    units_to_add: int = 1
    lesson_title: Optional[str] = None

class PTMGovernanceStatus(BaseModel):
    active_event_title: str
    event_date: str
    time_window: str
    slot_duration_mins: int
    total_teachers: int
    published_teachers_count: int
    readiness_percentage: float
    unready_teachers: List[str]
    focus_students_requiring_brief: int

class PTMEventCreate(BaseModel):
    title: str
    academic_term: Optional[str] = "Term 1"
    start_date: str
    end_date: str
    start_time: Optional[str] = "09:00 AM"
    end_time: Optional[str] = "01:00 PM"
    slot_duration_mins: Optional[int] = 10
    target_classes: List[str]
    meeting_format: Optional[str] = "Online & In-Person"

class PTMEventResponse(BaseModel):
    id: int
    title: str
    academic_term: str
    start_date: str
    end_date: str
    start_time: str
    end_time: str
    slot_duration_mins: int
    target_classes: List[str]
    status: str
    created_by_name: str
    created_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

# --- AI Parent Study Companion Schemas ---
class AIStudyAssistantRequest(BaseModel):
    student_id: int = 1
    subject_name: Optional[str] = "Mathematics"
    subject: Optional[str] = None
    current_exam_score: Optional[Any] = "52%"
    current_score: Optional[Any] = None
    diagnosed_misconception: Optional[str] = "Drops negative signs during binomial factoring"
    weak_concept: Optional[str] = None
    active_day: Optional[str] = "Day 3"

    @property
    def resolved_subject(self) -> str:
        return self.subject_name or self.subject or "Mathematics"

    @property
    def resolved_score(self) -> str:
        s = self.current_exam_score or self.current_score or "52%"
        return str(s)

    @property
    def resolved_misconception(self) -> str:
        return self.diagnosed_misconception or self.weak_concept or "Drops negative signs during binomial factoring"

class AIStudyAssistantResponse(BaseModel):
    plain_english_translation: str
    tonight_action: str
    child_motivation_tip: str
    suggested_teacher_question: str
    has_backlog: bool = False
    backlog_count: int = 0
    source: str = "gemini"
    model_used: str = "gemini-3.5-flash"


# =========================================================================
# FINANCE & ACCOUNTS COORDINATOR SCHEMAS
# =========================================================================

class FeeDefaulterBase(BaseModel):
    student_id: Optional[int] = None
    student_name: str
    class_name: str
    roll_no: Optional[str] = None
    parent_name: str
    parent_phone: str
    milestone_title: str
    amount_due: float
    days_overdue: int = 0
    reminder_sent: bool = False
    reminder_count: int = 0
    is_admission_fee: Optional[bool] = False
    exam_clearance: Optional[bool] = False
    waiver_amount: float = 0.0
    waiver_reason: Optional[str] = None
    waiver_approved_by: Optional[str] = None
    payment_history_json: Optional[str] = None
    notes: Optional[str] = None
    status: str = "Overdue"

class FeeDefaulterCreate(FeeDefaulterBase):
    pass

class FeeDefaulterUpdate(BaseModel):
    amount_due: Optional[float] = None
    days_overdue: Optional[int] = None
    reminder_sent: Optional[bool] = None
    reminder_count: Optional[int] = None
    is_admission_fee: Optional[bool] = None
    exam_clearance: Optional[bool] = None
    waiver_amount: Optional[float] = None
    waiver_reason: Optional[str] = None
    waiver_approved_by: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class FeeDefaulterResponse(FeeDefaulterBase):
    id: int
    last_reminder_at: Optional[datetime.datetime] = None
    waiver_approved_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class ApplyWaiverRequest(BaseModel):
    waiver_amount: float
    reason: str
    approved_by: str = "Mr. Arvind Krishnan"

class RecordFeePaymentRequest(BaseModel):
    amount_paid: float
    payment_method: str = "UPI"  # UPI, Cash, Cheque, NetBanking, Card
    utr_or_cheque_no: Optional[str] = None
    notes: Optional[str] = None
    received_by: str = "Mr. Arvind Krishnan"

class BulkReminderRequest(BaseModel):
    student_ids: Optional[List[int]] = None
    aging_tier: Optional[str] = None  # "ALL", "30+", "16-30", "0-15"
    channel: str = "WhatsApp"  # WhatsApp, SMS, Email
    custom_message: Optional[str] = None

class VendorInvoiceBase(BaseModel):
    invoice_no: str
    vendor_name: str
    vendor_category: Optional[str] = "Services"
    invoice_for: str
    amount: float
    invoice_date: str
    due_date: Optional[str] = None
    status: str = "Pending Approval"
    notes: Optional[str] = None

class VendorInvoiceCreate(VendorInvoiceBase):
    pass

class VendorInvoiceUpdate(BaseModel):
    status: Optional[str] = None
    authorized_by: Optional[str] = None
    payment_utr: Optional[str] = None
    payment_mode: Optional[str] = None
    notes: Optional[str] = None

class VendorInvoiceResponse(VendorInvoiceBase):
    id: int
    authorized_by: Optional[str] = None
    authorized_at: Optional[datetime.datetime] = None
    payment_utr: Optional[str] = None
    paid_at: Optional[datetime.datetime] = None
    payment_mode: Optional[str] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class PaymentTransactionBase(BaseModel):
    utr_number: str
    student_name: str
    class_name: str
    parent_name: str
    amount: float
    payment_method: str
    bank_name: Optional[str] = None
    milestone_title: str
    status: str = "Success"
    reconciled: bool = False
    gateway_ref: Optional[str] = None
    notes: Optional[str] = None

class PaymentTransactionCreate(PaymentTransactionBase):
    pass

class PaymentTransactionResponse(PaymentTransactionBase):
    id: int
    transaction_date: datetime.datetime
    reconciled_at: Optional[datetime.datetime] = None
    reconciled_by: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FinanceDispatchLogResponse(BaseModel):
    id: int
    dispatch_type: str
    dispatch_scope: Optional[str] = None
    target_count: int
    total_amount_targeted: float
    dispatch_note: Optional[str] = None
    dispatched_by: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FinanceDashboardStats(BaseModel):
    total_collected_mtd: float
    outstanding_arrears: float
    pending_reconciliation_count: int
    pending_reconciliation_amount: float
    pending_vendor_invoices_count: int
    pending_vendor_invoices_amount: float
    overdue_students_count: int
    overdue_tier_15: int
    overdue_tier_30: int
    overdue_tier_60: int
    collection_target_progress_pct: float


# =========================================================================
# CASH OUTFLOW DOMAIN SCHEMAS (PAYROLL, PROCUREMENT, FLEET)
# =========================================================================

class StaffPayslipResponse(BaseModel):
    id: int
    batch_id: int
    staff_id: int
    staff_name: str
    role_designation: str
    department: str
    bank_account_no: str
    bank_ifsc: str
    basic_salary: float
    hra_allowance: float
    special_allowance: float
    gross_earnings: float
    provident_fund: float
    professional_tax: float
    income_tax_tds: float
    loss_of_pay_days: int
    loss_of_pay_deduction: float
    total_deductions: float
    net_salary: float
    disbursement_status: str
    payment_utr: Optional[str] = None
    disbursed_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PayrollBatchResponse(BaseModel):
    id: int
    payroll_month: str
    total_staff_count: int
    gross_total: float
    total_deductions: float
    net_payable: float
    status: str
    authorized_by: Optional[str] = None
    authorized_at: Optional[datetime.datetime] = None
    disbursed_at: Optional[datetime.datetime] = None
    bank_batch_ref: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class GeneratePayrollRequest(BaseModel):
    payroll_month: str  # e.g. "October 2026"
    include_lop_deductions: bool = True
    notes: Optional[str] = None

class AuthorizePayrollRequest(BaseModel):
    authorized_by: str = "Dr. Sunita Kapoor (Principal)"
    notes: Optional[str] = None

class DisbursePayrollRequest(BaseModel):
    bank_batch_ref: str = "HDFC-CMS-SAL-OCT26-001"
    disbursed_by: str = "Mr. Arvind Krishnan (Accounts Officer)"

class PurchaseOrderBase(BaseModel):
    po_number: str
    department: str
    vendor_name: str
    items_json: str
    total_amount: float
    expected_delivery_date: Optional[str] = None
    notes: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    pass

class PurchaseOrderResponse(PurchaseOrderBase):
    id: int
    status: str
    grn_number: Optional[str] = None
    grn_verified_by: Optional[str] = None
    grn_verified_at: Optional[datetime.datetime] = None
    linked_invoice_no: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class VerifyGRNRequest(BaseModel):
    grn_number: str = "GRN-2026-OCT-041"
    verified_by: str = "Mrs. Shalini Rao (Store Lead)"
    notes: Optional[str] = "Physical delivery checked and verified at campus inventory store"

class FleetExpenseBase(BaseModel):
    vehicle_no: str
    bus_route: str
    expense_type: str
    vendor_name: str
    amount: float
    invoice_ref: Optional[str] = None
    due_date: Optional[str] = None

class FleetExpenseCreate(FleetExpenseBase):
    logged_by: Optional[str] = "Mr. Vikram Malhotra (Transport Lead)"

class FleetExpenseResponse(FleetExpenseBase):
    id: int
    status: str
    payment_utr: Optional[str] = None
    logged_by: str
    paid_at: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SettleFleetExpenseRequest(BaseModel):
    payment_utr: str = "RTGS/SBIN20261022981048"
    payment_mode: str = "RTGS"


# --- Inventory & Asset Schemas ---
class InventoryItemBase(BaseModel):
    asset_tag: str
    name: str
    category: str
    sub_category: Optional[str] = None
    location: str
    total_stock: int = 1
    available_stock: int = 1
    issued_count: int = 0
    damaged_count: int = 0
    reorder_level: int = 5
    unit_of_measure: str = "Units"
    unit_cost: float = 0.0
    amc_vendor: Optional[str] = None
    amc_valid_until: Optional[str] = None
    condition: str = "Optimal"
    last_audited: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemResponse(InventoryItemBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class StockAdjustmentRequest(BaseModel):
    delta: int  # can be positive (restock) or negative (consumed/broken)
    reason: str = "Class Practical Usage"
    recorded_by: Optional[str] = "Mrs. Shalini Rao (Store Lead)"
    notes: Optional[str] = None

class RequisitionPORequest(BaseModel):
    quantity: int = 10
    vendor_name: str
    department: str = "Science Labs"
    unit_price: float = 250.0
    expected_delivery_date: Optional[str] = "Within 5 Days"
    notes: Optional[str] = None

class InventoryMovementResponse(BaseModel):
    id: int
    item_id: int
    movement_type: str
    quantity: int
    reference_no: Optional[str] = None
    recorded_by: str
    notes: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AssetCustodyCheckoutRequest(BaseModel):
    item_id: int
    borrower_name: str
    borrower_role: str = "Teacher"  # Teacher | Student | Staff
    borrower_ref_id: Optional[str] = None
    class_room: Optional[str] = None
    quantity: int = 1
    expected_return_time: Optional[datetime.datetime] = None

class AssetCustodyReturnRequest(BaseModel):
    condition_on_return: str = "Intact"  # Intact | Damaged | Lost
    damaged_qty: int = 0
    fine_assessed: float = 0.0
    notes: Optional[str] = None

class AssetCustodyLogResponse(BaseModel):
    id: int
    item_id: int
    item_name: Optional[str] = None
    asset_tag: Optional[str] = None
    borrower_name: str
    borrower_role: str
    borrower_ref_id: Optional[str] = None
    class_room: Optional[str] = None
    quantity: int
    checkout_time: datetime.datetime
    expected_return_time: Optional[datetime.datetime] = None
    actual_return_time: Optional[datetime.datetime] = None
    condition_on_return: str
    fine_assessed: float
    status: str

    class Config:
        from_attributes = True

class ClearanceCheckResponse(BaseModel):
    student_id: int
    student_name: str
    is_cleared: bool
    active_hold_count: int
    pending_items: List[str] = []
    total_unpaid_fines: float = 0.0


# --- Base Admin Command Center Executive Pulse Schemas ---

class QuickActionCounts(BaseModel):
    pending_tcs: int = 0
    pending_staff_permissions: int = 0
    pending_fee_waivers: int = 0
    sla_escalations: int = 0

class GradeCapacityItem(BaseModel):
    grade: str
    enrolled: int
    capacity: int

class AdmissionsPulse(BaseModel):
    new_inflows_mtd: int
    active_followups: int
    total_enrolled: int
    total_capacity: int
    capacity_percentage: float
    exits_count_ytd: int
    grade_capacities: List[GradeCapacityItem] = []

class ExecutiveAgingSummary(BaseModel):
    under_30_days: float
    days_30_to_60: float
    over_60_days_critical: float

class PayrollBatchStatus(BaseModel):
    batch_month: str
    total_staff: int
    total_amount: float
    status: str

class AccountsPulse(BaseModel):
    today_collections: float
    today_transactions_count: int
    aging: ExecutiveAgingSummary
    payroll: PayrollBatchStatus
    gateway_settlement_pipeline: float

class ActiveExamItem(BaseModel):
    class_name: str
    subject: str
    time: str
    status: str

class UpcomingExamItem(BaseModel):
    class_name: str
    subject: str
    date: str

class AcademicTrajectoryItem(BaseModel):
    class_name: str
    prev_avg: float
    current_avg: float
    change_pct: float
    status: str

class ExamsPulse(BaseModel):
    active_exams: List[ActiveExamItem] = []
    upcoming_exams: List[UpcomingExamItem] = []
    grading_queue_pending_papers: int
    trajectory: List[AcademicTrajectoryItem] = []
    remedial_student_count: int

class LaggingClassItem(BaseModel):
    class_name: str
    subject: str
    teacher_name: str
    lag_units: int

class StaffAndPacingPulse(BaseModel):
    staff_present: int
    staff_total: int
    attendance_pct: float
    pacing_lag_alerts_count: int
    lagging_classes: List[LaggingClassItem] = []

class ExecutivePulseResponse(BaseModel):
    quick_action_counts: QuickActionCounts
    admissions: AdmissionsPulse
    accounts: AccountsPulse
    exams: ExamsPulse
    staff_and_pacing: StaffAndPacingPulse

class StaffPermissionResponse(BaseModel):
    id: int
    staff_id: int
    staff_name: str
    role: str
    permission_type: str
    from_date: str
    to_date: str
    affected_periods: Optional[str] = None
    reason: str
    status: str
    approved_by: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class StaffPermissionReviewRequest(BaseModel):
    status: str = "Approved"  # "Approved" | "Rejected"
    notes: Optional[str] = None
    assign_substitute: bool = True


