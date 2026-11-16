# -*- coding: utf-8 -*-
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "Today's Pending Tasks" in line or "academicTasks.map" in line:
        for j in range(max(0, idx-5), min(len(lines), idx+30)):
            print(f"{j+1}: {lines[j].rstrip().encode('ascii', errors='replace').decode('ascii')}")
        break
