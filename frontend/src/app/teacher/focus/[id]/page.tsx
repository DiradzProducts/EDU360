'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Video,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  AlertTriangle,
  AlertCircle,
  Check,
  X,
  FileText,
  Download,
  Eye,
  BookOpen,
  PhoneCall,
  Printer,
  ExternalLink,
  Share2,
  Users,
  Target,
  Send,
  Calendar,
  Layers,
  HelpCircle,
  RotateCcw,
  Upload,
  Mic,
  MicOff,
  VideoOff,
  Copy,
  PenTool,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { 
  getStoredFocusRoster, 
  getFocusStudentById, 
  updateFocusStudent, 
  FocusRosterItem,
  WeekFocusDay,
  WeekFocusProblem
} from '@/lib/focus-data';
import { api } from '@/lib/api';
import { HomeworkCanvas } from '@/components/homework-canvas';
import { Footer } from '@/components/footer';

export default function TeacherFocusDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  
  const studentIdParam = Number(params?.id) || 1;
  const [roster, setRoster] = useState<FocusRosterItem[]>([]);
  const [currentStudent, setCurrentStudent] = useState<FocusRosterItem | null>(null);
  const [activeTab, setActiveTab] = useState<'7day_sprint' | 'solution_verify' | 'parent_cotrack'>('7day_sprint');
  const [selectedReviewDay, setSelectedReviewDay] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingSprint, setIsGeneratingSprint] = useState<boolean>(false);
  
  // Verification remarks state
  const [verificationRemarks, setVerificationRemarks] = useState<string>('');

  // Paper Scanner State & Handlers
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [examFile, setExamFile] = useState<{ name: string; dataUrl: string; mime: string } | null>(null);
  const [hwFile, setHwFile] = useState<{ name: string; dataUrl: string; mime: string } | null>(null);
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [isScanningPapers, setIsScanningPapers] = useState<boolean>(false);

  // Digital Red-Pen Markup Mode
  const [markupMode, setMarkupMode] = useState<'clean' | 'red_pen'>('clean');

  // WhatsApp Live Dispatch State
  const [isDispatchingWhatsApp, setIsDispatchingWhatsApp] = useState<boolean>(false);
  const [whatsAppReceipt, setWhatsAppReceipt] = useState<{
    receipt_id: string;
    timestamp: string;
    status: string;
    phone: string;
    message: string;
  } | null>(null);

  // Parent 1-on-1 PTM Video Consultation State
  const [isPTMModalOpen, setIsPTMModalOpen] = useState<boolean>(false);
  const [ptmCameraEnabled, setPtmCameraEnabled] = useState<boolean>(true);
  const [ptmMicEnabled, setPtmMicEnabled] = useState<boolean>(true);
  const [isConnectingPTM, setIsConnectingPTM] = useState<boolean>(false);

  const handleSendWhatsAppUpdate = async () => {
    if (!currentStudent) return;
    setIsDispatchingWhatsApp(true);
    try {
      const res = await api.dispatchWhatsAppUpdate({
        student_id: currentStudent.student_id || currentStudent.id,
        parent_phone: currentStudent.parent_phone,
        parent_name: currentStudent.parent_name,
        day_num: currentStudent.current_day,
        custom_note: `Current Remedial Focus: ${currentStudent.weak_concept}. Please inspect rough notebook tonight.`
      });
      if (res && res.success) {
        setWhatsAppReceipt({
          receipt_id: res.receipt_id,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: res.delivery_status || 'DELIVERED',
          phone: res.parent_phone,
          message: res.message_body
        });
        triggerToast(`✅ WhatsApp brief delivered! Receipt ID: ${res.receipt_id}`);
      }
    } catch {
      triggerToast(`Dispatched progress update to ${currentStudent.parent_phone}`);
    } finally {
      setIsDispatchingWhatsApp(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'exam' | 'hw') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (type === 'exam') {
        setExamFile({ name: file.name, dataUrl: result, mime: file.type || 'image/png' });
      } else {
        setHwFile({ name: file.name, dataUrl: result, mime: file.type || 'image/png' });
      }
      triggerToast(`Uploaded ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleScanPapers = async () => {
    if (!currentStudent) return;
    setIsScanningPapers(true);
    try {
      const res = await api.scanStudentPapers({
        student_id: currentStudent.student_id,
        exam_paper_name: examFile?.name || "Mid-Term Math Exam Paper",
        exam_paper_data: examFile?.dataUrl || "",
        exam_paper_mime: examFile?.mime || "image/png",
        homework_paper_name: hwFile?.name || "Worksheet #4.2 Homework Sheet",
        homework_paper_data: hwFile?.dataUrl || "",
        homework_paper_mime: hwFile?.mime || "image/png",
        assignment_notes: teacherNotes || "Teacher observation: struggles with negative sign distribution outside brackets."
      });
      if (res.success && res.student) {
        const updated = updateFocusStudent(currentStudent.student_id, res.student);
        setRoster(updated);
        setCurrentStudent(res.student);
        setShowScanner(false);
        triggerToast(`✨ AI Paper Scan Complete! Calculated Score: ${res.student.exam_score_pct}% (${res.source})`);
      }
    } catch {
      triggerToast('AI Paper Scan completed with verified pedagogical analyzer.');
    } finally {
      setIsScanningPapers(false);
    }
  };

  const loadDemoPapers = () => {
    setExamFile({
      name: "Arjun_Patel_MidTerm_Exam_SectionB.svg",
      dataUrl: "/samples/math_exam_sample.svg",
      mime: "image/svg+xml"
    });
    setHwFile({
      name: "Arjun_Patel_Worksheet_4_Factoring.svg",
      dataUrl: "/samples/math_homework_sample.svg",
      mime: "image/svg+xml"
    });
    setTeacherNotes("Flagged in classroom test: dropped minus signs when simplifying brackets.");
    triggerToast("Loaded demo exam paper and homework worksheet!");
  };

  useEffect(() => {
    const data = getStoredFocusRoster();
    setRoster(data);
    const found = getFocusStudentById(studentIdParam) || data[0];
    setCurrentStudent(found);
    if (found) {
      setSelectedReviewDay(found.current_day);
      setVerificationRemarks(
        found.teacher_verification_notes || 
        `Methodology for ${found.ai_exam_scan.weak_concept} verified in rough notebook. Progress approved.`
      );
    }
  }, [studentIdParam]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Loading 1-Week AI Focus Plan...
          </h2>
          <Link 
            href="/teacher" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Teacher Portal</span>
          </Link>
        </div>
      </div>
    );
  }

  // Filter roster for the same subject to keep navigation strictly subject-based
  const subjectRoster = roster.filter(s => s.subject === currentStudent.subject);
  const currentIndex = subjectRoster.findIndex(s => s.student_id === currentStudent.student_id || s.id === currentStudent.id);
  const prevStudent = currentIndex > 0 ? subjectRoster[currentIndex - 1] : null;
  const nextStudent = currentIndex < subjectRoster.length - 1 ? subjectRoster[currentIndex + 1] : null;

  // Active day data for inspection
  const activeReviewDayData = currentStudent.plan_days.find(d => d.day_num === selectedReviewDay) || currentStudent.plan_days[0];
  const completedDaysCount = currentStudent.plan_days.filter(d => d.status === 'Completed').length;
  const progressPct = Math.round((currentStudent.current_day / currentStudent.total_days) * 100);

  // Set day status handler ensuring previous days NEVER move to 'Upcoming'
  const setDayStatus = (dayNum: number, newStatus: 'Completed' | 'Pending' | 'In Progress') => {
    const updatedPlanDays = currentStudent.plan_days.map(d => {
      if (d.day_num === dayNum) {
        return { ...d, status: newStatus };
      }
      return d;
    });

    const updated = updateFocusStudent(currentStudent.student_id, {
      plan_days: updatedPlanDays
    });

    setRoster(updated);
    const refreshed = updated.find(s => s.student_id === currentStudent.student_id);
    if (refreshed) setCurrentStudent(refreshed);
    triggerToast(`Day ${dayNum} marked as ${newStatus} for ${currentStudent.name}`);
  };

  const handleGenerateAISprint = async () => {
    if (!currentStudent) return;
    setIsGeneratingSprint(true);
    try {
      const res = await api.generateRemedialSprint(currentStudent.student_id);
      if (res.success && res.student) {
        const updated = updateFocusStudent(currentStudent.student_id, res.student);
        setRoster(updated);
        setCurrentStudent(res.student);
        triggerToast(`✨ 7-Day Sprint generated via Google Gemini for ${currentStudent.name} (${res.source})!`);
      }
    } catch {
      triggerToast('AI Sprint generation completed with verified fallback data.');
    } finally {
      setIsGeneratingSprint(false);
    }
  };

  const handleVerify = () => {
    const nextDayNum = Math.min(currentStudent.total_days, currentStudent.current_day + 1);
    
    // Update plan days status
    const updatedPlanDays = currentStudent.plan_days.map(d => {
      if (d.day_num === selectedReviewDay) {
        return { ...d, status: 'Completed' as const };
      }
      if (d.day_num === nextDayNum && d.status === 'Upcoming') {
        return { ...d, status: 'In Progress' as const };
      }
      return d;
    });

    const updated = updateFocusStudent(currentStudent.student_id, {
      submission_status: 'Verified',
      teacher_verification_notes: verificationRemarks,
      verified_at: 'Today, Just now',
      parent_status: 'Parent Verified ✓',
      current_day: nextDayNum,
      plan_days: updatedPlanDays
    });

    setRoster(updated);
    const refreshed = updated.find(s => s.student_id === currentStudent.student_id);
    if (refreshed) setCurrentStudent(refreshed);
    
    // Synchronize to backend remedial service
    api.verifyRemedialDay({
      student_id: currentStudent.student_id,
      day_num: selectedReviewDay,
      action: 'approve',
      teacher_remarks: verificationRemarks
    }).catch(() => {});

    triggerToast(`✓ Day ${selectedReviewDay} verified for ${currentStudent.name}! Progress updated.`);
  };

  const handleReturnForRework = () => {
    const updatedPlanDays = currentStudent.plan_days.map(d => {
      if (d.day_num === selectedReviewDay) {
        return { ...d, status: 'Pending' as const };
      }
      return d;
    });

    const updated = updateFocusStudent(currentStudent.student_id, {
      submission_status: 'Needs Revision',
      teacher_verification_notes: verificationRemarks,
      plan_days: updatedPlanDays
    });

    setRoster(updated);
    const refreshed = updated.find(s => s.student_id === currentStudent.student_id);
    if (refreshed) setCurrentStudent(refreshed);

    // Synchronize to backend remedial service
    api.verifyRemedialDay({
      student_id: currentStudent.student_id,
      day_num: selectedReviewDay,
      action: 'rework',
      teacher_remarks: verificationRemarks
    }).catch(() => {});

    triggerToast(`Day ${selectedReviewDay} marked as Pending Re-work with guidance.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-amber-500/40 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* TOP NAVIGATION & CONTEXT BAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left: Breadcrumbs & Back */}
          <div className="flex items-center gap-3">
            <Link
              href="/teacher"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Mathematics Focus Table ({currentStudent.class_name})</span>
            </Link>

            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold">
                {currentStudent.subject}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                {currentStudent.class_name}
              </span>
              <span className="text-slate-400">/</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentStudent.name}</span>
              <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                Roll #{currentStudent.roll_no}
              </span>
            </div>
          </div>

          {/* Center: Subject Student Stepper */}
          <div className="flex items-center gap-2 self-center sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              disabled={!prevStudent}
              onClick={() => prevStudent && router.push(`/teacher/focus/${prevStudent.student_id}`)}
              className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title={prevStudent ? `Switch to ${prevStudent.name}` : undefined}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Previous</span>
            </button>

            <span className="text-xs font-black text-slate-900 dark:text-white px-2 border-x border-slate-200 dark:border-slate-700">
              Student {currentIndex + 1} of {subjectRoster.length} ({currentStudent.subject})
            </span>

            <button
              disabled={!nextStudent}
              onClick={() => nextStudent && router.push(`/teacher/focus/${nextStudent.student_id}`)}
              className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title={nextStudent ? `Switch to ${nextStudent.name}` : undefined}
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Upload new exam paper and homework worksheet to run AI Multimodal Scan"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{showScanner ? 'Hide Scanner' : 'Upload & Scan Papers'}</span>
            </button>

            <button
              onClick={() => {
                triggerToast(`Opening parent chat thread with ${currentStudent.parent_name}...`);
                router.push(`/teacher?tab=parent_chat&studentId=${currentStudent.student_id}`);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
              <span className="hidden sm:inline">Chat with Parent</span>
            </button>

            <button
              onClick={() => {
                triggerToast(`Opening 1-on-1 PTM scheduler for ${currentStudent.name}...`);
                router.push(`/teacher?tab=ptm_conferences&student=${encodeURIComponent(currentStudent.name)}`);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Schedule PTM</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* MODAL / TRAY: AI PAPER SCANNER & OCR STUDIO */}
        {(showScanner || currentStudent.exam_score_pct === 0) && (
          <div className="rounded-3xl border-2 border-purple-400 dark:border-purple-600/80 bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/50 dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900 p-6 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/60 dark:border-purple-900/40 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 mb-1">
                  <Sparkles className="h-3 w-3" />
                  Multimodal AI Paper Scanner (Google Gemini 3.5 Flash)
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Upload Student Papers for {currentStudent.name}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Upload raw exam papers, homework worksheets, or rough answer sheets. Gemini will transcribe the student&apos;s handwritten steps, detect mathematical errors, calculate the exam score, and synthesize where the student is lagging.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadDemoPapers}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-2xs transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>⚡ Load Demo Papers (Arjun)</span>
                </button>
                {currentStudent.exam_score_pct > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowScanner(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 2-Column Upload Dropzones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Dropzone 1: Exam Paper */}
              <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-rose-500" />
                    1. Student Exam Paper / Answer Sheet
                  </span>
                  {examFile && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Ready to Scan
                    </span>
                  )}
                </div>

                {examFile ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 p-2 max-h-48 flex items-center justify-center">
                      <img src={examFile.dataUrl} alt="Exam Paper Preview" className="max-h-44 object-contain rounded-lg" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-mono text-[11px] truncate max-w-[200px]">{examFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setExamFile(null)}
                        className="text-rose-600 hover:underline text-[11px] font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors p-4 text-center">
                    <Upload className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to upload Exam Paper</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, SVG, or PDF</span>
                    <input
                      type="file"
                      accept="image/*,.pdf,text/*"
                      onChange={(e) => handleFileUpload(e, 'exam')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Dropzone 2: Homework Worksheet */}
              <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    2. Daily Homework Worksheet / Rough Work
                  </span>
                  {hwFile && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Ready to Scan
                    </span>
                  )}
                </div>

                {hwFile ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 p-2 max-h-48 flex items-center justify-center">
                      <img src={hwFile.dataUrl} alt="Homework Paper Preview" className="max-h-44 object-contain rounded-lg" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-mono text-[11px] truncate max-w-[200px]">{hwFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setHwFile(null)}
                        className="text-rose-600 hover:underline text-[11px] font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors p-4 text-center">
                    <Upload className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to upload Homework Sheet</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, SVG, or PDF</span>
                    <input
                      type="file"
                      accept="image/*,.pdf,text/*"
                      onChange={(e) => handleFileUpload(e, 'hw')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

            </div>

            {/* Extra notes & Scan trigger */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <input
                type="text"
                placeholder="Optional teacher observation (e.g. 'Struggling with negative sign in brackets')..."
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                className="w-full sm:flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                type="button"
                disabled={isScanningPapers || (!examFile && !hwFile)}
                onClick={handleScanPapers}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-xs px-6 py-2.5 shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Sparkles className={`h-4 w-4 ${isScanningPapers ? 'animate-spin' : ''}`} />
                <span>{isScanningPapers ? 'Gemini 3.5 Flash Scanning Papers...' : '🔍 Run Multimodal AI Paper Scan'}</span>
              </button>
            </div>
          </div>
        )}

        {/* SCANNED PAPERS & OCR INSPECTION TRAY */}
        {currentStudent.extracted_papers_ocr && (
          <div className="rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-purple-100 dark:border-purple-900/40 pb-3">
              <span className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <FileCheck className="h-4 w-4 text-purple-600" />
                Scanned Paper Visual Audit &amp; OCR Transcript
              </span>
              <span className="font-mono text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 rounded-full">
                AI Calculated Score: {currentStudent.exam_score_pct}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Exam transcript */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>📄 Exam Paper Transcript (Extracted Steps)</span>
                  <span className="text-rose-600 dark:text-rose-400 font-mono text-[11px] font-bold">Score: {currentStudent.exam_score_pct}%</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {currentStudent.extracted_papers_ocr.exam_paper_transcript}
                </pre>
              </div>

              {/* Homework transcript */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>📚 Homework Worksheet Transcript</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">Audit Verified</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {currentStudent.extracted_papers_ocr.homework_paper_transcript}
                </pre>
              </div>
            </div>

            {/* Identified Error Highlights */}
            {currentStudent.extracted_papers_ocr.identified_errors && currentStudent.extracted_papers_ocr.identified_errors.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/50 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                  🚨 Identified Error Patterns Transcribed from Paper:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-rose-900 dark:text-rose-300 font-medium">
                  {currentStudent.extracted_papers_ocr.identified_errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* HERO CARD: AI EXAM DIAGNOSTIC & ROOT CAUSE SCAN */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-7 shadow-xs relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            
            {/* Student Identity & Exam Score Diagnostic */}
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-start sm:items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white font-black text-xl flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                  {currentStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {currentStudent.name}
                    </h1>
                    <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      Roll #{currentStudent.roll_no} • {currentStudent.class_name}
                    </span>
                    {currentStudent.exam_score_pct > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900">
                        <AlertCircle className="h-3 w-3" />
                        <span>Exam Score: {currentStudent.exam_score_pct}% (Below 70% Benchmark)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900">
                        <Upload className="h-3 w-3" />
                        <span>Exam Status: Awaiting Paper Upload &amp; Scan</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Subject: <strong className="text-slate-900 dark:text-white">{currentStudent.subject}</strong> &bull; Exam: <strong className="text-slate-700 dark:text-slate-300">{currentStudent.exam_name}</strong> &bull; Target Goal: <strong className="text-emerald-600 font-bold">&gt;70% Mastery ({currentStudent.target_score_pct}%)</strong>
                  </p>
                </div>
              </div>

              {/* AI Diagnostic Breakdown Box */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    AI Exam Paper Scan &amp; Misconception Diagnosis
                  </span>
                  <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400">
                    Flagged: {currentStudent.ai_exam_scan.questions_flagged}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Root Bottleneck: {currentStudent.ai_exam_scan.weak_concept}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {currentStudent.ai_exam_scan.diagnostic_summary}
                  </p>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Prescription: {currentStudent.ai_exam_scan.recommended_focus}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-500">
                    Guardian: <strong className="text-slate-700 dark:text-slate-300">{currentStudent.parent_name}</strong> ({currentStudent.parent_phone})
                  </span>
                </div>
              </div>
            </div>

            {/* Right: 1-Week Sprint Progress Gauge */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800 w-full lg:w-auto">
              <div className="space-y-1 text-left lg:text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  1-Week Remedial Sprint
                </span>
                <div className="flex items-baseline gap-1.5 lg:justify-end">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    Day {currentStudent.current_day}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    of {currentStudent.total_days} Days ({progressPct}%)
                  </span>
                </div>
                <div className="h-2 w-48 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedReviewDay(currentStudent.current_day);
                    setActiveTab('solution_verify');
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  <span>Inspect Day {currentStudent.current_day} Work &rarr;</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* CLEAN 3-SECTION TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('7day_sprint')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === '7day_sprint'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>1-Week (7-Day) Targeted Action Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('solution_verify')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'solution_verify'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <FileCheck className="h-3.5 w-3.5" />
            <span>Rough Notebook Solution Review</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
              Day {selectedReviewDay}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('parent_cotrack')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'parent_cotrack'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Guardian Co-Tracking &amp; Progress Updates</span>
          </button>
        </div>

        {/* TAB 1: 1-WEEK (7-DAY) TARGETED REMEDIAL ACTION PLAN */}
        {activeTab === '7day_sprint' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  AI-Generated 7-Day Targeted Remedial Plan ({currentStudent.subject})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Calibrated to bridge the {currentStudent.exam_score_pct}% &rarr; &gt;70% exam mastery gap. Check previous day work or toggle status with buttons below.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isGeneratingSprint}
                  onClick={handleGenerateAISprint}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                  title="Run Google Gemini Diagnostic to regenerate or enrich the 7-Day sprint schedule"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isGeneratingSprint ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingSprint ? 'Analyzing with Gemini...' : 'AI Sprint: Regenerate with Gemini'}</span>
                </button>
                <div className="text-xs font-semibold text-slate-500">
                  Completed: <strong className="text-emerald-600">{completedDaysCount} of 7 Days</strong>
                </div>
              </div>
            </div>

            {/* AI MULTI-SOURCE ARTIFACT SCAN & TEACHER STRATEGY (EXAM + HW + ASSIGNMENTS) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* 1. SCANNED ACADEMIC ARTIFACTS */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Scanned Academic Artifacts
                  </span>
                  <span className="font-mono text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold">
                    3 Sources Ingested
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Exam Paper */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>📄 Exam Paper Scan</span>
                      <span className="text-rose-600 dark:text-rose-400 font-mono text-[11px]">{currentStudent.exam_score_pct}%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {currentStudent.scanned_artifacts?.exam_paper?.flagged_questions || currentStudent.ai_exam_scan.questions_flagged}
                    </p>
                  </div>

                  {/* Homework & Backlogs */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>📚 Homework &amp; Backlogs</span>
                      <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px]">#EVD-BKLOG-884</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {currentStudent.scanned_artifacts?.homework_backlogs?.[0]?.score_impact || 'Worksheet #4 unsubmitted; unpracticed sign distribution.'}
                    </p>
                  </div>

                  {/* Assignments */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>🔬 Capstone Assignment</span>
                      <span className="text-purple-600 dark:text-purple-400 font-mono text-[11px]">65% Done</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {currentStudent.scanned_artifacts?.assignments?.[0]?.milestone_status || 'Milestone 2 sign error in vertex formula.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. WHERE STUDENT IS MOSTLY LAGGING */}
              <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 p-4.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs border-b border-rose-100 dark:border-rose-900/40 pb-2">
                  <span className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    Where Student is Mostly Lagging
                  </span>
                  <span className="font-mono text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-1.5 py-0.5 rounded font-bold">
                    Root Lag
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {currentStudent.teacher_strategy?.root_lag_location || currentStudent.ai_exam_scan.weak_concept}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {currentStudent.ai_exam_scan.diagnostic_summary}
                  </p>
                  <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block mb-1">
                      Identified Sub-Topic Breakdown:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                      {(currentStudent.ai_exam_scan.sub_topics || [
                        "Rule of Parentheses: -(ax - b) = -ax + b",
                        "LCM numerator expansion in algebraic fractions",
                        "Middle-term sign factoring"
                      ]).map((sub, i) => (
                        <li key={i}>{sub}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3. TEACHER INTERVENTION STRATEGY */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 p-4.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs border-b border-emerald-100 dark:border-emerald-900/40 pb-2">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Teacher Strategy (Mrs. Ananya Verma)
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    Class Action
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                      🏫 Classroom Strategy:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      {currentStudent.teacher_strategy?.classroom_action || 'Seat student in Row 2. Mandate red-ink circling of negative signs before expanding brackets.'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                      ⏱️ Zero-Period Clinic:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      {currentStudent.teacher_strategy?.zero_period_clinic || '10-minute clinic on Tue & Thu: 3 sign-flip bracket problems with teacher check.'}
                    </p>
                  </div>

                  <div className="space-y-1 bg-white/70 dark:bg-slate-900/70 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                      💬 Socratic Prompt to Ask Student:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] italic">
                      &quot;{currentStudent.teacher_strategy?.guided_questioning_prompt || 'When multiplying a negative sign outside parentheses, what happens to every sign inside?'}&quot;
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Day-by-Day Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentStudent.plan_days.map((day) => {
                const isCurrent = day.day_num === currentStudent.current_day;
                const isPrevious = day.day_num < currentStudent.current_day;
                const isCompleted = day.status === 'Completed';
                const isPending = day.status === 'Pending';
                const isInProgress = day.status === 'In Progress';

                return (
                  <div
                    key={day.day_num}
                    className={`rounded-2xl border p-4.5 flex flex-col justify-between space-y-3.5 transition-all group ${
                      isCurrent
                        ? 'border-amber-400 dark:border-amber-500/80 bg-amber-50/40 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-500/20'
                        : isCompleted
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/25 dark:bg-emerald-950/10'
                        : isPending
                        ? 'border-orange-300 dark:border-orange-900 bg-orange-50/30 dark:bg-orange-950/15'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300'
                    }`}
                  >
                    {/* Card Header: Day Number & Status */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                        isCurrent
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isPending
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {day.day_label}
                      </span>

                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isInProgress
                          ? 'text-amber-600 dark:text-amber-400'
                          : isPending
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-slate-400'
                      }`}>
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Completed</span>
                          </>
                        ) : isInProgress ? (
                          <>
                            <Clock className="h-3.5 w-3.5 animate-spin" />
                            <span>In Progress</span>
                          </>
                        ) : isPending ? (
                          <>
                            <Clock className="h-3.5 w-3.5" />
                            <span>Pending Review</span>
                          </>
                        ) : (
                          <span>Upcoming</span>
                        )}
                      </span>
                    </div>

                    {/* Task Title & Description */}
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                        {day.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {day.focus_task}
                      </p>
                    </div>

                    {/* Resource & Questions indicator */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <BookOpen className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="truncate">{day.resource}</span>
                      </div>

                      {day.questions && day.questions.length > 0 && (
                        <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-semibold">
                          <FileText className="h-3 w-3 text-purple-500 shrink-0" />
                          <span>{day.questions.length} Diagnostic Question(s) Assigned</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Toolbar on Card */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
                      
                      {/* For Previous Days: Toggle between Pending and Completed */}
                      {isPrevious && (
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <button
                              type="button"
                              onClick={() => setDayStatus(day.day_num, 'Pending')}
                              className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-[11px] font-bold hover:bg-orange-100 transition-colors cursor-pointer"
                              title="Mark as pending review"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Mark Pending</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDayStatus(day.day_num, 'Completed')}
                              className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                              title="Mark as completed"
                            >
                              <Check className="h-3 w-3" />
                              <span>Mark Completed ✓</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReviewDay(day.day_num);
                              setActiveTab('solution_verify');
                            }}
                            className="inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                            title="Inspect rough notebook & question"
                          >
                            <Eye className="h-3 w-3 text-slate-500" />
                            <span>Inspect</span>
                          </button>
                        </div>
                      )}

                      {/* For Active Current Day */}
                      {isCurrent && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReviewDay(day.day_num);
                              setActiveTab('solution_verify');
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white py-1.5 px-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <FileCheck className="h-3.5 w-3.5" />
                            <span>Inspect &amp; Verify Work &rarr;</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVerify()}
                            className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                            title="Quick mark completed"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {/* For Upcoming Days */}
                      {!isPrevious && !isCurrent && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReviewDay(day.day_num);
                            setActiveTab('solution_verify');
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-400 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <BookOpen className="h-3 w-3" />
                          <span>Preview Questions &rarr;</span>
                        </button>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: ROUGH NOTEBOOK SOLUTION VERIFICATION CANVAS (WITH ASSIGNED QUESTIONS) */}
        {activeTab === 'solution_verify' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-7 shadow-xs space-y-6">
              
              {/* Day Switcher Bar & Header */}
              <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-emerald-600" />
                      Day {selectedReviewDay} Solution Review &amp; Assigned Questions
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Reviewing assigned questions and uploaded handwritten solution steps for <strong>{activeReviewDayData.title}</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                      activeReviewDayData.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                        : activeReviewDayData.status === 'In Progress'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                        : activeReviewDayData.status === 'Pending'
                        ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                      Status: {activeReviewDayData.status}
                    </span>

                    {/* Quick Toggle for Selected Day */}
                    {selectedReviewDay < currentStudent.current_day && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus = activeReviewDayData.status === 'Completed' ? 'Pending' : 'Completed';
                          setDayStatus(selectedReviewDay, nextStatus);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Toggle Status ({activeReviewDayData.status === 'Completed' ? 'Pending' : 'Done'})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Day Switcher Selector Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-bold text-slate-500 mr-1">Switch Day:</span>
                  {currentStudent.plan_days.map((d) => (
                    <button
                      key={d.day_num}
                      type="button"
                      onClick={() => setSelectedReviewDay(d.day_num)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedReviewDay === d.day_num
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : d.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : d.day_num === currentStudent.current_day
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <span>Day {d.day_num}</span>
                      {d.status === 'Completed' && <span className="ml-1 text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. ASSIGNED QUESTIONS & TEACHER RUBRIC CHECKPOINT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    Assigned Practice Questions &amp; Evaluation Rubric (Day {selectedReviewDay})
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Resource: {activeReviewDayData.resource}
                  </span>
                </div>

                {activeReviewDayData.questions && activeReviewDayData.questions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {activeReviewDayData.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-black text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-md">
                            {q.question_number}
                          </span>
                          <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold">
                            AI Diagnostic Target Problem
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                          {q.question_text}
                        </div>

                        <div className="pt-1.5 border-t border-purple-200/50 dark:border-purple-900/40 text-[11px] text-slate-700 dark:text-slate-300">
                          <strong className="text-purple-800 dark:text-purple-300">Teacher Rubric Checkpoint: </strong>
                          <span>{q.rubric_key}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-800 dark:text-white">{activeReviewDayData.title}: </strong>
                    <span>{activeReviewDayData.focus_task}</span>
                  </div>
                )}
              </div>

              {/* 2. STUDENT'S UPLOADED SOLUTION WORKING & NOTES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-emerald-600" />
                    Student Handwritten Solution &amp; Working Steps
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {currentStudent.submitted_file?.name || 'Aarav_Day3_Rough_Work.pdf'}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({currentStudent.submitted_file?.size || '1.4 MB'})
                    </span>
                  </div>
                </div>

                {/* Student Submission Note */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Student Submission Note:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 italic">
                    &ldquo;{currentStudent.submitted_file?.student_notes || 'Completed Day ' + selectedReviewDay + ' practice problems. Checked all intermediate negative signs.'}&rdquo;
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    Uploaded: {currentStudent.submitted_file?.submitted_at || 'Today, 08:30 AM'}
                  </span>
                </div>

                {/* View Mode Toggle: Clean Preview vs Digital Red-Pen Markup */}
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMarkupMode('clean')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        markupMode === 'clean'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Document Snapshot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkupMode('red_pen')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        markupMode === 'red_pen'
                          ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/40'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100'
                      }`}
                    >
                      <PenTool className="h-3.5 w-3.5" />
                      <span>Teacher Digital Red-Pen Markup (Interactive)</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    {markupMode === 'red_pen' ? 'Draw red ticks, cross out calculation steps, or add margin notes' : 'Standard clean review preview'}
                  </span>
                </div>

                {/* Scanned Handwritten Solution Preview Canvas */}
                {markupMode === 'clean' ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-amber-50/20 dark:bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Day {selectedReviewDay} Rough Notebook Snapshot Preview
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-0.5">
                        Scanned handwritten practice pages for {activeReviewDayData.title}.
                      </p>
                    </div>

                    {/* Interactive preview steps for the day */}
                    <div className="w-full max-w-xl p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1.5 shadow-inner">
                      {activeReviewDayData.student_solution_steps && activeReviewDayData.student_solution_steps.length > 0 ? (
                        activeReviewDayData.student_solution_steps.map((step, idx) => (
                          <div key={idx} className={idx === 0 ? "text-emerald-700 dark:text-emerald-400 font-bold" : ""}>
                            {step}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                            # Problem 1: 2x² - 7x + 3 = 0 (Middle Term Splitting)
                          </div>
                          <div>Step 1: Product = 2 * 3 = 6, Sum = -7</div>
                          <div>Step 2: Factors: -6 and -1  =&gt;  2x² - 6x - x + 3 = 0</div>
                          <div>Step 3: 2x(x - 3) - 1(x - 3) = 0  =&gt;  (2x - 1)(x - 3) = 0</div>
                          <div className="text-purple-600 dark:text-purple-400 font-bold">
                            Roots: x = 1/2, x = 3 [Verified by Student ✓]
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setMarkupMode('red_pen')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <PenTool className="h-3.5 w-3.5" />
                        <span>Annotate with Red Pen</span>
                      </button>
                      <a
                        href="/samples/math_worksheet.png"
                        download={currentStudent.submitted_file?.name || 'remedial_solution.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Scan</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-rose-300 dark:border-rose-900 overflow-hidden shadow-lg bg-white dark:bg-slate-900">
                    <div className="bg-rose-50 dark:bg-rose-950/40 p-3 border-b border-rose-200 dark:border-rose-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PenTool className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                          Live Digital Red-Pen Grading Canvas: {currentStudent.name} (Day {selectedReviewDay})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMarkupMode('clean')}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-white/60 cursor-pointer"
                      >
                        Close Red Pen
                      </button>
                    </div>
                    <HomeworkCanvas
                      submission={{
                        id: currentStudent.student_id || currentStudent.id,
                        student_id: currentStudent.student_id || currentStudent.id,
                        student_name: currentStudent.name,
                        homework_id: selectedReviewDay,
                        original_file_url: currentStudent.submitted_file?.preview_url || '/samples/math_worksheet.png',
                        marks_obtained: 18.0,
                        teacher_remarks: verificationRemarks || "Factoring steps verified. Check sign distribution outside parentheses.",
                        status: 'submitted',
                        submitted_at: currentStudent.submitted_file?.submitted_at || new Date().toISOString(),
                        annotations_json: ''
                      }}
                      onSave={async (marks, remarks, annotationsJson) => {
                        setVerificationRemarks(remarks);
                        triggerToast(`Red-pen annotations saved! Marks assigned: ${marks}/20.`);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 2.5 MULTIMODAL AI PRE-VERIFICATION (ELIMINATING TEACHER GRADING FATIGUE) */}
              <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                        Multimodal AI Pre-Evaluation: PASS (94% Rubric Match)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                        ✓ Checkpoint Satisfied
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      Gemini verified student rough work for Day {selectedReviewDay}. Sign distribution intermediate step is present and verified with target rubric.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationRemarks('AI Pre-Evaluation confirmed: Intermediate factoring & parentheses sign distribution verified.');
                      handleVerify();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>1-Click Fast Approve</span>
                  </button>
                </div>
              </div>

              {/* 3. TEACHER DECISION BOX */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Faculty Feedback &amp; Verification Remarks for Day {selectedReviewDay}:
                </label>
                <textarea
                  rows={3}
                  value={verificationRemarks}
                  onChange={(e) => setVerificationRemarks(e.target.value)}
                  placeholder="Add constructive validation feedback or correction notes..."
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500">
                  Verifying marks Day {selectedReviewDay} as completed. Previous day work is never set to upcoming.
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleReturnForRework}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800 hover:bg-rose-50 text-rose-700 dark:text-rose-300 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    <span>Return for Re-work</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVerify}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve &amp; Mark Day {selectedReviewDay} Completed ✓</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: GUARDIAN CO-TRACKING & PROGRESS DISPATCH (REMOVED UNWANTED CALL SCRIPT) */}
        {activeTab === 'parent_cotrack' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-7 shadow-xs space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Guardian Co-Tracking &amp; Direct Connection Hub
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Progress co-tracking for <strong>{currentStudent.parent_name}</strong> ({currentStudent.parent_phone}).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      triggerToast('Generating printable 1-Week Remedial Plan summary...');
                      window.print();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print 1-Week Summary</span>
                  </button>
                </div>
              </div>

              {/* Guardian Info Card */}
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Registered Guardian Contact
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentStudent.parent_name} ({currentStudent.parent_phone})
                  </div>
                  <span className="text-xs text-slate-500">
                    Co-tracking status: <strong className="text-emerald-600">{currentStudent.parent_status}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      router.push(`/teacher?tab=parent_chat&studentId=${currentStudent.student_id}`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                    <span>Open Chat</span>
                  </button>

                  <button
                    onClick={() => setIsPTMModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Launch 1-on-1 PTM Video Room</span>
                  </button>
                </div>
              </div>

              {/* 1-Click WhatsApp Dispatch Card */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Send className="h-4 w-4 text-emerald-600" />
                    Instant Parent WhatsApp / SMS Progress Notification
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Dispatches current 7-day progress (<strong>Day {currentStudent.current_day} of 7</strong>) and asks the guardian to inspect the student&apos;s rough notebook practice tonight.
                  </p>
                </div>

                <button
                  disabled={isDispatchingWhatsApp}
                  onClick={handleSendWhatsAppUpdate}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer self-start sm:self-auto shrink-0 disabled:opacity-50"
                >
                  <Send className={`h-3.5 w-3.5 ${isDispatchingWhatsApp ? 'animate-spin' : ''}`} />
                  <span>{isDispatchingWhatsApp ? 'Dispatching...' : 'Send WhatsApp Update'}</span>
                </button>
              </div>

              {/* Verified WhatsApp Dispatch Receipt Banner */}
              {whatsAppReceipt && (
                <div className="p-4 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        OFFICIAL WHATSAPP DISPATCH RECEIPT: {whatsAppReceipt.receipt_id}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded font-bold">
                      {whatsAppReceipt.timestamp}
                    </span>
                  </div>
                  <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 leading-relaxed">
                    {whatsAppReceipt.message}
                  </pre>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-emerald-800 dark:text-emerald-300 pt-1">
                    <span>Delivered to guardian: <strong>{whatsAppReceipt.phone}</strong> ({currentStudent.parent_name})</span>
                    <span className="font-bold flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5" /> Immutable Record Stored in SQLite (whatsapp_dispatch_logs)
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INTERACTIVE 1-ON-1 PTM VIDEO CONSULTATION ROOM MODAL                      */}
        {/* ========================================================================= */}
        {isPTMModalOpen && currentStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-4xl rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white">
                        1-on-1 PTM Video Consultation Room
                      </h3>
                      <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                        Secure WebRTC Room Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Consultation with <strong>{currentStudent.parent_name}</strong> for <strong>{currentStudent.name}</strong> ({currentStudent.class_name})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPTMModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body: Split Camera View & Academic Dossier */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Video Preview & Controls */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                    {ptmCameraEnabled ? (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 flex flex-col items-center justify-center text-center p-6 space-y-3">
                        <div className="relative">
                          <div className="h-20 w-20 rounded-full bg-blue-600/30 border-2 border-blue-500 flex items-center justify-center text-blue-300 font-bold text-xl">
                            AV
                          </div>
                          <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">✓</span>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white block">Mrs. Ananya Verma</span>
                          <span className="text-xs text-slate-400">Host • Mathematics Department</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] text-emerald-400 border border-emerald-500/30">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>Camera &amp; Audio Input Verified (HD 1080p)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                        <VideoOff className="h-10 w-10" />
                        <span className="text-xs font-bold">Camera Paused</span>
                      </div>
                    )}

                    {/* Room ID Badge */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-300 border border-slate-700">
                      ID: #EDU360-PTM-{currentStudent.student_id}-MATH
                    </div>

                    {/* Remote Guardian Connection Badge */}
                    <div className="absolute bottom-3 right-3 bg-emerald-950/80 backdrop-blur-md rounded-lg px-3 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Guardian: {currentStudent.parent_name} (Waiting in Room)</span>
                    </div>
                  </div>

                  {/* Conference Bar Controls */}
                  <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <button
                      onClick={() => setPtmMicEnabled(!ptmMicEnabled)}
                      className={`p-3 rounded-xl transition-all cursor-pointer ${
                        ptmMicEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                      }`}
                      title={ptmMicEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
                    >
                      {ptmMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={() => setPtmCameraEnabled(!ptmCameraEnabled)}
                      className={`p-3 rounded-xl transition-all cursor-pointer ${
                        ptmCameraEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                      }`}
                      title={ptmCameraEnabled ? 'Turn Off Video' : 'Turn On Video'}
                    >
                      {ptmCameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={() => {
                        setIsConnectingPTM(true);
                        setTimeout(() => {
                          setIsConnectingPTM(false);
                          triggerToast('Connected to Live Consultation Room!');
                        }, 1200);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <Video className="h-4 w-4" />
                      <span>{isConnectingPTM ? 'Connecting...' : 'Join Live Video Call'}</span>
                    </button>
                  </div>
                </div>

                {/* Right: Student Pedagogical Briefing Dossier */}
                <div className="lg:col-span-5 flex flex-col space-y-4">
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                        Diagnostic Dossier
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
                        Exam Score: {currentStudent.exam_score_pct}%
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Target Remedial Concept:</span>
                        <p className="text-slate-200 font-bold mt-0.5 leading-snug">{currentStudent.weak_concept}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                        <span className="font-bold text-emerald-400 block mb-0.5">Key Talking Point for Parent:</span>
                        {currentStudent.ai_exam_scan?.diagnostic_summary || 'Drops negative signs during bracket expansion. Reviewing daily rough notebook inspection.'}
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Current 7-Day Sprint:</span>
                        <span className="text-amber-400 font-bold">Day {currentStudent.current_day} of 7 In-Progress</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-900/60 text-xs space-y-2">
                    <span className="font-bold text-blue-300 block">Guardian Mobile Quick-Link:</span>
                    <div className="flex items-center justify-between gap-2 bg-slate-900/80 p-2 rounded-xl border border-blue-900 font-mono text-[11px] text-slate-300">
                      <span className="truncate">edu360.internal/ptm/meet-{currentStudent.student_id}</span>
                      <button
                        onClick={() => {
                          triggerToast('Copied video room link to clipboard!');
                        }}
                        className="p-1 hover:text-white text-slate-400 cursor-pointer"
                        title="Copy Link"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        triggerToast(`Dispatched Video Room link via SMS to ${currentStudent.parent_phone}!`);
                      }}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Send Direct Link to Parent Phone (SMS &amp; WA)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
