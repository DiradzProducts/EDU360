with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'schedules.map' in l or 'filteredSchedules.map' in l:
        print(f"Line {i+1}: {l.strip()[:100]}")
        for j in range(i, min(i+40, len(lines))):
            print(f"  {j+1}: {lines[j].strip()[:110].encode('ascii', errors='replace').decode('ascii')}")
        break
