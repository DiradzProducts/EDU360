with open("frontend/src/app/parent/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find the lines containing "Metric 3: Live School Bus Route"
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if "Metric 3: Live School Bus Route" in line:
        start_idx = i
    if start_idx is not None and "Metric 4: Fee Milestones" in line:
        end_idx = i
        break

print(f"start_idx: {start_idx}, end_idx: {end_idx}")

if start_idx is not None and end_idx is not None:
    replacement_chat = """                  {/* Metric 3: Teacher Direct Chat & Support */}
                  <div 
                    onClick={() => setActiveNav('chat')}
                    className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5.5 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/30 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
                  >
                    {/* Ambient Glow Orb */}
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

                    <div className="space-y-3.5 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Teacher Direct Chat
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-transparent text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs ring-4 ring-indigo-500/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center font-bold">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="text-xl sm:text-[22px] font-black text-slate-900 dark:text-white tracking-tight">
                            {activeKid.homeroomFaculty}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            Active Online
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                          Class Teacher &bull; {activeKid.className} &bull; 1-on-1 Academic Support
                        </p>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500 shadow-xs" style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100/90 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">
                      <span>Open 1-on-1 Chat Thread</span>
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>\n\n"""
    new_lines = lines[:start_idx] + [replacement_chat] + lines[end_idx:]
    with open("frontend/src/app/parent/page.tsx", "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Replaced successfully!")
