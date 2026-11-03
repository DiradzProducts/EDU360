import sqlite3
import os
import datetime

db_paths = ["backend/edu360.db", "edu360.db"]

for path in db_paths:
    if not os.path.exists(path):
        continue
    print(f"Migrating {path}...")
    conn = sqlite3.connect(path)
    cur = conn.cursor()

    # 1. Update leave_requests
    cur.execute("PRAGMA table_info(leave_requests)")
    cols = [r[1] for r in cur.fetchall()]
    if "is_medical" not in cols:
        cur.execute("ALTER TABLE leave_requests ADD COLUMN is_medical BOOLEAN DEFAULT 0")
        print("  Added is_medical to leave_requests")
    if "attachment_url" not in cols:
        cur.execute("ALTER TABLE leave_requests ADD COLUMN attachment_url TEXT")
        print("  Added attachment_url to leave_requests")
    if "attachment_name" not in cols:
        cur.execute("ALTER TABLE leave_requests ADD COLUMN attachment_name VARCHAR(255)")
        print("  Added attachment_name to leave_requests")
    if "approval_stage" not in cols:
        cur.execute("ALTER TABLE leave_requests ADD COLUMN approval_stage VARCHAR(50) DEFAULT 'Submitted'")
        print("  Added approval_stage to leave_requests")

    # 2. Update report_cards
    cur.execute("PRAGMA table_info(report_cards)")
    rc_cols = [r[1] for r in cur.fetchall()]
    if "parent_signed_at" not in rc_cols:
        cur.execute("ALTER TABLE report_cards ADD COLUMN parent_signed_at DATETIME")
        print("  Added parent_signed_at to report_cards")
    if "parent_signer_name" not in rc_cols:
        cur.execute("ALTER TABLE report_cards ADD COLUMN parent_signer_name VARCHAR(100)")
        print("  Added parent_signer_name to report_cards")
    if "parent_signature_hash" not in rc_cols:
        cur.execute("ALTER TABLE report_cards ADD COLUMN parent_signature_hash VARCHAR(64)")
        print("  Added parent_signature_hash to report_cards")
    if "parent_remarks" not in rc_cols:
        cur.execute("ALTER TABLE report_cards ADD COLUMN parent_remarks TEXT")
        print("  Added parent_remarks to report_cards")

    # 3. Create parent_teacher_messages table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS parent_teacher_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        student_name VARCHAR(100),
        sender_role VARCHAR(20) NOT NULL,
        sender_name VARCHAR(100) NOT NULL,
        receiver_role VARCHAR(20) NOT NULL,
        receiver_name VARCHAR(100) NOT NULL,
        teacher_id INTEGER,
        message_text TEXT NOT NULL,
        attachment_name VARCHAR(255),
        attachment_url TEXT,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(teacher_id) REFERENCES users(id)
    )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS ix_pt_msg_student_created ON parent_teacher_messages(student_id, created_at)")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_pt_msg_unread ON parent_teacher_messages(receiver_role, is_read)")
    print("  Ensured parent_teacher_messages table & indexes.")

    # 4. Check & Seed initial messages for Aarav Sharma
    cur.execute("SELECT COUNT(*) FROM parent_teacher_messages")
    count = cur.fetchone()[0]
    if count == 0:
        now = datetime.datetime.utcnow()
        t1 = (now - datetime.timedelta(days=1, hours=3)).strftime("%Y-%m-%d %H:%M:%S")
        t2 = (now - datetime.timedelta(days=1, hours=1)).strftime("%Y-%m-%d %H:%M:%S")
        t3 = (now - datetime.timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S")

        sample_msgs = [
            # For student_id 1
            (1, "Aarav Sharma", "PARENT", "Rajesh Sharma", "TEACHER", "Mrs. Ananya Verma", None,
             "Hello Mrs. Verma, I noticed the Quadratic Equations note in Aarav's Focus Table. We completed Day 2 factoring problems in his rough notebook yesterday.",
             None, None, 1, t1),
            (1, "Aarav Sharma", "TEACHER", "Mrs. Ananya Verma", "PARENT", "Rajesh Sharma", None,
             "Thank you Mr. Rajesh Sharma! I reviewed his factoring steps in Period 3 today. He understood splitting the middle term well. Day 3 word problems have been assigned.",
             "Day3_Quadratic_Practice.pdf", "/attachments/Day3_Quadratic_Practice.pdf", 0, t2),
            (1, "Aarav Sharma", "PARENT", "Rajesh Sharma", "TEACHER", "Mrs. Ananya Verma", None,
             "Understood, thank you ma'am. Will make sure he finishes the word problem worksheet before evening.",
             None, None, 1, t3),

            # For student_id 6 (matches Aarav Sharma id 6 in SHARMA_CHILDREN array)
            (6, "Aarav Sharma", "PARENT", "Rajesh Sharma", "TEACHER", "Mrs. Ananya Verma", None,
             "Hello Mrs. Verma, I noticed the Quadratic Equations note in Aarav's Focus Table. We completed Day 2 factoring problems in his rough notebook yesterday.",
             None, None, 1, t1),
            (6, "Aarav Sharma", "TEACHER", "Mrs. Ananya Verma", "PARENT", "Rajesh Sharma", None,
             "Thank you Mr. Rajesh Sharma! I reviewed his factoring steps in Period 3 today. He understood splitting the middle term well. Day 3 word problems have been assigned.",
             "Day3_Quadratic_Practice.pdf", "/attachments/Day3_Quadratic_Practice.pdf", 0, t2),
            (6, "Aarav Sharma", "PARENT", "Rajesh Sharma", "TEACHER", "Mrs. Ananya Verma", None,
             "Understood, thank you ma'am. Will make sure he finishes the word problem worksheet before evening.",
             None, None, 1, t3),

            # For student_id 7 (Ananya Sharma)
            (7, "Ananya Sharma", "TEACHER", "Ms. Priya Nair", "PARENT", "Rajesh Sharma", None,
             "Hello Mr. Sharma, Ananya did wonderfully in today's Phonics & Story Magic period! She read 3 phonetic blend cards independently.",
             "Phonics_Star_Certificate.pdf", "/attachments/Phonics_Star_Certificate.pdf", 0, t2)
        ]

        cur.executemany("""
        INSERT INTO parent_teacher_messages 
        (student_id, student_name, sender_role, sender_name, receiver_role, receiver_name, teacher_id, message_text, attachment_name, attachment_url, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_msgs)
        print("  Seeded sample messages successfully.")

    conn.commit()
    conn.close()

print("All migrations finished successfully.")
