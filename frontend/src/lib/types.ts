export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  school_code?: string;
  avatar?: string;
  phone?: string;
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

export interface AdminTask {
  id: number;
  title: string;
  category: 'urgent' | 'upcoming';
  due_date: string;
  assigned_to: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
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

export interface Homework {
  id: number;
  title: string;
  subject: string;
  class_name: string;
  description: string;
  due_date: string;
  teacher_id: number;
  teacher_name: string;
  max_marks: number;
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
  status: 'submitted' | 'graded' | 'pending';
  submitted_at: string;
  graded_at?: string;
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
  status: 'in_progress' | 'needs_parent_check' | 'mastered';
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
