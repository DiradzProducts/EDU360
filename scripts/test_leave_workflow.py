import sys
sys.path.insert(0, 'backend')
import asyncio
from httpx import AsyncClient, ASGITransport
from main import app

async def main():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        print("1. Testing GET /api/teacher/students...")
        res = await ac.get("/api/teacher/students")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        students = res.json()
        print(f"Retrieved {len(students)} students.")
        aarav = next((s for s in students if s["id"] == 1), None)
        print("Aarav status:", {
            "name": aarav.get("name"),
            "is_on_leave": aarav.get("is_on_leave"),
            "is_leave_pending": aarav.get("is_leave_pending"),
            "today_attendance_status": aarav.get("today_attendance_status")
        } if aarav else "Not found")

        print("\n2. Testing POST /api/parent/leave-requests...")
        leave_payload = {
            "student_id": 1,
            "student_name": "Aarav Sharma",
            "parent_name": "Mr. Rajesh Sharma",
            "from_date": "2026-11-03",
            "to_date": "2026-11-04",
            "reason": "High viral fever, doctor ordered 48-hour quarantine bed rest.",
            "is_medical": True,
            "attachment_name": "Dr_Gupta_Prescription_Nov2026.pdf",
            "attachment_url": "/uploads/Dr_Gupta_Prescription_Nov2026.pdf"
        }
        res = await ac.post("/api/parent/leave-requests", json=leave_payload)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        created_lr = res.json()
        lr_id = created_lr["id"]
        print(f"Created leave request #{lr_id}: status={created_lr.get('status')}, stage={created_lr.get('approval_stage')}")

        print("\n3. Testing GET /api/notifications for TEACHER role...")
        res = await ac.get("/api/notifications?role=TEACHER")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        notifs = res.json().get("notifications", [])
        teacher_notif = next((n for n in notifs if "Aarav Sharma" in n.get("title", "") or "Aarav Sharma" in n.get("message", "")), None)
        assert teacher_notif is not None, "Teacher notification for Aarav's leave was NOT found!"
        print(f"Found teacher notification: '{teacher_notif.get('title')}' -> {teacher_notif.get('message')}")

        print("\n4. Testing POST /api/teacher/leave-requests/{id}/review (APPROVE)...")
        res = await ac.post(f"/api/teacher/leave-requests/{lr_id}/review", json={
            "status": "Approved",
            "teacher_notes": "Approved medical rest. Attendance marked Excused Leave."
        })
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        reviewed_lr = res.json()
        print(f"Reviewed leave request #{lr_id}: status={reviewed_lr.get('status')}, stage={reviewed_lr.get('approval_stage')}")

        print("\n5. Checking student roster /api/teacher/students reflection...")
        res = await ac.get("/api/teacher/students")
        assert res.status_code == 200
        students_after = res.json()
        aarav_after = next((s for s in students_after if s["id"] == 1), None)
        print("Aarav updated roster state:", {
            "name": aarav_after.get("name"),
            "is_on_leave": aarav_after.get("is_on_leave"),
            "leave_status": aarav_after.get("leave_status"),
            "today_attendance_status": aarav_after.get("today_attendance_status"),
            "attendance_flag": aarav_after.get("attendance_flag"),
            "last_active": aarav_after.get("last_active")
        } if aarav_after else "Not found")
        assert aarav_after.get("is_on_leave") is True, "Aarav should be on leave!"
        assert aarav_after.get("today_attendance_status") == "Excused Leave", "Aarav attendance status should be Excused Leave!"

        print("\n6. Checking attendance record in live class 1...")
        res = await ac.get("/api/teacher/live-classes/1/attendance")
        assert res.status_code == 200
        att_records = res.json()
        aarav_att = next((a for a in att_records if a["student_id"] == 1), None)
        print("Aarav attendance record in class 1:", aarav_att)
        assert aarav_att is not None and aarav_att["status"] == "Leave", "Aarav attendance record status must be 'Leave'!"

        print("\n7. Testing GET /api/notifications for PARENT role...")
        res = await ac.get("/api/notifications?role=PARENT")
        assert res.status_code == 200
        parent_notifs = res.json().get("notifications", [])
        parent_notif = next((n for n in parent_notifs if "Leave Approved" in n.get("title", "") and "Aarav Sharma" in n.get("title", "")), None)
        assert parent_notif is not None, "Parent notification for leave approval was NOT found!"
        print(f"Found parent approval notification: '{parent_notif.get('title')}' -> {parent_notif.get('message')}")

        print("\nALL WORKFLOW CHECKS PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(main())
