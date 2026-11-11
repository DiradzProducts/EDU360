with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = """        class_name=req.class_name,

        exam_date=req.exam_date,"""

replacement = """        class_name=req.class_name,

        section=req.section or "B",

        exam_mode=req.exam_mode or "MODE_CBT",

        exam_date=req.exam_date,"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open('backend/app/routers/exams.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated author_and_schedule_exam!")
else:
    print("Still not matching target")
