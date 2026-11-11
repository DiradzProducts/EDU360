import re

with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add playDoubtNotification import if missing
if 'playDoubtNotification' not in text:
    text = text.replace(
        "import { api } from '@/lib/api';",
        "import { api } from '@/lib/api';\nimport { playDoubtNotification } from '@/lib/sound-effects';"
    )
    print("Added playDoubtNotification import")

# 2. Add rulesVideoRef and new states
target_states = """  const [isExamDisqualified, setIsExamDisqualified] = useState<boolean>(false);

  const [hudAlertMessage, setHudAlertMessage] = useState<string | null>(null);

  const [audioDecibels, setAudioDecibels] = useState<number>(38);"""

repl_states = """  const [isExamDisqualified, setIsExamDisqualified] = useState<boolean>(false);
  const [hudAlertMessage, setHudAlertMessage] = useState<string | null>(null);
  const [audioDecibels, setAudioDecibels] = useState<number>(38);
  const rulesVideoRef = useRef<HTMLVideoElement | null>(null);
  const [yoloPersonCount, setYoloPersonCount] = useState<number>(1);
  const [yoloGazeStatus, setYoloGazeStatus] = useState<string>('Centered on Desk');
  const [isPenalized, setIsPenalized] = useState<boolean>(false);"""

if target_states in text:
    text = text.replace(target_states, repl_states, 1)
    print("Added rulesVideoRef and proctor state hooks")
else:
    print("Warning: target_states not matched")

# 3. Add durationMinutes sync & fullscreen listener
target_rules_init = """    if (!isOpen) return;
    setRulesStage('rules');
    setHasAgreedRules(false);
    setIsConfirmedSubmitted(false);
    setIsExamDisqualified(false);"""

repl_rules_init = """    if (!isOpen) return;
    setRulesStage('rules');
    setHasAgreedRules(false);
    setIsConfirmedSubmitted(false);
    setIsExamDisqualified(false);
    setTimeRemainingSeconds((durationMinutes || 180) * 60);"""

if target_rules_init in text:
    text = text.replace(target_rules_init, repl_rules_init, 1)
    print("Added duration synchronization")

# 4. Add camera stream re-attachment for both rules and active stages
target_after_webcam = """    initWebcamAndAudio();"""

repl_after_webcam = """    initWebcamAndAudio();"""

# Add stream attachment effect & BroadcastChannel effect
target_channel_spot = """  // Invigilator Remote Sync Poller (Synchronizes Pause, Disqualify, Strikes & HUD Nudges)"""

repl_channel_spot = """  // Re-attach live media stream whenever stage transitions
  useEffect(() => {
    if (streamRef.current) {
      if (rulesStage === 'rules' && rulesVideoRef.current) {
        rulesVideoRef.current.srcObject = streamRef.current;
        rulesVideoRef.current.play().catch(() => {});
      } else if (rulesStage === 'active' && videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [rulesStage, cameraActive]);

  // Fullscreen event listener (ensures Esc key or user exit updates state cleanly)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Real-Time Cross-Window Synchronization (Student & Invigilator Teacher Cockpit)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;

        if (data.type === 'EXAM_PAUSE' && (!data.candidateId || data.candidateId === candidateId)) {
          setIsExamPaused(true);
          try { playDoubtNotification(); } catch {}
          setHudAlertMessage('Examination temporarily paused by Chief Invigilator.');
        } else if (data.type === 'EXAM_RESUME' && (!data.candidateId || data.candidateId === candidateId)) {
          setIsExamPaused(false);
          setHudAlertMessage('Examination resumed. Continue your writing.');
          setTimeout(() => setHudAlertMessage(null), 4000);
        } else if (data.type === 'INTERCOM_BROADCAST') {
          try { playDoubtNotification(); } catch {}
          setHudAlertMessage(`🎙️ Chief Invigilator: "${data.message}"`);
          setTimeout(() => setHudAlertMessage(null), 8000);
        } else if (data.type === 'ISSUE_WARNING' && (!data.candidateId || data.candidateId === candidateId)) {
          try { playDoubtNotification(); } catch {}
          setProctorStrikes(prev => {
            const next = Math.min(3, prev + 1);
            if (next >= 3) setIsPenalized(true);
            return next;
          });
          setHudAlertMessage(`🚨 Official Warning from Invigilator: "${data.message || 'Please maintain desk posture.'}"`);
          setTimeout(() => setHudAlertMessage(null), 8000);
        } else if (data.type === 'EXAM_DISQUALIFY' && (!data.candidateId || data.candidateId === candidateId)) {
          setIsExamDisqualified(true);
        }
      };
    } catch {}

    return () => {
      if (channel) channel.close();
    };
  }, [candidateId]);

  // Invigilator Remote Sync Poller (Synchronizes Pause, Disqualify, Strikes & HUD Nudges)"""

if target_channel_spot in text:
    text = text.replace(target_channel_spot, repl_channel_spot, 1)
    print("Added BroadcastChannel, stream re-attachment, and fullscreen listeners")

# 5. Fix full screen wrapper classes
target_fs_wrapper = """    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">

      <div className="relative w-full max-w-6xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">"""

repl_fs_wrapper = """    <div className={`fixed inset-0 z-50 flex flex-col bg-slate-950 transition-all ${
      isFullscreen
        ? 'w-screen h-screen p-0 m-0 max-w-none max-h-none rounded-none'
        : 'items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200'
    }`}>
      <div className={`relative w-full flex flex-col overflow-hidden bg-white dark:bg-slate-900 transition-all ${
        isFullscreen
          ? 'w-screen h-screen rounded-none border-0 max-w-none max-h-none flex-1'
          : 'max-w-6xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[96vh]'
      }`}>"""

if target_fs_wrapper in text:
    text = text.replace(target_fs_wrapper, repl_fs_wrapper, 1)
    print("Updated fullscreen wrapper classes")
else:
    print("Warning: target_fs_wrapper not found directly")

# 6. Update toggleFullscreen function to be rock solid
target_toggle_fs = """  const toggleFullscreen = () => {

    if (!document.fullscreenElement) {

      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});

    } else {

      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});

    }

  };"""

repl_toggle_fs = """  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => setIsFullscreen(true));
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => setIsFullscreen(false));
      } else {
        setIsFullscreen(false);
      }
    }
  };"""

if target_toggle_fs in text:
    text = text.replace(target_toggle_fs, repl_toggle_fs, 1)
    print("Updated toggleFullscreen function")

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved phase 1 updates to online-exam-modal.tsx")
