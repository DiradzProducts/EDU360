with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add rulesStage and hasAgreedRules states
target_state = "  const [proctorStrikes, setProctorStrikes] = useState<number>(0);"
repl_state = """  const [proctorStrikes, setProctorStrikes] = useState<number>(0);
  const [rulesStage, setRulesStage] = useState<'rules' | 'active'>('rules');
  const [hasAgreedRules, setHasAgreedRules] = useState<boolean>(false);"""

if target_state in text:
    text = text.replace(target_state, repl_state, 1)
    print("Added rulesStage state!")
else:
    print("Warning: target_state not found")

# 2. Reset rulesStage to 'rules' when modal opens
target_open_effect = """  useEffect(() => {
    if (!isOpen) return;

    let localStream: MediaStream | null = null;"""

repl_open_effect = """  useEffect(() => {
    if (!isOpen) return;
    setRulesStage('rules');
    setHasAgreedRules(false);

    let localStream: MediaStream | null = null;"""

if target_open_effect in text:
    text = text.replace(target_open_effect, repl_open_effect, 1)
    print("Added modal open reset effect!")
else:
    print("Warning: target_open_effect not found")

# 3. Guard timer so it only runs when rulesStage === 'active'
target_timer = "if (!isOpen || isConfirmedSubmitted || isExamPaused || isExamDisqualified) return;"
repl_timer = "if (!isOpen || isConfirmedSubmitted || isExamPaused || isExamDisqualified || rulesStage !== 'active') return;"

if target_timer in text:
    text = text.replace(target_timer, repl_timer, 1)
    print("Guarded timer countdown to active stage!")
else:
    print("Warning: target_timer not found")

# 4. Insert Rules Screen before active screen
rules_screen_jsx = """        ) : rulesStage === 'rules' ? (
          /* ========================================================= */
          /* OFFICIAL CANDIDATE EXAMINATION RULES & INTEGRITY PROTOCOL */
          /* ========================================================= */
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white">
            {/* Header with CBSE Affiliation & Exam Identity */}
            <div className="rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-purple-500/10 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-slate-900 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-600 text-white shadow-xs">
                    Official CBSE Assessment Protocol
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    {examMode === 'MODE_HYBRID_SCAN' ? '📝 Hybrid Paper + AI Proctor' : '💻 CBT Online'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {examTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Subject: <b>{subject}</b> &bull; Candidate: <b>{studentName} (Roll #14)</b> &bull; Chief Invigilator: <b>Mrs. Ananya Verma</b>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheduled Time</span>
                <span className="text-lg font-black font-mono text-violet-700 dark:text-violet-300">
                  {durationMinutes} Minutes (100 Marks)
                </span>
              </div>
            </div>

            {/* Rules Grid: 4 Critical Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 1 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-black text-sm">
                  <span className="h-7 w-7 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-xs">1</span>
                  <span>Physical Paper Writing Protocol</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Candidates must write all solutions using blue or black ballpoint pen on standard physical ruled answer sheets. Clearly print your <b>Roll Number (#14)</b>, Name, and Subject Code on the top margin of every page.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-black text-sm">
                  <span className="h-7 w-7 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-xs">2</span>
                  <span>Unbroken Camera &amp; Desk Custody</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Position your device camera so that your <b>face, hands, and physical desk writing workspace</b> remain continuously visible. Turning your head away or leaving the frame will log automated proctor infractions.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-sm">
                  <span className="h-7 w-7 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-xs">3</span>
                  <span>Strict Prohibition of Malpractice</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Smartphones, smartwatches, second monitors, or unauthorized persons in the testing room are strictly prohibited. The edge YOLO AI detector audits video continuously. Repeated violations incur a <b>5-mark penalty</b> or eviction.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                  <span className="h-7 w-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-xs">4</span>
                  <span>Dynamic Security Seal &amp; Scan Upload</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  When writing time concludes, a dynamic cryptographic token (e.g. <b>#HYBRID-8492-SEAL</b>) will pop up. You must write this code in ink on every sheet before scanning and uploading your answer booklet during the 15-minute grace window.
                </p>
              </div>
            </div>

            {/* Hardware & System Readiness Check */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Proctor Hardware Check</h4>
                  <p className="text-[11px] text-slate-500">Camera Feed: Active &bull; Microphone: Active ({audioDecibels} dB) &bull; Latency: 22ms</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  System Verified ✓
                </span>
              </div>
            </div>

            {/* Candidate Declaration & Agreement Action */}
            <div className="rounded-2xl border-2 border-violet-500/30 bg-violet-50/40 dark:bg-violet-950/30 p-5 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAgreedRules}
                  onChange={(e) => setHasAgreedRules(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-md border-violet-400 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                  I hereby declare that I have read, understood, and agreed to adhere to all the examination rules, conduct regulations, and proctoring protocols outlined above. I acknowledge that academic malpractice will lead to disqualification.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Exit to Dashboard
                </button>

                <button
                  type="button"
                  disabled={!hasAgreedRules}
                  onClick={() => setRulesStage('active')}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    hasAgreedRules
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/25 active:scale-95'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Agree &amp; Enter Proctored Exam Hall</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>"""

target_insertion = ") : (\n\n          <div className=\"relative flex-1 flex flex-col lg:flex-row overflow-hidden\">"
replacement_insertion = ") : rulesStage === 'rules' ? (\n" + rules_screen_jsx + "\n        ) : (\n\n          <div className=\"relative flex-1 flex flex-col lg:flex-row overflow-hidden\">"

# Check if target_insertion matches
if target_insertion in text:
    text = text.replace(target_insertion, replacement_insertion, 1)
    print("Inserted Rules Screen into modal directly!")
else:
    # Match using regex
    import re
    m = re.search(r"\)\s*:\s*\(\s*<div className=\"relative flex-1 flex flex-col lg:flex-row overflow-hidden\">", text)
    if m:
        text = text[:m.start()] + ") : rulesStage === 'rules' ? (" + rules_screen_jsx + "\n        ) : (" + text[m.start() + 4:]
        print("Inserted Rules Screen via regex!")
    else:
        print("Warning: could not find insertion point for Rules Screen")

# Check if ArrowRight is imported
if 'ArrowRight,' not in text:
    text = text.replace('import { \n', 'import { \n  ArrowRight,\n')
    print("Added ArrowRight import!")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Saved online-exam-modal.tsx!")
