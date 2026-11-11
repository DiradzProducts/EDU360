with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add pendingExamEvaluationsCount calculation
old_list_def = "const [examSubmissionsList, setExamSubmissionsList] = useState<ExamSubmissionItem[]>([]);"
new_list_def = """const [examSubmissionsList, setExamSubmissionsList] = useState<ExamSubmissionItem[]>([]);
  const pendingExamEvaluationsCount = (examSubmissionsList && examSubmissionsList.length > 0)
    ? examSubmissionsList.filter(s => s.status === 'submitted' || s.status === 'pending' || s.marks_obtained === null || s.marks_obtained === undefined).length
    : 6;"""

if old_list_def in text:
    text = text.replace(old_list_def, new_list_def, 1)
    print("Added pendingExamEvaluationsCount calculation")
else:
    print("Warning: old_list_def not found")

# 2. Update profile block to show pending evaluations count
old_profile_badge = '<span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Mrs. Ananya Verma • 8-B</span>'
new_profile_badge = """<div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Mrs. Ananya Verma • 8-B</span>
                    {pendingExamEvaluationsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
                        {pendingExamEvaluationsCount} to grade
                      </span>
                    )}
                  </div>"""

if old_profile_badge in text:
    text = text.replace(old_profile_badge, new_profile_badge, 1)
    print("Updated profile block with pending evaluations count")
else:
    # Try normalized CRLF / LF match
    target_clean = old_profile_badge.replace('•', '?')
    if target_clean in text:
        text = text.replace(target_clean, new_profile_badge, 1)
        print("Updated profile block (escaped bullet)")
    else:
        print("Warning: old_profile_badge not found")

# 3. Update sidebar Exams & Gradebook menu badge
old_sidebar_badge = """                  {!sidebarCollapsed && (

                    <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-1.5 py-0.5 text-[9px] font-bold shrink-0">

                      Publish Hub

                    </span>

                  )}"""

new_sidebar_badge = """                  {!sidebarCollapsed && (
                    <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-black shrink-0 shadow-xs flex items-center gap-1 animate-pulse">
                      <span>{pendingExamEvaluationsCount}</span>
                      <span className="text-[8px] uppercase tracking-wider">Pending</span>
                    </span>
                  )}"""

if old_sidebar_badge in text:
    text = text.replace(old_sidebar_badge, new_sidebar_badge, 1)
    print("Updated sidebar Exams badge to pending numeric count")
else:
    import re
    m = re.search(r"\{!sidebarCollapsed && \(\s*<span className=\"rounded-full bg-blue-50.*?Publish Hub.*?</span>\s*\)\}", text, re.DOTALL)
    if m:
        text = text[:m.start()] + new_sidebar_badge + text[m.end():]
        print("Updated sidebar Exams badge via regex")
    else:
        print("Warning: sidebar badge not found")

# 4. Add Live Invigilation Cockpit button in sidebar sub-menu
old_submenu_end = """                    <button

                      type="button"

                      onClick={() => setExamSubTab('qp_desk')}

                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-all cursor-pointer ${

                        examSubTab === 'qp_desk'

                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-bold'

                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'

                      }`}

                    >

                      <div className="flex items-center gap-2 truncate">

                        <FileText className="h-3 w-3 shrink-0" />

                        <span className="truncate">Question Papers</span>

                      </div>

                      {teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length > 0 && (

                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>

                      )}

                    </button>

                  </div>"""

new_submenu_end = """                    <button

                      type="button"

                      onClick={() => setExamSubTab('qp_desk')}

                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-all cursor-pointer ${

                        examSubTab === 'qp_desk'

                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-bold'

                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'

                      }`}

                    >

                      <div className="flex items-center gap-2 truncate">

                        <FileText className="h-3 w-3 shrink-0" />

                        <span className="truncate">Question Papers</span>

                      </div>

                      {teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length > 0 && (

                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>

                      )}

                    </button>

                    <button
                      type="button"
                      onClick={() => setExamSubTab('live_cockpit')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-all cursor-pointer ${
                        examSubTab === 'live_cockpit'
                          ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Video className="h-3 w-3 shrink-0 text-violet-500" />
                        <span className="truncate">Live Invigilation</span>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                    </button>

                  </div>"""

if old_submenu_end in text:
    text = text.replace(old_submenu_end, new_submenu_end, 1)
    print("Added Live Invigilation to sidebar sub-menu")
else:
    print("Warning: old_submenu_end not found")

# 5. Update Invigilation Duty Order Card button to Enter Invigilator Cockpit
old_duty_btn = """                      <button

                        onClick={() => setActiveTab('duties')}

                        className="text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"

                      >

                        <span>Open Duty Center</span>

                        <ArrowRight className="h-3 w-3" />

                      </button>"""

new_duty_btn = """                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('exams_gradebook');
                          setExamSubTab('live_cockpit');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <Video className="h-3.5 w-3.5 text-rose-300 animate-pulse" />
                        <span>Enter Invigilator Cockpit</span>
                      </button>"""

if old_duty_btn in text:
    text = text.replace(old_duty_btn, new_duty_btn, 1)
    print("Updated Invigilation Duty Order button to Enter Invigilator Cockpit")
else:
    print("Warning: old_duty_btn not found")

# 6. Update Proctor Dossier button to Incident Sheet & Strikes
old_dossier_btn = """                                        <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                        <span>Proctor Dossier</span>"""

new_dossier_btn = """                                        <ShieldAlert className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                        <span>Incident Sheet &amp; Strikes</span>"""

if old_dossier_btn in text:
    text = text.replace(old_dossier_btn, new_dossier_btn, 1)
    print("Updated Proctor Dossier button label to Incident Sheet & Strikes")
else:
    print("Warning: old_dossier_btn not found")

with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Saved teacher/page.tsx!")
