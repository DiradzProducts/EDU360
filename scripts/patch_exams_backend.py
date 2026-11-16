# -*- coding: utf-8 -*-
"""
Patch backend/app/routers/exams.py for universal notifications on schedule creation and hall ticket release.
"""

with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update single schedule creation to notify teacher role universally (recipient_user_id=None)
old_teacher_notif = """        # 2. Notify Assigned Invigilator (Teacher)
        await create_system_notification(
            db=db,
            recipient_user_id=2,
            recipient_role="teacher","""

new_teacher_notif = """        # 2. Notify Assigned Invigilator (Teacher)
        await create_system_notification(
            db=db,
            recipient_user_id=None,
            recipient_role="teacher","""

if old_teacher_notif in content:
    content = content.replace(old_teacher_notif, new_teacher_notif, 1)
    print("Step 1: Updated single schedule teacher notification to universal role.")

# 2. In create_batch_class_schedules: Notify both student and teacher roles universally
old_batch_notif = """            await create_system_notification(
                db=db,
                recipient_user_id=2,
                recipient_role="teacher",
                sender_name="Exam Office (Mrs. Shweta Sengupta)",
                sender_role="exam_coordinator",
                title=f"Invigilation Duty Assigned: {exam_label}",
                message=f"You are deployed as Chief Invigilator for {exam_label} on {slot.exam_date} ({slot.start_time} - {slot.end_time}) in {slot.hall_name}.",
                notification_type="DUTY_ASSIGNED",
                priority="URGENT",
                action_url="/teacher",
                metadata_dict={"subject": slot.subject, "class_name": req.class_name, "hall": slot.hall_name}
            )"""

new_batch_notif = """            # Notify Invigilator (Teacher)
            await create_system_notification(
                db=db,
                recipient_user_id=None,
                recipient_role="teacher",
                sender_name="Exam Office (Mrs. Shweta Sengupta)",
                sender_role="exam_coordinator",
                title=f"Invigilation Duty Assigned: {exam_label}",
                message=f"You are deployed as Chief Invigilator for {exam_label} on {slot.exam_date} ({slot.start_time} - {slot.end_time}) in {slot.hall_name}.",
                notification_type="DUTY_ASSIGNED",
                priority="URGENT",
                action_url="/teacher",
                metadata_dict={"subject": slot.subject, "class_name": req.class_name, "hall": slot.hall_name}
            )

            # Notify Students
            await create_system_notification(
                db=db,
                recipient_user_id=None,
                recipient_role="student",
                sender_name="Exam Office (Mrs. Shweta Sengupta)",
                sender_role="exam_coordinator",
                title=f"New Examination Scheduled: {exam_label}",
                message=f"{exam_label} is scheduled on {slot.exam_date} ({slot.start_time} - {slot.end_time}) in {slot.hall_name}.",
                notification_type="EXAM_SCHEDULED",
                priority="HIGH",
                action_url="/student",
                metadata_dict={"subject": slot.subject, "class_name": req.class_name, "hall": slot.hall_name}
            )"""

if old_batch_notif in content:
    content = content.replace(old_batch_notif, new_batch_notif, 1)
    print("Step 2: Updated batch schedule to notify both student and teacher roles.")

with open('backend/app/routers/exams.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("backend/app/routers/exams.py patched successfully.")
