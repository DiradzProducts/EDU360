# -*- coding: utf-8 -*-
"""
Patch frontend/src/components/proctor/live-invigilator-cockpit.tsx and frontend/src/app/teacher/page.tsx
for 100% real-time malpractice sync (including tab switch) and instant unpause upon pardon approval.
"""

# -------------------------------------------------------------
# 1. Patch live-invigilator-cockpit.tsx
# -------------------------------------------------------------
with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add lastAlertNonceRef & playMalpracticeChime right above activeMalpracticeAlert
alert_marker = "  const [activeMalpracticeAlert, setActiveMalpracticeAlert] = useState<{"
new_alert_decl = """  const lastAlertNonceRef = useRef<any>(0);

  const playMalpracticeChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.16, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {}
  };

  const [activeMalpracticeAlert, setActiveMalpracticeAlert] = useState<{"""

if 'lastAlertNonceRef' not in code:
    assert alert_marker in code, "Could not find activeMalpracticeAlert marker"
    code = code.replace(alert_marker, new_alert_decl)

# Replace syncStatusFromStorage to update both candidates and selectedAnalysisCandidate, and check edu360_latest_malpractice_alert
old_sync_start = "  // Guaranteed multi-channel sync: Listen to localStorage & storage events from student terminal"
old_sync_end = "  // 1. Initialize Teacher Camera Stream"

new_sync_code = """  // Guaranteed multi-channel sync: Listen to localStorage & storage events from student terminal
  useEffect(() => {
    const syncStatusFromStorage = () => {
      try {
        // 1. Sync candidate status & analysis sheet
        const raw = localStorage.getItem('edu360_candidate_14_status');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.strikes !== undefined || parsed.isPaused !== undefined)) {
            const strikes = parsed.strikes !== undefined ? parsed.strikes : 0;
            const isPaused = parsed.isPaused !== undefined ? parsed.isPaused : (strikes >= 3);
            const updatedSheet = (parsed.analysisSheet && parsed.analysisSheet.length > 0)
              ? parsed.analysisSheet
              : null;

            setCandidates(prev => {
              let changed = false;
              const next = prev.map(c => {
                if (c.rollNo === '14' || c.id === 1) {
                  const sheet = updatedSheet || c.analysisSheet;
                  if (c.strikes !== strikes || c.isPaused !== isPaused || c.analysisSheet.length !== sheet.length) {
                    changed = true;
                    return {
                      ...c,
                      strikes,
                      isPaused,
                      status: isPaused ? ('critical' as const) : (strikes >= 2 ? ('critical' as const) : strikes === 1 ? ('warning' as const) : ('normal' as const)),
                      suspicionScore: Math.min(100, strikes * 33 + (sheet?.length || 0) * 8),
                      analysisSheet: sheet
                    };
                  }
                }
                return c;
              });

              if (changed) {
                const candidate14 = next.find(c => c.rollNo === '14' || c.id === 1);
                if (candidate14 && (candidate14.isPaused || candidate14.strikes >= 3)) {
                  setSpotlightCandidateId(candidate14.id);
                }
              }

              return changed ? next : prev;
            });

            // Keep currently open Analysis Sheet modal updated in real-time
            setSelectedAnalysisCandidate(curr => {
              if (curr && (curr.rollNo === '14' || curr.id === 1)) {
                const sheet = updatedSheet || curr.analysisSheet;
                if (curr.strikes !== strikes || curr.isPaused !== isPaused || curr.analysisSheet.length !== sheet.length) {
                  return {
                    ...curr,
                    strikes,
                    isPaused,
                    status: isPaused ? 'critical' : (strikes >= 2 ? 'critical' : strikes === 1 ? 'warning' : 'normal'),
                    suspicionScore: Math.min(100, strikes * 33 + (sheet?.length || 0) * 8),
                    analysisSheet: sheet
                  };
                }
              }
              return curr;
            });
          }
        }

        // 2. Sync Real-Time Malpractice Alert for Left Corner Popup & Attention Chime
        const alertRaw = localStorage.getItem('edu360_latest_malpractice_alert');
        if (alertRaw) {
          const alertData = JSON.parse(alertRaw);
          const nonce = alertData.nonce || alertData.timestamp;
          if (alertData && nonce && lastAlertNonceRef.current !== nonce) {
            lastAlertNonceRef.current = nonce;
            setActiveMalpracticeAlert(alertData);
            if (alertData.candidateId) {
              setSpotlightCandidateId(alertData.candidateId);
            }
            playMalpracticeChime();
          }
        }
      } catch {}
    };

    syncStatusFromStorage();
    window.addEventListener('storage', syncStatusFromStorage);
    const interval = setInterval(syncStatusFromStorage, 400);

    return () => {
      window.removeEventListener('storage', syncStatusFromStorage);
      clearInterval(interval);
    };
  }, []);"""

if 'lastAlertNonceRef.current !== nonce' not in code:
    idx_start = code.find(old_sync_start)
    idx_end = code.find(old_sync_end)
    assert idx_start != -1 and idx_end != -1, f"Could not find sync bounds: {idx_start}, {idx_end}"
    code = code[:idx_start] + new_sync_code + "\n\n" + code[idx_end:]

# Replace BroadcastChannel onmessage MALPRACTICE_ALERT & STUDENT_TELEMETRY handlers
old_malpractice_block = """        // Explicit Malpractice Alert for Left Corner Popup
        if (data.type === 'MALPRACTICE_ALERT') {
          setActiveMalpracticeAlert(data);
          if (data.candidateId) {
            setSpotlightCandidateId(data.candidateId);
          }
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const audioCtx = new AudioCtx();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.setValueAtTime(580, audioCtx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.25);
              gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.26);
            }
          } catch {}

          setTimeout(() => {
            setActiveMalpracticeAlert(prev => prev && prev.timestamp === data.timestamp ? null : prev);
          }, 12000);
        }"""

new_malpractice_block = """        // Explicit Malpractice Alert for Left Corner Popup
        if (data.type === 'MALPRACTICE_ALERT') {
          setActiveMalpracticeAlert(data);
          if (data.candidateId) {
            setSpotlightCandidateId(data.candidateId);
          }
          playMalpracticeChime();

          // Sync candidate analysis sheet & strikes immediately
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo || c.rollNo === '14' || c.id === 1) {
              const newStrikes = data.strikes !== undefined ? data.strikes : c.strikes;
              const isNowPaused = newStrikes >= 3 || data.isPaused || c.isPaused;
              const newAnalysisSheet = data.allEntries 
                ? data.allEntries
                : (data.analysisEntry ? [data.analysisEntry, ...(c.analysisSheet || []).filter(item => item.id !== data.analysisEntry.id)] : c.analysisSheet);
              return {
                ...c,
                strikes: newStrikes,
                isPaused: isNowPaused,
                status: isNowPaused ? ('critical' as const) : (newStrikes >= 2 ? ('critical' as const) : newStrikes === 1 ? ('warning' as const) : ('normal' as const)),
                suspicionScore: Math.min(100, (newStrikes * 33) + ((newAnalysisSheet?.length || 0) * 8)),
                analysisSheet: newAnalysisSheet
              };
            }
            return c;
          }));

          setSelectedAnalysisCandidate(curr => {
            if (curr && (curr.id === data.candidateId || curr.studentId === data.candidateId || curr.rollNo === data.rollNo || curr.rollNo === '14' || curr.id === 1)) {
              const newStrikes = data.strikes !== undefined ? data.strikes : curr.strikes;
              const isNowPaused = newStrikes >= 3 || data.isPaused || curr.isPaused;
              const newAnalysisSheet = data.allEntries 
                ? data.allEntries
                : (data.analysisEntry ? [data.analysisEntry, ...(curr.analysisSheet || []).filter(item => item.id !== data.analysisEntry.id)] : curr.analysisSheet);
              return {
                ...curr,
                strikes: newStrikes,
                isPaused: isNowPaused,
                status: isNowPaused ? 'critical' : (newStrikes >= 2 ? 'critical' : newStrikes === 1 ? 'warning' : 'normal'),
                suspicionScore: Math.min(100, (newStrikes * 33) + ((newAnalysisSheet?.length || 0) * 8)),
                analysisSheet: newAnalysisSheet
              };
            }
            return curr;
          });

          setTimeout(() => {
            setActiveMalpracticeAlert(prev => prev && (prev.timestamp === data.timestamp || (prev as any).nonce === data.nonce) ? null : prev);
          }, 15000);
        }"""

if old_malpractice_block in code:
    code = code.replace(old_malpractice_block, new_malpractice_block)

# Update STUDENT_TELEMETRY block
old_telemetry = """        if (data.type === 'STUDENT_TELEMETRY' && data.candidateId) {
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId) {
              const newStrikes = data.strikes !== undefined ? data.strikes : c.strikes;
              const newAnalysisSheet = data.analysisEntry 
                ? [data.analysisEntry, ...(c.analysisSheet || []).filter(item => item.id !== data.analysisEntry.id)]
                : c.analysisSheet;
              
              const isNowPaused = newStrikes >= 3 || data.isPaused || c.isPaused;

              return {
                ...c,
                strikes: newStrikes,
                isPaused: isNowPaused,
                status: isNowPaused ? 'critical' : (newStrikes >= 2 ? 'critical' : newStrikes === 1 ? 'warning' : 'normal'),
                suspicionScore: Math.min(100, (newStrikes * 33) + ((newAnalysisSheet?.length || 0) * 8)),
                decibels: data.decibels !== undefined ? data.decibels : c.decibels,
                gaze: data.gaze || c.gaze,
                anomalyType: data.anomalyType || c.anomalyType,
                lastAnomalyTime: data.timestamp || c.lastAnomalyTime,
                analysisSheet: newAnalysisSheet
              };
            }
            return c;
          }));
        }"""

new_telemetry = """        if (data.type === 'STUDENT_TELEMETRY' && (data.candidateId || data.rollNo === '14')) {
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo || c.rollNo === '14' || c.id === 1) {
              const newStrikes = data.strikes !== undefined ? data.strikes : c.strikes;
              const newAnalysisSheet = data.allEntries
                ? data.allEntries
                : (data.analysisEntry ? [data.analysisEntry, ...(c.analysisSheet || []).filter(item => item.id !== data.analysisEntry.id)] : c.analysisSheet);
              
              const isNowPaused = newStrikes >= 3 || data.isPaused || c.isPaused;

              return {
                ...c,
                strikes: newStrikes,
                isPaused: isNowPaused,
                status: isNowPaused ? 'critical' : (newStrikes >= 2 ? 'critical' : newStrikes === 1 ? 'warning' : 'normal'),
                suspicionScore: Math.min(100, (newStrikes * 33) + ((newAnalysisSheet?.length || 0) * 8)),
                decibels: data.decibels !== undefined ? data.decibels : c.decibels,
                gaze: data.gaze || c.gaze,
                anomalyType: data.anomalyType || c.anomalyType,
                lastAnomalyTime: data.timestamp || c.lastAnomalyTime,
                analysisSheet: newAnalysisSheet
              };
            }
            return c;
          }));

          setSelectedAnalysisCandidate(curr => {
            if (curr && (curr.id === data.candidateId || curr.studentId === data.candidateId || curr.rollNo === data.rollNo || curr.rollNo === '14' || curr.id === 1)) {
              const newStrikes = data.strikes !== undefined ? data.strikes : curr.strikes;
              const isNowPaused = newStrikes >= 3 || data.isPaused || curr.isPaused;
              const newAnalysisSheet = data.allEntries
                ? data.allEntries
                : (data.analysisEntry ? [data.analysisEntry, ...(curr.analysisSheet || []).filter(item => item.id !== data.analysisEntry.id)] : curr.analysisSheet);
              return {
                ...curr,
                strikes: newStrikes,
                isPaused: isNowPaused,
                status: isNowPaused ? 'critical' : (newStrikes >= 2 ? 'critical' : newStrikes === 1 ? 'warning' : 'normal'),
                suspicionScore: Math.min(100, (newStrikes * 33) + ((newAnalysisSheet?.length || 0) * 8)),
                analysisSheet: newAnalysisSheet
              };
            }
            return curr;
          });
        }"""

if old_telemetry in code:
    code = code.replace(old_telemetry, new_telemetry)

# Replace handlePardonCandidate to never close channel and set edu360_exam_resume_signal
old_pardon_fn = """  // CORE DECISION 1: PARDON STRIKES & PERMIT TO WRITE EXAM (Approved -> Returns to original seat)
  const handlePardonCandidate = (candidate: ProctorCandidate) => {
    const decisionEntry: ProctorAnalysisEntry = {
      id: `verdict-approved-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'INVIGILATOR_VERDICT',
      title: '✅ INVIGILATOR VERDICT: APPROVED (PERMITTED TO RESUME)',
      ruleTriggered: 'Pardon & Sanction Relief &bull; Explanation Accepted by Chief Invigilator',
      confidence: 1.0,
      actionTaken: 'ANOMALY_LOG',
      status: 'CLEARED',
      notes: `Chief Invigilator Mrs. Ananya Verma approved continuation for ${candidate.name} (Roll #${candidate.rollNo}) after 1-on-1 inquiry. Strikes cleared to 0. Returned to seat #${candidate.rollNo}.`
    };

    setCandidates(prev => prev.map(c => {
      if (c.id === candidate.id) {
        return {
          ...c,
          strikes: 0,
          isPaused: false,
          status: 'normal',
          suspicionScore: 10,
          analysisSheet: [decisionEntry, ...c.analysisSheet]
        };
      }
      return c;
    }));

    if (selectedAnalysisCandidate && selectedAnalysisCandidate.id === candidate.id) {
      setSelectedAnalysisCandidate(prev => prev ? {
        ...prev,
        strikes: 0,
        isPaused: false,
        status: 'normal',
        analysisSheet: [decisionEntry, ...prev.analysisSheet]
      } : null);
    }

    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ 
        type: 'PARDON_STRIKES', 
        candidateId: candidate.id, 
        newStrikes: 0,
        decisionEntry
      });
      channel.postMessage({ type: 'EXAM_RESUME', candidateId: candidate.id });
      channel.close();
    } catch {}

    // Clear hard suspension from localStorage so student terminal unpauses immediately
    try {
      localStorage.removeItem('edu360_student_hard_suspended');
      localStorage.setItem('edu360_candidate_14_status', JSON.stringify({
        candidateId: candidate.id,
        rollNo: candidate.rollNo,
        studentName: candidate.name,
        strikes: 0,
        isPaused: false,
        analysisSheet: [decisionEntry, ...candidate.analysisSheet],
        pardonedAt: Date.now()
      }));
    } catch {}

    triggerToast(`🟢 Permitted: ${candidate.name} pardoned. Resumed and returned to original grid position.`);
    setEvictModalCandidate(null);
    setActiveMalpracticeAlert(null);
  };"""

new_pardon_fn = """  // CORE DECISION 1: PARDON STRIKES & PERMIT TO WRITE EXAM (Approved -> Returns to original seat)
  const handlePardonCandidate = (candidate: ProctorCandidate) => {
    const decisionEntry: ProctorAnalysisEntry = {
      id: `verdict-approved-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'INVIGILATOR_VERDICT',
      title: '✅ INVIGILATOR VERDICT: APPROVED (PERMITTED TO RESUME)',
      ruleTriggered: 'Pardon & Sanction Relief &bull; Explanation Accepted by Chief Invigilator',
      confidence: 1.0,
      actionTaken: 'ANOMALY_LOG',
      status: 'CLEARED',
      notes: `Chief Invigilator Mrs. Ananya Verma approved continuation for ${candidate.name} (Roll #${candidate.rollNo}) after 1-on-1 inquiry. Strikes cleared to 0. Returned to seat #${candidate.rollNo}.`
    };

    setCandidates(prev => prev.map(c => {
      if (c.id === candidate.id || c.rollNo === candidate.rollNo || c.rollNo === '14' || c.id === 1) {
        return {
          ...c,
          strikes: 0,
          isPaused: false,
          status: 'normal',
          suspicionScore: 10,
          analysisSheet: [decisionEntry, ...(c.analysisSheet || []).filter(e => e.id !== decisionEntry.id)]
        };
      }
      return c;
    }));

    if (selectedAnalysisCandidate && (selectedAnalysisCandidate.id === candidate.id || selectedAnalysisCandidate.rollNo === candidate.rollNo || selectedAnalysisCandidate.rollNo === '14' || selectedAnalysisCandidate.id === 1)) {
      setSelectedAnalysisCandidate(prev => prev ? {
        ...prev,
        strikes: 0,
        isPaused: false,
        status: 'normal',
        analysisSheet: [decisionEntry, ...(prev.analysisSheet || []).filter(e => e.id !== decisionEntry.id)]
      } : null);
    }

    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ 
        type: 'PARDON_STRIKES', 
        candidateId: candidate.id,
        rollNo: candidate.rollNo,
        newStrikes: 0,
        decisionEntry
      });
      channel.postMessage({ 
        type: 'EXAM_RESUME', 
        candidateId: candidate.id,
        rollNo: candidate.rollNo 
      });
      // Do NOT close channel so Chromium dispatches without drop
    } catch {}

    // Clear hard suspension and set resume signal in localStorage
    try {
      localStorage.removeItem('edu360_student_hard_suspended');
      localStorage.setItem('edu360_exam_resume_signal', Date.now().toString());
      localStorage.setItem('edu360_candidate_14_status', JSON.stringify({
        candidateId: candidate.id,
        rollNo: candidate.rollNo,
        studentName: candidate.name,
        strikes: 0,
        isPaused: false,
        analysisSheet: [decisionEntry, ...(candidate.analysisSheet || [])],
        pardonedAt: Date.now()
      }));
    } catch {}

    triggerToast(`🟢 Permitted: ${candidate.name} pardoned. Resumed and returned to original grid position.`);
    setEvictModalCandidate(null);
    setActiveMalpracticeAlert(null);
  };"""

assert old_pardon_fn in code, "Could not find old_pardon_fn"
code = code.replace(old_pardon_fn, new_pardon_fn)

# Replace handleConfirmDisqualification to never close channel and sync to localStorage
old_disq_fn = """  // CORE DECISION 2: CONFIRM DISQUALIFICATION & REMOVE FROM GRID (Rejected -> Evicted)
  const handleConfirmDisqualification = (candidate: ProctorCandidate, reason: string) => {
    const decisionEntry: ProctorAnalysisEntry = {
      id: `verdict-rejected-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'INVIGILATOR_VERDICT',
      title: '🛑 INVIGILATOR VERDICT: REJECTED (DISQUALIFIED & EVICTED)',
      ruleTriggered: 'Malpractice Threshold Confirmed &bull; Term 2 Examination Eviction Sanction',
      confidence: 1.0,
      actionTaken: 'STRIKE',
      status: 'FLAGGED',
      notes: `Chief Invigilator Mrs. Ananya Verma confirmed disqualification for ${candidate.name} (Roll #${candidate.rollNo}) on grounds: "${reason}". Candidate evicted from examination hall.`
    };

    setCandidates(prev => prev.map(c => {
      if (c.id === candidate.id) {
        return {
          ...c,
          status: 'disqualified',
          isDisqualified: true,
          isPaused: true,
          analysisSheet: [decisionEntry, ...c.analysisSheet]
        };
      }
      return c;
    }));

    if (selectedAnalysisCandidate && selectedAnalysisCandidate.id === candidate.id) {
      setSelectedAnalysisCandidate(prev => prev ? {
        ...prev,
        status: 'disqualified',
        isDisqualified: true,
        isPaused: true,
        analysisSheet: [decisionEntry, ...prev.analysisSheet]
      } : null);
    }

    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ 
        type: 'EXAM_DISQUALIFY', 
        candidateId: candidate.id, 
        reason,
        decisionEntry 
      });
      channel.close();
    } catch {}

    triggerToast(`🔴 Disqualified: Candidate ${candidate.name} (Roll #${candidate.rollNo}) disqualified & removed from active grid.`);
    setEvictModalCandidate(null);
    setActiveMalpracticeAlert(null);
  };"""

new_disq_fn = """  // CORE DECISION 2: CONFIRM DISQUALIFICATION & REMOVE FROM GRID (Rejected -> Evicted)
  const handleConfirmDisqualification = (candidate: ProctorCandidate, reason: string) => {
    const decisionEntry: ProctorAnalysisEntry = {
      id: `verdict-rejected-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'INVIGILATOR_VERDICT',
      title: '🛑 INVIGILATOR VERDICT: REJECTED (DISQUALIFIED & EVICTED)',
      ruleTriggered: 'Malpractice Threshold Confirmed &bull; Term 2 Examination Eviction Sanction',
      confidence: 1.0,
      actionTaken: 'STRIKE',
      status: 'FLAGGED',
      notes: `Chief Invigilator Mrs. Ananya Verma confirmed disqualification for ${candidate.name} (Roll #${candidate.rollNo}) on grounds: "${reason}". Candidate evicted from examination hall.`
    };

    setCandidates(prev => prev.map(c => {
      if (c.id === candidate.id || c.rollNo === candidate.rollNo || c.rollNo === '14' || c.id === 1) {
        return {
          ...c,
          status: 'disqualified',
          isDisqualified: true,
          isPaused: true,
          analysisSheet: [decisionEntry, ...(c.analysisSheet || []).filter(e => e.id !== decisionEntry.id)]
        };
      }
      return c;
    }));

    if (selectedAnalysisCandidate && (selectedAnalysisCandidate.id === candidate.id || selectedAnalysisCandidate.rollNo === candidate.rollNo || selectedAnalysisCandidate.rollNo === '14' || selectedAnalysisCandidate.id === 1)) {
      setSelectedAnalysisCandidate(prev => prev ? {
        ...prev,
        status: 'disqualified',
        isDisqualified: true,
        isPaused: true,
        analysisSheet: [decisionEntry, ...(prev.analysisSheet || []).filter(e => e.id !== decisionEntry.id)]
      } : null);
    }

    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ 
        type: 'EXAM_DISQUALIFY', 
        candidateId: candidate.id, 
        rollNo: candidate.rollNo,
        reason,
        decisionEntry 
      });
      // Do NOT close channel so Chromium dispatches without drop
    } catch {}

    try {
      localStorage.setItem('edu360_student_disqualified', JSON.stringify({
        candidateId: candidate.id,
        rollNo: candidate.rollNo,
        reason,
        at: Date.now()
      }));
    } catch {}

    triggerToast(`🔴 Disqualified: Candidate ${candidate.name} (Roll #${candidate.rollNo}) disqualified & removed from active grid.`);
    setEvictModalCandidate(null);
    setActiveMalpracticeAlert(null);
  };"""

assert old_disq_fn in code, "Could not find old_disq_fn"
code = code.replace(old_disq_fn, new_disq_fn)

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Successfully updated live-invigilator-cockpit.tsx!")

# -------------------------------------------------------------
# 2. Patch frontend/src/app/teacher/page.tsx
# -------------------------------------------------------------
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    tcode = f.read()

# Add lastTeacherMalpracticeNonceRef
ref_target = "  const [activeMalpracticeAlerts, setActiveMalpracticeAlerts] = useState<MalpracticeNotification[]>([]);"
new_ref_target = """  const lastTeacherMalpracticeNonceRef = useRef<any>(0);
  const [activeMalpracticeAlerts, setActiveMalpracticeAlerts] = useState<MalpracticeNotification[]>([]);"""

if 'lastTeacherMalpracticeNonceRef' not in tcode:
    assert ref_target in tcode, "Could not find activeMalpracticeAlerts in teacher/page.tsx"
    tcode = tcode.replace(ref_target, new_ref_target)

# Add storage listener for edu360_latest_malpractice_alert in teacher/page.tsx
old_teacher_listener_end = """        // Student Uploads Answer Script PDF within 15-Minute Window
        if (data.type === 'STUDENT_SCRIPT_UPLOADED') {
          triggerToast(`📄 New PDF Answer Script received from ${data.studentName} (Roll #${data.rollNo})! Seal Code: ${data.sealCode}`);
          setUploadedSubmissions(prev => [data, ...prev.filter(s => s.candidateId !== data.candidateId || s.subject !== data.subject)]);
        }
      };
    } catch {}
    return () => {
      if (channel) channel.close();
    };
  }, []);"""

new_teacher_listener_end = """        // Student Uploads Answer Script PDF within 15-Minute Window
        if (data.type === 'STUDENT_SCRIPT_UPLOADED') {
          triggerToast(`📄 New PDF Answer Script received from ${data.studentName} (Roll #${data.rollNo})! Seal Code: ${data.sealCode}`);
          setUploadedSubmissions(prev => [data, ...prev.filter(s => s.candidateId !== data.candidateId || s.subject !== data.subject)]);
        }
      };
    } catch {}

    // Multi-Window & Tab-Switch Real-Time Watcher for Malpractice Alerts
    const handleStorageMalpractice = () => {
      try {
        const raw = localStorage.getItem('edu360_latest_malpractice_alert');
        if (raw) {
          const data = JSON.parse(raw);
          const nonce = data.nonce || data.timestamp;
          if (data && nonce && lastTeacherMalpracticeNonceRef.current !== nonce) {
            lastTeacherMalpracticeNonceRef.current = nonce;
            const alertId = `malpractice-${Date.now()}-${data.candidateId || 1}`;
            const newAlert: MalpracticeNotification = {
              id: alertId,
              candidateId: data.candidateId || 1,
              studentName: data.studentName || 'Aarav Sharma',
              rollNo: data.rollNo || '14',
              className: data.className || 'Class 8-B',
              malpracticeType: data.malpracticeType || data.anomalyType || 'TAB_SWITCH',
              title: data.title || 'Unauthorized Behavior Flagged',
              ruleTriggered: data.ruleTriggered || 'Proctor Violation Detected',
              confidence: data.confidence || 1.0,
              strikes: data.strikes !== undefined ? data.strikes : 1,
              timestamp: data.timestamp || new Date().toLocaleTimeString()
            };

            setActiveMalpracticeAlerts(prev => [newAlert, ...prev.filter(a => a.candidateId !== newAlert.candidateId).slice(0, 2)]);

            // Sound audio attention chime
            try {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioContextClass) {
                const audioCtx = new AudioContextClass();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.25);
                gain.gain.setValueAtTime(0.16, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.32);
              }
            } catch {}

            setTimeout(() => {
              setActiveMalpracticeAlerts(prev => prev.filter(a => a.id !== alertId));
            }, 15000);
          }
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageMalpractice);
    const storagePoll = setInterval(handleStorageMalpractice, 500);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageMalpractice);
      clearInterval(storagePoll);
    };
  }, []);"""

assert old_teacher_listener_end in tcode, "Could not find old_teacher_listener_end in teacher/page.tsx"
tcode = tcode.replace(old_teacher_listener_end, new_teacher_listener_end)

with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
    f.write(tcode)

print("Successfully updated teacher/page.tsx!")
