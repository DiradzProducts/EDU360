# -*- coding: utf-8 -*-
with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('@router.post("/schedules/batch-class")')
if start != -1:
    print(text[start:start+1000])
