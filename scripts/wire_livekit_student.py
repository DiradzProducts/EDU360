import os

path = os.path.join("frontend", "src", "app", "student", "page.tsx")
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

import_target = "import { downloadStudyNotesFile, downloadMarksMemoFile } from '@/lib/export-utils';"
import_repl = "import { downloadStudyNotesFile, downloadMarksMemoFile } from '@/lib/export-utils';\nimport { EduVideoConferenceModal } from '@/components/livekit/edu-video-conference-modal';"

modal_start = "{/* MODAL 1: LIVE CLASSROOM STREAM OVERLAY */}"
modal_end = "{/* MODAL 2: TEACHER ANNOTATED HOMEWORK SHEET & REMARKS VIEWER */}"

new_modal = """{/* MODAL 1: REAL LIVEKIT VIDEO CONFERENCE ROOM */}
      <EduVideoConferenceModal 
        isOpen={isLiveClassModalOpen}
        onClose={() => setIsLiveClassModalOpen(false)}
        roomName="class-8b-mathematics"
        roomTitle="Class 8-B Mathematics: Quadratic Equations & Roots"
        userName="Aarav Sharma"
        userRole="STUDENT"
        studentContextName="Aarav Sharma"
        onAttendanceVerified={() => {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setAttendanceTimestamp(nowStr);
          setHasJoinedLive(true);
          triggerToast('🟢 LiveKit WebRTC Connected: Auto-Attendance Verified as Present');
          api.simulateJoinClass(1, { student_id: 1, join_time_minutes: 4, device_type: 'laptop' }).catch(() => {});
        }}
      />

      """

if import_target in text and "import { EduVideoConferenceModal }" not in text:
    text = text.replace(import_target, import_repl, 1)

idx_start = text.find(modal_start)
idx_end = text.find(modal_end)

if idx_start != -1 and idx_end != -1:
    text = text[:idx_start] + new_modal + text[idx_end:]
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print("SUCCESS: Updated student/page.tsx with EduVideoConferenceModal")
else:
    print(f"Failed to locate modal bounds: {idx_start}, {idx_end}")
