'use client';

import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Award, 
  HeartPulse, 
  Bus, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle,
  X,
  ExternalLink,
  BookOpen,
  MessageSquareQuote,
  Check
} from 'lucide-react';
import { StudentRemark, getRemarksForStudent } from '@/lib/student-remarks';
import { downloadOfficialDocumentFile } from '@/lib/export-utils';

interface OfficialDocument {
  id: string;
  title: string;
  category: 'Identity & Enrollment' | 'Medical' | 'Financial Clearance' | 'Achievements' | 'Exit Protocols';
  issuedBy: string;
  issueDate: string;
  referenceNumber: string;
  fileSize: string;
  status: 'Verified & Active' | 'Clearance Approved' | 'Archived';
  description: string;
}

export function ParentSisView() {
  const [selectedDoc, setSelectedDoc] = useState<OfficialDocument | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [selectedDaySchedule, setSelectedDaySchedule] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');
  const [remarks, setRemarks] = useState<StudentRemark[]>(() => getRemarksForStudent(1));
  const [selectedRemarkCategory, setSelectedRemarkCategory] = useState<string>('ALL');

  const handleAcknowledgeRemark = (remarkId: number) => {
    setRemarks(prev => prev.map(r => {
      if (r.id === remarkId) {
        return {
          ...r,
          acknowledged_by_parent: true,
          parent_ack_by: "Mr. Rajesh Sharma (Parent)",
          parent_ack_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        };
      }
      return r;
    }));
    setDownloadToast("Digitally signed and acknowledged faculty observation.");
    setTimeout(() => setDownloadToast(null), 3000);
  };

  const officialDocs: OfficialDocument[] = [
    {
      id: 'bonafide',
      title: 'Bonafide Student Certificate (Session 2026-2027)',
      category: 'Identity & Enrollment',
      issuedBy: 'Office of the Principal, EDU360 World Academy',
      issueDate: '04 Jun 2026',
      referenceNumber: 'EDU/BON/2026/082',
      fileSize: '412 KB',
      status: 'Verified & Active',
      description: 'Official certification that Aarav Sharma is a bona fide student of Class 8B for academic year 2026-2027 under CBSE affiliation #103049.'
    },
    {
      id: 'medical',
      title: 'Annual Student Health & Immunization Clearance Record',
      category: 'Medical',
      issuedBy: 'School Medical Infirmary & Apollo Clinics',
      issueDate: '12 Jul 2026',
      referenceNumber: 'MED-2026-IMM-149',
      fileSize: '620 KB',
      status: 'Verified & Active',
      description: 'Comprehensive physical examination record: Blood Group O+, vision 6/6, up-to-date tetanus & measles booster immunization, no food allergies recorded.'
    },
    {
      id: 'fee_clearance',
      title: 'Term 1 Tuition & Transport Fee Clearance Certificate (No-Dues)',
      category: 'Financial Clearance',
      issuedBy: 'Accounts Department, EDU360 Finance Bureau',
      issueDate: '15 Jul 2026',
      referenceNumber: 'REC-2026-FEE-5821',
      fileSize: '298 KB',
      status: 'Clearance Approved',
      description: 'Confirms complete settlement of Term 1 tuition and air-conditioned bus transport fees (₹22,000 paid via UPI on 12 Jul 2026).'
    },
    {
      id: 'olympiad',
      title: 'Karnataka State Mathematics Olympiad Merit Certificate',
      category: 'Achievements',
      issuedBy: 'Karnataka State Mathematics Olympiad Board',
      issueDate: '18 Sep 2025',
      referenceNumber: 'KSMO-2025-SLV-0842',
      fileSize: '840 KB',
      status: 'Verified & Active',
      description: 'Silver Medalist (State Rank 14) in Grade 8 Category. Awarded for exceptional algebraic problem solving and discrete arithmetic speed.'
    },
    {
      id: 'exit_clearance',
      title: 'Transfer Certificate (TC) & Handover Protocol Form',
      category: 'Exit Protocols',
      issuedBy: 'Student Records & Registrar Desk',
      issueDate: '12 Oct 2026',
      referenceNumber: 'EDU-EXIT-2026-001',
      fileSize: '512 KB',
      status: 'Archived',
      description: 'Official digital handover clearance form for student migration records and certificate verification.'
    }
  ];

  const timetableByDay = {
    Mon: [
      { period: '1 (08:30 - 09:15)', subject: 'Mathematics', teacher: 'Mrs. Sunitha Rao', room: 'Room 304' },
      { period: '2 (09:15 - 10:00)', subject: 'Physics', teacher: 'Dr. K. Raman', room: 'Physics Lab A' },
      { period: '3 (10:15 - 11:00)', subject: 'English Literature', teacher: 'Ms. Deepa Menon', room: 'Room 304' },
      { period: '4 (11:00 - 11:45)', subject: 'Chemistry', teacher: 'Mrs. S. Sen', room: 'Chem Lab B' },
      { period: '5 (12:30 - 01:15)', subject: 'Computer Science', teacher: 'Mr. V. Nair', room: 'Computer Lab 2' },
      { period: '6 (01:15 - 02:00)', subject: 'Social Science', teacher: 'Ms. P. Roy', room: 'Room 304' },
      { period: '7 (02:15 - 03:00)', subject: 'Physical Education', teacher: 'Coach R. Singh', room: 'Sports Ground' }
    ],
    Tue: [
      { period: '1 (08:30 - 09:15)', subject: 'Biology', teacher: 'Dr. P. Nair', room: 'Bio Lab C' },
      { period: '2 (09:15 - 10:00)', subject: 'Mathematics', teacher: 'Mrs. Sunitha Rao', room: 'Room 304' },
      { period: '3 (10:15 - 11:00)', subject: 'Social Science', teacher: 'Ms. P. Roy', room: 'Room 304' },
      { period: '4 (11:00 - 11:45)', subject: 'English Grammar', teacher: 'Ms. Deepa Menon', room: 'Room 304' },
      { period: '5 (12:30 - 01:15)', subject: 'Physics Lab', teacher: 'Dr. K. Raman', room: 'Physics Lab A' },
      { period: '6 (01:15 - 02:00)', subject: 'Hindi / 2nd Lang', teacher: 'Mrs. K. Sharma', room: 'Room 304' },
      { period: '7 (02:15 - 03:00)', subject: 'Music & Western Choir', teacher: 'Mr. A. Fernandes', room: 'Auditorium' }
    ],
    Wed: [
      { period: '1 (08:30 - 09:15)', subject: 'Mathematics (Intervention)', teacher: 'Mrs. Sunitha Rao', room: 'Room 304' },
      { period: '2 (09:15 - 10:00)', subject: 'Chemistry Lab', teacher: 'Mrs. S. Sen', room: 'Chem Lab B' },
      { period: '3 (10:15 - 11:00)', subject: 'Computer Science', teacher: 'Mr. V. Nair', room: 'Computer Lab 2' },
      { period: '4 (11:00 - 11:45)', subject: 'Social Science', teacher: 'Ms. P. Roy', room: 'Room 304' },
      { period: '5 (12:30 - 01:15)', subject: 'English Creative Writing', teacher: 'Ms. Deepa Menon', room: 'Room 304' },
      { period: '6 (01:15 - 02:00)', subject: 'Biology', teacher: 'Dr. P. Nair', room: 'Bio Lab C' },
      { period: '7 (02:15 - 03:00)', subject: 'Library & Research', teacher: 'Mrs. V. Iyer', room: 'Central Library' }
    ],
    Thu: [
      { period: '1 (08:30 - 09:15)', subject: 'Physics', teacher: 'Dr. K. Raman', room: 'Physics Lab A' },
      { period: '2 (09:15 - 10:00)', subject: 'Mathematics', teacher: 'Mrs. Sunitha Rao', room: 'Room 304' },
      { period: '3 (10:15 - 11:00)', subject: 'Hindi / 2nd Lang', teacher: 'Mrs. K. Sharma', room: 'Room 304' },
      { period: '4 (11:00 - 11:45)', subject: 'Computer Science Lab', teacher: 'Mr. V. Nair', room: 'Computer Lab 2' },
      { period: '5 (12:30 - 01:15)', subject: 'English', teacher: 'Ms. Deepa Menon', room: 'Room 304' },
      { period: '6 (01:15 - 02:00)', subject: 'Chemistry', teacher: 'Mrs. S. Sen', room: 'Room 304' },
      { period: '7 (02:15 - 03:00)', subject: 'Robotics & STEM Club', teacher: 'Mr. T. Bose', room: 'Innovation Hub' }
    ],
    Fri: [
      { period: '1 (08:30 - 09:15)', subject: 'Mathematics Quiz', teacher: 'Mrs. Sunitha Rao', room: 'Room 304' },
      { period: '2 (09:15 - 10:00)', subject: 'Social Science (Topomap)', teacher: 'Ms. P. Roy', room: 'Room 304' },
      { period: '3 (10:15 - 11:00)', subject: 'Biology', teacher: 'Dr. P. Nair', room: 'Bio Lab C' },
      { period: '4 (11:00 - 11:45)', subject: 'Physics', teacher: 'Dr. K. Raman', room: 'Room 304' },
      { period: '5 (12:30 - 01:15)', subject: 'English Drama', teacher: 'Ms. Deepa Menon', room: 'Auditorium' },
      { period: '6 (01:15 - 02:00)', subject: 'House Assembly & Mentorship', teacher: 'Mrs. Ananya Verma', room: 'Assembly Hall' },
      { period: '7 (02:15 - 03:00)', subject: 'Inter-House Sports', teacher: 'Coach R. Singh', room: 'Main Stadium' }
    ]
  };

  const handleDownload = (docTitle: string) => {
    downloadOfficialDocumentFile(docTitle, 'Aarav Sharma', 'OIS-2026-8814');
    setDownloadToast(`Certified copy downloaded: ${docTitle}`);
    setTimeout(() => setDownloadToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{downloadToast}</span>
        </div>
      )}

      {/* Top Banner: Child SIS Dossier & Official Vault */}
      <div className="rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-bold border border-purple-200 dark:border-purple-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Student Information System (SIS) Dossier
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Verified by School Administration
            </span>
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            Aarav Sharma — Academic Profile &amp; Official Vault
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Class 8B • Roll #14 • Adm #EDU-2024-082 • Academic Session 2026-27 • Phoenix House
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 text-xs font-black shadow-xs">
            <CheckCircle2 className="h-4 w-4" />
            <span>CBSE Board Exam Eligible (94.2%)</span>
          </span>
        </div>
      </div>

      {/* Comprehensive Academic Bio & Demographics Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Child Demographics Card */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                AS
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Aarav Sharma (Male · Age 14)
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Date of Birth: 14 May 2012 • Blood Group: <span className="font-bold text-red-600 dark:text-red-400">O+ (Positive)</span>
                </span>
              </div>
            </div>
            <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-3 py-1 text-xs font-bold">
              Phoenix House (Gold)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Father &amp; Primary Guardian:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">Mr. Rajesh Sharma</span>
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-0.5">
                <Phone className="h-3.5 w-3.5 text-blue-600" />
                <span>+91 98765 43210</span>
              </span>
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                <span>rajesh.sharma@example.com</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Mother &amp; Secondary Guardian:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">Mrs. Priya Sharma</span>
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-0.5">
                <Phone className="h-3.5 w-3.5 text-purple-600" />
                <span>+91 98765 43211</span>
              </span>
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-purple-600" />
                <span>priya.sharma@example.com</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 tracking-wider block flex items-center gap-1">
                <HeartPulse className="h-3.5 w-3.5 text-amber-600" />
                Medical &amp; Emergency Contact:
              </span>
              <span className="font-bold text-slate-900 dark:text-white block">Dr. M. Gupta (Family Physician)</span>
              <span className="text-slate-700 dark:text-slate-300 block">Apollo Clinic Whitefield • +91 80 2345 6789</span>
              <span className="text-[11px] text-amber-800 dark:text-amber-300">Allergies: None Recorded • Dietary: Pure Vegetarian</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-400 tracking-wider block flex items-center gap-1">
                <Bus className="h-3.5 w-3.5 text-blue-600" />
                Static Bus Transport Route:
              </span>
              <span className="font-bold text-slate-900 dark:text-white block">Route 4 • Bus KA-01-EB-4412</span>
              <span className="text-slate-700 dark:text-slate-300 block">Designated Stop: Sector 15 Crossroad (03:46 PM)</span>
              <span className="text-[11px] text-blue-800 dark:text-blue-300">Driver: Ramesh Kumar (+91 98450 12345)</span>
            </div>
          </div>
        </div>

        {/* Attendance Ledger & CBSE Status */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Attendance Compliance
              </span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-black">
                Above 75% Cutoff
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">94.2%</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">146 / 155 Days</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mandatory CBSE Board exam eligibility requirement is 75.0%.
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Present in School:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">146 Days</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Approved Medical Leave:</span>
                <span className="font-black text-amber-600 dark:text-amber-400">7 Days</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Unexcused Absences:</span>
                <span className="font-black text-slate-700 dark:text-slate-300">2 Days</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94.2%' }} />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5">
              <span>0%</span>
              <span className="text-red-500">75% (CBSE Min)</span>
              <span className="text-emerald-600 font-black">94.2% Current</span>
            </div>
          </div>
        </div>

      </div>

      {/* Official Faculty & School Remarks Dossier */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-0.5 text-xs font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                <MessageSquareQuote className="h-3.5 w-3.5" />
                Official Pedagogical Observations &amp; Remarks
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Authorized for Parent &amp; Faculty Review
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              Teacher Observations, Behavioral Feedback &amp; Commendations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review continuous qualitative assessments logged by Aarav&apos;s Class Teacher, Subject Mentors, and Principal.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              {remarks.length} Official Remarks
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'Academic Excellence', 'Behavioral & Conduct', 'Special Commendation', 'Remedial / Focus Area'].map((cat) => {
            const count = cat === 'ALL' ? remarks.length : remarks.filter(r => r.category === cat).length;
            const isSelected = selectedRemarkCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedRemarkCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Remarks Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {remarks
            .filter(r => selectedRemarkCategory === 'ALL' || r.category === selectedRemarkCategory)
            .map((remark) => (
              <div
                key={remark.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {remark.author_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{remark.author_name}</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{remark.author_role} &bull; {remark.date}</span>
                      </div>
                    </div>

                    <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[9px] font-bold">
                      {remark.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    &ldquo;{remark.remark_text}&rdquo;
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  {remark.acknowledged_by_parent ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Acknowledged on {remark.parent_ack_date || remark.date}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledgeRemark(remark.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                      <span>Acknowledge Observation</span>
                    </button>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono">
                    Priority: {remark.priority}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Weekly Academic Timetable Preview */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Aarav&apos;s Weekly Period Timetable</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Know your child&apos;s daily classroom schedules, teachers, and period allocations
            </p>
          </div>

          {/* Day Selector Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDaySchedule(day)}
                className={`rounded-xl px-3.5 py-1.5 font-bold transition-all ${
                  selectedDaySchedule === day
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {timetableByDay[selectedDaySchedule].map((slot, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Period {slot.period}
                </span>
                <span className="font-black text-slate-900 dark:text-white text-xs block mt-1">
                  {slot.subject}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60 pt-2 space-y-0.5">
                <span className="block truncate">{slot.teacher}</span>
                <span className="block font-medium text-blue-600 dark:text-blue-400">{slot.room}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Documents Vault (Strictly View/Download-Only) */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-bold">
                🔒 Official Institutional Vault
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                School-issued digital credentials &amp; certificates
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
              Student Certificates &amp; Compliance Vault (View &amp; Download Only)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            5 Certified Documents Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officialDocs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold">
                    {doc.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{doc.status}</span>
                  </span>
                </div>

                <h4 className="mt-3 text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {doc.title}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {doc.description}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                  <span className="block">Ref #: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{doc.referenceNumber}</span></span>
                  <span className="block">Issued: {doc.issueDate} • {doc.fileSize}</span>
                </div>
              </div>

              {/* View and Download Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 text-xs font-bold transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 text-blue-600" />
                  <span>View Doc</span>
                </button>

                <button
                  onClick={() => handleDownload(doc.title)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold shadow-xs transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Student Relocation & School Exit Protocol (Only accessible when needed) */}
        <div className="mt-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Relocating or Transferring to another Institution?
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Initiate formal Transfer Certificate (TC) departure clearance only when withdrawing or moving.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadToast("Exit Clearance Request registered. The Registrar will contact Mr. Rajesh Sharma.")}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-2 font-bold shrink-0 transition-colors cursor-pointer"
          >
            Request School Exit / TC
          </button>
        </div>
      </div>

      {/* Document View Modal */}
      {selectedDoc && (
        <div 
          onClick={() => setSelectedDoc(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-bold">
                  {selectedDoc.category}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Official Certificate Visual Canvas (Watermarked) */}
            <div className="relative rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-amber-50/20 dark:bg-slate-800/40 p-6 text-center space-y-4">
              
              {/* Seal watermark */}
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  EDU360 World Academy • Board of School Education
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  OFFICIAL INSTITUTIONAL RECORD
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                  {selectedDoc.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left text-xs bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Name</span>
                  <span className="font-black text-slate-900 dark:text-white">Aarav Sharma</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Admission #</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">EDU-2024-082</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Issuing Authority</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate block">{selectedDoc.issuedBy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Official Ref #</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedDoc.referenceNumber}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-mono">
                <span>SHA-256 Checksum: a4f8e02d847c92b... (Digitally Signed)</span>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedDoc(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedDoc.title);
                  setSelectedDoc(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Download Official Certificate (PDF)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
