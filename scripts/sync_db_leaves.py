import sqlite3
import datetime

for db_path in ['backend/edu360.db', 'edu360.db']:
    print(f"=== Syncing DB: {db_path} ===")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # 1. Update existing Aarav Sharma pending leave request #1 if present
    cur.execute("SELECT id, student_id, status FROM leave_requests WHERE student_id = 1")
    rows = cur.fetchall()
    now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    if not rows:
        cur.execute("""
            INSERT INTO leave_requests (
                student_id, student_name, parent_name, from_date, to_date, reason, status,
                teacher_notes, applied_at, is_medical, attachment_url, attachment_name, approval_stage
            ) VALUES (
                1, 'Aarav Sharma', 'Mr. Rajesh Sharma', '16 Oct 2026', '16 Oct 2026',
                'Orthodontic dental consultation and braces adjustment at Apollo Clinic.',
                'Pending', NULL, ?, 1, '/uploads/Apollo_Dental_Slip.pdf', 'Apollo_Dental_Slip.pdf',
                'Submitted - Pending Teacher Review'
            )
        """, (now_str,))
        print("Inserted default pending leave request for Aarav Sharma.")
    else:
        print(f"Leave requests found for student 1: {rows}")

    # 2. Ensure Teacher notification exists for pending leave
    cur.execute("""
        SELECT id FROM notifications 
        WHERE recipient_role = 'TEACHER' AND notification_type = 'LEAVE_APPLICATION' AND is_read = 0
    """)
    notif_rows = cur.fetchall()
    if not notif_rows:
        cur.execute("""
            INSERT INTO notifications (
                recipient_role, sender_name, sender_role, title, message,
                notification_type, priority, action_url, metadata_json, is_read, created_at
            ) VALUES (
                'TEACHER', 'Mr. Rajesh Sharma', 'PARENT',
                'New Leave Application: Aarav Sharma',
                'Parent Mr. Rajesh Sharma submitted a medical leave request for Aarav Sharma (16 Oct 2026 to 16 Oct 2026): "Orthodontic dental consultation". Action required in Leave Approvals.',
                'LEAVE_APPLICATION', 'HIGH', '/teacher?tab=leave_approvals',
                '{"student_id": 1, "is_medical": true}', 0, ?
            )
        """, (now_str,))
        print("Dispatched Teacher pending leave notification.")
    else:
        print(f"Teacher leave notifications found: {len(notif_rows)}")

    conn.commit()
    conn.close()

print("ALL DB SYNCS COMPLETED SUCCESSFULLY!")
