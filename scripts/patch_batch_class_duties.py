# -*- coding: utf-8 -*-
with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = """    await db.commit()
    return {
        "success": True,
        "message": f"Successfully created {len(created_ids)} exam schedules for {req.class_name}.",
        "schedule_ids": created_ids
    }"""

replacement = """    # Create invigilation tasks and notifications for batch slots
    try:
        from app.routers.notifications import create_system_notification
        from app.models.models import AdminTask

        for slot in req.slots:
            invig_name = slot.chief_invigilator_name or "Mrs. Ananya Verma"
            exam_label = f"{slot.subject} ({req.class_name})"
            
            task = AdminTask(
                title=f"Invigilation Duty: {exam_label} ({slot.hall_name})",
                description=f"Conduct examination session for {req.class_name}. Date: {slot.exam_date} ({slot.start_time} - {slot.end_time}). Hall: {slot.hall_name}.",
                category="urgent",
                domain="academic",
                due_date=slot.exam_date,
                assigned_to=invig_name,
                assigned_to_role="teacher",
                created_by_name="Mrs. Shweta Sengupta",
                created_by_role="exam_coordinator",
                sla_hours=24,
                priority="High",
                status="pending"
            )
            db.add(task)

            await create_system_notification(
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
            )

        await db.commit()
    except Exception as batch_err:
        print(f"Error in batch duty dispatch: {batch_err}")

    return {
        "success": True,
        "message": f"Successfully created {len(created_ids)} exam schedules for {req.class_name}.",
        "schedule_ids": created_ids
    }"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open('backend/app/routers/exams.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated batch class schedule in exams.py")
else:
    print("Target still not found")
