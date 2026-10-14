'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Mail, 
  Award, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  Printer, 
  X,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface SubjectMark {
  id: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  classAverage: number;
  highestMarks: number;
  teacherName: string;
  teacherRemarks: string;
}

export function ParentMarksView() {
  const [selectedTerm, setSelectedTerm] = useState<'ut2' | 'midterm' | 'ut1'>('ut2');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const guardianEmail = 'rajesh.sharma@example.com';

  const subjectMarksData: SubjectMark[] = [
    {
      id: 'math',
      subject: 'Mathematics',
      marksObtained: 22.5,
      maxMarks: 25,
      grade: 'A1',
      classAverage: 16.4,
      highestMarks: 24.5,
      teacherName: 'Mrs. Sunitha Rao',
      teacherRemarks: 'Strong computational agility. Needs practice on distributive sign conventions during quadratic expansions.'
    },
    {
      id: 'physics',
      subject: 'Physics',
      marksObtained: 21.0,
      maxMarks: 25,
      grade: 'A1',
      classAverage: 17.1,
      highestMarks: 23.5,
      teacherName: 'Dr. K. Raman',
      teacherRemarks: 'High conceptual clarity in Optics and convex lenses. Minor diagram labeling omissions in lab test.'
    },
    {
      id: 'chemistry',
      subject: 'Chemistry',
      marksObtained: 23.0,
      maxMarks: 25,
      grade: 'A1',
      classAverage: 18.2,
      highestMarks: 24.0,
      teacherName: 'Mrs. S. Sen',
      teacherRemarks: 'Excellent execution of chemical equation balancing and polyatomic ionic formulas.'
    },
    {
      id: 'biology',
      subject: 'Biology',
      marksObtained: 22.0,
      maxMarks: 25,
      grade: 'A1',
      classAverage: 17.8,
      highestMarks: 23.5,
      teacherName: 'Dr. P. Nair',
      teacherRemarks: 'Accurate microscopic labeling of plant xylem/phloem and cellular respiration pathways.'
    },
    {
      id: 'english',
      subject: 'English Language & Literature',
      marksObtained: 22.5,
      maxMarks: 25,
      grade: 'A1',
      classAverage: 18.5,
      highestMarks: 24.0,
      teacherName: 'Ms. Deepa Menon',
      teacherRemarks: 'Expressive vocabulary and thoughtful character depth in literary essay answers.'
    },
    {
      id: 'cs',
      subject: 'Computer Science',
      marksObtained: 24.5,
      maxMarks: 25,
      grade: 'A1+',
      classAverage: 19.0,
      highestMarks: 25.0,
      teacherName: 'Mr. V. Nair',
      teacherRemarks: 'Flawless nested loop iteration and multidimensional list slicing in Python.'
    },
    {
      id: 'social',
      subject: 'Social Science',
      marksObtained: 23.5,
      maxMarks: 25,
      grade: 'A1',
      classAverage: 17.5,
      highestMarks: 24.5,
      teacherName: 'Ms. P. Roy',
      teacherRemarks: 'Precise 6-figure grid topographic map analysis and Mughal administrative timeline.'
    }
  ];

  const totalObtained = subjectMarksData.reduce((acc, curr) => acc + curr.marksObtained, 0);
  const totalMax = subjectMarksData.reduce((acc, curr) => acc + curr.maxMarks, 0);
  const percentage = ((totalObtained / totalMax) * 100).toFixed(1);

  const handleSendEmail = () => {
    setEmailSending(true);
    setTimeout(() => {
      setEmailSending(false);
      setEmailSentSuccess(true);
      setTimeout(() => {
        setEmailSentSuccess(false);
        setEmailModalOpen(false);
      }, 2500);
    }, 1200);
  };

  const handleDownloadMemo = () => {
    setDownloadToast('Generating official CBSE-format marks memo PDF (Ref: EDU-2026-UT2-88B14)...');
    setTimeout(() => setDownloadToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{downloadToast}</span>
        </div>
      )}

      {/* Top Banner & Header Controls */}
      <div className="rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-bold border border-blue-200 dark:border-blue-800">
              <Award className="h-3.5 w-3.5" />
              CBSE Formatted Report Card Archive
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Academic Session 2026-2027
            </span>
          </div>
          <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            Aarav Sharma — Examination Marks &amp; Progress Memo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Class 8B • Roll #14 • Board Affiliation #CBSE-103049 • Verified by Office of the Registrar
          </p>
        </div>

        {/* Action Buttons: Email to Parent & Download Memo */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setEmailModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Mail className="h-4 w-4" />
            <span>Email Report Card to My Mail</span>
          </button>

          <button
            onClick={handleDownloadMemo}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-bold transition-colors"
          >
            <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Download Official PDF Memo</span>
          </button>
        </div>
      </div>

      {/* Term Selector & Analytics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Score Aggregate */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Overall Term Aggregate
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{percentage}%</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              Grade A1
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            {totalObtained} / {totalMax} Marks Total
          </span>
        </div>

        {/* Class Rank */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Class Standing
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">Rank #4</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">of 42 students</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Top 10% Academic Distinction
          </span>
        </div>

        {/* Percentile */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Cohort Percentile
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">92.4th</span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">
              Elite
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Across 180 Grade 8 Students
          </span>
        </div>

        {/* Promotion Status */}
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider block">
            Board Result Status
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-emerald-800 dark:text-emerald-300">
              Distinction ✓
            </span>
          </div>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 block font-medium">
            100% Exam Attendance Record
          </span>
        </div>

      </div>

      {/* Term Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTerm('ut2')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedTerm === 'ut2'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unit Test 2 (Oct 2026) · Published
          </button>
          <button
            onClick={() => setSelectedTerm('midterm')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedTerm === 'midterm'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mid-Term Assessment (Aug 2026)
          </button>
          <button
            onClick={() => setSelectedTerm('ut1')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              selectedTerm === 'ut1'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unit Test 1 (Jul 2026)
          </button>
        </div>

        <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400">
          Evaluated on 10 Oct 2026 • Published to Parent Portal
        </span>
      </div>

      {/* Subject-Wise Score Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Curriculum Subject Performance Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Individual subject marks, class averages, and official teacher remarks
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            7 Subjects Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5 font-bold">Subject</th>
                <th className="py-3.5 px-4 font-bold">Marks Scored</th>
                <th className="py-3.5 px-4 font-bold">Max Marks</th>
                <th className="py-3.5 px-4 font-bold">Grade</th>
                <th className="py-3.5 px-4 font-bold">Class Average</th>
                <th className="py-3.5 px-4 font-bold">Teacher In-Charge</th>
                <th className="py-3.5 px-5 font-bold">Pedagogical Observation &amp; Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjectMarksData.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5 font-black text-slate-900 dark:text-white">
                    {s.subject}
                  </td>
                  <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm">
                    {s.marksObtained.toFixed(1)}
                  </td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {s.maxMarks}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${
                      s.grade.startsWith('A') 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {s.grade}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                    {s.classAverage.toFixed(1)}
                  </td>
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {s.teacherName}
                  </td>
                  <td className="py-4 px-5 text-slate-600 dark:text-slate-300 italic max-w-xs leading-relaxed">
                    &quot;{s.teacherRemarks}&quot;
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-800/70 border-t-2 border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white">
              <tr>
                <td className="py-4 px-5 text-sm uppercase">Total Cumulative</td>
                <td className="py-4 px-4 text-base text-blue-600 dark:text-blue-400">{totalObtained.toFixed(1)}</td>
                <td className="py-4 px-4 text-sm text-slate-500">{totalMax}</td>
                <td className="py-4 px-4">
                  <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-black">
                    A1 (Distinction)
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-500">125.0 Avg</td>
                <td className="py-4 px-4 text-xs font-normal text-slate-500">Class 8B Overall</td>
                <td className="py-4 px-5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                  Promoted with Distinction • Top 10%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Institutional Authentication Banner */}
        <div className="p-5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Digitally Authenticated by EDU360 Examination Cell
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Principal: Dr. S. Radhakrishnan • Class Teacher: Mrs. Ananya Verma • Hash: 8b14e9f7c22
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEmailModalOpen(true)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Email PDF to rajesh.sharma@example.com</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Email Report Card Modal */}
      {emailModalOpen && (
        <div 
          onClick={() => setEmailModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Email Official Report Card
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Dispatched with cryptographic school seal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {emailSentSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  Report Card Dispatched Successfully!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  The verified PDF report card for Unit Test 2 has been emailed to <span className="font-bold underline">{guardianEmail}</span>.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Recipient Email Address:</span>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">{guardianEmail}</span>
                  <span className="text-slate-500 text-[11px]">Primary Guardian: Mr. Rajesh Sharma</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Attached Document:</span>
                  </span>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300">
                    Aarav_Sharma_Class8B_UnitTest2_ReportCard.pdf (Signed by Principal with SHA-256 Checksum)
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setEmailModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={emailSending}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{emailSending ? 'Dispatching PDF...' : 'Confirm & Send to My Email'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
