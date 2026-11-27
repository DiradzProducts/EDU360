'use client';
import { Icon3D } from '@/components/ui/icon-3d';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ArrowLeft,
  HelpCircle,
  Printer,
  CalendarCheck2,
  Plus,
  Layers,
  ExternalLink,
  FileSpreadsheet,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { api } from '@/lib/api';
import { ClockProvider } from '@/lib/clock';
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
  ReportCardItem,
  ChapterTimestamp,
  ReExamRequestItem,
  ExamScheduleItem,
  SubstitutionSlot
} from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { RoleGuard } from '@/components/role-guard';
import { useTheme } from '@/lib/theme-context';
import { FocusTableView } from '@/components/focus-table-view';
import { StudentRemedialView } from '@/components/student-remedial-view';
import { Footer } from '@/components/footer';
import { JuniorStudentDashboard } from '@/components/junior/JuniorStudentDashboard';
import { OnlineExamModal } from '@/components/online-exam-modal';
import { StudentExamPdfUploadModal } from '@/components/exam/student-pdf-upload-modal';
import { EvaluationKeyModal } from '@/components/evaluation-key-modal';
import { UnifiedSISView } from '@/components/unified-sis-view';
import { downloadStudyNotesFile, downloadMarksMemoFile } from '@/lib/export-utils';
import { EduVideoConferenceModal } from '@/components/livekit/edu-video-conference-modal';

type NavSection = 
  | 'dashboard' 
  | 'live_classes' 
  | 'recordings'
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
    title: 'Annual Day in 5 Days — Stage Committees Active',
    subtitle: 'Auditorium rehearsals active for student choir and stage tech coordination committees.',
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
    subtitle: 'Phase 2 regional robotics and optics practicals registration now active for qualified students.',
    actionLabel: 'BULLETIN ACTION',
    actionTitle: 'Optics Lab Practice & Kits',
    ctaText: 'View Olympiad Details',
    targetNav: 'portfolio',
    gradient: 'from-[#1E1B4B] to-[#0A0F24]'
  },
  {
    id: 3,
    badge: 'Academic Notice',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    title: 'My Focus Table: Targeted Academic Progress',
    subtitle: 'Review teacher recommendations, practice worksheets, and personalized learning milestones.',
    actionLabel: 'BULLETIN ACTION',
    actionTitle: 'Complete Focus Exercises',
    ctaText: 'Open Focus Table Plan',
    targetNav: 'focus_table',
    gradient: 'from-[#0F172A] to-[#1E293B]'
  },
  {
    id: 4,
    badge: 'CBSE Examination',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    title: 'CBSE Term 1 Model Examination Schedule',
    subtitle: 'Official examination timetables, seating allotments, and admit cards generated for Hall B.',
    actionLabel: 'BULLETIN ACTION',
    actionTitle: 'Download Exam Admit Card PDF',
    ctaText: 'View Exam Schedule',
    targetNav: 'exams',
    gradient: 'from-[#141E33] to-[#0B132B]'
  }
];


function StandardStudentDashboard() {
  const { user, logout } = useAuth();
  const currentStudentId = user?.student_id || user?.id || 1;
  const isDemoStudent = user?.name === 'Aarav Sharma' || (user?.student_id === 1 && !user?.name);
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
  const [serverCalendarEvents, setServerCalendarEvents] = useState<any[]>([]);

  // Online Exam Modal State
  const [isOnlineExamOpen, setIsOnlineExamOpen] = useState(false);
  const [onlineExamSubject, setOnlineExamSubject] = useState('Mathematics');
  const [onlineExamTopic, setOnlineExamTopic] = useState('Quadratic Equations & Polynomials');
  const [onlineExamDuration, setOnlineExamDuration] = useState(20);
  const [onlineExamPrompt, setOnlineExamPrompt] = useState<string | undefined>(undefined);
  const [onlineExamMaxMarks, setOnlineExamMaxMarks] = useState<number>(20);
  const [onlineExamMode, setOnlineExamMode] = useState<'MODE_CBT' | 'MODE_HYBRID_SCAN'>('MODE_HYBRID_SCAN');
  const [studentExamSchedules, setStudentExamSchedules] = useState<ExamScheduleItem[]>([]);
  const [dailySubstitutions, setDailySubstitutions] = useState<SubstitutionSlot[]>([]);
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState<boolean>(false);
  const [pdfUploadData, setPdfUploadData] = useState<{
    sealCode: string;
    subject: string;
    examTitle: string;
  } | null>(null);
  const [examSubmissionState, setExamSubmissionState] = useState<'not_started' | 'upload_pending' | 'completed'>('not_started');
  const [examUploadDetails, setExamUploadDetails] = useState<{
    fileName?: string;
    pageCount?: number;
    uploadedAt?: string;
    sealCode?: string;
    fileSize?: string;
    pdfUrl?: string;
    uploadDurationSeconds?: number;
  } | null>(null);
  const [newExamStudentAlert, setNewExamStudentAlert] = useState<{
    title: string;
    subject: string;
    className: string;
    invigilator: string;
    date: string;
    time: string;
    hall: string;
  } | null>(null);

  // ── Dynamic Real-Time Clock & Timetable Lifecycle Engine ──
  const [currentSystemTime, setCurrentSystemTime] = useState<Date>(() => new Date('2026-01-01T08:30:00'));

  useEffect(() => {
    setCurrentSystemTime(new Date());
    const timer = setInterval(() => {
      setCurrentSystemTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const currentMinutes = useMemo(() => {
    return currentSystemTime.getHours() * 60 + currentSystemTime.getMinutes();
  }, [currentSystemTime]);

  const SCHOOL_PERIODS = useMemo(() => {
    const basePeriods = [
      { id: 1, periodNum: 'P1', name: 'Physics: Kinematics & Laws', topic: 'Kinematics & Laws', subject: 'Physics', teacher: 'Dr. K. Raman', faculty: 'Dr. K. Raman', room: 'Lab 2', startTime: '08:30', endTime: '09:15', timing: '08:30 – 09:15 AM', timeRange: '08:30 – 09:15 AM', startMin: 510, endMin: 555 },
      { id: 2, periodNum: 'P2', name: 'Chemistry: Acids & Bases', topic: 'Acids & Bases', subject: 'Chemistry', teacher: 'Mrs. S. Sen', faculty: 'Mrs. S. Sen', room: 'Room 204', startTime: '09:15', endTime: '10:00', timing: '09:15 – 10:00 AM', timeRange: '09:15 – 10:00 AM', startMin: 555, endMin: 600 },
      { id: 3, periodNum: 'P3', name: 'Mathematics: Quadratic Equations', topic: 'Quadratic Equations', subject: 'Mathematics', teacher: 'Mrs. Ananya Verma', faculty: 'Mrs. Ananya Verma', room: 'Room 204 & Stream', startTime: '10:30', endTime: '11:15', timing: '10:30 – 11:15 AM', timeRange: '10:30 – 11:15 AM', startMin: 630, endMin: 675 },
      { id: 4, periodNum: 'P4', name: 'Computer Science: Python Logic', topic: 'Python Logic', subject: 'Computer Science', teacher: 'Mr. V. Nair', faculty: 'Mr. V. Nair', room: 'Lab 1', startTime: '11:15', endTime: '12:00', timing: '11:15 – 12:00 PM', timeRange: '11:15 – 12:00 PM', startMin: 675, endMin: 720 },
      { id: 5, periodNum: 'P5', name: 'Social Science: Indian Constitution', topic: 'Indian Constitution', subject: 'Social Science', teacher: 'Ms. P. Roy', faculty: 'Ms. P. Roy', room: 'Room 204', startTime: '13:00', endTime: '13:45', timing: '01:00 – 01:45 PM', timeRange: '01:00 – 01:45 PM', startMin: 780, endMin: 825 },
      { id: 6, periodNum: 'P6', name: 'Western Choir Rehearsal', topic: 'Choral Harmonization', subject: 'Music / Co-curricular', teacher: 'Music Faculty', faculty: 'Music Faculty', room: 'Auditorium', startTime: '13:45', endTime: '14:30', timing: '01:45 – 02:30 PM', timeRange: '01:45 – 02:30 PM', startMin: 825, endMin: 870 },
    ];
    return basePeriods.map(p => {
      const sub = dailySubstitutions.find(s =>
        (s.status === 'Assigned' || s.status === 'Completed') &&
        s.period_number === p.id &&
        s.substitute_teacher_name
      );
      if (sub && sub.substitute_teacher_name) {
        return {
          ...p,
          teacher: `${sub.substitute_teacher_name} (Proxy)`,
          faculty: `${sub.substitute_teacher_name} (Proxy Cover)`,
          name: `${p.subject}: ${p.topic} [Proxy: ${sub.substitute_teacher_name}]`,
          is_proxy: true,
          absent_teacher: sub.absent_teacher_name
        };
      }
      return p;
    });
  }, [dailySubstitutions]);

  const evaluatedPeriods = useMemo(() => {
    return SCHOOL_PERIODS.map(p => {
      let status: 'completed' | 'live' | 'upcoming' = 'upcoming';
      if (currentMinutes >= p.endMin) {
        status = 'completed';
      } else if (currentMinutes >= p.startMin && currentMinutes < p.endMin) {
        status = 'live';
      } else {
        status = 'upcoming';
      }
      return { ...p, status };
    });
  }, [SCHOOL_PERIODS, currentMinutes]);

  const activePeriod = useMemo(() => {
    return evaluatedPeriods.find(p => p.status === 'live');
  }, [evaluatedPeriods]);

  const isSchoolConcluded = currentMinutes >= 870; // after 2:30 PM / 3:30 PM
  const isBeforeSchool = currentMinutes < 510;    // before 8:30 AM
  const isMorningBreak = currentMinutes >= 600 && currentMinutes < 630; // 10:00 - 10:30 AM
  const isLunchBreak = currentMinutes >= 720 && currentMinutes < 780;   // 12:00 - 01:00 PM

  // Live Exam Check: ONLY mounts if an exam is scheduled for today, lifecycle is LIVE/COMMENCED, and not submitted
  const liveTodayExam = useMemo(() => {
    if (!studentExamSchedules || studentExamSchedules.length === 0) return null;
    if (examSubmissionState === 'completed') return null;

    const todayYMD = currentSystemTime.toISOString().split('T')[0];

    for (const s of studentExamSchedules) {
      const cleanDate = (s.exam_date || '').trim();
      const isToday = cleanDate === todayYMD || cleanDate.toLowerCase().includes('today') || cleanDate.toLowerCase().includes('live');
      if (!isToday) continue;

      if ((s as any).session_status === 'CONCLUDED' || s.lifecycle_status === 'CONCLUDED') continue;
      if ((s as any).session_status === 'SCHEDULED') continue;
      if (s.lifecycle_status === 'LIVE' || (s as any).session_status === 'COMMENCED') {
        return s;
      }
    }
    return null;
  }, [studentExamSchedules, examSubmissionState, currentSystemTime]);

  const isExamTimeExpired = (timeStr?: string, examDate?: string): boolean => {
    if (!timeStr) return false;
    try {
      const parts = timeStr.split('-');
      const endStr = (parts[1] || parts[0]).trim();
      const match = endStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const meridiem = match[3].toUpperCase();
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        const now = new Date();
        const examEndMins = hours * 60 + minutes;
        const currentMins = now.getHours() * 60 + now.getMinutes();
        if (examDate && examDate !== 'Today') {
          const examD = new Date(examDate);
          if (!isNaN(examD.getTime())) {
            const today = new Date();
            today.setHours(0,0,0,0);
            examD.setHours(0,0,0,0);
            if (today.getTime() > examD.getTime()) return true;
            if (today.getTime() < examD.getTime()) return false;
          }
        }
        return currentMins >= examEndMins;
      }
    } catch {}
    return false;
  };

  const handleDismissExamAlert = () => {
    setNewExamStudentAlert(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('edu360_active_exam_schedule');
        sessionStorage.setItem('edu360_exam_dismissed_active', 'true');
      } catch {}
    }
  };

  // Dynamic pop-up trigger when an active commenced exam is detected
  useEffect(() => {
    if (examSubmissionState === 'completed') {
      if (newExamStudentAlert) setNewExamStudentAlert(null);
      return;
    }
    const liveSched = studentExamSchedules.find(s => 
      ((s as any).session_status === 'COMMENCED' || s.lifecycle_status === 'LIVE') &&
      (s as any).session_status !== 'CONCLUDED' && 
      s.lifecycle_status !== 'CONCLUDED' &&
      !isExamTimeExpired(`${s.start_time || ''} - ${s.end_time || ''}`, s.exam_date)
    );
    if (!liveSched) {
      if (newExamStudentAlert) {
        setNewExamStudentAlert(null);
      }
      return;
    }
    if (typeof window !== 'undefined') {
      const dismissedKey = `edu360_exam_dismissed_${liveSched.id}`;
      if (!sessionStorage.getItem(dismissedKey) && !sessionStorage.getItem('edu360_exam_dismissed_active')) {
        setNewExamStudentAlert({
          title: liveSched.title || `${liveSched.subject} Examination`,
          subject: liveSched.subject || 'Assessment',
          className: liveSched.class_name || 'Class 8-B',
          invigilator: liveSched.chief_invigilator_name || 'Assigned Invigilator',
          date: liveSched.exam_date || 'Today',
          time: `${liveSched.start_time || ''} - ${liveSched.end_time || ''}`,
          hall: liveSched.hall_name || 'Virtual Exam Hall'
        });
      }
    }
  }, [studentExamSchedules, examSubmissionState, newExamStudentAlert]);

  // Announcement Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  // Real-time coordinator exam broadcast listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncSchedule = () => {
      try {
        const stored = localStorage.getItem('edu360_active_exam_schedule');
        if (stored) {
          const parsed = JSON.parse(stored);
          const expired = isExamTimeExpired(parsed?.time, parsed?.date);
          const concluded = parsed?.session_status === 'CONCLUDED' || parsed?.lifecycle_status === 'CONCLUDED';
          const dismissed = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('edu360_exam_dismissed_active') === 'true';
          if (expired || concluded || dismissed || examSubmissionState === 'completed') {
            localStorage.removeItem('edu360_active_exam_schedule');
            setNewExamStudentAlert(null);
          } else {
            setNewExamStudentAlert(parsed);
          }
        }
      } catch {}

      try {
        const storedSubState = localStorage.getItem('edu360_exam_submission_state') as 'not_started' | 'upload_pending' | 'completed' | null;
        if (storedSubState) {
          setExamSubmissionState(storedSubState);
        }
        const storedUpload = localStorage.getItem('edu360_exam_upload_details');
        if (storedUpload) {
          setExamUploadDetails(JSON.parse(storedUpload));
        } else {
          const storedList = JSON.parse(localStorage.getItem('edu360_exam_submissions') || '[]');
          const aarav = storedList.find((s: any) => s.candidateId === 1 || s.rollNo === '14' || s.studentName === 'Aarav Sharma');
          if (aarav) {
            setExamSubmissionState('completed');
            setExamUploadDetails(aarav);
          }
        }
      } catch {}
    };
    syncSchedule();
    window.addEventListener('storage', (e) => {
      syncSchedule();
      if (e.key === 'edu360_exam_submission_state' && e.newValue) {
        setExamSubmissionState(e.newValue as any);
      }
      if (e.key === 'edu360_exam_upload_details' && e.newValue) {
        try {
          setExamUploadDetails(JSON.parse(e.newValue));
        } catch {}
      }
    });

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;
        if (data.type === 'EXAM_COMMENCED') {
          if (examSubmissionState !== 'completed' && !isExamTimeExpired(data.time, data.date)) {
            setNewExamStudentAlert({
              title: data.title || `${data.subject || 'Mathematics'} Examination`,
              subject: data.subject || 'Mathematics',
              className: data.className || 'Class 8-B',
              invigilator: data.invigilator || 'Mrs. Ananya Verma',
              date: data.date || 'Today',
              time: data.time || '09:00 AM - 12:00 PM',
              hall: data.hall || 'Virtual Room Alpha (Camera AI)'
            });
          }
        } else if (data.type === 'EXAM_SCHEDULED') {
          triggerToast(`🎫 Official Admit Card Released: ${data.subject || 'Mathematics'} Examination scheduled for ${data.className || 'Class 8-B'}. Hall Ticket #14 is active.`);
        } else if (data.type === 'EXAM_ENDED_BY_TEACHER' || data.type === 'EXAM_CONCLUDED') {
          handleDismissExamAlert();
        } else if (data.type === 'STUDENT_SUBMITTED') {
          setExamSubmissionState('upload_pending');
        } else if (data.type === 'STUDENT_SCRIPT_UPLOADED') {
          setExamSubmissionState('completed');
          setExamUploadDetails(data);
          handleDismissExamAlert();
        }
      };
    } catch {}

    // Multi-device WebSocket listener
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      const studentClass = user?.class_name ? `exam-room-${String(user.class_name).toLowerCase().replace(/[^a-z0-9]/g, '')}` : 'exam-room-class8b';
      ws = new WebSocket(`${protocol}//${host}:8000/api/exams/ws/surveillance/${studentClass}`);
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.type === 'EXAM_COMMENCED') {
            if (examSubmissionState !== 'completed' && !isExamTimeExpired(data.time, data.date)) {
              setNewExamStudentAlert(data);
            }
          } else if (data && data.type === 'EXAM_SCHEDULED') {
            triggerToast(`🎫 Official Admit Card Released: ${data.subject || 'Mathematics'} Examination scheduled! Hall Ticket #14 active.`);
          } else if (data && (data.type === 'EXAM_ENDED_BY_TEACHER' || data.type === 'EXAM_CONCLUDED')) {
            handleDismissExamAlert();
          } else if (data && data.type === 'STUDENT_SUBMITTED') {
            setExamSubmissionState('upload_pending');
          } else if (data && data.type === 'STUDENT_SCRIPT_UPLOADED') {
            setExamSubmissionState('completed');
            setExamUploadDetails(data);
            handleDismissExamAlert();
          }
        } catch {}
      };
    } catch {}

    return () => {
      window.removeEventListener('storage', syncSchedule);
      if (channel) channel.close();
      if (ws) ws.close();
    };
  }, []);

  // Live Class Simulation State
  const [isLiveClassModalOpen, setIsLiveClassModalOpen] = useState(false);
  const [hasJoinedLive, setHasJoinedLive] = useState(false);
  const [attendanceTimestamp, setAttendanceTimestamp] = useState<string | null>(null);
  const [liveRoomStatus, setLiveRoomStatus] = useState<any>(null);

  useEffect(() => {
    async function checkLiveStatus() {
      try {
        const st = await api.getLiveRoomStatus('class-8b-mathematics');
        if (st) setLiveRoomStatus(st);
      } catch {}
    }
    checkLiveStatus();
    ClockProvider.syncWithBackend().catch(() => {});
    const iv = setInterval(checkLiveStatus, 3000);
    return () => clearInterval(iv);
  }, []);

  // Homework & Annotations State
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [studentHomeworkList, setStudentHomeworkList] = useState<Homework[]>([]);
  const [homeworkWorkstream, setHomeworkWorkstream] = useState<'daily' | 'assignments'>('daily');
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => ClockProvider.getTodayKey());
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
  const [reExamRequests, setReExamRequests] = useState<ReExamRequestItem[]>([]);

  // New Task Form Inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Mathematics');
  const [newTaskType, setNewTaskType] = useState<TaskType>('DAILY_HOMEWORK');
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => ClockProvider.getTodayKey());
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
  const [activeRecordingChapterIndex, setActiveRecordingChapterIndex] = useState<number>(0);
  const [activeRecordingDetail, setActiveRecordingDetail] = useState<ClassRecording | null>(null);

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
  const [examAnswerFileName, setExamAnswerFileName] = useState<string>('Exam_Answer_Paper.pdf');
  const [examAnswerFileUrl, setExamAnswerFileUrl] = useState<string>('/samples/math_exam_sample.svg');
  const [examStudentNotes, setExamStudentNotes] = useState<string>('');
  const [isSubmittingExamPaper, setIsSubmittingExamPaper] = useState<boolean>(false);
  const [studentReportCard, setStudentReportCard] = useState<ReportCardItem | null>(null);
  const [studentSubmittedExams, setStudentSubmittedExams] = useState<Record<number, { fileName: string; submittedAt: string; marks?: number; pct?: number; feedback?: string; weak_concept?: string; is_remedial?: boolean }>>({});

  // Admit Card (Hall Ticket) Modal State
  const [showAdmitCardModal, setShowAdmitCardModal] = useState(false);
  const [isEvalKeyOpen, setIsEvalKeyOpen] = useState(false);

  // Exams Sub-Tab Navigation & Recordings Search State
  const [examSubTab, setExamSubTab] = useState<'timetable' | 'results' | 'report_card'>('timetable');
  const [recordingsSearch, setRecordingsSearch] = useState('');
  const [admitCardData, setAdmitCardData] = useState<any>(null);
  const [admitCardHold, setAdmitCardHold] = useState<string | null>(null);
  const [loadingAdmitCard, setLoadingAdmitCard] = useState(false);

  const handleOpenAdmitCard = async () => {
    setLoadingAdmitCard(true);
    setShowAdmitCardModal(true);
    try {
      const studentId = currentStudentId;
      const res = await api.getStudentHallTicket(studentId);
      if (res && res.is_on_hold) {
        setAdmitCardHold(res.hold_reason || 'Institutional Fee Hold Active');
        setAdmitCardData(null);
      } else if (res && (res.ticket || res.hall_ticket)) {
        setAdmitCardHold(null);
        setAdmitCardData(res.ticket || res.hall_ticket);
      } else {
        setAdmitCardHold(null);
      }
    } catch (err) {
      console.error('Failed to load hall ticket', err);
    } finally {
      setLoadingAdmitCard(false);
    }
  };

  const loadDescriptiveExams = async () => {
    try {
      const res = await api.listExams();
      if (res && res.success && res.exams) {
        setDescriptiveExams(res.exams);
      }
      const examList = (res && res.success && res.exams && res.exams.length > 0) ? res.exams : [{ id: 1 }, { id: 2 }];
      for (const ex of examList) {
        const exId = ex.id;
        try {
          const subRes = await api.getExamSubmissions(exId);
          if (subRes && subRes.success && subRes.submissions) {
            const mySub = subRes.submissions.find((s: any) => s.student_id === currentStudentId);
            if (mySub) {
              setStudentSubmittedExams(prev => ({
                ...prev,
                [exId]: {
                  fileName: mySub.paper_file_name || 'Exam_Answer_Paper.pdf',
                  submittedAt: mySub.submitted_at || '14 Oct 2026',
                  marks: mySub.marks_obtained !== null && mySub.marks_obtained !== undefined ? mySub.marks_obtained : undefined,
                  pct: mySub.percentage !== null && mySub.percentage !== undefined ? mySub.percentage : undefined,
                  feedback: mySub.teacher_feedback || '',
                  weak_concept: mySub.weak_concept || '',
                  is_remedial: mySub.is_remedial_target
                }
              }));
            }
          }
        } catch {}
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
        student_id: currentStudentId,
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
      const updatedSub = await api.submitHomework(task.id, currentStudentId, fileUrl);
      setSubmission(updatedSub);
      setHomeworkSubmittedSuccess(true);
      setStudentHomeworkList(prev => prev.map(item => item.id === task.id ? {
        ...item,
        status: 'SUBMITTED',
        late_submission: isLate || Boolean(updatedSub.late_submission)
      } : item));
      
      const comp = await api.getAcademicCompliance(currentStudentId);
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
        api.getStudentHomework(undefined, undefined, undefined, currentStudentId),
        api.getAcademicCompliance(currentStudentId)
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
        const [recRes, portRes, subRes, docsRes, hwRes, compRes, rcRes, reExamRes, schedRes, calEvents, subsRes] = await Promise.all([
          api.getStudentRecordings(currentStudentId),
          api.getPortfolio(currentStudentId),
          api.getSubmission(currentStudentId),
          api.getStudentDocuments(currentStudentId),
          api.getStudentHomework(undefined, undefined, undefined, currentStudentId),
          api.getAcademicCompliance(currentStudentId),
          api.getReportCards({ student_id: currentStudentId }),
          api.getReExamRequests(currentStudentId),
          api.getExamSchedules(user?.class_name, user?.section),
          api.getCalendarEvents(),
          api.getSubstitutions()
        ]);
        if (schedRes && Array.isArray(schedRes)) {
          setStudentExamSchedules(schedRes);
        }
        if (calEvents && Array.isArray(calEvents)) {
          setServerCalendarEvents(calEvents);
        }
        if (subsRes && Array.isArray(subsRes)) {
          setDailySubstitutions(subsRes);
        }
        setReExamRequests(reExamRes || []);
        setRecordings(recRes || []);
        setPortfolio(portRes || []);
        setSubmission(subRes || null);
        setDocuments(docsRes || []);
        setStudentHomeworkList(hwRes || []);
        setComplianceOverview(compRes || null);
        if (rcRes && rcRes.length > 0) {
          setStudentReportCard(rcRes[0]);
        } else {
          setStudentReportCard(null);
        }

        // Fetch official exam notifications for Student Portal
        try {
          const notifs = await api.getNotifications({ user_id: currentStudentId, role: 'student', limit: 10 });
          if (notifs && notifs.notifications && notifs.notifications.length > 0) {
            const rcNotif = notifs.notifications.find((n: any) => 
              n.notification_type === 'REPORT_CARD_PUBLISHED' || 
              (n.title && (n.title.toLowerCase().includes('report card') || n.title.toLowerCase().includes('exam marks')))
            );
            if (rcNotif && typeof window !== 'undefined' && !sessionStorage.getItem(`seen_rc_notif_${rcNotif.id}`)) {
              setToastMessage(`📢 ${rcNotif.title}: ${rcNotif.message}`);
              sessionStorage.setItem(`seen_rc_notif_${rcNotif.id}`, 'true');
            }
          }
        } catch {}

        await loadDescriptiveExams();
      } catch (err) {
        console.error('Error fetching student data', err);
      }
    }
    loadPortalData();
  }, [user, currentStudentId, isDemoStudent]);

  // Multi-window role testing sync: automatically update schedules & substitutions when assigned by coordinators
  useEffect(() => {
    const syncSchedulesFromStorage = () => {
      api.getExamSchedules(user?.class_name, user?.section).then(res => {
        if (res && Array.isArray(res)) {
          setStudentExamSchedules(res);
        }
      }).catch(() => {});
    };

    const syncSubstitutions = () => {
      api.getSubstitutions().then(res => {
        if (res && Array.isArray(res)) {
          setDailySubstitutions(res);
        }
      }).catch(() => {});
    };

    window.addEventListener('storage', syncSchedulesFromStorage);
    window.addEventListener('storage', syncSubstitutions);
    window.addEventListener('edu360_exam_schedules_updated', syncSchedulesFromStorage);
    window.addEventListener('edu360_substitutions_updated', syncSubstitutions);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('edu360_global_notifications');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SUBSTITUTION_ASSIGNED' || event.data?.type === 'PROXY_ASSIGNED') {
          syncSubstitutions();
        }
      };
    } catch {}

    return () => {
      window.removeEventListener('storage', syncSchedulesFromStorage);
      window.removeEventListener('storage', syncSubstitutions);
      window.removeEventListener('edu360_exam_schedules_updated', syncSchedulesFromStorage);
      window.removeEventListener('edu360_substitutions_updated', syncSubstitutions);
      if (bc) bc.close();
    };
  }, [user?.class_name, user?.section]);

  // Continuous Carousel Auto-Advancement (pauses on hover)
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % announcementSlides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isCarouselPaused]);

  // Listen for module navigation events from Omnisearch, Navbar, or dashboard links
  useEffect(() => {
    const handleNavEvent = (e: any) => {
      let rawTarget = typeof e.detail === 'string' ? e.detail : (e.detail?.tab || e.detail?.url || '');
      if (rawTarget.includes('tab=')) {
        try {
          const parsed = new URL(rawTarget, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
          const tab = parsed.searchParams.get('tab');
          if (tab) rawTarget = tab;
        } catch {
          const m = rawTarget.match(/tab=([^&#]+)/);
          if (m && m[1]) rawTarget = m[1];
        }
      }
      if (rawTarget) {
        let targetNav: NavSection = rawTarget as NavSection;
        if (rawTarget === 'focus') targetNav = 'focus_table';
        else if (rawTarget === 'exams_gradebook' || rawTarget === 'exam') targetNav = 'exams';
        else if (rawTarget === 'live') targetNav = 'live_classes';
        setActiveNav(targetNav);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('edu360-navigate', handleNavEvent as EventListener);
    window.addEventListener('edu360:switch-tab', handleNavEvent as EventListener);
    window.addEventListener('edu360-navigate-url', handleNavEvent as EventListener);

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) {
        let targetNav: NavSection = tabParam as NavSection;
        if (tabParam === 'focus') targetNav = 'focus_table';
        else if (tabParam === 'exams_gradebook' || tabParam === 'exam') targetNav = 'exams';
        else if (tabParam === 'live') targetNav = 'live_classes';
        setActiveNav(targetNav);
      }
    }

    return () => {
      window.removeEventListener('edu360-navigate', handleNavEvent as EventListener);
      window.removeEventListener('edu360:switch-tab', handleNavEvent as EventListener);
      window.removeEventListener('edu360-navigate-url', handleNavEvent as EventListener);
    };
  }, []);

  // Handlers
  const handleJoinLiveClass = () => {
    setIsLiveClassModalOpen(true);
    if (liveRoomStatus?.is_live) {
      triggerToast('🔴 Connecting to Mrs. Ananya Verma\'s live broadcast...');
    } else {
      triggerToast('⏳ Entering Pre-Flight Waiting Lobby. Class has not started yet.');
    }
  };

  const handleHomeworkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileForUpload(e.target.files[0]);
    }
  };

  const handleHomeworkSubmit = async () => {
    if (!selectedFileForUpload) return;
    setIsUploadingHomework(true);
    try {
      const fileUrl = `/samples/${selectedFileForUpload.name || 'math_worksheet.png'}`;
      await api.submitHomework(1, 1, fileUrl);
      setIsUploadingHomework(false);
      setHomeworkSubmittedSuccess(true);
      triggerToast('Worksheet PDF submitted successfully! Awaiting teacher grading.');
    } catch {
      setIsUploadingHomework(false);
      setHomeworkSubmittedSuccess(true);
      triggerToast('Worksheet PDF submitted successfully! Awaiting teacher grading.');
    }
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

  const handleLaunchExam = (
    subject: string = 'Mathematics',
    topic: string = 'Quadratic Equations Quiz',
    duration: number = 180,
    prompt?: string,
    maxMarks: number = 100,
    mode: 'MODE_CBT' | 'MODE_HYBRID_SCAN' = 'MODE_HYBRID_SCAN'
  ) => {
    setOnlineExamSubject(subject);
    setOnlineExamTopic(topic);
    setOnlineExamDuration(duration);
    setOnlineExamPrompt(prompt);
    setOnlineExamMaxMarks(maxMarks);
    setOnlineExamMode(mode);
    setIsOnlineExamOpen(true);
  };

  // Filtered recordings
  const filteredRecordings = recordings.filter((r) => {
    const matchSubject = selectedSubjectFilter === 'All' || r.subject.toLowerCase() === selectedSubjectFilter.toLowerCase();
    const query = recordingsSearch.trim().toLowerCase();
    const matchSearch = !query ||
      r.title.toLowerCase().includes(query) ||
      r.chapter.toLowerCase().includes(query) ||
      r.teacher_name.toLowerCase().includes(query) ||
      r.subject.toLowerCase().includes(query);
    return matchSubject && matchSearch;
  });

  const getRecordingChapters = (rec: ClassRecording): ChapterTimestamp[] => {
    if (rec.chapters && rec.chapters.length > 0) return rec.chapters;
    if (rec.subject.toLowerCase().includes('math')) {
      return [
        { time: '00:00', label: 'Introduction & Standard Form (ax² + bx + c = 0)', key_takeaway: 'Ensure a ≠ 0 and all terms are gathered onto LHS before factoring.' },
        { time: '09:40', label: 'Splitting Middle Term: Finding p & q Factors', key_takeaway: 'Identify pairs where p·q = a·c and p + q = b.' },
        { time: '18:25', label: 'Sign Conventions & Negative Coefficients', key_takeaway: 'Watch negative signs when grouping: 2x² - 5x - 3.' },
        { time: '31:10', label: 'CBSE Board Model Problem Practice', key_takeaway: 'Always conclude with distinct root values x = α, β.' }
      ];
    } else if (rec.subject.toLowerCase().includes('physic')) {
      return [
        { time: '00:00', label: "Action & Reaction Pair Definition", key_takeaway: "Forces always occur in matched opposite pairs on different bodies." },
        { time: '14:15', label: "Conservation of Linear Momentum", key_takeaway: "Total initial momentum equals total final momentum in isolated systems." },
        { time: '28:50', label: "Recoil Velocity of Guns & Rockets", key_takeaway: "V_recoil = -(m_bullet · v_bullet) / M_gun." }
      ];
    } else if (rec.subject.toLowerCase().includes('english')) {
      return [
        { time: '00:00', label: "Lorenzo and Gratiano Dialogue Context", key_takeaway: "Plotting the masque and Lorenzo's elopement with Jessica." },
        { time: '16:40', label: "Theme of Disguise & Elizabethan Theater", key_takeaway: "Torchbearer symbolism in Venetian festival nights." }
      ];
    }
    return [
      { time: '00:00', label: 'Lecture Overview & Fundamental Concepts', key_takeaway: 'Master fundamental syllabus definitions and core principles.' },
      { time: '12:30', label: 'Step-by-Step Problem Solving & Demonstrations', key_takeaway: 'Follow standardized methodology and step-by-step calculations.' },
      { time: '25:40', label: 'Exam Traps, Question Analysis & Wrap-up', key_takeaway: 'Pay close attention to common misconceptions and exam question phrasing.' }
    ];
  };

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
    student_id: currentStudentId,
    student_name: user?.name || 'Aarav Sharma',
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
                      ? 'bg-[var(--primary)] text-white font-bold shadow-sm shadow-[var(--primary)]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                  title="Dashboard"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </button>

                {/* Live Classes */}
                <button
                  onClick={() => { setActiveNav('live_classes'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'live_classes'
                      ? 'bg-[var(--primary)] text-white font-bold shadow-sm shadow-[var(--primary)]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                  title="Live Classes"
                >
                  <div className="flex items-center gap-2.5">
                    <Camera className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>Live Classes</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      1 Live
                    </span>
                  )}
                </button>

                {/* Class Recordings */}
                <button
                  onClick={() => { setActiveNav('recordings'); setActiveRecordingDetail(null); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'recordings'
                      ? 'bg-[var(--primary)] text-white font-bold shadow-sm shadow-[var(--primary)]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                  title="Class Recordings"
                >
                  <div className="flex items-center gap-2.5">
                    <Video className={`h-4 w-4 shrink-0 ${activeNav === 'recordings' ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'}`} />
                    {!sidebarCollapsed && <span>Class Recordings</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                      Archive
                    </span>
                  )}
                </button>

                {/* Timetable & Schedule */}
                <button
                  onClick={() => { setActiveNav('timetable'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'timetable'
                      ? 'bg-[var(--primary)] text-white font-bold shadow-sm shadow-[var(--primary)]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
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
                      ? 'bg-[var(--primary)] text-white font-bold shadow-sm shadow-[var(--primary)]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                  title="Homework & Assignments"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>Homework &amp; Tasks</span>}
                  </div>
                  {!sidebarCollapsed && (() => {
                    if (!isDemoStudent) {
                      const pendingCount = (studentHomeworkList || []).filter(t => t.status === 'PENDING').length;
                      if (pendingCount > 0) {
                        return (
                          <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                            {pendingCount} Pending
                          </span>
                        );
                      }
                      return null;
                    }
                    const pendingCount = studentHomeworkList.filter(t => t.status === 'PENDING').length;
                    const overdueCount = studentHomeworkList.filter(t => ClockProvider.isOverdue(t.due_date, t.status)).length;
                    if (overdueCount > 0) {
                      return (
                        <span className="rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                          {overdueCount} Backlog
                        </span>
                      );
                    }
                    if (pendingCount > 0) {
                      return (
                        <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                          {pendingCount} Pending
                        </span>
                      );
                    }
                    if (isDemoStudent && studentHomeworkList.length === 0) {
                      return (
                        <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                          2 Pending
                        </span>
                      );
                    }
                    return null;
                  })()}
                </button>

                {/* My Focus Table */}
                <button
                  onClick={() => { setActiveNav('focus_table'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'focus_table'
                      ? 'bg-[var(--primary)] text-white font-bold shadow-sm shadow-[var(--primary)]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                  title="My Focus Table (Personalized Weak-Concepts Study Plan)"
                >
                  <div className="flex items-center gap-2.5">
                    <Target className={`h-4 w-4 shrink-0 ${activeNav === 'focus_table' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                    {!sidebarCollapsed && <span>My Focus Table</span>}
                  </div>
                  {!sidebarCollapsed && (() => {
                    if (!isDemoStudent) return null;
                    const weakCount = complianceOverview?.itemized_backlogs?.length || 0;
                    if (weakCount > 0) {
                      return (
                        <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                          {weakCount} Weak {weakCount === 1 ? 'Area' : 'Areas'}
                        </span>
                      );
                    }
                    if (isDemoStudent && weakCount === 0) {
                      return (
                        <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                          2 Weak Areas
                        </span>
                      );
                    }
                    return null;
                  })()}
                </button>

                {/* Exams & Results */}
                <button
                  onClick={() => { setActiveNav('exams'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'exams'
                      ? 'bg-[var(--primary)] text-white font-bold shadow-sm shadow-[var(--primary)]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                  title="Exams & Results"
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>Exams &amp; Results</span>}
                  </div>
                  {!sidebarCollapsed && (() => {
                    if (!isDemoStudent) return null;
                    const examPct = studentReportCard?.overall_percentage ? `${studentReportCard.overall_percentage}%` : '88.8%';
                    return (
                      <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-1.5 py-0.5 text-[9px] font-bold">
                        {examPct}
                      </span>
                    );
                  })()}
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
                      ? 'bg-[var(--primary)] text-white font-bold shadow-sm shadow-[var(--primary)]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                  title="Participations & Achievements"
                >
                  <div className="flex items-center gap-2.5">
                    <Trophy className={`h-4 w-4 shrink-0 ${activeNav === 'portfolio' ? 'text-white' : 'text-amber-500 dark:text-amber-400'}`} />
                    {!sidebarCollapsed && <span>Dual Portfolio</span>}
                  </div>
                  {!sidebarCollapsed && isDemoStudent && (
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
                      ? 'bg-[var(--primary)] text-white font-bold shadow-sm shadow-[var(--primary)]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                  title="Holidays & Calendar"
                >
                  <Sun className={`h-4 w-4 shrink-0 ${activeNav === 'calendar' ? 'text-white' : 'text-amber-500 dark:text-amber-400'}`} />
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
                      ? 'bg-[var(--primary)] text-white font-bold shadow-sm shadow-[var(--primary)]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                  title="SIS Profile & Attendance"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCircle className={`h-4 w-4 shrink-0 ${activeNav === 'profile' ? 'text-white' : 'text-blue-500 dark:text-blue-400'}`} />
                    {!sidebarCollapsed && <span>SIS Profile</span>}
                  </div>
                  {!sidebarCollapsed && isDemoStudent && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      94.2%
                    </span>
                  )}
                </button>

                {/* Official Documents */}
                <button
                  onClick={() => { setActiveNav('vault'); setMobileDrawerOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'vault'
                      ? 'bg-[var(--primary)] text-white font-bold shadow-sm shadow-[var(--primary)]/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                  title="Official Documents (View-Only Vault)"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderLock className={`h-4 w-4 shrink-0 ${activeNav === 'vault' ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
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

                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Sign out of student portal"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="mx-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Academic Term 2 · CBSE 2026-27" />
                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
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
              
              {/* 🔴 LIVE CBT EXAMINATION HERO BANNER (Dynamic: ONLY visible when an exam is actively LIVE right now) */}
              {liveTodayExam && (
                <div className="rounded-2xl border border-violet-500/40 bg-slate-950 dark:bg-[#070B14] p-5 shadow-lg text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-violet-600/30 border border-violet-400 flex items-center justify-center text-violet-300 shadow-md shrink-0">
                      <Radio className="h-6 w-6 text-violet-400 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs animate-pulse">
                          🔴 Live Exam Scheduled Today
                        </span>
                        <span className="text-xs font-mono text-violet-300">{liveTodayExam.class_name} • {liveTodayExam.series_name || 'Assessment'}</span>
                      </div>
                      <h3 className="text-base font-black text-white">{liveTodayExam.subject}: {liveTodayExam.title}</h3>
                      <p className="text-xs text-slate-300">
                        Chief Invigilator: <b>{liveTodayExam.chief_invigilator_name || 'Mrs. Ananya Verma'}</b> • Hall: {liveTodayExam.hall_name || 'Virtual Room A'} • Hall Ticket Ready
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => {
                        setIsOnlineExamOpen(true);
                      }}
                      className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Radio className="h-4 w-4" />
                      <span>Enter Exam Room &bull; Waiting Lobby &rarr;</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* ===================================================== */}
              {/* 1. STUDENT COMMAND CENTER HERO HEADER                 */}
              {/* ===================================================== */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {isDemoStudent ? (
                        <>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-1 text-xs font-bold">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Present Today ✓ • On Time Active</span>
                          </span>

                          {/* Dynamic Period Status Badge */}
                          {activePeriod ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 px-3 py-1 text-xs font-bold">
                              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                              <span>{activePeriod.periodNum} Live • {activePeriod.subject} ({activePeriod.timing})</span>
                            </span>
                          ) : isSchoolConcluded ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-bold">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Academic Day Concluded ✓ • 6/6 Periods Attended</span>
                            </span>
                          ) : isMorningBreak || isLunchBreak ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-bold">
                              <Clock className="h-3.5 w-3.5 text-amber-500" />
                              <span>{isMorningBreak ? 'Morning Recess (10:00 – 10:30 AM)' : 'Lunch Break (12:00 – 01:00 PM)'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 px-3 py-1 text-xs font-bold">
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                              <span>School Day Commences at 08:30 AM • First Period: Physics</span>
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 px-3.5 py-1 text-xs font-bold">
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <span>Newly Enrolled Student • Session 2026-27</span>
                          </span>

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1 text-xs font-bold">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>Live Timetable &amp; Online Classes Active</span>
                          </span>
                        </>
                      )}
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Welcome, {user?.name || (isDemoStudent ? 'Aarav Sharma' : 'Student')}!
                      </h1>
                      <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {isDemoStudent 
                          ? 'Secondary Department • Academic Workspace & Student Ledger.'
                          : 'Online Academy • Daily Class Timetable & Live Interactive Stream Portal.'}
                      </p>
                    </div>

                    {/* Operational Tags */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                        <span>Class: <strong className="text-slate-700 dark:text-slate-200">{isDemoStudent ? '8-A (Roll #01)' : 'Class 8-A'}</strong></span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Homeroom: <strong className="text-slate-700 dark:text-slate-200">Mrs. Ananya Verma</strong></span>
                      </span>
                      {isDemoStudent && (
                        <>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="flex items-center gap-1 font-medium">
                            <Trophy className="h-3.5 w-3.5 text-amber-500" />
                            <span>Role: <strong className="text-slate-700 dark:text-slate-200">Phoenix House Captain</strong></span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Primary & Secondary Action Group */}
                  <div className="flex flex-wrap lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0">
                    {!isSchoolConcluded ? (
                      <button
                        onClick={handleJoinLiveClass}
                        className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg transition-all duration-200 active:scale-98 border cursor-pointer ${
                          (liveRoomStatus?.is_live || activePeriod)
                            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30 border-emerald-400/30 animate-pulse'
                            : 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 hover:from-slate-600 hover:to-slate-700 shadow-slate-900/30 border-slate-600/30'
                        }`}
                      >
                        <Video className="h-4 w-4" />
                        <span>
                          {hasJoinedLive 
                            ? 'Return to Live Classroom Stream' 
                            : (liveRoomStatus?.is_live || activePeriod) 
                              ? `▶ Join Live Class (${activePeriod ? activePeriod.subject : 'In Session'})` 
                              : '⏳ Enter Waiting Lobby (Class Not Live Yet)'}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveNav('homework')}
                        className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg transition-all duration-200 active:scale-98 border cursor-pointer bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 hover:from-slate-700 hover:to-slate-800 shadow-slate-900/30 border-slate-700"
                      >
                        <FileText className="h-4 w-4 text-amber-400" />
                        <span>Classes Dismissed for Today • Review Homeworks</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      {isDemoStudent ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setActiveNav('timetable')}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
                          >
                            <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                            <span>View Timetable</span>
                          </button>

                          <button
                            onClick={() => setActiveNav('live_classes')}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                          >
                            <Video className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Upcoming Classes</span>
                          </button>
                        </>
                      )}
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
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold border ${
                        activePeriod
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60'
                          : isSchoolConcluded
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60'
                      }`}>
                        <Video className={`h-5 w-5 ${activePeriod ? 'animate-pulse' : ''}`} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                          {activePeriod 
                            ? `${activePeriod.periodNum} Live`
                            : isSchoolConcluded 
                              ? 'Day Concluded'
                              : isMorningBreak || isLunchBreak 
                                ? 'Break Time'
                                : isBeforeSchool
                                  ? 'Starts 08:30 AM'
                                  : 'Timetable Active'}
                        </h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          activePeriod
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60'
                            : isSchoolConcluded
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                          {activePeriod ? activePeriod.room : isSchoolConcluded ? '6/6 Completed ✓' : isMorningBreak ? 'Morning Recess' : isLunchBreak ? 'Lunch Break' : 'Room 204'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {activePeriod 
                          ? `${activePeriod.subject} • ${activePeriod.faculty}`
                          : isSchoolConcluded 
                            ? 'All 6 academic periods finished. Homework due tonight.'
                            : isMorningBreak
                              ? 'Recess (10:00 - 10:30 AM) • Period 3 starts next'
                              : isLunchBreak
                                ? 'Lunch Break (12:00 - 01:00 PM) • Period 5 starts next'
                                : 'Daily schedule starts at 08:30 AM'}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          activePeriod ? 'bg-rose-500' : isSchoolConcluded ? 'bg-emerald-500' : 'bg-blue-500'
                        }`} 
                        style={{ width: `${Math.round((evaluatedPeriods.filter(p => p.status === 'completed').length / evaluatedPeriods.length) * 100)}%` }} 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                    <span>{isSchoolConcluded ? 'Review Recorded Lectures' : 'Open Timetable & Classes'}</span>
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
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center font-bold">
                        <FileText className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                          {isDemoStudent ? '2 Tasks Due' : `${studentHomeworkList.length} Tasks Due`}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                          {isDemoStudent ? 'By 5:00 PM' : studentHomeworkList.length === 0 ? 'Up to Date' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {isDemoStudent ? 'English Analysis & Chemistry Worksheet 4.2' : studentHomeworkList.length === 0 ? 'No homework assigned yet. Follow your timetable.' : `${studentHomeworkList.length} exercises assigned.`}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: isDemoStudent ? '71%' : studentHomeworkList.length === 0 ? '0%' : '50%' }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 group-hover:translate-x-0.5 transition-transform">
                    <span>{isDemoStudent ? 'Submit Tonight\'s Work' : 'Open Homework Desk'}</span>
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
                        {isDemoStudent ? '1-Week Remedial Sprint' : 'Remedial Sprint Status'}
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center font-bold">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                          {isDemoStudent ? 'Day 2 of 7' : 'All Clear'}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
                          {isDemoStudent ? 'Mathematics' : 'Standard Track'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {isDemoStudent ? 'Quadratic Factoring • 42% Mastery (Goal >70%)' : 'Standard curriculum track. No diagnosed conceptual lags.'}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: isDemoStudent ? '42%' : '0%' }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 group-hover:translate-x-0.5 transition-transform">
                    <span>{isDemoStudent ? 'Inspect Focus Sprint' : 'View Focus Table'}</span>
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
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center font-bold">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                          {isDemoStudent ? '94.2% Safe' : 'New Enrollee'}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                          {isDemoStudent ? 'Rank #4 · ↑ 2.1%' : 'Active Day 1'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {isDemoStudent ? '146/155 Days • Checked In: 08:02 AM Today' : 'Attendance logging begins upon joining your first live class.'}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: isDemoStudent ? '94%' : '0%' }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform">
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
                    {evaluatedPeriods.map((period) => {
                      const isLive = period.status === 'live';
                      const isCompleted = period.status === 'completed';

                      if (isLive) {
                        return (
                          <div
                            key={period.id}
                            className="p-3.5 rounded-xl border-2 border-rose-500/80 bg-rose-50/50 dark:bg-rose-950/30 dark:border-rose-500/70 shadow-sm transition-all space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="h-9 w-9 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30">
                                  {period.periodNum}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                      {period.subject}: {period.topic}
                                    </h4>
                                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                                    {period.timeRange} • {period.faculty} • <span className="text-rose-600 dark:text-rose-400 font-semibold">{period.room} &amp; Stream</span>
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
                                onClick={() => handleDownloadNotes(period.subject, period.topic)}
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
                        );
                      }

                      return (
                        <div
                          key={period.id}
                          onClick={() => setActiveNav('timetable')}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="h-9 w-9 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                              {period.periodNum}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {period.subject}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {period.timeRange} • {period.faculty} • <span className="text-blue-600 dark:text-blue-400 font-semibold">{period.room}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            {isCompleted ? (
                              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                                Completed ✓
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 text-[10px] font-semibold">
                                Upcoming
                              </span>
                            )}
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right 5 Cols: Active 1-Week Remedial Focus & Campus Bulletin */}
                <div className="lg:col-span-5 space-y-5">
                  
                  {/* ACTIVE 1-WEEK REMEDIAL FOCUS CARD */}
                  {isDemoStudent ? (
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
                  ) : (
                    <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-white dark:bg-[#0F172A] p-5 shadow-sm space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                            <CalendarDays className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              Online Class Schedule &amp; Timetable
                            </h4>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                              Standard Academic Track &bull; Active
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                          Good Standing
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-2">
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                          Curriculum Status
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          No Remedial Interventions Required
                        </h5>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          Your account is registered on the standard curriculum track. Join your scheduled daily live lectures and interactive periods via the Timetable.
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveNav('timetable')}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-sm shadow-[var(--primary)]/20 cursor-pointer"
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>Open Complete Class Timetable</span>
                      </button>
                    </div>
                  )}

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
            const CURRENT_WEEK_DAYS = ClockProvider.getWeekDays();
            const todayKey = ClockProvider.getTodayKey();

            const DEFAULT_FALLBACK_TASKS: Homework[] = [
              {
                id: 1,
                title: 'Quadratic Equations: Factorization by Splitting the Middle Term',
                subject: 'Mathematics',
                class_name: 'Class 8-A',
                description: 'Complete Textbook Exercises 4.2 (Questions 1 to 10). Write out solutions with clear factorization steps and drop below.',
                task_type: 'DAILY_HOMEWORK',
                assigned_date: CURRENT_WEEK_DAYS[0]?.dateKey || '2026-10-12',
                due_date: CURRENT_WEEK_DAYS[1]?.dateKey || '2026-10-13',
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
                assigned_date: CURRENT_WEEK_DAYS[1]?.dateKey || '2026-10-14',
                due_date: CURRENT_WEEK_DAYS[CURRENT_WEEK_DAYS.length - 1]?.dateKey || '2026-10-18',
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
                assigned_date: CURRENT_WEEK_DAYS[2]?.dateKey || '2026-10-16',
                due_date: todayKey,
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

            const allTasks: Homework[] = isDemoStudent 
              ? (studentHomeworkList.length > 0 ? studentHomeworkList : DEFAULT_FALLBACK_TASKS)
              : (studentHomeworkList || []);

            const dailyTasks = allTasks.filter(t => (t.task_type || 'DAILY_HOMEWORK') === 'DAILY_HOMEWORK');
            const assignmentTasks = allTasks.filter(t => t.task_type === 'ASSIGNMENT');

            // Overall Summary Counts using Dynamic Clock
            const dueTodayCount = isDemoStudent ? allTasks.filter(t => 
              ClockProvider.isDueToday(t.due_date, t.status)
            ).length : 0;

            const completedCount = isDemoStudent ? allTasks.filter(t => 
              t.status === 'SUBMITTED' || t.status === 'GRADED'
            ).length : 0;

            const backlogCount = isDemoStudent ? allTasks.filter(t => 
              ClockProvider.isOverdue(t.due_date, t.status)
            ).length : 0;

            // Stream-specific filtered list
            const currentStreamTasks = homeworkWorkstream === 'daily' ? dailyTasks : assignmentTasks;

            // Filter by Status
            const filteredByStatus = currentStreamTasks.filter(item => {
              if (homeworkFilter === 'all') return true;
              if (homeworkFilter === 'pending') return item.status === 'PENDING';
              if (homeworkFilter === 'submitted_graded') return item.status === 'SUBMITTED' || item.status === 'GRADED';
              if (homeworkFilter === 'backlog') {
                return ClockProvider.isOverdue(item.due_date, item.status);
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
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-[var(--primary)]/20 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Task</span>
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
                          ? 'bg-white dark:bg-slate-900 text-[var(--primary)] shadow-sm font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
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
                          ? 'bg-white dark:bg-slate-900 text-[var(--primary)] shadow-sm font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
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
                            ? 'bg-[var(--primary)] text-white font-bold shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium'
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
                        <span>Backlog ({currentStreamTasks.filter(t => ClockProvider.isOverdue(t.due_date, t.status)).length})</span>
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
                {!isDemoStudent && allTasks.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4 shadow-xs">
                    <div className="h-16 w-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">
                        All Clear • No Homework Assigned Yet
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Your academic ledger is completely up to date. Homework assignments, daily worksheets, and project tasks will appear here once assigned by your teachers.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setActiveNav('timetable')}
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm shadow-[var(--primary)]/20 cursor-pointer"
                      >
                        <Clock className="h-4 w-4" />
                        <span>View Class Timetable &amp; Schedule</span>
                      </button>
                    </div>
                  </div>
                ) : homeworkWorkstream === 'daily' ? (
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
                                ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-bold shadow-xs'
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
                          const hasBacklog = dayTasks.some(t => ClockProvider.isOverdue(t.due_date, t.status));
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
                            setSelectedDateKey(ClockProvider.getTodayKey());
                            setShowAllDates(false);
                          }}
                          className="rounded-xl bg-[var(--primary)] hover:opacity-95 text-white font-bold text-xs px-4 py-2 shadow-sm shadow-[var(--primary)]/20 transition-all cursor-pointer"
                        >
                          Jump to Today&apos;s Tasks ({ClockProvider.formatDateLabel(ClockProvider.getNow())})
                        </button>
                      </div>
                    ) : (
                      <div className={homeworkViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                        {finalTasksList.map((task) => {
                          const isBacklog = ClockProvider.isOverdue(task.due_date, task.status);
                          const isDueToday = ClockProvider.isDueToday(task.due_date, task.status);
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
                                      <span className="inline-flex items-center gap-1.5"><Icon3D name="fire" size={16} /><span>Due Today (5 PM)</span></span>
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
                                        className="rounded-xl bg-[var(--primary)] hover:opacity-95 text-white font-bold text-xs px-4 py-2 shadow-sm shadow-[var(--primary)]/20 transition-all flex items-center gap-1.5 cursor-pointer"
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
          {/* VIEW: EXAMS & RESULTS (STRUCTURED 3-TIER MODULE)      */}
          {/* ===================================================== */}
          {activeNav === 'exams' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                      Official Academic Record
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">CBSE Affiliation #830029 &bull; Class 8-B</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Exams, Timetables &amp; Report Cards (Session 2026-27)
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Centralized examination desk: Timetable &amp; seating allocations, evaluated descriptive papers, and official CBSE marksheets.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {examSubTab === 'timetable' && (
                    <button
                      onClick={handleOpenAdmitCard}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <Award className="h-4 w-4" />
                      <span className="inline-flex items-center gap-1.5"><Icon3D name="ticket" size={18} /><span>Official Admit Card (Hall Ticket)</span></span>
                    </button>
                  )}

                  {examSubTab === 'results' && (
                    <button
                      onClick={() => setIsEvalKeyOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>View AI Evaluated Script &amp; Key</span>
                    </button>
                  )}

                  {examSubTab === 'report_card' && (
                    <>
                      <button
                        onClick={() => setIsEvalKeyOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        <span>View Evaluation Key</span>
                      </button>
                      <button
                        onClick={() => {
                          downloadMarksMemoFile(user?.name || 'Aarav Sharma', 'Term 1 Official CBSE Statement of Marks');
                          triggerToast('Official CBSE Statement of Marks downloaded (PDF format)!');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white px-4 py-2.5 text-xs font-bold shadow-sm shadow-[var(--primary)]/20 transition-all cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Marks Memo (PDF)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 3-SUB-TAB NAVIGATION PILLS */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setExamSubTab('timetable')}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    examSubTab === 'timetable'
                      ? 'bg-[var(--primary)] text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="inline-flex items-center gap-1.5"><Icon3D name="calendar" size={18} /><span>Exam Timetable &amp; Hall Tickets</span></span>
                </button>

                <button
                  type="button"
                  onClick={() => setExamSubTab('results')}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    examSubTab === 'results'
                      ? 'bg-[var(--primary)] text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                >
                  <BarChart className="h-4 w-4" />
                  <span className="inline-flex items-center gap-1.5"><Icon3D name="chart" size={18} /><span>Term Results &amp; Script Review</span></span>
                </button>

                <button
                  type="button"
                  onClick={() => setExamSubTab('report_card')}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    examSubTab === 'report_card'
                      ? 'bg-[var(--primary)] text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                  }`}
                >
                  <Award className="h-4 w-4" />
                  <span className="inline-flex items-center gap-1.5"><Icon3D name="memo" size={18} /><span>Official CBSE Report Card &amp; Marksheet</span></span>
                </button>
              </div>

              {/* ======================================================= */}
              {/* SUB-TAB 1: EXAM TIMETABLE & SEATING ALLOCATIONS         */}
              {/* ======================================================= */}
              {examSubTab === 'timetable' && (
                <div className="space-y-6">
                  {/* TOP CARDS: ACTIVE ONLINE TEST & EXAM SEATING */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Active Online Test Card with Dynamic Lifecycle States */}
                    {examSubmissionState === 'upload_pending' ? (
                      /* State B: Upload Pending (15-min countdown active) */
                      <div className="rounded-2xl border-2 border-amber-500/70 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent dark:from-amber-950/50 dark:via-orange-950/30 dark:to-slate-900 p-5 shadow-lg shadow-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1">
                              <Clock className="h-3 w-3 inline" />
                              <span>Writing Concluded &bull; 15-Minute Scan &amp; Upload Active</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              Seal Code: {pdfUploadData?.sealCode || 'SEAL-8B-9482'}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            {studentExamSchedules.length > 0 
                              ? studentExamSchedules[0].title
                              : 'Class 8 Mathematics &bull; Term 1 Hybrid Assessment'}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            Live camera proctoring concluded. Verify <strong>SEAL-8B-9482</strong> is written on top of all pages, scan into a single PDF, and upload into the Chief Invigilator vault.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setPdfUploadData({
                                sealCode: 'SEAL-8B-9482',
                                subject: studentExamSchedules[0]?.subject || onlineExamSubject,
                                examTitle: studentExamSchedules[0]?.title || `${onlineExamSubject}: ${onlineExamTopic}`
                              });
                              setIsPdfUploadModalOpen(true);
                            }}
                            className="rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs px-5 py-3 shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Upload Answer Sheets (PDF)</span>
                          </button>
                        </div>
                      </div>
                    ) : examSubmissionState === 'completed' ? (
                      /* State C: Completed & Uploaded to Evaluation Vault */
                      <div className="rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-slate-900 p-5 shadow-lg shadow-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                              Assessment Concluded &bull; Answer Script In Vault
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              Verified: {examUploadDetails?.sealCode || 'SEAL-8B-9482'}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            {studentExamSchedules.length > 0 
                              ? studentExamSchedules[0].title
                              : 'Class 8 Mathematics &bull; Term 1 Hybrid Assessment'}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            Answer script ({examUploadDetails?.pageCount || 6} pages &bull; {examUploadDetails?.fileSize || '4.2 MB'}) synced at {examUploadDetails?.uploadedAt || 'recently'}. Assigned to Chief Invigilator Mrs. Ananya Verma for evaluation.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setPdfUploadData({
                                sealCode: examUploadDetails?.sealCode || 'SEAL-8B-9482',
                                subject: studentExamSchedules[0]?.subject || onlineExamSubject,
                                examTitle: studentExamSchedules[0]?.title || `${onlineExamSubject}: ${onlineExamTopic}`
                              });
                              setIsPdfUploadModalOpen(true);
                            }}
                            className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-5 py-3 shadow-lg shadow-emerald-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <FileCheck className="h-4 w-4" />
                            <span>View Script &amp; Receipt</span>
                          </button>
                        </div>
                      </div>
                    ) : (() => {
                      const activeLiveExam = studentExamSchedules.find(s => {
                        if ((s as any).session_status === 'CONCLUDED' || s.lifecycle_status === 'CONCLUDED') return false;
                        if ((s as any).session_status === 'SCHEDULED') return false; // Room not yet commenced by invigilator
                        return (s as any).session_status === 'COMMENCED' || s.lifecycle_status === 'LIVE';
                      });
                      const nextUpcomingExam = studentExamSchedules.find(s => {
                        if (s === activeLiveExam) return false;
                        if ((s as any).session_status === 'CONCLUDED' || s.lifecycle_status === 'CONCLUDED') return false;
                        return s.lifecycle_status === 'UPCOMING' || (s as any).session_status === 'SCHEDULED';
                      });

                      if (activeLiveExam) {
                        return (
                          /* State A1: LIVE ACTIVE EXAM */
                          <div className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                                  {activeLiveExam.exam_mode === 'MODE_HYBRID_SCAN'
                                    ? '📝 Hybrid Scan & Upload Examination (Live Now)'
                                    : activeLiveExam.exam_mode === 'MODE_OFFLINE'
                                    ? '🏢 Physical Hall Examination'
                                    : '💻 Live CBT Examination Portal (Active)'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  {activeLiveExam.exam_mode === 'MODE_HYBRID_SCAN' ? 'Hybrid OCR' : activeLiveExam.exam_mode || 'MODE_CBT'}
                                </span>
                              </div>
                              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                                Active Test: {activeLiveExam.title}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Subject: {activeLiveExam.subject} • Hall: {activeLiveExam.hall_name || 'Virtual Room'} • {activeLiveExam.exam_date} ({activeLiveExam.start_time} - {activeLiveExam.end_time}) • Chief Invigilator: {activeLiveExam.chief_invigilator_name || 'Assigned Faculty'}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const targetMode = activeLiveExam.exam_mode === 'MODE_CBT' ? 'MODE_CBT' : 'MODE_HYBRID_SCAN';
                                const prompt = activeLiveExam.question_paper_title
                                  ? `Official CBSE Board Timetable Exam: ${activeLiveExam.title}. Question Reference: ${activeLiveExam.question_paper_title}. Step-wise handwritten working required on physical paper booklet.`
                                  : 'Official CBSE Assessment: Solve questions on physical paper booklet under active webcam/YOLO proctoring. Verify and upload final scan with session token.';
                                handleLaunchExam(
                                  activeLiveExam.subject || 'Mathematics',
                                  activeLiveExam.title || 'Term 1 Hybrid Proctored Assessment',
                                  activeLiveExam.duration_minutes || 180,
                                  prompt,
                                  100,
                                  targetMode
                                );
                              }}
                              className="shrink-0 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-black text-xs px-5 py-3 shadow-lg shadow-purple-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                              </span>
                              <Play className="h-3.5 w-3.5 fill-current" />
                              <span>Join Proctored Exam Room</span>
                            </button>
                          </div>
                        );
                      }

                      if (nextUpcomingExam) {
                        return (
                          /* State A2: UPCOMING SCHEDULED EXAM */
                          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-transparent dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                                  🕒 Upcoming Examination
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                                  {nextUpcomingExam.exam_date}
                                </span>
                              </div>
                              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                                {nextUpcomingExam.title}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Subject: {nextUpcomingExam.subject} • Hall: {nextUpcomingExam.hall_name || 'Examination Hall B'} • Timing: {nextUpcomingExam.start_time} - {nextUpcomingExam.end_time} • Chief Invigilator: {nextUpcomingExam.chief_invigilator_name || 'Assigned Faculty'}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
                                Room unlocks 10 mins before exam
                              </span>
                              <button
                                onClick={handleOpenAdmitCard}
                                className="rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs px-4 py-2.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <Award className="h-4 w-4 text-purple-600" />
                                <span>View Admit Card</span>
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        /* State A3: CLEAN ZERO-STATE FOR NEW STUDENTS OR NO ACTIVE EXAMS */
                        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                              <CalendarCheck2 className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                No Active Examinations
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                There are no live exams running right now. When the examination coordinator schedules tests for your class ({user?.class_name || 'Class 8'}), they will appear here.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setExamSubTab('report_card')}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-2.5 shadow-2xs transition-all cursor-pointer shrink-0"
                          >
                            View Academic Records
                          </button>
                        </div>
                      );
                    })()}

                    {/* Upcoming Final Exam Proctoring Room Card */}
                    {!admitCardHold && (admitCardData || isDemoStudent) && (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Board &amp; Term Proctoring Allocation
                          </span>
                          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            Upcoming Exam — {admitCardData?.hall_name || 'Virtual Exam Room B'}, Seat #{admitCardData?.desk_number || 'A-14'}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Candidate: {admitCardData?.student_name || user?.name || 'Aarav Sharma'} &bull; Online Proctored Session &bull; Browser Lockdown
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
                          {admitCardData?.desk_number || '#A-14'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ======================================================= */}
                  {/* AUTHORIZED RE-EXAMINATION SPECIAL TIMETABLE & STATUS    */}
                  {/* ======================================================= */}
                  {(() => {
                    const studentReExamRequests = (reExamRequests || []).filter((req: any) => 
                      (req.student_id && req.student_id === currentStudentId) ||
                      (isDemoStudent && req.student_name === 'Aarav Sharma')
                    );
                    if (!studentReExamRequests || studentReExamRequests.length === 0) return null;
                    return (
                      <div className="space-y-4">
                        {studentReExamRequests.map((req) => (
                        <div
                          key={req.id}
                          className={`rounded-2xl border p-5 shadow-xs transition-all relative overflow-hidden ${
                            req.status === 'Approved by Admin' || req.status === 'Scheduled'
                              ? 'border-emerald-300 dark:border-emerald-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/30 dark:to-slate-900'
                              : 'border-amber-300 dark:border-amber-800 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/30 dark:to-slate-900'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-2 max-w-3xl">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                                    req.status === 'Approved by Admin' || req.status === 'Scheduled'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                  }`}
                                >
                                  {req.status === 'Approved by Admin' || req.status === 'Scheduled' ? (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>Authorized by Principal &bull; Scheduled by Exam Coordinator</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                      <span>Re-Exam Exemption Under Principal Review</span>
                                    </>
                                  )}
                                </span>

                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                  Requested by Parent: <strong className="text-slate-700 dark:text-slate-200">{req.parent_name}</strong>
                                </span>
                              </div>

                              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                Special Re-Examination: {req.subject} &bull; {req.exam_name}
                              </h3>

                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                <strong>Reason Category:</strong> {req.reason_category} &bull; {req.reason_details}
                              </p>

                              {req.status === 'Approved by Admin' || req.status === 'Scheduled' && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-800 text-xs">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Re-Exam Date &amp; Time</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {req.re_exam_date || '30 Oct 2026'} &bull; {req.re_exam_time || '10:00 AM – 01:00 PM'}
                                    </span>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-800 text-xs">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Online Proctored Room</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {req.re_exam_venue || 'Virtual Room A (Camera AI Proctor)'}
                                    </span>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-800 text-xs">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Exam Coordinator</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {req.coordinator_assigned || 'Mrs. Shweta Sengupta'}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {req.admin_remarks && (
                                <div className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-[11px] text-slate-600 dark:text-slate-300">
                                  <strong>Principal Order:</strong> {req.admin_remarks}
                                </div>
                              )}
                            </div>

                            {(req.status === 'Approved by Admin' || req.status === 'Scheduled') && (
                              <button
                                onClick={() => handleOpenAdmitCard()}
                                className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start lg:self-center"
                              >
                                <Printer className="h-4 w-4" />
                                <span>Special Admit Slip</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      </div>
                    );
                  })()}

                  {/* OFFICIAL CBSE DATESHEET TIMETABLE */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          CBSE Term 1 Final Datesheet &amp; Examination Timetable (Class 8)
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Standardized Centralized Assessment Schedule</span>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                        Exam Center #402 (Campus Block B)
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold bg-white dark:bg-slate-900">
                            <th className="p-3.5">Date &amp; Day</th>
                            <th className="p-3.5">Timing</th>
                            <th className="p-3.5">Subject Code &amp; Title</th>
                            <th className="p-3.5">Seating Allocation</th>
                            <th className="p-3.5">Paper Format</th>
                            <th className="p-3.5 text-center">Admit Card</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {studentExamSchedules.length > 0 ? (
                            studentExamSchedules.map((s, idx) => (
                              <tr key={s.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                <td className="p-3.5 font-bold text-slate-900 dark:text-white">{s.exam_date}</td>
                                <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">{s.start_time} – {s.end_time}</td>
                                <td className="p-3.5">
                                  <span className="font-bold text-slate-900 dark:text-white block">{s.title || `${s.subject} Examination`}</span>
                                  <span className="text-[10px] text-slate-400">Code: SUB-{101 + idx}</span>
                                </td>
                                <td className="p-3.5">
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-bold text-[11px] border border-blue-200 dark:border-blue-800">
                                    {s.hall_name || 'Virtual Room A'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-600 dark:text-slate-300">
                                  {s.exam_mode === 'MODE_HYBRID_SCAN' ? '📝 Descriptive & Scan' : s.exam_mode === 'MODE_OFFLINE' ? '🏢 Physical Offline Hall' : '💻 CBT Online Test'}
                                </td>
                                <td className="p-3.5 text-center">
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                    Verified ✓
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : isDemoStudent ? (
                            [
                              { date: '19 Oct 2026 (Mon)', time: '09:30 AM – 12:30 PM', code: '041', subject: 'Mathematics (Theory)', room: 'Hall B, Desk #A-14', format: '100 Marks Descriptive', required: 'Verified ✓', mode: 'MODE_OFFLINE' },
                              { date: '21 Oct 2026 (Wed)', time: '09:30 AM – 12:30 PM', code: '086', subject: 'Science (Physics, Chem, Bio)', room: 'Hall B, Desk #A-14', format: 'Theory & Practical Lab', required: 'Verified ✓', mode: 'MODE_OFFLINE' },
                              { date: '23 Oct 2026 (Fri)', time: '09:30 AM – 12:30 PM', code: '184', subject: 'English Language & Literature', room: 'Hall B, Desk #A-14', format: 'Descriptive & Drama Essay', required: 'Verified ✓', mode: 'MODE_OFFLINE' },
                              { date: '26 Oct 2026 (Mon)', time: '09:30 AM – 12:30 PM', code: '087', subject: 'Social Science (Hist/Civ/Geo)', room: 'Hall B, Desk #A-14', format: 'Theory & Map Pointing', required: 'Verified ✓', mode: 'MODE_OFFLINE' },
                              { date: '28 Oct 2026 (Wed)', time: '09:30 AM – 12:30 PM', code: '085', subject: 'Second Language (Hindi)', room: 'Hall B, Desk #A-14', format: 'Grammar & Long Essay', required: 'Verified ✓', mode: 'MODE_OFFLINE' },
                            ].map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                <td className="p-3.5 font-bold text-slate-900 dark:text-white">{row.date}</td>
                                <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">{row.time}</td>
                                <td className="p-3.5">
                                  <span className="font-bold text-slate-900 dark:text-white block">{row.subject}</span>
                                  <span className="text-[10px] text-slate-400">Code: {row.code}</span>
                                </td>
                                <td className="p-3.5">
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-bold text-[11px] border border-blue-200 dark:border-blue-800">
                                    {row.room}
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-600 dark:text-slate-300">{row.format}</td>
                                <td className="p-3.5 text-center">
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                    {row.required}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500">
                                No official examinations scheduled for your class at this time.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* OFFICIAL CBSE CANDIDATE EXAMINATION PROTOCOL & HYBRID RULES */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-violet-50/70 via-indigo-50/40 to-purple-50/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 border border-violet-200 dark:border-violet-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-3.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-200/60 dark:border-violet-900/40 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                            Official Candidate Examination Rules &amp; Hybrid Proctoring Protocol
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">CBSE Central Examination Cell Directives (Affiliation #830029)</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800 w-fit">
                        Official Academic Code of Conduct
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-violet-700 dark:text-violet-300 text-xs block">
                          ✍️ 1. Physical Paper Writing
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Write all working on standard physical ruled answer sheets with blue/black pen. Write Roll Number (#14) on every sheet.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-violet-700 dark:text-violet-300 text-xs block">
                          📷 2. Unbroken Camera Custody
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Keep your web camera focused on your face, hands, and desk workspace. Head turns away from desk trigger AI proctor alerts.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-rose-600 dark:text-rose-400 text-xs block">
                          🚫 3. Prohibited Devices &amp; Penalty
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Smartphones, smartwatches, and second screens are banned. Repeated infractions incur an official 5-mark penalty or eviction.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-violet-700 dark:text-violet-300 text-xs block">
                          🎙️ 4. Invigilator Voice Intercom
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Chief Invigilator (Mrs. Ananya Verma) has live push-to-talk voice access. Listen and follow verbal instructions promptly.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs block">
                          🔐 5. Dynamic Submission Seal
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          A 6-digit seal code (#HYBRID-8492) pops when time finishes. Write this in ink on every sheet before scanning &amp; uploading.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-1 shadow-2xs">
                        <span className="font-black text-violet-700 dark:text-violet-300 text-xs block">
                          ⏱️ 6. 15-Min Scan Grace Window
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          Writing must cease promptly when timer expires. A dedicated 15-minute window is provided exclusively for scanning pages.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* SUB-TAB 2: TERM RESULTS & DESCRIPTIVE SCRIPT REVIEW     */}
              {/* ======================================================= */}
              {examSubTab === 'results' && (
                <div className="space-y-6">
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

                    {!isDemoStudent ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                          <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          No Previous Examination Papers
                        </h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          You have not taken or submitted any terminal examination papers yet. When descriptive exams are conducted, your evaluated papers and marks will appear here.
                        </p>
                      </div>
                    ) : (
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
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                            (studentSubmittedExams[1]?.pct ?? 52) <= 70
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            Graded ({studentSubmittedExams[1]?.pct ?? 52}%)
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                            <span>Submitted Paper:</span>
                            <a
                              href="/samples/math_exam_sample.svg"
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>{studentSubmittedExams[1]?.fileName || 'Aarav_Sharma_Math_Term1_Paper.pdf'}</span>
                            </a>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                            <span>Score: <strong>{studentSubmittedExams[1]?.marks ?? 52} / 100</strong></span>
                            {(studentSubmittedExams[1]?.pct ?? 52) <= 70 ? (
                              <button
                                type="button"
                                onClick={() => setActiveNav('focus_table')}
                                className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                              >
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                <span>In 1-Week Focus Sprint &rarr;</span>
                              </button>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                ✓ Mastery Exemption (&gt;70%)
                              </span>
                            )}
                          </div>
                          {studentSubmittedExams[1]?.weak_concept && (
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50/60 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-100 dark:border-rose-900/40">
                              Diagnosed Lag: <strong>{studentSubmittedExams[1].weak_concept}</strong>
                            </div>
                          )}
                          {studentSubmittedExams[1]?.feedback && (
                            <div className="text-[10px] text-slate-500 italic">
                              Teacher remarks: &ldquo;{studentSubmittedExams[1].feedback}&rdquo;
                            </div>
                          )}
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
                    )}
                  </div>

                  {/* Virtual Examination Hall & Answer Upload Modal */}
                  {activeUploadExam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
                      <div className="w-full max-w-5xl max-h-[92vh] rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                        
                        {/* Header Strip with Proctor Telemetry, Watermark & Timer */}
                        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0">
                              <Lock className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                                  CBSE Virtual Examination Hall
                                </span>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                  ● Camera Supervision Active
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-white leading-tight">
                                {activeUploadExam.title}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2 text-xs font-mono">
                              <Clock className="h-3.5 w-3.5 text-amber-400" />
                              <span className="text-amber-300 font-bold">01:29:45</span>
                              <span className="text-[10px] text-slate-400">(+15m Buffer)</span>
                            </div>
                            <button
                              onClick={() => setActiveUploadExam(null)}
                              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Candidate Watermark Bar */}
                        <div className="bg-purple-950/40 border-b border-purple-900/30 px-5 py-1.5 text-[11px] font-mono text-purple-300 flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>CANDIDATE: <b>{user?.name || 'Aarav Sharma'}</b> · ROLL #01 · CLASS 8-B · DESK #A-14</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider hidden sm:inline">
                            Strictly Confidential &bull; Watermarked Paper
                          </span>
                        </div>

                        {/* Body: Left Question Paper (Watermarked) & Right Camera Proctor + Upload */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
                          
                          {/* Left: Official Watermarked Question Paper (7 cols) */}
                          <div className="lg:col-span-7 flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="h-4 w-4 text-purple-600" />
                                Official Question Paper
                              </span>
                              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                                Max Marks: 100 &bull; Duration: 90 Mins
                              </span>
                            </div>

                            {/* Paper Sheet Preview with Repeating Diagonal Watermark */}
                            <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs overflow-hidden flex-1 font-serif text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed space-y-4">
                              
                              {/* Faint repeating watermark background */}
                              <div className="absolute inset-0 pointer-events-none select-none opacity-5 dark:opacity-10 flex flex-col justify-around rotate-[-25deg] scale-125 font-black text-xs text-slate-900 dark:text-white">
                                <div>AARAV SHARMA #01 &bull; CBSE TERM 1 ASSESSMENT &bull; ROOM 204 &bull; AARAV SHARMA #01</div>
                                <div>AARAV SHARMA #01 &bull; CBSE TERM 1 ASSESSMENT &bull; ROOM 204 &bull; AARAV SHARMA #01</div>
                                <div>AARAV SHARMA #01 &bull; CBSE TERM 1 ASSESSMENT &bull; ROOM 204 &bull; AARAV SHARMA #01</div>
                                <div>AARAV SHARMA #01 &bull; CBSE TERM 1 ASSESSMENT &bull; ROOM 204 &bull; AARAV SHARMA #01</div>
                              </div>

                              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 text-center space-y-1">
                                <h4 className="font-sans font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                                  Central Board of Secondary Education (CBSE)
                                </h4>
                                <p className="font-sans text-xs text-slate-500 font-bold">
                                  Class 8 Mathematics Terminal Descriptive Assessment (Set A)
                                </p>
                                <div className="font-sans text-[11px] text-slate-400">
                                  General Instructions: Show all intermediate algebraic steps. Rough work must be indicated clearly on the margin.
                                </div>
                              </div>

                              <div className="space-y-3 relative z-10">
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                                  <div className="flex justify-between font-sans font-bold text-xs text-purple-700 dark:text-purple-300">
                                    <span>Question 1: Rational Numbers &amp; Properties</span>
                                    <span>(10 Marks)</span>
                                  </div>
                                  <p className="text-xs">
                                    Find the multiplicative inverse and additive inverse of -7/11. Verify the distributive property over addition for a = 1/2, b = -2/3, c = 5/6.
                                  </p>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                                  <div className="flex justify-between font-sans font-bold text-xs text-purple-700 dark:text-purple-300">
                                    <span>Question 2: Linear Equations in One Variable</span>
                                    <span>(15 Marks)</span>
                                  </div>
                                  <p className="text-xs">
                                    Solve for x: 4(2x - 3) - 3(x - 5) = 2(x + 4) - 7. Show complete intermediate sign distribution steps and check your solution.
                                  </p>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                                  <div className="flex justify-between font-sans font-bold text-xs text-purple-700 dark:text-purple-300">
                                    <span>Question 3: Quadratic Expressions &amp; Factorization</span>
                                    <span>(15 Marks)</span>
                                  </div>
                                  <p className="text-xs">
                                    Factorize completely using the middle term splitting method: x^2 - 7x + 12 = 0 and 2x^2 + 7x + 3 = 0. Specify root solutions.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Camera Proctor Supervision & Upload Zone (5 cols) */}
                          <div className="lg:col-span-5 flex flex-col space-y-4">
                            
                            {/* Live Proctor Camera Feed HUD */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                  <Camera className="h-4 w-4 text-purple-600" />
                                  Proctor Camera Telemetry
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
                                  Face Centered ✓
                                </span>
                              </div>

                              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-purple-500/40 aspect-video flex items-center justify-center shadow-inner">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-10" />
                                
                                {/* Simulated Proctor Video Feed */}
                                <div className="flex flex-col items-center justify-center p-4 text-center text-white relative z-0">
                                  <div className="relative mb-2">
                                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center">
                                      <Camera className="h-8 w-8 text-emerald-400 animate-pulse" />
                                    </div>
                                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                                  </div>
                                  <span className="text-xs font-bold font-sans">Aarav Sharma (Candidate #01)</span>
                                  <span className="text-[10px] text-slate-400 font-mono">Stream Encrypted &bull; 1080p 30fps</span>
                                </div>

                                {/* Corner HUD Indicators */}
                                <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-bold text-white font-mono">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                                  <span>REC &bull; LIVE PROCTOR</span>
                                </div>
                                <div className="absolute bottom-2.5 right-2.5 z-20 text-[9px] font-mono text-emerald-400 bg-black/70 px-2 py-0.5 rounded-full">
                                  Noise: 22dB (Quiet)
                                </div>
                              </div>
                            </div>

                            {/* Scanned Answer Sheet Attachment Box */}
                            <div className="space-y-2 flex-1 flex flex-col justify-between">
                              <div>
                                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                                  Attach Scanned Handwritten Answer Sheet:
                                </label>
                                
                                <div className="border-2 border-dashed border-purple-300 dark:border-purple-800/80 rounded-2xl p-4 text-center space-y-2.5 bg-purple-50/30 dark:bg-purple-950/20">
                                  <FileCheck className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto" />
                                  <div>
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                                      {examAnswerFileName}
                                    </div>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      3 Pages Scanned &bull; PDF / High-Res Image format
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExamAnswerFileName('Aarav_Sharma_Math_Term1_Paper.pdf');
                                      setExamAnswerFileUrl('/samples/math_exam_sample.svg');
                                      triggerToast('Attached Aarav Sharma official math exam scan with rough work.');
                                    }}
                                    className="px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs transition-all"
                                  >
                                    📎 Load Solved Answer Sheets (3 Pages)
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                                  Student Notes / Page Legend:
                                </label>
                                <textarea
                                  rows={2}
                                  value={examStudentNotes}
                                  onChange={(e) => setExamStudentNotes(e.target.value)}
                                  placeholder="e.g. Page 1: Q1 & Q2. Page 2: Q3 factoring steps. Page 3: Rough paper calculations."
                                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                                />
                              </div>

                              {/* Submit Action */}
                              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                                <button
                                  onClick={() => setActiveUploadExam(null)}
                                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  disabled={isSubmittingExamPaper}
                                  onClick={handleUploadExamPaper}
                                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                  <Upload className="h-4 w-4" />
                                  <span>{isSubmittingExamPaper ? 'Transmitting to Secrecy Strongroom...' : 'Submit to Teacher Evaluation Ledger'}</span>
                                </button>
                              </div>

                            </div>

                          </div>

                        </div>

                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================= */}
              {/* SUB-TAB 3: OFFICIAL CBSE REPORT CARD & MARKSHEET        */}
              {/* ======================================================= */}
              {examSubTab === 'report_card' && (
                studentReportCard?.is_on_hold ? (
                  <div className="rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30 p-8 text-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center font-bold">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Institutional Fee Clearance Hold: Report Card Withheld
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                      {studentReportCard.hold_reason || "Your official term report card has been withheld by the Accounts Department due to pending fee dues. Please contact the Accounts Office to clear outstanding balances."}
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Accounts Lock Active · Academic Memo Withheld</span>
                    </div>
                  </div>
                ) : !studentReportCard || !studentReportCard.is_published ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Official Term 1 Report Card Under Compilation &amp; Moderation
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Subject examination papers are currently undergoing academic evaluation and official moderation by the Exam Cell. Your consolidated CBSE report card and Gemini AI narrative will be released here once published by the Exam Coordinator.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                      <span>Release Gate Active · Pending Final Coordinator Seal</span>
                    </div>
                  </div>
                ) : (
                <div className="space-y-6">
                  {/* OVERALL PERFORMANCE BANNER */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Term 1 Final Aggregate</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                        {studentReportCard.overall_percentage}%
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
                        {studentReportCard.total_marks_obtained} / {studentReportCard.max_total_marks}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Grade: {studentReportCard.overall_grade} Distinction
                      </span>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Examination Controller Status</span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1 block flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" /> {studentReportCard.is_moderated ? 'Officially Moderated & Sealed' : 'Officially Verified'}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                        Published to Student Portal ✓
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
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Term 1 — Subject Performance Matrix &amp; Grades
                        </h3>
                        <span className="text-xs text-slate-500 font-semibold">Standardized CBSE Assessment</span>
                      </div>
                      <button
                        onClick={() => setIsEvalKeyOpen(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        <span>View Evaluation Key &amp; AI Evaluated Script</span>
                      </button>
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
                                      <span>1-Week Remedial Active</span>
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
                )
              )}
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
                    <span>Upload Award Certificate</span>
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
                            ? 'bg-[var(--primary)] text-white font-bold shadow-xs'
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
                    {participationsList.length > 0 ? (
                      participationsList.map((p) => (
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
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.verified_by_school
                                ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950'
                                : 'text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950'
                            }`}>
                              {p.verified_by_school ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Official School Record Verified</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                  <span>Pending School Verification</span>
                                </>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {p.verified_by_school ? 'Academic Coordinator Sign-off' : 'Under Review'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
                        <p className="font-bold text-slate-600 dark:text-slate-300">No School Participations Recorded</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Verified inter-house events and committee assignments will appear here.</p>
                      </div>
                    )}
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
          {/* VIEW: LIVE INTERACTIVE CLASSROOM                     */}
          {/* ===================================================== */}
          {activeNav === 'live_classes' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-0.5 text-xs font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Interactive Stream
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">WebRTC Encrypted &bull; Section 8-A</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Live Video Classroom &amp; Interactive Periods
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Join ongoing periods in real-time with two-way audio, collaborative whiteboard, and instant doubt resolution
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveNav('recordings')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Video className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Open Recordings Archive &rarr;</span>
                  </button>
                  {activePeriod ? (
                    <button
                      onClick={handleJoinLiveClass}
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white px-4 py-2 text-xs font-bold shadow-md shadow-[var(--primary)]/20 transition-all cursor-pointer"
                    >
                      <Radio className="h-3.5 w-3.5 animate-pulse" />
                      <span>Join Active {activePeriod.periodNum}</span>
                    </button>
                  ) : isSchoolConcluded ? (
                    <button
                      onClick={() => setActiveNav('recordings')}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Today's Classes Concluded</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinLiveClass}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-md shadow-slate-900/20 transition-all cursor-pointer"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Waiting Lobby</span>
                    </button>
                  )}
                </div>
              </div>

              {/* HERO LIVE BROADCAST CARD */}
              {activePeriod ? (
                <div className="rounded-3xl border-2 border-blue-500/40 bg-gradient-to-br from-[#0B132B] via-[#101A36] to-[#080E21] text-white p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                          LIVE NOW &bull; {activePeriod.periodNum}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{activePeriod.timeRange}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {activePeriod.subject}: {activePeriod.topic}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        Faculty {activePeriod.faculty} is conducting interactive classroom instruction in {activePeriod.room}.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                      <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1 text-left md:text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">Classroom Telemetry</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                          <span>28 of 30 Peers Connected</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">Host: {activePeriod.faculty}</span>
                      </div>

                      <button
                        onClick={handleJoinLiveClass}
                        className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-3 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Enter Live Room</span>
                      </button>
                    </div>
                  </div>

                  {/* Features Bar */}
                  <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>1080p Ultra HD Audio &amp; Video</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>AI Live Captions &amp; Notes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>Safe Student Sandbox Mode</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-400 shrink-0" />
                      <span>Auto-Archived to Recordings</span>
                    </div>
                  </div>
                </div>
              ) : isSchoolConcluded ? (
                <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-[#0F172A] text-white p-6 sm:p-8 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          Academic Day Concluded
                        </span>
                        <span className="text-xs text-slate-400 font-medium">All 6/6 Periods Attended</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Today&apos;s Live Broadcasts Are Complete
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        School hours for today have wrapped up. You can re-watch today&apos;s recorded lectures, review teacher notes, or complete pending homework assignments below.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => setActiveNav('recordings')}
                        className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3 shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Video className="h-4 w-4" />
                        <span>Watch Archived Lectures</span>
                      </button>
                      <button
                        onClick={() => setActiveNav('homework')}
                        className="rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs sm:text-sm px-5 py-3 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="h-4 w-4 text-amber-400" />
                        <span>View Homeworks</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0B132B] via-[#101A36] to-[#080E21] text-white p-6 sm:p-8 shadow-xl space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                          {isMorningBreak ? 'Morning Recess' : isLunchBreak ? 'Lunch Break' : 'Waiting Lobby'}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {isMorningBreak ? 'Morning Recess Break in Session' : isLunchBreak ? 'Lunch Break in Session' : 'Classes Commence at 08:30 AM'}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        Live stream will automatically initialize when the next scheduled period begins.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TODAY'S SCHEDULED LIVE PERIODS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Today&apos;s Live Periods &bull; Wednesday, 28 Oct 2026
                  </h3>
                  <button
                    onClick={() => setActiveNav('timetable')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    View Weekly Timetable &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {evaluatedPeriods.map((p) => {
                    const isLive = p.status === 'live';
                    const isCompleted = p.status === 'completed';
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isLive 
                            ? 'border-blue-400/80 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-800 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.periodNum} ({p.timeRange})</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLive ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse' :
                            isCompleted ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {isLive ? 'LIVE NOW' : isCompleted ? 'Completed ✓' : 'Upcoming'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{p.subject}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Faculty: {p.faculty} • {p.room}</p>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                          {isLive ? (
                            <button
                              onClick={handleJoinLiveClass}
                              className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-center cursor-pointer shadow-xs"
                            >
                              Join Active Class Now
                            </button>
                          ) : isCompleted ? (
                            <button
                              onClick={() => setActiveNav('recordings')}
                              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Video className="h-3 w-3" />
                              <span>Watch Recording</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Stream starts at period time</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick-Launch Bar for Recordings */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/60 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Looking for earlier lectures or missed classes?</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">All lectures are archived with synced chapter markers and verified notes PDF.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveNav('recordings')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  View Full Recordings Archive &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* VIEW: CLASS RECORDINGS DEDICATED ARCHIVE              */}
          {/* ===================================================== */}
          {activeNav === 'recordings' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {activeRecordingDetail ? (
                /* ======================================================= */
                /* DEDICATED PLAYER & CONCEPTS SCREEN (SUB-VIEW)           */
                /* ======================================================= */
                <div className="space-y-6">
                  {/* Top Bar / Breadcrumb / Back button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveRecordingDetail(null)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to All Recordings</span>
                      </button>
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>Class Archive</span>
                        <span>/</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{activeRecordingDetail.subject}</span>
                        <span>/</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{activeRecordingDetail.chapter}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadNotes(activeRecordingDetail.subject, activeRecordingDetail.chapter)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Notes PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Lesson Header Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-3 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                        {activeRecordingDetail.subject}
                      </span>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-medium">
                        {activeRecordingDetail.chapter}
                      </span>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                        1080p HD Archive
                      </span>
                    </div>

                    <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                      {activeRecordingDetail.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>👨‍🏫 Faculty: <strong className="text-slate-800 dark:text-slate-200">{activeRecordingDetail.teacher_name}</strong></span>
                      <span>&bull;</span>
                      <span>📅 Recorded: <strong className="text-slate-800 dark:text-slate-200">{activeRecordingDetail.date}</strong></span>
                      <span>&bull;</span>
                      <span>⏱ Duration: <strong className="text-slate-800 dark:text-slate-200">{activeRecordingDetail.duration}</strong></span>
                      <span>&bull;</span>
                      <span>🏫 Class: <strong className="text-slate-800 dark:text-slate-200">8-A</strong></span>
                    </div>
                  </div>

                  {/* SPLIT LAYOUT: Left Video (7 cols) + Right Concepts Covered (5 cols) */}
                  {(() => {
                    const activeChapters = getRecordingChapters(activeRecordingDetail);
                    const currentChapter = activeChapters[activeRecordingChapterIndex] || activeChapters[0];

                    return (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          {/* LEFT: Video Player (7 cols) */}
                          <div className="lg:col-span-7 space-y-3">
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-200 dark:border-slate-800">
                              <video
                                key={`${activeRecordingDetail.id}-${activeRecordingChapterIndex}`}
                                src={activeRecordingDetail.video_url}
                                controls
                                autoPlay
                                poster={activeRecordingDetail.thumbnail}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Player Status & Now Playing Chapter */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="flex h-2.5 w-2.5 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                                </span>
                                <span className="text-slate-500 dark:text-slate-400">Current Chapter:</span>
                                <strong className="text-slate-900 dark:text-white font-bold">{currentChapter.label}</strong>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                  ⏱ {currentChapter.time}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">1080p HD Audio</span>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT: Concepts Covered in this Class (5 cols) */}
                          <div className="lg:col-span-5 space-y-4">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div>
                                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1.5"><Icon3D name="book" size={18} /><span>Concepts Covered in this Class</span></span>
                                  </h3>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Curriculum breakdown &amp; faculty takeaways
                                  </p>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                                  {activeChapters.length} Key Concepts
                                </span>
                              </div>

                              {/* Concepts list */}
                              <div className="space-y-2.5">
                                {activeChapters.map((ch, idx) => {
                                  const isSelected = activeRecordingChapterIndex === idx;
                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setActiveRecordingChapterIndex(idx)}
                                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/80'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                            isSelected
                                              ? 'bg-blue-600 text-white'
                                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                          }`}>
                                            {idx + 1}
                                          </span>
                                          <span className={`text-xs font-bold leading-tight ${
                                            isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'
                                          }`}>
                                            {ch.label}
                                          </span>
                                        </div>
                                        <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                                          {ch.time}
                                        </span>
                                      </div>

                                      {ch.key_takeaway && (
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 pl-7 leading-relaxed">
                                          <span className="inline-flex items-center gap-1.5"><Icon3D name="bulb" size={16} /><span>{ch.key_takeaway}</span></span>
                                        </p>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Active Takeaway Callout Box */}
                              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Faculty Tip for Active Topic
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                    Timestamp: {currentChapter.time}
                                  </span>
                                </div>
                                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                                  {currentChapter.key_takeaway || 'Pay strict attention to algebraic signs and maintain step-wise work.'}
                                </p>
                              </div>

                              {/* Faculty Notes Download Action */}
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="text-xs">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Class Notes Handout</span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Includes solved practice problems</span>
                                </div>
                                <button
                                  onClick={() => handleDownloadNotes(activeRecordingDetail.subject, activeRecordingDetail.chapter)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>Get PDF</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BOTTOM: Time-based Chapter Markers & Lecture Timeline */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>Interactive Chapter Timeline &amp; Timestamp Markers</span>
                              </h3>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Click any timestamp card below to jump immediately to that point in the lecture
                              </p>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              Total Duration: <strong className="text-slate-800 dark:text-slate-200">{activeRecordingDetail.duration}</strong>
                            </span>
                          </div>

                          {/* Timeline Cards Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                            {activeChapters.map((ch, idx) => {
                              const isSelected = activeRecordingChapterIndex === idx;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActiveRecordingChapterIndex(idx)}
                                  className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/50 scale-[1.02]'
                                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-blue-400 hover:bg-white dark:hover:bg-slate-800'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                        isSelected
                                          ? 'bg-white/20 text-white'
                                          : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                                      }`}>
                                        ⏱ {ch.time}
                                      </span>
                                      {isSelected && (
                                        <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded">
                                          Playing
                                        </span>
                                      )}
                                    </div>
                                    <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${
                                      isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                                    }`}>
                                      {idx + 1}. {ch.label}
                                    </h4>
                                  </div>

                                  <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px]">
                                    <span className={isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}>
                                      {isSelected ? 'Current position' : 'Click to jump'}
                                    </span>
                                    <Play className={`h-3 w-3 ${isSelected ? 'fill-current' : 'text-blue-500'}`} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                /* ======================================================= */
                /* RECORDINGS LISTING & SEARCH SCREEN                      */
                /* ======================================================= */
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                          High-Definition Video Archive
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Class 8-A &bull; Term 1</span>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                        📹 Class Recordings &amp; Lecture Catch-up
                      </h1>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Review recorded classroom lessons, jump to key concept chapters, and download faculty study notes PDF
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveNav('live_classes')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-[var(--primary)]/20 cursor-pointer"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Join Active Live Period 3 &rarr;</span>
                      </button>
                    </div>
                  </div>

                  {/* SEARCH & SUBJECT FILTERS */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Subject Filter Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {['All', 'Mathematics', 'Physics', 'English', 'Chemistry'].map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setSelectedSubjectFilter(sub)}
                          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            selectedSubjectFilter.toLowerCase() === sub.toLowerCase()
                              ? 'bg-[var(--primary)] text-white font-bold shadow-xs ring-2 ring-[var(--primary)]/30'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative min-w-[260px]">
                      <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={recordingsSearch}
                        onChange={(e) => setRecordingsSearch(e.target.value)}
                        placeholder="Search by topic, chapter, teacher..."
                        className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {recordingsSearch && (
                        <button
                          onClick={() => setRecordingsSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RECORDINGS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredRecordings.map((rec) => (
                      <div
                        key={rec.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                      >
                        <div>
                          {/* Video Thumbnail & Duration */}
                          <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                            <img
                              src={rec.thumbnail || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400'}
                              alt={rec.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                            />
                            <button
                              onClick={() => {
                                setActiveRecordingChapterIndex(0);
                                setActiveRecordingDetail(rec);
                              }}
                              className="absolute inset-0 flex items-center justify-center cursor-pointer"
                              title="Click to play recording"
                            >
                              <div className="h-12 w-12 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="h-5 w-5 ml-0.5 fill-current" />
                              </div>
                            </button>
                            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 font-semibold">
                              <span className="bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">{rec.chapter}</span>
                              <span className="bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                                {rec.duration} &bull; 1080p HD
                              </span>
                            </div>
                          </div>

                          {/* Content Area */}
                          <div className="p-4 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                                {rec.subject}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                {rec.date} &bull; Period 3
                              </span>
                            </div>

                            {/* What was taught today title */}
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                                Today&apos;s Topic Covered:
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                {rec.title}
                              </h4>
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Instructor: <strong className="text-slate-700 dark:text-slate-300">{rec.teacher_name}</strong>
                            </p>

                            {/* Concepts Breakdown Badge */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1 font-medium">
                                <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span>{(rec.chapters && rec.chapters.length) || 4} Core Concepts</span>
                              </span>
                              <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                                Synced Chapters
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 pt-0">
                          <div className="pt-2.5 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => {
                                setActiveRecordingChapterIndex(0);
                                setActiveRecordingDetail(rec);
                              }}
                              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                              <span>Watch Class</span>
                            </button>
                            <button
                              onClick={() => handleDownloadNotes(rec.subject, rec.chapter)}
                              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Notes PDF</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty Search State */}
                    {filteredRecordings.length === 0 && (
                      <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <Video className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-50" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No recordings found</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {recordingsSearch ? `No lecture matched "${recordingsSearch}" for subject "${selectedSubjectFilter}".` : 'No class recordings are currently archived for this category.'}
                        </p>
                        {recordingsSearch && (
                          <button
                            onClick={() => setRecordingsSearch('')}
                            className="mt-3 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            Clear Search Query
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===================================================== */}
          {/* VIEW: TIMETABLE */}
          {/* ===================================================== */}
          {activeNav === 'timetable' && (() => {
            const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const todayDay = daysArr[currentSystemTime.getDay()];
            const timetableData = [
              { day: 'Monday', p1: 'English (Ms. Adams)', p2: 'Physics (Dr. Raman)', p3: 'Mathematics (Mrs. Verma)', p4: 'Chemistry (Mrs. Sen)', p5: 'History (Ms. Roy)', p6: 'Physical Ed. (Coach Anil)' },
              { day: 'Tuesday', p1: 'Mathematics (Mrs. Verma)', p2: 'Biology (Dr. Gupta)', p3: 'English Literature', p4: 'Geography (Ms. Roy)', p5: 'Art & Craft (Mr. Das)', p6: 'Hindi (Mrs. Trivedi)' },
              { day: 'Wednesday', p1: 'Physics (Dr. Raman)', p2: 'Chemistry (Mrs. Sen)', p3: 'Mathematics (Mrs. Verma)', p4: 'Computer Science (Mr. Nair)', p5: 'Social Science (Ms. Roy)', p6: 'Music / Western Choir' },
              { day: 'Thursday', p1: 'Mathematics (Mrs. Verma)', p2: 'English (Ms. Adams)', p3: 'Biology Lab (Dr. Gupta)', p4: 'Physics Lab (Dr. Raman)', p5: 'Library Reading', p6: 'Sports & Games' },
              { day: 'Friday', p1: 'Chemistry Lab', p2: 'Mathematics (Mrs. Verma)', p3: 'Robotics & STEM Lab', p4: 'History & Civics', p5: 'English Grammar', p6: 'Club Activities' }
            ];

            const renderPeriodCell = (pNum: number, rawText: string, isToday: boolean, isFocus: boolean = false) => {
              if (!isToday) {
                return <span>{rawText}</span>;
              }

              // Check if there is an active proxy substitution for today's period
              const sub = dailySubstitutions.find(s => 
                (s.status === 'Assigned' || s.status === 'Completed') &&
                s.period_number === pNum &&
                s.substitute_teacher_name
              );

              if (sub && sub.substitute_teacher_name) {
                const subjectName = rawText.includes('(') ? rawText.split('(')[0].trim() : (sub.subject || rawText);
                return (
                  <div className="flex flex-col gap-1 py-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {subjectName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Proxy: {sub.substitute_teacher_name}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                      Covering for {sub.absent_teacher_name} ({sub.absent_reason || 'On Leave'})
                    </span>
                  </div>
                );
              }

              return <span>{rawText}</span>;
            };

            return (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                      Weekly Class Timetable ({user?.class_name || 'Class 8'}-{user?.section || 'A'})
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Today is <strong>{todayDay}</strong> &bull; Instructional timetable for {user?.name || 'Student'} ({user?.class_name || 'Class 8'})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {dailySubstitutions.some(s => (s.status === 'Assigned' || s.status === 'Completed') && s.substitute_teacher_name) && (
                      <span className="rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Active Emergency Substitutions Today
                      </span>
                    )}
                    <span className="self-start sm:self-auto rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 text-xs font-bold">
                      Session: Term 1 (Autumn 2026)
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                        <th className="p-3.5">Day</th>
                        <th className="p-3.5">P1 (08:30-09:15)</th>
                        <th className="p-3.5">P2 (09:15-10:00)</th>
                        <th className="p-3.5 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border-x border-blue-200 dark:border-blue-800">
                          P3 (10:30-11:15) ★ Focus
                        </th>
                        <th className="p-3.5">P4 (11:15-12:00)</th>
                        <th className="p-3.5">P5 (01:00-01:45)</th>
                        <th className="p-3.5">P6 (01:45-02:30)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {timetableData.map((row, idx) => {
                        const isToday = row.day === todayDay || (idx === 0 && (todayDay === 'Saturday' || todayDay === 'Sunday'));
                        return (
                          <tr key={idx} className={isToday ? 'bg-blue-50/40 dark:bg-blue-950/30 font-semibold' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'}>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {row.day}
                              {isToday && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-[var(--primary)] text-white font-extrabold uppercase shadow-2xs">
                                  Today
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300">{renderPeriodCell(1, row.p1, isToday)}</td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300">{renderPeriodCell(2, row.p2, isToday)}</td>
                            <td className="p-3.5 bg-blue-50/30 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 font-bold border-x border-blue-100 dark:border-blue-900/60">
                              {renderPeriodCell(3, row.p3, isToday, true)}
                            </td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300">{renderPeriodCell(4, row.p4, isToday)}</td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300">{renderPeriodCell(5, row.p5, isToday)}</td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300">{renderPeriodCell(6, row.p6, isToday)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

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
                    <span className="text-xs text-slate-500 dark:text-slate-400">Class 8-B &bull; Multi-Subject Support</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    <span className="inline-flex items-center gap-2.5"><Icon3D name="target" size={28} /><span>My 1-Week Focus Table &amp; Daily Practice</span></span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Personalized 7-day micro-practice sprint targeting diagnosed conceptual lags with Socratic hints, formula guides, and rough notebook submission.
                  </p>
                </div>
              </div>

              {/* Dedicated 1-Week Remedial Focus Table with Gold Card Subject Filter */}
              <StudentRemedialView studentId={currentStudentId} />
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
                    className="rounded-xl bg-[var(--primary)] hover:opacity-95 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm shadow-[var(--primary)]/20 transition-all flex items-center gap-1.5 cursor-pointer"
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
                          ? 'bg-[var(--primary)] text-white font-bold shadow-xs'
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
                          ? 'bg-[var(--primary)] text-white font-bold shadow-xs'
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
                      { day: 1, weekday: 'Thu', status: isDemoStudent ? 'present' : 'upcoming', checkIn: isDemoStudent ? '08:05 AM' : undefined, rfid: isDemoStudent ? 'Gate 2' : undefined, periods: isDemoStudent ? '6/6 Attended' : '6 Periods Scheduled', notes: 'Normal school day' },
                      { day: 2, weekday: 'Fri', status: 'holiday', holidayName: 'Gandhi Jayanti', holidayType: 'National Gazetted Holiday' },
                      { day: 3, weekday: 'Sat', status: isDemoStudent ? 'present' : 'upcoming', checkIn: isDemoStudent ? '08:12 AM' : undefined, rfid: isDemoStudent ? 'Gate 1' : undefined, periods: isDemoStudent ? '4/4 Attended (Half Day)' : '4 Periods Scheduled', notes: 'Club activities' },
                      { day: 4, weekday: 'Sun', status: 'weekend' },
                      { day: 5, weekday: 'Mon', status: isDemoStudent ? 'present' : 'upcoming', checkIn: isDemoStudent ? '08:01 AM' : undefined, rfid: isDemoStudent ? 'Gate 2' : undefined, periods: isDemoStudent ? '6/6 Attended' : '6 Periods Scheduled', notes: 'Weekly assembly' },
                      { day: 6, weekday: 'Tue', status: isDemoStudent ? 'present' : 'upcoming', checkIn: isDemoStudent ? '08:03 AM' : undefined, rfid: isDemoStudent ? 'Gate 2' : undefined, periods: isDemoStudent ? '6/6 Attended' : '6 Periods Scheduled' },
                      { day: 7, weekday: 'Wed', status: isDemoStudent ? 'absent' : 'upcoming', leaveReason: isDemoStudent ? 'Approved Sick Leave' : undefined, doctorNote: isDemoStudent ? 'Dr. Sen Paediatrics note on record' : undefined, notes: isDemoStudent ? 'Viral fever — approved by Principal' : 'Regular School Day' },
                      { day: 8, weekday: 'Thu', status: isDemoStudent ? 'present' : 'upcoming', checkIn: isDemoStudent ? '08:08 AM' : undefined, rfid: isDemoStudent ? 'Gate 2' : undefined, periods: isDemoStudent ? '6/6 Attended' : '6 Periods Scheduled' },
                      { day: 9, weekday: 'Fri', status: isDemoStudent ? 'present' : 'upcoming', checkIn: isDemoStudent ? '08:04 AM' : undefined, rfid: isDemoStudent ? 'Gate 2' : undefined, periods: isDemoStudent ? '6/6 Attended' : '6 Periods Scheduled' },
                      { day: 10, weekday: 'Sat', status: isDemoStudent ? 'present' : 'upcoming', checkIn: isDemoStudent ? '08:10 AM' : undefined, rfid: isDemoStudent ? 'Gate 1' : undefined, periods: isDemoStudent ? '4/4 Attended' : '4 Periods Scheduled', notes: 'Saturday Activity' },
                      { day: 11, weekday: 'Sun', status: 'holiday', holidayName: 'Dussehra (Vijayadashami)', holidayType: 'Festival Public Holiday' },
                      { day: 12, weekday: 'Mon', status: isDemoStudent ? 'present' : 'upcoming', checkIn: isDemoStudent ? '08:02 AM' : undefined, rfid: isDemoStudent ? 'Gate 2' : undefined, periods: isDemoStudent ? '6/6 Attended' : '6 Periods Scheduled' },
                      { day: 13, weekday: 'Tue', status: isDemoStudent ? 'present' : 'upcoming', checkIn: isDemoStudent ? '08:05 AM' : undefined, rfid: isDemoStudent ? 'Gate 2' : undefined, periods: isDemoStudent ? '6/6 Attended' : '6 Periods Scheduled' },
                      { day: 14, weekday: 'Wed', status: isDemoStudent ? 'present' : 'upcoming', isToday: isDemoStudent, checkIn: isDemoStudent ? '08:02 AM' : undefined, rfid: isDemoStudent ? 'Gate 2 Turnstile' : undefined, periods: isDemoStudent ? (isSchoolConcluded ? '6/6 Attended (Day Concluded)' : activePeriod ? `${activePeriod.periodNum.replace('P', '')}/6 Attended (${activePeriod.periodNum} Live)` : '6 Periods Scheduled') : '6 Periods Scheduled', notes: isSchoolConcluded ? 'Academic day concluded' : 'Classes in session' },
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
                    ].map((rawItem) => {
                      // Check if there is a server event for this day in selectedCalendarMonth
                      const serverEv = serverCalendarEvents.find(ev => {
                        const dStr = (ev.date || '').toLowerCase();
                        let targetMonth = 'October 2026';
                        if (dStr.includes('oct') || dStr.includes('-10-')) targetMonth = 'October 2026';
                        else if (dStr.includes('nov') || dStr.includes('-11-')) targetMonth = 'November 2026';
                        else if (dStr.includes('dec') || dStr.includes('-12-')) targetMonth = 'December 2026';
                        if (targetMonth !== selectedCalendarMonth) return false;
                        const match = dStr.match(/\b([0-9]{1,2})\b/);
                        return match && parseInt(match[1], 10) === rawItem.day;
                      });

                      const item = serverEv && rawItem.status !== 'holiday' ? {
                        ...rawItem,
                        status: 'event',
                        eventName: serverEv.title,
                        eventTime: `${serverEv.location || 'Campus'} • ${serverEv.date}`,
                        notes: serverEv.description
                      } : rawItem;

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
                        (isDemoStudent && selectedCalendarDay === 14) ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        (isDemoStudent && selectedCalendarDay === 7) ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800' :
                        selectedCalendarDay === 2 || selectedCalendarDay >= 28 ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        selectedCalendarDay === 16 || selectedCalendarDay === 24 ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {(isDemoStudent && selectedCalendarDay === 14) ? '🟢 Present Today' :
                         (isDemoStudent && selectedCalendarDay === 7) ? '🔴 Medical Leave' :
                         selectedCalendarDay === 2 || selectedCalendarDay >= 28 ? '🟡 School Holiday' :
                         selectedCalendarDay === 16 || selectedCalendarDay === 24 ? '🟣 Campus Event' :
                         'Regular School Day'}
                      </span>
                    </div>

                    {/* Telemetry Breakdown for Selected Day */}
                    <div className="space-y-3 text-xs">
                      {(isDemoStudent && selectedCalendarDay === 7) ? (
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
                            Online schooling platform scheduled session break. Online LMS homework repositories remain accessible.
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
                            {isDemoStudent 
                              ? 'Auditorium gathering for Class 8 term evaluation review. Aarav ranked #4 in section.' 
                              : 'Auditorium gathering for Class 8 term evaluation review.'}
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
                            {isDemoStudent 
                              ? 'Aarav presenting smart robotics controller and dual portfolio certificates.' 
                              : 'CBSE Regional exhibition showcase and student presentations.'}
                          </p>
                          <button
                            onClick={() => setActiveNav('portfolio')}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white p-2 text-xs font-bold shadow-sm transition-all"
                          >
                            <Trophy className="h-3.5 w-3.5" />
                            <span>Navigate to Dual Portfolio</span>
                          </button>
                        </div>
                      ) : isDemoStudent ? (
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
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Homeroom Reporting · Room 204</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {selectedCalendarDay <= 14 ? '08:15 AM • Faculty: Mrs. Verma' : 'Scheduled 08:15 AM'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                              Verified
                            </span>
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
                      ) : (
                        <div className="space-y-3">
                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Scheduled School Day</span>
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                                6 Periods
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              Classes are conducted according to your section timetable. Real-time attendance is logged during classroom roll-call.
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveNav('timetable')}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white p-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
                          >
                            <Clock className="h-4 w-4" />
                            <span>View Class Timetable &amp; Schedule</span>
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

                // Dynamically merge live events from database
                if (serverCalendarEvents && serverCalendarEvents.length > 0) {
                  serverCalendarEvents.forEach((ev: any) => {
                    let targetMonth = 'November 2026';
                    let targetDay = 15;
                    const dStr = (ev.date || '').toLowerCase();
                    if (dStr.includes('oct') || dStr.includes('-10-')) targetMonth = 'October 2026';
                    else if (dStr.includes('nov') || dStr.includes('-11-')) targetMonth = 'November 2026';
                    else if (dStr.includes('dec') || dStr.includes('-12-')) targetMonth = 'December 2026';

                    const match = dStr.match(/\b([0-9]{1,2})\b/);
                    if (match) targetDay = parseInt(match[1], 10);

                    if (eventsData[targetMonth] && !eventsData[targetMonth].some(e => e.event.toLowerCase() === (ev.title || '').toLowerCase())) {
                      eventsData[targetMonth].push({
                        event: ev.title,
                        date: ev.date,
                        committee: `${ev.location || 'Campus'} • ${ev.description || 'School Event'}`,
                        targetNav: 'calendar' as NavSection,
                        day: targetDay
                      });
                    }
                  });
                }

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
              <UnifiedSISView
                studentId={currentStudentId}
                viewerRole="student"
              />
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
                      <span className="inline-flex items-center gap-1.5"><Icon3D name="lock" size={18} /><span>Official Student Vault — Maintained by School Administration</span></span> (Strictly View &amp; Download Only)
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
                        className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-opacity cursor-pointer"
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

      {/* MODAL 1: REAL LIVEKIT VIDEO CONFERENCE ROOM */}
      <EduVideoConferenceModal 
        isOpen={isLiveClassModalOpen}
        onClose={() => setIsLiveClassModalOpen(false)}
        roomName="class-8b-mathematics"
        roomTitle="Class 8-B Mathematics: Quadratic Equations & Roots"
        userName={user?.name || "Aarav Sharma"}
        userRole="STUDENT"
        studentId={currentStudentId}
        classId={(user as any)?.class_id || 1}
        studentContextName={user?.name || "Aarav Sharma"}
        onAttendanceVerified={(data?: { minutesElapsed?: number; status?: string }) => {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setAttendanceTimestamp(nowStr);
          setHasJoinedLive(true);
          const elapsed = data?.minutesElapsed ?? 3.5;
          const status = data?.status ?? (elapsed <= 10.0 ? 'Present' : 'Late');
          if (status === 'Late') {
            triggerToast(`⚠️ Joined +${elapsed.toFixed(1)}m into session: Flagged LATE (>10m stipulation). Pending Teacher Approval.`);
          } else {
            triggerToast(`🟢 LiveKit WebRTC Connected: Auto-Attendance Verified as PRESENT (joined +${elapsed.toFixed(1)}m on-time).`);
          }
          const effectiveClassId = (user as any)?.class_id || 1;
          api.simulateJoin(effectiveClassId, currentStudentId, elapsed).catch(() => {});
        }}
      />

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
                className="rounded-xl bg-[var(--primary)] hover:opacity-95 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-[var(--primary)]/20 cursor-pointer"
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

      {/* MODAL 5: VIDEO RECORDING PLAYER WITH CHAPTER TIMESTAMPS */}
      {activeVideoModal && (() => {
        const currentChapters = activeVideoModal.chapters || [
          { time: "02:15", label: "Chapter Introduction & Core Concept", key_takeaway: "Master fundamental equations and domain conventions before attempting calculations." },
          { time: "12:30", label: "Step-by-Step Derivation & Worked Examples", key_takeaway: "Step marking applies strictly; write explicit grouping steps." },
          { time: "25:40", label: "Common Traps, Sign Rules & Verification", key_takeaway: "Double-check negative coefficient expansions." }
        ];
        const selectedChapter = currentChapters[activeRecordingChapterIndex] || currentChapters[0];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200 overflow-y-auto">
            <div className="relative max-w-3xl w-full bg-[#0F172A] rounded-3xl overflow-hidden shadow-2xl border border-slate-700 text-white flex flex-col my-auto max-h-[92vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded">
                      {activeVideoModal.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {activeVideoModal.chapter}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mt-1">
                    {activeVideoModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video bg-black flex items-center justify-center shrink-0">
                <video
                  src={activeVideoModal.video_url}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Synced Chapter Timestamps Section */}
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="inline-flex items-center gap-1.5"><Icon3D name="memo" size={18} /><span>Synced Chapter Markers &amp; Concept Timestamps</span></span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Click timestamp to review teacher concept takeaway
                  </span>
                </div>

                {/* Chapter Pill List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentChapters.map((ch, idx) => {
                    const isSelected = activeRecordingChapterIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveRecordingChapterIndex(idx)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/50'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/30 text-blue-300">
                            ⏱ {ch.time}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-bold text-emerald-400">Active</span>
                          )}
                        </div>
                        <span className="text-xs font-bold block mt-1 line-clamp-1">
                          {ch.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Chapter Formula / Takeaway Box */}
                {selectedChapter && (
                  <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-blue-400">
                        Teacher Concept Takeaway (Timestamp: {selectedChapter.time})
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {activeVideoModal.teacher_name}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200 leading-relaxed">
                      <span className="inline-flex items-center gap-1.5"><Icon3D name="bulb" size={16} /><span>{selectedChapter.key_takeaway || selectedChapter.label}</span></span>
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
                <span className="text-slate-400 text-center sm:text-left">
                  Duration: {activeVideoModal.duration} • Instructor: {activeVideoModal.teacher_name} • {activeVideoModal.date}
                </span>
                <button
                  onClick={() => handleDownloadNotes(activeVideoModal.subject, activeVideoModal.chapter)}
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] hover:opacity-95 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm shadow-[var(--primary)]/20 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Synced Notes (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Dynamic Pop-Up Modal for Live Examination Session */}
      {newExamStudentAlert && examSubmissionState !== 'completed' && !isExamTimeExpired(newExamStudentAlert.time, newExamStudentAlert.date) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-indigo-500/80 p-6 sm:p-7 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Live Examination Hall Active
                </span>
              </div>
              <button 
                type="button" 
                onClick={handleDismissExamAlert} 
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-white">
                {newExamStudentAlert.subject} &bull; {newExamStudentAlert.className}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chief Invigilator <b className="text-indigo-300">{newExamStudentAlert.invigilator}</b> has commenced the live assessment session. MediaPipe edge AI surveillance is running.
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1">
                <p className="text-slate-300 font-medium"><b>Hall / Venue:</b> {newExamStudentAlert.hall || 'Virtual Exam Hall Alpha'}</p>
                <p className="text-slate-400 font-mono text-[11px]">{newExamStudentAlert.date} ({newExamStudentAlert.time})</p>
                <p className="text-emerald-400 text-[11px] font-bold">✓ Digital Hall Ticket HT-2026-8B-014 verified</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveNav('exams');
                  setOnlineExamSubject(newExamStudentAlert.subject);
                  setOnlineExamTopic(newExamStudentAlert.title);
                  setIsOnlineExamOpen(true);
                  handleDismissExamAlert();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Join Proctored Exam Room Now</span>
              </button>
              <button
                type="button"
                onClick={handleDismissExamAlert}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Proctoring & Online CBT Examination Modal */}
      <OnlineExamModal
        isOpen={isOnlineExamOpen}
        onClose={() => setIsOnlineExamOpen(false)}
        candidateId={currentStudentId}
        scheduleId={studentExamSchedules[0]?.id || 1}
        examTitle={`${onlineExamSubject}: ${onlineExamTopic}`}
        subject={onlineExamSubject}
        durationMinutes={onlineExamDuration}
        questionPrompt={onlineExamPrompt}
        maxMarks={onlineExamMaxMarks}
        examMode={onlineExamMode}
        studentName={user?.name || 'Aarav Sharma'}
        onOpenPdfUpload={(data) => {
          setPdfUploadData(data);
          setExamSubmissionState('upload_pending');
          try {
            localStorage.setItem('edu360_exam_submission_state', 'upload_pending');
            localStorage.setItem('edu360_exam_seal_code', data.sealCode || 'SEAL-8B-9482');
          } catch {}
          setIsPdfUploadModalOpen(true);
        }}
        onSubmitted={({ wordsCount }) => {
          setIsOnlineExamOpen(false);
          if (onlineExamMode === 'MODE_HYBRID_SCAN') {
            if (examSubmissionState !== 'completed') {
              setExamSubmissionState('upload_pending');
              try {
                localStorage.setItem('edu360_exam_submission_state', 'upload_pending');
              } catch {}
              setPdfUploadData({
                sealCode: 'SEAL-8B-9482',
                subject: onlineExamSubject,
                examTitle: `${onlineExamSubject}: ${onlineExamTopic}`
              });
              setIsPdfUploadModalOpen(true);
            }
            triggerToast(`✓ Examination writing completed! Seal Code SEAL-8B-9482 recorded. 15-minute PDF upload active.`);
          } else {
            setExamSubmissionState('completed');
            try {
              localStorage.setItem('edu360_exam_submission_state', 'completed');
            } catch {}
            triggerToast(`✓ Examination submitted successfully! ${wordsCount} words recorded under academic audit vault.`);
          }
        }}
      />

      {/* 15-Minute Answer Script PDF Upload Modal */}
      <StudentExamPdfUploadModal
        isOpen={isPdfUploadModalOpen}
        onClose={() => setIsPdfUploadModalOpen(false)}
        sealCode={pdfUploadData?.sealCode || 'SEAL-8B-9482'}
        studentName={user?.name || 'Aarav Sharma'}
        rollNo={String((user as any)?.roll_no || '14')}
        candidateId={currentStudentId}
        subject={pdfUploadData?.subject || onlineExamSubject}
        examTitle={pdfUploadData?.examTitle || `${onlineExamSubject}: ${onlineExamTopic}`}
        className={(user as any)?.class_name ? `${(user as any).class_name}-${(user as any).section || 'B'}` : 'Class 8-B'}
        initialReceipt={examUploadDetails}
        onUploadSuccess={(receiptData) => {
          setExamSubmissionState('completed');
          setExamUploadDetails(receiptData);
          try {
            localStorage.setItem('edu360_exam_submission_state', 'completed');
            localStorage.setItem('edu360_exam_upload_details', JSON.stringify(receiptData));
          } catch {}
          triggerToast(`✓ Answer Script (${receiptData.fileName}) with ${receiptData.pageCount} pages synced to Teacher Evaluation Desk!`);
        }}
      />

      {/* AI Evaluation Key & Graded Script Modal */}
      <EvaluationKeyModal
        isOpen={isEvalKeyOpen}
        onClose={() => setIsEvalKeyOpen(false)}
        subject="Mathematics"
        examTitle="Term 1 Periodic Assessment (Mid-Term)"
        studentName={user?.name || 'Aarav Sharma'}
        totalScore={22.5}
        maxTotal={25}
        grade="A1"
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
                  className="rounded-xl bg-[var(--primary)] hover:opacity-95 text-white font-bold text-xs px-5 py-2 shadow-sm shadow-[var(--primary)]/20 transition-all flex items-center gap-1.5 cursor-pointer"
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
                  ClockProvider.isOverdue(selectedTaskForSubmit.due_date, selectedTaskForSubmit.status)
                    ? 'bg-red-600'
                    : 'bg-[var(--primary)]'
                }`}>
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {ClockProvider.isOverdue(selectedTaskForSubmit.due_date, selectedTaskForSubmit.status)
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
              {ClockProvider.isOverdue(selectedTaskForSubmit.due_date, selectedTaskForSubmit.status) && (
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
                    const isLate = ClockProvider.isOverdue(selectedTaskForSubmit.due_date, selectedTaskForSubmit.status);
                    handleSubmitTaskWorksheet(selectedTaskForSubmit, isLate);
                  }}
                  className={`rounded-xl font-bold text-xs px-5 py-2 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                    ClockProvider.isOverdue(selectedTaskForSubmit.due_date, selectedTaskForSubmit.status)
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-[var(--primary)] hover:opacity-95'
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
                {!admitCardHold && (
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print</span>
                  </button>
                )}
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
            ) : admitCardHold ? (
              <div className="py-12 px-6 text-center space-y-4 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
                <div className="h-16 w-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-rose-700 dark:text-rose-400">Examination Hall Ticket Withheld</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto font-medium">
                    {admitCardHold}
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
                    <span>⚠️ Contact the Accounts &amp; Bursar Department to clear financial holds prior to examination commencement.</span>
                  </span>
                </div>
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
  const { user, logout, mounted } = useAuth();
  const [forceJunior, setForceJunior] = useState<boolean | null>(null);

  if (!mounted) {
    return (
      <RoleGuard allowedRole="student">
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070b14]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-amber-400 border-t-amber-600 rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading Student Portal...</span>
          </div>
        </div>
      </RoleGuard>
    );
  }

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
      id: 7,
      name: 'Ananya Sharma',
      email: 'ananya.junior@edu360.com',
      role: 'student',
      school_code: 'EDU-GLOBAL-360',
      avatar: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150',
      grade_tier: 'k5',
      is_junior_k5: true,
      student_id: 7
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
      <StandardStudentDashboard />
    </RoleGuard>
  );
}
