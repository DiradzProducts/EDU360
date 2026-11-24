import sys
import os
sys.path.insert(0, os.path.abspath("backend"))

import asyncio
from app.core.database import AsyncSessionLocal
from app.routers.student import _build_academic_breakdown

async def main():
    async with AsyncSessionLocal() as db:
        res1 = await _build_academic_breakdown(1, db)
        print("Student 1:", res1.student_name, f"Overall: {res1.overall_percentage}%", res1.overall_grade, f"{len(res1.subjects)} subjects")
        for s in res1.subjects:
            print(f"  [{s.grade}] {s.subject}: Avg={s.average_marks}/100, Teacher={s.teacher}, Exams={s.exams_count}")
            for h in s.exam_history:
                print(f"      * {h.exam_title} ({h.term}, {h.exam_date}): {h.marks_obtained}/{h.total_marks} ({h.percentage}%) [{h.grade}]")

        res2 = await _build_academic_breakdown(2, db)
        print("\nStudent 2:", res2.student_name, f"Overall: {res2.overall_percentage}%", res2.overall_grade, f"{len(res2.subjects)} subjects")

if __name__ == "__main__":
    asyncio.run(main())
