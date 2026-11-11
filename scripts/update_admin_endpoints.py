import re

with open('backend/app/routers/admin.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Add import
if 'ExitClearanceInitiateRequest' not in c:
    c = c.replace(
        'ExitClearanceResponse, ExitClearancePhysicalUpload,',
        'ExitClearanceResponse, ExitClearancePhysicalUpload, ExitClearanceInitiateRequest,'
    )

old_section = """# --- 5. Exit Clearance & Dual Signature Verification ---
@router.get("/exit-clearances", response_model=list[ExitClearanceResponse])
async def list_exit_clearances(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExitClearance).order_by(ExitClearance.id.asc()))
    return result.scalars().all()

@router.post("/exit-clearances/{clearance_id}/verify-physical")
async def verify_physical_signature(clearance_id: int, req: ExitClearancePhysicalUpload, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExitClearance).where(ExitClearance.id == clearance_id))
    clearance = result.scalars().first()
    if not clearance:
        raise HTTPException(status_code=404, detail="Exit clearance record not found")
    
    clearance.physical_scan_url = req.physical_scan_url or "/assets/signed_tc_handover_slip.pdf"
    clearance.physical_sign_verified = True
    if clearance.digital_parent_approved and clearance.physical_sign_verified:
        clearance.status = "Completed & Permanently Archived"
    else:
        clearance.status = "Physical Verified - Awaiting Digital"
    
    await db.commit()
    await db.refresh(clearance)
    return {
        "success": True,
        "message": "Physical handover register scan verified and locked in school legal vault.",
        "clearance": clearance
    }

@router.post("/exit-clearances/{clearance_id}/reset")
async def reset_exit_clearance(clearance_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExitClearance).where(ExitClearance.id == clearance_id))
    clearance = result.scalars().first()
    if not clearance:
        raise HTTPException(status_code=404, detail="Exit clearance record not found")
    
    clearance.digital_parent_approved = False
    clearance.digital_approval_timestamp = None
    clearance.physical_scan_url = None
    clearance.physical_sign_verified = False
    clearance.status = "Pending Dual Verification"
    await db.commit()
    await db.refresh(clearance)
    return {
        "success": True,
        "message": f"Exit clearance for {clearance.student_name} reset to Pending Dual Verification.",
        "clearance": clearance
    }"""

new_section = """# --- 5. Exit Clearance & Dual Signature Verification ---
@router.get("/exit-clearances", response_model=list[ExitClearanceResponse])
async def list_exit_clearances(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExitClearance).order_by(ExitClearance.id.desc()))
    return result.scalars().all()

@router.get("/exit-clearances/student/{student_id}")
async def get_student_exit_clearance(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ExitClearance).where(ExitClearance.student_id == student_id).order_by(ExitClearance.id.desc())
    )
    clearance = result.scalars().first()
    return clearance

@router.post("/exit-clearances/initiate")
async def initiate_exit_clearance(req: ExitClearanceInitiateRequest, db: AsyncSession = Depends(get_db)):
    # Check student
    student_res = await db.execute(select(Student).where(Student.id == req.student_id))
    student = student_res.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check if exit clearance already exists
    clearance_res = await db.execute(
        select(ExitClearance).where(ExitClearance.student_id == req.student_id).order_by(ExitClearance.id.desc())
    )
    existing = clearance_res.scalars().first()
    if existing:
        return {
            "success": True,
            "message": f"Exit clearance protocol already active for {student.name}.",
            "clearance": existing
        }

    # Create new exit clearance
    new_clearance = ExitClearance(
        student_id=student.id,
        student_name=student.name,
        class_name=student.class_name,
        fee_cleared=req.fee_cleared,
        library_cleared=req.library_cleared,
        inventory_cleared=req.inventory_cleared,
        tc_ready=req.tc_ready,
        digital_parent_approved=False,
        digital_approval_timestamp=None,
        physical_scan_url=None,
        physical_sign_verified=False,
        status="Pending Dual Verification"
    )
    student.status = "Exit / TC Processing"
    db.add(new_clearance)
    await db.commit()
    await db.refresh(new_clearance)

    try:
        await create_system_notification(
            db=db,
            title=f"Exit Clearance & TC Initiated: {student.name}",
            message=f"Exit clearance protocol initiated for {student.name} ({student.class_name}). Dual verification pending.",
            type="warning",
            target_role="admin"
        )
    except Exception:
        pass

    return {
        "success": True,
        "message": f"Exit clearance protocol initiated for {student.name}. Moved to active Exit Clearance Pipeline.",
        "clearance": new_clearance
    }

@router.post("/exit-clearances/{clearance_id}/verify-physical")
async def verify_physical_signature(clearance_id: int, req: ExitClearancePhysicalUpload, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExitClearance).where(ExitClearance.id == clearance_id))
    clearance = result.scalars().first()
    if not clearance:
        raise HTTPException(status_code=404, detail="Exit clearance record not found")
    
    clearance.physical_scan_url = req.physical_scan_url or "/assets/signed_tc_handover_slip.pdf"
    clearance.physical_sign_verified = True
    if clearance.digital_parent_approved and clearance.physical_sign_verified:
        clearance.status = "Completed & Permanently Archived"
    else:
        clearance.status = "Physical Verified - Awaiting Digital"
    
    await db.commit()
    await db.refresh(clearance)
    return {
        "success": True,
        "message": "Physical handover register scan verified and locked in school legal vault.",
        "clearance": clearance
    }"""

# Normalize line endings
c_norm = c.replace('\r\n', '\n')
old_norm = old_section.replace('\r\n', '\n')
new_norm = new_section.replace('\r\n', '\n')

assert old_norm in c_norm, "old_norm not found in c_norm"
c_norm = c_norm.replace(old_norm, new_norm, 1)

with open('backend/app/routers/admin.py', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("backend/app/routers/admin.py updated successfully!")
