import sqlite3

for dbpath in ['backend/edu360.db', 'edu360.db']:
    print(f'=== DB: {dbpath}')
    conn = sqlite3.connect(dbpath)
    cur = conn.cursor()
    cur.execute("SELECT id, user_id, name, roll_no, class_name, section, admission_no, guardian_name, guardian_email, status FROM students")
    print('students:')
    for r in cur.fetchall():
        print(' ', r)
    cur.execute("SELECT id, name, username, email, role, phone FROM users")
    print('users:')
    for r in cur.fetchall():
        print(' ', r)
