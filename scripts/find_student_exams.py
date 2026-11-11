with open('frontend/src/app/student/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if any(k in l for k in ['setIsOnlineExamOpen', 'isOnlineExamOpen', 'onlineExamSubject', 'onlineExamTopic', 'Join Live Exam', 'Start CBT Exam', 'Take Exam', 'CBT']):
        print(f"Line {i+1}: {l.strip()[:100].encode('ascii', errors='replace').decode('ascii')}")
