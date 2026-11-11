with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    for i, l in enumerate(f):
        if 'activeTab ===' in l and 'exams_gradebook' in l:
            print(f"Line {i+1}: {l.strip()[:100]}")
