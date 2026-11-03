with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update rosterQuickFilter state type
old_filter_state = "const [rosterQuickFilter, setRosterQuickFilter] = useState<'ALL' | 'AT_RISK_ATTENDANCE' | 'FOCUS_TABLE_ACTIVE' | 'HAS_REMARKS'>('ALL');"
new_filter_state = "const [rosterQuickFilter, setRosterQuickFilter] = useState<'ALL' | 'AT_RISK_ATTENDANCE' | 'FOCUS_TABLE_ACTIVE' | 'HAS_REMARKS' | 'ON_LEAVE'>('ALL');"

if old_filter_state in code:
    code = code.replace(old_filter_state, new_filter_state, 1)
    print("SUCCESS: Updated rosterQuickFilter state type")
else:
    print("WARNING: old_filter_state not found")

# 2. Update handleReviewLeave
old_handle_review = '''  const handleReviewLeave = async (id: number, status: 'Approved' | 'Rejected') => {
    await api.reviewLeaveRequest(id, status, `Reviewed and ${status.toLowerCase()} by Class Teacher Mrs. Ananya Verma`);
    const updated = await api.getLeaveRequests();
    setLeaveRequests(updated);
    triggerToast(`Student leave request #${id} marked as ${status}`);
  };'''

new_handle_review = '''  const handleReviewLeave = async (id: number, status: 'Approved' | 'Rejected') => {
    await api.reviewLeaveRequest(id, status, `Reviewed and ${status.toLowerCase()} by Class Teacher Mrs. Ananya Verma`);
    const [updatedLeaves, updatedStudents, updatedAttendance] = await Promise.all([
      api.getLeaveRequests(),
      api.getTeacherStudents(),
      api.getAttendanceRoster(1)
    ]);
    if (updatedLeaves) setLeaveRequests(updatedLeaves);
    if (updatedStudents) setStudents(updatedStudents);
    if (updatedAttendance) setAttendance(updatedAttendance);
    triggerToast(
      status === 'Approved'
        ? `✓ Leave request #${id} Approved! Student attendance updated to 'Excused Leave' in SIS roster.`
        : `Student leave request #${id} marked as Rejected.`
    );
  };'''

if old_handle_review in code:
    code = code.replace(old_handle_review, new_handle_review, 1)
    print("SUCCESS: Updated handleReviewLeave in teacher/page.tsx")
else:
    print("WARNING: old_handle_review not found")

# 3. Add pendingLeaves banner before activeTab === 'dashboard'
old_tab_start = '''        {/* ===================================================== */}
        {/* TAB 0: TEACHER DASHBOARD (EXECUTIVE OVERVIEW & PULSE) */}
        {/* ===================================================== */}
        {activeTab === 'dashboard' && ('''

new_tab_start = '''        {/* REAL-TIME PENDING LEAVE APPLICATION NOTIFICATION BANNER */}
        {pendingLeaves > 0 && activeTab !== 'leave_approvals' && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-300 dark:border-amber-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    Parent Leave Application Alert
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                    {pendingLeaves} Action Required
                  </span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                  Parents submitted leave requests awaiting class teacher review. Approving will automatically sync attendance to &lsquo;Excused Leave&rsquo;.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('leave_approvals')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <span>Review Leave Queue ({pendingLeaves})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 0: TEACHER DASHBOARD (EXECUTIVE OVERVIEW & PULSE) */}
        {/* ===================================================== */}
        {activeTab === 'dashboard' && ('''

if old_tab_start in code:
    code = code.replace(old_tab_start, new_tab_start, 1)
    print("SUCCESS: Added pendingLeaves banner to teacher/page.tsx")
else:
    print("WARNING: old_tab_start not found")

# 4. In activeTab === 'roster', update cohort counts and filter logic
old_cohort_counts = '''            const cohortAtRiskCount = currentCohortStudents.filter(st => st.attendance_pct < 85).length;
            const cohortFocusCount = currentCohortStudents.filter(st => st.has_focus_table).length;
            const cohortRemarksCount = currentCohortStudents.reduce((acc, st) => acc + getRemarksForStudent(st.id).length, 0);'''

new_cohort_counts = '''            const cohortAtRiskCount = currentCohortStudents.filter(st => st.attendance_pct < 85).length;
            const cohortFocusCount = currentCohortStudents.filter(st => st.has_focus_table).length;
            const cohortRemarksCount = currentCohortStudents.reduce((acc, st) => acc + getRemarksForStudent(st.id).length, 0);
            const cohortOnLeaveCount = currentCohortStudents.filter(st => st.is_on_leave || st.is_leave_pending || st.today_attendance_status === 'Excused Leave' || st.today_attendance_status === 'Leave Pending').length;'''

if old_cohort_counts in code:
    code = code.replace(old_cohort_counts, new_cohort_counts, 1)
    print("SUCCESS: Updated cohort counts in roster view")
else:
    print("WARNING: old_cohort_counts not found")

old_roster_filter = '''              if (rosterQuickFilter === 'AT_RISK_ATTENDANCE') return s.attendance_pct < 85;
              if (rosterQuickFilter === 'FOCUS_TABLE_ACTIVE') return s.has_focus_table;
              if (rosterQuickFilter === 'HAS_REMARKS') {
                const rems = getRemarksForStudent(s.id);
                return rems.length > 0;
              }
              return true;'''

new_roster_filter = '''              if (rosterQuickFilter === 'AT_RISK_ATTENDANCE') return s.attendance_pct < 85;
              if (rosterQuickFilter === 'FOCUS_TABLE_ACTIVE') return s.has_focus_table;
              if (rosterQuickFilter === 'ON_LEAVE') {
                return Boolean(s.is_on_leave || s.is_leave_pending || s.today_attendance_status === 'Excused Leave' || s.today_attendance_status === 'Leave Pending');
              }
              if (rosterQuickFilter === 'HAS_REMARKS') {
                const rems = getRemarksForStudent(s.id);
                return rems.length > 0;
              }
              return true;'''

if old_roster_filter in code:
    code = code.replace(old_roster_filter, new_roster_filter, 1)
    print("SUCCESS: Updated roster filter logic")
else:
    print("WARNING: old_roster_filter not found")

# 5. Add ON_LEAVE filter chip
old_filter_chips = '''                      <button
                        type="button"
                        onClick={() => setRosterQuickFilter('HAS_REMARKS')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          rosterQuickFilter === 'HAS_REMARKS'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                        }`}
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Has Remarks</span>
                      </button>'''

new_filter_chips = '''                      <button
                        type="button"
                        onClick={() => setRosterQuickFilter('ON_LEAVE')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          rosterQuickFilter === 'ON_LEAVE'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 hover:bg-purple-100'
                        }`}
                      >
                        <CalendarCheck className="h-3 w-3" />
                        <span>On Leave / Pending ({cohortOnLeaveCount})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRosterQuickFilter('HAS_REMARKS')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          rosterQuickFilter === 'HAS_REMARKS'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                        }`}
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Has Remarks</span>
                      </button>'''

if old_filter_chips in code:
    code = code.replace(old_filter_chips, new_filter_chips, 1)
    print("SUCCESS: Added ON_LEAVE filter chip")
else:
    print("WARNING: old_filter_chips not found")

# 6. Update student row in table view (name & attendance column)
old_student_name_td = '''                                        <div className="flex items-center gap-1.5">
                                          <Link 
                                            href={`/teacher/students/${st.id}`}
                                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                          >
                                            {st.name}
                                          </Link>
                                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                            {st.class_name}
                                          </span>
                                        </div>'''

new_student_name_td = '''                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <Link 
                                            href={`/teacher/students/${st.id}`}
                                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                          >
                                            {st.name}
                                          </Link>
                                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                            {st.class_name}
                                          </span>
                                          {st.is_on_leave && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.2 rounded border border-purple-200 dark:border-purple-800">
                                              <CalendarCheck className="h-2.5 w-2.5" />
                                              Excused Leave
                                            </span>
                                          )}
                                          {st.is_leave_pending && !st.is_on_leave && (
                                            <button
                                              type="button"
                                              onClick={() => setActiveTab('leave_approvals')}
                                              className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800 animate-pulse hover:underline cursor-pointer"
                                            >
                                              <Clock className="h-2.5 w-2.5" />
                                              Leave Pending &rarr;
                                            </button>
                                          )}
                                        </div>'''

if old_student_name_td in code:
    code = code.replace(old_student_name_td, new_student_name_td, 1)
    print("SUCCESS: Updated student name cell with leave badges")
else:
    print("WARNING: old_student_name_td not found")

# 7. Update Attendance Pulse column in Table View
old_att_pulse = '''                                  {/* Attendance Pulse & Missed Classes */}
                                  <td className="py-3.5 px-4 min-w-[190px]">
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className={`font-black text-xs ${
                                          st.attendance_pct >= 90 ? 'text-emerald-600' : isAttRisk ? 'text-rose-600' : 'text-amber-600'
                                        }`}>
                                          {st.attendance_pct}%
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                          {missedCount} Missed Classes
                                        </span>
                                      </div>

                                      {/* Progress Bar */}
                                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${
                                            st.attendance_pct >= 90 ? 'bg-emerald-500' : isAttRisk ? 'bg-rose-500' : 'bg-amber-500'
                                          }`} 
                                          style={{ width: `${Math.min(100, st.attendance_pct)}%` }}
                                        />
                                      </div>

                                      {isAttRisk ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-900/60">
                                          <AlertTriangle className="h-3 w-3 shrink-0" />
                                          <span>Chronic Absence Alert (<85%)</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-slate-400">
                                          Last active: {st.last_active}
                                        </span>
                                      )}
                                    </div>
                                  </td>'''

new_att_pulse = '''                                  {/* Attendance Pulse & Missed Classes */}
                                  <td className="py-3.5 px-4 min-w-[190px]">
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className={`font-black text-xs ${
                                          st.is_on_leave ? 'text-purple-600' : st.attendance_pct >= 90 ? 'text-emerald-600' : isAttRisk ? 'text-rose-600' : 'text-amber-600'
                                        }`}>
                                          {st.attendance_pct}%
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                          {st.is_on_leave ? 'Excused Absence' : `${missedCount} Missed Classes`}
                                        </span>
                                      </div>

                                      {/* Progress Bar */}
                                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${
                                            st.is_on_leave ? 'bg-purple-500' : st.attendance_pct >= 90 ? 'bg-emerald-500' : isAttRisk ? 'bg-rose-500' : 'bg-amber-500'
                                          }`} 
                                          style={{ width: `${Math.min(100, st.attendance_pct)}%` }}
                                        />
                                      </div>

                                      {st.is_on_leave ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-200 dark:border-purple-900/60">
                                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                                          <span>Absent - Approved Leave ({st.leave_from_date || 'Today'})</span>
                                        </span>
                                      ) : st.is_leave_pending ? (
                                        <button
                                          type="button"
                                          onClick={() => setActiveTab('leave_approvals')}
                                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-300 hover:underline cursor-pointer text-left"
                                        >
                                          <Clock className="h-3 w-3 shrink-0" />
                                          <span>Leave Pending Review &rarr;</span>
                                        </button>
                                      ) : isAttRisk ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-900/60">
                                          <AlertTriangle className="h-3 w-3 shrink-0" />
                                          <span>Chronic Absence Alert (<85%)</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-slate-400">
                                          Last active: {st.last_active}
                                        </span>
                                      )}
                                    </div>
                                  </td>'''

if old_att_pulse in code:
    code = code.replace(old_att_pulse, new_att_pulse, 1)
    print("SUCCESS: Updated Attendance Pulse column in table view")
else:
    print("WARNING: old_att_pulse not found")

# 8. Update Cards view
old_card_badges = '''                            {st.has_focus_table && (
                              <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[9px] font-bold">
                                Focus Active
                              </span>
                            )}'''

new_card_badges = '''                            <div className="flex items-center gap-1 flex-wrap">
                              {st.is_on_leave && (
                                <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 px-2 py-0.5 text-[9px] font-bold">
                                  Excused Leave
                                </span>
                              )}
                              {st.is_leave_pending && !st.is_on_leave && (
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('leave_approvals')}
                                  className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[9px] font-bold hover:underline cursor-pointer"
                                >
                                  Leave Pending
                                </button>
                              )}
                              {st.has_focus_table && (
                                <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[9px] font-bold">
                                  Focus Active
                                </span>
                              )}
                            </div>'''

if old_card_badges in code:
    code = code.replace(old_card_badges, new_card_badges, 1)
    print("SUCCESS: Updated card badges in roster view")
else:
    print("WARNING: old_card_badges not found")

with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
