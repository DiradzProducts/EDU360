import sqlite3
import shutil

for db_path in ['backend/edu360.db', 'edu360.db']:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 1. Check student 12
    cur.execute("SELECT id, name, roll_no, class_name, section, status FROM students WHERE id = 12")
    student = cur.fetchone()
    print(f"[{db_path}] Current student:", student)
    
    # Update student status to 'Exit / TC Processing'
    cur.execute("""
        UPDATE students 
        SET status = 'Exit / TC Processing',
            name = 'John Fernandes',
            class_name = 'Class 10',
            section = 'A',
            roll_no = '25',
            guardian_name = 'Mr. Robert Fernandes'
        WHERE id = 12
    """)
    
    # 2. Reset or create Exit Clearance for student 12
    cur.execute("SELECT id, status FROM exit_clearances WHERE student_id = 12")
    ec = cur.fetchone()
    print(f"[{db_path}] Current exit clearance:", ec)
    
    if ec:
        cur.execute("""
            UPDATE exit_clearances
            SET student_name = 'John Fernandes',
                class_name = 'Class 10',
                fee_cleared = 1,
                library_cleared = 1,
                inventory_cleared = 1,
                tc_ready = 1,
                digital_parent_approved = 0,
                digital_approval_timestamp = NULL,
                physical_scan_url = NULL,
                physical_sign_verified = 0,
                status = 'Pending Dual Verification'
            WHERE student_id = 12
        """)
        print(f"[{db_path}] Reset exit clearance id {ec[0]} to 'Pending Dual Verification'")
    else:
        cur.execute("""
            INSERT INTO exit_clearances (
                student_id, student_name, class_name, fee_cleared, library_cleared,
                inventory_cleared, tc_ready, digital_parent_approved, digital_approval_timestamp,
                physical_scan_url, physical_sign_verified, status
            ) VALUES (
                12, 'John Fernandes', 'Class 10', 1, 1, 1, 1, 0, NULL, NULL, 0, 'Pending Dual Verification'
            )
        """)
        print(f"[{db_path}] Inserted new exit clearance for student 12")
        
    # 3. Check Parent user
    cur.execute("SELECT id, username, role FROM users WHERE username = 'parent_john'")
    p_user = cur.fetchone()
    print(f"[{db_path}] Parent user:", p_user)
    
    conn.commit()
    conn.close()

print("John Fernandes has been successfully repopulated and reset for presentation demo!")
