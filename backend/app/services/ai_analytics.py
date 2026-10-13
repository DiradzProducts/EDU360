import datetime

def evaluate_attendance_rule(minutes_elapsed: float) -> tuple[str, str]:
    """
    10-Minute Auto-Attendance Rule for Online Live Class:
    - 0 to 10 mins: Automatically Marked PRESENT
    - > 10 mins: Flagged as LATE (Pending Teacher Approval)
    - Not joined: ABSENT
    """
    if minutes_elapsed <= 10.0:
        return "Present", "Joined on time within 10-minute window"
    elif minutes_elapsed <= 45.0:
        return "Late", f"Joined {minutes_elapsed:.1f} mins late (>10 mins rule triggered). Teacher approval required."
    else:
        return "Absent", "Did not join session within reasonable time window."

def generate_focus_plan(student_name: str, subject: str, weak_concept: str, current_score: float) -> dict:
    """
    Generates a structured 4-day revision timetable & action plan
    co-shared between Teacher and Parent.
    """
    return {
        "student_name": student_name,
        "subject": subject,
        "weak_concept": weak_concept,
        "current_score_pct": current_score,
        "target_score_pct": 82.0,
        "days": [
            {
                "day": "Day 1 (Mon)",
                "focus": "Core Fundamentals & Concept Mapping",
                "exercise": "Review 15-min interactive concept video and complete 5 foundational formulas.",
                "duration_mins": 25,
                "parent_checklist": "Ensure student watches Chapter 4 summary clip."
            },
            {
                "day": "Day 2 (Tue)",
                "focus": "Step-by-Step Guided Problem Solving",
                "exercise": "Solve 4 quadratic factoring exercises with worksheet self-check.",
                "duration_mins": 30,
                "parent_checklist": "Sign off completed rough notebook page."
            },
            {
                "day": "Day 3 (Wed)",
                "focus": "Error Analysis & Teacher Feedback Review",
                "exercise": "Revisit teacher annotations on Homework #4 and correct mistakes in Q2 & Q4.",
                "duration_mins": 30,
                "parent_checklist": "Verify revised formula sheet."
            },
            {
                "day": "Day 4 (Thu)",
                "focus": "Timed Rapid Self-Assessment",
                "exercise": "Attempt 6-question micro-quiz on EDU360 student portal.",
                "duration_mins": 20,
                "parent_checklist": "Celebrate completion and check mock score."
            }
        ],
        "teacher_strategy": f"Allocate 5 minutes of 1-on-1 breakout doubt-clearing at start of Friday's class for {weak_concept}."
    }
