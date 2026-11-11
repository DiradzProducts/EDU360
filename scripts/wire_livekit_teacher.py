import os

path = os.path.join("frontend", "src", "app", "teacher", "page.tsx")
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

import_target = "import { AttendanceSimulator } from '@/components/attendance-simulator';"
import_repl = "import { AttendanceSimulator } from '@/components/attendance-simulator';\nimport { EduVideoConferenceModal } from '@/components/livekit/edu-video-conference-modal';"

state_target = "  const [activeTab, setActiveTab] = useState<TeacherTab>('live_class');"
state_repl = "  const [activeTab, setActiveTab] = useState<TeacherTab>('live_class');\n  const [isLiveConferenceOpen, setIsLiveConferenceOpen] = useState(false);"

# In Start Live Class Session button
btn_target = "onClick={() => setActiveTab('live_class')}"
btn_repl = "onClick={() => { setActiveTab('live_class'); setIsLiveConferenceOpen(true); }}"

# Launch button inside Tab 1 header
tab_header_target = '<span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">\n                        1080p 60fps\n                      </span>'
tab_header_repl = '<button onClick={() => setIsLiveConferenceOpen(true)} className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm">\n                        <span>Launch LiveKit Video Room ↗</span>\n                      </button>'

modal_insert_target = "      {/* ===================================================== */}\n      {/* MODAL 1: RED-PEN HOMEWORK SPEEDGRADER CANVAS          */}"
modal_code = """      {/* REAL LIVEKIT VIDEO CONFERENCE MODAL FOR TEACHER */}
      <EduVideoConferenceModal 
        isOpen={isLiveConferenceOpen}
        onClose={() => setIsLiveConferenceOpen(false)}
        roomName="class-8b-mathematics"
        roomTitle="Class 8-B Mathematics: Live Interactive Studio (Teacher Host)"
        userName="Mrs. Ananya Verma"
        userRole="TEACHER"
        studentContextName="Class 8-B Roster"
      />

"""

if import_target in text and "import { EduVideoConferenceModal }" not in text:
    text = text.replace(import_target, import_repl, 1)

if state_target in text and "isLiveConferenceOpen" not in text:
    text = text.replace(state_target, state_repl, 1)

if btn_target in text:
    text = text.replace(btn_target, btn_repl, 1)

if tab_header_target in text:
    text = text.replace(tab_header_target, tab_header_repl, 1)

if modal_insert_target in text and "<EduVideoConferenceModal" not in text:
    text = text.replace(modal_insert_target, modal_code + modal_insert_target, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)

print("SUCCESS: Updated teacher/page.tsx with LiveKit Video Conference Modal")
