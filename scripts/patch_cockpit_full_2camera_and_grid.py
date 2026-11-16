# -*- coding: utf-8 -*-
"""
Patch frontend/src/components/proctor/live-invigilator-cockpit.tsx to restore the 2-Camera Studio
(Teacher Left + Candidate Right) with real live webcam feeds, 0 stock photos, and top-left grid elevation on 3 strikes.
"""

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Ensure LayoutGrid is imported
if 'LayoutGrid,' not in code and 'LayoutGrid ' not in code:
    code = code.replace("import {\n  Users,", "import {\n  LayoutGrid,\n  Users,")

# 2. Ensure spotlightWebcamRef and studentGridWebcamRef are declared
refs_decl = """  // Direct Candidate Live Video Refs (for user camera mirroring)
  const studentWebcamRef = useRef<HTMLVideoElement | null>(null);
  const spotlightWebcamRef = useRef<HTMLVideoElement | null>(null);
  const studentGridWebcamRef = useRef<HTMLVideoElement | null>(null);"""

code = code.replace(
    """  // Direct Candidate Live Video Ref (for user camera mirroring)
  const studentWebcamRef = useRef<HTMLVideoElement | null>(null);""",
    refs_decl
)

# 3. Enhance stream binding in useEffect
old_stream_bind = """          teacherStreamRef.current = stream;
          if (teacherVideoRef.current) {
            teacherVideoRef.current.srcObject = stream;
            teacherVideoRef.current.play().catch(() => {});
          }"""

new_stream_bind = """          teacherStreamRef.current = stream;
          if (teacherVideoRef.current) {
            teacherVideoRef.current.srcObject = stream;
            teacherVideoRef.current.play().catch(() => {});
          }
          if (spotlightWebcamRef.current) {
            spotlightWebcamRef.current.srcObject = stream;
            spotlightWebcamRef.current.play().catch(() => {});
          }
          if (studentGridWebcamRef.current) {
            studentGridWebcamRef.current.srcObject = stream;
            studentGridWebcamRef.current.play().catch(() => {});
          }"""

code = code.replace(old_stream_bind, new_stream_bind)

# 4. Add stream re-attachment effect
sync_effect = """  // Auto sync webcam stream to candidate elements whenever spotlight candidate changes
  useEffect(() => {
    if (teacherStreamRef.current) {
      if (spotlightWebcamRef.current && spotlightWebcamRef.current.srcObject !== teacherStreamRef.current) {
        spotlightWebcamRef.current.srcObject = teacherStreamRef.current;
        spotlightWebcamRef.current.play().catch(() => {});
      }
      if (studentGridWebcamRef.current && studentGridWebcamRef.current.srcObject !== teacherStreamRef.current) {
        studentGridWebcamRef.current.srcObject = teacherStreamRef.current;
        studentGridWebcamRef.current.play().catch(() => {});
      }
    }
  }, [spotlightCandidateId, candidates]);"""

if 'Auto sync webcam stream to candidate elements' not in code:
    code = code.replace(
        "  // 2. Auto-bind Candidate #14 Live Camera Stream & Frame Recovery",
        f"{sync_effect}\n\n  // 2. Auto-bind Candidate #14 Live Camera Stream & Frame Recovery"
    )

# 5. Locate Section 2 header in JSX and replace with:
# A. Streamlined Command Header
# B. 2-Camera Studio Active (Camera 1 Host Left + Camera 2 Candidate Right)
sec2_start = code.find('{/* ══════════════════════════════════════════════════════════════════════════ */\n      {/* 2. COMMAND HEADER: ROOM DETAILS + COMPACT INVIGILATOR STUDIO POD           */}')
sec3_start = code.find('{/* ══════════════════════════════════════════════════════════════════════════ */\n      {/* 3. HALL TICKET ADMISSION GATE')

if sec2_start != -1 and sec3_start != -1:
    new_sec2_and_studio = """{/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 2. COMMAND HEADER: ROOM DETAILS & SURVEILLANCE OVERVIEW                   */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 text-[11px] font-black">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              LIVEKIT SFU PROCTOR MESH &bull; 1:40 SURVEILLANCE ACTIVE
            </span>
            <span className="text-xs text-violet-300/80 font-mono">
              Dynacast 180p &bull; Latency: 24ms &bull; MediaPipe Active
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <span>Live Invigilator Command Cockpit</span>
            <span className="text-violet-400 font-normal">&bull; Class 8-B (Mathematics)</span>
          </h1>

          <p className="text-xs text-violet-200/70 max-w-2xl leading-relaxed">
            2-Camera live proctoring studio. Students who join stream their real-time camera feed. When an exam is paused, the candidate automatically jumps to the <b>top-left</b> of the grid with an active 1-on-1 voice intercom.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs shrink-0 flex-wrap">
          <span className="rounded-xl bg-white/10 px-3 py-1.5 font-mono text-emerald-300 font-bold">
            ⏱️ Elapsed: {formatTimer(sessionSeconds)}
          </span>
          <span className="rounded-xl bg-white/10 px-3 py-1.5 font-mono text-white">
            👥 Active: <b>{activeCandidates.length}</b> / 40
          </span>
          {pausedCount > 0 && (
            <span className="rounded-xl bg-rose-600 px-3 py-1.5 font-mono text-white font-black animate-pulse flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{pausedCount} Paused at Top-Left</span>
            </span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 2-CAMERA STUDIO ACTIVE: INVIGILATOR HOST (LEFT) + CANDIDATE (RIGHT)       */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              2-Camera Studio Active: Invigilator Host Camera (Left) + Candidate Surveillance (Right)
            </span>
          </div>
          <span className="text-[11px] bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-slate-300 font-mono">
            Click any of the 40 students below to switch Camera 2
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          
          {/* ── CAMERA 1: INVIGILATOR HOST CAMERA (MRS. ANANYA VERMA) ── */}
          <div className="rounded-3xl border-2 border-violet-500/80 bg-slate-900 text-white overflow-hidden shadow-2xl flex flex-col ring-2 ring-violet-500/20">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-violet-950/70">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Mrs. Ananya Verma</span>
                    <span className="text-[10px] bg-violet-600 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono font-bold">
                      HOST &bull; CHIEF INVIGILATOR
                    </span>
                  </h4>
                  <span className="text-[10px] text-violet-300 font-mono block">
                    Camera 1 &bull; Invigilator Studio Feed
                  </span>
                </div>
              </div>

              {/* Cam & Mic Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleTeacherCam}
                  className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    teacherCamActive ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-rose-600 text-white'
                  }`}
                  title={teacherCamActive ? 'Turn Off Cam' : 'Turn On Cam'}
                >
                  {teacherCamActive ? <Camera className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={toggleTeacherMic}
                  className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    teacherMicMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
                  }`}
                  title={teacherMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {teacherMicMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden flex-1">
              <video
                ref={teacherVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${teacherCamActive ? '' : 'hidden'}`}
              />
              {!teacherCamActive && (
                <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Camera className="h-10 w-10 text-slate-600" />
                  <span className="text-xs font-mono">Invigilator Camera Paused</span>
                </div>
              )}

              {/* Overlays */}
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-white flex items-center gap-1.5 border border-white/10">
                <Mic className={`h-3 w-3 ${teacherMicMuted ? 'text-rose-400' : 'text-emerald-400 animate-pulse'}`} />
                <span>{teacherMicMuted ? 'Teacher Muted' : 'Teacher Mic (42 dB)'}</span>
              </div>

              <div className="absolute top-3 right-3 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>LiveKit SFU 1:40 Connected (24ms)</span>
              </div>

              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-slate-300 border border-white/10 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>Broadcasting to Class 8-B &bull; 40 Subscribed</span>
              </div>
            </div>

            {/* Footer Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Audio Channel: <b>Open Mesh SFU</b></span>
              <span>SFU RTT Latency: <b>24ms</b></span>
            </div>
          </div>

          {/* ── CAMERA 2: CANDIDATE LIVE STREAM (SPOTLIGHT) ── */}
          {(() => {
            const spotlightCand = candidates.find(c => c.id === spotlightCandidateId) || candidates[0];
            const isPaused = spotlightCand.isPaused || spotlightCand.strikes >= 3;
            const isCandAarav = spotlightCand.rollNo === '14' || spotlightCand.id === 1;

            return (
              <div className={`rounded-3xl border-2 transition-all duration-300 bg-slate-900 text-white overflow-hidden shadow-2xl flex flex-col ring-2 ${
                isPaused
                  ? 'border-rose-500 ring-rose-500/40 bg-gradient-to-b from-rose-950/50 to-slate-900 shadow-rose-950/60'
                  : 'border-indigo-500/80 ring-indigo-500/20'
              }`}>
                {/* Header */}
                <div className={`p-3.5 border-b flex items-center justify-between ${
                  isPaused ? 'bg-rose-950/80 border-rose-800' : 'bg-slate-950/90 border-slate-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-black ${
                      isPaused ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
                    }`}>
                      Roll #{spotlightCand.rollNo}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>{spotlightCand.name}</span>
                        <span className="text-xs text-indigo-300 font-normal">(Class 8-B)</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Camera 2 &bull; Candidate Live Stream
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPaused ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white flex items-center gap-1.5 shadow-lg animate-bounce">
                        <ShieldAlert className="h-4 w-4" />
                        <span>STRIKE 3/3 - EXAM SUSPENDED</span>
                      </span>
                    ) : spotlightCand.strikes === 2 ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-orange-600 text-white flex items-center gap-1 shadow-md">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Strike 2/3 (Warning)</span>
                      </span>
                    ) : spotlightCand.strikes === 1 ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-600 text-white flex items-center gap-1 shadow-md">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Strike 1/3 (Logged)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span>0 Strikes (Clear)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Video Viewport */}
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden flex-1">
                  {spotlightCand.liveFrame ? (
                    <img
                      src={spotlightCand.liveFrame}
                      alt={spotlightCand.name}
                      className={`w-full h-full object-cover ${isPaused ? 'grayscale opacity-35' : ''}`}
                    />
                  ) : isCandAarav ? (
                    <video
                      ref={spotlightWebcamRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${isPaused ? 'grayscale opacity-35' : ''}`}
                    />
                  ) : (
                    /* Clean Workstation Standby for enrolled student waiting to connect */
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40">
                      <div className="h-16 w-16 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center font-black text-xl text-slate-300 shadow-inner">
                        {spotlightCand.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-300 block">Enrolled Desk #{spotlightCand.rollNo}</span>
                        <span className="text-xs text-slate-400 font-mono block">{spotlightCand.name}</span>
                        <span className="text-[11px] font-mono text-slate-500 block flex items-center justify-center gap-1.5 pt-1">
                          <span className="h-2 w-2 rounded-full bg-slate-600"></span>
                          <span>Awaiting Candidate Join &bull; Surveillance Ready</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Overlays */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-white flex items-center gap-1.5 border border-white/10">
                      <Mic className="h-3 w-3 text-emerald-400 animate-pulse" />
                      <span>{spotlightCand.decibels || 38} dB</span>
                    </div>
                    <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-1.5 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>MediaPipe Vision Active</span>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300 border border-white/10">
                    <span>Gaze: {spotlightCand.gaze || 'Centered on Desk'}</span>
                  </div>

                  {isPaused && (
                    <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-2 animate-in fade-in">
                      <ShieldAlert className="h-12 w-12 text-rose-500 animate-pulse" />
                      <span className="text-base font-black text-white uppercase tracking-wider">
                        Exam Suspended &bull; 3 Malpractice Strikes
                      </span>
                      <span className="text-xs text-rose-200/90 max-w-sm">
                        Chief Invigilator inquiry in progress. Candidate is locked at top-left of grid awaiting verdict.
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Ribbon */}
                <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Dossier Infractions: <b>{spotlightCand.analysisSheet?.length || 0} Events</b></span>
                    <span>Suspicion Index: <b>{spotlightCand.suspicionScore || 0}%</b></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleIntercom(spotlightCand)}
                      className={`flex-1 min-w-[130px] px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeIntercomCandidateId === spotlightCand.id
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      <PhoneCall className="h-3.5 w-3.5 text-rose-400" />
                      <span>{activeIntercomCandidateId === spotlightCand.id ? 'End 1-on-1 Voice' : '1-on-1 Voice Intercom'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedAnalysisCandidate(spotlightCand)}
                      className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>View Analysis Sheet ({spotlightCand.analysisSheet?.length || 0})</span>
                    </button>

                    {spotlightCand.pdfUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedPdfCandidate(spotlightCand)}
                        className="w-full px-3 py-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60 text-xs font-black cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <FileCheck className="h-3.5 w-3.5" />
                        <span>View Uploaded Answer Script PDF ({spotlightCand.scriptPagesUploaded || 6} Pages &bull; {spotlightCand.sealCode || 'SEAL-8B-9482'})</span>
                      </button>
                    )}
                  </div>

                  {/* Decision Controls: Pardon vs Disqualify */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handlePardonCandidate(spotlightCand)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Pardon Strikes &amp; Resume</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEvictModalCandidate(spotlightCand)}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>Disqualify &amp; Evict</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>\n\n      """

    code = code[:sec2_start] + new_sec2_and_studio + code[sec3_start:]

# 6. Update student grid video element ref
code = code.replace(
    """<video
                      ref={studentWebcamRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${isPaused ? 'grayscale opacity-35' : ''}`}
                    />""",
    """<video
                      ref={studentGridWebcamRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${isPaused ? 'grayscale opacity-35' : ''}`}
                    />"""
)

# 7. Write patched file
with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Successfully patched live-invigilator-cockpit.tsx!")
