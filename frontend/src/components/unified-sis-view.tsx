'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Users, 
  BookOpen, 
  MessageSquareQuote, 
  CalendarCheck, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  Plus, 
  X, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  HeartPulse, 
  Bus, 
  Award, 
  Sparkles, 
  Filter, 
  Calendar,
  ExternalLink,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Student } from '@/lib/types';
import { StudentRemark, getRemarksForStudent } from '@/lib/student-remarks';
import { downloadOfficialDocumentFile } from '@/lib/export-utils';

export interface UnifiedSISProps {
  studentId?: number;
  student?: Student | null;
  viewerRole: 'admin' | 'teacher' | 'parent' | 'student' | 'coordinator';
  onBack?: () => void;
  hideBack?: boolean;
}

export function UnifiedSISView({ studentId = 1, student, viewerRole, onBack, hideBack }: UnifiedSISProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'academics' | 'remarks' | 'attendance' | 'vault' | 'fees'>('profile');
  
  // Remarks state
  const [remarks, setRemarks] = useState<StudentRemark[]>([]);
  const [remarkFilter, setRemarkFilter] = useState<string>('All');
  const [showAddRemarkModal, setShowAddRemarkModal] = useState(false);
  const [newRemarkCategory, setNewRemarkCategory] = useState<StudentRemark['category']>('Academic Excellence');
  const [newRemarkPriority, setNewRemarkPriority] = useState<StudentRemark['priority']>('Routine');
  const [newRemarkText, setNewRemarkText] = useState('');

  // Admin certificate upload state
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [certTitle, setCertTitle] = useState('Transfer Certificate (TC / SLC)');
  const [certRefNo, setCertRefNo] = useState('EDU-TC-2026-0881');
  const [certRemarks, setCertRemarks] = useState('Clearance completed across Academic, Sports, and Accounts desks.');
  const [certificates, setCertificates] = useState([
    {
      id: 'cert-1',
      title: 'Transfer Certificate (TC / School Leaving Certificate)',
      category: 'Exit Protocols',
      issuedBy: 'Fr. George Varghese (Principal)',
      issueDate: '24 Oct 2026',
      referenceNumber: 'EDU-TC-2026-0881',
      status: 'Clearance Approved',
      description: 'Official transfer certificate with complete academic clearance & conduct endorsement.'
    },
    {
      id: 'cert-2',
      title: 'Bonafide Student & Study Certificate',
      category: 'Identity & Enrollment',
      issuedBy: 'Central Administration Desk',
      issueDate: '15 Jul 2026',
      referenceNumber: 'EDU-BNF-2026-0042',
      status: 'Verified & Active',
      description: 'Institutional certification confirming active full-time enrollment in Class 8-B.'
    },
    {
      id: 'cert-3',
      title: 'Character & Moral Conduct Certificate',
      category: 'Exit Protocols',
      issuedBy: 'Discipline & Academic Committee',
      issueDate: '22 Oct 2026',
      referenceNumber: 'EDU-CND-2026-0199',
      status: 'Verified & Active',
      description: 'Exemplary moral character, peer collaboration, and sportsmanship record.'
    },
    {
      id: 'cert-4',
      title: 'Municipal Birth Certificate (Primary Vital Record)',
      category: 'Identity & Enrollment',
      issuedBy: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
      issueDate: '18 May 2012',
      referenceNumber: 'BBMP-BTH-2012-9841',
      status: 'Verified & Active',
      description: 'Authenticated legal date of birth record verifying student age eligibility.'
    },
    {
      id: 'cert-5',
      title: 'UIDAI Aadhaar Verification Dossier',
      category: 'Identity & Enrollment',
      issuedBy: 'Unique Identification Authority of India',
      issueDate: '10 Jan 2018',
      referenceNumber: 'UIDAI-XXXX-XXXX-4819',
      status: 'Verified & Active',
      description: 'Biometrically verified national citizen identity dossier with address proof.'
    }
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Student base info (derived or fallback)
  const currentStudentName = student?.name || 'Aarav Sharma';
  const currentClass = student?.class_name || 'Class 8';
  const currentSection = student?.section || 'B';
  const currentRoll = student?.roll_no || '14';
  const currentAdmissionNo = student?.admission_no || 'EDU-2024-082';
  const currentAttendance = student?.attendance_pct || 94.2;
  const currentAcademicAvg = student?.academic_average_pct || 88.8;

  useEffect(() => {
    const list = getRemarksForStudent(studentId);
    setRemarks(list);
  }, [studentId]);

  // Handle adding new remark (Teacher / Admin)
  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemarkText.trim()) return;

    const newRemark: StudentRemark = {
      id: Date.now(),
      student_id: studentId,
      student_name: currentStudentName,
      author_name: viewerRole === 'admin' ? 'Dr. Sunita Kapoor' : 'Mrs. Ananya Verma',
      author_role: viewerRole === 'admin' ? 'Principal' : 'Class Teacher',
      category: newRemarkCategory,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      remark_text: newRemarkText.trim(),
      priority: newRemarkPriority,
      acknowledged_by_parent: false
    };

    setRemarks(prev => [newRemark, ...prev]);
    setShowAddRemarkModal(false);
    setNewRemarkText('');
    triggerToast('Official faculty observation recorded in student dossier.');
  };

  // Handle parent acknowledging remark
  const handleAcknowledgeRemark = (remarkId: number) => {
    setRemarks(prev => prev.map(r => r.id === remarkId ? {
      ...r,
      acknowledged_by_parent: true,
      parent_ack_by: 'Mr. Rajesh Sharma (Father)',
      parent_ack_date: new Date().toLocaleDateString('en-GB')
    } : r));
    triggerToast('Remark marked as acknowledged by parent.');
  };

  // Handle admin adding certificate
  const handleAddCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCert = {
      id: `cert-${Date.now()}`,
      title: certTitle,
      category: 'Exit Protocols',
      issuedBy: 'Fr. George Varghese (Principal & Center Head)',
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      referenceNumber: certRefNo,
      status: 'Clearance Approved',
      description: certRemarks
    };
    setCertificates(prev => [newCert, ...prev]);
    setShowAddCertModal(false);
    triggerToast(`Official ${certTitle} issued and sealed by Principal!`);
  };

  // Filter remarks
  const filteredRemarks = remarks.filter(r => {
    if (remarkFilter === 'All') return true;
    return r.category.toLowerCase().includes(remarkFilter.toLowerCase());
  });

  // Allowed tabs: 'remarks' is HIDDEN from student
  const tabs = [
    { id: 'profile', label: 'Identity & Demographics', icon: Users },
    { id: 'academics', label: 'Academic Standing & Grades', icon: BookOpen },
    ...(viewerRole !== 'student' ? [
      { id: 'remarks', label: `Faculty Remarks & Conduct (${remarks.length})`, icon: MessageSquareQuote }
    ] : []),
    { id: 'attendance', label: 'Attendance & Biometrics', icon: CalendarCheck },
    { id: 'vault', label: 'Official Documents Vault', icon: FileText },
    ...((viewerRole === 'admin' || viewerRole === 'parent' || viewerRole === 'coordinator') ? [
      { id: 'fees', label: 'Fee & Accounts Ledger', icon: ShieldCheck }
    ] : [])
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-700 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Back Button (if provided) */}
      {onBack && !hideBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Roster Directory</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Viewing as:</span>
            <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
              {viewerRole}
            </span>
          </div>
        </div>
      )}

      {/* Top Profile Hero Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-md shrink-0">
              {currentStudentName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {currentStudentName}
                </h1>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold">
                  {currentClass}-{currentSection}
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-bold">
                  Roll #{currentRoll}
                </span>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active Student
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span>Adm ID: <strong className="text-slate-700 dark:text-slate-200">{currentAdmissionNo}</strong></span>
                <span>•</span>
                <span>Guardian: <strong className="text-slate-700 dark:text-slate-200">Mr. Rajesh Sharma (+91 98111 00003)</strong></span>
                <span>•</span>
                <span>Board: <strong className="text-slate-700 dark:text-slate-200">CBSE Affiliation #103049</strong></span>
              </div>
            </div>
          </div>

          {/* KPI Badges */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3 min-w-[100px] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{currentAttendance}%</span>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3 min-w-[100px] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Avg</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{currentAcademicAvg}%</span>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3 min-w-[100px] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fee Status</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">₹18,500</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 dark:border-slate-800 pt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: IDENTITY & DEMOGRAPHICS                           */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Father & Primary Guardian */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Father &amp; Primary Guardian</span>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                  Verified Primary Contact
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Mr. Rajesh Sharma</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Sr. Director, Enterprise Technology</p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>+91 98111 00003</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>rajesh.sharma@example.com</span>
                </div>
              </div>
            </div>

            {/* Mother & Secondary Guardian */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Mother &amp; Secondary Guardian</span>
                <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-bold">
                  Authorized Emergency Pickup
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Mrs. Priya Sharma</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Management Consultant</p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-purple-500 shrink-0" />
                  <span>+91 98450 99881</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Mail className="h-4 w-4 text-purple-500 shrink-0" />
                  <span>priya.sharma@consulting.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Medical Profile & Emergency Clearance */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <HeartPulse className="h-4 w-4 text-rose-500" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Medical Profile &amp; Emergency Clearance</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Blood Group</span>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400">B+ (Positive)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Recorded Allergies</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">None reported</span>
                </div>
              </div>
              <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-400">
                <strong>Campus Doctor Clearance:</strong> Annual fitness check cleared on 12 Aug 2026. Certified fit for competitive field athletics.
              </div>
            </div>

            {/* Residential Address & Commute Zone */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Residential Address &amp; Commute Zone</span>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                #42, 4th Cross, Green Glen Layout, Bellandur, Bangalore, Karnataka &bull; PIN: 560103
              </p>
              <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
                <Bus className="h-4 w-4 shrink-0" />
                <span>Designated Transport: <strong>Bus Route #4 (Sarjapur - Bellandur Junction)</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ACADEMIC STANDING & GRADES                        */}
      {/* ======================================================== */}
      {activeTab === 'academics' && (() => {
        const isJuniorTier = studentId === 7 || currentClass.includes('3') || currentClass.toLowerCase().includes('primary');
        const subjectsList = isJuniorTier ? [
          { subject: 'English Reading & Phonics', marks: 98, max: 100, grade: 'A1+', teacher: 'Ms. Priya Nair' },
          { subject: 'Junior Mathematics', marks: 96, max: 100, grade: 'A1+', teacher: 'Mrs. Kavitha Reddy' },
          { subject: 'Environmental Studies (EVS)', marks: 94, max: 100, grade: 'A1', teacher: 'Ms. Priya Nair' },
          { subject: 'Creative Arts & Expression', marks: 100, max: 100, grade: 'O', teacher: 'Mrs. Shalini Sen' },
          { subject: 'Hindi Course', marks: 90, max: 100, grade: 'A1', teacher: 'Mrs. Meenakshi Sundaram' },
          { subject: 'General Knowledge & Values', marks: 96, max: 100, grade: 'A1+', teacher: 'Ms. Priya Nair' }
        ] : [
          { subject: 'Mathematics', marks: 88, max: 100, grade: 'A1', teacher: 'Mrs. Ananya Verma' },
          { subject: 'Science (PCB)', marks: 92, max: 100, grade: 'A1', teacher: 'Dr. K. Raman' },
          { subject: 'English Communicative', marks: 84, max: 100, grade: 'A2', teacher: 'Ms. Shweta Iyer' },
          { subject: 'Social Science', marks: 86, max: 100, grade: 'A2', teacher: 'Mr. P. Roy' },
          { subject: 'Hindi Course-B', marks: 90, max: 100, grade: 'A1', teacher: 'Mrs. M. Sharma' },
          { subject: 'Information Technology', marks: 96, max: 100, grade: 'A1', teacher: 'Mr. Rajesh K' }
        ];

        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Performance Breakdown &bull; {currentClass}-{currentSection}</h3>
                  <p className="text-xs text-slate-500">Term 1 Periodic Assessment official subject-wise marks</p>
                </div>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-xs font-extrabold">
                  {isJuniorTier ? 'Star Performer (96.5%)' : 'Term 1 Rank #4 (88.8%)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {subjectsList.map((sub, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{sub.subject}</span>
                      <span className="rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black px-1.5 py-0.5">
                        {sub.grade}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-slate-900 dark:text-white">{sub.marks}<span className="text-xs text-slate-400">/{sub.max}</span></span>
                      <span className="text-[10px] text-slate-500 font-medium">{sub.teacher}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${sub.marks}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* TAB 3: FACULTY REMARKS & CONDUCT (HIDDEN FROM STUDENT)    */}
      {/* ======================================================== */}
      {activeTab === 'remarks' && viewerRole !== 'student' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Faculty Remarks &amp; Conduct Ledger
                  </h3>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                    Confidential &bull; Faculty &amp; Parent Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official teacher pedagogical annotations, conduct observations, and parental acknowledgments.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <select
                  value={remarkFilter}
                  onChange={e => setRemarkFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-3 py-2 font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Categories</option>
                  <option value="Academic Excellence">Academic Excellence</option>
                  <option value="Behavioral & Conduct">Behavioral &amp; Conduct</option>
                  <option value="Remedial">Remedial Focus Area</option>
                </select>

                {(viewerRole === 'teacher' || viewerRole === 'admin') && (
                  <button
                    onClick={() => setShowAddRemarkModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Faculty Remark</span>
                  </button>
                )}
              </div>
            </div>

            {/* Remarks List */}
            <div className="space-y-3.5">
              {filteredRemarks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No remarks found for the selected filter.
                </div>
              ) : (
                filteredRemarks.map(remark => (
                  <div 
                    key={remark.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {remark.author_name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                          {remark.author_role}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          remark.priority === 'High Attention'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {remark.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {remark.date} &bull; {remark.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      &ldquo;{remark.remark_text}&rdquo;
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2.5 text-[11px]">
                      <div className="flex items-center gap-2">
                        {remark.acknowledged_by_parent ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Acknowledged by Parent: {remark.parent_ack_by} ({remark.parent_ack_date})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            Awaiting Parent Acknowledgment
                          </span>
                        )}
                      </div>

                      {viewerRole === 'parent' && !remark.acknowledged_by_parent && (
                        <button
                          onClick={() => handleAcknowledgeRemark(remark.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-all cursor-pointer"
                        >
                          Acknowledge Note
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ATTENDANCE & BIOMETRICS                           */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Biometric Attendance Ledger &bull; Session 2026-27</h3>
            <p className="text-xs text-slate-500 mb-6">Real-time gate RFID scans and authorized leave records</p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">Attendance Rate</span>
                <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200">{currentAttendance}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">Working Days</span>
                <span className="text-2xl font-black text-blue-800 dark:text-blue-200">87 Days</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">Days Present</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">82 Days</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">Excused Leaves</span>
                <span className="text-2xl font-black text-amber-800 dark:text-amber-200">5 Days</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Today's Biometric Check-in</div>
                  <div className="text-[11px] text-slate-500">Gate #2 RFID Reader &bull; 07:44 AM (On Time)</div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-xs font-bold">
                Present
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: OFFICIAL DOCUMENTS VAULT & CERTIFICATES           */}
      {/* ======================================================== */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Official Legal Certificates &amp; Document Vault
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Transfer Certificates (TC), Study/Bonafide, and conduct certificates. {viewerRole === 'admin' ? '(Admin Exclusive Edit & Issue Authority)' : '(Read-only verified archive)'}
                </p>
              </div>

              {viewerRole === 'admin' && (
                <button
                  onClick={() => setShowAddCertModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Issue / Upload Legal Certificate</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {certificates.map(cert => (
                <div 
                  key={cert.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cert.title}</h4>
                        <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                          {cert.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Ref: <strong className="text-slate-700 dark:text-slate-300 font-mono">{cert.referenceNumber}</strong> &bull; Issued: {cert.issueDate} by {cert.issuedBy}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {cert.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => {
                        downloadOfficialDocumentFile(currentStudentName, cert.title);
                        triggerToast(`Downloaded ${cert.title} PDF.`);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-blue-600" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: FEE & ACCOUNTS LEDGER                             */}
      {/* ======================================================== */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Academic Fee Ledger &bull; Session 2026-27</h3>
            <p className="text-xs text-slate-500 mb-6">Tuition, lab facilities, and bus transportation clearance schedule</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Annual Fee Structure</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">₹1,45,000</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Total Realized</span>
                <span className="text-xl font-black text-emerald-800 dark:text-emerald-200 block mt-0.5">₹1,26,500</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">Outstanding Balance</span>
                <span className="text-xl font-black text-amber-800 dark:text-amber-200 block mt-0.5">₹18,500</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Term 1 Composite Tuition &amp; Lab Fee</div>
                  <div className="text-[11px] text-slate-500">Paid on 10 Jul 2026 via UPI (Ref: EDU-RCP-8801)</div>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 block">₹72,500 Paid</span>
                  <span className="text-[10px] text-slate-400">Receipt Available</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Term 2 Composite Fee &bull; Partial Installment</div>
                  <div className="text-[11px] text-slate-500">Paid on 05 Oct 2026 via Bank POS (Ref: EDU-RCP-9142)</div>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 block">₹54,000 Paid</span>
                  <span className="text-[10px] text-amber-500 font-bold">₹18,500 Balance Due 15 Nov</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD FACULTY REMARK (TEACHER / ADMIN)              */}
      {/* ======================================================== */}
      {showAddRemarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquareQuote className="h-4 w-4 text-blue-600" />
                Add Official Faculty Observation
              </h3>
              <button onClick={() => setShowAddRemarkModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddRemark} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newRemarkCategory}
                  onChange={e => setNewRemarkCategory(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                >
                  <option value="Academic Excellence">Academic Excellence</option>
                  <option value="Behavioral & Conduct">Behavioral &amp; Conduct</option>
                  <option value="Remedial / Focus Area">Remedial / Focus Area</option>
                  <option value="Special Commendation">Special Commendation</option>
                  <option value="Sports & Leadership">Sports &amp; Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Attention</label>
                <select
                  value={newRemarkPriority}
                  onChange={e => setNewRemarkPriority(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                >
                  <option value="Routine">Routine Observation</option>
                  <option value="Commendation">Commendation / Praise</option>
                  <option value="High Attention">High Attention (Parent Consultation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Observation Remarks *</label>
                <textarea
                  rows={4}
                  value={newRemarkText}
                  onChange={e => setNewRemarkText(e.target.value)}
                  placeholder="Enter objective pedagogical or conduct notes..."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRemarkModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  Save Remark to Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADMIN ISSUE LEGAL CERTIFICATE                     */}
      {/* ======================================================== */}
      {showAddCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                Admin Official Certificate Issuance
              </h3>
              <button onClick={() => setShowAddCertModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddCertificate} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Certificate Type</label>
                <select
                  value={certTitle}
                  onChange={e => setCertTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                >
                  <option value="Transfer Certificate (TC / SLC)">Transfer Certificate (TC / School Leaving)</option>
                  <option value="Bonafide & Study Certificate">Bonafide &amp; Study Certificate</option>
                  <option value="Conduct & Character Certificate">Conduct &amp; Character Certificate</option>
                  <option value="No Objection Certificate (NOC)">No Objection Certificate (NOC)</option>
                  <option value="Sports Representation Clearance">Sports Representation Clearance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official Reference Number</label>
                <input
                  type="text"
                  value={certRefNo}
                  onChange={e => setCertRefNo(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Principal Endorsement / Remarks</label>
                <textarea
                  rows={3}
                  value={certRemarks}
                  onChange={e => setCertRemarks(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCertModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                >
                  Affix Seal &amp; Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
