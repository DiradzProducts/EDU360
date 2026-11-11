import re

with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add new state hooks for Question Paper and Invigilator 1-on-1 talk
target_states = """  const [yoloPersonCount, setYoloPersonCount] = useState<number>(1);
  const [yoloGazeStatus, setYoloGazeStatus] = useState<string>('Centered on Desk');
  const [isPenalized, setIsPenalized] = useState<boolean>(false);"""

repl_states = """  const [yoloPersonCount, setYoloPersonCount] = useState<number>(1);
  const [yoloGazeStatus, setYoloGazeStatus] = useState<string>('Centered on Desk');
  const [isPenalized, setIsPenalized] = useState<boolean>(false);

  // Question Paper Data & Section Navigation
  const [questionPaperData, setQuestionPaperData] = useState<any>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('ALL');
  const [qpZoomLevel, setQpZoomLevel] = useState<'normal' | 'large'>('normal');

  // Chief Invigilator 1-on-1 Intercom & Popping State
  const [isInvigilatorIntercomActive, setIsInvigilatorIntercomActive] = useState<boolean>(false);
  const [invigilatorIntercomMessage, setInvigilatorIntercomMessage] = useState<string>('');
  const [isStudentMicUnmuted, setIsStudentMicUnmuted] = useState<boolean>(false);"""

if target_states in text:
    text = text.replace(target_states, repl_states, 1)
    print("Added Question Paper & Invigilator state hooks")

# 2. Add question paper fetch on mount
target_qp_fetch = """    if (!isOpen) return;
    setRulesStage('rules');
    setHasAgreedRules(false)"""

repl_qp_fetch = """    if (!isOpen) return;
    setRulesStage('rules');
    setHasAgreedRules(false);

    // Fetch official CBSE Question Paper from Secrecy Vault
    api.getQuestionPaperDetails(1).then(res => {
      if (res && res.sections) {
        setQuestionPaperData(res);
      }
    }).catch(console.error);"""

if target_qp_fetch in text:
    text = text.replace(target_qp_fetch, repl_qp_fetch, 1)
    print("Added Question Paper fetch on mount")

# 3. Enhance BroadcastChannel listener to support TALK_ONE_ON_ONE and Teacher Intercom
target_channel_listener = """        } else if (data.type === 'INTERCOM_BROADCAST') {
          try { playDoubtNotification(); } catch {}
          setHudAlertMessage(`🎙️ Chief Invigilator: "${data.message}"`);
          setTimeout(() => setHudAlertMessage(null), 8000);"""

repl_channel_listener = """        } else if (data.type === 'INTERCOM_BROADCAST') {
          try { playDoubtNotification(); } catch {}
          setHudAlertMessage(`🎙️ Chief Invigilator: "${data.message}"`);
          setIsInvigilatorIntercomActive(true);
          setInvigilatorIntercomMessage(data.message || 'Attention all candidates. Please ensure writing adheres to CBSE board regulations.');
        } else if (data.type === 'TALK_ONE_ON_ONE' && (!data.candidateId || data.candidateId === candidateId)) {
          try { playDoubtNotification(); } catch {}
          setIsInvigilatorIntercomActive(true);
          setInvigilatorIntercomMessage(data.message || 'Aarav, please adjust your device camera so that your physical paper booklet and hands remain visible on your desk.');"""

if target_channel_listener in text:
    text = text.replace(target_channel_listener, repl_channel_listener, 1)
    print("Added TALK_ONE_ON_ONE and teacher intercom listener")

# 4. Replace the typing textarea with the Official CBSE Question Paper Viewer
start_marker = "            {/* LEFT / CENTER: QUESTION PROMPT & LIVE TYPING EDITOR */}"
end_marker = "            {/* RIGHT COLUMN: DEDICATED WEBCAM PROCTOR HUD */}"

start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

if start_idx != -1 and end_idx != -1:
    repl_qp_viewer = """            {/* LEFT / CENTER: OFFICIAL CBSE QUESTION PAPER VIEWER (NO TYPING - PHYSICAL PAPER ONLY) */}
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/40 relative">
              
              {/* Security Watermark across question paper */}
              <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.03] dark:opacity-[0.04] rotate-[-25deg] z-0 overflow-hidden">
                <span className="text-4xl sm:text-6xl font-black uppercase text-slate-900 dark:text-white tracking-widest leading-relaxed text-center">
                  CBSE 2026-27 &bull; {studentName} &bull; ROLL #14 &bull; SECRECY VAULT CLEARANCE
                </span>
              </div>

              {/* Question Paper Header Sheet */}
              <div className="relative z-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-600 text-white shadow-2xs">
                        Official CBSE Board Assessment
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Subject Code: 041
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Secrecy Vault Paper ID #1 (Unlocked)
                      </span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                      {questionPaperData?.title || 'Term 1 Mathematics Comprehensive Final Examination'}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Class: <b>8-B</b> &bull; Candidate: <b>{studentName} (Roll #14)</b> &bull; Chief Invigilator: <b>Mrs. Ananya Verma</b>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Assessment Weightage</span>
                    <span className="text-base sm:text-lg font-black font-mono text-violet-700 dark:text-violet-300">
                      100 Marks (180 Mins)
                    </span>
                  </div>
                </div>

                {/* Candidate Instructions Strip */}
                <div className="p-3 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 text-xs text-violet-950 dark:text-violet-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-violet-900 dark:text-violet-200">
                    <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span>Physical Answer Paper Writing Protocol (Blue/Black Ink Only):</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 list-disc pl-5 space-y-0.5">
                    <li>Write all answers step-wise with question numbers clearly indicated in the left margin.</li>
                    <li>Clearly print your <b>Roll Number (#14)</b>, Name, and Page Number on every physical sheet.</li>
                    <li>Calculators and electronic gadgets are strictly prohibited. Digital copy-paste is disabled.</li>
                  </ul>
                </div>
              </div>

              {/* Section Tabs & Zoom Controls */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveSectionId('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSectionId === 'ALL'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    All Sections (17 Questions)
                  </button>

                  {(questionPaperData?.sections || []).map((sec: any) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeSectionId === sec.id
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sec.id}: {sec.name.split(':')[0]} ({sec.total_marks}m)
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQpZoomLevel(prev => prev === 'normal' ? 'large' : 'normal')}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                    title="Toggle Text Reading Size"
                  >
                    Font: {qpZoomLevel === 'large' ? 'Large (125%)' : 'Standard'}
                  </button>
                </div>
              </div>

              {/* Questions List Sheet */}
              <div className="relative z-10 space-y-6">
                {(questionPaperData?.sections || [])
                  .filter((sec: any) => activeSectionId === 'ALL' || sec.id === activeSectionId)
                  .map((sec: any) => (
                    <div key={sec.id} className="space-y-3">
                      {/* Section Title Divider */}
                      <div className="flex items-center justify-between border-b-2 border-violet-500/30 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-violet-600 text-white text-xs font-black flex items-center justify-center">
                            {sec.id.replace('SEC-', '')}
                          </span>
                          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            {sec.name}
                          </h2>
                        </div>
                        <span className="text-xs font-mono font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-0.5 rounded-lg border border-violet-200 dark:border-violet-800">
                          {sec.total_marks} Total Marks &bull; {sec.marks_per_question}m each
                        </span>
                      </div>

                      {/* Questions within this Section */}
                      <div className="space-y-3">
                        {sec.questions.map((q: any) => (
                          <div
                            key={q.q_num}
                            className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition-all hover:border-violet-300 dark:hover:border-violet-700 space-y-2.5`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="h-7 w-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                  Q{q.q_num}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                  {q.topic}
                                </span>
                                {q.bloom && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    {q.bloom}
                                  </span>
                                )}
                              </div>

                              <span className="px-2.5 py-1 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 font-mono font-black text-xs border border-violet-200 dark:border-violet-800 shrink-0">
                                [{q.marks} Marks]
                              </span>
                            </div>

                            {/* Question Formulation */}
                            <p className={`text-slate-800 dark:text-slate-100 font-medium leading-relaxed font-sans ${
                              qpZoomLevel === 'large' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
                            }`}>
                              {q.text}
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                              <span className="italic flex items-center gap-1">
                                ✍️ Solve step-by-step with pen on physical paper answer booklet
                              </span>
                              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                Question #{q.q_num} of 17
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Bottom Sticky Submission Banner for Hybrid Paper Exam */}
              <div className="relative z-10 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Physical Answer Booklet Writing Active</h4>
                    <p className="text-[10px] text-slate-500">When completed, generate your dynamic security seal and upload paper photos.</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isExamPaused}
                  onClick={() => setShowDynamicSealModal(true)}
                  className="rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-black text-xs px-6 py-3 shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Lock className="h-4 w-4" />
                  <span>Finish Writing &amp; Generate Security Seal (#HYBRID-8492-SEAL)</span>
                </button>
              </div>

            </div>

"""
    text = text[:start_idx] + repl_qp_viewer + text[end_idx:]
    print("Replaced typing textarea with Official CBSE Question Paper Viewer successfully!")
else:
    print("Error: Markers for typing section not found")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved Question Paper changes to online-exam-modal.tsx")
