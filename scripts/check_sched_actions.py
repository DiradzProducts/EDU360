with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(3300, min(3370, len(lines))):
    print(f"{i+1}: {lines[i].strip()[:100].encode('ascii', errors='replace').decode('ascii')}")
