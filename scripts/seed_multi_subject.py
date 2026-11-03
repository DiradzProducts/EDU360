import sqlite3
import datetime

conn = sqlite3.connect('edu360.db')
c = conn.cursor()

exams = c.execute("SELECT id, subject FROM exams WHERE class_name = 'Class 8' AND section = 'B'").fetchall()
print("Existing Class 8-B exams:", exams)

now = datetime.datetime.utcnow().isoformat()
existing_subjects = [e[1] for e in exams]

new_exams = [
    (4, 'Term 1 Descriptive Examination - General Science', 'General Science', 'Class 8', 'B', 'Term 1', 'descriptive', 100.0, 40.0, 70.0, '16 Oct 2026', 1, now, 1, now, 1, now, now),
    (5, 'Term 1 Descriptive Examination - English Literature', 'English Literature', 'Class 8', 'B', 'Term 1', 'descriptive', 100.0, 40.0, 70.0, '18 Oct 2026', 1, now, 1, now, 1, now, now),
    (6, 'Term 1 Descriptive Examination - Social Science', 'Social Science', 'Class 8', 'B', 'Term 1', 'descriptive', 100.0, 40.0, 70.0, '20 Oct 2026', 1, now, 1, now, 1, now, now),
    (7, 'Term 1 Descriptive Examination - Hindi Second Language', 'Hindi', 'Class 8', 'B', 'Term 1', 'descriptive', 100.0, 40.0, 70.0, '22 Oct 2026', 1, now, 1, now, 1, now, now),
]

for ne in new_exams:
    if ne[2] not in existing_subjects:
        c.execute('''INSERT OR REPLACE INTO exams 
            (id, title, subject, class_name, section, term, exam_type, total_marks, pass_marks, remedial_threshold_pct, exam_date, is_published, published_at, is_moderated, moderated_at, is_locked, locked_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', ne)
        print(f"Added exam: {ne[2]}")

subs = [
    # Aarav Sharma (id=1)
    (101, 4, 1, 'graded', '/samples/sci_paper.pdf', 'Aarav_Science.pdf', now, 78.0, 78.0, 'Solid understanding of cell biology.', now, 2, now),
    (102, 5, 1, 'graded', '/samples/eng_paper.pdf', 'Aarav_English.pdf', now, 84.0, 84.0, 'Fluent writing and strong grammar.', now, 2, now),
    (103, 6, 1, 'graded', '/samples/soc_paper.pdf', 'Aarav_Social.pdf', now, 72.0, 72.0, 'Good map work and historical events.', now, 2, now),
    (104, 7, 1, 'graded', '/samples/hin_paper.pdf', 'Aarav_Hindi.pdf', now, 86.0, 86.0, 'Impressive poetry appreciation.', now, 2, now),
    
    # Kabir Mehta (id=2)
    (105, 4, 2, 'graded', '/samples/sci_paper.pdf', 'Kabir_Science.pdf', now, 68.0, 68.0, 'Needs review on chemical reactions.', now, 2, now),
    (106, 5, 2, 'graded', '/samples/eng_paper.pdf', 'Kabir_English.pdf', now, 74.0, 74.0, 'Good comprehension.', now, 2, now),
    (107, 6, 2, 'graded', '/samples/soc_paper.pdf', 'Kabir_Social.pdf', now, 62.0, 62.0, 'Needs revision in Civics.', now, 2, now),
    (108, 7, 2, 'graded', '/samples/hin_paper.pdf', 'Kabir_Hindi.pdf', now, 70.0, 70.0, 'Average vocabulary.', now, 2, now),

    # Diya Patel (id=3)
    (109, 4, 3, 'graded', '/samples/sci_paper.pdf', 'Diya_Science.pdf', now, 94.0, 94.0, 'Outstanding analytical answers.', now, 2, now),
    (110, 5, 3, 'graded', '/samples/eng_paper.pdf', 'Diya_English.pdf', now, 92.0, 92.0, 'Exemplary essay writing.', now, 2, now),
    (111, 6, 3, 'graded', '/samples/soc_paper.pdf', 'Diya_Social.pdf', now, 95.0, 95.0, 'Comprehensive answers.', now, 2, now),
    (112, 7, 3, 'graded', '/samples/hin_paper.pdf', 'Diya_Hindi.pdf', now, 91.0, 91.0, 'Flawless handwriting and grammar.', now, 2, now),
]

for s in subs:
    c.execute('''INSERT OR REPLACE INTO exam_submissions 
        (id, exam_id, student_id, status, paper_file_url, paper_file_name, submitted_at, marks_obtained, percentage, teacher_feedback, graded_at, graded_by_teacher_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', s)

# Ensure Exam 1 is marked locked and published
c.execute('UPDATE exams SET is_locked = 1, locked_at = ? WHERE id = 1', (now,))

conn.commit()
print('Successfully seeded multi-subject exams and submissions!')
