import sqlite3

for db_path in ['edu360.db', 'backend/edu360.db']:
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute('PRAGMA table_info(exams)')
        cols = [r[1] for r in cur.fetchall()]
        print(f'=== {db_path} ===')
        columns_to_add = [
            ('exam_mode', "VARCHAR(30) DEFAULT 'MODE_HYBRID_SCAN'"),
            ('duration_minutes', "INTEGER DEFAULT 60"),
            ('question_paper_url', "VARCHAR(500)"),
            ('strictness_profile', "VARCHAR(30) DEFAULT 'STANDARD'"),
            ('status', "VARCHAR(30) DEFAULT 'ACTIVE'")
        ]
        for col_name, col_def in columns_to_add:
            if col_name not in cols:
                print(f'Adding {col_name} to {db_path}...')
                cur.execute(f'ALTER TABLE exams ADD COLUMN {col_name} {col_def}')
        conn.commit()
        cur.execute('PRAGMA table_info(exams)')
        print(f'Updated {db_path} cols count:', len(cur.fetchall()))
        conn.close()
    except Exception as e:
        print(f'Error updating {db_path}:', e)

print('Both database migrations finished!')
