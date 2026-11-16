# -*- coding: utf-8 -*-
"""
Patch frontend/src/app/teacher/page.tsx:
1. Import useAuth and support both teacher profiles (Mrs. Ananya Verma & Mrs. Sunitha Rao) with 1-click toggle.
2. Add activeMalpracticeAlerts state and listener on BroadcastChannel.
3. Render persistent left corner popup alert for malpractice detection with 1-on-1 Voice, Pause Exam, and View Feed buttons.
"""

with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add useAuth import
target_import = "import { useTheme } from '@/lib/theme-context';"
replacement_import = "import { useTheme } from '@/lib/theme-context';\nimport { useAuth } from '@/lib/auth-context';"

if target_import in content:
    content = content.replace(target_import, replacement_import, 1)
    print("Step 1: Added useAuth import.")
else:
    print("Step 1: target_import not found.")

# 2. Add profile state and malpractice alerts state inside TeacherPage()
target_page_start = "export default function TeacherPage() {\n\n  const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard');"

replacement_page_start = """export default function TeacherPage() {

  const { user, loginWithCredentials } = useAuth();

  // Dual Faculty Profile Governance (Mrs. Ananya Verma vs. Mrs. Sunitha Rao)
  const isSunitha = user?.id === 14 || user?.username === 'teacher_eng' || (user?.name && user.name.includes('Sunitha'));
  const currentTeacherName = isSunitha ? 'Mrs. Sunitha Rao' : 'Mrs. Ananya Verma';
  const currentTeacherSubject = isSunitha ? 'English & Social Studies' : 'Mathematics';
  const currentTeacherClass = isSunitha ? 'Class 8-A' : 'Class 8-B';

  const handleToggleTeacherProfile = () => {
    if (isSunitha) {
      loginWithCredentials({
        id: 2,
        name: 'Mrs. Ananya Verma',
        username: 'teacher_mat',
        email: 'ananya.verma@edu360.internal',
        role: 'teacher',
        school_code: 'EDU-GLOBAL-360',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        phone: '+91 98111 00002'
      });
      triggerToast('Switched to Mrs. Ananya Verma (TGT Mathematics • Class 8-B)');
    } else {
      loginWithCredentials({
        id: 14,
        name: 'Mrs. Sunitha Rao',
        username: 'teacher_eng',
        email: 'sunitha.rao@edu360.internal',
        role: 'teacher',
        school_code: 'EDU-GLOBAL-360',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        phone: '+91 98111 00014'
      });
      triggerToast('Switched to Mrs. Sunitha Rao (TGT English • Class 8-A)');
    }
  };

  // Real-time Malpractice Alerts state for persistent Left Corner Popup
  interface MalpracticeNotification {
    id: string;
    candidateId: number;
    studentName: string;
    rollNo: string;
    className: string;
    malpracticeType: string;
    title: string;
    ruleTriggered: string;
    confidence: number;
    strikes: number;
    timestamp: string;
  }
  const [activeMalpracticeAlerts, setActiveMalpracticeAlerts] = useState<MalpracticeNotification[]>([]);

  const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard');"""

if target_page_start in content:
    content = content.replace(target_page_start, replacement_page_start, 1)
    print("Step 2: Added dual profile state and malpractice alerts state.")
else:
    print("Step 2: target_page_start not found.")

# 3. Add MALPRACTICE_ALERT handling inside BroadcastChannel onmessage
target_bc = """        if (data.type === 'EXAM_SCHEDULED' || data.type === 'DUTY_ASSIGNED') {
          triggerToast(`🔔 New Invigilation Duty: ${data.subject || 'Mathematics'} (${data.className || 'Class 8-B'}) scheduled by Exam Coordinator. Hall tickets issued.`);
          api.getAdminTasks('academic').then(res => {
            const myTasks = (res || []).filter((t: any) => 
              !t.assigned_to || 
              t.assigned_to === 'Mrs. Ananya Verma' || 
              t.assigned_to_role === 'teacher' || 
              (t.assigned_to && t.assigned_to.toLowerCase().includes('verma'))
            );
            setAcademicTasks(myTasks);
          }).catch(() => {});
        }"""

replacement_bc = """        if (data.type === 'EXAM_SCHEDULED' || data.type === 'DUTY_ASSIGNED') {
          triggerToast(`🔔 New Invigilation Duty: ${data.subject || 'Mathematics'} (${data.className || 'Class 8-B'}) scheduled by Exam Coordinator. Hall tickets issued.`);
          api.getAdminTasks('academic').then(res => {
            const myTasks = (res || []).filter((t: any) => 
              !t.assigned_to || 
              t.assigned_to === currentTeacherName || 
              t.assigned_to_role === 'teacher' || 
              (t.assigned_to && t.assigned_to.toLowerCase().includes(isSunitha ? 'rao' : 'verma'))
            );
            setAcademicTasks(myTasks);
          }).catch(() => {});
        }

        // Left Corner Malpractice Alert Notification
        if (data.type === 'MALPRACTICE_ALERT' || (data.type === 'STUDENT_TELEMETRY' && data.isMalpractice)) {
          const alertId = `malpractice-${Date.now()}-${data.candidateId || 1}`;
          const newAlert: MalpracticeNotification = {
            id: alertId,
            candidateId: data.candidateId || 1,
            studentName: data.studentName || 'Aarav Sharma',
            rollNo: data.rollNo || '14',
            className: data.className || 'Class 8-B',
            malpracticeType: data.malpracticeType || data.anomalyType || 'UNAUTHORIZED_OBJECT',
            title: data.title || 'Unauthorized Behavior Flagged',
            ruleTriggered: data.ruleTriggered || 'Proctor Violation Detected',
            confidence: data.confidence || 0.92,
            strikes: data.strikes !== undefined ? data.strikes : 1,
            timestamp: data.timestamp || new Date().toLocaleTimeString()
          };

          setActiveMalpracticeAlerts(prev => [newAlert, ...prev.filter(a => a.candidateId !== newAlert.candidateId).slice(0, 2)]);

          // Sound audio attention chime
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const audioCtx = new AudioContextClass();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.25);
              gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.32);
            }
          } catch {}

          // Auto-dismiss after 15s
          setTimeout(() => {
            setActiveMalpracticeAlerts(prev => prev.filter(a => a.id !== alertId));
          }, 15000);
        }"""

if target_bc in content:
    content = content.replace(target_bc, replacement_bc, 1)
    print("Step 3: Added MALPRACTICE_ALERT to BroadcastChannel listener.")
else:
    print("Step 3: target_bc not found.")

# 4. Update sidebar profile card to display active teacher name and switch profile button
target_sidebar_profile = """                <div className="min-w-0">

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">Oakridge International</h3>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Mrs. Ananya Verma • 8-B</span>"""

replacement_sidebar_profile = """                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">Oakridge International</h3>
                    <button
                      type="button"
                      onClick={handleToggleTeacherProfile}
                      className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-[9px] font-bold hover:bg-violet-200 dark:hover:bg-violet-900 transition-colors cursor-pointer shrink-0"
                      title="Switch between Mrs. Ananya Verma (Math 8-B) and Mrs. Sunitha Rao (Eng 8-A)"
                    >
                      ⇄ Switch Profile
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                      {currentTeacherName} &bull; {isSunitha ? '8-A' : '8-B'}
                    </span>"""

if target_sidebar_profile in content:
    content = content.replace(target_sidebar_profile, replacement_sidebar_profile, 1)
    print("Step 4: Updated sidebar profile card with 1-click teacher switcher.")
else:
    print("Step 4: target_sidebar_profile not found.")

# 5. Add Left Corner Malpractice Popup JSX right before return closing tag
target_return_end = "      {/* Mobile Drawer Navigation Backdrop Overlay */}"

replacement_return_end = """      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* LIVE MALPRACTICE POPUP ON LEFT CORNER (PERSISTENT PROCTOR MONITORING) */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeMalpracticeAlerts.length > 0 && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
          {activeMalpracticeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-2xl border-2 border-rose-500 bg-slate-900/95 text-white p-4 shadow-2xl backdrop-blur-md ring-4 ring-rose-500/20 relative overflow-hidden"
            >
              {/* Top Warning Strip */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    <span>MALPRACTICE ALERT &bull; ROOM ALPHA</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMalpracticeAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Candidate Details & Violation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">
                    {alert.studentName} <span className="font-mono text-xs text-violet-300">({alert.className} &bull; Roll #{alert.rollNo})</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                    Strike {alert.strikes}/3 {alert.strikes >= 3 ? '(-5 Marks)' : ''}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs space-y-1">
                  <span className="font-bold text-rose-200 block">{alert.title}</span>
                  <span className="text-[11px] text-slate-300 font-mono block line-clamp-1">{alert.ruleTriggered}</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
                    <span>{alert.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const ch = new BroadcastChannel('edu360_exam_live_channel');
                      ch.postMessage({
                        type: 'TALK_ONE_ON_ONE',
                        candidateId: alert.candidateId,
                        message: `${alert.studentName}, this is Chief Invigilator. Stop unauthorized action immediately.`
                      });
                      ch.close();
                    } catch {}
                    triggerToast(`🎙️ 1-on-1 Voice Warning sent to ${alert.studentName}.`);
                  }}
                  className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <PhoneCall className="h-3 w-3 text-rose-400" />
                  <span>Talk 1-on-1</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      const ch = new BroadcastChannel('edu360_exam_live_channel');
                      ch.postMessage({ type: 'EXAM_PAUSE', candidateId: alert.candidateId });
                      ch.close();
                    } catch {}
                    triggerToast(`⏸️ Screen & Timer Paused for ${alert.studentName}.`);
                  }}
                  className="px-2 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Pause className="h-3 w-3" />
                  <span>Pause Exam</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('exams_gradebook');
                    setExamSubTab('live_cockpit');
                    setActiveMalpracticeAlerts(prev => prev.filter(a => a.id !== alert.id));
                  }}
                  className="px-2 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Video className="h-3 w-3" />
                  <span>View Feed</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Drawer Navigation Backdrop Overlay */}"""

if target_return_end in content:
    content = content.replace(target_return_end, replacement_return_end, 1)
    print("Step 5: Added persistent Left Corner Malpractice Popup JSX.")
else:
    print("Step 5: target_return_end not found.")

with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("teacher/page.tsx updated successfully.")
