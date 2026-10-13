import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    role = Column(String(20), nullable=False)  # admin, teacher, parent, student
    school_code = Column(String(50), default="EDU-GLOBAL-360")
    password = Column(String(120), default="password123")
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
    category = Column(String(20), default="urgent")  # urgent, upcoming
    due_date = Column(String(50), nullable=False)
    assigned_to = Column(String(100), nullable=False)
    status = Column(String(20), default="Pending")  # Pending, In Progress, Completed
    priority = Column(String(20), default="High")

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
    due_date = Column(String(50), nullable=False)
    teacher_id = Column(Integer, nullable=False)
    teacher_name = Column(String(100), nullable=False)
    max_marks = Column(Integer, default=20)

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
    status = Column(String(20), default="submitted")  # submitted, graded, pending
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    graded_at = Column(DateTime, nullable=True)

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
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

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
