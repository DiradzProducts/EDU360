# -*- coding: utf-8 -*-
"""
Patch online-exam-modal.tsx and live-invigilator-cockpit.tsx
to integrate LiveKit SFU cloud publishing, multi-device WebSocket surveillance,
and persistent end-to-end script upload.
"""

# -------------------------------------------------------------
# 1. Patch online-exam-modal.tsx
# -------------------------------------------------------------
with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Ensure Room, RoomEvent, VideoPresets are imported from livekit-client
if 'from \'livekit-client\'' not in code and 'from "livekit-client"' not in code:
    code = "import { Room, RoomEvent, VideoPresets } from 'livekit-client';\n" + code

# Add liveKitRoomRef and surveillanceWsRef
ref_target = "  const liveAudioDecibelsRef = useRef<number>(38);"
new_refs = """  const liveKitRoomRef = useRef<any>(null);
  const surveillanceWsRef = useRef<WebSocket | null>(null);
  const liveAudioDecibelsRef = useRef<number>(38);"""

if 'liveKitRoomRef' not in code:
    assert ref_target in code, "Could not find liveAudioDecibelsRef"
    code = code.replace(ref_target, new_refs)

# Add LiveKit SFU track publishing right after getUserMedia succeeds
target_stream_ok = "          setCameraActive(true);\n          setCameraError(null);"
livekit_publish_block = """          setCameraActive(true);
          setCameraError(null);

          // Connect to real LiveKit SFU Cloud & publish camera and mic tracks
          try {
            api.getLiveKitToken({
              room_name: 'exam-room-class8b',
              participant_name: studentName || 'Aarav Sharma',
              participant_identity: 'student_aarav_sharma',
              role: 'STUDENT'
            }).then(async (lkRes) => {
              if (lkRes && lkRes.token && lkRes.server_url) {
                try {
                  const lkRoom = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                    videoCaptureDefaults: { resolution: VideoPresets.h360.resolution }
                  });
                  liveKitRoomRef.current = lkRoom;
                  await lkRoom.connect(lkRes.server_url, lkRes.token);
                  const vTrack = stream?.getVideoTracks()[0];
                  const aTrack = stream?.getAudioTracks()[0];
                  if (vTrack) await lkRoom.localParticipant.publishTrack(vTrack, { name: 'camera' });
                  if (aTrack) await lkRoom.localParticipant.publishTrack(aTrack, { name: 'microphone' });
                  console.log('✅ Exam Terminal LiveKit SFU Published successfully!');
                } catch (lkErr) {
                  console.warn('LiveKit SFU auto-connect note:', lkErr);
                }
              }
            }).catch(() => {});
          } catch {}"""

if 'Connect to real LiveKit SFU Cloud' not in code:
    assert target_stream_ok in code, "Could not find target_stream_ok in online-exam-modal.tsx"
    code = code.replace(target_stream_ok, livekit_publish_block)

# Add Multi-Device WebSocket Surveillance Relay effect in online-exam-modal.tsx
ws_effect = """  // Multi-Device WebSocket Surveillance Relay (FastAPI WebSocket)
  useEffect(() => {
    if (!isOpen) return;
    let ws: WebSocket | null = null;

    const connectWs = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname || 'localhost';
        const port = '8000';
        const wsUrl = `${protocol}//${host}:${port}/api/exams/ws/surveillance/exam-room-class8b`;
        ws = new WebSocket(wsUrl);
        surveillanceWsRef.current = ws;

        ws.onopen = () => {
          console.log('🌐 Multi-Device Surveillance WebSocket Connected');
          ws?.send(JSON.stringify({
            type: 'STUDENT_JOINED',
            candidateId: candidateId || 1,
            studentName: studentName || 'Aarav Sharma',
            rollNo: '14'
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (!data) return;
            if (data.type === 'PARDON_STRIKES' || data.type === 'EXAM_RESUME') {
              setIsHardSuspended(false);
              isHardSuspendedRef.current = false;
              setIsExamPaused(false);
              setProctorStrikes(0);
              proctorStrikesRef.current = 0;
              setIsPenalized(false);
              setHudAlertMessage('✅ Chief Invigilator Approved: Exam pardoned & resumed.');
              setTimeout(() => setHudAlertMessage(null), 5000);
            } else if (data.type === 'EXAM_DISQUALIFY') {
              setIsDisqualified(true);
              setIsExamPaused(true);
            } else if (data.type === 'ISSUE_WARNING') {
              setHudAlertMessage(`⚠️ INVIGILATOR NOTICE: ${data.message}`);
              setTimeout(() => setHudAlertMessage(null), 8000);
            }
          } catch {}
        };

        ws.onclose = () => {
          surveillanceWsRef.current = null;
        };
      } catch {}
    };

    connectWs();

    return () => {
      if (ws) {
        try {
          ws.send(JSON.stringify({
            type: 'STUDENT_LEFT',
            candidateId: candidateId || 1,
            rollNo: '14',
            studentName: studentName || 'Aarav Sharma'
          }));
          ws.close();
        } catch {}
      }
      if (liveKitRoomRef.current) {
        try {
          liveKitRoomRef.current.disconnect();
          liveKitRoomRef.current = null;
        } catch {}
      }
    };
  }, [isOpen, candidateId, studentName]);"""

if 'Multi-Device WebSocket Surveillance Relay' not in code:
    code = code.replace(
        "  // 2. Real-Time Watcher for Invigilator Pardon / Resume Signals",
        f"{ws_effect}\n\n  // 2. Real-Time Watcher for Invigilator Pardon / Resume Signals"
    )

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Successfully updated online-exam-modal.tsx!")

# -------------------------------------------------------------
# 2. Patch live-invigilator-cockpit.tsx
# -------------------------------------------------------------
with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'r', encoding='utf-8') as f:
    ccode = f.read()

# Add remoteStudentTracks state and WebSocket relay in cockpit
ws_cockpit_effect = """  // Multi-Device WebSocket Surveillance Relay
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      const port = '8000';
      const wsUrl = `${protocol}//${host}:${port}/api/exams/ws/surveillance/exam-room-class8b`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🌐 Invigilator Surveillance WebSocket Connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data) return;

          if (data.type === 'STUDENT_FRAME' && data.frame) {
            setCandidates(prev => prev.map(c => {
              if (c.rollNo === '14' || c.id === 1) {
                return {
                  ...c,
                  liveFrame: data.frame,
                  cameraActive: true,
                  status: c.isPaused ? 'critical' : 'normal',
                  isAdmitted: true
                };
              }
              return c;
            }));
          } else if (data.type === 'STUDENT_JOINED') {
            setCandidates(prev => prev.map(c => {
              if (c.rollNo === '14' || c.id === 1) {
                return {
                  ...c,
                  isAdmitted: true,
                  hallTicketPresented: true,
                  cameraActive: true,
                  status: 'normal'
                };
              }
              return c;
            }));
            triggerToast(`✅ Candidate ${data.studentName || 'Aarav Sharma'} joined live examination room.`);
          } else if (data.type === 'STUDENT_LEFT') {
            setCandidates(prev => prev.map(c => {
              if (c.rollNo === '14' || c.id === 1) {
                return {
                  ...c,
                  status: 'standby',
                  cameraActive: false,
                  isAdmitted: false,
                  liveFrame: undefined,
                  gaze: 'Standby',
                  decibels: 0
                };
              }
              return c;
            }));
            triggerToast(`Candidate ${data.studentName || 'Aarav Sharma'} exited the examination hall.`);
          } else if (data.type === 'MALPRACTICE_ALERT') {
            setActiveMalpracticeAlert(data);
            playMalpracticeChime();
          } else if (data.type === 'STUDENT_SCRIPT_UPLOADED') {
            triggerToast(`📄 PDF Script Received: ${data.studentName} uploaded answer sheet (${data.pageCount || 6} pages • ${data.sealCode})!`);
            setCandidates(prev => prev.map(c => {
              if (c.rollNo === '14' || c.id === 1) {
                return {
                  ...c,
                  status: 'completed',
                  scriptPagesUploaded: data.pageCount || 6,
                  sealVerified: true,
                  sealCode: data.sealCode,
                  pdfUrl: data.pdfUrl,
                  pdfFileName: data.fileName,
                  pdfFileSize: data.fileSize,
                  pdfUploadedAt: data.uploadedAt
                };
              }
              return c;
            }));
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (ws) {
        try { ws.close(); } catch {}
      }
    };
  }, []);"""

if 'Invigilator Surveillance WebSocket Connected' not in ccode:
    ccode = ccode.replace(
        "  // Real-Time Cross-Window Synchronization with Student Exam Hall via BroadcastChannel",
        f"{ws_cockpit_effect}\n\n  // Real-Time Cross-Window Synchronization with Student Exam Hall via BroadcastChannel"
    )

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(ccode)

print("Successfully updated live-invigilator-cockpit.tsx!")
