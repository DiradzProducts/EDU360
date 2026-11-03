import re

# 1. Update backend/app/routers/parent.py
with open('backend/app/routers/parent.py', 'r', encoding='utf-8') as f:
    parent_code = f.read()

old_parent_leave = '''# --- 5. Leave Request Application ---
@router.post("/leave-requests", response_model=LeaveRequestResponse)
async def apply_student_leave(req: LeaveRequestCreate, db: AsyncSession = Depends(get_db)):
    new_lr = LeaveRequest(
        student_id=req.student_id,
        student_name=req.student_name,
        parent_name=req.parent_name,
        from_date=req.from_date,
        to_date=req.to_date,
        reason=req.reason,
        status="Pending",
        is_medical=req.is_medical or False,
        attachment_name=req.attachment_name,
        attachment_url=req.attachment_url,
        approval_stage="Submitted"
    )
    db.add(new_lr)
    await db.commit()
    await db.refresh(new_lr)
    return new_lr'''

new_parent_leave = '''# --- 5. Leave Request Application ---
@router.post("/leave-requests", response_model=LeaveRequestResponse)
async def apply_student_leave(req: LeaveRequestCreate, db: AsyncSession = Depends(get_db)):
    new_lr = LeaveRequest(
        student_id=req.student_id,
        student_name=req.student_name,
        parent_name=req.parent_name,
        from_date=req.from_date,
        to_date=req.to_date,
        reason=req.reason,
        status="Pending",
        is_medical=req.is_medical or False,
        attachment_name=req.attachment_name,
        attachment_url=req.attachment_url,
        approval_stage="Submitted - Pending Teacher Review"
    )
    db.add(new_lr)
    await db.commit()
    await db.refresh(new_lr)

    # Dispatch persistent notification to TEACHER role
    try:
        med_prefix = "medical " if req.is_medical else ""
        await create_system_notification(
            db=db,
            sender_name=req.parent_name,
            sender_role="PARENT",
            title=f"New Leave Application: {req.student_name}",
            message=f"Parent {req.parent_name} submitted a {med_prefix}leave request for {req.student_name} ({req.from_date} to {req.to_date}): \\\"{req.reason}\\\". Action required in Leave Approvals.",
            notification_type="LEAVE_APPLICATION",
            priority="HIGH" if req.is_medical else "NORMAL",
            recipient_role="TEACHER",
            action_url="/teacher?tab=leave_approvals",
            metadata_dict={"student_id": req.student_id, "leave_id": new_lr.id, "is_medical": req.is_medical}
        )
    except Exception as e:
        print(f"Warning: could not dispatch teacher notification for leave request: {e}")

    return new_lr'''

if old_parent_leave in parent_code:
    parent_code = parent_code.replace(old_parent_leave, new_parent_leave, 1)
    with open('backend/app/routers/parent.py', 'w', encoding='utf-8') as f:
        f.write(parent_code)
    print("SUCCESS: Updated backend/app/routers/parent.py")
else:
    print("WARNING: old_parent_leave not matched in parent.py")

# 2. Update backend/app/routers/teacher.py
with open('backend/app/routers/teacher.py', 'r', encoding='utf-8') as f:
    teacher_code = f.read()

# Make sure RemedialSprint is imported from models
if "RemedialSprint" not in teacher_code[:500]:
    teacher_code = teacher_code.replace(
        "    FocusTable, LeaveRequest, ParentTeacherMessage\n)",
        "    FocusTable, LeaveRequest, ParentTeacherMessage, RemedialSprint\n)"
    )

old_teacher_leave_and_roster = '''@router.post("/leave-requests/{request_id}/review", response_model=LeaveRequestResponse)
async def review_leave_request(request_id: int, req: LeaveRequestReview, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == request_id))
    lr = result.scalars().first()
    if not lr:
        raise HTTPException(status_code=404, detail="Leave request not found")
    lr.status = req.status
    if req.teacher_notes:
        lr.teacher_notes = req.teacher_notes
    await db.commit()
    await db.refresh(lr)
    return lr

@router.get("/parent-context/{student_id}")
async def get_parent_chat_context(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).where(Student.id == student_id))
    st = result.scalars().first()
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")
    return {
        "student_name": st.name,
        "class_name": f"{st.class_name}-{st.section}",
        "attendance_pct": st.attendance_pct,
        "academic_average_pct": st.academic_average_pct,
        "parent_name": st.guardian_name,
        "parent_phone": st.guardian_phone,
        "parent_email": st.guardian_email,
        "fee_status": "Up to Date (Milestone 2 Pending)",
        "recent_grades": [
            {"subject": "Mathematics", "score": "52%", "alert": "In Focus Table"},
            {"subject": "Physics", "score": "78%", "alert": "Normal"},
            {"subject": "English Literature", "score": "88%", "alert": "Excellent"}
        ]
    }

# --- 5. Student Roster (Class 8B & 9A) ---
@router.get("/students")
async def list_teacher_students(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).order_by(Student.roll_no))
    students = result.scalars().all()
    
    # Map remedial sprints for focus table indicators
    focus_res = await db.execute(select(RemedialSprint))
    sprints = focus_res.scalars().all()
    sprint_map = {s.student_id: s for s in sprints}
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "roll_no": s.roll_no,
            "class_name": f"{s.class_name}-{s.section}",
            "raw_class": s.class_name,
            "section": s.section,
            "attendance_pct": s.attendance_pct,
            "missed_classes_count": max(0, int(round((100 - (s.attendance_pct or 90.0)) * 0.3))),
            "academic_average_pct": s.academic_average_pct,
            "guardian_name": s.guardian_name,
            "guardian_phone": s.guardian_phone,
            "has_focus_table": s.id in sprint_map or s.id in [1, 2, 4, 10],
            "focus_concept": sprint_map[s.id].weak_concept if s.id in sprint_map else ("Quadratic Factorization & Negative Signs" if s.id == 1 else ("Polynomial Division & Remainder Theorem" if s.id == 10 else None)),
            "homework_status": "Submitted" if s.id != 3 else "Pending",
            "last_active": "Today, 10:15 AM"
        }
        for s in students
    ]'''

new_teacher_leave_and_roster = '''@router.post("/leave-requests/{request_id}/review", response_model=LeaveRequestResponse)
async def review_leave_request(request_id: int, req: LeaveRequestReview, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == request_id))
    lr = result.scalars().first()
    if not lr:
        raise HTTPException(status_code=404, detail="Leave request not found")
    lr.status = req.status
    if req.teacher_notes:
        lr.teacher_notes = req.teacher_notes
    
    today_iso = datetime.date.today().isoformat()

    if req.status == "Approved":
        lr.approval_stage = "Attendance Adjusted"

        # 1. Update or create AttendanceRecord for class_id=1 (and today's class)
        att_res = await db.execute(
            select(AttendanceRecord).where(
                AttendanceRecord.student_id == lr.student_id,
                AttendanceRecord.class_id == 1
            )
        )
        att_rec = att_res.scalars().first()
        if att_rec:
            att_rec.status = "Leave"
            att_rec.teacher_override = True
            att_rec.join_timestamp = "Excused Leave (Approved)"
            att_rec.minutes_late = 0.0
        else:
            att_rec = AttendanceRecord(
                class_id=1,
                student_id=lr.student_id,
                student_name=lr.student_name,
                date=today_iso,
                status="Leave",
                teacher_override=True,
                join_timestamp="Excused Leave (Approved)",
                minutes_late=0.0
            )
            db.add(att_rec)

        # 2. Dispatch persistent notification to Parent
        try:
            await create_system_notification(
                db=db,
                sender_name="Mrs. Ananya Verma",
                sender_role="TEACHER",
                title=f"Leave Approved: {lr.student_name}",
                message=f"Class Teacher Mrs. Ananya Verma approved the leave application for {lr.student_name} ({lr.from_date} to {lr.to_date}). Attendance adjusted to 'Excused Leave' in school records.",
                notification_type="LEAVE_APPROVAL",
                priority="NORMAL",
                recipient_role="PARENT",
                action_url="/parent?nav=leave",
                metadata_dict={"student_id": lr.student_id, "status": "Approved", "leave_id": lr.id}
            )
        except Exception as e:
            print(f"Warning: could not dispatch parent leave approval notification: {e}")

    elif req.status == "Rejected":
        lr.approval_stage = "Rejected by Teacher"

        att_res = await db.execute(
            select(AttendanceRecord).where(
                AttendanceRecord.student_id == lr.student_id,
                AttendanceRecord.class_id == 1
            )
        )
        att_rec = att_res.scalars().first()
        if att_rec and att_rec.status == "Leave":
            att_rec.status = "Absent"
            att_rec.teacher_override = True
            att_rec.join_timestamp = None

        try:
            await create_system_notification(
                db=db,
                sender_name="Mrs. Ananya Verma",
                sender_role="TEACHER",
                title=f"Leave Request Rejected: {lr.student_name}",
                message=f"Class Teacher Mrs. Ananya Verma did not approve the leave application for {lr.student_name}. Note: {req.teacher_notes or 'Please consult class teacher directly.'}",
                notification_type="LEAVE_REJECTION",
                priority="HIGH",
                recipient_role="PARENT",
                action_url="/parent?nav=leave",
                metadata_dict={"student_id": lr.student_id, "status": "Rejected", "leave_id": lr.id}
            )
        except Exception as e:
            print(f"Warning: could not dispatch parent leave rejection notification: {e}")

    await db.commit()
    await db.refresh(lr)
    return lr

@router.get("/parent-context/{student_id}")
async def get_parent_chat_context(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).where(Student.id == student_id))
    st = result.scalars().first()
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")
    return {
        "student_name": st.name,
        "class_name": f"{st.class_name}-{st.section}",
        "attendance_pct": st.attendance_pct,
        "academic_average_pct": st.academic_average_pct,
        "parent_name": st.guardian_name,
        "parent_phone": st.guardian_phone,
        "parent_email": st.guardian_email,
        "fee_status": "Up to Date (Milestone 2 Pending)",
        "recent_grades": [
            {"subject": "Mathematics", "score": "52%", "alert": "In Focus Table"},
            {"subject": "Physics", "score": "78%", "alert": "Normal"},
            {"subject": "English Literature", "score": "88%", "alert": "Excellent"}
        ]
    }

# --- 5. Student Roster (Class 8B & 9A) ---
@router.get("/students")
async def list_teacher_students(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).order_by(Student.roll_no))
    students = result.scalars().all()
    
    # Map remedial sprints for focus table indicators
    focus_res = await db.execute(select(RemedialSprint))
    sprints = focus_res.scalars().all()
    sprint_map = {s.student_id: s for s in sprints}

    # Query Leave Requests to sync leave status
    leaves_res = await db.execute(
        select(LeaveRequest).where(LeaveRequest.status.in_(["Approved", "Pending"])).order_by(LeaveRequest.applied_at.desc())
    )
    all_leaves = leaves_res.scalars().all()
    leave_map = {}
    for lr in all_leaves:
        if lr.student_id not in leave_map:
            leave_map[lr.student_id] = lr

    # Query Attendance Records for Class 1 (or current active live class)
    att_res = await db.execute(select(AttendanceRecord).where(AttendanceRecord.class_id == 1))
    att_map = {a.student_id: a for a in att_res.scalars().all()}

    output = []
    for s in students:
        lr = leave_map.get(s.id)
        att = att_map.get(s.id)

        is_on_leave = (lr is not None and lr.status == "Approved") or (att is not None and att.status == "Leave")
        is_leave_pending = (lr is not None and lr.status == "Pending")

        if is_on_leave:
            leave_status_str = "Approved Leave"
            today_att_status = "Excused Leave"
            att_flag = "EXCUSED_LEAVE"
            last_active_str = "On Approved Leave (Excused)"
        elif is_leave_pending:
            leave_status_str = "Pending Approval"
            today_att_status = "Leave Pending"
            att_flag = "PENDING_LEAVE"
            last_active_str = "Leave Pending Review"
        elif att and att.status == "Absent":
            leave_status_str = "None"
            today_att_status = "Absent"
            att_flag = "ABSENT"
            last_active_str = "Absent Today"
        elif att and att.status == "Late":
            leave_status_str = "None"
            today_att_status = "Late"
            att_flag = "LATE"
            last_active_str = f"Late Join ({att.join_timestamp or 'Flagged'})"
        else:
            leave_status_str = "None"
            today_att_status = "Present"
            att_flag = "PRESENT"
            last_active_str = "Today, 10:15 AM"

        output.append({
            "id": s.id,
            "name": s.name,
            "roll_no": s.roll_no,
            "class_name": f"{s.class_name}-{s.section}",
            "raw_class": s.class_name,
            "section": s.section,
            "attendance_pct": s.attendance_pct,
            "missed_classes_count": max(0, int(round((100 - (s.attendance_pct or 90.0)) * 0.3))),
            "academic_average_pct": s.academic_average_pct,
            "guardian_name": s.guardian_name,
            "guardian_phone": s.guardian_phone,
            "has_focus_table": s.id in sprint_map or s.id in [1, 2, 4, 10],
            "focus_concept": sprint_map[s.id].weak_concept if s.id in sprint_map else ("Quadratic Factorization & Negative Signs" if s.id == 1 else ("Polynomial Division & Remainder Theorem" if s.id == 10 else None)),
            "homework_status": "Submitted" if s.id != 3 else "Pending",
            "last_active": last_active_str,
            "is_on_leave": is_on_leave,
            "is_leave_pending": is_leave_pending,
            "leave_status": leave_status_str,
            "leave_reason": lr.reason if lr else None,
            "is_medical_leave": lr.is_medical if lr else False,
            "leave_from_date": lr.from_date if lr else None,
            "leave_to_date": lr.to_date if lr else None,
            "today_attendance_status": today_att_status,
            "attendance_flag": att_flag
        })
    return output'''

if old_teacher_leave_and_roster in teacher_code:
    teacher_code = teacher_code.replace(old_teacher_leave_and_roster, new_teacher_leave_and_roster, 1)
    with open('backend/app/routers/teacher.py', 'w', encoding='utf-8') as f:
        f.write(teacher_code)
    print("SUCCESS: Updated backend/app/routers/teacher.py")
else:
    print("WARNING: old_teacher_leave_and_roster not matched in teacher.py")
