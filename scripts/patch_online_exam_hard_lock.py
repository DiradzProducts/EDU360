# -*- coding: utf-8 -*-
"""
Patch online-exam-modal.tsx to ensure:
1. Hard persistent suspension lock on 3 strikes.
2. Completely unmount & hide the question paper viewer when suspended.
3. Remove interval poller unpausing bug (lines 1464-1470).
4. Maintain persistent BroadcastChannel and write to localStorage on every violation.
"""

with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add isHardSuspended and broadcastChannelRef
old_decl = """  const [isExamPaused, setIsExamPaused] = useState<boolean>(false);

  const [isExamDisqualified, setIsExamDisqualified] = useState<boolean>(false);"""

new_decl = """  const [isExamPaused, setIsExamPaused] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('edu360_student_hard_suspended') === 'true';
    }
    return false;
  });
  const [isHardSuspended, setIsHardSuspended] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('edu360_student_hard_suspended') === 'true';
    }
    return false;
  });
  const isHardSuspendedRef = useRef<boolean>(isHardSuspended);
  const examBroadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const [isExamDisqualified, setIsExamDisqualified] = useState<boolean>(false);"""

code = code.replace(old_decl, new_decl)

# 2. Initialize persistent broadcast channel ref in useEffect
old_channel_init = """    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');"""

new_channel_init = """    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');
      examBroadcastChannelRef.current = channel;"""

code = code.replace(old_channel_init, new_channel_init)

# 3. Fix triggerProctorViolation: Do NOT close channel, and sync to localStorage
old_trigger_broadcast = """    // Sync Telemetry & Analysis Entry & Left Corner Malpractice Alert across BroadcastChannel
    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({
        type: 'STUDENT_TELEMETRY',
        candidateId: candidateId || 1,
        studentName: studentName || 'Aarav Sharma',
        rollNo: '14',
        className: 'Class 8-B',
        strikes: nextStrikes,
        isCritical: nextStrikes >= 2,
        isMalpractice: true,
        anomalyType: params.category,
        title: params.title,
        ruleTriggered: params.ruleTriggered,
        confidence: params.confidence,
        actionTaken: params.actionTaken,
        analysisEntry: newEntry,
        timestamp: timeStr,
        cameraActive: true,
        audioDb: liveAudioDecibelsRef.current || 38,
        gaze: liveGazeStatus
      });

      // Explicit Malpractice Alert for Teacher Left Corner Popup
      channel.postMessage({
        type: 'MALPRACTICE_ALERT',
        candidateId: candidateId || 1,
        studentName: studentName || 'Aarav Sharma',
        rollNo: '14',
        className: 'Class 8-B',
        malpracticeType: params.category,
        title: params.title,
        ruleTriggered: params.ruleTriggered,
        confidence: params.confidence,
        actionTaken: params.actionTaken,
        strikes: nextStrikes,
        timestamp: timeStr,
        analysisEntry: newEntry
      });

      if (nextStrikes >= 3) {
        channel.postMessage({
          type: 'DISQUALIFICATION_REVIEW_REQUESTED',
          candidateId: candidateId || 1,
          studentName: studentName || 'Aarav Sharma',
          rollNo: '14',
          className: 'Class 8-B',
          strikes: 3,
          title: params.title,
          ruleTriggered: params.ruleTriggered,
          confidence: params.confidence,
          timestamp: timeStr,
          analysisEntry: newEntry
        });
      }

      channel.close();
    } catch {}"""

new_trigger_broadcast = """    // Hard Lockdown on 3 Strikes
    if (nextStrikes >= 3) {
      setIsHardSuspended(true);
      isHardSuspendedRef.current = true;
      setIsExamPaused(true);
      try {
        localStorage.setItem('edu360_student_hard_suspended', 'true');
      } catch {}
    }

    // Sync Telemetry & Analysis Entry & Status to localStorage for instant guaranteed cross-tab sync
    try {
      const statusPayload = {
        candidateId: candidateId || 1,
        studentName: studentName || 'Aarav Sharma',
        rollNo: '14',
        className: 'Class 8-B',
        strikes: nextStrikes,
        isPaused: nextStrikes >= 3,
        analysisSheet: [newEntry, ...proctorAnalysisSheet],
        updatedAt: Date.now()
      };
      localStorage.setItem('edu360_candidate_14_status', JSON.stringify(statusPayload));
    } catch {}

    // Sync across persistent BroadcastChannel
    try {
      const channel = examBroadcastChannelRef.current || new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({
        type: 'STUDENT_TELEMETRY',
        candidateId: candidateId || 1,
        studentName: studentName || 'Aarav Sharma',
        rollNo: '14',
        className: 'Class 8-B',
        strikes: nextStrikes,
        isPaused: nextStrikes >= 3,
        isCritical: nextStrikes >= 2,
        isMalpractice: true,
        anomalyType: params.category,
        title: params.title,
        ruleTriggered: params.ruleTriggered,
        confidence: params.confidence,
        actionTaken: params.actionTaken,
        analysisEntry: newEntry,
        timestamp: timeStr,
        cameraActive: true,
        audioDb: liveAudioDecibelsRef.current || 38,
        gaze: liveGazeStatus
      });

      // Explicit Malpractice Alert for Teacher Left Corner Popup
      channel.postMessage({
        type: 'MALPRACTICE_ALERT',
        candidateId: candidateId || 1,
        studentName: studentName || 'Aarav Sharma',
        rollNo: '14',
        className: 'Class 8-B',
        malpracticeType: params.category,
        title: params.title,
        ruleTriggered: params.ruleTriggered,
        confidence: params.confidence,
        actionTaken: params.actionTaken,
        strikes: nextStrikes,
        isPaused: nextStrikes >= 3,
        timestamp: timeStr,
        analysisEntry: newEntry
      });

      if (nextStrikes >= 3) {
        channel.postMessage({
          type: 'DISQUALIFICATION_REVIEW_REQUESTED',
          candidateId: candidateId || 1,
          studentName: studentName || 'Aarav Sharma',
          rollNo: '14',
          className: 'Class 8-B',
          strikes: 3,
          isPaused: true,
          title: params.title,
          ruleTriggered: params.ruleTriggered,
          confidence: params.confidence,
          timestamp: timeStr,
          analysisEntry: newEntry
        });
      }
    } catch {}"""

code = code.replace(old_trigger_broadcast, new_trigger_broadcast)

# 4. Fix PARDON_STRIKES listener to clear isHardSuspended and localStorage
old_pardon_listener = """        } else if (data.type === 'PARDON_STRIKES' && (!data.candidateId || data.candidateId === candidateId)) {
          try { playDoubtNotification(); } catch {}
          const newStrikes = data.newStrikes !== undefined ? data.newStrikes : 0;
          setProctorStrikes(newStrikes);
          proctorStrikesRef.current = newStrikes;
          setIsPenalized(false);
          setIsExamPaused(false);
          if (data.decisionEntry) {
            setProctorAnalysisSheet(prev => [data.decisionEntry, ...prev.filter(e => e.id !== data.decisionEntry.id)]);
          }
          setHudAlertMessage('✅ Invigilator Decision: Review cleared & strikes pardoned. Continue your exam.');
          setTimeout(() => setHudAlertMessage(null), 6000);
        }"""

new_pardon_listener = """        } else if (data.type === 'PARDON_STRIKES' && (!data.candidateId || data.candidateId === candidateId || data.candidateId === 1)) {
          try { playDoubtNotification(); } catch {}
          setIsHardSuspended(false);
          isHardSuspendedRef.current = false;
          try {
            localStorage.removeItem('edu360_student_hard_suspended');
          } catch {}
          const newStrikes = data.newStrikes !== undefined ? data.newStrikes : 0;
          setProctorStrikes(newStrikes);
          proctorStrikesRef.current = newStrikes;
          setIsPenalized(false);
          setIsExamPaused(false);
          if (data.decisionEntry) {
            setProctorAnalysisSheet(prev => [data.decisionEntry, ...prev.filter(e => e.id !== data.decisionEntry.id)]);
          }
          setHudAlertMessage('✅ Invigilator Decision: Approved & pardoned by Mrs. Ananya Verma. Question paper restored.');
          setTimeout(() => setHudAlertMessage(null), 6000);
        }"""

code = code.replace(old_pardon_listener, new_pardon_listener)

# 5. Fix polling interval in useEffect: NEVER unpause if 3 strikes or isHardSuspended
old_poller_check = """            // CRITICAL ARCHITECTURE FIX: Never overwrite local pause state if student has 3 strikes unless explicitly pardoned!
            if (myRecord.isPaused !== undefined) {
              if (proctorStrikesRef.current < 3) {
                setIsExamPaused(Boolean(myRecord.isPaused));
              } else if (myRecord.strikes === 0 && !myRecord.isPaused) {
                setIsExamPaused(false);
                setProctorStrikes(0);
                proctorStrikesRef.current = 0;
              }
            }"""

new_poller_check = """            // CRITICAL ARCHITECTURE FIX: Hard-lock suspension state. Never unpause from background polling!
            if (proctorStrikesRef.current >= 3 || isHardSuspendedRef.current || isHardSuspended) {
              setIsExamPaused(true);
            } else if (myRecord.isPaused !== undefined) {
              setIsExamPaused(Boolean(myRecord.isPaused));
            }"""

code = code.replace(old_poller_check, new_poller_check)

# 6. Replace Question Paper rendering with hard-suspension lock when suspended
# Define isSuspendedSession
if 'const isSuspendedSession =' not in code:
    code = code.replace(
        "  return (\n    <div className=\"fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md overflow-hidden p-2 sm:p-4 animate-in fade-in duration-200\">",
        """  const isSuspendedSession = isHardSuspended || isHardSuspendedRef.current || isExamPaused || proctorStrikes >= 3 || proctorStrikesRef.current >= 3;

  return (
    <div className=\"fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md overflow-hidden p-2 sm:p-4 animate-in fade-in duration-200\">"""
    )

# Replace Question Paper block to completely unmount when isSuspendedSession is true
qp_start_marker = """            {/* LEFT / CENTER: OFFICIAL CBSE QUESTION PAPER VIEWER (NO TYPING - PHYSICAL PAPER ONLY) */}
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/40 relative">"""

qp_end_marker = """            {/* RIGHT COLUMN: DEDICATED WEBCAM PROCTOR HUD */}"""

suspension_block = """            {/* HARD LOCKDOWN: WHEN 3 STRIKES APPLIED, HIDE QUESTION PAPER ENTIRELY */}
            {isSuspendedSession ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-slate-950 text-center animate-in fade-in duration-200 overflow-y-auto">
                <div className="max-w-xl w-full p-8 sm:p-10 rounded-3xl border-2 border-rose-500 ring-4 ring-rose-500/40 bg-gradient-to-b from-rose-950/95 via-slate-900 to-slate-950 text-white shadow-2xl space-y-6">
                  
                  {/* Icon & Pulse */}
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/20 text-rose-400 border-2 border-rose-500/50 animate-pulse shadow-lg shadow-rose-950/50">
                    <ShieldAlert className="h-10 w-10 text-rose-400" />
                  </div>

                  {/* Title & Explanation */}
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                      <span>🚨 EXAMINATION HARD-SUSPENDED (3 STRIKES APPLIED)</span>
                    </div>

                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Locked Awaiting Chief Invigilator Approval
                    </h2>

                    <p className="text-sm text-rose-200/90 leading-relaxed max-w-lg mx-auto">
                      Your examination session is completely suspended due to 3 malpractice strikes. The question paper, questions, and writing pad are locked out. Your workstation is pinned to the <b>Top-Left Corner</b> of the invigilator grid for inquiry.
                    </p>
                  </div>

                  {/* 1-on-1 Voice Intercom Banner */}
                  <div className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-3 ${
                    isInvigilatorIntercomActive
                      ? 'bg-indigo-950/90 border-indigo-500 ring-2 ring-indigo-500/50 text-indigo-200 animate-pulse'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                        isInvigilatorIntercomActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 text-slate-400'
                      }`}>
                        <PhoneCall className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black block text-white">
                          {isInvigilatorIntercomActive ? '🎙️ 1-on-1 Voice Intercom Active with Mrs. Ananya Verma' : '1-on-1 Voice Intercom Standby'}
                        </span>
                        <span className="text-[11px] block text-slate-300 mt-0.5">
                          {isInvigilatorIntercomActive 
                            ? 'Chief Invigilator is speaking. Please explain your infractions into your microphone.'
                            : 'Mrs. Ananya Verma will open voice intercom shortly to review your analysis sheet.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: View Analysis Sheet & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAnalysisSheetModal(true)}
                      className="py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Open My Full Analysis Sheet ({proctorAnalysisSheet.length} Incidents)</span>
                    </button>

                    <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-rose-300 font-mono flex items-center justify-center gap-2">
                      <Lock className="h-4 w-4 text-rose-400" />
                      <span>Question Paper Completely Locked</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono">
                    * The exam will only resume once the Chief Invigilator issues an official electronic pardon.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/40 relative">"""

qp_end_replacement = """              </div>
            )}

            {/* RIGHT COLUMN: DEDICATED WEBCAM PROCTOR HUD */}"""

if qp_start_marker in code and qp_end_marker in code:
    idx1 = code.find(qp_start_marker)
    idx2 = code.find(qp_end_marker)
    code = code[:idx1] + suspension_block + code[idx1+len(qp_start_marker):idx2] + qp_end_replacement + code[idx2+len(qp_end_marker):]

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Successfully patched online-exam-modal.tsx with hard suspension lock!")
