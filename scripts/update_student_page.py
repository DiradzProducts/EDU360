import re

with open('frontend/src/app/student/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Active Online Test Card
old_card = """                    {/* Active Online Test Card */}
                    <div className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                            Live CBT Examination Portal
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                          {studentExamSchedules.length > 0 
                            ? `Active Online Test: ${studentExamSchedules[0].title}`
                            : 'Active Online Test: Mathematics Quiz (20 mins, 15 MCQs)'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {studentExamSchedules.length > 0
                            ? `Subject: ${studentExamSchedules[0].subject} • Hall: ${studentExamSchedules[0].hall_name || 'Virtual Room'} • ${studentExamSchedules[0].exam_date} (${studentExamSchedules[0].start_time} - ${studentExamSchedules[0].end_time})`
                            : 'Topic: Quadratic Equations & Polynomials • Window closes at 05:00 PM'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const active = studentExamSchedules[0];
                          const prompt = active?.question_paper_title
                            ? `Official CBSE Timetable Exam: ${active.title}. Blueprint Reference: ${active.question_paper_title}. Step-wise analytical reasoning required.`
                            : undefined;
                          handleLaunchExam(
                            active?.subject || 'Mathematics',
                            active?.title || 'Quadratic Equations & Polynomials CBT Test',
                            20,
                            prompt,
                            25
                          );
                        }}
                        className="shrink-0 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Start Test</span>
                      </button>
                    </div>"""

new_card = """                    {/* Active Online Test Card */}
                    <div className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                            {studentExamSchedules[0]?.exam_mode === 'MODE_HYBRID_SCAN'
                              ? '📝 Hybrid Scan & Upload Examination'
                              : studentExamSchedules[0]?.exam_mode === 'MODE_OFFLINE'
                              ? '🏢 Physical Hall Examination'
                              : '💻 Live CBT Examination Portal'}
                          </span>
                          {studentExamSchedules.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {studentExamSchedules[0].exam_mode === 'MODE_HYBRID_SCAN' ? 'Hybrid OCR' : studentExamSchedules[0].exam_mode || 'MODE_CBT'}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                          {studentExamSchedules.length > 0 
                            ? `Active Test: ${studentExamSchedules[0].title}`
                            : 'Active Online Test: Mathematics Quiz (20 mins, 15 MCQs)'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {studentExamSchedules.length > 0
                            ? `Subject: ${studentExamSchedules[0].subject} • Hall: ${studentExamSchedules[0].hall_name || 'Virtual Room'} • ${studentExamSchedules[0].exam_date} (${studentExamSchedules[0].start_time} - ${studentExamSchedules[0].end_time}) • Chief Invigilator: ${studentExamSchedules[0].chief_invigilator_name || 'Assigned Faculty'}`
                            : 'Topic: Quadratic Equations & Polynomials • Window closes at 05:00 PM'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const active = studentExamSchedules[0];
                          if (active?.exam_mode === 'MODE_HYBRID_SCAN') {
                            setExamSubTab('results');
                            toast.info(`Opening Descriptive Submission Drawer for ${active.title}`);
                            return;
                          }
                          const prompt = active?.question_paper_title
                            ? `Official CBSE Timetable Exam: ${active.title}. Blueprint Reference: ${active.question_paper_title}. Step-wise analytical reasoning required.`
                            : undefined;
                          handleLaunchExam(
                            active?.subject || 'Mathematics',
                            active?.title || 'Online CBT Assessment',
                            20,
                            prompt,
                            25
                          );
                        }}
                        className="shrink-0 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>{studentExamSchedules[0]?.exam_mode === 'MODE_HYBRID_SCAN' ? 'Submit Paper Scan' : 'Start Test'}</span>
                      </button>
                    </div>"""

if old_card in text:
    text = text.replace(old_card, new_card, 1)
    print("Updated Active Online Test card")
else:
    print("Warning: old_card not found directly")

# 2. Update datesheet table body to be dynamic
old_tbody = """                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {[
                            { date: '19 Oct 2026 (Mon)', time: '09:30 AM – 12:30 PM', code: '041', subject: 'Mathematics (Theory)', room: 'Hall B, Desk #A-14', format: '100 Marks Descriptive', required: 'Verified ✓' },
                            { date: '21 Oct 2026 (Wed)', time: '09:30 AM – 12:30 PM', code: '086', subject: 'Science (Physics, Chem, Bio)', room: 'Hall B, Desk #A-14', format: 'Theory & Practical Lab', required: 'Verified ✓' },
                            { date: '23 Oct 2026 (Fri)', time: '09:30 AM – 12:30 PM', code: '184', subject: 'English Language & Literature', room: 'Hall B, Desk #A-14', format: 'Descriptive & Drama Essay', required: 'Verified ✓' },
                            { date: '26 Oct 2026 (Mon)', time: '09:30 AM – 12:30 PM', code: '087', subject: 'Social Science (Hist/Civ/Geo)', room: 'Hall B, Desk #A-14', format: 'Theory & Map Pointing', required: 'Verified ✓' },
                            { date: '28 Oct 2026 (Wed)', time: '09:30 AM – 12:30 PM', code: '085', subject: 'Second Language (Hindi)', room: 'Hall B, Desk #A-14', format: 'Grammar & Long Essay', required: 'Verified ✓' },
                          ].map((row, idx) => ("""

new_tbody = """                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(studentExamSchedules.length > 0
                            ? studentExamSchedules.map((s, idx) => ({
                                date: s.exam_date,
                                time: `${s.start_time} – ${s.end_time}`,
                                code: `SUB-${101 + idx}`,
                                subject: s.title || `${s.subject} Examination`,
                                room: s.hall_name || 'Virtual Room A',
                                format: s.exam_mode === 'MODE_HYBRID_SCAN' ? '📝 Descriptive & Scan' : s.exam_mode === 'MODE_OFFLINE' ? '🏢 Physical Offline Hall' : '💻 CBT Online Test',
                                required: 'Verified ✓',
                                mode: s.exam_mode || 'MODE_CBT'
                              }))
                            : [
                                { date: '19 Oct 2026 (Mon)', time: '09:30 AM – 12:30 PM', code: '041', subject: 'Mathematics (Theory)', room: 'Hall B, Desk #A-14', format: '100 Marks Descriptive', required: 'Verified ✓', mode: 'MODE_OFFLINE' },
                                { date: '21 Oct 2026 (Wed)', time: '09:30 AM – 12:30 PM', code: '086', subject: 'Science (Physics, Chem, Bio)', room: 'Hall B, Desk #A-14', format: 'Theory & Practical Lab', required: 'Verified ✓', mode: 'MODE_OFFLINE' },
                                { date: '23 Oct 2026 (Fri)', time: '09:30 AM – 12:30 PM', code: '184', subject: 'English Language & Literature', room: 'Hall B, Desk #A-14', format: 'Descriptive & Drama Essay', required: 'Verified ✓', mode: 'MODE_OFFLINE' },
                                { date: '26 Oct 2026 (Mon)', time: '09:30 AM – 12:30 PM', code: '087', subject: 'Social Science (Hist/Civ/Geo)', room: 'Hall B, Desk #A-14', format: 'Theory & Map Pointing', required: 'Verified ✓', mode: 'MODE_OFFLINE' },
                                { date: '28 Oct 2026 (Wed)', time: '09:30 AM – 12:30 PM', code: '085', subject: 'Second Language (Hindi)', room: 'Hall B, Desk #A-14', format: 'Grammar & Long Essay', required: 'Verified ✓', mode: 'MODE_OFFLINE' },
                              ]
                          ).map((row, idx) => ("""

if old_tbody in text:
    text = text.replace(old_tbody, new_tbody, 1)
    print("Updated datesheet table body to dynamic")
else:
    print("Warning: old_tbody not found directly")

with open('frontend/src/app/student/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Saved student/page.tsx!")
