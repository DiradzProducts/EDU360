'use client';
import { Icon3D } from '@/components/ui/icon-3d';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  Award,
  Target,
  ShieldCheck,
  Users,
  CreditCard,
  FileText,
  Stamp,
  Bell,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Download,
  MessageSquare,
  ArrowRight,
  Sun,
  Moon,
  Search,
  ExternalLink,
  Calendar,
  AlertCircle,
  HelpCircle,
  Video,
  Phone,
  Mail,
  UserCheck,
  BookOpen,
  CheckSquare,
  Square,
  Eye,
  Menu,
  X,
  Check,
  Share2,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme-context';
import { 
  FocusTable, 
  FeeMilestone, 
  HomeworkSubmission,
  ExitClearance,
  LeaveRequest,
  Homework,
  TaxCertificateData
} from '@/lib/types';
import { BannerCarousel } from '@/components/banner-carousel';
import { FocusTableView } from '@/components/focus-table-view';
import { RoleGuard } from '@/components/role-guard';
import { ParentMarksView } from '@/components/parent-marks-view';
import { ParentGoldenFocusView } from '@/components/parent-golden-focus-view';
import { ParentSisView } from '@/components/parent-sis-view';
import { ParentPtmView } from '@/components/parent-ptm-view';
import { ParentTeacherChatView } from '@/components/parent-teacher-chat-view';
import { ParentNotificationDrawer, ParentNotification } from '@/components/parent-notification-drawer';
import { Footer } from '@/components/footer';
import { playButtonClick, playStarCollect } from '@/lib/sound-effects';
import { downloadOfficialDocumentFile } from '@/lib/export-utils';

export interface ParentChildProfile {
  id: number;
  name: string;
  className: string;
  rollNo: number;
  initials: string;
  tier: 'k5' | 'middle' | 'secondary';
  attendanceStatus: string;
  currentClass: string;
  homeroomFaculty: string;
  remedialSubject: string;
  remedialDay: string;
  pendingHomeworkCount: number;
  guardianName?: string;
}

const SHARMA_CHILDREN: ParentChildProfile[] = [
  {
    id: 1,
    name: 'Aarav Sharma',
    className: 'Class 8-B',
    rollNo: 14,
    initials: 'AS',
    tier: 'secondary',
    attendanceStatus: 'Present Today ✓ • Period 3 Mathematics (Room 204)',
    currentClass: 'Live Virtual Class: Period 3 Active',
    homeroomFaculty: 'Mrs. Ananya Verma',
    remedialSubject: 'Mathematics',
    remedialDay: 'Day 2 of 7',
    pendingHomeworkCount: 1
  },
  {
    id: 7,
    name: 'Ananya Sharma',
    className: 'Class 3-A',
    rollNo: 8,
    initials: 'ANS',
    tier: 'k5',
    attendanceStatus: 'Present Today ✓ • Phonics & Story Magic',
    currentClass: 'Live Virtual Class: Junior Rocket Active',
    homeroomFaculty: 'Ms. Priya Nair',
    remedialSubject: 'Reading & Phonics',
    remedialDay: 'Day 1 of 5',
    pendingHomeworkCount: 1
  }
];

export type ParentNavSection = 
  | 'dashboard'
  | 'marks'
  | 'focus_table'
  | 'child_sis'
  | 'ptm_connect'
  | 'chat'
  | 'fees'
  | 'leave';

export default function ParentPage() {
  // Navigation & Layout State
  const [activeNav, setActiveNav] = useState<ParentNavSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Application Theme Hook
  const { theme, toggleTheme } = useTheme();
  const sidebarTheme = theme;

  // Multi-Child Profile Switcher State
  const [activeKidId, setActiveKidId] = useState<number>(1);
  const activeKid = SHARMA_CHILDREN.find((k) => k.id === activeKidId) || SHARMA_CHILDREN[0];
  const [parentToast, setParentToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setParentToast(msg);
    setTimeout(() => setParentToast(null), 4000);
  };

  // Domain Data State
  const [focusTable, setFocusTable] = useState<FocusTable | null>(null);
const DEFAULT_PARENT_FEES_AARAV: FeeMilestone[] = [
  { id: 1, student_id: 1, title: "Milestone 1: Term 1 Tuition & Curriculum Fee", amount: 35000, due_date: "15 Jul 2026", status: "Paid", receipt_no: "REC-2026-FEE-5821", paid_at: "12 Jul 2026, 11:20 AM", payment_method: "UPI (Google Pay)" },
  { id: 2, student_id: 1, title: "Milestone 2: Digital Learning Platform & Cloud LMS Fee", amount: 14500, due_date: "15 Jul 2026", status: "Paid", receipt_no: "REC-2026-FEE-5822", paid_at: "15 Jul 2026, 03:40 PM", payment_method: "Net Banking (HDFC)" },
  { id: 3, student_id: 1, title: "Milestone 3: STEM Robotics, Composite Lab & Library Fee", amount: 12000, due_date: "18 Aug 2026", status: "Paid", receipt_no: "REC-2026-FEE-5823", paid_at: "18 Aug 2026, 09:15 AM", payment_method: "Debit Card" },
  { id: 4, student_id: 1, title: "Milestone 4: Term 2 Tuition & Infrastructure Fee", amount: 35000, due_date: "25 Oct 2026", status: "Overdue" },
  { id: 5, student_id: 1, title: "Milestone 5: Interactive Virtual Labs & AI Proctoring Fee", amount: 14500, due_date: "10 Nov 2026", status: "Upcoming" },
  { id: 6, student_id: 1, title: "Milestone 6: Annual Day, Sports & CBSE Exam Fee", amount: 16500, due_date: "15 Dec 2026", status: "Upcoming" },
];

const DEFAULT_PARENT_FEES_ANANYA: FeeMilestone[] = [
  { id: 101, student_id: 7, title: "Milestone 1: Primary Term 1 Tuition & Curriculum (15% Sibling Concession Applied)", amount: 15300, due_date: "15 Jul 2026", status: "Paid", receipt_no: "REC-2026-FEE-9102", paid_at: "12 Jul 2026, 11:25 AM", payment_method: "UPI (Google Pay)" },
  { id: 102, student_id: 7, title: "Milestone 2: Early Learning Kit, Phonics Readers & Art Stationery", amount: 6200, due_date: "15 Jul 2026", status: "Paid", receipt_no: "REC-2026-FEE-9103", paid_at: "15 Jul 2026, 03:45 PM", payment_method: "Net Banking (HDFC)" },
  { id: 103, student_id: 7, title: "Milestone 3: Primary Activity & Discovery Hub Lab Fee", amount: 4500, due_date: "18 Aug 2026", status: "Paid", receipt_no: "REC-2026-FEE-9104", paid_at: "18 Aug 2026, 09:20 AM", payment_method: "Debit Card" },
  { id: 104, student_id: 7, title: "Milestone 4: Primary Term 2 Tuition & Activity (15% Sibling Concession Applied)", amount: 15300, due_date: "25 Oct 2026", status: "Overdue" },
  { id: 105, student_id: 7, title: "Milestone 5: Junior Annual Concert, Sports & Stage Performance", amount: 5000, due_date: "15 Dec 2026", status: "Upcoming" },
];

const DEFAULT_PARENT_FEES = DEFAULT_PARENT_FEES_AARAV;

  const [fees, setFees] = useState<FeeMilestone[]>(DEFAULT_PARENT_FEES);
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [exitClearance, setExitClearance] = useState<ExitClearance | null>(null);

  // Fee Payment Modal State
  const [payingMilestone, setPayingMilestone] = useState<FeeMilestone | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI (Google Pay)');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [feeToast, setFeeToast] = useState<string | null>(null);

  // Leave Form State
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [leaveDoctorNote, setLeaveDoctorNote] = useState<File | null>(null);
  const [leaveDoctorNoteName, setLeaveDoctorNoteName] = useState<string>('');
  const [leaveDoctorNoteSize, setLeaveDoctorNoteSize] = useState<string>('');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  // High-Signal Notification Drawer State
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<ParentNotification[]>([
    {
      id: 'notif-1',
      level: 'red',
      category: 'Absence & Attendance',
      title: 'Action Required: Consecutive Unexcused Absence Alert',
      description: 'Aarav was recorded absent yesterday (13 Oct) without an approved leave application on file. Please submit a leave note or medical certificate.',
      timestamp: 'Today, 08:45 AM',
      actionLabel: 'Submit Leave Note',
      targetTab: 'leave',
      unread: true
    },
    {
      id: 'notif-2',
      level: 'orange',
      category: 'Fee Payment',
      title: 'Payment Reminder: Term 2 Fees Due in 5 Days',
      description: 'Fee Milestone 2 (Tuition & Transport fee ₹18,500) is due on 25 Oct 2026. Instant online UPI & Card payment is open.',
      timestamp: 'Yesterday, 11:20 AM',
      actionLabel: 'Pay ₹18,500 Online',
      targetTab: 'fees',
      unread: true
    },
    {
      id: 'notif-3',
      level: 'purple',
      category: 'Pedagogical Remark',
      title: 'Teacher Pedagogical Annotation on Focus Table',
      description: 'Mrs. Sunitha Rao annotated Worksheet #4: "Aarav solved 10 factoring problems correctly! Please monitor negative sign conventions during Day 2."',
      timestamp: '12 Oct, 05:15 PM',
      actionLabel: 'View Shared Focus Table',
      targetTab: 'focus',
      unread: true
    },
    {
      id: 'notif-4',
      level: 'blue',
      category: 'Exam Marks',
      title: 'Unit Test 2 Report Cards & Rank Published',
      description: 'Class 8B Unit Test 2 marks are officially published. Aarav secured Rank #4 (88.8% Aggregate) with Grade A1 Distinction.',
      timestamp: '10 Oct, 02:00 PM',
      actionLabel: 'View Report Card',
      targetTab: 'marks',
      unread: false
    }
  ]);

  // Today's Homework State (Current Day Only - Keeping Profile Uncluttered)
  const [todayHomework, setTodayHomework] = useState<Homework[]>([]);
  const [hwVerifiedMap, setHwVerifiedMap] = useState<Record<number, boolean>>({});

  const handleVerifyHomework = (hw: Homework) => {
    setHwVerifiedMap(prev => ({
      ...prev,
      [hw.id]: !prev[hw.id]
    }));
  };
  const [selectedHwModal, setSelectedHwModal] = useState<Homework | null>(null);
  const [parentHwVerifiedMap, setParentHwVerifiedMap] = useState<Record<number, boolean>>({});

  // Leave History & Medical Toggle State
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [isMedicalLeave, setIsMedicalLeave] = useState(false);

  // 80C Tax Exemption Certificate State
  const [showTaxCertModal, setShowTaxCertModal] = useState(false);
  const [taxCertData, setTaxCertData] = useState<TaxCertificateData | null>(null);
  const [loadingTaxCert, setLoadingTaxCert] = useState(false);

  const handleOpenTaxCert = async () => {
    setLoadingTaxCert(true);
    setShowTaxCertModal(true);
    try {
      const data = await api.getFeeTaxCertificate(activeKidId);
      setTaxCertData(data);
    } catch (err) {
      console.error('Failed to load tax certificate', err);
    } finally {
      setLoadingTaxCert(false);
    }
  };

  // Load Parent Portal Data (Scoped to Active Kid)
  useEffect(() => {
    async function loadData() {
      try {
        const [ftRes, feesRes, subRes, exitsRes, hwRes, leaveRes] = await Promise.all([
          api.getFocusTable(activeKidId),
          api.getFees(activeKidId),
          api.getSubmission(activeKidId),
          api.getExitClearances(),
          api.getTodayHomework(activeKidId),
          api.getParentLeaveRequests(activeKidId)
        ]);
        setFocusTable(ftRes);
        if (feesRes && feesRes.length > 0) { setFees(feesRes); } else { setFees(activeKidId === 7 ? DEFAULT_PARENT_FEES_ANANYA : DEFAULT_PARENT_FEES_AARAV); }
        setSubmission(subRes);
        if (exitsRes && exitsRes.length > 0) {
          setExitClearance(exitsRes[0]);
        }
        setTodayHomework(hwRes);
        if (leaveRes && leaveRes.length > 0) {
          setLeaveHistory(leaveRes);
        }

        // Dynamically fetch and merge real-time push alerts from Examination Cell & Administration
        try {
          const notifRes = await api.getNotifications({ role: 'parent' });
          if (notifRes && notifRes.notifications && notifRes.notifications.length > 0) {
            const mappedDynamic: ParentNotification[] = notifRes.notifications.map((n: any, idx: number) => ({
              id: `api-notif-${n.id || idx}`,
              level: n.priority === 'High' ? 'red' : 'blue',
              category: n.title?.toLowerCase().includes('retest') || n.title?.toLowerCase().includes('exam') ? 'Exam Marks' : 'Absence & Attendance',
              title: n.title,
              description: n.message,
              timestamp: 'Just now',
              actionLabel: n.title?.toLowerCase().includes('retest') ? 'View Retest Admit Pass' : 'View Details',
              targetTab: n.title?.toLowerCase().includes('retest') || n.title?.toLowerCase().includes('exam') ? 'marks' : 'leave',
              unread: !n.is_read
            }));

            setNotifications(prev => {
              const existingTitles = new Set(prev.map(p => p.title));
              const fresh = mappedDynamic.filter(d => !existingTitles.has(d.title));
              return [...fresh, ...prev];
            });
          }
        } catch (e) {
          console.warn('Could not sync dynamic parent notifications:', e);
        }
      } catch (err) {
        console.error('Error loading parent dashboard', err);
      }
    }
    loadData();
  }, [activeKidId]);

  // Handlers

  const handleToggleParentFocusCheck = async () => {
    await api.toggleParentFocusCheck(activeKidId);
    try {
      await api.parentVerifyRemedial({ student_id: activeKidId, day_num: 1 });
    } catch (e) {
      console.warn("Parent remedial verification fallback", e);
    }
    const updated = await api.getFocusTable(activeKidId);
    setFocusTable(updated);
  };

  const handlePayFee = async () => {
    if (!payingMilestone) return;
    setPaying(true);
    try {
      const updated = await api.payFee(payingMilestone.id, selectedPaymentMethod);
      const allFees = await api.getFees(activeKidId);
      setFees(allFees);
      setPaymentSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        setPaymentSuccess(false);
        setPayingMilestone(null);
      }, 3000);
    } finally {
      setPaying(false);
    }
  };

  const handleSendWhatsAppSummary = async () => {
    try {
      await api.dispatchFeeWhatsApp(undefined, 'summary', '+91 98480 22338');
      setFeeToast('📱 WhatsApp Dispatched to +91 98480 22338: Fee statement & payment summary link delivered!');
      setTimeout(() => setFeeToast(null), 4000);
    } catch {
      setFeeToast('📱 WhatsApp Fee summary dispatched to +91 98480 22338!');
      setTimeout(() => setFeeToast(null), 4000);
    }
  };

  const handleSendWhatsAppReceipt = async (m: FeeMilestone) => {
    try {
      await api.dispatchFeeWhatsApp(m.id, 'receipt', '+91 98480 22338');
      setFeeToast(`📱 WhatsApp Receipt #${m.receipt_no || `REC-2026-FEE-${m.id}`} sent to +91 98480 22338!`);
      setTimeout(() => setFeeToast(null), 4000);
    } catch {
      setFeeToast(`📱 WhatsApp receipt sent to +91 98480 22338!`);
      setTimeout(() => setFeeToast(null), 4000);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason || !leaveFrom || !leaveTo) return;
    setLeaveSubmitted(true);
    try {
      await api.applyParentLeave({
        student_id: activeKid.id,
        student_name: activeKid.name,
        parent_name: activeKid.guardianName || 'Mr. Rajesh Sharma',
        from_date: leaveFrom,
        to_date: leaveTo,
        reason: leaveReason,
        is_medical: isMedicalLeave,
        attachment_name: leaveDoctorNoteName || undefined,
        attachment_url: leaveDoctorNoteName ? `/uploads/${leaveDoctorNoteName}` : undefined
      });
      // Refresh real-time leave history from backend
      const updatedHistory = await api.getParentLeaveRequests(activeKid.id);
      if (updatedHistory) {
        setLeaveHistory(updatedHistory);
      }
      const noteMsg = leaveDoctorNoteName ? ` with attached Doctor's Note (${leaveDoctorNoteName})` : '';
      setLeaveReason('');
      setLeaveFrom('');
      setLeaveTo('');
      setLeaveDoctorNote(null);
      setLeaveDoctorNoteName('');
      playStarCollect();
      triggerToast(`✓ Leave application${noteMsg} for ${activeKid.name} (${activeKid.className}) dispatched to ${activeKid.homeroomFaculty}! Class Teacher notified.`);
    } catch (err) {
      console.error('Leave application submission error:', err);
      triggerToast(`✓ Leave application submitted to ${activeKid.homeroomFaculty}.`);
    } finally {
      setLeaveSubmitted(false);
    }
  };

  const handleDigitalSignExit = async () => {
    await api.parentDigitalSignTC(1);
    const updatedExits = await api.getExitClearances();
    if (updatedExits && updatedExits.length > 0) {
      setExitClearance(updatedExits[0]);
    }
  };

  const handleBannerAction = (target: string) => {
    if (target === 'marks') setActiveNav('marks');
    else if (target === 'focus') setActiveNav('focus_table');
    else if (target === 'fees') setActiveNav('fees');
    else if (target === 'events' || target === 'sis' || target === 'child_sis') setActiveNav('child_sis');
    else if (target === 'ptm' || target === 'teacher' || target === 'ptm_connect') setActiveNav('ptm_connect');
    else setActiveNav('marks');
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Sidebar Navigation Groups according to PRD
  const navGroups = [
    {
      title: 'OVERVIEW & PULSE',
      items: [
        {
          id: 'dashboard' as ParentNavSection,
          label: 'Parent Dashboard',
          icon: LayoutDashboard,
          badge: 'Live',
          badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
        }
      ]
    },
    {
      title: 'ACADEMICS & OUTCOMES',
      items: [
        {
          id: 'marks' as ParentNavSection,
          label: 'Exams & Report Cards',
          icon: Award,
          badge: '88.8% · #4',
          badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
        },
        {
          id: 'focus_table' as ParentNavSection,
          label: 'Shared Focus Table',
          icon: Target,
          badge: '7 Subjects',
          badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
        },
        {
          id: 'child_sis' as ParentNavSection,
          label: 'Child SIS Profile & Vault',
          icon: ShieldCheck,
          badge: '94.2% Safe',
          badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
        }
      ]
    },
    {
      title: 'CAMPUS & ENGAGEMENT',
      items: [
        {
          id: 'chat' as ParentNavSection,
          label: 'Chat with Teachers',
          icon: MessageSquare,
          badge: '1 New',
          badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60'
        },
        {
          id: 'ptm_connect' as ParentNavSection,
          label: 'Teacher Connect & PTM',
          icon: Users,
          badge: '1 Booked',
          badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
        },
        {
          id: 'leave' as ParentNavSection,
          label: 'Student Leave Requests',
          icon: FileText,
          badge: '1 Pending',
          badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
        }
      ]
    },
    {
      title: 'FINANCE & BILLING',
      items: [
        {
          id: 'fees' as ParentNavSection,
          label: 'Fee Milestones & Receipts',
          icon: CreditCard,
          badge: 'Due Oct 25',
          badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
        }
      ]
    }
  ];

  // Helper titles for top header
  const getHeaderMeta = () => {
    switch (activeNav) {
      case 'dashboard':
        return { title: 'Parent Intelligence Dashboard', subtitle: `Real-time overview of ${activeKid.name}’s online classes, academic progress, and faculty communications` };
      case 'marks':
        return { title: 'Examination Marks & Board Report Cards', subtitle: 'CBSE-formatted subject breakdown, teacher remarks, and email memo dispatch' };
      case 'focus_table':
        return { title: 'Shared Focus Table & Teacher Interventions', subtitle: 'Collaborate with Mrs. Ananya Verma on weak concepts across all 7 curriculum subjects' };
      case 'child_sis':
        return { title: 'Child SIS Dossier & Official Document Vault', subtitle: 'Single source of truth: 94.2% attendance compliance, weekly timetable, and certified school records' };
      case 'chat':
        return { title: `Live Chat with ${activeKid.homeroomFaculty}`, subtitle: `Direct 1-on-1 academic communication channel for ${activeKid.name} (${activeKid.className})` };
      case 'ptm_connect':
        return { title: 'Parent-Teacher Communication & Online PTM Hub', subtitle: 'Direct note messaging with teachers and 1-on-1 scheduled video conferences' };
      case 'fees':
        return { title: 'Fee Milestones & Instant Online Receipts', subtitle: 'Installment breakdown, instant UPI/Card mock payment, and verified PDF receipts' };
      case 'leave':
        return { title: 'Student Leave Application & Attendance Sync', subtitle: 'Submit medical and casual leave requests directly to the class teacher' };
      default:
        return { title: 'Parent Portal', subtitle: 'EDU360 K–12 Outcomes & Intelligence Platform' };
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <RoleGuard allowedRole="parent">
      <div className="flex min-h-[calc(100vh-4rem)] w-full bg-[#F8FAFC] dark:bg-[#070B14] text-[#0F172A] dark:text-slate-100 font-sans antialiased transition-colors duration-150">
        
        {/* Mobile Drawer Backdrop */}
        {mobileDrawerOpen && (
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
            aria-hidden="true"
          />
        )}

        {/* ========================================================= */}
        {/* 1. COLLAPSIBLE LEFT SIDEBAR NAVIGATION (240px / 72px)     */}
        {/* ========================================================= */}
        <aside
          className={`fixed md:sticky top-0 md:top-16 inset-y-0 md:inset-y-auto left-0 z-40 md:z-20 h-screen md:h-[calc(100vh-4rem)] md:self-start flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none ${
            sidebarCollapsed ? 'md:w-[72px] w-[256px]' : 'w-[256px]'
          } ${
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } bg-white text-slate-800 border-r border-slate-200/90 dark:bg-[#0B101B] dark:text-slate-200 dark:border-r dark:border-slate-800/90`}
        >
          {/* Sidebar Campus Context */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/90 dark:border-slate-800/90 shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs shrink-0 font-bold">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    EDU 360
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Oakridge International School
                  </span>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs font-bold">
                <GraduationCap className="h-4 w-4" />
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

          {/* Expand Toggle when collapsed */}
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
            {navGroups.map((group, gIdx) => (
              <div key={gIdx}>
                {!sidebarCollapsed && (
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                    {group.title}
                  </span>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveNav(item.id);
                          setMobileDrawerOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                        }`}
                        title={item.label}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                          {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!sidebarCollapsed && item.badge && (
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold shrink-0 ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Academic Term Status */}
          <div className="p-3 border-t border-slate-200/90 dark:border-slate-800/90">
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Academic Term 2 · CBSE 2026-27
                </span>
              </div>
            ) : (
              <div className="mx-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Academic Term 2 · CBSE 2026-27" />
            )}
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. MAIN VIEW CONTAINER (TOP BAR + DYNAMIC MODULE CONTENT) */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Top Sticky Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070B14]/95 px-5 sm:px-8 backdrop-blur-md">
            
            {/* Left: Mobile Drawer Trigger + Clean Breadcrumb & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B101B] text-slate-700 dark:text-slate-200 shadow-xs"
                title="Open Navigation Menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                  <span>Parent Workspace</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-blue-600 dark:text-blue-400 font-bold capitalize">
                    {activeNav.replace('_', ' ')}
                  </span>
                </div>
                <h1 className="text-base font-black text-slate-900 dark:text-white truncate max-w-lg">
                  {headerMeta.title}
                </h1>
              </div>
            </div>

            {/* Right: Multi-Kid Context Switcher Pill Bar */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 hidden lg:inline-block uppercase tracking-wider">
                  Child:
                </span>
                {SHARMA_CHILDREN.map((kid) => {
                  const isSelected = kid.id === activeKidId;
                  return (
                    <button
                      key={kid.id}
                      onClick={() => {
                        playButtonClick();
                        setActiveKidId(kid.id);
                        triggerToast(`Switched active profile to ${kid.name} (${kid.className})`);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? kid.tier === 'k5'
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                            : 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80'
                      }`}
                      title={`Switch active context to ${kid.name} (${kid.className})`}
                    >
                      <span className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-black">
                        {kid.initials}
                      </span>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="font-bold">{kid.name.split(' ')[0]}</span>
                        <span className="text-[9px] opacity-80 font-normal">
                          {kid.className}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse ml-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </header>

          {/* Main Scrollable Body */}
          <main className="p-5 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">

            {/* ===================================================== */}
            {/* VIEW 1: PARENT DASHBOARD (HOME OVERVIEW)             */}
            {/* ===================================================== */}
            {activeNav === 'dashboard' && (
              <div className="space-y-6">
                
                {/* ===================================================== */}
                {/* 1. PARENT COMMAND CENTER HERO HEADER                  */}
                {/* ===================================================== */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] p-5 sm:p-6 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-gradient-to-t from-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-3 py-1 text-xs font-semibold">
                          <Users className="h-3.5 w-3.5 text-blue-500" />
                          <span>Student: <strong>{activeKid.name}</strong> ({activeKid.className} &bull; Roll #{activeKid.rollNo})</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-1 text-xs font-semibold">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{activeKid.attendanceStatus}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium">
                          <Video className="h-3 w-3 text-blue-500" />
                          <span>{activeKid.currentClass}</span>
                        </span>
                      </div>

                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                          Welcome, Dr. &amp; Mrs. Sharma!
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          Daily parental oversight summary for {activeKid.name}. {activeKid.name.split(' ')[0]} is currently attending {activeKid.className}, live classes are progressing smoothly, and homeroom instruction is guided by {activeKid.homeroomFaculty}.
                        </p>
                      </div>

                      {/* Operational Tags */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Homeroom Faculty: <strong className="text-slate-700 dark:text-slate-200">{activeKid.homeroomFaculty}</strong></span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Target className="h-3.5 w-3.5 text-amber-500" />
                          <span>Active Focus: <strong className="text-slate-700 dark:text-slate-200">{activeKid.id === 7 ? 'Reading & Phonics (Day 1 • Story Magic & Blended Sounds)' : 'Mathematics (Day 3 • Algebraic Fractions)'}</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0">
                      <button
                        onClick={() => setActiveNav('fees')}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30 transition-all duration-200 active:scale-98 border border-amber-400/30 cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>{activeKid.id === 7 ? 'Pay Milestone Fee (₹15,300 - Sibling Concession)' : 'Pay Milestone Fee (₹35,000)'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveNav('ptm_connect')}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                          <Video className="h-3.5 w-3.5 text-blue-500" />
                          <span>PTM Conference</span>
                        </button>

                        <button
                          onClick={() => setActiveNav('leave')}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Apply Leave</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Moving Banner Slider Carousel */}
                <BannerCarousel onActionClick={handleBannerAction} />

                {/* ===================================================== */}
                {/* 2. 4-CARD LIVE KPI STRIP (ELEVATED AESTHETIC BENTO)    */}
                {/* ===================================================== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
                  
                  {/* Metric 1: Attendance Compliance (Emerald Theme) */}
                  <div 
                    onClick={() => setActiveNav('child_sis')}
                    className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5.5 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-950/30 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
                  >
                    {/* Ambient Glow Orb */}
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

                    <div className="space-y-3.5 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Attendance Rate
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs ring-4 ring-emerald-500/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center font-bold">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                            {activeKid.id === 7 ? '98.2% Safe' : '94.2% Safe'}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            {activeKid.id === 7 ? '↑ 2.1% this month' : '↑ 1.4% this month'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                          {activeKid.id === 7 ? '88 / 90 Days • Checked in at 08:15 AM today • Story Circle Active' : '146 / 155 Days • Checked in at 08:02 AM today'}
                        </p>
                      </div>

                      {/* Elevated Dual-tone Progress Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-xs" style={{ width: activeKid.id === 7 ? '98.2%' : '94.2%' }} />
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100/90 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors relative z-10">
                      <span>View Full Attendance Ledger</span>
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-all duration-200">
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Metric 2: Academic Standing (Purple Theme) */}
                  <div 
                    onClick={() => setActiveNav('marks')}
                    className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5.5 shadow-xs hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-950/30 hover:border-purple-500/40 dark:hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
                  >
                    {/* Ambient Glow Orb */}
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

                    <div className="space-y-3.5 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Term 1 Aggregate
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-transparent text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs ring-4 ring-purple-500/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center font-bold">
                          <Award className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                            {activeKid.id === 7 ? '96.5% Star Performer' : '88.8% Distinction'}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            {activeKid.id === 7 ? 'Star Performer in 3-A' : 'Rank #4 in 8-B'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                          {activeKid.id === 7 ? 'Grade A+ across All Units • Early Literacy Star' : 'Grade A1 in 5 subjects • Verified by Controller'}
                        </p>
                      </div>

                      {/* Elevated Dual-tone Progress Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                        <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-violet-400 h-full rounded-full transition-all duration-500 shadow-xs" style={{ width: activeKid.id === 7 ? '96.5%' : '88.8%' }} />
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100/90 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors relative z-10">
                      <span>View Full Report Card Memo</span>
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Metric 3: Teacher Direct Chat & Support */}
                  <div 
                    onClick={() => setActiveNav('chat')}
                    className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5.5 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/30 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
                  >
                    {/* Ambient Glow Orb */}
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

                    <div className="space-y-3.5 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Teacher Direct Chat
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-transparent text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs ring-4 ring-indigo-500/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center font-bold">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="text-xl sm:text-[22px] font-black text-slate-900 dark:text-white tracking-tight">
                            {activeKid.homeroomFaculty}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            Active Online
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                          Class Teacher &bull; {activeKid.className} &bull; {activeKid.id === 7 ? 'Foundational Early Years Support' : '1-on-1 Academic Support'}
                        </p>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-500 shadow-xs" style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100/90 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">
                      <span>Open 1-on-1 Chat Thread</span>
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Metric 4: Fee Milestones (Amber Theme) */}
                  <div 
                    onClick={() => setActiveNav('fees')}
                    className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-5.5 shadow-xs hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-950/30 hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
                  >
                    {/* Ambient Glow Orb */}
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

                    <div className="space-y-3.5 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Fee Milestones
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs ring-4 ring-amber-500/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center font-bold">
                          <CreditCard className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                            {activeKid.id === 7 ? '₹21,500 Paid' : '₹61,500 Paid'}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            {activeKid.id === 7 ? '2 Paid • 1 Due (15% Sibling Concession)' : '3 Paid • 1 Due'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                          {activeKid.id === 7 ? 'Junior Term 2 Tuition Due on 25 Oct 2026' : 'Term 2 Tuition Due on 25 Oct 2026'}
                        </p>
                      </div>

                      {/* Elevated Dual-tone Progress Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500 shadow-xs" style={{ width: activeKid.id === 7 ? '60%' : '48%' }} />
                      </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100/90 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors relative z-10">
                      <span>View Fee Ledger &amp; Tax Receipts</span>
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-all duration-200">
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* ===================================================== */}
                {/* 3. 2-COLUMN PRIORITY ACTION BENTO                     */}
                {/* ===================================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Left Column: Tonight's Homework & Practice Check (7 Cols) */}
                  <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-bold border border-blue-200/70 dark:border-blue-800/70 flex items-center gap-1.5 shadow-xs">
                            <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            Tonight&apos;s Parent Verification Tasks
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            18 Oct 2026 &bull; Daily Homework
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
                          {activeKid.name.split(' ')[0]}&apos;s Homework &amp; Practice Check
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Inspect tonight&apos;s rough notebook practice and co-sign in 1 click.
                        </p>
                      </div>

                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200/70 dark:border-blue-800/70 self-start sm:self-auto shadow-xs">
                        2 Tasks Due Tonight
                      </span>
                    </div>

                    <div className="space-y-3">
                      {todayHomework.map((hw) => {
                        const isVerified = Boolean(hwVerifiedMap[hw.id]);
                        return (
                          <div
                            key={hw.id}
                            className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                              isVerified
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800 shadow-xs'
                                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <div className="space-y-1.5 max-w-md">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase px-2.5 py-0.5 border border-blue-200/60 dark:border-blue-800/60">
                                  {hw.subject}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                                  Due {hw.due_time}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                {hw.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                Teacher: <span className="text-slate-700 dark:text-slate-300 font-semibold">{hw.teacher_name}</span> &bull; Max Scale: {hw.max_marks} Marks
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => setSelectedHwModal(hw)}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
                              >
                                View Guidelines
                              </button>

                              <button
                                onClick={() => handleVerifyHomework(hw)}
                                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isVerified
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 active:scale-95'
                                }`}
                              >
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                                <span>{isVerified ? 'Co-Signed ✓' : 'Mark Verified'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Golden Remedial Focus Spotlight (5 Cols) */}
                  <div className="lg:col-span-5 rounded-3xl border border-amber-300/80 dark:border-amber-800/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-100/60 dark:from-slate-900 dark:via-slate-900/95 dark:to-amber-950/40 p-6 shadow-xs hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden">
                    {/* Ambient Gold Glow */}
                    <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-400/15 via-orange-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />

                    <div className="space-y-3.5 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-400/50 px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                          <Target className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          Curriculum Focus Spotlight
                        </span>
                        <span className="text-xs font-black text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-300/80 dark:border-rose-800/80">
                          Critical Sprint
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                          {activeKid.id === 7 
                            ? 'Phonics & Reading Magic: Blended Sounds Lag' 
                            : 'Mathematics: Algebraic Fractions Lag'}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-medium">
                          {activeKid.id === 7
                            ? "Ms. Priya Nair diagnosed hesitation in blended consonants ('str', 'spl') and silent 'e' rules. Day 1 story reading is active."
                            : "Mrs. Sunitha Rao diagnosed conceptual sign confusion in -(3x - 5). Day 3 simplification practice is active."}
                        </p>
                      </div>

                      {/* Mini Progress Card */}
                      <div className="space-y-2 p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-amber-200 dark:border-amber-900/60 text-xs shadow-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-800 dark:text-slate-200">
                            {activeKid.id === 7 ? 'Day 1 of 5-Day Plan' : 'Day 3 of 4-Day Plan'}
                          </span>
                          <span className="text-amber-700 dark:text-amber-300 font-mono font-black">
                            {activeKid.id === 7 ? '20% Complete' : '75% Complete'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/80 dark:bg-slate-700 h-2 rounded-full overflow-hidden p-0.5">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: activeKid.id === 7 ? '20%' : '75%' }} 
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block pt-0.5 font-medium">
                          Submitted Rough Sheet: <strong className="text-slate-700 dark:text-slate-300">
                            {activeKid.id === 7 ? 'Ananya_Day1_Phonics_Practice.pdf' : 'Aarav_Day3_MultiTerm_RoughWork.pdf'}
                          </strong> &bull; Ready for Guardian Sign-off
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveNav('focus_table')}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 relative z-10 border border-amber-400/40"
                    >
                      <Target className="h-4 w-4" />
                      <span>Open Full Golden Focus Table (All 7 Subjects)</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>

                {/* ===================================================== */}
                {/* 4. BALANCED 6-PORTAL DIRECT ACCESS BENTO GRID        */}
                {/* ===================================================== */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Curated Parent Portals &amp; Direct Services
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        High-frequency parent workflows designed for 1-click oversight
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      6 Modules Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
                    
                    {/* Portal 1: Exams & Report Cards */}
                    <button
                      onClick={() => setActiveNav('marks')}
                      className="relative overflow-hidden p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-950/20 text-left transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col justify-between min-h-[190px]"
                    >
                      {/* Ambient Accent Orb */}
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-transparent text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold shadow-xs ring-4 ring-purple-500/5 group-hover:scale-110 transition-transform">
                            <Award className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            Term 1 Published
                          </span>
                        </div>
                        <div className="my-3.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors tracking-tight">
                            Report Cards &amp; Upcoming Exams
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-1 leading-relaxed font-medium">
                            View marks ledger, internal subject-wise AI observations &amp; Term 2 timetable.
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        <span>Launch Academic Memo</span>
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>

                    {/* Portal 2: Curriculum Focus Table */}
                    <button
                      onClick={() => setActiveNav('focus_table')}
                      className="relative overflow-hidden p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-950/20 text-left transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col justify-between min-h-[190px]"
                    >
                      {/* Ambient Accent Orb */}
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-xs ring-4 ring-amber-500/5 group-hover:scale-110 transition-transform">
                            <Target className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            Golden Theme
                          </span>
                        </div>
                        <div className="my-3.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors tracking-tight">
                            Shared Golden Focus Table
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-1 leading-relaxed font-medium">
                            Subject filters, student rough work inspection &amp; 1-click guardian approval checkboxes.
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        <span>Inspect Rough Works</span>
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-all duration-200">
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>

                    {/* Portal 3: PTM Conference */}
                    <button
                      onClick={() => setActiveNav('ptm_connect')}
                      className="relative overflow-hidden p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-950/20 text-left transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col justify-between min-h-[190px]"
                    >
                      {/* Ambient Accent Orb */}
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold shadow-xs ring-4 ring-blue-500/5 group-hover:scale-110 transition-transform">
                            <Video className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            10-Min Slots
                          </span>
                        </div>
                        <div className="my-3.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                            Teacher Connect &amp; PTM Booking
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-1 leading-relaxed font-medium">
                            Select Homeroom or Subject Specialist and book available video conference slots.
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <span>Book 10-Min Slot</span>
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>

                    {/* Portal 4: Fees & Receipts */}
                    <button
                      onClick={() => setActiveNav('fees')}
                      className="relative overflow-hidden p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-950/20 text-left transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col justify-between min-h-[190px]"
                    >
                      {/* Ambient Accent Orb */}
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-xs ring-4 ring-emerald-500/5 group-hover:scale-110 transition-transform">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            Official PDF Receipts
                          </span>
                        </div>
                        <div className="my-3.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight">
                            Student Fee Ledger &amp; Receipts
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-1 leading-relaxed font-medium">
                            Pay tuition installments via UPI/Card, view milestones, and download official tax receipts.
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <span>Pay &bull; Download Receipts</span>
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>

                    {/* Portal 5: Direct Teacher Chat */}
                    <button
                      onClick={() => setActiveNav('chat')}
                      className="relative overflow-hidden p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/20 text-left transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col justify-between min-h-[190px]"
                    >
                      {/* Ambient Accent Orb */}
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-transparent text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shadow-xs ring-4 ring-indigo-500/5 group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            Direct Channel
                          </span>
                        </div>
                        <div className="my-3.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                            Chat with Class Teacher
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-1 leading-relaxed font-medium">
                            1-on-1 direct channel with {activeKid.homeroomFaculty} for remedial feedback and queries.
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <span>Open Chat Window</span>
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>

                    {/* Portal 6: Apply Leave */}
                    <button
                      onClick={() => setActiveNav('leave')}
                      className="relative overflow-hidden p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-950/20 text-left transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col justify-between min-h-[190px]"
                    >
                      {/* Ambient Accent Orb */}
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-transparent text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold shadow-xs ring-4 ring-blue-500/5 group-hover:scale-110 transition-transform">
                            <FileText className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                            Medical History
                          </span>
                        </div>
                        <div className="my-3.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                            Apply Leave &amp; Medical Clearances
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-1 leading-relaxed font-medium">
                            Submit absence notes to {activeKid.homeroomFaculty} and inspect approved past leaves history.
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <span>Submit Absence Note</span>
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* ===================================================== */}
            {/* VIEW 2: EXAMS & REPORT CARDS (MARKS)                  */}
            {/* ===================================================== */}
            {activeNav === 'marks' && (
              <ParentMarksView
                studentId={activeKidId}
                studentName={activeKid.name}
                className={activeKid.className}
              />
            )}

            {/* ===================================================== */}
            {/* VIEW 3: SHARED FOCUS TABLE & DIAGNOSTIC EVIDENCE        */}
            {/* ===================================================== */}
            {activeNav === 'focus_table' && (
              <ParentGoldenFocusView studentId={activeKidId} studentName={activeKid.name} />
            )}

            {/* ===================================================== */}
            {/* VIEW 4: CHILD SIS PROFILE & OFFICIAL VAULT            */}
            {/* ===================================================== */}
            {activeNav === 'child_sis' && (
              <ParentSisView studentId={activeKidId} />
            )}

            {/* ===================================================== */}
            {/* VIEW 5: DEDICATED 2-WAY CHAT WITH TEACHERS            */}
            {/* ===================================================== */}
            {activeNav === 'chat' && (
              <ParentTeacherChatView
                studentId={activeKidId}
                studentName={activeKid.name}
                className={activeKid.className}
                homeroomFaculty={activeKid.homeroomFaculty}
              />
            )}

            {/* ===================================================== */}
            {/* VIEW 6: TEACHER CONNECT & ONLINE PTM                  */}
            {/* ===================================================== */}
            {activeNav === 'ptm_connect' && (
              <ParentPtmView
                studentId={activeKidId}
                studentName={activeKid.name}
                className={activeKid.className}
                homeroomFaculty={activeKid.homeroomFaculty}
              />
            )}


            {/* ===================================================== */}
            {/* VIEW 7: FEES & ONLINE PAYMENTS                        */}
            {/* ===================================================== */}
            {activeNav === 'fees' && (() => {
              const paidMilestones = fees.filter(m => m.status === 'Paid');
              const pendingMilestones = fees.filter(m => m.status !== 'Paid');
              const totalPaid = paidMilestones.reduce((acc, m) => acc + m.amount, 0);
              const totalDue = pendingMilestones.reduce((acc, m) => acc + m.amount, 0);

              return (
                <div className="space-y-6">
                  {/* Floating Fee Toast */}
                  {feeToast && (
                    <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold">{feeToast}</span>
                    </div>
                  )}

                  {/* Header & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        Student Fee Ledger &amp; Digital Receipts
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {activeKid.name} • {activeKid.className} (Roll #{activeKid.rollNo}) • Academic Session 2026-2027 {activeKid.id === 7 && '• 15% Sibling Concession Active'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                      <button
                        onClick={handleOpenTaxCert}
                        className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                        title="Download official Income Tax Section 80C tuition certificate"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Annual 80C Tax Certificate (FY 26-27)</span>
                      </button>

                      <button
                        onClick={handleSendWhatsAppSummary}
                        className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                        title="Send complete fee dues & payment status to registered WhatsApp"
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="inline-flex items-center gap-1.5"><Icon3D name="memo" size={16} /><span>WhatsApp Status</span></span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 tracking-wider">
                          Total Fee Paid
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                        ₹{totalPaid.toLocaleString()}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block mt-1">
                        {paidMilestones.length} Milestones Cleared ✓
                      </span>
                    </div>

                    <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 p-5 shadow-xs ring-1 ring-amber-200 dark:ring-amber-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 tracking-wider">
                          Need to be Paid (Pending)
                        </span>
                        <Clock className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="mt-2 text-2xl font-black text-amber-900 dark:text-amber-200 tabular-nums">
                        ₹{totalDue.toLocaleString()}
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 block mt-1">
                        {pendingMilestones.length} Pending Milestone(s)
                      </span>
                    </div>

                    <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 p-5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 tracking-wider">
                          Next Upcoming Due
                        </span>
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                        25 Oct 2026
                      </div>
                      <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 block mt-1">
                        Term 2 Tuition &amp; Transport Fee
                      </span>
                    </div>
                  </div>

                  {/* Section 1: NEED TO BE PAID (PENDING / DUE) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          1. Need to be Paid (Pending Dues)
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 rounded-full">
                        {pendingMilestones.length} Due
                      </span>
                    </div>

                    {pendingMilestones.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/30 p-6 text-center text-xs font-bold text-emerald-800">
                        ✓ All fee installments are completely settled. No outstanding dues!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingMilestones.map((m) => (
                          <div 
                            key={m.id}
                            className="rounded-3xl border-2 border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  {m.status}
                                </span>
                                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                                  Due Date: {m.due_date}
                                </span>
                              </div>

                              <h4 className="mt-3 text-base font-black text-slate-900 dark:text-white">
                                {m.title}
                              </h4>
                              
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Breakdown: Tuition Fee ₹14,000 • Transport &amp; Science Lab ₹4,500
                              </p>

                              <div className="mt-4 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Amount Due</span>
                                <span className="text-2xl font-black text-amber-900 dark:text-amber-200 tabular-nums">
                                  ₹{m.amount.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                              <button
                                onClick={() => setPayingMilestone(m)}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                              >
                                <CreditCard className="h-4 w-4" />
                                <span>Pay Now (UPI / Card)</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 2: FEE PAID (OFFICIAL RECEIPTS & SETTLEMENT HISTORY) */}
                  <div className="space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          2. Fee Paid (Official Receipts &amp; History)
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                        {paidMilestones.length} Paid
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paidMilestones.map((m) => (
                        <div 
                          key={m.id}
                          className="rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Paid &amp; Reconciled ✓
                              </span>
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {m.paid_at || 'Paid'}
                              </span>
                            </div>

                            <h4 className="mt-3 text-base font-black text-slate-900 dark:text-white">
                              {m.title}
                            </h4>

                            <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                                  Receipt #{m.receipt_no || `REC-2026-FEE-${m.id + 5821}`}
                                </span>
                                <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
                                  ₹{m.amount.toLocaleString()}
                                </span>
                              </div>
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">
                                Mode: {m.payment_method || 'UPI (Google Pay)'} • Ref: UPI/{m.id}938210/HDFC
                              </span>
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                downloadOfficialDocumentFile(`${m.title} Official School Tax Receipt #${m.receipt_no || `REC-2026-FEE-${m.id + 5821}`}`, activeKid.name, `OIS-2026-${activeKid.rollNo}`);
                                setFeeToast(`Official School Tax Receipt downloaded for ${m.title}`);
                                setTimeout(() => setFeeToast(null), 4000);
                              }}
                              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5 text-blue-600" />
                              <span>Download Receipt</span>
                            </button>

                            <button
                              onClick={() => handleSendWhatsAppReceipt(m)}
                              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                              title="Send PDF receipt link to WhatsApp"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                              <span>Send to WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Modal */}
                  {payingMilestone && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            Instant Fee Payment Gateway (Mock)
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {payingMilestone.title} • {activeKid.name} ({activeKid.className})
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Payable Amount</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                            ₹{payingMilestone.amount.toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Select Payment Rail</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['UPI (Google Pay)', 'UPI (PhonePe)', 'Credit/Debit Card', 'Net Banking'].map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setSelectedPaymentMethod(method)}
                                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                                  selectedPaymentMethod === method
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setPayingMilestone(null)}
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handlePayFee}
                            disabled={paying}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold shadow-md disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{paying ? 'Processing Payment...' : `Authorize ₹${payingMilestone.amount.toLocaleString()}`}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ===================================================== */}
            {/* VIEW 8: STUDENT LEAVE REQUESTS                        */}
            {/* ===================================================== */}
            {activeNav === 'leave' && (
              <div className="space-y-6">
                <div className="max-w-xl">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Submit Leave Request for {activeKid.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dispatches directly to {activeKid.homeroomFaculty} ({activeKid.className}) with auto-attendance sync
                  </p>

                  <form onSubmit={handleApplyLeave} className="mt-5 space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">From Date</label>
                        <input
                          type="date"
                          required
                          value={leaveFrom}
                          onChange={(e) => setLeaveFrom(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">To Date</label>
                        <input
                          type="date"
                          required
                          value={leaveTo}
                          onChange={(e) => setLeaveTo(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Absence</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="e.g. Dental appointment or family medical commitment..."
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <input
                        type="checkbox"
                        id="is-medical-leave-checkbox"
                        checked={isMedicalLeave}
                        onChange={(e) => setIsMedicalLeave(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="is-medical-leave-checkbox" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                        Mandated Medical / Hospitalization Leave (Requires Doctor&apos;s Note)
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Doctor&apos;s Prescription / Medical Certificate (Required for Medical Leave)
                      </label>
                      <input
                        type="file"
                        id="parent-leave-doctor-note"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setLeaveDoctorNote(file);
                            setLeaveDoctorNoteName(file.name);
                            const kb = Math.round(file.size / 1024);
                            setLeaveDoctorNoteSize(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
                          }
                        }}
                      />
                      {leaveDoctorNoteName ? (
                        <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {leaveDoctorNoteName}
                              </p>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                {leaveDoctorNoteSize} • Ready to submit with leave note
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <label
                              htmlFor="parent-leave-doctor-note"
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all"
                            >
                              Change
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setLeaveDoctorNote(null);
                                setLeaveDoctorNoteName('');
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="parent-leave-doctor-note"
                          className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100/60 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 cursor-pointer transition-all text-xs font-medium text-slate-600 dark:text-slate-400"
                        >
                          <Upload className="h-4 w-4 text-blue-500" />
                          <span>Attach Doctor&apos;s Note or Hospital Slip (PDF / Image)</span>
                        </label>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>Submit Leave Application for {activeKid.name.split(' ')[0]}</span>
                    </button>
                  </form>
                </div>

                {/* Approved Past Leaves & Medical Clearances History */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Approved Past Leaves &amp; Medical Clearances History
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                      Official Absence Record
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                            <th className="py-3 px-4">Leave Dates</th>
                            <th className="py-3 px-4">Reason &amp; Medical Category</th>
                            <th className="py-3 px-4">Approving Authority</th>
                            <th className="py-3 px-4">Document / Clearance</th>
                            <th className="py-3 px-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          {leaveHistory.map((lr) => (
                            <tr key={lr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                {lr.from_date} – {lr.to_date}
                                {lr.is_medical && (
                                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block mt-0.5">
                                    [Medical Leave]
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                {lr.reason}
                              </td>
                              <td className="py-3 px-4 text-slate-700 dark:text-slate-200 font-medium">
                                <div className="space-y-0.5">
                                  <span>{activeKid.homeroomFaculty}</span>
                                  <span className="text-[10px] text-slate-400 block">Stage: {lr.approval_stage || (lr.status === 'Approved' ? 'Attendance Adjusted' : 'Under Review')}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 text-[11px]">
                                {lr.attachment_name ? `${lr.attachment_name} ✓` : 'Standard Parent Note'}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                  lr.status === 'Approved'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                    : lr.status === 'Rejected'
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                }`}>
                                  {lr.status === 'Approved' ? 'Approved ✓' : lr.status === 'Rejected' ? 'Rejected ✗' : 'Pending Review'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              02 Sep 2026 – 03 Sep 2026 <span className="text-[10px] font-normal text-slate-400 block">2 Days</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              Family Medical Emergency &amp; Travel
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-200 font-medium">
                              Vice Principal Academic Office
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              Parent Written Verification Note
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                                Approved ✓
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>

          {/* Brand Footer */}
          <Footer className="pb-8" />
        </div>

        {/* ========================================================= */}
        {/* 3. HIGH-SIGNAL PUSH ALERTS DRAWER                         */}
        {/* ========================================================= */}
        <ParentNotificationDrawer
          isOpen={notificationDrawerOpen}
          onClose={() => setNotificationDrawerOpen(false)}
          onNavigateTab={(tab) => {
            if (tab === 'focus') setActiveNav('focus_table');
            else setActiveNav(tab as ParentNavSection);
          }}
          notifications={notifications}
          onDismissNotification={handleDismissNotification}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        {/* ========================================================= */}
        {/* 4. HOMEWORK GUIDELINES & NOTEBOOK VERIFICATION MODAL      */}
        {/* ========================================================= */}
        {selectedHwModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase px-2.5 py-0.5">
                      {selectedHwModal.subject}
                    </span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2.5 py-0.5">
                      Due Today ({selectedHwModal.due_time})
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedHwModal.title}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Teacher: {selectedHwModal.teacher_name} &bull; Class {selectedHwModal.class_name}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedHwModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Assignment Specs & Instructions */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Teacher Instructions &amp; Guidelines:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {selectedHwModal.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Evaluation Weightage</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {selectedHwModal.weightage || 'Weekly Assessment'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Maximum Marks</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {selectedHwModal.max_marks} Points
                    </span>
                  </div>
                </div>

                {/* Parent Home Check Guidance */}
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Parent Inspection Checklist:
                  </span>
                  <p className="text-xs text-amber-900 dark:text-amber-200 italic leading-relaxed">
                    &ldquo;Verify that {activeKid.name.split(' ')[0]} has completed this work directly into the study notebook with legible handwriting and clean step work before signing verification.&rdquo;
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedHwModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    if (selectedHwModal) {
                      setParentHwVerifiedMap(prev => ({
                        ...prev,
                        [selectedHwModal.id]: !prev[selectedHwModal.id]
                      }));
                      setSelectedHwModal(null);
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>
                    {parentHwVerifiedMap[selectedHwModal.id]
                      ? 'Mark Notebook Unverified'
                      : 'Confirm Parent Verification'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Parent Floating Toast */}
        {parentToast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{parentToast}</span>
          </div>
        )}


        {/* ======================================================== */}
        {/* SECTION 80C ANNUAL TUITION FEE CERTIFICATE MODAL        */}
        {/* ======================================================== */}
        {showTaxCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Official Tuition Fee Certificate
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Income Tax Exemption under Section 80C • FY 2026-2027
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTaxCertModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {loadingTaxCert ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Generating certified Section 80C tax certificate...
                </div>
              ) : taxCertData ? (
                <div className="space-y-4">
                  {/* Certificate Document Border Box */}
                  <div className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs space-y-4 relative">
                    <div className="text-center space-y-1 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        {taxCertData.school_info.name}
                      </span>
                      <p className="text-[10px] text-slate-500">{taxCertData.school_info.address}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        CBSE Affiliation No: {taxCertData.school_info.cbse_affiliation_no} | PAN: {taxCertData.school_info.pan}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-500">Certificate No: <code className="text-slate-900 dark:text-white">{taxCertData.certificate_no}</code></span>
                      <span className="text-slate-500">Date: {taxCertData.issue_date}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Name</span>
                        <strong className="text-slate-900 dark:text-white">{taxCertData.student_info.student_name}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Class &amp; Section</span>
                        <strong className="text-slate-900 dark:text-white">{taxCertData.student_info.class_name}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Parent / Guardian</span>
                        <strong className="text-slate-900 dark:text-white">{taxCertData.student_info.guardian_name}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Admission / Roll No</span>
                        <strong className="text-slate-900 dark:text-white">{taxCertData.student_info.admission_no}</strong>
                      </div>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 italic pt-2">
                      &quot;{taxCertData.certification_text}&quot;
                    </p>

                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                        Total Eligible Tuition Fee Paid (FY 2026-27):
                      </span>
                      <span className="font-black text-emerald-700 dark:text-emerald-300 text-base">
                        ₹{taxCertData.eligible_tuition_fee.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-end pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
                      <div>
                        <span>Tamper-evident verification hash:</span>
                        <span className="block font-mono text-[9px] text-slate-500">SHA256: 4b91f0...39a8e2</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-700 dark:text-slate-200 block">Finance Officer / Registrar</span>
                        <span>Authorized Digital Seal ✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTaxCertModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        downloadOfficialDocumentFile(`Section 80C Tuition Fee Certificate - ${taxCertData.student_info.student_name}`, taxCertData.student_info.student_name, taxCertData.certificate_no);
                        setShowTaxCertModal(false);
                        triggerToast(`✓ Official Section 80C Tax Certificate downloaded successfully.`);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Certified PDF Memo</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

      </div>
    </RoleGuard>
  );
}
