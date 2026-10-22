'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Video,
  Camera,
  Play,
  CalendarDays,
  BookOpen,
  GraduationCap,
  Trophy,
  Calendar,
  UserCheck,
  UserCircle,
  Lock,
  FolderLock,
  Target,
  BarChart,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  AlertCircle,
  Filter,
  TrendingUp,
  Sun,
  Moon,
  Menu,
  Award,
  Phone,
  MapPin,
  Check,
  Radio,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Printer,
  CalendarCheck2,
  Plus,
  Layers,
  ExternalLink,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  ClassRecording,
  StudentPortfolio,
  Homework,
  HomeworkSubmission,
  TaskType,
  TaskStatus,
  AcademicCompliance,
  BacklogEvent,
  OfficialDocument,
  FocusTable,
  User,
  ExamItem,
  ExamSubmissionItem,
  ReportCardItem
} from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/role-guard';
import { useTheme } from '@/lib/theme-context';
import { FocusTableView } from '@/components/focus-table-view';
import { StudentRemedialView } from '@/components/student-remedial-view';
import { Footer } from '@/components/footer';
import { JuniorStudentDashboard } from '@/components/junior/JuniorStudentDashboard';
import { OnlineExamModal } from '@/components/online-exam-modal';
import { downloadStudyNotesFile, downloadMarksMemoFile } from '@/lib/export-utils';

type NavSection = 
  | 'dashboard' 
  | 'live_classes' 
  | 'timetable' 
  | 'homework' 
  | 'focus_table'
  | 'exams' 
  | 'portfolio' 
  | 'calendar' 
  | 'profile' 
  | 'vault';

interface AnnouncementSlide {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  ctaText: string;
  targetNav: NavSection;
  gradient: string;
  actionLabel?: string;
  actionTitle?: string;
}

const announcementSlides: AnnouncementSlide[] = [
  {
    id: 1,
    badge: 'Campus Bulletin',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    title: 'Annual Day in 5 Days — Stage Committees Assigned',
    subtitle: 'Aarav assigned to Western Choir (Lead Tenor) and Stage Tech Coordination committee.',
    actionLabel: 'BULLETIN ACTION',
    actionTitle: 'Western Choir & Rehearsals',
    ctaText: 'View Rehearsal Calendar',
    targetNav: 'calendar',
    gradient: 'from-[#121B35] to-[#0A0F24]'
  },
  {
    id: 2,
    badge: 'STEM & Robotics',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    title: 'Inter-School Science Olympiad 2026 Shortlist',
    subtitle: 'Congratulations Aarav! You have qualified for Phase 2 regional robotics and optics practicals.',
    actionLabel: 'BULLETIN ACTION',
    actionTitle: 'Optics Lab Practice & Kits',
    ctaText: 'View Olympiad Details',
    targetNav: 'portfolio',
    gradient: 'from-[#1E1B4B] to-[#0A0F24]'
  },
  {
    id: 3,
    badge: 'Remedial Target',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    title: 'My Focus Table: Quadratic Equations Intervention',
    subtitle: 'Mrs. Ananya Verma scheduled 4-day targeted revision and practice test series.',
    actionLabel: 'BULLETIN ACTION',
    actionTitle: 'Complete Quadratic Worksheet 4.2',
    ctaText: 'Open Focus Table Plan',
    targetNav: 'focus_table',
    gradient: 'from-[#0F172A] to-[#1E293B]'
  },
  {
    id: 4,
    badge: 'CBSE Examination',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    title: 'CBSE Term 1 Model Examination Schedule',
    subtitle: 'Seating arrangements and admit cards generated for Hall B, Desk #A-14.',
    actionLabel: 'BULLETIN ACTION',
    actionTitle: 'Download Exam Admit Card PDF',
    ctaText: 'View Exam Schedule',
    targetNav: 'exams',
    gradient: 'from-[#141E33] to-[#0B132B]'
  }
];


function StandardStudentDashboard({ onSwitchToJunior }: { onSwitchToJunior?: () => void }) {
  const { user } = useAuth();
  // Navigation & Layout State
  const [activeNav, setActiveNav] = useState<NavSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Application-Wide Theme
  const { theme, toggleTheme } = useTheme();
  const sidebarTheme = theme;

  // Attendance & Calendar State
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(14);
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<'October 2026' | 'November 2026' | 'December 2026'>('October 2026');
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'attendance' | 'holidays' | 'events'>('all');

  // Online Exam Modal State
  const [isOnlineExamOpen, setIsOnlineExamOpen] = useState(false);
  const [onlineExamSubject, setOnlineExamSubject] = useState('Mathematics');
  const [onlineExamTopic, setOnlineExamTopic] = useState('Quadratic Equations & Polynomials');
  const [onlineExamDuration, setOnlineExamDuration] = useState(20);

  // Announcement Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  // Live Class Simulation State
  const [isLiveClassModalOpen, setIsLiveClassModalOpen] = useState(false);
  const [hasJoinedLive, setHasJoinedLive] = useState(false);
  const [attendanceTimestamp, setAttendanceTimestamp] = useState<string | null>(null);

  // Homework & Annotations State
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [studentHomeworkList, setStudentHomeworkList] = useState<Homework[]>([]);
  const [homeworkWorkstream, setHomeworkWorkstream] = useState<'daily' | 'assignments'>('daily');
  const [selectedDateKey, setSelectedDateKey] = useState<string>('2026-10-17'); // Saturday (Today)
  const [showAllDates, setShowAllDates] = useState(false);
  const [homeworkFilter, setHomeworkFilter] = useState<'all' | 'pending' | 'submitted_graded' | 'backlog'>('all');
  const [homeworkSubjectFilter, setHomeworkSubjectFilter] = useState('all');
  const [homeworkViewMode, setHomeworkViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [selectedFileForUpload, setSelectedFileForUpload] = useState<File | null>(null);
  const [isUploadingHomework, setIsUploadingHomework] = useState(false);
  const [homeworkSubmittedSuccess, setHomeworkSubmittedSuccess] = useState(false);
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState<Homework | null>(null);
  const [viewingTaskDetails, setViewingTaskDetails] = useState<Homework | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isScanningBacklogs, setIsScanningBacklogs] = useState(false);
  const [complianceOverview, setComplianceOverview] = useState<AcademicCompliance | null>(null);

  // New Task Form Inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Mathematics');
  const [newTaskType, setNewTaskType] = useState<TaskType>('DAILY_HOMEWORK');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-10-18');
  const [newTaskDueTime, setNewTaskDueTime] = useState('17:00');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskMarks, setNewTaskMarks] = useState(20);
  const [newTaskWeightage, setNewTaskWeightage] = useState('Daily Practice (5 pts)');
  const [newTaskResourceUrl, setNewTaskResourceUrl] = useState('');
  const [isSubmittingNewTask, setIsSubmittingNewTask] = useState(false);

  // Class Recordings State
  const [recordings, setRecordings] = useState<ClassRecording[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [activeVideoModal, setActiveVideoModal] = useState<ClassRecording | null>(null);

  // Portfolio State
  const [portfolio, setPortfolio] = useState<StudentPortfolio[]>([]);
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<'all' | 'participation' | 'achievement'>('all');
  const [portfolioSearchQuery, setPortfolioSearchQuery] = useState('');
  const [isUploadAwardModalOpen, setIsUploadAwardModalOpen] = useState(false);
  const [selectedCertificatePreview, setSelectedCertificatePreview] = useState<string | null>(null);
  const [selectedCertificateFileName, setSelectedCertificateFileName] = useState<string | null>(null);

  // Upload Form Inputs
  const [newAwardTitle, setNewAwardTitle] = useState('');
  const [newAwardEvent, setNewAwardEvent] = useState('');
  const [newAwardCategory, setNewAwardCategory] = useState<'achievement' | 'participation'>('achievement');
  const [newAwardDesc, setNewAwardDesc] = useState('');
  const certificateFileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedCertificateFile, setSelectedCertificateFile] = useState<File | null>(null);
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState<string | null>(null);
  const [isSubmittingAward, setIsSubmittingAward] = useState(false);

  // Documents & Toast State
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [studentFocusViewMode, setStudentFocusViewMode] = useState<'sprint' | 'all_subjects'>('sprint');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Descriptive Terminal Exams Upload State
  const [descriptiveExams, setDescriptiveExams] = useState<ExamItem[]>([]);
  const [activeUploadExam, setActiveUploadExam] = useState<ExamItem | null>(null);
  const [examAnswerFileName, setExamAnswerFileName] = useState<string>('Aarav_Math_Term1_Paper.pdf');
  const [examAnswerFileUrl, setExamAnswerFileUrl] = useState<string>('/samples/math_exam_sample.svg');
  const [examStudentNotes, setExamStudentNotes] = useState<string>('');
  const [isSubmittingExamPaper, setIsSubmittingExamPaper] = useState<boolean>(false);
  const [studentReportCard, setStudentReportCard] = useState<ReportCardItem | null>(null);
  const [studentSubmittedExams, setStudentSubmittedExams] = useState<Record<number, { fileName: string; submittedAt: string; marks?: number; pct?: number }>>({
    1: { fileName: "Aarav_Sharma_Math_Term1_Paper.pdf", submittedAt: "14 Oct 2026, 02:30 PM", marks: 52, pct: 52 }
  });

  // Admit Card (Hall Ticket) Modal State
  const [showAdmitCardModal, setShowAdmitCardModal] = useState(false);
  const [admitCardData, setAdmitCardData] = useState<any>(null);
  const [loadingAdmitCard, setLoadingAdmitCard] = useState(false);

  const handleOpenAdmitCard = async () => {
    setLoadingAdmitCard(true);
    setShowAdmitCardModal(true);
    try {
      const studentId = user?.id || 1;
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

  const loadDescriptiveExams = async () => {
    try {
      const res = await api.listExams({ subject: 'Mathematics' });
      if (res && res.success && res.exams) {
        setDescriptiveExams(res.exams);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadExamPaper = async () => {
    if (!activeUploadExam) return;
    setIsSubmittingExamPaper(true);
    try {
      const res = await api.submitExamPaper(activeUploadExam.id, {
        student_id: user?.id || 1,
        paper_file_url: examAnswerFileUrl || '/samples/math_exam_sample.svg',
        paper_file_name: examAnswerFileName || 'Handwritten_Descriptive_Answer_Paper.pdf',
        student_notes: examStudentNotes || 'Attached all solved intermediate calculation steps.'
      });
      if (res && res.success) {
        setStudentSubmittedExams(prev => ({
          ...prev,
          [activeUploadExam.id]: {
            fileName: examAnswerFileName,
            submittedAt: "Just now"
          }
        }));
        triggerToast(`🎉 ${res.message}! Placed in teacher's grading inbox.`);
        setActiveUploadExam(null);
      }
    } catch {
      triggerToast('Answer sheet submitted successfully to Examination Cell.');
      setActiveUploadExam(null);
    } finally {
      setIsSubmittingExamPaper(false);
    }
  };

  // Auto-dismissing toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Submission & Task Handlers
  const handleSubmitTaskWorksheet = async (task: Homework, isLate: boolean = false) => {
    setIsUploadingHomework(true);
    try {
      const fileUrl = selectedFileForUpload ? `/uploads/${selectedFileForUpload.name}` : '/samples/math_worksheet.png';
      const updatedSub = await api.submitHomework(task.id, 1, fileUrl);
      setSubmission(updatedSub);
      setHomeworkSubmittedSuccess(true);
      setStudentHomeworkList(prev => prev.map(item => item.id === task.id ? {
        ...item,
        status: 'SUBMITTED',
        late_submission: isLate || Boolean(updatedSub.late_submission)
      } : item));
      
      const comp = await api.getAcademicCompliance(1);
      setComplianceOverview(comp);
      
      triggerToast(isLate 
        ? `Late submission recorded for ${task.title}. Flagged in backlog audit trail for parent review.`
        : `Successfully submitted ${task.title}!`
      );
      setSelectedTaskForSubmit(null);
      setSelectedFileForUpload(null);
    } catch (err) {
      console.error('Submission error:', err);
      triggerToast('Error processing submission.');
    } finally {
      setIsUploadingHomework(false);
    }
  };

  const handleCreateNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      triggerToast('Please provide a task title');
      return;
    }
    setIsSubmittingNewTask(true);
    try {
      const created = await api.createHomework({
        title: newTaskTitle,
        subject: newTaskSubject,
        class_name: 'Class 8-B',
        description: newTaskDesc || 'Complete assigned practice exercise.',
        task_type: newTaskType,
        due_date: newTaskDueDate,
        due_time: newTaskDueTime,
        teacher_id: 2,
        teacher_name: 'Mrs. Ananya Verma',
        max_marks: Number(newTaskMarks) || 20,
        resource_url: newTaskResourceUrl || undefined,
        weightage: newTaskWeightage,
        progress_pct: newTaskType === 'ASSIGNMENT' ? 10 : 0
      });
      setStudentHomeworkList(prev => [created, ...prev]);
      setIsCreateTaskModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskResourceUrl('');
      triggerToast(`Created new ${newTaskType === 'ASSIGNMENT' ? 'Assignment' : 'Daily Homework'}: ${created.title}`);
    } catch (err) {
      console.error('Task creation failed', err);
      triggerToast('Failed to create task');
    } finally {
      setIsSubmittingNewTask(false);
    }
  };

  const handleRunBacklogScan = async () => {
    setIsScanningBacklogs(true);
    try {
      const scanRes = await api.triggerBacklogCheck();
      const [hwRes, compRes] = await Promise.all([
        api.getStudentHomework(),
        api.getAcademicCompliance(1)
      ]);
      setStudentHomeworkList(hwRes);
      setComplianceOverview(compRes);
      triggerToast(`Backlog Engine Evaluated: ${(scanRes as any)?.total_backlogs || 0} overdue tasks synchronized with Focus Table.`);
    } catch (err) {
      console.error('Backlog check failed', err);
      triggerToast('Backlog evaluation complete');
    } finally {
      setIsScanningBacklogs(false);
    }
  };

  // Load Data
  useEffect(() => {
    async function loadPortalData() {
      try {
        const [recRes, portRes, subRes, docsRes, hwRes, compRes, rcRes] = await Promise.all([
          api.getStudentRecordings(),
          api.getPortfolio(1),
          api.getSubmission(1),
          api.getStudentDocuments(1),
          api.getStudentHomework(),
          api.getAcademicCompliance(1),
          api.getReportCards({ student_id: 1 })
        ]);
        setRecordings(recRes);
        setPortfolio(portRes);
        setSubmission(subRes);
        setDocuments(docsRes);
        setStudentHomeworkList(hwRes);
        setComplianceOverview(compRes);
        if (rcRes && rcRes.length > 0) {
          setStudentReportCard(rcRes[0]);
        }
      } catch (err) {
        console.error('Error fetching student data', err);
      }
    }
    loadPortalData();
  }, []);

  // Continuous Carousel Auto-Advancement (pauses on hover)
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % announcementSlides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isCarouselPaused]);

  // Listen for module navigation events from Navbar notifications or dashboard links
  useEffect(() => {
    const handleNavEvent = (e: any) => {
      if (e.detail) {
        setActiveNav(e.detail as NavSection);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('edu360-navigate', handleNavEvent as EventListener);
    return () => {
      window.removeEventListener('edu360-navigate', handleNavEvent as EventListener);
    };
  }, []);

  // Handlers
  const handleJoinLiveClass = () => {
    setIsLiveClassModalOpen(true);
    if (!hasJoinedLive) {
      setHasJoinedLive(true);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAttendanceTimestamp(timeStr);
      triggerToast('🟢 On Time Auto-Attendance Confirmed! Marked Present in SIS.');
    }
  };

  const handleHomeworkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileForUpload(e.target.files[0]);
    }
  };

  const handleHomeworkSubmit = () => {
    if (!selectedFileForUpload) return;
    setIsUploadingHomework(true);
    setTimeout(() => {
      setIsUploadingHomework(false);
      setHomeworkSubmittedSuccess(true);
      triggerToast('Worksheet PDF submitted successfully! Awaiting teacher grading.');
    }, 1200);
  };

  const handleDownloadNotes = (subject: string, chapter: string) => {
    downloadStudyNotesFile(subject, chapter);
    triggerToast(`Downloaded study notes: ${subject} - ${chapter}`);
  };

  const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCertificateFile(file);
      setSelectedCertificateFileName(file.name);
      const url = URL.createObjectURL(file);
      setCertificatePreviewUrl(url);
      triggerToast(`Certificate attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleCreateAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAwardTitle.trim()) return;

    setIsSubmittingAward(true);
    try {
      const res = await api.uploadPortfolioItem({
        student_id: user?.student_id || 1,
        category: newAwardCategory,
        title: newAwardTitle.trim(),
        event_name: newAwardEvent.trim(),
        date: 'Oct 2026',
        proof_url: certificatePreviewUrl || '/samples/certificate_preview.png',
        description: newAwardDesc.trim()
      });

      setPortfolio((prev) => [res, ...prev]);
      setIsUploadAwardModalOpen(false);
      setNewAwardTitle('');
      setNewAwardEvent('');
      setNewAwardDesc('');
      setSelectedCertificateFile(null);
      setCertificatePreviewUrl(null);
      triggerToast('✓ Certificate uploaded and registered! Awaiting Academic Coordinator verification stamp.');
    } catch (err) {
      console.error('Error submitting certificate', err);
      triggerToast('Failed to upload certificate. Please try again.');
    } finally {
      setIsSubmittingAward(false);
    }
  };

  const handleLaunchExam = (subject: string = 'Mathematics', topic: string = 'Quadratic Equations Quiz', duration: number = 20) => {
    setOnlineExamSubject(subject);
    setOnlineExamTopic(topic);
    setOnlineExamDuration(duration);
    setIsOnlineExamOpen(true);
  };

  // Filtered recordings
  const filteredRecordings = selectedSubjectFilter === 'All'
    ? recordings
    : recordings.filter((r) => r.subject.toLowerCase() === selectedSubjectFilter.toLowerCase());

  // Filtered Portfolio items
  const filteredPortfolio = portfolio.filter((item) => {
    const matchesCategory = 
      portfolioCategoryFilter === 'all' || item.category === portfolioCategoryFilter;
    const matchesSearch = 
      item.title.toLowerCase().includes(portfolioSearchQuery.toLowerCase()) ||
      item.event_name.toLowerCase().includes(portfolioSearchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(portfolioSearchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const participationsList = filteredPortfolio.filter((p) => p.category === 'participation');
  const achievementsList = filteredPortfolio.filter((a) => a.category === 'achievement');

  // 4-Day Revision Plan for Mathematics: Quadratic Equations
  const studentQuadraticFocusTable: FocusTable = {
    id: 1,
    student_id: 14,
    student_name: 'Aarav Sharma',
    subject: 'Mathematics',
    weak_concept: 'Quadratic Equations',
    current_score_pct: 42,
    target_score_pct: 85,
    teacher_action: 'Reinforce factoring techniques, completing the square, and quadratic discriminant application. Assigned by Mrs. Sunitha Rao.',
    parent_check_completed: false, // Awaiting explicit guardian review & approval
    status: 'pending_approval',
    updated_at: '2026-10-12',
    revision_plan_json: JSON.stringify({
      days: [
        {
          day: 'Day 1',
          focus: 'Standard Form & Factorization',
          exercise: 'Solve 10 factoring problems (Set 4-A)',
          parent_checklist: 'Review sign convention rules',
          status: 'Completed'
        },
        {
          day: 'Day 2',
          focus: 'Completing the Square Method',
          exercise: 'Practice 8 step-by-step expansions',
          parent_checklist: 'Verify coefficient of x^2 is 1',
          status: 'In Progress'
        },
        {
          day: 'Day 3',
          focus: 'Quadratic Formula & Discriminant',
          exercise: 'Evaluate real vs imaginary roots (12 MCQs)',
          parent_checklist: 'Check b^2 - 4ac computation',
          status: 'Pending'
        },
        {
          day: 'Day 4',
          focus: 'Word Problems & Real-World Modeling',
          exercise: 'Solve 6 kinematic trajectory questions',
          parent_checklist: 'Sign off completion on focus card',
          status: 'Pending'
        }
      ]
    })
  };

  // Circular Meter calculations for Attendance (94.2%)
  const attendanceRate = 94.2;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attendanceRate / 100) * circumference;

  return (
    <RoleGuard allowedRole="student">
      <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#070B14] text-[#0F172A] dark:text-slate-100 font-sans antialiased transition-colors duration-150">
        
        {/* Mobile Drawer Backdrop */}
        {mobileDrawerOpen && (
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
            aria-hidden="true"
          />
        )}

        {/* ========================================================= */}
        {/* 1. LEFT SIDEBAR NAVIGATION (240px Wide / 72px Collapsed) */}
        {/* ========================================================= */}
        <aside
          className={`fixed md:sticky top-0 md:top-16 inset-y-0 md:inset-y-auto left-0 z-40 md:z-20 h-screen md:h-[calc(100vh-4rem)] md:self-start flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none ${
            sidebarCollapsed ? 'md:w-[72px] w-[256px]' : 'w-[256px]'
          } ${
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } bg-white text-slate-800 border-r border-slate-200/90 dark:bg-[#0B101B] dark:text-slate-200 dark:border-r dark:border-slate-800/90`}
        >
          {/* Campus Context & Class Badge (No redundant EDU360 logo) */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/90 dark:border-slate-800/90">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shrink-0 font-bold text-xs">
                  8A
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Oakridge International
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Student Workspace • Class 8-A
                  </span>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 font-bold text-xs">
                8A
              </div>
            )}

            {/* Desktop Collapse Trigger */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              title="Close Navigation Menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Collapse Expand Toggle for Compact Mode */}
          {sidebarCollapsed && (
            <div className="pt-2 hidden md:flex justify-center">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                title="Expand Sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Vertical Sidebar Navigation Groups */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
            
            {/* Group 1: DAILY LEARNING */}
            <div>
              {!sidebarCollapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                  DAILY LEARNING
                </span>
              )}
              <div className="space-y-1">
                {/* Dashboard */}
                <button
                  onClick={() => { setActiveNav('dashboard'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'dashboard'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title="Dashboard"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </button>

                {/* Live Classes & Recordings */}
                <button
                  onClick={() => { setActiveNav('live_classes'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'live_classes'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title="Live Classes & Recordings"
                >
                  <div className="flex items-center gap-2.5">
                    <Camera className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>Live &amp; Recordings</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      1 Live
                    </span>
                  )}
                </button>

                {/* Timetable & Schedule */}
                <button
                  onClick={() => { setActiveNav('timetable'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'timetable'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title="Timetable & Schedule"
                >
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>Timetable &amp; Schedule</span>}
                </button>
              </div>
            </div>

            {/* Group 2: ACADEMICS & WORK */}
            <div>
              {!sidebarCollapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                  ACADEMICS &amp; WORK
                </span>
              )}
              <div className="space-y-1">
                {/* Homework & Assignments */}
                <button
                  onClick={() => { setActiveNav('homework'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'homework'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title="Homework & Assignments"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>Homework &amp; Tasks</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                      2 Pending
                    </span>
                  )}
                </button>

                {/* My Focus Table */}
                <button
                  onClick={() => { setActiveNav('focus_table'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'focus_table'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title="My Focus Table (Personalized Weak-Concepts Study Plan)"
                >
                  <div className="flex items-center gap-2.5">
                    <Target className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    {!sidebarCollapsed && <span>My Focus Table</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                      2 Weak Areas
                    </span>
                  )}
                </button>

                {/* Exams & Results */}
                <button
                  onClick={() => { setActiveNav('exams'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'exams'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title="Exams & Results"
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>Exams &amp; Results</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                      88.8%
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Group 3: CAMPUS LIFE */}
            <div>
              {!sidebarCollapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                  CAMPUS LIFE
                </span>
              )}
              <div className="space-y-1">
                {/* Participations & Achievements */}
                <button
                  onClick={() => { setActiveNav('portfolio'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'portfolio'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title="Participations & Achievements"
                >
                  <div className="flex items-center gap-2.5">
                    <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                    {!sidebarCollapsed && <span>Dual Portfolio</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                      {portfolio.length} Items
                    </span>
                  )}
                </button>

                {/* Holidays & Calendar */}
                <button
                  onClick={() => { setActiveNav('calendar'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'calendar'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title="Holidays & Calendar"
                >
                  <Sun className="h-4 w-4 shrink-0 text-amber-500" />
                  {!sidebarCollapsed && <span>Holidays &amp; Calendar</span>}
                </button>
              </div>
            </div>

            {/* Group 4: RECORDS & VAULT */}
            <div>
              {!sidebarCollapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                  RECORDS &amp; VAULT
                </span>
              )}
              <div className="space-y-1">
                {/* SIS Profile & Attendance */}
                <button
                  onClick={() => { setActiveNav('profile'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'profile'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title="SIS Profile & Attendance"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCircle className="h-4 w-4 shrink-0 text-blue-500" />
                    {!sidebarCollapsed && <span>SIS Profile</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">94.2%</span>
                  )}
                </button>

                {/* Official Documents */}
                <button
                  onClick={() => { setActiveNav('vault'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'vault'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title="Official Documents (View-Only Vault)"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderLock className="h-4 w-4 shrink-0 text-slate-400" />
                    {!sidebarCollapsed && <span>Official Documents</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="flex items-center gap-0.5 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[8px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <Lock className="h-2.5 w-2.5" />
                      View Only
                    </span>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Academic Session Status (CBSE 2026-27 + Junior Explorer Switcher) */}
          <div className="p-3 border-t border-slate-200/90 dark:border-slate-800/90 space-y-2">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Academic Term 2 · CBSE 2026-27
                  </span>
                </div>

                {onSwitchToJunior && (
                  <button
                    onClick={onSwitchToJunior}
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-pink-50 dark:from-amber-950/40 dark:to-pink-950/40 hover:from-amber-100 hover:to-pink-100 dark:hover:from-amber-900/60 dark:hover:to-pink-900/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] font-bold transition-all cursor-pointer"
                    title="Switch to Junior K-5 Explorer View"
                  >
                    <span className="text-xs">🦊</span>
                    <span>Junior K-5 View</span>
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="mx-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Academic Term 2 · CBSE 2026-27" />
                {onSwitchToJunior && (
                  <button
                    onClick={onSwitchToJunior}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                    title="Switch to Junior K-5 Explorer View"
                  >
                    🦊
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. MAIN CANVAS CONTENT AREA */}
        {/* ========================================================= */}
        <main className="flex-1 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">

          {/* Mobile Drawer Trigger (md:hidden) */}
          <div className="flex md:hidden items-center justify-between pb-1">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B101B] text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs"
            >
              <Menu className="h-4 w-4" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-bold text-slate-500">Student Portal</span>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="fixed top-20 right-8 z-50 flex items-center gap-3 rounded-2xl bg-[#0F172A] text-white px-4 py-3 shadow-2xl border border-blue-500/40 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
              <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* ===================================================== */}
          {/* SCREEN 2: STUDENT HOME DASHBOARD (MAIN VIEWPORT)       */}
          {/* ===================================================== */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              
              {/* ===================================================== */}
              {/* 1. STUDENT COMMAND CENTER HERO HEADER                 */}
              {/* ===================================================== */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-1 text-xs font-bold">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Present Today ✓ • On Time Active</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 px-3 py-1 text-xs font-bold">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        <span>Period 3 Live • Class 8-A Mathematics (10:30 – 11:15 AM)</span>
                      </span>
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Welcome, Aarav Sharma!
                      </h1>
                      <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Secondary Department (Class 8-A) • Academic Mission: Period 3 Mathematics Live in Room 204 • 2 homework tasks due before 5:00 PM • Day 2 Remedial Sprint active.
                      </p>
                    </div>

                    {/* Operational Tags */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                        <span>Class: <strong className="text-slate-700 dark:text-slate-200">8-A (Roll #01)</strong></span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Homeroom: <strong className="text-slate-700 dark:text-slate-200">Mrs. Ananya Verma</strong></span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        <span>Role: <strong className="text-slate-700 dark:text-slate-200">Phoenix House Captain</strong></span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Primary & Secondary Action Group */}
                  <div className="flex flex-wrap lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0">
                    <button
                      onClick={handleJoinLiveClass}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-all duration-200 active:scale-98 border border-rose-400/30 cursor-pointer"
                    >
                      <Video className="h-4 w-4 animate-pulse" />
                      <span>{hasJoinedLive ? 'Return to Live Classroom Stream' : '▶ Join Live Class Now'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveNav('homework')}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-amber-500" />
                        <span>2 Homeworks Due</span>
                      </button>

                      <button
                        onClick={() => setActiveNav('focus_table')}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Target className="h-3.5 w-3.5 text-purple-500" />
                        <span>Focus Sprint</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================================================== */}
              {/* 2. 4 EXECUTIVE STUDENT METRIC CARDS                   */}
              {/* ===================================================== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Live Classroom & Schedule */}
                <div
                  onClick={() => setActiveNav('live_classes')}
                  className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Live Classroom &amp; Timetable
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                        <Video className="h-5 w-5 animate-pulse" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                          Period 3 Live
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60">
                          Room 204
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Mathematics: Quadratic Equations • 28 joined
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Live Stream</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* 2. Homework & Due Assignments */}
                <div
                  onClick={() => setActiveNav('homework')}
                  className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Homework &amp; Assignments
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                        <FileText className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                          2 Tasks Due
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                          By 5:00 PM
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        English Analysis &amp; Chemistry Worksheet 4.2
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '71%' }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                    <span>Submit Tonight&apos;s Work</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* 3. 1-Week Remedial Focus Sprint */}
                <div
                  onClick={() => setActiveNav('focus_table')}
                  className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        1-Week Remedial Sprint
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                          Day 2 of 7
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
                          Mathematics
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Quadratic Factoring • 42% Mastery (Goal &gt;70%)
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect Focus Sprint</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* 4. Academic Standing & Attendance */}
                <div
                  onClick={() => setActiveNav('calendar')}
                  className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Attendance &amp; CBSE Safe
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                          94.2% Safe
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                          Rank #4 · ↑ 2.1%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        146/155 Days • Checked In: 08:02 AM Today
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                    <span>View Attendance Ledger</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>

              </div>

              {/* ===================================================== */}
              {/* 3. TODAY'S SCHEDULE PULSE & FOCUS SPRINT SPOTLIGHT    */}
              {/* ===================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left 7 Cols: Today's Class Schedule Pulse */}
                <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                        Today's Agenda
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                        <span>Class 8-A Timetable • Wednesday (6 Periods)</span>
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveNav('timetable')}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group cursor-pointer"
                    >
                      <span>Full Schedule</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>

                  {/* List of 6 Periods */}
                  <div className="space-y-2.5">
                    {/* Period 1 */}
                    <div
                      onClick={() => setActiveNav('timetable')}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="h-9 w-9 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                          P1
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Physics
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            08:30 - 09:15 • Dr. K. Raman • <span className="text-blue-600 dark:text-blue-400 font-semibold">Lab 2</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                          Completed ✓
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Period 2 */}
                    <div
                      onClick={() => setActiveNav('timetable')}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="h-9 w-9 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                          P2
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Chemistry
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            09:15 - 10:00 • Mrs. S. Sen • <span className="text-blue-600 dark:text-blue-400 font-semibold">Room 204</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                          Completed ✓
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Period 3 (CURRENT / LIVE SESSION) */}
                    <div className="p-3.5 rounded-xl border-2 border-rose-500/80 bg-rose-50/50 dark:bg-rose-950/30 dark:border-rose-500/70 shadow-sm transition-all space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="h-9 w-9 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30">
                            P3
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                Mathematics: Quadratic Equations
                              </h4>
                              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                              10:30 - 11:15 AM • Mrs. Ananya Verma • <span className="text-rose-600 dark:text-rose-400 font-semibold">Room 204 &amp; Stream</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={handleJoinLiveClass}
                            className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-black shadow-md shadow-rose-600/30 transition-transform active:scale-95 cursor-pointer"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span>Join Stream</span>
                          </button>
                        </div>
                      </div>

                      {/* Lesson Notes & Classmate telemetry */}
                      <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/60 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleDownloadNotes('Mathematics', 'Quadratic Equations')}
                          className="text-rose-700 dark:text-rose-300 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download Chapter Notes PDF</span>
                        </button>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          28 Classmates connected
                        </span>
                      </div>
                    </div>

                    {/* Period 4 */}
                    <div
                      onClick={() => setActiveNav('timetable')}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="h-9 w-9 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                          P4
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Computer Science
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            11:15 - 12:00 • Mr. V. Nair • <span className="text-blue-600 dark:text-blue-400 font-semibold">Lab 1</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 text-[10px] font-semibold">
                          Upcoming
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Period 5 */}
                    <div
                      onClick={() => setActiveNav('timetable')}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="h-9 w-9 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                          P5
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Social Science
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            01:00 - 01:45 • Ms. P. Roy • <span className="text-blue-600 dark:text-blue-400 font-semibold">Room 204</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 text-[10px] font-semibold">
                          Upcoming
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Period 6 */}
                    <div
                      onClick={() => setActiveNav('timetable')}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="h-9 w-9 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                          P6
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Western Choir Rehearsal
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            01:45 - 02:30 • Music Faculty • <span className="text-blue-600 dark:text-blue-400 font-semibold">Auditorium</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 text-[10px] font-semibold">
                          Upcoming
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: Active 1-Week Remedial Focus & Campus Bulletin */}
                <div className="lg:col-span-5 space-y-5">
                  
                  {/* ACTIVE 1-WEEK REMEDIAL FOCUS CARD */}
                  <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-white dark:bg-[#0F172A] p-5 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                          <Target className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            My Remedial Sprint
                          </h4>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                            Mathematics • Mrs. Ananya Verma
                          </span>
                        </div>
                      </div>

                      <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 text-[10px] font-black uppercase">
                        Day 2 Active
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 space-y-1.5">
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                          Assigned Target Concept
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          Quadratic Equations: Factorization by Splitting the Middle Term
                        </h5>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          Goal: Score &gt;70% on Friday's speed re-test to exit remediation.
                        </p>
                      </div>

                      {/* Day 2 Practice Problem */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700 dark:text-slate-200">Today's Assigned Task:</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">Pending Review ⏳</span>
                        </div>
                        <p className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          Solve: x² - 5x + 6 = 0 using step-by-step middle-term splitting.
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block pt-0.5">
                          Rough paper uploaded • Teacher rubric checkpoint: Monitor negative sign rule.
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveNav('focus_table')}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span>Open 1-Week Remedial Focus Table</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* CAMPUS BULLETIN CAROUSEL */}
                  <div
                    onMouseEnter={() => setIsCarouselPaused(true)}
                    onMouseLeave={() => setIsCarouselPaused(false)}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#111C38] to-[#070D1E] border border-blue-900/50 text-white p-4.5 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 px-2.5 py-0.5 text-[10px] font-bold">
                        <Sparkles className="h-3 w-3 text-purple-400" />
                        Campus Bulletin
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">
                          {currentSlideIndex + 1}/{announcementSlides.length}
                        </span>
                        <button
                          onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + announcementSlides.length) % announcementSlides.length)}
                          className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % announcementSlides.length)}
                          className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="min-h-[76px]">
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {announcementSlides[currentSlideIndex].title}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                        {announcementSlides[currentSlideIndex].subtitle}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {announcementSlides.map((s, idx) => (
                          <button
                            key={s.id}
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`h-1 rounded-full transition-all cursor-pointer ${
                              idx === currentSlideIndex ? 'w-4 bg-blue-500' : 'w-1 bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveNav(announcementSlides[currentSlideIndex].targetNav)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 hover:text-white cursor-pointer"
                      >
                        <span>{announcementSlides[currentSlideIndex].ctaText}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ===================================================== */}
          {/* VIEW: HOMEWORK & SUBMISSIONS (SCALABLE MULTI-DAY WORKSPACE) */}
          {/* ===================================================== */}
          {activeNav === 'homework' && (() => {
            const DEFAULT_FALLBACK_TASKS: Homework[] = [
              {
                id: 1,
                title: 'Quadratic Equations: Factorization by Splitting the Middle Term',
                subject: 'Mathematics',
                class_name: 'Class 8-A',
                description: 'Complete Textbook Exercises 4.2 (Questions 1 to 10). Write out solutions with clear factorization steps and drop below.',
                task_type: 'DAILY_HOMEWORK',
                assigned_date: '2026-10-12',
                due_date: '2026-10-15',
                due_time: '17:00',
                status: 'BACKLOG',
                max_marks: 20,
                weightage: 'Daily Practice (5 pts)',
                teacher_name: 'Mrs. Ananya Verma',
                teacher_id: 2
              },
              {
                id: 2,
                title: "The Merchant of Venice: Portia's Mercy Speech Critical Analysis",
                subject: 'English',
                class_name: 'Class 8-A',
                description: "Write a 300-word critical evaluation of Act IV Scene 1. Contrast Portia's argument on divine mercy against Shylock's legal bond.",
                task_type: 'DAILY_HOMEWORK',
                assigned_date: '2026-10-14',
                due_date: '2026-10-18',
                due_time: '17:00',
                status: 'PENDING',
                max_marks: 15,
                weightage: 'Literature Journal (10 pts)',
                teacher_name: 'Mrs. Sunitha Rao',
                teacher_id: 2
              },
              {
                id: 3,
                title: 'Chemical Reactions & Equations Balancing Worksheet',
                subject: 'Chemistry',
                class_name: 'Class 8-A',
                description: 'Complete balancing for 25 redox reactions, decomposition equations, and displacement reactions with stoichiometric coefficient validation.',
                task_type: 'DAILY_HOMEWORK',
                assigned_date: '2026-10-16',
                due_date: '2026-10-17',
                due_time: '17:00',
                status: 'PENDING',
                max_marks: 20,
                weightage: 'Lab Homework (10 pts)',
                teacher_name: 'Mrs. S. Sen',
                teacher_id: 2
              },
              {
                id: 4,
                title: 'Fundamental Rights & Constitutional Framework Case Analysis',
                subject: 'Social Science',
                class_name: 'Class 8-A',
                description: 'Comparative study of Right to Equality (Articles 14-18) vs Right to Freedom (Articles 19-22) with recent constitutional case studies.',
                task_type: 'DAILY_HOMEWORK',
                assigned_date: '2026-10-09',
                due_date: '2026-10-13',
                due_time: '16:00',
                status: 'SUBMITTED',
                max_marks: 20,
                weightage: 'Civics Portfolio (15 pts)',
                teacher_name: 'Mrs. Kalyani Murthy',
                teacher_id: 2
              },
              {
                id: 5,
                title: "Force & Laws of Motion: Newton's Third Law Lab Sheet",
                subject: 'Physics',
                class_name: 'Class 8-A',
                description: 'Experimental verification of action-reaction pairs using dual spring balances. Free-body diagram calculations and error margins.',
                task_type: 'DAILY_HOMEWORK',
                assigned_date: '2026-10-05',
                due_date: '2026-10-10',
                due_time: '17:00',
                status: 'GRADED',
                max_marks: 20,
                weightage: 'Practical Physics (20 pts)',
                teacher_name: 'Dr. K. Raman',
                teacher_id: 2
              },
              {
                id: 6,
                title: 'Cell Division: Mitosis & Meiosis Stages Comparison Chart',
                subject: 'Biology',
                class_name: 'Class 8-A',
                description: 'Hand-drawn structural diagrams of chromosomes during Metaphase and Anaphase with spindle fiber attachments and centriole positions.',
                task_type: 'DAILY_HOMEWORK',
                assigned_date: '2026-10-11',
                due_date: '2026-10-16',
                due_time: '17:00',
                status: 'SUBMITTED',
                max_marks: 20,
                weightage: 'Microscopy Lab (10 pts)',
                teacher_name: 'Dr. Shalini Gupta',
                teacher_id: 2
              },
              {
                id: 7,
                title: 'Python AI Chatbot & Algorithmic Search Capstone',
                subject: 'Computer Science',
                class_name: 'Class 8-A',
                description: 'Develop an intelligent command-line and web conversational assistant with A* search pathfinding and decision trees for problem-solving.',
                task_type: 'ASSIGNMENT',
                assigned_date: '2026-10-01',
                due_date: '2026-10-25',
                due_time: '23:59',
                status: 'PENDING',
                max_marks: 50,
                weightage: 'Term Project (25%)',
                progress_pct: 65,
                resource_url: '/samples/cs_project_rubric.pdf',
                teacher_name: 'Mr. Rajesh Nambiar',
                teacher_id: 2
              },
              {
                id: 8,
                title: 'Green Energy & Solar Cell Working Prototype',
                subject: 'Science',
                class_name: 'Class 8-A',
                description: 'Build a working photovoltaic demonstrator model measuring current-voltage characteristics across varying angles of incidence.',
                task_type: 'ASSIGNMENT',
                assigned_date: '2026-10-05',
                due_date: '2026-11-05',
                due_time: '17:00',
                status: 'PENDING',
                max_marks: 50,
                weightage: 'Science Exhibition (30%)',
                progress_pct: 40,
                resource_url: '/samples/solar_project_guide.pdf',
                teacher_name: 'Dr. K. Raman',
                teacher_id: 2
              },
              {
                id: 9,
                title: 'Indian Independence Movement Digital Archive & Oral History',
                subject: 'Social Science',
                class_name: 'Class 8-A',
                description: 'Curate a digital exhibition of freedom struggle primary documents (1919-1947) with interactive timeline markers and audio narration.',
                task_type: 'ASSIGNMENT',
                assigned_date: '2026-09-28',
                due_date: '2026-10-30',
                due_time: '18:00',
                status: 'PENDING',
                max_marks: 40,
                weightage: 'Capstone (20%)',
                progress_pct: 85,
                resource_url: '/samples/history_capstone_rubric.pdf',
                teacher_name: 'Mrs. Kalyani Murthy',
                teacher_id: 2
              }
            ];

            const CURRENT_WEEK_DAYS = [
              { dayName: 'Mon', dayNum: 12, month: 'Oct', dateKey: '2026-10-12', label: '12 Oct 2026' },
              { dayName: 'Tue', dayNum: 13, month: 'Oct', dateKey: '2026-10-13', label: '13 Oct 2026' },
              { dayName: 'Wed', dayNum: 14, month: 'Oct', dateKey: '2026-10-14', label: '14 Oct 2026' },
              { dayName: 'Thu', dayNum: 15, month: 'Oct', dateKey: '2026-10-15', label: '15 Oct 2026' },
              { dayName: 'Fri', dayNum: 16, month: 'Oct', dateKey: '2026-10-16', label: '16 Oct 2026' },
              { dayName: 'Sat', dayNum: 17, month: 'Oct', dateKey: '2026-10-17', label: '17 Oct 2026', isToday: true }
            ];

            const getSubjectBadgeStyle = (subject: string) => {
              const s = (subject || '').toLowerCase();
              if (s.includes('math')) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800';
              if (s.includes('physic')) return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800';
              if (s.includes('chem')) return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800';
              if (s.includes('bio')) return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800';
              if (s.includes('comp') || s.includes('cs')) return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800';
              if (s.includes('eng')) return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
              if (s.includes('soc') || s.includes('sst') || s.includes('hist')) return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
              return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
            };

            const allTasks: Homework[] = studentHomeworkList.length > 0 ? studentHomeworkList : DEFAULT_FALLBACK_TASKS;

            const dailyTasks = allTasks.filter(t => (t.task_type || 'DAILY_HOMEWORK') === 'DAILY_HOMEWORK');
            const assignmentTasks = allTasks.filter(t => t.task_type === 'ASSIGNMENT');

            // Overall Summary Counts
            const dueTodayCount = allTasks.filter(t => 
              t.due_date === '2026-10-17' && 
              t.status !== 'SUBMITTED' && 
              t.status !== 'GRADED'
            ).length;

            const completedCount = allTasks.filter(t => 
              t.status === 'SUBMITTED' || t.status === 'GRADED'
            ).length;

            const backlogCount = allTasks.filter(t => 
              t.status === 'BACKLOG' || 
              (t.due_date && t.due_date < '2026-10-17' && t.status === 'PENDING')
            ).length;

            // Stream-specific filtered list
            const currentStreamTasks = homeworkWorkstream === 'daily' ? dailyTasks : assignmentTasks;

            // Filter by Status
            const filteredByStatus = currentStreamTasks.filter(item => {
              if (homeworkFilter === 'all') return true;
              if (homeworkFilter === 'pending') return item.status === 'PENDING';
              if (homeworkFilter === 'submitted_graded') return item.status === 'SUBMITTED' || item.status === 'GRADED';
              if (homeworkFilter === 'backlog') {
                return item.status === 'BACKLOG' || (item.due_date && item.due_date < '2026-10-17' && item.status === 'PENDING');
              }
              return true;
            });

            // Filter by Subject
            const filteredBySubject = filteredByStatus.filter(item => {
              if (homeworkSubjectFilter === 'all') return true;
              return item.subject.toLowerCase() === homeworkSubjectFilter.toLowerCase();
            });

            // Filter Daily Homework by Selected Week-Strip Date (unless "All Week" is toggled)
            const finalTasksList = homeworkWorkstream === 'daily' && !showAllDates
              ? filteredBySubject.filter(item => item.due_date === selectedDateKey || item.assigned_date === selectedDateKey)
              : filteredBySubject;

            const selectedDayObj = CURRENT_WEEK_DAYS.find(d => d.dateKey === selectedDateKey) || CURRENT_WEEK_DAYS[5];

            return (
              <div className="space-y-6 max-w-7xl mx-auto">
                {/* 1. TOP HEADER & WORKSPACE BANNER */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800 px-2.5 py-0.5 text-xs font-bold border border-blue-200">
                        Academic Workstreams
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Class 8-A Multi-Track Academic Ledger</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                      Homework &amp; Assignments Module
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Dual work streams separating daily subject exercises from long-term projects with automated backlog audit tracking.
                    </p>
                  </div>

                  {/* Actions: Scan Backlogs & Create Task */}
                  <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
                    <button
                      onClick={handleRunBacklogScan}
                      disabled={isScanningBacklogs}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
                      title="Run Backlog Engine scan to detect expired deadlines and sync Focus Table"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 text-blue-600 dark:text-blue-400 ${isScanningBacklogs ? 'animate-spin' : ''}`} />
                      <span>{isScanningBacklogs ? 'Scanning Deadlines...' : 'Run Backlog Scan'}</span>
                    </button>

                    <button
                      onClick={() => setIsCreateTaskModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>+ Create Task</span>
                    </button>
                  </div>
                </div>

                {/* 2. TOP METRIC CARDS: Due Today, Completed, Backlogs/Overdue */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1: Due Today */}
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Due Today</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                        {dueTodayCount}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {dueTodayCount > 0 ? 'Requires action before 5:00 PM cutoff' : 'All today’s assignments submitted'}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <CalendarCheck2 className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Card 2: Completed & Graded */}
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Completed &amp; Evaluated</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                        {completedCount}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Submitted on-time &amp; archived in ledger
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileCheck className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Card 3: Backlogs / Overdue */}
                  <div className="rounded-2xl border-2 border-red-400/70 dark:border-red-800 bg-gradient-to-br from-red-50/90 via-white to-rose-50/40 dark:from-red-950/40 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                        <span>Backlogs / Overdue</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mt-1">
                        {backlogCount}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {backlogCount > 0 ? 'Linked to Focus Table parent review' : 'Zero backlogs logged'}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveNav('focus_table')}
                      className="rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 px-3 py-2 text-[11px] font-bold text-center transition-all cursor-pointer"
                      title="Inspect backlog evidence dossier"
                    >
                      Inspect Evidence →
                    </button>
                  </div>
                </div>

                {/* 3. DUAL-TAB NAVIGATION (Daily Homework vs Assignments & Projects) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
                    <button
                      onClick={() => setHomeworkWorkstream('daily')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        homeworkWorkstream === 'daily'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <CalendarDays className="h-4 w-4" />
                      <span>Daily Homework</span>
                      <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-[10px] font-black">
                        {dailyTasks.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setHomeworkWorkstream('assignments')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        homeworkWorkstream === 'assignments'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Layers className="h-4 w-4" />
                      <span>Assignments &amp; Projects</span>
                      <span className="rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-black">
                        {assignmentTasks.length}
                      </span>
                    </button>
                  </div>

                  {/* View Mode Toggle: Timeline vs Grid */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                      <button
                        onClick={() => setHomeworkViewMode('timeline')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          homeworkViewMode === 'timeline'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Timeline
                      </button>
                      <button
                        onClick={() => setHomeworkViewMode('grid')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          homeworkViewMode === 'grid'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Cards Grid
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. FILTER PILLS & SUBJECT FILTER BAR */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Status Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => setHomeworkFilter('all')}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          homeworkFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        All ({currentStreamTasks.length})
                      </button>
                      <button
                        onClick={() => setHomeworkFilter('pending')}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          homeworkFilter === 'pending'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Pending ({currentStreamTasks.filter(t => t.status === 'PENDING').length})
                      </button>
                      <button
                        onClick={() => setHomeworkFilter('submitted_graded')}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          homeworkFilter === 'submitted_graded'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Submitted / Graded ({currentStreamTasks.filter(t => t.status === 'SUBMITTED' || t.status === 'GRADED').length})
                      </button>
                      <button
                        onClick={() => setHomeworkFilter('backlog')}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          homeworkFilter === 'backlog'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 hover:bg-red-100'
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span>Backlog ({currentStreamTasks.filter(t => t.status === 'BACKLOG' || (t.due_date && t.due_date < '2026-10-17' && t.status === 'PENDING')).length})</span>
                      </button>
                    </div>

                    {/* Subject Filter Dropdown */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium">Subject:</span>
                      <select
                        value={homeworkSubjectFilter}
                        onChange={(e) => setHomeworkSubjectFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Subjects</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="English">English</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Physics">Physics</option>
                        <option value="Biology">Biology</option>
                        <option value="Social Science">Social Science</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Science">Science</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 5. WORKSTREAM CONTENT */}
                {homeworkWorkstream === 'daily' ? (
                  /* ===================================================== */
                  /* WORKSTREAM 1: DAILY HOMEWORK & HORIZONTAL DATE STRIP */
                  /* ===================================================== */
                  <div className="space-y-6">
                    {/* Horizontal Calendar Week-Strip (Mon to Sat) */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>Weekly Daily Homework Strip (October 2026)</span>
                          </h2>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Select any day to inspect daily assignments, homework worksheets, and submission status dots.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowAllDates(!showAllDates)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer ${
                              showAllDates
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {showAllDates ? '✓ Showing All Week' : 'Show All Week'}
                          </button>
                        </div>
                      </div>

                      {/* The 6-Day Strip (Mon 12 to Sat 17 Today) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                        {CURRENT_WEEK_DAYS.map((day) => {
                          const isSelected = selectedDateKey === day.dateKey && !showAllDates;
                          // Find tasks associated with this day
                          const dayTasks = dailyTasks.filter(t => t.due_date === day.dateKey || t.assigned_date === day.dateKey);
                          const hasBacklog = dayTasks.some(t => t.status === 'BACKLOG' || (t.due_date && t.due_date < '2026-10-17' && t.status === 'PENDING'));
                          const hasPending = dayTasks.some(t => t.status === 'PENDING');
                          const hasCompleted = dayTasks.some(t => t.status === 'SUBMITTED' || t.status === 'GRADED');

                          return (
                            <button
                              key={day.dateKey}
                              onClick={() => {
                                setSelectedDateKey(day.dateKey);
                                setShowAllDates(false);
                              }}
                              className={`relative rounded-2xl p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2 border-2 ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 shadow-md ring-2 ring-blue-500/20'
                                  : day.isToday
                                  ? 'border-amber-400 dark:border-amber-500/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500'
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 hover:bg-slate-100/50'
                              }`}
                            >
                              {/* Today Pill */}
                              {day.isToday && (
                                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-xs">
                                  TODAY
                                </span>
                              )}

                              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {day.dayName}
                              </div>

                              <div className={`text-xl sm:text-2xl font-black ${
                                isSelected 
                                  ? 'text-blue-700 dark:text-blue-300' 
                                  : day.isToday 
                                  ? 'text-amber-700 dark:text-amber-400' 
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}>
                                {day.dayNum}
                              </div>

                              <div className="text-[10px] text-slate-400 font-medium">
                                {day.month}
                              </div>

                              {/* Task Status Dot Indicator */}
                              <div className="flex items-center gap-1 mt-1 h-3">
                                {dayTasks.length === 0 ? (
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700" title="No tasks assigned" />
                                ) : (
                                  <>
                                    {hasBacklog && (
                                      <span className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-red-200 dark:ring-red-950" title="Backlog / Overdue task" />
                                    )}
                                    {hasPending && !hasBacklog && (
                                      <span className="h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-950" title="Pending task" />
                                    )}
                                    {hasCompleted && (
                                      <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-950" title="Completed / Graded task" />
                                    )}
                                  </>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Selection Indicator */}
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          {showAllDates ? (
                            <span>Displaying all <strong>{dailyTasks.length}</strong> daily homework tasks for the entire week</span>
                          ) : (
                            <span>Selected Workspace: <strong>{selectedDayObj.dayName}, {selectedDayObj.label}</strong> {selectedDayObj.isToday ? '(Today)' : ''}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Overdue / Backlog</span>
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pending</span>
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Submitted / Graded</span>
                        </div>
                      </div>
                    </div>

                    {/* Daily Homework Tasks List */}
                    {finalTasksList.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center space-y-3">
                        <CalendarCheck2 className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                          No Daily Homework Scheduled for this Selection
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                          There are no daily tasks matching {selectedDayObj.label}. You can check other dates on the week strip or toggle &quot;Show All Week&quot;.
                        </p>
                        <button
                          onClick={() => {
                            setSelectedDateKey('2026-10-17');
                            setShowAllDates(false);
                          }}
                          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 transition-all cursor-pointer"
                        >
                          Jump to Today&apos;s Tasks (17 Oct)
                        </button>
                      </div>
                    ) : (
                      <div className={homeworkViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                        {finalTasksList.map((task) => {
                          const isBacklog = task.status === 'BACKLOG' || (task.due_date && task.due_date < '2026-10-17' && task.status === 'PENDING');
                          const isDueToday = task.due_date === '2026-10-17' && task.status === 'PENDING';
                          const isSubmitted = task.status === 'SUBMITTED';
                          const isGraded = task.status === 'GRADED';

                          return (
                            <div
                              key={task.id}
                              className={`rounded-2xl border transition-all p-5 shadow-xs space-y-4 ${
                                isBacklog
                                  ? 'border-2 border-red-400 dark:border-red-800 bg-white dark:bg-slate-900 ring-2 ring-red-500/10'
                                  : isDueToday
                                  ? 'border-2 border-amber-400 dark:border-amber-600 bg-white dark:bg-slate-900'
                                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                              }`}
                            >
                              {/* Task Card Header */}
                              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold border ${getSubjectBadgeStyle(task.subject)}`}>
                                      {task.subject}
                                    </span>
                                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5">
                                      Daily Homework
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">
                                      #HW-00{task.id}
                                    </span>
                                  </div>
                                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                                    {task.title}
                                  </h3>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-slate-400" />
                                      Due: <strong>{task.due_date}</strong> at {task.due_time}
                                    </span>
                                    <span>•</span>
                                    <span>Max Marks: <strong>{task.max_marks}</strong></span>
                                    <span>•</span>
                                    <span>Teacher: <strong>{task.teacher_name}</strong></span>
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <div className="shrink-0">
                                  {isBacklog && (
                                    <span className="rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800 px-3 py-1 text-xs font-black flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3 text-red-600" />
                                      <span>⚠️ Overdue Backlog</span>
                                    </span>
                                  )}
                                  {isDueToday && (
                                    <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-3 py-1 text-xs font-black flex items-center gap-1 animate-pulse">
                                      <Clock className="h-3 w-3 text-amber-600" />
                                      <span>🔥 Due Today (5 PM)</span>
                                    </span>
                                  )}
                                  {!isBacklog && !isDueToday && task.status === 'PENDING' && (
                                    <span className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-bold flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-slate-400" />
                                      <span>Pending</span>
                                    </span>
                                  )}
                                  {isSubmitted && (
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 ${
                                      task.late_submission
                                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200'
                                    }`}>
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>{task.late_submission ? '⚠️ Submitted Late (Audit Logged)' : 'Submitted'}</span>
                                    </span>
                                  )}
                                  {isGraded && (
                                    <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-3 py-1 text-xs font-black flex items-center gap-1">
                                      <Award className="h-3 w-3 text-emerald-600" />
                                      <span>Graded: 18.5 / {task.max_marks}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {task.description}
                              </p>

                              {/* Backlog Non-Compliance Notice */}
                              {isBacklog && (
                                <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3.5 space-y-1 text-xs">
                                  <div className="flex items-center justify-between font-bold text-red-800 dark:text-red-300">
                                    <span className="flex items-center gap-1.5">
                                      <AlertCircle className="h-4 w-4 text-red-600" />
                                      <span>Parent Focus Table Backlog Evidence: #EVD-BKLOG-00{task.id}</span>
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider text-red-600">Audit Locked</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                    Scheduled deadline cutoff was {task.due_date} at {task.due_time}. This item is flagged on your guardian&apos;s PTM Focus Table report. Submitting late will log a late-submission audit event.
                                  </p>
                                </div>
                              )}

                              {/* Action Footer */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                                <div className="text-[11px] text-slate-500">
                                  <span>Assigned: <strong>{task.assigned_date}</strong></span>
                                  <span className="mx-2">•</span>
                                  <span>Weight: <strong>{task.weightage || 'Daily Practice (5 pts)'}</strong></span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isBacklog && (
                                    <>
                                      <button
                                        onClick={() => setSelectedTaskForSubmit(task)}
                                        className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Upload className="h-3.5 w-3.5" />
                                        <span>Submit Late Worksheet</span>
                                      </button>
                                      <button
                                        onClick={() => setActiveNav('focus_table')}
                                        className="rounded-xl border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300 font-bold text-xs px-3 py-2 transition-all cursor-pointer"
                                      >
                                        View in Focus Table
                                      </button>
                                    </>
                                  )}

                                  {!isBacklog && task.status === 'PENDING' && (
                                    <>
                                      <button
                                        onClick={() => setSelectedTaskForSubmit(task)}
                                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <Upload className="h-3.5 w-3.5" />
                                        <span>Upload / Submit Worksheet</span>
                                      </button>
                                      <button
                                        onClick={() => setViewingTaskDetails(task)}
                                        className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs px-3 py-2 transition-all cursor-pointer"
                                      >
                                        Details
                                      </button>
                                    </>
                                  )}

                                  {isSubmitted && (
                                    <button
                                      onClick={() => setViewingTaskDetails(task)}
                                      className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold text-xs px-3.5 py-2 hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      <span>Inspect Submission</span>
                                    </button>
                                  )}

                                  {isGraded && (
                                    <button
                                      onClick={() => setIsAnnotationModalOpen(true)}
                                      className="rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-xs px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      <span>View Red Pen Annotations</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* ===================================================== */
                  /* WORKSTREAM 2: ASSIGNMENTS & LONG-TERM PROJECTS        */
                  /* ===================================================== */
                  <div className="space-y-6">
                    {/* Projects Intro Banner */}
                    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-slate-900 dark:text-white">
                            Long-Term Assignments, Capstone Projects &amp; Exhibitions
                          </h2>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            Multi-week assignments tracked with milestone progress bars, grading weightage breakdown, and downloadable reference rubrics.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
                        {assignmentTasks.length} Active Projects
                      </span>
                    </div>

                    {/* Structured Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {filteredBySubject.map((proj) => {
                        const progress = proj.progress_pct || 50;

                        return (
                          <div
                            key={proj.id}
                            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              {/* Header Badges */}
                              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold border ${getSubjectBadgeStyle(proj.subject)}`}>
                                      {proj.subject}
                                    </span>
                                    <span className="rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 border border-indigo-200 dark:border-indigo-800">
                                      {proj.weightage || 'Term Project (25%)'}
                                    </span>
                                  </div>
                                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                                    {proj.title}
                                  </h3>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Assigned by <strong>{proj.teacher_name}</strong> on {proj.assigned_date}
                                  </span>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">
                                    {proj.max_marks} Points
                                  </span>
                                  <span className="text-[10px] text-slate-400">Total Weight</span>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {proj.description}
                              </p>

                              {/* Progress Bar & Milestone Status */}
                              <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Target className="h-3.5 w-3.5 text-indigo-600" />
                                    <span>Milestone Completion Progress</span>
                                  </span>
                                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                                    {progress}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-700">
                                  <div
                                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* Due Date & Deadline Countdown */}
                              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                  <Clock className="h-4 w-4 text-indigo-600 shrink-0" />
                                  <span>Final Submission Due: <strong>{proj.due_date}</strong> at {proj.due_time}</span>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                                  In Progress
                                </span>
                              </div>

                              {/* Download Resource Attachment Link */}
                              {proj.resource_url && (
                                <div className="pt-1">
                                  <button
                                    onClick={() => triggerToast(`Downloading rubric guidelines for ${proj.title}...`)}
                                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download Project Rubric &amp; Guidelines (PDF)</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Actions Footer */}
                            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                              <button
                                onClick={() => setViewingTaskDetails(proj)}
                                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                              >
                                View Detailed Rubric →
                              </button>

                              <button
                                onClick={() => setSelectedTaskForSubmit(proj)}
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                <span>Submit Project Milestone</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ===================================================== */}
          {/* VIEW: EXAMS & RESULTS (REPORT CARDS & MARKS MEMO) */}
          {/* ===================================================== */}
          {activeNav === 'exams' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-bold border border-blue-200">
                      Official Academic Record
                    </span>
                    <span className="text-xs text-slate-500">CBSE Affiliation #830029</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Exams &amp; Report Cards (Session 2026-27)
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleOpenAdmitCard}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Award className="h-4 w-4" />
                    <span>🎟️ Official Admit Card (Hall Ticket)</span>
                  </button>

                  <button
                    onClick={() => {
                      downloadMarksMemoFile(user?.name || 'Aarav Sharma', 'Term 1 Official CBSE Statement of Marks');
                      triggerToast('Official CBSE Statement of Marks downloaded (PDF format)!');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Marks Memo (PDF)</span>
                  </button>
                </div>
              </div>

              {/* TOP CARDS: ACTIVE ONLINE TEST & EXAM SEATING */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Online Test Card */}
                <div className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        Live CBT Examination Portal
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Active Online Test: Mathematics Quiz (20 mins, 15 MCQs)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Topic: Quadratic Equations &amp; Polynomials · Window closes at 05:00 PM
                    </p>
                  </div>
                  <button
                    onClick={() => handleLaunchExam('Mathematics', 'Quadratic Equations & Polynomials CBT Test', 20)}
                    className="shrink-0 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Start Test</span>
                  </button>
                </div>

                {/* Upcoming Final Exam Seating Card */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Board &amp; Term Seating Allocation
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Upcoming Final Exam — Hall B, Desk #A-14
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Candidate: Aarav Sharma (Roll #14) · Examination Block 2 · Entry Gate 3
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={handleOpenAdmitCard}
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                      >
                        <span>View &amp; Print Full Hall Ticket</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-mono font-black text-sm shadow-xs">
                    #A-14
                  </div>
                </div>
              </div>

              {/* DESCRIPTIVE TERMINAL EXAMS & ANSWER SHEET SUBMISSION DRAWER */}
              <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-950 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                        Descriptive Written Papers
                      </span>
                      <span className="text-xs text-slate-500">Handwritten Answer Sheet Upload &amp; Faculty Evaluation</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                      Terminal Descriptive Examinations
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Submit multi-page scanned handwritten answer papers for terminal exams. Papers are evaluated by faculty using digital rubrics and AI pedagogical scans.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Exam 1: Term 1 Mathematics */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 space-y-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Mathematics • Term 1</span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          Term 1 Descriptive Examination - Mathematics
                        </h4>
                        <span className="text-xs text-slate-400">Total: 100 Marks • Date: 14 Oct 2026</span>
                      </div>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold shrink-0">
                        Graded (52%)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>Submitted Paper:</span>
                        <a
                          href="/samples/math_exam_sample.svg"
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Aarav_Sharma_Math_Term1_Paper.pdf</span>
                        </a>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                        <span>Score: <strong>52 / 100</strong> (Remedial Active)</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">In 1-Week Focus Sprint</span>
                      </div>
                    </div>
                  </div>

                  {/* Exam 2: Mid-Term Class 8-A Mathematics */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 space-y-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Mathematics • Mid-Term</span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          Mid-Term Mathematics Descriptive Paper (Class 8-A)
                        </h4>
                        <span className="text-xs text-slate-400">Total: 100 Marks • Date: 16 Oct 2026</span>
                      </div>
                      {studentSubmittedExams[2] ? (
                        <span className="rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-[10px] font-bold shrink-0">
                          Uploaded ✓
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-[10px] font-bold shrink-0">
                          Awaiting Paper
                        </span>
                      )}
                    </div>

                    {studentSubmittedExams[2] ? (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span>Uploaded File:</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{studentSubmittedExams[2].fileName}</span>
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block pt-1">
                          ✓ Placed in Mrs. Ananya Verma&apos;s grading queue
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-500">5 Descriptive questions (PDF upload)</span>
                        <button
                          onClick={() => {
                            setActiveUploadExam({
                              id: 2,
                              title: "Mid-Term Mathematics Descriptive Paper (Class 8-A)",
                              subject: "Mathematics",
                              class_name: "Class 8",
                              section: "A",
                              term: "Mid-Term",
                              exam_type: "descriptive",
                              total_marks: 100,
                              pass_marks: 40,
                              remedial_threshold_pct: 70,
                              exam_date: "16 Oct 2026",
                              is_published: false,
                              published_at: null,
                              total_students: 2,
                              graded_count: 2,
                              remedial_count: 1
                            });
                          }}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload Answer Sheet</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Answer Sheet Modal */}
              {activeUploadExam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
                  <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Upload Descriptive Answer Sheet
                        </h3>
                        <p className="text-xs text-slate-500">{activeUploadExam.title}</p>
                      </div>
                      <button
                        onClick={() => setActiveUploadExam(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                        <span className="font-bold text-indigo-900 dark:text-indigo-200 block">Question Paper Instructions:</span>
                        <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed">
                          Scan all 5 handwritten pages clearly. Ensure intermediate quadratic factorization steps and sign distributions are legible for teacher red-pen markup.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block">Select Handwritten Answer Paper File:</label>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center space-y-2 bg-slate-50/50 dark:bg-slate-800/50">
                          <FileText className="h-8 w-8 text-indigo-500 mx-auto" />
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                            {examAnswerFileName}
                          </div>
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setExamAnswerFileName('Handwritten_Math_Paper_Scan.pdf');
                                setExamAnswerFileUrl('/samples/math_exam_sample.svg');
                                triggerToast('Attached sample handwritten exam answer sheet.');
                              }}
                              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                            >
                              Use Sample Scan (math_exam_sample.svg)
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block">Student Notes / Page Summary:</label>
                        <textarea
                          rows={2}
                          value={examStudentNotes}
                          onChange={(e) => setExamStudentNotes(e.target.value)}
                          placeholder="e.g. Attached 5 pages. Included intermediate splitting steps for Q2 & Q4."
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setActiveUploadExam(null)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isSubmittingExamPaper}
                        onClick={handleUploadExamPaper}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{isSubmittingExamPaper ? 'Submitting...' : 'Submit to Examination Cell'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* OVERALL PERFORMANCE BANNER */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Term 1 Final Aggregate</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                    {studentReportCard ? `${studentReportCard.overall_percentage}%` : '88.8%'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> CBSE Verified Standing
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Class Rank</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">Rank #4</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Out of 38 students in Class 8-B</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Marks Obtained</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                    {studentReportCard ? `${studentReportCard.total_marks_obtained} / ${studentReportCard.max_total_marks}` : '222 / 250'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {studentReportCard ? `Grade: ${studentReportCard.overall_grade} Distinction` : 'Grade: A1 Distinction'}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Examination Controller Status</span>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1 block flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" /> {studentReportCard?.is_moderated ? 'Officially Moderated & Sealed' : 'Officially Verified'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {studentReportCard?.is_published ? 'Published to Student Portal ✓' : 'Exam Controller Certified'}
                  </span>
                </div>
              </div>

              {/* GEMINI AI PEDAGOGICAL GROWTH OBSERVATION */}
              {studentReportCard?.ai_teacher_narrative && (
                <div className="rounded-2xl border border-violet-200 dark:border-violet-800/60 bg-gradient-to-br from-violet-50/80 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/30 p-5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-violet-800 dark:text-violet-300 text-xs font-black">
                      <Sparkles className="h-4 w-4 text-violet-600" />
                      <span>Gemini AI Pedagogical Growth &amp; Teacher Observations</span>
                    </div>
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950 px-2 py-0.5 rounded-full">
                      Personalized AI Analysis
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    &ldquo;{studentReportCard.ai_teacher_narrative}&rdquo;
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-semibold border-t border-violet-100 dark:border-violet-900/40">
                    <span>Evaluated by: Mrs. Ananya Verma (Class Teacher)</span>
                    <span>Examination Controller: Dr. Hemanth Sen</span>
                  </div>
                </div>
              )}

              {/* SUBJECT-WISE SCORE TABLE */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Term 1 — Subject Performance Matrix &amp; Grades
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">Standardized CBSE Assessment</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold bg-white dark:bg-slate-900">
                        <th className="p-3.5">Subject</th>
                        <th className="p-3.5 text-center">Marks Obtained</th>
                        <th className="p-3.5 text-center">Max Marks</th>
                        <th className="p-3.5 text-center">Grade</th>
                        <th className="p-3.5">Faculty Evaluation &amp; Remedial Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentReportCard && studentReportCard.grades_grid ? (
                        Object.entries(studentReportCard.grades_grid).map(([sub, detail]) => (
                          <tr key={sub} className={detail.remedial_flag ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'}>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                              {sub}
                              {detail.remedial_flag && (
                                <button
                                  onClick={() => setActiveNav('focus_table')}
                                  className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[9px] font-bold border border-amber-300 hover:bg-amber-200 cursor-pointer"
                                  title="Click to open your 1-Week Remedial Focus Table"
                                >
                                  <span>⚠️ 1-Week Remedial Active</span>
                                  <ArrowRight className="h-2.5 w-2.5" />
                                </button>
                              )}
                            </td>
                            <td className="p-3.5 text-center font-black text-slate-900 dark:text-white">{detail.score}</td>
                            <td className="p-3.5 text-center text-slate-500">{detail.max}</td>
                            <td className="p-3.5 text-center">
                              <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                detail.grade.startsWith('A') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                detail.grade.startsWith('B') ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {detail.grade}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-600 dark:text-slate-300">{detail.remarks}</td>
                          </tr>
                        ))
                      ) : (
                        [
                          { sub: 'Mathematics', got: 68, max: 100, grade: 'B2', remarks: 'Enrolled in 1-Week Quadratic Remedial sprint.' },
                          { sub: 'Science (Physics/Chem/Bio)', got: 84, max: 100, grade: 'A2', remarks: 'Strong experimental insight and lab execution.' },
                          { sub: 'English Literature & Lang', got: 89, max: 100, grade: 'A1', remarks: 'Expressive vocabulary and thoughtful character depth.' },
                          { sub: 'Social Science (Hist/Civ/Geo)', got: 82, max: 100, grade: 'A2', remarks: 'Comprehensive answers on national movement & climate.' },
                          { sub: 'Second Language (Hindi)', got: 78, max: 100, grade: 'B1', remarks: 'Good grammar; improve vocabulary in long essay.' }
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">{row.sub}</td>
                            <td className="p-3.5 text-center font-black text-slate-900 dark:text-white">{row.got}</td>
                            <td className="p-3.5 text-center text-slate-500">{row.max}</td>
                            <td className="p-3.5 text-center">
                              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                                {row.grade}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-600 dark:text-slate-300">{row.remarks}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* VIEW: DEDICATED 50/50 DUAL PORTFOLIO SCREEN */}
          {/* ===================================================== */}
          {activeNav === 'portfolio' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              
              {/* Header with Stats & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-3 py-1 text-xs font-bold border border-purple-200 dark:border-purple-800">
                      <Trophy className="h-3.5 w-3.5" />
                      Student Outcomes &amp; Extracurricular Dossier
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Permanent SIS Record
                    </span>
                  </div>
                  <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Participations &amp; Achievements Dual Portfolio
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Side-by-side 50/50 layout: School events &amp; sports on the left; external verified certificates &amp; trophies on the right.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsUploadAwardModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95"
                  >
                    <Upload className="h-4 w-4" />
                    <span>[+ Upload Award Certificate]</span>
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-1">Filter:</span>
                  <div className="flex items-center gap-1">
                    {(['all', 'participation', 'achievement'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setPortfolioCategoryFilter(cat)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                          portfolioCategoryFilter === cat
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat === 'all' ? 'All Records' : cat === 'participation' ? 'School Participations' : 'External Awards'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={portfolioSearchQuery}
                    onChange={(e) => setPortfolioSearchQuery(e.target.value)}
                    placeholder="Search by event or medal..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              {/* SIDE-BY-SIDE 50/50 DUAL PORTFOLIO GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                
                {/* LEFT COLUMN (50%): OFFICIAL SCHOOL PARTICIPATIONS */}
                <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-900/40 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold">
                        <BookOpen className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Official School Participations
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Curricular, Inter-House &amp; Sports Days
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-50 dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                      {participationsList.length} Events
                    </span>
                  </div>

                  <div className="space-y-3">
                    {participationsList.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all space-y-2 group shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                              {p.event_name}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {p.title}
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                            {p.date}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {p.description}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-800">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            Official School Record Verified
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            House Coordinator Sign-off
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Curricular Event Card */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                            Cultural &amp; Performing Arts
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                            Annual Day 2026 — Western Choir Lead Tenor
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                          Oct 2026
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Selected among 120 applicants to represent DPS Class 8 in the 4-part choir ensemble and stage audio orchestration.
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-800">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          Confirmed Committee Assignment
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Music Dept.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (50%): EXTERNAL AWARDS, MEDALS & TROPHIES */}
                <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-[#7C3AED] dark:text-purple-400 flex items-center justify-center font-bold">
                        <Trophy className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          External Awards &amp; Trophies
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Student-Uploaded Certificates &amp; State Medals
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-purple-50 dark:bg-purple-950 text-[#7C3AED] dark:text-purple-300 px-2.5 py-0.5 text-xs font-bold border border-purple-200 dark:border-purple-800">
                      {achievementsList.length} Verified
                    </span>
                  </div>

                  <div className="space-y-3">
                    {achievementsList.map((a) => (
                      <div
                        key={a.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all space-y-2.5 group shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                              {a.event_name}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {a.title}
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                            {a.date}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {a.description}
                        </p>

                        {/* Certificate Thumbnail Preview & Verification Stamp */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-800">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              a.verified_by_school
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {a.verified_by_school
                              ? 'Verified by School Stamp'
                              : 'Pending Verification'}
                          </span>

                          <button
                            onClick={() => {
                              setSelectedCertificatePreview(a.proof_url || '/samples/certificate_preview.png');
                              setSelectedCertificateFileName(
                                a.proof_url && !a.proof_url.startsWith('blob:') && a.proof_url.includes('/')
                                  ? a.proof_url.split('/').pop() || `${a.title}.pdf`
                                  : selectedCertificateFileName || `${a.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_certificate.pdf`
                              );
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Preview Certificate</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Robotics Achievement Card */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-2.5 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                            Regional Robotics Open
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                            National Robotics Challenge — Autonomous Line Follower
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                          Jan 2026
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Ranked 3rd in the Under-14 hardware prototyping category for autonomous sensor PID calibration.
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-800">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" />
                          Pending Verification (Document in Review)
                        </span>
                        <button
                          onClick={() => {
                            setSelectedCertificatePreview('/samples/certificate_preview.png');
                            setSelectedCertificateFileName('robotics_challenge_certificate.png');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Preview Proof</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ===================================================== */}
          {/* VIEW: LIVE CLASSES & RECORDINGS FULL ARCHIVE */}
          {/* ===================================================== */}
          {activeNav === 'live_classes' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Live Video Classroom &amp; High-Definition Archive
                  </h1>
                  <p className="text-xs text-slate-500">
                    Join ongoing periods or review recorded lessons with synced chapter notes
                  </p>
                </div>
                <button
                  onClick={handleJoinLiveClass}
                  className="rounded-xl bg-[#2563EB] text-white px-4 py-2 text-xs font-bold shadow-sm"
                >
                  Join Active Period 3
                </button>
              </div>

              {/* Subject Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['All', 'Mathematics', 'Physics', 'English'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubjectFilter(sub)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                      selectedSubjectFilter.toLowerCase() === sub.toLowerCase()
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRecordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={rec.thumbnail || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400'}
                        alt={rec.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                      />
                      <button
                        onClick={() => setActiveVideoModal(rec)}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="h-12 w-12 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="h-5 w-5 ml-0.5 fill-current" />
                        </div>
                      </button>
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 font-semibold">
                        <span>{rec.chapter}</span>
                        <span className="bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                          {rec.duration}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold border border-blue-200">
                          {rec.subject}
                        </span>
                        <span className="text-[10px] text-slate-400">{rec.date}</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {rec.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Instructor: {rec.teacher_name}
                      </p>

                      <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                        <button
                          onClick={() => setActiveVideoModal(rec)}
                          className="flex-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 py-1.5 text-xs font-bold text-center"
                        >
                          Play Lesson
                        </button>
                        <button
                          onClick={() => handleDownloadNotes(rec.subject, rec.chapter)}
                          className="flex-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 py-1.5 text-xs font-bold text-center"
                        >
                          Notes PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* VIEW: TIMETABLE */}
          {/* ===================================================== */}
          {activeNav === 'timetable' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Weekly Class Timetable (Class 8-A)
                  </h1>
                  <p className="text-xs text-slate-500">
                    Current Period highlighted: Period 3 Mathematics (10:30 AM – 11:15 AM)
                  </p>
                </div>
                <span className="rounded-xl bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 text-xs font-bold">
                  Session: Term 1 (Autumn 2026)
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="p-3.5">Day</th>
                      <th className="p-3.5">P1 (08:30-09:15)</th>
                      <th className="p-3.5">P2 (09:15-10:00)</th>
                      <th className="p-3.5 bg-blue-50/50 text-blue-900 border-x border-blue-200">
                        P3 (10:30-11:15) ★ LIVE
                      </th>
                      <th className="p-3.5">P4 (11:15-12:00)</th>
                      <th className="p-3.5">P5 (01:00-01:45)</th>
                      <th className="p-3.5">P6 (01:45-02:30)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[
                      { day: 'Monday', p1: 'English (Ms. Adams)', p2: 'Physics (Dr. Raman)', p3: 'Mathematics (Mrs. Verma)', p4: 'Chemistry (Mrs. Sen)', p5: 'History (Ms. Roy)', p6: 'Physical Ed. (Coach Anil)' },
                      { day: 'Tuesday', p1: 'Mathematics (Mrs. Verma)', p2: 'Biology (Dr. Gupta)', p3: 'English Literature', p4: 'Geography (Ms. Roy)', p5: 'Art & Craft (Mr. Das)', p6: 'Hindi (Mrs. Trivedi)' },
                      { day: 'Wednesday (Today)', p1: 'Physics (Dr. Raman)', p2: 'Chemistry (Mrs. Sen)', p3: 'Mathematics (Mrs. Verma)', p4: 'Computer Science (Mr. Nair)', p5: 'Social Science (Ms. Roy)', p6: 'Music / Western Choir' },
                      { day: 'Thursday', p1: 'Mathematics (Mrs. Verma)', p2: 'English (Ms. Adams)', p3: 'Biology Lab (Dr. Gupta)', p4: 'Physics Lab (Dr. Raman)', p5: 'Library Reading', p6: 'Sports & Games' },
                      { day: 'Friday', p1: 'Chemistry Lab', p2: 'Mathematics (Mrs. Verma)', p3: 'Robotics & STEM Lab', p4: 'History & Civics', p5: 'English Grammar', p6: 'Club Activities' }
                    ].map((row, idx) => (
                      <tr key={idx} className={row.day.includes('Today') ? 'bg-blue-50/20 font-semibold' : 'hover:bg-slate-50/60'}>
                        <td className="p-3.5 font-bold text-slate-900">{row.day}</td>
                        <td className="p-3.5 text-slate-700">{row.p1}</td>
                        <td className="p-3.5 text-slate-700">{row.p2}</td>
                        <td className="p-3.5 bg-blue-50/40 text-blue-700 font-bold border-x border-blue-100">
                          {row.p3}
                        </td>
                        <td className="p-3.5 text-slate-700">{row.p4}</td>
                        <td className="p-3.5 text-slate-700">{row.p5}</td>
                        <td className="p-3.5 text-slate-700">{row.p6}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* VIEW: MY FOCUS TABLE (PERSONALIZED STUDY PLAN)        */}
          {/* ===================================================== */}
          {/* ===================================================== */}
          {/* VIEW: MY FOCUS TABLE (PERSONALIZED STUDY PLAN)        */}
          {/* ===================================================== */}
          {activeNav === 'focus_table' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 text-xs font-bold border border-amber-200 dark:border-amber-800">
                      Targeted Remedial Sprint
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Class 8-B &bull; Mathematics</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    🎯 My 1-Week Focus Table &amp; Daily Practice
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Personalized 7-day micro-practice sprint targeting root algebraic misconceptions. Calibrated by Mrs. Ananya Verma.
                  </p>
                </div>

                {/* Sub-Tab Selector */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setStudentFocusViewMode('sprint')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      studentFocusViewMode === 'sprint'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    ⚡ Active 1-Week Sprint (Math)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudentFocusViewMode('all_subjects')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      studentFocusViewMode === 'all_subjects'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    📚 All Subjects Overview
                  </button>
                </div>
              </div>

              {studentFocusViewMode === 'sprint' ? (
                /* Dedicated 1-Week Remedial Focus Table & Lag Intelligence */
                <StudentRemedialView studentId={1} />
              ) : (
                /* Multi-Subject Revision View */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Active Weak Concepts</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">2 Topics</span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">High Priority</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Mathematics &amp; Physics</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Algebraic Fractions Mastery</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-purple-600 dark:text-purple-400">52%</span>
                        <span className="text-xs font-bold text-purple-600">Goal: &gt;70%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: '52%' }}></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Optics Ray Diagrams Mastery</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">58%</span>
                        <span className="text-xs font-bold text-blue-600">Goal: 85%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '58%' }}></div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Daily Study Milestone</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Day 3: Active Drill</span>
                        <span className="text-[10px] font-bold text-emerald-600">20 Min Daily</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">Zero Period Check Tomorrow</span>
                    </div>
                  </div>

                  <FocusTableView 
                    table={studentQuadraticFocusTable} 
                    isParentView={false} 
                    currentRole="student"
                    isNewUser={false} 
                  />
                </div>
              )}
            </div>
          )}

          {/* ===================================================== */}
          {/* VIEW: ACADEMIC CALENDAR & ATTENDANCE LEDGER */}
          {/* ===================================================== */}
          {activeNav === 'calendar' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              
              {/* Header & Export Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 text-xs font-bold border border-purple-200 dark:border-purple-800">
                      Attendance &amp; Campus Life
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">CBSE Session 2026-27</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Academic Calendar, Attendance Ledger &amp; Holidays
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time RFID turnstile telemetry, daily period attendance, official gazetted holidays, and term milestones
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Autumn Term Active
                  </span>
                  <button
                    onClick={() => triggerToast('📄 Exporting Official October 2026 Attendance Certificate (PDF)...')}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Attendance PDF</span>
                  </button>
                </div>
              </div>

              {/* MONTHLY ATTENDANCE KPI STRIP */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Overall Attendance</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">95.4%</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Safe (&gt;75%)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">21 Present of 22 Working Days</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Morning Arrival</span>
                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">08:03 AM</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Avg Punch</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Gate 2 RFID Turnstile • 0 Late Days</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Leaves / Absences</span>
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">1 Day</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Approved</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Medical Leave on Oct 7 (Doctor Note Verified)</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Holidays &amp; Breaks</span>
                    <Calendar className="h-3.5 w-3.5 text-purple-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">4 Days</span>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Festivals</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Gandhi Jayanti &amp; Diwali Break</span>
                </div>
              </div>

              {/* CALENDAR FILTER CONTROLS */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {(['all', 'attendance', 'holidays', 'events'] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setCalendarFilter(filterKey)}
                      className={`capitalize px-3 py-1.5 rounded-xl transition-all ${
                        calendarFilter === filterKey
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {filterKey === 'all' ? 'All Unified View (31 Days)' :
                       filterKey === 'attendance' ? '🟢 My Attendance (21 Present)' :
                       filterKey === 'holidays' ? '🟡 Vacations & Holidays (4)' :
                       '🟣 School Events & Exams (3)'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 text-[11px] font-bold">Month:</span>
                  {(['October 2026', 'November 2026', 'December 2026'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedCalendarMonth(m);
                        if (m === 'October 2026') setSelectedCalendarDay(14);
                        if (m === 'November 2026') setSelectedCalendarDay(14);
                        if (m === 'December 2026') setSelectedCalendarDay(10);
                      }}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        selectedCalendarMonth === m
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {m.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* MAIN CALENDAR GRID & DAY INSPECTOR (SIDE-BY-SIDE ON DESKTOP) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT (8 COLS): 31-DAY INTERACTIVE MONTHLY CALENDAR GRID */}
                <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>{selectedCalendarMonth} Daily Attendance &amp; Events Ledger</span>
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Present
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        Leave
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        Holiday
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                        Event
                      </span>
                    </div>
                  </div>

                  {/* 7-Column Day Names */}
                  <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 pb-1">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>

                  {/* 31 Calendar Grid Cells (October 2026 starts on Thursday, so Mon-Wed padded with 3 empty slots) */}
                  <div className="grid grid-cols-7 gap-1.5 text-xs">
                    {/* Padding for Mon, Tue, Wed before Oct 1 (Thu) */}
                    <div className="h-20 rounded-xl bg-slate-50/40 dark:bg-slate-900/40 border border-transparent"></div>
                    <div className="h-20 rounded-xl bg-slate-50/40 dark:bg-slate-900/40 border border-transparent"></div>
                    <div className="h-20 rounded-xl bg-slate-50/40 dark:bg-slate-900/40 border border-transparent"></div>

                    {[
                      { day: 1, weekday: 'Thu', status: 'present', checkIn: '08:05 AM', rfid: 'Gate 2', bus: 'KA-05-EB-4491 (07:44 AM)', periods: '6/6 Attended', notes: 'Normal school day' },
                      { day: 2, weekday: 'Fri', status: 'holiday', holidayName: 'Gandhi Jayanti', holidayType: 'National Gazetted Holiday' },
                      { day: 3, weekday: 'Sat', status: 'present', checkIn: '08:12 AM', rfid: 'Gate 1', periods: '4/4 Attended (Half Day)', notes: 'Club activities' },
                      { day: 4, weekday: 'Sun', status: 'weekend' },
                      { day: 5, weekday: 'Mon', status: 'present', checkIn: '08:01 AM', rfid: 'Gate 2', bus: 'KA-05-EB-4491 (07:41 AM)', periods: '6/6 Attended', notes: 'Weekly assembly' },
                      { day: 6, weekday: 'Tue', status: 'present', checkIn: '08:03 AM', rfid: 'Gate 2', periods: '6/6 Attended' },
                      { day: 7, weekday: 'Wed', status: 'absent', leaveReason: 'Approved Sick Leave', doctorNote: 'Dr. Sen Paediatrics note on record', notes: 'Viral fever — approved by Principal' },
                      { day: 8, weekday: 'Thu', status: 'present', checkIn: '08:08 AM', rfid: 'Gate 2', periods: '6/6 Attended' },
                      { day: 9, weekday: 'Fri', status: 'present', checkIn: '08:04 AM', rfid: 'Gate 2', periods: '6/6 Attended' },
                      { day: 10, weekday: 'Sat', status: 'present', checkIn: '08:10 AM', rfid: 'Gate 1', periods: '4/4 Attended', notes: 'Saturday Activity' },
                      { day: 11, weekday: 'Sun', status: 'holiday', holidayName: 'Dussehra (Vijayadashami)', holidayType: 'Festival Public Holiday' },
                      { day: 12, weekday: 'Mon', status: 'present', checkIn: '08:02 AM', rfid: 'Gate 2', periods: '6/6 Attended' },
                      { day: 13, weekday: 'Tue', status: 'present', checkIn: '08:05 AM', rfid: 'Gate 2', periods: '6/6 Attended' },
                      { day: 14, weekday: 'Wed', status: 'present', isToday: true, checkIn: '08:02 AM', rfid: 'Gate 2 Turnstile', bus: 'KA-05-EB-4491 (07:42 AM)', periods: '3/6 Attended (Period 3 Live)', notes: 'Class 8-A Mathematics Live now in session' },
                      { day: 15, weekday: 'Thu', status: 'upcoming', eventName: 'U-14 Football Trial Match', targetNav: 'calendar' },
                      { day: 16, weekday: 'Fri', status: 'event', eventName: 'UT-2 Results Discussion Assembly', eventTime: '10:00 AM • Auditorium', targetNav: 'exams' },
                      { day: 17, weekday: 'Sat', status: 'upcoming' },
                      { day: 18, weekday: 'Sun', status: 'weekend' },
                      { day: 19, weekday: 'Mon', status: 'event', eventName: 'Annual Cultural Day Rehearsal', eventTime: 'Stage Tech & Choir', targetNav: 'calendar' },
                      { day: 20, weekday: 'Tue', status: 'upcoming' },
                      { day: 21, weekday: 'Wed', status: 'upcoming' },
                      { day: 22, weekday: 'Thu', status: 'upcoming' },
                      { day: 23, weekday: 'Fri', status: 'upcoming' },
                      { day: 24, weekday: 'Sat', status: 'event', eventName: 'CBSE Robotics & AI Fest', eventTime: 'Dual Portfolio Showcase', targetNav: 'portfolio' },
                      { day: 25, weekday: 'Sun', status: 'weekend' },
                      { day: 26, weekday: 'Mon', status: 'upcoming' },
                      { day: 27, weekday: 'Tue', status: 'upcoming' },
                      { day: 28, weekday: 'Wed', status: 'holiday', holidayName: 'Diwali Vacation Begins', holidayType: 'Festival Vacation (28 Oct – 04 Nov)' },
                      { day: 29, weekday: 'Thu', status: 'holiday', holidayName: 'Choti Diwali', holidayType: 'Festival Vacation' },
                      { day: 30, weekday: 'Fri', status: 'holiday', holidayName: 'Diwali (Lakshmi Puja)', holidayType: 'National Gazetted Holiday' },
                      { day: 31, weekday: 'Sat', status: 'holiday', holidayName: 'Govardhan Puja', holidayType: 'Festival Vacation' }
                    ].map((item) => {
                      const isSelected = selectedCalendarDay === item.day;
                      
                      // Filter match logic
                      let isDimmed = false;
                      if (calendarFilter === 'attendance' && item.status !== 'present' && item.status !== 'absent') isDimmed = true;
                      if (calendarFilter === 'holidays' && item.status !== 'holiday') isDimmed = true;
                      if (calendarFilter === 'events' && item.status !== 'event') isDimmed = true;

                      return (
                        <div
                          key={item.day}
                          onClick={() => setSelectedCalendarDay(item.day)}
                          className={`min-h-[76px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                            isDimmed ? 'opacity-30' : 'opacity-100'
                          } ${
                            isSelected
                              ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/40 dark:bg-blue-950/40 shadow-xs'
                              : item.isToday
                              ? 'border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                              : item.status === 'holiday'
                              ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                              : item.status === 'event'
                              ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60'
                              : item.status === 'absent'
                              ? 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800/60'
                              : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-mono font-bold text-xs ${
                              item.isToday
                                ? 'h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]'
                                : isSelected
                                ? 'text-blue-600 dark:text-blue-400 font-black'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {item.day}
                            </span>
                            
                            {item.status === 'present' && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Present"></span>
                            )}
                            {item.status === 'absent' && (
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" title="Medical Leave"></span>
                            )}
                            {item.status === 'holiday' && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Holiday"></span>
                            )}
                            {item.status === 'event' && (
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" title="School Event"></span>
                            )}
                          </div>

                          <div className="mt-1">
                            {item.isToday ? (
                              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 block truncate">
                                🟢 Today Present
                              </span>
                            ) : item.status === 'present' ? (
                              <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 block truncate">
                                🟢 {item.checkIn}
                              </span>
                            ) : item.status === 'absent' ? (
                              <span className="text-[9px] font-bold text-red-600 dark:text-red-400 block truncate">
                                🔴 Sick Leave
                              </span>
                            ) : item.status === 'holiday' ? (
                              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 block truncate">
                                🟡 {item.holidayName?.split(' ')[0]}
                              </span>
                            ) : item.status === 'event' ? (
                              <span className="text-[9px] font-bold text-purple-700 dark:text-purple-400 block truncate">
                                🟣 {item.eventName?.split(' ')[0]}
                              </span>
                            ) : item.status === 'weekend' ? (
                              <span className="text-[9px] text-slate-400 block truncate">
                                Weekend
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 block truncate">
                                6 Periods
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT (4 COLS): DAY INSPECTION DOSSIER & RFID TELEMETRY */}
                <div className="lg:col-span-4 space-y-5">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Day Inspection Dossier</span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          October {selectedCalendarDay}, 2026
                        </h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedCalendarDay === 14 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        selectedCalendarDay === 7 ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800' :
                        selectedCalendarDay === 2 || selectedCalendarDay >= 28 ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        selectedCalendarDay === 16 || selectedCalendarDay === 24 ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {selectedCalendarDay === 14 ? '🟢 Present Today' :
                         selectedCalendarDay === 7 ? '🔴 Medical Leave' :
                         selectedCalendarDay === 2 || selectedCalendarDay >= 28 ? '🟡 School Holiday' :
                         selectedCalendarDay === 16 || selectedCalendarDay === 24 ? '🟣 Campus Event' :
                         'Regular School Day'}
                      </span>
                    </div>

                    {/* Telemetry Breakdown for Selected Day */}
                    <div className="space-y-3 text-xs">
                      {selectedCalendarDay === 7 ? (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-1.5">
                          <span className="font-bold text-red-800 dark:text-red-300 block">Medical Leave Verification</span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            Doctor Certificate: Mild viral fever &amp; pediatric rest advised. Approved by Class Teacher Mrs. Ananya Verma and School Nurse.
                          </p>
                          <span className="text-[10px] text-red-700 dark:text-red-400 font-semibold block">Excused Absences do not penalize CBSE Minimum 75% Rule.</span>
                        </div>
                      ) : selectedCalendarDay === 2 || selectedCalendarDay >= 28 ? (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5">
                          <span className="font-bold text-amber-800 dark:text-amber-300 block">
                            {selectedCalendarDay === 2 ? 'Gandhi Jayanti (National Holiday)' : 'Diwali & Chhath Puja Vacation (8 Days)'}
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            Campus offices, academic blocks, and school bus fleet closed. Online LMS homework repositories remain accessible.
                          </p>
                          <button
                            onClick={() => setActiveNav('homework')}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>Open Holiday Homework Repository →</span>
                          </button>
                        </div>
                      ) : selectedCalendarDay === 16 ? (
                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                          <span className="font-bold text-purple-800 dark:text-purple-300 block">Unit Test 2 Results Declaration Assembly</span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            Auditorium gathering for Class 8 term evaluation review. Aarav ranked #4 in section.
                          </p>
                          <button
                            onClick={() => setActiveNav('exams')}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white p-2 text-xs font-bold shadow-sm transition-all"
                          >
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span>Navigate to Exams &amp; Report Card</span>
                          </button>
                        </div>
                      ) : selectedCalendarDay === 24 ? (
                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                          <span className="font-bold text-purple-800 dark:text-purple-300 block">CBSE Regional Robotics &amp; AI Exhibition</span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            Aarav presenting smart robotics controller and dual portfolio certificates.
                          </p>
                          <button
                            onClick={() => setActiveNav('portfolio')}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white p-2 text-xs font-bold shadow-sm transition-all"
                          >
                            <Trophy className="h-3.5 w-3.5" />
                            <span>Navigate to Dual Portfolio</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Morning Gate Punch</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {selectedCalendarDay <= 14 ? '08:02 AM • Gate 2 Turnstile' : 'Scheduled 08:00 AM'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                              On Time
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Transport Pickup · Bus No. 14</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {selectedCalendarDay <= 14 ? '07:45 AM • Stop: HDFC Circle' : 'Scheduled 07:45 AM'}
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveNav('profile')}
                              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              SIS Transport Details →
                            </button>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Period Roll-Call Ledger</span>
                            <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-bold">
                              <span className="p-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">P1: Physics ✓</span>
                              <span className="p-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">P2: Chemistry ✓</span>
                              <span className="p-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">P3: Maths (Live)</span>
                              <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">P4: CS (11:15)</span>
                              <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">P5: SST (01:00)</span>
                              <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">P6: Choir (01:45)</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setActiveNav('timetable')}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 p-2 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                          >
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>View Full Timetable for This Day</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* DYNAMIC MONTH-BASED VACATIONS & CAMPUS MILESTONES */}
              {(() => {
                const holidaysData: Record<string, Array<{ name: string; dates: string; type: string; days: string; day: number }>> = {
                  'October 2026': [
                    { name: 'Gandhi Jayanti', dates: '02 Oct 2026', type: 'National Gazetted Holiday', days: '1 Day', day: 2 },
                    { name: 'Dussehra (Vijayadashami)', dates: '11 Oct 2026', type: 'Festival Public Holiday', days: '1 Day', day: 11 },
                    { name: 'Diwali & Festival of Lights Break', dates: '28 Oct – 04 Nov 2026', type: 'Festival Vacation', days: '8 Days', day: 28 }
                  ],
                  'November 2026': [
                    { name: 'Karnataka Rajyotsava', dates: '01 Nov 2026', type: 'State Public Holiday', days: '1 Day', day: 1 },
                    { name: 'Guru Nanak Jayanti', dates: '15 Nov 2026', type: 'National Public Holiday', days: '1 Day', day: 15 }
                  ],
                  'December 2026': [
                    { name: 'Winter Break & Christmas Holidays', dates: '23 Dec 2026 – 02 Jan 2027', type: 'Winter Vacation', days: '11 Days', day: 23 },
                    { name: 'Christmas Day Celebration', dates: '25 Dec 2026', type: 'National Gazetted Holiday', days: '1 Day', day: 25 }
                  ]
                };

                const eventsData: Record<string, Array<{ event: string; date: string; committee: string; targetNav: NavSection; day: number }>> = {
                  'October 2026': [
                    { event: 'UT-2 Marks Consolidated Report Card', date: 'Published 16 Oct', committee: 'Maths 46/50 • Science 48/50', targetNav: 'exams', day: 16 },
                    { event: 'Annual Cultural Day Rehearsals', date: '19 Oct 2026', committee: 'Aarav in Western Choir & Stage Tech', targetNav: 'calendar', day: 19 },
                    { event: 'Inter-School Science & Robotics Fest', date: '24 Oct 2026', committee: 'CBSE Regional Exhibition', targetNav: 'portfolio', day: 24 }
                  ],
                  'November 2026': [
                    { event: 'Inter-School Basketball Finals', date: '08 Nov 2026', committee: 'Sports Complex Arena', targetNav: 'calendar', day: 8 },
                    { event: 'Children’s Day & Science Carnival', date: '14 Nov 2026', committee: 'Class 8-A Exhibit Pavilion', targetNav: 'calendar', day: 14 },
                    { event: 'All-India Mathematics Olympiad (Stage 1)', date: '22 Nov 2026', committee: 'Examination Hall B', targetNav: 'exams', day: 22 }
                  ],
                  'December 2026': [
                    { event: 'Term 2 Summative Assessments (Pre-Boards)', date: '10 Dec – 21 Dec 2026', committee: 'Comprehensive Marks Card Generation', targetNav: 'exams', day: 10 },
                    { event: 'Annual Athletics & Track Meet', date: '18 Dec 2026', committee: 'Sports Complex Track Field', targetNav: 'calendar', day: 18 },
                    { event: 'Parent-Teacher Focus Table Progress Review', date: '22 Dec 2026', committee: 'Focus Table Evidence Audit with Guardian', targetNav: 'focus_table', day: 22 }
                  ]
                };

                const currentHolidays = holidaysData[selectedCalendarMonth] || [];
                const currentEvents = eventsData[selectedCalendarMonth] || [];

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Month-Filtered Upcoming Holidays */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span>Official Holidays for {selectedCalendarMonth}</span>
                        </h3>
                        <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 text-[10px] font-bold">
                          {currentHolidays.length} Holidays
                        </span>
                      </div>

                      <div className="space-y-3">
                        {currentHolidays.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedCalendarDay(item.day)}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs cursor-pointer hover:border-amber-400 transition-colors"
                          >
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.dates} • {item.type}</span>
                            </div>
                            <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-bold">
                              {item.days}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Month-Filtered Key Campus Milestones */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span>Campus Events for {selectedCalendarMonth}</span>
                        </h3>
                        <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-bold">
                          {currentEvents.length} Milestones
                        </span>
                      </div>

                      <div className="space-y-3">
                        {currentEvents.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              if (item.targetNav === 'calendar') {
                                setSelectedCalendarDay(item.day);
                              } else {
                                setActiveNav(item.targetNav);
                              }
                            }}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1 text-xs cursor-pointer hover:border-blue-400 transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1.5">
                                <span>{item.event}</span>
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </span>
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{item.date}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{item.committee}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          )}

          {/* ===================================================== */}
          {/* SCREEN 3: SIS PROFILE PAGE (WITH STATIC BUS BADGE)   */}
          {/* ===================================================== */}
          {activeNav === 'profile' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                      Official SIS Dossier
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Oakridge International School</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Student Information System (SIS) &amp; Attendance Profile
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Official Student Enrollment, Static Transport Designation, and Verified Attendance Ledger.
                  </p>
                </div>
                <span className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold">
                  Status: Active Student
                </span>
              </div>

              {/* Top Split: Student Header Profile & Transport Route Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 6 Cols: Student Demographic Header */}
                <div className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200"
                      alt="Aarav Sharma"
                      className="h-16 w-16 rounded-2xl object-cover border-2 border-blue-500/80 shadow-md"
                    />
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">Aarav Sharma</h2>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">
                        Class 8, Section A • Roll #14
                      </span>
                      <span className="inline-block mt-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                        Admission ID: EDU-2024-082
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Date of Birth:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">14 May 2013</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Blood Group:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">O+ Positive</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">House Affiliation:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">Phoenix House (Captain)</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Guardian Name:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Mr. Rajesh Sharma (Father)</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Guardian Contact:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">+91 98111 00003</span>
                    </div>
                  </div>
                </div>

                {/* Right 6 Cols: Transport Route Card (Static Info with Explicit No-GPS Callout) */}
                <div className="lg:col-span-6 rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        🚌
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Transport Details (Static Read-Only)
                        </h3>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Assigned School Fleet Allocation
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-[10px] font-bold">
                      Read-Only
                    </span>
                  </div>

                  {/* Metadata Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Bus Number</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                        Bus No. 14
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Route Name</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                        Route 4-B
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Designated Stop</span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                        HDFC Circle
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup &amp; Drop Timings</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                        Pickup: 7:45 AM • Drop: 4:15 PM
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendant / Driver Contact</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">+91 98765 43210 (Driver: Ramesh Kumar)</span>
                    </div>
                    <Phone className="h-4 w-4 text-emerald-500" />
                  </div>

                  {/* Explicit Directive Note */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      Distraction-Free Student Portal Directive
                    </span>
                    <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                      No interactive live map is provided in the Student Portal. Parents can monitor real-time GPS bus telemetry, vehicle speed, and geofence boarding alerts exclusively via the <b>EDU360 Parent Mobile App</b>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Split: Monthly Attendance Analytics & Approved Leave History */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Monthly Attendance Analytics Tab (7 Cols) */}
                <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Term 1 Monthly Attendance Analytics &amp; Trend
                    </h3>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      Overall: 94.2%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {[
                      { month: 'July 2026', pct: '96.0%', present: '24/25 Days', bar: 96 },
                      { month: 'August 2026', pct: '93.5%', present: '23/24 Days', bar: 93.5 },
                      { month: 'September 2026', pct: '95.2%', present: '22/23 Days', bar: 95.2 },
                      { month: 'October (MTD)', pct: '92.1%', present: '11/12 Days', bar: 92.1 }
                    ].map((m, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">{m.month}</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">{m.pct}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{m.present}</span>
                        <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${m.bar}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      CBSE Minimum Mandatory 75% Attendance Criteria Satisfied
                    </span>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      Aarav holds a cumulative 94.2% attendance record (48 Present, 2 Late, 1 Excused Leave), comfortably clearing the 75% CBSE Board Examination eligibility requirement.
                    </p>
                  </div>
                </div>

                {/* Approved Leave History Table (5 Cols) */}
                <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Approved Leave History
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Official Records
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">Medical Leave (Viral Fever)</span>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[9px] font-bold">
                          Approved
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Dates: 14 Sep – 15 Sep 2026 (2 Days)
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                        Approved by Class Teacher Mrs. Sunitha Rao • Medical Certificate submitted
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">Family Function / Travel</span>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[9px] font-bold">
                          Approved
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Date: 22 Aug 2026 (1 Day)
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                        Approved by Vice Principal • Prior notice letter submitted
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* STUDENT ACHIEVEMENTS & CO-CURRICULAR PARTICIPATIONS SHOWCASE */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Student Achievements &amp; Participations Showcase</span>
                        <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-[10px] font-bold">
                          5 Verified Records
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Official verified milestones, Olympiad distinctions, inter-school representations &amp; house leadership.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveNav('portfolio')}
                    className="self-start sm:self-auto text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Dual Portfolio Repository →</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Regional Champion & Gold Medal',
                      category: 'STEM & Robotics',
                      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
                      event: 'CBSE Regional Science & AI Robotics Expo 2026',
                      award: 'First Place & Best Automated Sensor Prototype',
                      verifiedBy: 'Verified by CBSE Regional Directorate (#RO-2026-904)',
                      date: 'October 2026',
                      icon: Trophy
                    },
                    {
                      title: 'Phoenix House Captain (Elected)',
                      category: 'Leadership & Student Council',
                      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300',
                      event: 'Oakridge Student Council Leadership Board (2026-27)',
                      award: 'Elected by Class 8 Peers & Faculty Senate',
                      verifiedBy: 'Signed by Principal Dr. M. K. Sharma (#SC-8A-01)',
                      date: 'July 2026',
                      icon: Award
                    },
                    {
                      title: 'State Silver Medalist (Rank #2)',
                      category: 'Academics & Mathematics',
                      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
                      event: 'Karnataka State Mathematics Olympiad (Junior Tier)',
                      award: 'Scored 96/100 • Qualified for National Stage',
                      verifiedBy: 'State Mathematics Association (#KMO-831)',
                      date: 'September 2026',
                      icon: Sparkles
                    },
                    {
                      title: 'District Chess Tournament Runner-Up',
                      category: 'Sports & Strategy',
                      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
                      event: 'District Inter-School U-14 Rapid Chess Championship',
                      award: '5.5/6.0 Rounds Won • Board 1 Representative',
                      verifiedBy: 'District Sports Federation & Oakridge Athletics',
                      date: 'August 2026',
                      icon: ShieldCheck
                    },
                    {
                      title: 'Inter-School Western Choir & Vocals',
                      category: 'Performing Arts',
                      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
                      event: 'All-Bangalore Inter-School Music Conclave 2026',
                      award: '1st Runner-Up in Western Harmony Category',
                      verifiedBy: 'Department of Cultural & Musical Affairs',
                      date: 'August 2026',
                      icon: Award
                    }
                  ].map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 shadow-xs space-y-2.5 flex flex-col justify-between hover:border-amber-400 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${item.badgeColor}`}>
                              {item.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{item.date}</span>
                          </div>

                          <div className="flex items-start gap-2 pt-0.5">
                            <IconComponent className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                              {item.title}
                            </h4>
                          </div>

                          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                            {item.event}
                          </p>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                            {item.award}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-medium truncate">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{item.verifiedBy}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>


            </div>
          )}

          {/* ===================================================== */}
          {/* SCREEN 5: STRICT VIEW-ONLY DOCUMENT VAULT             */}
          {/* ===================================================== */}
          {activeNav === 'vault' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Prominent Security Badge */}
              <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold shrink-0">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">
                      🔒 Official Student Vault — Maintained by School Administration (Strictly View &amp; Download Only)
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Official certificates, transfer records, and verified health dossiers issued by Oakridge International School. Modifying or deleting documents is strictly disabled for student accounts.
                    </p>
                  </div>
                </div>
                <span className="rounded-xl bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 text-xs font-bold shrink-0">
                  Read-Only Clearance
                </span>
              </div>

              {/* Documents Grid / List */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                {[
                  {
                    id: 1,
                    title: 'Bonafide Student Certificate (Session 2026-27)',
                    doc_type: 'Bonafide Certificate',
                    verified_stamp: 'Signed & Sealed by Principal Dr. M. K. Sharma',
                    file_url: '#',
                    status: 'Issued & Active'
                  },
                  {
                    id: 2,
                    title: 'Transfer Certificate (TC) Status',
                    doc_type: 'Enrollment Status',
                    verified_stamp: 'Status: Not Requested · Active Enrollment in Class 8-A',
                    file_url: '#',
                    status: 'Active Student'
                  },
                  {
                    id: 3,
                    title: 'Annual Student Medical & Immunization Clearance',
                    doc_type: 'Medical Record',
                    verified_stamp: 'Verified by Chief Medical Officer Dr. Sneha Roy',
                    file_url: '#',
                    status: 'Cleared'
                  },
                  {
                    id: 4,
                    title: 'Consolidated Unit Test 1 & 2 Marksheet (CBSE Format)',
                    doc_type: 'Academic Transcript',
                    verified_stamp: 'Authenticated by Examination Cell (88.8% Aggregate)',
                    file_url: '#',
                    status: 'Verified'
                  }
                ].map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                          <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 text-[9px] font-bold">
                            {doc.doc_type}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                          {doc.verified_stamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        🔒 Edit Locked
                      </span>
                      <button
                        onClick={() => triggerToast(`Previewing / Downloading: ${doc.title}`)}
                        className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View / Download PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand Footer */}
          <Footer />

        </main>
      </div>

      {/* ========================================================= */}
      {/* 4. MODALS & LIGHTBOXES */}
      {/* ========================================================= */}

      {/* MODAL 1: LIVE CLASSROOM STREAM OVERLAY */}
      {isLiveClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-3xl bg-[#0F172A] border border-slate-700 text-white overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
                  LIVE STREAM
                </span>
                <span className="text-sm font-bold text-white">
                  Class 8-A Mathematics: Quadratic Equations &amp; Roots
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  🟢 Auto-Attendance: Present (+06:18m)
                </span>
                <button
                  onClick={() => setIsLiveClassModalOpen(false)}
                  className="rounded-xl p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Video Simulation Canvas */}
            <div className="relative flex-1 bg-black min-h-[420px] flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200"
                alt="Live Classroom Feed"
                className="h-full w-full object-cover opacity-75"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              <div className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 text-xs font-bold text-white">
                Mrs. Ananya Verma (Teacher Cam)
              </div>

              {/* Student Self Picture-in-Picture */}
              <div className="absolute bottom-4 right-4 h-28 w-44 rounded-2xl bg-slate-800 border-2 border-blue-500/80 overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200"
                  alt="Aarav Sharma Self Cam"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1 left-2 bg-black/60 text-[9px] font-bold text-white px-1.5 py-0.2 rounded">
                  Aarav (You)
                </span>
              </div>
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-t border-slate-800 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Class Audio &amp; Video Connected</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => triggerToast('Microphone muted')}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-bold"
                >
                  Mute Mic
                </button>
                <button
                  onClick={() => triggerToast('Hand Raised! Mrs. Verma notified.')}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-bold shadow-sm"
                >
                  ✋ Raise Hand
                </button>
                <button
                  onClick={() => setIsLiveClassModalOpen(false)}
                  className="rounded-xl bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-xs font-bold"
                >
                  Leave Class
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: TEACHER ANNOTATED HOMEWORK SHEET & REMARKS VIEWER */}
      {isAnnotationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Teacher Digital Annotations &amp; Remarks Viewer
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Physics Lab Sheet: Newton&apos;s Laws • Graded by Dr. K. Raman
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-black">
                  Score: 18.5 / 20 (92.5%)
                </span>
                <button
                  onClick={() => setIsAnnotationModalOpen(false)}
                  className="rounded-xl p-1.5 hover:bg-slate-200 text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Canvas / Annotated Worksheet Display */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex flex-col items-center">
              <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md border border-slate-200 p-8 space-y-6 relative font-mono text-xs">
                
                {/* Simulated Teacher Sticky Note */}
                <div className="absolute top-6 right-6 w-64 bg-amber-100 border border-amber-300 rounded-xl p-3 shadow-md text-slate-800 rotate-1">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block">Teacher&apos;s Remarks</span>
                  <p className="text-[11px] font-sans mt-1 leading-snug">
                    &quot;Outstanding derivation of action-reaction pairs in Q2! In Q4, remember that vector directions are opposite. Keep up the high standard!&quot;
                  </p>
                  <span className="text-[9px] font-bold text-amber-700 block mt-2 text-right">
                    — Dr. K. Raman (11 Oct 2026)
                  </span>
                </div>

                {/* Worksheet Content Mockup with Red Ink Annotations */}
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-slate-400 block text-[10px]">EDU360 DIGITAL HOMEWORK CORRECTION CANVAS</span>
                  <h2 className="text-base font-bold text-slate-900 font-sans mt-1">
                    Worksheet 9.3: Newton&apos;s Third Law &amp; Momentum Conservation
                  </h2>
                  <span className="text-slate-600 block text-[11px] font-sans">
                    Student: Aarav Sharma (Class 8-A, Roll #14)
                  </span>
                </div>

                {/* Question 1 with Green Tick & Red Annotation */}
                <div className="space-y-2 border-b border-slate-100 pb-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Q1. State Newton&apos;s Third Law and give two real-life examples.</span>
                    <span className="text-emerald-600 font-bold font-sans">✔ [5/5]</span>
                  </div>
                  <p className="text-slate-700 pl-4 border-l-2 border-slate-300">
                    &quot;To every action, there is an equal and opposite reaction.&quot;<br />
                    Examples: 1. Rocket propulsion via exhaust gases. 2. Swimming recoil push.
                  </p>
                  <span className="inline-block text-red-600 font-sans text-[11px] font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    ✍ Clear and complete explanation!
                  </span>
                </div>

                {/* Question 2 with Mark */}
                <div className="space-y-2 border-b border-slate-100 pb-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Q2. Calculate recoil velocity of 2 kg gun firing 0.02 kg bullet at 400 m/s.</span>
                    <span className="text-emerald-600 font-bold font-sans">✔ [5/5]</span>
                  </div>
                  <p className="text-slate-700 pl-4 border-l-2 border-slate-300">
                    m1 * v1 + m2 * v2 = 0<br />
                    2 * V_recoil + 0.02 * 400 = 0<br />
                    2 * V_recoil = -8 =&gt; V_recoil = -4 m/s (opposite direction)
                  </p>
                  <span className="inline-block text-red-600 font-sans text-[11px] font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    ✍ Flawless application of conservation of momentum!
                  </span>
                </div>

                {/* Question 3 with Annotation */}
                <div className="space-y-2 pb-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Q3. Why do action and reaction forces not cancel each other out?</span>
                    <span className="text-amber-600 font-bold font-sans">✔ [3.5/5]</span>
                  </div>
                  <p className="text-slate-700 pl-4 border-l-2 border-slate-300">
                    Because they act in opposite directions.
                  </p>
                  <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 font-sans text-[11px]">
                    <span className="font-bold">❌ Incomplete reasoning:</span> You must specify that they act on <i>different bodies</i>, not on the same object. (-1.5 marks).
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Verified Digital Assessment Archive • EDU360
              </span>
              <button
                onClick={() => setIsAnnotationModalOpen(false)}
                className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm"
              >
                Close Annotated Viewer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: UPLOAD EXTERNAL AWARD CERTIFICATE */}
      {isUploadAwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Upload Award Certificate or Medal
                </h3>
                <span className="text-[11px] text-slate-500">
                  Add verified accolades to your permanent student portfolio
                </span>
              </div>
              <button
                onClick={() => setIsUploadAwardModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAward} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Award / Competition Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Robotics Championship 2026"
                  value={newAwardTitle}
                  onChange={(e) => setNewAwardTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rank / Medal / Position Won
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold Medal (Autonomous Obstacle Course)"
                  value={newAwardEvent}
                  onChange={(e) => setNewAwardEvent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newAwardCategory}
                  onChange={(e) => setNewAwardCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="achievement">External Award / Trophy / Medal</option>
                  <option value="participation">School Event / Inter-House Participation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Certificate Document (PDF / Image)
                </label>
                <input
                  type="file"
                  ref={certificateFileInputRef}
                  onChange={handleCertificateFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <div
                  onClick={() => certificateFileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-800 p-4 text-center bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer transition-colors group"
                >
                  {selectedCertificateFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {selectedCertificateFile.name}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                          Ready to upload &bull; {(selectedCertificateFile.size / 1024).toFixed(1)} KB (Click to change)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-6 w-6 text-purple-600 dark:text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">
                        Click to browse or select certificate file
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        PDF, PNG, JPG up to 10MB
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description / Organizer Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Details of the issuing organization and assessment criteria..."
                  value={newAwardDesc}
                  onChange={(e) => setNewAwardDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadAwardModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAward || !newAwardTitle.trim()}
                  className="rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white px-4 py-2 font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingAward ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>Submit for School Stamp</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CERTIFICATE LIGHTBOX PREVIEW */}
      {selectedCertificatePreview && (() => {
        const isPdf = Boolean(
          selectedCertificateFileName?.toLowerCase().endsWith('.pdf') ||
          selectedCertificatePreview.toLowerCase().endsWith('.pdf') ||
          selectedCertificatePreview.includes('application/pdf')
        );

        const isImage = Boolean(
          !isPdf && (
            selectedCertificatePreview.startsWith('blob:') ||
            selectedCertificatePreview.startsWith('data:image/') ||
            /\.(png|jpe?g|webp|gif|svg)$/i.test(selectedCertificatePreview) ||
            (selectedCertificateFileName && /\.(png|jpe?g|webp|gif|svg)$/i.test(selectedCertificateFileName))
          )
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Verified Student Credential Preview
                  </span>
                  {selectedCertificateFileName && (
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                      ({selectedCertificateFileName})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={selectedCertificatePreview}
                    download={selectedCertificateFileName || 'verified-certificate'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download Certificate</span>
                    <span className="sm:hidden">Download</span>
                  </a>
                  <button
                    onClick={() => {
                      setSelectedCertificatePreview(null);
                      setSelectedCertificateFileName(null);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body / Viewer */}
              <div className="p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 flex-1 overflow-y-auto flex items-center justify-center min-h-[350px]">
                {isPdf ? (
                  <div className="w-full flex flex-col items-center">
                    <iframe
                      src={selectedCertificatePreview}
                      className="w-full h-[550px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                      title="Certificate Document"
                    />
                    <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                      If the document does not display in your browser preview,{' '}
                      <a
                        href={selectedCertificatePreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 underline font-semibold"
                      >
                        click here to view directly
                      </a>.
                    </p>
                  </div>
                ) : isImage ? (
                  <div className="flex flex-col items-center justify-center w-full">
                    <img
                      src={selectedCertificatePreview}
                      alt="Uploaded Certificate"
                      className="max-h-[70vh] max-w-full object-contain rounded-xl mx-auto shadow-sm"
                    />
                  </div>
                ) : (
                  /* Fallback Mock Certificate Card */
                  <div className="w-full max-w-lg aspect-[1.414/1] bg-white rounded-2xl shadow-lg border-4 border-purple-200 p-6 flex flex-col justify-between text-center relative overflow-hidden">
                    <div className="absolute top-2 right-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Official School Seal Affixed
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-[10px] tracking-widest uppercase font-bold text-purple-700">CERTIFICATE OF DISTINCTION</span>
                      <h3 className="text-lg font-black text-slate-900 mt-2">AARAV SHARMA</h3>
                      <p className="text-xs text-slate-600 mt-1">Class 8-A • DPS Silicon Oasis</p>
                    </div>

                    <div className="my-2 border-y border-slate-100 py-3">
                      <p className="text-xs font-serif italic text-slate-700">
                        &quot;Awarded for exceptional academic standing, analytical reasoning, and state-wide honor in mathematics and science outcomes.&quot;
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-200 pt-2 font-mono">
                      <span>ID: EDU360-CERT-2026-8812</span>
                      <span>Digitally Signed: Oct 2026</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <a
                  href={selectedCertificatePreview}
                  download={selectedCertificateFileName || 'verified-certificate'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Certificate</span>
                </a>
                <button
                  onClick={() => {
                    setSelectedCertificatePreview(null);
                    setSelectedCertificateFileName(null);
                  }}
                  className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 5: VIDEO RECORDING PLAYER */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-[#0F172A] rounded-3xl overflow-hidden shadow-2xl border border-slate-700 text-white">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded">
                  {activeVideoModal.subject}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white mt-1">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src={activeVideoModal.video_url}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Duration: {activeVideoModal.duration} • Instructor: {activeVideoModal.teacher_name}
              </span>
              <button
                onClick={() => handleDownloadNotes(activeVideoModal.subject, activeVideoModal.chapter)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Chapter Notes (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Proctoring & Online CBT Examination Modal */}
      <OnlineExamModal
        isOpen={isOnlineExamOpen}
        onClose={() => setIsOnlineExamOpen(false)}
        examTitle={`${onlineExamSubject}: ${onlineExamTopic}`}
        subject={onlineExamSubject}
        durationMinutes={onlineExamDuration}
        studentName={user?.name || 'Aarav Sharma'}
        onSubmitted={({ wordsCount }) => {
          setIsOnlineExamOpen(false);
          triggerToast(`✓ Examination submitted successfully! ${wordsCount} words recorded under academic audit vault.`);
        }}
      />

      {/* MODAL: CREATE HOMEWORK OR PROJECT ASSIGNMENT */}
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Create Academic Task
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Define workstream, deadline, and compliance weightage
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="rounded-xl p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTask} className="p-6 overflow-y-auto space-y-4">
              {/* Workstream Type Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Select Work Stream Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskType('DAILY_HOMEWORK');
                      setNewTaskWeightage('Daily Practice (5 pts)');
                    }}
                    className={`rounded-xl p-3 border-2 text-left transition-all cursor-pointer ${
                      newTaskType === 'DAILY_HOMEWORK'
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <CalendarDays className="h-4 w-4 text-blue-600" />
                      <span>Daily Homework</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Short-term subject exercises due next session.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskType('ASSIGNMENT');
                      setNewTaskWeightage('Term Project (25%)');
                    }}
                    className={`rounded-xl p-3 border-2 text-left transition-all cursor-pointer ${
                      newTaskType === 'ASSIGNMENT'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Layers className="h-4 w-4 text-indigo-600" />
                      <span>Long-Term Assignment</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Multi-week capstone projects with progress bars.
                    </p>
                  </button>
                </div>
              </div>

              {/* Subject & Max Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject
                  </label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    value={newTaskMarks}
                    onChange={(e) => setNewTaskMarks(Number(e.target.value))}
                    min={5}
                    max={100}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 5 Practice Worksheet"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Time Cutoff
                  </label>
                  <input
                    type="time"
                    value={newTaskDueTime}
                    onChange={(e) => setNewTaskDueTime(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Weightage & Reference Resource */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Grading Weightage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Daily Practice (5 pts)"
                    value={newTaskWeightage}
                    onChange={(e) => setNewTaskWeightage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Resource / Rubric URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /samples/rubric.pdf"
                    value={newTaskResourceUrl}
                    onChange={(e) => setNewTaskResourceUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description &amp; Problem Statements
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed instructions or textbook questions..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewTask}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingNewTask ? 'Creating...' : 'Save & Publish Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMISSION DROPZONE & LATE POLICY AUDIT */}
      {selectedTaskForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-sm ${
                  selectedTaskForSubmit.status === 'BACKLOG' || (selectedTaskForSubmit.due_date && selectedTaskForSubmit.due_date < '2026-10-17')
                    ? 'bg-red-600'
                    : 'bg-blue-600'
                }`}>
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedTaskForSubmit.status === 'BACKLOG' || (selectedTaskForSubmit.due_date && selectedTaskForSubmit.due_date < '2026-10-17')
                      ? 'Late Submission Dropzone'
                      : 'Submit Homework Worksheet'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedTaskForSubmit.subject} • #{selectedTaskForSubmit.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTaskForSubmit(null);
                  setSelectedFileForUpload(null);
                }}
                className="rounded-xl p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedTaskForSubmit.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>Due: {selectedTaskForSubmit.due_date} at {selectedTaskForSubmit.due_time}</span>
                  <span>•</span>
                  <span>Max Marks: {selectedTaskForSubmit.max_marks}</span>
                </div>
              </div>

              {/* Late Submission Warning Banner */}
              {(selectedTaskForSubmit.status === 'BACKLOG' || (selectedTaskForSubmit.due_date && selectedTaskForSubmit.due_date < '2026-10-17')) && (
                <div className="rounded-2xl border-2 border-red-500/50 bg-red-50 dark:bg-red-950/50 p-4 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 font-black text-red-800 dark:text-red-300">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>LATE SUBMISSION AUDIT WARNING</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                    The official deadline for this assignment was <strong>{selectedTaskForSubmit.due_date} at {selectedTaskForSubmit.due_time}</strong>.
                    Submitting this worksheet now will transition the status to <strong>SUBMITTED</strong>, but will preserve an immutable <strong>late_submission: true</strong> audit entry on your academic ledger and the Parent Focus Table.
                  </p>
                </div>
              )}

              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 p-6 text-center transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleHomeworkFileSelect}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.zip"
                  className="hidden"
                />
                <Upload className="mx-auto h-8 w-8 text-slate-400 group-hover:text-blue-600 transition-colors mb-2" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedFileForUpload ? selectedFileForUpload.name : 'Click to select or drag & drop worksheet PDF or scan'}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports PDF, PNG, JPG, DOCX, ZIP (Max 25 MB)
                </p>
                {selectedFileForUpload && (
                  <span className="inline-block mt-2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                    File selected: {(selectedFileForUpload.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTaskForSubmit(null);
                    setSelectedFileForUpload(null);
                  }}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUploadingHomework}
                  onClick={() => {
                    const isLate = selectedTaskForSubmit.status === 'BACKLOG' || Boolean(selectedTaskForSubmit.due_date && selectedTaskForSubmit.due_date < '2026-10-17');
                    handleSubmitTaskWorksheet(selectedTaskForSubmit, isLate);
                  }}
                  className={`rounded-xl font-bold text-xs px-5 py-2 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedTaskForSubmit.status === 'BACKLOG' || (selectedTaskForSubmit.due_date && selectedTaskForSubmit.due_date < '2026-10-17')
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isUploadingHomework ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Uploading Submission...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{selectedTaskForSubmit.status === 'BACKLOG' ? 'Confirm Late Submission' : 'Confirm Submission'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TASK DETAILS & AUDIT INSPECTOR */}
      {viewingTaskDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold">
                  {viewingTaskDetails.subject}
                </span>
                <span className="text-xs text-slate-400">
                  Task #{viewingTaskDetails.id}
                </span>
              </div>
              <button
                onClick={() => setViewingTaskDetails(null)}
                className="rounded-xl p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {viewingTaskDetails.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {viewingTaskDetails.description}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Work Stream</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingTaskDetails.task_type === 'ASSIGNMENT' ? 'Long-Term Assignment' : 'Daily Homework'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingTaskDetails.status} {viewingTaskDetails.late_submission ? '(Late Submission)' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Deadline</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingTaskDetails.due_date} at {viewingTaskDetails.due_time}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Max Marks / Weight</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewingTaskDetails.max_marks} pts ({viewingTaskDetails.weightage || 'Regular'})
                  </span>
                </div>
              </div>

              {/* Teacher Remarks / Instructions */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Instructor Information</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assigned by <strong>{viewingTaskDetails.teacher_name}</strong> for Class 8-A.
                </p>
              </div>

              {viewingTaskDetails.resource_url && (
                <div className="pt-1">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      triggerToast(`Downloading: ${viewingTaskDetails.resource_url}`);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Reference Attachment / Rubric</span>
                  </a>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingTaskDetails(null)}
                  className="rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* OFFICIAL ADMIT CARD / HALL TICKET MODAL               */}
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
                    Document Ref: EDU-ADM-{admitCardData?.roll_number || '14'}-2026
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
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
                      {admitCardData?.student_name || user?.name || 'Aarav Sharma'}
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

                {/* Mandatory Candidate Instructions */}
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-1.5 text-[11px] text-amber-900 dark:text-amber-200">
                  <span className="font-bold flex items-center gap-1.5 text-xs text-amber-950 dark:text-amber-300">
                    <ShieldCheck className="h-4 w-4" />
                    Mandatory Examination Hall Instructions
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Candidates must report at least 30 minutes before commencement. Entry closes strictly at 08:50 AM.</li>
                    <li>Possession of smartphones, smartwatches, calculators or unauthorized notes is strictly punishable under CBSE Unfair Means Regulations.</li>
                    <li>Check that the question paper code matches your answer sheet cover barcode before writing.</li>
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

    </RoleGuard>
  );
}

export default function StudentPage() {
  const { user, logout } = useAuth();
  const [forceJunior, setForceJunior] = useState<boolean | null>(null);

  // Auto-detect junior K-5 grade tier
  const isJunior = forceJunior !== null
    ? forceJunior
    : Boolean(
        user?.is_junior_k5 === true ||
        user?.grade_tier === 'k5' ||
        user?.email?.toLowerCase().includes('junior') ||
        user?.name?.toLowerCase().includes('junior')
      );

  if (isJunior) {
    const juniorUser: User = user || {
      id: 5,
      name: 'Aarav Kumar',
      email: 'aarav.junior@student.edu360.internal',
      role: 'student',
      school_code: 'EDU-GLOBAL-360',
      avatar: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150',
      grade_tier: 'k5',
      is_junior_k5: true,
      student_id: 6
    };

    return (
      <RoleGuard allowedRole="student">
        <JuniorStudentDashboard
          user={juniorUser}
          onSwitchToSecondary={() => setForceJunior(false)}
          onLogout={logout}
        />
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRole="student">
      <div className="relative">
        {/* Floating Quick Jumper to Junior K-5 Experience */}
        <div className="fixed bottom-5 right-5 z-50">
          <button
            onClick={() => setForceJunior(true)}
            className="rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 hover:from-amber-300 hover:to-indigo-500 text-white font-black text-xs px-4 py-2.5 shadow-2xl border-2 border-white flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            title="Click to preview the EDU360 Junior K-5 Gamified Dashboard"
          >
            <span className="text-base select-none">🦊</span>
            <span>Switch to Junior K-5 View</span>
          </button>
        </div>
        <StandardStudentDashboard onSwitchToJunior={() => setForceJunior(true)} />
      </div>
    </RoleGuard>
  );
}
