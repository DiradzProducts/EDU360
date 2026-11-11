import sqlite3

for dbpath in ['backend/edu360.db', 'edu360.db']:
    conn = sqlite3.connect(dbpath)
    cur = conn.cursor()
    cur.execute("UPDATE students SET id = 12 WHERE name = 'John Fernandes'")
    conn.commit()
    cur.execute("SELECT id, name, roll_no, class_name, guardian_name, guardian_email, status FROM students WHERE id = 12")
    print(dbpath, cur.fetchall())
    cur.execute("SELECT id, name, username, email, role FROM users WHERE name LIKE '%Fernandes%'")
    print(' ', cur.fetchall())
    cur.execute("SELECT * FROM exit_clearances")
    print(' exits:', cur.fetchall())
    conn.close()
