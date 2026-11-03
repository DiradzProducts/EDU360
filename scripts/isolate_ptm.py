import re

# 1. Update frontend/src/lib/api.ts (slot-04 mock data)
with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    api_code = f.read()

old_slot4 = '''    subject_name: "Class 8-B Homeroom & Junior Sibling Consultation",
    is_sibling_combo: true,
    sibling_student_id: 8,
    sibling_student_name: "Aarav Kumar (Class 3-A Junior)",
    meeting_url: "https://meet.google.com/edu-sharma-sibling-ptm",
    focus_table_agenda: [
      "Aarav's 1-Week Remedial Pacing & Zero-period Support",
      "Aarav Junior's Phonics Reading Booster & Magic Chest Stars"
    ]'''

new_slot4 = '''    subject_name: "Mathematics & Class 8-B Homeroom Consultation",
    is_sibling_combo: false,
    meeting_url: "https://meet.google.com/edu-ptm-aarav-8b-term1",
    focus_table_agenda: [
      "Aarav's 1-Week Remedial Pacing & Zero-period Support",
      "Term 1 Mathematics Assessment Review"
    ]'''

if old_slot4 in api_code:
    api_code = api_code.replace(old_slot4, new_slot4, 1)
    with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
        f.write(api_code)
    print("SUCCESS: Updated slot-04 in api.ts")
else:
    print("WARNING: old_slot4 not found in api.ts")

# 2. Update frontend/src/app/parent/page.tsx to pass className and homeroomFaculty
with open('frontend/src/app/parent/page.tsx', 'r', encoding='utf-8') as f:
    parent_code = f.read()

old_parent_ptm = '''            {activeNav === 'ptm_connect' && (
              <ParentPtmView
                studentId={activeKidId}
                studentName={activeKid.name}
              />
            )}'''

new_parent_ptm = '''            {activeNav === 'ptm_connect' && (
              <ParentPtmView
                studentId={activeKidId}
                studentName={activeKid.name}
                className={activeKid.className}
                homeroomFaculty={activeKid.homeroomFaculty}
              />
            )}'''

if old_parent_ptm in parent_code:
    parent_code = parent_code.replace(old_parent_ptm, new_parent_ptm, 1)
    with open('frontend/src/app/parent/page.tsx', 'w', encoding='utf-8') as f:
        f.write(parent_code)
    print("SUCCESS: Updated ParentPtmView props in parent/page.tsx")
else:
    print("WARNING: old_parent_ptm not found in parent/page.tsx")

# 3. Update frontend/src/app/teacher/page.tsx
with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    teacher_code = f.read()

old_teacher_book = '''  const handleBookPTMSlotDirect = async (slotId: string, studentId: number, studentName: string, isSibling: boolean) => {
    const booked = await api.bookPTMSlot({
      slot_id: slotId,
      booked_student_id: studentId,
      booked_student_name: studentName,
      booked_class: "8-B",
      booked_parent_id: "par-01",
      booked_parent_name: "Mr. Rajesh Sharma",
      interaction_scope: "HOMEROOM_CLASS",
      is_sibling_combo: isSibling,
      sibling_student_id: isSibling ? 5 : undefined,
      sibling_student_name: isSibling ? "Kavya Sharma (5-A)" : undefined,
      focus_table_agenda: ["Algebraic Word Problems", "Continuous Remedial Plan"]
    });
    setPtmSlots(prev => prev.map(s => s.id === slotId ? booked : s));
    triggerToast(`Slot ${booked.start_time} confirmed for ${studentName}! Focus Table agenda linked.`);
  };'''

new_teacher_book = '''  const handleBookPTMSlotDirect = async (slotId: string, studentId: number, studentName: string, isSibling: boolean = false) => {
    const booked = await api.bookPTMSlot({
      slot_id: slotId,
      booked_student_id: studentId,
      booked_student_name: studentName,
      booked_class: "8-B",
      booked_parent_id: "par-01",
      booked_parent_name: "Mr. Rajesh Sharma",
      interaction_scope: "HOMEROOM_CLASS",
      is_sibling_combo: false,
      focus_table_agenda: ["Algebraic Word Problems", "Continuous Remedial Plan"]
    });
    setPtmSlots(prev => prev.map(s => s.id === slotId ? booked : s));
    triggerToast(`Atomic 10-min slot ${booked.start_time} confirmed for ${studentName}! Focus Table agenda linked.`);
  };'''

if old_teacher_book in teacher_code:
    teacher_code = teacher_code.replace(old_teacher_book, new_teacher_book, 1)
    with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
        f.write(teacher_code)
    print("SUCCESS: Updated handleBookPTMSlotDirect in teacher/page.tsx")
else:
    print("WARNING: old_teacher_book not found in teacher/page.tsx")
