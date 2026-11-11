with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = """    api.sendProctorAction({
      candidate_id: candidate.id,
      action,
      reason: willPause ? 'Invigilator paused session for desk verification' : 'Invigilator resumed exam'
    }).catch(console.error);"""

replacement = """    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ type: willPause ? 'EXAM_PAUSE' : 'EXAM_RESUME', candidateId: candidate.id });
      channel.close();
    } catch {}

    api.sendProctorAction({
      candidate_id: candidate.id,
      action,
      reason: willPause ? 'Invigilator paused session for desk verification' : 'Invigilator resumed exam'
    }).catch(console.error);"""

if target in text:
    text = text.replace(target, replacement, 1)
    print("Added BroadcastChannel dispatch to handleTogglePause!")
else:
    print("Warning: target not matched")

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
