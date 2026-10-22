import sqlite3
conn = sqlite3.connect('edu360.db')
c = conn.cursor()
c.execute("SELECT id, name, email, role, password FROM users WHERE email LIKE '%arjun%'")
print("Arjun users:", c.fetchall())
c.execute("SELECT id, user_id, name, roll_no FROM students WHERE name LIKE '%Arjun%'")
print("Arjun students:", c.fetchall())
conn.close()
