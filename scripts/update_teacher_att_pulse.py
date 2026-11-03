with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

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
                                          <span>Chronic Absence Alert (&lt;85%)</span>
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
                                          <span>Chronic Absence Alert (&lt;85%)</span>
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
    with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("SUCCESS: Updated Attendance Pulse in teacher/page.tsx")
else:
    print("WARNING: old_att_pulse not matched")
