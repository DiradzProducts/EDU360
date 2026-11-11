with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update initial fallback item 1 in fallbackExamSchedules
target_fallback_1 = """let fallbackExamSchedules: ExamScheduleItem[] = [

  {

    id: 1,

    exam_id: 1,

    title: "Term 1 Mathematics Descriptive Final",

    class_name: "Class 8",

    section: "B",

    subject: "Mathematics",

    exam_date: "14 Oct 2026",

    start_time: "10:00 AM",

    end_time: "12:00 PM",

    total_marks: 100,

    room_no: "Room 204",

    invigilator_name: "Dr. Suresh Babu",

    academic_clearance: true,

    academic_clearance_notes: "Syllabus verified 100% complete",

    hall_ticket_published: true

  },"""

repl_fallback_1 = """let fallbackExamSchedules: ExamScheduleItem[] = [

  {

    id: 1,

    exam_id: 1,

    title: "Class 8 Mathematics - Term 1 Hybrid Assessment",

    class_name: "Class 8",

    section: "B",

    subject: "Mathematics",

    exam_date: "Today (Live Session Active)",

    start_time: "09:00 AM",

    end_time: "12:00 PM",

    duration_minutes: 180,

    total_marks: 100,

    hall_name: "Virtual Room A (Camera AI Proctor)",

    room_hall: "Virtual Room A (Camera AI Proctor)",

    chief_invigilator_name: "Mrs. Ananya Verma",

    invigilator_name: "Mrs. Ananya Verma",

    academic_clearance: true,

    academic_clearance_notes: "Syllabus verified 100% complete",

    hall_ticket_published: true,

    exam_mode: "MODE_HYBRID_SCAN",

    status: "published"

  },"""

if target_fallback_1 in text:
    text = text.replace(target_fallback_1, repl_fallback_1, 1)
    print("Updated fallbackExamSchedules item 1 directly!")
else:
    # Try normalized newlines regex
    import re
    text = re.sub(
        r'let fallbackExamSchedules: ExamScheduleItem\[\] = \[\s*\{\s*id: 1,.*?hall_ticket_published: true\s*\},',
        repl_fallback_1,
        text,
        flags=re.DOTALL
    )
    print("Updated fallbackExamSchedules item 1 via regex!")

# 2. Update getExamSchedules and createExamSchedule to synchronize with localStorage across windows
target_get_sched = """  getExamSchedules: async (): Promise<ExamScheduleItem[]> => {

    try {

      const res = await fetchWithFallback<{ success: boolean; schedules: ExamScheduleItem[] }>(`/api/exams/schedules`);

      return res.schedules || fallbackExamSchedules;

    } catch {

      return fallbackExamSchedules;

    }

  },"""

repl_get_sched = """  getExamSchedules: async (): Promise<ExamScheduleItem[]> => {
    try {
      const res = await fetchWithFallback<{ success: boolean; schedules: ExamScheduleItem[] }>(`/api/exams/schedules`);
      if (res && res.schedules && res.schedules.length > 0) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('edu360_exam_schedules', JSON.stringify(res.schedules));
          } catch {}
        }
        return res.schedules;
      }
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('edu360_exam_schedules');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
      return fallbackExamSchedules;
    } catch {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('edu360_exam_schedules');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch {}
        }
      }
      return fallbackExamSchedules;
    }
  },"""

if target_get_sched in text:
    text = text.replace(target_get_sched, repl_get_sched, 1)
    print("Updated getExamSchedules with localStorage sync!")
else:
    print("Warning: target_get_sched not found directly")

# 3. Update createExamSchedule to write to localStorage and dispatch custom cross-window event
target_create_sched = """      if (res && res.schedule_id) {

        fallbackExamSchedules.unshift({

          id: res.schedule_id,

          title: data.exam_name || data.title,

          subject: data.subject,

          class_name: data.class_name,

          section: data.section || 'B',

          exam_mode: data.exam_mode || 'MODE_CBT',

          exam_date: data.exam_date,

          start_time: data.start_time,

          end_time: data.end_time,

          hall_name: data.room_hall || data.hall_name || 'Virtual Room A',

          chief_invigilator_name: data.invigilator_name || data.chief_invigilator_name,

          question_paper_id: data.question_paper_id,

          question_paper_title: data.question_paper_title,

          academic_clearance: false,

          status: 'scheduled'

        });

      }

      return res;

    } catch {

      const newId = fallbackExamSchedules.length + 1;

      const newItem: ExamScheduleItem = {

        id: newId,

        title: data.exam_name || data.title || 'Term 1 Examination',

        subject: data.subject,

        class_name: data.class_name,

        section: data.section || 'A',

        exam_date: data.exam_date,

        start_time: data.start_time,

        end_time: data.end_time,

        hall_name: data.room_hall || data.hall_name || 'Virtual Room A',

        chief_invigilator_name: data.invigilator_name || data.chief_invigilator_name,

        question_paper_id: data.question_paper_id,

        question_paper_title: data.question_paper_title,

        academic_clearance: true,

        status: 'scheduled'

      };

      newItem.exam_mode = data.exam_mode || 'MODE_CBT';
      fallbackExamSchedules.unshift(newItem);

      return { success: true, schedule_id: newId, message: 'Created schedule slot successfully' };

    }"""

repl_create_sched = """      const newSlot: ExamScheduleItem = {
        id: (res && res.schedule_id) ? res.schedule_id : (fallbackExamSchedules.length + 1),
        title: data.exam_name || data.title || `${data.class_name} ${data.subject} Assessment`,
        subject: data.subject,
        class_name: data.class_name,
        section: data.section || 'B',
        exam_mode: data.exam_mode || 'MODE_HYBRID_SCAN',
        exam_date: data.exam_date || 'Today (Live Exam Active)',
        start_time: data.start_time || '09:00 AM',
        end_time: data.end_time || '12:00 PM',
        duration_minutes: data.duration_minutes || 180,
        hall_name: data.room_hall || data.hall_name || 'Virtual Room A (Camera AI Proctor)',
        room_hall: data.room_hall || data.hall_name || 'Virtual Room A (Camera AI Proctor)',
        chief_invigilator_name: data.invigilator_name || data.chief_invigilator_name || 'Mrs. Ananya Verma',
        invigilator_name: data.invigilator_name || data.chief_invigilator_name || 'Mrs. Ananya Verma',
        question_paper_id: data.question_paper_id,
        question_paper_title: data.question_paper_title,
        academic_clearance: true,
        status: 'published'
      };

      fallbackExamSchedules.unshift(newSlot);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('edu360_exam_schedules', JSON.stringify(fallbackExamSchedules));
          window.dispatchEvent(new Event('edu360_exam_schedules_updated'));
        } catch {}
      }

      return res || { success: true, schedule_id: newSlot.id, message: 'Created schedule slot successfully' };

    } catch {
      const newId = fallbackExamSchedules.length + 1;
      const newItem: ExamScheduleItem = {
        id: newId,
        title: data.exam_name || data.title || `${data.class_name} ${data.subject} Assessment`,
        subject: data.subject,
        class_name: data.class_name,
        section: data.section || 'B',
        exam_mode: data.exam_mode || 'MODE_HYBRID_SCAN',
        exam_date: data.exam_date || 'Today (Live Exam Active)',
        start_time: data.start_time || '09:00 AM',
        end_time: data.end_time || '12:00 PM',
        duration_minutes: data.duration_minutes || 180,
        hall_name: data.room_hall || data.hall_name || 'Virtual Room A (Camera AI Proctor)',
        room_hall: data.room_hall || data.hall_name || 'Virtual Room A (Camera AI Proctor)',
        chief_invigilator_name: data.invigilator_name || data.chief_invigilator_name || 'Mrs. Ananya Verma',
        invigilator_name: data.invigilator_name || data.chief_invigilator_name || 'Mrs. Ananya Verma',
        question_paper_id: data.question_paper_id,
        question_paper_title: data.question_paper_title,
        academic_clearance: true,
        status: 'published'
      };

      fallbackExamSchedules.unshift(newItem);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('edu360_exam_schedules', JSON.stringify(fallbackExamSchedules));
          window.dispatchEvent(new Event('edu360_exam_schedules_updated'));
        } catch {}
      }

      return { success: true, schedule_id: newId, message: 'Created schedule slot successfully' };
    }"""

if target_create_sched in text:
    text = text.replace(target_create_sched, repl_create_sched, 1)
    print("Updated createExamSchedule with cross-window localStorage sync!")
else:
    print("Warning: target_create_sched not found directly")

with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("Saved api.ts!")
