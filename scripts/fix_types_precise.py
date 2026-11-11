with open('frontend/src/lib/types.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove the misplaced duration_minutes inside blueprint
text = text.replace("    total_marks?: number;\n  duration_minutes?: number;\n", "    total_marks?: number;\n")

# 2. Add duration_minutes inside ExamScheduleItem
target_sched = "  academic_clearance_notes?: string;\n  exam_mode?: string;\n}"
repl_sched = "  academic_clearance_notes?: string;\n  exam_mode?: string;\n  duration_minutes?: number;\n}"

if target_sched in text:
    text = text.replace(target_sched, repl_sched, 1)
    print("Added duration_minutes to ExamScheduleItem!")
else:
    print("Warning: target_sched not found")

with open('frontend/src/lib/types.ts', 'w', encoding='utf-8') as f:
    f.write(text)
print("Saved types.ts!")
