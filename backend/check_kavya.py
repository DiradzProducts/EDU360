import sqlite3

for db in ['backend/edu360.db', 'edu360.db']:
    conn = sqlite3.connect(db)
    cur = conn.cursor()
    cur.execute("SELECT id, name, class_name, section, roll_no, user_id, guardian_name, guardian_phone FROM students WHERE name LIKE '%Kavya%'")
    print(db, 'students:', cur.fetchall())
    cur.execute("SELECT id, name, username, role, phone FROM users WHERE name LIKE '%Kavya%' OR name LIKE '%Niranjan%' OR username LIKE '%kavya%'")
    print(db, 'users:', cur.fetchall())
    cur.execute("SELECT id, student_name, stage, notes FROM admission_enquiries WHERE student_name LIKE '%Kavya%'")
    print(db, 'enquiries:', cur.fetchall())
    conn.close()
