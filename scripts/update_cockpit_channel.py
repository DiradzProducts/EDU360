with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add BroadcastChannel receiver before useEffect
old_effect = """  useEffect(() => {
    loadCandidates();
    const interval = setInterval(loadCandidates, 3500);
    return () => clearInterval(interval);
  }, []);"""

new_effect = """  // Real-Time Cross-Window Synchronization with Student Exam Hall
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

  useEffect(() => {
    loadCandidates();
    const interval = setInterval(loadCandidates, 3500);
    return () => clearInterval(interval);
  }, []);"""

if old_effect in text:
    text = text.replace(old_effect, new_effect, 1)
    print("Added BroadcastChannel receiver to live-invigilator-cockpit.tsx!")
else:
    print("Warning: old_effect not found")

# 2. Update handleTogglePause to dispatch BroadcastChannel
idx_pause = text.find('api.sendProctorAction({')
if idx_pause != -1:
    target_pause_dispatch = """    api.sendProctorAction({
      candidate_id: candidate.id,
      action: action,
      reason: willPause ? 'Posture check requested by invigilator' : 'Verification complete'
    }).catch(console.error);"""

    repl_pause_dispatch = """    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ type: willPause ? 'EXAM_PAUSE' : 'EXAM_RESUME', candidateId: candidate.id });
      channel.close();
    } catch {}

    api.sendProctorAction({
      candidate_id: candidate.id,
      action: action,
      reason: willPause ? 'Posture check requested by invigilator' : 'Verification complete'
    }).catch(console.error);"""

    if target_pause_dispatch in text:
        text = text.replace(target_pause_dispatch, repl_pause_dispatch, 1)
        print("Added BroadcastChannel dispatch to handleTogglePause!")

# 3. Update handleBroadcast to dispatch BroadcastChannel
target_bcast = """  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    triggerToast(`Room Announcement Broadcasted: "${broadcastMessage}"`);
    setBroadcastMessage('');
  };"""

repl_bcast = """  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ type: 'INTERCOM_BROADCAST', message: broadcastMessage });
      channel.close();
    } catch {}
    triggerToast(`Room Announcement Broadcasted: "${broadcastMessage}"`);
    setBroadcastMessage('');
  };"""

if target_bcast in text:
    text = text.replace(target_bcast, repl_bcast, 1)
    print("Added BroadcastChannel dispatch to handleBroadcast!")

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved live-invigilator-cockpit.tsx!")
