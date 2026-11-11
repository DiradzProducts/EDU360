with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(3370, min(3420, len(lines))):
    print(f"{i+1}: {lines[i].strip()[:100].encode('ascii', errors='replace').decode('ascii')}")
