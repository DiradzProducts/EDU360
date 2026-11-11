with open('backend/app/routers/parent.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_code = """    if not fees:
        return [
            FeeMilestone(id=1, student_id=student_id, title="Milestone 1: Term 1 Tuition & Curriculum Fee", amount=35000, due_date="15 Jul 2026", status="Paid", receipt_no="REC-2026-FEE-5821", paid_at="12 Jul 2026, 11:20 AM", payment_method="UPI (Google Pay)"),
            FeeMilestone(id=2, student_id=student_id, title="Milestone 2: Q1 AC Bus Transport & GPS Fee", amount=14500, due_date="15 Jul 2026", status="Paid", receipt_no="REC-2026-FEE-5822", paid_at="15 Jul 2026, 03:40 PM", payment_method="Net Banking (HDFC)"),
            FeeMilestone(id=3, student_id=student_id, title="Milestone 3: STEM Robotics, Composite Lab & Library Fee", amount=12000, due_date="18 Aug 2026", status="Paid", receipt_no="REC-2026-FEE-5823", paid_at="18 Aug 2026, 09:15 AM", payment_method="Debit Card"),
            FeeMilestone(id=4, student_id=student_id, title="Milestone 4: Term 2 Tuition & Infrastructure Fee", amount=35000, due_date="25 Oct 2026", status="Overdue"),
            FeeMilestone(id=5, student_id=student_id, title="Milestone 5: Q2 AC Bus Transport Fee", amount=14500, due_date="10 Nov 2026", status="Upcoming"),
            FeeMilestone(id=6, student_id=student_id, title="Milestone 6: Annual Day, Sports & CBSE Exam Fee", amount=16500, due_date="15 Dec 2026", status="Upcoming"),
        ]"""

new_code = """    if not fees:
        if student_id == 12:
            return [
                FeeMilestone(id=1, student_id=student_id, title="Milestone 1: Term 1 Grade 10 Board Fee & Tuition", amount=42000, due_date="15 Jul 2026", status="Paid", receipt_no="REC-2026-FEE-4011", paid_at="10 Jul 2026, 10:00 AM", payment_method="Net Banking (SBI)"),
                FeeMilestone(id=2, student_id=student_id, title="Milestone 2: Term 2 Grade 10 Board & Lab Fee", amount=42000, due_date="15 Oct 2026", status="Paid", receipt_no="REC-2026-FEE-4012", paid_at="12 Oct 2026, 02:30 PM", payment_method="UPI (PhonePe)"),
                FeeMilestone(id=3, student_id=student_id, title="Milestone 3: Complete Exit & TC Account Clearance", amount=0, due_date="30 Oct 2026", status="Paid", receipt_no="REC-2026-EXIT-CLEAR", paid_at="30 Oct 2026, 11:00 AM", payment_method="Institutional Accounts Clearance")
            ]
        return [
            FeeMilestone(id=1, student_id=student_id, title="Milestone 1: Term 1 Tuition & Curriculum Fee", amount=35000, due_date="15 Jul 2026", status="Paid", receipt_no="REC-2026-FEE-5821", paid_at="12 Jul 2026, 11:20 AM", payment_method="UPI (Google Pay)"),
            FeeMilestone(id=2, student_id=student_id, title="Milestone 2: Q1 AC Bus Transport & GPS Fee", amount=14500, due_date="15 Jul 2026", status="Paid", receipt_no="REC-2026-FEE-5822", paid_at="15 Jul 2026, 03:40 PM", payment_method="Net Banking (HDFC)"),
            FeeMilestone(id=3, student_id=student_id, title="Milestone 3: STEM Robotics, Composite Lab & Library Fee", amount=12000, due_date="18 Aug 2026", status="Paid", receipt_no="REC-2026-FEE-5823", paid_at="18 Aug 2026, 09:15 AM", payment_method="Debit Card"),
            FeeMilestone(id=4, student_id=student_id, title="Milestone 4: Term 2 Tuition & Infrastructure Fee", amount=35000, due_date="25 Oct 2026", status="Overdue"),
            FeeMilestone(id=5, student_id=student_id, title="Milestone 5: Q2 AC Bus Transport Fee", amount=14500, due_date="10 Nov 2026", status="Upcoming"),
            FeeMilestone(id=6, student_id=student_id, title="Milestone 6: Annual Day, Sports & CBSE Exam Fee", amount=16500, due_date="15 Dec 2026", status="Upcoming"),
        ]"""

c_norm = c.replace('\r\n', '\n')
old_norm = old_code.replace('\r\n', '\n')
new_norm = new_code.replace('\r\n', '\n')

assert old_norm in c_norm, "old_code not found in parent.py"
c_norm = c_norm.replace(old_norm, new_norm, 1)

with open('backend/app/routers/parent.py', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("parent.py updated successfully!")
