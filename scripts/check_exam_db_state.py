import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath('backend'))

from app.database import get_async_session
from app.models.models import Exam, ExamCandidateAttempt, ExamSubmission, ProctorTelemetryLog
from sqlalchemy import select, func

async def check():
    async for db in get_async_session():
        exams_count = await db.scalar(select(func.count(Exam.id)))
        attempts_count = await db.scalar(select(func.count(ExamCandidateAttempt.id)))
        submissions_count = await db.scalar(select(func.count(ExamSubmission.id)))
        logs_count = await db.scalar(select(func.count(ProctorTelemetryLog.id)))
        print(f"Exams in DB: {exams_count}")
        print(f"Attempts in DB: {attempts_count}")
        print(f"Submissions in DB: {submissions_count}")
        print(f"ProctorTelemetryLogs in DB: {logs_count}")

        if attempts_count > 0:
            res = await db.execute(select(ExamCandidateAttempt).limit(10))
            for a in res.scalars():
                print(f"Attempt: id={a.id}, student_id={a.student_id}, name={a.student_name}, roll={a.roll_no}, strikes={a.strikes}, is_paused={a.is_paused}, status={a.status}, room={a.livekit_room_id}")

        if exams_count > 0:
            res_e = await db.execute(select(Exam).limit(5))
            for e in res_e.scalars():
                print(f"Exam: id={e.id}, title='{e.title}', subject='{e.subject}', class='{e.class_name}', mode='{e.exam_mode}', date='{e.exam_date}', published={e.is_published}")
        break

if __name__ == '__main__':
    asyncio.run(check())
