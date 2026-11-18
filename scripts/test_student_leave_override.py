import sys
sys.path.insert(0, "backend")
import asyncio
import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.models import LeaveRequest, AttendanceRecord, SecurityAuditLog, Notification
from app.schemas.schemas import AdminStudentLeaveOverrideRequest, LeaveRequestReview
from app.routers.admin import list_admin_student_leaves, admin_override_student_leave
from app.routers.teacher import review_leave_request
from fastapi import HTTPException

async def run_tests():
    print("=== STARTING STUDENT LEAVE & ADMIN OVERRIDE TEST SUITE ===")
    
    # Use local sqlite+aiosqlite for testing
    test_db_url = "sqlite+aiosqlite:///edu360.db"
    test_engine = create_async_engine(test_db_url, echo=False)
    test_session = sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

    async with test_session() as db:
        # 1. Check existing leaves or create test leave request
        res = await db.execute(select(LeaveRequest).order_by(LeaveRequest.id.asc()))
        lr = res.scalars().first()
        if not lr:
            lr = LeaveRequest(
                student_id=1,
                student_name="Aarav Sharma",
                parent_name="Mr. Rajesh Sharma",
                from_date="2026-11-20",
                to_date="2026-11-22",
                reason="Severe fever and respiratory infection. Bed rest recommended by pediatrician.",
                status="Pending",
                is_medical=True,
                attachment_name="Pediatrician_Medical_Slip.pdf"
            )
            db.add(lr)
            await db.commit()
            await db.refresh(lr)
            print(f"Created initial test leave request #{lr.id}")
        else:
            print(f"Found existing leave request #{lr.id} for {lr.student_name} (Status: {lr.status})")

        # 2. Test Admin listing endpoint
        leaves = await list_admin_student_leaves(status=None, student_id=None, db=db)
        assert len(leaves) > 0, "Admin listing should return at least 1 leave request"
        print(f"[TEST PASS] Admin listed {len(leaves)} student leave requests successfully.")

        # 3. Test Admin Override to 'Approved'
        override_payload = AdminStudentLeaveOverrideRequest(
            status="Approved",
            admin_notes="CBSE Condonation Guideline Section 14 - Medical Exemption Granted by Principal Dr. Rajesh Sharma",
            admin_name="Principal Dr. Rajesh Sharma"
        )
        updated_lr = await admin_override_student_leave(request_id=lr.id, req=override_payload, db=db)
        assert updated_lr.status == "Approved", f"Expected Approved, got {updated_lr.status}"
        assert updated_lr.is_admin_override is True, "Expected is_admin_override == True"
        assert updated_lr.overridden_by == "Principal Dr. Rajesh Sharma"
        assert "CBSE" in updated_lr.admin_notes
        print(f"[TEST PASS] Admin override executed: Status = {updated_lr.status}, Stage = {updated_lr.approval_stage}")

        # 4. Verify AttendanceRecord synchronization
        att_res = await db.execute(select(AttendanceRecord).where(AttendanceRecord.student_id == lr.student_id))
        att_records = att_res.scalars().all()
        assert len(att_records) > 0, "Expected attendance records to be created/updated"
        leave_atts = [a for a in att_records if a.status == "Leave"]
        assert len(leave_atts) > 0, "Expected at least one attendance record marked as 'Leave'"
        for a in leave_atts:
            assert a.admin_override is True or a.teacher_override is True
            assert a.override_by_role == "ADMIN"
        print(f"[TEST PASS] Attendance synchronization verified. {len(leave_atts)} records locked under ADMIN override.")

        # 5. Verify Class Teacher CANNOT overwrite Admin decision (Role Supremacy / 403 test)
        teacher_review_payload = LeaveRequestReview(
            status="Rejected",
            teacher_notes="Teacher attempted rejection after admin approval"
        )
        try:
            await review_leave_request(request_id=lr.id, req=teacher_review_payload, db=db)
            raise AssertionError("FAIL: Teacher should NOT be allowed to override Admin decision!")
        except HTTPException as e:
            assert e.status_code == 403, f"Expected 403 Forbidden, got {e.status_code}"
            print(f"[TEST PASS] Role Supremacy Invariant Enforced: Teacher blocked from overwriting Admin ({e.detail[:65]}...)")

        # 6. Verify SecurityAuditLog
        audit_res = await db.execute(
            select(SecurityAuditLog).where(SecurityAuditLog.action_type == "ADMIN_STUDENT_LEAVE_OVERRIDE").order_by(SecurityAuditLog.id.desc())
        )
        audit_log = audit_res.scalars().first()
        assert audit_log is not None, "SecurityAuditLog should record ADMIN_STUDENT_LEAVE_OVERRIDE"
        assert audit_log.actor_name == "Principal Dr. Rajesh Sharma"
        print(f"[TEST PASS] Statutory Security Audit entry verified: #{audit_log.id} - {audit_log.details}")

        # 7. Test Admin Override to 'Rejected' (Disciplinary / Exam Policy)
        reject_payload = AdminStudentLeaveOverrideRequest(
            status="Rejected",
            admin_notes="Unexcused absence during Board Practical Exam term.",
            admin_name="Principal Dr. Rajesh Sharma"
        )
        rejected_lr = await admin_override_student_leave(request_id=lr.id, req=reject_payload, db=db)
        assert rejected_lr.status == "Rejected"
        assert "Rejected" in rejected_lr.approval_stage
        print(f"[TEST PASS] Admin override to 'Rejected' executed successfully: {rejected_lr.approval_stage}")

    print("\n=======================================================")
    print("ALL 7 STUDENT LEAVE & ADMIN OVERRIDE TESTS PASSED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    import sys
    sys.path.insert(0, "backend")
    asyncio.run(run_tests())
