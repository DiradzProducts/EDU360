# -*- coding: utf-8 -*-
with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update rulesStage type definition
old_stage_def = "const [rulesStage, setRulesStage] = useState<'rules' | 'active'>('rules');"
new_stage_def = "const [rulesStage, setRulesStage] = useState<'rules' | 'hall_ticket_check' | 'active'>('rules');"

if old_stage_def in content:
    content = content.replace(old_stage_def, new_stage_def, 1)
    print("Step 1: rulesStage state updated.")
else:
    print("Step 1: old_stage_def not found.")

# 2. Add ADMIT_STUDENT listener to BroadcastChannel
old_listener = "} else if (data.type === 'EXAM_DISQUALIFY'"
new_listener = """} else if (data.type === 'ADMIT_STUDENT' && (!data.candidateId || data.candidateId === candidateId || data.candidateId === 1)) {
          try { playDoubtNotification(); } catch {}
          setRulesStage('active');
          toggleFullscreen();
          if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
          }
          setHudAlertMessage('✅ Hall Ticket Verified! You have been admitted to the Exam Hall by Mrs. Ananya Verma.');
          setTimeout(() => setHudAlertMessage(null), 5000);
        } else if (data.type === 'EXAM_DISQUALIFY'"""

if old_listener in content:
    content = content.replace(old_listener, new_listener, 1)
    print("Step 2: ADMIT_STUDENT listener added.")
else:
    print("Step 2: old_listener not found.")

# 3. Update the Rules Agreement button to transition to 'hall_ticket_check' and broadcast
old_agree_btn = """                <button
                  type="button"
                  disabled={!hasAgreedRules}
                  onClick={() => {
                    setRulesStage('active');
                    toggleFullscreen();
                    if (videoRef.current && streamRef.current) {
                      videoRef.current.srcObject = streamRef.current;
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    hasAgreedRules
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/25 active:scale-95'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Agree &amp; Enter Proctored Exam Hall (Fullscreen)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>"""

new_agree_btn = """                <button
                  type="button"
                  disabled={!hasAgreedRules}
                  onClick={() => {
                    setRulesStage('hall_ticket_check');
                    try {
                      const channel = new BroadcastChannel('edu360_exam_live_channel');
                      channel.postMessage({
                        type: 'STUDENT_WAITING_ADMIT',
                        candidateId: candidateId || 1,
                        name: studentName || 'Aarav Sharma',
                        rollNo: '14'
                      });
                      channel.close();
                    } catch {}
                  }}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    hasAgreedRules
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/25 active:scale-95'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Agree &amp; Present Hall Ticket for Admission</span>
                  <ArrowRight className="h-4 w-4" />
                </button>"""

if old_agree_btn in content:
    content = content.replace(old_agree_btn, new_agree_btn, 1)
    print("Step 3: Agree button updated to trigger hall ticket check.")
else:
    print("Step 3: old_agree_btn not found.")

# 4. Add the Hall Ticket Check screen JSX
old_ternary = ") : rulesStage === 'rules' ? ("
new_ternary = """) : rulesStage === 'hall_ticket_check' ? (
          /* ========================================================= */
          /* HALL TICKET & ADMISSION VERIFICATION GATE SCREEN          */
          /* ========================================================= */
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center space-y-6">
            <div className="max-w-lg w-full rounded-3xl bg-slate-950 border-2 border-violet-500/50 p-6 shadow-2xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Admit Gate &bull; Hall Ticket Verification</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">Present Physical Hall Ticket</h3>
                <p className="text-xs text-slate-300">
                  Please hold your physical <b>Hall Ticket (Roll #14)</b> up to your camera. Chief Invigilator <b>Mrs. Ananya Verma</b> is verifying your admit card.
                </p>
              </div>

              {/* Camera Preview Frame */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border-2 border-dashed border-violet-400/60 flex items-center justify-center">
                <video
                  ref={rulesVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <div className="absolute inset-4 border-2 border-dashed border-amber-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <span className="text-[10px] font-mono text-amber-300 font-bold bg-black/60 px-2 py-0.5 rounded self-start">
                    🪪 Align Admit Card inside Box
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold bg-black/60 px-2 py-0.5 rounded self-end">
                    Candidate: {studentName} (Roll #14)
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-violet-950/60 border border-violet-800/60 p-3 text-xs text-violet-200 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Admit Desk Status:</span>
                  <span className="text-amber-400 animate-pulse">Waiting for Invigilator Sign-Off...</span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Once Mrs. Ananya Verma clicks "Admit", your question paper will unlock in Fullscreen.
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRulesStage('rules')}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Back to Rules
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRulesStage('active');
                    toggleFullscreen();
                    if (videoRef.current && streamRef.current) {
                      videoRef.current.srcObject = streamRef.current;
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>⚡ Quick Admit (Self-Test Mode)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : rulesStage === 'rules' ? ("""

if old_ternary in content:
    content = content.replace(old_ternary, new_ternary, 1)
    print("Step 4: Hall ticket check screen JSX added.")
else:
    print("Step 4: old_ternary not found.")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("online-exam-modal.tsx updated successfully.")
