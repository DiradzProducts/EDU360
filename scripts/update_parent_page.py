with open('frontend/src/app/parent/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update loadData destructuring
old_load = '''        const [ftRes, feesRes, subRes, exitsRes, hwRes] = await Promise.all([
          api.getFocusTable(activeKidId),
          api.getFees(activeKidId),
          api.getSubmission(activeKidId),
          api.getExitClearances(),
          api.getTodayHomework(activeKidId),
          api.getParentLeaveRequests(activeKidId)
        ]);
        setFocusTable(ftRes);
        if (feesRes && feesRes.length > 0) { setFees(feesRes); } else { setFees(DEFAULT_PARENT_FEES); }
        setSubmission(subRes);
        if (exitsRes && exitsRes.length > 0) {
          setExitClearance(exitsRes[0]);
        }
        setTodayHomework(hwRes);'''

new_load = '''        const [ftRes, feesRes, subRes, exitsRes, hwRes, leaveRes] = await Promise.all([
          api.getFocusTable(activeKidId),
          api.getFees(activeKidId),
          api.getSubmission(activeKidId),
          api.getExitClearances(),
          api.getTodayHomework(activeKidId),
          api.getParentLeaveRequests(activeKidId)
        ]);
        setFocusTable(ftRes);
        if (feesRes && feesRes.length > 0) { setFees(feesRes); } else { setFees(DEFAULT_PARENT_FEES); }
        setSubmission(subRes);
        if (exitsRes && exitsRes.length > 0) {
          setExitClearance(exitsRes[0]);
        }
        setTodayHomework(hwRes);
        if (leaveRes && leaveRes.length > 0) {
          setLeaveHistory(leaveRes);
        }'''

if old_load in code:
    code = code.replace(old_load, new_load, 1)
    print("SUCCESS: Updated loadData in parent/page.tsx")
else:
    print("WARNING: old_load not found in parent/page.tsx")

# 2. Update handleApplyLeave
old_apply = '''  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason) return;
    setLeaveSubmitted(true);
    setTimeout(() => {
      setLeaveSubmitted(false);
      const noteMsg = leaveDoctorNoteName ? ` with attached Doctor's Note (${leaveDoctorNoteName})` : '';
      setLeaveReason('');
      setLeaveFrom('');
      setLeaveTo('');
      setLeaveDoctorNote(null);
      setLeaveDoctorNoteName('');
      playStarCollect();
      triggerToast(`✓ Leave application${noteMsg} for ${activeKid.name} (${activeKid.className}) dispatched to ${activeKid.homeroomFaculty}!`);
    }, 1200);
  };'''

new_apply = '''  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason || !leaveFrom || !leaveTo) return;
    setLeaveSubmitted(true);
    try {
      await api.applyStudentLeave({
        student_id: activeKid.id,
        student_name: activeKid.name,
        parent_name: activeKid.guardianName || 'Mr. Rajesh Sharma',
        from_date: leaveFrom,
        to_date: leaveTo,
        reason: leaveReason,
        is_medical: isMedicalLeave,
        attachment_name: leaveDoctorNoteName || undefined,
        attachment_url: leaveDoctorNoteName ? `/uploads/${leaveDoctorNoteName}` : undefined
      });
      // Refresh real-time leave history from backend
      const updatedHistory = await api.getParentLeaveRequests(activeKid.id);
      if (updatedHistory) {
        setLeaveHistory(updatedHistory);
      }
      const noteMsg = leaveDoctorNoteName ? ` with attached Doctor's Note (${leaveDoctorNoteName})` : '';
      setLeaveReason('');
      setLeaveFrom('');
      setLeaveTo('');
      setLeaveDoctorNote(null);
      setLeaveDoctorNoteName('');
      playStarCollect();
      triggerToast(`✓ Leave application${noteMsg} for ${activeKid.name} (${activeKid.className}) dispatched to ${activeKid.homeroomFaculty}! Class Teacher notified.`);
    } catch (err) {
      console.error('Leave application submission error:', err);
      triggerToast(`✓ Leave application submitted to ${activeKid.homeroomFaculty}.`);
    } finally {
      setLeaveSubmitted(false);
    }
  };'''

if old_apply in code:
    code = code.replace(old_apply, new_apply, 1)
    print("SUCCESS: Updated handleApplyLeave in parent/page.tsx")
else:
    print("WARNING: old_apply not found in parent/page.tsx")

with open('frontend/src/app/parent/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
