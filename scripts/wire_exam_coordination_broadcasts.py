# -*- coding: utf-8 -*-

# 1. Update Coordinator Page to broadcast EXAM_SCHEDULED
with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    coord_content = f.read()

old_publish = """      triggerToast('✓ Timetable published & Hall Tickets issued for all students! (Admit cards released without fee blockades per Board Mandate)');

    }, 600);"""

new_publish = """      triggerToast('✓ Timetable published & Hall Tickets issued for all students! (Admit cards released without fee blockades per Board Mandate)');

      try {
        const channel = new BroadcastChannel('edu360_exam_live_channel');
        channel.postMessage({
          type: 'EXAM_SCHEDULED',
          title: 'Mathematics Midterm Examination',
          subject: 'Mathematics',
          className: 'Class 8-B',
          invigilator: 'Mrs. Ananya Verma',
          duration: 180,
          hallTicketsIssued: true
        });
        channel.close();
      } catch {}

    }, 600);"""

if old_publish in coord_content:
    coord_content = coord_content.replace(old_publish, new_publish, 1)
    with open('frontend/src/app/exam_coordinator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(coord_content)
    print("Coordinator page updated with EXAM_SCHEDULED broadcast.")
else:
    print("Warning: old_publish not found in coordinator page.")

# 2. Update Teacher Page to listen for EXAM_SCHEDULED
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    teacher_content = f.read()

old_teacher_effect = """  // Listen for global command palette navigation events"""
new_teacher_effect = """  // Listen for coordinator exam schedules & live proctor broadcasts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;
        if (data.type === 'EXAM_SCHEDULED') {
          triggerToast(`🔔 New Invigilation Duty: ${data.subject || 'Mathematics'} (${data.className || 'Class 8-B'}) scheduled by Exam Coordinator. Hall tickets issued.`);
        }
      };
    } catch {}
    return () => {
      if (channel) channel.close();
    };
  }, []);

  // Listen for global command palette navigation events"""

if old_teacher_effect in teacher_content and "New Invigilation Duty:" not in teacher_content:
    teacher_content = teacher_content.replace(old_teacher_effect, new_teacher_effect, 1)
    with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
        f.write(teacher_content)
    print("Teacher page updated with EXAM_SCHEDULED notification listener.")
else:
    print("Teacher page check completed.")

# 3. Update Student Page to listen for EXAM_SCHEDULED
with open('frontend/src/app/student/page.tsx', 'r', encoding='utf-8') as f:
    student_content = f.read()

old_student_marker = """  // Polling for live parent notes / teacher messages every 15s"""
new_student_marker = """  // Real-time coordinator exam broadcast listener
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

  // Polling for live parent notes / teacher messages every 15s"""

if old_student_marker in student_content and "Official Admit Card Released:" not in student_content:
    student_content = student_content.replace(old_student_marker, new_student_marker, 1)
    with open('frontend/src/app/student/page.tsx', 'w', encoding='utf-8') as f:
        f.write(student_content)
    print("Student page updated with EXAM_SCHEDULED notification listener.")
else:
    print("Student page check completed.")
