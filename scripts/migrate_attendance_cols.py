import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def migrate():
    async with AsyncSessionLocal() as db:
        await db.execute(text("ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS admin_override BOOLEAN DEFAULT FALSE;"))
        await db.execute(text("ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS teacher_override BOOLEAN DEFAULT FALSE;"))
        await db.execute(text("ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS override_by_role VARCHAR(20) DEFAULT 'NONE';"))
        await db.commit()
        print("Done adding attendance_records columns")

if __name__ == "__main__":
    asyncio.run(migrate())
