'use client';

import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  FileText, 
  Upload, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Phone, 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  X, 
  ShieldCheck, 
  BookOpen, 
  Award, 
  User,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  HeartPulse
} from 'lucide-react';
import { Student, StaffMemberItem, OfficialDocument, FeeDefaulter } from '@/lib/types';

interface AdminSisDirectoryProps {
  students: Student[];
  documents: OfficialDocument[];
  feeDefaulters: FeeDefaulter[];
  onOpenUploadDocForStudent: (studentId: number) => void;
  onPreviewDoc: (doc: OfficialDocument) => void;
  staff?: StaffMemberItem[];
  onOpenIntakeModal?: () => void;
}

export function AdminSisDirectory({
  students,
  documents,
  feeDefaulters,
  onOpenUploadDocForStudent,
  onPreviewDoc,
}: AdminSisDirectoryProps) {
  // Student Filter States
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Remedial' | 'FeePending'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Full-Screen Dedicated Dossier View State (null = Roster view, Student = Full Screen Dossier)
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<Student | null>(null);
  const [dossierActiveTab, setDossierActiveTab] = useState<'overview' | 'academics' | 'fees' | 'documents'>('overview');

  // Class Teacher Mapping
  const CLASS_TEACHERS: Record<string, string> = {
    'Class 8-B': 'Mrs. Ananya Verma (PGT Mathematics)',
    'Class 8-A': 'Mrs. Neha Roy (TGT Science)',
    'Class 9-A': 'Dr. K. Raman (PGT Physics)',
    'Class 9-B': 'Mr. Vikram Joshi (TGT Social Science)',
    'Class 7-B': 'Ms. Priya Nair (TGT English)',
    'Class 10-A': 'Dr. Suresh Babu (Senior Academic Lead)',
    'Class 6-A': 'Mrs. Lakshmi Narayan (Primary Head)',
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Class filter
      if (selectedClass !== 'All' && s.class_name !== selectedClass) {
        return false;
      }
      // Section filter
      if (selectedSection !== 'All' && s.section !== selectedSection) {
        return false;
      }
      // Status filter
      if (statusFilter === 'Remedial' && (s.academic_average_pct ?? 75) > 70) {
        return false;
      }
      if (statusFilter === 'FeePending') {
        const hasDues = feeDefaulters.some((d) => d.student_name.toLowerCase() === s.name.toLowerCase());
        if (!hasDues) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesRoll = s.roll_no.toLowerCase().includes(q);
        const matchesAdm = s.admission_no.toLowerCase().includes(q);
        const matchesGuardian = s.guardian_name.toLowerCase().includes(q);
        const matchesPhone = s.guardian_phone.includes(q);
        return matchesName || matchesRoll || matchesAdm || matchesGuardian || matchesPhone;
      }
      return true;
    });
  }, [students, selectedClass, selectedSection, statusFilter, searchQuery, feeDefaulters]);

  // Documents by student id
  const getStudentDocs = (studentId: number) => {
    return documents.filter((d) => d.student_id === studentId || d.title.toLowerCase().includes(students.find(s => s.id === studentId)?.name.toLowerCase() || ''));
  };

  // Check if student has fee dues
  const getStudentFeeDue = (studentName: string) => {
    return feeDefaulters.find((d) => d.student_name.toLowerCase() === studentName.toLowerCase());
  };

  // Cohort summary stats
  const cohortStats = useMemo(() => {
    const total = filteredStudents.length;
    const avgAttendance = total > 0
      ? (filteredStudents.reduce((acc, s) => acc + (s.attendance_pct || 90), 0) / total).toFixed(1)
      : '0';
    const remedialCount = filteredStudents.filter((s) => (s.academic_average_pct ?? 75) <= 70).length;
    const feePendingCount = filteredStudents.filter((s) => getStudentFeeDue(s.name) !== undefined).length;
    return { total, avgAttendance, remedialCount, feePendingCount };
  }, [filteredStudents, feeDefaulters]);

  const currentCohortKey = `${selectedClass !== 'All' ? selectedClass : 'Class 8'}-${selectedSection !== 'All' ? selectedSection : 'B'}`;
  const currentClassTeacher = CLASS_TEACHERS[currentCohortKey] || 'Mrs. Ananya Verma (Senior Coordinator)';

  // ────────────────────────────────────────────────────────────
  // 1. FULL-SCREEN DEDICATED STUDENT DOSSIER VIEW
  // ────────────────────────────────────────────────────────────
  if (selectedStudentForDossier) {
    const st = selectedStudentForDossier;
    const isRemedial = (st.academic_average_pct ?? 75) <= 70;
    const feeDue = getStudentFeeDue(st.name);
    const studentDocs = getStudentDocs(st.id);

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Breadcrumb Navigation & Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedStudentForDossier(null)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>← Back to Student SIS Directory</span>
            </button>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {st.name} (Admission #{st.admission_no})
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenUploadDocForStudent(st.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>+ Upload Official Certificate / TC</span>
            </button>
          </div>
        </div>

        {/* Hero Dossier Banner */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/30 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                {st.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {st.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-mono font-bold">
                    {st.class_name} &bull; Section {st.section}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isRemedial
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {isRemedial ? 'Remedial Focus Plan (≤70%)' : 'Exempt / Mastered (>70%)'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Admission No: <b>{st.admission_no}</b> &bull; Roll No: <b>{st.roll_no}</b> &bull; Enrollment: <b>Active SIS</b> &bull; Class Teacher: <b>{currentClassTeacher}</b>
                </p>
              </div>
            </div>

            {/* Quick Metrics Pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{st.attendance_pct}%</span>
                <span className="text-[10px] text-emerald-600 font-bold block">Safe Standings</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Term 1 Average</span>
                <span className="text-base font-black text-blue-600 dark:text-blue-400">{st.academic_average_pct}%</span>
                <span className="text-[10px] text-slate-400 block">Across 5 Subjects</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Balance</span>
                <span className={`text-base font-black ${feeDue ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {feeDue ? `₹${feeDue.amount_due.toLocaleString()}` : '₹0 (Clear)'}
                </span>
                <span className="text-[10px] text-slate-400 block">{feeDue ? 'Due Overdue' : 'Fully Settled'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Full-Width Dossier Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { id: 'overview', label: '1. Demographics & Household', icon: User },
            { id: 'academics', label: '2. Academic Mastery & Remedial Health', icon: BookOpen },
            { id: 'fees', label: '3. Financial Fee Ledger', icon: CreditCard },
            { id: 'documents', label: `4. Legal Official Documents Vault (${studentDocs.length})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = dossierActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDossierActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  isTabActive
                    ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Demographics & Household */}
        {dossierActiveTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>Primary Guardian &amp; Contact Records</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Guardian Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{st.guardian_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Phone</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    {st.guardian_phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Registered Email</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-400" />
                    {st.guardian_email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Preferred Communication</span>
                  <span className="font-bold text-emerald-600 text-sm">WhatsApp &amp; SMS Active</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Residential Address</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                  Plot #42, Whitefield Greens Residency, ITPL Main Road, Bengaluru, Karnataka &bull; 560066
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-rose-500" />
                <span>Student Vital Records &amp; Enrollment Meta</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">14 Aug 2012 (14 Years)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Blood Group</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">O Positive (O+)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">CBSE Registration Roll #</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm font-mono">CBSE-2026-99014</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Admission Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">01 June 2024</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900 space-y-1">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 block">Class Teacher Remarks:</span>
                <p className="text-xs text-blue-800/80 dark:text-blue-300 leading-relaxed italic">
                  &ldquo;Aarav is punctual, actively participates in classroom discussions, and completes homework consistently. Continues focused practice on quadratic algebra.&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Academic Mastery & Remedial Health */}
        {dossierActiveTab === 'academics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-slate-400">Consolidated Grade</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white block">{st.academic_average_pct}%</span>
                <span className="text-xs text-slate-500">Term-1 Comprehensive Examination</span>
              </div>

              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-slate-400">1-Week Remedial Sprint Status</span>
                <div className="flex items-center gap-2 pt-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isRemedial ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isRemedial ? 'Active on Sprint (≤70%)' : 'Exempt from Sprint (>70%)'}
                  </span>
                </div>
                <span className="text-xs text-slate-500 block pt-1">Mentor: Mrs. Ananya Verma</span>
              </div>

              <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-slate-400">Class Attendance Standings</span>
                <span className="text-3xl font-black text-emerald-600 block">{st.attendance_pct}%</span>
                <span className="text-xs text-slate-500">Above mandatory 75% CBSE requirement</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Subject-Wise Performance &amp; Diagnostic Breakdown
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {[
                  { subject: 'Mathematics', score: 62, status: 'Remedial Sprint (Day 3 of 7)', weak: 'Quadratic Equation Factorization' },
                  { subject: 'Science (Physics & Chem)', score: 84, status: 'Mastered ✓', weak: 'None' },
                  { subject: 'English Literature', score: 78, status: 'Mastered ✓', weak: 'None' },
                  { subject: 'Social Studies', score: 81, status: 'Mastered ✓', weak: 'None' },
                  { subject: 'Computer Applications', score: 92, status: 'Mastered ✓', weak: 'None' },
                ].map((sub) => (
                  <div key={sub.subject} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{sub.subject}</span>
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {sub.score}%
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        Diagnostic bottleneck: <b>{sub.weak}</b>
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                      sub.score <= 70
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Financial Fee Ledger */}
        {dossierActiveTab === 'fees' && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Academic Year 2026–27 Fee Ledger &amp; Schedules
                </h3>
                <span className="text-xs text-slate-500">Student ID #{st.id} &bull; Total Annual Tuition: ₹1,20,000</span>
              </div>
              {feeDue ? (
                <span className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900">
                  ₹{feeDue.amount_due.toLocaleString()} Balance Overdue ({feeDue.days_overdue} days)
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                  All Milestones Settled (₹0 Dues)
                </span>
              )}
            </div>

            <div className="space-y-3">
              {[
                { title: 'Milestone 1: Admission & Term 1 Tuition', amount: 60000, date: '15 Jun 2026', status: 'Paid in Full ✓', receipt: 'REC-2026-0912' },
                { title: 'Milestone 2: Term 2 Academic & Lab Fee', amount: 35000, date: '10 Oct 2026', status: feeDue ? 'Overdue' : 'Paid in Full ✓', receipt: feeDue ? 'Pending Payment' : 'REC-2026-1402' },
                { title: 'Milestone 3: Term 3 Examination & Sports Fee', amount: 25000, date: '15 Jan 2027', status: 'Upcoming', receipt: 'Scheduled' },
              ].map((m) => (
                <div key={m.title} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Scheduled Due: {m.date} &bull; Receipt: {m.receipt}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900 dark:text-white">₹{m.amount.toLocaleString()}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      m.status.includes('Paid') ? 'bg-emerald-100 text-emerald-800' : m.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Legal Official Documents Vault */}
        {dossierActiveTab === 'documents' && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <span>Tamper-Sealed Legal Certificate Vault</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cryptographically stamped credentials (Bonafide, Transfer Certificate, Report Cards) verified by Administration.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenUploadDocForStudent(st.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>+ Upload Official Certificate</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {studentDocs.map((doc) => (
                <div key={doc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 p-2 rounded-2xl transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {doc.doc_type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        Verified Seal: <b>{doc.verified_stamp || 'EDU360 Official Seal'}</b> &bull; Signed by Management
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPreviewDoc(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview &amp; Download</span>
                    </button>
                  </div>
                </div>
              ))}

              {studentDocs.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No official certificates currently registered in {st.name}&apos;s legal vault.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // 2. STANDARD STUDENT SIS DIRECTORY & ROSTER VIEW
  // ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Top Header (Clean, Exclusively Student SIS) ── */}

      {/* Cascading Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name, roll #, admission #, parent, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Class & Section Dropdown Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Classes (6–10)</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Section:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Sections (A &amp; B)</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'All'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({students.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Remedial')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'Remedial'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Remedial (≤70%)
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('FeePending')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'FeePending'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Fee Pending
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reactive Class Cohort Summary Card */}
      <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/30 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedClass === 'All' ? 'All Classes Cohort (Grades 6–10)' : `${selectedClass} ${selectedSection !== 'All' ? `- Section ${selectedSection}` : ''}`}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {cohortStats.total} Students
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Class Teacher: <b>{currentClassTeacher}</b> &bull; Avg Attendance: <b>{cohortStats.avgAttendance}%</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Focus Students</span>
              <span className="text-sm font-black text-amber-600">{cohortStats.remedialCount} on Sprint</span>
            </div>
            <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Defaulters</span>
              <span className={`text-sm font-black ${cohortStats.feePendingCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {cohortStats.feePendingCount} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rich Student Roster Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Student &amp; Class</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4">Attendance &amp; Academic Status</th>
                <th className="py-3 px-4">Fee Dues</th>
                <th className="py-3 px-4">Official Documents</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((st) => {
                const isRemedial = (st.academic_average_pct ?? 75) <= 70;
                const feeDue = getStudentFeeDue(st.name);
                const studentDocs = getStudentDocs(st.id);

                return (
                  <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Student Identity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
                          {st.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">{st.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {st.class_name}-{st.section}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                            #{st.admission_no} &bull; Roll: {st.roll_no}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Guardian Contact */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{st.guardian_name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {st.guardian_phone}
                      </span>
                    </td>

                    {/* Attendance & Academics */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{st.attendance_pct}% Att.</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isRemedial
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {isRemedial ? 'Remedial Sprint (≤70%)' : 'Exempt (>70%)'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Term Avg: {st.academic_average_pct}%</span>
                    </td>

                    {/* Fee Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {feeDue ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          <AlertCircle className="h-3 w-3" />
                          ₹{feeDue.amount_due.toLocaleString()} Due
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Settled / Paid
                        </span>
                      )}
                    </td>

                    {/* Official Documents Vault */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{studentDocs.length} Verified Docs</span>
                      </span>
                    </td>

                    {/* Actions: Full Screen 360° Dossier & Upload */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForDossier(st);
                            setDossierActiveTab('overview');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <span>360° Dossier</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenUploadDocForStudent(st.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          title="Upload Official Certificate / TC for this student"
                        >
                          <Upload className="h-3 w-3" />
                          <span>+ Upload</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                    No students found matching your filters in {selectedClass} - {selectedSection}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
