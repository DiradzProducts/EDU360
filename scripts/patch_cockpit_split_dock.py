# -*- coding: utf-8 -*-
"""
Update live-invigilator-cockpit.tsx to include the MALPRACTICE PRIORITY EDGE dock on the left,
supporting instant elevation of flagged candidates with 1-click actions.
"""

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    cockpit_code = f.read()

# Replace Section 4 grid with split workspace (Malpractice Priority Edge Dock + Video Grid)
old_sec4_grid = """      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 4. ONLINE CLASSROOM VIDEO GRID (LIVEKIT SFU / MEET STYLE)                */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Tile 0: Chief Invigilator Studio Feed (Teacher Host Tile) */}
        <div className="rounded-3xl border-2 border-violet-500/80 bg-slate-900 text-white overflow-hidden shadow-lg flex flex-col ring-2 ring-violet-500/20">"""

new_sec4_grid = """      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 4. ONLINE CLASSROOM SPLIT WORKSPACE: MALPRACTICE DOCK + SFU MESH GRID    */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT CORNER DOCK: MALPRACTICE PRIORITY EDGE (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border-2 border-rose-500/80 bg-slate-900 text-white p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-500" />
                  <span>MALPRACTICE PRIORITY EDGE</span>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs">
                {candidates.filter(c => c.strikes > 0 || c.status === 'critical' || c.status === 'warning').length} Active
              </span>
            </div>

            {candidates.filter(c => c.strikes > 0 || c.status === 'critical' || c.status === 'warning').length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto" />
                <span className="text-xs font-bold text-slate-300 block">All Testing Zones Clear</span>
                <span className="text-[10px] text-slate-500 block">No candidate currently violating proctor policies</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {candidates
                  .filter(c => c.strikes > 0 || c.status === 'critical' || c.status === 'warning')
                  .map((cand) => (
                    <div
                      key={`flagged-dock-${cand.id}`}
                      className="rounded-2xl border border-rose-500/60 bg-rose-950/40 p-3 space-y-2.5 transition-all hover:border-rose-400 shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={cand.liveFrame || cand.avatar}
                            alt={cand.name}
                            className="h-9 w-9 rounded-xl object-cover border border-rose-400 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-black text-white block truncate">{cand.name}</span>
                            <span className="text-[10px] font-mono text-violet-300">Roll #{cand.rollNo}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse shrink-0">
                          Strike {cand.strikes}/3
                        </span>
                      </div>

                      {/* Active Anomaly Chip */}
                      <div className="p-2 rounded-xl bg-black/60 border border-rose-500/30 text-[11px] text-rose-300 flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5 truncate">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">{cand.anomalyType || 'Suspicious Activity'}</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-1">
                          {cand.suspicionScore}% Suspect
                        </span>
                      </div>

                      {/* Action Buttons Grid */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleIntercom(cand)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-black cursor-pointer flex items-center justify-center gap-1 transition-all ${
                            activeIntercomCandidateId === cand.id ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          <PhoneCall className="h-3 w-3" />
                          <span>{activeIntercomCandidateId === cand.id ? 'End Intercom' : 'Talk 1-on-1'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTogglePause(cand)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-black cursor-pointer flex items-center justify-center gap-1 transition-all ${
                            cand.isPaused ? 'bg-emerald-600 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
                          }`}
                        >
                          <Pause className="h-3 w-3" />
                          <span>{cand.isPaused ? 'Resume' : 'Pause'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setWarningModalCandidate(cand)}
                          className="py-1.5 px-2 rounded-xl border border-amber-400/60 hover:bg-amber-950/40 text-amber-300 text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1 transition-all"
                        >
                          <AlertTriangle className="h-3 w-3 text-amber-400" />
                          <span>Warning HUD</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedAnalysisCandidate(cand)}
                          className="py-1.5 px-2 rounded-xl bg-violet-600/80 hover:bg-violet-600 text-white text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1 transition-all"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Dossier ({cand.analysisSheet?.length || 0})</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT AREA: SFU MESH VIDEO GRID (8 cols) */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Tile 0: Chief Invigilator Studio Feed (Teacher Host Tile) */}
        <div className="rounded-3xl border-2 border-violet-500/80 bg-slate-900 text-white overflow-hidden shadow-lg flex flex-col ring-2 ring-violet-500/20">"""

if old_sec4_grid in cockpit_code:
    cockpit_code = cockpit_code.replace(old_sec4_grid, new_sec4_grid, 1)
    # Also close the extra <div> wrapper before Section 5
    old_sec5_start = """      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 5. PROCTOR INTEGRITY ANALYSIS SHEET MODAL FOR TEACHER                     */}"""
    
    new_sec5_start = """          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 5. PROCTOR INTEGRITY ANALYSIS SHEET MODAL FOR TEACHER                     */}"""
    
    cockpit_code = cockpit_code.replace(old_sec5_start, new_sec5_start, 1)
    with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
        f.write(cockpit_code)
    print("live-invigilator-cockpit.tsx split workspace updated.")
else:
    print("old_sec4_grid not found.")
