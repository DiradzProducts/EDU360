# -*- coding: utf-8 -*-
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Invigilation Duty card to Today's Pending Tasks
old_tasks_top = """                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">

                        <AlertCircle className="h-4 w-4 text-amber-500" />

                        Today's Pending Tasks

                      </h3>

                    </div>



                    {/* Task Item 1: Homework */}"""

new_tasks_top = """                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">

                        <AlertCircle className="h-4 w-4 text-amber-500" />

                        Today's Pending Tasks

                      </h3>

                    </div>



                    {/* Priority Task: Official Exam Invigilation Duty */}
                    <div className="p-3.5 rounded-xl bg-violet-50/90 dark:bg-violet-950/40 border-2 border-violet-500/60 space-y-2 shadow-xs animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                          <Radio className="h-3 w-3 text-rose-500 animate-ping" />
                          <span>Official Invigilation Duty</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-200/80 dark:bg-violet-900 text-violet-900 dark:text-violet-200">
                          Class 8-B
                        </span>
                      </div>
                      <p className="text-xs text-slate-900 dark:text-white font-black">
                        Mathematics Midterm Examination &bull; Virtual Room Alpha
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Scheduled by Exam Coordinator. Candidate Hall Tickets issued. Launch Live Room to verify admit passes &amp; monitor YOLO edge proctoring.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('exams_gradebook');
                          setExamSubTab('live_cockpit');
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white py-2 text-xs font-black shadow-xs cursor-pointer transition-all active:scale-95"
                      >
                        <Video className="h-3.5 w-3.5 text-white" />
                        <span>Launch Live Proctor Classroom &nearr;</span>
                      </button>
                    </div>

                    {/* Task Item 1: Homework */}"""

if old_tasks_top in content:
    content = content.replace(old_tasks_top, new_tasks_top, 1)
    print("Step 1: Added Invigilation Duty card to Dashboard Pending Tasks.")
else:
    print("Step 1: old_tasks_top not found.")

# 2. Update Exams & Gradebook Header Buttons
old_header_buttons = """                <div className="flex flex-wrap items-center gap-2">

                  <button

                    type="button"

                    onClick={() => setExamSubTab('live_cockpit')}

                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${

                      examSubTab === 'live_cockpit'

                        ? 'bg-violet-600 text-white shadow-violet-600/20'

                        : 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 hover:bg-violet-100'

                    }`}

                  >

                    <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />

                    <span>Live AI Proctor Cockpit</span>

                  </button>

                  <button

                    type="button"

                    onClick={() => setShowScheduleExamModal(true)}

                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs"

                  >

                    <Plus className="h-3.5 w-3.5" />

                    <span>Schedule CBT Exam &amp; Paper</span>

                  </button>

                  <button

                    onClick={loadExams}

                    disabled={isLoadingExams}

                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 px-3 py-2 text-xs font-bold transition-colors cursor-pointer shadow-xs"

                  >

                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingExams ? 'animate-spin' : ''}`} />

                    <span>Refresh</span>

                  </button>

                </div>"""

new_header_buttons = """                <div className="flex flex-wrap items-center gap-2">

                  <button
                    type="button"
                    onClick={() => setExamSubTab('live_cockpit')}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                      examSubTab === 'live_cockpit'
                        ? 'bg-violet-600 text-white shadow-violet-600/20'
                        : 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 hover:bg-violet-100'
                    }`}
                  >
                    <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                    <span>Live AI Proctor Classroom</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamSubTab('marks_ledger')}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                      examSubTab === 'marks_ledger'
                        ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100'
                    }`}
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Evaluation Ledger</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamSubTab('qp_desk')}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                      examSubTab === 'qp_desk'
                        ? 'bg-blue-600 text-white shadow-blue-600/20'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>QP Blueprints</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadExams}
                    disabled={isLoadingExams}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 px-3 py-2 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingExams ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>

                </div>"""

if old_header_buttons in content:
    content = content.replace(old_header_buttons, new_header_buttons, 1)
    print("Step 2: Cleaned up Exams & Gradebook header buttons.")
else:
    print("Step 2: old_header_buttons not found.")

with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("teacher/page.tsx updated successfully.")
