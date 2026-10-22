import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False)  # admin, coordinators, teacher, parent, student
    school_code = Column(String(50), default="EDU-GLOBAL-360")
    password = Column(String(120), default="Password123")
    avatar = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(100), nullable=False)
    roll_no = Column(String(20), nullable=False)
    class_name = Column(String(20), nullable=False)  # e.g., "Class 8"
    section = Column(String(10), nullable=False)     # e.g., "B"
    admission_no = Column(String(30), unique=True, nullable=False)
    guardian_name = Column(String(100), nullable=False)
    guardian_phone = Column(String(20), nullable=False)
    guardian_email = Column(String(120), nullable=False)
    attendance_pct = Column(Float, default=92.5)
    bus_route_id = Column(Integer, nullable=True)
    academic_average_pct = Column(Float, default=78.4)
    status = Column(String(20), default="Active")
    grade_tier = Column(String(20), default="secondary")  # 'k5' or 'secondary'
    age = Column(Integer, default=14, nullable=True)
    avatar_character_url = Column(String(255), nullable=True)
    backlog_count = Column(Integer, default=0)
    total_assigned = Column(Integer, default=0)
    on_time_count = Column(Integer, default=0)

def determine_grade_tier(class_name: str) -> str:
    """Helper to classify student grade tier into 'k5' or 'secondary'."""
    if not class_name:
        return "secondary"
    lower = class_name.lower().strip()
    k5_keywords = ["nursery", "lkg", "ukg", "kg", "prep", "kindergarten", "primary", "junior"]
    for kw in k5_keywords:
        if kw in lower:
            return "k5"
    import re
    match = re.search(r'\b(?:class|grade)?\s*([0-9]+)\b', lower)
    if match:
        val = int(match.group(1))
        if 1 <= val <= 5:
            return "k5"
        elif val > 5:
            return "secondary"
    return "secondary"

class OfficialDocument(Base):
    __tablename__ = "official_documents"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String(150), nullable=False)
    doc_type = Column(String(50), nullable=False)  # Bonafide, Transfer Certificate, Marks Card, Birth Certificate
    file_url = Column(String(255), nullable=False)
    is_official = Column(Boolean, default=True)
    uploaded_by_role = Column(String(20), default="admin")  # STRICT: only admin can modify
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(20), default="Verified")
    verified_stamp = Column(String(100), default="EDU360 Official Seal")

class TriageAlert(Base):
    __tablename__ = "triage_alerts"
    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(10), nullable=False)  # red, orange, green
    category = Column(String(50), nullable=False)  # attendance, fees, academics, operations
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    count_affected = Column(Integer, default=0)
    action_label = Column(String(100), nullable=False)
    action_endpoint = Column(String(100), nullable=False)
    resolved = Column(Boolean, default=False)
    resolution_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AdminTask(Base):
    __tablename__ = "admin_tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(20), default="urgent")  # urgent, upcoming
    domain = Column(String(50), default="academic", index=True)  # academic, exam, transport, inventory, admissions, finance, executive
    due_date = Column(String(50), nullable=False)
    assigned_to = Column(String(100), nullable=False)
    assigned_to_role = Column(String(50), nullable=True)
    created_by_name = Column(String(100), default="Administrator")
    created_by_role = Column(String(50), default="admin")
    status = Column(String(30), default="Pending")  # Pending, In Progress, Pending Review, Completed
    priority = Column(String(20), default="High")  # Low, Medium, High, Critical
    sla_hours = Column(Integer, default=48)
    is_auto_generated = Column(Boolean, default=False)
    trigger_event = Column(String(100), nullable=True)
    is_escalated = Column(Boolean, default=False)
    escalation_reason = Column(String(255), nullable=True)
    completion_proof_url = Column(String(255), nullable=True)
    relief_requested = Column(Boolean, default=False)
    relief_reason = Column(String(100), nullable=True)
    relief_justification = Column(Text, nullable=True)
    suggested_peer_teacher = Column(String(100), nullable=True)
    task_type = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class AdmissionEnquiry(Base):
    __tablename__ = "admission_enquiries"
    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String(100), nullable=False)
    parent_name = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False)
    target_grade = Column(String(20), nullable=False)
    stage = Column(String(30), default="new")  # new, followup, visit, converted
    chat_transcript = Column(Text, nullable=True)  # JSON or text transcript
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    date = Column(String(50), nullable=False)
    location = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    banner_url = Column(String(255), nullable=True)
    status = Column(String(30), default="Upcoming")

class EventStaffAssignment(Base):
    __tablename__ = "event_staff_assignments"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    staff_id = Column(Integer, nullable=False)
    staff_name = Column(String(100), nullable=False)
    committee_role = Column(String(100), nullable=False)
    student_volunteers = Column(Text, nullable=True)  # JSON list of names

class VendorEquipment(Base):
    __tablename__ = "vendor_equipments"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    equipment_name = Column(String(120), nullable=False)
    vendor_name = Column(String(100), nullable=False)
    vendor_phone = Column(String(30), nullable=False)
    status = Column(String(30), default="Delivered")  # Ordered, Delivered, Returned
    handover_timestamp = Column(String(60), nullable=True)
    returned_timestamp = Column(String(60), nullable=True)
    notes = Column(Text, nullable=True)

class ExitClearance(Base):
    __tablename__ = "exit_clearances"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    student_name = Column(String(100), nullable=False)
    class_name = Column(String(20), nullable=False)
    fee_cleared = Column(Boolean, default=True)
    library_cleared = Column(Boolean, default=True)
    inventory_cleared = Column(Boolean, default=True)
    tc_ready = Column(Boolean, default=True)
    digital_parent_approved = Column(Boolean, default=False)
    digital_approval_timestamp = Column(String(50), nullable=True)
    physical_scan_url = Column(String(255), nullable=True)
    physical_sign_verified = Column(Boolean, default=False)
    status = Column(String(30), default="Pending Signatures")

class LiveClass(Base):
    __tablename__ = "live_classes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    subject = Column(String(50), nullable=False)
    class_name = Column(String(30), nullable=False)
    teacher_id = Column(Integer, nullable=False)
    teacher_name = Column(String(100), nullable=False)
    scheduled_time = Column(String(50), nullable=False)
    duration_mins = Column(Integer, default=45)
    status = Column(String(20), default="live")  # upcoming, live, completed
    meet_url = Column(String(255), nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("live_classes.id"), nullable=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    student_name = Column(String(100), nullable=False)
    join_timestamp = Column(String(50), nullable=True)
    minutes_late = Column(Float, default=0.0)
    status = Column(String(20), default="Present")  # Present, Late, Absent, Leave
    teacher_override = Column(Boolean, default=False)
    date = Column(String(30), nullable=False)

class Homework(Base):
    __tablename__ = "homeworks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    subject = Column(String(50), nullable=False)
    class_name = Column(String(30), nullable=False)
    description = Column(Text, nullable=False)
    task_type = Column(String(20), default="DAILY_HOMEWORK")  # DAILY_HOMEWORK, ASSIGNMENT
    due_date = Column(String(50), nullable=False)
    due_time = Column(String(50), default="17:00")
    status = Column(String(20), default="PENDING")  # PENDING, SUBMITTED, GRADED, BACKLOG
    assigned_date = Column(String(50), nullable=True)
    teacher_id = Column(Integer, nullable=False)
    teacher_name = Column(String(100), nullable=False)
    max_marks = Column(Integer, default=20)
    resource_url = Column(String(255), nullable=True)
    weightage = Column(String(50), nullable=True)
    progress_pct = Column(Float, default=0.0)

class HomeworkSubmission(Base):
    __tablename__ = "homework_submissions"
    id = Column(Integer, primary_key=True, index=True)
    homework_id = Column(Integer, ForeignKey("homeworks.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    student_name = Column(String(100), nullable=False)
    original_file_url = Column(String(255), nullable=False)
    annotated_file_url = Column(String(255), nullable=True)
    annotations_json = Column(Text, nullable=True)  # Canvas drawings, ticks, texts
    marks_obtained = Column(Float, nullable=True)
    teacher_remarks = Column(Text, nullable=True)
    status = Column(String(20), default="submitted")  # submitted, graded, pending, backlog
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    graded_at = Column(DateTime, nullable=True)
    late_submission = Column(Boolean, default=False)
    is_backlog = Column(Boolean, default=False)

class FocusTable(Base):
    __tablename__ = "focus_tables"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    student_name = Column(String(100), nullable=False)
    subject = Column(String(50), nullable=False)
    weak_concept = Column(String(150), nullable=False)
    current_score_pct = Column(Float, nullable=False)
    target_score_pct = Column(Float, default=80.0)
    revision_plan_json = Column(Text, nullable=False)  # 4-day plan with steps
    teacher_action = Column(Text, nullable=False)
    parent_check_completed = Column(Boolean, default=False)
    status = Column(String(30), default="in_progress")  # in_progress, needs_parent_check, mastered
    backlog_count = Column(Integer, default=0)
    academic_compliance_json = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class BacklogEvent(Base):
    __tablename__ = "backlog_events"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    homework_id = Column(Integer, ForeignKey("homeworks.id"), nullable=False)
    focus_table_id = Column(Integer, ForeignKey("focus_tables.id"), nullable=True)
    evidence_code = Column(String(50), nullable=False)  # e.g., "#EVD-BKLOG-884"
    subject = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    task_type = Column(String(20), default="DAILY_HOMEWORK")  # DAILY_HOMEWORK or ASSIGNMENT
    due_date = Column(String(50), nullable=False)
    due_time = Column(String(50), nullable=False)
    status = Column(String(30), default="UNRESOLVED")  # UNRESOLVED, LATE_SUBMITTED, RESOLVED
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    late_submission = Column(Boolean, default=False)
    teacher_name = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    student_name = Column(String(100), nullable=False)
    parent_name = Column(String(100), nullable=False)
    from_date = Column(String(30), nullable=False)
    to_date = Column(String(30), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="Pending")  # Pending, Approved, Rejected
    teacher_notes = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)

class FeeMilestone(Base):
    __tablename__ = "fee_milestones"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    due_date = Column(String(30), nullable=False)
    status = Column(String(20), default="Upcoming")  # Paid, Overdue, Upcoming
    receipt_no = Column(String(50), nullable=True)
    paid_at = Column(String(50), nullable=True)
    payment_method = Column(String(30), nullable=True)

class BusRoute(Base):
    __tablename__ = "bus_routes"
    id = Column(Integer, primary_key=True, index=True)
    route_number = Column(String(20), nullable=False)
    driver_name = Column(String(100), nullable=False)
    driver_phone = Column(String(30), nullable=False)
    vehicle_no = Column(String(30), nullable=False)
    stops_json = Column(Text, nullable=False)  # list of stops with lat, lng, name, eta
    current_stop_idx = Column(Integer, default=2)
    live_status = Column(String(50), default="On Route - Moving smoothly")
    eta_mins = Column(Integer, default=8)

class StudentPortfolio(Base):
    __tablename__ = "student_portfolios"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    category = Column(String(30), nullable=False)  # participation, achievement
    title = Column(String(150), nullable=False)
    event_name = Column(String(150), nullable=False)
    date = Column(String(30), nullable=False)
    proof_url = Column(String(255), nullable=True)
    verified_by_school = Column(Boolean, default=True)
    description = Column(Text, nullable=True)

class ClassRecording(Base):
    __tablename__ = "class_recordings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    subject = Column(String(50), nullable=False)
    chapter = Column(String(100), nullable=False)
    teacher_name = Column(String(100), nullable=False)
    duration = Column(String(20), nullable=False)
    video_url = Column(String(255), nullable=False)
    thumbnail = Column(String(255), nullable=True)
    date = Column(String(30), nullable=False)

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)  # Books, Lab, Sports, IT Hardware, Classroom
    total_quantity = Column(Integer, nullable=False)
    issued_quantity = Column(Integer, default=0)
    damaged_quantity = Column(Integer, default=0)
    min_threshold = Column(Integer, default=10)
    status = Column(String(30), default="In Stock")

class StaffMember(Base):
    __tablename__ = "staff_members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)  # Teacher, Admin, Lab Assistant, Transport
    department = Column(String(50), nullable=False)
    email = Column(String(120), nullable=False)
    phone = Column(String(30), nullable=False)
    attendance_status = Column(String(20), default="Present")
    salary_slip_ready = Column(Boolean, default=True)

class StudentGamification(Base):
    __tablename__ = "student_gamifications"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False)
    level = Column(Integer, default=1)  # e.g., Level 3
    level_title = Column(String(50), default="Junior Explorer")  # e.g., "Explorer", "Star Voyager"
    xp_points = Column(Integer, default=0)
    total_stars = Column(Integer, default=0)
    attendance_streak_days = Column(Integer, default=1)  # 7-Day fire streak
    sound_effects_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class DailyQuest(Base):
    __tablename__ = "daily_quests"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String(150), nullable=False)  # e.g. "Count & Color 10 Stars in Chapter 2 Workbook"
    subject = Column(String(50), nullable=False)  # Math, English, Art
    xp_reward = Column(Integer, default=25)
    stars_reward = Column(Integer, default=50)
    status = Column(String(30), default="active")  # active, submitted, completed
    teacher_reaction = Column(String(100), default="Super Star! ⭐ - Ms. Priya")
    proof_image_url = Column(String(255), nullable=True)
    due_date = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MagicBoosterChest(Base):
    __tablename__ = "magic_booster_chests"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    concept_title = Column(String(100), nullable=False)  # "Number Counting & Phonics"
    day_number = Column(Integer, nullable=False)  # 1, 2, 3, 4
    day_task_title = Column(String(150), nullable=False)
    status = Column(String(30), default="locked")  # completed_claimed, ready_to_open, locked
    chest_stars = Column(Integer, default=30)
    parent_signed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PTMEvent(Base):
    __tablename__ = "ptm_events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    academic_term = Column(String(50), default="Term 1")
    start_date = Column(String(30), nullable=False)
    end_date = Column(String(30), nullable=False)
    start_time = Column(String(20), default="09:00 AM")
    end_time = Column(String(20), default="01:00 PM")
    slot_duration_mins = Column(Integer, default=10)
    target_classes = Column(Text, nullable=False)  # JSON string list
    status = Column(String(30), default="Open_For_Parents")
    created_by_name = Column(String(100), default="Academic Coordinator")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# =========================================================================
# EXAMS, DESCRIPTIVE PAPER SUBMISSIONS & REMEDIAL INTEGRATION
# =========================================================================

class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    subject = Column(String(50), nullable=False, index=True)
    class_name = Column(String(20), nullable=False, index=True)
    section = Column(String(10), nullable=False)
    term = Column(String(50), default="Term 1")
    exam_type = Column(String(30), default="descriptive")  # descriptive, mcq, hybrid
    total_marks = Column(Float, default=100.0)
    pass_marks = Column(Float, default=40.0)
    remedial_threshold_pct = Column(Float, default=70.0)
    exam_date = Column(String(30), nullable=False)
    is_published = Column(Boolean, default=False, index=True)
    published_at = Column(DateTime, nullable=True)
    is_moderated = Column(Boolean, default=False)
    moderated_at = Column(DateTime, nullable=True)
    is_locked = Column(Boolean, default=False)
    locked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ExamSubmission(Base):
    __tablename__ = "exam_submissions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    status = Column(String(30), default="pending")  # pending, submitted, graded
    paper_file_url = Column(Text, nullable=True)  # URL or data reference to handwritten paper
    paper_file_name = Column(String(255), nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    marks_obtained = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True, index=True)
    teacher_feedback = Column(Text, nullable=True)
    graded_at = Column(DateTime, nullable=True)
    graded_by_teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RemedialSprint(Base):
    __tablename__ = "remedial_sprints"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=True, index=True)
    subject = Column(String(50), nullable=False, index=True)
    exam_score_pct = Column(Float, nullable=False)
    current_day = Column(Integer, default=1)
    total_days = Column(Integer, default=7)
    status = Column(String(30), default="active", index=True)  # active, completed, needs_review, queued
    priority_rank = Column(Integer, default=1)  # 1 = highest deficit subject (lowest score)
    weak_concept = Column(String(150), nullable=False)
    diagnostic_summary = Column(Text, nullable=False)
    scanned_artifacts_json = Column(Text, nullable=True)  # JSON blob of exam + homework evidence
    plan_days_json = Column(Text, nullable=False)  # JSON array of the 7 days with problems, hints, rubrics
    submitted_file_json = Column(Text, nullable=True)
    ai_pre_verification_json = Column(Text, nullable=True)  # JSON: Gemini pre-evaluation of student rough work
    parent_name = Column(String(100), nullable=True)
    parent_phone = Column(String(30), nullable=True)
    parent_status = Column(String(50), default="Co-Tracking Active")
    teacher_verification_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class WhatsAppDispatchLog(Base):
    __tablename__ = "whatsapp_dispatch_logs"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    parent_phone = Column(String(30), nullable=False)
    parent_name = Column(String(100), nullable=True)
    day_num = Column(Integer, default=1)
    message_body = Column(Text, nullable=False)
    delivery_status = Column(String(30), default="DELIVERED")  # QUEUED, SENT, DELIVERED, FAILED
    receipt_id = Column(String(60), unique=True, index=True)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
    dispatch_channel = Column(String(50), default="WHATSAPP_CLOUD_GATEWAY")

# =========================================================================
# QUESTION PAPERS, EXAM SCHEDULES & CONSOLIDATED REPORT CARDS
# =========================================================================

class QuestionPaper(Base):
    __tablename__ = "question_papers"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    subject = Column(String(50), nullable=False, index=True)
    class_name = Column(String(20), nullable=False, index=True)
    section = Column(String(10), default="All")
    term = Column(String(50), default="Term 1")
    blueprint_json = Column(Text, nullable=False)  # JSON: bloom_distribution, units_covered, total_marks
    draft_file_url = Column(Text, nullable=True)
    draft_file_name = Column(String(255), nullable=True)
    answer_key_url = Column(Text, nullable=True)
    status = Column(String(40), default="draft", index=True)  # draft, under_review, revision_requested, approved, sent_to_exam_cell
    revision_notes = Column(Text, nullable=True)
    due_date = Column(String(30), nullable=True)
    created_by_teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by_teacher_name = Column(String(100), nullable=True)
    reviewed_by_academic_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    handed_over_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class ExamSchedule(Base):
    __tablename__ = "exam_schedules"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=True)
    title = Column(String(150), nullable=False)
    subject = Column(String(50), nullable=False)
    class_name = Column(String(50), nullable=False)
    exam_date = Column(String(30), nullable=False)
    start_time = Column(String(20), default="09:00 AM")
    end_time = Column(String(20), default="12:00 PM")
    hall_name = Column(String(100), nullable=False)
    capacity = Column(Integer, default=80)
    chief_invigilator_name = Column(String(100), nullable=True)
    academic_clearance = Column(Boolean, default=False)
    academic_clearance_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ReportCard(Base):
    __tablename__ = "report_cards"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    student_name = Column(String(100), nullable=False)
    roll_no = Column(String(20), nullable=False)
    class_name = Column(String(20), nullable=False)
    section = Column(String(10), nullable=False)
    term = Column(String(50), default="Term 1")
    academic_year = Column(String(20), default="2025-2026")
    grades_grid_json = Column(Text, nullable=False)  # JSON map of subjects: score, max, grade, remarks
    total_marks_obtained = Column(Float, default=0.0)
    max_total_marks = Column(Float, default=500.0)
    overall_percentage = Column(Float, default=0.0)
    overall_grade = Column(String(10), default="B1")
    attendance_pct = Column(Float, default=90.0)
    ai_teacher_narrative = Column(Text, nullable=True)  # Gemini pedagogical growth feedback
    is_moderated = Column(Boolean, default=True)
    is_published = Column(Boolean, default=False, index=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class HallTicket(Base):
    __tablename__ = "hall_tickets"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    ticket_number = Column(String(50), unique=True, index=True)
    series_name = Column(String(100), default="Term 1 Final 2026")
    is_released = Column(Boolean, default=True)
    released_at = Column(DateTime, default=datetime.datetime.utcnow)

class AbsenteeRecord(Base):
    __tablename__ = "absentee_records"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    schedule_id = Column(Integer, ForeignKey("exam_schedules.id"), nullable=True)
    subject = Column(String(50), nullable=False)
    reason = Column(String(150), default="Medical Leave")
    is_medically_excused = Column(Boolean, default=True)
    retest_scheduled = Column(Boolean, default=False)
    retest_date = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    recipient_user_id = Column(Integer, nullable=True, index=True)
    recipient_role = Column(String(50), nullable=True, index=True)
    sender_name = Column(String(100), nullable=False)
    sender_role = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)
    priority = Column(String(20), default="NORMAL")
    action_url = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    read_at = Column(DateTime, nullable=True)


# =========================================================================
# FINANCE & ACCOUNTS COORDINATOR DOMAIN MODELS
# =========================================================================

class FeeDefaulter(Base):
    """Per-student overdue fee record with aging, reminder tracking, and waiver support."""
    __tablename__ = "fee_defaulters"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True, index=True)
    student_name = Column(String(100), nullable=False)
    class_name = Column(String(30), nullable=False)
    roll_no = Column(String(20), nullable=True)
    parent_name = Column(String(100), nullable=False)
    parent_phone = Column(String(20), nullable=False)
    milestone_title = Column(String(150), nullable=False)
    amount_due = Column(Float, nullable=False)
    days_overdue = Column(Integer, default=0, index=True)
    reminder_sent = Column(Boolean, default=False)
    reminder_count = Column(Integer, default=0)
    last_reminder_at = Column(DateTime, nullable=True)
    # Waiver / concession
    waiver_amount = Column(Float, default=0.0)
    waiver_reason = Column(String(255), nullable=True)
    waiver_approved_by = Column(String(100), nullable=True)
    waiver_approved_at = Column(DateTime, nullable=True)
    # JSON list of partial payments: [{date, amount, method, utr}]
    payment_history_json = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(30), default="Overdue", index=True)  # Overdue, Partially Paid, Paid, Waived
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class VendorInvoice(Base):
    """Institutional accounts-payable: vendor invoices awaiting authorization and wire transfer."""
    __tablename__ = "vendor_invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String(50), unique=True, nullable=False)
    vendor_name = Column(String(150), nullable=False)
    vendor_category = Column(String(80), nullable=True)  # Fuel, Lab Supplies, Utilities, Catering, AV
    invoice_for = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    invoice_date = Column(String(50), nullable=False)
    due_date = Column(String(50), nullable=True)
    status = Column(String(50), default="Pending Approval", index=True)
    # Pending Approval | Audit Clearance Needed | Approved for Wire | Paid | Rejected
    authorized_by = Column(String(100), nullable=True)
    authorized_at = Column(DateTime, nullable=True)
    payment_utr = Column(String(100), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    payment_mode = Column(String(50), nullable=True)  # NEFT, RTGS, Cheque, UPI
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class PaymentTransaction(Base):
    """Online payment gateway ledger: every UPI/NetBanking/Card inbound payment, with reconciliation state."""
    __tablename__ = "payment_transactions"
    id = Column(Integer, primary_key=True, index=True)
    utr_number = Column(String(100), unique=True, nullable=False)
    student_name = Column(String(100), nullable=False)
    class_name = Column(String(30), nullable=False)
    parent_name = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)  # UPI, NetBanking, Credit Card, Debit Card, NEFT, Cash
    bank_name = Column(String(100), nullable=True)
    milestone_title = Column(String(150), nullable=False)
    status = Column(String(30), default="Success", index=True)  # Success, Failed, Pending, Refunded
    transaction_date = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    reconciled = Column(Boolean, default=False, index=True)
    reconciled_at = Column(DateTime, nullable=True)
    reconciled_by = Column(String(100), nullable=True)
    gateway_ref = Column(String(150), nullable=True)  # Razorpay/PayU order ref
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class FinanceDispatchLog(Base):
    """Audit trail for every WhatsApp / SMS bulk broadcast dispatched by the Accounts Coordinator."""
    __tablename__ = "finance_dispatch_logs"
    id = Column(Integer, primary_key=True, index=True)
    dispatch_type = Column(String(50), nullable=False)   # WhatsApp, SMS, Email
    dispatch_scope = Column(String(80), nullable=True)   # All Defaulters | 30+ Days | 16-30 Days | 0-15 Days
    target_count = Column(Integer, default=0)
    total_amount_targeted = Column(Float, default=0.0)
    dispatch_note = Column(Text, nullable=True)
    dispatched_by = Column(String(100), nullable=False, default="Mr. Arvind Krishnan")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)





