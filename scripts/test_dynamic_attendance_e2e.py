import sys
import os
import asyncio
from datetime import datetime, date

sys.path.insert(0, os.path.abspath("backend"))

from app.core.database import AsyncSessionLocal, engine
from sqlalchemy import select, text
from app.models.models import AttendanceRecord, Student, LiveClass
import httpx
from main import app

async def run_dynamic_attendance_tests():
    print("=" * 70)
    print("RUNNING E2E INTEGRATION TEST: DYNAMIC STUDENT ATTENDANCE CHECK-IN")
    print("=" * 70)

    # Sync sequences
    async with engine.begin() as conn:
        try:
            await conn.execute(text("SELECT setval(pg_get_serial_sequence('attendance_records', 'id'), COALESCE(MAX(id), 1) + 1, false) FROM attendance_records;"))
        except Exception as e:
            print(f"Sequence sync notice: {e}")

    student_headers = {"X-User-Role": "student", "X-User-Id": "14"}
    teacher_headers = {"X-User-Role": "teacher", "X-User-Id": "2"}

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # ---------------------------------------------------------
        # TEST 1: VERIFY A DIFFERENT STUDENT (NOT STUDENT #1) EXISTS
        # ---------------------------------------------------------
        print("\n[TEST 1] Querying database for a non-default student...")
        async with AsyncSessionLocal() as db:
            st_res = await db.execute(select(Student).where(Student.id != 1).order_by(Student.id.asc()))
            student_obj = st_res.scalars().first()
            assert student_obj is not None, "No alternative student found in students table!"
            target_student_id = student_obj.id
            target_student_name = student_obj.name
            print(f"  ✓ Target Student: ID #{target_student_id} ('{target_student_name}') in {student_obj.class_name}-{student_obj.section}")

        # ---------------------------------------------------------
        # TEST 2: DYNAMIC STUDENT JOINS LIVEKIT ROOM VIA LIVEKIT ROUTER
        # ---------------------------------------------------------
        print(f"\n[TEST 2] Student #{target_student_id} ('{target_student_name}') joins LiveKit room...")
        lk_payload = {
            "room_name": "class-8b-mathematics",
            "student_id": target_student_id,
            "student_name": target_student_name,
            "role": "STUDENT"
        }
        r_lk = await client.post("/api/livekit/rooms/join", json=lk_payload, headers=student_headers)
        assert r_lk.status_code == 200, f"Expected 200, got {r_lk.status_code}: {r_lk.text}"
        lk_data = r_lk.json()
        print(f"  ✓ LiveKit join response received: is_live={lk_data.get('is_live')}, message='{lk_data.get('message')}'")
        room_info = lk_data.get("room", {})
        active_ids = [s["student_id"] for s in room_info.get("active_students", [])]
        waiting_ids = [s["student_id"] for s in room_info.get("waiting_students", [])]
        assert target_student_id in active_ids or target_student_id in waiting_ids, (
            f"Student ID #{target_student_id} was not tracked in active or waiting room participants!"
        )
        print(f"  ✓ Confirmed: LiveKit room tracks Student #{target_student_id} ({target_student_name}) dynamically!")

        # ---------------------------------------------------------
        # TEST 3: STUDENT PORTAL COMMITS ATTENDANCE TO POSTGRES
        # ---------------------------------------------------------
        print(f"\n[TEST 3] Committing attendance check-in for Student #{target_student_id}...")
        # Simulate joining at +5.5 minutes (On-time -> Present)
        join_payload = {
            "student_id": target_student_id,
            "minutes_elapsed": 5.5
        }
        r_att = await client.post("/api/teacher/live-classes/1/simulate-join", json=join_payload, headers=student_headers)
        assert r_att.status_code == 200, f"Expected 200, got {r_att.status_code}: {r_att.text}"
        att_data = r_att.json()
        print(f"  ✓ Attendance API response: status={att_data.get('record', {}).get('status')}, rule='{att_data.get('rule_triggered')}'")
        
        # Verify in database
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(AttendanceRecord).where(
                    AttendanceRecord.class_id == 1,
                    AttendanceRecord.student_id == target_student_id
                )
            )
            rec = result.scalars().first()
            assert rec is not None, f"No AttendanceRecord found in DB for Student #{target_student_id}!"
            assert rec.student_id == target_student_id, f"Expected student_id {target_student_id}, got {rec.student_id}"
            assert rec.student_name == target_student_name, f"Expected student_name '{target_student_name}', got '{rec.student_name}'"
            assert rec.status == "Present", f"Expected Present, got {rec.status}"
            print(f"  ✓ Database record verified: AttendanceRecord #{rec.id} correctly stores Student #{rec.student_id} ('{rec.student_name}') as {rec.status}!")

        # ---------------------------------------------------------
        # TEST 4: TEACHER CLASS ATTENDANCE ROSTER REFLECTS DYNAMIC STUDENT
        # ---------------------------------------------------------
        print("\n[TEST 4] Querying Teacher live class attendance roster...")
        r_roster = await client.get("/api/teacher/live-classes/1/attendance", headers=teacher_headers)
        assert r_roster.status_code == 200, f"Expected 200, got {r_roster.status_code}: {r_roster.text}"
        roster_data = r_roster.json()
        student_ids_in_roster = [r["student_id"] for r in roster_data]
        print(f"  ✓ Roster contains {len(roster_data)} records. Student IDs: {student_ids_in_roster}")
        assert target_student_id in student_ids_in_roster, f"Student #{target_student_id} not found in teacher class roster!"
        print(f"  ✓ Teacher live class attendance roster successfully includes Student #{target_student_id}!")

        # ---------------------------------------------------------
        # TEST 5: SIMULATE LATE JOIN & TEACHER OVERRIDE
        # ---------------------------------------------------------
        print(f"\n[TEST 5] Testing Late Join (>10m stipulation) for Student #{target_student_id}...")
        late_payload = {
            "student_id": target_student_id,
            "minutes_elapsed": 14.5
        }
        r_late = await client.post("/api/teacher/live-classes/1/simulate-join", json=late_payload, headers=student_headers)
        assert r_late.status_code == 200
        late_data = r_late.json()
        assert late_data.get("record", {}).get("status") == "Late"
        record_id = late_data.get("record", {}).get("id")
        print(f"  ✓ Student #{target_student_id} auto-flagged as LATE (+14.5m) in Record #{record_id}.")

        # Teacher overrides to Present
        r_override = await client.post(
            f"/api/teacher/live-classes/1/attendance/{record_id}/override",
            json={"status": "Present"},
            headers=teacher_headers
        )
        assert r_override.status_code == 200
        over_data = r_override.json()
        assert over_data["status"] == "Present"
        assert over_data["teacher_override"] is True
        print(f"  ✓ Teacher successfully approved override for Student #{target_student_id}: status=Present, teacher_override=True.")

    print("\n" + "=" * 70)
    print("ALL DYNAMIC ATTENDANCE TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_dynamic_attendance_tests())
