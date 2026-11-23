import sqlite3
import datetime

def seed_sqlite():
    conn = sqlite3.connect("edu360.db")
    c = conn.cursor()

    senior_subjects = [
        ("Mathematics", "Mrs. Ananya Verma"),
        ("Science (PCB)", "Dr. K. Raman"),
        ("English Communicative", "Ms. Shweta Iyer"),
        ("Social Science", "Mr. P. Roy"),
        ("Hindi Course-B", "Mrs. M. Sharma"),
        ("Information Technology", "Mr. Rajesh K")
    ]

    exam_templates = [
        # (title_suffix, term, total_marks, pass_marks, exam_date)
        ("Unit Test 1 (Periodic Assessment I)", "Term 1", 50.0, 18.0, "2026-07-20"),
        ("Mid-Term Examination (Half Yearly)", "Term 1", 100.0, 40.0, "2026-09-22"),
        ("Unit Test 2 (Periodic Assessment II)", "Term 2", 50.0, 18.0, "2026-11-15")
    ]

    created_exams = []
    for subj, teacher in senior_subjects:
        for suffix, term, tot, pass_m, ex_date in exam_templates:
            title = f"{subj} - {suffix}"
            c.execute("SELECT id FROM exams WHERE title = ?", (title,))
            row = c.fetchone()
            if row:
                exam_id = row[0]
            else:
                c.execute("""
                    INSERT INTO exams (title, subject, class_name, section, term, exam_type, total_marks, pass_marks, remedial_threshold_pct, exam_date, is_published)
                    VALUES (?, ?, 'Class 8', 'B', ?, 'descriptive', ?, ?, 40.0, ?, 1)
                """, (title, subj, term, tot, pass_m, ex_date))
                exam_id = c.lastrowid
            created_exams.append((exam_id, subj, suffix, tot, ex_date))

    student_profiles = {
        1: 0.88,  # Aarav Sharma - ~88%
        2: 0.72,  # Kabir Mehta - ~72%
        3: 0.94,  # Diya Patel - ~94%
        4: 0.65,  # Siddharth Verma - ~65%
        5: 0.82,  # Rohan Iyer - ~82%
        6: 0.89,  # Ananya Gupta - ~89%
        7: 0.60,  # Aditya Roy - ~60%
        8: 0.95,  # Aarav Kumar - ~95%
        9: 0.78,  # Siddharth Rao - ~78%
        10: 0.84, # Rohan Verma - ~84%
        11: 0.91, # Priya Menon - ~91%
        12: 0.75, # John Fernandes - ~75%
        13: 0.80, # Durga - ~80%
        14: 0.85  # Kavya - ~85%
    }

    subj_diff = {
        "Mathematics": -4.0,
        "Science (PCB)": 2.0,
        "English Communicative": 3.0,
        "Social Science": 1.0,
        "Hindi Course-B": 4.0,
        "Information Technology": 6.0
    }

    progression = {
        "Unit Test 1 (Periodic Assessment I)": -3.0,
        "Mid-Term Examination (Half Yearly)": 0.0,
        "Unit Test 2 (Periodic Assessment II)": 4.0
    }

    feedback_map = {
        "Mathematics": [
            "Good procedural logic in polynomial factorization. Pay attention to negative sign distribution.",
            "Strong algebraic derivation and geometry proofs. Step presentation is top tier.",
            "Consistent calculation accuracy. Speed in trigonometry word problems improved."
        ],
        "Science (PCB)": [
            "Clear labeled ray diagrams in Optics. Concise definition of laws of refraction.",
            "Excellent understanding of chemical reactions and balancing equations.",
            "Accurate experimental observations and structured scientific terminology."
        ],
        "English Communicative": [
            "Good reading comprehension; vocabulary choices in formal letter writing are crisp.",
            "Strong critical analysis of poetic imagery and theme summary.",
            "Grammar usage and punctuation are spot-on. Engaging essay structure."
        ],
        "Social Science": [
            "Detailed map pointing skills. Chronological sequencing in modern history is accurate.",
            "Well-argued answers on democratic rights and constitutional provisions.",
            "Good conceptual clarity in economic geography and resources distribution."
        ],
        "Hindi Course-B": [
            "Very good handwriting, grammar structure, and sandhi-vichhed accuracy.",
            "Expressive descriptive writing and correct idioms application.",
            "Thoughtful interpretation of dohas with strong contextual vocabulary."
        ],
        "Information Technology": [
            "Proficient in HTML5 markup and CSS styling rules. Well indented code.",
            "Demonstrated clear understanding of database normalization and SQL queries.",
            "Excellent hands-on practical execution and cyber security awareness."
        ]
    }

    for student_id, base_pct in student_profiles.items():
        for exam_id, subj, suffix, tot, ex_date in created_exams:
            diff = subj_diff.get(subj, 0.0)
            prog = progression.get(suffix, 0.0)
            variance = ((student_id * 7 + exam_id * 13) % 7) - 3.0
            computed_pct = max(35.0, min(99.0, (base_pct * 100.0) + diff + prog + variance))
            marks = round((computed_pct / 100.0) * tot, 1)
            pct = round((marks / tot) * 100.0, 1)

            f_idx = 0 if "Unit Test 1" in suffix else (1 if "Mid-Term" in suffix else 2)
            fb_list = feedback_map.get(subj, ["Good overall performance."])
            fb = fb_list[f_idx % len(fb_list)]

            c.execute("SELECT id FROM exam_submissions WHERE exam_id = ? AND student_id = ?", (exam_id, student_id))
            sub_row = c.fetchone()
            if sub_row:
                c.execute("""
                    UPDATE exam_submissions
                    SET marks_obtained = ?, percentage = ?, status = 'graded', teacher_feedback = ?, submitted_at = ?
                    WHERE id = ?
                """, (marks, pct, fb, ex_date + " 10:00:00", sub_row[0]))
            else:
                c.execute("""
                    INSERT INTO exam_submissions (exam_id, student_id, status, marks_obtained, percentage, teacher_feedback, submitted_at)
                    VALUES (?, ?, 'graded', ?, ?, ?, ?)
                """, (exam_id, student_id, marks, pct, fb, ex_date + " 10:00:00"))

    conn.commit()
    conn.close()
    print("SQLite seeded successfully with 18 exams & student submissions across all subjects!")

if __name__ == "__main__":
    seed_sqlite()
