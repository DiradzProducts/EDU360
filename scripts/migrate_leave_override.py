import sqlite3
import os

for db_path in ['backend/edu360.db', 'edu360.db']:
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        cur.execute('PRAGMA table_info(leave_requests)')
        lr_cols = [col[1] for col in cur.fetchall()]
        if 'admin_notes' not in lr_cols:
            cur.execute('ALTER TABLE leave_requests ADD COLUMN admin_notes TEXT')
            print(f"Added admin_notes to {db_path}")
        if 'is_admin_override' not in lr_cols:
            cur.execute('ALTER TABLE leave_requests ADD COLUMN is_admin_override BOOLEAN DEFAULT 0')
            print(f"Added is_admin_override to {db_path}")
        if 'overridden_at' not in lr_cols:
            cur.execute('ALTER TABLE leave_requests ADD COLUMN overridden_at DATETIME')
            print(f"Added overridden_at to {db_path}")
        if 'overridden_by' not in lr_cols:
            cur.execute('ALTER TABLE leave_requests ADD COLUMN overridden_by VARCHAR(100)')
            print(f"Added overridden_by to {db_path}")

        cur.execute('PRAGMA table_info(attendance_records)')
        att_cols = [col[1] for col in cur.fetchall()]
        if 'admin_override' not in att_cols:
            cur.execute('ALTER TABLE attendance_records ADD COLUMN admin_override BOOLEAN DEFAULT 0')
            print(f"Added admin_override to {db_path}")
        if 'override_by_role' not in att_cols:
            cur.execute("ALTER TABLE attendance_records ADD COLUMN override_by_role VARCHAR(20) DEFAULT 'NONE'")
            print(f"Added override_by_role to {db_path}")

        try:
            cur.execute('CREATE INDEX IF NOT EXISTS ix_leave_status_applied ON leave_requests (status, applied_at)')
            print(f"Created index ix_leave_status_applied on {db_path}")
        except Exception as e:
            print(f"Index notice on {db_path}: {e}")

        conn.commit()
        conn.close()
        print(f"Migration completed for {db_path} successfully.")
