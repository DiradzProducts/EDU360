import sqlite3

for db_path in ['backend/edu360.db', 'edu360.db']:
    print(f"=== DB: {db_path} ===")
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    students = cur.execute("SELECT id, name, class_name, roll_no, status FROM students WHERE id IN (1, 12)").fetchall()
    print("Students:", students)
    users = cur.execute("SELECT id, username, role, name FROM users WHERE id IN (1, 23, 24) OR username LIKE '%john%'").fetchall()
    print("Users:", users)
    clearances = cur.execute("SELECT id, student_id, student_name, class_name, status FROM exit_clearances").fetchall()
    print("Clearances:", clearances)
    con.close()
