# -*- coding: utf-8 -*-
"""
Patch online-exam-modal.tsx to:
1. Synchronize proctorAnalysisSheetRef so analysis sheet is never lost or stale.
2. Synchronously write every violation and strike to localStorage ('edu360_candidate_14_status' and 'edu360_latest_malpractice_alert')
   and broadcast across permanent BroadcastChannel without closing it.
3. Add a storage event listener and 400ms poller to immediately return student to exam hall
   when teacher pardons/permits.
"""

with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add proctorAnalysisSheetRef declaration
old_sheet_decl = """  // Real-Time Proctor Integrity Analysis Sheet & Automated Edge AI Engine
  const [proctorAnalysisSheet, setProctorAnalysisSheet] = useState<Array<{"""

new_sheet_decl = """  // Real-Time Proctor Integrity Analysis Sheet & Automated Edge AI Engine
  const proctorAnalysisSheetRef = useRef<Array<any>>([]);
  const [proctorAnalysisSheet, setProctorAnalysisSheet] = useState<Array<{"""

if 'const proctorAnalysisSheetRef =' not in code:
    code = code.replace(old_sheet_decl, new_sheet_decl)

# 2. Add storage listener for teacher pardon / resume signal
resume_watcher = """  // 2. Real-Time Watcher for Invigilator Pardon / Resume Signals (Multi-Window & Cross-Tab)
  useEffect(() => {
    const handlePardonResumeCheck = () => {
      try {
        const isSuspendedInStorage = localStorage.getItem('edu360_student_hard_suspended') === 'true';
        const resumeSignal = localStorage.getItem('edu360_exam_resume_signal');
        const rawStatus = localStorage.getItem('edu360_candidate_14_status');

        if (rawStatus) {
          const parsed = JSON.parse(rawStatus);
          if (parsed && parsed.isPaused === false && (parsed.strikes === 0 || parsed.strikes === undefined)) {
            // Teacher has issued an official pardon!
            if (isHardSuspendedRef.current || isExamPaused || proctorStrikesRef.current > 0) {
              console.log('✅ Invigilator pardon detected via storage. Returning student to exam hall.');
              setIsHardSuspended(false);
              isHardSuspendedRef.current = false;
              setIsExamPaused(false);
              setProctorStrikes(0);
              proctorStrikesRef.current = 0;
              setIsPenalized(false);
              try {
                localStorage.removeItem('edu360_student_hard_suspended');
                localStorage.removeItem('edu360_exam_resume_signal');
              } catch {}
              if (parsed.analysisSheet) {
                proctorAnalysisSheetRef.current = parsed.analysisSheet;
                setProctorAnalysisSheet(parsed.analysisSheet);
              }
              setHudAlertMessage('✅ Chief Invigilator Approved: Exam pardoned & resumed. Welcome back to the exam hall.');
              setTimeout(() => setHudAlertMessage(null), 6000);
            }
          }
        } else if (!isSuspendedInStorage && isHardSuspendedRef.current) {
          setIsHardSuspended(false);
          isHardSuspendedRef.current = false;
          setIsExamPaused(false);
          setProctorStrikes(0);
          proctorStrikesRef.current = 0;
          setIsPenalized(false);
        }
      } catch {}
    };

    window.addEventListener('storage', handlePardonResumeCheck);
    const interval = setInterval(handlePardonResumeCheck, 400);

    return () => {
      window.removeEventListener('storage', handlePardonResumeCheck);
      clearInterval(interval);
    };
  }, [isExamPaused]);"""

if 'Real-Time Watcher for Invigilator Pardon / Resume Signals' not in code:
    code = code.replace(
        "  // Real-Time Cross-Window Synchronization (Student & Invigilator Teacher Cockpit)",
        f"{resume_watcher}\n\n  // Real-Time Cross-Window Synchronization (Student & Invigilator Teacher Cockpit)"
    )

# 3. Enhance triggerProctorViolation to update proctorAnalysisSheetRef and localStorage
old_entry_set = """    setProctorAnalysisSheet(prev => [newEntry, ...prev]);"""

new_entry_set = """    proctorAnalysisSheetRef.current = [newEntry, ...proctorAnalysisSheetRef.current.filter(e => e.id !== newEntry.id)];
    setProctorAnalysisSheet(proctorAnalysisSheetRef.current);"""

code = code.replace(old_entry_set, new_entry_set)

# 4. Enhance statusPayload in triggerProctorViolation to write latest malpractice alert
old_status_payload = """    // Sync Telemetry & Analysis Entry & Status to localStorage for instant guaranteed cross-tab sync
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
    } catch {}"""

new_status_payload = """    // Sync Telemetry & Analysis Entry & Status to localStorage for instant guaranteed cross-tab sync
    try {
      const allEntries = proctorAnalysisSheetRef.current;
      const statusPayload = {
        candidateId: candidateId || 1,
        studentName: studentName || 'Aarav Sharma',
        rollNo: '14',
        className: 'Class 8-B',
        strikes: nextStrikes,
        isPaused: nextStrikes >= 3,
        analysisSheet: allEntries,
        updatedAt: Date.now()
      };
      localStorage.setItem('edu360_candidate_14_status', JSON.stringify(statusPayload));

      // Dedicated notification payload for the teacher cockpit and dashboard
      const alertPayload = {
        id: `malpractice-${Date.now()}-${candidateId || 1}`,
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
        analysisEntry: newEntry,
        allEntries: allEntries,
        nonce: Date.now()
      };
      localStorage.setItem('edu360_latest_malpractice_alert', JSON.stringify(alertPayload));
    } catch {}"""

code = code.replace(old_status_payload, new_status_payload)

# 5. Enhance BroadcastChannel PARDON_STRIKES and EXAM_RESUME handlers in online-exam-modal
old_pardon_block = """        } else if (data.type === 'PARDON_STRIKES' && (!data.candidateId || data.candidateId === candidateId || data.candidateId === 1)) {
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

new_pardon_block = """        } else if ((data.type === 'PARDON_STRIKES' || data.type === 'EXAM_RESUME') && (!data.candidateId || data.candidateId === candidateId || data.candidateId === 1 || data.rollNo === '14')) {
          try { playDoubtNotification(); } catch {}
          setIsHardSuspended(false);
          isHardSuspendedRef.current = false;
          setIsExamPaused(false);
          setProctorStrikes(0);
          proctorStrikesRef.current = 0;
          setIsPenalized(false);
          try {
            localStorage.removeItem('edu360_student_hard_suspended');
            localStorage.removeItem('edu360_exam_resume_signal');
          } catch {}
          if (data.decisionEntry) {
            proctorAnalysisSheetRef.current = [data.decisionEntry, ...proctorAnalysisSheetRef.current.filter(e => e.id !== data.decisionEntry.id)];
            setProctorAnalysisSheet(proctorAnalysisSheetRef.current);
          }
          setHudAlertMessage('✅ Chief Invigilator Approved: Exam pardoned & resumed. Welcome back to the exam hall.');
          setTimeout(() => setHudAlertMessage(null), 6000);
        }"""

code = code.replace(old_pardon_block, new_pardon_block)

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Successfully updated online-exam-modal.tsx!")
