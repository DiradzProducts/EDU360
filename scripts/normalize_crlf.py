import re

def normalize_file(filepath):
    with open(filepath, 'rb') as f:
        content = f.read()
    # Normalize \r\r\n or \r\n to \n
    normalized = content.replace(b'\r\r\n', b'\n').replace(b'\r\n', b'\n')
    with open(filepath, 'wb') as f:
        f.write(normalized)
    print(f"Normalized {filepath}")

normalize_file('frontend/src/components/proctor/live-invigilator-cockpit.tsx')
normalize_file('frontend/src/app/teacher/page.tsx')
normalize_file('frontend/src/app/exam_coordinator/page.tsx')
normalize_file('backend/app/routers/exams.py')
