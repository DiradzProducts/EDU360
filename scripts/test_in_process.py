import sys
sys.path.insert(0, 'backend')
import asyncio
from app.core.database import AsyncSessionLocal
from app.routers.parent import apply_student_leave
from app.routers.teacher import review_leave_request, list_teacher_students, get_class_attendance
from app.routers.notifications import get_notifications
from app.schemas.schemas import LeaveRequestCreate, LeaveRequestReview
from app.models.models import LeaveRequest, AttendanceRecord

async def run_test():
    async with AsyncSessionLocal() as db:
        print("--- Step 1: Initial Roster Check ---")
        students = await list_teacher_students(db)
        aarav = next((s for s in students if s["id"] == 1), None)
        print("Initial Aarav:", {
            "name": aarav.get("name"),
            "is_on_leave": aarav.get("is_on_leave"),
            "is_leave_pending": aarav.get("is_leave_pending"),
            "today_attendance_status": aarav.get("today_attendance_status")
        } if aarav else "Not found")

        print("\n--- Step 2: Parent Applies for Leave ---")
        create_req = LeaveRequestCreate(
            student_id=1,
            student_name="Aarav Sharma",
            parent_name="Mr. Rajesh Sharma",
            from_date="2026-11-03",
            to_date="2026-11-04",
            reason="High viral fever 102F. Prescribed 48 hours complete rest by pediatrician.",
            is_medical=True,
            attachment_name="Pediatric_Certificate_Nov2026.pdf",
            attachment_url="/uploads/Pediatric_Certificate_Nov2026.pdf"
        )
        new_lr = await apply_student_leave(create_req, db)
        print(f"LeaveRequest created: ID={new_lr.id}, status={new_lr.status}, stage={new_lr.approval_stage}")

        print("\n--- Step 3: Check Teacher Notifications ---")
        teacher_notifs = await get_notifications(role="TEACHER", db=db)
        latest_t_notif = teacher_notifs["notifications"][0] if teacher_notifs["notifications"] else None
        print("Latest Teacher Notification:", {
            "title": latest_t_notif.get("title"),
            "message": latest_t_notif.get("message"),
            "recipient_role": latest_t_notif.get("recipient_role")
        } if latest_t_notif else "None")
        assert latest_t_notif is not None, "Teacher notification was not created!"
        assert "Aarav Sharma" in latest_t_notif["title"], "Notification title missing student name!"

        print("\n--- Step 4: Check Roster While Leave is Pending ---")
        students_pending = await list_teacher_students(db)
        aarav_pending = next((s for s in students_pending if s["id"] == 1), None)
        print("Aarav Pending State:", {
            "is_on_leave": aarav_pending.get("is_on_leave"),
            "is_leave_pending": aarav_pending.get("is_leave_pending"),
            "today_attendance_status": aarav_pending.get("today_attendance_status"),
            "attendance_flag": aarav_pending.get("attendance_flag"),
            "last_active": aarav_pending.get("last_active")
        })
        assert aarav_pending["is_leave_pending"] is True, "Should flag is_leave_pending=True!"
        assert aarav_pending["today_attendance_status"] == "Leave Pending", "Status should be Leave Pending!"

        print("\n--- Step 5: Teacher Reviews & Approves Leave ---")
        review_req = LeaveRequestReview(
            status="Approved",
            teacher_notes="Leave approved. Medical certificate verified. Attendance marked as Excused Leave."
        )
        approved_lr = await review_leave_request(new_lr.id, review_req, db)
        print(f"LeaveRequest reviewed: ID={approved_lr.id}, status={approved_lr.status}, stage={approved_lr.approval_stage}")
        assert approved_lr.status == "Approved"
        assert approved_lr.approval_stage == "Attendance Adjusted"

        print("\n--- Step 6: Check Parent Notification Dispatched ---")
        parent_notifs = await get_notifications(role="PARENT", db=db)
        latest_p_notif = parent_notifs["notifications"][0] if parent_notifs["notifications"] else None
        print("Latest Parent Notification:", {
            "title": latest_p_notif.get("title"),
            "message": latest_p_notif.get("message"),
            "recipient_role": latest_p_notif.get("recipient_role")
        } if latest_p_notif else "None")
        assert latest_p_notif is not None, "Parent notification was not created!"
        assert "Leave Approved" in latest_p_notif["title"], "Notification title missing Leave Approved!"

        print("\n--- Step 7: Check Attendance Record Synchronized ---")
        att_records = await get_class_attendance(1, db)
        aarav_att = next((a for a in att_records if a.student_id == 1), None)
        print("Aarav Attendance Record:", {
            "status": aarav_att.status,
            "teacher_override": aarav_att.teacher_override,
            "join_timestamp": aarav_att.join_timestamp
        } if aarav_att else "None")
        assert aarav_att is not None, "Attendance record not found for student 1!"
        assert aarav_att.status == "Leave", "Attendance record status must be 'Leave'!"
        assert aarav_att.teacher_override is True, "teacher_override must be True!"

        print("\n--- Step 8: Check Teacher Student Roster Synchronized ---")
        students_approved = await list_teacher_students(db)
        aarav_approved = next((s for s in students_approved if s["id"] == 1), None)
        print("Aarav Approved State in Roster:", {
            "is_on_leave": aarav_approved.get("is_on_leave"),
            "leave_status": aarav_approved.get("leave_status"),
            "today_attendance_status": aarav_approved.get("today_attendance_status"),
            "attendance_flag": aarav_approved.get("attendance_flag"),
            "last_active": aarav_approved.get("last_active")
        })
        assert aarav_approved["is_on_leave"] is True, "is_on_leave must be True!"
        assert aarav_approved["today_attendance_status"] == "Excused Leave", "today_attendance_status must be 'Excused Leave'!"
        assert aarav_approved["attendance_flag"] == "EXCUSED_LEAVE", "attendance_flag must be 'EXCUSED_LEAVE'!"

        print("\n>>> ALL 8 VERIFICATION CHECKS PASSED 100% SUCCESSFULLY! <<<")

if __name__ == "__main__":
    asyncio.run(run_test())
