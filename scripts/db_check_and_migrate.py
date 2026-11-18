import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal, engine
from app.models.models import Base

async def main():
    async with AsyncSessionLocal() as session:
        # Check students table columns
        res = await session.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'students'
        """))
        cols = [r[0] for r in res.fetchall()]
        print("Existing students columns in DB:", cols)

        # Check if admission_date exists
        if "admission_date" not in cols:
            print("Adding missing column 'admission_date' to students table...")
            await session.execute(text("ALTER TABLE students ADD COLUMN admission_date VARCHAR(30) DEFAULT '2026-11-01';"))
            await session.commit()
            print("Successfully added admission_date column!")

        # Check/create composite index on leave_requests
        await session.execute(text("CREATE INDEX IF NOT EXISTS ix_leave_student_status_applied ON leave_requests (student_id, status, applied_at DESC);"))
        await session.commit()
        print("Successfully created/verified ix_leave_student_status_applied index!")

        # Add check constraints on fee_defaulters to guarantee non-negative balances
        await session.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_fee_defaulter_amount_due_non_negative') THEN
                    ALTER TABLE fee_defaulters ADD CONSTRAINT chk_fee_defaulter_amount_due_non_negative CHECK (amount_due >= 0);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_fee_defaulter_waiver_non_negative') THEN
                    ALTER TABLE fee_defaulters ADD CONSTRAINT chk_fee_defaulter_waiver_non_negative CHECK (waiver_amount >= 0);
                END IF;
            END $$;
        """))
        await session.commit()
        print("Successfully created/verified fee_defaulters non-negative check constraints!")

        # Also check all tables created
        res_tables = await session.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        tables = [r[0] for r in res_tables.fetchall()]
        print("Existing tables in DB:", sorted(tables))

    # Also run create_all in case new tables like academic_subjects or subject_attendance_entries don't exist yet
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("create_all completed!")

if __name__ == "__main__":
    asyncio.run(main())
