# -*- coding: utf-8 -*-
with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update initWebcamAndAudio to reuse healthy streams and avoid dark virtual fallback hijacking
old_init_webcam = """    async function initWebcamAndAudio() {

      try {

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

          const stream = await navigator.mediaDevices.getUserMedia({

            video: { width: 320, height: 240, facingMode: 'user' },

            audio: true

          });

          localStream = stream;

          streamRef.current = stream;

          if (videoRef.current) {

            videoRef.current.srcObject = stream;

            videoRef.current.play().catch(() => {});

          }

          setCameraActive(true);

          setCameraError(null);



          // Web Audio API decibel metering (Client-side edge monitoring)"""

new_init_webcam = """    async function initWebcamAndAudio() {
      // 1. If an active physical camera stream is already running, reuse it and never go dark!
      if (streamRef.current && streamRef.current.active) {
        const liveTracks = streamRef.current.getVideoTracks().filter(t => t.readyState === 'live');
        if (liveTracks.length > 0) {
          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
          setCameraError(null);
          return;
        }
      }

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          let stream: MediaStream | null = null;
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: 320, height: 240, facingMode: 'user' },
              audio: true
            });
          } catch {
            // Flexible fallback for devices that don't support strict 320x240 constraints
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          }

          localStream = stream;
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }

          setCameraActive(true);
          setCameraError(null);

          // Web Audio API decibel metering (Client-side edge monitoring)"""

if old_init_webcam in content:
    content = content.replace(old_init_webcam, new_init_webcam, 1)
    print("Step 1: initWebcamAndAudio updated.")
else:
    print("Step 1: old_init_webcam anchor not found!")

# 2. Update catch block of initWebcamAndAudio
old_catch = """          setCameraError('Webcam access not supported on this browser.');

        }

      } catch (err: any) {
        console.warn('Webcam in use or unavailable. Activating AI Proctor Virtual Stream:', err);
        startVirtualWebcamFallback();
      }"""

new_catch = """          setCameraError('Webcam access not supported on this browser.');
        }
      } catch (err: any) {
        console.warn('Webcam hardware lock or in use by another tab:', err);
        // If we already had a stream, do not kill it with virtual fallback
        if (!streamRef.current || !streamRef.current.active) {
          startVirtualWebcamFallback();
        }
      }"""

if old_catch in content:
    content = content.replace(old_catch, new_catch, 1)
    print("Step 2: catch block updated.")
else:
    print("Step 2: old_catch anchor not found!")

# 3. Update handleVisibilityChange to auto-resume camera on tab focus
old_tab_switch = """    // Tab switch listener for exam integrity
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

new_tab_switch = """    // Tab switch listener for exam integrity & camera auto-wake
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
    };"""

if old_tab_switch in content:
    content = content.replace(old_tab_switch, new_tab_switch, 1)
    print("Step 3: handleVisibilityChange updated.")
else:
    print("Step 3: old_tab_switch anchor not found!")

# 4. Update <video> element with auto-play guard
old_video = """                  <video

                    ref={videoRef}

                    autoPlay

                    playsInline

                    muted

                    className="w-full h-full object-cover transform -scale-x-100"

                  />"""

new_video = """                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
                    onPause={() => {
                      if (streamRef.current) videoRef.current?.play().catch(() => {});
                    }}
                    className="w-full h-full object-cover transform -scale-x-100"
                  />"""

if old_video in content:
    content = content.replace(old_video, new_video, 1)
    print("Step 4: <video> element updated.")
else:
    print("Step 4: old_video anchor not found!")

# 5. Enhance Disqualification Screen with "View Full Proctor Audit Sheet" button
old_disq = """            <button

              onClick={onClose}

              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-6 py-3 shadow-md transition-all cursor-pointer"

            >

              Close Portal

            </button>"""

new_disq = """            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAnalysisSheetModal(true)}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-5 py-3 shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <FileText className="h-4 w-4" />
                <span>View Full Proctor Audit Sheet ({proctorAnalysisSheet.length} Incidents)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-6 py-3 shadow-md transition-all cursor-pointer"
              >
                Close Portal
              </button>
            </div>"""

if old_disq in content:
    content = content.replace(old_disq, new_disq, 1)
    print("Step 5: Disqualification screen updated.")
else:
    print("Step 5: old_disq anchor not found!")

# 6. Add watchdog in 250ms processInterval so paused video is auto-resumed
video_watchdog_anchor = "      try {\n        // Step A: Native Browser Hardware FaceDetector check"
video_watchdog_new = """      // Watchdog: Ensure video element is playing and never frozen/paused on a dark frame
      if (video.paused && streamRef.current) {
        video.play().catch(() => {});
      }

      try {
        // Step A: Native Browser Hardware FaceDetector check"""

if video_watchdog_anchor in content:
    content = content.replace(video_watchdog_anchor, video_watchdog_new, 1)
    print("Step 6: Video watchdog added in processInterval.")
else:
    print("Step 6: video_watchdog_anchor not found!")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("All dark camera and disqualification improvements completed.")
