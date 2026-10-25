import re

file_path = 'frontend/src/app/admissions_coordinator/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add useRouter import if not present
if "import { useRouter } from 'next/navigation';" not in content:
    content = content.replace(
        "import Link from 'next/link';",
        "import Link from 'next/link';\nimport { useRouter } from 'next/navigation';"
    )

# 2. Add const router = useRouter();
if "const router = useRouter();" not in content:
    content = content.replace(
        "export default function AdmissionsCoordinatorPage() {\n  const { user } = useAuth();",
        "export default function AdmissionsCoordinatorPage() {\n  const router = useRouter();\n  const { user } = useAuth();"
    )

# 3. Add horizontal filter tabs above the cards grid
tabs_html = """        {/* ── Horizontal Filter Tabs Bar ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Inquiries', count: enquiries.length, icon: Users, badgeType: 'slate' },
            { id: 'due_today', label: "Today's Calls", count: dueTodayCount, icon: BellRing, badgeType: 'amber' },
            { id: 'hot', label: 'Hot Leads', count: hotCount, icon: Flame, badgeType: 'rose' },
            { id: 'active', label: 'Active Pipeline', count: activeCount, icon: Users, badgeType: 'blue' },
            { id: 'followup', label: 'Follow-ups', count: followupCount, icon: Calendar, badgeType: 'blue' },
            { id: 'converted', label: 'Enrolled (SIS)', count: convertedCount, icon: UserCheck, badgeType: 'emerald' },
            { id: 'dropped', label: 'Dropped', count: droppedCount, icon: UserX, badgeType: 'slate' }
          ].map(tab => {
            const active = crmFilter === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCrmFilter(tab.id as CrmFilter)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  active 
                    ? 'bg-blue-500/50 text-white' 
                    : tab.badgeType === 'rose' && tab.count > 0
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                    : tab.badgeType === 'amber' && tab.count > 0
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>\n\n        {/* ── Enquiry Cards Grid ── */}"""

content = content.replace("        {/* ── Enquiry Cards Grid ── */}", tabs_html)

# 4. Replace the card rendering block
old_card_pattern = re.compile(r'(\{filteredEnquiries\.map\(enq => \{.+?return \(\n\s+<div \n\s+key=\{enq\.id\}.+?\n\s+\);\n\s+\}\)\})', re.DOTALL)

new_card_code = """{filteredEnquiries.map(enq => {
              const due = isDueToday(enq);
              const temp = enq.lead_temperature || 'warm';
              return (
                <div 
                  key={enq.id}
                  onClick={() => router.push(`/admissions_coordinator/leads/${enq.id}`)}
                  className={`rounded-2xl border bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs transition-all flex flex-col justify-between cursor-pointer group hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 ${
                    due 
                      ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20' 
                      : enq.stage === 'converted'
                      ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/10'
                      : enq.stage === 'dropped'
                      ? 'border-slate-200 dark:border-slate-800 opacity-80'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Top: Student Name & Priority / Source Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span 
                            className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1 truncate"
                            title="Open 360° Lead Dossier"
                          >
                            <span>{enq.student_name}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-blue-600 dark:text-blue-400" />
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {enq.target_grade}
                          </span>
                        </div>

                        {/* Parent & 1-Click Phone Dial/Copy */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{enq.parent_name}</span>
                          <span>•</span>
                          <div 
                            className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={`tel:${enq.phone}`} className="hover:underline flex items-center gap-1" title="Call directly">
                              <Phone className="h-3 w-3" />
                              {enq.phone}
                            </a>
                            <button
                              onClick={(e) => handleCopyPhone(enq.phone, e)}
                              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              title="Copy Phone Number"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Badges: Temperature (Click to toggle) & Source */}
                      <div className="flex flex-col items-end gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* 1-Click Temperature Pill */}
                        {enq.stage !== 'converted' && enq.stage !== 'dropped' && (
                          <button
                            onClick={(e) => handleToggleTemperature(enq, e)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${
                              temp === 'hot' 
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                : temp === 'warm'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                            }`}
                            title="Click to cycle priority: Hot -> Warm -> Cold"
                          >
                            {temp === 'hot' && <Flame className="h-3 w-3 text-rose-500 fill-rose-500" />}
                            {temp === 'warm' && <Sun className="h-3 w-3 text-amber-500" />}
                            {temp === 'cold' && <Snowflake className="h-3 w-3 text-slate-400" />}
                            <span className="capitalize">{temp}</span>
                          </button>
                        )}

                        {/* Source Pill */}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                          {enq.source || 'Website'}
                        </span>
                      </div>
                    </div>

                    {/* Due Today Alert / Next Call Date */}
                    {enq.next_followup_date && enq.stage !== 'converted' && enq.stage !== 'dropped' && (
                      <div className={`flex items-center justify-between text-[11px] p-2 rounded-xl font-bold ${
                        due 
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {due ? '🔔 Follow-up Due Today!' : 'Next Scheduled Call:'}
                        </span>
                        <span className="font-mono">{enq.next_followup_date}</span>
                      </div>
                    )}

                    {/* Drop Reason (If dropped) */}
                    {enq.stage === 'dropped' && enq.drop_reason && (
                      <div className="flex items-center justify-between text-[11px] p-2 rounded-xl font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                        <span>Drop Reason:</span>
                        <span className="font-bold">{enq.drop_reason}</span>
                      </div>
                    )}

                    {/* Call History & Discussion Notes Snippet */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Recent Call Notes &amp; Discussion:
                      </span>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 max-h-20 overflow-y-auto space-y-1 whitespace-pre-line">
                        {enq.notes ? (
                          enq.notes
                        ) : (
                          <span className="text-slate-400 italic">No notes recorded yet. Click card to view dossier &amp; log call.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                    {enq.stage !== 'converted' && enq.stage !== 'dropped' ? (
                      <button
                        type="button"
                        onClick={() => router.push(`/admissions_coordinator/leads/${enq.id}`)}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                        title="View Full Details, Call Logs, Document Verification & SIS Enrollment"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details &amp; SIS Enrollment</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    ) : enq.stage === 'converted' ? (
                      <div className="w-full flex items-center justify-between text-xs py-1">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Enrolled in SIS
                        </span>
                        <button
                          type="button"
                          onClick={() => router.push(`/admissions_coordinator/leads/${enq.id}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs py-1">
                        <button
                          type="button"
                          onClick={() => router.push(`/admissions_coordinator/leads/${enq.id}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:underline cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReopenLead(enq.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" /> Reopen Lead
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}"""

match = old_card_pattern.search(content)
if match:
    content = content[:match.start()] + new_card_code + content[match.end():]
    print("Successfully replaced card rendering block!")
else:
    print("Could not match old card rendering block regex")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated page.tsx written successfully!")
