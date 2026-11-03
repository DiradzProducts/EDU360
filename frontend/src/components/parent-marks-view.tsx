'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  GraduationCap,
  RefreshCw,
  Ticket,
  Video,
  Upload
} from 'lucide-react';
import { downloadMarksMemoFile } from '@/lib/export-utils';
import { api } from '@/lib/api';
import { ReportCardItem, ReExamRequestItem } from '@/lib/types';
import { EvaluationKeyModal } from '@/components/evaluation-key-modal';

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

interface ParentMarksViewProps {
  studentId?: number;
  studentName?: string;
  className?: string;
}

export function ParentMarksView({
  studentId = 1,
  studentName = 'Aarav Sharma',
  className = 'Class 8-B'
}: ParentMarksViewProps = {}) {
  const [selectedTerm, setSelectedTerm] = useState<'term1' | 'ut2' | 'midterm' | 'ut1'>('term1');
  const [liveReportCard, setLiveReportCard] = useState<ReportCardItem | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signerName, setSignerName] = useState('Rajesh Sharma (Father)');
  const [signRemarks, setSignRemarks] = useState('Reviewed Term 1 results with class teacher feedback.');
  const [isSigning, setIsSigning] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // AI Evaluation Key Modal State
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedEvalSubject, setSelectedEvalSubject] = useState('Mathematics');

  // Admit Card (Hall Ticket) Modal State
  const [showAdmitCardModal, setShowAdmitCardModal] = useState(false);

  // Re-Exam Permission Workflow State
  const [reExamRequests, setReExamRequests] = useState<ReExamRequestItem[]>([]);
  const [showReExamModal, setShowReExamModal] = useState(false);
  const [selectedRetestPass, setSelectedRetestPass] = useState<ReExamRequestItem | null>(null);
  const [reExamSubject, setReExamSubject] = useState('Mathematics');
  const [reExamExamName, setReExamExamName] = useState('Term 1 Descriptive Examination');
  const [reExamMissedDate, setReExamMissedDate] = useState('2026-10-14');
  const [reExamCategory, setReExamCategory] = useState<'Medical Emergency' | 'Hospitalization' | 'Bereavement' | 'Sports Representation' | 'Other'>('Medical Emergency');
  const [reExamDetails, setReExamDetails] = useState('Diagnosed with acute viral fever (103°F). Hospital outpatient consultation with 4 days mandated bed rest.');
  const [reExamDocName, setReExamDocName] = useState('Dr_Patel_Hospital_Medical_Certificate.pdf');
  const [reExamFile, setReExamFile] = useState<File | null>(null);
  const [reExamFileSize, setReExamFileSize] = useState<string>('340 KB');
  const [submittingReExam, setSubmittingReExam] = useState(false);
  const [admitCardData, setAdmitCardData] = useState<any>(null);
  const [loadingAdmitCard, setLoadingAdmitCard] = useState(false);

  const handleOpenAdmitCard = async () => {
    setLoadingAdmitCard(true);
    setShowAdmitCardModal(true);
    try {
      const res = await api.getStudentHallTicket(studentId);
      if (res && res.success && res.ticket) {
        setAdmitCardData(res.ticket);
      }
    } catch (err) {
      console.error('Failed to load hall ticket', err);
    } finally {
      setLoadingAdmitCard(false);
    }
  };

  useEffect(() => {
    const fetchLiveCard = async () => {
      try {
        const cards = await api.getReportCards({ student_id: studentId });
        if (cards && cards.length > 0) {
          setLiveReportCard(cards[0]);
        }
        const reExams = await api.getReExamRequests();
        setReExamRequests(reExams || []);
      } catch (err) {
        console.error('Failed to fetch parent report card:', err);
      }
    };
    fetchLiveCard();
  }, [studentId]);

  const guardianEmail = 'rajesh.sharma@example.com';

  const isJuniorKid = studentId === 7 || (className && (className.includes('3') || className.toLowerCase().includes('primary') || className.includes('K5')));

  const juniorSubjectMarksData: SubjectMark[] = [
    {
      id: 'reading',
      subject: 'English Reading & Phonics',
      marksObtained: 24.5,
      maxMarks: 25,
      grade: 'A1+',
      classAverage: 19.2,
      highestMarks: 25.0,
      teacherName: 'Ms. Priya Nair',
      teacherRemarks: 'Outstanding phonemic awareness, expressive reading tone, and storytelling enthusiasm in morning circle.'
    },
    {
      id: 'math',
      subject: 'Junior Mathematics',
      marksObtained: 24.0,
      maxMarks: 25,
      grade: 'A1+',
      classAverage: 18.5,
      highestMarks: 24.5,
      teacherName: 'Mrs. Kavitha Reddy',
      teacherRemarks: 'Superb 2-digit mental calculations, place value grip, and geometric shapes recognition.'
    },
    {
      id: 'evs',
      subject: 'Environmental Studies (EVS)',
      marksObtained: 23.5,
      maxMarks: 25,
      grade: 'A1',
      classAverage: 18.0,
      highestMarks: 24.0,
      teacherName: 'Ms. Priya Nair',
      teacherRemarks: 'Deep curiosity regarding seed germination, plant parts, and animal habitats in nature studies.'
    },
    {
      id: 'arts',
      subject: 'Creative Arts & Expression',
      marksObtained: 25.0,
      maxMarks: 25,
      grade: 'O (Outstanding)',
      classAverage: 20.0,
      highestMarks: 25.0,
      teacherName: 'Mrs. Shalini Sen',
      teacherRemarks: 'Exceptional color blending, clay sculpture modeling, and neat origami construction.'
    },
    {
      id: 'hindi',
      subject: 'Hindi / Second Language',
      marksObtained: 22.5,
      maxMarks: 25,
      grade: 'A1',
      classAverage: 17.5,
      highestMarks: 23.5,
      teacherName: 'Mrs. Meenakshi Sundaram',
      teacherRemarks: 'Confident aksharmala handwriting, Matra recognition, and polite conversational phrases.'
    },
    {
      id: 'gk',
      subject: 'General Knowledge & Values',
      marksObtained: 24.0,
      maxMarks: 25,
      grade: 'A1+',
      classAverage: 19.0,
      highestMarks: 25.0,
      teacherName: 'Ms. Priya Nair',
      teacherRemarks: 'Kind peer collaboration, empathetic classroom sharing, and active questions during science curiosities.'
    }
  ];

  const secondarySubjectMarksData: SubjectMark[] = [
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

  const subjectMarksData: SubjectMark[] = isJuniorKid ? juniorSubjectMarksData : secondarySubjectMarksData;

  const totalObtained = subjectMarksData.reduce((acc, curr) => acc + curr.marksObtained, 0);
  const totalMax = subjectMarksData.reduce((acc, curr) => acc + curr.maxMarks, 0);
  const percentage = ((totalObtained / totalMax) * 100).toFixed(1);

  const isTerm1 = selectedTerm === 'term1';
  const hasRemedial = isTerm1 && liveReportCard && Object.values(liveReportCard.grades_grid || {}).some(g => g.remedial_flag);

  const displayPercentage = isTerm1 && liveReportCard 
    ? liveReportCard.overall_percentage.toFixed(1) 
    : percentage;
  const displayTotalObtained = isTerm1 && liveReportCard 
    ? liveReportCard.total_marks_obtained 
    : totalObtained;
  const displayTotalMax = isTerm1 && liveReportCard 
    ? liveReportCard.max_total_marks 
    : totalMax;
  const displayGrade = isTerm1 && liveReportCard 
    ? liveReportCard.overall_grade 
    : 'A1';

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

  const handleCreateReExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReExam(true);
    try {
      const created = await api.createReExamRequest({
        student_id: 1,
        student_name: studentName,
        class_name: className,
        section: 'B',
        subject: reExamSubject,
        exam_name: reExamExamName,
        missed_date: reExamMissedDate,
        reason_category: reExamCategory,
        reason_details: reExamDetails,
        document_name: reExamDocName || 'Medical_Certificate_Aarav.pdf',
        document_url: '/documents/medical_certificate_aarav.pdf',
        parent_name: 'Mr. Rajesh Sharma',
        parent_phone: '+91 98111 00003'
      });
      setReExamRequests(prev => [created, ...prev.filter(r => r.id !== created.id)]);
      setShowReExamModal(false);
      setDownloadToast('Re-Examination Request submitted to Principal successfully!');
      setTimeout(() => setDownloadToast(null), 4000);
    } catch (err) {
      console.error('Failed to submit re-exam request:', err);
    } finally {
      setSubmittingReExam(false);
    }
  };

  const handleDownloadMemo = () => {
    downloadMarksMemoFile(studentName, isTerm1 ? 'Term 1 Official CBSE Memo' : 'Term 2 Periodic Assessment');
    setDownloadToast(isTerm1 ? 'Official Term 1 CBSE marks memo downloaded.' : 'Official CBSE marks memo downloaded (Ref: EDU-2026-UT2-88B14)');
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
            {studentName} — Examination Marks &amp; Progress Memo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {className} • Roll #14 • Board Affiliation #CBSE-103049 • Verified by Examination Controller Dr. Hemanth Sen
          </p>
        </div>

        {/* Action Buttons: Admit Card, Re-Exam Exemption Request & Download Memo */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAdmitCard}
            className="flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Award className="h-4 w-4" />
            <span>Official Admit Card &amp; Timetable</span>
          </button>

          <button
            onClick={() => setShowReExamModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Request Re-Exam (Medical / Exemption)</span>
          </button>

          {liveReportCard && liveReportCard.is_published && (
            liveReportCard.parent_signed_at ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Digitally Sealed ({liveReportCard.parent_signer_name?.split(' ')[0]})</span>
              </div>
            ) : (
              <button
                onClick={() => setShowSignModal(true)}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Digitally Sign Memo</span>
              </button>
            )
          )}

          <button
            onClick={handleDownloadMemo}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Download Official PDF Memo</span>
          </button>
        </div>
      </div>

      {/* Official Release Pending Notice for Parents */}
      {liveReportCard && !liveReportCard.is_published && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 p-4 flex items-center gap-3 text-xs text-blue-900 dark:text-blue-200">
          <Clock className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <span className="font-bold block">Official Report Card Under Final Examination Moderation</span>
            <span>Term 1 marks are undergoing final validation by the Academic &amp; Examination Cell. The official marks memo and Gemini AI narrative will be released as soon as the Exam Coordinator issues publication.</span>
          </div>
        </div>
      )}

      {/* Remedial Active Alert if Student has score <= 70% in any subject */}
      {hasRemedial && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <span className="font-black text-amber-950 dark:text-amber-200 block text-xs">
                Active 1-Week Remedial Focus Sprint (Mathematics · Score: 68%)
              </span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                {studentName} scored $\le 70\%$ in foundational subjects and has been enrolled in homeroom faculty&apos;s 1-Week targeted quadratic equations remediation with daily rough paper review.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-[11px] font-bold shrink-0 text-center">
            Day 3 In Progress
          </span>
        </div>
      )}

      {/* Term Selector & Analytics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Score Aggregate */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Overall Term Aggregate
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{displayPercentage}%</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              Grade {displayGrade}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            {displayTotalObtained} / {displayTotalMax} Marks Total
          </span>
        </div>

        {/* Class Rank */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Class Standing
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">Rank #4</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">of 38 students</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Top 10% Academic Distinction
          </span>
        </div>

        {/* Attendance */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Exam Attendance
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">
              {isTerm1 && liveReportCard ? `${liveReportCard.attendance_pct}%` : '91.0%'}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">
              Regular
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Biometric SIS Check-in Synced
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
            Verified by Examination Authority
          </span>
        </div>

      </div>

      {/* Medical Re-Examination & Exemption Status Tracker */}
      {reExamRequests.length > 0 && (
        <div className="rounded-3xl border-2 border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200 dark:border-amber-800">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Medical Re-Examination &amp; Concession Tracker</span>
                  <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    {reExamRequests.length} Active {reExamRequests.length === 1 ? 'Record' : 'Records'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Track Principal clearance, Examination Cell slot allocation, and download your proctored re-test admit pass
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowReExamModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Apply Another Concession</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {reExamRequests.map((req) => {
              const isScheduled = req.status === 'Scheduled';
              const isApproved = req.status === 'Approved by Admin';
              const isPending = req.status === 'Pending Admin Review';
              const isRejected = req.status === 'Rejected';

              return (
                <div
                  key={req.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4.5 shadow-xs space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {req.subject}
                      </span>
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5">
                        {req.exam_name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • Missed: {req.missed_date}
                      </span>
                    </div>

                    <div>
                      {isScheduled && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-[11px] font-black border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Retest Slot Confirmed &amp; Admit Pass Ready
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1 text-[11px] font-black border border-blue-200 dark:border-blue-800">
                          <Clock className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                          Approved by Principal • Scheduling Slot...
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-3 py-1 text-[11px] font-black border border-amber-200 dark:border-amber-800">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          Under Medical Review by Principal
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-3 py-1 text-[11px] font-black border border-rose-200 dark:border-rose-800">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Request Not Approved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4-Step Progress Indicator */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">Step 1: Submitted</span>
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">Doctor Note Attached ✓</span>
                    </div>

                    <div className={`p-2 rounded-xl border ${
                      isApproved || isScheduled
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                        : isRejected
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                    }`}>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Step 2: Principal Review</span>
                      <span className={`text-[11px] font-black ${
                        isApproved || isScheduled ? 'text-emerald-700 dark:text-emerald-400' : isRejected ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'
                      }`}>
                        {isApproved || isScheduled ? 'Approved by Admin ✓' : isRejected ? 'Rejected' : 'In Review ⏳'}
                      </span>
                    </div>

                    <div className={`p-2 rounded-xl border ${
                      isScheduled
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}>
                      <span className="text-[10px] font-bold block">Step 3: Slot Allocation</span>
                      <span className={`text-[11px] font-black ${isScheduled ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {isScheduled ? 'Slot Assigned ✓' : 'Awaiting Controller'}
                      </span>
                    </div>

                    <div className={`p-2 rounded-xl border ${
                      isScheduled
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}>
                      <span className="text-[10px] font-bold block">Step 4: Admit Pass</span>
                      <span className={`text-[11px] font-black ${isScheduled ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {isScheduled ? 'Ready for Download 🎫' : 'Pending Slot'}
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Slot Details & Admit Card Action */}
                  {isScheduled ? (
                    <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-emerald-950 dark:text-emerald-200">
                            🗓️ Date: {req.re_exam_date || '30 Oct 2026'} ({req.re_exam_time || '02:00 PM - 05:00 PM'})
                          </span>
                        </div>
                        <div className="text-emerald-900/80 dark:text-emerald-300/80 text-[11px]">
                          <strong>Virtual Room:</strong> {req.re_exam_venue || 'Virtual Room A (Camera AI Proctor)'} • <strong>Proctor:</strong> {req.coordinator_assigned || 'Mr. S. Raman'}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedRetestPass(req)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Ticket className="h-4 w-4" />
                        <span>View Digital Retest Pass 🎫</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong>Reason Citing:</strong> {req.reason_details} {req.document_name && `• Document: ${req.document_name}`}
                      {req.admin_remarks && (
                        <div className="text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                          <strong>Principal Remark:</strong> {req.admin_remarks}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Term Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedTerm('term1')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              selectedTerm === 'term1'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Term 1 Final (CBSE Board &amp; AI Memo)
          </button>
          <button
            onClick={() => setSelectedTerm('ut2')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              selectedTerm === 'ut2'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unit Test 2 (Oct 2026)
          </button>
          <button
            onClick={() => setSelectedTerm('midterm')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              selectedTerm === 'midterm'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mid-Term Assessment (Aug 2026)
          </button>
          <button
            onClick={() => setSelectedTerm('ut1')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              selectedTerm === 'ut1'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unit Test 1 (Jul 2026)
          </button>
        </div>

        <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400">
          Evaluated &amp; Published by Examination Controller
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
              Individual subject marks, maximum scale, grades, and teacher remarks
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {isTerm1 && liveReportCard ? Object.keys(liveReportCard.grades_grid || {}).length : subjectMarksData.length} Subjects Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5 font-bold">Subject</th>
                <th className="py-3.5 px-4 font-bold text-center">Marks Scored</th>
                <th className="py-3.5 px-4 font-bold text-center">Max Marks</th>
                <th className="py-3.5 px-4 font-bold text-center">Grade</th>
                <th className="py-3.5 px-5 font-bold">Pedagogical Observation &amp; Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isTerm1 && liveReportCard ? (
                Object.entries(liveReportCard.grades_grid || {}).map(([sub, detail]) => {
                  const subjectAiObservations: Record<string, string> = {
                    'Mathematics': 'Gemini AI Diagnostic: Identified misconception in distributive sign multiplication during quadratic binomial expansion. Recommendation: Daily 15-min sign bracket drills before bedtime.',
                    'Science & Physics': 'Gemini AI Diagnostic: Strong ray diagram conceptual grasp. Minor Cartesian sign convention lapses in mirror focal length substitution. Enrolled in 1-Week Optics remedial.',
                    'English Literature': 'Gemini AI Diagnostic: Expressive vocabulary. Needs structured PEEL paragraph arguments (Point, Evidence, Explanation, Link) with direct Merchant of Venice citations.',
                    'Social Science': 'Gemini AI Diagnostic: High factual recall of democratic principles. Strengthen chronological timeline sequencing of 1920 Non-Cooperation and 1930 Civil Disobedience.',
                    'Second Language (Hindi)': 'Gemini AI Diagnostic: Good grammar comprehension. Practice Vyakaran sandhi rules and formal letter drafting.',
                    'Computer Science': 'Gemini AI Diagnostic: Exemplary algorithmic thinking in Python loops. Ready to advance into nested 2D matrix traversal and dictionary comprehension.'
                  };

                  return (
                    <tr key={sub} className={detail.remedial_flag ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors'}>
                      <td className="py-4 px-5 font-black text-slate-900 dark:text-white align-top">
                        <div className="flex items-center gap-2">
                          <span>{sub}</span>
                          {detail.remedial_flag && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300">
                              1-Week Remedial Focus Active
                            </span>
                          )}
                        </div>
                        {/* Subject-Wise AI Pedagogical Observation directly below the subject */}
                        <div className="mt-2 p-2 rounded-xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/60 text-[11px] space-y-0.5">
                          <div className="flex items-center gap-1.5 text-violet-800 dark:text-violet-300 font-bold">
                            <Sparkles className="h-3 w-3 text-violet-600" />
                            <span>AI Pedagogical Observation:</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 italic font-normal">
                            {subjectAiObservations[sub] || 'Automated AI synthesis indicates consistent progress across formative objectives.'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm text-center align-top">
                        {detail.score}
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium text-center align-top">
                        {detail.max}
                      </td>
                      <td className="py-4 px-4 text-center align-top">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${
                          detail.grade.startsWith('A') 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : detail.grade.startsWith('B')
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {detail.grade}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-600 dark:text-slate-300 italic max-w-xs leading-relaxed align-top">
                        &quot;{detail.remarks}&quot;
                      </td>
                    </tr>
                  );
                })
              ) : (
                subjectMarksData.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5 font-black text-slate-900 dark:text-white">
                      {s.subject}
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-sm text-center">
                      {s.marksObtained.toFixed(1)}
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium text-center">
                      {s.maxMarks}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${
                        s.grade.startsWith('A') 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {s.grade}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-slate-300 italic max-w-xs leading-relaxed">
                      &quot;{s.teacherRemarks}&quot;
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-800/70 border-t-2 border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white">
              <tr>
                <td className="py-4 px-5 text-sm uppercase">Total Aggregate</td>
                <td className="py-4 px-4 text-base text-blue-600 dark:text-blue-400 text-center">{displayTotalObtained}</td>
                <td className="py-4 px-4 text-sm text-slate-500 text-center">{displayTotalMax}</td>
                <td className="py-4 px-4 text-center">
                  <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-black">
                    {displayGrade} (Distinction)
                  </span>
                </td>
                <td className="py-4 px-5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                  {isTerm1 ? 'Term 1 Official Certified Result · Promoted with Distinction' : 'Top 10% Academic Distinction'}
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

      {/* ========================================================= */}
      {/* UPCOMING EXAMINATION SCHEDULE & SYLLABUS PORTION          */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 dark:border-blue-900/40 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                CBSE Academic Schedule
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Class 8-B Term 2 Horizon</span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
              Upcoming Examination Schedule &amp; Preparation Portions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official CBSE timetable, syllabus chapters covered, hall ticket clearance, and re-exam request permissions
            </p>
          </div>
          <button
            onClick={handleOpenAdmitCard}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Award className="h-4 w-4" />
            <span>Download Upcoming Admit Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Exam 1 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Starts 18 Nov 2026
              </span>
              <span className="text-[11px] font-bold text-amber-600">30 Days Left</span>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Term 2 CBSE Pre-Board Examination
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Full CBSE 80-Mark descriptive paper across all 6 core curriculum subjects.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div><strong>Portion: </strong>NCERT Chapters 1 to 14 (Full Board Syllabus)</div>
              <div><strong>Admit Card: </strong>Clearance Issued &bull; Hall Ticket #OIS-8814</div>
            </div>
          </div>

          {/* Exam 2 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                Starts 02 Dec 2026
              </span>
              <span className="text-[11px] font-bold text-slate-400">Upcoming</span>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Unit Test 3 Formative Assessment
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              25-Mark periodic test targeting post-midterm chapters and practical applications.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div><strong>Portion: </strong>Math Ch 11-12, Science Ch 13-14, English Units 5-6</div>
              <div><strong>Timetable: </strong>Published by Examination Controller</div>
            </div>
          </div>

          {/* Exam 3 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Starts 15 Jan 2027
              </span>
              <span className="text-[11px] font-bold text-slate-400">Annual</span>
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Annual Science Practical &amp; Python Lab Viva
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hands-on lab experiment evaluation and coding viva conducted by external CBSE evaluators.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div><strong>Portion: </strong>Optics Bench Experiments &amp; Python 2D Matrix Labs</div>
              <div><strong>Lab Manual: </strong>Submission due by 10 Jan 2027</div>
            </div>
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
                    {studentName.replace(/\s+/g, '_')}_{className.replace(/\s+/g, '_')}_ReportCard.pdf (Signed by Principal with SHA-256 Checksum)
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

      {/* ===================================================== */}
      {/* OFFICIAL ADMIT CARD / HALL TICKET MODAL FOR PARENTS   */}
      {/* ===================================================== */}
      {showAdmitCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            {/* Modal Controls Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    CBSE Board &amp; Term Examination Admit Card
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Candidate: {studentName} · Document Ref: EDU-ADM-{admitCardData?.roll_number || '14'}-2026
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Copy</span>
                </button>
                <button
                  onClick={() => setShowAdmitCardModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {loadingAdmitCard ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">Retrieving official cryptographically signed hall ticket...</p>
              </div>
            ) : (
              <div className="space-y-5 print:p-0">
                {/* School Header Stamp Box */}
                <div className="rounded-2xl border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20 p-5 text-center space-y-1 relative overflow-hidden">
                  <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
                    <GraduationCap className="h-28 w-28 text-purple-600" />
                  </div>

                  <span className="inline-block text-[10px] font-black tracking-widest text-purple-700 dark:text-purple-300 uppercase px-3 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800">
                    CENTRAL BOARD OF SECONDARY EDUCATION
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    ST. XAVIER&apos;S INTERNATIONAL ACADEMY
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Affiliation #830029 · School Code #40182 · Main Campus Academic Block
                  </p>
                  <div className="pt-2">
                    <span className="text-xs font-black uppercase text-slate-900 dark:text-white px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 inline-block shadow-xs">
                      {admitCardData?.exam_name || 'TERM 1 DESCRIPTIVE EXAMINATION (2026-27)'}
                    </span>
                  </div>
                </div>

                {/* Candidate Credentials Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Name</span>
                    <strong className="text-slate-900 dark:text-white text-sm">
                      {admitCardData?.student_name || 'Aarav Sharma'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Roll / Board Reg</span>
                    <strong className="text-purple-600 dark:text-purple-400 text-sm font-mono">
                      #{admitCardData?.roll_number || '14'}
                    </strong>
                    <span className="text-[10px] text-slate-400 block font-mono">2026-CBSE-8B-014</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Class &amp; Section</span>
                    <strong className="text-slate-900 dark:text-white text-sm">
                      {admitCardData?.grade_level || 'Class 8'} - {admitCardData?.section || 'B'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Hall &amp; Desk</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                      {admitCardData?.hall_number || 'Hall B'}, Desk {admitCardData?.desk_number || '#A-14'}
                    </strong>
                  </div>
                </div>

                {/* Timetable Schedule Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Approved Examination Timetable
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Reporting Time: <strong>{admitCardData?.reporting_time || '08:30 AM IST'}</strong>
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/70 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                          <th className="py-2.5 px-3">Date &amp; Day</th>
                          <th className="py-2.5 px-3">Subject</th>
                          <th className="py-2.5 px-3">Time Window</th>
                          <th className="py-2.5 px-3">Hall</th>
                          <th className="py-2.5 px-3">Max Marks</th>
                          <th className="py-2.5 px-3 text-right">Invigilator Sign</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(admitCardData?.schedule || [
                          { date: '2026-10-24', day: 'Saturday', subject: 'Mathematics', time: '09:00 AM - 12:00 PM', hall: 'Hall B', max_marks: 80 },
                          { date: '2026-10-26', day: 'Monday', subject: 'Science', time: '09:00 AM - 12:00 PM', hall: 'Hall B', max_marks: 80 },
                          { date: '2026-10-28', day: 'Wednesday', subject: 'Social Science', time: '09:00 AM - 12:00 PM', hall: 'Hall B', max_marks: 80 },
                          { date: '2026-10-30', day: 'Friday', subject: 'English Language', time: '09:00 AM - 12:00 PM', hall: 'Hall B', max_marks: 80 }
                        ]).map((s: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-mono">
                              <strong>{s.date}</strong> <span className="text-[10px] text-slate-400">({s.day})</span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                              {s.subject}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                              {s.time}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-purple-600">
                              {s.hall}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">
                              {s.max_marks} pts
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-300 dark:text-slate-600 font-serif italic text-xs">
                              [Verified]
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Parent Guidelines */}
                <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-1.5 text-[11px] text-blue-900 dark:text-blue-200">
                  <span className="font-bold flex items-center gap-1.5 text-xs text-blue-950 dark:text-blue-300">
                    <ShieldCheck className="h-4 w-4" />
                    Notice for Parents &amp; Guardians
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Please ensure your ward arrives before 08:30 AM with their physical school identity card and stationery pouch.</li>
                    <li>School bus routes will run on morning examination shifts; check the Live Bus Tracker tab for adjusted stop timings.</li>
                    <li>If a student is unwell on exam day, immediately submit an official medical leave request via the Leave tab.</li>
                  </ul>
                </div>

                {/* Official Signatures Bar */}
                <div className="flex items-end justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
                  <div>
                    <div className="font-serif italic text-sm text-slate-700 dark:text-slate-300 font-bold">
                      Dr. Hemanth Sen
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Controller of Examinations
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">
                      ✓ Digitally Authenticated {admitCardData?.issued_date || '2026-10-18'}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="font-serif italic text-sm text-slate-700 dark:text-slate-300 font-bold">
                      Fr. George Varghese
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Principal &amp; Center Head
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Re-Exam Request Modal */}
      {showReExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Request Re-Examination (Medical / Exemption)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Submit parent exemption application to Principal for student re-test approval
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowReExamModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReExam} className="mt-4 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Candidate</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {studentName} &bull; {className}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject for Re-Examination *
                </label>
                <select
                  value={reExamSubject}
                  onChange={(e) => setReExamSubject(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science (Physics, Chemistry, Biology)</option>
                  <option value="English">English Communicative</option>
                  <option value="Social Science">Social Science (History, Civics, Geography)</option>
                  <option value="Hindi">Hindi Course-B</option>
                  <option value="Sanskrit">Sanskrit (Third Language)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Examination Name *
                </label>
                <select
                  value={reExamExamName}
                  onChange={(e) => setReExamExamName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Term 1 Descriptive Examination">Term 1 Descriptive Examination</option>
                  <option value="Periodic Assessment 2 (UT2)">Periodic Assessment 2 (UT2)</option>
                  <option value="Mid-Term Diagnostic Assessment">Mid-Term Diagnostic Assessment</option>
                  <option value="Pre-Board Practical Evaluation">Pre-Board Practical Evaluation</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Missed Exam Date *
                  </label>
                  <input
                    type="date"
                    value={reExamMissedDate}
                    onChange={(e) => setReExamMissedDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reason Category *
                  </label>
                  <select
                    value={reExamCategory}
                    onChange={(e) => setReExamCategory(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Hospitalization">Hospitalization / Bed Rest</option>
                    <option value="Bereavement">Bereavement / Family Emergency</option>
                    <option value="Sports Representation">Sports / Olympiad Representation</option>
                    <option value="Other">Other Legitimate Grounds</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Doctor's Diagnosis & Detailed Justification *
                </label>
                <textarea
                  rows={3}
                  value={reExamDetails}
                  onChange={(e) => setReExamDetails(e.target.value)}
                  placeholder="Explain symptoms, hospitalization or doctor's prescribed bed rest period..."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Medical Certificate / Supporting Document (PDF / Scan) *
                </label>
                <input
                  type="file"
                  id="reexam-doctor-file-input"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setReExamFile(file);
                      setReExamDocName(file.name);
                      const kb = Math.round(file.size / 1024);
                      setReExamFileSize(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
                    }
                  }}
                />

                {reExamDocName ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {reExamDocName}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {reExamFileSize} • Attached &amp; ready for Principal verification
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label
                        htmlFor="reexam-doctor-file-input"
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all hover:shadow-xs"
                      >
                        Change File
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setReExamFile(null);
                          setReExamDocName('');
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="reexam-doctor-file-input"
                    className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 cursor-pointer transition-all text-center group"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Click to upload Doctor's Note / Medical Certificate
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        PDF, JPG, PNG or WEBP up to 10MB
                      </p>
                    </div>
                  </label>
                )}

                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                  Doctor's seal and registration number must be clearly visible on the certificate.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReExamModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReExam}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingReExam ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Submitting to Principal...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Submit Re-Exam Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Evaluation Key & Graded Script Modal */}
      <EvaluationKeyModal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        subject={selectedEvalSubject}
        examTitle={isTerm1 ? 'Term 1 Periodic Assessment (Mid-Term)' : 'Unit Test 2 Assessment'}
        studentName={studentName}
        totalScore={22.5}
        maxTotal={25}
        grade="A1"
      />

      {/* Re-Exam Admit Pass Modal */}
      {selectedRetestPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Official Supplementary Retest Admit Docket
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Sanctioned under Medical Exemption Clause • Ref: EDU-2026-RET-{selectedRetestPass.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRetestPass(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Candidate & Exam Metadata Docket */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Name</span>
                  <strong className="text-slate-900 dark:text-white">{selectedRetestPass.student_name}</strong>
                  <span className="text-[10px] text-slate-400 block font-mono">Roll #14 • Class 8-B</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Examination Subject</span>
                  <strong className="text-purple-600 dark:text-purple-400">{selectedRetestPass.subject}</strong>
                  <span className="text-[10px] text-slate-400 block">{selectedRetestPass.exam_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Retest Date &amp; Time</span>
                  <strong className="text-slate-900 dark:text-white">{selectedRetestPass.re_exam_date || '30 Oct 2026'}</strong>
                  <span className="text-[10px] text-emerald-600 font-bold block">{selectedRetestPass.re_exam_time || '02:00 PM - 05:00 PM IST'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Online Proctored Venue</span>
                  <strong className="text-slate-900 dark:text-white">{selectedRetestPass.re_exam_venue || 'Virtual Room A'}</strong>
                  <span className="text-[10px] text-slate-400 block">Invigilator: {selectedRetestPass.coordinator_assigned || 'Mr. S. Raman'}</span>
                </div>
              </div>
            </div>

            {/* AI Proctoring Guidelines */}
            <div className="rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 p-3 text-xs space-y-1.5">
              <span className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                Online Schooling AI Proctor Protocols:
              </span>
              <ul className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Primary web-camera must have an unblocked view of the candidate&apos;s face and desk.</li>
                <li>Live AI tracking detects eye-gaze shifts, multiple faces, and secondary device screens.</li>
                <li>System mic will remain unmuted for ambient anomaly monitoring throughout the 180 mins.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  downloadMarksMemoFile(selectedRetestPass.student_name, `Retest Admit Card - ${selectedRetestPass.subject}`);
                  setDownloadToast(`Retest Admit Pass for ${selectedRetestPass.subject} downloaded successfully.`);
                  setTimeout(() => setDownloadToast(null), 3000);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Pass PDF</span>
              </button>

              <button
                onClick={() => {
                  setDownloadToast(`Connecting to ${selectedRetestPass.re_exam_venue}... Camera & AI Proctor test passed!`);
                  setTimeout(() => setDownloadToast(null), 4000);
                }}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Video className="h-3.5 w-3.5" />
                <span>Join Proctored Session</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
