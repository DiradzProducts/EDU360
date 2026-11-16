# -*- coding: utf-8 -*-
with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(1060, 1150):
    if i < len(lines):
        print(lines[i].rstrip())
