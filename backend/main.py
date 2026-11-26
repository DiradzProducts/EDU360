import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, admin, teacher, parent, student, remedial, exams, notifications, finance, inventory, livekit_router, academic
from app.seed import seed_data

import asyncio
from app.services.backlog_engine import backlog_scheduler_task, BacklogEngine
from app.core.database import AsyncSessionLocal

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is initialized
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed initial data only if database is completely empty
    try:
        from app.models.models import User
        from sqlalchemy import select
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(User).limit(1))
            if not result.scalars().first():
                await seed_data()
    except Exception as e:
        print(f"Seed info: {e}")
    
    # Run immediate backlog scan & start background scheduler (every 15-30 minutes)
    try:
        async with AsyncSessionLocal() as session:
            await BacklogEngine.evaluate_backlogs(session)
    except Exception as e:
        print(f"Initial backlog scan info: {e}")

    worker_task = asyncio.create_task(backlog_scheduler_task(interval_seconds=900))
    yield
    worker_task.cancel()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    description="EDU360 - K-12 Outcomes & Intelligence Platform API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(teacher.router)
app.include_router(parent.router)
app.include_router(student.router)
app.include_router(remedial.router)
app.include_router(exams.router)
app.include_router(notifications.router)
app.include_router(finance.router)
app.include_router(inventory.router)
app.include_router(livekit_router.router)
app.include_router(academic.router)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "mode": "Action & Intelligence Engine Active"
    }

@app.get("/api/system/clock")
async def get_system_clock():
    from app.core.clock import ClockProvider
    return ClockProvider.to_dict()

@app.post("/api/system/clock")
async def set_system_clock(payload: dict):
    from app.core.clock import ClockProvider
    import datetime
    override_val = payload.get("override_iso")
    if not override_val or override_val == "REALTIME":
        ClockProvider.set_override(None)
    else:
        clean_val = override_val.replace("Z", "")
        ClockProvider.set_override(datetime.datetime.fromisoformat(clean_val))
    return ClockProvider.to_dict()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
