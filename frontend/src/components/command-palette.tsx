'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  CornerDownLeft, 
  X, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Video, 
  Trophy, 
  Lock, 
  ShieldCheck, 
  Layers, 
  Flame, 
  Users, 
  Activity, 
  CheckSquare, 
  Shuffle, 
  UserPlus, 
  TrendingUp, 
  Receipt, 
  CalendarDays, 
  Target, 
  Sun, 
  Moon,
  FolderLock,
  MessageSquare
} from 'lucide-react';
import { Icon3D } from '@/components/ui/icon-3d';
import { useTheme } from '@/lib/theme-context';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'navigation' | 'students' | 'tasks' | 'actions';
  icon?: string;
  href?: string;
  tab?: string;
  role: string[]; // Explicit roles required for zero cross-role leak
  action?: () => void;
  badge?: string;
  badgeColor?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: string;
}

export function CommandPalette({ isOpen, onClose, currentRole = 'admin' }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling while command palette is active & listen for ESC key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape, true);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEscape, true);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setSelectedCategory('all');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Normalized Role Identifier
  const normalizedRole = useMemo(() => {
    return (currentRole || 'admin').toLowerCase().trim();
  }, [currentRole]);

  // Dynamic Placeholder Text based on active persona
  const placeholderText = useMemo(() => {
    switch (normalizedRole) {
      case 'student':
        return 'Search homework, exams, live classes, timetable, marks...';
      case 'teacher':
        return 'Search attendance, gradebook, timetable, duties, student roster...';
      case 'parent':
        return 'Search report cards, fee payments, PTM conference, leave...';
      case 'exam_coordinator':
        return 'Search secrecy vault, QP blueprints, hall allocations...';
      case 'admissions_coordinator':
        return 'Search prospective leads, campus inquiries, TC intake...';
      default:
        return 'Type a command, student name, task, or module...';
    }
  }, [normalizedRole]);

  // Master index of searchable command items with strict role gating
  const allItems: CommandItem[] = useMemo(() => {
    return [
      // ========================================================
      // 1. STUDENT SPECIFIC MODULES & SHORTCUTS
      // ========================================================
      {
        id: 'student-mod-homework',
        title: "Today's Homework & Active Worksheets",
        subtitle: 'View pending daily assignments, attach rough work & submit',
        category: 'navigation',
        icon: 'memo',
        href: '/student',
        tab: 'homework',
        badge: 'Academics',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        role: ['student']
      },
      {
        id: 'student-mod-exams',
        title: 'Examinations, Hall Passes & Marks Card',
        subtitle: 'Upcoming exam schedule, invigilator rooms & term marks memo',
        category: 'navigation',
        icon: 'graduation',
        href: '/student',
        tab: 'exams',
        badge: 'Exams',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        role: ['student']
      },
      {
        id: 'student-mod-live',
        title: 'Live Virtual Classrooms & Video Meet',
        subtitle: 'Join scheduled live lectures via LiveKit Cloud & mark attendance',
        category: 'navigation',
        icon: 'rocket',
        href: '/student',
        tab: 'live_classes',
        badge: 'Live Meet',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['student']
      },
      {
        id: 'student-mod-focus',
        title: 'Remedial Focus Table & Study Assistant',
        subtitle: 'Personalized revision plan, Socratic hints & formula sheets',
        category: 'navigation',
        icon: 'sparkles',
        href: '/student',
        tab: 'focus_table',
        badge: 'AI Tutor',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        role: ['student']
      },
      {
        id: 'student-mod-timetable',
        title: 'Daily Class Timetable & Period Roster',
        subtitle: 'Check period timings, subject rooms & teacher assignments',
        category: 'navigation',
        icon: 'calendar',
        href: '/student',
        tab: 'timetable',
        role: ['student']
      },
      {
        id: 'student-mod-recordings',
        title: 'Class Recordings & Video Vault',
        subtitle: 'Rewatch recorded lectures, classroom notes & key takeaways',
        category: 'navigation',
        icon: 'bulb',
        href: '/student',
        tab: 'recordings',
        role: ['student']
      },
      {
        id: 'student-mod-portfolio',
        title: 'Dual Portfolio & Co-Curricular Awards',
        subtitle: 'Upload achievement certificates, sports trophies & badges',
        category: 'navigation',
        icon: 'trophy',
        href: '/student',
        tab: 'portfolio',
        role: ['student']
      },
      {
        id: 'student-mod-vault',
        title: 'Official Document Vault (Digital SIS)',
        subtitle: 'Download Bonafide, Study certificates, ID card & sealed files',
        category: 'navigation',
        icon: 'lock',
        href: '/student',
        tab: 'vault',
        role: ['student']
      },
      {
        id: 'student-mod-calendar',
        title: 'Academic Year Calendar & Holidays',
        subtitle: 'School event dates, examination windows & holiday list',
        category: 'navigation',
        icon: 'calendar',
        href: '/student',
        tab: 'calendar',
        role: ['student']
      },

      // --- Student Specific Tasks ---
      {
        id: 'student-task-math',
        title: 'Math Worksheet #4: Quadratic Formula & Roots',
        subtitle: 'Assigned by Mrs. Ananya Verma • Due Today 5:00 PM • 20 Marks',
        category: 'tasks',
        icon: 'memo',
        href: '/student',
        tab: 'homework',
        badge: 'Due Today',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        role: ['student']
      },
      {
        id: 'student-task-science',
        title: 'Science EVS: Plant Life Cycle & Chloroplast Diagram',
        subtitle: 'Term 1 Lab Workbook Activity • Due Tomorrow • 15 Marks',
        category: 'tasks',
        icon: 'bulb',
        href: '/student',
        tab: 'homework',
        badge: 'Upcoming',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        role: ['student']
      },
      {
        id: 'student-task-remedial',
        title: 'Remedial Socratic Hint: Polynomial Factoring Revision',
        subtitle: 'Complete 3 practice steps on the Shared Focus Table',
        category: 'tasks',
        icon: 'sparkles',
        href: '/student',
        tab: 'focus_table',
        badge: 'Practice Quest',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        role: ['student']
      },

      // --- Student People & Faculty ---
      {
        id: 'student-person-ananya',
        title: 'Mrs. Ananya Verma',
        subtitle: 'Class 10-A Homeroom Faculty & Senior Mathematics Lead',
        category: 'students',
        icon: 'book',
        href: '/student',
        tab: 'timetable',
        badge: 'Homeroom Teacher',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        role: ['student']
      },
      {
        id: 'student-person-ramesh',
        title: 'Coach Ramesh',
        subtitle: 'Physical Education & Athletics Coordinator',
        category: 'students',
        icon: 'trophy',
        href: '/student',
        tab: 'timetable',
        badge: 'Sports Lead',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['student']
      },
      {
        id: 'student-person-sunita',
        title: 'Dr. Sunita Kapoor',
        subtitle: 'Principal & Head of School • Executive Office',
        category: 'students',
        icon: 'graduation',
        href: '/student',
        tab: 'dashboard',
        badge: 'Principal',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        role: ['student']
      },

      // --- Student Quick Actions ---
      {
        id: 'student-act-submit',
        title: 'Submit Homework Assignment Rough Work',
        subtitle: 'Upload photo/PDF file to clear pending homework milestone',
        category: 'actions',
        icon: 'memo',
        href: '/student',
        tab: 'homework',
        badge: 'Quick Action',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        role: ['student']
      },
      {
        id: 'student-act-live',
        title: 'Join Live Class Video Stream Now',
        subtitle: 'Enter virtual lecture room via LiveKit and mark attendance',
        category: 'actions',
        icon: 'rocket',
        href: '/student',
        tab: 'live_classes',
        badge: '1-Click Join',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['student']
      },
      {
        id: 'student-act-marks',
        title: 'Download Term 1 Marks Card PDF',
        subtitle: 'Retrieve sealed CBSE marks memo & performance ledger',
        category: 'actions',
        icon: 'graduation',
        href: '/student',
        tab: 'exams',
        badge: 'Download',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        role: ['student']
      },

      // ========================================================
      // 2. TEACHER SPECIFIC MODULES & SHORTCUTS
      // ========================================================
      {
        id: 'teacher-mod-attendance',
        title: 'Classroom Attendance & Live Class Desk',
        subtitle: 'Mark period attendance, log morning roll call & start meets',
        category: 'navigation',
        icon: 'graduation',
        href: '/teacher',
        tab: 'dashboard',
        badge: 'Attendance',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['teacher']
      },
      {
        id: 'teacher-mod-exams',
        title: 'Exam Question Paper & Blueprint Desk',
        subtitle: 'Author blueprints, upload QPs, moderation status & gradebook',
        category: 'navigation',
        icon: 'memo',
        href: '/teacher',
        tab: 'exams_gradebook',
        badge: 'Assessments',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        role: ['teacher']
      },
      {
        id: 'teacher-mod-homework',
        title: 'Homework Assignment Hub & Grading Desk',
        subtitle: 'Publish new assignments, evaluate student submissions & rubrics',
        category: 'navigation',
        icon: 'memo',
        href: '/teacher',
        tab: 'homework',
        badge: 'Assignments',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        role: ['teacher']
      },
      {
        id: 'teacher-mod-schedule',
        title: 'Personal Timetable & Academic Pacing',
        subtitle: 'Daily period roster, room allocations & free period cover',
        category: 'navigation',
        icon: 'calendar',
        href: '/teacher',
        tab: 'schedule',
        role: ['teacher']
      },
      {
        id: 'teacher-mod-curriculum',
        title: 'Mathematics & Science Curriculum Pacer',
        subtitle: 'Chapter logs, term milestones & CBSE syllabus tracking',
        category: 'navigation',
        icon: 'book',
        href: '/teacher',
        tab: 'curriculum',
        role: ['teacher']
      },
      {
        id: 'teacher-mod-ptm',
        title: 'Parent PTM Connect & Meeting Hub',
        subtitle: 'Schedule parent conferences, video slot invites & notes',
        category: 'navigation',
        icon: 'bulb',
        href: '/teacher',
        tab: 'parent_hub',
        badge: 'PTM',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        role: ['teacher']
      },
      {
        id: 'teacher-mod-duties',
        title: 'Duties & Governance Operations Center',
        subtitle: 'Academic mandates, exam hall invigilation & proof submission',
        category: 'navigation',
        icon: 'trophy',
        href: '/teacher',
        tab: 'duties',
        badge: 'Mandates',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        role: ['teacher']
      },
      {
        id: 'teacher-mod-roster',
        title: 'Student 360 Roster & Remedial Tags',
        subtitle: 'Class 10-A student list, attendance percentages & diagnostic flags',
        category: 'navigation',
        icon: 'graduation',
        href: '/teacher',
        tab: 'roster',
        role: ['teacher']
      },

      // --- Teacher Tasks ---
      {
        id: 'teacher-task-grading',
        title: 'Grade 24 Factoring Worksheets (Class 10-A)',
        subtitle: '18 Submissions pending evaluation • Term 1 Math Internal',
        category: 'tasks',
        icon: 'memo',
        href: '/teacher',
        tab: 'homework',
        badge: 'Grading Queue',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        role: ['teacher']
      },
      {
        id: 'teacher-task-blueprint',
        title: 'Author Term 1 Math Blueprint Draft',
        subtitle: 'CBSE Bloom taxonomy matrix • Due Friday for Moderation',
        category: 'tasks',
        icon: 'memo',
        href: '/teacher',
        tab: 'exams_gradebook',
        badge: 'Blueprint Due',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        role: ['teacher']
      },
      {
        id: 'teacher-task-invigilation',
        title: 'Exam Invigilation Duty: Examination Hall #3',
        subtitle: 'Morning Session 09:30 AM - 12:30 PM • 48 Candidates',
        category: 'tasks',
        icon: 'trophy',
        href: '/teacher',
        tab: 'duties',
        badge: 'Duty Assigned',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        role: ['teacher']
      },

      // --- Teacher Students & People ---
      {
        id: 'teacher-student-arjun',
        title: 'Arjun Sharma',
        subtitle: 'Class 10-A • Roll #101 • Science & Math • Attendance: 94%',
        category: 'students',
        icon: 'graduation',
        href: '/teacher',
        tab: 'roster',
        badge: 'Class 10-A',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        role: ['teacher', 'admin']
      },
      {
        id: 'teacher-student-rohan',
        title: 'Rohan Patel',
        subtitle: 'Class 10-A • Roll #108 • 1-Week Remedial Focus Active',
        category: 'students',
        icon: 'target',
        href: '/teacher',
        tab: 'roster',
        badge: 'Remedial Batch',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        role: ['teacher', 'admin']
      },
      {
        id: 'teacher-student-priya',
        title: 'Priya Nair',
        subtitle: 'Class 9-B • Roll #204 • Rank #1 • Term 1: 96.4%',
        category: 'students',
        icon: 'trophy',
        href: '/teacher',
        tab: 'roster',
        badge: 'Class 9-B',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['teacher', 'admin']
      },

      // --- Teacher Actions ---
      {
        id: 'teacher-act-create-hw',
        title: '+ Create New Homework Assignment for Class',
        subtitle: 'Publish problem set with due date and score weightage',
        category: 'actions',
        icon: 'memo',
        href: '/teacher',
        tab: 'homework',
        badge: 'New Assignment',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        role: ['teacher']
      },
      {
        id: 'teacher-act-live',
        title: 'Launch Live Virtual Classroom Desk',
        subtitle: 'Start WebRTC video meeting room and invite students',
        category: 'actions',
        icon: 'rocket',
        href: '/teacher',
        tab: 'dashboard',
        badge: 'Launch Meet',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['teacher']
      },
      {
        id: 'teacher-act-attendance',
        title: 'Open Class 10-A Attendance Register',
        subtitle: 'Mark daily morning presence, absent flags & permissions',
        category: 'actions',
        icon: 'graduation',
        href: '/teacher',
        tab: 'dashboard',
        badge: 'Roll Call',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        role: ['teacher']
      },

      // ========================================================
      // 3. PARENT SPECIFIC MODULES & SHORTCUTS
      // ========================================================
      {
        id: 'parent-mod-marks',
        title: 'Children Academic Marks & Term Reports',
        subtitle: 'Comprehensive gradebook, subject breakdowns & teacher feedback',
        category: 'navigation',
        icon: 'graduation',
        href: '/parent',
        tab: 'marks',
        badge: 'Report Card',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        role: ['parent']
      },
      {
        id: 'parent-mod-fees',
        title: 'Fee Payment Ledger & Milestone Invoices',
        subtitle: 'Online UPI/Card settlement, invoice receipts & tax certificates',
        category: 'navigation',
        icon: 'chart',
        href: '/parent',
        tab: 'fees',
        badge: 'Fee Dues',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['parent']
      },
      {
        id: 'parent-mod-focus',
        title: 'Shared Golden Focus Table & Progress Check',
        subtitle: 'Inspect homework rough work & 1-click guardian approval',
        category: 'navigation',
        icon: 'sparkles',
        href: '/parent',
        tab: 'focus_table',
        badge: 'Focus Table',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        role: ['parent']
      },
      {
        id: 'parent-mod-ptm',
        title: 'Parent-Teacher Video Conference (PTM)',
        subtitle: 'Join live meeting with homeroom teacher via LiveKit Cloud',
        category: 'navigation',
        icon: 'rocket',
        href: '/parent',
        tab: 'ptm_connect',
        badge: 'PTM Meet',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        role: ['parent']
      },
      {
        id: 'parent-mod-leave',
        title: 'Doctor Note & Medical Leave Submission',
        subtitle: 'Upload medical certificate scan for excused absences & re-exams',
        category: 'navigation',
        icon: 'memo',
        href: '/parent',
        tab: 'leave',
        badge: 'Medical Leave',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        role: ['parent']
      },
      {
        id: 'parent-mod-tc',
        title: 'Transfer Certificate (TC) & School Exit Sign-Off',
        subtitle: 'Dual verification: review 4 department clearances & sign digitally',
        category: 'navigation',
        icon: 'lock',
        href: '/parent',
        tab: 'dashboard',
        badge: 'TC Vault',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        role: ['parent']
      },
      {
        id: 'parent-mod-sis',
        title: 'Child SIS Profile & Legal Documents',
        subtitle: 'Student ID, biometric data, blood group & official certificates',
        category: 'navigation',
        icon: 'book',
        href: '/parent',
        tab: 'child_sis',
        role: ['parent']
      },
      {
        id: 'parent-mod-chat',
        title: 'Teacher Message Desk & Direct Chat',
        subtitle: 'Real-time parent-teacher coordination and notes',
        category: 'navigation',
        icon: 'bulb',
        href: '/parent',
        tab: 'chat',
        role: ['parent']
      },

      // --- Parent Tasks ---
      {
        id: 'parent-task-fee',
        title: 'Settle Milestone 2 Fee Installment (₹14,500)',
        subtitle: 'Digital Learning Platform & Cloud LMS Fee • Due 15 Nov',
        category: 'tasks',
        icon: 'chart',
        href: '/parent',
        tab: 'fees',
        badge: 'Action Due',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        role: ['parent']
      },
      {
        id: 'parent-task-remedial',
        title: "Review Aarav's Day 1 Remedial Math Practice",
        subtitle: 'Verify completed problem set on the Shared Golden Focus Table',
        category: 'tasks',
        icon: 'sparkles',
        href: '/parent',
        tab: 'focus_table',
        badge: 'Parent Sign',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        role: ['parent']
      },
      {
        id: 'parent-task-ptm',
        title: 'Confirm Attendance for Saturday PTM Conference',
        subtitle: 'Homeroom review with Mrs. Ananya Verma • Slot 10:30 AM',
        category: 'tasks',
        icon: 'calendar',
        href: '/parent',
        tab: 'ptm_connect',
        badge: 'PTM Slot',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['parent']
      },

      // --- Parent People ---
      {
        id: 'parent-person-ananya',
        title: 'Mrs. Ananya Verma',
        subtitle: 'Class 8-B Homeroom Faculty & Mathematics Teacher',
        category: 'students',
        icon: 'book',
        href: '/parent',
        tab: 'ptm_connect',
        badge: 'Class Faculty',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        role: ['parent']
      },
      {
        id: 'parent-person-ramesh',
        title: 'Coach Ramesh',
        subtitle: 'Physical Fitness & Sports Head',
        category: 'students',
        icon: 'trophy',
        href: '/parent',
        tab: 'dashboard',
        badge: 'Sports Head',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['parent']
      },

      // --- Parent Actions ---
      {
        id: 'parent-act-pay',
        title: 'Pay Pending Tuition Fee Online (UPI / Card)',
        subtitle: 'Instant fee clearance with auto-receipt download',
        category: 'actions',
        icon: 'chart',
        href: '/parent',
        tab: 'fees',
        badge: '1-Click Pay',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['parent']
      },
      {
        id: 'parent-act-leave',
        title: 'Submit Doctor Medical Note & Leave Request',
        subtitle: 'Attach sick certificate for medical re-exam clearance',
        category: 'actions',
        icon: 'memo',
        href: '/parent',
        tab: 'leave',
        badge: 'Medical Leave',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        role: ['parent']
      },
      {
        id: 'parent-act-ptm',
        title: 'Join Virtual PTM Video Meeting with Teacher',
        subtitle: 'Open LiveKit conference room for parent-teacher discussion',
        category: 'actions',
        icon: 'rocket',
        href: '/parent',
        tab: 'ptm_connect',
        badge: 'Live Video',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        role: ['parent']
      },

      // ========================================================
      // 4. ADMIN & PRINCIPAL MODULES & SHORTCUTS
      // ========================================================
      {
        id: 'admin-mod-cockpit',
        title: 'Executive Command Cockpit & Vitals',
        subtitle: 'Morning campus pulse, fee analytics & institutional health',
        category: 'navigation',
        icon: 'rocket',
        href: '/admin',
        tab: 'cockpit',
        badge: 'Executive',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-tasks',
        title: 'Institutional Mandates & Tasks Desk',
        subtitle: 'CBSE renewal, fire safety, compliance verification with SLAs',
        category: 'navigation',
        icon: 'memo',
        href: '/admin',
        tab: 'tasks',
        badge: 'Mandates',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-triage',
        title: 'Priority Action Alerts & Safety Triage',
        subtitle: 'Resolve urgent campus escalations & breach alerts',
        category: 'navigation',
        icon: 'fire',
        href: '/admin',
        tab: 'triage',
        badge: 'Urgent',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-tc',
        title: 'Student TC & Transfer Leaving Certificates',
        subtitle: 'Dual-custody verification: check dues, parent approval & physical scan',
        category: 'navigation',
        icon: 'lock',
        href: '/admin',
        tab: 'exit',
        badge: 'Legal Vault',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-sis',
        title: 'Unified SIS & Student Directory Records',
        subtitle: 'Class rosters, demographics, certificates & academic history',
        category: 'navigation',
        icon: 'graduation',
        href: '/admin',
        tab: 'sis',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-fees',
        title: 'Accounts, Fees & Defaulters Cockpit',
        subtitle: 'Milestone collections, overdue ledgers & SMS reminders',
        category: 'navigation',
        icon: 'chart',
        href: '/admin',
        tab: 'fees',
        badge: 'Finance',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-substitutions',
        title: 'Faculty Period Substitution Desk',
        subtitle: 'Smart auto-substitution for on-leave teachers',
        category: 'navigation',
        icon: 'bulb',
        href: '/admin',
        tab: 'substitutions',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-staff',
        title: 'Staff Directory & Permissions Registry',
        subtitle: 'Faculty profiles, department roles & access permissions',
        category: 'navigation',
        icon: 'book',
        href: '/admin',
        tab: 'staff',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-rollover',
        title: 'Class Promotion & Academic Year Rollover',
        subtitle: 'Batch promotion pipeline & graduation matrix to AY 2027-28',
        category: 'navigation',
        icon: 'trophy',
        href: '/admin',
        tab: 'rollover',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-crm',
        title: 'Admissions CRM & Inbound Pipeline',
        subtitle: 'Prospective leads, campus tours & counseling stages',
        category: 'navigation',
        icon: 'target',
        href: '/admin',
        tab: 'crm',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-exams',
        title: 'Examinations & Seating Timetables',
        subtitle: 'Term exam timetables, room plans & invigilator allocations',
        category: 'navigation',
        icon: 'calendar',
        href: '/admin',
        tab: 'exams',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-payroll',
        title: 'Staff Monthly Payroll & Salary Slips',
        subtitle: 'Disbursements, bank statements & statutory deductions',
        category: 'navigation',
        icon: 'chart',
        href: '/admin',
        tab: 'payroll',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-mod-events',
        title: 'Campus Life & School Events Command',
        subtitle: 'Annual day, sports day & vendor equipment logistics',
        category: 'navigation',
        icon: 'sparkles',
        href: '/admin',
        tab: 'events',
        role: ['admin', 'super_admin']
      },

      // --- Admin Tasks ---
      {
        id: 'admin-task-cbse',
        title: 'CBSE Board Affiliation Renewal Dossier Inspection',
        subtitle: 'Assigned: Dr. Sunita Kapoor • Executive Compliance • In Progress',
        category: 'tasks',
        icon: 'memo',
        href: '/admin',
        tab: 'tasks',
        badge: 'Critical SLA 96h',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-task-loc',
        title: 'Submit Class 10 Board Exam LOC to CBSE Portal',
        subtitle: 'Assigned: Ms. Rekha Iyer • 312 Candidates • Due Today 5 PM',
        category: 'tasks',
        icon: 'lock',
        href: '/admin',
        tab: 'tasks',
        badge: 'Critical SLA 8h',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-task-lab',
        title: 'Audit Chemistry Laboratory Acid & Apparatus Stock',
        subtitle: 'Assigned: Mrs. Shalini Rao • Inventory & Safety Buffer',
        category: 'tasks',
        icon: 'bulb',
        href: '/admin',
        tab: 'tasks',
        badge: 'Inventory 72h',
        badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        role: ['admin', 'super_admin']
      },

      // --- Admin People ---
      {
        id: 'admin-person-sunita',
        title: 'Dr. Sunita Kapoor',
        subtitle: 'Principal & Head of Institution • CBSE Board Lead',
        category: 'students',
        icon: 'graduation',
        href: '/admin',
        tab: 'staff',
        badge: 'Principal',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-person-ananya',
        title: 'Mrs. Ananya Verma',
        subtitle: 'Senior Mathematics Faculty • Class 10-A Head Teacher',
        category: 'students',
        icon: 'book',
        href: '/admin',
        tab: 'staff',
        badge: 'Faculty',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-student-aarav',
        title: 'Aarav Sharma',
        subtitle: 'Class 8-B • Pending TC Exit Clearance Dual Verification',
        category: 'students',
        icon: 'lock',
        href: '/admin',
        tab: 'exit',
        badge: 'TC Pending',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        role: ['admin', 'super_admin']
      },

      // --- Admin Actions ---
      {
        id: 'admin-act-new-task',
        title: 'Log New Institutional Mandate / Task',
        subtitle: 'Delegate administrative duty with SLA & priority target',
        category: 'actions',
        icon: 'rocket',
        href: '/admin',
        tab: 'tasks',
        badge: 'Delegate',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-act-fee-reminders',
        title: 'Send Bulk Fee Defaulter SMS Notifications',
        subtitle: 'Dispatch automated payment links to overdue parents',
        category: 'actions',
        icon: 'chart',
        href: '/admin',
        tab: 'fees',
        badge: 'Automate',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'admin-act-tc-verify',
        title: 'Verify Physical TC Handover Scan & Lock Vault',
        subtitle: 'Archive signed register slip with SHA-256 legal seal',
        category: 'actions',
        icon: 'lock',
        href: '/admin',
        tab: 'exit',
        badge: 'TC Vault',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        role: ['admin', 'super_admin']
      },

      // ========================================================
      // 5. COORDINATOR MODULES (EXAM & ADMISSIONS)
      // ========================================================
      {
        id: 'coord-mod-vault',
        title: 'Secrecy Vault & QP Decryption Desk',
        subtitle: 'Encrypted papers, master key unlocking, paper audit',
        category: 'navigation',
        icon: 'lock',
        href: '/exam_coordinator',
        tab: 'secrecy_vault',
        role: ['exam_coordinator']
      },
      {
        id: 'coord-mod-schedules',
        title: 'Examination Schedules & Hall Allocations',
        subtitle: 'Hall tickets, invigilation duty roster, seat mapping',
        category: 'navigation',
        icon: 'calendar',
        href: '/exam_coordinator',
        tab: 'schedules',
        role: ['exam_coordinator']
      },
      {
        id: 'coord-mod-remedial',
        title: 'Remedial Re-Exam Mandates Desk',
        subtitle: 'Absentee justifications, medical re-exams & doctor approvals',
        category: 'navigation',
        icon: 'trophy',
        href: '/exam_coordinator',
        tab: 'remedial_reexam',
        role: ['exam_coordinator']
      },
      {
        id: 'coord-mod-admissions-crm',
        title: 'Admissions Desk & Inbound Lead Pipeline',
        subtitle: 'Prospect counseling, campus tours & document verification',
        category: 'navigation',
        icon: 'target',
        href: '/admissions_coordinator',
        tab: 'crm',
        role: ['admissions_coordinator']
      },

      // ========================================================
      // 6. GLOBAL UTILITY ACTIONS (ACCESSIBLE TO ALL)
      // ========================================================
      {
        id: 'action-toggle-theme',
        title: `Switch to ${theme === 'dark' ? 'Light Theme' : 'Dark Theme'}`,
        subtitle: 'Toggle platform interface color theme instantly',
        category: 'actions',
        icon: 'bulb',
        action: () => toggleTheme(),
        badge: 'Theme',
        badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        role: ['student', 'teacher', 'parent', 'admin', 'super_admin', 'exam_coordinator', 'admissions_coordinator', 'academic_coordinator', 'accounts_coordinator', 'inventory_coordinator', 'transport_coordinator']
      }
    ];
  }, [theme, toggleTheme]);

  // Filter items strictly based on role, category, and query
  const filteredItems = useMemo(() => {
    // 1. Strict Role Filtering
    let list = allItems.filter(item => {
      if (!item.role) return false;
      return item.role.includes(normalizedRole);
    });

    // 2. Category Pill Filter
    if (selectedCategory !== 'all') {
      list = list.filter(item => item.category === selectedCategory);
    }

    // 3. Search Query Filter
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allItems, normalizedRole, selectedCategory, query]);

  // Reset active index when filtered items change
  useEffect(() => {
    setActiveIndex(0);
  }, [filteredItems]);

  // Execute selected item
  const handleSelect = (item: CommandItem) => {
    onClose();

    if (item.action) {
      item.action();
      return;
    }

    if (item.href) {
      if (item.tab) {
        window.dispatchEvent(new CustomEvent('edu360:switch-tab', { detail: { tab: item.tab } }));
        window.dispatchEvent(new CustomEvent('edu360-navigate', { detail: item.tab }));
      }
      
      const targetUrl = item.tab ? `${item.href}?tab=${item.tab}` : item.href;
      router.push(targetUrl);
    }
  };

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[activeIndex]) {
        handleSelect(filteredItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  const roleLabel = normalizedRole.replace('_', ' ').toUpperCase();

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-8 sm:pt-14 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[520px] transition-all"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholderText}
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Close Search (or press ESC)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span>ESC</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Filter Pills with Active Role Pill */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/20 text-xs font-semibold">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Results' },
              { id: 'navigation', label: '🧭 Modules' },
              { id: 'tasks', label: '📋 Tasks' },
              { id: 'students', label: '🎓 People' },
              { id: 'actions', label: '⚡ Actions' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 shrink-0">
            {roleLabel} PORTAL
          </span>
        </div>

        {/* Dynamic Context Header when Query is Empty */}
        {!query.trim() && (
          <div className="px-5 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>⚡ Recommended for You ({roleLabel})</span>
            <span className="text-[10px] font-normal normal-case text-slate-400">Click to jump or press ↵</span>
          </div>
        )}

        {/* Result Items List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[320px] scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Icon3D name="bulb" className="h-8 w-8 mx-auto opacity-40" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching commands found</p>
              <p className="text-xs text-slate-400">
                {normalizedRole === 'student' && 'Try searching for "homework", "exam", "live", "marks", or "timetable"'}
                {normalizedRole === 'teacher' && 'Try searching for "attendance", "gradebook", "blueprint", or "duties"'}
                {normalizedRole === 'parent' && 'Try searching for "fee", "marks", "report", "leave", or "ptm"'}
                {normalizedRole === 'admin' && 'Try searching for "cockpit", "fee", "mandate", "tc", or "staff"'}
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      {item.icon ? (
                        <Icon3D name={item.icon as any} className="h-5 w-5" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold truncate ${
                          isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                            item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        Jump <CornerDownLeft className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">↵</kbd> select
            </span>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">esc</kbd> close
            </button>
          </div>

          <div className="flex items-center gap-1 font-semibold text-slate-400">
            <span>EDU360 Universal Omnisearch</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
