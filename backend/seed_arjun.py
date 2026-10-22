import sqlite3

conn = sqlite3.connect('edu360.db')
c = conn.cursor()

# Check if user 23 exists
c.execute("SELECT id FROM users WHERE email='arjun.patel@student.edu360.internal'")
if not c.fetchone():
    c.execute("""
    INSERT INTO users (id, name, email, role, school_code, password, phone, avatar)
    VALUES (23, 'Arjun Patel', 'arjun.patel@student.edu360.internal', 'student', 'EDU-GLOBAL-360', 'student123', '+91 98450 99887', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150')
    """)
    print('Inserted User Arjun Patel (id=23)')

# Check if parent 24 exists
c.execute("SELECT id FROM users WHERE email='suresh.patel@example.com'")
if not c.fetchone():
    c.execute("""
    INSERT INTO users (id, name, email, role, school_code, password, phone, avatar)
    VALUES (24, 'Mr. Suresh Patel', 'suresh.patel@example.com', 'parent', 'EDU-GLOBAL-360', 'parent123', '+91 98450 99887', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')
    """)
    print('Inserted User Suresh Patel (id=24)')

# Check if student 10 exists
c.execute("SELECT id FROM students WHERE id=10 OR name='Arjun Patel'")
if not c.fetchone():
    c.execute("""
    INSERT INTO students (id, user_id, name, roll_no, class_name, section, admission_no, guardian_name, guardian_phone, guardian_email, attendance_pct, bus_route_id, academic_average_pct, status, grade_tier, age)
    VALUES (10, 23, 'Arjun Patel', '07', 'Class 8', 'B', 'EDU-2024-077', 'Mr. Suresh Patel', '+91 98450 99887', 'suresh.patel@example.com', 89.0, 1, 50.0, 'Active', 'secondary', 14)
    """)
    print('Inserted Student Arjun Patel (id=10)')

conn.commit()
conn.close()
print('Done!')
