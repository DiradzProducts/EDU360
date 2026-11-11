# -*- coding: utf-8 -*-
import sys

with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# ─────────────────────────────────────────────────────────────────────────────
# 1. FIX recordTabSwitchViolation DOUBLE-COOLDOWN BUG
# Remove premature lastCategoryViolationTime mutation that caused triggerProctorViolation to abort!
# ─────────────────────────────────────────────────────────────────────────────
old_record_tab = """    const recordTabSwitchViolation = (reason: string) => {
      const now = Date.now();
      if (now - (lastCategoryViolationTime.current['TAB_SWITCH'] || 0) < 2500) {
        return;
      }
      lastCategoryViolationTime.current['TAB_SWITCH'] = now;

      setTabSwitchCount((prev) => {
        const nextCount = prev + 1;
        if (triggerProctorViolationRef.current) {
          triggerProctorViolationRef.current({
            category: 'TAB_SWITCH',
            title: 'Unauthorized Browser Tab / Window Focus Lost',
            ruleTriggered: `Window Focus Lost ──> Student navigated away from exam (${reason})`,
            confidence: 1.0,
            actionTaken: 'WARNING',
            notes: `Candidate left examination window focus (Incident #${nextCount}: ${reason}).`
          });
        }
        return nextCount;
      });
    };"""

new_record_tab = """    const recordTabSwitchViolation = (reason: string) => {
      setTabSwitchCount((prev) => {
        const nextCount = prev + 1;
        if (triggerProctorViolationRef.current) {
          triggerProctorViolationRef.current({
            category: 'TAB_SWITCH',
            title: 'Unauthorized Browser Tab / Window Focus Lost',
            ruleTriggered: `Window Focus Lost ──> Student navigated away from exam (${reason})`,
            confidence: 1.0,
            actionTaken: 'WARNING',
            notes: `Candidate left examination window focus (Incident #${nextCount}: ${reason}).`
          });
        }
        return nextCount;
      });
    };"""

if old_record_tab in content:
    content = content.replace(old_record_tab, new_record_tab, 1)
    print("Step 1: Fixed recordTabSwitchViolation double-cooldown bug.")
else:
    print("Step 1 WARNING: old_record_tab not found, checking alternatives...")
    alt_record_tab = "lastCategoryViolationTime.current['TAB_SWITCH'] = now;"
    # Let's inspect where this line occurs if exact block didn't match

# ─────────────────────────────────────────────────────────────────────────────
# 2. UPDATE triggerProctorViolation COOLDOWNS
# AUDIO: 15s, TAB_SWITCH: 2.5s, OTHERS: 6s
# ─────────────────────────────────────────────────────────────────────────────
old_cooldown = "const cooldownMs = params.category === 'TAB_SWITCH' ? 4000 : 7000;"
new_cooldown = "const cooldownMs = params.category === 'AUDIO_ANOMALY' ? 15000 : (params.category === 'TAB_SWITCH' ? 2500 : 6000);"

if old_cooldown in content:
    content = content.replace(old_cooldown, new_cooldown, 1)
    print("Step 2: Cooldowns in triggerProctorViolation updated.")
else:
    print("Step 2 WARNING: old_cooldown not found.")

# ─────────────────────────────────────────────────────────────────────────────
# 3. FIX COCO-SSD DETECTION THRESHOLDS & GROUND-TRUTH ABSENCE
# ─────────────────────────────────────────────────────────────────────────────
old_coco_block = """        if (cocoModel) {
          try {
            const preds = await cocoModel.detect(video);
            const phoneObj = preds.find((p: any) => (p.class === 'cell phone' || p.class === 'remote') && p.score >= 0.50);
            if (phoneObj) {
              detectedPhone = true;
              phoneConf = phoneObj.score;
            }
            const bookObj = preds.find((p: any) => p.class === 'book' && p.score >= 0.52);
            if (bookObj) {
              detectedBook = true;
              bookConf = bookObj.score;
            }
            const personObjs = preds.filter((p: any) => p.class === 'person' && p.score >= 0.45);
            // Ground truth person count: If neural detector sees 0, candidate is absent!
            detectedPersonsCount = personObjs.length;
          } catch {}
        } else if (nativeFacesCount !== -1) {
          detectedPersonsCount = nativeFacesCount;
        } else {
          detectedPersonsCount = skinPixels >= 65 ? 1 : 0;
        }"""

new_coco_block = """        if (cocoModel) {
          try {
            const preds = await cocoModel.detect(video);
            // Reliable detection sensitivity (0.40 for phone/remote, 0.40 for book, 0.40 for person)
            const phoneObj = preds.find((p: any) => (p.class === 'cell phone' || p.class === 'remote') && p.score >= 0.40);
            if (phoneObj) {
              detectedPhone = true;
              phoneConf = phoneObj.score;
            }
            const bookObj = preds.find((p: any) => p.class === 'book' && p.score >= 0.40);
            if (bookObj) {
              detectedBook = true;
              bookConf = bookObj.score;
            }
            const personObjs = preds.filter((p: any) => p.class === 'person' && p.score >= 0.40);
            // Ground truth person count: If neural detector sees 0, candidate is 100% absent!
            detectedPersonsCount = personObjs.length;
          } catch {}
        } else if (nativeFacesCount !== -1) {
          detectedPersonsCount = nativeFacesCount;
        } else {
          // Canvas fallback: Require a true dense face cluster (200-6000 skin pixels), never trigger on ambient warm room background
          detectedPersonsCount = (skinPixels >= 200 && skinPixels <= 6000) ? 1 : 0;
        }"""

if old_coco_block in content:
    content = content.replace(old_coco_block, new_coco_block, 1)
    print("Step 3: COCO detection thresholds and ground-truth absence updated.")
else:
    print("Step 3 WARNING: old_coco_block not found.")

# ─────────────────────────────────────────────────────────────────────────────
# 4. FIX BOOK & PHONE GEOMETRIC VERIFICATION THRESHOLDS
# ─────────────────────────────────────────────────────────────────────────────
old_geom_block = """        // Step E: Book Verification (Distinct from desk paper)
        if (textLineGradientRows >= 16 && detectedPersonsCount >= 1) {
          detectedBook = true;
          bookConf = Math.max(bookConf, 0.84);
        }"""

new_geom_block = """        // Step E: Book Verification (Distinct from desk paper)
        if (textLineGradientRows >= 12 && detectedPersonsCount >= 1) {
          detectedBook = true;
          bookConf = Math.max(bookConf, 0.84);
        }"""

if old_geom_block in content:
    content = content.replace(old_geom_block, new_geom_block, 1)
    print("Step 4: Book geometric gradient rows updated.")
else:
    print("Step 4 WARNING: old_geom_block not found.")

# ─────────────────────────────────────────────────────────────────────────────
# 5. TRANSIENT ON-SCREEN HUD BOUNDING BOXES (Exactly 2.5s duration, 8s re-alert cooldown)
# ─────────────────────────────────────────────────────────────────────────────
old_hud_timers = """        // 1. Phone Bounding Box: Show for 2.5s on detection, then fade
        if (detectedPhone) {
          if (!boxAlertStartTimes.current.phone || (now - boxAlertStartTimes.current.phone > 7000)) {
            boxAlertStartTimes.current.phone = now;
            setVisibleBoxAlerts(prev => ({ ...prev, phone: true }));
          } else if (now - boxAlertStartTimes.current.phone > 2500) {
            setVisibleBoxAlerts(prev => ({ ...prev, phone: false }));
          }
        } else {
          if (now - boxAlertStartTimes.current.phone > 2500) {
            boxAlertStartTimes.current.phone = 0;
            setVisibleBoxAlerts(prev => ({ ...prev, phone: false }));
          }
        }

        // 2. Book Bounding Box: Show for 2.5s on detection, then fade
        if (detectedBook) {
          if (!boxAlertStartTimes.current.book || (now - boxAlertStartTimes.current.book > 7000)) {
            boxAlertStartTimes.current.book = now;
            setVisibleBoxAlerts(prev => ({ ...prev, book: true }));
          } else if (now - boxAlertStartTimes.current.book > 2500) {
            setVisibleBoxAlerts(prev => ({ ...prev, book: false }));
          }
        } else {
          if (now - boxAlertStartTimes.current.book > 2500) {
            boxAlertStartTimes.current.book = 0;
            setVisibleBoxAlerts(prev => ({ ...prev, book: false }));
          }
        }

        // 3. Second Person Box: Show for 2.5s on detection, then fade
        if (detectedPersonsCount >= 2) {
          if (!boxAlertStartTimes.current.person2 || (now - boxAlertStartTimes.current.person2 > 7000)) {
            boxAlertStartTimes.current.person2 = now;
            setVisibleBoxAlerts(prev => ({ ...prev, person2: true }));
          } else if (now - boxAlertStartTimes.current.person2 > 2500) {
            setVisibleBoxAlerts(prev => ({ ...prev, person2: false }));
          }
        } else {
          if (now - boxAlertStartTimes.current.person2 > 2500) {
            boxAlertStartTimes.current.person2 = 0;
            setVisibleBoxAlerts(prev => ({ ...prev, person2: false }));
          }
        }"""

new_hud_timers = """        // 1. Phone Bounding Box: Show for exactly 2.5s on detection, then auto-dismiss
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

if old_hud_timers in content:
    content = content.replace(old_hud_timers, new_hud_timers, 1)
    print("Step 5: HUD bounding box timers updated.")
else:
    print("Step 5 WARNING: old_hud_timers not found.")

# ─────────────────────────────────────────────────────────────────────────────
# 6. FAST 2-FRAME (500ms) CONFIRMATION FOR ALL CHANNELS
# ─────────────────────────────────────────────────────────────────────────────
old_multi_channels = """        // ── 1. CELL PHONE CHANNEL ──
        if (detectedPhone) {
          setActiveDetectedObject('Cell Phone (Handheld)');
          cellPhoneTimer.current += 1;
          const currentPhoneSeconds = Number((cellPhoneTimer.current * 0.25).toFixed(1));
          setLivePhoneTimer(currentPhoneSeconds);

          if (cellPhoneTimer.current >= 4) { // 1.0s sustained
            cellPhoneTimer.current = 0;
            setLivePhoneTimer(0);
            const isCompound = detectedPersonsCount >= 2;
            triggerProctorViolation({
              category: 'CELL_PHONE',
              title: isCompound 
                ? 'Severe Malpractice: Unauthorized Mobile Device & Second Person Detected'
                : 'Unauthorized Mobile Device Detected',
              ruleTriggered: isCompound
                ? `Object: 'cell phone' + 'person' (count: ${detectedPersonsCount}) ──> Mobile with Second Person Present 🚨`
                : `Object: 'cell phone' ──> Handheld Mobile Phone Flagged (Confidence: ${(phoneConf * 100).toFixed(0)}%) ──> Strike Applied 🚨`,
              confidence: phoneConf,
              actionTaken: 'STRIKE',
              notes: isCompound 
                ? `Candidate raised mobile phone with ${detectedPersonsCount} persons identified in examination zone.`
                : 'Candidate raised mobile phone into examination camera area.'
            });
          }
        } else {
          cellPhoneTimer.current = Math.max(0, cellPhoneTimer.current - 1);
          setLivePhoneTimer(Number((cellPhoneTimer.current * 0.25).toFixed(1)));
          if (cellPhoneTimer.current === 0 && activeDetectedObject && activeDetectedObject.includes('Cell Phone')) {
            setActiveDetectedObject(null);
          }
        }

        // ── 2. UNAUTHORIZED BOOK CHANNEL ──
        if (detectedBook) {
          if (!activeDetectedObject || !activeDetectedObject.includes('Cell Phone')) {
            setActiveDetectedObject('Physical Book / Notes');
          }
          bookTimer.current += 1;
          const currentBookSeconds = Number((bookTimer.current * 0.25).toFixed(1));
          setLiveBookTimer(currentBookSeconds);

          if (bookTimer.current >= 4) { // 1.0s sustained
            bookTimer.current = 0;
            setLiveBookTimer(0);
            const isCompound = detectedPersonsCount >= 2;
            triggerProctorViolation({
              category: 'BOOK_DETECTED',
              title: isCompound
                ? 'Severe Malpractice: Unauthorized Book & Second Person Detected'
                : 'Unauthorized Book / Reading Material Flagged',
              ruleTriggered: isCompound
                ? `Object: 'book' + 'person' (count: ${detectedPersonsCount}) ──> Reading Material with Second Person Present 🚨`
                : `Object: 'book' ──> Printed Reading Material Detected (Confidence: ${(bookConf * 100).toFixed(0)}%) ──> Strike Applied 🚨`,
              confidence: bookConf,
              actionTaken: 'STRIKE',
              notes: isCompound
                ? `Candidate consulted textbook with ${detectedPersonsCount} persons identified in examination zone.`
                : 'Candidate consulted external printed textbook or unauthorized notes.'
            });
          }
        } else {
          bookTimer.current = Math.max(0, bookTimer.current - 1);
          setLiveBookTimer(Number((bookTimer.current * 0.25).toFixed(1)));
          if (bookTimer.current === 0 && activeDetectedObject && activeDetectedObject.includes('Book')) {
            setActiveDetectedObject(null);
          }
        }

        // ── 3. MULTIPLE PERSONS IN ROOM CHANNEL ──
        if (detectedPersonsCount >= 2) {
          multiPersonFramesCounter.current += 1;
          if (multiPersonFramesCounter.current >= 4) { // 1.0s sustained
            multiPersonFramesCounter.current = 0;
            triggerProctorViolation({
              category: 'MULTIPLE_PERSONS',
              title: 'Multiple Persons Detected in Testing Zone',
              ruleTriggered: `Object: 'person' (count: ${detectedPersonsCount} > 1) ──> Second person present in room ──> Red Alert 👥`,
              confidence: 0.95,
              actionTaken: 'STRIKE',
              notes: `${detectedPersonsCount} distinct people identified in examination room.`
            });
          }
        } else {
          multiPersonFramesCounter.current = Math.max(0, multiPersonFramesCounter.current - 1);
        }

        // ── 4. CANDIDATE ABSENCE CHANNEL (Desk Empty > 2.0s) ──
        if (detectedPersonsCount === 0) {
          setYoloGazeStatus('Desk Empty (Absent)');
          gazeTurnFramesCounter.current = 0;
          setLiveGazeTimer(0);

          absentFramesCounter.current += 1;
          const currentAbsentSeconds = Number((absentFramesCounter.current * 0.25).toFixed(1));
          setLiveAbsentTimer(currentAbsentSeconds);

          if (absentFramesCounter.current >= 8) { // 2.0s sustained empty desk
            absentFramesCounter.current = 0;
            setLiveAbsentTimer(0);
            triggerProctorViolation({
              category: 'STUDENT_ABSENT',
              title: 'Candidate Missing from Examination Desk',
              ruleTriggered: 'Presence Detection ──> Candidate absent from camera frame > 2s ──> Immediate Strike 🚨',
              confidence: 0.98,
              actionTaken: 'STRIKE',
              notes: 'Candidate moved away from examination camera frame for more than 2 continuous seconds.'
            });
          }
        } else {
          absentFramesCounter.current = Math.max(0, absentFramesCounter.current - 1);
          setLiveAbsentTimer(Number((absentFramesCounter.current * 0.25).toFixed(1)));
        }"""

new_multi_channels = """        // ── 1. CELL PHONE CHANNEL (Confirmed in 2 frames = 500ms) ──
        if (detectedPhone) {
          setActiveDetectedObject('Cell Phone (Handheld)');
          cellPhoneTimer.current += 1;
          const currentPhoneSeconds = Number((cellPhoneTimer.current * 0.25).toFixed(1));
          setLivePhoneTimer(currentPhoneSeconds);

          if (cellPhoneTimer.current >= 2) { // 500ms confirmed detection
            cellPhoneTimer.current = 0;
            setLivePhoneTimer(0);
            const isCompound = detectedPersonsCount >= 2;
            triggerProctorViolation({
              category: 'CELL_PHONE',
              title: isCompound 
                ? 'Severe Malpractice: Unauthorized Mobile Device & Second Person Detected'
                : 'Unauthorized Mobile Device Detected',
              ruleTriggered: isCompound
                ? `Object: 'cell phone' + 'person' (count: ${detectedPersonsCount}) ──> Mobile with Second Person Present 🚨`
                : `Object: 'cell phone' ──> Handheld Mobile Phone Flagged (Confidence: ${(phoneConf * 100).toFixed(0)}%) ──> Strike Applied 🚨`,
              confidence: phoneConf,
              actionTaken: 'STRIKE',
              notes: isCompound 
                ? `Candidate raised mobile phone with ${detectedPersonsCount} persons identified in examination zone.`
                : 'Candidate raised mobile phone into examination camera area.'
            });
          }
        } else {
          cellPhoneTimer.current = Math.max(0, cellPhoneTimer.current - 1);
          setLivePhoneTimer(Number((cellPhoneTimer.current * 0.25).toFixed(1)));
          if (cellPhoneTimer.current === 0 && activeDetectedObject && activeDetectedObject.includes('Cell Phone')) {
            setActiveDetectedObject(null);
          }
        }

        // ── 2. UNAUTHORIZED BOOK CHANNEL (Confirmed in 2 frames = 500ms) ──
        if (detectedBook) {
          if (!activeDetectedObject || !activeDetectedObject.includes('Cell Phone')) {
            setActiveDetectedObject('Physical Book / Notes');
          }
          bookTimer.current += 1;
          const currentBookSeconds = Number((bookTimer.current * 0.25).toFixed(1));
          setLiveBookTimer(currentBookSeconds);

          if (bookTimer.current >= 2) { // 500ms confirmed detection
            bookTimer.current = 0;
            setLiveBookTimer(0);
            const isCompound = detectedPersonsCount >= 2;
            triggerProctorViolation({
              category: 'BOOK_DETECTED',
              title: isCompound
                ? 'Severe Malpractice: Unauthorized Book & Second Person Detected'
                : 'Unauthorized Book / Reading Material Flagged',
              ruleTriggered: isCompound
                ? `Object: 'book' + 'person' (count: ${detectedPersonsCount}) ──> Reading Material with Second Person Present 🚨`
                : `Object: 'book' ──> Printed Reading Material Detected (Confidence: ${(bookConf * 100).toFixed(0)}%) ──> Strike Applied 🚨`,
              confidence: bookConf,
              actionTaken: 'STRIKE',
              notes: isCompound
                ? `Candidate consulted textbook with ${detectedPersonsCount} persons identified in examination zone.`
                : 'Candidate consulted external printed textbook or unauthorized notes.'
            });
          }
        } else {
          bookTimer.current = Math.max(0, bookTimer.current - 1);
          setLiveBookTimer(Number((bookTimer.current * 0.25).toFixed(1)));
          if (bookTimer.current === 0 && activeDetectedObject && activeDetectedObject.includes('Book')) {
            setActiveDetectedObject(null);
          }
        }

        // ── 3. MULTIPLE PERSONS IN ROOM CHANNEL (Confirmed in 2 frames = 500ms) ──
        if (detectedPersonsCount >= 2) {
          multiPersonFramesCounter.current += 1;
          if (multiPersonFramesCounter.current >= 2) { // 500ms confirmed detection
            multiPersonFramesCounter.current = 0;
            triggerProctorViolation({
              category: 'MULTIPLE_PERSONS',
              title: 'Multiple Persons Detected in Testing Zone',
              ruleTriggered: `Object: 'person' (count: ${detectedPersonsCount} > 1) ──> Second person present in room ──> Red Alert 👥`,
              confidence: 0.95,
              actionTaken: 'STRIKE',
              notes: `${detectedPersonsCount} distinct people identified in examination room.`
            });
          }
        } else {
          multiPersonFramesCounter.current = Math.max(0, multiPersonFramesCounter.current - 1);
        }

        // ── 4. CANDIDATE ABSENCE CHANNEL (Empty Desk > 1.5s = 6 frames) ──
        if (detectedPersonsCount === 0) {
          setYoloGazeStatus('Desk Empty (Absent)');
          gazeTurnFramesCounter.current = 0;
          setLiveGazeTimer(0);

          absentFramesCounter.current += 1;
          const currentAbsentSeconds = Number((absentFramesCounter.current * 0.25).toFixed(1));
          setLiveAbsentTimer(currentAbsentSeconds);

          if (absentFramesCounter.current >= 6) { // 1.5s sustained empty desk
            absentFramesCounter.current = 0;
            setLiveAbsentTimer(0);
            triggerProctorViolation({
              category: 'STUDENT_ABSENT',
              title: 'Candidate Missing from Examination Desk',
              ruleTriggered: 'Presence Detection ──> Candidate absent from camera frame > 1.5s ──> Immediate Strike 🚨',
              confidence: 0.98,
              actionTaken: 'STRIKE',
              notes: 'Candidate moved away from examination camera frame for more than 1.5 continuous seconds.'
            });
          }
        } else {
          absentFramesCounter.current = Math.max(0, absentFramesCounter.current - 1);
          setLiveAbsentTimer(Number((absentFramesCounter.current * 0.25).toFixed(1)));
        }"""

if old_multi_channels in content:
    content = content.replace(old_multi_channels, new_multi_channels, 1)
    print("Step 6: Fast 2-frame multi-channels confirmation updated.")
else:
    print("Step 6 WARNING: old_multi_channels not found.")

# ─────────────────────────────────────────────────────────────────────────────
# 7. AUDIO ANOMALY CHANNEL THRESHOLD TO 68 dB & 1.5s SUSTAINED
# ─────────────────────────────────────────────────────────────────────────────
old_audio_block = """        // ── 6. AUDIO ACOUSTIC ANOMALY CHANNEL (> 60 dB Sustained) ──
        const currentAudioDb = liveAudioDecibelsRef.current || 38;
        if (currentAudioDb >= 60) {
          audioSpikeFramesCounter.current += 1;
          if (audioSpikeFramesCounter.current >= 5) { // 1.25s sustained loud voice/sound
            audioSpikeFramesCounter.current = 0;
            triggerProctorViolation({
              category: 'AUDIO_ANOMALY',
              title: 'Acoustic Spike / Voice Detected',
              ruleTriggered: `Audio: Decibel > 60dB (${currentAudioDb} dB sustained > 1.25s) ──> Audio Anomaly 🎙️`,
              confidence: 0.89,
              actionTaken: 'ANOMALY_LOG',
              notes: `Microphone decibels sustained at ${currentAudioDb} dB above 60dB threshold.`
            });
          }
        } else {
          audioSpikeFramesCounter.current = Math.max(0, audioSpikeFramesCounter.current - 1);
        }"""

new_audio_block = """        // ── 6. AUDIO ACOUSTIC ANOMALY CHANNEL (> 68 dB Sustained) ──
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

if old_audio_block in content:
    content = content.replace(old_audio_block, new_audio_block, 1)
    print("Step 7: Audio channel threshold updated to 68 dB.")
else:
    print("Step 7 WARNING: old_audio_block not found.")

# ─────────────────────────────────────────────────────────────────────────────
# 8. CLEAN WEBCAM HUD OVERLAYS (No giant box over face when looking straight)
# ─────────────────────────────────────────────────────────────────────────────
old_face_hud = """                      {/* Candidate Head Indicator (Only shown if head turned away) */}
                      {yoloPersonCount > 0 && yoloGazeStatus.includes('Turned') && (
                        <div 
                          className="absolute border-2 border-amber-400 bg-amber-400/10 rounded-2xl pointer-events-none transition-all duration-150 flex flex-col justify-between p-1.5"
                          style={{
                            top: '12%',
                            bottom: '22%',
                            left: `${Math.max(8, Math.min(62, (1 - liveFaceCentroidX) * 100 - 20))}%`,
                            width: '42%',
                          }}
                        >
                          <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                            <span className="px-1.5 py-0.5 rounded text-white shadow-xs bg-amber-500">
                              YOLO v8: Candidate
                            </span>
                            {liveGazeTimer > 0 && (
                              <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded text-[8px] animate-pulse">
                                Gaze: {liveGazeTimer}s/4.5s
                              </span>
                            )}
                          </div>
                          <span className="self-end text-[8px] font-mono font-bold text-amber-300 bg-black/70 px-1.5 py-0.5 rounded">
                            {yoloGazeStatus}
                          </span>
                        </div>
                      )}"""

new_face_hud = """                      {/* Candidate Head Indicator (Only shown if head turned away) */}
                      {yoloPersonCount > 0 && yoloGazeStatus.includes('Turned') && (
                        <div 
                          className="absolute border-2 border-amber-400 bg-amber-400/10 rounded-2xl pointer-events-none transition-all duration-150 flex flex-col justify-between p-1.5"
                          style={{
                            top: '12%',
                            bottom: '22%',
                            left: `${Math.max(8, Math.min(62, (1 - liveFaceCentroidX) * 100 - 20))}%`,
                            width: '42%',
                          }}
                        >
                          <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                            <span className="px-1.5 py-0.5 rounded text-white shadow-xs bg-amber-500">
                              YOLO: Head Pose
                            </span>
                            {liveGazeTimer > 0 && (
                              <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded text-[8px] animate-pulse">
                                Turned: {liveGazeTimer}s/4.5s
                              </span>
                            )}
                          </div>
                          <span className="self-end text-[8px] font-mono font-bold text-amber-300 bg-black/70 px-1.5 py-0.5 rounded">
                            {yoloGazeStatus}
                          </span>
                        </div>
                      )}"""

if old_face_hud in content:
    content = content.replace(old_face_hud, new_face_hud, 1)
    print("Step 8: Face HUD updated.")
else:
    print("Step 8 WARNING: old_face_hud not found.")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished applying all proctoring engine & analysis sheet fixes.")
