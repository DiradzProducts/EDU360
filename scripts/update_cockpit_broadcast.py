with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add BroadcastChannel listener in useEffect
target_effect_spot = """  // Initial fetch and poller for real-time candidate updates"""

repl_effect_spot = """  // Real-Time Cross-Window Synchronization with Student Exam Hall
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;

        if (data.type === 'STUDENT_TELEMETRY' && data.candidateId) {
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId) {
              const newStrikes = data.strikes !== undefined ? data.strikes : c.strikes;
              return {
                ...c,
                strikes: newStrikes,
                status: (newStrikes >= 2 || data.isCritical) ? 'critical' : newStrikes === 1 ? 'warning' : c.status,
                anomalyType: data.anomalyType || c.anomalyType,
                cameraActive: data.cameraActive !== undefined ? data.cameraActive : c.cameraActive,
                decibels: data.audioDb || c.decibels,
                gaze: data.gaze || c.gaze
              };
            }
            return c;
          }));
        }
      };
    } catch {}

    return () => {
      if (channel) channel.close();
    };
  }, []);

  // Initial fetch and poller for real-time candidate updates"""

if target_effect_spot in text:
    text = text.replace(target_effect_spot, repl_effect_spot, 1)
    print("Added BroadcastChannel receiver to live-invigilator-cockpit.tsx!")

# 2. Add BroadcastChannel dispatch to handleSendWarning
target_warn = """    api.sendProctorAction({
      candidate_id: candidateId,
      action: 'NUDGE',
      reason: message
    }).catch(console.error);"""

repl_warn = """    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ type: 'ISSUE_WARNING', candidateId, message });
      channel.close();
    } catch {}

    api.sendProctorAction({
      candidate_id: candidateId,
      action: 'NUDGE',
      reason: message
    }).catch(console.error);"""

if target_warn in text:
    text = text.replace(target_warn, repl_warn, 1)
    print("Added BroadcastChannel dispatch to handleSendWarning!")

# 3. Add BroadcastChannel dispatch to handleTogglePause
target_pause = """    triggerToast(willPause 
      ? `Paused exam for ${candidate.name}. Timer frozen on candidate device.`
      : `Resumed exam for ${candidate.name}. Timer active.`
    );"""

repl_pause = """    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ type: willPause ? 'EXAM_PAUSE' : 'EXAM_RESUME', candidateId: candidate.id });
      channel.close();
    } catch {}

    triggerToast(willPause 
      ? `Paused exam for ${candidate.name}. Timer frozen on candidate device.`
      : `Resumed exam for ${candidate.name}. Timer active.`
    );"""

if target_pause in text:
    text = text.replace(target_pause, repl_pause, 1)
    print("Added BroadcastChannel dispatch to handleTogglePause!")

# 4. Add BroadcastChannel dispatch to handleBroadcast
target_bcast = """    triggerToast(`Broadcast announcement sent to all active candidates.`);
    setBroadcastMessage('');"""

repl_bcast = """    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ type: 'INTERCOM_BROADCAST', message: broadcastMessage });
      channel.close();
    } catch {}

    triggerToast(`Broadcast announcement sent to all active candidates.`);
    setBroadcastMessage('');"""

if target_bcast in text:
    text = text.replace(target_bcast, repl_bcast, 1)
    print("Added BroadcastChannel dispatch to handleBroadcast!")

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved live-invigilator-cockpit.tsx updates!")
