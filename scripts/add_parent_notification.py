with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    code = f.read()

target = """        # 3. Create AdminTask for Invigilator Duty Queue
        duty_task = AdminTask(
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
        )
        db.add(duty_task)
        await db.commit()"""

replacement = """        # 3. Create AdminTask for Invigilator Duty Queue
        duty_task = AdminTask(
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
        )
        db.add(duty_task)

        # 4. Notify Parents of the Cohort
        await create_system_notification(
            db=db,
            recipient_user_id=None,
            recipient_role="parent",
            sender_name="Exam Office (Mrs. Shweta Sengupta)",
            sender_role="exam_coordinator",
            title=f"Official Date Sheet: {exam_title}",
            message=f"Dear Parent, {exam_title} for {req.class_name} ({req.subject}) is scheduled on {req.exam_date} ({req.start_time} - {req.end_time}). Mode: {final_mode}. Ensure your ward has physical stationery & an active camera setup.",
            notification_type="EXAM_SCHEDULED_PARENT",
            priority="HIGH",
            action_url="/parent",
            metadata_dict={"schedule_id": sched.id, "subject": req.subject, "exam_mode": final_mode}
        )
        await db.commit()"""

if target in code:
    code = code.replace(target, replacement, 1)
    with open('backend/app/routers/exams.py', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Added parent notification to exams.py!")
else:
    print("Warning: target not found in exams.py")
