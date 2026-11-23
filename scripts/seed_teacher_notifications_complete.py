import asyncio
import asyncpg
import datetime
import json

NOTIFS_TO_SEED = [
    {
        "recipient_user_id": 2,
        "recipient_role": "teacher",
        "sender_name": "Mr. Rajesh Sharma",
        "sender_role": "parent",
        "title": "Parent Focus Note: Aarav Sharma (Class 8-B)",
        "message": "Focus Table Attention: Aarav struggled with Q7 sign inversions in Worksheet #4. Requested 5-minute review during tomorrow's zero-period.",
        "notification_type": "PARENT_NOTE",
        "priority": "HIGH",
        "is_read": False,
        "action_url": "/teacher?tab=parent_hub",
        "offset_mins": 8,
        "metadata": {"student_id": 1, "student_name": "Aarav Sharma", "class": "8-B", "subject": "Mathematics"}
    },
    {
        "recipient_user_id": 2,
        "recipient_role": "teacher",
        "sender_name": "Mrs. Sunita Iyer",
        "sender_role": "parent",
        "title": "Parent Direct Message: Rohan Iyer (8-B)",
        "message": "Good morning Ma'am, regarding the upcoming science practical evaluation, does Rohan need to bring lab journal volume 2?",
        "notification_type": "PARENT_CHAT",
        "priority": "NORMAL",
        "is_read": False,
        "action_url": "/teacher?tab=parent_hub",
        "offset_mins": 25,
        "metadata": {"student_id": 2, "student_name": "Rohan Iyer", "sender": "Mrs. Sunita Iyer"}
    },
    {
        "recipient_user_id": 2,
        "recipient_role": "teacher",
        "sender_name": "Mr. Rajesh Sharma",
        "sender_role": "parent",
        "title": "Medical Leave Request: Aarav Sharma (Class 8-B)",
        "message": "Leave submitted for 2 days (25-26 Oct) due to viral fever. Doctor prescription attached for homeroom sign-off.",
        "notification_type": "LEAVE_APPLICATION",
        "priority": "HIGH",
        "is_read": False,
        "action_url": "/teacher?tab=attendance",
        "offset_mins": 45,
        "metadata": {"student_id": 1, "student_name": "Aarav Sharma", "days": 2, "reason": "Medical"}
    },
    {
        "recipient_user_id": 2,
        "recipient_role": "teacher",
        "sender_name": "Aarav Sharma",
        "sender_role": "student",
        "title": "Homework Submitted: Worksheet #4 (Class 8-B)",
        "message": "Aarav Sharma submitted Linear Equations in One Variable (Late Submission + Rough Work Scanned).",
        "notification_type": "HOMEWORK_SUBMISSION",
        "priority": "NORMAL",
        "is_read": False,
        "action_url": "/teacher?tab=homework",
        "offset_mins": 60,
        "metadata": {"worksheet_id": 4, "student_id": 1, "status": "PENDING_GRADING"}
    },
    {
        "recipient_user_id": 2,
        "recipient_role": "teacher",
        "sender_name": "Vice Principal Office",
        "sender_role": "admin",
        "title": "Admin Leave Override: Aarav Sharma (Class 8-B)",
        "message": "Administrative override executed for Aarav Sharma medical leave (25 Oct - 26 Oct) approved with exam exemption waiver.",
        "notification_type": "ADMIN_OVERRIDE_ALERT",
        "priority": "URGENT",
        "is_read": False,
        "action_url": "/teacher?tab=attendance",
        "offset_mins": 90,
        "metadata": {"student_id": 1, "approved_by": "Vice Principal", "status": "APPROVED"}
    },
    {
        "recipient_user_id": 2,
        "recipient_role": "teacher",
        "sender_name": "Curriculum Council",
        "sender_role": "admin",
        "title": "Curriculum Lag Alert: Class 8-B Mathematics",
        "message": "Unit 4 (Algebraic Identities) is lagging by 2 curriculum units against term target. Remedial pacing intervention recommended.",
        "notification_type": "PACING_LAG_CRITICAL",
        "priority": "CRITICAL",
        "is_read": False,
        "action_url": "/teacher?tab=classes",
        "offset_mins": 120,
        "metadata": {"class": "8-B", "subject": "Mathematics", "lag_units": 2}
    },
    {
        "recipient_user_id": 2,
        "recipient_role": "teacher",
        "sender_name": "Exam Cell",
        "sender_role": "admin",
        "title": "Invigilation Duty Assigned: Term 1 Midterms",
        "message": "You have been designated Chief Invigilator for Class 8-B Mathematics Midterm on 27 Oct, 09:00 AM - 12:00 PM (Hall A).",
        "notification_type": "DUTY_ASSIGNED",
        "priority": "URGENT",
        "is_read": False,
        "action_url": "/teacher?tab=duties",
        "offset_mins": 180,
        "metadata": {"hall": "Hall A", "date": "2026-10-27", "role": "Chief Invigilator"}
    },
    {
        "recipient_user_id": 2,
        "recipient_role": "teacher",
        "sender_name": "Finance & Bursar Desk",
        "sender_role": "finance",
        "title": "Payslip Released: October 2026 Payroll Batch",
        "message": "Your salary slip for October 2026 has been verified, authorized, and credited to your verified bank account.",
        "notification_type": "PAYROLL_READY",
        "priority": "NORMAL",
        "is_read": False,
        "action_url": "/teacher?tab=my_salary",
        "offset_mins": 240,
        "metadata": {"month": "October 2026", "batch": "PB-2026-10"}
    },
    {
        "recipient_user_id": 2,
        "recipient_role": "teacher",
        "sender_name": "Aarav Sharma",
        "sender_role": "student",
        "title": "Remedial Rough Work Uploaded: Sprint #2 Day 3",
        "message": "Aarav Sharma uploaded handwritten step-by-step corrections for quadratic equation factoring.",
        "notification_type": "REMEDIAL_SUBMISSION",
        "priority": "HIGH",
        "is_read": False,
        "action_url": "/teacher?tab=remedial",
        "offset_mins": 300,
        "metadata": {"student_id": 1, "sprint": 2, "day": 3}
    },
    {
        "recipient_user_id": 2,
        "recipient_role": "teacher",
        "sender_name": "AI Remedial Engine",
        "sender_role": "system",
        "title": "Remedial Sprint #3 Generated (Class 8-B)",
        "message": "Personalized 5-day micro-intervention sprint created for 4 focus table students in Algebra & Geometry.",
        "notification_type": "REMEDIAL_ALERT",
        "priority": "HIGH",
        "is_read": False,
        "action_url": "/teacher?tab=remedial",
        "offset_mins": 360,
        "metadata": {"cohort_size": 4, "target_topic": "Algebra & Geometry"}
    }
]

async def seed():
    conn = await asyncpg.connect("postgresql://postgres:123456789@localhost:5432/edu360")
    print("Connected to PostgreSQL.")

    insert_sql = """
        INSERT INTO notifications (
            recipient_user_id, recipient_role, sender_name, sender_role,
            title, message, notification_type, priority, is_read, action_url,
            created_at, metadata_json
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        );
    """

    now = datetime.datetime.utcnow()
    for item in NOTIFS_TO_SEED:
        ts = now - datetime.timedelta(minutes=item["offset_mins"])
        await conn.execute(
            insert_sql,
            item["recipient_user_id"],
            item["recipient_role"],
            item["sender_name"],
            item["sender_role"],
            item["title"],
            item["message"],
            item["notification_type"],
            item["priority"],
            item["is_read"],
            item["action_url"],
            ts,
            json.dumps(item["metadata"])
        )
        print(f"Inserted: [{item['notification_type']}] {item['title']}")

    total = await conn.fetchval(
        "SELECT count(*) FROM notifications WHERE recipient_user_id = 2;"
    )
    unread = await conn.fetchval(
        "SELECT count(*) FROM notifications WHERE recipient_user_id = 2 AND is_read = false;"
    )
    print(f"\nSeeding complete! Teacher UID 2 now has {total} notifications ({unread} unread).")

    await conn.close()

if __name__ == "__main__":
    asyncio.run(seed())
