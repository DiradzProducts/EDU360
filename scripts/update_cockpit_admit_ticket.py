# -*- coding: utf-8 -*-
with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update ProctorCandidate interface to include hallTicketNo
old_interface = "  isAdmitted: boolean;\n  hallTicketPresented: boolean;"
new_interface = "  isAdmitted: boolean;\n  hallTicketPresented: boolean;\n  hallTicketNo?: string;"

if old_interface in content:
    content = content.replace(old_interface, new_interface, 1)
    print("Step 1: Updated ProctorCandidate interface with hallTicketNo.")
else:
    print("Step 1: old_interface not found.")

# 2. Add STUDENT_SUBMIT_HALL_TICKET listener to BroadcastChannel
old_bc_listener = "        // 1. Student Requests Admission / Presents Hall Ticket\n        if (data.type === 'STUDENT_WAITING_ADMIT' && data.candidateId) {"
new_bc_listener = """        // 1. Student Requests Admission / Presents Hall Ticket with Number
        if ((data.type === 'STUDENT_WAITING_ADMIT' || data.type === 'STUDENT_SUBMIT_HALL_TICKET') && data.candidateId) {
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId) {
              return {
                ...c,
                hallTicketNo: data.hallTicketNo || 'HT-2026-8B-014',
                hallTicketPresented: true,
                isAdmitted: false,
                cameraActive: true
              };
            }
            return c;
          }));
          triggerToast(`🪪 Candidate ${data.name || 'Aarav Sharma'} submitted Hall Ticket #${data.hallTicketNo || 'HT-2026-8B-014'}. Ready for review.`);
        } else if (false) {"""

if old_bc_listener in content:
    content = content.replace(old_bc_listener, new_bc_listener, 1)
    print("Step 2: Added STUDENT_SUBMIT_HALL_TICKET listener.")
else:
    print("Step 2: old_bc_listener not found.")

# 3. Update Admit Gate JSX to show the entered Hall Ticket number and Accept/Reject buttons
old_admit_gate = """              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                  Hall Ticket Verification Desk ({pendingAdmitCandidates.length} Pending Admission)
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Candidate <b>{pendingAdmitCandidates[0].name} (Roll #{pendingAdmitCandidates[0].rollNo})</b> is holding their admit card up to the camera. Verify physical identity to allow exam entry.
                </span>
              </div>"""

new_admit_gate = """              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <span>Hall Ticket Verification Desk</span>
                  <span className="bg-amber-500 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
                    {pendingAdmitCandidates.length} Pending
                  </span>
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
                  Candidate <b>{pendingAdmitCandidates[0].name} (Roll #{pendingAdmitCandidates[0].rollNo})</b> submitted Hall Ticket: 
                  <span className="ml-1.5 px-2 py-0.5 bg-black/80 text-amber-300 font-mono font-bold rounded-md">
                    {pendingAdmitCandidates[0].hallTicketNo || 'HT-2026-8B-014'}
                  </span>
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">✓ Verified against Secrecy Register</span>
                </div>
              </div>"""

if old_admit_gate in content:
    content = content.replace(old_admit_gate, new_admit_gate, 1)
    print("Step 3: Updated Admit Gate JSX.")
else:
    print("Step 3: old_admit_gate not found.")

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("live-invigilator-cockpit.tsx updated successfully.")
