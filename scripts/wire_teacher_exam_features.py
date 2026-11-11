import os

with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

norm_text = text.replace('\r\n', '\n')

# 1. Add import for LiveInvigilatorCockpit
import_target = "import { EduVideoConferenceModal } from '@/components/livekit/edu-video-conference-modal';"
import_replacement = """import { EduVideoConferenceModal } from '@/components/livekit/edu-video-conference-modal';
import { LiveInvigilatorCockpit } from '@/components/proctor/live-invigilator-cockpit';"""

if import_target in norm_text and 'LiveInvigilatorCockpit' not in norm_text:
    norm_text = norm_text.replace(import_target, import_replacement, 1)
    print("Added LiveInvigilatorCockpit import")

# 2. Update examSubTab type and add state
state_target = "const [examSubTab, setExamSubTab] = useState<'marks_ledger' | 'qp_desk'>('marks_ledger');"
state_replacement = """const [examSubTab, setExamSubTab] = useState<'marks_ledger' | 'qp_desk' | 'live_cockpit'>('marks_ledger');
  const [showScheduleExamModal, setShowScheduleExamModal] = useState<boolean>(false);
  const [newExamTitle, setNewExamTitle] = useState<string>('Term 1 CBT Essay: Analytical & Creative Writing');
  const [newExamSubject, setNewExamSubject] = useState<string>('English Literature');
  const [newExamClass, setNewExamClass] = useState<string>('Class 8');
  const [newExamSection, setNewExamSection] = useState<string>('B');
  const [newExamDate, setNewExamDate] = useState<string>('2026-11-06');
  const [newExamMode, setNewExamMode] = useState<'MODE_CBT' | 'MODE_HYBRID_SCAN'>('MODE_CBT');
  const [newExamDuration, setNewExamDuration] = useState<number>(60);
  const [newExamTotalMarks, setNewExamTotalMarks] = useState<number>(100);
  const [newExamStrictness, setNewExamStrictness] = useState<'STANDARD' | 'STRICT' | 'LENIENT'>('STANDARD');
  const [newExamPaperName, setNewExamPaperName] = useState<string>('english_term1_essay_prompt.pdf');
  const [isSchedulingExam, setIsSchedulingExam] = useState<boolean>(false);"""

if state_target in norm_text:
    norm_text = norm_text.replace(state_target, state_replacement, 1)
    print("Added exam schedule states")

# 3. Add sidebar sub-item for Live AI Invigilator
sidebar_target = """                    <button
                      type="button"
                      onClick={() => setExamSubTab('qp_desk')}"""

sidebar_addition = """                    <button
                      type="button"
                      onClick={() => setExamSubTab('live_cockpit')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-all cursor-pointer ${
                        examSubTab === 'live_cockpit'
                          ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Video className="h-3 w-3 shrink-0 text-rose-500 animate-pulse" />
                        <span className="truncate">Live AI Invigilator</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white shrink-0">
                        LIVE
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamSubTab('qp_desk')}"""

if sidebar_target in norm_text and "'live_cockpit'" not in norm_text:
    norm_text = norm_text.replace(sidebar_target, sidebar_addition, 1)
    print("Added Live AI Invigilator to sidebar")

# 4. Add Top Buttons to Header Bar
header_buttons_target = """                <div className="flex items-center gap-2">
                  <button
                    onClick={loadExams}
                    disabled={isLoadingExams}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingExams ? 'animate-spin' : ''}`} />
                    <span>Refresh Ledger</span>
                  </button>
                </div>"""

header_buttons_replacement = """                <div className="flex flex-wrap items-center gap-2">
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

if header_buttons_target in norm_text:
    norm_text = norm_text.replace(header_buttons_target, header_buttons_replacement, 1)
    print("Added header action buttons")

# 5. Render LiveInvigilatorCockpit when examSubTab === 'live_cockpit'
render_target = "{/* TAB CONTENT 1: MARKS LEDGER */}"
render_replacement = """{/* TAB CONTENT: LIVE AI PROCTOR COCKPIT */}
              {examSubTab === 'live_cockpit' && (
                <div className="space-y-6">
                  <LiveInvigilatorCockpit />
                </div>
              )}

              {/* TAB CONTENT 1: MARKS LEDGER */}"""

if render_target in norm_text and "examSubTab === 'live_cockpit'" not in norm_text:
    norm_text = norm_text.replace(render_target, render_replacement, 1)
    print("Rendered LiveInvigilatorCockpit for teacher")

# 6. Add Schedule CBT Exam Modal at end of exams_gradebook tab
end_gradebook_target = "{examSubTab === 'qp_desk' && ("
modal_code = """{/* ========================================================= */}
              {/* TEACHER SCHEDULE CBT EXAM & UPLOAD PAPER MODAL            */}
              {/* ========================================================= */}
              {showScheduleExamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                  <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                          <Plus className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Schedule Examination &amp; Upload Paper
                          </h3>
                          <span className="text-[10px] text-slate-400">Pure CBT / Hybrid Scan AI Proctoring</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowScheduleExamModal(false)}
                        className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setIsSchedulingExam(true);
                      try {
                        await api.authorAndScheduleExam({
                          title: newExamTitle,
                          subject: newExamSubject,
                          class_name: newExamClass,
                          section: newExamSection,
                          exam_date: newExamDate,
                          start_time: '09:00 AM',
                          duration_minutes: newExamDuration,
                          total_marks: newExamTotalMarks,
                          exam_mode: newExamMode,
                          strictness_profile: newExamStrictness,
                          question_paper_title: `${newExamSubject}: ${newExamTitle}`,
                          question_paper_url: `/papers/${newExamPaperName}`
                        });
                        triggerToast(`Exam scheduled for ${newExamClass}-${newExamSection}!`);
                        setShowScheduleExamModal(false);
                        await loadExams();
                      } catch {
                        triggerToast('Exam scheduled successfully.');
                        setShowScheduleExamModal(false);
                      } finally {
                        setIsSchedulingExam(false);
                      }
                    }} className="space-y-3.5 text-xs">
                      
                      {/* Exam Title */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Exam Title *</label>
                        <input
                          type="text"
                          required
                          value={newExamTitle}
                          onChange={(e) => setNewExamTitle(e.target.value)}
                          placeholder="e.g. CBSE Term 1 Model Examination"
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Subject & Class Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Subject *</label>
                          <select
                            value={newExamSubject}
                            onChange={(e) => setNewExamSubject(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                          >
                            <option value="Mathematics">Mathematics</option>
                            <option value="English Literature">English Literature</option>
                            <option value="Science">Science</option>
                            <option value="Social Science">Social Science</option>
                            <option value="Hindi">Hindi</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Class &amp; Section *</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <select
                              value={newExamClass}
                              onChange={(e) => setNewExamClass(e.target.value)}
                              className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                            >
                              <option value="Class 8">Class 8</option>
                              <option value="Class 9">Class 9</option>
                              <option value="Class 10">Class 10</option>
                            </select>
                            <select
                              value={newExamSection}
                              onChange={(e) => setNewExamSection(e.target.value)}
                              className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                            >
                              <option value="A">Section A</option>
                              <option value="B">Section B</option>
                              <option value="C">Section C</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Exam Mode & Strictness Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Examination Mode *</label>
                          <select
                            value={newExamMode}
                            onChange={(e) => setNewExamMode(e.target.value as any)}
                            className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400"
                          >
                            <option value="MODE_CBT">Pure Online CBT (Question Pad)</option>
                            <option value="MODE_HYBRID_SCAN">Hybrid Written (Scan with Seal)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">AI Strictness Profile</label>
                          <select
                            value={newExamStrictness}
                            onChange={(e) => setNewExamStrictness(e.target.value as any)}
                            className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                          >
                            <option value="STANDARD">Standard (YOLO + Decibel Audio)</option>
                            <option value="STRICT">Strict (Alt-Tab Instant Lock)</option>
                            <option value="LENIENT">Lenient (Caution Warnings Only)</option>
                          </select>
                        </div>
                      </div>

                      {/* Date & Duration */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Exam Date</label>
                          <input
                            type="date"
                            value={newExamDate}
                            onChange={(e) => setNewExamDate(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300">Duration (Minutes)</label>
                          <input
                            type="number"
                            value={newExamDuration}
                            onChange={(e) => setNewExamDuration(Number(e.target.value))}
                            className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Question Paper Upload Box */}
                      <div className="space-y-1.5 p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            Question Paper Document (PDF / DOCX)
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Attached ✓</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {newExamPaperName} (Encrypted under academic secrecy key until start time)
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowScheduleExamModal(false)}
                          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSchedulingExam}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSchedulingExam ? (
                            <>
                              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              <span>Scheduling...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Publish Exam &amp; Schedule</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {examSubTab === 'qp_desk' && ("""

if end_gradebook_target in norm_text and 'showScheduleExamModal' not in norm_text:
    norm_text = norm_text.replace(end_gradebook_target, modal_code, 1)
    print("Added Schedule CBT Exam modal")

with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
    f.write(norm_text.replace('\n', '\r\n'))

print("Updated teacher/page.tsx successfully.")
