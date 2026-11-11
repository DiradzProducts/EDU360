with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(1443, min(2000, len(lines))):
    if '.map(' in lines[i]:
        print(f"Line {i+1}: {lines[i].strip()[:100]}")
