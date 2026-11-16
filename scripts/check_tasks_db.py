# -*- coding: utf-8 -*-
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.models import AdminTask, ExamSchedule
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(AdminTask))
        tasks = res.scalars().all()
        print(f"Total AdminTasks in DB: {len(tasks)}")
        for t in tasks:
            print(f"ID: {t.id} | Title: {t.title} | Domain: {t.domain} | Category: {t.category} | Assigned: {t.assigned_to}")
            
        print("-" * 50)
        res_sched = await session.execute(select(ExamSchedule))
        scheds = res_sched.scalars().all()
        print(f"Total ExamSchedules in DB: {len(scheds)}")
        for s in scheds:
            print(f"ID: {s.id} | Title: {s.title} | Subject: {s.subject} | Class: {s.class_name} | Invigilator: {s.chief_invigilator_name}")

if __name__ == '__main__':
    asyncio.run(main())
