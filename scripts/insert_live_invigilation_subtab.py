with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = """                      {teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length > 0 && (

                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white shrink-0">

                          {teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length}

                        </span>

                      )}

                    </button>

                  </div>"""

replacement = """                      {teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length > 0 && (

                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white shrink-0">

                          {teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length}

                        </span>

                      )}

                    </button>

                    <button
                      type="button"
                      onClick={() => setExamSubTab('live_cockpit')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-all cursor-pointer ${
                        examSubTab === 'live_cockpit'
                          ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Video className="h-3 w-3 shrink-0 text-violet-500" />
                        <span className="truncate">Live Invigilation</span>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                    </button>

                  </div>"""

if target in text:
    text = text.replace(target, replacement, 1)
    with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Inserted Live Invigilation into teacher sidebar successfully!")
else:
    print("Target not found for Live Invigilation submenu insertion")
