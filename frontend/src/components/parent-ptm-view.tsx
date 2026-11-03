'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Video, 
  Calendar, 
  Clock, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  ExternalLink, 
  User, 
  Sparkles, 
  Phone, 
  Mail, 
  X,
  AlertCircle,
  ShieldCheck,
  Check,
  Info,
  Filter,
  ArrowRight,
  Lock,
  Coffee,
  Utensils,
  GraduationCap,
  CheckSquare
} from 'lucide-react';
import { api } from '@/lib/api';
import { 
  ParentTeacherNote, 
  PTMSlot, 
  PTMEventConfig, 
  InteractionScope 
} from '@/lib/types';

interface FacultyProfile {
  id: string;
  name: string;
  role: string;
  subject: string;
  email: string;
  phone: string;
  officeHours: string;
  avatarBg: string;
  status: 'Online' | 'In Class' | 'Available for PTM';
  scopeType: InteractionScope;
  masteryPct?: number;
  weakConcepts?: string[];
  homeroomHighlights?: {
    attendancePct: number;
    virtualClassroom: string;
    leaveStatus: string;
    conduct: string;
  };
}

interface ParentPtmViewProps {
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
  }, [studentId, className]);

  // Notes state
  const [notes, setNotes] = useState<ParentTeacherNote[]>([]);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteCategory, setNoteCategory] = useState<'ACADEMIC_CONCERN' | 'APPRECIATION' | 'BEHAVIORAL' | 'PTM_FOLLOWUP'>('ACADEMIC_CONCERN');
  const [noteContent, setNoteContent] = useState('');
  const [isEvidenceForFocusTable, setIsEvidenceForFocusTable] = useState(true);
  const [focusConceptTag, setFocusConceptTag] = useState('Algebraic Fractions & Negative Signs');
  const [noteSending, setNoteSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Horizontal Timeline State & Ref
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const [ptmConfig, setPtmConfig] = useState<PTMEventConfig | null>(null);
  const [slots, setSlots] = useState<PTMSlot[]>([]);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<PTMSlot | null>(null);
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
  };

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setNoteSending(true);
    try {
      const newNote = await api.createParentNote({
        interaction_scope: targetTeacher.scopeType,
        student_id: studentId,
        student_name: studentName,
        student_class: className || (studentId === 7 ? 'Class 3-A' : 'Class 8-B'),
        parent_id: 'par-01',
        parent_name: 'Mr. Rajesh Sharma',
        parent_phone: '+91 98111 00003',
        teacher_id: targetTeacher.id,
        teacher_name: targetTeacher.name,
        subject_id: targetTeacher.scopeType === 'SUBJECT_SPECIFIC' ? 'subj-math' : undefined,
        subject_name: targetTeacher.scopeType === 'SUBJECT_SPECIFIC' ? targetTeacher.subject : undefined,
        homeroom_teacher_id: 'ananya',
        note_type: noteCategory,
        content: noteContent,
        is_focus_table_evidence: isEvidenceForFocusTable,
        focus_concept_tag: isEvidenceForFocusTable ? focusConceptTag : undefined
      });

      setNotes(prev => [newNote, ...prev]);
      setNoteContent('');
      setNoteModalOpen(false);
      triggerToast(`Note dispatched to ${targetTeacher.name}! Synchronized to Focus Table evidence timeline.`);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to dispatch note. Please try again.');
    } finally {
      setNoteSending(false);
    }
  };

  const handleParentCancelSlot = async (slotId: string) => {
    if (!window.confirm("Are you sure you want to cancel your PTM reservation? The slot will immediately become available for other parents.")) {
      return;
    }
    try {
      await api.parentCancelPTMSlot(slotId, { cancellation_reason: "Parent-Initiated Cancellation" });
      setSlots(prev => prev.map(s => s.id === slotId ? {
        ...s,
        status: 'AVAILABLE',
        booked_student_id: undefined,
        booked_student_name: undefined,
        booked_parent_name: undefined,
        meeting_url: undefined
      } : s));
      triggerToast("Your PTM reservation has been cancelled. Slot is now available to re-book.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to cancel reservation.");
    }
  };

  const toggleAgendaPill = (agenda: string) => {
    setSelectedAgendas(prev => 
      prev.includes(agenda) ? prev.filter(a => a !== agenda) : [...prev, agenda]
    );
  };

  return (
    <div className="space-y-6">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Dual-Mode Connection Hub */}
      <div className="rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-bold border border-purple-200 dark:border-purple-800">
              <Users className="h-3.5 w-3.5" />
              Parent-Teacher Meeting (PTM) Portal
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
              Student: {studentName} &bull; {className || (isPrimaryKid ? 'Class 3-A' : 'Class 8-B')}
            </span>
            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              Isolated Child Schedule
            </span>
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            Parent-Teacher Conference &amp; 10-Minute Slot Booking
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select the Homeroom Class Teacher or any Subject Specialist below to view their remaining available 10-minute conference slots based on their free periods.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>4 Slots Available Today</span>
          </span>
        </div>
      </div>

      {/* ISOLATED STUDENT PTM PROFILE BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 p-4 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-600/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                Active Child Conference Stream
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100">
                {studentName} ({className || (isPrimaryKid ? 'Class 3-A' : 'Class 8-B')})
              </span>
            </div>
            <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-0.5">
              Conferences and faculty slots are strictly isolated for this student. No cross-sibling overlap or faculty schedule confusion.
            </p>
          </div>
        </div>
        <div className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-2xs">
          Assigned Homeroom: <strong>{homeroomTeacher.name}</strong>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. DUAL-CATEGORY FACULTY DIRECTORY                                    */}
      {/* ===================================================================== */}
      <div className="space-y-6">
        
        {/* CATEGORY 1: HOMEROOM CLASS TEACHER CARD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Category 1: Homeroom Class Teacher (In-Charge)
              </h3>
            </div>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              Primary Point of Contact
            </span>
          </div>

          <div className="rounded-3xl border-2 border-purple-300 dark:border-purple-800/80 bg-gradient-to-br from-white via-purple-50/20 to-purple-100/30 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-500/20">
                  {homeroomTeacher.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {homeroomTeacher.name}
                    </h4>
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                      {className || (isPrimaryKid ? 'Class 3-A' : 'Class 8-B')} Homeroom In-Charge
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {homeroomTeacher.role}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {homeroomTeacher.phone}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {homeroomTeacher.email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-purple-600" />
                      {homeroomTeacher.officeHours}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  onClick={() => {
                    setTargetTeacher(homeroomTeacher);
                    setActiveSubTab('ptm');
                    if (timelineScrollRef.current) {
                      timelineScrollRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Book 10-Min PTM Slot</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY 2: SUBJECT TEACHERS GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Category 2: Subject Specialist Faculty Grid
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Direct connection with subject teachers • Auto-CCs Homeroom Class Teacher
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjectTeachers.map((st) => (
              <div 
                key={st.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-2xl ${st.avatarBg} text-white flex items-center justify-center font-black text-sm shadow-sm`}>
                        {st.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {st.name}
                        </h4>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                          {st.subject}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {st.role}
                  </p>

                  {/* Mastery % Strip */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Subject Mastery:</span>
                      <span className={`font-mono font-black ${
                        (st.masteryPct || 0) < 50
                          ? 'text-rose-600 dark:text-rose-400'
                          : (st.masteryPct || 0) < 70
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {st.masteryPct}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${
                          (st.masteryPct || 0) < 50
                            ? 'bg-rose-500'
                            : (st.masteryPct || 0) < 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${st.masteryPct || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Weak Concept Tags */}
                  {st.weakConcepts && st.weakConcepts.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Weak Concept Tags:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {st.weakConcepts.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 text-[10px] font-semibold border border-rose-200 dark:border-rose-900"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Action Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <button
                    onClick={() => {
                      setTargetTeacher(st);
                      setActiveSubTab('ptm');
                      if (timelineScrollRef.current) {
                        timelineScrollRef.current.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Book 10-Min PTM Slot</span>
                  </button>


                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 2. INTERACTIVE HORIZONTAL SLIDING PTM TIMELINE BAR                    */}
      {/* ===================================================================== */}
      {activeSubTab === 'ptm' && (
        <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-5">
          
          {/* Timeline Header Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-3 py-0.5 text-xs font-black">
                  Operational Hours: 09:00 AM – 03:30 PM
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-bold">
                  Strict 10-Min Atomic Slots • 2-Min Buffers
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                Sliding PTM Conference Timeline • Target: <span className="text-indigo-600 dark:text-indigo-400">{targetTeacher.name} ({targetTeacher.subject})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Swipe or use navigation arrows to browse available meeting slots. Break periods are blackout windows. Slots booked by other sections lock in real-time.
              </p>
            </div>

            {/* Scroll Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => scrollTimeline('left')}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs active:scale-95"
                title="Slide Earlier Slots"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollTimeline('right')}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs active:scale-95"
                title="Slide Later Slots"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Breakouts & Legend Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center gap-2">
              <Coffee className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200 block">☕ Morning Tea Break (Non-Bookable)</span>
                <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">11:00 AM – 11:15 AM (Strict Break)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200 block">🍱 Faculty Lunch Break (Non-Bookable)</span>
                <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">01:00 PM – 01:45 PM (Strict Break)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold text-rose-900 dark:text-rose-200 block">Instant Cross-Class Locking</span>
                <span className="text-[11px] text-rose-700 dark:text-rose-400">Slots held by Class 7-A/9-C lock automatically</span>
              </div>
            </div>
          </div>

          {/* Horizontal Draggable/Scrollable Slots Bar */}
          <div 
            ref={timelineScrollRef}
            className="overflow-x-auto pb-4 scrollbar-thin flex gap-3 items-stretch snap-x scroll-smooth cursor-grab active:cursor-grabbing"
          >
            {slots.map((slot) => {
              const isBreak = slot.status === 'BREAK';
              const isBooked = slot.status === 'BOOKED';
              const isHeld = slot.status === 'HELD';
              const isAvailable = slot.status === 'AVAILABLE';
              const isCrossClassLocked = !!slot.locked_by_class;

              // NON-BOOKABLE BREAK CARD
              if (isBreak) {
                return (
                  <div
                    key={slot.id}
                    className="min-w-[210px] w-[210px] shrink-0 p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 flex flex-col justify-between select-none opacity-80 snap-start"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(148, 163, 184, 0.12) 8px, rgba(148, 163, 184, 0.12) 16px)'
                    }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Lock className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Breakout Window</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {slot.subject_name || 'Faculty Break'}
                      </h5>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300 block">
                        ⏰ {slot.start_time} – {slot.end_time}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Non-bookable break
                      </span>
                    </div>
                  </div>
                );
              }

              // CROSS-CLASS LOCKED SLOT
              if (isCrossClassLocked) {
                return (
                  <div
                    key={slot.id}
                    className="min-w-[220px] w-[220px] shrink-0 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col justify-between snap-start select-none opacity-85"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                          ⏰ {slot.start_time}
                        </span>
                        <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" />
                          Locked
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-rose-900 dark:text-rose-200 block">
                        Reserved: {slot.locked_by_class}
                      </span>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Instant cross-class locking active across Grade 7, 8 &amp; 9.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-rose-200/60 dark:border-rose-900/60 text-[10px] text-slate-400 font-medium">
                      Slot Unavailable
                    </div>
                  </div>
                );
              }

              // AVAILABLE SLOT
              if (isAvailable) {
                return (
                  <div
                    key={slot.id}
                    onClick={() => handleSelectSlotForBooking(slot)}
                    className="min-w-[220px] w-[220px] shrink-0 p-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-500 hover:bg-emerald-50/70 hover:shadow-md transition-all flex flex-col justify-between snap-start cursor-pointer active:scale-95"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                          ⏰ {slot.start_time} – {slot.end_time}
                        </span>
                        <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200">
                          10-Min
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Open Slot Available
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Includes 2-min turnover buffer
                      </span>
                    </div>

                    <div className="pt-3 border-t border-emerald-200 dark:border-emerald-900">
                      <button
                        type="button"
                        className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Book 10-Min Slot
                      </button>
                    </div>
                  </div>
                );
              }

              // BOOKED SLOT (Already reserved)
              return (
                <div
                  key={slot.id}
                  className="min-w-[220px] w-[220px] shrink-0 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col justify-between snap-start select-none"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        ⏰ {slot.start_time} – {slot.end_time}
                      </span>
                      <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                        Booked
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                      👤 {slot.booked_student_name || 'Aarav Sharma'}
                    </span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block truncate">
                      🎯 Dedicated 10-Min Atomic Session
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                    {slot.meeting_url ? (
                      <a
                        href={slot.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        <Video className="h-3 w-3" />
                        <span>Google Meet</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">Confirmed Session</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleParentCancelSlot(slot.id)}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                      title="Cancel this conference booking to free the slot"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. VERIFIABLE INTERVENTION NOTES FEED                                */}
      {/* ===================================================================== */}
      {activeSubTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Verifiable Parent-Faculty Communication Feed
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Notes flagged as evidence stream directly into Aarav&apos;s Focus Table intervention ledger.
              </p>
            </div>
            <button
              onClick={() => {
                setTargetTeacher(homeroomTeacher);
                setNoteModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Compose Note
            </button>
          </div>

          <div className="space-y-3">
            {notes.map((note) => (
              <div 
                key={note.id}
                className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        note.interaction_scope === 'HOMEROOM_CLASS'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {note.interaction_scope === 'HOMEROOM_CLASS' ? 'Homeroom' : 'Subject: Mathematics'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        To: {note.teacher_name}
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-mono">
                      {note.created_at}
                    </span>
                  </div>

                  {note.is_focus_table_evidence && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      Focus Table Intervention Evidence
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 leading-relaxed">
                  &ldquo;{note.content}&rdquo;
                </p>

                {note.focus_concept_tag && (
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Target Concept Tag: <strong>{note.focus_concept_tag}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: SEND PARENT NOTE                                            */}
      {/* ===================================================================== */}
      {noteModalOpen && (
        <div 
          onClick={() => setNoteModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-bold">
                  Direct Parent Connection
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  Send Note to {targetTeacher.name}
                </h3>
              </div>
              <button
                onClick={() => setNoteModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Selected Recipient Faculty
                </label>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{targetTeacher.name}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{targetTeacher.subject}</span>
                </div>
              </div>

              {targetTeacher.scopeType === 'SUBJECT_SPECIFIC' && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>The Homeroom Class Teacher (Mrs. Ananya Verma) is automatically CC&apos;d for audit transparency.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category of Note
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'ACADEMIC_CONCERN', label: 'Academic Concern' },
                    { id: 'APPRECIATION', label: 'Appreciation' },
                    { id: 'BEHAVIORAL', label: 'Behavioral & Conduct' },
                    { id: 'PTM_FOLLOWUP', label: 'PTM Follow-up' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNoteCategory(cat.id as any)}
                      className={`p-2.5 rounded-xl text-left font-bold border transition-colors cursor-pointer ${
                        noteCategory === cat.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail your question, homework clarification, or observation..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Closed-Loop Focus Table Switch */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEvidenceForFocusTable}
                    onChange={(e) => setIsEvidenceForFocusTable(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    Sync as Verifiable Evidence into Aarav&apos;s Focus Table
                  </span>
                </label>

                {isEvidenceForFocusTable && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                      Focus Target Concept:
                    </span>
                    <input
                      type="text"
                      value={focusConceptTag}
                      onChange={(e) => setFocusConceptTag(e.target.value)}
                      className="w-full rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noteSending}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{noteSending ? 'Dispatching...' : 'Dispatch Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: 10-MIN PTM BOOKING & 20-MIN SIBLING CHAINING                 */}
      {/* ===================================================================== */}
      {ptmModalOpen && selectedSlotForBooking && (
        <div 
          onClick={() => setPtmModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-bold">
                  Strict 10-Minute Atomic Slot
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  Book Conference with {targetTeacher.name}
                </h3>
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                  ⏰ {selectedSlotForBooking.start_time} – {selectedSlotForBooking.end_time}
                </span>
              </div>
              <button
                onClick={() => setPtmModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {ptmBookingSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  PTM Conference Reserved!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Your atomic slot has been locked across all sections and synced with Focus Table diagnostic telemetry.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* ISOLATED ATOMIC SESSION INFO */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Student &amp; Class</span>
                    <span className="font-black text-slate-900 dark:text-white">{studentName} ({className || (isPrimaryKid ? 'Class 3-A' : 'Class 8-B')})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Faculty Member</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{targetTeacher.name}</span>
                  </div>
                </div>

                <form onSubmit={handleBookSingleSlot} className="space-y-4">
                  {/* Focus Table Agenda Linking */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Focus Table Agenda Items (Closed-Loop Sync):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Algebraic Fractions & Signs',
                        'Midterm Unit Test Review',
                        'Class Attendance Stability',
                        'Physics Optics Ray Diagrams'
                      ].map((concept, idx) => {
                        const isSelected = selectedAgendas.includes(concept);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleAgendaPill(concept)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '} {concept}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">Automated Conference Link:</span>
                    <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-semibold">
                      <Video className="h-3.5 w-3.5" />
                      <span>Encrypted Google Meet Link generated automatically upon confirmation</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPtmModalOpen(false)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Reserve Single 10-Min Slot</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
