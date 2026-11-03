# Script to update parent-ptm-view.tsx
with open('frontend/src/components/parent-ptm-view.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update ParentPtmViewProps and function header
old_header = '''interface ParentPtmViewProps {
  studentId?: number;
  studentName?: string;
}

export function ParentPtmView({
  studentId = 1,
  studentName = 'Aarav Sharma'
}: ParentPtmViewProps = {}) {
  // Homeroom Class Teacher
  const homeroomTeacher: FacultyProfile = {
    id: 'ananya',
    name: 'Mrs. Ananya Verma',
    role: 'Homeroom Class Teacher (Class 8-B In-Charge) & Senior Academic Mentor',
    subject: 'Homeroom Coordination & Holistic Mentorship',
    email: 'ananya.verma@edu360.internal',
    phone: '+91 98111 00002',
    officeHours: 'Mon - Fri • 03:30 PM - 04:30 PM',
    avatarBg: 'bg-purple-600',
    status: 'Available for PTM',
    scopeType: 'HOMEROOM_CLASS',
    homeroomHighlights: {
      attendancePct: 94.2,
      virtualClassroom: 'Virtual Room 8-B (Google Meet & Zoom Enterprise Pro Active)',
      leaveStatus: 'All Approved (0 Pending Applications)',
      conduct: 'Exemplary Leadership & STEM Club Representative'
    }
  };

  // Subject Faculty Directory
  const subjectTeachers: FacultyProfile[] = [
    {
      id: 'sunitha',
      name: 'Mrs. Sunitha Rao',
      role: 'Senior Secondary Mathematics Specialist',
      subject: 'Mathematics',
      email: 'sunitha.rao@edu360.internal',
      phone: '+91 98111 22331',
      officeHours: 'Mon, Wed • 03:30 PM - 04:30 PM',
      avatarBg: 'bg-indigo-600',
      status: 'Available for PTM',
      scopeType: 'SUBJECT_SPECIFIC',
      masteryPct: 42,
      weakConcepts: ['Algebraic Fractions', 'Quadratic Signs', 'Denominator LCM']
    },
    {
      id: 'raman',
      name: 'Dr. K. Raman',
      role: 'Head of Science & Physics Lab Director',
      subject: 'Science & Physics',
      email: 'raman.k@edu360.internal',
      phone: '+91 98111 22332',
      officeHours: 'Tue, Thu • 04:00 PM - 05:00 PM',
      avatarBg: 'bg-blue-600',
      status: 'Available for PTM',
      scopeType: 'SUBJECT_SPECIFIC',
      masteryPct: 58,
      weakConcepts: ['Optics Ray Diagrams', "Ohm's Law Calculation"]
    },
    {
      id: 'deepa',
      name: 'Ms. Deepa Menon',
      role: 'English Department Head & Literary Coordinator',
      subject: 'English Literature',
      email: 'deepa.menon@edu360.internal',
      phone: '+91 98111 22334',
      officeHours: 'Wed, Fri • 03:00 PM - 04:00 PM',
      avatarBg: 'bg-emerald-600',
      status: 'Available for PTM',
      scopeType: 'SUBJECT_SPECIFIC',
      masteryPct: 88,
      weakConcepts: ['P.E.E.L Essay Structure']
    },
    {
      id: 'rajesh_nair',
      name: 'Mr. Rajesh Nair',
      role: 'Faculty of Social Studies & Civics',
      subject: 'Social Studies & History',
      email: 'rajesh.nair@edu360.internal',
      phone: '+91 98111 22335',
      officeHours: 'Tue, Fri • 03:30 PM - 04:30 PM',
      avatarBg: 'bg-amber-600',
      status: 'Available for PTM',
      scopeType: 'SUBJECT_SPECIFIC',
      masteryPct: 76,
      weakConcepts: ['Harappan Trade Routes', 'Constitutional Amendments']
    }
  ];

  // Active Sub-tab in Parent View
  const [activeSubTab, setActiveSubTab] = useState<'ptm' | 'notes'>('ptm');
  const [targetTeacher, setTargetTeacher] = useState<FacultyProfile>(homeroomTeacher);'''

new_header = '''interface ParentPtmViewProps {
  studentId?: number;
  studentName?: string;
  className?: string;
  homeroomFaculty?: string;
}

export function ParentPtmView({
  studentId = 1,
  studentName = 'Aarav Sharma',
  className = 'Class 8-B',
  homeroomFaculty = 'Mrs. Ananya Verma'
}: ParentPtmViewProps = {}) {
  const isPrimaryKid = studentId === 7 || (className && (className.includes('3') || className.toLowerCase().includes('primary')));

  // Dynamically resolve Homeroom Class Teacher scoped strictly to the selected child
  const homeroomTeacher: FacultyProfile = isPrimaryKid ? {
    id: 'priya',
    name: homeroomFaculty || 'Ms. Priya Nair',
    role: `Primary Homeroom In-Charge (${className || 'Class 3-A'}) & Early Years Mentor`,
    subject: 'Early Child Development & Foundational Growth',
    email: 'priya.nair@edu360.internal',
    phone: '+91 98111 00007',
    officeHours: 'Mon - Fri • 02:30 PM - 03:30 PM',
    avatarBg: 'bg-emerald-600',
    status: 'Available for PTM',
    scopeType: 'HOMEROOM_CLASS',
    homeroomHighlights: {
      attendancePct: 98.2,
      virtualClassroom: `Virtual Room ${className || '3-A'} (Junior Interactive Pod)`,
      leaveStatus: 'All Approved (0 Pending)',
      conduct: 'Highly Creative, Enthusiastic & Artistic Explorer'
    }
  } : {
    id: 'ananya',
    name: homeroomFaculty || 'Mrs. Ananya Verma',
    role: `Homeroom Class Teacher (${className || 'Class 8-B'} In-Charge) & Senior Academic Mentor`,
    subject: 'Homeroom Coordination & Holistic Mentorship',
    email: 'ananya.verma@edu360.internal',
    phone: '+91 98111 00002',
    officeHours: 'Mon - Fri • 03:30 PM - 04:30 PM',
    avatarBg: 'bg-purple-600',
    status: 'Available for PTM',
    scopeType: 'HOMEROOM_CLASS',
    homeroomHighlights: {
      attendancePct: 94.2,
      virtualClassroom: `Virtual Room ${className || '8-B'} (Google Meet & Zoom Enterprise Pro Active)`,
      leaveStatus: 'All Approved (0 Pending Applications)',
      conduct: 'Exemplary Leadership & STEM Club Representative'
    }
  };

  // Dynamically resolve Subject Faculty Directory scoped strictly to the selected child
  const subjectTeachers: FacultyProfile[] = isPrimaryKid ? [
    {
      id: 'priya_story',
      name: 'Ms. Priya Nair',
      role: 'Early Literacy & Phonics Specialist',
      subject: 'Phonics & Story Magic',
      email: 'priya.nair@edu360.internal',
      phone: '+91 98111 00007',
      officeHours: 'Mon, Wed • 02:30 PM - 03:30 PM',
      avatarBg: 'bg-pink-600',
      status: 'Available for PTM',
      scopeType: 'SUBJECT_SPECIFIC',
      masteryPct: 92,
      weakConcepts: ['Blended Consonants & Silent E']
    },
    {
      id: 'kavita_math',
      name: 'Mrs. Kavita Reddy',
      role: 'Primary Numeracy & Mental Math Mentor',
      subject: 'Foundational Mathematics',
      email: 'kavita.reddy@edu360.internal',
      phone: '+91 98111 22339',
      officeHours: 'Tue, Thu • 02:30 PM - 03:30 PM',
      avatarBg: 'bg-amber-600',
      status: 'Available for PTM',
      scopeType: 'SUBJECT_SPECIFIC',
      masteryPct: 84,
      weakConcepts: ['2-Digit Carry-Over Addition']
    },
    {
      id: 'sneha_evs',
      name: 'Ms. Sneha Joshi',
      role: 'Environmental Studies & Creative Arts Lead',
      subject: 'EVS & Art Expression',
      email: 'sneha.joshi@edu360.internal',
      phone: '+91 98111 22340',
      officeHours: 'Wed, Fri • 02:00 PM - 03:00 PM',
      avatarBg: 'bg-teal-600',
      status: 'Available for PTM',
      scopeType: 'SUBJECT_SPECIFIC',
      masteryPct: 95,
      weakConcepts: ['Plant Life Cycles']
    }
  ] : [
    {
      id: 'sunitha',
      name: 'Mrs. Sunitha Rao',
      role: 'Senior Secondary Mathematics Specialist',
      subject: 'Mathematics',
      email: 'sunitha.rao@edu360.internal',
      phone: '+91 98111 22331',
      officeHours: 'Mon, Wed • 03:30 PM - 04:30 PM',
      avatarBg: 'bg-indigo-600',
      status: 'Available for PTM',
      scopeType: 'SUBJECT_SPECIFIC',
      masteryPct: 42,
      weakConcepts: ['Algebraic Fractions', 'Quadratic Signs', 'Denominator LCM']
    },
    {
      id: 'raman',
      name: 'Dr. K. Raman',
      role: 'Head of Science & Physics Lab Director',
      subject: 'Science & Physics',
      email: 'raman.k@edu360.internal',
      phone: '+91 98111 22332',
      officeHours: 'Tue, Thu • 04:00 PM - 05:00 PM',
      avatarBg: 'bg-blue-600',
      status: 'Available for PTM',
      scopeType: 'SUBJECT_SPECIFIC',
      masteryPct: 58,
      weakConcepts: ['Optics Ray Diagrams', "Ohm's Law Calculation"]
    },
    {
      id: 'deepa',
      name: 'Ms. Deepa Menon',
      role: 'English Department Head & Literary Coordinator',
      subject: 'English Literature',
      email: 'deepa.menon@edu360.internal',
      phone: '+91 98111 22334',
      officeHours: 'Wed, Fri • 03:00 PM - 04:00 PM',
      avatarBg: 'bg-emerald-600',
      status: 'Available for PTM',
      scopeType: 'SUBJECT_SPECIFIC',
      masteryPct: 88,
      weakConcepts: ['P.E.E.L Essay Structure']
    },
    {
      id: 'rajesh_nair',
      name: 'Mr. Rajesh Nair',
      role: 'Faculty of Social Studies & Civics',
      subject: 'Social Studies & History',
      email: 'rajesh.nair@edu360.internal',
      phone: '+91 98111 22335',
      officeHours: 'Tue, Fri • 03:30 PM - 04:30 PM',
      avatarBg: 'bg-amber-600',
      status: 'Available for PTM',
      scopeType: 'SUBJECT_SPECIFIC',
      masteryPct: 76,
      weakConcepts: ['Harappan Trade Routes', 'Constitutional Amendments']
    }
  ];

  // Active Sub-tab in Parent View
  const [activeSubTab, setActiveSubTab] = useState<'ptm' | 'notes'>('ptm');
  const [targetTeacher, setTargetTeacher] = useState<FacultyProfile>(homeroomTeacher);

  // Synchronize targetTeacher when parent switches children
  useEffect(() => {
    setTargetTeacher(homeroomTeacher);
  }, [studentId, className]);'''

if old_header in content:
    content = content.replace(old_header, new_header, 1)
    print("SUCCESS: Updated header and dynamic faculty resolution")
else:
    print("WARNING: old_header not found")

# 2. Remove sibling chaining states and methods
old_sibling_state_and_handlers = '''  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<PTMSlot | null>(null);
  const [ptmModalOpen, setPtmModalOpen] = useState(false);
  const [isSiblingChaining, setIsSiblingChaining] = useState(false);
  const [selectedAgendas, setSelectedAgendas] = useState<string[]>(['Algebraic Fractions', 'Midterm Unit Test Review']);
  const [ptmBookingSuccess, setPtmBookingSuccess] = useState(false);

  // Sibling alert visibility
  const [showSiblingPrompt, setShowSiblingPrompt] = useState(false);
  const [siblingCandidateSlot, setSiblingCandidateSlot] = useState<PTMSlot | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    async function loadParentPtmData() {
      try {
        const [configRes, slotsRes, notesRes] = await Promise.all([
          api.getParentPTMEventConfig(),
          api.getParentPTMSlots(),
          api.getParentNotes(1)
        ]);
        setPtmConfig(configRes);
        setSlots(slotsRes);
        setNotes(notesRes);
      } catch (e) {
        console.error('Error loading parent PTM data', e);
      }
    }
    loadParentPtmData();
  }, []);

  // Slide Timeline left/right
  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      timelineScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSelectSlotForBooking = (slot: PTMSlot) => {
    if (slot.status === 'BREAK') return;
    if (slot.locked_by_class) {
      triggerToast(`Slot is locked by a ${slot.locked_by_class}. Please select an open slot.`);
      return;
    }
    if (slot.status === 'BOOKED') {
      triggerToast('This 10-minute slot is already reserved.');
      return;
    }

    setSelectedSlotForBooking(slot);

    // Sibling detection logic: Check if next slot is available (e.g. 10:20 AM and 10:30 AM)
    const slotIdx = slots.findIndex(s => s.id === slot.id);
    const nextSlot = slotIdx >= 0 && slotIdx + 1 < slots.length ? slots[slotIdx + 1] : null;
    if (nextSlot && nextSlot.status === 'AVAILABLE') {
      setSiblingCandidateSlot(nextSlot);
      setShowSiblingPrompt(true);
    } else {
      setShowSiblingPrompt(false);
      setSiblingCandidateSlot(null);
    }

    setPtmModalOpen(true);
  };

  const handleBookSiblingChainingDirect = async () => {
    if (!selectedSlotForBooking || !siblingCandidateSlot) return;

    try {
      // Book Slot 1 (for Aarav)
      await api.parentBookPTMSlot({
        slot_id: selectedSlotForBooking.id,
        booked_student_id: studentId,
        booked_student_name: studentName,
        booked_class: '8-B',
        booked_parent_id: 'par-01',
        booked_parent_name: 'Mr. Rajesh Sharma',
        interaction_scope: targetTeacher.scopeType,
        subject_name: targetTeacher.subject,
        is_sibling_combo: true,
        sibling_student_id: 6,
        sibling_student_name: 'Vihaan Sharma (Class 6-A)',
        focus_table_agenda: selectedAgendas
      });

      // Book Slot 2 (consecutive for Vihaan)
      await api.parentBookPTMSlot({
        slot_id: siblingCandidateSlot.id,
        booked_student_id: 6,
        booked_student_name: 'Vihaan Sharma',
        booked_class: '6-A',
        booked_parent_id: 'par-01',
        booked_parent_name: 'Mr. Rajesh Sharma',
        interaction_scope: targetTeacher.scopeType,
        subject_name: targetTeacher.subject,
        is_sibling_combo: true,
        sibling_student_id: 1,
        sibling_student_name: 'Aarav Sharma (Class 8-B)',
        focus_table_agenda: ['Foundation Bridge & Sibling Review']
      });

      // Update state locally
      setSlots(prev => prev.map(s => {
        if (s.id === selectedSlotForBooking.id) {
          return {
            ...s,
            status: 'BOOKED',
            booked_student_name: 'Aarav Sharma (8-B)',
            is_sibling_combo: true,
            sibling_student_name: 'Vihaan Sharma (6-A)'
          };
        }
        if (s.id === siblingCandidateSlot.id) {
          return {
            ...s,
            status: 'BOOKED',
            booked_student_name: 'Vihaan Sharma (6-A)',
            is_sibling_combo: true,
            sibling_student_name: 'Aarav Sharma (8-B)'
          };
        }
        return s;
      }));

      setPtmBookingSuccess(true);
      setShowSiblingPrompt(false);
      setTimeout(() => {
        setPtmBookingSuccess(false);
        setPtmModalOpen(false);
        triggerToast(`Consecutive 20-min double slot locked for Aarav & Vihaan (${selectedSlotForBooking.start_time} - ${siblingCandidateSlot.end_time})!`);
      }, 1600);
    } catch (err) {
      console.error(err);
      triggerToast('Error locking consecutive sibling slots.');
    }
  };

  const handleBookSingleSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForBooking) return;

    try {
      const booked = await api.parentBookPTMSlot({
        slot_id: selectedSlotForBooking.id,
        booked_student_id: studentId,
        booked_student_name: studentName,
        booked_class: '8-B',
        booked_parent_id: 'par-01',
        booked_parent_name: 'Mr. Rajesh Sharma',
        interaction_scope: targetTeacher.scopeType,
        subject_name: targetTeacher.subject,
        is_sibling_combo: isSiblingChaining,
        sibling_student_id: isSiblingChaining ? 6 : undefined,
        sibling_student_name: isSiblingChaining ? 'Vihaan Sharma (Class 6-A)' : undefined,
        focus_table_agenda: selectedAgendas
      });

      setSlots(prev => prev.map(s => s.id === selectedSlotForBooking.id ? booked : s));
      setPtmBookingSuccess(true);
      setTimeout(() => {
        setPtmBookingSuccess(false);
        setPtmModalOpen(false);
        triggerToast(`PTM Slot (${booked.start_time}) confirmed with ${targetTeacher.name}!`);
      }, 1400);
    } catch (err) {
      console.error(err);
      triggerToast('Error reserving PTM slot.');
    }
  };'''

new_sibling_state_and_handlers = '''  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<PTMSlot | null>(null);
  const [ptmModalOpen, setPtmModalOpen] = useState(false);
  const [selectedAgendas, setSelectedAgendas] = useState<string[]>(['Midterm Unit Test Review', 'Mastery Progress']);
  const [ptmBookingSuccess, setPtmBookingSuccess] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    async function loadParentPtmData() {
      try {
        const [configRes, slotsRes, notesRes] = await Promise.all([
          api.getParentPTMEventConfig(),
          api.getParentPTMSlots(),
          api.getParentNotes(studentId)
        ]);
        setPtmConfig(configRes);
        setSlots(slotsRes);
        setNotes(notesRes);
      } catch (e) {
        console.error('Error loading parent PTM data', e);
      }
    }
    loadParentPtmData();
  }, [studentId]);

  // Slide Timeline left/right
  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      timelineScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSelectSlotForBooking = (slot: PTMSlot) => {
    if (slot.status === 'BREAK') return;
    if (slot.locked_by_class) {
      triggerToast(`Slot is locked by a ${slot.locked_by_class}. Please select an open slot.`);
      return;
    }
    if (slot.status === 'BOOKED') {
      triggerToast('This 10-minute slot is already reserved.');
      return;
    }

    setSelectedSlotForBooking(slot);
    setPtmModalOpen(true);
  };

  const handleBookSingleSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForBooking) return;

    try {
      const booked = await api.parentBookPTMSlot({
        slot_id: selectedSlotForBooking.id,
        booked_student_id: studentId,
        booked_student_name: studentName,
        booked_class: className || (studentId === 7 ? 'Class 3-A' : 'Class 8-B'),
        booked_parent_id: 'par-01',
        booked_parent_name: 'Mr. Rajesh Sharma',
        interaction_scope: targetTeacher.scopeType,
        subject_name: targetTeacher.subject,
        is_sibling_combo: false,
        focus_table_agenda: selectedAgendas
      });

      setSlots(prev => prev.map(s => s.id === selectedSlotForBooking.id ? booked : s));
      setPtmBookingSuccess(true);
      setTimeout(() => {
        setPtmBookingSuccess(false);
        setPtmModalOpen(false);
        triggerToast(`Atomic 10-min PTM slot (${booked.start_time}) confirmed with ${targetTeacher.name} for ${studentName}!`);
      }, 1400);
    } catch (err) {
      console.error(err);
      triggerToast('Error reserving PTM slot.');
    }
  };'''

if old_sibling_state_and_handlers in content:
    content = content.replace(old_sibling_state_and_handlers, new_sibling_state_and_handlers, 1)
    print("SUCCESS: Removed sibling chaining handlers and simplified atomic booking")
else:
    print("WARNING: old_sibling_state_and_handlers not found")

# 3. Add isolated student banner at top of PTM view
old_top_banner = '''      {/* ===================================================================== */}
      {/* 1. TEACHER DIRECTORY & SELECTION RIBBON                               */}
      {/* ===================================================================== */}
      <div className="space-y-4">'''

new_top_banner = '''      {/* ISOLATED STUDENT PTM PROFILE BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                Isolated Student Conference Profile
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100">
                {studentName} ({className || (isPrimaryKid ? 'Class 3-A' : 'Class 8-B')})
              </span>
            </div>
            <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-0.5">
              Faculty directory and 10-minute conference slots are strictly isolated for this student. No cross-sibling overlap or faculty confusion.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-2xs">
          Assigned Homeroom: {homeroomTeacher.name}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. TEACHER DIRECTORY & SELECTION RIBBON                               */}
      {/* ===================================================================== */}
      <div className="space-y-4">'''

if old_top_banner in content:
    content = content.replace(old_top_banner, new_top_banner, 1)
    print("SUCCESS: Added isolated student banner in parent-ptm-view.tsx")
else:
    print("WARNING: old_top_banner not found")

# 4. Update Confirmed Bookings list: replace sibling chaining badge with dedicated atomic session
old_booking_badge = '''                    {slot.is_sibling_combo && (
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block truncate">
                        👥 20-Min Sibling Chained
                      </span>
                    )}'''

new_booking_badge = '''                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block truncate">
                      🎯 Dedicated 10-Min Atomic Session
                    </span>'''

if old_booking_badge in content:
    content = content.replace(old_booking_badge, new_booking_badge, 1)
    print("SUCCESS: Updated confirmed booking badge in parent-ptm-view.tsx")
else:
    print("WARNING: old_booking_badge not found")

# 5. Remove sibling chaining prompt from booking modal
old_modal_sibling_prompt = '''                {/* 20-MIN SIBLING CHAINING ALERT BANNER */}
                {showSiblingPrompt && siblingCandidateSlot && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border-2 border-purple-300 dark:border-purple-800 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600 animate-spin" />
                      <span className="text-xs font-black text-purple-900 dark:text-purple-200">
                        Sibling Chaining Detected!
                      </span>
                    </div>

                    <p className="text-xs text-purple-950 dark:text-purple-200 font-medium leading-relaxed">
                      We noticed you also have <strong className="text-purple-700 dark:text-purple-300 font-black">Vihaan (Class 6-A)</strong>. Would you like to reserve consecutive 20-minute slots (<span className="font-mono font-bold">{selectedSlotForBooking.start_time} – {siblingCandidateSlot.end_time}</span>)?
                    </p>

                    <button
                      type="button"
                      onClick={handleBookSiblingChainingDirect}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Users className="h-4 w-4" />
                      <span>Reserve 20-Min Double Slot (Aarav &amp; Vihaan)</span>
                    </button>
                  </div>
                )}'''

new_modal_sibling_prompt = '''                {/* ISOLATED ATOMIC SESSION INFO */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Student &amp; Class</span>
                    <span className="font-black text-slate-900 dark:text-white">{studentName} ({className || (isPrimaryKid ? 'Class 3-A' : 'Class 8-B')})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Faculty Member</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{targetTeacher.name}</span>
                  </div>
                </div>'''

if old_modal_sibling_prompt in content:
    content = content.replace(old_modal_sibling_prompt, new_modal_sibling_prompt, 1)
    print("SUCCESS: Replaced modal sibling banner with isolated student session info")
else:
    print("WARNING: old_modal_sibling_prompt not found")

with open('frontend/src/components/parent-ptm-view.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
