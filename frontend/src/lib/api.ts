import {
  User, Student, OfficialDocument, TriageAlert, AdminTask, AdmissionEnquiry,
  EventItem, EventAssignment, VendorEquipment, ExitClearance,
  LiveClass, AttendanceRecord, Homework, HomeworkSubmission,
  FocusTable, LeaveRequest, FeeMilestone, BusRoute,
  StudentPortfolio, ClassRecording,
  StaffMemberItem, TeacherPermissionRequest, InventoryRecord, FeeDefaulter,
  TeacherScheduleItem, TeacherDutyItem, TeacherStudentRosterItem,
  JuniorDashboardOverview, GamificationProfile, DailyQuest, MagicBoosterChest,
  AdventureTimetableItem, JuniorBusRadar, ChestUnlockResponse,
  SubstitutionSlot, AvailableFacultyItem, SecurityAuditLog, FeeFinancialAnalytics, AcademicRolloverClass,
  PeriodActivityType, TeacherPersonalScheduleItem, FacultyDutyCategory, FacultyDutyTask,
  InteractionScope, ParentTeacherNote, PTMEventConfig, PTMSlot,
  TaskType, TaskStatus, BacklogEvent, AcademicCompliance
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fallback in-memory store so UI is 100% reactive and functional even if backend is starting
let fallbackTriage: TriageAlert[] = [
  {
    id: 1,
    level: 'red',
    category: 'attendance',
    title: 'Chronic Absenteeism: 20 Students Absent Today',
    description: '5 students (including Kabir Mehta, Roll #15) have been absent for 3+ consecutive days without parent leave applications.',
    count_affected: 5,
    action_label: 'Assign Class Teacher to Call Parents',
    action_endpoint: '/api/admin/triage/1/act',
    resolved: false,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    level: 'red',
    category: 'academics',
    title: 'Academic Drop: Class 8B Maths Average Down by 18%',
    description: 'Unit Test 2 quadratic equations results show significant dip in Class 8B. 12 students scored below 60%.',
    count_affected: 12,
    action_label: 'Schedule Review with Maths Teacher & Deploy Focus Table',
    action_endpoint: '/api/admin/triage/2/act',
    resolved: false,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    level: 'orange',
    category: 'fees',
    title: 'Pending Milestone 2: 30 Students Overdue',
    description: 'Fee Milestone 2 was due on 10th Oct. ₹5,55,000 pending collection across Class 8 and Class 9.',
    count_affected: 30,
    action_label: 'Trigger Targeted Push Reminders & Tele-Caller Call List',
    action_endpoint: '/api/admin/triage/3/act',
    resolved: false,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    level: 'orange',
    category: 'operations',
    title: 'Telemetry Delay: 2 School Buses (Route 4 & Route 7)',
    description: 'Bus Route 4 GPS ping delayed by 12 mins near Outer Ring Road flyover.',
    count_affected: 2,
    action_label: 'Ping Transport Supervisor & Driver Ramesh',
    action_endpoint: '/api/admin/triage/4/act',
    resolved: false,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    level: 'green',
    category: 'tasks',
    title: 'Board Exam Registration Data Verification',
    description: 'Class 10 CBSE LOC student photographs and subject combinations need final digital sign-off before 5:00 PM.',
    count_affected: 45,
    action_label: 'Complete LOC Verification',
    action_endpoint: '/api/admin/triage/5/act',
    resolved: false,
    created_at: new Date().toISOString()
  }
];

let fallbackTasks: AdminTask[] = [
  { id: 1, title: "Submit Class 10 Board Exam LOC to CBSE Portal", category: "urgent", due_date: "Today, 5:00 PM", assigned_to: "Academic Coordinator", status: "In Progress", priority: "High" },
  { id: 2, title: "Inspect Stage Audio & LED Wall Setup for Annual Day", category: "urgent", due_date: "Today, 6:30 PM", assigned_to: "Estate Manager", status: "Pending", priority: "High" },
  { id: 3, title: "Audit Term 2 Fee Defaulters & Dispatch SMS Digest", category: "upcoming", due_date: "Tomorrow, 11:00 AM", assigned_to: "Accounts Office", status: "Pending", priority: "Medium" },
  { id: 4, title: "Review 8 New Admission Enquiries from AI Chatbot", category: "upcoming", due_date: "15 Oct, 2:00 PM", assigned_to: "Admissions Head", status: "Pending", priority: "Medium" }
];

let fallbackEnquiries: AdmissionEnquiry[] = [
  {
    id: 1,
    student_name: "Siddharth Rao",
    parent_name: "Mrs. Meera Rao",
    email: "meera.rao@example.com",
    phone: "+91 98450 99881",
    target_grade: "Class 8",
    stage: "visit",
    chat_transcript: JSON.stringify([
      { sender: "parent", text: "Hi, does EDU360 follow the CBSE curriculum for Class 8?", time: "10:14 AM" },
      { sender: "bot", text: "Hello! Yes, our institution is fully affiliated with CBSE (New Delhi). We integrate experiential STEM labs and outcome-based Focus Tables.", time: "10:14 AM" },
      { sender: "parent", text: "What is the fee range for Grade 8, and is bus transport available to Whitefield?", time: "10:15 AM" },
      { sender: "bot", text: "Annual tuition is structured in 3 milestones totaling approx ₹65,000. Route 4 specifically covers Whitefield with live GPS tracking! Would you like me to book a campus tour?", time: "10:15 AM" },
      { sender: "parent", text: "Yes please! Tomorrow around 11:30 AM would be great for my son Siddharth.", time: "10:16 AM" },
      { sender: "bot", text: "Booked! I have notified our Admissions Counselor. See you tomorrow at 11:30 AM!", time: "10:16 AM" }
    ]),
    notes: "Campus tour scheduled tomorrow 11:30 AM. Highly interested in STEM lab.",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    student_name: "Tanvi Deshmukh",
    parent_name: "Dr. Amit Deshmukh",
    email: "amit.d@example.com",
    phone: "+91 98450 99882",
    target_grade: "Class 6",
    stage: "followup",
    notes: "Needs fee milestone installment breakdown via email.",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    student_name: "Aditya Roy",
    parent_name: "Mrs. Neha Roy",
    email: "neha.roy@example.com",
    phone: "+91 98450 99883",
    target_grade: "Class 9",
    stage: "new",
    notes: "Inquired about sports facilities and robotics club.",
    created_at: new Date().toISOString()
  }
];

let fallbackDocuments: OfficialDocument[] = [
  { id: 1, student_id: 1, title: "Bonafide Certificate 2025-26", doc_type: "Bonafide", file_url: "/documents/bonafide_aarav_sharma.pdf", is_official: true, uploaded_by_role: "admin", status: "Verified", verified_stamp: "EDU360 Official Seal - Reg #9921", upload_date: new Date().toISOString() },
  { id: 2, student_id: 1, title: "Term 1 Consolidated Marks Memo", doc_type: "Marks Card", file_url: "/documents/term1_marks_aarav_sharma.pdf", is_official: true, uploaded_by_role: "admin", status: "Verified", verified_stamp: "EDU360 Examination Controller", upload_date: new Date().toISOString() },
  { id: 3, student_id: 1, title: "Municipal Birth Certificate Copy", doc_type: "Birth Certificate", file_url: "/documents/birth_cert_aarav.pdf", is_official: true, uploaded_by_role: "admin", status: "Verified", verified_stamp: "Verified by Registrar", upload_date: new Date().toISOString() }
];

let fallbackExitClearance: ExitClearance[] = [
  {
    id: 1,
    student_id: 1,
    student_name: "Aarav Sharma (Sample Exit Flow)",
    class_name: "Class 8B",
    fee_cleared: true,
    library_cleared: true,
    inventory_cleared: true,
    tc_ready: true,
    digital_parent_approved: false,
    digital_approval_timestamp: undefined,
    physical_scan_url: undefined,
    physical_sign_verified: false,
    status: "Pending Parent Digital Approval"
  },
  {
    id: 2,
    student_id: 2,
    student_name: "Karan Malhotra",
    class_name: "Class 10A",
    fee_cleared: true,
    library_cleared: true,
    inventory_cleared: true,
    tc_ready: true,
    digital_parent_approved: true,
    digital_approval_timestamp: "12 Oct 2026, 04:15 PM UTC",
    physical_scan_url: "/assets/scanned_register_karan_malhotra.png",
    physical_sign_verified: true,
    status: "Completed & Permanently Archived"
  }
];

let fallbackAttendance: AttendanceRecord[] = [
  { id: 1, class_id: 1, student_id: 1, student_name: "Aarav Sharma", join_timestamp: "+3.2m (10:03 AM)", minutes_late: 3.2, status: "Present", teacher_override: false, date: "2026-10-13" },
  { id: 2, class_id: 1, student_id: 2, student_name: "Diya Patel", join_timestamp: "+1.0m (10:01 AM)", minutes_late: 1.0, status: "Present", teacher_override: false, date: "2026-10-13" },
  { id: 3, class_id: 1, student_id: 3, student_name: "Rohan Iyer", join_timestamp: "+14.5m (10:14 AM)", minutes_late: 14.5, status: "Late", teacher_override: false, date: "2026-10-13" },
  { id: 4, class_id: 1, student_id: 4, student_name: "Ananya Gupta", join_timestamp: "+6.0m (10:06 AM)", minutes_late: 6.0, status: "Present", teacher_override: false, date: "2026-10-13" },
  { id: 5, class_id: 1, student_id: 5, student_name: "Kabir Mehta", join_timestamp: undefined, minutes_late: 0.0, status: "Absent", teacher_override: false, date: "2026-10-13" }
];

let fallbackHomeworkSub: HomeworkSubmission = {
  id: 1,
  homework_id: 1,
  student_id: 1,
  student_name: "Aarav Sharma",
  original_file_url: "/samples/math_worksheet.png",
  annotated_file_url: "/samples/math_worksheet.png",
  annotations_json: JSON.stringify([
    { type: "tick", x: 190, y: 140, color: "#10B981" },
    { type: "tick", x: 190, y: 280, color: "#10B981" },
    { type: "circle", x: 380, y: 420, radius: 35, color: "#EF4444" },
    { type: "text", x: 430, y: 415, text: "Check sign in Q4: (-b ± √Δ)/(2a)", color: "#EF4444" }
  ]),
  marks_obtained: 17.5,
  teacher_remarks: "Impressive factoring in Q1 and Q2! In Q4, please double-check the negative sign in the discriminant formula before squaring.",
  status: "graded",
  submitted_at: new Date(Date.now() - 86400000).toISOString(),
  graded_at: new Date(Date.now() - 14400000).toISOString()
};

let fallbackFocusTable: FocusTable = {
  id: 1,
  student_id: 1,
  student_name: "Aarav Sharma",
  subject: "Mathematics",
  weak_concept: "Quadratic Equations & Sign Rules in Quadratic Formula",
  current_score_pct: 52.0,
  target_score_pct: 82.0,
  revision_plan_json: JSON.stringify({
    days: [
      { day: "Day 1 (Mon)", focus: "Quadratic Standard Form & Identifying a, b, c", exercise: "Watch 12-min concept recap and list 5 equations.", parent_checklist: "Verified concept video completed.", status: "Completed" },
      { day: "Day 2 (Tue)", focus: "Factoring by Splitting the Middle Term", exercise: "Solve 4 standard factoring questions on page 64.", parent_checklist: "Verified 4 solved problems in rough notebook.", status: "Completed" },
      { day: "Day 3 (Wed)", focus: "Discriminant (b² - 4ac) Calculation & Signs", exercise: "Revisit teacher corrections on Worksheet #4 and fix Q4.", parent_checklist: "Checked corrected formula with student.", status: "In Progress" },
      { day: "Day 4 (Thu)", focus: "Timed 15-Minute Rapid Assessment", exercise: "Attempt 6 online micro-quiz questions on EDU360 portal.", parent_checklist: "Verify score submission.", status: "Upcoming" }
    ]
  }),
  teacher_action: "Host 5-min 1-on-1 doubt clearing session during zero period on Thursday.",
  parent_check_completed: true,
  status: "in_progress",
  backlog_count: 1,
  academic_compliance_json: JSON.stringify({
    total_assigned: 9,
    on_time_submissions: 2,
    late_submissions: 0,
    backlog_count: 1,
    compliance_pct: 88.9,
    last_scanned_at: "2026-10-17T21:57:00Z"
  }),
  updated_at: new Date().toISOString()
};

let fallbackHomeworkList: Homework[] = [
  {
    id: 1,
    title: 'Worksheet #4: Solving Quadratics by Factoring',
    subject: 'Mathematics',
    class_name: 'Class 8-B',
    description: 'Complete Q1 to Q10 showing all intermediate calculation steps for quadratic roots. Mandatory step documentation.',
    task_type: 'DAILY_HOMEWORK',
    due_date: '2026-10-15',
    due_time: '17:00',
    status: 'BACKLOG',
    assigned_date: '2026-10-12',
    teacher_id: 2,
    teacher_name: 'Mrs. Ananya Verma',
    max_marks: 20,
    resource_url: '/samples/math_worksheet.png',
    weightage: 'Daily Practice (5 pts)',
    backlogEvidenceCode: '#EVD-BKLOG-884',
    isOverdue: true
  },
  {
    id: 2,
    title: 'Constitutional Rights Comparative Analysis Case Study',
    subject: 'Social Science',
    class_name: 'Class 8-B',
    description: 'Comparative study of Right to Equality (Articles 14-18) vs Right to Freedom (Articles 19-22) with 2 landmark Supreme Court cases.',
    task_type: 'DAILY_HOMEWORK',
    due_date: '2026-10-13',
    due_time: '16:00',
    status: 'SUBMITTED',
    assigned_date: '2026-10-10',
    teacher_id: 3,
    teacher_name: 'Mrs. Kalyani Murthy',
    max_marks: 20,
    resource_url: '/samples/civics_handout.pdf',
    weightage: 'Daily Practice (5 pts)'
  },
  {
    id: 3,
    title: "The Merchant of Venice: Portia's Mercy Speech Critical Analysis",
    subject: 'English Literature',
    class_name: 'Class 8-B',
    description: "Write a 300-word critical evaluation of Act IV Scene 1. Contrast Portia's argument on divine mercy against Shylock's legal bond insistence.",
    task_type: 'DAILY_HOMEWORK',
    due_date: '2026-10-18',
    due_time: '17:00',
    status: 'PENDING',
    assigned_date: '2026-10-14',
    teacher_id: 4,
    teacher_name: 'Mrs. Sunitha Rao',
    max_marks: 15,
    resource_url: '/samples/merchant_of_venice_act4.pdf',
    weightage: 'Weekly Essay (10 pts)'
  },
  {
    id: 4,
    title: "Force & Laws of Motion: Newton's Third Law Lab Sheet",
    subject: 'Physics',
    class_name: 'Class 8-B',
    description: 'Experimental verification of action-reaction pairs using dual spring balances. Free-body diagram calculations and error margins.',
    task_type: 'DAILY_HOMEWORK',
    due_date: '2026-10-10',
    due_time: '17:00',
    status: 'GRADED',
    assigned_date: '2026-10-06',
    teacher_id: 5,
    teacher_name: 'Dr. K. Raman',
    max_marks: 20,
    resource_url: '/samples/physics_spring_lab.pdf',
    weightage: 'Lab Assessment (20 pts)'
  },
  {
    id: 5,
    title: 'Chemical Reactions: Redox Equations Balancing Practice',
    subject: 'Chemistry',
    class_name: 'Class 8-B',
    description: 'Complete balancing for 25 redox reactions, decomposition equations, and displacement reactions with stoichiometric coefficient validation.',
    task_type: 'DAILY_HOMEWORK',
    due_date: '2026-10-17',
    due_time: '18:00',
    status: 'PENDING',
    assigned_date: '2026-10-15',
    teacher_id: 6,
    teacher_name: 'Mrs. S. Sen',
    max_marks: 20,
    resource_url: '/samples/chemistry_worksheet_5.pdf',
    weightage: 'Daily Practice (5 pts)'
  },
  {
    id: 6,
    title: 'Cell Division: Mitosis & Meiosis Stages Comparison Chart',
    subject: 'Biology',
    class_name: 'Class 8-B',
    description: 'Hand-drawn structural diagrams of chromosomes during Metaphase and Anaphase with spindle fiber attachments and centriole positions.',
    task_type: 'DAILY_HOMEWORK',
    due_date: '2026-10-19',
    due_time: '17:00',
    status: 'PENDING',
    assigned_date: '2026-10-16',
    teacher_id: 7,
    teacher_name: 'Dr. Shalini Gupta',
    max_marks: 20,
    resource_url: '/samples/biology_cell_diagram.pdf',
    weightage: 'Daily Practice (5 pts)'
  },
  {
    id: 7,
    title: 'Autonomous Mars Rover & Sensor Array Capstone Project',
    subject: 'STEM & Robotics',
    class_name: 'Class 8-B',
    description: 'End-to-end hardware-software prototype with ultrasonic obstacle detection, ESP32 telemetry streaming, and a responsive web telemetry dashboard.',
    task_type: 'ASSIGNMENT',
    due_date: '2026-10-28',
    due_time: '18:00',
    status: 'PENDING',
    assigned_date: '2026-10-01',
    teacher_id: 2,
    teacher_name: 'Mr. Rajesh Nambiar',
    max_marks: 50,
    resource_url: '/samples/Mars_Rover_Capstone_Brief.pdf',
    weightage: '25% of Term 1 Final Grade',
    progress_pct: 65.0
  },
  {
    id: 8,
    title: 'National History Monograph: The Indian Constitution Evolution',
    subject: 'Social Science',
    class_name: 'Class 8-B',
    description: '1500-word academic monograph referencing Constituent Assembly debates, B.R. Ambedkar committee drafts, and modern fundamental rights jurisprudence.',
    task_type: 'ASSIGNMENT',
    due_date: '2026-11-05',
    due_time: '23:59',
    status: 'PENDING',
    assigned_date: '2026-10-05',
    teacher_id: 3,
    teacher_name: 'Mrs. Kalyani Murthy',
    max_marks: 40,
    resource_url: '/samples/Constitution_Monograph_Guidelines.pdf',
    weightage: '15% of Term 1 Final Grade',
    progress_pct: 40.0
  },
  {
    id: 9,
    title: 'Full-Stack Data Visualization Portal with Python & SQLite',
    subject: 'Computer Science',
    class_name: 'Class 8-B',
    description: 'Develop a relational database client with normalized schemas, REST API endpoints, interactive Chart.js visualization, and unit test coverage.',
    task_type: 'ASSIGNMENT',
    due_date: '2026-11-14',
    due_time: '23:59',
    status: 'PENDING',
    assigned_date: '2026-10-08',
    teacher_id: 2,
    teacher_name: 'Mr. Rajesh Nambiar',
    max_marks: 50,
    resource_url: '/samples/CS_Portal_Project_Blueprint.zip',
    weightage: '20% of Term 1 Final Grade',
    progress_pct: 20.0
  }
];

let fallbackBacklogEvents: BacklogEvent[] = [
  {
    id: 1,
    student_id: 1,
    homework_id: 1,
    focus_table_id: 1,
    evidence_code: '#EVD-BKLOG-884',
    subject: 'Mathematics',
    title: 'Worksheet #4: Solving Quadratics by Factoring',
    task_type: 'DAILY_HOMEWORK',
    due_date: '2026-10-15',
    due_time: '17:00',
    status: 'UNRESOLVED',
    detected_at: '2026-10-15T17:15:00Z',
    late_submission: false,
    teacher_name: 'Mrs. Ananya Verma',
    notes: 'Student missed scheduled cutoff (15 Oct 2026, 05:00 PM). Automatically transitioned to Backlog for parent PTM evidence review.'
  }
];

let fallbackAcademicCompliance: AcademicCompliance = {
  student_id: 1,
  student_name: 'Aarav Sharma',
  total_assigned: 9,
  on_time_submissions: 2,
  late_submissions: 0,
  backlog_count: 1,
  compliance_pct: 88.9,
  itemized_backlogs: fallbackBacklogEvents
};

let fallbackLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    student_id: 1,
    student_name: "Aarav Sharma",
    parent_name: "Mr. Rajesh Sharma",
    from_date: "16 Oct 2026",
    to_date: "16 Oct 2026",
    reason: "Orthodontic dental consultation and braces adjustment at Apollo Clinic.",
    status: "Pending",
    applied_at: new Date().toISOString()
  }
];

let fallbackFees: FeeMilestone[] = [
  { id: 1, student_id: 1, title: "Milestone 1: Term 1 Tuition & Curriculum Fee", amount: 22000, due_date: "15 Jul 2026", status: "Paid", receipt_no: "REC-2026-FEE-5821", paid_at: "12 Jul 2026, 11:20 AM", payment_method: "UPI (GPay)" },
  { id: 2, student_id: 1, title: "Milestone 2: Term 2 Tuition & Transport Fee", amount: 18500, due_date: "25 Oct 2026", status: "Overdue" },
  { id: 3, student_id: 1, title: "Milestone 3: Term 3 Activities, Labs & Annual Day", amount: 15000, due_date: "15 Jan 2027", status: "Upcoming" }
];

let fallbackBus: BusRoute = {
  id: 1,
  route_number: "Route 4",
  driver_name: "Ramesh Kumar",
  driver_phone: "+91 98450 12345",
  vehicle_no: "KA-01-EB-4412",
  stops_json: JSON.stringify([
    { name: "School Main Campus", time: "03:15 PM", status: "Departed" },
    { name: "Sarjapur Signal Junction", time: "03:26 PM", status: "Passed" },
    { name: "Bellandur EcoSpace Gate 2", time: "03:38 PM", status: "Current Stop" },
    { name: "Sector 15 Crossroad (Aarav's Stop)", time: "03:46 PM", status: "Approaching (ETA 8 mins)" },
    { name: "Greenwood Palms Apartments", time: "03:55 PM", status: "Terminal Stop" }
  ]),
  current_stop_idx: 2,
  live_status: "Moving smoothly • 8 mins to Aarav's Stop",
  eta_mins: 8
};

let fallbackStaff: StaffMemberItem[] = [
  { id: 1, name: "Mrs. Ananya Verma", role: "Senior Mathematics Faculty", department: "Academics", phone: "+91 98111 22331", email: "ananya.v@oakridge.edu", status: "Present", assigned_duties: "Class Teacher 8A • Annual Day Stage Committee Lead", salary: 78000, qualification: "M.Sc. Mathematics, B.Ed" },
  { id: 2, name: "Dr. K. Raman", role: "Head of Science & Robotics", department: "Academics", phone: "+91 98111 22332", email: "raman.k@oakridge.edu", status: "Present", assigned_duties: "Class Teacher 9B • Science Olympiad Coordinator", salary: 88000, qualification: "Ph.D. Physics, IISc" },
  { id: 3, name: "Mr. Vikram Joshi", role: "Physical Education Director", department: "Sports & Estate", phone: "+91 98111 22333", email: "vikram.j@oakridge.edu", status: "Present", assigned_duties: "Inter-School Sports Meet Lead • Annual Day Discipline", salary: 65000, qualification: "M.P.Ed" },
  { id: 4, name: "Ms. Priya Sen", role: "Arts & Performing Arts Coordinator", department: "Cultural", phone: "+91 98111 22334", email: "priya.s@oakridge.edu", status: "Short Permission", assigned_duties: "Navarasa Annual Day Costumes & Rehearsals", salary: 62000, qualification: "MFA" },
  { id: 5, name: "Ramesh Kumar", role: "Senior Transport Pilot", department: "Logistics", phone: "+91 98450 12345", email: "transport@oakridge.edu", status: "Present", assigned_duties: "Bus Route 4 (Sarjapur - Whitefield)", salary: 32000 },
  { id: 6, name: "Horizon AV Tech Solutions", role: "Audio-Visual & LED Contractor", department: "External Vendor", phone: "+91 98765 43210", email: "horizon.av@gmail.com", status: "Present", assigned_duties: "Annual Day Stage LED P3.9 Setup & Sound", salary: 145000 }
];

let fallbackTeacherPermissions: TeacherPermissionRequest[] = [
  { id: 1, teacher_id: 4, teacher_name: "Ms. Priya Sen", type: "Early Departure", date: "15 Oct 2026", reason: "Procuring dance costumes from wholesale fabric market in Chickpet for Annual Day.", status: "Pending", applied_at: "Today, 09:15 AM" },
  { id: 2, teacher_id: 2, teacher_name: "Dr. K. Raman", type: "On-Duty Movement", date: "18 Oct 2026", reason: "Escorting 4 shortlisted students to Regional Science Olympiad Phase 2 practicals at IISc.", status: "Approved", applied_at: "Yesterday" }
];

let fallbackInventory: InventoryRecord[] = [
  { id: 1, name: "NCERT Class 8 & 9 Standard Textbooks", category: "Books", total_stock: 1200, issued_count: 1140, damaged_count: 12, reorder_level: 100, location: "Central Library Rack A", last_audited: "10 Oct 2026" },
  { id: 2, name: "Optics Kits (Convex/Concave Lenses & Lasers)", category: "Lab Equipment", total_stock: 45, issued_count: 38, damaged_count: 2, reorder_level: 10, location: "Physics Lab 2 Cabinet 4", last_audited: "08 Oct 2026" },
  { id: 3, name: "Student Coding Tablets (Lenovo M10 HD)", category: "IT Hardware", total_stock: 90, issued_count: 85, damaged_count: 1, reorder_level: 15, location: "Computer Lab 1 Charging Cart", last_audited: "12 Oct 2026" },
  { id: 4, name: "Tournament Match Footballs (FIFA Quality)", category: "Sports Gear", total_stock: 35, issued_count: 32, damaged_count: 4, reorder_level: 12, location: "Sports Equipment Room B", last_audited: "11 Oct 2026" },
  { id: 5, name: "Interactive Smart Board Touch Stylus & Pens", category: "Classroom", total_stock: 60, issued_count: 54, damaged_count: 3, reorder_level: 15, location: "Academic Admin Supply Vault", last_audited: "13 Oct 2026" }
];

let fallbackFeeDefaulters: FeeDefaulter[] = [
  { id: 1, student_name: "Kabir Mehta", class_name: "Class 8A", roll_no: "15", parent_name: "Mr. Suresh Mehta", parent_phone: "+91 98111 00015", milestone_title: "Milestone 2 (Term 2 Tuition)", amount_due: 18500, days_overdue: 5, reminder_sent: false },
  { id: 2, student_name: "Vivaan Sen", class_name: "Class 8A", roll_no: "22", parent_name: "Mrs. Ritu Sen", parent_phone: "+91 98111 00022", milestone_title: "Milestone 2 (Term 2 Tuition)", amount_due: 18500, days_overdue: 5, reminder_sent: false },
  { id: 3, student_name: "Tanvi Deshmukh", class_name: "Class 6B", roll_no: "08", parent_name: "Dr. Amit Deshmukh", parent_phone: "+91 98450 99882", milestone_title: "Milestone 2 (Term 2 Tuition)", amount_due: 16000, days_overdue: 5, reminder_sent: true },
  { id: 4, student_name: "Rohan Iyer", class_name: "Class 8A", roll_no: "18", parent_name: "Mr. S. Iyer", parent_phone: "+91 98111 00018", milestone_title: "Milestone 2 (Term 2 Tuition)", amount_due: 18500, days_overdue: 5, reminder_sent: false }
];

let fallbackSubstitutions: SubstitutionSlot[] = [
  {
    id: 1,
    absent_teacher_id: 1,
    absent_teacher_name: "Mrs. Ananya Verma",
    absent_reason: "Short Permission (1.5 hrs) - Family medical appointment",
    date: "Today, 16 Oct 2026",
    period_number: 2,
    time_slot: "09:45 AM - 10:30 AM",
    class_name: "Class 8-B",
    subject: "Mathematics",
    substitute_teacher_id: null,
    substitute_teacher_name: null,
    status: "Unassigned",
    priority: "High"
  },
  {
    id: 2,
    absent_teacher_id: 2,
    absent_teacher_name: "Dr. K. Raman",
    absent_reason: "Casual Leave - State Science Fair Jury Member",
    date: "Today, 16 Oct 2026",
    period_number: 4,
    time_slot: "11:30 AM - 12:15 PM",
    class_name: "Class 9-A",
    subject: "Physics",
    substitute_teacher_id: null,
    substitute_teacher_name: null,
    status: "Unassigned",
    priority: "High"
  },
  {
    id: 3,
    absent_teacher_id: 3,
    absent_teacher_name: "Ms. Priya Sen",
    absent_reason: "Short Permission - Annual Day Costume studio pickup",
    date: "Today, 16 Oct 2026",
    period_number: 5,
    time_slot: "01:00 PM - 01:45 PM",
    class_name: "Class 7-A",
    subject: "English Literature",
    substitute_teacher_id: 4,
    substitute_teacher_name: "Mr. Deepak Rao",
    status: "Assigned",
    priority: "Medium"
  },
  {
    id: 4,
    absent_teacher_id: 2,
    absent_teacher_name: "Dr. K. Raman",
    absent_reason: "Casual Leave - State Science Fair Jury Member",
    date: "Today, 16 Oct 2026",
    period_number: 6,
    time_slot: "01:45 PM - 02:30 PM",
    class_name: "Class 10-A",
    subject: "Chemistry Lab",
    substitute_teacher_id: null,
    substitute_teacher_name: null,
    status: "Unassigned",
    priority: "High"
  }
];

let fallbackAvailableFaculty: AvailableFacultyItem[] = [
  { id: 4, name: "Mr. Deepak Rao", department: "Humanities & English", free_periods_today: 3, is_subject_match: true, current_status: "Free (Period 2 & 4)" },
  { id: 5, name: "Ms. Sunita Roy", department: "Sciences & Biology", free_periods_today: 2, is_subject_match: true, current_status: "Free (Period 4 & 6)" },
  { id: 6, name: "Mr. Arvind Swamy", department: "Mathematics", free_periods_today: 4, is_subject_match: true, current_status: "Free (Period 2 & 5)" },
  { id: 7, name: "Mrs. Shalini Nair", department: "Computer Science", free_periods_today: 2, is_subject_match: false, current_status: "Free (Period 4 & 6)" }
];

let fallbackTeacherPersonalSchedule: TeacherPersonalScheduleItem[] = [
  {
    id: "sched-01",
    period_number: 1,
    start_time: "08:30 AM",
    end_time: "09:15 AM",
    day_of_week: "Monday",
    activity_type: "TEACHING_SESSION",
    class_grade: "Grade 8",
    section: "B",
    subject_name: "Class 8-B Maths",
    room_number: "Room 204",
    is_current_active_period: false,
    notes: "Chapter 4 Quadratic Equations test review and homework doubts"
  },
  {
    id: "sched-02",
    period_number: 2,
    start_time: "09:20 AM",
    end_time: "10:05 AM",
    day_of_week: "Monday",
    activity_type: "TEACHING_SESSION",
    class_grade: "Grade 7",
    section: "A",
    subject_name: "Class 7-A Maths",
    room_number: "Room 102",
    is_current_active_period: false,
    notes: "Fractions & Decimals foundational operations"
  },
  {
    id: "sched-03",
    period_number: 3,
    start_time: "10:10 AM",
    end_time: "10:55 AM",
    day_of_week: "Monday",
    activity_type: "FREE_PREP_PERIOD",
    subject_name: "Free / Prep & Curriculum Planning",
    room_number: "Faculty Resource Center",
    is_current_active_period: false,
    notes: "Evaluate Grade 8-B Unit Test 2 Answer Scripts & update Focus Tables"
  },
  {
    id: "sched-04",
    period_number: 4,
    start_time: "11:15 AM",
    end_time: "12:00 PM",
    day_of_week: "Monday",
    activity_type: "TEACHING_SESSION",
    class_grade: "Grade 9",
    section: "C",
    subject_name: "Class 9-C Maths",
    room_number: "Room 305",
    is_current_active_period: false,
    notes: "Coordinate geometry & linear equations in two variables"
  },
  {
    id: "sched-05",
    period_number: 5,
    start_time: "12:05 PM",
    end_time: "12:50 PM",
    day_of_week: "Monday",
    activity_type: "EXAM_INVIGILATION",
    class_grade: "Grade 10",
    section: "All",
    subject_name: "Exam Invigilation: CBSE Mock",
    room_number: "Examination Hall B (Seats 45-90)",
    is_current_active_period: true,
    notes: "Distribute sealed question papers at 12:05 PM sharp. Barcode scanning mandatory."
  },
  {
    id: "sched-06",
    period_number: 6,
    start_time: "01:30 PM",
    end_time: "02:15 PM",
    day_of_week: "Monday",
    activity_type: "LAB_SESSION",
    class_grade: "Grade 9",
    section: "A",
    subject_name: "Class 9-A STEM Lab",
    room_number: "Math & STEM Computing Lab",
    is_current_active_period: false,
    notes: "Desmos parabolic curve graphing simulations"
  },
  {
    id: "sched-07",
    period_number: 7,
    start_time: "02:20 PM",
    end_time: "03:00 PM",
    day_of_week: "Monday",
    activity_type: "SUBSTITUTION_COVER",
    class_grade: "Grade 7",
    section: "B",
    subject_name: "Substitution Cover (Mr. Joshi)",
    room_number: "Room 104",
    is_current_active_period: false,
    notes: "Supervise guided problem set on Integer arithmetic"
  },
  {
    id: "sched-08",
    period_number: 8,
    start_time: "03:05 PM",
    end_time: "03:45 PM",
    day_of_week: "Monday",
    activity_type: "HOMEROOM_MENTORSHIP",
    class_grade: "Grade 8",
    section: "B",
    subject_name: "Class 8-B Mentorship & Focus Table",
    room_number: "Room 204",
    is_current_active_period: false,
    notes: "Zero period 1-on-1 diagnostic review with Focus Table remedial students"
  }
];

let fallbackFacultyDutyTasks: FacultyDutyTask[] = [
  {
    id: "duty-01",
    teacher_id: "ananya",
    category: "EXAM_INVIGILATION",
    title: "Midterm Board Mock Exam Invigilation - Hall B",
    sub_category: "Senior Secondary Pre-Board Mock",
    event_or_exam_name: "Midterm Board Mock Examinations 2026",
    scheduled_date: "16 Oct 2026",
    time_window: "10:10 AM - 01:00 PM",
    location_or_venue: "Examination Hall B",
    seat_range: "Seats 45 - 90",
    student_count: 45,
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    assigned_by: "Vice Principal (Examinations)",
    is_weekly: false,
    day_of_week: "Friday",
    frequency: "ONE_TIME",
    action_checklist: [
      { item: "Collect sealed question paper packets & answer booklets from Exam Cell (09:45 AM)", completed: true },
      { item: "Cross-verify student Hall Tickets and biometric attendance at entrance", completed: true },
      { item: "Barcode scan and register all 45 student scripts before exam start", completed: false },
      { item: "Count, seal in tamper-evident envelopes, and deposit at Strong Room Locker #4", completed: false }
    ]
  },
  {
    id: "duty-03",
    teacher_id: "ananya",
    category: "EVENT_COMMITTEE",
    title: "Annual Day 2026: Stage & Audio-Visual Committee",
    sub_category: "Navarasa Themed Cultural Showcase",
    event_or_exam_name: "Annual Day 2026",
    scheduled_date: "24 Oct 2026",
    time_window: "04:00 PM - 08:30 PM",
    location_or_venue: "Main Auditorium & Green Rooms",
    status: "IN_PROGRESS",
    priority: "NORMAL",
    assigned_by: "Principal Dr. Sunita Kapoor",
    is_weekly: false,
    day_of_week: "Saturday",
    frequency: "ONE_TIME",
    action_checklist: [
      { item: "Confirm Stage LED backdrop cue sheet with Horizon AV contractor", completed: true },
      { item: "Coordinate wireless lapel microphones for Grade 8 drama troupe", completed: true },
      { item: "Review backstage student queue and costume change timing", completed: false },
      { item: "Audit safety fire exits and green room emergency clearance", completed: false }
    ]
  },
  {
    id: "duty-04",
    teacher_id: "ananya",
    category: "EVENT_COMMITTEE",
    title: "Sports Day 2026: Track Events Logistics & Refreshments",
    sub_category: "Inter-House Athletic Championship",
    event_or_exam_name: "Annual Sports Meet 2026",
    scheduled_date: "02 Nov 2026",
    time_window: "08:00 AM - 02:00 PM",
    location_or_venue: "Main Athletic Ground & Pavilion",
    status: "PENDING",
    priority: "NORMAL",
    assigned_by: "Sports Director Mr. R. Rawat",
    is_weekly: false,
    day_of_week: "Monday",
    frequency: "ONE_TIME",
    action_checklist: [
      { item: "Coordinate track-marking ribbons and stopwatch calibration with Physical Education team", completed: true },
      { item: "Confirm glucose hydration stations and first-aid medical tent supplies", completed: false },
      { item: "Arrange certificates & medals podium lineup with House Captains", completed: false }
    ]
  },
  {
    id: "duty-05",
    teacher_id: "ananya",
    category: "CAMPUS_SUBSTITUTION",
    title: "Class 7-A Foundation Math Cover (Mr. Joshi Absent)",
    sub_category: "Colleague Medical Leave Coverage",
    event_or_exam_name: "Faculty Emergency Coverage Roster",
    scheduled_date: "Today",
    time_window: "12:05 PM - 12:50 PM (Period 5)",
    location_or_venue: "Room 102",
    status: "PENDING",
    priority: "NORMAL",
    assigned_by: "Academic Coordinator Mrs. L. Gupta",
    is_weekly: false,
    day_of_week: "Friday",
    frequency: "DAILY",
    action_checklist: [
      { item: "Collect prepared lesson worksheet #4 from Mr. Joshi's faculty drawer", completed: true },
      { item: "Supervise 35 students on Fractions & Decimals drill", completed: false },
      { item: "Sign class attendance register and note student behavior entries", completed: false }
    ]
  },
  {
    id: "duty-06",
    teacher_id: "ananya",
    category: "WEEKLY_ROUTINE",
    title: "Weekly Focus Table Remedial Audit & Parent Sign-Off",
    sub_category: "Weekly Academic Intervention Loop",
    event_or_exam_name: "Weekly Focus Table Review Cycle",
    scheduled_date: "Every Friday (Weekly Cadence)",
    time_window: "03:15 PM - 04:00 PM",
    location_or_venue: "Faculty Desk 12 / Student Focus Hub",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    assigned_by: "Academic Dean & Homeroom Lead",
    is_weekly: true,
    day_of_week: "Friday",
    frequency: "WEEKLY",
    action_checklist: [
      { item: "Audit weekly mastery score delta for 4 assigned Focus Table students", completed: true },
      { item: "Dispatch targeted parent advisory notes with concept tag [Algebraic Fractions]", completed: true },
      { item: "Log zero-period remedial attendance in SIS Backlog Engine", completed: false },
      { item: "Submit weekly intervention sign-off to Academic Dean by 04:30 PM", completed: false }
    ]
  },
  {
    id: "duty-07",
    teacher_id: "ananya",
    category: "WEEKLY_ROUTINE",
    title: "Weekly Unit Lesson Plan & Question Bank Submission",
    sub_category: "Curriculum & Academic QA",
    event_or_exam_name: "Weekly Lesson Plan Governance",
    scheduled_date: "Every Monday (Weekly Routine)",
    time_window: "By 09:00 AM (Weekly)",
    location_or_venue: "Academic ERP Curriculum Portal",
    status: "PENDING",
    priority: "NORMAL",
    assigned_by: "HOD Mathematics",
    is_weekly: true,
    day_of_week: "Monday",
    frequency: "WEEKLY",
    action_checklist: [
      { item: "Upload Class 10 Calculus Chapter 5 lecture slides & activity worksheets", completed: false },
      { item: "Contribute 15 Higher Order Thinking (HOTS) questions to Central Bank", completed: false },
      { item: "Obtain digital HOD approval sign-off for next week's labs", completed: false }
    ]
  },
  {
    id: "duty-08",
    teacher_id: "ananya",
    category: "WEEKLY_ROUTINE",
    title: "Weekly Science & Mathematics Department Sync",
    sub_category: "Inter-Departmental Curriculum Sync",
    event_or_exam_name: "Weekly Academic Alignment",
    scheduled_date: "Every Wednesday (Weekly Routine)",
    time_window: "03:30 PM - 04:15 PM",
    location_or_venue: "Staff Conference Room 2",
    status: "COMPLETED",
    priority: "NORMAL",
    assigned_by: "Principal Dr. Sunita Kapoor",
    is_weekly: true,
    day_of_week: "Wednesday",
    frequency: "WEEKLY",
    action_checklist: [
      { item: "Review cross-disciplinary STEM physics-calculus integration milestones", completed: true },
      { item: "Align midterm assessment windows to prevent multiple exams on single days", completed: true },
      { item: "Sign off department meeting minutes in faculty portal", completed: true }
    ]
  }
];

let fallbackParentTeacherNotes: ParentTeacherNote[] = [
  {
    id: "ptn-01",
    interaction_scope: "HOMEROOM_CLASS",
    student_id: 1,
    student_name: "Aarav Sharma",
    student_class: "8-B",
    parent_id: "par-01",
    parent_name: "Mr. Rajesh Sharma",
    parent_phone: "+91 98111 00003",
    teacher_id: "ananya",
    teacher_name: "Mrs. Ananya Verma",
    homeroom_teacher_id: "ananya",
    note_type: "ACADEMIC_CONCERN",
    content: "Aarav made great progress in Linear Equations this week, but needs practice with word problems before the term exam.",
    created_at: "14 Oct 2026, 04:30 PM",
    is_focus_table_evidence: true,
    focus_concept_tag: "Algebraic Word Problems"
  },
  {
    id: "ptn-02",
    interaction_scope: "HOMEROOM_CLASS",
    student_id: 1,
    student_name: "Aarav Sharma",
    student_class: "8-B",
    parent_id: "par-01",
    parent_name: "Mr. Rajesh Sharma",
    parent_phone: "+91 98111 00003",
    teacher_id: "ananya",
    teacher_name: "Mrs. Ananya Verma",
    homeroom_teacher_id: "ananya",
    note_type: "APPRECIATION",
    content: "Commended for active leadership during the Science Exhibition setup. Displayed exceptional teamwork.",
    created_at: "12 Oct 2026, 11:15 AM",
    is_focus_table_evidence: false
  },
  {
    id: "ptn-03",
    interaction_scope: "SUBJECT_SPECIFIC",
    student_id: 2,
    student_name: "Rohan Deshmukh",
    student_class: "8-A",
    parent_id: "par-02",
    parent_name: "Dr. Amit Deshmukh",
    parent_phone: "+91 98450 99882",
    teacher_id: "ananya",
    teacher_name: "Mrs. Ananya Verma",
    subject_id: "subj-math",
    subject_name: "Mathematics",
    homeroom_teacher_id: "teacher-sharma",
    note_type: "ACADEMIC_CONCERN",
    content: "Rohan is scoring 52% in quadratic formula factorization. Scheduled him for 15-min remedial during zero period.",
    created_at: "15 Oct 2026, 02:40 PM",
    is_focus_table_evidence: true,
    focus_concept_tag: "Quadratic Formula Factorization"
  }
];

let fallbackPTMEventConfig: PTMEventConfig = {
  id: "ptm-conf-2026-term1",
  title: "Term 1 Post-Midterm Parent-Teacher Conference",
  event_date: "24 Oct 2026",
  school_start_time: "09:00 AM",
  school_end_time: "03:30 PM",
  slot_duration_mins: 10,
  buffer_mins: 2,
  blackout_windows: [
    { start: "11:00 AM", end: "11:15 AM", title: "Faculty Morning Tea Break" },
    { start: "01:00 PM", end: "01:45 PM", title: "Faculty Lunch Break" }
  ]
};

let fallbackPTMSlots: PTMSlot[] = [
  {
    id: "slot-01",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "09:00 AM",
    end_time: "09:10 AM",
    status: "BOOKED",
    interaction_scope: "HOMEROOM_CLASS",
    booked_student_id: 1,
    booked_student_name: "Aarav Sharma",
    booked_class: "8-B",
    booked_parent_id: "par-01",
    booked_parent_name: "Mr. Rajesh Sharma",
    subject_name: "Homeroom Class Review (8-B)",
    is_sibling_combo: false,
    meeting_url: "https://meet.google.com/edu-ptm-aarav-8b",
    focus_table_agenda: ["Algebraic Word Problems", "Attendance Stability"]
  },
  {
    id: "slot-02",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "09:12 AM",
    end_time: "09:22 AM",
    status: "AVAILABLE",
    interaction_scope: "HOMEROOM_CLASS",
    booked_student_id: undefined,
    meeting_url: "https://meet.google.com/edu-ptm-slot-02",
    focus_table_agenda: []
  },
  {
    id: "slot-03",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "09:24 AM",
    end_time: "09:34 AM",
    status: "HELD",
    interaction_scope: "SUBJECT_SPECIFIC",
    subject_name: "Mathematics",
    booked_student_id: 2,
    booked_student_name: "Rohan Deshmukh",
    booked_class: "8-A",
    booked_parent_name: "Dr. Amit Deshmukh",
    meeting_url: "https://meet.google.com/edu-ptm-slot-03",
    focus_table_agenda: ["Quadratic Equations"]
  },
  {
    id: "slot-04",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "09:36 AM",
    end_time: "09:56 AM",
    status: "BOOKED",
    interaction_scope: "HOMEROOM_CLASS",
    booked_student_id: 3,
    booked_student_name: "Meera Nambiar",
    booked_class: "8-B",
    booked_parent_name: "Mrs. Shobha Nambiar",
    is_sibling_combo: true,
    sibling_student_id: 5,
    sibling_student_name: "Kavya Nambiar (Class 5-A)",
    meeting_url: "https://meet.google.com/edu-ptm-sibling-combo-04",
    focus_table_agenda: ["Holistic Report Card", "Sibling Co-curricular Alignment"]
  },
  {
    id: "slot-05",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "10:10 AM",
    end_time: "10:20 AM",
    status: "BOOKED",
    interaction_scope: "SUBJECT_SPECIFIC",
    subject_name: "Mathematics",
    booked_student_id: 8,
    booked_student_name: "Tanvi Deshmukh",
    booked_class: "7-A",
    booked_parent_name: "Dr. Alok Deshmukh",
    locked_by_class: "Class 7-A Parent",
    meeting_url: "https://meet.google.com/edu-ptm-cross-class-lock",
    focus_table_agenda: ["Algebra Foundation", "Cross-Class PTM Locking"]
  },
  {
    id: "slot-05b",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "10:20 AM",
    end_time: "10:30 AM",
    status: "AVAILABLE",
    interaction_scope: "SUBJECT_SPECIFIC",
    subject_name: "Mathematics",
    meeting_url: "https://meet.google.com/edu-ptm-slot-05b"
  },
  {
    id: "slot-05c",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "10:30 AM",
    end_time: "10:40 AM",
    status: "AVAILABLE",
    interaction_scope: "SUBJECT_SPECIFIC",
    subject_name: "Mathematics",
    meeting_url: "https://meet.google.com/edu-ptm-slot-05c"
  },
  {
    id: "slot-break-tea",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "11:00 AM",
    end_time: "11:15 AM",
    status: "BREAK",
    interaction_scope: "HOMEROOM_CLASS",
    subject_name: "Faculty Morning Tea Break",
    is_sibling_combo: false
  },
  {
    id: "slot-06",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "11:20 AM",
    end_time: "11:30 AM",
    status: "AVAILABLE",
    interaction_scope: "HOMEROOM_CLASS",
    meeting_url: "https://meet.google.com/edu-ptm-slot-06"
  },
  {
    id: "slot-break-lunch",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "01:00 PM",
    end_time: "01:45 PM",
    status: "BREAK",
    interaction_scope: "HOMEROOM_CLASS",
    subject_name: "Faculty Lunch Break",
    is_sibling_combo: false
  },
  {
    id: "slot-07",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "02:00 PM",
    end_time: "02:10 PM",
    status: "AVAILABLE",
    interaction_scope: "SUBJECT_SPECIFIC",
    subject_name: "Mathematics",
    meeting_url: "https://meet.google.com/edu-ptm-slot-07"
  }
];

let fallbackAuditLogs: SecurityAuditLog[] = [
  {
    id: 1,
    timestamp: "Today, 08:32 AM",
    actor_name: "Super Administrator (Bhargav)",
    actor_role: "admin",
    action_type: "DOCUMENT_UPLOAD",
    target_entity: "Student #1 (Aarav Sharma)",
    ip_address: "192.168.1.10",
    status: "VERIFIED",
    details: "Uploaded verified Bonafide Certificate & Seal for passport verification."
  },
  {
    id: 2,
    timestamp: "Today, 08:15 AM",
    actor_name: "Accounts Officer (Rekha S.)",
    actor_role: "admin",
    action_type: "FEE_REMINDER_DISPATCH",
    target_entity: "Student #2 (Rohan Deshmukh)",
    ip_address: "192.168.1.18",
    status: "VERIFIED",
    details: "Triggered WhatsApp reminder for Milestone 2 dues (₹24,000)."
  },
  {
    id: 3,
    timestamp: "Yesterday, 04:30 PM",
    actor_name: "Principal & Legal Trustee",
    actor_role: "admin",
    action_type: "EXIT_TC_APPROVAL",
    target_entity: "Student #2 (Karan Malhotra)",
    ip_address: "192.168.1.5",
    status: "VERIFIED",
    details: "Dual-sign verified: Physical handover register scan permanently locked in vault."
  },
  {
    id: 4,
    timestamp: "Yesterday, 02:14 PM",
    actor_name: "Academic Registrar",
    actor_role: "admin",
    action_type: "SIS_RECORD_EDIT",
    target_entity: "Student #3 (Meera Nambiar)",
    ip_address: "192.168.1.14",
    status: "VERIFIED",
    details: "Updated emergency contact and blood group to B+ with doctor letter."
  },
  {
    id: 5,
    timestamp: "14 Oct 2026, 11:20 AM",
    actor_name: "System Security Watchdog",
    actor_role: "system",
    action_type: "DOCUMENT_DOWNLOAD_AUDIT",
    target_entity: "Official Transfer Certificate #2026-08",
    ip_address: "49.207.210.12",
    status: "VERIFIED",
    details: "Verified authenticated single-use download token generated for verified parent."
  }
];

let fallbackFeeAnalytics: FeeFinancialAnalytics = {
  total_target: 5450000,
  total_collected: 4310000,
  total_overdue: 71500,
  collection_rate_pct: 79.08,
  aging_summary: {
    days_0_to_15: 37000,
    days_16_to_30: 24000,
    days_over_30: 10500
  },
  defaulters_count: 4,
  reminders_dispatched_today: 1,
  active_milestone_title: "Milestone 2 (Term 2 Tuition & Activities)",
  milestone_deadline: "25 Oct 2026"
};

let fallbackRolloverClasses: AcademicRolloverClass[] = [
  { class_id: 1, from_class: "Class 1-A", to_class: "Class 2-A", total_students: 30, eligible_for_promotion: 30, retention_review: 0, tc_requested: 0, status: "Ready to Roll" },
  { class_id: 2, from_class: "Class 3-A (Junior K-5)", to_class: "Class 4-A (Junior K-5)", total_students: 32, eligible_for_promotion: 31, retention_review: 1, tc_requested: 0, status: "Pending Review" },
  { class_id: 3, from_class: "Class 8-A", to_class: "Class 9-A", total_students: 35, eligible_for_promotion: 33, retention_review: 1, tc_requested: 1, status: "Pending Review" },
  { class_id: 4, from_class: "Class 9-B", to_class: "Class 10-B (Board Year)", total_students: 34, eligible_for_promotion: 34, retention_review: 0, tc_requested: 0, status: "Ready to Roll" }
];

let fallbackTeacherSchedule: TeacherScheduleItem[] = [
  { period: 1, time: "08:30 - 09:15", subject: "Mathematics Foundation", class_name: "Class 8-B", room: "Room 204", status: "Completed" },
  { period: 2, time: "09:20 - 10:05", subject: "Quadratic Equations (Live)", class_name: "Class 8-B", room: "Virtual Studio A", status: "Live Now", is_live: true },
  { period: 3, time: "10:15 - 11:00", subject: "Math Remedial / Focus Table Session", class_name: "Zero Period (8-B)", room: "Math Lab", status: "Upcoming" },
  { period: 4, time: "11:15 - 12:00", subject: "Coordinate Geometry Practice", class_name: "Class 9-A", room: "Room 302", status: "Upcoming" },
  { period: 5, time: "12:45 - 01:30", subject: "Calculus Foundations", class_name: "Class 10-C", room: "Room 401", status: "Upcoming" },
  { period: 6, time: "01:35 - 02:20", subject: "Annual Day Rehearsal (Navarasa Drama)", class_name: "Auditorium", room: "Stage Area", status: "Upcoming" }
];

let fallbackTeacherDuties: TeacherDutyItem[] = [
  {
    id: 1,
    event_title: "Annual Cultural Day 2026 (Navarasa)",
    role: "Stage & Lighting Committee Lead",
    date: "14 Nov 2026",
    venue: "Main School Auditorium",
    student_volunteers: ["Meera Nambiar (7C)", "Rohan Deshmukh (9B)", "Kabir Mehta (8A)"],
    assigned_by: "Dr. Sunita Kapoor (Principal)",
    progress_pct: 75,
    key_deliverables: "Coordinate with Horizon AV Tech for P3.9 LED Backdrop and sound checks by 10 Nov."
  },
  {
    id: 2,
    event_title: "State Mathematics Olympiad Qualifying Round",
    role: "Evaluation Jury & Question Moderator",
    date: "28 Nov 2026",
    venue: "Academic Block A",
    student_volunteers: ["Aarav Sharma (8B)"],
    assigned_by: "Vice Principal Academics",
    progress_pct: 40,
    key_deliverables: "Finalize 25 Rapid Mental Math & Geometry Problem Sets with solutions."
  }
];

let fallbackTeacherStudents: TeacherStudentRosterItem[] = [
  { id: 1, name: "Aarav Sharma", roll_no: "01", class_name: "Class 8-B", attendance_pct: 91.4, academic_average_pct: 74.2, guardian_name: "Mr. Rajesh Sharma", guardian_phone: "+91 98450 12345", has_focus_table: true, homework_status: "Submitted", last_active: "Today, 09:25 AM" },
  { id: 2, name: "Rohan Deshmukh", roll_no: "14", class_name: "Class 8-B", attendance_pct: 95.0, academic_average_pct: 86.5, guardian_name: "Dr. Sunil Deshmukh", guardian_phone: "+91 98450 99881", has_focus_table: false, homework_status: "Submitted", last_active: "Today, 08:30 AM" },
  { id: 3, name: "Meera Nambiar", roll_no: "21", class_name: "Class 8-B", attendance_pct: 88.0, academic_average_pct: 81.0, guardian_name: "Mrs. Anita Nambiar", guardian_phone: "+91 98450 55442", has_focus_table: false, homework_status: "Pending", last_active: "Yesterday, 04:15 PM" },
  { id: 4, name: "Kabir Mehta", roll_no: "15", class_name: "Class 8-B", attendance_pct: 78.5, academic_average_pct: 62.0, guardian_name: "Mr. Suresh Mehta", guardian_phone: "+91 98111 00015", has_focus_table: true, homework_status: "Pending", last_active: "3 days ago (Absent)" },
  { id: 5, name: "Tanvi Sen", roll_no: "28", class_name: "Class 8-B", attendance_pct: 96.5, academic_average_pct: 94.0, guardian_name: "Mrs. Ritu Sen", guardian_phone: "+91 98111 00022", has_focus_table: false, homework_status: "Graded", last_active: "Today, 09:10 AM" }
];

let fallbackMyTeacherPermissions: TeacherPermissionRequest[] = [
  { id: 1, teacher_id: 1, teacher_name: "Mrs. Ananya Verma", type: "Late Arrival", date: "Today, 11:30 AM - 01:00 PM", reason: "Family dental consultation at Apollo Clinic.", status: "Pending", applied_at: "Today, 08:15 AM" },
  { id: 2, teacher_id: 1, teacher_name: "Mrs. Ananya Verma", type: "Casual Leave", date: "02 Oct 2026", reason: "Personal family celebration out of station.", status: "Approved", applied_at: "28 Sep 2026" }
];



// Generic fetch with fallback
async function fetchWithFallback<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

export const api = {
  // Auth Endpoints
  verifySchoolCode: async (code: string) => {
    return fetchWithFallback<any>('/api/auth/verify-school-code', {
      method: 'POST',
      body: JSON.stringify({ code })
    }, {
      valid: true,
      school_name: code.toUpperCase() === 'DPS-BLR-2026' 
        ? 'Delhi Public School (Bangalore South)' 
        : code.toUpperCase() === 'OAK-INTL-88'
        ? 'Oakridge International School'
        : 'EDU360 Demonstration Academy',
      code: code.toUpperCase(),
      campus_city: 'Bengaluru',
      affiliation: 'CBSE Affiliation #883921'
    });
  },
  login: async (email: string, password?: string, schoolCode?: string) => {
    const normEmail = (email || '').toLowerCase().trim();
    let userRole = 'student';
    let userName = 'Aarav Sharma';
    let redirect = '/student';
    let avatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150';
    let userId = 4;
    let phone = '+91 98111 00004';

    if (normEmail.includes('principal') || normEmail.includes('admin')) {
      userRole = 'admin';
      userName = 'Dr. Sunita Kapoor';
      redirect = '/admin';
      avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';
      userId = 1;
      phone = '+91 98111 00001';
    } else if (normEmail.includes('teacher') || normEmail.includes('ananya')) {
      userRole = 'teacher';
      userName = 'Mrs. Ananya Verma';
      redirect = '/teacher';
      avatar = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150';
      userId = 2;
      phone = '+91 98111 00002';
    } else if (normEmail.includes('parent') || normEmail.includes('rajesh')) {
      userRole = 'parent';
      userName = 'Mr. Rajesh Sharma';
      redirect = '/parent';
      avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
      userId = 3;
      phone = '+91 98111 00003';
    } else if (normEmail.includes('junior')) {
      userRole = 'student';
      userName = 'Aarav Kumar';
      redirect = '/student';
      avatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150';
      userId = 6;
      phone = '+91 98111 00006';
    }

    return fetchWithFallback<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, school_code: schoolCode })
    }, {
      success: true,
      message: 'Login successful',
      user: {
        id: userId,
        name: userName,
        email,
        role: userRole as any,
        school_code: schoolCode || 'EDU-GLOBAL-360',
        avatar,
        phone
      },
      portal_redirect: redirect
    });
  },
  register: async (data: { school_code: string; name: string; email: string; password: string; role: string; identifier?: string; phone?: string }) => {
    return fetchWithFallback<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }, {
      success: true,
      message: `Account created for ${data.name} under ${data.school_code}`,
      user: {
        id: 99,
        name: data.name,
        email: data.email,
        role: data.role as any,
        school_code: data.school_code
      },
      portal_redirect: `/${data.role}`
    });
  },

  // Admin Endpoints
  getTriageAlerts: async () => {
    return fetchWithFallback<TriageAlert[]>('/api/admin/triage', undefined, fallbackTriage);
  },
  actOnTriageAlert: async (id: number, notes?: string) => {
    try {
      return await fetchWithFallback(`/api/admin/triage/${id}/act`, {
        method: 'POST',
        body: JSON.stringify({ action_type: 'execute', notes })
      });
    } catch {
      // Update fallback in place
      fallbackTriage = fallbackTriage.map(a => a.id === id ? { ...a, resolved: true, resolution_note: notes || 'Resolved by Administrator' } : a);
      return { success: true, message: 'Action executed successfully in local state' };
    }
  },
  getTasks: async () => {
    return fetchWithFallback<AdminTask[]>('/api/admin/tasks', undefined, fallbackTasks);
  },
  toggleTask: async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      return await fetchWithFallback<AdminTask>(`/api/admin/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
    } catch {
      fallbackTasks = fallbackTasks.map(t => t.id === id ? { ...t, status: newStatus as any } : t);
      return fallbackTasks.find(t => t.id === id);
    }
  },
  getEnquiries: async () => {
    return fetchWithFallback<AdmissionEnquiry[]>('/api/admin/crm/enquiries', undefined, fallbackEnquiries);
  },
  updateEnquiryStage: async (id: number, stage: string) => {
    try {
      return await fetchWithFallback<AdmissionEnquiry>(`/api/admin/crm/enquiries/${id}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage })
      });
    } catch {
      fallbackEnquiries = fallbackEnquiries.map(e => e.id === id ? { ...e, stage: stage as any } : e);
      return fallbackEnquiries.find(e => e.id === id);
    }
  },
  convertEnquiryToStudent: async (id: number) => {
    try {
      return await fetchWithFallback(`/api/admin/crm/enquiries/${id}/convert`, { method: 'POST' });
    } catch {
      fallbackEnquiries = fallbackEnquiries.map(e => e.id === id ? { ...e, stage: 'converted', notes: `${e.notes || ''} | Converted to SIS` } : e);
      return {
        success: true,
        message: 'Student record enrolled into SIS successfully'
      };
    }
  },
  getStudentDocuments: async (studentId: number) => {
    return fetchWithFallback<OfficialDocument[]>(`/api/admin/students/${studentId}/documents`, undefined, fallbackDocuments);
  },
  uploadOfficialDocument: async (doc: { student_id: number; title: string; doc_type: string; file_url: string }) => {
    try {
      return await fetchWithFallback<OfficialDocument>('/api/admin/documents', {
        method: 'POST',
        body: JSON.stringify({ ...doc, is_official: true, uploaded_by_role: 'admin', status: 'Verified', verified_stamp: 'EDU360 Official Seal' })
      });
    } catch {
      const newDoc: OfficialDocument = {
        id: fallbackDocuments.length + 1,
        student_id: doc.student_id,
        title: doc.title,
        doc_type: doc.doc_type,
        file_url: doc.file_url,
        is_official: true,
        uploaded_by_role: 'admin',
        status: 'Verified',
        verified_stamp: 'EDU360 Official Seal',
        upload_date: new Date().toISOString()
      };
      fallbackDocuments = [newDoc, ...fallbackDocuments];
      return newDoc;
    }
  },
  getExitClearances: async () => {
    return fetchWithFallback<ExitClearance[]>('/api/admin/exit-clearances', undefined, fallbackExitClearance);
  },
  verifyPhysicalSign: async (id: number) => {
    try {
      return await fetchWithFallback(`/api/admin/exit-clearances/${id}/verify-physical`, {
        method: 'POST',
        body: JSON.stringify({ physical_scan_url: '/assets/scanned_register_signed.png' })
      });
    } catch {
      fallbackExitClearance = fallbackExitClearance.map(ec => ec.id === id ? {
        ...ec,
        physical_sign_verified: true,
        physical_scan_url: '/assets/scanned_register_signed.png',
        status: ec.digital_parent_approved ? 'Completed & Permanently Archived' : 'Physical Verified - Awaiting Digital'
      } : ec);
      return { success: true, message: 'Physical scan verified in legal register' };
    }
  },
  createTask: async (task: { title: string; category: 'urgent' | 'upcoming'; due_date: string; assigned_to: string; priority: 'High' | 'Medium' | 'Low' }) => {
    try {
      return await fetchWithFallback<AdminTask>('/api/admin/tasks', {
        method: 'POST',
        body: JSON.stringify({ ...task, status: 'Pending' })
      });
    } catch {
      const newTask: AdminTask = {
        id: fallbackTasks.length + 1,
        title: task.title,
        category: task.category,
        due_date: task.due_date,
        assigned_to: task.assigned_to,
        priority: task.priority,
        status: 'Pending'
      };
      fallbackTasks = [newTask, ...fallbackTasks];
      return newTask;
    }
  },
  deleteOfficialDocument: async (docId: number) => {
    try {
      return await fetchWithFallback(`/api/admin/documents/${docId}`, { method: 'DELETE' });
    } catch {
      fallbackDocuments = fallbackDocuments.filter(d => d.id !== docId);
      return { success: true };
    }
  },
  getStaff: async () => {
    return fetchWithFallback<StaffMemberItem[]>('/api/admin/staff', undefined, fallbackStaff);
  },
  getTeacherPermissions: async () => {
    return fetchWithFallback<TeacherPermissionRequest[]>('/api/admin/teacher-permissions', undefined, fallbackTeacherPermissions);
  },
  reviewTeacherPermission: async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      return await fetchWithFallback(`/api/admin/teacher-permissions/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
    } catch {
      fallbackTeacherPermissions = fallbackTeacherPermissions.map(p => p.id === id ? { ...p, status } : p);
      return { success: true };
    }
  },
  getInventory: async () => {
    return fetchWithFallback<InventoryRecord[]>('/api/admin/inventory', undefined, fallbackInventory);
  },
  getFeeDefaulters: async () => {
    return fetchWithFallback<FeeDefaulter[]>('/api/admin/fees/defaulters', undefined, fallbackFeeDefaulters);
  },
  sendFeeReminder: async (defaulterId: number) => {
    try {
      return await fetchWithFallback(`/api/admin/fees/defaulters/${defaulterId}/remind`, { method: 'POST' });
    } catch {
      fallbackFeeDefaulters = fallbackFeeDefaulters.map(d => d.id === defaulterId ? { ...d, reminder_sent: true } : d);
      return { success: true };
    }
  },

  // Substitution & Timetable Cover Engine
  getSubstitutions: async () => {
    return fetchWithFallback<SubstitutionSlot[]>('/api/admin/substitutions', undefined, fallbackSubstitutions);
  },
  getAvailableFaculty: async () => {
    return fetchWithFallback<AvailableFacultyItem[]>('/api/admin/substitutions/available-faculty', undefined, fallbackAvailableFaculty);
  },
  assignSubstitution: async (slotId: number, substituteTeacherId: number, substituteTeacherName: string, notes?: string) => {
    try {
      return await fetchWithFallback('/api/admin/substitutions/assign', {
        method: 'POST',
        body: JSON.stringify({ slot_id: slotId, substitute_teacher_id: substituteTeacherId, substitute_teacher_name: substituteTeacherName, notes })
      });
    } catch {
      fallbackSubstitutions = fallbackSubstitutions.map(s => s.id === slotId ? {
        ...s,
        substitute_teacher_id: substituteTeacherId,
        substitute_teacher_name: substituteTeacherName,
        status: 'Assigned'
      } : s);
      return { success: true, message: `Assigned ${substituteTeacherName} to slot #${slotId}` };
    }
  },
  autoResolveSubstitutions: async () => {
    try {
      return await fetchWithFallback<{ success: boolean; message: string; slots: SubstitutionSlot[] }>('/api/admin/substitutions/auto-resolve', {
        method: 'POST'
      });
    } catch {
      fallbackSubstitutions = fallbackSubstitutions.map((s, idx) => {
        if (s.status === 'Unassigned') {
          const faculty = fallbackAvailableFaculty[idx % fallbackAvailableFaculty.length];
          return {
            ...s,
            substitute_teacher_id: faculty.id,
            substitute_teacher_name: faculty.name,
            status: 'Assigned'
          };
        }
        return s;
      });
      return { success: true, message: 'Auto-resolved all unassigned periods', slots: fallbackSubstitutions };
    }
  },

  // Security & Regulatory Compliance Audit Trail
  getSecurityAuditLogs: async () => {
    return fetchWithFallback<SecurityAuditLog[]>('/api/admin/audit-logs', undefined, fallbackAuditLogs);
  },
  exportSecurityAuditLogs: async () => {
    try {
      return await fetchWithFallback<{ success: boolean; export_url: string; records_count: number }>('/api/admin/audit-logs/export', {
        method: 'POST'
      });
    } catch {
      return { success: true, export_url: '/api/admin/audit-logs/export/cbse-compliance-2026.csv', records_count: fallbackAuditLogs.length };
    }
  },

  // Fee Financial Analytics & Batch Actions
  getFeeFinancialAnalytics: async () => {
    return fetchWithFallback<FeeFinancialAnalytics>('/api/admin/fees/analytics', undefined, fallbackFeeAnalytics);
  },
  remindAllFeeDefaulters: async () => {
    try {
      return await fetchWithFallback<{ success: boolean; message: string }>('/api/admin/fees/remind-all', {
        method: 'POST'
      });
    } catch {
      fallbackFeeDefaulters = fallbackFeeDefaulters.map(d => ({ ...d, reminder_sent: true }));
      return { success: true, message: `Dispatched WhatsApp reminders to ${fallbackFeeDefaulters.length} parents` };
    }
  },

  // Academic Rollover & Annual Promotion Engine
  getRolloverPreview: async () => {
    return fetchWithFallback<AcademicRolloverClass[]>('/api/admin/rollover/preview', undefined, fallbackRolloverClasses);
  },
  executeRollover: async (classId: number, academicYear: string = '2027-2028') => {
    try {
      return await fetchWithFallback<{ success: boolean; message: string }>('/api/admin/rollover/promote', {
        method: 'POST',
        body: JSON.stringify({ class_id: classId, academic_year: academicYear })
      });
    } catch {
      fallbackRolloverClasses = fallbackRolloverClasses.map(c => c.class_id === classId ? { ...c, status: 'Rolled Over' } : c);
      return { success: true, message: 'Class rollover completed successfully' };
    }
  },

  // Teacher Endpoints
  getAttendanceRoster: async (classId: number = 1) => {
    return fetchWithFallback<AttendanceRecord[]>(`/api/teacher/live-classes/${classId}/attendance`, undefined, fallbackAttendance);
  },
  simulateJoin: async (classId: number, studentId: number, minutesElapsed: number) => {
    try {
      return await fetchWithFallback(`/api/teacher/live-classes/${classId}/simulate-join`, {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, minutes_elapsed: minutesElapsed })
      });
    } catch {
      const status = minutesElapsed <= 10.0 ? 'Present' : (minutesElapsed <= 45.0 ? 'Late' : 'Absent');
      fallbackAttendance = fallbackAttendance.map(a => a.student_id === studentId ? {
        ...a,
        minutes_late: minutesElapsed,
        status: status as any,
        join_timestamp: `+${minutesElapsed.toFixed(1)}m`
      } : a);
      return { success: true, rationale: minutesElapsed <= 10.0 ? 'Within 10m auto rule' : 'Exceeded 10m threshold' };
    }
  },
  overrideAttendance: async (classId: number, recordId: number, status: string) => {
    try {
      return await fetchWithFallback(`/api/teacher/live-classes/${classId}/attendance/${recordId}/override`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
    } catch {
      fallbackAttendance = fallbackAttendance.map(a => a.id === recordId ? { ...a, status: status as any, teacher_override: true } : a);
      return fallbackAttendance.find(a => a.id === recordId);
    }
  },
  getSubmission: async (submissionId: number = 1) => {
    return fetchWithFallback<HomeworkSubmission>(`/api/teacher/submissions/${submissionId}`, undefined, fallbackHomeworkSub);
  },
  saveGradedCanvas: async (submissionId: number, marks: number, remarks: string, annotationsJson: string) => {
    try {
      return await fetchWithFallback<HomeworkSubmission>(`/api/teacher/submissions/${submissionId}/grade`, {
        method: 'POST',
        body: JSON.stringify({
          marks_obtained: marks,
          teacher_remarks: remarks,
          annotations_json: annotationsJson,
          annotated_file_url: '/samples/math_worksheet.png'
        })
      });
    } catch {
      fallbackHomeworkSub = {
        ...fallbackHomeworkSub,
        marks_obtained: marks,
        teacher_remarks: remarks,
        annotations_json: annotationsJson,
        status: 'graded',
        graded_at: new Date().toISOString()
      };
      return fallbackHomeworkSub;
    }
  },
  getFocusTable: async (studentId: number = 1) => {
    return fetchWithFallback<FocusTable>(`/api/teacher/focus-table/${studentId}`, undefined, fallbackFocusTable);
  },
  updateFocusTableStatus: async (tableId: number, status: string, teacherAction?: string) => {
    try {
      return await fetchWithFallback<FocusTable>(`/api/teacher/focus-table/${tableId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, teacher_action: teacherAction })
      });
    } catch {
      fallbackFocusTable = {
        ...fallbackFocusTable,
        status: status as any,
        teacher_action: teacherAction || fallbackFocusTable.teacher_action,
        updated_at: new Date().toISOString()
      };
      return fallbackFocusTable;
    }
  },
  getLeaveRequests: async () => {
    return fetchWithFallback<LeaveRequest[]>('/api/teacher/leave-requests', undefined, fallbackLeaveRequests);
  },
  reviewLeaveRequest: async (requestId: number, status: 'Approved' | 'Rejected', notes?: string) => {
    try {
      return await fetchWithFallback<LeaveRequest>(`/api/teacher/leave-requests/${requestId}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, teacher_notes: notes })
      });
    } catch {
      fallbackLeaveRequests = fallbackLeaveRequests.map(lr => lr.id === requestId ? { ...lr, status, teacher_notes: notes } : lr);
      return fallbackLeaveRequests.find(lr => lr.id === requestId);
    }
  },
  getTeacherSchedule: async () => {
    return fetchWithFallback<TeacherScheduleItem[]>('/api/teacher/schedule', undefined, fallbackTeacherSchedule);
  },
  getTeacherDuties: async () => {
    return fetchWithFallback<TeacherDutyItem[]>('/api/teacher/duties', undefined, fallbackTeacherDuties);
  },
  getTeacherStudents: async () => {
    return fetchWithFallback<TeacherStudentRosterItem[]>('/api/teacher/students', undefined, fallbackTeacherStudents);
  },
  getMyTeacherPermissions: async () => {
    return fetchWithFallback<TeacherPermissionRequest[]>('/api/teacher/my-permissions', undefined, fallbackMyTeacherPermissions);
  },
  applyTeacherPermission: async (data: { type: string; reason: string; date: string }) => {
    try {
      return await fetchWithFallback('/api/teacher/apply-permission', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const newPerm: TeacherPermissionRequest = {
        id: fallbackMyTeacherPermissions.length + 1,
        teacher_id: 1,
        teacher_name: "Mrs. Ananya Verma",
        type: data.type as any,
        date: data.date,
        reason: data.reason,
        status: "Pending",
        applied_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      };
      fallbackMyTeacherPermissions = [newPerm, ...fallbackMyTeacherPermissions];
      return { success: true, permission: newPerm };
    }
  },
  getParentChatContext: async (studentId: number = 1) => {
    return fetchWithFallback<any>(`/api/teacher/parent-context/${studentId}`, undefined, {
      student_name: "Aarav Sharma",
      class_name: "Class 8-B",
      attendance_pct: 91.4,
      academic_average_pct: 74.2,
      parent_name: "Mr. Rajesh Sharma",
      parent_phone: "+91 98450 12345",
      parent_email: "rajesh.sharma@gmail.com",
      fee_status: "Up to Date (Milestone 2 Pending)",
      recent_grades: [
        { subject: "Mathematics", score: "52%", alert: "In Focus Table" },
        { subject: "Physics", score: "78%", alert: "Normal" },
        { subject: "English Literature", score: "88%", alert: "Excellent" }
      ]
    });
  },

  // --- Teacher Cockpit & Operations Hub (Master Architecture Spec) ---
  getTeacherPersonalSchedule: async (dayOfWeek?: string) => {
    const url = dayOfWeek ? `/api/teacher/personal-schedule?day_of_week=${encodeURIComponent(dayOfWeek)}` : '/api/teacher/personal-schedule';
    return fetchWithFallback<TeacherPersonalScheduleItem[]>(url, undefined, 
      dayOfWeek ? fallbackTeacherPersonalSchedule.filter(s => s.day_of_week === dayOfWeek) : fallbackTeacherPersonalSchedule
    );
  },
  getFacultyDutyTasks: async (teacherId?: string) => {
    const url = teacherId ? `/api/teacher/duty-tasks?teacher_id=${encodeURIComponent(teacherId)}` : '/api/teacher/duty-tasks';
    return fetchWithFallback<FacultyDutyTask[]>(url, undefined, fallbackFacultyDutyTasks);
  },
  updateDutyPaperCount: async (taskId: string, papersCompleted: number) => {
    try {
      return await fetchWithFallback<any>(`/api/teacher/duty-tasks/${taskId}/update-papers`, {
        method: 'POST',
        body: JSON.stringify({ papers_completed: papersCompleted })
      });
    } catch {
      fallbackFacultyDutyTasks = fallbackFacultyDutyTasks.map(t => {
        if (t.id === taskId) {
          const completed = Math.min(t.papers_assigned || 45, Math.max(0, papersCompleted));
          return {
            ...t,
            papers_completed: completed,
            status: completed === (t.papers_assigned || 45) ? 'COMPLETED' : 'IN_PROGRESS'
          };
        }
        return t;
      });
      return { success: true, task: fallbackFacultyDutyTasks.find(t => t.id === taskId) };
    }
  },
  toggleDutyChecklist: async (taskId: string, itemIdx: number) => {
    try {
      return await fetchWithFallback<any>(`/api/teacher/duty-tasks/${taskId}/toggle-checklist`, {
        method: 'POST',
        body: JSON.stringify({ item_idx: itemIdx })
      });
    } catch {
      fallbackFacultyDutyTasks = fallbackFacultyDutyTasks.map(t => {
        if (t.id === taskId && t.action_checklist && t.action_checklist[itemIdx]) {
          const updated = [...t.action_checklist];
          updated[itemIdx] = { ...updated[itemIdx], completed: !updated[itemIdx].completed };
          const allDone = updated.every(i => i.completed);
          return {
            ...t,
            action_checklist: updated,
            status: allDone ? 'COMPLETED' : t.status
          };
        }
        return t;
      });
      return { success: true, task: fallbackFacultyDutyTasks.find(t => t.id === taskId) };
    }
  },
  getParentTeacherNotes: async (studentId?: number, scope?: string) => {
    let url = '/api/teacher/parent-notes';
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId.toString());
    if (scope && scope !== 'ALL') params.append('scope', scope);
    if (params.toString()) url += `?${params.toString()}`;

    return fetchWithFallback<ParentTeacherNote[]>(url, undefined, 
      fallbackParentTeacherNotes.filter(n => {
        if (studentId && n.student_id !== studentId) return false;
        if (scope && scope !== 'ALL' && n.interaction_scope !== scope) return false;
        return true;
      })
    );
  },
  createParentTeacherNote: async (data: Partial<ParentTeacherNote>) => {
    try {
      return await fetchWithFallback<ParentTeacherNote>('/api/teacher/parent-notes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const newNote: ParentTeacherNote = {
        id: `ptn-${Date.now()}`,
        interaction_scope: data.interaction_scope || 'HOMEROOM_CLASS',
        student_id: data.student_id || 1,
        student_name: data.student_name || 'Aarav Sharma',
        student_class: data.student_class || '8-B',
        parent_id: data.parent_id || 'par-01',
        parent_name: data.parent_name || 'Mr. Rajesh Sharma',
        parent_phone: data.parent_phone || '+91 98111 00003',
        teacher_id: data.teacher_id || 'ananya',
        teacher_name: data.teacher_name || 'Mrs. Ananya Verma',
        homeroom_teacher_id: data.homeroom_teacher_id || 'ananya',
        subject_id: data.subject_id,
        subject_name: data.subject_name,
        note_type: data.note_type || 'ACADEMIC_CONCERN',
        content: data.content || '',
        created_at: 'Just now',
        is_focus_table_evidence: !!data.is_focus_table_evidence,
        focus_concept_tag: data.focus_concept_tag
      };
      fallbackParentTeacherNotes = [newNote, ...fallbackParentTeacherNotes];
      if (newNote.is_focus_table_evidence) {
        fallbackFocusTable = {
          ...fallbackFocusTable,
          teacher_action: `[Note ${newNote.created_at}] ${newNote.focus_concept_tag ? `[${newNote.focus_concept_tag}] ` : ''}${newNote.content}`,
          updated_at: new Date().toISOString()
        };
      }
      return newNote;
    }
  },
  getPTMEventConfig: async () => {
    return fetchWithFallback<PTMEventConfig>('/api/teacher/ptm/event-config', undefined, fallbackPTMEventConfig);
  },
  getPTMSlots: async (scope?: string) => {
    const url = scope && scope !== 'ALL' ? `/api/teacher/ptm/slots?scope=${encodeURIComponent(scope)}` : '/api/teacher/ptm/slots';
    return fetchWithFallback<PTMSlot[]>(url, undefined, 
      scope && scope !== 'ALL' 
        ? fallbackPTMSlots.filter(s => s.interaction_scope === scope || s.status === 'BREAK')
        : fallbackPTMSlots
    );
  },
  holdPTMSlot: async (slotId: string) => {
    try {
      return await fetchWithFallback<any>(`/api/teacher/ptm/slots/${slotId}/hold`, { method: 'POST' });
    } catch {
      fallbackPTMSlots = fallbackPTMSlots.map(s => s.id === slotId ? { ...s, status: 'HELD' } : s);
      return { success: true, slot: fallbackPTMSlots.find(s => s.id === slotId) };
    }
  },
  bookPTMSlot: async (data: any) => {
    try {
      return await fetchWithFallback<PTMSlot>('/api/teacher/ptm/slots/book', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      let targetSlot: PTMSlot | undefined;
      fallbackPTMSlots = fallbackPTMSlots.map(s => {
        if (s.id === data.slot_id) {
          const booked: PTMSlot = {
            ...s,
            status: 'BOOKED',
            booked_student_id: data.booked_student_id,
            booked_student_name: data.booked_student_name,
            booked_class: data.booked_class,
            booked_parent_id: data.booked_parent_id,
            booked_parent_name: data.booked_parent_name,
            interaction_scope: data.interaction_scope,
            subject_name: data.subject_name,
            is_sibling_combo: data.is_sibling_combo,
            sibling_student_id: data.sibling_student_id,
            sibling_student_name: data.sibling_student_name,
            focus_table_agenda: data.focus_table_agenda || [],
            meeting_url: `https://meet.google.com/edu-ptm-${data.slot_id}-${data.booked_student_id}`
          };
          targetSlot = booked;
          return booked;
        }
        return s;
      });
      if (data.focus_table_agenda && data.focus_table_agenda.length > 0) {
        fallbackFocusTable = {
          ...fallbackFocusTable,
          teacher_action: `[PTM Agenda Booked for 24 Oct]: ${data.focus_table_agenda.join(', ')}`,
          updated_at: new Date().toISOString()
        };
      }
      return targetSlot || fallbackPTMSlots[0];
    }
  },

  // --- Parent Endpoints ---
  getParentPTMEventConfig: async () => {
    return fetchWithFallback<PTMEventConfig>('/api/parent/ptm/event-config', undefined, fallbackPTMEventConfig);
  },
  getParentPTMSlots: async (scope?: string) => {
    const url = scope && scope !== 'ALL' ? `/api/parent/ptm/slots?scope=${encodeURIComponent(scope)}` : '/api/parent/ptm/slots';
    return fetchWithFallback<PTMSlot[]>(url, undefined, 
      scope && scope !== 'ALL'
        ? fallbackPTMSlots.filter(s => s.interaction_scope === scope || s.status === 'BREAK')
        : fallbackPTMSlots
    );
  },
  parentHoldPTMSlot: async (slotId: string) => {
    try {
      return await fetchWithFallback<any>(`/api/parent/ptm/slots/${slotId}/hold`, { method: 'POST' });
    } catch {
      fallbackPTMSlots = fallbackPTMSlots.map(s => s.id === slotId ? { ...s, status: 'HELD' } : s);
      return { success: true, slot: fallbackPTMSlots.find(s => s.id === slotId) };
    }
  },
  parentBookPTMSlot: async (data: any) => {
    try {
      return await fetchWithFallback<PTMSlot>('/api/parent/ptm/slots/book', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      let targetSlot: PTMSlot | undefined;
      fallbackPTMSlots = fallbackPTMSlots.map(s => {
        if (s.id === data.slot_id) {
          const booked: PTMSlot = {
            ...s,
            status: 'BOOKED',
            booked_student_id: data.booked_student_id,
            booked_student_name: data.booked_student_name,
            booked_class: data.booked_class,
            booked_parent_id: data.booked_parent_id,
            booked_parent_name: data.booked_parent_name,
            interaction_scope: data.interaction_scope,
            subject_name: data.subject_name,
            is_sibling_combo: data.is_sibling_combo,
            sibling_student_id: data.sibling_student_id,
            sibling_student_name: data.sibling_student_name,
            focus_table_agenda: data.focus_table_agenda || [],
            meeting_url: `https://meet.google.com/edu-ptm-${data.slot_id}-${data.booked_student_id}`
          };
          targetSlot = booked;
          return booked;
        }
        return s;
      });
      if (data.focus_table_agenda && data.focus_table_agenda.length > 0) {
        fallbackFocusTable = {
          ...fallbackFocusTable,
          teacher_action: `[PTM Agenda Booked for 24 Oct]: ${data.focus_table_agenda.join(', ')}`,
          updated_at: new Date().toISOString()
        };
      }
      return targetSlot || fallbackPTMSlots[0];
    }
  },
  getParentNotes: async (studentId: number = 1) => {
    return fetchWithFallback<ParentTeacherNote[]>(`/api/parent/notes/${studentId}`, undefined, 
      fallbackParentTeacherNotes.filter(n => n.student_id === studentId)
    );
  },
  createParentNote: async (data: Partial<ParentTeacherNote>) => {
    try {
      return await fetchWithFallback<ParentTeacherNote>('/api/parent/notes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const newNote: ParentTeacherNote = {
        id: `ptn-p-${Date.now()}`,
        interaction_scope: data.interaction_scope || 'HOMEROOM_CLASS',
        student_id: data.student_id || 1,
        student_name: data.student_name || 'Aarav Sharma',
        student_class: data.student_class || '8-B',
        parent_id: data.parent_id || 'par-01',
        parent_name: data.parent_name || 'Mr. Rajesh Sharma',
        parent_phone: data.parent_phone || '+91 98111 00003',
        teacher_id: data.teacher_id || 'ananya',
        teacher_name: data.teacher_name || 'Mrs. Ananya Verma',
        homeroom_teacher_id: data.homeroom_teacher_id || 'ananya',
        subject_id: data.subject_id,
        subject_name: data.subject_name,
        note_type: data.note_type || 'ACADEMIC_CONCERN',
        content: data.content || '',
        created_at: 'Just now',
        is_focus_table_evidence: !!data.is_focus_table_evidence,
        focus_concept_tag: data.focus_concept_tag
      };
      fallbackParentTeacherNotes = [newNote, ...fallbackParentTeacherNotes];
      if (newNote.is_focus_table_evidence) {
        fallbackFocusTable = {
          ...fallbackFocusTable,
          teacher_action: `[Parent Note ${newNote.created_at}] ${newNote.focus_concept_tag ? `[${newNote.focus_concept_tag}] ` : ''}${newNote.content}`,
          updated_at: new Date().toISOString()
        };
      }
      return newNote;
    }
  },

  getBusTracker: async (studentId: number = 1) => {
    return fetchWithFallback<BusRoute>(`/api/parent/bus-tracker/${studentId}`, undefined, fallbackBus);
  },
  stepBusRoute: async (studentId: number = 1) => {
    try {
      return await fetchWithFallback<BusRoute>(`/api/parent/bus-tracker/${studentId}/step`, { method: 'POST' });
    } catch {
      const nextIdx = (fallbackBus.current_stop_idx + 1) % 5;
      fallbackBus = {
        ...fallbackBus,
        current_stop_idx: nextIdx,
        eta_mins: nextIdx === 4 ? 2 : Math.max(3, 20 - nextIdx * 4),
        live_status: nextIdx === 4 ? "Approaching Destination Stop (Aarav's Stop)" : `Passing Stop #${nextIdx + 1}`
      };
      return fallbackBus;
    }
  },
  getFees: async (studentId: number = 1) => {
    return fetchWithFallback<FeeMilestone[]>(`/api/parent/fees/${studentId}`, undefined, fallbackFees);
  },
  payFee: async (milestoneId: number, paymentMethod: string = 'UPI') => {
    try {
      return await fetchWithFallback<FeeMilestone>(`/api/parent/fees/${milestoneId}/pay`, {
        method: 'POST',
        body: JSON.stringify({ payment_method: paymentMethod })
      });
    } catch {
      fallbackFees = fallbackFees.map(f => f.id === milestoneId ? {
        ...f,
        status: 'Paid',
        receipt_no: `REC-2026-FEE-${milestoneId + 5821}`,
        paid_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        payment_method: paymentMethod
      } : f);
      return fallbackFees.find(f => f.id === milestoneId)!;
    }
  },
  parentDigitalSignTC: async (studentId: number = 1) => {
    try {
      return await fetchWithFallback(`/api/parent/exit-clearance/${studentId}/digital-sign`, {
        method: 'POST',
        body: JSON.stringify({ parent_confirmation: true, confirmation_text: "I confirm receipt of original certificates" })
      });
    } catch {
      fallbackExitClearance = fallbackExitClearance.map(ec => ec.student_id === studentId ? {
        ...ec,
        digital_parent_approved: true,
        digital_approval_timestamp: new Date().toLocaleString() + ' UTC',
        status: ec.physical_sign_verified ? 'Completed & Permanently Archived' : 'Digital Approved - Pending Physical Sign Scan'
      } : ec);
      return { success: true, message: 'Digital Sign-Off Recorded' };
    }
  },
  toggleParentFocusCheck: async (tableId: number = 1) => {
    try {
      return await fetchWithFallback(`/api/parent/focus-table/${tableId}/toggle-check`, { method: 'POST' });
    } catch {
      fallbackFocusTable.parent_check_completed = !fallbackFocusTable.parent_check_completed;
      return { success: true, parent_check_completed: fallbackFocusTable.parent_check_completed };
    }
  },

  // Student Endpoints
  getStudentRecordings: async () => {
    const fallbackRecordings: ClassRecording[] = [
      { id: 1, title: "Quadratic Equations: Factorization by Splitting", subject: "Mathematics", chapter: "Chapter 4: Quadratic Equations", teacher_name: "Mrs. Ananya Verma", duration: "42 mins", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400", date: "11 Oct 2026" },
      { id: 2, title: "Force and Laws of Motion: Newton's 3rd Law", subject: "Physics", chapter: "Chapter 9: Laws of Motion", teacher_name: "Dr. K. Raman", duration: "48 mins", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400", date: "09 Oct 2026" },
      { id: 3, title: "The Merchant of Venice: Act II Scene IV", subject: "English", chapter: "Drama Literature", teacher_name: "Ms. Rachel Adams", duration: "38 mins", video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumbnail: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400", date: "07 Oct 2026" }
    ];
    return fetchWithFallback<ClassRecording[]>('/api/student/recordings', undefined, fallbackRecordings);
  },
  getPortfolio: async (studentId: number = 1) => {
    const fallbackPortfolio: StudentPortfolio[] = [
      { id: 1, student_id: 1, category: "participation", title: "Inter-House Football Championship 2025", event_name: "Phoenix House Captain (Forward)", date: "Aug 2025", verified_by_school: true, description: "Led Phoenix House to the semifinals, scoring 4 goals." },
      { id: 2, student_id: 1, category: "participation", title: "Annual Science & Innovation Expo", event_name: "Smart Irrigation Sensor Prototype", date: "Nov 2025", verified_by_school: true, description: "Demonstrated Arduino-based soil moisture automated watering." },
      { id: 3, student_id: 1, category: "achievement", title: "Karnataka State Mathematics Olympiad", event_name: "Silver Medal (Rank 14 Statewide)", date: "Sep 2025", proof_url: "/samples/math_olympiad_cert.png", verified_by_school: true, description: "Awarded distinction in logical reasoning and algebra." },
      { id: 4, student_id: 1, category: "achievement", title: "District U-14 Rapid Chess Championship", event_name: "1st Runner-Up Trophy", date: "Dec 2025", proof_url: "/samples/chess_trophy_cert.png", verified_by_school: true, description: "Won 5 out of 6 rounds at Bangalore Youth Chess Open." }
    ];
    return fetchWithFallback<StudentPortfolio[]>(`/api/student/portfolio/${studentId}`, undefined, fallbackPortfolio);
  },
  uploadPortfolioItem: async (data: Partial<StudentPortfolio>) => {
    try {
      const res = await fetch(`${API_BASE}/api/student/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend portfolio endpoint fallback', err);
    }
    return {
      id: Date.now(),
      student_id: data.student_id || 1,
      category: data.category || 'achievement',
      title: data.title || '',
      event_name: data.event_name || '',
      date: data.date || 'Oct 2026',
      proof_url: data.proof_url || '/samples/certificate_preview.png',
      verified_by_school: false,
      description: data.description || ''
    } as StudentPortfolio;
  },

  // --- Junior K-5 Gamification Endpoints ---
  getJuniorOverview: async (studentId: number = 6): Promise<JuniorDashboardOverview> => {
    const fallback: JuniorDashboardOverview = {
      student_id: studentId,
      student_name: "Aarav Kumar",
      class_name: "Class 3-A",
      grade_tier: "k5",
      avatar_character_url: "https://api.dicebear.com/7.x/bottts/svg?seed=AaravJunior3D",
      profile: {
        id: 1,
        student_id: studentId,
        level: 3,
        level_title: "Explorer",
        xp_points: 450,
        total_stars: 180,
        attendance_streak_days: 7,
        sound_effects_enabled: true
      },
      active_quests: [
        {
          id: 1,
          student_id: studentId,
          title: "Count & Color 10 Stars in Chapter 2 Workbook",
          subject: "Math",
          xp_reward: 25,
          stars_reward: 50,
          status: "active",
          teacher_reaction: "Super Star! ⭐ - Ms. Priya",
          proof_image_url: null,
          due_date: "Today, 4:00 PM"
        },
        {
          id: 2,
          student_id: studentId,
          title: "Draw and Name 3 Farm Animals",
          subject: "Art & Nature",
          xp_reward: 30,
          stars_reward: 60,
          status: "active",
          teacher_reaction: "Creative Genius! 🎨 - Ms. Neha",
          proof_image_url: null,
          due_date: "Tomorrow, 10:00 AM"
        },
        {
          id: 3,
          student_id: studentId,
          title: "Read Aloud: The Magic Treehouse (Ch 1)",
          subject: "English Phonics",
          xp_reward: 20,
          stars_reward: 40,
          status: "completed",
          teacher_reaction: "Brilliant Pronunciation! 🌟 - Ms. Priya",
          proof_image_url: "/samples/storybook_audio_proof.png",
          due_date: "Yesterday"
        }
      ],
      magic_booster_chests: [
        {
          id: 1,
          student_id: studentId,
          concept_title: "Number Counting & Phonics",
          day_number: 1,
          day_task_title: "Count 1 to 20 with Number Blocks",
          status: "completed_claimed",
          chest_stars: 30,
          parent_signed: true
        },
        {
          id: 2,
          student_id: studentId,
          concept_title: "Number Counting & Phonics",
          day_number: 2,
          day_task_title: "Find & Circle 5 Rhyming Words",
          status: "ready_to_open",
          chest_stars: 30,
          parent_signed: true
        },
        {
          id: 3,
          student_id: studentId,
          concept_title: "Number Counting & Phonics",
          day_number: 3,
          day_task_title: "Solve 3 Animal Addition Riddles",
          status: "locked",
          chest_stars: 40,
          parent_signed: false
        },
        {
          id: 4,
          student_id: studentId,
          concept_title: "Number Counting & Phonics",
          day_number: 4,
          day_task_title: "Draw the Treasure Map & Spell 5 Words",
          status: "locked",
          chest_stars: 50,
          parent_signed: false
        }
      ],
      attendance_streak_days: 7,
      attendance_pct: 94.2,
      bus_route_id: 1
    };
    return fetchWithFallback<JuniorDashboardOverview>(`/api/student/${studentId}/gamification/overview`, undefined, fallback);
  },

  unlockMagicChest: async (studentId: number = 6, chestId: number): Promise<ChestUnlockResponse> => {
    return fetchWithFallback<ChestUnlockResponse>(`/api/student/${studentId}/gamification/chests/${chestId}/unlock`, {
      method: 'POST',
      body: JSON.stringify({})
    }, {
      success: true,
      message: "Chest opened successfully!",
      chest_id: chestId,
      status: "completed_claimed",
      awarded_stars: 30,
      awarded_xp: 50,
      total_stars: 210,
      xp_points: 500,
      level: 4,
      level_title: "Galaxy Champion",
      level_up: true,
      celebration: {
        trigger: "sparkles_and_confetti",
        badge: "Focus Champion 🏆",
        sound_effect: "treasure_fanfare.mp3",
        animation: "golden_glow_burst",
        dialog_title: "Chest Unlocked! 🎉",
        dialog_message: "Outstanding work! +30 Stars and +50 XP added to your treasure bag!"
      }
    });
  },

  toggleJuniorSound: async (studentId: number = 6, enabled: boolean): Promise<GamificationProfile> => {
    return fetchWithFallback<GamificationProfile>(`/api/student/${studentId}/gamification/sound-toggle`, {
      method: 'POST',
      body: JSON.stringify({ sound_effects_enabled: enabled })
    }, {
      id: 1,
      student_id: studentId,
      level: 3,
      level_title: "Explorer",
      xp_points: 450,
      total_stars: 180,
      attendance_streak_days: 7,
      sound_effects_enabled: enabled
    });
  },

  getAdventureTimetable: async (studentId: number = 6): Promise<AdventureTimetableItem[]> => {
    const fallback: AdventureTimetableItem[] = [
      { id: 1, time: "08:30 AM - 09:15 AM", title: "Alphabet Safari & Phonics Fun", subject: "English Phonics", island_theme: "Phonics Island", mascot_at_node: false, icon: "🦁", duration_mins: 45, teacher_name: "Ms. Priya Rao", room: "Safari Treehouse A", completed: true },
      { id: 2, time: "09:30 AM - 10:15 AM", title: "Magical Numbers & Star Shape Castle", subject: "Mathematics", island_theme: "Number Castle", mascot_at_node: true, icon: "🏰", duration_mins: 45, teacher_name: "Mrs. Ananya Verma", room: "Number Tower 2", completed: false },
      { id: 3, time: "10:30 AM - 11:00 AM", title: "Fruit Feast & Jungle Juice Break", subject: "Snack & Nutrition", island_theme: "Snack Oasis", mascot_at_node: false, icon: "🍉", duration_mins: 30, teacher_name: "Coach Ramesh", room: "Oasis Garden Lawn", completed: false },
      { id: 4, time: "11:15 AM - 12:00 PM", title: "Rainbow Finger Painting & Clay Animals", subject: "Creative Arts", island_theme: "Art Treehouse", mascot_at_node: false, icon: "🎨", duration_mins: 45, teacher_name: "Ms. Neha Kapoor", room: "Studio Color Splash", completed: false }
    ];
    return fetchWithFallback<AdventureTimetableItem[]>(`/api/student/${studentId}/adventure-timetable`, undefined, fallback);
  },

  getJuniorBusRadar: async (studentId: number = 6): Promise<JuniorBusRadar> => {
    const fallback: JuniorBusRadar = {
      route_no: "Route #4",
      driver_name: "Uncle Ramesh",
      driver_phone: "+91 98450 12345",
      eta_mins: 3,
      stops_away: 2,
      current_coords: { lat: 12.9352, lng: 77.6944 },
      is_moving: true,
      vehicle_no: "KA-01-EB-4412",
      current_stop_name: "Bellandur EcoSpace Gate 2",
      next_stop_name: "Sector 15 Crossroad (Child's Stop)",
      bus_mascot_icon: "🚌✨",
      status_badge: "On Safe Track"
    };
    return fetchWithFallback<JuniorBusRadar>(`/api/student/${studentId}/bus-radar`, undefined, fallback);
  },

  completeDailyQuest: async (studentId: number = 6, questId: number, proofUrl?: string) => {
    return fetchWithFallback(`/api/student/${studentId}/gamification/quests/${questId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ proof_image_url: proofUrl })
    }, {
      success: true,
      message: "Quest completed!",
      quest_id: questId,
      status: "completed",
      awarded_stars: 50,
      awarded_xp: 25,
      total_stars: 230,
      xp_points: 475,
      level: 3
    });
  },

  // Student Homework & Assignments API
  getStudentHomework: async (taskType?: TaskType, status?: string, date?: string) => {
    let url = '/api/student/homework';
    const params = new URLSearchParams();
    if (taskType) params.append('task_type', taskType);
    if (status) params.append('status', status);
    if (date) params.append('date', date);
    if (params.toString()) url += `?${params.toString()}`;

    let filtered = [...fallbackHomeworkList];
    if (taskType) filtered = filtered.filter(h => h.task_type === taskType);
    if (status && status !== 'all') filtered = filtered.filter(h => h.status.toLowerCase() === status.toLowerCase());
    if (date) filtered = filtered.filter(h => h.due_date === date);

    return fetchWithFallback<Homework[]>(url, undefined, filtered);
  },

  createHomework: async (data: Partial<Homework>) => {
    try {
      return await fetchWithFallback<Homework>('/api/teacher/homework', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const newHw: Homework = {
        id: fallbackHomeworkList.length + 1,
        title: data.title || 'New Homework Task',
        subject: data.subject || 'Mathematics',
        class_name: data.class_name || 'Class 8-B',
        description: data.description || 'Complete assigned exercises.',
        task_type: data.task_type || 'DAILY_HOMEWORK',
        due_date: data.due_date || '2026-10-18',
        due_time: data.due_time || '17:00',
        status: 'PENDING',
        teacher_id: data.teacher_id || 2,
        teacher_name: data.teacher_name || 'Mrs. Ananya Verma',
        max_marks: data.max_marks || 20,
        assigned_date: new Date().toISOString().split('T')[0],
        resource_url: data.resource_url,
        weightage: data.weightage,
        progress_pct: data.progress_pct || 0.0
      };
      fallbackHomeworkList = [newHw, ...fallbackHomeworkList];
      return newHw;
    }
  },

  submitHomework: async (homeworkId: number, studentId: number = 1, fileUrl: string = '/samples/math_worksheet.png') => {
    try {
      return await fetchWithFallback<HomeworkSubmission>(`/api/student/homework/${homeworkId}/submit?student_id=${studentId}&original_file_url=${encodeURIComponent(fileUrl)}`, {
        method: 'POST'
      });
    } catch {
      const hw = fallbackHomeworkList.find(h => h.id === homeworkId);
      const isLate = hw ? new Date() > new Date(`${hw.due_date}T${hw.due_time || '17:00'}`) : false;
      
      const sub: HomeworkSubmission = {
        id: Date.now(),
        homework_id: homeworkId,
        student_id: studentId,
        student_name: 'Aarav Sharma',
        original_file_url: fileUrl,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        late_submission: isLate,
        is_backlog: false
      };

      // If item was backlog, update in fallback lists
      if (hw) {
        hw.status = isLate ? 'SUBMITTED' : 'SUBMITTED';
        hw.late_submission = isLate;
      }

      fallbackBacklogEvents = fallbackBacklogEvents.map(ev => 
        ev.homework_id === homeworkId 
          ? { ...ev, status: 'LATE_SUBMITTED', resolved_at: new Date().toISOString(), late_submission: true } 
          : ev
      );

      return sub;
    }
  },

  getAcademicCompliance: async (studentId: number = 1) => {
    const comp = await fetchWithFallback<AcademicCompliance>(`/api/student/compliance/${studentId}`, undefined, fallbackAcademicCompliance);
    if (!comp.itemized_backlogs || comp.itemized_backlogs.length === 0) {
      return {
        ...comp,
        itemized_backlogs: fallbackAcademicCompliance.itemized_backlogs || fallbackBacklogEvents
      };
    }
    return comp;
  },

  getTodayHomework: async (studentId: number = 1) => {
    const todayStr = '2026-10-18';
    try {
      const res = await fetchWithFallback<Homework[]>(`/api/parent/today-homework/${studentId}`, undefined, []);
      if (res && res.length > 0) return res;
    } catch {
      // Fallback below
    }
    return fallbackHomeworkList.filter(h => h.due_date === todayStr || h.id === 3);
  },

  triggerBacklogCheck: async () => {
    try {
      return await fetchWithFallback('/api/student/check-backlogs', { method: 'POST' });
    } catch {
      return { status: 'success', total_backlogs: fallbackBacklogEvents.length, evaluated_at: new Date().toISOString() };
    }
  },

  getStudentBacklogs: async (studentId: number = 1) => {
    return fetchWithFallback<BacklogEvent[]>(`/api/student/backlog-events/${studentId}`, undefined, fallbackBacklogEvents);
  }
};
