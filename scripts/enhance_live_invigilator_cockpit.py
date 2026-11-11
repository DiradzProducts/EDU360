import re

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update handleToggleIntercom to broadcast TALK_ONE_ON_ONE and END_INTERCOM
target_intercom = """  const handleToggleIntercom = (candidate: ProctorCandidate) => {
    if (activeIntercomCandidateId === candidate.id) {
      setActiveIntercomCandidateId(null);
      triggerToast(`Ended private intercom with ${candidate.name}. Audio channel closed.`);
    } else {
      setActiveIntercomCandidateId(candidate.id);
      triggerToast(`🎙️ 1-on-1 Intercom Active with ${candidate.name}. Speaking directly to candidate.`);
      api.sendProctorAction({
        candidate_id: candidate.id,
        action: 'INTERCOM',
        reason: '1-on-1 push-to-talk audio intercom established.'
      }).catch(console.error);
    }
  };"""

repl_intercom = """  const handleToggleIntercom = (candidate: ProctorCandidate) => {
    if (activeIntercomCandidateId === candidate.id) {
      setActiveIntercomCandidateId(null);
      triggerToast(`Ended private intercom with ${candidate.name}. Audio channel closed.`);
      try {
        const channel = new BroadcastChannel('edu360_exam_live_channel');
        channel.postMessage({
          type: 'END_INTERCOM',
          candidateId: candidate.id
        });
        channel.close();
      } catch {}
    } else {
      setActiveIntercomCandidateId(candidate.id);
      triggerToast(`🎙️ 1-on-1 Intercom Active with ${candidate.name}. Speaking directly to candidate.`);
      try {
        const channel = new BroadcastChannel('edu360_exam_live_channel');
        channel.postMessage({
          type: 'TALK_ONE_ON_ONE',
          candidateId: candidate.id,
          studentId: candidate.studentId,
          invigilatorName: 'Mrs. Ananya Verma',
          message: `${candidate.name}, please adjust your device camera so that your physical paper booklet and hands remain visible on your desk.`
        });
        channel.close();
      } catch {}
      api.sendProctorAction({
        candidate_id: candidate.id,
        action: 'INTERCOM',
        reason: '1-on-1 push-to-talk audio intercom established.'
      }).catch(console.error);
    }
  };"""

if target_intercom in text:
    text = text.replace(target_intercom, repl_intercom, 1)
    print("Updated handleToggleIntercom with BroadcastChannel messages")
else:
    print("Warning: target_intercom exact match not found, checking with normalize")

# 2. Add flaggedCandidates definition right before return
target_return_pre = "  return ("
repl_return_pre = """  // Priority Malpractice Candidates for Left-Corner Dock
  const flaggedCandidates = candidates.filter(c => 
    (c.strikes && c.strikes > 0) || 
    c.status === 'critical' || 
    c.status === 'warning' || 
    c.isPaused || 
    c.status === 'paused' ||
    (c.suspicionScore > 40)
  );

  return ("""

if "const flaggedCandidates = candidates.filter" not in text:
    text = text.replace(target_return_pre, repl_return_pre, 1)
    print("Added flaggedCandidates filter")

# 3. Add Left-Corner Malpractice Priority Dock around the candidate grid
target_grid = """      {/* CANDIDATES VIDEO MATRIX (16-Grid Responsive Mosaic with Dynamic Auto-Triage) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">"""

repl_dock_and_grid = """      {/* MALPRACTICE INCIDENT TRIAGE & CANDIDATES MATRIX */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* STICKY LEFT-CORNER MALPRACTICE PRIORITY DOCK */}
        <div className="w-full lg:w-84 shrink-0 space-y-3 lg:sticky lg:top-4">
          <div className="rounded-3xl border-2 border-rose-500/70 bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/30">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-400">
                  Malpractice Priority Dock
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                flaggedCandidates.length > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
              }`}>
                {flaggedCandidates.length} Active
              </span>
            </div>

            <div className="mt-3 space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {flaggedCandidates.length === 0 ? (
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs font-bold text-white">All Desks Compliant</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Edge YOLO AI actively scanning face gaze and hands posture across all candidates.
                  </p>
                </div>
              ) : (
                flaggedCandidates.map((c) => {
                  const isIntercom = activeIntercomCandidateId === c.id;
                  const isPaused = c.isPaused || c.status === 'paused';
                  return (
                    <div 
                      key={`malpractice-dock-${c.id}`}
                      className="p-3.5 rounded-2xl bg-rose-950/30 border-2 border-rose-500/80 shadow-lg space-y-2.5 animate-in slide-in-from-left duration-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="h-10 w-10 rounded-xl object-cover border border-rose-400 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-white">{c.name}</h4>
                              <span className="text-[9px] font-mono text-rose-300">Roll #{c.rollNo}</span>
                            </div>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white mt-0.5">
                              {c.anomalyType || 'Suspicious Posture'}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shrink-0">
                          Strike {c.strikes || 1}/3
                        </span>
                      </div>

                      {/* 1-Click Priority Action Buttons */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-rose-900/50">
                        {/* 1. Talk 1-on-1 (Pops teacher video onto student screen) */}
                        <button
                          type="button"
                          onClick={() => handleToggleIntercom(c)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            isIntercom
                              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 animate-pulse'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                          }`}
                          title="Speak 1-on-1 with student"
                        >
                          <Mic className="h-3 w-3" />
                          <span>{isIntercom ? 'Speaking' : 'Talk 1-on-1'}</span>
                        </button>

                        {/* 2. Pause Exam */}
                        <button
                          type="button"
                          onClick={() => handleTogglePause(c)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            isPaused
                              ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300'
                              : 'bg-amber-600 hover:bg-amber-500 text-white'
                          }`}
                          title="Pause candidate exam"
                        >
                          <Pause className="h-3 w-3" />
                          <span>{isPaused ? 'Resume' : 'Pause'}</span>
                        </button>

                        {/* 3. Push Warning HUD */}
                        <button
                          type="button"
                          onClick={() => setWarningModalCandidate(c)}
                          className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Bell className="h-3 w-3 text-amber-400" />
                          <span>Warning HUD</span>
                        </button>

                        {/* 4. Integrity Dossier */}
                        <button
                          type="button"
                          onClick={() => handleOpenDossier(c)}
                          className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-purple-900/60 hover:bg-purple-900/90 text-purple-200 border border-purple-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <FileCheck className="h-3 w-3 text-purple-400" />
                          <span>Dossier</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT AREA: 16-GRID CANDIDATE MOSAIC */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">"""

if target_grid in text:
    text = text.replace(target_grid, repl_dock_and_grid, 1)
    print("Inserted Malpractice Priority Dock and adjusted grid layout")
    
    # Close the wrapping flex container after the candidate grid closes
    # Find closing of candidates.map
    # Let's find:
    #         );
    #       })}
    #     </div>
    end_pattern = """                  </div>
                </div>
              </div>
            );
          })}
        </div>"""
    
    repl_end_pattern = """                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>"""
    if end_pattern in text:
        text = text.replace(end_pattern, repl_end_pattern, 1)
        print("Closed wrapping flex container for cockpit")
    else:
        print("Note: end_pattern exact match needs verification")

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved live-invigilator-cockpit.tsx updates")
