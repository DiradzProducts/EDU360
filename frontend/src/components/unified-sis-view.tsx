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
  GraduationCap,
  AlertTriangle,
  ChevronDown,
  Send,
  Lock
} from 'lucide-react';
import { Student, ExitClearance } from '@/lib/types';
import { api } from '@/lib/api';
import { ExitClearanceView } from '@/components/exit-clearance-modal';
import { LogOut, Library, FlaskConical } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'academics' | 'remarks' | 'attendance' | 'vault' | 'fees' | 'exit'>('profile');
  
  // Exit Clearance State (Admin Exclusive)
  const [exitClearance, setExitClearance] = useState<ExitClearance | null>(null);
  const [loadingExit, setLoadingExit] = useState(false);
  const [initiatingExit, setInitiatingExit] = useState(false);
  
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

  // Subject-Wise Attendance Breakdown & Parent Leave Request State
  const [selectedSubjectLog, setSelectedSubjectLog] = useState<string | null>(null);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [leaveCategory, setLeaveCategory] = useState<'Medical' | 'Family Emergency' | 'Bereavement' | 'Personal'>('Medical');
  const [leaveFromDate, setLeaveFromDate] = useState('2026-11-05');
  const [leaveToDate, setLeaveToDate] = useState('2026-11-06');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccessNotice, setLeaveSuccessNotice] = useState<string | null>(null);
  const [excusedCount, setExcusedCount] = useState(3);
  // Effective student ID
  const effectiveStudentId = student?.id || studentId;
  const isDemoStudent = effectiveStudentId === 1;

  const [loadedStudent, setLoadedStudent] = useState<Student | null>(student || null);

  useEffect(() => {
    if (student) {
      setLoadedStudent(student);
    } else {
      api.getStudentById(effectiveStudentId).then(res => {
        if (res) setLoadedStudent(res);
      }).catch(() => {});
    }
  }, [effectiveStudentId, student]);

  const activeStudent = loadedStudent || student;

  const [certificates, setCertificates] = useState(() => isDemoStudent ? [
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
  ] : []);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Student base info (derived or fallback)
  const currentStudentName = activeStudent?.name || (isDemoStudent ? 'Aarav Sharma' : 'Student Enrollee');
  const currentClass = activeStudent?.class_name || 'Class 8';
  const currentSection = activeStudent?.section || (isDemoStudent ? 'B' : 'A');
  const currentRoll = activeStudent?.roll_no || (isDemoStudent ? '14' : String(effectiveStudentId));
  const currentAdmissionNo = activeStudent?.admission_no || (isDemoStudent ? 'EDU-2024-082' : `EDU-2026-${effectiveStudentId}`);
  const currentAttendance = activeStudent?.attendance_pct !== undefined && activeStudent?.attendance_pct !== null
    ? activeStudent.attendance_pct
    : (isDemoStudent ? 94.2 : 100);
  const currentAcademicAvg = activeStudent?.academic_average_pct !== undefined && activeStudent?.academic_average_pct !== null
    ? activeStudent.academic_average_pct
    : (isDemoStudent ? 88.8 : null);

  const guardianName = activeStudent?.guardian_name || (isDemoStudent ? 'Mr. Rajesh Sharma' : 'Guardian');
  const guardianPhone = activeStudent?.guardian_phone || (isDemoStudent ? '+91 98111 00003' : '—');
  const guardianEmail = activeStudent?.guardian_email || (isDemoStudent ? 'rajesh.sharma@example.com' : '—');

  useEffect(() => {
    const list = getRemarksForStudent(studentId);
    setRemarks(list);
  }, [studentId]);

  useEffect(() => {
    if (viewerRole === 'admin') {
      setLoadingExit(true);
      api.getStudentExitClearance(effectiveStudentId).then(cl => {
        setExitClearance(cl);
        setLoadingExit(false);
      }).catch(() => setLoadingExit(false));
    }
  }, [effectiveStudentId, viewerRole]);

  const handleInitiateExit = async () => {
    setInitiatingExit(true);
    try {
      const res = await api.initiateExitClearance(effectiveStudentId);
      if (res && res.clearance) {
        setExitClearance(res.clearance);
        triggerToast(`Exit clearance protocol initiated for ${currentStudentName}!`);
      }
    } catch (err) {
      triggerToast('Failed to initiate exit clearance');
    } finally {
      setInitiatingExit(false);
    }
  };

  const handleVerifyPhysicalExit = async (scanUrl?: string) => {
    if (!exitClearance) return;
    await api.verifyPhysicalSign(exitClearance.id, scanUrl);
    const updated = await api.getStudentExitClearance(effectiveStudentId);
    setExitClearance(updated);
    triggerToast('Physical handover register scan verified & locked in legal vault');
  };

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
    ] : []),
    ...(viewerRole === 'admin' ? [
      { id: 'exit', label: 'Exit Clearance & TC Vault', icon: LogOut }
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
                <span>Guardian: <strong className="text-slate-700 dark:text-slate-200">{guardianName} ({guardianPhone})</strong></span>
                <span>•</span>
                <span>Board: <strong className="text-slate-700 dark:text-slate-200">CBSE Affiliation #103049</strong></span>
              </div>
            </div>
          </div>

          {/* KPI Badges */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3 min-w-[100px] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {isDemoStudent ? `${currentAttendance}%` : '—'}
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3 min-w-[100px] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Avg</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                {isDemoStudent ? (currentAcademicAvg !== null ? `${currentAcademicAvg}%` : 'Enrolled') : '—'}
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3 min-w-[100px] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fee Status</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {isDemoStudent ? '₹18,500' : 'Clear ✓'}
              </span>
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
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{guardianName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{isDemoStudent ? 'Sr. Director, Enterprise Technology' : 'Registered Parent & Legal Guardian'}</p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{guardianPhone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>{guardianEmail}</span>
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
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{isDemoStudent ? 'Mrs. Priya Sharma' : 'Secondary Emergency Contact'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{isDemoStudent ? 'Management Consultant' : 'Primary guardian serves as primary contact'}</p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-purple-500 shrink-0" />
                  <span>{isDemoStudent ? '+91 98450 99881' : guardianPhone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Mail className="h-4 w-4 text-purple-500 shrink-0" />
                  <span>{isDemoStudent ? 'priya.sharma@consulting.com' : guardianEmail}</span>
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
        const subjectsList = isDemoStudent ? (isJuniorTier ? [
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
        ]) : [
          { subject: 'Mathematics', marks: '—', max: 100, grade: 'Pending', teacher: 'Mrs. Ananya Verma' },
          { subject: 'Science (PCB)', marks: '—', max: 100, grade: 'Pending', teacher: 'Dr. K. Raman' },
          { subject: 'English Communicative', marks: '—', max: 100, grade: 'Pending', teacher: 'Ms. Shweta Iyer' },
          { subject: 'Social Science', marks: '—', max: 100, grade: 'Pending', teacher: 'Mr. P. Roy' },
          { subject: 'Hindi Course-B', marks: '—', max: 100, grade: 'Pending', teacher: 'Mrs. M. Sharma' },
          { subject: 'Information Technology', marks: '—', max: 100, grade: 'Pending', teacher: 'Mr. Rajesh K' }
        ];

        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Performance Breakdown &bull; {currentClass}-{currentSection}</h3>
                  <p className="text-xs text-slate-500">
                    {isDemoStudent ? 'Term 1 Periodic Assessment official subject-wise marks' : 'Official assessments scheduled during upcoming periodic examinations'}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                  isDemoStudent
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                }`}>
                  {isDemoStudent ? (isJuniorTier ? 'Star Performer (96.5%)' : 'Term 1 Rank #4 (88.8%)') : 'Newly Enrolled • Pending Evaluation'}
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
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all" 
                        style={{ width: typeof sub.marks === 'number' ? `${(sub.marks / sub.max) * 100}%` : '0%' }} 
                      />
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
      {/* TAB 4: ATTENDANCE & BIOMETRICS (SUBJECT-WISE BREAKDOWN)  */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (() => {
        const subjectAttendanceData = isDemoStudent ? [
          {
            subject: 'Mathematics',
            code: 'MATH-801',
            faculty: 'Mrs. Ananya Verma',
            period: 'Period 1 (08:30 AM)',
            total: 26,
            onTime: 18,
            lateCount: 5,
            avgLateMins: 14.2,
            excused: 2,
            unexcused: 1,
            healthPct: 76.9,
            statusTier: 'warning',
            incidents: [
              { date: 'Nov 04, 2026', time: '08:44 AM', elapsed: 14.2, status: 'Late', note: 'Joined at +14.2m (>10m rule exceeded).', action: 'Pending Faculty Review' },
              { date: 'Nov 02, 2026', time: '08:52 AM', elapsed: 22.0, status: 'Absent', note: 'Session locked at +22m (>20m limit). Video recording available in portal.', action: 'Session Locked (Unexcused)' },
              { date: 'Oct 28, 2026', time: '08:42 AM', elapsed: 12.0, status: 'Present', note: 'Route #4 school bus mechanical delay.', action: 'Approved by Mrs. Verma' },
              { date: 'Oct 24, 2026', time: '08:45 AM', elapsed: 15.0, status: 'Late', note: 'Device Wi-Fi reconnect lag.', action: 'Flagged Late (+15m)' },
              { date: 'Oct 19, 2026', time: '—', elapsed: 0, status: 'Excused', note: 'Parent Medical Slip #MED-891 approved.', action: 'Excused Leave (Doctor Note)' }
            ]
          },
          {
            subject: 'Physics',
            code: 'PHYS-802',
            faculty: 'Dr. Rajesh Rao',
            period: 'Period 2 (09:30 AM)',
            total: 22,
            onTime: 19,
            lateCount: 2,
            avgLateMins: 11.5,
            excused: 1,
            unexcused: 0,
            healthPct: 95.5,
            statusTier: 'healthy',
            incidents: [
              { date: 'Oct 30, 2026', time: '09:41 AM', elapsed: 11.5, status: 'Present', note: 'Lab transition buffer.', action: 'Approved by Dr. Rao' },
              { date: 'Oct 16, 2026', time: '09:42 AM', elapsed: 12.0, status: 'Late', note: 'Joined at +12m.', action: 'Flagged Late' }
            ]
          },
          {
            subject: 'Chemistry',
            code: 'CHEM-803',
            faculty: 'Mr. Vikram Seth',
            period: 'Period 4 (11:30 AM)',
            total: 20,
            onTime: 20,
            lateCount: 0,
            avgLateMins: 0,
            excused: 0,
            unexcused: 0,
            healthPct: 100.0,
            statusTier: 'perfect',
            incidents: []
          },
          {
            subject: 'English Literature',
            code: 'ENG-804',
            faculty: 'Ms. Priya Sen',
            period: 'Period 5 (01:15 PM)',
            total: 24,
            onTime: 22,
            lateCount: 1,
            avgLateMins: 12.0,
            excused: 1,
            unexcused: 0,
            healthPct: 95.8,
            statusTier: 'healthy',
            incidents: [
              { date: 'Oct 21, 2026', time: '01:27 PM', elapsed: 12.0, status: 'Present', note: 'Debate council duty clearance.', action: 'Approved by Ms. Sen' }
            ]
          },
          {
            subject: 'Computer Science',
            code: 'CS-805',
            faculty: 'Mrs. Neha Gupta',
            period: 'Period 6 (02:15 PM)',
            total: 18,
            onTime: 18,
            lateCount: 0,
            avgLateMins: 0,
            excused: 0,
            unexcused: 0,
            healthPct: 100.0,
            statusTier: 'perfect',
            incidents: []
          }
        ] : [
          {
            subject: 'Mathematics',
            code: 'MATH-801',
            faculty: 'Mrs. Ananya Verma',
            period: 'Period 1 (08:30 AM)',
            total: 0,
            onTime: 0,
            lateCount: 0,
            avgLateMins: 0,
            excused: 0,
            unexcused: 0,
            healthPct: null,
            statusTier: 'healthy',
            incidents: []
          },
          {
            subject: 'Physics',
            code: 'PHYS-802',
            faculty: 'Dr. Rajesh Rao',
            period: 'Period 2 (09:30 AM)',
            total: 0,
            onTime: 0,
            lateCount: 0,
            avgLateMins: 0,
            excused: 0,
            unexcused: 0,
            healthPct: null,
            statusTier: 'healthy',
            incidents: []
          },
          {
            subject: 'Chemistry',
            code: 'CHEM-803',
            faculty: 'Mr. Vikram Seth',
            period: 'Period 4 (11:30 AM)',
            total: 0,
            onTime: 0,
            lateCount: 0,
            avgLateMins: 0,
            excused: 0,
            unexcused: 0,
            healthPct: null,
            statusTier: 'healthy',
            incidents: []
          },
          {
            subject: 'English Literature',
            code: 'ENG-804',
            faculty: 'Ms. Priya Sen',
            period: 'Period 5 (01:15 PM)',
            total: 0,
            onTime: 0,
            lateCount: 0,
            avgLateMins: 0,
            excused: 0,
            unexcused: 0,
            healthPct: null,
            statusTier: 'healthy',
            incidents: []
          },
          {
            subject: 'Computer Science',
            code: 'CS-805',
            faculty: 'Mrs. Neha Gupta',
            period: 'Period 6 (02:15 PM)',
            total: 0,
            onTime: 0,
            lateCount: 0,
            avgLateMins: 0,
            excused: 0,
            unexcused: 0,
            healthPct: null,
            statusTier: 'healthy',
            incidents: []
          }
        ];

        const activeSubject = subjectAttendanceData.find(s => s.subject === selectedSubjectLog);

        return (
          <div className="space-y-6">
            {/* Success Toast for Leave Application */}
            {leaveSuccessNotice && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{leaveSuccessNotice}</span>
                </div>
                <button 
                  onClick={() => setLeaveSuccessNotice(null)}
                  className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-700 dark:text-emerald-300 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* 1. TOP STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">Overall Net Rate</span>
                <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
                  {isDemoStudent ? `${currentAttendance}%` : '—'}
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono block mt-0.5">
                  {isDemoStudent ? 'Healthy • Active' : 'Enrolled • Active'}
                </span>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">Total Classes</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {isDemoStudent ? '110' : '0'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Across 5 Subjects</span>
              </div>
              <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">Late Marks (&gt;10m)</span>
                <span className="text-2xl font-black text-amber-800 dark:text-amber-200">
                  {isDemoStudent ? '8' : '0'}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block mt-0.5">
                  {isDemoStudent ? 'Avg: +13.5 mins' : 'Zero Infractions'}
                </span>
              </div>
              <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">Excused Leaves</span>
                <span className="text-2xl font-black text-blue-800 dark:text-blue-200">
                  {isDemoStudent ? excusedCount : 0}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono block mt-0.5">Parent Approved</span>
              </div>
              <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center shadow-sm col-span-2 sm:col-span-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 block">Unexcused Bunk</span>
                <span className="text-2xl font-black text-rose-800 dark:text-rose-200">
                  {isDemoStudent ? '1' : '0'}
                </span>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono block mt-0.5">
                  {isDemoStudent ? 'Session Locked' : 'No Lockouts'}
                </span>
              </div>
            </div>

            {/* 2. SUBJECT-WISE PUNCTUALITY BREAKDOWN TABLE */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Subject-Wise Punctuality Ledger &bull; Term 1 (2026-27)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
                      Live Roster Audit
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Granular breakdown of punctuality, 10-minute late stipulation executions, and parental excused absence logs.
                  </p>
                </div>

                {/* Parent Action Button */}
                <button
                  onClick={() => setShowApplyLeaveModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20 self-start sm:self-auto shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Apply Parent Leave Request</span>
                </button>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Subject & Faculty</th>
                      <th className="py-3 px-2 text-center">Sessions Held</th>
                      <th className="py-3 px-2 text-center">On-Time (≤10m)</th>
                      <th className="py-3 px-2 text-center">Late Mark (&gt;10m)</th>
                      <th className="py-3 px-2 text-center">Excused Leave</th>
                      <th className="py-3 px-2 text-center">Unexcused (Absent)</th>
                      <th className="py-3 px-2 text-center">Punctuality Score</th>
                      <th className="py-3 px-3 text-right">Detailed Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {subjectAttendanceData.map((sub) => (
                      <tr 
                        key={sub.code}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Subject & Faculty */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{sub.subject}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">({sub.code})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal">
                            {sub.faculty} &bull; <span className="font-mono text-[10px]">{sub.period}</span>
                          </div>
                        </td>

                        {/* Sessions Held */}
                        <td className="py-3.5 px-2 text-center font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {sub.total}
                        </td>

                        {/* On-Time */}
                        <td className="py-3.5 px-2 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px] border border-emerald-500/20">
                            <Check className="h-3 w-3" />
                            <span>{sub.onTime}</span>
                          </span>
                        </td>

                        {/* Late Mark */}
                        <td className="py-3.5 px-2 text-center">
                          {sub.lateCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold font-mono text-[11px] border border-amber-500/25">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{sub.lateCount} Late</span>
                              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono">(+{sub.avgLateMins}m)</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">—</span>
                          )}
                        </td>

                        {/* Excused Leave */}
                        <td className="py-3.5 px-2 text-center">
                          {sub.excused > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold font-mono text-[11px] border border-blue-500/25">
                              <span>🔵 {sub.excused} Days</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">—</span>
                          )}
                        </td>

                        {/* Unexcused Absent */}
                        <td className="py-3.5 px-2 text-center">
                          {sub.unexcused > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold font-mono text-[11px] border border-rose-500/25">
                              <Lock className="h-3 w-3" />
                              <span>{sub.unexcused} Locked</span>
                            </span>
                          ) : (
                            <span className="text-emerald-500 font-mono text-xs">0</span>
                          )}
                        </td>

                        {/* Punctuality Score */}
                        <td className="py-3.5 px-2 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                            sub.statusTier === 'perfect' 
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : sub.statusTier === 'healthy'
                                ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                                : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/35 ring-1 ring-amber-500/20'
                          }`}>
                            {sub.healthPct !== null ? `${sub.healthPct}%` : '—'}
                          </span>
                        </td>

                        {/* Action: View Incident Log */}
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedSubjectLog(sub.subject)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          >
                            <span>View Incidents</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. INTERACTIVE SUBJECT INCIDENTS DRILL-DOWN MODAL */}
            {activeSubject && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-black uppercase">
                          {activeSubject.code}
                        </span>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          {activeSubject.subject} &bull; Attendance Incident Log
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Faculty: <strong className="text-slate-700 dark:text-slate-300">{activeSubject.faculty}</strong> &bull; Scheduled {activeSubject.period}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedSubjectLog(null)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Incident Records Timeline */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {activeSubject.incidents.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                          {isDemoStudent ? 'Flawless Punctuality Record' : 'Clean Attendance Record'}
                        </h5>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          {isDemoStudent 
                            ? `Student has zero late marks, zero lockouts, and 100% on-time attendance across all sessions in ${activeSubject.subject}.`
                            : `No attendance incidents, infractions, or unexcused absences recorded for ${activeSubject.subject}.`}
                        </p>
                      </div>
                    ) : (
                      activeSubject.incidents.map((inc, idx) => (
                        <div 
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{inc.date}</span>
                              <span className="text-[11px] text-slate-400 font-mono">({inc.time})</span>
                              {inc.elapsed > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
                                  +{inc.elapsed}m into lecture
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                              {inc.note}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                              inc.status === 'Present'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : inc.status === 'Late'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                  : inc.status === 'Excused'
                                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            }`}>
                              {inc.action}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => setSelectedSubjectLog(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      Close Incident Log
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. APPLY PARENT LEAVE REQUEST MODAL */}
            {showApplyLeaveModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        Parent Leave Application
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Submit authorized leave request. Approved leaves protect attendance standing and bypass panic alerts.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowApplyLeaveModal(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setExcusedCount(prev => prev + 1);
                      setShowApplyLeaveModal(false);
                      setLeaveSuccessNotice(`Leave request for ${leaveFromDate} to ${leaveToDate} (${leaveCategory}) submitted successfully! Class Teachers notified.`);
                      setLeaveReason('');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Reason Category
                      </label>
                      <select 
                        value={leaveCategory}
                        onChange={(e: any) => setLeaveCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="Medical">Medical (Illness / Doctor Appointment / Prescription)</option>
                        <option value="Family Emergency">Family Emergency / Unforeseen Urgent Event</option>
                        <option value="Bereavement">Bereavement / Family Loss</option>
                        <option value="Personal">Personal / Authorized Event Representation</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          From Date
                        </label>
                        <input 
                          type="date"
                          value={leaveFromDate}
                          onChange={e => setLeaveFromDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          To Date
                        </label>
                        <input 
                          type="date"
                          value={leaveToDate}
                          onChange={e => setLeaveToDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Parental Notes / Clinical Explanation
                      </label>
                      <textarea
                        rows={3}
                        value={leaveReason}
                        onChange={e => setLeaveReason(e.target.value)}
                        placeholder="e.g. Aarav was diagnosed with seasonal viral fever. Prescribed 2 days bed rest by Dr. Sharma. Medical certificate attached."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] leading-relaxed">
                      💡 <strong>Excused Absence Protection:</strong> Approved requests auto-mark live session rosters as <em>"Excused"</em>. Your child will not trigger disciplinary truancy alerts and will receive full access to all asynchronous lecture recordings.
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowApplyLeaveModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Leave Application</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      })()}


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
              {certificates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 p-8 text-center space-y-2">
                  <FileText className="h-8 w-8 text-slate-400 mx-auto opacity-60" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No Official Documents or Certificates In Vault Yet
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Official bonafide study certificates, character endorsements, and transfer documentation will appear here once issued.
                  </p>
                </div>
              ) : (
                certificates.map(cert => (
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
              )))}
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

            {!isDemoStudent ? (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 p-8 text-center space-y-2">
                <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Accounts &amp; Tuition Clearance: Up to Date
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No outstanding institutional fee dues. Fee receipts and future term invoices will appear here.
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'exit' && viewerRole === 'admin' && (
        <div className="space-y-6">
          {exitClearance ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    TC
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Active Transfer Certificate (TC) Protocol in Progress
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Student is registered in the School Exit Clearance pipeline. Complete dual-verification below.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-3 py-1 text-xs font-bold border border-blue-200 dark:border-blue-700">
                  {exitClearance.status}
                </span>
              </div>

              <ExitClearanceView
                clearance={exitClearance}
                role="admin"
                onVerifyPhysical={handleVerifyPhysicalExit}
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold border border-rose-200 dark:border-rose-800">
                      Admin Authority Exclusive
                    </span>
                    <span className="text-xs text-slate-400">CBSE Rule 44 Statutory Compliance</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    🎓 Initiate Exit Clearance &amp; Transfer Certificate (TC)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Initiate permanent school-leaving workflow for <strong className="text-slate-800 dark:text-slate-200">{currentStudentName}</strong> ({currentClass} - {currentSection}, Roll #{currentRoll}).
                  </p>
                </div>

                <button
                  onClick={handleInitiateExit}
                  disabled={initiatingExit}
                  className="flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-xs font-bold shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{initiatingExit ? 'Initiating Exit...' : 'Initiate Exit Clearance & Issue TC'}</span>
                </button>
              </div>

              {/* 4-Department Pre-Clearance Audit Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Automated Multi-Department Clearance Pre-Audit
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Fee &amp; Accounts</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">₹0 Outstanding Dues Verified</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Library className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Library Holdings</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">0 Active Book Holds (Returned)</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <FlaskConical className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Laboratory Assets</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Science &amp; Comp Lab Cleared</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Academic Records</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Mark Memo &amp; Standing Ready</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informational Workflow Callout */}
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">Next Steps upon Initiation:</strong>
                  <p className="text-amber-800 dark:text-amber-300">
                    1. Student will be enrolled into the active <strong>School Exit Clearance Ledger</strong> (accessible via Admin Portal &rarr; Student TC).
                  </p>
                  <p className="text-amber-800 dark:text-amber-300">
                    2. The linked parent ({student?.guardian_name || 'Parent/Guardian'}) will see an immediate <strong>In-App Digital Sign-off Banner</strong> on their Parent Dashboard.
                  </p>
                  <p className="text-amber-800 dark:text-amber-300">
                    3. Once the parent provides digital approval and school admin uploads the signed physical register handover scan, the exit record will be permanently locked in the legal vault.
                  </p>
                </div>
              </div>
            </div>
          )}
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
