with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update fallbackTeacherStudents Aarav Sharma
old_st = '{ id: 1, name: "Aarav Sharma", roll_no: "14", class_name: "Class 8-B", raw_class: "Class 8", section: "B", attendance_pct: 91.4, missed_classes_count: 3, academic_average_pct: 76.8, guardian_name: "Mr. Rajesh Sharma", guardian_phone: "+91 98450 12345", has_focus_table: true, focus_concept: "Quadratic Equations: Factorization & Signs", homework_status: "Submitted", last_active: "Today, 09:25 AM" },'

new_st = '''{ 
    id: 1, 
    name: "Aarav Sharma", 
    roll_no: "14", 
    class_name: "Class 8-B", 
    raw_class: "Class 8", 
    section: "B", 
    attendance_pct: 91.4, 
    missed_classes_count: 3, 
    academic_average_pct: 76.8, 
    guardian_name: "Mr. Rajesh Sharma", 
    guardian_phone: "+91 98450 12345", 
    has_focus_table: true, 
    focus_concept: "Quadratic Equations: Factorization & Signs", 
    homework_status: "Submitted", 
    last_active: "Today, 09:25 AM",
    is_on_leave: false,
    is_leave_pending: true,
    leave_status: 'Pending Approval',
    leave_reason: 'Orthodontic dental consultation and braces adjustment at Apollo Clinic.',
    is_medical_leave: true,
    leave_from_date: '16 Oct 2026',
    leave_to_date: '16 Oct 2026',
    today_attendance_status: 'Leave Pending',
    attendance_flag: 'PENDING_LEAVE'
  },'''

if old_st in code:
    code = code.replace(old_st, new_st, 1)
    print("SUCCESS: Updated Aarav in fallbackTeacherStudents")
else:
    print("WARNING: old_st not found")

# 2. Update reviewLeaveRequest in api.ts
old_review = '''  reviewLeaveRequest: async (requestId: number, status: 'Approved' | 'Rejected', notes?: string) => {
    try {
      return await fetchWithFallback<LeaveRequest>(`/api/teacher/leave-requests/${requestId}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, teacher_notes: notes })
      });
    } catch {
      fallbackLeaveRequests = fallbackLeaveRequests.map(lr => lr.id === requestId ? { ...lr, status, teacher_notes: notes } : lr);
      return fallbackLeaveRequests.find(lr => lr.id === requestId);
    }
  },'''

new_review = '''  reviewLeaveRequest: async (requestId: number, status: 'Approved' | 'Rejected', notes?: string) => {
    try {
      const res = await fetchWithFallback<LeaveRequest>(`/api/teacher/leave-requests/${requestId}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, teacher_notes: notes })
      });
      // Synchronize in-memory fallback state so offline and hybrid flows stay 100% synced
      fallbackLeaveRequests = fallbackLeaveRequests.map(lr => lr.id === requestId ? { ...lr, status, teacher_notes: notes, approval_stage: status === 'Approved' ? 'Attendance Adjusted' : 'Rejected by Teacher' } : lr);
      if (status === 'Approved') {
        const targetStudentId = fallbackLeaveRequests.find(lr => lr.id === requestId)?.student_id || 1;
        fallbackTeacherStudents = fallbackTeacherStudents.map(st => st.id === targetStudentId ? {
          ...st,
          is_on_leave: true,
          is_leave_pending: false,
          leave_status: 'Approved Leave',
          today_attendance_status: 'Excused Leave',
          attendance_flag: 'EXCUSED_LEAVE',
          last_active: 'On Approved Leave (Excused)'
        } : st);
        fallbackAttendance = fallbackAttendance.map(a => a.student_id === targetStudentId ? {
          ...a,
          status: 'Leave',
          teacher_override: true,
          join_timestamp: 'Excused Leave (Approved)'
        } : a);
      } else if (status === 'Rejected') {
        const targetStudentId = fallbackLeaveRequests.find(lr => lr.id === requestId)?.student_id || 1;
        fallbackTeacherStudents = fallbackTeacherStudents.map(st => st.id === targetStudentId ? {
          ...st,
          is_on_leave: false,
          is_leave_pending: false,
          leave_status: 'None',
          today_attendance_status: 'Absent',
          attendance_flag: 'ABSENT',
          last_active: 'Absent Today'
        } : st);
      }
      return res;
    } catch {
      fallbackLeaveRequests = fallbackLeaveRequests.map(lr => lr.id === requestId ? { ...lr, status, teacher_notes: notes, approval_stage: status === 'Approved' ? 'Attendance Adjusted' : 'Rejected by Teacher' } : lr);
      if (status === 'Approved') {
        const targetStudentId = fallbackLeaveRequests.find(lr => lr.id === requestId)?.student_id || 1;
        fallbackTeacherStudents = fallbackTeacherStudents.map(st => st.id === targetStudentId ? {
          ...st,
          is_on_leave: true,
          is_leave_pending: false,
          leave_status: 'Approved Leave',
          today_attendance_status: 'Excused Leave',
          attendance_flag: 'EXCUSED_LEAVE',
          last_active: 'On Approved Leave (Excused)'
        } : st);
        fallbackAttendance = fallbackAttendance.map(a => a.student_id === targetStudentId ? {
          ...a,
          status: 'Leave',
          teacher_override: true,
          join_timestamp: 'Excused Leave (Approved)'
        } : a);
      }
      return fallbackLeaveRequests.find(lr => lr.id === requestId);
    }
  },'''

if old_review in code:
    code = code.replace(old_review, new_review, 1)
    print("SUCCESS: Updated reviewLeaveRequest in api.ts")
else:
    print("WARNING: old_review not found")

# 3. Update applyStudentLeave in api.ts
old_apply = '''    return await fetchWithFallback<LeaveRequest>('/api/parent/leave-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });'''

new_apply = '''    try {
      const res = await fetchWithFallback<LeaveRequest>('/api/parent/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      // Synchronize fallback leave requests and teacher roster
      const newLr: LeaveRequest = {
        id: res.id || fallbackLeaveRequests.length + 1,
        student_id: data.student_id,
        student_name: data.student_name,
        parent_name: data.parent_name,
        from_date: data.from_date,
        to_date: data.to_date,
        reason: data.reason,
        status: 'Pending',
        is_medical: data.is_medical || false,
        attachment_name: data.attachment_name,
        attachment_url: data.attachment_url,
        approval_stage: 'Submitted - Pending Teacher Review',
        applied_at: new Date().toISOString()
      };
      fallbackLeaveRequests = [newLr, ...fallbackLeaveRequests];
      fallbackTeacherStudents = fallbackTeacherStudents.map(st => st.id === data.student_id ? {
        ...st,
        is_leave_pending: true,
        leave_status: 'Pending Approval',
        today_attendance_status: 'Leave Pending',
        attendance_flag: 'PENDING_LEAVE',
        leave_reason: data.reason,
        leave_from_date: data.from_date,
        leave_to_date: data.to_date,
        is_medical_leave: data.is_medical
      } : st);
      return res;
    } catch {
      const newLr: LeaveRequest = {
        id: fallbackLeaveRequests.length + 10,
        student_id: data.student_id,
        student_name: data.student_name,
        parent_name: data.parent_name,
        from_date: data.from_date,
        to_date: data.to_date,
        reason: data.reason,
        status: 'Pending',
        is_medical: data.is_medical || false,
        attachment_name: data.attachment_name,
        attachment_url: data.attachment_url,
        approval_stage: 'Submitted - Pending Teacher Review',
        applied_at: new Date().toISOString()
      };
      fallbackLeaveRequests = [newLr, ...fallbackLeaveRequests];
      fallbackTeacherStudents = fallbackTeacherStudents.map(st => st.id === data.student_id ? {
        ...st,
        is_leave_pending: true,
        leave_status: 'Pending Approval',
        today_attendance_status: 'Leave Pending',
        attendance_flag: 'PENDING_LEAVE',
        leave_reason: data.reason,
        leave_from_date: data.from_date,
        leave_to_date: data.to_date,
        is_medical_leave: data.is_medical
      } : st);
      fallbackNotifications = [
        {
          id: Date.now(),
          recipient_role: 'TEACHER',
          sender_name: data.parent_name,
          sender_role: 'PARENT',
          title: `New Leave Application: ${data.student_name}`,
          message: `Parent ${data.parent_name} submitted a leave request for ${data.student_name} (${data.from_date} to ${data.to_date}): "${data.reason}". Action required in Leave Approvals.`,
          notification_type: 'LEAVE_APPLICATION',
          priority: data.is_medical ? 'HIGH' : 'NORMAL',
          action_url: '/teacher?tab=leave_approvals',
          is_read: false,
          created_at: new Date().toISOString()
        },
        ...fallbackNotifications
      ];
      return newLr;
    }'''

if old_apply in code:
    code = code.replace(old_apply, new_apply, 1)
    print("SUCCESS: Updated applyStudentLeave in api.ts")
else:
    print("WARNING: old_apply not found")

with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
    f.write(code)
