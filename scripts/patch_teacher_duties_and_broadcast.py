# -*- coding: utf-8 -*-
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Sidebar button fix
old_sidebar_btn = """                    <button
                      type="button"
                      onClick={() => setExamSubTab('live_cockpit')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-all cursor-pointer ${
                        examSubTab === 'live_cockpit'
                          ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >"""

new_sidebar_btn = """                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('exams_gradebook');
                        setExamSubTab('live_cockpit');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-all cursor-pointer ${
                        examSubTab === 'live_cockpit'
                          ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >"""

if old_sidebar_btn in content:
    content = content.replace(old_sidebar_btn, new_sidebar_btn, 1)
    print("Step 1: Fixed sidebar Live Invigilation click handler.")
else:
    print("Step 1: old_sidebar_btn not found.")

# 2. Add BroadcastChannel listener for coordinator exam scheduling
old_notif_hook = """  // Real-time notification polling interval
  useEffect(() => {
    fetchUnreadNotificationsCount();
    const interval = setInterval(fetchUnreadNotificationsCount, 15000);
    return () => clearInterval(interval);
  }, []);"""

new_notif_hook = """  // Real-time notification polling interval & Coordinator Exam Broadcast Listener
  useEffect(() => {
    fetchUnreadNotificationsCount();
    const interval = setInterval(fetchUnreadNotificationsCount, 15000);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined') {
        channel = new BroadcastChannel('edu360_exam_live_channel');
        channel.onmessage = (e) => {
          const data = e.data;
          if (data?.type === 'EXAM_SCHEDULED' || data?.type === 'DUTY_ASSIGNED') {
            fetchUnreadNotificationsCount();
            api.getAdminTasks('academic').then(res => {
              const myTasks = (res || []).filter((t: any) => 
                !t.assigned_to || 
                t.assigned_to === 'Mrs. Ananya Verma' || 
                t.assigned_to_role === 'teacher' || 
                (t.assigned_to && t.assigned_to.toLowerCase().includes('verma'))
              );
              setAcademicTasks(myTasks);
            }).catch(() => {});
            setSystemToastMessage(`🔔 New Invigilation Duty Assigned: ${data.title || 'Examination'} (${data.className || 'Class 8-B'}) by Exam Coordinator.`);
            setTimeout(() => setSystemToastMessage(null), 6000);
          }
        };
      }
    } catch {}

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
    };
  }, []);"""

if old_notif_hook in content:
    content = content.replace(old_notif_hook, new_notif_hook, 1)
    print("Step 2: Added BroadcastChannel exam listener.")
else:
    print("Step 2: old_notif_hook not found.")

# 3. Add Launch Live Proctor Classroom button to adminTasks in Duties center
old_task_buttons = """                            <button

                              type="button"

                              onClick={() => {

                                setSubmitWorkTask(task);

                                setTaskSubmissionNotes('');

                                setTaskProofUrl('');

                              }}

                              className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"

                            >

                              <CheckCircle2 className="h-3.5 w-3.5" />

                              <span>Submit Work &amp; Proof</span>

                            </button>"""

new_task_buttons = """                            {(task.title?.toLowerCase().includes('invigil') || task.title?.toLowerCase().includes('exam')) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('exams_gradebook');
                                  setExamSubTab('live_cockpit');
                                }}
                                className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95 mb-1.5"
                              >
                                <Video className="h-3.5 w-3.5 text-white" />
                                <span>Launch Live Proctor Classroom &nearr;</span>
                              </button>
                            )}

                            <button

                              type="button"

                              onClick={() => {

                                setSubmitWorkTask(task);

                                setTaskSubmissionNotes('');

                                setTaskProofUrl('');

                              }}

                              className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"

                            >

                              <CheckCircle2 className="h-3.5 w-3.5" />

                              <span>Submit Work &amp; Proof</span>

                            </button>"""

if old_task_buttons in content:
    content = content.replace(old_task_buttons, new_task_buttons, 1)
    print("Step 3: Added Launch Live Proctor Classroom button to Admin Mandates.")
else:
    print("Step 3: old_task_buttons not found.")

# 4. Add EXAM_INVIGILATION detail workspace banner in activeTab === 'duties'
old_detail_sub = """                              {activeDuty.category === 'CAMPUS_SUBSTITUTION' && ("""

new_detail_sub = """                              {activeDuty.category === 'EXAM_INVIGILATION' && (
                                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-3 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                      <Video className="h-4 w-4 text-amber-600" />
                                      Official Examination Invigilation Command
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                                      Active Session
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Scheduled by Exam Coordinator. Candidates connect via LiveKit SFU with Edge YOLO AI proctoring. Admitting students requires Hall Ticket verification at the proctor desk.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveTab('exams_gradebook');
                                      setExamSubTab('live_cockpit');
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95"
                                  >
                                    <Video className="h-4 w-4 text-white" />
                                    <span>Launch Live Proctor Classroom &nearr;</span>
                                  </button>
                                </div>
                              )}

                              {activeDuty.category === 'CAMPUS_SUBSTITUTION' && ("""

if old_detail_sub in content:
    content = content.replace(old_detail_sub, new_detail_sub, 1)
    print("Step 4: Added EXAM_INVIGILATION detail block.")
else:
    print("Step 4: old_detail_sub not found.")

with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("teacher/page.tsx updated successfully.")
