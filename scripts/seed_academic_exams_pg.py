import asyncio
import os
import asyncpg

async def main():
    conn = await asyncpg.connect("postgresql://postgres:123456789@localhost:5432/edu360")

    senior_subjects = [
        ("Mathematics", "Mrs. Ananya Verma"),
        ("Science (PCB)", "Dr. K. Raman"),
        ("English Communicative", "Ms. Shweta Iyer"),
        ("Social Science", "Mr. P. Roy"),
        ("Hindi Course-B", "Mrs. M. Sharma"),
        ("Information Technology", "Mr. Rajesh K")
    ]

    exam_templates = [
        ("Unit Test 1 (Periodic Assessment I)", "Term 1", 50.0, 18.0, "2026-07-20"),
        ("Mid-Term Examination (Half Yearly)", "Term 1", 100.0, 40.0, "2026-09-22"),
        ("Unit Test 2 (Periodic Assessment II)", "Term 2", 50.0, 18.0, "2026-11-15")
    ]

    created_exams = []
    for subj, teacher in senior_subjects:
        for suffix, term, tot, pass_m, ex_date in exam_templates:
            title = f"{subj} - {suffix}"
            row = await conn.fetchrow("SELECT id FROM exams WHERE title = $1", title)
            if row:
                exam_id = row["id"]
            else:
                exam_id = await conn.fetchval("""
                    INSERT INTO exams (title, subject, class_name, section, term, exam_type, total_marks, pass_marks, remedial_threshold_pct, exam_date, is_published)
                    VALUES ($1, $2, 'Class 8', 'B', $3, 'descriptive', $4, $5, 40.0, $6, TRUE)
                    RETURNING id
                """, title, subj, term, tot, pass_m, ex_date)
            created_exams.append((exam_id, subj, suffix, tot, ex_date))

    student_profiles = {
        1: 0.88, 2: 0.72, 3: 0.94, 4: 0.65, 5: 0.82,
        6: 0.89, 7: 0.60, 8: 0.95, 9: 0.78, 10: 0.84,
        11: 0.91, 12: 0.75, 13: 0.80, 14: 0.85
    }

    subj_diff = {
        "Mathematics": -4.0, "Science (PCB)": 2.0, "English Communicative": 3.0,
        "Social Science": 1.0, "Hindi Course-B": 4.0, "Information Technology": 6.0
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

            sub_row = await conn.fetchrow("SELECT id FROM exam_submissions WHERE exam_id = $1 AND student_id = $2", exam_id, student_id)
            if sub_row:
                await conn.execute("""
                    UPDATE exam_submissions
                    SET marks_obtained = $1, percentage = $2, status = 'graded', teacher_feedback = $3
                    WHERE id = $4
                """, marks, pct, fb, sub_row["id"])
            else:
                await conn.execute("""
                    INSERT INTO exam_submissions (exam_id, student_id, status, marks_obtained, percentage, teacher_feedback)
                    VALUES ($1, $2, 'graded', $3, $4, $5)
                """, exam_id, student_id, marks, pct, fb)

    await conn.close()
    print("PostgreSQL seeded successfully with 18 exams & student submissions across all subjects!")

if __name__ == "__main__":
    asyncio.run(main())
