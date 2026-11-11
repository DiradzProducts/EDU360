with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Add duration_minutes and total_marks to list_exam_schedules
old_sched_dict = '''                "academic_clearance": s.academic_clearance,
                "academic_clearance_notes": s.academic_clearance_notes,
                "created_at": s.created_at.isoformat() if s.created_at else None'''

new_sched_dict = '''                "duration_minutes": getattr(s, "duration_minutes", 180) or 180,
                "total_marks": 100,
                "academic_clearance": s.academic_clearance,
                "academic_clearance_notes": s.academic_clearance_notes,
                "created_at": s.created_at.isoformat() if s.created_at else None'''

if old_sched_dict in text:
    text = text.replace(old_sched_dict, new_sched_dict, 1)
    print("Added duration_minutes and total_marks to list_exam_schedules in backend!")
else:
    print("Warning: old_sched_dict not found in exams.py")

with open('backend/app/routers/exams.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved exams.py")
