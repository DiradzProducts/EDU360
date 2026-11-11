import sqlite3

for dbpath in ['backend/edu360.db', 'edu360.db']:
    print(f'Populating John Fernandes in {dbpath}...')
    conn = sqlite3.connect(dbpath)
    cur = conn.cursor()

    # Check if John already exists
    cur.execute("SELECT id FROM students WHERE name = 'John Fernandes'")
    existing_student = cur.fetchone()

    if not existing_student:
        # Create user for John Fernandes (student)
        cur.execute("SELECT MAX(id) FROM users")
        max_user_id = cur.fetchone()[0] or 22
        student_user_id = max_user_id + 1
        parent_user_id = max_user_id + 2

        cur.execute("""
            INSERT INTO users (id, name, username, email, role, phone, password, school_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            student_user_id,
            'John Fernandes',
            'john_student',
            'john.fernandes@student.edu360.internal',
            'student',
            '+91 98999 12346',
            'pbkdf2:sha256:dummyhash',
            'OAKRIDGE-HYD-01'
        ))

        cur.execute("""
            INSERT INTO users (id, name, username, email, role, phone, password, school_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            parent_user_id,
            'Mr. Robert Fernandes',
            'parent_john',
            'robert.fernandes@example.com',
            'parent',
            '+91 98999 12345',
            'pbkdf2:sha256:dummyhash',
            'OAKRIDGE-HYD-01'
        ))

        # Create student record
        cur.execute("SELECT MAX(id) FROM students")
        max_student_id = cur.fetchone()[0] or 11
        john_student_id = max_student_id + 1

        cur.execute("""
            INSERT INTO students (
                id, user_id, name, roll_no, class_name, section, admission_no,
                guardian_name, guardian_phone, guardian_email, attendance_pct,
                academic_average_pct, status, grade_tier, age, backlog_count, total_assigned, on_time_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            john_student_id,
            student_user_id,
            'John Fernandes',
            '25',
            'Class 10',
            'A',
            'EDU-2024-110',
            'Mr. Robert Fernandes',
            '+91 98999 12345',
            'robert.fernandes@example.com',
            96.5,
            88.4,
            'Active',
            'secondary',
            15,
            0,
            24,
            24
        ))
        print(f"Inserted student John Fernandes (id: {john_student_id}) and parent Robert Fernandes (user_id: {parent_user_id})")
    else:
        john_student_id = existing_student[0]
        print(f"John Fernandes already exists with ID: {john_student_id}")

    # Remove Aarav Sharma from exit_clearances so Aarav is completely untouched!
    cur.execute("DELETE FROM exit_clearances WHERE student_id = 1")
    # Make sure Karan Malhotra has sample id
    cur.execute("UPDATE exit_clearances SET student_id = 999 WHERE id = 1")

    conn.commit()
    conn.close()
    print("DB sync complete for", dbpath)
