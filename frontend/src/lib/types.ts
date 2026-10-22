export type InstitutionalRole = 
  | 'admin'
  | 'academic_coordinator'
  | 'exam_coordinator'
  | 'transport_coordinator'
  | 'inventory_coordinator'
  | 'admissions_coordinator'
  | 'accounts_coordinator'
  | 'teacher'
  | 'parent'
  | 'student';

export type UserRole = InstitutionalRole;

export type TaskDomain = 
  | 'academic'
  | 'exam'
  | 'transport'
  | 'inventory'
  | 'admissions'
  | 'finance'
  | 'executive'
  | 'campus_ops';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type AdminTaskStatus = 'Pending' | 'In Progress' | 'Pending Review' | 'Completed';

export interface OperationalTask {
  id: number;
  title: string;
  description?: string;
  category?: 'urgent' | 'upcoming' | string;
  domain?: TaskDomain | string;
  due_date: string;
  assigned_to: string;
  assigned_to_role?: string;
  created_by_name?: string;
  created_by_role?: string;
  status: AdminTaskStatus | string;
  priority: TaskPriority | string;
  sla_hours?: number;
  is_auto_generated?: boolean;
  trigger_event?: string;
  is_escalated?: boolean;
  escalation_reason?: string;
  completion_proof_url?: string;
  relief_requested?: boolean;
  relief_reason?: string;
  relief_justification?: string;
  suggested_peer_teacher?: string;
  task_type?: string;
  created_at?: string;
  updated_at?: string;
}

export type AdminTask = OperationalTask;

export interface TaskReliefRequest {
  relief_reason: 'Medical Leave' | 'Academic Workload Surge' | 'Family Emergency' | string;
  justification: string;
  suggested_peer_teacher?: string;
}

export interface ApproveReliefRequest {
  new_assigned_to: string;
  new_sla_hours?: number;
  notes?: string;
}

export interface ExtendSlaRequest {
  additional_hours: number;
  extension_reason: string;
}

export interface PTMGovernanceStatus {
  active_event_title: string;
  event_date: string;
  time_window: string;
  slot_duration_mins: number;
  total_teachers: number;
  published_teachers_count: number;
  readiness_percentage: number;
  unready_teachers: string[];
  focus_students_requiring_brief: number;
}

export interface PTMEventCreate {
  title: string;
  academic_term?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  slot_duration_mins?: number;
  target_classes: string[];
  meeting_format?: string;
}

export interface PTMEventResponse {
  id: number;
  title: string;
  academic_term: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  slot_duration_mins: number;
  target_classes: string[];
  status: string;
  created_by_name: string;
  created_at?: string;
}

export interface DepartmentTaskStat {
  domain: string;
  label: string;
  total_tasks: number;
  open_tasks: number;
  completed_tasks: number;
  completion_rate_pct: number;
}

export interface TaskExecutiveCockpitResponse {
  total_open: number;
  critical_escalations: number;
  overdue_count: number;
  auto_generated_count: number;
  department_stats: DepartmentTaskStat[];
  recent_tasks: OperationalTask[];
}

export interface User {
  id: number;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  school_code?: string;
  avatar?: string;
  phone?: string;
  grade_tier?: 'k5' | 'secondary' | string;
  is_junior_k5?: boolean;
  student_id?: number;
}

export interface SchoolVerification {
  valid: boolean;
  school_name: string;
  code: string;
  campus_city: string;
  affiliation: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  portal_redirect: string;
  grade_tier?: 'k5' | 'secondary' | string;
  is_junior_k5?: boolean;
  student_id?: number;
}

// --- Junior Gamification Interfaces (K-5 Junior Explorer) ---
export interface GamificationProfile {
  id: number;
  student_id: number;
  level: number;
  level_title: string;
  xp_points: number;
  total_stars: number;
  attendance_streak_days: number;
  sound_effects_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DailyQuest {
  id: number;
  student_id: number;
  title: string;
  subject: string;
  xp_reward: number;
  stars_reward: number;
  status: 'active' | 'submitted' | 'completed';
  teacher_reaction: string;
  proof_image_url?: string | null;
  due_date: string;
  created_at?: string;
}

export interface MagicBoosterChest {
  id: number;
  student_id: number;
  concept_title: string;
  day_number: number;
  day_task_title: string;
  status: 'completed_claimed' | 'ready_to_open' | 'locked';
  chest_stars: number;
  parent_signed: boolean;
  created_at?: string;
}

export interface ChestCelebration {
  trigger: string;
  badge: string;
  sound_effect: string;
  animation: string;
  dialog_title: string;
  dialog_message: string;
}

export interface ChestUnlockResponse {
  success: boolean;
  message: string;
  chest_id: number;
  status: string;
  awarded_stars: number;
  awarded_xp: number;
  total_stars: number;
  xp_points: number;
  level: number;
  level_title: string;
  level_up: boolean;
  celebration: ChestCelebration;
}

export interface AdventureTimetableItem {
  id: number;
  time: string;
  title: string;
  subject: string;
  island_theme: string;
  mascot_at_node: boolean;
  icon: string;
  duration_mins: number;
  teacher_name: string;
  room: string;
  completed: boolean;
  period_number?: number;
  time_slot?: string;
  room_or_link?: string;
}

export interface JuniorBusRadar {
  route_no: string;
  driver_name: string;
  driver_phone: string;
  eta_mins: number;
  stops_away: number;
  current_coords: { lat: number; lng: number };
  is_moving: boolean;
  vehicle_no: string;
  current_stop_name: string;
  next_stop_name: string;
  bus_mascot_icon: string;
  status_badge: string;
}

export interface JuniorDashboardOverview {
  student_id: number;
  student_name: string;
  class_name: string;
  grade_tier: string;
  avatar_character_url?: string;
  profile: GamificationProfile;
  active_quests: DailyQuest[];
  magic_booster_chests: MagicBoosterChest[];
  attendance_streak_days: number;
  attendance_pct: number;
  bus_route_id?: number;
}


export interface Student {
  id: number;
  user_id?: number;
  name: string;
  roll_no: string;
  class_name: string;
  section: string;
  admission_no: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  attendance_pct: number;
  bus_route_id?: number;
  academic_average_pct: number;
  status: string;
}

export interface OfficialDocument {
  id: number;
  student_id: number;
  title: string;
  doc_type: string;
  file_url: string;
  is_official: boolean;
  uploaded_by_role: string;
  upload_date: string;
  status: string;
  verified_stamp: string;
}

export interface TriageAlert {
  id: number;
  level: 'red' | 'orange' | 'green';
  category: string;
  title: string;
  description: string;
  count_affected: number;
  action_label: string;
  action_endpoint: string;
  resolved: boolean;
  resolution_note?: string;
  created_at: string;
}


export interface AdmissionEnquiry {
  id: number;
  student_name: string;
  parent_name: string;
  email: string;
  phone: string;
  target_grade: string;
  stage: 'new' | 'followup' | 'visit' | 'converted';
  chat_transcript?: string;
  notes?: string;
  created_at: string;
}

export interface EventItem {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  banner_url?: string;
  status: string;
}

export interface EventAssignment {
  id: number;
  event_id: number;
  staff_id: number;
  staff_name: string;
  committee_role: string;
  student_volunteers?: string;
}

export interface VendorEquipment {
  id: number;
  event_id: number;
  equipment_name: string;
  vendor_name: string;
  vendor_phone: string;
  status: 'Ordered' | 'Delivered' | 'Returned';
  handover_timestamp?: string;
  returned_timestamp?: string;
  notes?: string;
}

export interface ExitClearance {
  id: number;
  student_id: number;
  student_name: string;
  class_name: string;
  fee_cleared: boolean;
  library_cleared: boolean;
  inventory_cleared: boolean;
  tc_ready: boolean;
  digital_parent_approved: boolean;
  digital_approval_timestamp?: string;
  physical_scan_url?: string;
  physical_sign_verified: boolean;
  status: string;
}

export interface LiveClass {
  id: number;
  title: string;
  subject: string;
  class_name: string;
  teacher_id: number;
  teacher_name: string;
  scheduled_time: string;
  duration_mins: number;
  status: 'upcoming' | 'live' | 'completed';
  meet_url?: string;
}

export interface AttendanceRecord {
  id: number;
  class_id?: number;
  student_id: number;
  student_name: string;
  join_timestamp?: string;
  minutes_late: number;
  status: 'Present' | 'Late' | 'Absent' | 'Leave';
  teacher_override: boolean;
  date: string;
}

export type TaskType = 'DAILY_HOMEWORK' | 'ASSIGNMENT';
export type TaskStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'BACKLOG';

export interface Homework {
  id: number;
  title: string;
  subject: string;
  class_name: string;
  description: string;
  task_type: TaskType;
  due_date: string;
  due_time: string;
  status: TaskStatus;
  teacher_id: number;
  teacher_name: string;
  max_marks: number;
  assigned_date?: string;
  resource_url?: string;
  weightage?: string;
  progress_pct?: number;
  late_submission?: boolean;
  backlogEvidenceCode?: string;
  isOverdue?: boolean;
}

export interface HomeworkSubmission {
  id: number;
  homework_id: number;
  student_id: number;
  student_name: string;
  original_file_url: string;
  annotated_file_url?: string;
  annotations_json?: string;
  marks_obtained?: number;
  teacher_remarks?: string;
  status: 'submitted' | 'graded' | 'pending' | 'backlog';
  submitted_at: string;
  graded_at?: string;
  late_submission?: boolean;
  is_backlog?: boolean;
}

export interface BacklogEvent {
  id: number;
  student_id: number;
  homework_id: number;
  focus_table_id?: number;
  evidence_code: string;
  subject: string;
  title: string;
  task_type: TaskType;
  due_date: string;
  due_time: string;
  status: 'UNRESOLVED' | 'LATE_SUBMITTED' | 'RESOLVED';
  detected_at: string;
  resolved_at?: string;
  late_submission?: boolean;
  teacher_name?: string;
  notes?: string;
}

export interface AcademicCompliance {
  student_id: number;
  student_name: string;
  total_assigned: number;
  on_time_submissions: number;
  late_submissions: number;
  backlog_count: number;
  compliance_pct: number;
  itemized_backlogs: BacklogEvent[];
}

export interface RevisionDay {
  day: string;
  focus: string;
  exercise: string;
  parent_checklist: string;
  status: string;
}

export interface FocusTable {
  id: number;
  student_id: number;
  student_name: string;
  subject: string;
  weak_concept: string;
  current_score_pct: number;
  target_score_pct: number;
  revision_plan_json: string;
  teacher_action: string;
  parent_check_completed: boolean;
  status: 'in_progress' | 'needs_parent_check' | 'mastered' | 'pending_approval' | 'approved' | 'not_enrolled';
  backlog_count?: number;
  academic_compliance_json?: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: number;
  student_id: number;
  student_name: string;
  parent_name: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  teacher_notes?: string;
  applied_at: string;
}

export interface FeeMilestone {
  id: number;
  student_id: number;
  title: string;
  amount: number;
  due_date: string;
  status: 'Paid' | 'Overdue' | 'Upcoming';
  receipt_no?: string;
  paid_at?: string;
  payment_method?: string;
}

export interface BusStop {
  name: string;
  time: string;
  status: string;
}

export interface BusRoute {
  id: number;
  route_number: string;
  driver_name: string;
  driver_phone: string;
  vehicle_no: string;
  stops_json: string;
  current_stop_idx: number;
  live_status: string;
  eta_mins: number;
}

export interface StudentPortfolio {
  id: number;
  student_id: number;
  category: 'participation' | 'achievement';
  title: string;
  event_name: string;
  date: string;
  proof_url?: string;
  verified_by_school: boolean;
  description?: string;
}

export interface ClassRecording {
  id: number;
  title: string;
  subject: string;
  chapter: string;
  teacher_name: string;
  duration: string;
  video_url: string;
  thumbnail?: string;
  thumbnail_url?: string;
  date: string;
  date_recorded?: string;
}

export interface StaffMemberItem {
  id: number;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  status: 'Present' | 'On Leave' | 'Short Permission';
  assigned_duties: string;
  salary: number;
  qualification?: string;
}

export interface TeacherPermissionRequest {
  id: number;
  teacher_id: number;
  teacher_name: string;
  type: 'Casual Leave' | 'Medical Leave' | 'Late Arrival' | 'Early Departure' | 'On-Duty Movement';
  date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  applied_at: string;
}

export interface InventoryRecord {
  id: number;
  name: string;
  category: 'Books' | 'Lab Equipment' | 'Sports Gear' | 'IT Hardware' | 'Classroom';
  total_stock: number;
  issued_count: number;
  damaged_count: number;
  reorder_level: number;
  location: string;
  last_audited: string;
}

export interface FeeDefaulter {
  id: number;
  student_id?: number | null;
  student_name: string;
  class_name: string;
  roll_no?: string | null;
  parent_name: string;
  parent_phone: string;
  milestone_title: string;
  amount_due: number;
  days_overdue: number;
  reminder_sent: boolean;
  reminder_count?: number;
  last_reminder_at?: string | null;
  waiver_amount?: number;
  waiver_reason?: string | null;
  waiver_approved_by?: string | null;
  waiver_approved_at?: string | null;
  payment_history_json?: string | null;
  notes?: string | null;
  status?: 'Overdue' | 'Partially Paid' | 'Paid' | 'Waived';
  created_at?: string;
  updated_at?: string | null;
}

export interface TeacherScheduleItem {
  period: number;
  time: string;
  subject: string;
  class_name: string;
  room: string;
  status: 'Completed' | 'Live Now' | 'Upcoming';
  is_live?: boolean;
}

export interface TeacherDutyItem {
  id: number;
  event_title: string;
  role: string;
  date: string;
  venue: string;
  student_volunteers: string[];
  assigned_by: string;
  progress_pct: number;
  key_deliverables: string;
}

export interface TeacherStudentRosterItem {
  id: number;
  name: string;
  roll_no: string;
  class_name: string;
  attendance_pct: number;
  academic_average_pct: number;
  guardian_name: string;
  guardian_phone: string;
  has_focus_table: boolean;
  homework_status: 'Submitted' | 'Pending' | 'Graded';
  last_active: string;
}

// --- New Admin Modules & Modern ERP Features ---
export interface SubstitutionSlot {
  id: number;
  absent_teacher_id: number;
  absent_teacher_name: string;
  absent_reason: string;
  reason?: string;
  date: string;
  period_number: number;
  time_slot: string;
  class_name: string;
  subject: string;
  substitute_teacher_id?: number | null;
  substitute_teacher_name?: string | null;
  assigned_substitute_name?: string | null;
  suggested_proxy_id?: number | null;
  status: 'Unassigned' | 'Assigned' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
}

export interface AvailableFacultyItem {
  id: number;
  name: string;
  department: string;
  free_periods_today: number;
  free_periods?: number[];
  is_subject_match: boolean;
  current_status: string;
  assigned_substitutions_today?: number;
}

export interface SecurityAuditLog {
  id: number;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  actor?: string;
  action_type: string;
  action?: string;
  target_entity: string;
  entity?: string;
  ip_address: string;
  status: 'VERIFIED' | 'FLAGGED' | 'SUCCESS';
  details: string;
  category?: string;
  hash_seal?: string;
}

export interface FeeAgingSummary {
  days_0_to_15: number;
  days_16_to_30: number;
  days_over_30: number;
}

export interface FeeFinancialAnalytics {
  total_target: number;
  total_collected: number;
  total_overdue: number;
  collection_rate_pct: number;
  aging_summary: FeeAgingSummary;
  defaulters_count: number;
  reminders_dispatched_today: number;
  active_milestone_title: string;
  milestone_deadline: string;
  academic_year?: string;
}

export interface AcademicRolloverClass {
  class_id: number;
  from_class: string;
  to_class: string;
  total_students: number;
  eligible_for_promotion: number;
  retention_review: number;
  tc_requested: number;
  status: 'Pending Review' | 'Ready to Roll' | 'Rolled Over';
  target_class_teacher?: string;
}

// ========================================================
// TEACHER COCKPIT, DUTY TASK CENTER & DUAL-MODE HUB TYPES
// ========================================================

// 1. Teacher Personal Timetable & Chronological Schedule
export type PeriodActivityType = 
  | 'TEACHING_SESSION' 
  | 'LAB_SESSION' 
  | 'EXAM_INVIGILATION' 
  | 'SUBSTITUTION_COVER' 
  | 'FREE_PREP_PERIOD'
  | 'HOMEROOM_MENTORSHIP';

export interface TeacherPersonalScheduleItem {
  id: string;
  period_number: number;
  start_time: string;           // e.g. "09:00 AM"
  end_time: string;             // e.g. "09:45 AM"
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  activity_type: PeriodActivityType;
  class_grade?: string;         // e.g. "Grade 8"
  section?: string;             // e.g. "B"
  subject_name?: string;        // e.g. "Mathematics"
  room_number: string;          // e.g. "Room 204" or "Physics Lab"
  is_current_active_period: boolean;
  notes?: string;               // e.g. "Chapter 4 Quadratic Equations test review"
}

// 2. Faculty Duties & Operational Tasks Center
export type FacultyDutyCategory = 
  | 'EXAM_INVIGILATION' 
  | 'PAPER_CORRECTION' 
  | 'EVENT_COMMITTEE' 
  | 'CAMPUS_SUBSTITUTION'
  | 'WEEKLY_ROUTINE';

export interface FacultyDutyTask {
  id: string;
  teacher_id: string;
  category: FacultyDutyCategory;
  title: string;                // e.g. "Term 1 Class 10 Board Mock Invigilation"
  sub_category?: string;        // e.g. "Annual Day - Stage & Sound Committee"
  event_or_exam_name: string;   // e.g. "Midterm Exams 2026" / "Annual Day 2026"
  scheduled_date: string;
  time_window: string;          // e.g. "10:00 AM - 01:00 PM"
  location_or_venue: string;    // e.g. "Examination Hall B (Seats 45-90)"
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  priority: 'CRITICAL' | 'NORMAL';
  is_weekly?: boolean;
  day_of_week?: string;
  frequency?: 'DAILY' | 'WEEKLY' | 'ONE_TIME';
  // Specific to Exam Invigilation:
  seat_range?: string;          // e.g. "Seats 45 - 90"
  student_count?: number;       // e.g. 45
  // Specific to Paper Correction:
  papers_assigned?: number;     // e.g. 45
  papers_completed?: number;    // e.g. 30
  submission_deadline?: string;
  // Specific to Committee / Operational Tasks:
  assigned_by: string;          // e.g. "Vice Principal / Admin"
  action_checklist?: { item: string; completed: boolean }[];
}

// 3. Dual-Mode Parental Connection & Notes
export type InteractionScope = 'HOMEROOM_CLASS' | 'SUBJECT_SPECIFIC';

export interface ParentTeacherNote {
  id: string;
  interaction_scope: InteractionScope;
  student_id: number;
  student_name: string;
  student_class: string;        // e.g. "8-B"
  parent_id: string;
  parent_name: string;
  parent_phone: string;
  teacher_id: string;
  teacher_name: string;
  subject_id?: string;
  subject_name?: string;        // e.g. "Mathematics"
  homeroom_teacher_id: string;  // Auto-CC'd for audit transparency
  note_type: 'ACADEMIC_CONCERN' | 'APPRECIATION' | 'BEHAVIORAL' | 'PTM_FOLLOWUP';
  content: string;
  created_at: string;
  is_focus_table_evidence: boolean;
  focus_concept_tag?: string;   // e.g. "Algebraic Fractions"
}

// 4. Strict 10-Minute Sliding PTM Scheduler Engine
export interface PTMEventConfig {
  id: string;
  title: string;                // "Post-Midterm Parent-Teacher Conference"
  event_date: string;
  school_start_time: string;    // "09:00"
  school_end_time: string;      // "15:30"
  slot_duration_mins: number;   // 10 minutes
  buffer_mins: number;          // 2 minutes
  blackout_windows: {
    start: string;              // "13:00"
    end: string;                // "13:45"
    title: string;              // "Faculty Lunch Break"
  }[];
}

export interface PTMSlot {
  id: string;
  event_id: string;
  teacher_id: string;
  start_time: string;           // "10:20 AM"
  end_time: string;             // "10:30 AM"
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BREAK';
  interaction_scope: InteractionScope;
  booked_student_id?: number;
  booked_student_name?: string;
  booked_class?: string;
  booked_parent_id?: string;
  booked_parent_name?: string;
  subject_name?: string;
  locked_by_class?: string;     // e.g. "Class 7-A Parent"
  is_sibling_combo?: boolean;   // true for 20-min double slot
  sibling_student_id?: number;
  sibling_student_name?: string;
  meeting_url?: string;
  focus_table_agenda?: string[];
}

export interface CurriculumPacingItem {
  id: number;
  class_name: string;
  subject: string;
  teacher_name: string;
  completed_units: number;
  total_units: number;
  calendar_target_units: number;
  completion_pct: number;
  status: string;
  last_lesson_title: string;
  next_milestone_date: string;
}

export interface AIParentStudyGuidanceRequest {
  student_id: number;
  subject_name?: string;
  current_exam_score?: number | string;
  diagnosed_misconception?: string;
  active_day?: string;
}

export interface AIParentStudyGuidanceResponse {
  plain_english_translation: string;
  tonight_action: string;
  child_motivation_tip: string;
  suggested_teacher_question: string;
  has_backlog?: boolean;
  backlog_count?: number;
  source?: 'gemini' | 'fallback';
  model_used?: string;
}

export interface RemedialEarlyWarning {
  student_id: number;
  name: string;
  class_name: string;
  subject: string;
  exam_score_pct: number;
  current_day: number;
  status: string;
  weak_concept: string;
  days_inactive: number;
  parent_name: string;
  parent_phone: string;
  action_required: string;
}

export interface RemedialAdminOverview {
  total_remedial_students: number;
  subject_breakdown: Record<string, number>;
  section_breakdown: Record<string, number>;
  overall_recovery_rate: number;
  active_sprints_on_track: number;
  early_warning_pacing_triage: RemedialEarlyWarning[];
}

export interface VisualFormulaCard {
  title: string;
  rule: string;
  explanation: string;
  visual_steps: string[];
}

export interface SocraticHintResponse {
  success: boolean;
  hint: string;
  guiding_question: string;
  source: string;
  attempt_count?: number;
  formula_card?: VisualFormulaCard;
  flagged_for_teacher?: boolean;
  escalation_message?: string;
}

export interface PreVerifyResponse {
  success: boolean;
  ai_status: 'passed' | 'needs_attention';
  confidence: number;
  ai_rubric_match: string;
  recommendation: string;
  verified_at: string;
}

export interface ExamItem {
  id: number;
  title: string;
  subject: string;
  class_name: string;
  section: string;
  term: string;
  exam_type: string;
  total_marks: number;
  pass_marks: number;
  remedial_threshold_pct: number;
  exam_date: string;
  is_published: boolean;
  published_at: string | null;
  total_students: number;
  graded_count: number;
  remedial_count: number;
}

export interface ExamSubmissionItem {
  id: number;
  student_id: number;
  student_name: string;
  roll_no: string;
  class_name: string;
  section: string;
  status: string;
  paper_file_url?: string;
  paper_file_name?: string;
  submitted_at?: string | null;
  marks_obtained?: number | null;
  percentage?: number | null;
  is_remedial_target?: boolean;
  teacher_feedback?: string | null;
  graded_at?: string | null;
}

export interface WhatsAppDispatchResponse {
  success: boolean;
  message: string;
  receipt_id: string;
  delivery_status: string;
  parent_phone: string;
  message_body: string;
}

export interface QuestionPaperItem {
  id: number;
  title: string;
  exam_name?: string;
  subject: string;
  class_name: string;
  section: string;
  term: string;
  blueprint: {
    total_marks?: number;
    units?: string[];
    bloom_taxonomy?: {
      knowledge_pct?: number;
      application_pct?: number;
      hots_pct?: number;
    };
    duration_minutes?: number;
    calculator_allowed?: boolean;
  };
  total_marks?: number;
  duration_minutes?: number;
  draft_file_url?: string;
  draft_file_name?: string;
  answer_key_url?: string;
  status: 'draft' | 'under_review' | 'revision_requested' | 'approved' | 'sent_to_exam_cell';
  revision_notes?: string;
  review_notes?: string;
  due_date?: string;
  created_by_teacher_id: number;
  created_by_teacher_name?: string;
  teacher_name?: string;
  reviewed_by_academic_id?: number;
  handed_over_at?: string | null;
  created_at?: string;
}

export interface ExamScheduleItem {
  id: number;
  exam_id?: number | null;
  title: string;
  exam_name?: string;
  subject: string;
  class_name: string;
  section?: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  hall_name: string;
  room_hall?: string;
  capacity?: number;
  chief_invigilator_name?: string;
  invigilator_name?: string;
  academic_clearance: boolean;
  academic_clearance_notes?: string;
}

export interface OcrScanResultItem {
  student_id: number;
  roll_no: string;
  student_name: string;
  admission_no: string;
  class_section: string;
  marks_obtained: number;
  max_marks: number;
  percentage: number;
  confidence: number;
  confidence_level: 'High' | 'Review Required';
  is_remedial_target: boolean;
  pedagogical_remarks: string;
}

export interface ReportCardGradeDetail {
  score: number;
  max: number;
  grade: string;
  remedial_flag: boolean;
  remarks: string;
}

export interface ReportCardItem {
  id: number;
  student_id: number;
  student_name: string;
  roll_no: string;
  class_name: string;
  section: string;
  term: string;
  academic_year: string;
  grades_grid: Record<string, ReportCardGradeDetail>;
  total_marks_obtained: number;
  max_total_marks: number;
  overall_percentage: number;
  overall_grade: string;
  attendance_pct: number;
  ai_teacher_narrative?: string;
  is_moderated: boolean;
  is_published: boolean;
  published_at?: string | null;
}

export interface NotificationItem {
  id: number;
  recipient_user_id?: number | null;
  recipient_role?: string | null;
  sender_name: string;
  sender_role: string;
  title: string;
  message: string;
  notification_type: string;
  priority: 'LOW' | 'NORMAL' | 'URGENT';
  action_url?: string | null;
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
}

// =========================================================================
// FINANCE & ACCOUNTS COORDINATOR TYPES
// =========================================================================

export interface FeePaymentRecord {
  date: string;
  amount: number;
  method: string;
  utr_or_cheque: string;
  received_by?: string;
  notes?: string;
}

export type FeeDefaulterItem = FeeDefaulter;

export interface VendorInvoiceItem {
  id: number;
  invoice_no: string;
  vendor_name: string;
  vendor_category?: string;
  invoice_for: string;
  amount: number;
  invoice_date: string;
  due_date?: string;
  status: 'Pending Approval' | 'Audit Clearance Needed' | 'Approved for Wire' | 'Paid' | 'Rejected';
  authorized_by?: string | null;
  authorized_at?: string | null;
  payment_utr?: string | null;
  paid_at?: string | null;
  payment_mode?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface PaymentTransactionItem {
  id: number;
  utr_number: string;
  student_name: string;
  class_name: string;
  parent_name: string;
  amount: number;
  payment_method: string;
  bank_name?: string | null;
  milestone_title: string;
  status: 'Success' | 'Failed' | 'Pending' | 'Refunded';
  transaction_date: string;
  reconciled: boolean;
  reconciled_at?: string | null;
  reconciled_by?: string | null;
  gateway_ref?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface FinanceDispatchLogItem {
  id: number;
  dispatch_type: string;
  dispatch_scope?: string | null;
  target_count: number;
  total_amount_targeted: number;
  dispatch_note?: string | null;
  dispatched_by: string;
  created_at: string;
}

export interface FinanceDashboardStats {
  total_collected_mtd: number;
  outstanding_arrears: number;
  pending_reconciliation_count: number;
  pending_reconciliation_amount: number;
  pending_vendor_invoices_count: number;
  pending_vendor_invoices_amount: number;
  overdue_students_count: number;
  overdue_tier_15: number;
  overdue_tier_30: number;
  overdue_tier_60: number;
  collection_target_progress_pct: number;
}

export interface ApplyWaiverPayload {
  waiver_amount: number;
  reason: string;
  approved_by?: string;
}

export interface RecordFeePaymentPayload {
  amount_paid: number;
  payment_method: string;
  utr_or_cheque_no?: string;
  notes?: string;
  received_by?: string;
}

export interface BulkReminderPayload {
  student_ids?: number[];
  aging_tier?: string;
  channel: string;
  custom_message?: string;
}


