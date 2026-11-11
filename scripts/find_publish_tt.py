with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'handlePublishTimetableAndHallTickets' in l:
        print(f"Line {i+1}")
        for sub_l in lines[i:min(len(lines), i+30)]:
            print(sub_l.strip().encode('ascii', errors='replace').decode('ascii'))
