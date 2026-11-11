import sqlite3

for db_path in ['backend/edu360.db', 'edu360.db']:
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    cur.execute("UPDATE users SET password = 'Password123' WHERE username IN ('john_student', 'parent_john')")
    con.commit()
    con.close()
print("Updated passwords to Password123 in both databases")
