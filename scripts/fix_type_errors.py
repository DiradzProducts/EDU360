# 1. Update types.ts to add duration_minutes
with open('frontend/src/lib/types.ts', 'r', encoding='utf-8') as f:
    types_content = f.read()

types_target = "  total_marks?: number;"
types_repl = "  total_marks?: number;\n  duration_minutes?: number;"

if types_target in types_content:
    types_content = types_content.replace(types_target, types_repl, 1)
    with open('frontend/src/lib/types.ts', 'w', encoding='utf-8') as f:
        f.write(types_content)
    print("Updated types.ts with duration_minutes!")
else:
    print("Warning: types_target not found")

# 2. Add ShieldAlert to teacher/page.tsx
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    teacher_content = f.read()

teacher_target = "  ShieldCheck, \n"
teacher_repl = "  ShieldCheck, \n  ShieldAlert,\n"

if teacher_target in teacher_content:
    teacher_content = teacher_content.replace(teacher_target, teacher_repl, 1)
    with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
        f.write(teacher_content)
    print("Added ShieldAlert to teacher/page.tsx imports!")
else:
    print("Warning: teacher_target not found")
