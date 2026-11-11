import sqlite3

# 1. Update SQLite DBs: set exam_mode = 'MODE_HYBRID_SCAN'
for dbpath in ['backend/edu360.db', 'edu360.db']:
    try:
        conn = sqlite3.connect(dbpath)
        cur = conn.cursor()
        cur.execute("UPDATE exam_schedules SET exam_mode = 'MODE_HYBRID_SCAN'")
        # Also ensure top item is live hybrid math exam for Aarav
        cur.execute("""
            UPDATE exam_schedules 
            SET title = 'Class 8 Mathematics - Term 1 Hybrid Assessment',
                exam_mode = 'MODE_HYBRID_SCAN',
                exam_date = 'Today (Live Session Active)',
                start_time = '09:00 AM',
                end_time = '12:00 PM',
                hall_name = 'Virtual Room A (Camera AI Proctor)',
                chief_invigilator_name = 'Mrs. Ananya Verma',
                academic_clearance = 1
            WHERE id = (SELECT MAX(id) FROM exam_schedules)
        """)
        conn.commit()
        print(f"Updated {dbpath} successfully!")
        cur.execute("SELECT id, title, exam_mode, exam_date FROM exam_schedules")
        print(cur.fetchall())
        conn.close()
    except Exception as e:
        print(f"Error on {dbpath}: {e}")

# 2. Update backend/app/routers/exams.py
with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Change line 812 default from MODE_CBT to MODE_HYBRID_SCAN
text = text.replace(
    '"exam_mode": getattr(s, "exam_mode", "MODE_CBT"),',
    '"exam_mode": getattr(s, "exam_mode", "MODE_HYBRID_SCAN") or "MODE_HYBRID_SCAN",'
)

# Change line 838 default
old_line_838 = 'final_mode = req.exam_mode or ("MODE_CBT" if "Virtual" in final_hall or "AI" in final_hall else "MODE_OFFLINE")'
new_line_838 = 'final_mode = req.exam_mode or "MODE_HYBRID_SCAN"'
if old_line_838 in text:
    text = text.replace(old_line_838, new_line_838)
    print("Updated line 838 default to MODE_HYBRID_SCAN!")

with open('backend/app/routers/exams.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished updating exams router and sqlite databases.")
