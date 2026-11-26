import sys
import os
import asyncio
from datetime import datetime, date

sys.path.insert(0, os.path.abspath("backend"))

from app.core.database import AsyncSessionLocal, engine
from sqlalchemy import select, text
from app.models.models import Homework, Notification, ExamSchedule
import httpx
from main import app

async def run_homework_and_exam_tests():
    print("=" * 70)
    print("RUNNING E2E INTEGRATION TEST: TEACHER -> STUDENT -> PARENT HOMEWORK FLOW")
    print("=" * 70)

    # Sync sequences
    async with engine.begin() as conn:
        try:
            await conn.execute(text("SELECT setval(pg_get_serial_sequence('homework', 'id'), COALESCE(MAX(id), 1) + 1, false) FROM homework;"))
            await conn.execute(text("SELECT setval(pg_get_serial_sequence('notifications', 'id'), COALESCE(MAX(id), 1) + 1, false) FROM notifications;"))
        except Exception as e:
            print(f"Sequence sync notice: {e}")

    teacher_headers = {"X-User-Role": "teacher", "X-User-Id": "1"}
    student_headers = {"X-User-Role": "student", "X-User-Id": "1"}
    parent_headers = {"X-User-Role": "parent", "X-User-Id": "1"}

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # ---------------------------------------------------------
        # TEST 1: TEACHER ASSIGNS HOMEWORK
        # ---------------------------------------------------------
        print("\n[TEST 1] Teacher assigns new homework via POST /api/teacher/homework...")
        today_str = date.today().isoformat()
        hw_payload = {
            "title": f"Linear Inequalities & Interval Notation [E2E Test {datetime.now().strftime('%H%M%S')}]",
            "subject": "Mathematics",
            "class_name": "Class 8-B",
            "description": "Complete textbook Exercise 3.2 problems 1-10 on interval shading.",
            "task_type": "DAILY_HOMEWORK",
            "due_date": today_str,
            "due_time": "17:00",
            "teacher_id": 1,
            "teacher_name": "Mrs. Ananya Verma",
            "max_marks": 20
        }
        r_create = await client.post("/api/teacher/homework", json=hw_payload, headers=teacher_headers)
        assert r_create.status_code == 200, f"Expected 200, got {r_create.status_code}: {r_create.text}"
        hw_data = r_create.json()
        new_hw_id = hw_data["id"]
        print(f"  ✓ Created Homework ID #{new_hw_id}: '{hw_data['title']}' for {hw_data['class_name']}")

        # ---------------------------------------------------------
        # TEST 2: STUDENT PORTAL SEES HOMEWORK
        # ---------------------------------------------------------
        print("\n[TEST 2] Verifying Student Portal Homework retrieval...")
        r_stud = await client.get(f"/api/student/homework?date={today_str}", headers=student_headers)
        assert r_stud.status_code == 200, f"Expected 200, got {r_stud.status_code}: {r_stud.text}"
        stud_hw_list = r_stud.json()
        found_in_student = any(h["id"] == new_hw_id or h["title"] == hw_payload["title"] for h in stud_hw_list)
        print(f"  ✓ Student homework endpoint returned {len(stud_hw_list)} items for {today_str}.")
        assert found_in_student, "Newly created homework was not found in student's homework endpoint!"
        print(f"  ✓ Newly assigned homework successfully verified in Student workspace!")

        # ---------------------------------------------------------
        # TEST 3: PARENT PORTAL SEES TONIGHT'S VERIFICATION TASK
        # ---------------------------------------------------------
        print("\n[TEST 3] Verifying Parent Portal 'Tonight Verification Tasks'...")
        # Aarav Sharma has student_id = 1
        r_parent = await client.get("/api/parent/today-homework/1", headers=parent_headers)
        assert r_parent.status_code == 200, f"Expected 200, got {r_parent.status_code}: {r_parent.text}"
        parent_hw_list = r_parent.json()
        found_in_parent = any(h["id"] == new_hw_id or h["title"] == hw_payload["title"] for h in parent_hw_list)
        print(f"  ✓ Parent today-homework endpoint returned {len(parent_hw_list)} tasks.")
        assert found_in_parent, "Newly created homework was not found in parent's today-homework endpoint!"
        print(f"  ✓ Newly assigned homework successfully verified in Parent Portal verification task list!")

        # ---------------------------------------------------------
        # TEST 4: NOTIFICATIONS DISPATCHED TO DB
        # ---------------------------------------------------------
        print("\n[TEST 4] Verifying System Notifications for Student Cohort & Parent...")
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Notification)
                .where(Notification.title.ilike(f"%{hw_payload['subject']}%"))
                .order_by(Notification.id.desc())
            )
            notifs = result.scalars().all()
            print(f"  ✓ Found {len(notifs)} relevant notifications for subject '{hw_payload['subject']}'.")
            roles_notified = {n.recipient_role for n in notifs}
            print(f"  ✓ Roles notified: {roles_notified}")
            assert "student" in roles_notified or "parent" in roles_notified, "No student or parent notification was recorded in DB!"

        # ---------------------------------------------------------
        # TEST 5: EXAM SESSION CONCLUSION & DISMISSAL INTEGRITY
        # ---------------------------------------------------------
        print("\n[TEST 5] Verifying Exam Session Conclusion status...")
        r_conclude = await client.post(
            "/api/exams/schedules/1/conclude",
            json={"invigilator_name": "Mrs. Ananya Verma", "invigilator_id": 2},
            headers=teacher_headers
        )
        assert r_conclude.status_code == 200, f"Expected 200, got {r_conclude.status_code}: {r_conclude.text}"
        conclude_data = r_conclude.json()
        print(f"  ✓ Exam Schedule #1 concluded successfully: session_status={conclude_data.get('session_status')}")

        r_stat = await client.get("/api/exams/schedules/1/session-status")
        assert r_stat.status_code == 200
        stat_data = r_stat.json()
        assert stat_data.get("session_status") in ("CONCLUDED", "COMPLETED"), f"Expected CONCLUDED or COMPLETED, got {stat_data.get('session_status')}"
        print(f"  ✓ Exam Schedule #1 authoritative status confirmed: {stat_data.get('session_status')} (Will not pop up for students).")

    print("\n" + "=" * 70)
    print("ALL E2E INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_homework_and_exam_tests())
