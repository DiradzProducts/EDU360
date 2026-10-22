import sqlite3

conn = sqlite3.connect('edu360.db')
c = conn.cursor()
tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Tables:", tables)

for t in ['exams', 'exam_submissions', 'remedial_sprints', 'whatsapp_dispatch_logs', 'focus_tables']:
    if t in tables:
        count = c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        print(f"Table {t}: {count} rows")
    else:
        print(f"Table {t}: NOT FOUND")

conn.close()
