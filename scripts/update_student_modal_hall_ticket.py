# -*- coding: utf-8 -*-
with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add hall ticket state variables
old_state_marker = "const [rulesStage, setRulesStage] = useState<'rules' | 'hall_ticket_check' | 'active'>('rules');"
new_state_marker = """const [rulesStage, setRulesStage] = useState<'rules' | 'hall_ticket_check' | 'active'>('rules');
  const [studentEnteredHallTicket, setStudentEnteredHallTicket] = useState<string>('HT-2026-8B-014');
  const [isHallTicketSubmitted, setIsHallTicketSubmitted] = useState<boolean>(false);"""

if old_state_marker in content:
    content = content.replace(old_state_marker, new_state_marker, 1)
    print("Step 1: Hall ticket state variables added.")
else:
    print("Step 1: old_state_marker not found.")

# 2. Update hall_ticket_check JSX to include the input field and submit button
old_gate_jsx = """              <div className="rounded-xl bg-violet-950/60 border border-violet-800/60 p-3 text-xs text-violet-200 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Admit Desk Status:</span>
                  <span className="text-amber-400 animate-pulse">Waiting for Invigilator Sign-Off...</span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Once Mrs. Ananya Verma clicks "Admit", your question paper will unlock in Fullscreen.
                </span>
              </div>"""

new_gate_jsx = """              {/* Hall Ticket Input & Submission Section */}
              <div className="space-y-2 text-left bg-slate-900/90 p-4 rounded-2xl border border-violet-500/30">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Enter Official Hall Ticket Number:</span>
                  <span className="text-[10px] text-amber-400 font-mono">Issued by Exam Office</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={studentEnteredHallTicket}
                    onChange={(e) => setStudentEnteredHallTicket(e.target.value)}
                    placeholder="e.g. HT-2026-8B-014 or Roll #14"
                    className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsHallTicketSubmitted(true);
                      try {
                        const channel = new BroadcastChannel('edu360_exam_live_channel');
                        channel.postMessage({
                          type: 'STUDENT_SUBMIT_HALL_TICKET',
                          candidateId: candidateId || 1,
                          name: studentName || 'Aarav Sharma',
                          rollNo: '14',
                          hallTicketNo: studentEnteredHallTicket.trim() || 'HT-2026-8B-014',
                          timestamp: new Date().toLocaleTimeString()
                        });
                        channel.close();
                      } catch {}
                    }}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                  >
                    Submit Ticket
                  </button>
                </div>
                {isHallTicketSubmitted ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold pt-1 animate-pulse">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Hall Ticket #{studentEnteredHallTicket} submitted to Mrs. Ananya Verma. Awaiting teacher acceptance...</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 block">
                    Verify the number printed on your admit card and click "Submit Ticket" to request entry.
                  </span>
                )}
              </div>

              <div className="rounded-xl bg-violet-950/60 border border-violet-800/60 p-3 text-xs text-violet-200 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Admit Desk Status:</span>
                  <span className="text-amber-400 animate-pulse">
                    {isHallTicketSubmitted ? 'Hall Ticket Under Teacher Review...' : 'Awaiting Hall Ticket Submission...'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Once Mrs. Ananya Verma accepts your Hall Ticket, your question paper will unlock into Fullscreen.
                </span>
              </div>"""

if old_gate_jsx in content:
    content = content.replace(old_gate_jsx, new_gate_jsx, 1)
    print("Step 2: Hall ticket input field & submission JSX added.")
else:
    print("Step 2: old_gate_jsx not found.")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("online-exam-modal.tsx updated successfully.")
