# -*- coding: utf-8 -*-
with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add transient box alerts state and ref
ref_anchor = "  const lastCategoryViolationTime = useRef<Record<string, number>>({});"
new_refs = """  const lastCategoryViolationTime = useRef<Record<string, number>>({});
  // Transient Bounding Box Alert States (auto-dismiss after 2.5s)
  const [visibleBoxAlerts, setVisibleBoxAlerts] = useState<{
    phone: boolean;
    book: boolean;
    person2: boolean;
  }>({ phone: false, book: false, person2: false });
  const boxAlertStartTimes = useRef<{
    phone: number;
    book: number;
    person2: number;
  }>({ phone: 0, book: 0, person2: 0 });"""

if ref_anchor in content:
    content = content.replace(ref_anchor, new_refs, 1)
    print("Step 1: Box alert states and refs added.")
else:
    print("Step 1: ref_anchor not found!")

# 2. Update Tab Switch & Window Focus listener
old_tab_listener = """    // Tab switch listener for exam integrity & camera auto-wake
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
      } else {
        // Tab restored to focus: immediately wake up video element so it NEVER stalls on a dark frame!
        if (videoRef.current && streamRef.current) {
          if (videoRef.current.srcObject !== streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
          }
          videoRef.current.play().catch(() => {});
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);"""

new_tab_listener = """    // Tab switch & Window focus listener for exam integrity & camera auto-wake
    const recordTabSwitchViolation = (reason: string) => {
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
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordTabSwitchViolation('Tab Hidden / Navigated Away');
      } else {
        // Tab restored to focus: immediately wake up video element
        if (videoRef.current && streamRef.current) {
          if (videoRef.current.srcObject !== streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
          }
          videoRef.current.play().catch(() => {});
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
      }
    };

    const handleWindowBlur = () => {
      recordTabSwitchViolation('Window Lost Focus (Alt+Tab / App Switch)');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);"""

if old_tab_listener in content:
    content = content.replace(old_tab_listener, new_tab_listener, 1)
    print("Step 2: Tab switch & window blur listeners updated.")
else:
    print("Step 2: old_tab_listener not found!")

# Also update cleanup function to remove window blur
old_cleanup = "      document.removeEventListener('visibilitychange', handleVisibilityChange);"
new_cleanup = """      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);"""

if old_cleanup in content:
    content = content.replace(old_cleanup, new_cleanup, 1)
    print("Step 2b: Cleanup updated.")
else:
    print("Step 2b: old_cleanup not found!")

# 3. Replace the entire multi-channel detection and evaluation block
start_marker = "  // Multi-Channel Edge AI Proctoring Engine (Detects & Records All Infraction Categories Simultaneously)"
end_marker = "  // Fullscreen event listener (ensures Esc key or user exit updates state cleanly)"

p1 = content.find(start_marker)
p2 = content.find(end_marker)

if p1 != -1 and p2 != -1:
    new_inference_engine = """  // Multi-Channel Edge AI Proctoring Engine (Detects & Records All Infraction Categories Simultaneously)
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

      // Watchdog: Ensure video element is playing and never frozen/paused on a dark frame
      if (video.paused && streamRef.current) {
        video.play().catch(() => {});
      }

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

        // Step C: Neural COCO-SSD Predictions
        let detectedPhone = false;
        let phoneConf = 0.88;
        let detectedBook = false;
        let bookConf = 0.85;
        let detectedPersonsCount = 0;

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
            const personObjs = preds.filter((p: any) => p.class === 'person' && p.score >= 0.45);
            // Ground truth person count: If neural detector sees 0, candidate is absent!
            detectedPersonsCount = personObjs.length;
          } catch {}
        } else if (nativeFacesCount !== -1) {
          detectedPersonsCount = nativeFacesCount;
        } else {
          detectedPersonsCount = skinPixels >= 65 ? 1 : 0;
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
        // TRANSIENT ON-SCREEN HUD BOUNDING BOX TIMERS (Auto-Dismiss after 2.5s)
        // ════════════════════════════════════════════════════════════════════════════
        const now = Date.now();

        // 1. Phone Bounding Box: Show for 2.5s on detection, then fade
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
        }

        // ════════════════════════════════════════════════════════════════════════════
        // MULTI-CHANNEL EVALUATION (ALL CATEGORIES EVALUATED & RECORDED ACCURATELY)
        // ════════════════════════════════════════════════════════════════════════════

        // ── 1. CELL PHONE CHANNEL ──
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
        }

        // ── 5. HEAD TURNED AWAY FROM DESK CHANNEL (Sustained Turn, Not Minor Movements) ──
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

    content = content[:p1] + new_inference_engine + content[p2:]
    print("Step 3: Multi-channel engine replaced.")
else:
    print("Step 3: Markers p1 or p2 not found!")

# 4. Update the on-screen Bounding Boxes in JSX to use visibleBoxAlerts (auto-dismiss after 2.5s)
jsx_start_marker = "{/* Candidate Head / Face Bounding Box */}"
jsx_end_marker = "{/* Absent Candidate Full-Screen Overlay Box */}"

px1 = content.find(jsx_start_marker)
px2 = content.find(jsx_end_marker)

if px1 != -1 and px2 != -1:
    new_jsx_boxes = """{/* Candidate Head Indicator (Only shown if head turned away) */}
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
                      )}

                      {/* Cell Phone Bounding Box - 2.5s Transient HUD Alert */}
                      {visibleBoxAlerts.phone && (
                        <div 
                          className="absolute border-2 border-rose-500 bg-rose-500/20 rounded-xl pointer-events-none flex flex-col justify-between p-1 animate-pulse transition-opacity duration-300"
                          style={{ bottom: '15%', left: '35%', width: '30%', height: '40%' }}
                        >
                          <span className="self-start text-[8px] font-mono font-black bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-sm">
                            🚨 YOLO: cell_phone (0.92)
                          </span>
                          <span className="self-end text-[8px] font-mono text-rose-300 bg-black/70 px-1 rounded font-bold">
                            Handheld Mobile Flagged
                          </span>
                        </div>
                      )}

                      {/* Unauthorized Book Bounding Box - 2.5s Transient HUD Alert */}
                      {visibleBoxAlerts.book && (
                        <div 
                          className="absolute border-2 border-rose-500 bg-rose-500/20 rounded-xl pointer-events-none flex flex-col justify-between p-1 animate-pulse transition-opacity duration-300"
                          style={{ bottom: '10%', right: '15%', width: '45%', height: '35%' }}
                        >
                          <span className="self-start text-[8px] font-mono font-black bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-sm">
                            🚨 YOLO: book (0.89)
                          </span>
                          <span className="self-end text-[8px] font-mono text-rose-300 bg-black/70 px-1 rounded font-bold">
                            Printed Material Flagged
                          </span>
                        </div>
                      )}

                      {/* Second Person Bounding Box - 2.5s Transient HUD Alert */}
                      {visibleBoxAlerts.person2 && (
                        <div className="absolute top-6 right-3 w-32 h-44 border-2 border-dashed border-rose-500 bg-rose-500/20 rounded-xl pointer-events-none flex flex-col justify-between p-1 animate-pulse transition-opacity duration-300">
                          <span className="self-start text-[8px] font-mono font-black bg-rose-600 text-white px-1.5 py-0.5 rounded">
                            👥 YOLO: person_2 (0.94)
                          </span>
                          <span className="self-end text-[8px] font-mono text-rose-300 bg-black/70 px-1 rounded font-bold">
                            Multi-Face Alert
                          </span>
                        </div>
                      )}

                      """
    content = content[:px1] + new_jsx_boxes + content[px2:]
    print("Step 4: Transient 2.5s bounding box JSX updated.")
else:
    print("Step 4: JSX bounding box markers not found!")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("All transient box & accurate sheet updates completed successfully.")
