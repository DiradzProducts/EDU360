with open("backend/app/routers/parent.py", "r", encoding="utf-8") as f:
    parent_code = f.read()

old_get_chat = """@router.get("/chat/{student_id}", response_model=list[ParentTeacherChatMessageResponse])
async def get_parent_chat_history(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ParentTeacherMessage)
        .where(ParentTeacherMessage.student_id == student_id)
        .order_by(ParentTeacherMessage.created_at.asc())
    )
    return result.scalars().all()"""

new_get_chat = """@router.get("/chat/{student_id}", response_model=list[ParentTeacherChatMessageResponse])
async def get_parent_chat_history(student_id: int, teacher_name: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    # Support student ID alias for Aarav Sharma (1 or 6)
    target_ids = [1, 6] if student_id in [1, 6] else [student_id]
    stmt = select(ParentTeacherMessage).where(ParentTeacherMessage.student_id.in_(target_ids))
    
    if teacher_name:
        from sqlalchemy import or_
        stmt = stmt.where(or_(
            ParentTeacherMessage.sender_name.ilike(f"%{teacher_name}%"),
            ParentTeacherMessage.receiver_name.ilike(f"%{teacher_name}%")
        ))
        
    stmt = stmt.order_by(ParentTeacherMessage.created_at.asc())
    result = await db.execute(stmt)
    return result.scalars().all()"""

if old_get_chat in parent_code:
    parent_code = parent_code.replace(old_get_chat, new_get_chat)
    with open("backend/app/routers/parent.py", "w", encoding="utf-8") as f:
        f.write(parent_code)
    print("parent.py chat endpoint updated!")
else:
    print("old_get_chat not matched in parent.py")

with open("backend/app/routers/teacher.py", "r", encoding="utf-8") as f:
    teacher_code = f.read()

old_t_chat = """@router.get("/chat/{student_id}", response_model=list[ParentTeacherChatMessageResponse])
async def get_teacher_chat_history(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ParentTeacherMessage)
        .where(ParentTeacherMessage.student_id == student_id)
        .order_by(ParentTeacherMessage.created_at.asc())
    )
    return result.scalars().all()"""

new_t_chat = """@router.get("/chat/{student_id}", response_model=list[ParentTeacherChatMessageResponse])
async def get_teacher_chat_history(student_id: int, db: AsyncSession = Depends(get_db)):
    target_ids = [1, 6] if student_id in [1, 6] else [student_id]
    result = await db.execute(
        select(ParentTeacherMessage)
        .where(ParentTeacherMessage.student_id.in_(target_ids))
        .order_by(ParentTeacherMessage.created_at.asc())
    )
    return result.scalars().all()"""

if old_t_chat in teacher_code:
    teacher_code = teacher_code.replace(old_t_chat, new_t_chat)
    with open("backend/app/routers/teacher.py", "w", encoding="utf-8") as f:
        f.write(teacher_code)
    print("teacher.py chat endpoint updated!")
else:
    print("old_t_chat not matched in teacher.py")
