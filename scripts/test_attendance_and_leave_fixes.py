import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath('backend'))
import httpx
from main import app

async def test_fixes():
    print("=" * 70)
    print("TESTING LEAVE APPROVAL DYNAMIC CLASS & PARENT ABSENCE NOTIFICATIONS")
    print("=" * 70)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        teacher_headers = {"X-User-Role": "teacher", "X-User-Id": "2"}
        parent_headers = {"X-User-Role": "parent", "X-User-Id": "3"}

        # 1. Test Leave Request Review Updates Attendance Dynamically (Bug 1)
        print("\n[Test 1] Reviewing student leave application...")
        # Submit a fresh parent leave request for testing
        fresh_leave_payload = {
            "student_id": 1,
            "student_name": "Aarav Sharma",
            "parent_name": "Ramesh Sharma",
            "from_date": "2026-11-25",
            "to_date": "2026-11-26",
            "reason": "Family function and travel.",
            "is_medical": False
        }
        create_lr_res = await client.post("/api/parent/leave-requests", json=fresh_leave_payload, headers=parent_headers)
        assert create_lr_res.status_code == 200, f"Parent leave submission failed: {create_lr_res.text}"
        new_leave = create_lr_res.json()
        leave_id = new_leave["id"]
        print(f"  ✓ Fresh leave #{leave_id} created by parent.")

        review_res = await client.post(
            f"/api/teacher/leave-requests/{leave_id}/review",
            json={"status": "Approved", "teacher_notes": "Approved by homeroom faculty."},
            headers=teacher_headers
        )
        assert review_res.status_code == 200, f"Leave review failed: {review_res.text}"
        print(f"  ✓ Leave #{leave_id} approved successfully by teacher.")

        # Check class roster
        roster_res = await client.get("/api/teacher/students", headers=teacher_headers)
        assert roster_res.status_code == 200, f"Roster failed {roster_res.status_code}: {roster_res.text}"
        roster = roster_res.json()
        st_entry = next((s for s in roster if s["id"] == 1), None)
        assert st_entry is not None, "Student not found in roster"
        print(f"  ✓ Student #1 in roster has status: {st_entry['today_attendance_status']} (is_on_leave={st_entry['is_on_leave']})")
        assert st_entry["is_on_leave"] is True or st_entry["today_attendance_status"] == "Excused Leave"

        # 2. Test Morning Roll Call Absence Dispatches Parent Notification (Bug 2)
        print("\n[Test 2] Overriding student attendance to Absent...")
        # Mark student 1 attendance as Absent
        att_override_res = await client.post(
            "/api/teacher/live-classes/1/attendance/1/override",
            json={"status": "Absent"},
            headers=teacher_headers
        )
        assert att_override_res.status_code == 200, f"Attendance override failed: {att_override_res.text}"
        print("  ✓ Live class attendance record overridden to Absent.")

        # Check Parent Notifications
        notif_res = await client.get("/api/notifications?role=parent", headers=parent_headers)
        assert notif_res.status_code == 200
        parent_notifs = notif_res.json().get("notifications", [])
        absence_notif = next((n for n in parent_notifs if n.get("notification_type") == "STUDENT_ABSENT" and "Morning Roll Call" in n.get("title", "")), None)
        assert absence_notif is not None, f"Absence notification not found in parent feed: {parent_notifs[:2]}"
        print(f"  ✓ Parent received absence notification: '{absence_notif['title']}' -> '{absence_notif['message']}'")

        # 3. Test Period-Wise Attendance Absence Dispatches Parent Notification
        print("\n[Test 3] Marking period-wise attendance with Absent student...")
        period_payload = {
            "subject_code": "MATH-801",
            "class_name": "Class 8",
            "section": "B",
            "period_no": 2,
            "session_date": "2026-11-25",
            "time_slot": "09:30 AM - 10:15 AM",
            "topic_covered": "Linear Equations Drill",
            "records": [
                {
                    "student_id": 2,
                    "status": "Absent",
                    "elapsed_minutes": 0.0,
                    "note": "Unexcused absence during period 2"
                },
                {
                    "student_id": 1,
                    "status": "Present",
                    "elapsed_minutes": 2.0,
                    "note": "On time"
                }
            ]
        }
        period_res = await client.post("/api/teacher/attendance/mark-period", json=period_payload, headers=teacher_headers)
        assert period_res.status_code == 200, f"Period attendance marking failed: {period_res.text}"
        print("  ✓ Period 2 attendance successfully recorded.")

        # Check Parent Notifications for Period Absence
        notif_res2 = await client.get("/api/notifications?role=parent", headers=parent_headers)
        parent_notifs2 = notif_res2.json().get("notifications", [])
        period_absence_notif = next((n for n in parent_notifs2 if n.get("notification_type") == "STUDENT_ABSENT" and "Period 2" in n.get("title", "")), None)
        assert period_absence_notif is not None, "Period absence notification not found in parent feed"
        print(f"  ✓ Parent received period absence notification: '{period_absence_notif['title']}' -> '{period_absence_notif['message']}'")

        # 4. Test Student Punctuality Ledger Endpoint (Parental Evidence)
        print("\n[Test 4] Querying punctuality ledger for student...")
        ledger_res = await client.get("/api/student/1/punctuality-ledger", headers=parent_headers)
        assert ledger_res.status_code == 200, f"Punctuality ledger failed: {ledger_res.text}"
        ledger = ledger_res.json()
        print(f"  ✓ Punctuality ledger returned compliance: {ledger.get('punctuality_compliance_pct')}% across {len(ledger.get('subjects', []))} subjects.")

    print("\n" + "=" * 70)
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_fixes())
