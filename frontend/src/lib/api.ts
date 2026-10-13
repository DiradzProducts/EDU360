import {
  User, Student, OfficialDocument, TriageAlert, AdminTask, AdmissionEnquiry,
  EventItem, EventAssignment, VendorEquipment, ExitClearance,
  LiveClass, AttendanceRecord, Homework, HomeworkSubmission,
  FocusTable, LeaveRequest, FeeMilestone, BusRoute,
  StudentPortfolio, ClassRecording
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
  updated_at: new Date().toISOString()
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
  login: async (email: string, password: string, schoolCode?: string) => {
    return fetchWithFallback<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, school_code: schoolCode })
    }, {
      success: true,
      message: 'Login successful',
      user: {
        id: 1,
        name: email.includes('principal') ? 'Dr. Sunita Kapoor' : email.includes('ananya') ? 'Mrs. Ananya Verma' : email.includes('rajesh') ? 'Mr. Rajesh Sharma' : 'Aarav Sharma',
        email,
        role: email.includes('principal') ? 'admin' : email.includes('ananya') ? 'teacher' : email.includes('rajesh') ? 'parent' : 'student',
        school_code: schoolCode || 'EDU-GLOBAL-360'
      },
      portal_redirect: email.includes('principal') ? '/admin' : email.includes('ananya') ? '/teacher' : email.includes('rajesh') ? '/parent' : '/student'
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

  // Parent Endpoints
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
  }
};
