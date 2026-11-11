# -*- coding: utf-8 -*-
with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add lastCategoryViolationTime and triggerProctorViolationRef to refs
ref_anchor = "  const lastAudioUiUpdateRef = useRef<number>(0);"
new_refs = """  const lastAudioUiUpdateRef = useRef<number>(0);
  const lastCategoryViolationTime = useRef<Record<string, number>>({});
  const triggerProctorViolationRef = useRef<(params: any) => void>(() => {});"""

if ref_anchor in content:
    content = content.replace(ref_anchor, new_refs, 1)
    print("Step 1: Refs added successfully.")
else:
    print("Step 1: ref_anchor not found!")

# 2. Update handleVisibilityChange to call triggerProctorViolationRef
tab_switch_anchor = """    // Tab switch listener for exam integrity

    const handleVisibilityChange = () => {

      if (document.hidden) {

        setTabSwitchCount((prev) => {

          const nextCount = prev + 1;

          api.sendProctorTelemetry(candidateId, {

            anomaly_type: 'TAB_SWITCH',

            confidence: 1.0,

            details: `Student switched away from browser tab (Event #${nextCount})`

          }).catch(() => {});

          return nextCount;

        });

      }

    };"""

new_tab_switch = """    // Tab switch listener for exam integrity
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const nextCount = prev + 1;
          if (triggerProctorViolationRef.current) {
            triggerProctorViolationRef.current({
              category: 'TAB_SWITCH',
              title: 'Unauthorized Browser Tab Switch',
              ruleTriggered: `Window Focus Lost ──> Student navigated away from exam (Event #${nextCount})`,
              confidence: 1.0,
              actionTaken: 'WARNING',
              notes: `Candidate switched away from examination window (Incident #${nextCount}).`
            });
          }
          return nextCount;
        });
      }
    };"""

if tab_switch_anchor in content:
    content = content.replace(tab_switch_anchor, new_tab_switch, 1)
    print("Step 2: handleVisibilityChange updated successfully.")
else:
    print("Step 2: tab_switch_anchor not found!")

# 3. Replace triggerProctorViolation and the useEffect inference loop
start_marker = "  // Trigger Proctor Violation & Record into Analysis Sheet with Telemetry Broadcast"
end_marker = "  // Fullscreen event listener (ensures Esc key or user exit updates state cleanly)"

p1 = content.find(start_marker)
p2 = content.find(end_marker)

if p1 != -1 and p2 != -1:
    new_engine_code = """  // Trigger Proctor Violation & Record into Analysis Sheet with Telemetry Broadcast
  const triggerProctorViolation = (params: {
    category: 'CELL_PHONE' | 'MULTIPLE_PERSONS' | 'GAZE_DRIFT' | 'AUDIO_ANOMALY' | 'TAB_SWITCH' | 'BOOK_DETECTED' | 'STUDENT_ABSENT';
    title: string;
    ruleTriggered: string;
    confidence: number;
    actionTaken: 'STRIKE' | 'WARNING' | 'ANOMALY_LOG';
    notes: string;
  }) => {
    const now = Date.now();
    // Category-specific cooldown: Prevents flooding on the same infraction, while never blocking other categories!
    const lastTime = lastCategoryViolationTime.current[params.category] || 0;
    const cooldownMs = params.category === 'TAB_SWITCH' ? 4000 : 7000;
    if (now - lastTime < cooldownMs) {
      return;
    }
    lastCategoryViolationTime.current[params.category] = now;

    const timeStr = new Date().toLocaleTimeString();
    let nextStrikes = proctorStrikesRef.current;

    if (params.actionTaken === 'STRIKE') {
      nextStrikes = Math.min(3, proctorStrikesRef.current + 1);
      proctorStrikesRef.current = nextStrikes;
      setProctorStrikes(nextStrikes);
      if (nextStrikes >= 2) {
        setIsPenalized(true);
      }
      if (nextStrikes >= 3) {
        setIsExamDisqualified(true);
      }
    }

    const newEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
      category: params.category,
      title: params.title,
      ruleTriggered: params.ruleTriggered,
      confidence: params.confidence,
      actionTaken: params.actionTaken,
      strikeNumber: params.actionTaken === 'STRIKE' ? nextStrikes : undefined,
      status: 'FLAGGED' as const,
      notes: params.notes
    };

    setProctorAnalysisSheet(prev => [newEntry, ...prev]);

    // Set HUD Alert Message Banner
    if (params.actionTaken === 'STRIKE') {
      setHudAlertMessage(`🚨 IMMEDIATE STRIKE (Strike ${nextStrikes}/3): ${params.title} — ${params.ruleTriggered}`);
    } else if (params.actionTaken === 'WARNING') {
      setHudAlertMessage(`⚠️ GENTLE WARNING NUDGE: ${params.title} — ${params.ruleTriggered}`);
    } else {
      setHudAlertMessage(`🎙️ ${params.title} — ${params.ruleTriggered}`);
    }
    setTimeout(() => setHudAlertMessage(null), 6000);

    // Sync Telemetry & Analysis Entry across BroadcastChannel
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
    } catch {}

    // Send API Telemetry
    api.sendProctorTelemetry(candidateId || 1, {
      anomaly_type: params.category,
      confidence: params.confidence,
      details: `${params.title}: ${params.ruleTriggered}`
    }).catch(console.error);
  };

  triggerProctorViolationRef.current = triggerProctorViolation;

  // Multi-Channel Edge AI Proctoring Engine (Detects & Records All Infraction Categories Simultaneously)
  useEffect(() => {
    if (!isOpen || rulesStage !== 'active' || isExamPaused || isExamDisqualified) return;

    let isMounted = true;
    let cocoModel: any = null;

    // 1. Establish Real LiveKit SFU Proctor Room Connection
    api.getLiveKitToken({
      room_name: 'exam-room-class8b',
      participant_name: studentName || 'Aarav Sharma',
      participant_identity: 'aarav-sharma-14',
      role: 'STUDENT'
    }).then(res => {
      if (!isMounted) return;
      if (res && res.token) {
        setLiveKitRoomStatus('connected');
        console.log('✅ LiveKit SFU Proctor Room Connected:', res.room_name);
      } else {
        setLiveKitRoomStatus('mesh_active');
      }
    }).catch(() => {
      if (isMounted) setLiveKitRoomStatus('mesh_active');
    });

    // 2. Load Real COCO-SSD Neural Network (Handles true object classification)
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof document === 'undefined') return resolve();
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.head.appendChild(s);
      });
    };

    async function initCoco() {
      try {
        if ((window as any).cocoSsdModel) {
          cocoModel = (window as any).cocoSsdModel;
          if (isMounted) setIsAiModelLoaded(true);
          return;
        }
        if (!(window as any).cocoSsd) {
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js');
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
        }
        if ((window as any).cocoSsd) {
          cocoModel = await (window as any).cocoSsd.load({ base: 'lite_mobilenet_v2' });
          (window as any).cocoSsdModel = cocoModel;
          if (isMounted) setIsAiModelLoaded(true);
        }
      } catch (e) {
        console.warn('COCO-SSD background load:', e);
      }
    }
    initCoco();

    // 3. Native Canvas Buffer for Spatial Face & Contraband Tracking (160x120)
    const visionCanvas = document.createElement('canvas');
    visionCanvas.width = 160;
    visionCanvas.height = 120;
    const ctx = visionCanvas.getContext('2d', { willReadFrequently: true });

    // 4. Autonomous Multi-Channel Inference Loop (Runs every 250ms)
    const processInterval = setInterval(async () => {
      if (!isMounted) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !ctx) return;

      try {
        // Step A: Native Browser Hardware FaceDetector check
        let nativeFacesCount = -1;
        let primaryFaceCenterNormX = 0.5;

        if (typeof window !== 'undefined' && (window as any).FaceDetector) {
          try {
            if (!faceDetectorRef.current) {
              faceDetectorRef.current = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
            }
            const detectedFaces = await faceDetectorRef.current.detect(video);
            nativeFacesCount = detectedFaces.length;
            if (detectedFaces.length > 0) {
              const box = detectedFaces[0].boundingBox;
              primaryFaceCenterNormX = (box.x + box.width / 2) / (video.videoWidth || 640);
            }
          } catch {}
        }

        // Step B: Canvas Spatial Analysis (160x120)
        ctx.drawImage(video, 0, 0, 160, 120);
        const imgData = ctx.getImageData(0, 0, 160, 120);
        const pixels = imgData.data;

        let skinPixels = 0;
        let skinXSum = 0;
        let leftSectorSkin = 0;
        let rightSectorSkin = 0;

        let darkBoxCount = 0;
        let darkMinX = 160, darkMaxX = 0, darkMinY = 120, darkMaxY = 0;
        let textLineGradientRows = 0;

        // Sample upper 75% for face and handheld contraband
        for (let y = 10; y < 90; y++) {
          let rowGradChanges = 0;
          let prevLuma = 0;

          for (let x = 0; x < 160; x++) {
            const idx = (y * 160 + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;

            // Skin tone locus (human face)
            const isSkin = r > 60 && g > 38 && b > 25 && r > g && r > b && (r - g) > 10 && (Math.max(r,g,b) - Math.min(r,g,b) > 12);
            if (isSkin) {
              skinPixels++;
              skinXSum += x;
              if (x < 65) leftSectorSkin++;
              if (x > 95) rightSectorSkin++;
            }

            // Dark handheld rectangular body (mobile phone bezel/screen)
            const isDarkHandheld = r < 40 && g < 40 && b < 40;
            if (isDarkHandheld && y > 25 && y < 95) {
              darkBoxCount++;
              if (x < darkMinX) darkMinX = x;
              if (x > darkMaxX) darkMaxX = x;
              if (y < darkMinY) darkMinY = y;
              if (y > darkMaxY) darkMaxY = y;
            }

            // High-frequency alternating contrast (printed book text lines)
            if (Math.abs(luma - prevLuma) > 35) {
              rowGradChanges++;
            }
            prevLuma = luma;
          }

          if (rowGradChanges > 18) {
            textLineGradientRows++;
          }
        }

        const faceNormX = nativeFacesCount !== -1
          ? primaryFaceCenterNormX
          : (skinPixels > 55 ? (skinXSum / skinPixels) / 160 : 0.5);
        setLiveFaceCentroidX(Number(faceNormX.toFixed(2)));

        let detectedPersonsCount = 1;
        if (nativeFacesCount !== -1) {
          detectedPersonsCount = nativeFacesCount;
        } else {
          detectedPersonsCount = skinPixels >= 50 ? 1 : 0;
        }

        // Step C: Neural COCO-SSD Predictions
        let detectedPhone = false;
        let phoneConf = 0.88;
        let detectedBook = false;
        let bookConf = 0.85;

        if (cocoModel) {
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
            const personObjs = preds.filter((p: any) => p.class === 'person' && p.score >= 0.48);
            if (personObjs.length > 0) {
              detectedPersonsCount = Math.max(detectedPersonsCount, personObjs.length);
            } else if (skinPixels < 35 && nativeFacesCount <= 0) {
              detectedPersonsCount = 0;
            }
          } catch {}
        }

        // Step D: Handheld Phone Geometric Edge Verification
        const darkBoxW = darkMaxX >= darkMinX ? darkMaxX - darkMinX : 0;
        const darkBoxH = darkMaxY >= darkMinY ? darkMaxY - darkMinY : 0;
        const isPhoneGeometry = darkBoxW >= 14 && darkBoxW <= 58 && darkBoxH >= 22 && darkBoxH <= 90 &&
          ((darkBoxH / (darkBoxW + 0.1) >= 1.3 && darkBoxH / (darkBoxW + 0.1) <= 2.8) ||
           (darkBoxW / (darkBoxH + 0.1) >= 1.3 && darkBoxW / (darkBoxH + 0.1) <= 2.8));

        if (isPhoneGeometry && darkBoxCount > 100 && darkBoxCount < 2200) {
          detectedPhone = true;
          phoneConf = Math.max(phoneConf, 0.86);
        }

        // Step E: Book Verification (Distinct from desk paper)
        if (textLineGradientRows >= 16 && detectedPersonsCount >= 1) {
          detectedBook = true;
          bookConf = Math.max(bookConf, 0.84);
        }

        setYoloPersonCount(detectedPersonsCount);

        // ════════════════════════════════════════════════════════════════════════════
        // MULTI-CHANNEL EVALUATION (ALL CATEGORIES EVALUATED SIMULTANEOUSLY)
        // ════════════════════════════════════════════════════════════════════════════

        // ── 1. CELL PHONE CHANNEL ──
        if (detectedPhone) {
          setActiveDetectedObject('Cell Phone (Handheld)');
          cellPhoneTimer.current = Math.min(10, cellPhoneTimer.current + 2);
          const currentPhoneSeconds = Number((cellPhoneTimer.current * 0.25).toFixed(1));
          setLivePhoneTimer(currentPhoneSeconds);

          if (cellPhoneTimer.current >= 5) { // 1.25s sustained
            cellPhoneTimer.current = 0;
            setLivePhoneTimer(0);
            triggerProctorViolation({
              category: 'CELL_PHONE',
              title: 'Unauthorized Mobile Device Detected',
              ruleTriggered: `Object: 'cell phone' ──> Handheld Mobile Phone Flagged (Confidence: ${(phoneConf * 100).toFixed(0)}%) ──> Strike Applied 🚨`,
              confidence: phoneConf,
              actionTaken: 'STRIKE',
              notes: 'Candidate raised mobile phone into examination camera area.'
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
          bookTimer.current = Math.min(10, bookTimer.current + 2);
          const currentBookSeconds = Number((bookTimer.current * 0.25).toFixed(1));
          setLiveBookTimer(currentBookSeconds);

          if (bookTimer.current >= 6) { // 1.5s sustained
            bookTimer.current = 0;
            setLiveBookTimer(0);
            triggerProctorViolation({
              category: 'BOOK_DETECTED',
              title: 'Unauthorized Book / Reading Material Flagged',
              ruleTriggered: `Object: 'book' ──> Printed Reading Material Detected (Confidence: ${(bookConf * 100).toFixed(0)}%) ──> Strike Applied 🚨`,
              confidence: bookConf,
              actionTaken: 'STRIKE',
              notes: 'Candidate consulted external printed textbook or unauthorized notes.'
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
          if (multiPersonFramesCounter.current >= 8) { // 2.0s sustained
            multiPersonFramesCounter.current = 0;
            triggerProctorViolation({
              category: 'MULTIPLE_PERSONS',
              title: 'Multiple Persons Detected in Testing Zone',
              ruleTriggered: `Object: 'person' (count: ${detectedPersonsCount} > 1) ──> Multiple persons in room > 2s ──> Red Alert 👥`,
              confidence: 0.95,
              actionTaken: 'STRIKE',
              notes: `${detectedPersonsCount} distinct people identified in examination room.`
            });
          }
        } else {
          multiPersonFramesCounter.current = Math.max(0, multiPersonFramesCounter.current - 1);
        }

        // ── 4. CANDIDATE ABSENCE CHANNEL ──
        if (detectedPersonsCount === 0) {
          setYoloGazeStatus('Desk Empty (Absent)');
          gazeTurnFramesCounter.current = 0;
          setLiveGazeTimer(0);

          absentFramesCounter.current += 1;
          const currentAbsentSeconds = Number((absentFramesCounter.current * 0.25).toFixed(1));
          setLiveAbsentTimer(currentAbsentSeconds);

          if (absentFramesCounter.current >= 18) { // 4.5s sustained empty desk
            absentFramesCounter.current = 0;
            setLiveAbsentTimer(0);
            triggerProctorViolation({
              category: 'STUDENT_ABSENT',
              title: 'Candidate Missing from Examination Desk',
              ruleTriggered: 'Presence Detection ──> Candidate absent from camera frame > 4.5s ──> Immediate Strike 🚨',
              confidence: 0.98,
              actionTaken: 'STRIKE',
              notes: 'Candidate left the camera examination area for more than 4.5 continuous seconds.'
            });
          }
        } else {
          absentFramesCounter.current = Math.max(0, absentFramesCounter.current - 2);
          setLiveAbsentTimer(Number((absentFramesCounter.current * 0.25).toFixed(1)));
        }

        // ── 5. HEAD TURNED AWAY FROM DESK CHANNEL (Head Turned Away, Not Minor Movements) ──
        if (detectedPersonsCount === 1) {
          // Downward writing glances on desk paper are normal.
          // Only sustained turning of head (Left or Right) away from desk is flagged:
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
        }

        // ── 6. AUDIO ACOUSTIC ANOMALY CHANNEL (> 60 dB Sustained) ──
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
        }

      } catch (err) {
        // Safe continuous loop
      }
    }, 250);

    return () => {
      isMounted = false;
      clearInterval(processInterval);
    };
  }, [isOpen, rulesStage, isExamPaused, isExamDisqualified]);\n\n"""

    content = content[:p1] + new_engine_code + content[p2:]
    print("Step 3: Multi-channel engine replaced successfully.")
else:
    print("Step 3: p1 or p2 not found!")

# 4. Add TAB_SWITCH dot to Analysis Sheet modal rendering
category_dots_anchor = "{item.category === 'AUDIO_ANOMALY' && <span className=\"h-2 w-2 rounded-full bg-indigo-500\" />}"
category_dots_new = """{item.category === 'AUDIO_ANOMALY' && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                                {item.category === 'TAB_SWITCH' && <span className="h-2 w-2 rounded-full bg-amber-500" />}"""

if category_dots_anchor in content:
    content = content.replace(category_dots_anchor, category_dots_new, 1)
    print("Step 4: TAB_SWITCH dot added to Analysis Sheet.")
else:
    print("Step 4: category_dots_anchor not found!")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("All modifications completed.")
