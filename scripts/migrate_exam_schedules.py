import sqlite3
import os

for db_path in ['backend/edu360.db', 'edu360.db']:
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cols = [c[1] for c in cur.execute('PRAGMA table_info(exam_schedules)').fetchall()]
        print(f'{db_path} existing cols:', cols)
        if 'exam_mode' not in cols:
            cur.execute("ALTER TABLE exam_schedules ADD COLUMN exam_mode VARCHAR(50) DEFAULT 'MODE_CBT'")
            print(f'Added exam_mode to {db_path}')
        if 'section' not in cols:
            cur.execute("ALTER TABLE exam_schedules ADD COLUMN section VARCHAR(20) DEFAULT 'B'")
            print(f'Added section to {db_path}')
        conn.commit()
        conn.close()
    else:
        print(f'{db_path} does not exist')
print('Migration complete!')
