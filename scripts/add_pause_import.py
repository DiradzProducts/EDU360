# -*- coding: utf-8 -*-
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = "  Play, \n\n  Award, "
replacement = "  Play, \n\n  Pause, \n\n  Award, "

if target in content:
    content = content.replace(target, replacement, 1)
    with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added Pause to lucide-react imports in teacher/page.tsx.")
else:
    print("Target not found.")
