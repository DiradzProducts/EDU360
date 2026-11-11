import re

text = open('backend/app/routers/exams.py', encoding='utf-8').read()
for m in re.findall(r'@router\.(get|post|put|delete|patch)\((?:\"|\')([^\"\'\)]+)', text):
    print(f"{m[0].upper():6} {m[1]}")
