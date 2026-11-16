# -*- coding: utf-8 -*-
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(9385, 9450):
    print(f"{i+1}: {lines[i].rstrip()}")
