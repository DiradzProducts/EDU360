# -*- coding: utf-8 -*-
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(5845, 5875):
    print(f"{i+1}: {lines[i].rstrip()}")
