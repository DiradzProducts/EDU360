with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('Simulate Proctor Strike')
if pos != -1:
    btn_start = text.rfind('<button', 0, pos)
    btn_end = text.find('</button>', pos) + len('</button>')

    repl_block = """{/* Edge AI Vision Status & Analysis Sheet Quick Tile */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${isAiModelLoaded ? 'bg-emerald-500 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
                        Edge Vision AI
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        {isAiModelLoaded ? 'COCO-SSD Active' : 'Monitoring Feed'}
                      </span>
                    </div>

                    {activeDetectedObject && (
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 font-bold animate-pulse">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                          {activeDetectedObject}
                        </span>
                        <span className="text-[9px] uppercase font-black bg-rose-600 text-white px-1.5 py-0.5 rounded">
                          Immediate Strike
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowAnalysisSheetModal(true)}
                      className="w-full py-2 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-[10px] font-black flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                        <span>Proctor Analysis Sheet</span>
                      </span>
                      <span className="font-mono px-1.5 py-0.5 rounded bg-violet-200 dark:bg-violet-900 text-violet-800 dark:text-violet-200 font-black">
                        {proctorAnalysisSheet.length} Logged
                      </span>
                    </button>
                  </div>

                  {/* Manual Test Trigger (Simulate Strike for all 4 rules) */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.min(3, proctorStrikes + 1);
                      triggerProctorViolation({
                        category: next === 1 ? 'CELL_PHONE' : next === 2 ? 'MULTIPLE_PERSONS' : 'GAZE_DRIFT',
                        title: next === 1 ? 'Unauthorized Mobile Device Detected' : next === 2 ? 'Multiple Persons in Testing Zone' : 'Off-Desk Gaze Shift',
                        ruleTriggered: next === 1 
                          ? "Object: 'cell phone' --\u003e Confidence: 0.89 \u003e 0.70 --\u003e Immediate Strike" 
                          : next === 2 
                          ? "Object: 'person' (count: 2 \u003e 1) --\u003e Multiple faces \u003e 3s" 
                          : "Face Mesh: Gaze Direction --\u003e Looking away \u003e 5s",
                        confidence: 0.89,
                        actionTaken: 'STRIKE',
                        notes: 'Manual validation test triggered via proctor edge pipeline.'
                      });
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-violet-100 hover:bg-violet-200 dark:bg-violet-950/60 dark:hover:bg-violet-900 text-violet-700 dark:text-violet-300 font-bold text-[10px] border border-violet-300 dark:border-violet-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    title="Test proctor rule pipeline and sync to Analysis Sheet and Invigilator Dock"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>⚡ Test Next Rule Infraction</span>
                  </button>"""

    text = text[:btn_start] + repl_block + text[btn_end:]
    with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Successfully replaced simulate button with Edge AI status tile & 4-rule test button!')
