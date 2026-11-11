with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove import LiveInvigilatorCockpit
import_target = "import { LiveInvigilatorCockpit } from '@/components/proctor/live-invigilator-cockpit';"
if import_target in text:
    text = text.replace(import_target, "", 1)
    print("Removed LiveInvigilatorCockpit import")
else:
    print("Warning: LiveInvigilatorCockpit import not found")

# 2. Update ExamTab type
type_target = "type ExamTab = 'dashboard' | 'secrecy_vault' | 'schedules' | 'cockpit' | 'moderation' | 'report_cards' | 'tasks';"
type_replacement = "type ExamTab = 'dashboard' | 'secrecy_vault' | 'schedules' | 'moderation' | 'report_cards' | 'tasks';"
if type_target in text:
    text = text.replace(type_target, type_replacement, 1)
    print("Updated ExamTab type")
else:
    print("Warning: ExamTab type not found")

# 3. Remove sidebar tab
sidebar_target = "{ id: 'cockpit', label: 'Live AI Proctor Cockpit', icon: Video, badge: 'Live Stream', badgeType: 'amber' },"
if sidebar_target in text:
    text = text.replace(sidebar_target, "", 1)
    print("Removed sidebar tab for cockpit")
else:
    print("Warning: sidebar tab not found")

# 4. Update table header
header_target = '<th className="p-3.5 text-right">Invigilation Cockpit</th>'
header_replacement = '<th className="p-3.5 text-right">Duty Order & Status</th>'
if header_target in text:
    text = text.replace(header_target, header_replacement, 1)
    print("Updated table header")
else:
    print("Warning: header_target not found")

# 5. Update table action column
btn_target = """                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('cockpit');
                              triggerToast(`Entering Live Proctor Cockpit for ${row.subject} (${row.class_name})...`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold shadow-sm cursor-pointer transition-all active:scale-95"
                          >
                            <Video className="h-3 w-3 text-rose-300 animate-pulse" />
                            <span>Enter Cockpit</span>
                          </button>
                        </td>"""

btn_replacement = """                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>Order Deployed: {row.chief_invigilator_name || 'Invigilator'}</span>
                          </div>
                        </td>"""

if btn_target in text:
    text = text.replace(btn_target, btn_replacement, 1)
    print("Updated table action column")
else:
    print("Warning: btn_target not found")

# 6. Remove cockpit section
cockpit_section_target = """          {/* ════ TAB: LIVE AI PROCTOR COCKPIT ════ */}

          {activeTab === 'cockpit' && (

            <div className="space-y-6">

              <LiveInvigilatorCockpit />

            </div>

          )}"""

if cockpit_section_target in text:
    text = text.replace(cockpit_section_target, "", 1)
    print("Removed cockpit section")
else:
    # Try searching without emojis or whitespace variations
    import re
    cockpit_re = re.compile(r"\{\s*/\*\s*[^\*]*TAB:\s*LIVE AI PROCTOR COCKPIT[^\*]*\*/\s*\}\s*\{activeTab === 'cockpit' && \(\s*<div[^>]*>\s*<LiveInvigilatorCockpit\s*/>\s*</div>\s*\)\}", re.DOTALL)
    if cockpit_re.search(text):
        text = cockpit_re.sub("", text, count=1)
        print("Removed cockpit section via regex")
    else:
        print("Warning: cockpit_section_target not found via regex")

with open('frontend/src/app/exam_coordinator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated exam_coordinator/page.tsx!")
