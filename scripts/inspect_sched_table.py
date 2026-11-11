with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(1620, min(1695, len(lines))):
    print(f"{i+1}: {lines[i].strip()[:110].encode('ascii', errors='replace').decode('ascii')}")
