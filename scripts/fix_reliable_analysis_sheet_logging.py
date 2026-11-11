# -*- coding: utf-8 -*-
with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update triggerProctorViolation cooldowns (Audio 15s, Tab switch 2.5s, others 7s)
old_cooldown = "const cooldownMs = params.category === 'TAB_SWITCH' ? 4000 : 7000;"
new_cooldown = "const cooldownMs = params.category === 'AUDIO_ANOMALY' ? 15000 : (params.category === 'TAB_SWITCH' ? 2500 : 7000);"

if old_cooldown in content:
    content = content.replace(old_cooldown, new_cooldown, 1)
    print("Step 1: Cooldowns updated.")
else:
    print("Step 1: old_cooldown not found!")

# 2. Update COCO-SSD score thresholds and person ground truth
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
            // High-yield confidence filter (0.42 for phone, 0.44 for book, 0.42 for person)
            const phoneObj = preds.find((p: any) => (p.class === 'cell phone' || p.class === 'remote') && p.score >= 0.42);
            if (phoneObj) {
              detectedPhone = true;
              phoneConf = phoneObj.score;
            }
            const bookObj = preds.find((p: any) => p.class === 'book' && p.score >= 0.44);
            if (bookObj) {
              detectedBook = true;
              bookConf = bookObj.score;
            }
            const personObjs = preds.filter((p: any) => p.class === 'person' && p.score >= 0.42);
            // Ground truth person count: If neural detector sees 0, candidate is absent!
            detectedPersonsCount = personObjs.length;
          } catch {}
        } else if (nativeFacesCount !== -1) {
          detectedPersonsCount = nativeFacesCount;
        } else {
          detectedPersonsCount = skinPixels >= 55 ? 1 : 0;
        }"""

if old_coco_block in content:
    content = content.replace(old_coco_block, new_coco_block, 1)
    print("Step 2: COCO score thresholds updated.")
else:
    print("Step 2: old_coco_block not found!")

# 3. Update evaluation channels to trigger reliably within 2 frames (500ms) for phone/book/persons, 1.5s for absence
old_channels = """        // ── 1. CELL PHONE CHANNEL ──
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

new_channels = """        // ── 1. CELL PHONE CHANNEL (Fast 2-frame 500ms confirmation) ──
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

        // ── 2. UNAUTHORIZED BOOK CHANNEL (Fast 2-frame 500ms confirmation) ──
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

        // ── 3. MULTIPLE PERSONS IN ROOM CHANNEL (Fast 2-frame 500ms confirmation) ──
        if (detectedPersonsCount >= 2) {
          multiPersonFramesCounter.current += 1;
          if (multiPersonFramesCounter.current >= 2) { // 500ms confirmed
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

        // ── 4. CANDIDATE ABSENCE CHANNEL (Desk Empty > 1.5s) ──
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

if old_channels in content:
    content = content.replace(old_channels, new_channels, 1)
    print("Step 3: Channels confirmation threshold updated.")
else:
    print("Step 3: old_channels not found!")

# 4. Update Audio Threshold to 68 dB
old_audio = """        // ── 6. AUDIO ACOUSTIC ANOMALY CHANNEL (> 60 dB Sustained) ──
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

new_audio = """        // ── 6. AUDIO ACOUSTIC ANOMALY CHANNEL (> 68 dB Sustained) ──
        const currentAudioDb = liveAudioDecibelsRef.current || 38;
        if (currentAudioDb >= 68) {
          audioSpikeFramesCounter.current += 1;
          if (audioSpikeFramesCounter.current >= 6) { // 1.5s sustained loud voice/audio
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

if old_audio in content:
    content = content.replace(old_audio, new_audio, 1)
    print("Step 4: Audio threshold updated to 68 dB.")
else:
    print("Step 4: old_audio not found!")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("All changes written successfully.")
