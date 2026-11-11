import sqlite3
import os

db_paths = ['backend/edu360.db', 'edu360.db']

INITIAL_CANDIDATES = [
    (1, 1, 'Aarav Sharma', '14', 'Class 8', 'B', 'Mathematics', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'normal', 'MODE_CBT', 12.0, 0, 0, None, 1, 0, 0, 0, None, 3600, 'VIRTUAL-EXAM-HALL-A', None, 0, 0, None),
    (2, 2, 'Rohan Deshmukh', '22', 'Class 8', 'B', 'Mathematics', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'critical', 'MODE_CBT', 84.0, 2, 3, 'Multiple Faces', 1, 0, 0, 0, None, 3600, 'VIRTUAL-EXAM-HALL-A', None, 0, 0, '2 mins ago'),
    (3, 3, 'Diya Sen', '09', 'Class 8', 'B', 'Mathematics', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'warning', 'MODE_CBT', 48.0, 1, 1, 'Off-Screen Gaze', 1, 0, 0, 0, None, 3600, 'VIRTUAL-EXAM-HALL-A', None, 0, 0, '4 mins ago'),
    (4, 4, 'Kabir Mehta', '18', 'Class 8', 'B', 'Mathematics', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'uploading', 'MODE_HYBRID_SCAN', 18.0, 0, 0, None, 1, 0, 0, 0, None, 3600, 'VIRTUAL-EXAM-HALL-A', None, 4, 1, 'Scanning script'),
    (5, 5, 'Ananya Rao', '03', 'Class 8', 'B', 'Mathematics', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'normal', 'MODE_CBT', 8.0, 0, 0, None, 1, 0, 0, 0, None, 3600, 'VIRTUAL-EXAM-HALL-A', None, 0, 0, None),
    (6, 6, 'Vikram Joshi', '31', 'Class 8', 'B', 'Mathematics', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'warning', 'MODE_HYBRID_SCAN', 62.0, 1, 2, 'Writing in Scan Window', 1, 0, 0, 0, None, 3600, 'VIRTUAL-EXAM-HALL-A', None, 1, 0, 'Just now'),
    (7, 7, 'Tanvi Patel', '27', 'Class 8', 'B', 'Mathematics', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'completed', 'MODE_HYBRID_SCAN', 5.0, 0, 0, None, 0, 0, 0, 0, None, 0, 'VIRTUAL-EXAM-HALL-A', None, 6, 1, None),
    (8, 8, 'Aditya Nair', '02', 'Class 8', 'B', 'Mathematics', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'normal', 'MODE_CBT', 15.0, 0, 0, None, 1, 0, 0, 0, None, 3600, 'VIRTUAL-EXAM-HALL-A', None, 0, 0, None)
]

for p in db_paths:
    if not os.path.exists(p):
        continue
    conn = sqlite3.connect(p)
    cursor = conn.cursor()
    
    # Create exam_candidate_attempts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS exam_candidate_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER,
        schedule_id INTEGER,
        student_id INTEGER NOT NULL,
        student_name VARCHAR(100) NOT NULL,
        roll_no VARCHAR(30) NOT NULL,
        class_name VARCHAR(30) DEFAULT 'Class 8',
        section VARCHAR(10) DEFAULT 'B',
        subject VARCHAR(50) DEFAULT 'Mathematics',
        avatar VARCHAR(255),
        status VARCHAR(30) DEFAULT 'normal',
        exam_mode VARCHAR(30) DEFAULT 'MODE_CBT',
        suspicion_score FLOAT DEFAULT 0.0,
        strikes INTEGER DEFAULT 0,
        tab_switches INTEGER DEFAULT 0,
        anomaly_type VARCHAR(100),
        camera_active BOOLEAN DEFAULT 1,
        is_paused BOOLEAN DEFAULT 0,
        is_disqualified BOOLEAN DEFAULT 0,
        is_nudged BOOLEAN DEFAULT 0,
        nudge_message VARCHAR(255),
        time_remaining_seconds INTEGER DEFAULT 3600,
        livekit_room_id VARCHAR(100) DEFAULT 'VIRTUAL-EXAM-HALL-A',
        submission_content TEXT,
        script_pages_uploaded INTEGER DEFAULT 0,
        seal_verified BOOLEAN DEFAULT 0,
        last_anomaly_time VARCHAR(50),
        evaluated_marks FLOAT,
        evaluator_remarks TEXT,
        submitted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ''')

    # Create proctor_audit_events table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS proctor_audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attempt_id INTEGER,
        candidate_id INTEGER NOT NULL,
        candidate_name VARCHAR(100) NOT NULL,
        roll_no VARCHAR(30),
        room_id VARCHAR(50) DEFAULT 'VIRTUAL-EXAM-HALL-A',
        event_type VARCHAR(50) NOT NULL,
        confidence FLOAT DEFAULT 0.90,
        strike_assigned BOOLEAN DEFAULT 0,
        suspicion_increment FLOAT DEFAULT 0.0,
        invigilator_notes TEXT,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ''')

    # Seed candidates if empty
    cursor.execute('SELECT COUNT(*) FROM exam_candidate_attempts;')
    count = cursor.fetchone()[0]
    if count == 0:
        cursor.executemany('''
        INSERT INTO exam_candidate_attempts (
            id, student_id, student_name, roll_no, class_name, section, subject, avatar,
            status, exam_mode, suspicion_score, strikes, tab_switches, anomaly_type,
            camera_active, is_paused, is_disqualified, is_nudged, nudge_message,
            time_remaining_seconds, livekit_room_id, submission_content,
            script_pages_uploaded, seal_verified, last_anomaly_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', INITIAL_CANDIDATES)
        print(f"Seeded 8 candidates into {p}")
    else:
        print(f"Candidates already exist in {p} (count={count})")

    conn.commit()
    conn.close()
    print(f"Sync complete for {p}")
