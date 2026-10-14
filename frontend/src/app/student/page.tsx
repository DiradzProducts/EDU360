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
  Award,
  Phone,
  MapPin,
  Check,
  Radio,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Printer
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  ClassRecording,
  StudentPortfolio,
  HomeworkSubmission,
  OfficialDocument,
  FocusTable
} from '@/lib/types';
import { RoleGuard } from '@/components/role-guard';
import { useTheme } from '@/lib/theme-context';
import { FocusTableView } from '@/components/focus-table-view';

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
    badge: 'Campus Spotlight',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    title: 'Annual Day in 5 Days — Stage Committees Assigned',
    subtitle: 'Aarav assigned to Western Choir (Lead Tenor) and Stage Tech Coordination committee.',
    actionLabel: 'SPOTLIGHT ACTION',
    actionTitle: 'Western Choir & Rehearsals',
    ctaText: 'View Rehearsal Calendar >',
    targetNav: 'calendar',
    gradient: 'from-[#121B35] to-[#0A0F24]'
  },
  {
    id: 2,
    badge: 'STEM & Robotics',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    title: 'Inter-School Science Olympiad 2026 Shortlist',
    subtitle: 'Congratulations Aarav! You have qualified for Phase 2 regional robotics and optics practicals.',
    actionLabel: 'SPOTLIGHT ACTION',
    actionTitle: 'Optics Lab Practice & Kits',
    ctaText: 'View Olympiad Details >',
    targetNav: 'portfolio',
    gradient: 'from-[#1E1B4B] to-[#0A0F24]'
  },
  {
    id: 3,
    badge: 'Remedial Target',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    title: 'My Focus Table: Quadratic Equations Intervention',
    subtitle: 'Mrs. Ananya Verma scheduled 4-day targeted revision and practice test series.',
    actionLabel: 'ACADEMIC ACTION',
    actionTitle: 'Complete Quadratic Worksheet 4.2',
    ctaText: 'Open My Focus Table >',
    targetNav: 'focus_table',
    gradient: 'from-[#0F172A] to-[#1E293B]'
  },
  {
    id: 4,
    badge: 'CBSE Examination',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    title: 'CBSE Term 1 Model Examination Schedule',
    subtitle: 'Seating arrangements and admit cards generated for Hall B, Desk #A-14.',
    actionLabel: 'EXAMINATION ACTION',
    actionTitle: 'Download Exam Admit Card PDF',
    ctaText: 'View Exam Schedule >',
    targetNav: 'exams',
    gradient: 'from-[#141E33] to-[#0B132B]'
  }
];

export default function StudentPage() {
  // Navigation & Layout State
  const [activeNav, setActiveNav] = useState<NavSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Application-Wide Theme
  const { theme, toggleTheme } = useTheme();
  const sidebarTheme = theme;

  // Attendance & Calendar State
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(14);
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'attendance' | 'holidays' | 'events'>('all');

  // Announcement Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  // Live Class Simulation State
  const [isLiveClassModalOpen, setIsLiveClassModalOpen] = useState(false);
  const [hasJoinedLive, setHasJoinedLive] = useState(false);
  const [attendanceTimestamp, setAttendanceTimestamp] = useState<string | null>(null);

  // Homework & Annotations State
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [homeworkFilter, setHomeworkFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [selectedFileForUpload, setSelectedFileForUpload] = useState<File | null>(null);
  const [isUploadingHomework, setIsUploadingHomework] = useState(false);
  const [homeworkSubmittedSuccess, setHomeworkSubmittedSuccess] = useState(false);

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

  // Upload Form Inputs
  const [newAwardTitle, setNewAwardTitle] = useState('');
  const [newAwardEvent, setNewAwardEvent] = useState('');
  const [newAwardCategory, setNewAwardCategory] = useState<'achievement' | 'participation'>('achievement');
  const [newAwardDesc, setNewAwardDesc] = useState('');

  // Documents & Toast State
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-dismissing toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load Data
  useEffect(() => {
    async function loadPortalData() {
      try {
        const [recRes, portRes, subRes, docsRes] = await Promise.all([
          api.getStudentRecordings(),
          api.getPortfolio(1),
          api.getSubmission(1),
          api.getStudentDocuments(1)
        ]);
        setRecordings(recRes);
        setPortfolio(portRes);
        setSubmission(subRes);
        setDocuments(docsRes);
      } catch (err) {
        console.error('Error fetching student data', err);
      }
    }
    loadPortalData();
  }, []);

  // Carousel Auto-Advancement
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % announcementSlides.length);
    }, 5500);
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
    triggerToast(`Downloading PDF Study Notes: ${subject} - ${chapter}`);
  };

  const handleCreateAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAwardTitle.trim()) return;

    const newRecord: StudentPortfolio = {
      id: portfolio.length + 10,
      student_id: 1,
      category: newAwardCategory,
      title: newAwardTitle,
      event_name: newAwardEvent,
      date: 'Oct 2026',
      proof_url: '/samples/certificate_preview.png',
      verified_by_school: false,
      description: newAwardDesc
    };

    setPortfolio([newRecord, ...portfolio]);
    setIsUploadAwardModalOpen(false);
    setNewAwardTitle('');
    setNewAwardEvent('');
    setNewAwardDesc('');
    triggerToast('Certificate submitted! Awaiting Academic Coordinator verification stamp.');
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
    parent_check_completed: true,
    status: 'in_progress',
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
      <div className="flex min-h-[calc(100vh-4rem)] w-full bg-[#F8FAFC] dark:bg-[#070B14] text-[#0F172A] dark:text-slate-100 font-sans antialiased transition-colors duration-150">
        
        {/* ========================================================= */}
        {/* 1. LEFT SIDEBAR NAVIGATION (240px Wide / Dark Slate or White) */}
        {/* ========================================================= */}
        <aside
          className={`relative z-20 flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none ${
            sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
          } ${
            sidebarTheme === 'dark'
              ? 'bg-[#0F172A] text-slate-200 border-r border-slate-800'
              : 'bg-white text-slate-800 border-r border-[#E2E8F0]'
          }`}
        >
          {/* Top Brand & School Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-inherit">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] text-white shadow-sm shadow-blue-500/20 shrink-0">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="flex flex-col truncate">
                  <span className={`text-sm font-bold tracking-tight flex items-center gap-1 ${
                    sidebarTheme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    EDU<span className="text-[#2563EB]">360</span>
                    <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-500 dark:text-blue-400">
                      STUDENT
                    </span>
                  </span>
                  <span className={`text-[11px] font-medium truncate ${
                    sidebarTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Oakridge International School
                  </span>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] text-white shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand Sidebar (240px)' : 'Collapse Sidebar [ < ]'}
              className={`p-1.5 rounded-lg transition-colors ${
                sidebarTheme === 'dark'
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              } ${sidebarCollapsed ? 'hidden' : 'block'}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Collapse Expand Toggle for Compact Mode */}
          {sidebarCollapsed && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  sidebarTheme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
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
                  onClick={() => setActiveNav('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'dashboard'
                      ? 'border-l-4 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-400 font-bold shadow-xs'
                      : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                  }`}
                  title="Dashboard"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </button>

                {/* Live Classes & Recordings */}
                <button
                  onClick={() => setActiveNav('live_classes')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'live_classes'
                      ? 'border-l-4 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-400 font-bold shadow-xs'
                      : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                  }`}
                  title="Live Classes & Recordings"
                >
                  <div className="flex items-center gap-2.5">
                    <Camera className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>Live &amp; Recordings</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[9px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      1 Live
                    </span>
                  )}
                </button>

                {/* Timetable & Schedule */}
                <button
                  onClick={() => setActiveNav('timetable')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'timetable'
                      ? 'border-l-4 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-400 font-bold shadow-xs'
                      : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
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
                  onClick={() => setActiveNav('homework')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'homework'
                      ? 'border-l-4 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-400 font-bold shadow-xs'
                      : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                  }`}
                  title="Homework & Assignments"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>Homework &amp; Tasks</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold">
                      2 Pending
                    </span>
                  )}
                </button>

                {/* My Focus Table */}
                <button
                  onClick={() => setActiveNav('focus_table')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'focus_table'
                      ? 'border-l-4 border-[#7C3AED] bg-purple-50 text-[#7C3AED] dark:bg-purple-950/60 dark:border-purple-500 dark:text-purple-300 font-bold shadow-xs'
                      : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 hover:text-[#7C3AED] dark:hover:text-purple-300 font-medium'
                  }`}
                  title="My Focus Table (Personalized Weak-Concepts Study Plan)"
                >
                  <div className="flex items-center gap-2.5">
                    <Target className="h-4 w-4 shrink-0 text-[#7C3AED]" />
                    {!sidebarCollapsed && <span>My Focus Table</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 text-[9px] font-bold">
                      2 Weak Areas
                    </span>
                  )}
                </button>

                {/* Exams & Results */}
                <button
                  onClick={() => setActiveNav('exams')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'exams'
                      ? 'border-l-4 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-400 font-bold shadow-xs'
                      : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                  }`}
                  title="Exams & Results"
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>Exams &amp; Results</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 text-[9px] font-bold">
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
                  onClick={() => setActiveNav('portfolio')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'portfolio'
                      ? 'border-l-4 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-400 font-bold shadow-xs'
                      : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                  }`}
                  title="Participations & Achievements"
                >
                  <div className="flex items-center gap-2.5">
                    <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                    {!sidebarCollapsed && <span>Dual Portfolio</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 text-[9px] font-bold">
                      {portfolio.length} Items
                    </span>
                  )}
                </button>

                {/* Holidays & Calendar */}
                <button
                  onClick={() => setActiveNav('calendar')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'calendar'
                      ? 'border-l-4 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-400 font-bold shadow-xs'
                      : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
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
                  onClick={() => setActiveNav('profile')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'profile'
                      ? 'border-l-4 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-400 font-bold shadow-xs'
                      : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                  }`}
                  title="SIS Profile & Attendance"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCircle className="h-4 w-4 shrink-0 text-blue-500" />
                    {!sidebarCollapsed && <span>SIS Profile</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-[10px] font-bold text-emerald-500">94.2%</span>
                  )}
                </button>

                {/* Official Documents */}
                <button
                  onClick={() => setActiveNav('vault')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    activeNav === 'vault'
                      ? 'border-l-4 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-400 font-bold shadow-xs'
                      : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                  }`}
                  title="Official Documents (View-Only Vault)"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderLock className="h-4 w-4 shrink-0 text-slate-400" />
                    {!sidebarCollapsed && <span>Official Documents</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="flex items-center gap-0.5 rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[8px] font-bold text-slate-600 dark:text-slate-400">
                      <Lock className="h-2.5 w-2.5" />
                      View Only
                    </span>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Student Profile Card & Theme Toggle */}
          <div className="p-3 border-t border-inherit">
            {!sidebarCollapsed ? (
              <div className="space-y-2.5">
                <div className={`flex items-center gap-2.5 p-2 rounded-xl border ${
                  sidebarTheme === 'dark' 
                    ? 'bg-slate-800/40 border-slate-700/40' 
                    : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
                      alt="Aarav Sharma"
                      className="h-9 w-9 rounded-xl object-cover border border-blue-400/30"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0F172A]" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className={`text-xs font-bold truncate ${
                      sidebarTheme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>
                      Aarav Sharma
                    </span>
                    <span className={`text-[10px] font-medium ${
                      sidebarTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Class 8-A • Roll #14
                    </span>
                  </div>
                </div>

                <div className={`flex items-center justify-between px-1 text-[11px] ${
                  sidebarTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    CBSE Session 2026-27
                  </span>
                  <button
                    id="sidebar-theme-toggle"
                    onClick={toggleTheme}
                    title="Toggle Application Theme (Dark / Light)"
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      sidebarTheme === 'dark'
                        ? 'hover:bg-slate-700/60 text-slate-300'
                        : 'hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {sidebarTheme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
                  alt="Aarav"
                  className="h-8 w-8 rounded-xl object-cover border border-blue-400/30"
                />
                <button
                  onClick={toggleTheme}
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400"
                  title="Toggle Application Theme (Dark / Light)"
                >
                  {sidebarTheme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. MAIN CANVAS CONTENT AREA */}
        {/* ========================================================= */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">

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
              
              {/* 1. TOP QUICK ACTION NAVIGATION CARDS ROW (8 CARDS) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                
                {/* 1. Live LMS */}
                <button
                  onClick={() => setActiveNav('live_classes')}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-center hover:border-red-400 dark:hover:border-red-500 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-between"
                >
                  <span className="rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider mb-2">
                    ● LIVE
                  </span>
                  <div className="h-10 w-10 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Live LMS</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Period 3 Live</span>
                  </div>
                </button>

                {/* 2. Timetable */}
                <button
                  onClick={() => setActiveNav('timetable')}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-center hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-between"
                >
                  <span className="rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider mb-2">
                    WED
                  </span>
                  <div className="h-10 w-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Timetable</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">6 Periods Today</span>
                  </div>
                </button>

                {/* 3. Homework */}
                <button
                  onClick={() => setActiveNav('homework')}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-center hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-between"
                >
                  <span className="rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider mb-2">
                    2 DUE
                  </span>
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Homework</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">2 Pending Due</span>
                  </div>
                </button>

                {/* 4. Report Cards */}
                <button
                  onClick={() => setActiveNav('exams')}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-center hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-between"
                >
                  <span className="rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider mb-2">
                    RANK #4
                  </span>
                  <div className="h-10 w-10 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Report Cards</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">UT-2 88.8%</span>
                  </div>
                </button>

                {/* 5. Dual Portfolio */}
                <button
                  onClick={() => setActiveNav('portfolio')}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-center hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-between"
                >
                  <span className="rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider mb-2">
                    VERIFIED
                  </span>
                  <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Portfolio</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">5 Verified</span>
                  </div>
                </button>

                {/* 6. Focus Table */}
                <button
                  onClick={() => setActiveNav('focus_table')}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-center hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-between"
                >
                  <span className="rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider mb-2">
                    2 WEAK
                  </span>
                  <div className="h-10 w-10 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Focus Table</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Study Plan</span>
                  </div>
                </button>

                {/* 7. Attendance */}
                <button
                  onClick={() => setActiveNav('calendar')}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-center hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-between"
                >
                  <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider mb-2">
                    PRESENT
                  </span>
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Attendance</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">94.2% Safe</span>
                  </div>
                </button>

                {/* 8. SIS Vault */}
                <button
                  onClick={() => setActiveNav('vault')}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-center hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-between"
                >
                  <span className="rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider mb-2">
                    LOCKED
                  </span>
                  <div className="h-10 w-10 rounded-2xl bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                    <FolderLock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">SIS Vault</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Official Docs</span>
                  </div>
                </button>

              </div>

              {/* SECTION 2: HERO CARD: "ACTIVE LIVE CLASS ROOM" */}
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#070D1E] via-[#0F1E36] to-[#1E3A8A] text-white p-6 sm:p-7 shadow-xl border-2 border-blue-500/40 dark:border-blue-500/60">
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
                <div className="absolute right-32 bottom-0 h-48 w-48 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-black shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Active Live Class Now In Session
                      </span>
                      
                      {/* 10-Minute Auto-Attendance Status Pill */}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1 text-xs font-bold">
                        <Clock className="h-3.5 w-3.5 text-blue-400" />
                        {hasJoinedLive ? (
                          <span>10-Min Auto-Attendance: <b className="text-emerald-400">🟢 Present Confirmed ({attendanceTimestamp || '10:34 AM'})</b></span>
                        ) : (
                          <span>10-Min Auto-Attendance: <b className="text-emerald-400">🟢 On Time</b></span>
                        )}
                      </span>
                    </div>

                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Class 8-A Mathematics: Quadratic Equations &amp; Roots
                      </h1>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <img
                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
                            alt="Mrs. Ananya Verma"
                            className="h-6 w-6 rounded-full object-cover border border-white/20"
                          />
                          Instructor: Mrs. Ananya Verma
                        </span>
                        <span>•</span>
                        <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px]">Period 3 (10:30 – 11:15 AM)</span>
                        <span>•</span>
                        <span className="text-blue-300 font-semibold">Room 204 &amp; Live Stream</span>
                      </div>
                    </div>

                    {/* Secondary Navigation Links */}
                    <div className="flex items-center gap-4 text-xs pt-1">
                      <button
                        onClick={() => handleDownloadNotes('Mathematics', 'Quadratic Equations')}
                        className="text-blue-300 hover:text-white font-semibold underline underline-offset-4 flex items-center gap-1 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Chapter Notes PDF
                      </button>
                      <span className="text-slate-500">|</span>
                      <button
                        onClick={() => setActiveNav('timetable')}
                        className="text-slate-300 hover:text-white font-semibold underline underline-offset-4 flex items-center gap-1 transition-colors"
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        Full Today Timetable
                      </button>
                    </div>
                  </div>

                  {/* Primary CTA Buttons & Classmates */}
                  <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleJoinLiveClass}
                        className="group flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-500/30 transition-all duration-200 active:scale-95 border border-blue-400/40"
                      >
                        <Video className="h-4.5 w-4.5 text-white transition-transform group-hover:scale-110" />
                        <span>{hasJoinedLive ? '[ Return to Live Classroom Stream ]' : '[ ▶ Join Live Class Now ]'}</span>
                        <ChevronRight className="h-4 w-4 text-blue-200" />
                      </button>

                      <button
                        onClick={() => setActiveNav('live_classes')}
                        className="rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 px-5 py-3.5 text-sm font-bold text-white transition-colors"
                      >
                        LMS Archive
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <img className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60" alt="" />
                        <img className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60" alt="" />
                        <img className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60" alt="" />
                      </div>
                      <span className="font-semibold text-emerald-400">28 Classmates connected</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry Active Notice */}
                <div className="mt-5 pt-3.5 border-t border-blue-400/20 text-xs text-blue-200/90 flex items-start gap-2 bg-blue-950/40 rounded-2xl p-3.5 border border-blue-500/20">
                  <span className="text-amber-300 text-sm">💡</span>
                  <span className="leading-relaxed">
                    <b className="text-white">Auto-Attendance Telemetry Active:</b> Joining the video classroom within the first 10 minutes automatically marks your attendance status as <b className="text-emerald-400">Present</b> in the official school SIS without teacher roll-call interruption.
                  </span>
                </div>
              </section>

              {/* SECTION 3: MIDDLE SPLIT SECTION (7 cols / 5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN (7 cols): TODAY'S CLASS SCHEDULE */}
                <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          Today&apos;s Class Schedule • Wednesday
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Class 8-A • 6 Periods Scheduled • Click row to inspect
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveNav('timetable')}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group"
                    >
                      <span>Full Timetable</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>

                  {/* List of 6 Periods */}
                  <div className="space-y-2.5">
                    {/* Period 1 */}
                    <div
                      onClick={() => setActiveNav('timetable')}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="h-10 w-10 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                          P1
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Physics
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            08:30 - 09:15 • Dr. K. Raman • <span className="text-blue-600 dark:text-blue-400 font-semibold">Lab 2</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 text-xs font-semibold">
                          Completed
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Period 2 */}
                    <div
                      onClick={() => setActiveNav('timetable')}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="h-10 w-10 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                          P2
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Chemistry
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            09:15 - 10:00 • Mrs. S. Sen • <span className="text-blue-600 dark:text-blue-400 font-semibold">Room 204</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 text-xs font-semibold">
                          Completed
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Period 3 (ACTIVE / CURRENT) */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-blue-500/80 bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-500/70 shadow-sm transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="h-10 w-10 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
                          P3
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              Mathematics (Quadratic Equations)
                            </h4>
                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                            10:30 - 11:15 • Mrs. Ananya Verma • <span className="text-blue-600 dark:text-blue-400 font-semibold">Room 204</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={handleJoinLiveClass}
                          className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 text-xs font-black shadow-md shadow-red-600/30 transition-transform active:scale-95"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Join Now</span>
                        </button>
                        <ChevronRight className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>

                    {/* Period 4 */}
                    <div
                      onClick={() => setActiveNav('timetable')}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="h-10 w-10 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                          P4
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Computer Science
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            11:15 - 12:00 • Mr. V. Nair • <span className="text-blue-600 dark:text-blue-400 font-semibold">Lab 1</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 px-3 py-1 text-xs font-semibold">
                          Upcoming
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Period 5 */}
                    <div
                      onClick={() => setActiveNav('timetable')}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="h-10 w-10 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                          P5
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Social Science
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            01:00 - 01:45 • Ms. P. Roy • <span className="text-blue-600 dark:text-blue-400 font-semibold">Room 204</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 px-3 py-1 text-xs font-semibold">
                          Upcoming
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Period 6 */}
                    <div
                      onClick={() => setActiveNav('timetable')}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="h-10 w-10 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                          P6
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Western Choir Rehearsal
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            01:45 - 02:30 • Music Faculty • <span className="text-blue-600 dark:text-blue-400 font-semibold">Auditorium</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 px-3 py-1 text-xs font-semibold">
                          Upcoming
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (5 cols): CAMPUS SPOTLIGHT MOVING SLIDES & DAILY DOSSIER */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* MOVING SLIDES (CAMPUS SPOTLIGHT CAROUSEL) */}
                  <div
                    onMouseEnter={() => setIsCarouselPaused(true)}
                    onMouseLeave={() => setIsCarouselPaused(false)}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121B35] to-[#0A0F24] border border-blue-900/40 text-white p-6 shadow-xl space-y-4"
                  >
                    {/* Header with Spotlight Badge & Prev/Next Arrows */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 text-xs font-black">
                        <Sparkles className="h-3.5 w-3.5" />
                        Campus Spotlight
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {currentSlideIndex + 1}/{announcementSlides.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + announcementSlides.length) % announcementSlides.length)}
                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Previous Slide"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % announcementSlides.length)}
                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Next Slide"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Slide Content */}
                    <div className="min-h-[140px] flex flex-col justify-between space-y-3 transition-opacity duration-300">
                      <div>
                        <h4 className="text-base font-black text-white leading-snug">
                          {announcementSlides[currentSlideIndex].title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {announcementSlides[currentSlideIndex].subtitle}
                        </p>
                      </div>

                      {/* Spotlight Action Card */}
                      <div
                        onClick={() => setActiveNav(announcementSlides[currentSlideIndex].targetNav)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                            <CalendarDays className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              {announcementSlides[currentSlideIndex].actionLabel || 'SPOTLIGHT ACTION'}
                            </span>
                            <span className="text-xs font-bold text-white truncate block">
                              {announcementSlides[currentSlideIndex].actionTitle || 'Western Choir & Rehearsals'}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-1 transition-transform shrink-0" />
                      </div>
                    </div>

                    {/* Bottom Indicator Dots & CTA Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      {/* Indicator Dots */}
                      <div className="flex items-center gap-1.5">
                        {announcementSlides.map((slide, idx) => (
                          <button
                            key={slide.id}
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                              idx === currentSlideIndex
                                ? 'w-6 bg-blue-500'
                                : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                            }`}
                            title={`Slide ${idx + 1}`}
                          />
                        ))}
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => setActiveNav(announcementSlides[currentSlideIndex].targetNav)}
                        className="rounded-xl bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <span>{announcementSlides[currentSlideIndex].ctaText}</span>
                      </button>
                    </div>
                  </div>

                  {/* DAILY CAMPUS DOSSIER */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                          <Trophy className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            Daily Campus Dossier
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Class 8-A Highlights</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold">
                        Phoenix House Captain
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div
                        onClick={() => setActiveNav('homework')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-colors"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          PENDING TASKS
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white block">
                          2 Homeworks
                        </span>
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                          Maths HW 4.2 due tomorrow
                        </span>
                      </div>

                      <div
                        onClick={() => setActiveNav('calendar')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-emerald-400 transition-colors"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          ATTENDANCE LEDGER
                        </span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                          95.4% Present
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                          Checked In: 08:02 AM
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* SECTION 4: BOTTOM 3-CARD OVERVIEW ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* CARD 1: HOMEWORK & TASKS */}
                <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Homework &amp; Tasks</h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Class 8-A Assignments</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[9px] font-black uppercase">
                        2 Pending
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div
                        onClick={() => setActiveNav('homework')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">Maths 4.2: Quadratic Roots</span>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 rounded-full">
                            Due Tomorrow
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                          Exercises 1–15 with step graphs
                        </span>
                      </div>

                      <div
                        onClick={() => setActiveNav('homework')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-amber-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">Science: Light &amp; Optics Lab</span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            Due Oct 16
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                          Focal length diagram submission
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveNav('homework')}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 px-3 text-xs font-black shadow-xs transition-all active:scale-95"
                  >
                    <span>Open Homework &amp; Submissions</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* CARD 2: MY FOCUS TABLE */}
                <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                          <Target className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">My Focus Table</h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Target Intervention &amp; Remedial</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 text-[9px] font-black uppercase">
                        2 Weak Concepts
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div
                        onClick={() => setActiveNav('focus_table')}
                        className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 cursor-pointer hover:border-purple-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">Quadratic Equations: Factorization</span>
                          <span className="text-purple-700 dark:text-purple-300 font-mono text-[10px] font-black bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                            42% Mastery
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                          Mrs. Ananya Verma • 4-Day Plan Active
                        </span>
                      </div>

                      <div
                        onClick={() => setActiveNav('focus_table')}
                        className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 cursor-pointer hover:border-purple-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">Physics Optics: Ray Tracing</span>
                          <span className="text-purple-700 dark:text-purple-300 font-mono text-[10px] font-black bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                            58% Mastery
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                          Dr. K. Raman • Practice Set Assigned
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveNav('focus_table')}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white py-3 px-3 text-xs font-black shadow-xs transition-all active:scale-95"
                  >
                    <span>Open Focus Table &amp; Practice Sets</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* CARD 3: ACADEMIC SCORECARD */}
                <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">Academic Scorecard</h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Unit Test 2 Official Results</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 text-[9px] font-black">
                        Rank #4 • 88.8%
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Overall Score</span>
                          <span className="text-sm font-black text-slate-900 dark:text-white">444 / 500</span>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 rounded-xl">
                          Grade: A+
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">CBSE Roll No: #14</span>
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Signed by Principal &amp; Exam Cell</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          Verified Stamp ✓
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveNav('exams')}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 px-3 text-xs font-black shadow-xs transition-all active:scale-95"
                  >
                    <span>Review Full UT2 Marks Sheet</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ===================================================== */}
          {/* VIEW: HOMEWORK & SUBMISSIONS (DEDICATED WORKSPACE) */}
          {/* ===================================================== */}
          {activeNav === 'homework' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold border border-amber-200">
                      Academics Workspace
                    </span>
                    <span className="text-xs text-slate-500">Class 8-A Assignments</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Homework, Worksheets &amp; Digital Corrections
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  {(['all', 'pending', 'graded'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setHomeworkFilter(filter)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition-all ${
                        homeworkFilter === filter
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {filter === 'all' ? 'All Tasks (4)' : filter === 'pending' ? 'Pending (2)' : 'Graded (2)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                
                {/* ITEM 1: MATHEMATICS (PENDING SUBMISSION WITH DROP-ZONE) */}
                {(homeworkFilter === 'all' || homeworkFilter === 'pending') && (
                  <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-2 border-b border-amber-100 pb-3">
                      <div>
                        <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                          Mathematics
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">
                          Quadratic Equations: Factorization by Splitting the Middle Term
                        </h3>
                        <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> Due Tomorrow, 5:00 PM • Max Marks: 20
                        </span>
                      </div>
                      <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold">
                        Pending
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Complete Textbook Exercises 4.2 (Questions 1 to 10). Write out solutions with clear factorization steps, photograph or scan as PDF, and drop below.
                    </p>

                    {/* Integrated Upload Drop-Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 p-6 text-center transition-all hover:bg-blue-50/20 group"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleHomeworkFileSelect}
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                      />
                      <Upload className="mx-auto h-7 w-7 text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                        {selectedFileForUpload ? selectedFileForUpload.name : 'Click to Browse or Drag & Drop Homework File here'}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {selectedFileForUpload ? `${(selectedFileForUpload.size / 1024).toFixed(1)} KB ready for submission` : 'PDF, JPEG, or PNG supported (Maximum 15MB)'}
                      </p>
                    </div>

                    {selectedFileForUpload && !homeworkSubmittedSuccess && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-500 font-medium">Document attached</span>
                        <button
                          onClick={handleHomeworkSubmit}
                          disabled={isUploadingHomework}
                          className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                        >
                          {isUploadingHomework ? (
                            <>
                              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Submit Homework Worksheet
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {homeworkSubmittedSuccess && (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-800 p-3 text-xs font-semibold border border-emerald-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Submitted successfully! Awaiting Mrs. Verma&apos;s review.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ITEM 2: ENGLISH LITERATURE (PENDING) */}
                {(homeworkFilter === 'all' || homeworkFilter === 'pending') && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                          English Literature
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">
                          The Merchant of Venice: Portia&apos;s Mercy Speech Analysis
                        </h3>
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> Due Friday, 18 Oct • Max Marks: 15
                        </span>
                      </div>
                      <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold">
                        Pending
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Write a 300-word critical evaluation of Act IV Scene 1. Contrast Portia&apos;s argument on divine mercy against Shylock&apos;s legal bond insistence.
                    </p>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
                      <span className="text-xs text-slate-500 block mb-2">Draft Not Yet Started</span>
                      <button
                        onClick={() => triggerToast('Opening online writing pad for English Essay...')}
                        className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 text-xs font-bold shadow-xs transition-colors"
                      >
                        Start Writing Essay in Portal
                      </button>
                    </div>
                  </div>
                )}

                {/* ITEM 3: PHYSICS (GRADED WITH ANNOTATED CANVAS BUTTON) */}
                {(homeworkFilter === 'all' || homeworkFilter === 'graded') && (
                  <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-2 border-b border-emerald-100 pb-3">
                      <div>
                        <span className="rounded bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-bold">
                          Physics
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">
                          Force &amp; Laws of Motion: Newton&apos;s Third Law Lab Sheet
                        </h3>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          Graded by Dr. K. Raman • Graded on 11 Oct 2026
                        </span>
                      </div>
                      <span className="rounded-xl bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-black">
                        18.5 / 20 (92.5%)
                      </span>
                    </div>

                    <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-3.5 space-y-1 text-xs">
                      <span className="font-bold text-emerald-900 block">Teacher&apos;s Written Remarks:</span>
                      <p className="text-slate-700 italic">
                        &quot;Outstanding derivation of action-reaction pairs in Q2. In Q4, please double check signs when stating vector direction. Solid work overall!&quot;
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAnnotationModalOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 py-2.5 text-xs font-bold transition-all shadow-xs"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Teacher-Annotated Sheet &amp; Red Pen Corrections</span>
                    </button>
                  </div>
                )}

                {/* ITEM 4: CHEMISTRY (GRADED) */}
                {(homeworkFilter === 'all' || homeworkFilter === 'graded') && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="rounded bg-teal-100 text-teal-800 px-2 py-0.5 text-[10px] font-bold">
                          Chemistry
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">
                          Chemical Reactions &amp; Equations Balancing Worksheet
                        </h3>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          Graded by Mrs. S. Sen • Graded on 08 Oct 2026
                        </span>
                      </div>
                      <span className="rounded-xl bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-black">
                        19.0 / 20 (95.0%)
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1 text-xs">
                      <span className="font-bold text-slate-800 block">Teacher Remarks:</span>
                      <p className="text-slate-600 italic">
                        &quot;Flawless equation coefficients for redox balancing. Clean handwriting and working.&quot;
                      </p>
                    </div>

                    <button
                      onClick={() => triggerToast('Opening Chemistry Worksheet memo...')}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-2.5 text-xs font-bold transition-colors shadow-xs"
                    >
                      <FileCheck className="h-4 w-4 text-emerald-600" />
                      <span>Download Evaluated PDF</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

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

                <button
                  onClick={() => triggerToast('Generating PDF Report Card Memo...')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Marks Memo (PDF)</span>
                </button>
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
                    onClick={() => triggerToast('Launching Mathematics Quiz CBT Environment...')}
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
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 font-mono font-black text-sm shadow-xs">
                    #A-14
                  </div>
                </div>
              </div>

              {/* OVERALL PERFORMANCE BANNER */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Unit Test 2 Aggregate</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">88.8%</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +3.6% from Unit Test 1
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Class Rank</span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block">Rank #4</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Out of 38 students in Class 8-A</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Marks Obtained</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">222 / 250</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Grade: A1 Distinction</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Examination Controller Status</span>
                  <span className="text-sm font-bold text-emerald-700 mt-1 block flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" /> Officially Verified
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">DPS Controller Seal Affixed</span>
                </div>
              </div>

              {/* SUBJECT-WISE SCORE TABLE */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Unit Test 2 — Subject Breakdown &amp; Grades
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">Max: 50 Marks / Subject</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold bg-white">
                        <th className="p-3.5">Subject</th>
                        <th className="p-3.5">Marks Obtained</th>
                        <th className="p-3.5">Max Marks</th>
                        <th className="p-3.5">Percentage</th>
                        <th className="p-3.5">Grade</th>
                        <th className="p-3.5">Faculty Evaluation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { sub: 'Mathematics', got: 46, max: 50, pct: '92.0%', grade: 'A1', remarks: 'Exceptional in quadratic equations & arithmetic progressions.' },
                        { sub: 'Science (Physics/Chem/Bio)', got: 48, max: 50, pct: '96.0%', grade: 'A1', remarks: 'Highest score in Class 8-A. Strong experimental insight.' },
                        { sub: 'English Literature & Lang', got: 44, max: 50, pct: '88.0%', grade: 'A2', remarks: 'Good analytical writing in Shakespearean drama.' },
                        { sub: 'Social Science (Hist/Civ/Geo)', got: 43, max: 50, pct: '86.0%', grade: 'A2', remarks: 'Comprehensive answers on national movement & climate.' },
                        { sub: 'Second Language (Hindi)', got: 41, max: 50, pct: '82.0%', grade: 'B1', remarks: 'Good grammar; improve vocabulary in long essay.' }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="p-3.5 font-bold text-slate-900">{row.sub}</td>
                          <td className="p-3.5 font-black text-slate-900">{row.got}</td>
                          <td className="p-3.5 text-slate-500">{row.max}</td>
                          <td className="p-3.5 font-bold text-blue-600">{row.pct}</td>
                          <td className="p-3.5 font-bold">
                            <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px]">
                              {row.grade}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TEACHER & PRINCIPAL ENDORSEMENT */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-2 text-xs">
                <span className="font-bold text-blue-900 uppercase text-[10px] block">
                  Principal &amp; Class Teacher Endorsement
                </span>
                <p className="text-slate-700 leading-relaxed italic">
                  &quot;Aarav Sharma continues to demonstrate admirable academic consistency, rigorous work ethic, and balanced citizenship across Class 8. He is commended for his exemplary results in STEM subjects.&quot;
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-semibold border-t border-blue-100">
                  <span>Class Teacher: Mrs. Ananya Verma</span>
                  <span>Principal: Dr. Sunita Kapoor</span>
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
                            onClick={() => setSelectedCertificatePreview(a.proof_url || '/samples/certificate_preview.png')}
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
                          onClick={() => setSelectedCertificatePreview('/samples/certificate_preview.png')}
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
          {activeNav === 'focus_table' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 text-xs font-bold border border-purple-200 dark:border-purple-800">
                      Academics &amp; Remediation
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Class 8-A Personalized Study Plan</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    🎯 My Focus Table (Shared with Teacher &amp; Parent)
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Collaboratively curated weak-concepts revision ledger. Identified from Unit Test 2 &amp; Lab Assessments by Mrs. Sunitha Rao and Dr. K. Raman.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-3 py-1.5 text-xs font-bold">
                    Target: Mid-Term Exam (Nov 2026)
                  </span>
                </div>
              </div>

              {/* Top Overview KPI Row */}
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
                    <span className="text-2xl font-black text-purple-600 dark:text-purple-400">42%</span>
                    <span className="text-xs font-bold text-purple-600">Goal: 80%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: '42%' }}></div>
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
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Guardian Co-Sign</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Mr. Rajesh Sharma</span>
                    <span className="text-[10px] font-bold text-emerald-600">✓ Acknowledged</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">Signed on 12 Oct 2026</span>
                </div>
              </div>

              {/* 4-Day Targeted Revision Timetable (FocusTableView) */}
              <div className="space-y-2">
                <FocusTableView table={studentQuadraticFocusTable} isParentView={false} />
              </div>
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

                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono">
                    October 2026
                  </span>
                  <span className="text-[11px] text-slate-400">Class 8-A Ledger</span>
                </div>
              </div>

              {/* MAIN CALENDAR GRID & DAY INSPECTOR (SIDE-BY-SIDE ON DESKTOP) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT (8 COLS): 31-DAY INTERACTIVE MONTHLY CALENDAR GRID */}
                <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>October 2026 Daily Attendance &amp; Events Ledger</span>
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

              {/* RETENTION OF UPCOMING VACATIONS & CAMPUS MILESTONES (WITH DIRECT CLICK NAVIGATION) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Upcoming Holidays */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Official School Vacations &amp; Holidays</span>
                  </h3>

                  <div className="space-y-3">
                    {[
                      { name: 'Diwali & Festival of Lights Break', dates: '28 Oct – 04 Nov 2026', type: 'Festival Vacation', days: '8 Days', targetNav: 'calendar' },
                      { name: 'Guru Nanak Jayanti', dates: '15 Nov 2026', type: 'Public Holiday', days: '1 Day', targetNav: 'calendar' },
                      { name: 'Winter Break & Christmas Holidays', dates: '23 Dec 2026 – 02 Jan 2027', type: 'Winter Vacation', days: '11 Days', targetNav: 'calendar' },
                      { name: 'Republic Day Celebration', dates: '26 Jan 2027', type: 'National Holiday', days: '1 Day', targetNav: 'calendar' }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedCalendarDay(28)}
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

                {/* Key Campus Milestones */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Campus Events &amp; Milestones (Click to Jump)</span>
                  </h3>

                  <div className="space-y-3">
                    {[
                      { event: 'Annual Cultural Day Rehearsals', date: 'In 5 Days • 19 Oct', committee: 'Aarav in Western Choir & Stage Tech', targetNav: 'calendar', day: 19 },
                      { event: 'Inter-School Science & Robotics Fest', date: '24 Oct 2026', committee: 'CBSE Regional Exhibition', targetNav: 'portfolio', day: 24 },
                      { event: 'UT-2 Marks Consolidated Report Card', date: 'Published Today', committee: 'Maths 46/50 • Science 48/50', targetNav: 'exams', day: 16 },
                      { event: 'Term 2 Summative Assessments (Pre-Boards)', date: '10 Dec – 21 Dec 2026', committee: 'Comprehensive Marks Card Generation', targetNav: 'exams', day: 10 }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          if (item.targetNav === 'calendar') {
                            setSelectedCalendarDay(item.day);
                          } else {
                            setActiveNav(item.targetNav as NavSection);
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

              {/* APPLIED LEAVES TABLE */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Applied Leaves Ledger
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Official Attendance Exceptions
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800/40">
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">07 Oct 2026</td>
                        <td className="p-3 font-semibold text-purple-600 dark:text-purple-400">Medical Leave</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">Viral Fever</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full text-[11px]">
                            🟢 Approved by Class Teacher
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">14 Sep 2026</td>
                        <td className="p-3 font-semibold text-purple-600 dark:text-purple-400">Medical Leave</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">Dental Appointment</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full text-[11px]">
                            🟢 Approved by Class Teacher
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">22 Aug 2026</td>
                        <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">Family Leave</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">Sister&apos;s Wedding Function</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full text-[11px]">
                            🟢 Approved by Class Teacher
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
                <label className="block font-bold text-slate-700 mb-1">
                  Certificate Document (PDF / Image)
                </label>
                <div className="rounded-xl border border-dashed border-slate-300 p-3 text-center bg-slate-50 hover:bg-purple-50/20 cursor-pointer">
                  <Upload className="mx-auto h-4 w-4 text-slate-400 mb-1" />
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    Select scanned certificate or medal photo
                  </span>
                  <span className="text-[9px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
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
                  className="rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white px-4 py-2 font-bold shadow-sm"
                >
                  Submit for School Stamp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CERTIFICATE LIGHTBOX PREVIEW */}
      {selectedCertificatePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Verified Student Credential Preview
              </span>
              <button
                onClick={() => setSelectedCertificatePreview(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 bg-slate-100 flex items-center justify-center">
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
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCertificatePreview(null)}
                className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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

    </RoleGuard>
  );
}
