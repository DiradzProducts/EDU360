with open('frontend/src/app/student/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update handleLaunchExam defaults
text = text.replace(
    "duration: number = 20,\n    prompt?: string,\n    maxMarks: number = 20,",
    "duration: number = 180,\n    prompt?: string,\n    maxMarks: number = 100,"
)

# 2. Update active card launch call
text = text.replace(
    "active?.duration_minutes || 60,\n                            prompt,\n                            100,",
    "active?.duration_minutes || 180,\n                            prompt,\n                            100,"
)

with open('frontend/src/app/student/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated duration defaults in student/page.tsx!")
