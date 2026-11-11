import sqlite3

con = sqlite3.connect('backend/edu360.db')
cur = con.cursor()
cols = [d[0] for d in cur.execute('SELECT * FROM users LIMIT 1').description]
print("Columns:", cols)
rows = cur.execute("SELECT * FROM users WHERE username IN ('john_student', 'parent_john', 'admin')").fetchall()
for r in rows:
    print(dict(zip(cols, r)))
con.close()
