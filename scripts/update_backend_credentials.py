with open('backend/app/routers/admin.py', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Import User
c = c.replace(
    'from app.models.models import (\n    TriageAlert, AdminTask,',
    'from app.models.models import (\n    User, TriageAlert, AdminTask,'
)

# 2. Add User creation & credentials payload to convert_enquiry_to_student
old_commit_block = """    # In-App notification to Accounts Coordinator
    await create_system_notification(
        db=db,
        sender_name="Admissions Desk",
        sender_role="admissions_coordinator",
        recipient_role="accounts_coordinator",
        title=f"🎓 New Enrolment: {new_student.name} ({new_student.class_name}-{new_student.section})",
        message=f"Student converted from CRM. Admission fee ₹{fee_amt:,.0f} status: {fee_status}. Profile added to Accounts Queue.",
        notification_type="NEW_ENROLMENT",
        priority="HIGH" if fee_status == "Pending" else "NORMAL",
        action_url="/accounts_coordinator"
    )

    await db.commit()
    await db.refresh(new_student)
    
    return {
        "success": True,
        "message": f"Successfully enrolled {new_student.name} into SIS ({new_student.class_name}-{new_student.section}) with Admission #{adm_no}",
        "student": new_student,
        "admission_fee": fee_amt,
        "fee_status": fee_status
    }"""

new_commit_block = """    # Generate Institutional User Credentials for Student & Parent
    clean_student = "".join(ch for ch in new_student.name.lower() if ch.isalnum() or ch == " ").strip().replace(" ", "_")
    student_uname = f"{clean_student}_{new_student.id}"
    clean_parent = "".join(ch for ch in (new_student.guardian_name or "parent").lower() if ch.isalnum() or ch == " ").strip().replace(" ", "_")
    parent_uname = f"parent_{clean_parent}_{new_student.id}"

    # Student Account
    st_user_res = await db.execute(select(User).where(User.username == student_uname))
    student_user = st_user_res.scalars().first()
    if not student_user:
        student_user = User(
            name=new_student.name,
            username=student_uname,
            email=f"{student_uname}@student.edu360.internal",
            role="student",
            school_code="EDU-GLOBAL-360",
            password="Password123",
            phone=new_student.guardian_phone,
            avatar="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
        )
        db.add(student_user)
        await db.flush()

    new_student.user_id = student_user.id

    # Parent Account
    pr_user_res = await db.execute(select(User).where(User.username == parent_uname))
    parent_user = pr_user_res.scalars().first()
    if not parent_user:
        parent_user = User(
            name=new_student.guardian_name or f"Parent of {new_student.name}",
            username=parent_uname,
            email=new_student.guardian_email or f"{parent_uname}@example.com",
            role="parent",
            school_code="EDU-GLOBAL-360",
            password="Password123",
            phone=new_student.guardian_phone,
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        )
        db.add(parent_user)
        await db.flush()

    # In-App notification to Accounts Coordinator
    await create_system_notification(
        db=db,
        sender_name="Admissions Desk",
        sender_role="admissions_coordinator",
        recipient_role="accounts_coordinator",
        title=f"🎓 New Enrolment: {new_student.name} ({new_student.class_name}-{new_student.section})",
        message=f"Student converted from CRM. Admission fee ₹{fee_amt:,.0f} status: {fee_status}. Profile added to Accounts Queue.",
        notification_type="NEW_ENROLMENT",
        priority="HIGH" if fee_status == "Pending" else "NORMAL",
        action_url="/accounts_coordinator"
    )

    await db.commit()
    await db.refresh(new_student)
    
    return {
        "success": True,
        "message": f"Successfully enrolled {new_student.name} into SIS ({new_student.class_name}-{new_student.section}) with Admission #{adm_no}",
        "student": new_student,
        "admission_fee": fee_amt,
        "fee_status": fee_status,
        "credentials": {
            "student_name": new_student.name,
            "student_username": student_uname,
            "student_password": "Password123",
            "student_roll": new_student.roll_no,
            "student_class": f"{new_student.class_name}-{new_student.section}",
            "student_admission_no": adm_no,
            "student_portal": "/student",
            "parent_name": new_student.guardian_name or "Parent / Guardian",
            "parent_username": parent_uname,
            "parent_password": "Password123",
            "parent_phone": new_student.guardian_phone or "",
            "parent_portal": "/parent"
        }
    }"""

c_norm = c.replace('\r\n', '\n')
old_cb_norm = old_commit_block.replace('\r\n', '\n')
new_cb_norm = new_commit_block.replace('\r\n', '\n')

assert old_cb_norm in c_norm, "old_commit_block not found in admin.py"
c_norm = c_norm.replace(old_cb_norm, new_cb_norm, 1)

with open('backend/app/routers/admin.py', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("admin.py updated with auto User creation and credentials return!")
