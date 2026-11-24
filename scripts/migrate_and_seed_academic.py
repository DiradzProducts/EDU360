import asyncio
import os
import sys
import json
import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, select, func
from app.models.models import Base, CurriculumPacing, PTMEvent, PTMSlot, ExamSyncRequest, StaffMember

async def migrate_and_seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        print("[MIGRATE] Creating tables if not exist (Base.metadata.create_all)...")
        await conn.run_sync(Base.metadata.create_all)

        print("[MIGRATE] Checking ptm_slots columns...")
        cols_to_add = [
            ("cancellation_reason", "TEXT"),
            ("cancelled_by", "VARCHAR(50)"),
            ("cancelled_at", "VARCHAR(50)"),
            ("teacher_attended", "BOOLEAN DEFAULT FALSE"),
            ("parent_attended", "BOOLEAN DEFAULT FALSE"),
            ("attendance_status", "VARCHAR(30) DEFAULT 'SCHEDULED'"),
            ("meeting_notes", "TEXT"),
            ("completed_at", "TIMESTAMP WITHOUT TIME ZONE")
        ]
        for col_name, col_type in cols_to_add:
            try:
                await conn.execute(text(f"ALTER TABLE ptm_slots ADD COLUMN IF NOT EXISTS {col_name} {col_type};"))
                print(f"  - Column {col_name} checked/added.")
            except Exception as e:
                print(f"  - Note on {col_name}: {e}")

    async with async_session() as db:
        print("\n[SEED] Ensuring academic staff members exist in staff_members table...")
        additional_staff = [
            {"id": 5, "name": "Dr. Suresh Babu", "role": "Senior Physics Faculty", "department": "Sciences & Physics", "email": "suresh.babu@edu360.internal", "phone": "+91 98111 00010"},
            {"id": 6, "name": "Ms. Sunita Roy", "role": "Chemistry Faculty", "department": "Sciences & Chemistry", "email": "sunita.roy@edu360.internal", "phone": "+91 98111 00011"},
            {"id": 7, "name": "Mr. Arvind Saxena", "role": "Mathematics Faculty", "department": "Mathematics", "email": "arvind.saxena@edu360.internal", "phone": "+91 98111 00012"},
            {"id": 8, "name": "Mrs. Neha Roy", "role": "English Faculty", "department": "Humanities & English", "email": "neha.roy@edu360.internal", "phone": "+91 98111 00013"},
            {"id": 9, "name": "Mr. Ramesh Raman", "role": "Computer Science Faculty", "department": "Computer Science", "email": "ramesh.raman@edu360.internal", "phone": "+91 98111 00014"},
            {"id": 10, "name": "Mrs. Rekha Sharma", "role": "Hindi Faculty", "department": "Languages", "email": "rekha.sharma@edu360.internal", "phone": "+91 98111 00015"},
            {"id": 11, "name": "Mr. Deepak Rao", "role": "Social Sciences Faculty", "department": "Humanities & English", "email": "deepak.rao@edu360.internal", "phone": "+91 98111 00016"},
            {"id": 12, "name": "Dr. Hemanth Sen", "role": "Examination Officer", "department": "Examination Cell", "email": "exam.cell@edu360.internal", "phone": "+91 98111 00008"}
        ]
        for s in additional_staff:
            res = await db.execute(select(StaffMember).where(StaffMember.id == s["id"]))
            if not res.scalars().first():
                db.add(StaffMember(
                    id=s["id"],
                    name=s["name"],
                    role=s["role"],
                    department=s["department"],
                    email=s["email"],
                    phone=s["phone"],
                    attendance_status="Present",
                    salary_slip_ready=True
                ))
        await db.commit()
        print("[SEED] Staff members verified/inserted.")

        print("\n[SEED] Checking curriculum_pacing count...")
        c_count = await db.execute(select(func.count(CurriculumPacing.id)))
        cnt = c_count.scalar()
        print(f"Current curriculum_pacing count: {cnt}")

        if cnt == 0:
            print("[SEED] Seeding baseline CurriculumPacing data into PostgreSQL...")
            curriculum_seed_data = [
                {
                    "class_name": "Class 8-A",
                    "subject": "Mathematics",
                    "teacher_id": 2,
                    "teacher_name": "Mrs. Ananya Verma",
                    "total_units": 10,
                    "calendar_target_units": 5,
                    "completed_units": 5,
                    "lag_units": 0,
                    "consecutive_lag_weeks": 0,
                    "last_lesson_title": "Unit 5: Linear Equations in One Variable (Section 5.3)",
                    "status": "On Track"
                },
                {
                    "class_name": "Class 8-B",
                    "subject": "Mathematics",
                    "teacher_id": 2,
                    "teacher_name": "Mrs. Ananya Verma",
                    "total_units": 10,
                    "calendar_target_units": 5,
                    "completed_units": 4,
                    "lag_units": 1,
                    "consecutive_lag_weeks": 1,
                    "last_lesson_title": "Unit 4: Understanding Quadrilaterals - Practice Problem Sets",
                    "status": "Lagging (1 Unit Behind)"
                },
                {
                    "class_name": "Class 9-A",
                    "subject": "Physics",
                    "teacher_id": 5,
                    "teacher_name": "Dr. Suresh Babu",
                    "total_units": 10,
                    "calendar_target_units": 6,
                    "completed_units": 4,
                    "lag_units": 2,
                    "consecutive_lag_weeks": 2,
                    "last_lesson_title": "Unit 4: Laws of Motion & Momentum Lab",
                    "status": "Lagging (2 Units Behind)"
                },
                {
                    "class_name": "Class 9-B",
                    "subject": "Physics",
                    "teacher_id": 5,
                    "teacher_name": "Dr. Suresh Babu",
                    "total_units": 10,
                    "calendar_target_units": 6,
                    "completed_units": 5,
                    "lag_units": 1,
                    "consecutive_lag_weeks": 1,
                    "last_lesson_title": "Unit 5: Gravitation (Kepler's Laws)",
                    "status": "Lagging (1 Unit Behind)"
                },
                {
                    "class_name": "Class 9-A",
                    "subject": "Chemistry",
                    "teacher_id": 6,
                    "teacher_name": "Ms. Sunita Roy",
                    "total_units": 8,
                    "calendar_target_units": 4,
                    "completed_units": 5,
                    "lag_units": -1,
                    "consecutive_lag_weeks": 0,
                    "last_lesson_title": "Unit 5: Atoms and Molecules (Valency & Formulas)",
                    "status": "Ahead (+1 Unit)"
                },
                {
                    "class_name": "Class 10-A",
                    "subject": "Mathematics",
                    "teacher_id": 7,
                    "teacher_name": "Mr. Arvind Saxena",
                    "total_units": 12,
                    "calendar_target_units": 7,
                    "completed_units": 7,
                    "lag_units": 0,
                    "consecutive_lag_weeks": 0,
                    "last_lesson_title": "Unit 7: Coordinate Geometry (Section Formula)",
                    "status": "On Track"
                },
                {
                    "class_name": "Class 10-B",
                    "subject": "English Literature",
                    "teacher_id": 8,
                    "teacher_name": "Mrs. Neha Roy",
                    "total_units": 10,
                    "calendar_target_units": 6,
                    "completed_units": 6,
                    "lag_units": 0,
                    "consecutive_lag_weeks": 0,
                    "last_lesson_title": "Unit 6: The Hundred Dresses & Prose Analysis",
                    "status": "On Track"
                },
                {
                    "class_name": "Class 10-A",
                    "subject": "Biology",
                    "teacher_id": 6,
                    "teacher_name": "Ms. Sunita Roy",
                    "total_units": 8,
                    "calendar_target_units": 5,
                    "completed_units": 3,
                    "lag_units": 2,
                    "consecutive_lag_weeks": 2,
                    "last_lesson_title": "Unit 3: Life Processes (Respiration & Transport)",
                    "status": "Lagging (2 Units Behind)"
                },
                {
                    "class_name": "Class 11-A",
                    "subject": "Computer Science",
                    "teacher_id": 9,
                    "teacher_name": "Mr. Ramesh Raman",
                    "total_units": 10,
                    "calendar_target_units": 5,
                    "completed_units": 6,
                    "lag_units": -1,
                    "consecutive_lag_weeks": 0,
                    "last_lesson_title": "Unit 6: Object-Oriented Programming with Python",
                    "status": "Ahead (+1 Unit)"
                }
            ]

            for cp in curriculum_seed_data:
                db.add(CurriculumPacing(**cp))
            await db.commit()
            print(f"[SEED] Successfully inserted {len(curriculum_seed_data)} CurriculumPacing records.")

        print("\n[SEED] Checking ptm_events count...")
        p_count = await db.execute(select(func.count(PTMEvent.id)))
        ptm_cnt = p_count.scalar()
        print(f"Current ptm_events count: {ptm_cnt}")

        if ptm_cnt == 0:
            print("[SEED] Seeding baseline PTMEvent into PostgreSQL...")
            new_event = PTMEvent(
                id=1,
                title="Term-1 Post Mid-Term Parent-Teacher Meeting",
                academic_term="Term 1",
                start_date="2026-10-24",
                end_date="2026-10-25",
                start_time="09:00 AM",
                end_time="01:00 PM",
                slot_duration_mins=10,
                target_classes=json.dumps(["Class 8-A", "Class 8-B", "Class 9-A", "Class 9-B", "Class 10-A"]),
                status="Open_For_Parents",
                created_by_name="Prof. Rajeshwari Nair"
            )
            db.add(new_event)
            await db.commit()
            print("[SEED] Successfully inserted PTMEvent record.")

        # Update sample PTMSlots to demonstrate faculty attendance governance
        slots_res = await db.execute(select(PTMSlot).where(PTMSlot.status == "BOOKED").limit(4))
        booked_slots = slots_res.scalars().all()
        for idx, s in enumerate(booked_slots):
            if idx == 0:
                s.teacher_attended = True
                s.parent_attended = True
                s.attendance_status = "COMPLETED"
                s.completed_at = datetime.datetime.utcnow() - datetime.timedelta(hours=2)
                s.meeting_notes = "Productive discussion. Parent agreed to follow up on math algebra practice sheets."
            elif idx == 1:
                s.teacher_attended = True
                s.parent_attended = True
                s.attendance_status = "COMPLETED"
                s.completed_at = datetime.datetime.utcnow() - datetime.timedelta(hours=1)
                s.meeting_notes = "Reviewed science project and lab notebook progress with parent."
            else:
                s.teacher_attended = True
                s.parent_attended = False
                s.attendance_status = "SCHEDULED"
        await db.commit()
        print(f"[SEED] Updated {len(booked_slots)} sample PTMSlots with attendance governance data.")

    await engine.dispose()
    print("\n[MIGRATE & SEED] Done successfully!")

if __name__ == "__main__":
    asyncio.run(migrate_and_seed())
