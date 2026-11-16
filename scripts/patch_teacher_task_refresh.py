# -*- coding: utf-8 -*-
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """        if (data.type === 'EXAM_SCHEDULED') {
          triggerToast(`🔔 New Invigilation Duty: ${data.subject || 'Mathematics'} (${data.className || 'Class 8-B'}) scheduled by Exam Coordinator. Hall tickets issued.`);
        }"""

replacement = """        if (data.type === 'EXAM_SCHEDULED' || data.type === 'DUTY_ASSIGNED') {
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

if target in content:
    content = content.replace(target, replacement, 1)
    with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("academicTasks instant refresh added to BroadcastChannel listener.")
else:
    print("Target not found.")
