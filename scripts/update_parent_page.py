with open('frontend/src/app/parent/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add John Fernandes to SHARMA_CHILDREN
old_children = """    remedialSubject: 'Reading & Phonics',
    remedialDay: 'Day 1 of 5',
    pendingHomeworkCount: 1
  }
];"""

new_children = """    remedialSubject: 'Reading & Phonics',
    remedialDay: 'Day 1 of 5',
    pendingHomeworkCount: 1
  },
  {
    id: 12,
    name: 'John Fernandes',
    className: 'Class 10-A',
    rollNo: 25,
    initials: 'JF',
    tier: 'secondary',
    attendanceStatus: 'Present Today ✓ • Period 4 Computer Science (Lab 2)',
    currentClass: 'Live Virtual Class: Period 4 Active',
    homeroomFaculty: 'Fr. George Varghese',
    remedialSubject: 'Computer Science',
    remedialDay: 'Day 3 of 7',
    pendingHomeworkCount: 0
  }
];"""

c_norm = c.replace('\r\n', '\n')
old_ch_norm = old_children.replace('\r\n', '\n')
new_ch_norm = new_children.replace('\r\n', '\n')

assert old_ch_norm in c_norm, "old_children not found"
c_norm = c_norm.replace(old_ch_norm, new_ch_norm, 1)

# 2. Add DEFAULT_PARENT_FEES_JOHN
old_fees = """const DEFAULT_PARENT_FEES = DEFAULT_PARENT_FEES_AARAV;"""
new_fees = """const DEFAULT_PARENT_FEES_JOHN: FeeMilestone[] = [
  { id: 201, student_id: 12, title: "Milestone 1: Term 1 Grade 10 Board Fee & Tuition", amount: 42000, due_date: "15 Jul 2026", status: "Paid", receipt_no: "REC-2026-FEE-4011", paid_at: "10 Jul 2026, 10:00 AM", payment_method: "Net Banking (SBI)" },
  { id: 202, student_id: 12, title: "Milestone 2: Term 2 Grade 10 Board Examination & Lab Clearance", amount: 42000, due_date: "15 Oct 2026", status: "Paid", receipt_no: "REC-2026-FEE-4012", paid_at: "12 Oct 2026, 02:30 PM", payment_method: "UPI (PhonePe)" }
];

const DEFAULT_PARENT_FEES = DEFAULT_PARENT_FEES_AARAV;"""

old_fees_norm = old_fees.replace('\r\n', '\n')
new_fees_norm = new_fees.replace('\r\n', '\n')

assert old_fees_norm in c_norm, "old_fees not found"
c_norm = c_norm.replace(old_fees_norm, new_fees_norm, 1)

# 3. Update exit clearance loading to only show if clearance matches activeKidId
old_exit_load = """        if (exitsRes && exitsRes.length > 0) {
          const kidClearance = exitsRes.find(e => e.student_id === activeKidId) || exitsRes.find(e => !e.physical_sign_verified || !e.digital_parent_approved) || exitsRes[0];
          setExitClearance(kidClearance);
        }"""

new_exit_load = """        if (exitsRes && exitsRes.length > 0) {
          const kidClearance = exitsRes.find(e => e.student_id === activeKidId);
          setExitClearance(kidClearance || null);
        } else {
          setExitClearance(null);
        }"""

old_el_norm = old_exit_load.replace('\r\n', '\n')
new_el_norm = new_exit_load.replace('\r\n', '\n')

assert old_el_norm in c_norm, "old_exit_load not found"
c_norm = c_norm.replace(old_el_norm, new_el_norm, 1)

# 4. Update fees fallback check for John
old_fee_check = """if (feesRes && feesRes.length > 0) { setFees(feesRes); } else { setFees(activeKidId === 7 ? DEFAULT_PARENT_FEES_ANANYA : DEFAULT_PARENT_FEES_AARAV); }"""
new_fee_check = """if (feesRes && feesRes.length > 0) { setFees(feesRes); } else { setFees(activeKidId === 7 ? DEFAULT_PARENT_FEES_ANANYA : activeKidId === 12 ? DEFAULT_PARENT_FEES_JOHN : DEFAULT_PARENT_FEES_AARAV); }"""

assert old_fee_check in c_norm, "old_fee_check not found"
c_norm = c_norm.replace(old_fee_check, new_fee_check, 1)

# 5. Update handleDigitalSignExit
old_digital_sign = """  const handleDigitalSignExit = async () => {
    await api.parentDigitalSignTC(activeKidId);
    const updatedExits = await api.getExitClearances();
    if (updatedExits && updatedExits.length > 0) {
      const kidClearance = updatedExits.find(e => e.student_id === activeKidId) || updatedExits[0];
      setExitClearance(kidClearance);
    }
    triggerToast('In-app parent digital signature stamped with legal seal');
  };"""

new_digital_sign = """  const handleDigitalSignExit = async () => {
    await api.parentDigitalSignTC(activeKidId);
    const updatedExits = await api.getExitClearances();
    if (updatedExits && updatedExits.length > 0) {
      const kidClearance = updatedExits.find(e => e.student_id === activeKidId);
      setExitClearance(kidClearance || null);
    }
    triggerToast('In-app parent digital signature stamped with legal seal');
  };"""

old_ds_norm = old_digital_sign.replace('\r\n', '\n')
new_ds_norm = new_digital_sign.replace('\r\n', '\n')

assert old_ds_norm in c_norm, "old_digital_sign not found"
c_norm = c_norm.replace(old_ds_norm, new_digital_sign, 1)

with open('frontend/src/app/parent/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("parent/page.tsx updated successfully!")
