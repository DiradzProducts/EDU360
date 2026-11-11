with open('frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add registration state
old_state = """  // Convert to SIS Modal State (Admissions CRM)
  const [convertModalEnquiry, setConvertModalEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [convertSection, setConvertSection] = useState('A');
  const [convertAdmissionFee, setConvertAdmissionFee] = useState(25000);
  const [convertFeeStatus, setConvertFeeStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [convertPaymentMethod, setConvertPaymentMethod] = useState('UPI (Google Pay)');"""

new_state = """  // Convert to SIS Modal State (Admissions CRM)
  const [convertModalEnquiry, setConvertModalEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [convertSection, setConvertSection] = useState('A');
  const [convertAdmissionFee, setConvertAdmissionFee] = useState(25000);
  const [convertFeeStatus, setConvertFeeStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [convertPaymentMethod, setConvertPaymentMethod] = useState('UPI (Google Pay)');

  // Register New Prospective Student / Admission State (Admin Authority)
  const [showRegisterEnquiryModal, setShowRegisterEnquiryModal] = useState(false);
  const [regStudentName, setRegStudentName] = useState('');
  const [regParentName, setRegParentName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPhoneError, setRegPhoneError] = useState<string | null>(null);
  const [regEmail, setRegEmail] = useState('');
  const [regGrade, setRegGrade] = useState('Class 8');
  const [regSource, setRegSource] = useState('Direct Call / Walk-in');
  const [regTemperature, setRegTemperature] = useState<'hot' | 'warm' | 'cold'>('warm');
  const [regNotes, setRegNotes] = useState('');"""

c_norm = c.replace('\r\n', '\n')
old_st_norm = old_state.replace('\r\n', '\n')
new_st_norm = new_state.replace('\r\n', '\n')

assert old_st_norm in c_norm, "old_state not found"
c_norm = c_norm.replace(old_st_norm, new_st_norm, 1)

# 2. Add handleRegisterEnquiry function
old_handlers = """  const handleConvertToStudent = async (id: number) => {
    const res: any = await api.convertEnquiryToStudent(id);
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    triggerToast(res.message || 'Student enrolled into SIS successfully');
  };"""

new_handlers = """  const handleConvertToStudent = async (id: number) => {
    const res: any = await api.convertEnquiryToStudent(id);
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    triggerToast(res.message || 'Student enrolled into SIS successfully');
  };

  const handleRegisterEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regStudentName.trim() || !regParentName.trim() || !regPhone.trim()) {
      triggerToast('Please provide Student Name, Parent Name, and Phone.');
      return;
    }

    const digitsOnly = regPhone.replace(/\\D/g, '');
    let isValidMobile = false;
    let phoneErrorMsg = '';

    if (!digitsOnly) {
      phoneErrorMsg = 'Phone number is required.';
    } else if (digitsOnly.length === 10) {
      if (/^[6-9]\\d{9}$/.test(digitsOnly)) {
        isValidMobile = true;
      } else {
        phoneErrorMsg = '10-digit mobile number must start with 6, 7, 8, or 9.';
      }
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      if (/^[6-9]\\d{9}$/.test(digitsOnly.slice(2))) {
        isValidMobile = true;
      } else {
        phoneErrorMsg = 'Mobile number must start with 6, 7, 8, or 9 after country code +91.';
      }
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
      if (/^[6-9]\\d{9}$/.test(digitsOnly.slice(1))) {
        isValidMobile = true;
      } else {
        phoneErrorMsg = 'Mobile number must start with 6, 7, 8, or 9 after leading 0.';
      }
    } else if (digitsOnly.length < 10) {
      phoneErrorMsg = `Incomplete phone number (${digitsOnly.length}/10 digits entered).`;
    } else {
      phoneErrorMsg = 'Please enter a valid 10-digit mobile number (e.g. +91 98450 99881).';
    }

    if (!isValidMobile) {
      setRegPhoneError(phoneErrorMsg);
      triggerToast(phoneErrorMsg);
      return;
    }
    setRegPhoneError(null);

    const emailVal = regEmail.trim() || `${regStudentName.toLowerCase().replace(/\\s+/g, '')}.parent@edu360.internal`;

    await api.createEnquiry({
      student_name: regStudentName.trim(),
      parent_name: regParentName.trim(),
      phone: regPhone.trim(),
      email: emailVal,
      target_grade: regGrade,
      lead_temperature: regTemperature,
      source: regSource,
      notes: regNotes.trim() || `Admitted by Principal Office: Direct enrollment candidate for ${regGrade}.`
    });

    const updated = await api.getEnquiries();
    setEnquiries(updated);
    setShowRegisterEnquiryModal(false);

    // Reset form
    setRegStudentName('');
    setRegParentName('');
    setRegPhone('');
    setRegEmail('');
    setRegGrade('Class 8');
    setRegSource('Direct Call / Walk-in');
    setRegTemperature('warm');
    setRegNotes('');

    triggerToast(`🎉 Candidate ${regStudentName.trim()} registered in Admissions CRM!`);
  };"""

old_hd_norm = old_handlers.replace('\r\n', '\n')
new_hd_norm = new_handlers.replace('\r\n', '\n')

assert old_hd_norm in c_norm, "old_handlers not found"
c_norm = c_norm.replace(old_hd_norm, new_hd_norm, 1)

# 3. Add header action button for activeTab === 'crm'
old_header_quick = """            {/* Quick Action in Header (NO Dashboard Button) */}
            <div className="flex items-center gap-2 shrink-0">

              {activeTab === 'tasks' && ("""

new_header_quick = """            {/* Quick Action in Header (NO Dashboard Button) */}
            <div className="flex items-center gap-2 shrink-0">

              {activeTab === 'crm' && (
                <button
                  type="button"
                  onClick={() => setShowRegisterEnquiryModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>+ Register New Enquiry</span>
                </button>
              )}

              {activeTab === 'tasks' && ("""

old_hq_norm = old_header_quick.replace('\r\n', '\n')
new_hq_norm = new_header_quick.replace('\r\n', '\n')

assert old_hq_norm in c_norm, "old_header_quick not found"
c_norm = c_norm.replace(old_hq_norm, new_hq_norm, 1)

# 4. Pass onOpenIntakeModal to CRMBoard
old_crm_call = """              <CRMBoard 
                enquiries={enquiries}
                onStageChange={handleEnquiryStageChange}
                onConvertToStudent={async (id: number) => {
                  const enq = enquiries.find(e => e.id === id);
                  if (enq) {
                    setConvertModalEnquiry(enq);
                    setConvertSection(enq.target_grade?.includes('B') ? 'B' : 'A');
                  } else {
                    await handleConvertToStudent(id);
                  }
                }}
              />"""

new_crm_call = """              <CRMBoard 
                enquiries={enquiries}
                onStageChange={handleEnquiryStageChange}
                onConvertToStudent={async (id: number) => {
                  const enq = enquiries.find(e => e.id === id);
                  if (enq) {
                    setConvertModalEnquiry(enq);
                    setConvertSection(enq.target_grade?.includes('B') ? 'B' : 'A');
                  } else {
                    await handleConvertToStudent(id);
                  }
                }}
                onOpenIntakeModal={() => setShowRegisterEnquiryModal(true)}
              />"""

old_cc_norm = old_crm_call.replace('\r\n', '\n')
new_cc_norm = new_crm_call.replace('\r\n', '\n')

assert old_cc_norm in c_norm, "old_crm_call not found"
c_norm = c_norm.replace(old_cc_norm, new_cc_norm, 1)

# 5. Add showRegisterEnquiryModal JSX right after convertModalEnquiry modal
old_conv_end = """                <button
                  type="button"
                  onClick={async () => {
                    await api.convertEnquiryToStudent(convertModalEnquiry.id);
                    const updatedEnq = await api.getEnquiries();
                    setEnquiries(updatedEnq);
                    const updatedStudents = await api.getStudents();
                    setStudentsList(updatedStudents);
                    setConvertModalEnquiry(null);
                    triggerToast(`🎉 ${convertModalEnquiry.student_name} officially enrolled into SIS with Section ${convertSection} allotment!`);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm Enrollment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}"""

register_modal_jsx = """

      {/* ── MODAL: REGISTER NEW ADMISSION / ENQUIRY (ADMIN PRIVILEGED INTAKE) ── */}
      {showRegisterEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Register New Prospective Student</h3>
                  <p className="text-[11px] text-slate-500">Principal Office &bull; Direct Candidate Onboarding &amp; Admission Intake</p>
                </div>
              </div>
              <button onClick={() => setShowRegisterEnquiryModal(false)} className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterEnquiry} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Student Name *</label>
                  <input 
                    type="text" 
                    required
                    value={regStudentName} 
                    onChange={e => setRegStudentName(e.target.value)} 
                    placeholder="e.g. Maya Deshmukh" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Target Grade *</label>
                  <select 
                    value={regGrade} 
                    onChange={e => setRegGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold cursor-pointer"
                  >
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Parent / Guardian Name *</label>
                  <input 
                    type="text" 
                    required
                    value={regParentName} 
                    onChange={e => setRegParentName(e.target.value)} 
                    placeholder="e.g. Dr. Amit Deshmukh" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Mobile Phone *</label>
                  <input 
                    type="tel" 
                    required
                    value={regPhone} 
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9+\-\\s]/g, '');
                      setRegPhone(cleanVal);
                      if (regPhoneError) setRegPhoneError(null);
                    }} 
                    placeholder="e.g. +91 98450 12345" 
                    className={`w-full rounded-xl border p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      regPhoneError 
                        ? 'border-rose-500 focus:ring-rose-500/20' 
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/20'
                    }`}
                  />
                  {regPhoneError && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{regPhoneError}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Lead Source</label>
                  <select 
                    value={regSource} 
                    onChange={e => setRegSource(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Direct Call / Walk-in">Direct Call / Walk-in (Principal Office)</option>
                    <option value="Parent Referral">Parent / Teacher Referral</option>
                    <option value="Website Form">Website Form (Online)</option>
                    <option value="Social Media Ad">Social Media Ad (Meta/Google)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Initial Priority / Temperature</label>
                  <select 
                    value={regTemperature} 
                    onChange={e => setRegTemperature(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="hot">🔥 Hot (High Intent / Ready)</option>
                    <option value="warm">🌤️ Warm (In Consideration)</option>
                    <option value="cold">❄️ Cold (Casual Inquiry)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Email Address (Optional)</label>
                <input 
                  type="email" 
                  value={regEmail} 
                  onChange={e => setRegEmail(e.target.value)} 
                  placeholder="e.g. parent.email@example.com" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Counseling Notes / Observations</label>
                <textarea 
                  rows={2}
                  value={regNotes}
                  onChange={e => setRegNotes(e.target.value)}
                  placeholder="e.g. Parent visited school office. Requested syllabus overview and fee structure."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterEnquiryModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register Candidate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}"""

old_ce_norm = old_conv_end.replace('\r\n', '\n')
new_ce_norm = (old_conv_end + register_modal_jsx).replace('\r\n', '\n')

assert old_ce_norm in c_norm, "old_conv_end not found"
c_norm = c_norm.replace(old_ce_norm, new_ce_norm, 1)

with open('frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c_norm)

print("admin/page.tsx updated successfully with Register Enquiry Modal!")
