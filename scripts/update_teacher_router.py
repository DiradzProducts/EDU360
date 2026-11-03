with open("backend/app/routers/teacher.py", "r", encoding="utf-8") as f:
    content = f.read()

model_target = "    FocusTable, LeaveRequest\n)"
model_replace = "    FocusTable, LeaveRequest, ParentTeacherMessage\n)"

if model_target in content:
    content = content.replace(model_target, model_replace)
elif model_target.replace("\n", "\r\n") in content:
    content = content.replace(model_target.replace("\n", "\r\n"), model_replace.replace("\n", "\r\n"))

schema_target = "    PTMSlotCancelRequest, PTMSlotRestoreRequest\n)"
schema_replace = "    PTMSlotCancelRequest, PTMSlotRestoreRequest,\n    ParentTeacherChatMessageCreate, ParentTeacherChatMessageResponse\n)"

if schema_target in content:
    content = content.replace(schema_target, schema_replace)
elif schema_target.replace("\n", "\r\n") in content:
    content = content.replace(schema_target.replace("\n", "\r\n"), schema_replace.replace("\n", "\r\n"))

teacher_chat_code = """

# =========================================================================
# TEACHER - PARENT DIRECT CHAT ENDPOINTS (SHARED PERSISTENCE)
# =========================================================================

@router.get("/chat/{student_id}", response_model=list[ParentTeacherChatMessageResponse])
async def get_teacher_chat_history(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ParentTeacherMessage)
        .where(ParentTeacherMessage.student_id == student_id)
        .order_by(ParentTeacherMessage.created_at.asc())
    )
    return result.scalars().all()

@router.post("/chat/send", response_model=ParentTeacherChatMessageResponse)
async def send_teacher_chat_message(req: ParentTeacherChatMessageCreate, db: AsyncSession = Depends(get_db)):
    st_res = await db.execute(select(Student).where(Student.id == req.student_id))
    st = st_res.scalars().first()
    student_name = st.name if st else "Student"

    msg = ParentTeacherMessage(
        student_id=req.student_id,
        student_name=student_name,
        sender_role="TEACHER",
        sender_name=req.sender_name or "Mrs. Ananya Verma",
        receiver_role="PARENT",
        receiver_name=req.receiver_name or "Parent",
        message_text=req.message_text,
        attachment_name=req.attachment_name,
        attachment_url=req.attachment_url,
        is_read=False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    try:
        await create_system_notification(
            db=db,
            recipient_role="PARENT",
            sender_name=req.sender_name or "Mrs. Ananya Verma",
            sender_role="TEACHER",
            title=f"New Message from {req.sender_name or 'Teacher'}",
            message=f"Regarding {student_name}: {req.message_text[:80]}...",
            notification_type="TEACHER_CHAT",
            priority="NORMAL",
            action_url="/parent?nav=chat"
        )
    except Exception:
        pass

    return msg

@router.post("/chat/mark-read/{student_id}")
async def mark_teacher_chat_read(student_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(ParentTeacherMessage)
        .where(
            ParentTeacherMessage.student_id == student_id,
            ParentTeacherMessage.receiver_role == "TEACHER",
            ParentTeacherMessage.is_read == False
        )
        .values(is_read=True)
    )
    await db.commit()
    return {"success": True, "message": "Messages marked as read by teacher"}
"""

if "@router.get(\"/chat/{student_id}\"" not in content:
    content += teacher_chat_code

with open("backend/app/routers/teacher.py", "w", encoding="utf-8") as f:
    f.write(content)

print("teacher.py updated successfully.")
