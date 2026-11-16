# -*- coding: utf-8 -*-
with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_func = False
count = 0
for idx, line in enumerate(lines):
    if '@router.post("/schedules/create")' in line:
        in_func = True
        print(f"=== LINE {idx+1} ===")
    if in_func:
        print(line.rstrip())
        count += 1
        if count > 50:
            break
