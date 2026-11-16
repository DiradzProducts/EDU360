# -*- coding: utf-8 -*-
"""
Patch frontend/src/components/online-exam-modal.tsx to broadcast frame snapshots every ~750ms
"""

with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add frame broadcaster inside processInterval
target_interval_start = """    // 4. Autonomous Multi-Channel Inference Loop (Runs every 250ms)
    const processInterval = setInterval(async () => {
      if (!isMounted) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !ctx) return;"""

replacement_interval_start = """    let frameTick = 0;

    // 4. Autonomous Multi-Channel Inference Loop (Runs every 250ms)
    const processInterval = setInterval(async () => {
      if (!isMounted) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !ctx) return;

      frameTick++;
      // Broadcast downscaled video frame to Teacher Live Cockpit every ~750ms (every 3rd tick)
      if (frameTick % 3 === 0) {
        try {
          const frameData = visionCanvas.toDataURL('image/jpeg', 0.4);
          const channel = new BroadcastChannel('edu360_exam_live_channel');
          channel.postMessage({
            type: 'STUDENT_FRAME',
            candidateId: candidateId || 1,
            studentName: studentName || 'Aarav Sharma',
            rollNo: '14',
            frame: frameData
          });
          channel.close();
        } catch {}
      }"""

if target_interval_start in content:
    content = content.replace(target_interval_start, replacement_interval_start, 1)
    with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("online-exam-modal.tsx frame broadcaster added successfully.")
else:
    print("Target not found in online-exam-modal.tsx.")
