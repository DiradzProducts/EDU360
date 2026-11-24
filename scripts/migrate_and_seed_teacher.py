import sys
import os
import asyncio
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath("backend"))

from app.core.database import AsyncSessionLocal, engine, Base
from sqlalchemy import text, select, func
from app.models.models import ExamSchedule, StaffPermission, StaffMember, Homework, HomeworkSubmission

async def migrate_and_seed():
    print("=" * 60)
    print("MIGRATING & SEEDING TEACHER WORKFLOWS (POSTGRESQL)")
    print("=" * 60)

    async with engine.begin() as conn:
        # 1. Create tables if not exist (including staff_permissions)
        print("1. Creating missing tables from Base metadata...")
        await conn.run_sync(Base.metadata.create_all)
        print("✓ Tables verified.")

        # 2. Add columns to exam_schedules and staff_permissions if not present
        print("2. Altering tables with missing columns...")
        alter_queries = [
            "ALTER TABLE exam_schedules ADD COLUMN IF NOT EXISTS session_status VARCHAR(30) DEFAULT 'SCHEDULED';",
            "ALTER TABLE exam_schedules ADD COLUMN IF NOT EXISTS commenced_at TIMESTAMP WITH TIME ZONE;",
            "ALTER TABLE exam_schedules ADD COLUMN IF NOT EXISTS commenced_by VARCHAR(100);",
            "ALTER TABLE exam_schedules ADD COLUMN IF NOT EXISTS concluded_at TIMESTAMP WITH TIME ZONE;",
            "ALTER TABLE staff_permissions ADD COLUMN IF NOT EXISTS leave_category VARCHAR(64) DEFAULT 'Casual Leave (CL)';",
            "ALTER TABLE staff_permissions ADD COLUMN IF NOT EXISTS total_days INTEGER DEFAULT 1;"
        ]
        for q in alter_queries:
            await conn.execute(text(q))
        print("✓ Tables altered successfully.")

    async with AsyncSessionLocal() as db:
        # 3. Check and update existing exam_schedules
        print("3. Initializing existing exam_schedules session_status...")
        await db.execute(text("UPDATE exam_schedules SET session_status = 'SCHEDULED' WHERE session_status IS NULL;"))
        await db.commit()

        # 4. Check staff_permissions table
        sp_count = (await db.execute(select(func.count(StaffPermission.id)))).scalar()
        print(f"4. staff_permissions row count: {sp_count}")
        if sp_count == 0:
            print("Seeding initial staff permissions for faculty...")
            p1 = StaffPermission(
                staff_id=2,  # Mrs. Ananya Verma
                staff_name="Mrs. Ananya Verma",
                role="Teacher",
                permission_type="Casual Leave (CL)",
                leave_category="Casual Leave (CL)",
                total_days=1,
                from_date="2026-10-26",
                to_date="2026-10-26",
                affected_periods="Period 2 (Class 8-B Math), Period 5 (Class 9-A Math)",
                reason="Attending family medical appointment at Apollo Hospital.",
                status="Pending",
                created_at=datetime.utcnow() - timedelta(hours=3)
            )
            p2 = StaffPermission(
                staff_id=2,
                staff_name="Mrs. Ananya Verma",
                role="Teacher",
                permission_type="On-Duty (OD)",
                leave_category="On-Duty (OD)",
                total_days=1,
                from_date="2026-10-18",
                to_date="2026-10-18",
                affected_periods="Period 4 (Class 8-B Math)",
                reason="Representing institution at CBSE Regional Mathematics Symposium.",
                status="Approved",
                approved_by="Dr. Sunita Kapoor (Principal)",
                reviewed_at=datetime.utcnow() - timedelta(days=5),
                created_at=datetime.utcnow() - timedelta(days=6)
            )
            p3 = StaffPermission(
                staff_id=5,  # Dr. Suresh Babu
                staff_name="Dr. Suresh Babu",
                role="Teacher",
                permission_type="Medical Leave (ML)",
                leave_category="Medical Leave (ML)",
                total_days=2,
                from_date="2026-10-29",
                to_date="2026-10-30",
                affected_periods="Period 3 (Class 9-A Physics), Period 6 (Class 10-A Physics)",
                reason="Viral fever recovery under physician guidance.",
                status="Pending",
                created_at=datetime.utcnow() - timedelta(hours=1)
            )
            db.add_all([p1, p2, p3])
            await db.commit()
            print("✓ Seeded 3 staff permissions.")

        # 5. Verify homework submissions linking
        hw_sub_count = (await db.execute(select(func.count(HomeworkSubmission.id)))).scalar()
        print(f"5. Total homework submissions in DB: {hw_sub_count}")

    print("=" * 60)
    print("TEACHER WORKFLOW MIGRATION & SEED COMPLETED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(migrate_and_seed())
