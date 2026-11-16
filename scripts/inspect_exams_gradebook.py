# -*- coding: utf-8 -*-
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(9348, 9460):
    if i < len(lines):
        print(f"{i+1}: {lines[i].rstrip()}")
