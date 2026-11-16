# -*- coding: utf-8 -*-
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(6540, 6630):
    if i < len(lines):
        line = lines[i].rstrip()
        safe_line = line.encode('ascii', errors='replace').decode('ascii')
        print(f"{i+1}: {safe_line}")
