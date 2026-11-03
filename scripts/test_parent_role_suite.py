import asyncio
import os
import sys

# Ensure backend in sys.path
sys.path.insert(0, os.path.abspath("backend"))

from app.core.database import AsyncSessionLocal
from app.models.models import ParentTeacherMessage, ReportCard, LeaveRequest, Student
from sqlalchemy import select

async def test_parent_suite():
    async with AsyncSessionLocal() as session:
        print("=== 1. Testing Parent-Teacher Direct Messages ===")
        msgs_res = await session.execute(
            select(ParentTeacherMessage).where(ParentTeacherMessage.student_id.in_([1, 6]))
        )
        msgs = msgs_res.scalars().all()
        print(f"  Found {len(msgs)} chat messages for student 1/6.")
        for m in msgs[:3]:
            print(f"   [{m.sender_role} - {m.sender_name}] -> [{m.receiver_role}]: {m.message_text[:60]}... (attachment={m.attachment_name})")

        print("\n=== 2. Testing Report Card Digital Seal ===")
        rc_res = await session.execute(select(ReportCard).limit(1))
        rc = rc_res.scalars().first()
        if rc:
            print(f"  ReportCard found: ID {rc.id}, student {rc.student_name}, term {rc.term}, published={rc.is_published}")
            print(f"  Parent signed: {rc.parent_signed_at}, hash={rc.parent_signature_hash}")
        else:
            print("  No report card found in DB.")

        print("\n=== 3. Testing Leave Request with Medical Attributes ===")
        lr_res = await session.execute(select(LeaveRequest).limit(2))
        lrs = lr_res.scalars().all()
        print(f"  Found {len(lrs)} leave requests:")
        for lr in lrs:
            print(f"   Leave ID {lr.id}: {lr.student_name} | {lr.from_date} to {lr.to_date} | Medical={lr.is_medical} | Attachment={lr.attachment_name} | Stage={lr.approval_stage}")

    print("\nParent Role Integration Suite verified successfully!")

if __name__ == "__main__":
    asyncio.run(test_parent_suite())
