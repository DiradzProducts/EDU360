# -*- coding: utf-8 -*-
"""
Patch frontend/src/components/online-exam-modal.tsx to fine-tune YOLO detections,
eliminate the 8s box lockout, set audio threshold to 60dB, head turn to 5.0s,
and broadcast explicit MALPRACTICE_ALERT events for the teacher's left corner popup.
"""

with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update triggerProctorViolation to include MALPRACTICE_ALERT
old_post_msg = """    // Sync Telemetry & Analysis Entry across BroadcastChannel
    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({
        type: 'STUDENT_TELEMETRY',
        candidateId: candidateId || 1,
        studentName: studentName || 'Aarav Sharma',
        rollNo: '14',
        strikes: nextStrikes,
        isCritical: nextStrikes >= 2,
        anomalyType: params.category,
        ruleTriggered: params.ruleTriggered,
        confidence: params.confidence,
        actionTaken: params.actionTaken,
        analysisEntry: newEntry,
        timestamp: timeStr,
        cameraActive: true,
        audioDb: liveAudioDecibelsRef.current || 38,
        gaze: yoloGazeStatus
      });
      channel.close();
    } catch {}"""

new_post_msg = """    // Sync Telemetry & Analysis Entry & Left Corner Malpractice Alert across BroadcastChannel
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
        gaze: yoloGazeStatus
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

      channel.close();
    } catch {}"""

if old_post_msg in content:
    content = content.replace(old_post_msg, new_post_msg, 1)
    print("Step 1: Added MALPRACTICE_ALERT to triggerProctorViolation.")
else:
    print("Step 1: old_post_msg not found.")

# 2. Fix on-screen transient bounding box timers: Eliminate 8s lockout so items can be detected reliably
old_box_timers = """        // 1. Phone Bounding Box: Show for exactly 2.5s on detection, then auto-dismiss
        if (detectedPhone) {
          if (!boxAlertStartTimes.current.phone || (now - boxAlertStartTimes.current.phone > 8000)) {
            boxAlertStartTimes.current.phone = now;
            setVisibleBoxAlerts(prev => ({ ...prev, phone: true }));
          } else if (now - boxAlertStartTimes.current.phone >= 2500) {
            setVisibleBoxAlerts(prev => ({ ...prev, phone: false }));
          }
        } else {
          if (boxAlertStartTimes.current.phone && (now - boxAlertStartTimes.current.phone >= 2500)) {
            setVisibleBoxAlerts(prev => ({ ...prev, phone: false }));
            if (now - boxAlertStartTimes.current.phone > 8000) {
              boxAlertStartTimes.current.phone = 0;
            }
          }
        }

        // 2. Book Bounding Box: Show for exactly 2.5s on detection, then auto-dismiss
        if (detectedBook) {
          if (!boxAlertStartTimes.current.book || (now - boxAlertStartTimes.current.book > 8000)) {
            boxAlertStartTimes.current.book = now;
            setVisibleBoxAlerts(prev => ({ ...prev, book: true }));
          } else if (now - boxAlertStartTimes.current.book >= 2500) {
            setVisibleBoxAlerts(prev => ({ ...prev, book: false }));
          }
        } else {
          if (boxAlertStartTimes.current.book && (now - boxAlertStartTimes.current.book >= 2500)) {
            setVisibleBoxAlerts(prev => ({ ...prev, book: false }));
            if (now - boxAlertStartTimes.current.book > 8000) {
              boxAlertStartTimes.current.book = 0;
            }
          }
        }

        // 3. Second Person Box: Show for exactly 2.5s on detection, then auto-dismiss
        if (detectedPersonsCount >= 2) {
          if (!boxAlertStartTimes.current.person2 || (now - boxAlertStartTimes.current.person2 > 8000)) {
            boxAlertStartTimes.current.person2 = now;
            setVisibleBoxAlerts(prev => ({ ...prev, person2: true }));
          } else if (now - boxAlertStartTimes.current.person2 >= 2500) {
            setVisibleBoxAlerts(prev => ({ ...prev, person2: false }));
          }
        } else {
          if (boxAlertStartTimes.current.person2 && (now - boxAlertStartTimes.current.person2 >= 2500)) {
            setVisibleBoxAlerts(prev => ({ ...prev, person2: false }));
            if (now - boxAlertStartTimes.current.person2 > 8000) {
              boxAlertStartTimes.current.person2 = 0;
            }
          }
        }"""

new_box_timers = """        // 1. Phone Bounding Box: Responsive 3.0s transient HUD alert, auto-resets when removed
        if (detectedPhone) {
          if (!boxAlertStartTimes.current.phone || (now - boxAlertStartTimes.current.phone > 3200)) {
            boxAlertStartTimes.current.phone = now;
            setVisibleBoxAlerts(prev => ({ ...prev, phone: true }));
          }
        } else {
          if (boxAlertStartTimes.current.phone && (now - boxAlertStartTimes.current.phone > 1000)) {
            setVisibleBoxAlerts(prev => ({ ...prev, phone: false }));
            boxAlertStartTimes.current.phone = 0;
          }
        }

        // 2. Book Bounding Box: Responsive 3.0s transient HUD alert, auto-resets when removed
        if (detectedBook) {
          if (!boxAlertStartTimes.current.book || (now - boxAlertStartTimes.current.book > 3200)) {
            boxAlertStartTimes.current.book = now;
            setVisibleBoxAlerts(prev => ({ ...prev, book: true }));
          }
        } else {
          if (boxAlertStartTimes.current.book && (now - boxAlertStartTimes.current.book > 1000)) {
            setVisibleBoxAlerts(prev => ({ ...prev, book: false }));
            boxAlertStartTimes.current.book = 0;
          }
        }

        // 3. Second Person Box: Responsive 3.0s transient alert, auto-resets when cleared
        if (detectedPersonsCount >= 2) {
          if (!boxAlertStartTimes.current.person2 || (now - boxAlertStartTimes.current.person2 > 3200)) {
            boxAlertStartTimes.current.person2 = now;
            setVisibleBoxAlerts(prev => ({ ...prev, person2: true }));
          }
        } else {
          if (boxAlertStartTimes.current.person2 && (now - boxAlertStartTimes.current.person2 > 1000)) {
            setVisibleBoxAlerts(prev => ({ ...prev, person2: false }));
            boxAlertStartTimes.current.person2 = 0;
          }
        }"""

if old_box_timers in content:
    content = content.replace(old_box_timers, new_box_timers, 1)
    print("Step 2: Replaced bounding box timers without 8s lockout.")
else:
    print("Step 2: old_box_timers not found.")

# 3. Fix Audio Threshold to 60 dB
old_audio = """        // ── 6. AUDIO ACOUSTIC ANOMALY CHANNEL (> 68 dB Sustained) ──
        const currentAudioDb = liveAudioDecibelsRef.current || 38;
        if (currentAudioDb >= 68) {
          audioSpikeFramesCounter.current += 1;
          if (audioSpikeFramesCounter.current >= 6) { // 1.5s sustained loud audio/speech
            audioSpikeFramesCounter.current = 0;
            triggerProctorViolation({
              category: 'AUDIO_ANOMALY',
              title: 'Acoustic Spike / Voice Detected',
              ruleTriggered: `Audio: Decibel > 68dB (${currentAudioDb} dB sustained > 1.5s) ──> Audio Anomaly 🎙️`,
              confidence: 0.89,
              actionTaken: 'ANOMALY_LOG',
              notes: `Microphone decibels sustained at ${currentAudioDb} dB above 68dB threshold.`
            });
          }
        } else {
          audioSpikeFramesCounter.current = Math.max(0, audioSpikeFramesCounter.current - 1);
        }"""

new_audio = """        // ── 6. AUDIO ACOUSTIC ANOMALY CHANNEL (> 60 dB Sustained) ──
        const currentAudioDb = liveAudioDecibelsRef.current || 38;
        if (currentAudioDb >= 60) {
          audioSpikeFramesCounter.current += 1;
          if (audioSpikeFramesCounter.current >= 4) { // 1.0s sustained loud audio/speech
            audioSpikeFramesCounter.current = 0;
            triggerProctorViolation({
              category: 'AUDIO_ANOMALY',
              title: 'Acoustic Spike / Voice Detected',
              ruleTriggered: `Audio: Decibel > 60dB (${currentAudioDb} dB sustained > 1.0s) ──> Audio Anomaly 🎙️`,
              confidence: 0.91,
              actionTaken: 'ANOMALY_LOG',
              notes: `Microphone decibels sustained at ${currentAudioDb} dB above 60dB threshold.`
            });
          }
        } else {
          audioSpikeFramesCounter.current = Math.max(0, audioSpikeFramesCounter.current - 1);
        }"""

if old_audio in content:
    content = content.replace(old_audio, new_audio, 1)
    print("Step 3: Lowered audio threshold to 60 dB sustained.")
else:
    print("Step 3: old_audio not found.")

# 4. Fix Gaze Head Turn to 5.0 seconds (20 frames)
old_gaze = """        // ── 5. HEAD TURNED AWAY FROM DESK CHANNEL (Sustained Turn, Not Minor Movements) ──
        if (detectedPersonsCount === 1) {
          const isTurnedLeft = faceNormX < 0.35;
          const isTurnedRight = faceNormX > 0.65;

          if (isTurnedLeft || isTurnedRight) {
            const dir = isTurnedLeft ? 'Turned Left' : 'Turned Right';
            setYoloGazeStatus(dir);
            gazeTurnFramesCounter.current += 1;
            const currentGazeSeconds = Number((gazeTurnFramesCounter.current * 0.25).toFixed(1));
            setLiveGazeTimer(currentGazeSeconds);

            if (gazeTurnFramesCounter.current >= 18) { // 4.5s sustained head turn
              gazeTurnFramesCounter.current = 0;
              setLiveGazeTimer(0);
              triggerProctorViolation({
                category: 'GAZE_DRIFT',
                title: `Gaze Shifted Away from Desk (Head ${dir})`,
                ruleTriggered: `Face Mesh: Gaze Direction ──> Sustained head turn away > 4.5s (${dir}) ──> Gentle Warning Nudge 👁️`,
                confidence: 0.92,
                actionTaken: 'WARNING',
                notes: `Candidate head turned away from physical exam desk for >4.5 seconds (${dir}).`
              });
            }
          } else {
            setYoloGazeStatus('Centered on Desk');
            gazeTurnFramesCounter.current = Math.max(0, gazeTurnFramesCounter.current - 1);
            setLiveGazeTimer(Number((gazeTurnFramesCounter.current * 0.25).toFixed(1)));
          }
        }"""

new_gaze = """        // ── 5. HEAD TURNED AWAY FROM DESK CHANNEL (Sustained Turn > 5.0s, Not Minor Movements) ──
        if (detectedPersonsCount === 1) {
          const isTurnedLeft = faceNormX < 0.38;
          const isTurnedRight = faceNormX > 0.62;

          if (isTurnedLeft || isTurnedRight) {
            const dir = isTurnedLeft ? 'Turned Left' : 'Turned Right';
            setYoloGazeStatus(dir);
            gazeTurnFramesCounter.current += 1;
            const currentGazeSeconds = Number((gazeTurnFramesCounter.current * 0.25).toFixed(1));
            setLiveGazeTimer(currentGazeSeconds);

            if (gazeTurnFramesCounter.current >= 20) { // Exactly 5.0s sustained head turn
              gazeTurnFramesCounter.current = 0;
              setLiveGazeTimer(0);
              triggerProctorViolation({
                category: 'GAZE_DRIFT',
                title: `Gaze Shifted Away from Desk (Head ${dir})`,
                ruleTriggered: `Face Mesh: Gaze Direction ──> Sustained head turn away > 5.0s (${dir}) ──> Gentle Warning Nudge 👁️`,
                confidence: 0.94,
                actionTaken: 'WARNING',
                notes: `Candidate head turned away from physical exam desk for >5.0 seconds (${dir}).`
              });
            }
          } else {
            setYoloGazeStatus('Centered on Desk');
            gazeTurnFramesCounter.current = Math.max(0, gazeTurnFramesCounter.current - 1);
            setLiveGazeTimer(Number((gazeTurnFramesCounter.current * 0.25).toFixed(1)));
          }
        }"""

if old_gaze in content:
    content = content.replace(old_gaze, new_gaze, 1)
    print("Step 4: Updated gaze turn to exactly 5.0 seconds threshold.")
else:
    print("Step 4: old_gaze not found.")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("online-exam-modal.tsx patched successfully.")
