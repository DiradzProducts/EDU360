import urllib.request
import json

base_url = 'http://localhost:8000/api'

def run():
    print("=== Testing Upstream & Downstream Pipeline ===")
    
    # 1. List exams
    req = urllib.request.Request(f'{base_url}/exams?subject=Mathematics')
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"1. Exams found: {len(data.get('exams', []))}")
        for ex in data.get('exams', []):
            print(f"   - Exam {ex['id']}: {ex['title']} (Published: {ex['is_published']})")

    # 2. Check Exam 2 submissions before publishing
    req = urllib.request.Request(f'{base_url}/exams/2/submissions')
    with urllib.request.urlopen(req) as resp:
        subs = json.loads(resp.read().decode())
        print(f"2. Submissions for Exam 2: {len(subs.get('submissions', []))}")
        for s in subs.get('submissions', []):
            print(f"   - Student {s['student_name']}: {s['marks_obtained']}/100 ({s['percentage']}%)")

    # 3. Publish Exam 2
    post_data = json.dumps({'teacher_id': 2, 'notify_parents': True}).encode('utf-8')
    req = urllib.request.Request(f'{base_url}/exams/2/publish', data=post_data, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        pub_res = json.loads(resp.read().decode())
        print(f"3. Publish Response: success={pub_res.get('success')} | Enrolled Count={pub_res.get('remedial_enrolled_count')}")
        for st in pub_res.get('remedial_students', []):
            print(f"   - Auto-Enrolled into Focus Table: {st.get('name')} (Score: {st.get('score_pct')}%)")

    # 4. Student Descriptive Exam Submission
    sub_data = json.dumps({
        'student_id': 3,
        'paper_file_name': 'Rohan_Deshmukh_Math_Descriptive.pdf',
        'paper_file_url': '/samples/math_exam_sample.svg',
        'notes': 'Submitted pages 1 to 4 with complete rough calculations.'
    }).encode('utf-8')
    req = urllib.request.Request(f'{base_url}/exams/2/submit', data=sub_data, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        sub_post_res = json.loads(resp.read().decode())
        print(f"4. Student Descriptive Exam Submission: success={sub_post_res.get('success')} | Submission ID={sub_post_res.get('submission_id')}")

    # 5. WhatsApp Dispatch Test
    wa_data = json.dumps({
        'student_id': 1,
        'student_name': 'Aarav Sharma',
        'parent_phone': '+91 98765 43210',
        'completed_day': 3,
        'verified_concept': 'Algebraic Identities',
        'score_pct': 64.5
    }).encode('utf-8')
    req = urllib.request.Request(f'{base_url}/remedial/dispatch-whatsapp', data=wa_data, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        wa_res = json.loads(resp.read().decode())
        print(f"5. WhatsApp Dispatch: success={wa_res.get('success')} | Receipt: {wa_res.get('receipt_id')} | Status: {wa_res.get('delivery_status')}")

    # 6. Socratic Hint Progression: Attempt 1 -> Attempt 2 (Formula Card) -> Attempt 3 (Teacher Huddle)
    for attempt in [1, 2, 3]:
        hint_req_data = json.dumps({
            'student_id': 1,
            'day_num': 1,
            'question_text': 'Simplify: 4x - (3x - 7)',
            'student_attempt': '4x - 3x - 7 = x - 7',
            'attempt_count': attempt
        }).encode('utf-8')
        req = urllib.request.Request(f'{base_url}/remedial/socratic-hint', data=hint_req_data, headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req) as resp:
            hint_res = json.loads(resp.read().decode())
            has_card = 'formula_card' in hint_res and hint_res['formula_card'] is not None
            flagged = hint_res.get('flagged_for_teacher', False)
            print(f"6. Socratic Hint (Attempt {attempt}): has_formula_card={has_card} | flagged_for_teacher={flagged}")

    # 7. Multimodal AI Rough-Work Pre-Verification
    pre_data = json.dumps({
        'student_id': 1,
        'day_num': 1,
        'rubric_checkpoint': 'Verify +7 sign change in bracket expansion.',
        'student_notes': 'Flipped minus sign to +7 inside brackets before combining like terms.'
    }).encode('utf-8')
    req = urllib.request.Request(f'{base_url}/remedial/pre-verify-rough-work', data=pre_data, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        pre_res = json.loads(resp.read().decode())
        print(f"7. AI Pre-Verification: status={pre_res.get('ai_status')} | confidence={pre_res.get('confidence')} | recommendation={pre_res.get('recommendation')}")

if __name__ == '__main__':
    run()
