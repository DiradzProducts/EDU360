with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update fallbackStudents line 380:
c = c.replace(
    '{ id: 12, name: "Arjun Singhania", roll_no: "9B-05", class_name: "Class 9", section: "B", admission_no: "ADM-2024-012", guardian_name: "Deepak Singhania", guardian_phone: "+91 98765 43221", guardian_email: "deepak@example.com", attendance_pct: 94.0, academic_average_pct: 71.0, status: "Active" },',
    '{ id: 12, name: "John Fernandes", roll_no: "25", class_name: "Class 10", section: "A", admission_no: "ADM-2024-025", guardian_name: "Mr. Robert Fernandes", guardian_phone: "+91 98999 12345", guardian_email: "robert.fernandes@example.com", attendance_pct: 95.0, academic_average_pct: 86.0, status: "Active" },'
)

# 2. Add fallbackFeesJohn
old_fees_anchor = "let fallbackFees: FeeMilestone[] = ["
new_fees_anchor = """let fallbackFeesJohn: FeeMilestone[] = [
  { id: 201, student_id: 12, title: "Milestone 1: Term 1 Grade 10 Board Fee & Tuition", amount: 42000, due_date: "15 Jul 2026", status: "Paid", receipt_no: "REC-2026-FEE-4011", paid_at: "10 Jul 2026, 10:00 AM", payment_method: "Net Banking (SBI)" },
  { id: 202, student_id: 12, title: "Milestone 2: Term 2 Grade 10 Board Examination & Lab Clearance", amount: 42000, due_date: "15 Oct 2026", status: "Paid", receipt_no: "REC-2026-FEE-4012", paid_at: "12 Oct 2026, 02:30 PM", payment_method: "UPI (PhonePe)" },
  { id: 203, student_id: 12, title: "Milestone 3: Complete Exit & TC Account Clearance", amount: 0, due_date: "30 Oct 2026", status: "Paid", receipt_no: "REC-2026-EXIT-CLEAR", paid_at: "30 Oct 2026, 11:00 AM", payment_method: "Institutional Clearance" }
];

let fallbackFees: FeeMilestone[] = ["""

if 'fallbackFeesJohn' not in c:
    c = c.replace(old_fees_anchor, new_fees_anchor, 1)

# 3. Update getFees in api.ts
old_get_fees = """  getFees: async (studentId: number = 1) => {
    return fetchWithFallback<FeeMilestone[]>(`/api/parent/fees/${studentId}`, undefined, fallbackFees);
  },"""

new_get_fees = """  getFees: async (studentId: number = 1) => {
    const fallback = studentId === 12 ? fallbackFeesJohn : fallbackFees;
    return fetchWithFallback<FeeMilestone[]>(`/api/parent/fees/${studentId}`, undefined, fallback);
  },"""

c = c.replace(old_get_fees, new_get_fees, 1)

with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("frontend/src/lib/api.ts updated successfully!")
