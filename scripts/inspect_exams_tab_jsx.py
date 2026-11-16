# -*- coding: utf-8 -*-
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "activeTab === 'exams'" in line:
        for j in range(idx, min(len(lines), idx+60)):
            print(f"{j+1}: {lines[j].rstrip()}")
        break
