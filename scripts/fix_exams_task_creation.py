# -*- coding: utf-8 -*-
with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_duty_task = """        duty_task = AdminTask(
            title=f"Invigilation Duty: {exam_title} ({final_hall})",
            description=f"Conduct examination session for {req.class_name} {req.section or 'B'}. Mode: {final_mode}. Time: {req.start_time} - {req.end_time}.",
            category="urgent",
            domain="exam",
            due_date=req.exam_date,
            assigned_to=final_invigilator,
            assigned_to_role="teacher",
            created_by="Mrs. Shweta Sengupta",
            sla_hours=24,
            priority="High",
            status="pending"
        )"""

new_duty_task = """        duty_task = AdminTask(
            title=f"Invigilation Duty: {exam_title} ({final_hall})",
            description=f"Conduct examination session for {req.class_name} {req.section or 'B'}. Mode: {final_mode}. Time: {req.start_time} - {req.end_time}.",
            category="urgent",
            domain="academic",
            due_date=req.exam_date,
            assigned_to=final_invigilator,
            assigned_to_role="teacher",
            created_by_name="Mrs. Shweta Sengupta",
            created_by_role="exam_coordinator",
            sla_hours=24,
            priority="High",
            status="pending"
        )"""

if old_duty_task in content:
    content = content.replace(old_duty_task, new_duty_task, 1)
    with open('backend/app/routers/exams.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed duty_task in backend/app/routers/exams.py successfully.")
else:
    print("Warning: old_duty_task not found in backend/app/routers/exams.py")
