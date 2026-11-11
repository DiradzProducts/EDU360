import sqlite3
import os
import datetime

db_paths = ['backend/edu360.db', 'edu360.db']

events = [
    # Candidate 2: Rohan Deshmukh (High Suspicion - 84%)
    (None, 2, 'Rohan Deshmukh', '22', 'VIRTUAL-EXAM-HALL-A', 'ROOM_JOIN', 0.98, 0, 0.0, 'Admitted to room with active camera/mic', '2026-11-05 09:00:15'),
    (None, 2, 'Rohan Deshmukh', '22', 'VIRTUAL-EXAM-HALL-A', 'TAB_SWITCH', 1.0, 0, 15.0, 'Student switched away from browser tab (Incident #1)', '2026-11-05 09:12:40'),
    (None, 2, 'Rohan Deshmukh', '22', 'VIRTUAL-EXAM-HALL-A', 'MULTIPLE_FACES', 0.91, 1, 25.0, 'Edge YOLO: Secondary person detected behind candidate. Strike #1 issued.', '2026-11-05 09:25:10'),
    (None, 2, 'Rohan Deshmukh', '22', 'VIRTUAL-EXAM-HALL-A', 'AUDIO_ANOMALY', 0.85, 0, 15.0, 'Web Audio: Whispering voice detected (>71 dB) for 6 seconds', '2026-11-05 09:28:30'),
    (None, 2, 'Rohan Deshmukh', '22', 'VIRTUAL-EXAM-HALL-A', 'PHONE_DETECTED', 0.93, 1, 25.0, 'Edge YOLO: Cell phone detected on desk surface. Strike #2 issued.', '2026-11-05 09:35:12'),
    (None, 2, 'Rohan Deshmukh', '22', 'VIRTUAL-EXAM-HALL-A', 'PAUSE_EXAM', 1.0, 0, 0.0, 'Invigilator Mrs. Ananya Verma frozen candidate canvas for desk inspection', '2026-11-05 09:36:00'),
    (None, 2, 'Rohan Deshmukh', '22', 'VIRTUAL-EXAM-HALL-A', 'RESUME_EXAM', 1.0, 0, 0.0, 'Invigilator resumed exam after issuing stern warning', '2026-11-05 09:38:30'),

    # Candidate 3: Diya Sen (Caution - 48%)
    (None, 3, 'Diya Sen', '09', 'VIRTUAL-EXAM-HALL-A', 'ROOM_JOIN', 0.99, 0, 0.0, 'Admitted to room with active camera/mic', '2026-11-05 09:00:10'),
    (None, 3, 'Diya Sen', '09', 'VIRTUAL-EXAM-HALL-A', 'OFF_SCREEN_GAZE', 0.82, 1, 20.0, 'Continuous gaze diverted from screen for 9 seconds. Caution Strike #1 issued.', '2026-11-05 09:22:15'),
    (None, 3, 'Diya Sen', '09', 'VIRTUAL-EXAM-HALL-A', 'NUDGE', 1.0, 0, 0.0, 'Invigilator HUD alert sent: "Please keep eyes centered on screen."', '2026-11-05 09:23:05'),
    (None, 3, 'Diya Sen', '09', 'VIRTUAL-EXAM-HALL-A', 'TAB_SWITCH', 1.0, 0, 15.0, 'Alt-tab event logged (Incident #1)', '2026-11-05 09:41:20'),

    # Candidate 1: Aarav Sharma (Clean - 12%)
    (None, 1, 'Aarav Sharma', '14', 'VIRTUAL-EXAM-HALL-A', 'ROOM_JOIN', 0.99, 0, 0.0, 'Admitted to room with active camera/mic', '2026-11-05 09:00:05'),
    (None, 1, 'Aarav Sharma', '14', 'VIRTUAL-EXAM-HALL-A', 'OFF_SCREEN_GAZE', 0.68, 0, 10.0, 'Brief momentary eye saccade off-screen (2 seconds)', '2026-11-05 09:18:22'),
    (None, 1, 'Aarav Sharma', '14', 'VIRTUAL-EXAM-HALL-A', 'EXAM_SUBMIT', 1.0, 0, 0.0, 'Official CBT analytical essay submitted (420 words). Keystrokes verified.', '2026-11-05 09:45:00'),

    # Candidate 6: Vikram Joshi (Scan Window Anomaly - 62%)
    (None, 6, 'Vikram Joshi', '31', 'VIRTUAL-EXAM-HALL-A', 'ROOM_JOIN', 0.98, 0, 0.0, 'Admitted to hybrid scan room', '2026-11-05 09:00:12'),
    (None, 6, 'Vikram Joshi', '31', 'VIRTUAL-EXAM-HALL-A', 'TAB_SWITCH', 1.0, 0, 15.0, 'Tab switch detected during exam', '2026-11-05 09:30:15'),
    (None, 6, 'Vikram Joshi', '31', 'VIRTUAL-EXAM-HALL-A', 'WRITING_IN_SCAN_WINDOW', 0.88, 1, 30.0, 'Pose detection flagged pen movement during 15-min scan window. Strike #1 issued.', '2026-11-05 09:52:10')
]

for p in db_paths:
    if not os.path.exists(p):
        continue
    conn = sqlite3.connect(p)
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM proctor_audit_events;')
    cnt = cur.fetchone()[0]
    if cnt == 0:
        cur.executemany('''
        INSERT INTO proctor_audit_events (
            attempt_id, candidate_id, candidate_name, roll_no, room_id,
            event_type, confidence, strike_assigned, suspicion_increment,
            invigilator_notes, logged_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', events)
        conn.commit()
        print(f"Seeded {len(events)} proctor audit events into {p}")
    else:
        print(f"Audit events already exist in {p} (count={cnt})")
    conn.close()
