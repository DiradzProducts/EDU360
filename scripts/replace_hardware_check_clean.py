with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = "{/* Hardware & System Readiness Check */}"
end_marker = "{/* Candidate Declaration & Agreement Action */}"

start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

if start_idx != -1 and end_idx != -1:
    repl_hw_box = """{/* Live Camera & Hardware Diagnostic Station */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Pre-Flight Hardware &amp; AI Proctor Verification</h4>
                    <p className="text-[11px] text-slate-500">Live webcam preview, audio decibel calibration &amp; WebRTC connectivity check</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Hardware Certified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Live Camera Feed Preview */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border-2 border-violet-500/40 shadow-inner flex items-center justify-center group">
                  <video
                    ref={rulesVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Bounding box simulation */}
                  <div className="absolute inset-4 border border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-2 bg-emerald-500/5">
                    <span className="self-start text-[9px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <Camera className="h-2.5 w-2.5" />
                      YOLO v8: 1 Face Detected ({studentName})
                    </span>
                    <span className="self-end text-[9px] font-mono text-emerald-300 bg-black/60 px-1.5 py-0.5 rounded">
                      Desk Surface: Centered
                    </span>
                  </div>

                  {!cameraActive && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center text-slate-400 space-y-2">
                      <VideoOff className="h-8 w-8 text-slate-500" />
                      <span className="text-xs font-bold text-slate-300">Camera Feed Inactive or Blocked</span>
                      <p className="text-[10px] text-slate-400 max-w-xs">Please allow browser webcam &amp; microphone permissions to complete verification.</p>
                    </div>
                  )}
                </div>

                {/* Hardware Telemetry Gauges */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Mic className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                        <span>Microphone Noise Calibration:</span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{audioDecibels} dB (Permitted Range)</span>
                    </div>
                    {/* Audio Level Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 transition-all duration-100"
                        style={{ width: `${Math.min(100, Math.max(15, (audioDecibels - 20) * 1.5))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">LiveKit SFU Mesh</span>
                        <span className="font-bold text-slate-900 dark:text-white">22ms Low-Latency</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Edge AI Detector</span>
                        <span className="font-bold text-slate-900 dark:text-white">YOLO v8 Active</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    * If you experience network jitters, the offline auto-save engine buffers your responses locally.
                  </p>
                </div>
              </div>
            </div>

            """
    text = text[:start_idx] + repl_hw_box + text[end_idx:]
    with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Replaced Hardware Check with Live Camera & Hardware Diagnostic Station successfully!")
else:
    print("Markers not found:", start_idx, end_idx)
