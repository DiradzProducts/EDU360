import asyncio
import sys
import os

sys.path.append(os.path.abspath("backend"))

from app.core.database import engine, Base
from app.models.models import PTMSlot, ProctorTelemetryLog

async def init_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("SUCCESS: Tables verified & created in database.")

if __name__ == "__main__":
    asyncio.run(init_tables())
