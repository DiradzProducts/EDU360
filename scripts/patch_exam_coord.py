# -*- coding: utf-8 -*-
with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """        setShowCreateScheduleModal(false);

        const updated = await api.getExamSchedules();

        setSchedules(updated);"""

replacement = """        setShowCreateScheduleModal(false);

        const updated = await api.getExamSchedules();

        setSchedules(updated);

        try {
          const channel = new BroadcastChannel('edu360_exam_live_channel');
          channel.postMessage({
            type: 'EXAM_SCHEDULED',
            title: newSchedExamName || `${newSchedSubject} Examination`,
            subject: newSchedSubject,
            className: `${newSchedClass} ${newSchedSection || 'B'}`,
            invigilator: newSchedInvigilator || 'Mrs. Ananya Verma',
            hall: newSchedHall,
            date: newSchedDate,
            time: `${newSchedStartTime} - ${newSchedEndTime}`
          });
          channel.close();
        } catch {}"""

if target in content:
    content = content.replace(target, replacement, 1)
    print("exam_coordinator/page.tsx patched successfully.")
    with open('frontend/src/app/exam_coordinator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
else:
    print("Target not found.")
