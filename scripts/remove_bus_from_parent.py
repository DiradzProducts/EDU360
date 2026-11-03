with open("frontend/src/app/parent/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove Bus from lucide-react import
content = content.replace("  Bus,\n", "")

# 2. Remove BusRoute from types import
content = content.replace("  BusRoute, \n", "").replace("  BusRoute,\n", "")

# 3. Remove BusTracker import
content = content.replace("import { BusTracker } from '@/components/bus-tracker';\n", "")

# 4. Remove 'bus' from ParentNavSection
content = content.replace("  | 'bus'\n", "")

# 5. Remove busRoute state
content = content.replace("  const [busRoute, setBusRoute] = useState<BusRoute | null>(null);\n", "")

# 6. Update DEFAULT_PARENT_FEES
old_fee_2 = '{ id: 2, student_id: 1, title: "Milestone 2: Q1 AC Bus Transport & GPS Fee", amount: 14500, due_date: "15 Jul 2026", status: "Paid", receipt_no: "REC-2026-FEE-5822", paid_at: "15 Jul 2026, 03:40 PM", payment_method: "Net Banking (HDFC)" },'
new_fee_2 = '{ id: 2, student_id: 1, title: "Milestone 2: Digital Learning Platform & Cloud LMS Fee", amount: 14500, due_date: "15 Jul 2026", status: "Paid", receipt_no: "REC-2026-FEE-5822", paid_at: "15 Jul 2026, 03:40 PM", payment_method: "Net Banking (HDFC)" },'
content = content.replace(old_fee_2, new_fee_2)

old_fee_5 = '{ id: 5, student_id: 1, title: "Milestone 5: Q2 AC Bus Transport Fee", amount: 14500, due_date: "10 Nov 2026", status: "Upcoming" },'
new_fee_5 = '{ id: 5, student_id: 1, title: "Milestone 5: Interactive Virtual Labs & AI Proctoring Fee", amount: 14500, due_date: "10 Nov 2026", status: "Upcoming" },'
content = content.replace(old_fee_5, new_fee_5)

# 7. In useEffect, remove getBusTracker
old_promise = """        const [ftRes, busRes, feesRes, subRes, exitsRes, hwRes] = await Promise.all([
          api.getFocusTable(activeKidId),
          api.getBusTracker(activeKidId),
          api.getFees(activeKidId),
          api.getSubmission(activeKidId),
          api.getExitClearances(),
          api.getTodayHomework(activeKidId),
          api.getParentLeaveRequests(activeKidId)
        ]);
        setFocusTable(ftRes);
        setBusRoute(busRes);"""

new_promise = """        const [ftRes, feesRes, subRes, exitsRes, hwRes] = await Promise.all([
          api.getFocusTable(activeKidId),
          api.getFees(activeKidId),
          api.getSubmission(activeKidId),
          api.getExitClearances(),
          api.getTodayHomework(activeKidId),
          api.getParentLeaveRequests(activeKidId)
        ]);
        setFocusTable(ftRes);"""

content = content.replace(old_promise, new_promise)

# 8. Remove handleAdvanceBus
old_advance = """  const handleAdvanceBus = async () => {
    const updated = await api.stepBusRoute(activeKidId);
    setBusRoute(updated);
  };
"""
content = content.replace(old_advance, "")

# 9. In handleBannerAction
content = content.replace("    else if (target === 'bus') setActiveNav('bus');\n", "")

# 10. In navGroups, remove any bus item if it exists
bus_nav_item = """        {
          id: 'bus' as ParentNavSection,
          label: 'School Bus & GPS Tracker',
          icon: Bus,
          badge: 'Route #4',
          badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
        },
"""
content = content.replace(bus_nav_item, "")

# 11. In getHeaderMeta, remove bus case and clean dashboard subtitle
old_meta = """      case 'dashboard':
        return { title: 'Parent Intelligence Dashboard', subtitle: 'Real-time overview of Aarav Sharma’s academics, attendance, and school bus telemetry' };
      case 'marks':
        return { title: 'Examination Marks & Board Report Cards', subtitle: 'CBSE-formatted subject breakdown, teacher remarks, and email memo dispatch' };
      case 'focus_table':
        return { title: 'Shared Focus Table & Teacher Interventions', subtitle: 'Collaborate with Mrs. Ananya Verma on weak concepts across all 7 curriculum subjects' };
      case 'child_sis':
        return { title: 'Child SIS Dossier & Official Document Vault', subtitle: 'Single source of truth: 94.2% attendance compliance, weekly timetable, and certified school records' };
      case 'chat':
        return { title: `Live Chat with ${activeKid.homeroomFaculty}`, subtitle: `Direct 1-on-1 academic communication channel for ${activeKid.name} (${activeKid.className})` };
      case 'ptm_connect':
        return { title: 'Parent-Teacher Communication & Online PTM Hub', subtitle: 'Direct note messaging with teachers and 1-on-1 scheduled video conferences' };
      case 'bus':
        return { title: 'Live School Bus GPS Tracking (Route 4)', subtitle: 'Real-time GPS telemetry, stop-by-stop progress, and driver Ramesh Kumar contact' };
      case 'fees':"""

new_meta = """      case 'dashboard':
        return { title: 'Parent Intelligence Dashboard', subtitle: `Real-time overview of ${activeKid.name}’s online classes, academic progress, and faculty communications` };
      case 'marks':
        return { title: 'Examination Marks & Board Report Cards', subtitle: 'CBSE-formatted subject breakdown, teacher remarks, and email memo dispatch' };
      case 'focus_table':
        return { title: 'Shared Focus Table & Teacher Interventions', subtitle: 'Collaborate with Mrs. Ananya Verma on weak concepts across all 7 curriculum subjects' };
      case 'child_sis':
        return { title: 'Child SIS Dossier & Official Document Vault', subtitle: 'Single source of truth: 94.2% attendance compliance, weekly timetable, and certified school records' };
      case 'chat':
        return { title: `Live Chat with ${activeKid.homeroomFaculty}`, subtitle: `Direct 1-on-1 academic communication channel for ${activeKid.name} (${activeKid.className})` };
      case 'ptm_connect':
        return { title: 'Parent-Teacher Communication & Online PTM Hub', subtitle: 'Direct note messaging with teachers and 1-on-1 scheduled video conferences' };
      case 'fees':"""

content = content.replace(old_meta, new_meta)

# 12. Replace Quick Stats Card (School Bus Radar -> Direct Teacher Chat)
target_quick_stat_bus = """                  <div 
                    onClick={() => setActiveNav('bus')}
                    className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5.5 shadow-xs hover:shadow-xl hover:shadow-teal-500/10 dark:hover:shadow-teal-950/30 hover:border-teal-500/40 dark:hover:border-teal-500/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
                  >
                    {/* Ambient Glow Orb */}
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

                    <div className="space-y-3.5 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          School Bus Radar
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-teal-500/15 via-cyan-500/10 to-transparent text-teal-600 dark:text-teal-400 border border-teal-500/30 shadow-xs ring-4 ring-teal-500/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center font-bold">
                          <Bus className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                            Route #12
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
                            </span>
                            Active On-Time
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                          Pickup 07:45 AM &bull; Evening Drop 03:45 PM
                        </p>
                      </div>

                      {/* Elevated Dual-tone Progress Bar */}
                      <div className="pt-2">
                        <div className="flex justify-between text-[11px] font-black mb-1.5">
                          <span className="text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                            Approaching Stop #4
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">ETA 8 mins</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-400 rounded-full transition-all duration-700 shadow-xs" 
                            style={{ width: `${((busRoute?.current_stop_idx ?? 1) / 4) * 100}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-black text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 relative z-10 transition-colors">
                      <span className="inline-flex items-center gap-1.5">
                        <span>Live GPS Telemetry</span>
                        <span className="text-[10px] text-teal-500/70 font-semibold">• Driver Call</span>
                      </span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>"""

replacement_quick_stat_chat = """                  <div 
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
                          Class Teacher &bull; {activeKid.className} &bull; Hours: 8:30 AM - 4:00 PM
                        </p>
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between text-[11px] font-black mb-1.5">
                          <span className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                            1-on-1 Academic Support
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">Instant Channel</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 truncate">
                          &quot;Aarav solved 10 factoring problems correctly!&quot;
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 relative z-10 transition-colors">
                      <span className="inline-flex items-center gap-1.5">
                        <span>Open 1-on-1 Chat Thread</span>
                        <span className="text-[10px] text-indigo-500/70 font-semibold">• Direct Channel</span>
                      </span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>"""

content = content.replace(target_quick_stat_bus, replacement_quick_stat_chat)

# 13. Replace Quick Portals Card (Portal 5: School Bus GPS -> Portal 5: Direct Teacher Chat)
target_portal_bus = """                    {/* Portal 5: School Bus GPS */}
                    <button
                      onClick={() => setActiveNav('bus')}
                      className="relative overflow-hidden p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-xl hover:shadow-teal-500/10 dark:hover:shadow-teal-950/20 text-left transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col justify-between min-h-[190px]"
                    >
                      {/* Ambient Accent Orb */}
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/15 via-cyan-500/10 to-transparent text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold shadow-xs ring-4 ring-teal-500/5 group-hover:scale-110 transition-transform">
                            <Bus className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-black text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            Live RFID
                          </span>
                        </div>
                        <div className="my-3.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors tracking-tight">
                            Live School Bus GPS Tracker
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-1 leading-relaxed font-medium">
                            Real-time turnstile telemetry, driver coordinates, and stop arrival countdown.
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        <span>Track Bus #12 Live</span>
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>"""

replacement_portal_chat = """                    {/* Portal 5: Direct Teacher Chat */}
                    <button
                      onClick={() => setActiveNav('chat')}
                      className="relative overflow-hidden p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/20 text-left transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col justify-between min-h-[190px]"
                    >
                      {/* Ambient Accent Orb */}
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-transparent text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shadow-xs ring-4 ring-indigo-500/5 group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            Direct Channel
                          </span>
                        </div>
                        <div className="my-3.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                            Chat with Class Teacher
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-1 leading-relaxed font-medium">
                            1-on-1 direct channel with {activeKid.homeroomFaculty} for remedial feedback and queries.
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <span>Open Chat Window</span>
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>"""

content = content.replace(target_portal_bus, replacement_portal_chat)

# 14. Remove activeNav === 'bus' entire view block
bus_view_block = """            {/* ===================================================== */}
            {/* VIEW 6: LIVE SCHOOL BUS GPS TRACKER                   */}
            {/* ===================================================== */}
            {activeNav === 'bus' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Live School Bus GPS Tracking (Route 4)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live telemetry tracking school bus KA-01-EB-4412 along assigned stops with real-time ETA
                  </p>
                </div>

                {/* Emergency Driver Quick-Dial & Control Room SOS Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 p-4 rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Bus Driver (Route 4)</span>
                      <strong className="text-xs text-slate-900 dark:text-white">Ramesh Kumar</strong>
                      <a href="tel:+919845011223" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block hover:underline">
                        +91 98450 11223 (Direct Call)
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Onboard Attendant</span>
                      <strong className="text-xs text-slate-900 dark:text-white">Shanti Devi</strong>
                      <a href="tel:+919845044556" className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block hover:underline">
                        +91 98450 44556
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Transport Helpdesk SOS</span>
                      <strong className="text-xs text-slate-900 dark:text-white">Campus Control Room</strong>
                      <a href="tel:+914023456789" className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block hover:underline">
                        +91 40 2345 6789 (24x7 SOS)
                      </a>
                    </div>
                  </div>
                </div>

                {busRoute ? (
                  <BusTracker
                    bus={busRoute}
                    onAdvanceStop={handleAdvanceBus}
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500">Connecting to GPS tracker...</div>
                )}
              </div>
            )}
"""

content = content.replace(bus_view_block, "")

with open("frontend/src/app/parent/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("parent/page.tsx updated and bus completely removed!")
