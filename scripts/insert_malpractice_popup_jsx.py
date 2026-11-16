# -*- coding: utf-8 -*-
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """      {/* POST-EXAM PROCTORING AUDIT DOSSIER MODAL */}
      {showDossierModal && (
        <ProctorIntegrityDossierModal
          isOpen={showDossierModal}
          candidateId={dossierCandidateId || 1}
          onClose={() => setShowDossierModal(false)}
          onVerdictApplied={() => {
            triggerToast('Proctoring audit verdict logged successfully.');
          }}
        />
      )}

    </RoleGuard>"""

replacement = """      {/* POST-EXAM PROCTORING AUDIT DOSSIER MODAL */}
      {showDossierModal && (
        <ProctorIntegrityDossierModal
          isOpen={showDossierModal}
          candidateId={dossierCandidateId || 1}
          onClose={() => setShowDossierModal(false)}
          onVerdictApplied={() => {
            triggerToast('Proctoring audit verdict logged successfully.');
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* LIVE MALPRACTICE POPUP ON LEFT CORNER (PERSISTENT PROCTOR MONITORING) */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeMalpracticeAlerts.length > 0 && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
          {activeMalpracticeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-2xl border-2 border-rose-500 bg-slate-900/95 text-white p-4 shadow-2xl backdrop-blur-md ring-4 ring-rose-500/20 relative overflow-hidden"
            >
              {/* Top Warning Strip */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    <span>MALPRACTICE ALERT &bull; ROOM ALPHA</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMalpracticeAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Candidate Details & Violation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">
                    {alert.studentName} <span className="font-mono text-xs text-violet-300">({alert.className} &bull; Roll #{alert.rollNo})</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                    Strike {alert.strikes}/3 {alert.strikes >= 3 ? '(-5 Marks)' : ''}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs space-y-1">
                  <span className="font-bold text-rose-200 block">{alert.title}</span>
                  <span className="text-[11px] text-slate-300 font-mono block line-clamp-1">{alert.ruleTriggered}</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
                    <span>{alert.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const ch = new BroadcastChannel('edu360_exam_live_channel');
                      ch.postMessage({
                        type: 'TALK_ONE_ON_ONE',
                        candidateId: alert.candidateId,
                        message: `${alert.studentName}, this is Chief Invigilator. Stop unauthorized action immediately.`
                      });
                      ch.close();
                    } catch {}
                    triggerToast(`🎙️ 1-on-1 Voice Warning sent to ${alert.studentName}.`);
                  }}
                  className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <PhoneCall className="h-3 w-3 text-rose-400" />
                  <span>Talk 1-on-1</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      const ch = new BroadcastChannel('edu360_exam_live_channel');
                      ch.postMessage({ type: 'EXAM_PAUSE', candidateId: alert.candidateId });
                      ch.close();
                    } catch {}
                    triggerToast(`⏸️ Screen & Timer Paused for ${alert.studentName}.`);
                  }}
                  className="px-2 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Pause className="h-3 w-3" />
                  <span>Pause Exam</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('exams_gradebook');
                    setExamSubTab('live_cockpit');
                    setActiveMalpracticeAlerts(prev => prev.filter(a => a.id !== alert.id));
                  }}
                  className="px-2 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Video className="h-3 w-3" />
                  <span>View Feed</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </RoleGuard>"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Inserted Left Corner Malpractice Popup successfully.")
else:
    print("Target not found.")
