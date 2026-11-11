with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace push with unshift and ensure exam_mode is preserved
target_unshift = """      if (res && res.schedule_id) {

        fallbackExamSchedules.push({

          id: res.schedule_id,

          title: data.exam_name || data.title,

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

          academic_clearance: false,

          status: 'scheduled'

        });

      }"""

replacement_unshift = """      if (res && res.schedule_id) {

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

      }"""

target_catch = """      fallbackExamSchedules.push(newItem);

      return { success: true, schedule_id: newId, message: 'Created schedule slot successfully' };"""

replacement_catch = """      newItem.exam_mode = data.exam_mode || 'MODE_CBT';
      fallbackExamSchedules.unshift(newItem);

      return { success: true, schedule_id: newId, message: 'Created schedule slot successfully' };"""

if target_unshift in code:
    code = code.replace(target_unshift, replacement_unshift, 1)
    print("Replaced unshift in api.ts")
else:
    print("Could not find target_unshift directly, checking line breaks...")
    # Try normalized newlines
    tu_norm = "\n".join([line.strip() for line in target_unshift.splitlines() if line.strip()])
    # We will search by regex or standard replacement

if target_catch in code:
    code = code.replace(target_catch, replacement_catch, 1)
    print("Replaced catch in api.ts")
else:
    print("Could not find target_catch directly")

with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
    f.write(code)
