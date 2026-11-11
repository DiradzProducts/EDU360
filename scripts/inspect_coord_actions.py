with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if any(k in l for k in ['publishingTimetable', 'setPublishingTimetable', 'handlePublish', 'handleStart', 'Release Hall Tickets', 'Start Exam', 'Launch Cockpit']):
        print(f"Line {i+1}: {l.strip()[:120]}")
