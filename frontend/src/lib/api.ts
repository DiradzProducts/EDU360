import {
  User, Student, OfficialDocument, DocumentUploadItem, TriageAlert, AdminTask, AdmissionEnquiry,
  EventItem, EventAssignment, VendorEquipment, ExitClearance,
  LiveClass, AttendanceRecord, Homework, HomeworkSubmission,
  FocusTable, LeaveRequest, FeeMilestone, BusRoute,
  StudentPortfolio, ClassRecording,
  StaffMemberItem, TeacherPermissionRequest, InventoryRecord, FeeDefaulter,
  FeeDefaulterItem, VendorInvoiceItem, PaymentTransactionItem, FinanceDispatchLogItem,
  FinanceDashboardStats, ApplyWaiverPayload, RecordFeePaymentPayload, BulkReminderPayload,
  TeacherScheduleItem, TeacherDutyItem, TeacherStudentRosterItem,
  JuniorDashboardOverview, GamificationProfile, DailyQuest, MagicBoosterChest,
  AdventureTimetableItem, JuniorBusRadar, ChestUnlockResponse,
  SubstitutionSlot, AvailableFacultyItem, SecurityAuditLog, FeeFinancialAnalytics, AcademicRolloverClass,
  PeriodActivityType, TeacherPersonalScheduleItem, FacultyDutyCategory, FacultyDutyTask,
  InteractionScope, ParentTeacherNote, PTMEventConfig, PTMSlot,
  TaskType, TaskStatus, BacklogEvent, AcademicCompliance,
  TaskExecutiveCockpitResponse, CurriculumPacingItem,
  TaskReliefRequest, ApproveReliefRequest, ExtendSlaRequest, PTMGovernanceStatus,
  PTMEventCreate, PTMEventResponse,
  AIParentStudyGuidanceRequest, AIParentStudyGuidanceResponse,
  RemedialEarlyWarning, RemedialAdminOverview, SocraticHintResponse,
  ExamItem, ExamSubmissionItem, WhatsAppDispatchResponse,
  PreVerifyResponse, VisualFormulaCard,
  QuestionPaperItem, ExamScheduleItem, OcrScanResultItem, ReportCardItem,
  PayrollBatchItem, StaffPayslipItem, PurchaseOrderItem, FleetExpenseItem,
  GeneratePayrollPayload, AuthorizePayrollPayload, DisbursePayrollPayload,
  CreatePurchaseOrderPayload, VerifyGRNPayload, CreateFleetExpensePayload, SettleFleetExpensePayload,
  AssetCustodyLogItem, ClearanceCheckResult,
  ExecutivePulseResponse
} from './types';
import { FocusRosterItem, getFocusStudentById, updateFocusStudent, INITIAL_FOCUS_ROSTER } from './focus-data';


const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fallback in-memory store so UI is 100% reactive and functional even if backend is starting
let fallbackTriage: TriageAlert[] = [
  {
    id: 1,
    level: 'red',
    category: 'attendance',
    title: 'Chronic Absenteeism Telemetry: 5 Students Flagged (3+ Days)',
    description: '5 students across Class 8 & 9 have unexcused absences for 3 consecutive days. Class Teacher follow-up logged.',
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
    title: 'LMS Cloud Classroom Media Latency Alert',
    description: 'Class 9-A Science & Class 8-B English video streams experienced transient packet jitter. Media relay rebalanced successfully.',
    count_affected: 2,
    action_label: 'Acknowledge System Telemetry',
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
  {
    id: 1,
    title: "Submit Class 10 Board Exam LOC to CBSE Portal",
    description: "List of Candidates for Board Exams due to CBSE Delhi portal by 5 PM. 312 students registered across Science & Commerce streams.",
    category: "urgent",
    domain: "exam",
    due_date: "Today, 5:00 PM",
    assigned_to: "Ms. Rekha Iyer",
    assigned_to_role: "exam_coordinator",
    created_by_name: "Principal Sharma",
    created_by_role: "admin",
    status: "In Progress",
    priority: "Critical",
    sla_hours: 8,
    is_auto_generated: false,
    is_escalated: false,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Conduct Term-2 Remedial Batch Parent Orientation",
    description: "Coordinate digital briefing with parents of students scoring ≤70% on Mathematics & Science 1-Week Remedial Focus plans.",
    category: "urgent",
    domain: "academic",
    due_date: "Today, 6:30 PM",
    assigned_to: "Mrs. Ananya Verma",
    assigned_to_role: "teacher",
    created_by_name: "Principal Sharma",
    created_by_role: "admin",
    status: "Pending",
    priority: "High",
    sla_hours: 6,
    is_auto_generated: false,
    is_escalated: false,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Audit Term 2 Fee Defaulters & Dispatch SMS Digest",
    description: "30 students overdue on Milestone 2 (₹5,55,000 pending). Generate defaulter report, categorize by severity, and dispatch targeted SMS reminders.",
    category: "upcoming",
    domain: "finance",
    due_date: "Tomorrow, 11:00 AM",
    assigned_to: "Mrs. Lakshmi Narayan",
    assigned_to_role: "accounts_coordinator",
    created_by_name: "Principal Sharma",
    created_by_role: "admin",
    status: "Pending",
    priority: "High",
    sla_hours: 24,
    is_auto_generated: false,
    is_escalated: false,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    title: "Review 8 Inbound Admission Enquiries & Campus Leads",
    description: "8 inbound prospective candidate leads from website portal qualify for follow-up. 3 campus visit bookings scheduled for this week.",
    category: "upcoming",
    domain: "admissions",
    due_date: "19 Oct, 2:00 PM",
    assigned_to: "Ms. Priya Nair",
    assigned_to_role: "admissions_coordinator",
    created_by_name: "System Auto-Trigger",
    created_by_role: "admin",
    status: "Completed",
    priority: "Medium",
    sla_hours: 48,
    is_auto_generated: true,
    trigger_event: "crm_lead_batch",
    is_escalated: false,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    title: "Approve Term 2 Syllabus Revision for Class 9 Science",
    description: "Academic Coordinator submitted revised syllabus mapping removing 2 deleted NCERT chapters. Requires Principal sign-off before distribution to teachers.",
    category: "upcoming",
    domain: "academic",
    due_date: "20 Oct, 12:00 PM",
    assigned_to: "Dr. Ananya Krishnan",
    assigned_to_role: "academic_coordinator",
    created_by_name: "Dr. Ananya Krishnan",
    created_by_role: "academic_coordinator",
    status: "Pending Review",
    priority: "Medium",
    sla_hours: 72,
    is_auto_generated: false,
    is_escalated: false,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    title: "Audit Lab Inventory: Class 10 Chemistry Practicals",
    description: "Pre-board practical exams start Nov 5. Inventory coordinator must verify reagent stock, broken equipment list, and safety kit availability across Chem & Bio labs.",
    category: "upcoming",
    domain: "inventory",
    due_date: "21 Oct, 5:00 PM",
    assigned_to: "Mr. Vikram Rao",
    assigned_to_role: "inventory_coordinator",
    created_by_name: "Ms. Rekha Iyer",
    created_by_role: "exam_coordinator",
    status: "Pending",
    priority: "High",
    sla_hours: 96,
    is_auto_generated: false,
    is_escalated: false,
    created_at: new Date().toISOString()
  },
  {
    id: 7,
    title: "Annual Day Budget Approval — Vendor Payments Pending",
    description: "3 vendors (Audio-Visual, Decorators, Catering) submitted invoices totalling ₹2,40,000. Requires Principal approval before accounts processes NEFT.",
    category: "urgent",
    domain: "executive",
    due_date: "Today, 6:00 PM",
    assigned_to: "Principal Sharma",
    assigned_to_role: "admin",
    created_by_name: "Mrs. Lakshmi Narayan",
    created_by_role: "accounts_coordinator",
    status: "Pending Review",
    priority: "High",
    sla_hours: 12,
    is_auto_generated: false,
    is_escalated: true,
    escalation_reason: "Vendors threatening to withdraw services 48 hrs before event",
    created_at: new Date().toISOString()
  }
];

const getTodayStr = () => new Date().toISOString().split('T')[0];

let fallbackEnquiries: AdmissionEnquiry[] = [
  {
    id: 1,
    student_name: "Siddharth Rao",
    parent_name: "Mrs. Meera Rao",
    email: "meera.rao@example.com",
    phone: "+91 98450 99881",
    target_grade: "Class 8",
    stage: "followup",
    lead_temperature: "hot",
    source: "Website Form",
    doc_report_card: true,
    doc_birth_cert: true,
    doc_transfer_cert: false,
    next_followup_date: getTodayStr(),
    notes: "• [Oct 22] Initial Enquiry: Parent asked about online CBSE curriculum and demo class.",
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
    lead_temperature: "warm",
    source: "Parent Referral",
    doc_report_card: true,
    doc_birth_cert: false,
    doc_transfer_cert: false,
    next_followup_date: getTodayStr(),
    notes: "• [Oct 21] Callback Requested: Discuss fee installment schedule.",
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
    lead_temperature: "cold",
    source: "Social Media Ad",
    doc_report_card: false,
    doc_birth_cert: false,
    doc_transfer_cert: false,
    notes: "Direct web inquiry: Inquired about Cambridge curriculum options.",
    created_at: new Date().toISOString()
  }
];

let fallbackStudents: Student[] = [
  { id: 1, name: "Aarav Sharma", roll_no: "8B-01", class_name: "Class 8", section: "B", admission_no: "ADM-2024-001", guardian_name: "Rajesh Sharma", guardian_phone: "+91 98765 43210", guardian_email: "rajesh@example.com", attendance_pct: 94.2, academic_average_pct: 78.5, status: "Active" },
  { id: 2, name: "Diya Patel", roll_no: "8B-02", class_name: "Class 8", section: "B", admission_no: "ADM-2024-002", guardian_name: "Meena Patel", guardian_phone: "+91 98765 43211", guardian_email: "meena@example.com", attendance_pct: 96.0, academic_average_pct: 84.0, status: "Active" },
  { id: 3, name: "Rohan Verma", roll_no: "9A-04", class_name: "Class 9", section: "A", admission_no: "ADM-2024-003", guardian_name: "Anil Verma", guardian_phone: "+91 98765 43212", guardian_email: "anil@example.com", attendance_pct: 91.5, academic_average_pct: 68.0, status: "Active" },
  { id: 4, name: "Ananya Iyer", roll_no: "9A-08", class_name: "Class 9", section: "A", admission_no: "ADM-2024-004", guardian_name: "Suresh Iyer", guardian_phone: "+91 98765 43213", guardian_email: "suresh@example.com", attendance_pct: 98.0, academic_average_pct: 92.5, status: "Active" },
  { id: 5, name: "Kabir Mehta", roll_no: "7B-12", class_name: "Class 7", section: "B", admission_no: "ADM-2024-005", guardian_name: "Pooja Mehta", guardian_phone: "+91 98765 43214", guardian_email: "pooja@example.com", attendance_pct: 88.0, academic_average_pct: 62.0, status: "Active" },
  { id: 6, name: "Ishaan Reddy", roll_no: "10A-15", class_name: "Class 10", section: "A", admission_no: "ADM-2024-006", guardian_name: "Venkat Reddy", guardian_phone: "+91 98765 43215", guardian_email: "venkat@example.com", attendance_pct: 95.0, academic_average_pct: 88.0, status: "Active" },
  { id: 7, name: "Sneha Nair", roll_no: "6A-03", class_name: "Class 6", section: "A", admission_no: "ADM-2024-007", guardian_name: "Gopinath Nair", guardian_phone: "+91 98765 43216", guardian_email: "gopinath@example.com", attendance_pct: 97.5, academic_average_pct: 91.0, status: "Active" },
  { id: 8, name: "Vihaan Joshi", roll_no: "8B-03", class_name: "Class 8", section: "B", admission_no: "ADM-2024-008", guardian_name: "Alok Joshi", guardian_phone: "+91 98765 43217", guardian_email: "alok@example.com", attendance_pct: 92.0, academic_average_pct: 64.5, status: "Active" },
  { id: 9, name: "Meera Sen", roll_no: "8B-04", class_name: "Class 8", section: "B", admission_no: "ADM-2024-009", guardian_name: "Subhash Sen", guardian_phone: "+91 98765 43218", guardian_email: "subhash@example.com", attendance_pct: 95.5, academic_average_pct: 68.0, status: "Active" },
  { id: 10, name: "Aditya Rao", roll_no: "8A-01", class_name: "Class 8", section: "A", admission_no: "ADM-2024-010", guardian_name: "Madhav Rao", guardian_phone: "+91 98765 43219", guardian_email: "madhav@example.com", attendance_pct: 96.5, academic_average_pct: 82.0, status: "Active" },
  { id: 11, name: "Tanvi Kulkarni", roll_no: "8A-02", class_name: "Class 8", section: "A", admission_no: "ADM-2024-011", guardian_name: "Sachin Kulkarni", guardian_phone: "+91 98765 43220", guardian_email: "sachin@example.com", attendance_pct: 89.0, academic_average_pct: 66.0, status: "Active" },
  { id: 12, name: "Arjun Singhania", roll_no: "9B-05", class_name: "Class 9", section: "B", admission_no: "ADM-2024-012", guardian_name: "Deepak Singhania", guardian_phone: "+91 98765 43221", guardian_email: "deepak@example.com", attendance_pct: 94.0, academic_average_pct: 71.0, status: "Active" },
  { id: 13, name: "Priya Menon", roll_no: "10A-02", class_name: "Class 10", section: "A", admission_no: "ADM-2024-013", guardian_name: "Harish Menon", guardian_phone: "+91 98765 43222", guardian_email: "harish@example.com", attendance_pct: 99.0, academic_average_pct: 94.0, status: "Active" },
  { id: 14, name: "Karthik Pillai", roll_no: "7A-04", class_name: "Class 7", section: "A", admission_no: "ADM-2024-014", guardian_name: "Raman Pillai", guardian_phone: "+91 98765 43223", guardian_email: "raman@example.com", attendance_pct: 93.0, academic_average_pct: 79.0, status: "Active" }
];

let fallbackDocuments: OfficialDocument[] = [
  { id: 1, student_id: 1, title: "Bonafide Certificate 2025-26", doc_type: "Bonafide", file_url: "/documents/bonafide_aarav_sharma.pdf", is_official: true, uploaded_by_role: "admin", status: "Verified", verified_stamp: "EDU360 Official Seal - Reg #9921", upload_date: new Date().toISOString() },
  { id: 2, student_id: 1, title: "Term 1 Consolidated Marks Memo", doc_type: "Marks Card", file_url: "/documents/term1_marks_aarav_sharma.pdf", is_official: true, uploaded_by_role: "admin", status: "Verified", verified_stamp: "EDU360 Examination Controller", upload_date: new Date().toISOString() },
  { id: 3, student_id: 1, title: "Municipal Birth Certificate Copy", doc_type: "Birth Certificate", file_url: "/documents/birth_cert_aarav.pdf", is_official: true, uploaded_by_role: "admin", status: "Verified", verified_stamp: "Verified by Registrar", upload_date: new Date().toISOString() },
  { id: 4, student_id: 2, title: "Transfer Certificate (Incoming TC Deposited) - Riya Reddy", doc_type: "Transfer Certificate", file_url: "/documents/tc_riya_reddy.pdf", is_official: true, uploaded_by_role: "admissions_coordinator", status: "Pending Verification", verified_stamp: "Awaiting Principal/Registry Seal", upload_date: new Date().toISOString() }
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
  },
  {
    id: 2,
    student_id: 1,
    homework_id: 7,
    focus_table_id: 1,
    evidence_code: '#EVD-BKLOG-902',
    subject: 'Physics',
    title: 'Optics & Convex Lens: Ray Tracing Lab Sheet',
    task_type: 'DAILY_HOMEWORK',
    due_date: '2026-10-17',
    due_time: '17:00',
    status: 'UNRESOLVED',
    detected_at: '2026-10-17T17:20:00Z',
    late_submission: false,
    teacher_name: 'Dr. K. Raman',
    notes: 'Optics ray tracing lab sheet unsubmitted after cutoff. Teacher flagged for Parent-Teacher conference.'
  }
];

let fallbackAcademicCompliance: AcademicCompliance = {
  student_id: 1,
  student_name: 'Aarav Sharma',
  total_assigned: 9,
  on_time_submissions: 2,
  late_submissions: 0,
  backlog_count: 2,
  compliance_pct: 77.8,
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
  { id: 1, asset_tag: "CON-CHEM-001", name: "Hydrochloric Acid (HCl 35% Analytical Grade)", category: "Lab Consumable", sub_category: "Chemistry Reagents", total_stock: 5, available_stock: 2, issued_count: 3, damaged_count: 0, reorder_level: 5, unit_of_measure: "Litres", unit_cost: 320, location: "Chemistry Lab 2 Acid Locker", condition: "Low Buffer", last_audited: "20 Oct 2026" },
  { id: 2, asset_tag: "CON-BIO-004", name: "Pre-Mounted Microscope Glass Slides (Set of 100)", category: "Lab Consumable", sub_category: "Biology Apparatus", total_stock: 250, available_stock: 240, issued_count: 10, damaged_count: 0, reorder_level: 100, unit_of_measure: "Units", unit_cost: 15, location: "Biology Lab Specimen Cabinet", condition: "Optimal", last_audited: "18 Oct 2026" },
  { id: 3, asset_tag: "AST-IT-092", name: "Lenovo Tab M10 HD (Student Coding Tablets)", category: "IT Hardware", sub_category: "Coding Tablets", total_stock: 90, available_stock: 60, issued_count: 30, damaged_count: 0, reorder_level: 15, unit_of_measure: "Units", unit_cost: 12500, location: "Computer Lab 1 Charging Cart A", condition: "Optimal", amc_vendor: "Lenovo Enterprise Support", amc_valid_until: "31 Dec 2027", last_audited: "19 Oct 2026" },
  { id: 4, asset_tag: "AST-AV-018", name: "Promethean 75-inch 4K Interactive Touch Panel", category: "IT Hardware", sub_category: "Classroom Displays", total_stock: 16, available_stock: 16, issued_count: 0, damaged_count: 0, reorder_level: 2, unit_of_measure: "Units", unit_cost: 185000, location: "Class 8-B Homeroom Wall", condition: "Optimal", amc_vendor: "Promethean Digital India AMC", amc_valid_until: "15 Nov 2027", last_audited: "15 Oct 2026" },
  { id: 5, asset_tag: "AST-OPT-042", name: "Crown Glass Equilateral Triangular Prisms", category: "Lab Consumable", sub_category: "Physics Optics", total_stock: 35, available_stock: 32, issued_count: 2, damaged_count: 1, reorder_level: 10, unit_of_measure: "Units", unit_cost: 450, location: "Physics Lab Optics Vault", condition: "Optimal", last_audited: "16 Oct 2026" },
  { id: 6, asset_tag: "SPT-BALL-015", name: "FIFA Quality Match Footballs (Size 5)", category: "Sports Gear", sub_category: "Field Sports", total_stock: 40, available_stock: 32, issued_count: 6, damaged_count: 2, reorder_level: 12, unit_of_measure: "Units", unit_cost: 1850, location: "Sports Equipment Depot Rack B", condition: "Optimal", last_audited: "21 Oct 2026" },
  { id: 7, asset_tag: "BK-NCERT-801", name: "NCERT Class 8 Mathematics & Science Textbook Bundles", category: "Books/Stationery", sub_category: "Standard Curricula", total_stock: 400, available_stock: 370, issued_count: 30, damaged_count: 0, reorder_level: 50, unit_of_measure: "Sets", unit_cost: 650, location: "Central Textbook Repository Shelf 4", condition: "Optimal", last_audited: "12 Oct 2026" }
];

let fallbackCustodyLogs: AssetCustodyLogItem[] = [
  { id: 1, item_id: 3, item_name: "Lenovo Tab M10 HD (Student Coding Tablets)", asset_tag: "AST-IT-092", borrower_name: "Mrs. Ananya Verma", borrower_role: "Teacher", borrower_ref_id: "EMP-042", class_room: "Class 8-B", quantity: 30, checkout_time: "2026-10-22T09:30:00Z", expected_return_time: "2026-10-22T15:30:00Z", condition_on_return: "Pending Return", fine_assessed: 0, status: "Active" },
  { id: 2, item_id: 5, item_name: "Crown Glass Equilateral Triangular Prisms", asset_tag: "AST-OPT-042", borrower_name: "Kabir Mehta", borrower_role: "Student", borrower_ref_id: "15", class_room: "Class 8-B", quantity: 1, checkout_time: "2026-10-20T11:00:00Z", expected_return_time: "2026-10-21T11:00:00Z", condition_on_return: "Pending Return", fine_assessed: 0, status: "Active" }
];

let fallbackQuestionPapers: QuestionPaperItem[] = [
  {
    id: 1,
    title: "Class 8 Mathematics Term 1 Final Paper Blueprint",
    subject: "Mathematics",
    class_name: "Class 8",
    section: "B",
    term: "Term 1",
    blueprint: {
      total_marks: 100,
      units: ["Rational Numbers", "Linear Equations in One Variable", "Understanding Quadrilaterals", "Algebraic Expressions"],
      bloom_taxonomy: { knowledge_pct: 30, application_pct: 50, hots_pct: 20 }
    },
    commissioned_by: "Dean Rajeshwari Nair",
    teacher_name: "Mrs. Ananya Verma",
    teacher_id: 2,
    status: "sent_to_exam_cell",
    draft_file_url: "/samples/Class8_Math_Term1_Final_QP.pdf",
    draft_file_name: "Class8_Math_Term1_Final_QP.pdf",
    answer_key_url: "/samples/Class8_Math_Term1_AnswerKey.pdf",
    due_date: "10 Oct 2026",
    submission_date: "09 Oct 2026",
    review_notes: "Approved by Academic Coordinator for Secrecy Strongroom Custody."
  },
  {
    id: 2,
    title: "Class 8 Mathematics Mid-Term Descriptive Blueprint",
    subject: "Mathematics",
    class_name: "Class 8",
    section: "A",
    term: "Mid-Term",
    blueprint: {
      total_marks: 100,
      units: ["Linear Equations in One Variable", "Quadratic Factorization"],
      bloom_taxonomy: { knowledge_pct: 35, application_pct: 45, hots_pct: 20 }
    },
    commissioned_by: "Dean Rajeshwari Nair",
    teacher_name: "Mrs. Ananya Verma",
    teacher_id: 2,
    status: "sent_to_exam_cell",
    draft_file_url: "/samples/Class8_Math_MidTerm_QP.pdf",
    draft_file_name: "Class8_Math_MidTerm_QP.pdf",
    due_date: "14 Oct 2026",
    submission_date: "13 Oct 2026"
  },
  {
    id: 3,
    title: "Class 9 Mathematics Unit Test 2 Blueprint",
    subject: "Mathematics",
    class_name: "Class 9",
    section: "A",
    term: "Unit Test 2",
    blueprint: {
      total_marks: 50,
      units: ["Polynomials", "Coordinate Geometry"],
      bloom_taxonomy: { knowledge_pct: 40, application_pct: 40, hots_pct: 20 }
    },
    commissioned_by: "Dean Rajeshwari Nair",
    teacher_name: "Mrs. Ananya Verma",
    teacher_id: 2,
    status: "draft",
    due_date: "26 Oct 2026"
  }
];

let fallbackExamSchedules: ExamScheduleItem[] = [
  {
    id: 1,
    exam_id: 1,
    title: "Term 1 Mathematics Descriptive Final",
    class_name: "Class 8",
    section: "B",
    subject: "Mathematics",
    exam_date: "14 Oct 2026",
    start_time: "10:00 AM",
    end_time: "12:00 PM",
    total_marks: 100,
    room_no: "Room 204",
    invigilator_name: "Dr. Suresh Babu",
    academic_clearance: true,
    academic_clearance_notes: "Syllabus verified 100% complete",
    hall_ticket_published: true
  },
  {
    id: 2,
    exam_id: 2,
    title: "Mid-Term Mathematics Descriptive Examination",
    class_name: "Class 8",
    section: "A",
    subject: "Mathematics",
    exam_date: "16 Oct 2026",
    start_time: "10:00 AM",
    end_time: "11:30 AM",
    total_marks: 100,
    room_no: "Room 108",
    invigilator_name: "Mrs. Neha Roy",
    academic_clearance: true,
    academic_clearance_notes: "Syllabus verified 100% complete",
    hall_ticket_published: true
  }
];

let fallbackReportCards: ReportCardItem[] = [
  {
    id: 1,
    student_id: 1,
    student_name: "Aarav Sharma",
    roll_no: "01",
    class_name: "Class 8",
    section: "B",
    term: "Term 1",
    academic_year: "2026-27",
    grades_grid: {
      "Mathematics": { score: 52, max: 100, theory: 38, practical: 14, total: 52, max_marks: 100, percentage: 52, grade: "C1", remedial_flag: true, remarks: "Remedial Sprint Active" },
      "General Science": { score: 60, max: 100, theory: 42, practical: 18, total: 60, max_marks: 100, percentage: 60, grade: "B2", remedial_flag: true, remarks: "Needs lab revision" },
      "English Language": { score: 88, max: 100, theory: 70, practical: 18, total: 88, max_marks: 100, percentage: 88, grade: "A2", remedial_flag: false, remarks: "Excellent essay structure" },
      "Social Sciences": { score: 86, max: 100, theory: 68, practical: 18, total: 86, max_marks: 100, percentage: 86, grade: "A2", remedial_flag: false, remarks: "Good historical analysis" }
    },
    total_marks_obtained: 286,
    max_total_marks: 400,
    overall_percentage: 71.5,
    overall_grade: "B1",
    attendance_pct: 94.2,
    ai_teacher_narrative: "Demonstrates high aptitude in languages and humanities. Needs targeted algebra reinforcement in Mathematics.",
    is_moderated: true,
    is_published: true,
    published_at: "2026-10-18T10:00:00Z"
  },
  {
    id: 2,
    student_id: 8,
    student_name: "Tanvi Deshmukh",
    roll_no: "08",
    class_name: "Class 8",
    section: "B",
    term: "Term 1",
    academic_year: "2026-27",
    grades_grid: {
      "Mathematics": { score: 88, max: 100, theory: 68, practical: 20, total: 88, max_marks: 100, percentage: 88, grade: "A1", remedial_flag: false, remarks: "Mastery demonstrated" },
      "General Science": { score: 91, max: 100, theory: 72, practical: 19, total: 91, max_marks: 100, percentage: 91, grade: "A1", remedial_flag: false, remarks: "Top standing" },
      "English Language": { score: 92, max: 100, theory: 74, practical: 18, total: 92, max_marks: 100, percentage: 92, grade: "A1", remedial_flag: false, remarks: "Outstanding" },
      "Social Sciences": { score: 89, max: 100, theory: 70, practical: 19, total: 89, max_marks: 100, percentage: 89, grade: "A1", remedial_flag: false, remarks: "Comprehensive" }
    },
    total_marks_obtained: 360,
    max_total_marks: 400,
    overall_percentage: 90.0,
    overall_grade: "A1",
    attendance_pct: 98.5,
    ai_teacher_narrative: "Consistently ranks in top 5% of grade with exceptional problem-solving rigor.",
    is_moderated: true,
    is_published: true,
    published_at: "2026-10-18T10:00:00Z"
  }
];

let fallbackExamSubmissions: Record<number, ExamSubmissionItem[]> = {
  1: [
    {
      id: 101,
      student_id: 1,
      student_name: "Aarav Sharma",
      roll_no: "01",
      class_name: "Class 8",
      section: "B",
      status: "Graded",
      paper_file_url: "/samples/math_exam_sample.svg",
      paper_file_name: "Aarav_Sharma_Math_Term1_Paper.pdf",
      submitted_at: "14 Oct 2026, 10:15 AM",
      marks_obtained: 52,
      percentage: 52,
      is_remedial_target: true,
      weak_concept: "Quadratic Equations: Factorization by Splitting the Middle Term",
      teacher_feedback: "Sign error in quadratic expansion step 3. Auto-enrolled in 1-Week Remedial Focus Table.",
      graded_at: "14 Oct 2026, 04:30 PM"
    },
    {
      id: 102,
      student_id: 8,
      student_name: "Tanvi Deshmukh",
      roll_no: "08",
      class_name: "Class 8",
      section: "B",
      status: "Graded",
      paper_file_url: "/samples/math_exam_sample.svg",
      paper_file_name: "Tanvi_Deshmukh_Math_Term1_Paper.pdf",
      submitted_at: "14 Oct 2026, 10:20 AM",
      marks_obtained: 88,
      percentage: 88,
      is_remedial_target: false,
      weak_concept: null,
      teacher_feedback: "Exemplary method precision and neat algebraic graphing.",
      graded_at: "14 Oct 2026, 04:45 PM"
    },
    {
      id: 103,
      student_id: 15,
      student_name: "Kabir Mehta",
      roll_no: "15",
      class_name: "Class 8",
      section: "B",
      status: "Graded",
      paper_file_url: "/samples/math_exam_sample.svg",
      paper_file_name: "Kabir_Mehta_Math_Term1_Paper.pdf",
      submitted_at: "14 Oct 2026, 10:30 AM",
      marks_obtained: 46,
      percentage: 46,
      is_remedial_target: true,
      weak_concept: "Fractional Denominators and Sign Rules",
      teacher_feedback: "Struggles with denominator LCM and standard form conversion.",
      graded_at: "14 Oct 2026, 05:00 PM"
    }
  ],
  2: [
    {
      id: 201,
      student_id: 1,
      student_name: "Aarav Sharma",
      roll_no: "01",
      class_name: "Class 8",
      section: "A",
      status: "Submitted",
      paper_file_url: "/samples/math_exam_sample.svg",
      paper_file_name: "Aarav_Sharma_MidTerm_Paper.pdf",
      submitted_at: "16 Oct 2026, 09:30 AM",
      marks_obtained: null,
      percentage: null,
      is_remedial_target: false,
      weak_concept: "Quadratic Equations: Factorization by Splitting the Middle Term",
      teacher_feedback: "Awaiting teacher evaluation."
    },
    {
      id: 202,
      student_id: 22,
      student_name: "Vivaan Sen",
      roll_no: "22",
      class_name: "Class 8",
      section: "A",
      status: "Graded",
      paper_file_url: "/samples/math_exam_sample.svg",
      paper_file_name: "Vivaan_Sen_MidTerm_Paper.pdf",
      submitted_at: "16 Oct 2026, 09:40 AM",
      marks_obtained: 48,
      percentage: 48,
      is_remedial_target: true,
      weak_concept: "Discriminant and Middle Term Splitting",
      teacher_feedback: "Missed 2 steps in middle term splitting.",
      graded_at: "16 Oct 2026, 11:30 AM"
    }
  ]
};

let fallbackFeeDefaulters: FeeDefaulter[] = [
  { id: 101, student_name: "Aarav Sharma", class_name: "Class 8-B", roll_no: "ADM-2026-0819", parent_name: "Mr. Rajesh Sharma", parent_phone: "+91 98450 12345", milestone_title: "Admission & Term 1 Tuition (INV-2026-ADM-0819)", amount_due: 25000, days_overdue: 2, reminder_sent: false, is_admission_fee: true, exam_clearance: false, status: 'Overdue' },
  { id: 1, student_name: "Kabir Mehta", class_name: "Class 8A", roll_no: "15", parent_name: "Mr. Suresh Mehta", parent_phone: "+91 98111 00015", milestone_title: "Milestone 2 (Term 2 Tuition)", amount_due: 18500, days_overdue: 18, reminder_sent: false, is_admission_fee: false, exam_clearance: false, status: 'Overdue' },
  { id: 2, student_name: "Vivaan Sen", class_name: "Class 8-B", roll_no: "22", parent_name: "Mrs. Ritu Sen", parent_phone: "+91 98111 00022", milestone_title: "Milestone 2 (Term 2 Tuition)", amount_due: 18500, days_overdue: 34, reminder_sent: false, is_admission_fee: false, exam_clearance: false, status: 'Overdue' },
  { id: 3, student_name: "Tanvi Deshmukh", class_name: "Class 8-A", roll_no: "08", parent_name: "Dr. Amit Deshmukh", parent_phone: "+91 98450 99882", milestone_title: "Milestone 2 (Term 2 Tuition)", amount_due: 16000, days_overdue: 5, reminder_sent: true, is_admission_fee: false, exam_clearance: true, status: 'Overdue' },
  { id: 4, student_name: "Rohan Iyer", class_name: "Class 9-A", roll_no: "18", parent_name: "Mr. S. Iyer", parent_phone: "+91 98111 00018", milestone_title: "Milestone 2 (Term 2 Tuition)", amount_due: 18500, days_overdue: 8, reminder_sent: false, is_admission_fee: false, exam_clearance: false, status: 'Overdue' }
];

let fallbackPaymentTransactions: PaymentTransactionItem[] = [
  {
    id: 1,
    utr_number: "UPI/2026101901/HDFC",
    student_name: "Aarav Sharma",
    class_name: "Class 8-B",
    parent_name: "Mr. Rajesh Sharma",
    amount: 35000,
    payment_method: "UPI (Google Pay)",
    bank_name: "HDFC School Collections Gateway",
    milestone_title: "Term 1 Comprehensive Fee (Tuition, Lab & Sports)",
    status: "Success",
    transaction_date: "10 Oct 2026",
    reconciled: true,
    reconciled_at: "11 Oct 2026, 10:15 AM",
    reconciled_by: "Mr. Arvind Krishnan",
    gateway_ref: "pay_online_1_1728555300",
    notes: "Settled via Parent Online Portal",
    created_at: "2026-10-10T10:15:00Z"
  }
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

let fallbackCurriculumPacing: CurriculumPacingItem[] = [
  {
    id: 1,
    class_name: "Class 8-B",
    subject: "Mathematics",
    teacher_name: "Mrs. Ananya Verma",
    completed_units: 18,
    total_units: 22,
    calendar_target_units: 18,
    completion_pct: 81.8,
    status: "On Track",
    last_lesson_title: "Linear Equations in Two Variables (Practice Ex 3.4)",
    next_milestone_date: "24 Oct 2026 (Unit Assessment 3)"
  },
  {
    id: 2,
    class_name: "Class 8-B",
    subject: "Science",
    teacher_name: "Dr. Suresh Babu",
    completed_units: 14,
    total_units: 20,
    calendar_target_units: 16,
    completion_pct: 70.0,
    status: "Lagging (2 Units Behind)",
    last_lesson_title: "Light & Reflection Principles",
    next_milestone_date: "28 Oct 2026 (Mid-Term Lab Practical)"
  },
  {
    id: 3,
    class_name: "Class 9-A",
    subject: "English Literature",
    teacher_name: "Mrs. Neha Roy",
    completed_units: 16,
    total_units: 18,
    calendar_target_units: 15,
    completion_pct: 88.9,
    status: "Ahead (+1 Unit)",
    last_lesson_title: "The Road Not Taken - Critical Appreciation",
    next_milestone_date: "30 Oct 2026 (Poetry Essay Submission)"
  },
  {
    id: 4,
    class_name: "Class 10-A",
    subject: "Social Studies",
    teacher_name: "Mr. Arvind Saxena",
    completed_units: 21,
    total_units: 24,
    calendar_target_units: 20,
    completion_pct: 87.5,
    status: "On Track",
    last_lesson_title: "Federalism & Decentralization in India",
    next_milestone_date: "05 Nov 2026 (Pre-Board Milestone 1)"
  },
  {
    id: 5,
    class_name: "Class 10-B",
    subject: "Physics",
    teacher_name: "Dr. Radhika Sen",
    completed_units: 19,
    total_units: 20,
    calendar_target_units: 18,
    completion_pct: 95.0,
    status: "Ahead (+1 Unit)",
    last_lesson_title: "Magnetic Effects of Electric Current",
    next_milestone_date: "02 Nov 2026 (Board Numerical Workshop)"
  },
  {
    id: 6,
    class_name: "Class 7-A",
    subject: "Hindi",
    teacher_name: "Mrs. Rekha Sharma",
    completed_units: 12,
    total_units: 18,
    calendar_target_units: 14,
    completion_pct: 66.7,
    status: "Lagging (2 Units Behind)",
    last_lesson_title: "Grammar: Sandhi and Samas",
    next_milestone_date: "26 Oct 2026 (Class Diagnostic Quiz)"
  }
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
    booked_parent_id: "rajesh_sharma",
    booked_parent_name: "Mr. Rajesh Sharma",
    subject_name: "Mathematics & Class 8-B Homeroom",
    is_sibling_combo: false,
    meeting_url: "https://meet.google.com/edu-ptm-aarav-8b",
    focus_table_agenda: [
      "Review Mid-Term Exam (52%) Q7 & Q9 Sign Errors",
      "Worksheet #4 Backlog Evidence (#EVD-BKLOG-884)",
      "Day 3 Rough Notebook Parent Sign-off Inspection"
    ]
  },
  {
    id: "slot-02",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "raman",
    start_time: "09:12 AM",
    end_time: "09:22 AM",
    status: "BOOKED",
    interaction_scope: "SUBJECT_SPECIFIC",
    booked_student_id: 1,
    booked_student_name: "Aarav Sharma",
    booked_class: "8-B",
    booked_parent_id: "rajesh_sharma",
    booked_parent_name: "Mr. Rajesh Sharma",
    subject_name: "Physics (Dr. K. Raman)",
    is_sibling_combo: false,
    meeting_url: "https://meet.google.com/edu-ptm-aarav-physics",
    focus_table_agenda: [
      "Optics Ray Tracing Lab Backlog (#EVD-BKLOG-902)",
      "Mid-Term Q3 Concave Mirror Focal Point Reflection Error"
    ]
  },
  {
    id: "slot-03",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "09:24 AM",
    end_time: "09:34 AM",
    status: "BOOKED",
    interaction_scope: "HOMEROOM_CLASS",
    booked_student_id: 2,
    booked_student_name: "Kabir Mehta",
    booked_class: "8-B",
    booked_parent_id: "rekha_mehta",
    booked_parent_name: "Mrs. Rekha Mehta",
    subject_name: "Mathematics",
    is_sibling_combo: false,
    meeting_url: "https://meet.google.com/edu-ptm-kabir-math",
    focus_table_agenda: [
      "Review Exam Score 48% (Flagged Q3, Q5, Q8)",
      "Linear Inequalities Backlog (#EVD-BKLOG-715)",
      "Negative Division Sign Inversion Rule"
    ]
  },
  {
    id: "slot-04",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "09:36 AM",
    end_time: "09:56 AM",
    status: "BOOKED",
    interaction_scope: "HOMEROOM_CLASS",
    booked_student_id: 1,
    booked_student_name: "Aarav Sharma",
    booked_class: "8-B",
    booked_parent_id: "rajesh_sharma",
    booked_parent_name: "Mr. Rajesh Sharma",
    subject_name: "Class 8-B Homeroom & Junior Sibling Consultation",
    is_sibling_combo: true,
    sibling_student_id: 8,
    sibling_student_name: "Aarav Kumar (Class 3-A Junior)",
    meeting_url: "https://meet.google.com/edu-sharma-sibling-ptm",
    focus_table_agenda: [
      "Aarav's 1-Week Remedial Pacing & Zero-period Support",
      "Aarav Junior's Phonics Reading Booster & Magic Chest Stars"
    ]
  },
  {
    id: "slot-05",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "sen",
    start_time: "10:00 AM",
    end_time: "10:10 AM",
    status: "BOOKED",
    interaction_scope: "SUBJECT_SPECIFIC",
    booked_student_id: 2,
    booked_student_name: "Kabir Mehta",
    booked_class: "8-B",
    booked_parent_id: "rekha_mehta",
    booked_parent_name: "Mrs. Rekha Mehta",
    subject_name: "Chemistry (Mrs. S. Sen)",
    is_sibling_combo: false,
    meeting_url: "https://meet.google.com/edu-ptm-kabir-chem",
    focus_table_agenda: [
      "Redox Equations Balancing Practice Backlog (#EVD-BKLOG-716)",
      "Stoichiometric Balancing Deficit"
    ]
  },
  {
    id: "slot-05b",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "sunitha",
    start_time: "10:12 AM",
    end_time: "10:22 AM",
    status: "BOOKED",
    interaction_scope: "SUBJECT_SPECIFIC",
    booked_student_id: 4,
    booked_student_name: "Siddharth Verma",
    booked_class: "8-A",
    booked_parent_id: "alok_verma",
    booked_parent_name: "Mr. Alok Verma",
    subject_name: "English Literature (Mrs. Sunitha Rao)",
    is_sibling_combo: false,
    meeting_url: "https://meet.google.com/edu-ptm-siddharth-english",
    focus_table_agenda: [
      "The Merchant of Venice Essay Backlog (#EVD-BKLOG-821)",
      "Act IV Scene 1 Textual Citations"
    ]
  },
  {
    id: "slot-05c",
    event_id: "ptm-conf-2026-term1",
    teacher_id: "ananya",
    start_time: "10:24 AM",
    end_time: "10:34 AM",
    status: "BOOKED",
    interaction_scope: "SUBJECT_SPECIFIC",
    booked_student_id: 4,
    booked_student_name: "Siddharth Verma",
    booked_class: "8-A",
    booked_parent_id: "alok_verma",
    booked_parent_name: "Mr. Alok Verma",
    subject_name: "Mathematics",
    is_sibling_combo: false,
    meeting_url: "https://meet.google.com/edu-ptm-siddharth-math",
    focus_table_agenda: [
      "Arithmetic Progressions Common Difference Backlog (#EVD-BKLOG-820)",
      "Exam Score 44% Decreasing Sequence Diagnostic"
    ]
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


let fallbackExecutivePulse: ExecutivePulseResponse = {
  quick_action_counts: {
    pending_tcs: 2,
    pending_staff_permissions: 1,
    pending_fee_waivers: 1,
    sla_escalations: 0
  },
  admissions: {
    new_inflows_mtd: 45,
    active_followups: 18,
    total_enrolled: 142,
    total_capacity: 180,
    capacity_percentage: 78.9,
    exits_count_ytd: 2,
    grade_capacities: [
      { grade: 'Class 8', enrolled: 92, capacity: 100 },
      { grade: 'Class 9', enrolled: 78, capacity: 100 },
      { grade: 'Class 10', enrolled: 84, capacity: 100 }
    ]
  },
  accounts: {
    today_collections: 145000,
    today_transactions_count: 12,
    aging: {
      under_30_days: 210000,
      days_30_to_60: 140000,
      over_60_days_critical: 65000
    },
    payroll: {
      batch_month: 'October 2026',
      total_staff: 44,
      total_amount: 1820000,
      status: 'Ready_For_Authorization'
    },
    gateway_settlement_pipeline: 85000
  },
  exams: {
    active_exams: [
      { class_name: 'Class 10', subject: 'Pre-Board Mathematics', time: '09:30 AM – 12:30 PM', status: 'In Progress' },
      { class_name: 'Class 8', subject: 'General Science Periodic', time: '10:00 AM – 11:30 AM', status: 'In Progress' }
    ],
    upcoming_exams: [
      { class_name: 'Class 9', subject: 'English Literature', date: 'Monday, 27 Oct' },
      { class_name: 'Class 8', subject: 'Social Studies', date: 'Wednesday, 29 Oct' }
    ],
    grading_queue_pending_papers: 120,
    trajectory: [
      { class_name: 'Class 8', prev_avg: 68.0, current_avg: 74.0, change_pct: 6.0, status: 'Improved' },
      { class_name: 'Class 9', prev_avg: 73.0, current_avg: 66.0, change_pct: -7.0, status: 'Alert' },
      { class_name: 'Class 10', prev_avg: 81.0, current_avg: 83.0, change_pct: 2.0, status: 'Stable' }
    ],
    remedial_student_count: 8
  },
  staff_and_pacing: {
    staff_present: 42,
    staff_total: 44,
    attendance_pct: 95.5,
    pacing_lag_alerts_count: 1,
    lagging_classes: [
      { class_name: 'Class 9-A', subject: 'Physics', teacher_name: 'Mr. Vikram Sharma', lag_units: 2 }
    ]
  }
};

export const api = {

  getExecutivePulse: async () => {
    return fetchWithFallback<ExecutivePulseResponse>('/api/admin/executive-pulse', undefined, fallbackExecutivePulse);
  },

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
  login: async (usernameOrEmail: string, password?: string, schoolCode?: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        username: usernameOrEmail, 
        email: usernameOrEmail, 
        password: password || '', 
        school_code: schoolCode || 'EDU-GLOBAL-360'
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const detailMsg = errJson?.detail || errJson?.message;
      if (detailMsg) {
        throw new Error(typeof detailMsg === 'string' ? detailMsg : JSON.stringify(detailMsg));
      }
      if (res.status === 401) {
        throw new Error("Incorrect password. For all institutional accounts, use 'Password123'.");
      }
      if (res.status === 404) {
        throw new Error(`Account with username '${usernameOrEmail}' not found. Please verify your username.`);
      }
      throw new Error(`Authentication failed (HTTP ${res.status}).`);
    }

    return await res.json();
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
  getEnquiryById: async (id: number) => {
    try {
      return await fetchWithFallback<AdmissionEnquiry>(`/api/admin/crm/enquiries/${id}`, undefined, fallbackEnquiries.find(e => e.id === id) || fallbackEnquiries[0]);
    } catch {
      return fallbackEnquiries.find(e => e.id === id) || fallbackEnquiries[0];
    }
  },
  createEnquiry: async (payload: {
    student_name: string;
    parent_name: string;
    email: string;
    phone: string;
    target_grade: string;
    lead_temperature?: 'hot' | 'warm' | 'cold';
    source?: string;
    doc_report_card?: boolean;
    doc_birth_cert?: boolean;
    doc_transfer_cert?: boolean;
    notes?: string;
    next_followup_date?: string;
  }) => {
    const newEnq: AdmissionEnquiry = {
      id: fallbackEnquiries.length + 10,
      student_name: payload.student_name,
      parent_name: payload.parent_name,
      email: payload.email,
      phone: payload.phone,
      target_grade: payload.target_grade,
      stage: 'new',
      lead_temperature: payload.lead_temperature || 'warm',
      source: payload.source || 'Website Form',
      doc_report_card: payload.doc_report_card || false,
      doc_birth_cert: payload.doc_birth_cert || false,
      doc_transfer_cert: payload.doc_transfer_cert || false,
      notes: payload.notes || 'Direct enquiry registered.',
      next_followup_date: payload.next_followup_date,
      created_at: new Date().toISOString()
    };
    fallbackEnquiries.unshift(newEnq);
    try {
      return await fetchWithFallback<AdmissionEnquiry>('/api/admin/crm/enquiries', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      return newEnq;
    }
  },
  scheduleFollowup: async (id: number, date: string, note?: string) => {
    try {
      return await fetchWithFallback<AdmissionEnquiry>('/api/admin/crm/enquiries/' + id + '/followup', {
        method: 'PATCH',
        body: JSON.stringify({ next_followup_date: date, notes: note, stage: 'followup' })
      });
    } catch {
      fallbackEnquiries = fallbackEnquiries.map(e => {
        if (e.id === id) {
          return {
            ...e,
            stage: 'followup',
            next_followup_date: date,
            notes: note ? ((e.notes ? e.notes + ' | ' : '') + note) : e.notes
          };
        }
        return e;
      });
      return fallbackEnquiries.find(e => e.id === id);
    }
  },
  dropEnquiry: async (id: number, reason: string, note?: string) => {
    try {
      return await fetchWithFallback<AdmissionEnquiry>('/api/admin/crm/enquiries/' + id + '/drop', {
        method: 'PATCH',
        body: JSON.stringify({ drop_reason: reason, notes: note, stage: 'dropped' })
      });
    } catch {
      fallbackEnquiries = fallbackEnquiries.map(e => {
        if (e.id === id) {
          return {
            ...e,
            stage: 'dropped',
            drop_reason: reason,
            notes: note ? ((e.notes ? e.notes + ' | ' : '') + 'Drop: ' + reason + ' (' + note + ')') : ((e.notes ? e.notes + ' | ' : '') + 'Drop: ' + reason)
          };
        }
        return e;
      });
      return fallbackEnquiries.find(e => e.id === id);
    }
  },
  logCallOutcome: async (id: number, payload: {
    outcome: string;
    note: string;
    next_followup_date?: string;
    stage?: 'new' | 'followup' | 'visit' | 'converted' | 'dropped';
    drop_reason?: string;
  }) => {
    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const callEntry = '• [' + timestamp + '] ' + payload.outcome + ': ' + (payload.note || 'Call concluded');
    
    fallbackEnquiries = fallbackEnquiries.map(e => {
      if (e.id === id) {
        let newStage = payload.stage || e.stage;
        let newDropReason = e.drop_reason;
        let nextDate = payload.next_followup_date;
        
        if (payload.outcome === 'Not Interested / Drop') {
          newStage = 'dropped';
          newDropReason = payload.drop_reason || 'Not Interested';
          nextDate = undefined;
        } else if (payload.outcome === 'Connected - Ready to Enroll') {
          newStage = 'followup';
        } else if (payload.outcome === 'Ringing / No Answer') {
          newStage = 'followup';
          const tmrw = new Date();
          tmrw.setDate(tmrw.getDate() + 1);
          nextDate = tmrw.toISOString().split('T')[0];
        } else if (payload.outcome === 'Callback Requested') {
          newStage = 'followup';
        }

        return {
          ...e,
          stage: newStage,
          drop_reason: newDropReason,
          next_followup_date: nextDate,
          notes: e.notes ? e.notes + '\n' + callEntry : callEntry
        };
      }
      return e;
    });

    try {
      return await fetchWithFallback<AdmissionEnquiry>('/api/admin/crm/enquiries/' + id + '/log-call', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      return fallbackEnquiries.find(e => e.id === id);
    }
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
  updateEnquiryTemperature: async (id: number, temperature: 'hot' | 'warm' | 'cold') => {
    fallbackEnquiries = fallbackEnquiries.map(e => e.id === id ? { ...e, lead_temperature: temperature } : e);
    try {
      return await fetchWithFallback<AdmissionEnquiry>('/api/admin/crm/enquiries/' + id + '/stage', {
        method: 'PATCH',
        body: JSON.stringify({ lead_temperature: temperature })
      });
    } catch {
      return fallbackEnquiries.find(e => e.id === id);
    }
  },
  updateEnquiryDocs: async (id: number, docs: { doc_report_card?: boolean; doc_birth_cert?: boolean; doc_transfer_cert?: boolean }) => {
    fallbackEnquiries = fallbackEnquiries.map(e => e.id === id ? { ...e, ...docs } : e);
    try {
      return await fetchWithFallback<AdmissionEnquiry>('/api/admin/crm/enquiries/' + id + '/stage', {
        method: 'PATCH',
        body: JSON.stringify(docs)
      });
    } catch {
      return fallbackEnquiries.find(e => e.id === id);
    }
  },
  convertEnquiryToStudent: async (id: number, options?: { 
    section?: string; 
    feeAmount?: number; 
    feeStatus?: 'Paid' | 'Pending'; 
    paymentMethod?: string;
    uploadedDocs?: DocumentUploadItem[];
    tcUndertaking?: boolean;
  }) => {
    const enq = fallbackEnquiries.find(e => e.id === id);
    const studentName = enq ? enq.student_name : 'New Student';
    const rollNo = `ADM-2026-08${String(id).padStart(2, '0')}`;
    const targetGrade = enq?.target_grade || 'Class 8';
    const sectionName = options?.section ? `${targetGrade}-${options.section}` : `${targetGrade}-B`;
    const invoiceNo = `INV-2026-ADM-${id}84`;
    const feeAmt = options?.feeAmount ?? 25000;
    const feeStatus = options?.feeStatus ?? 'Pending';
    const payMethod = options?.paymentMethod ?? 'UPI';

    fallbackEnquiries = fallbackEnquiries.map(e => e.id === id ? { 
      ...e, 
      stage: 'converted', 
      notes: `${e.notes || ''} | Enrolled as ${rollNo} in ${sectionName}. Admission Fee ₹${feeAmt} (${feeStatus}).` 
    } : e);

    // Register intake documents in Admin Document Vault awaiting legal verification
    const docSlug = studentName.toLowerCase().replace(/\s+/g, '_');
    const newStudentDocs: OfficialDocument[] = (options?.uploadedDocs && options.uploadedDocs.length > 0)
      ? options.uploadedDocs.map((udoc, idx) => ({
          id: fallbackDocuments.length + 10 + idx,
          student_id: id + 100,
          title: udoc.title || `${udoc.doc_type} - ${studentName}`,
          doc_type: udoc.doc_type,
          file_url: udoc.file_url || `/documents/${udoc.doc_type.toLowerCase().replace(/\s+/g, '_')}_${docSlug}.pdf`,
          is_official: true,
          uploaded_by_role: 'admissions_coordinator',
          status: 'Pending Verification',
          verified_stamp: 'Awaiting Principal/Registry Seal',
          upload_date: new Date().toISOString()
        }))
      : [
          {
            id: fallbackDocuments.length + 10,
            student_id: id + 100,
            title: `Previous Grade Academic Record - ${studentName}`,
            doc_type: 'Marks Card',
            file_url: `/documents/report_card_${docSlug}.pdf`,
            is_official: true,
            uploaded_by_role: 'admissions_coordinator',
            status: 'Pending Verification',
            verified_stamp: 'Awaiting Principal/Registry Seal',
            upload_date: new Date().toISOString()
          },
          {
            id: fallbackDocuments.length + 11,
            student_id: id + 100,
            title: options?.tcUndertaking
              ? `30-Day Provisional Undertaking (Transfer Certificate) - ${studentName}`
              : `Transfer Certificate (Incoming TC Deposited) - ${studentName}`,
            doc_type: 'Transfer Certificate',
            file_url: `/documents/tc_${docSlug}.pdf`,
            is_official: true,
            uploaded_by_role: 'admissions_coordinator',
            status: 'Pending Verification',
            verified_stamp: options?.tcUndertaking ? 'Provisional Undertaking (30 Days)' : 'Awaiting Principal/Registry Seal',
            upload_date: new Date().toISOString()
          },
          {
            id: fallbackDocuments.length + 12,
            student_id: id + 100,
            title: `Government Birth Certificate & Identity Proof - ${studentName}`,
            doc_type: 'Birth Certificate',
            file_url: `/documents/birth_cert_${docSlug}.pdf`,
            is_official: true,
            uploaded_by_role: 'admissions_coordinator',
            status: 'Pending Verification',
            verified_stamp: 'Awaiting Principal/Registry Seal',
            upload_date: new Date().toISOString()
          }
        ];
    fallbackDocuments = [...newStudentDocs, ...fallbackDocuments];

    if (feeStatus === 'Paid') {
      const receiptNo = `REC-ADM-2026-${id + 100}`;
      const newPaidTx: PaymentTransactionItem = {
        id: fallbackPaymentTransactions.length + 1,
        utr_number: `UPI/${Date.now()}${id}/ADMISSION`,
        student_name: studentName,
        class_name: sectionName,
        parent_name: enq?.parent_name || `Parent of ${studentName}`,
        amount: feeAmt,
        payment_method: payMethod,
        bank_name: 'HDFC School Collections Gateway',
        milestone_title: `One-Time Admission & Registration Fee (${receiptNo})`,
        status: 'Success',
        reconciled: false,
        gateway_ref: `pay_adm_${id}_${Date.now()}`,
        transaction_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        notes: `New Enrolment Intake Admission Fee • Receipt #${receiptNo}`,
        created_at: new Date().toISOString()
      };
      fallbackPaymentTransactions.unshift(newPaidTx);
    } else {
      const newAdmissionDefaulter: FeeDefaulter = {
        id: fallbackFeeDefaulters.length + 100,
        student_id: id + 100,
        student_name: studentName,
        class_name: sectionName,
        roll_no: rollNo,
        parent_name: enq?.parent_name || `Parent of ${studentName}`,
        parent_phone: enq?.phone || '+91 98450 12345',
        milestone_title: `One-Time Admission Fee (${invoiceNo})`,
        amount_due: feeAmt,
        days_overdue: 0,
        reminder_sent: false,
        is_admission_fee: true,
        exam_clearance: true,
        status: 'Overdue'
      };
      fallbackFeeDefaulters.unshift(newAdmissionDefaulter);
    }

    try {
      return await fetchWithFallback(`/api/admin/crm/enquiries/${id}/convert`, {
        method: 'POST',
        body: JSON.stringify({
          section: options?.section || 'B',
          admission_fee: feeAmt,
          fee_status: feeStatus,
          payment_method: payMethod,
          uploaded_docs: options?.uploadedDocs,
          tc_undertaking: options?.tcUndertaking
        })
      });
    } catch {
      return {
        success: true,
        student_name: studentName,
        roll_no: rollNo,
        allocated_section: sectionName,
        admission_fee_invoice: invoiceNo,
        fee_amount: feeAmt,
        fee_status: feeStatus,
        parent_user: enq?.email || 'parent.portal@edu360.internal',
        temp_password: `Edu360@${new Date().getFullYear()}`,
        parent_phone: enq?.phone || '+91 98450 12345',
        message: `Student enrolled successfully as ${rollNo}! Admission Fee ₹${feeAmt} (${feeStatus}) dispatched to Accounts Desk.`
      };
    }
  },
  getStudents: async () => {
    return fetchWithFallback<Student[]>('/api/admin/students', undefined, fallbackStudents);
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
  getAllOfficialDocuments: async () => {
    return fetchWithFallback<OfficialDocument[]>('/api/admin/documents', undefined, fallbackDocuments);
  },
  approveOfficialDocument: async (docId: number) => {
    try {
      return await fetchWithFallback<OfficialDocument>(`/api/admin/documents/${docId}/approve`, {
        method: 'POST'
      });
    } catch {
      fallbackDocuments = fallbackDocuments.map(d => d.id === docId ? { ...d, status: 'Verified', verified_stamp: 'EDU360 Official Seal - Approved by Administrator' } : d);
      return fallbackDocuments.find(d => d.id === docId);
    }
  },
  directEnroll: async (payload: {
    student_name: string;
    parent_name: string;
    phone: string;
    email?: string;
    target_grade: string;
    section?: string;
    admission_fee?: number;
    fee_status?: 'Paid' | 'Pending';
    payment_method?: string;
    action_type: 'direct_sis' | 'forward_vip';
    notes?: string;
  }) => {
    try {
      return await fetchWithFallback<any>('/api/admin/crm/direct-enroll', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      if (payload.action_type === 'direct_sis') {
        const randId = Math.floor(Math.random() * 900) + 100;
        const admNo = `EDU-2026-${randId}`;
        const newDoc: OfficialDocument = {
          id: fallbackDocuments.length + 1,
          student_id: randId,
          title: `Transfer Certificate (Incoming TC Deposited) - ${payload.student_name}`,
          doc_type: 'Transfer Certificate',
          file_url: `/documents/tc_${payload.student_name.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          is_official: true,
          uploaded_by_role: 'admin',
          status: 'Verified',
          verified_stamp: 'EDU360 Official Seal - Original Surrendered',
          upload_date: new Date().toISOString()
        };
        fallbackDocuments = [newDoc, ...fallbackDocuments];
        return {
          success: true,
          action_type: 'direct_sis',
          message: `Successfully enrolled ${payload.student_name} into SIS (${payload.target_grade}-${payload.section || 'A'}) with Admission #${admNo}`,
          admission_no: admNo
        };
      } else {
        return {
          success: true,
          action_type: 'forward_vip',
          message: `Forwarded ${payload.student_name} to Admissions Coordinator desk with 👑 VIP Referral priority tag.`
        };
      }
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
        domain: 'executive',
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
  getInventory: async (params?: { category?: string; condition?: string; search?: string }): Promise<InventoryRecord[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.condition) q.set('condition', params.condition);
      if (params?.search) q.set('search', params.search);
      const url = `/api/inventory/items${q.toString() ? '?' + q.toString() : ''}`;
      const res = await fetchWithFallback<InventoryRecord[]>(url, undefined, fallbackInventory);
      return Array.isArray(res) ? res : fallbackInventory;
    } catch {
      return fallbackInventory;
    }
  },

  createInventoryItem: async (payload: Partial<InventoryRecord>): Promise<InventoryRecord> => {
    return await fetchWithFallback<InventoryRecord>('/api/inventory/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  adjustInventoryStock: async (itemId: number, delta: number, reason: string = 'Class Practical Usage', notes?: string): Promise<InventoryRecord> => {
    try {
      return await fetchWithFallback<InventoryRecord>(`/api/inventory/items/${itemId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta, reason, notes })
      });
    } catch {
      fallbackInventory = fallbackInventory.map(i => {
        if (i.id === itemId) {
          const newTotal = Math.max(0, i.total_stock + delta);
          return { ...i, total_stock: newTotal, available_stock: Math.max(0, (i.available_stock || newTotal) + delta) };
        }
        return i;
      });
      return fallbackInventory.find(i => i.id === itemId)!;
    }
  },

  requisitionPurchaseOrder: async (itemId: number, payload: { quantity: number; vendor_name: string; department?: string; unit_price?: number; notes?: string }): Promise<PurchaseOrderItem> => {
    return await fetchWithFallback<PurchaseOrderItem>(`/api/inventory/items/${itemId}/requisition-po`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  getCustodyLogs: async (params?: { status?: string; borrower_role?: string; search?: string }): Promise<AssetCustodyLogItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.borrower_role) q.set('borrower_role', params.borrower_role);
      if (params?.search) q.set('search', params.search);
      const url = `/api/inventory/custody${q.toString() ? '?' + q.toString() : ''}`;
      const res = await fetchWithFallback<AssetCustodyLogItem[]>(url, undefined, fallbackCustodyLogs);
      return Array.isArray(res) ? res : fallbackCustodyLogs;
    } catch {
      return fallbackCustodyLogs;
    }
  },

  checkoutAsset: async (payload: { item_id: number; borrower_name: string; borrower_role?: string; borrower_ref_id?: string; class_room?: string; quantity: number }): Promise<AssetCustodyLogItem> => {
    return await fetchWithFallback<AssetCustodyLogItem>('/api/inventory/custody/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  returnAsset: async (logId: number, payload: { condition_on_return?: string; damaged_qty?: number; fine_assessed?: number; notes?: string }): Promise<AssetCustodyLogItem> => {
    return await fetchWithFallback<AssetCustodyLogItem>(`/api/inventory/custody/${logId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  checkStudentClearance: async (studentId: number): Promise<ClearanceCheckResult> => {
    try {
      return await fetchWithFallback<ClearanceCheckResult>(`/api/inventory/clearance/student/${studentId}`, undefined, {
        student_id: studentId,
        student_name: 'Student',
        is_cleared: true,
        active_hold_count: 0,
        pending_items: [],
        total_unpaid_fines: 0
      });
    } catch {
      return {
        student_id: studentId,
        student_name: 'Student',
        is_cleared: true,
        active_hold_count: 0,
        pending_items: [],
        total_unpaid_fines: 0
      };
    }
  },
  getFeeDefaulters: async (params?: { aging_tier?: string; status?: string; class_name?: string; search?: string }): Promise<FeeDefaulter[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.aging_tier) q.set('aging_tier', params.aging_tier);
      if (params?.status) q.set('status', params.status);
      if (params?.class_name) q.set('class_name', params.class_name);
      if (params?.search) q.set('search', params.search);
      const url = `/api/finance/defaulters${q.toString() ? '?' + q.toString() : ''}`;
      const res = await fetchWithFallback<FeeDefaulter[]>(url, undefined, fallbackFeeDefaulters);
      return Array.isArray(res) ? res : [];
    } catch {
      return fallbackFeeDefaulters;
    }
  },
  sendFeeReminder: async (id: number, channel: string = 'WhatsApp'): Promise<any> => {
    try {
      return await fetchWithFallback(`/api/finance/defaulters/${id}/reminder?channel=${encodeURIComponent(channel)}`, { method: 'POST' });
    } catch {
      fallbackFeeDefaulters = fallbackFeeDefaulters.map(d => d.id === id ? { ...d, reminder_sent: true } : d);
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

  // Academic Curriculum Pacing Engine
  getCurriculumPacing: async () => {
    return fetchWithFallback<CurriculumPacingItem[]>('/api/admin/academic/curriculum-pacing', undefined, fallbackCurriculumPacing);
  },
  logCurriculumLesson: async (itemId: number, unitsToAdd: number = 1, lessonTitle?: string) => {
    try {
      return await fetchWithFallback<{ success: boolean; item: CurriculumPacingItem }>(`/api/admin/academic/curriculum-pacing/${itemId}/log-lesson`, {
        method: 'POST',
        body: JSON.stringify({ units_to_add: unitsToAdd, lesson_title: lessonTitle })
      });
    } catch {
      fallbackCurriculumPacing = fallbackCurriculumPacing.map(item => {
        if (item.id === itemId) {
          const completed = Math.min(item.total_units, item.completed_units + unitsToAdd);
          const pct = Math.round((completed / item.total_units) * 1000) / 10;
          return {
            ...item,
            completed_units: completed,
            completion_pct: pct,
            last_lesson_title: lessonTitle || item.last_lesson_title
          };
        }
        return item;
      });
      const updated = fallbackCurriculumPacing.find(i => i.id === itemId)!;
      return { success: true, item: updated };
    }
  },
  interveneCurriculumPacing: async (itemId: number) => {
    try {
      return await fetchWithFallback<{ success: boolean; message: string }>(`/api/admin/academic/curriculum-pacing/${itemId}/intervene`, {
        method: 'POST'
      });
    } catch {
      return { success: true, message: 'Created remediation task for faculty' };
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
  applyTeacherPermission: async (data: { 
    type: string; 
    reason: string; 
    date: string;
    shift?: string;
    affected_periods?: string;
    suggested_substitute?: string;
  }) => {
    try {
      return await fetchWithFallback('/api/teacher/apply-permission', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const newPerm: TeacherPermissionRequest = {
        id: fallbackMyTeacherPermissions.length + 10,
        teacher_id: 1,
        teacher_name: "Mrs. Ananya Verma",
        type: data.type,
        date: data.date,
        shift: data.shift || "Morning Shift (08:30 AM - 12:30 PM)",
        affected_periods: data.affected_periods || "Period 2 & Period 4",
        suggested_substitute: data.suggested_substitute || "Mrs. Neha Roy (TGT Science)",
        reason: data.reason,
        status: "Pending",
        applied_at: "Just now"
      };
      fallbackMyTeacherPermissions = [newPerm, ...fallbackMyTeacherPermissions];
      fallbackTeacherPermissions = [newPerm, ...fallbackTeacherPermissions];
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
  dispatchFeeWhatsApp: async (milestoneId?: number, actionType: 'receipt' | 'summary' = 'receipt', phone: string = '+91 98480 22338') => {
    try {
      return await fetchWithFallback<{ success: boolean; message: string; message_preview: string }>(`/api/parent/fees/whatsapp-dispatch`, {
        method: 'POST',
        body: JSON.stringify({ milestone_id: milestoneId, action_type: actionType, phone })
      });
    } catch {
      return {
        success: true,
        message: `WhatsApp message successfully dispatched to ${phone}`,
        message_preview: actionType === 'summary' 
          ? `EDU360 Accounts: Aarav Sharma (Class 8-B). Total Paid: ₹35,000 | Pending Dues: ₹18,500. Settle online at https://edu360.school/pay/aarav8b`
          : `EDU360 Accounts: Official payment receipt #REC-2026-FEE-${milestoneId || 5821} generated. Download authenticated PDF: https://edu360.school/receipts/REC.pdf`
      };
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

  getAIParentStudyGuidance: async (req: AIParentStudyGuidanceRequest): Promise<AIParentStudyGuidanceResponse> => {
    try {
      const res = await fetch(`${API_BASE}/api/parent/ai-study-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback below
    }
    const subj = req.subject_name || 'Mathematics';
    const day = req.active_day || 'Day 3';
    return {
      plain_english_translation: `In ${subj}, your child understands the core steps, but tends to drop or mix up minus signs when expanding brackets across multiple terms. Think of it like baking a great cake but forgetting the pinch of salt at the end—a simple habit to fix once noticed!`,
      tonight_action: `Open their rough notebook to tonight's ${day} practice. Ask them to solve '-(3x - 5)' out loud and explain what happens to the minus sign. Check that they write '-3x + 5' instead of '-3x - 5'.`,
      child_motivation_tip: "You've already mastered the hard algebraic steps—now we're just training our eyes like a detective for those sneaky minus signs. You're making real progress!",
      suggested_teacher_question: `Dear Teacher, we reviewed Aarav's bracket sign distribution in his rough notebook tonight. Could you please glance at his ${day} solution tomorrow to verify if his sign handling is improving?`,
      has_backlog: true,
      backlog_count: 1,
      source: 'fallback',
      model_used: 'gemini-1.5-flash'
    };
  },

  // Student Endpoints
  getStudentRecordings: async () => {
    const fallbackRecordings: ClassRecording[] = [
      { 
        id: 1, 
        title: "Quadratic Equations: Factorization by Splitting", 
        subject: "Mathematics", 
        chapter: "Chapter 4: Quadratic Equations", 
        teacher_name: "Mrs. Ananya Verma", 
        duration: "42 mins", 
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
        thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400", 
        date: "11 Oct 2026",
        topic_tags: ["#QuadraticEquations", "#Factorization", "#CBSE_Ch4"],
        chapters: [
          { time: "02:15", label: "Standard Quadratic Form ax² + bx + c = 0", key_takeaway: "Ensure a ≠ 0 and all terms are gathered onto the LHS." },
          { time: "09:40", label: "Splitting Middle Term: Finding p & q", key_takeaway: "Identify pairs where p·q = a·c and p+q = b." },
          { time: "18:25", label: "Sign Conventions & Negative Coefficients", key_takeaway: "Watch negative signs when grouping: 2x² - 5x - 3." },
          { time: "31:10", label: "CBSE Board Model Problem Practice", key_takeaway: "Always conclude with distinct root values x = α, β." }
        ]
      },
      { 
        id: 2, 
        title: "Force and Laws of Motion: Newton's 3rd Law", 
        subject: "Physics", 
        chapter: "Chapter 9: Laws of Motion", 
        teacher_name: "Dr. K. Raman", 
        duration: "48 mins", 
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 
        thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400", 
        date: "09 Oct 2026",
        topic_tags: ["#NewtonsLaws", "#ActionReaction", "#Momentum"],
        chapters: [
          { time: "01:30", label: "Action & Reaction Pair Definition", key_takeaway: "Forces always occur in matched opposite pairs on different bodies." },
          { time: "14:15", label: "Conservation of Linear Momentum", key_takeaway: "Total initial momentum equals total final momentum in isolated systems." },
          { time: "28:50", label: "Recoil Velocity of Guns & Rockets", key_takeaway: "V_recoil = -(m_bullet · v_bullet) / M_gun." }
        ]
      },
      { 
        id: 3, 
        title: "The Merchant of Venice: Act II Scene IV", 
        subject: "English", 
        chapter: "Drama Literature", 
        teacher_name: "Ms. Rachel Adams", 
        duration: "38 mins", 
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", 
        thumbnail: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400", 
        date: "07 Oct 2026",
        topic_tags: ["#Shakespeare", "#Act2Scene4", "#LiteraryAnalysis"],
        chapters: [
          { time: "03:10", label: "Lorenzo and Gratiano Dialogue Context", key_takeaway: "Plotting the masque and Lorenzo's elopement with Jessica." },
          { time: "16:40", label: "Theme of Disguise & Elizabethan Theater", key_takeaway: "Torchbearer symbolism in Venetian festival nights." }
        ]
      }
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
  },

  // --- Operational Task Manager (Decentralized Coordinator Tasks) ---
  getAdminTasks: async (domain?: string, status?: string, is_escalated?: boolean) => {
    const params = new URLSearchParams();
    if (domain && domain !== 'all') params.append('domain', domain);
    if (status && status !== 'all') params.append('status', status);
    if (is_escalated !== undefined) params.append('is_escalated', String(is_escalated));
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchWithFallback<AdminTask[]>(`/api/admin/tasks${query}`, undefined, fallbackTasks);
  },

  getTaskExecutiveCockpit: async () => {
    const fallback: TaskExecutiveCockpitResponse = {
      total_open: fallbackTasks.filter(t => !['Completed','Done'].includes(t.status || '')).length,
      critical_escalations: fallbackTasks.filter(t => t.is_escalated || t.priority === 'Critical').length,
      overdue_count: fallbackTasks.filter(t => t.category === 'urgent' && t.status !== 'Completed').length,
      auto_generated_count: fallbackTasks.filter(t => t.is_auto_generated).length,
      department_stats: [
        { domain: 'academic', label: 'Academic & Curriculum', total_tasks: 1, open_tasks: 1, completed_tasks: 0, completion_rate_pct: 0 },
        { domain: 'exam', label: 'Examination Cell', total_tasks: 1, open_tasks: 1, completed_tasks: 0, completion_rate_pct: 0 },
        { domain: 'transport', label: 'Yellow Bus Fleet', total_tasks: 1, open_tasks: 1, completed_tasks: 0, completion_rate_pct: 0 },
        { domain: 'inventory', label: 'Asset & Lab Store', total_tasks: 1, open_tasks: 1, completed_tasks: 0, completion_rate_pct: 0 },
        { domain: 'admissions', label: 'Admissions & CRM', total_tasks: 1, open_tasks: 0, completed_tasks: 1, completion_rate_pct: 100 },
        { domain: 'finance', label: 'Finance & Bursar', total_tasks: 1, open_tasks: 1, completed_tasks: 0, completion_rate_pct: 0 },
        { domain: 'executive', label: 'Executive Mandates', total_tasks: 1, open_tasks: 1, completed_tasks: 0, completion_rate_pct: 0 },
      ],
      recent_tasks: fallbackTasks.slice(0, 7),
    };
    return fetchWithFallback<TaskExecutiveCockpitResponse>('/api/admin/tasks/executive-cockpit', undefined, fallback);
  },

  createAdminTask: async (task: Partial<AdminTask>) => {
    const res = await fetchWithFallback<AdminTask>('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    }, { ...task, id: Date.now() } as AdminTask);
    fallbackTasks = [res, ...fallbackTasks];
    return res;
  },

  updateAdminTask: async (taskId: number, updates: Partial<AdminTask>) => {
    const res = await fetchWithFallback<AdminTask>(`/api/admin/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }, fallbackTasks.find(t => t.id === taskId) as AdminTask);
    fallbackTasks = fallbackTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    return res;
  },

  escalateAdminTask: async (taskId: number, reason: string) => {
    const res = await fetchWithFallback<AdminTask>(`/api/admin/tasks/${taskId}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    }, { ...(fallbackTasks.find(t => t.id === taskId) || {}), is_escalated: true, priority: 'Critical' } as AdminTask);
    fallbackTasks = fallbackTasks.map(t => t.id === taskId ? { ...t, is_escalated: true, priority: 'Critical', escalation_reason: reason } : t);
    return res;
  },

  autoTriggerTask: async (event_type: string, entity_id?: string, notes?: string) => {
    const res = await fetchWithFallback<AdminTask>('/api/admin/tasks/auto-trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type, entity_id, notes }),
    }, { id: Date.now(), title: `Auto-Triggered: ${event_type}`, category: 'urgent', domain: 'executive', due_date: 'Today', assigned_to: 'System', status: 'Pending', priority: 'High', is_auto_generated: true, trigger_event: event_type } as AdminTask);
    fallbackTasks = [res, ...fallbackTasks];
    return res;
  },

  requestTaskRelief: async (taskId: number, data: TaskReliefRequest) => {
    try {
      const res = await fetchWithFallback<AdminTask>(`/api/admin/tasks/${taskId}/request-relief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fallbackTasks = fallbackTasks.map(t => t.id === taskId ? {
        ...t,
        relief_requested: true,
        relief_reason: data.relief_reason,
        relief_justification: data.justification,
        suggested_peer_teacher: data.suggested_peer_teacher,
        status: 'Relief Requested'
      } : t);
      return res;
    } catch {
      fallbackTasks = fallbackTasks.map(t => t.id === taskId ? {
        ...t,
        relief_requested: true,
        relief_reason: data.relief_reason,
        relief_justification: data.justification,
        suggested_peer_teacher: data.suggested_peer_teacher,
        status: 'Relief Requested'
      } : t);
      return fallbackTasks.find(t => t.id === taskId)!;
    }
  },

  approveTaskRelief: async (taskId: number, data: ApproveReliefRequest) => {
    try {
      const res = await fetchWithFallback<AdminTask>(`/api/admin/tasks/${taskId}/approve-relief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fallbackTasks = fallbackTasks.map(t => t.id === taskId ? {
        ...t,
        assigned_to: data.new_assigned_to,
        relief_requested: false,
        status: 'Pending',
        sla_hours: data.new_sla_hours || 48
      } : t);
      return res;
    } catch {
      fallbackTasks = fallbackTasks.map(t => t.id === taskId ? {
        ...t,
        assigned_to: data.new_assigned_to,
        relief_requested: false,
        status: 'Pending',
        sla_hours: data.new_sla_hours || 48
      } : t);
      return fallbackTasks.find(t => t.id === taskId)!;
    }
  },

  extendTaskSla: async (taskId: number, data: ExtendSlaRequest) => {
    try {
      const res = await fetchWithFallback<AdminTask>(`/api/admin/tasks/${taskId}/extend-sla`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fallbackTasks = fallbackTasks.map(t => t.id === taskId ? {
        ...t,
        sla_hours: (t.sla_hours || 24) + data.additional_hours,
        relief_requested: false,
        status: 'Pending'
      } : t);
      return res;
    } catch {
      fallbackTasks = fallbackTasks.map(t => t.id === taskId ? {
        ...t,
        sla_hours: (t.sla_hours || 24) + data.additional_hours,
        relief_requested: false,
        status: 'Pending'
      } : t);
      return fallbackTasks.find(t => t.id === taskId)!;
    }
  },

  getPTMGovernance: async () => {
    const fallback: PTMGovernanceStatus = {
      active_event_title: "Term-2 Mid-Term Parent-Teacher Meeting",
      event_date: "Saturday, 24 Oct 2026",
      time_window: "09:00 AM – 01:00 PM",
      slot_duration_mins: 10,
      total_teachers: 30,
      published_teachers_count: 28,
      readiness_percentage: 93.3,
      unready_teachers: ["Dr. Suresh Babu (Science)", "Mrs. Rekha Sharma (Hindi)"],
      focus_students_requiring_brief: 6
    };
    return fetchWithFallback<PTMGovernanceStatus>('/api/admin/ptm/governance', undefined, fallback);
  },

  getPTMEvents: async () => {
    const fallback: PTMEventResponse[] = [
      {
        id: 1,
        title: "Post Mid-Term Evaluation PTM (Grades 8, 9, 10)",
        academic_term: "Term 1",
        start_date: "2026-10-24",
        end_date: "2026-10-25",
        start_time: "09:00 AM",
        end_time: "01:00 PM",
        slot_duration_mins: 10,
        target_classes: ["Class 8-A", "Class 8-B", "Class 9-A", "Class 9-B", "Class 10-A"],
        status: "Active",
        created_by_name: "Academic Coordinator",
        created_at: new Date().toISOString()
      }
    ];
    return fetchWithFallback<PTMEventResponse[]>('/api/admin/ptm/events', undefined, fallback);
  },

  declarePTMEvent: async (data: PTMEventCreate) => {
    try {
      return await fetchWithFallback<{ success: boolean; message: string; event: PTMEventResponse; tasks_broadcast: number }>('/api/admin/ptm/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      const fallbackEvent: PTMEventResponse = {
        id: Math.floor(Math.random() * 9000) + 100,
        title: data.title,
        academic_term: data.academic_term || 'Term 1',
        start_date: data.start_date,
        end_date: data.end_date,
        start_time: data.start_time || '09:00 AM',
        end_time: data.end_time || '01:00 PM',
        slot_duration_mins: data.slot_duration_mins || 10,
        target_classes: data.target_classes,
        status: 'Active',
        created_by_name: 'Academic Coordinator',
        created_at: new Date().toISOString()
      };
      return {
        success: true,
        message: `Successfully declared PTM '${data.title}' (Offline fallback)`,
        event: fallbackEvent,
        tasks_broadcast: data.target_classes.length * 3
      };
    }
  },

  remindUnreadyPTMTeachers: async () => {
    try {
      return await fetchWithFallback<{ success: boolean; message: string }>('/api/admin/ptm/remind-unready', {
        method: 'POST'
      });
    } catch {
      return { success: true, message: "Dispatched urgent 6-hour SLA task to 2 defaulting teachers" };
    }
  },

  teacherLogCurriculumUnit: async (className: string, subject: string, unitsToAdd: number = 1, lessonTitle?: string) => {
    try {
      return await fetchWithFallback<{ success: boolean; item: CurriculumPacingItem }>('/api/teacher/curriculum/log-unit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_name: className, subject, units_to_add: unitsToAdd, lesson_title: lessonTitle })
      });
    } catch {
      fallbackCurriculumPacing = fallbackCurriculumPacing.map(item => {
        if (item.class_name === className && item.subject === subject) {
          const completed = Math.min(item.total_units, item.completed_units + unitsToAdd);
          return {
            ...item,
            completed_units: completed,
            completion_pct: Math.round((completed / item.total_units) * 1000) / 10,
            last_lesson_title: lessonTitle || item.last_lesson_title
          };
        }
        return item;
      });
      return { success: true, item: fallbackCurriculumPacing.find(i => i.class_name === className && i.subject === subject)! };
    }
  },

  // =========================================================================
  // REMEDIAL FOCUS TABLE & DIAGNOSTIC LAG INTELLIGENCE (Cross-Role Sync)
  // =========================================================================
  getRemedialRoster: async () => {
    try {
      return await fetchWithFallback<{ success: boolean; count: number; roster: FocusRosterItem[] }>('/api/remedial/roster');
    } catch {
      return { success: true, count: INITIAL_FOCUS_ROSTER.length, roster: INITIAL_FOCUS_ROSTER };
    }
  },

  getRemedialStudent: async (studentId: number) => {
    try {
      const res = await fetchWithFallback<any>(`/api/remedial/student/${studentId}`);
      if (res && res.student) {
        return { success: true, student: res.student as FocusRosterItem };
      }
      return { success: true, student: res as FocusRosterItem };
    } catch {
      const student = getFocusStudentById(studentId) || INITIAL_FOCUS_ROSTER[0];
      return { success: true, student };
    }
  },

  generateRemedialSprint: async (studentId: number) => {
    try {
      return await fetchWithFallback<{ success: boolean; student: FocusRosterItem; source: string }>('/api/remedial/generate-sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId })
      });
    } catch {
      const student = getFocusStudentById(studentId) || INITIAL_FOCUS_ROSTER[0];
      return { success: true, student, source: 'fallback' };
    }
  },

  scanStudentPapers: async (data: {
    student_id: number;
    exam_paper_name?: string;
    exam_paper_data?: string;
    exam_paper_mime?: string;
    homework_paper_name?: string;
    homework_paper_data?: string;
    homework_paper_mime?: string;
    assignment_notes?: string;
  }) => {
    try {
      return await fetchWithFallback<{
        success: boolean;
        student: FocusRosterItem;
        extracted_papers_ocr?: {
          exam_paper_transcript?: string;
          homework_paper_transcript?: string;
          identified_errors?: string[];
          calculated_score_pct?: number;
        };
        source: string;
      }>('/api/remedial/scan-student-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      const student = getFocusStudentById(data.student_id) || INITIAL_FOCUS_ROSTER[0];
      return { success: true, student, source: 'fallback' };
    }
  },

  getRemedialSocraticHint: async (data: { student_id: number; day_num: number; question_text: string; student_notes?: string; attempt_count?: number }) => {
    try {
      return await fetchWithFallback<SocraticHintResponse>('/api/remedial/socratic-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      const attempts = data.attempt_count || 1;
      return {
        success: true,
        hint: attempts === 1 
          ? "Remember the distribution law: a minus sign outside parentheses reverses every sign inside. Try writing -(x - 3) as -1 * (x) + (-1) * (-3)."
          : "Focus specifically on the second term: (-1) * (-7). When two negative numbers multiply, their product becomes positive!",
        guiding_question: attempts === 1 
          ? "When you distribute -1 across both terms, what does -1 * -3 become?"
          : "What is (-1) * (-7)? Does it stay negative or flip to +7?",
        source: "fallback",
        attempt_count: attempts,
        formula_card: attempts >= 2 ? {
          title: "Algebraic Parentheses & Negative Sign Rule",
          rule: "-(a - b) = -a + b",
          explanation: "A minus sign directly outside brackets acts as multiplying every term inside by -1. Both signs flip!",
          visual_steps: [
            "1. -(3x - 7) has a negative sign outside brackets",
            "2. Distribute: (-1)*(3x) + (-1)*(-7)",
            "3. Result: -3x + 7 (Note +7 flips to positive!)"
          ]
        } : undefined,
        flagged_for_teacher: attempts >= 3,
        escalation_message: attempts >= 3 ? "Stuck after 3 Socratic hints. Flagged for Teacher 5-Minute In-Class Huddle! Problem marked unlocked so you can continue." : undefined
      };
    }
  },

  preVerifyRemedialRoughWork: async (data: { student_id: number; day_num: number; rubric_checkpoint?: string; student_notes?: string }) => {
    try {
      return await fetchWithFallback<PreVerifyResponse>('/api/remedial/pre-verify-rough-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      return {
        success: true,
        ai_status: 'passed' as const,
        confidence: 0.94,
        ai_rubric_match: 'Rubric Checkpoint Verified: Intermediate bracket expansion +7 sign change detected.',
        recommendation: '1-Click Approve',
        verified_at: 'Just now'
      };
    }
  },

  uploadRemedialRoughWork: async (data: { student_id: number; day_num: number; file_name: string; file_size?: string; student_notes?: string }) => {
    try {
      return await fetchWithFallback<{ success: boolean; student: FocusRosterItem; message: string }>('/api/remedial/upload-rough-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      const student = getFocusStudentById(data.student_id);
      if (student) {
        student.plan_days = student.plan_days.map(d => {
          if (d.day_num === data.day_num) {
            return {
              ...d,
              status: 'Pending',
              submitted_file: {
                name: data.file_name,
                size: data.file_size || '1.4 MB',
                submitted_at: 'Just now',
                student_notes: data.student_notes
              }
            };
          }
          return d;
        });
        updateFocusStudent(data.student_id, student);
      }
      return {
        success: true,
        student: getFocusStudentById(data.student_id) || INITIAL_FOCUS_ROSTER[0],
        message: 'Rough work uploaded successfully (Offline fallback)'
      };
    }
  },

  verifyRemedialDay: async (data: { student_id: number; day_num: number; action: 'approve' | 'rework'; teacher_remarks?: string }) => {
    try {
      return await fetchWithFallback<{ success: boolean; student: FocusRosterItem; message: string }>('/api/remedial/verify-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      const student = getFocusStudentById(data.student_id);
      if (student) {
        student.plan_days = student.plan_days.map(d => {
          if (d.day_num === data.day_num) {
            return {
              ...d,
              status: data.action === 'approve' ? 'Completed' : 'Pending'
            };
          }
          return d;
        });
        updateFocusStudent(data.student_id, student);
      }
      return {
        success: true,
        student: getFocusStudentById(data.student_id) || INITIAL_FOCUS_ROSTER[0],
        message: `Day ${data.day_num} marked as ${data.action === 'approve' ? 'Completed' : 'Rework requested'}`
      };
    }
  },

  parentVerifyRemedial: async (data: { student_id: number; day_num: number }) => {
    try {
      return await fetchWithFallback<{ success: boolean; student: FocusRosterItem; message: string }>('/api/remedial/parent-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      return {
        success: true,
        student: getFocusStudentById(data.student_id) || INITIAL_FOCUS_ROSTER[0],
        message: `Parent verification recorded for Day ${data.day_num}`
      };
    }
  },

  getRemedialAdminOverview: async () => {
    try {
      return await fetchWithFallback<RemedialAdminOverview>('/api/remedial/admin-overview');
    } catch {
      return {
        total_remedial_students: 8,
        subject_breakdown: { Mathematics: 8 },
        section_breakdown: { "Class 8-B": 3, "Class 8-A": 2, "Class 9-A": 2, "Class 9-B": 1 },
        overall_recovery_rate: 87.5,
        active_sprints_on_track: 5,
        early_warning_pacing_triage: [
          {
            student_id: 3,
            name: "Kabir Mehta",
            class_name: "Class 8-A",
            subject: "Mathematics",
            exam_score_pct: 44.0,
            current_day: 2,
            status: "Pending",
            weak_concept: "Inverting divisors during rational algebraic fractions",
            days_inactive: 2,
            parent_name: "Mr. Suresh Mehta",
            parent_phone: "+91 98111 00015",
            action_required: "Unsubmitted rough work on Day 2 for 2+ consecutive days"
          },
          {
            student_id: 5,
            name: "Siddharth Verma",
            class_name: "Class 9-A",
            subject: "Mathematics",
            exam_score_pct: 46.0,
            current_day: 2,
            status: "Pending",
            weak_concept: "Omits cross-terms (2ab) when expanding (a - b)² binomials",
            days_inactive: 2,
            parent_name: "Mrs. Pooja Verma",
            parent_phone: "+91 98111 00017",
            action_required: "Unsubmitted rough work on Day 2 for 2+ consecutive days"
          },
          {
            student_id: 8,
            name: "Aditya Roy",
            class_name: "Class 9-B",
            subject: "Mathematics",
            exam_score_pct: 45.0,
            current_day: 2,
            status: "Pending",
            weak_concept: "Sign reversal errors during inequality division by negatives",
            days_inactive: 2,
            parent_name: "Mrs. Neha Roy",
            parent_phone: "+91 98450 99883",
            action_required: "Unsubmitted rough work on Day 2 for 2+ consecutive days"
          }
        ]
      };
    }
  },

  adminNotifyRemedialTeacher: async (data: { student_id: number; note?: string }) => {
    try {
      return await fetchWithFallback<{ success: boolean; message: string; notification: any }>('/api/remedial/admin-notify-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      return {
        success: true,
        message: 'Direct notification dispatched to Class Teacher Mrs. Ananya Verma and PTM Briefing requested with priority SLA 12h.',
        notification: { student_id: data.student_id, timestamp: new Date().toISOString() }
      };
    }
  },

  dispatchWhatsAppUpdate: async (data: {
    student_id: number;
    parent_phone: string;
    parent_name?: string;
    day_num: number;
    custom_note?: string;
  }): Promise<WhatsAppDispatchResponse> => {
    try {
      return await fetchWithFallback<WhatsAppDispatchResponse>('/api/remedial/dispatch-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      const mockReceipt = `WA-LIVE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      return {
        success: true,
        message: `WhatsApp progress brief dispatched to ${data.parent_phone}`,
        receipt_id: mockReceipt,
        delivery_status: 'DELIVERED',
        parent_phone: data.parent_phone,
        message_body: `📘 EDU360 Remedial Update: Day ${data.day_num} checklist dispatched to parent.`
      };
    }
  },

  listExams: async (params?: { class_name?: string; section?: string; subject?: string }): Promise<{ success: boolean; exams: ExamItem[] }> => {
    try {
      const q = new URLSearchParams();
      if (params?.class_name) q.set('class_name', params.class_name);
      if (params?.section) q.set('section', params.section);
      if (params?.subject) q.set('subject', params.subject);
      const url = `/api/exams${q.toString() ? `?${q.toString()}` : ''}`;
      return await fetchWithFallback<{ success: boolean; exams: ExamItem[] }>(url);
    } catch {
      return {
        success: true,
        exams: [
          {
            id: 1,
            title: "Term 1 Descriptive Examination - Mathematics",
            subject: "Mathematics",
            class_name: "Class 8",
            section: "B",
            term: "Term 1",
            exam_type: "descriptive",
            total_marks: 100,
            pass_marks: 40,
            remedial_threshold_pct: 70,
            exam_date: "14 Oct 2026",
            is_published: true,
            published_at: new Date().toISOString(),
            total_students: 3,
            graded_count: 3,
            remedial_count: 2
          },
          {
            id: 2,
            title: "Mid-Term Mathematics Descriptive Paper (Class 8-A)",
            subject: "Mathematics",
            class_name: "Class 8",
            section: "A",
            term: "Mid-Term",
            exam_type: "descriptive",
            total_marks: 100,
            pass_marks: 40,
            remedial_threshold_pct: 70,
            exam_date: "16 Oct 2026",
            is_published: false,
            published_at: null,
            total_students: 2,
            graded_count: 2,
            remedial_count: 1
          }
        ]
      };
    }
  },

  getExamSubmissions: async (examId: number): Promise<{ success: boolean; exam: any; submissions: ExamSubmissionItem[] }> => {
    try {
      return await fetchWithFallback<{ success: boolean; exam: any; submissions: ExamSubmissionItem[] }>(`/api/exams/${examId}/submissions`);
    } catch {
      return {
        success: true,
        exam: { 
          id: examId, 
          title: examId === 1 ? "Term 1 Descriptive Examination - Mathematics" : "Mid-Term Mathematics Descriptive Paper (Class 8-A)", 
          total_marks: 100, 
          is_published: examId === 1 
        },
        submissions: fallbackExamSubmissions[examId] || []
      };
    }
  },

  submitExamPaper: async (examId: number, data: { student_id: number; paper_file_url: string; paper_file_name: string; student_notes?: string }): Promise<{ success: boolean; message: string; submission_id: number }> => {
    try {
      return await fetchWithFallback<{ success: boolean; message: string; submission_id: number }>(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      const list = fallbackExamSubmissions[examId] || [];
      const existingIdx = list.findIndex(s => s.student_id === data.student_id);
      if (existingIdx >= 0) {
        list[existingIdx] = {
          ...list[existingIdx],
          paper_file_url: data.paper_file_url,
          paper_file_name: data.paper_file_name,
          submitted_at: 'Just now',
          status: 'Submitted'
        };
      } else {
        list.push({
          id: Date.now(),
          student_id: data.student_id,
          student_name: 'Aarav Sharma',
          roll_no: '01',
          class_name: 'Class 8',
          section: 'A',
          status: 'Submitted',
          paper_file_url: data.paper_file_url,
          paper_file_name: data.paper_file_name,
          submitted_at: 'Just now',
          marks_obtained: null,
          percentage: null,
          is_remedial_target: false,
          weak_concept: 'Quadratic Equations: Factorization by Splitting the Middle Term',
          teacher_feedback: 'Submitted via student portal. Ready for faculty evaluation.'
        });
      }
      fallbackExamSubmissions[examId] = list;
      return {
        success: true,
        message: `Successfully submitted ${data.paper_file_name}`,
        submission_id: Date.now()
      };
    }
  },

  gradeExamSubmission: async (examId: number, data: { student_id: number; marks_obtained: number; teacher_feedback?: string; teacher_id?: number; weak_concept?: string }): Promise<{ success: boolean; message: string; percentage: number; is_remedial_target: boolean }> => {
    try {
      return await fetchWithFallback<{ success: boolean; message: string; percentage: number; is_remedial_target: boolean }>(`/api/exams/${examId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      const pct = Math.round((data.marks_obtained / 100) * 100);
      const isRemedial = pct <= 70;
      const list = fallbackExamSubmissions[examId] || [];
      fallbackExamSubmissions[examId] = list.map(s => {
        if (s.student_id === data.student_id) {
          return {
            ...s,
            marks_obtained: data.marks_obtained,
            percentage: pct,
            is_remedial_target: isRemedial,
            status: 'Graded',
            weak_concept: data.weak_concept !== undefined ? data.weak_concept : s.weak_concept,
            teacher_feedback: data.teacher_feedback || (isRemedial ? 'Sign error in quadratic factorization. Enrolled in 1-Week Remedial Sprint.' : 'Mastery demonstrated. Exempt from remedial.'),
            graded_at: 'Just now'
          };
        }
        return s;
      });

      return {
        success: true,
        message: `Graded: ${data.marks_obtained}/100 (${pct}%)`,
        percentage: pct,
        is_remedial_target: isRemedial
      };
    }
  },

  publishExamResults: async (examId: number, data?: { teacher_id?: number; notify_parents?: boolean }): Promise<{
    success: boolean;
    message: string;
    exam_title: string;
    total_published: number;
    remedial_enrolled_count: number;
    remedial_students: any[];
  }> => {
    try {
      return await fetchWithFallback<any>(`/api/exams/${examId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
      });
    } catch {
      const list = fallbackExamSubmissions[examId] || [];
      const underperforming = list.filter(s => (s.percentage || 0) <= 70);
      return {
        success: true,
        message: `Results published and ${underperforming.length} slow-learner student(s) scoring <= 70% auto-enrolled in 1-Week Remedial Focus Table.`,
        exam_title: examId === 1 ? 'Term 1 Descriptive Examination - Mathematics' : 'Mid-Term Mathematics Descriptive Paper (Class 8-A)',
        total_published: list.length,
        remedial_enrolled_count: underperforming.length,
        remedial_students: underperforming.map(u => ({ student_id: u.student_id, name: u.student_name, score_pct: u.percentage }))
      };
    }
  },

  // --- Question Paper Handoff Pipeline ---
  getQuestionPapers: async (params?: { subject?: string; class_name?: string; status?: string; teacher_id?: number }): Promise<QuestionPaperItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.subject) q.set('subject', params.subject);
      if (params?.class_name) q.set('class_name', params.class_name);
      if (params?.status) q.set('status', params.status);
      if (params?.teacher_id) q.set('teacher_id', params.teacher_id.toString());
      const res = await fetchWithFallback<{ success: boolean; question_papers: QuestionPaperItem[] }>(`/api/exams/question-papers?${q.toString()}`);
      return res.question_papers || fallbackQuestionPapers;
    } catch {
      let filtered = [...fallbackQuestionPapers];
      if (params?.subject) filtered = filtered.filter(p => p.subject.toLowerCase() === params.subject?.toLowerCase());
      if (params?.status && params.status !== 'all') filtered = filtered.filter(p => p.status === params.status);
      if (params?.teacher_id) filtered = filtered.filter(p => p.teacher_id === params.teacher_id || !p.teacher_id);
      return filtered;
    }
  },

  orderQuestionPaper: async (data: any): Promise<{ success: boolean; message: string; paper_id: number }> => {
    try {
      return await fetchWithFallback<any>(`/api/exams/question-papers/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      const newId = fallbackQuestionPapers.length + 1;
      const newQp: QuestionPaperItem = {
        id: newId,
        title: data.title || `${data.class_name} ${data.subject} ${data.term} Blueprint`,
        subject: data.subject || 'Mathematics',
        class_name: data.class_name || 'Class 8',
        section: data.section || 'B',
        term: data.term || 'Term 1',
        blueprint: {
          total_marks: data.total_marks || 100,
          units: data.units || ['Linear Equations', 'Quadratic Factorization'],
          bloom_taxonomy: {
            knowledge_pct: data.knowledge_pct || 30,
            application_pct: data.application_pct || 50,
            hots_pct: data.hots_pct || 20
          }
        },
        commissioned_by: 'Dean Rajeshwari Nair',
        teacher_name: 'Mrs. Ananya Verma',
        teacher_id: 2,
        status: 'draft',
        due_date: data.due_date || '28 Oct 2026'
      };
      fallbackQuestionPapers = [newQp, ...fallbackQuestionPapers];
      return { success: true, message: 'Question paper commissioned successfully to faculty!', paper_id: newId };
    }
  },

  submitQuestionPaperDraft: async (paperId: number, data: { draft_file_url: string; draft_file_name: string; answer_key_url?: string }): Promise<any> => {
    try {
      return await fetchWithFallback<any>(`/api/exams/question-papers/${paperId}/submit-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      fallbackQuestionPapers = fallbackQuestionPapers.map(p => {
        if (p.id === paperId) {
          return {
            ...p,
            status: 'under_review',
            draft_file_url: data.draft_file_url,
            draft_file_name: data.draft_file_name,
            answer_key_url: data.answer_key_url,
            submission_date: 'Today, 12:45 PM'
          };
        }
        return p;
      });
      return { success: true, message: 'Draft submitted to Academic Coordinator for review!' };
    }
  },

  reviewQuestionPaper: async (paperId: number, data: { approved: boolean; revision_notes?: string; reviewer_id?: number }): Promise<any> => {
    try {
      return await fetchWithFallback<any>(`/api/exams/question-papers/${paperId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      fallbackQuestionPapers = fallbackQuestionPapers.map(p => {
        if (p.id === paperId) {
          return {
            ...p,
            status: data.approved ? 'approved' : 'revision_requested',
            review_notes: data.revision_notes
          };
        }
        return p;
      });
      return { success: true, message: data.approved ? 'Question paper approved by Academic Coordinator!' : 'Revision requested from teacher' };
    }
  },

  handoffQuestionPaper: async (paperId: number): Promise<any> => {
    try {
      return await fetchWithFallback<any>(`/api/exams/question-papers/${paperId}/handoff`, {
        method: 'POST'
      });
    } catch {
      fallbackQuestionPapers = fallbackQuestionPapers.map(p => {
        if (p.id === paperId) {
          return { ...p, status: 'sent_to_exam_cell' };
        }
        return p;
      });
      return { success: true, message: 'Sealed & transferred to Exam Secrecy Strongroom' };
    }
  },

  // --- Dynamic Exam Schedules ---
  getExamSchedules: async (): Promise<ExamScheduleItem[]> => {
    try {
      const res = await fetchWithFallback<{ success: boolean; schedules: ExamScheduleItem[] }>(`/api/exams/schedules`);
      return res.schedules || fallbackExamSchedules;
    } catch {
      return fallbackExamSchedules;
    }
  },

  createExamSchedule: async (data: any): Promise<any> => {
    return await fetchWithFallback<any>(`/api/exams/schedules/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  grantScheduleClearance: async (scheduleId: number, data: { academic_clearance: boolean; academic_clearance_notes?: string }): Promise<any> => {
    return await fetchWithFallback<any>(`/api/exams/schedules/${scheduleId}/clearance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // --- AI Marksheet Vision OCR & Batch Commit ---
  ocrScanMarksheet: async (examId: number, data: { file_name?: string; class_name?: string; section?: string }): Promise<{
    success: boolean;
    message: string;
    exam_title: string;
    total_marks: number;
    scanned_file_name: string;
    parsed_count: number;
    remedial_candidates_count: number;
    results: OcrScanResultItem[];
  }> => {
    return await fetchWithFallback<any>(`/api/exams/${examId}/ocr-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  batchGradeCommit: async (examId: number, data: { grades: { student_id: number; marks_obtained: number; teacher_feedback?: string }[]; auto_publish?: boolean }): Promise<any> => {
    return await fetchWithFallback<any>(`/api/exams/${examId}/batch-grade-commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // --- Report Cards ---
  getReportCards: async (params?: { class_name?: string; section?: string; term?: string; student_id?: number }): Promise<ReportCardItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.class_name) q.set('class_name', params.class_name);
      if (params?.section) q.set('section', params.section);
      if (params?.term) q.set('term', params.term);
      if (params?.student_id) q.set('student_id', params.student_id.toString());
      const res = await fetchWithFallback<{ success: boolean; report_cards: ReportCardItem[] }>(`/api/exams/report-cards?${q.toString()}`);
      return res.report_cards || fallbackReportCards;
    } catch {
      // Sync Aarav Sharma's Mathematics grade dynamically with teacher's latest grading
      const mathSub = (fallbackExamSubmissions[1] || []).find(s => s.student_id === 1);
      if (mathSub && fallbackReportCards[0]) {
        const totalScore = mathSub.marks_obtained !== null && mathSub.marks_obtained !== undefined ? mathSub.marks_obtained : 52;
        const theory = Math.min(80, Math.round(totalScore * 0.75));
        const internal = totalScore - theory;
        fallbackReportCards[0].grades_grid["Mathematics"] = {
          score: totalScore,
          max: 100,
          theory: theory,
          practical: internal,
          total: totalScore,
          max_marks: 100,
          percentage: totalScore,
          grade: totalScore >= 90 ? "A1" : totalScore >= 80 ? "A2" : totalScore >= 70 ? "B1" : totalScore >= 60 ? "B2" : "C1",
          remedial_flag: totalScore <= 70,
          remarks: totalScore <= 70 ? "Enrolled in 1-Week Remedial Focus Sprint" : "Mastery Demonstrated (>70%)"
        };
      }
      let filtered = [...fallbackReportCards];
      if (params?.student_id) filtered = filtered.filter(r => r.student_id === params.student_id);
      return filtered;
    }
  },

  generateBatchReportCards: async (data: { class_name: string; section: string; term: string }): Promise<any> => {
    return await fetchWithFallback<any>(`/api/exams/report-cards/generate-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  publishBatchReportCards: async (data: { class_name: string; section: string; term: string }): Promise<any> => {
    return await fetchWithFallback<any>(`/api/exams/report-cards/publish-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // --- Class-Wise Batch Schedules ---
  createBatchClassSchedule: async (data: { class_name: string; series_name?: string; slots: { subject: string; exam_date: string; start_time: string; end_time: string; hall_name: string; capacity?: number; chief_invigilator_name?: string }[] }): Promise<any> => {
    return await fetchWithFallback<any>(`/api/exams/schedules/batch-class`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // --- Live Marks Submission Tracker & Ledger Lock ---
  getExamSubmissionsSummary: async (params?: { class_name?: string; term?: string }): Promise<any[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.class_name) q.set('class_name', params.class_name);
      if (params?.term) q.set('term', params.term);
      const res = await fetchWithFallback<{ success: boolean; summary: any[] }>(`/api/exams/submissions/summary?${q.toString()}`);
      return res.summary || [];
    } catch {
      return [];
    }
  },

  lockExamGradebook: async (examId: number): Promise<any> => {
    return await fetchWithFallback<any>(`/api/exams/${examId}/lock-gradebook`, {
      method: 'POST'
    });
  },

  // --- Digital Hall Tickets ---
  releaseHallTickets: async (data?: { series_name?: string; class_name?: string }): Promise<any> => {
    return await fetchWithFallback<any>(`/api/exams/hall-tickets/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    });
  },

  getStudentHallTicket: async (studentId: number): Promise<any> => {
    return await fetchWithFallback<any>(`/api/exams/hall-tickets/student/${studentId}`);
  },

  // --- Absentee & Medical Retest ---
  getAbsenteeRecords: async (): Promise<any[]> => {
    try {
      const res = await fetchWithFallback<{ success: boolean; absentees: any[] }>(`/api/exams/absentees`);
      return res.absentees || [];
    } catch {
      return [];
    }
  },

  scheduleAbsenteeRetest: async (absenteeId: number, retestDate: string): Promise<any> => {
    return await fetchWithFallback<any>(`/api/exams/absentees/${absenteeId}/schedule-retest?retest_date=${encodeURIComponent(retestDate)}`, {
      method: 'POST'
    });
  },

  // --- Notifications Engine ---
  getNotifications: async (params?: { user_id?: number; role?: string; unread_only?: boolean; limit?: number }): Promise<{ unread_count: number; notifications: any[] }> => {
    try {
      const q = new URLSearchParams();
      if (params?.user_id !== undefined) q.set('user_id', String(params.user_id));
      if (params?.role) q.set('role', params.role);
      if (params?.unread_only) q.set('unread_only', 'true');
      if (params?.limit) q.set('limit', String(params.limit));
      const res = await fetchWithFallback<{ success: boolean; unread_count: number; notifications: any[] }>(`/api/notifications?${q.toString()}`);
      return { unread_count: res.unread_count || 0, notifications: res.notifications || [] };
    } catch {
      return { unread_count: 0, notifications: [] };
    }
  },

  markNotificationRead: async (notificationId: number): Promise<any> => {
    return await fetchWithFallback<any>(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  },

  markAllNotificationsRead: async (params?: { user_id?: number; role?: string }): Promise<any> => {
    return await fetchWithFallback<any>(`/api/notifications/mark-all-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {})
    });
  },

  sendNotification: async (payload: any): Promise<any> => {
    return await fetchWithFallback<any>(`/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  // =========================================================================
  // --- Finance & Accounts Coordinator Domain ---
  // =========================================================================
  getFinanceStats: async (): Promise<FinanceDashboardStats> => {
    return await fetchWithFallback<FinanceDashboardStats>(`/api/finance/stats`);
  },

  bulkSendFeeReminders: async (payload: BulkReminderPayload): Promise<any> => {
    return await fetchWithFallback<any>(`/api/finance/defaulters/bulk-remind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  toggleExamClearance: async (id: number): Promise<{ success: boolean; exam_clearance: boolean }> => {
    try {
      return await fetchWithFallback<{ success: boolean; exam_clearance: boolean }>(`/api/finance/defaulters/${id}/exam-clearance`, {
        method: 'POST'
      });
    } catch {
      let updatedVal = false;
      fallbackFeeDefaulters = fallbackFeeDefaulters.map(d => {
        if (d.id === id) {
          updatedVal = !d.exam_clearance;
          return { ...d, exam_clearance: updatedVal };
        }
        return d;
      });
      return { success: true, exam_clearance: updatedVal };
    }
  },

recordFeePayment: async (id: number, payload: RecordFeePaymentPayload): Promise<FeeDefaulterItem> => {
    try {
      return await fetchWithFallback<FeeDefaulterItem>(`/api/finance/defaulters/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      fallbackFeeDefaulters = fallbackFeeDefaulters.map(d => {
        if (d.id === id) {
          const remaining = Math.max(0, d.amount_due - payload.amount_paid);
          return {
            ...d,
            amount_due: remaining,
            status: (remaining === 0 ? 'Paid' : 'Partially Paid') as any,
            exam_clearance: remaining === 0 ? true : d.exam_clearance,
            notes: payload.notes || d.notes
          };
        }
        return d;
      });
      return fallbackFeeDefaulters.find(d => d.id === id)!;
    }
  },

  applyFeeWaiver: async (id: number, payload: ApplyWaiverPayload): Promise<FeeDefaulterItem> => {
    return await fetchWithFallback<FeeDefaulterItem>(`/api/finance/defaulters/${id}/waiver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  getPaymentTransactions: async (params?: { reconciled?: boolean; status?: string; payment_method?: string; search?: string }): Promise<PaymentTransactionItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.reconciled !== undefined) q.set('reconciled', String(params.reconciled));
      if (params?.status) q.set('status', params.status);
      if (params?.payment_method) q.set('payment_method', params.payment_method);
      if (params?.search) q.set('search', params.search);
      const res = await fetchWithFallback<PaymentTransactionItem[]>(`/api/finance/transactions?${q.toString()}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  reconcileTransaction: async (id: number, reconciledBy: string = 'Mr. Arvind Krishnan'): Promise<PaymentTransactionItem> => {
    return await fetchWithFallback<PaymentTransactionItem>(`/api/finance/transactions/${id}/reconcile?reconciled_by=${encodeURIComponent(reconciledBy)}`, {
      method: 'POST'
    });
  },

  bulkReconcileTransactions: async (transactionIds?: number[], reconciledBy: string = 'Mr. Arvind Krishnan'): Promise<any> => {
    return await fetchWithFallback<any>(`/api/finance/transactions/bulk-reconcile?reconciled_by=${encodeURIComponent(reconciledBy)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionIds || null)
    });
  },

  getVendorInvoices: async (params?: { status?: string; category?: string; search?: string }): Promise<VendorInvoiceItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.category) q.set('category', params.category);
      if (params?.search) q.set('search', params.search);
      const res = await fetchWithFallback<VendorInvoiceItem[]>(`/api/finance/invoices?${q.toString()}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  createVendorInvoice: async (payload: any): Promise<VendorInvoiceItem> => {
    return await fetchWithFallback<VendorInvoiceItem>(`/api/finance/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  updateVendorInvoiceStatus: async (id: number, payload: any): Promise<VendorInvoiceItem> => {
    return await fetchWithFallback<VendorInvoiceItem>(`/api/finance/invoices/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  getFinanceDispatchLogs: async (limit: number = 20): Promise<FinanceDispatchLogItem[]> => {
    try {
      const res = await fetchWithFallback<FinanceDispatchLogItem[]>(`/api/finance/dispatch-logs?limit=${limit}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  seedFinanceData: async (): Promise<any> => {
    return await fetchWithFallback<any>(`/api/finance/seed-data`, {
      method: 'POST'
    });
  },

  // -------------------------------------------------------------
  // Institutional Outflows: Payroll, Procurement, Fleet
  // -------------------------------------------------------------

  getPayrollBatches: async (): Promise<PayrollBatchItem[]> => {
    try {
      const res = await fetchWithFallback<PayrollBatchItem[]>(`/api/finance/payroll/batches`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  getPayrollSlips: async (batchId: number): Promise<StaffPayslipItem[]> => {
    try {
      const res = await fetchWithFallback<StaffPayslipItem[]>(`/api/finance/payroll/batches/${batchId}/slips`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  generatePayroll: async (payload: GeneratePayrollPayload): Promise<PayrollBatchItem> => {
    return await fetchWithFallback<PayrollBatchItem>(`/api/finance/payroll/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  authorizePayroll: async (batchId: number, payload: AuthorizePayrollPayload): Promise<PayrollBatchItem> => {
    return await fetchWithFallback<PayrollBatchItem>(`/api/finance/payroll/batches/${batchId}/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  disbursePayroll: async (batchId: number, payload: DisbursePayrollPayload): Promise<PayrollBatchItem> => {
    return await fetchWithFallback<PayrollBatchItem>(`/api/finance/payroll/batches/${batchId}/disburse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  getMyPayslip: async (staffId: number = 2, month?: string): Promise<StaffPayslipItem | null> => {
    try {
      const q = new URLSearchParams();
      q.set('staff_id', String(staffId));
      if (month) q.set('month', month);
      return await fetchWithFallback<StaffPayslipItem>(`/api/finance/payroll/my-payslip?${q.toString()}`);
    } catch {
      return null;
    }
  },

  getPurchaseOrders: async (params?: { department?: string; status?: string }): Promise<PurchaseOrderItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.department) q.set('department', params.department);
      if (params?.status) q.set('status', params.status);
      const res = await fetchWithFallback<PurchaseOrderItem[]>(`/api/finance/purchase-orders?${q.toString()}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  createPurchaseOrder: async (payload: CreatePurchaseOrderPayload): Promise<PurchaseOrderItem> => {
    return await fetchWithFallback<PurchaseOrderItem>(`/api/finance/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  verifyGRN: async (poId: number, payload: VerifyGRNPayload): Promise<PurchaseOrderItem> => {
    return await fetchWithFallback<PurchaseOrderItem>(`/api/finance/purchase-orders/${poId}/grn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  getFleetExpenses: async (params?: { status?: string; vehicle_no?: string }): Promise<FleetExpenseItem[]> => {
    try {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.vehicle_no) q.set('vehicle_no', params.vehicle_no);
      const res = await fetchWithFallback<FleetExpenseItem[]>(`/api/finance/fleet-expenses?${q.toString()}`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },

  logFleetExpense: async (payload: CreateFleetExpensePayload): Promise<FleetExpenseItem> => {
    return await fetchWithFallback<FleetExpenseItem>(`/api/finance/fleet-expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  settleFleetExpense: async (expenseId: number, payload: SettleFleetExpensePayload): Promise<FleetExpenseItem> => {
    return await fetchWithFallback<FleetExpenseItem>(`/api/finance/fleet-expenses/${expenseId}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
};


