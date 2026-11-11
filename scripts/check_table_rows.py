with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(3200, min(3350, len(lines))):
    line = lines[i]
    if any(k in line for k in ['<table', '<tbody', 'sched', 'invigilator', 'Chief', 'Go Live', 'Enter Cockpit', 'status']):
        print(f"{i+1}: {line.strip()[:100].encode('ascii', errors='replace').decode('ascii')}")
