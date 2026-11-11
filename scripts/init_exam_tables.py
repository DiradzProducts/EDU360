import asyncio
import sys
sys.path.insert(0, 'backend')
from app.core.database import engine, Base, AsyncSessionLocal
from app.models.models import ExamCandidateAttempt, ProctorAuditEvent
from sqlalchemy import select

INITIAL_CANDIDATES = [
    {
        "id": 1,
        "student_id": 1,
        "student_name": "Aarav Sharma",
        "roll_no": "14",
        "class_name": "Class 8",
        "section": "B",
        "subject": "Mathematics",
        "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        "status": "normal",
        "suspicion_score": 12.0,
        "strikes": 0,
        "tab_switches": 0,
        "camera_active": True,
        "script_pages_uploaded": 0,
        "seal_verified": False,
        "exam_mode": "MODE_CBT"
    },
    {
        "id": 2,
        "student_id": 2,
        "student_name": "Rohan Deshmukh",
        "roll_no": "22",
        "class_name": "Class 8",
        "section": "B",
        "subject": "Mathematics",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "status": "critical",
        "anomaly_type": "Multiple Faces",
        "suspicion_score": 84.0,
        "strikes": 2,
        "tab_switches": 3,
        "camera_active": True,
        "script_pages_uploaded": 0,
        "seal_verified": False,
        "last_anomaly_time": "2 mins ago",
        "exam_mode": "MODE_CBT"
    },
    {
        "id": 3,
        "student_id": 3,
        "student_name": "Diya Sen",
        "roll_no": "09",
        "class_name": "Class 8",
        "section": "B",
        "subject": "Mathematics",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "status": "warning",
        "anomaly_type": "Off-Screen Gaze",
        "suspicion_score": 48.0,
        "strikes": 1,
        "tab_switches": 1,
        "camera_active": True,
        "script_pages_uploaded": 0,
        "seal_verified": False,
        "last_anomaly_time": "4 mins ago",
        "exam_mode": "MODE_CBT"
    },
    {
        "id": 4,
        "student_id": 4,
        "student_name": "Kabir Mehta",
        "roll_no": "18",
        "class_name": "Class 8",
        "section": "B",
        "subject": "Mathematics",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        "status": "uploading",
        "suspicion_score": 18.0,
        "strikes": 0,
        "tab_switches": 0,
        "camera_active": True,
        "script_pages_uploaded": 4,
        "seal_verified": True,
        "last_anomaly_time": "Scanning script",
        "exam_mode": "MODE_HYBRID_SCAN"
    },
    {
        "id": 5,
        "student_id": 5,
        "student_name": "Ananya Rao",
        "roll_no": "03",
        "class_name": "Class 8",
        "section": "B",
        "subject": "Mathematics",
        "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        "status": "normal",
        "suspicion_score": 8.0,
        "strikes": 0,
        "tab_switches": 0,
        "camera_active": True,
        "script_pages_uploaded": 0,
        "seal_verified": False,
        "exam_mode": "MODE_CBT"
    },
    {
        "id": 6,
        "student_id": 6,
        "student_name": "Vikram Joshi",
        "roll_no": "31",
        "class_name": "Class 8",
        "section": "B",
        "subject": "Mathematics",
        "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        "status": "warning",
        "anomaly_type": "Writing in Scan Window",
        "suspicion_score": 62.0,
        "strikes": 1,
        "tab_switches": 2,
        "camera_active": True,
        "script_pages_uploaded": 1,
        "seal_verified": False,
        "last_anomaly_time": "Just now",
        "exam_mode": "MODE_HYBRID_SCAN"
    },
    {
        "id": 7,
        "student_id": 7,
        "student_name": "Tanvi Patel",
        "roll_no": "27",
        "class_name": "Class 8",
        "section": "B",
        "subject": "Mathematics",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "status": "completed",
        "suspicion_score": 5.0,
        "strikes": 0,
        "tab_switches": 0,
        "camera_active": False,
        "script_pages_uploaded": 6,
        "seal_verified": True,
        "exam_mode": "MODE_HYBRID_SCAN"
    },
    {
        "id": 8,
        "student_id": 8,
        "student_name": "Aditya Nair",
        "roll_no": "02",
        "class_name": "Class 8",
        "section": "B",
        "subject": "Mathematics",
        "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
        "status": "normal",
        "suspicion_score": 15.0,
        "strikes": 0,
        "tab_switches": 0,
        "camera_active": True,
        "script_pages_uploaded": 0,
        "seal_verified": False,
        "exam_mode": "MODE_CBT"
    }
]

async def init_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Schema tables ensured.")

    async with AsyncSessionLocal() as session:
        res = await session.execute(select(ExamCandidateAttempt).limit(1))
        existing = res.scalars().first()
        if not existing:
            for c in INITIAL_CANDIDATES:
                attempt = ExamCandidateAttempt(**c)
                session.add(attempt)
            await session.commit()
            print("Seeded 8 initial exam candidate attempts.")
        else:
            print(f"Exam candidate attempts already present: id={existing.id}")

    await engine.dispose()

if __name__ == '__main__':
    asyncio.run(init_tables())
