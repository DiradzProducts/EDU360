# -*- coding: utf-8 -*-
with open('frontend/src/app/student/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = "  // Live Class Simulation State"
replacement = """  // Real-time coordinator exam broadcast listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;
        if (data.type === 'EXAM_SCHEDULED') {
          triggerToast(`🔔 Official Admit Card Released: ${data.subject || 'Mathematics'} Examination scheduled for ${data.className || 'Class 8-B'}. Hall Ticket #14 is active.`);
        }
      };
    } catch {}
    return () => {
      if (channel) channel.close();
    };
  }, []);

  // Live Class Simulation State"""

if target in content and "Official Admit Card Released:" not in content:
    content = content.replace(target, replacement, 1)
    with open('frontend/src/app/student/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("student/page.tsx updated with EXAM_SCHEDULED listener.")
else:
    print("student/page.tsx already has listener or target not found.")
