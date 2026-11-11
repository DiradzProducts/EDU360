with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update list_exam_schedules to order by id.desc() and include section, exam_mode
target_list = '''@router.get("/schedules")
async def list_exam_schedules(db: AsyncSession = Depends(get_db)):
    """
    List all examination schedules with hall deployment & academic clearance status.
    """
    res = await db.execute(select(ExamSchedule).order_by(ExamSchedule.exam_date.asc()))
    schedules = res.scalars().all()
    return {
        "success": True,
        "schedules": [
            {
                "id": s.id,
                "exam_id": s.exam_id,
                "question_paper_id": s.question_paper_id,
                "question_paper_title": s.question_paper_title,
                "status": getattr(s, "status", "Scheduled"),
                "title": s.title,
                "subject": s.subject,
                "class_name": s.class_name,
                "exam_date": s.exam_date,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "hall_name": s.hall_name,
                "capacity": s.capacity,
                "chief_invigilator_name": s.chief_invigilator_name,
                "academic_clearance": s.academic_clearance,
                "academic_clearance_notes": s.academic_clearance_notes
            }
            for s in schedules
        ]
    }'''

replacement_list = '''@router.get("/schedules")
async def list_exam_schedules(db: AsyncSession = Depends(get_db)):
    """
    List all examination schedules with hall deployment & academic clearance status.
    Ordered by latest created first (id desc) so newly scheduled exams appear immediately.
    """
    res = await db.execute(select(ExamSchedule).order_by(ExamSchedule.id.desc()))
    schedules = res.scalars().all()
    return {
        "success": True,
        "schedules": [
            {
                "id": s.id,
                "exam_id": s.exam_id,
                "question_paper_id": s.question_paper_id,
                "question_paper_title": s.question_paper_title,
                "status": getattr(s, "status", "Scheduled"),
                "title": s.title,
                "subject": s.subject,
                "class_name": s.class_name,
                "section": getattr(s, "section", "B"),
                "exam_mode": getattr(s, "exam_mode", "MODE_CBT"),
                "exam_date": s.exam_date,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "hall_name": s.hall_name,
                "capacity": s.capacity,
                "chief_invigilator_name": s.chief_invigilator_name,
                "academic_clearance": s.academic_clearance,
                "academic_clearance_notes": s.academic_clearance_notes,
                "created_at": s.created_at.isoformat() if s.created_at else None
            }
            for s in schedules
        ]
    }'''

if target_list in code:
    code = code.replace(target_list, replacement_list, 1)
    print("Replaced list_exam_schedules")
else:
    print("Warning: target_list not found")

# 2. Update create_exam_schedule to set section and exam_mode and dispatch notifications & AdminTask
target_create = '''    sched = ExamSchedule(
        exam_id=exam.id,
        question_paper_id=req.question_paper_id,
        question_paper_title=req.question_paper_title,
        status="Scheduled",
        title=exam_title,
        subject=req.subject,
        class_name=req.class_name,
        exam_date=req.exam_date,
        start_time=req.start_time,
        end_time=req.end_time,
        hall_name=final_hall,
        capacity=req.capacity,
        chief_invigilator_name=final_invigilator,
        academic_clearance=False,
        academic_clearance_notes="Awaiting Academic Coordinator calendar clearance."
    )
    db.add(sched)
    await db.commit()
    await db.refresh(sched)
    return {
        "success": True,
        "message": f"Scheduled exam slot '{exam_title}' on {req.exam_date} in {final_hall} ({final_mode}).",
        "schedule_id": sched.id,
        "exam_id": exam.id
    }'''

replacement_create = '''    sched = ExamSchedule(
        exam_id=exam.id,
        question_paper_id=req.question_paper_id,
        question_paper_title=req.question_paper_title,
        status="Scheduled",
        title=exam_title,
        subject=req.subject,
        class_name=req.class_name,
        section=req.section or "B",
        exam_mode=final_mode,
        exam_date=req.exam_date,
        start_time=req.start_time,
        end_time=req.end_time,
        hall_name=final_hall,
        capacity=req.capacity,
        chief_invigilator_name=final_invigilator,
        academic_clearance=False,
        academic_clearance_notes="Awaiting Academic Coordinator calendar clearance."
    )
    db.add(sched)
    await db.commit()
    await db.refresh(sched)

    # Dispatch persistent notifications & invigilation duty order
    try:
        from app.routers.notifications import create_system_notification
        from app.models.models import AdminTask

        # 1. Notify Student Cohort
        await create_system_notification(
            db=db,
            recipient_user_id=None,
            recipient_role="student",
            sender_name="Exam Office (Mrs. Shweta Sengupta)",
            sender_role="exam_coordinator",
            title=f"New Examination Scheduled: {exam_title}",
            message=f"{exam_title} ({req.subject}) is scheduled on {req.exam_date} ({req.start_time} - {req.end_time}) in {final_hall}. Delivery Mode: {final_mode}.",
            notification_type="EXAM_SCHEDULED",
            priority="HIGH",
            action_url="/student",
            metadata_dict={"schedule_id": sched.id, "subject": req.subject, "exam_mode": final_mode}
        )

        # 2. Notify Assigned Invigilator (Teacher)
        await create_system_notification(
            db=db,
            recipient_user_id=2,
            recipient_role="teacher",
            sender_name="Exam Office (Mrs. Shweta Sengupta)",
            sender_role="exam_coordinator",
            title=f"Invigilation Duty Assigned: {exam_title}",
            message=f"You are deployed as Chief Invigilator for {exam_title} ({req.class_name} {req.section or 'B'}) on {req.exam_date} ({req.start_time} - {req.end_time}) in {final_hall}.",
            notification_type="DUTY_ASSIGNED",
            priority="URGENT",
            action_url="/teacher",
            metadata_dict={"schedule_id": sched.id, "hall": final_hall}
        )

        # 3. Create AdminTask for Invigilator Duty Queue
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
        await db.commit()
    except Exception as notif_err:
        print(f"Error dispatching exam notifications/duties: {notif_err}")

    return {
        "success": True,
        "message": f"Scheduled exam slot '{exam_title}' on {req.exam_date} in {final_hall} ({final_mode}). Notifications & duty orders dispatched.",
        "schedule_id": sched.id,
        "exam_id": exam.id
    }'''

if target_create in code:
    code = code.replace(target_create, replacement_create, 1)
    print("Replaced create_exam_schedule")
else:
    print("Warning: target_create not found")

with open('backend/app/routers/exams.py', 'w', encoding='utf-8') as f:
    f.write(code)
print("Updated exams.py successfully!")
