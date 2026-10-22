'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  Award,
  Target,
  ShieldCheck,
  Users,
  Bus,
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
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme-context';
import { 
  FocusTable, 
  BusRoute, 
  FeeMilestone, 
  HomeworkSubmission,
  ExitClearance,
  LeaveRequest,
  Homework
} from '@/lib/types';
import { BannerCarousel } from '@/components/banner-carousel';
import { FocusTableView } from '@/components/focus-table-view';
import { BusTracker } from '@/components/bus-tracker';
import { RoleGuard } from '@/components/role-guard';
import { ParentMarksView } from '@/components/parent-marks-view';
import { ParentSisView } from '@/components/parent-sis-view';
import { ParentPtmView } from '@/components/parent-ptm-view';
import { ParentNotificationDrawer, ParentNotification } from '@/components/parent-notification-drawer';
import { Footer } from '@/components/footer';

export type ParentNavSection = 
  | 'dashboard'
  | 'marks'
  | 'focus_table'
  | 'child_sis'
  | 'ptm_connect'
  | 'bus'
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

  // Domain Data State
  const [focusTable, setFocusTable] = useState<FocusTable | null>(null);
  const [busRoute, setBusRoute] = useState<BusRoute | null>(null);
  const [fees, setFees] = useState<FeeMilestone[]>([]);
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [exitClearance, setExitClearance] = useState<ExitClearance | null>(null);

  // Fee Payment Modal State
  const [payingMilestone, setPayingMilestone] = useState<FeeMilestone | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI (Google Pay)');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);

  // Leave Form State
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
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
  const [selectedHwModal, setSelectedHwModal] = useState<Homework | null>(null);
  const [parentHwVerifiedMap, setParentHwVerifiedMap] = useState<Record<number, boolean>>({});

  // Load Parent Portal Data
  useEffect(() => {
    async function loadData() {
      try {
        const [ftRes, busRes, feesRes, subRes, exitsRes, hwRes] = await Promise.all([
          api.getFocusTable(1),
          api.getBusTracker(1),
          api.getFees(1),
          api.getSubmission(1),
          api.getExitClearances(),
          api.getTodayHomework(1)
        ]);
        setFocusTable(ftRes);
        setBusRoute(busRes);
        setFees(feesRes);
        setSubmission(subRes);
        if (exitsRes && exitsRes.length > 0) {
          setExitClearance(exitsRes[0]);
        }
        setTodayHomework(hwRes);
      } catch (err) {
        console.error('Error loading parent dashboard', err);
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleAdvanceBus = async () => {
    const updated = await api.stepBusRoute(1);
    setBusRoute(updated);
  };

  const handleToggleParentFocusCheck = async () => {
    await api.toggleParentFocusCheck(1);
    const updated = await api.getFocusTable(1);
    setFocusTable(updated);
  };

  const handlePayFee = async () => {
    if (!payingMilestone) return;
    setPaying(true);
    try {
      const updated = await api.payFee(payingMilestone.id, selectedPaymentMethod);
      const allFees = await api.getFees(1);
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

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason) return;
    setLeaveSubmitted(true);
    setTimeout(() => {
      setLeaveSubmitted(false);
      setLeaveReason('');
      setLeaveFrom('');
      setLeaveTo('');
      alert('Leave application dispatched to Mrs. Ananya Verma');
    }, 1500);
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
    else if (target === 'bus') setActiveNav('bus');
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
          id: 'ptm_connect' as ParentNavSection,
          label: 'Teacher Connect & PTM',
          icon: Users,
          badge: '1 Booked',
          badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
        },
        {
          id: 'bus' as ParentNavSection,
          label: 'Live Bus GPS Tracker',
          icon: Bus,
          badge: 'Route 4 · 8m',
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
        return { title: 'Parent Intelligence Dashboard', subtitle: 'Real-time overview of Aarav Sharma’s academics, attendance, and school bus telemetry' };
      case 'marks':
        return { title: 'Examination Marks & Board Report Cards', subtitle: 'CBSE-formatted subject breakdown, teacher remarks, and email memo dispatch' };
      case 'focus_table':
        return { title: 'Shared Focus Table & Teacher Interventions', subtitle: 'Collaborate with Mrs. Ananya Verma on weak concepts across all 7 curriculum subjects' };
      case 'child_sis':
        return { title: 'Child SIS Dossier & Official Document Vault', subtitle: 'Single source of truth: 94.2% attendance compliance, weekly timetable, and certified school records' };
      case 'ptm_connect':
        return { title: 'Parent-Teacher Communication & Online PTM Hub', subtitle: 'Direct note messaging with teachers and 1-on-1 scheduled video conferences' };
      case 'bus':
        return { title: 'Live School Bus GPS Tracking (Route 4)', subtitle: 'Real-time GPS telemetry, stop-by-stop progress, and driver Ramesh Kumar contact' };
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

            {/* Right: Child Status Chip (Clean single indicator) */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 shadow-xs">
                <div className="h-7 w-7 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-xs">
                  AS
                </div>
                <div className="text-left text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">Aarav Sharma</span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.2 text-[9px] font-black">
                      Present Today
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Class 8B • Roll #14
                  </span>
                </div>
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
                          <span>Student: <strong>Aarav Sharma</strong> (Class 8-B • Roll #14)</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-1 text-xs font-semibold">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Present Today ✓ • Period 3 Mathematics (Room 204)</span>
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium">
                          <Bus className="h-3 w-3 text-blue-500" />
                          <span>Route 4 Live: {busRoute?.eta_mins || 8}m ETA</span>
                        </span>
                      </div>

                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                          Welcome, Dr. &amp; Mrs. Sharma!
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          Here is your daily parental oversight summary for Thursday, 18 Oct 2026. Aarav is attending Period 3 Mathematics, Bus Route 4 is on schedule, and his Day 2 remedial practice notebook is ready for your parental verification sign-off tonight.
                        </p>
                      </div>

                      {/* Operational Tags */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Homeroom Faculty: <strong className="text-slate-700 dark:text-slate-200">Mrs. Ananya Verma</strong></span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Target className="h-3.5 w-3.5 text-blue-500" />
                          <span>Remedial Plan: <strong className="text-slate-700 dark:text-slate-200">Mathematics (Day 2 of 7)</strong></span>
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
                        <span>Pay Milestone 2 Fee (₹18,500)</span>
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
                {/* 2. 4-CARD LIVE KPI STRIP                              */}
                {/* ===================================================== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Metric 1: Attendance Compliance */}
                  <div 
                    onClick={() => setActiveNav('child_sis')}
                    className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Attendance Rate
                        </span>
                        <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            94.2% Safe
                          </h3>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                            ↑ 1.4% this month
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          146 / 155 Days • Checked in at 08:02 AM today
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94.2%' }} />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                      <span>View Full Attendance Ledger</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Metric 2: Next Fee Milestone */}
                  <div 
                    onClick={() => setActiveNav('fees')}
                    className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Upcoming Fee Due
                        </span>
                        <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                          <CreditCard className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            ₹18,500
                          </h3>
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-full">
                            Due in 5 Days
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Term 2 Tuition &amp; AC Transport installment open
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                      <span>Pay Online via UPI/Card</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Metric 3: Live Bus Telemetry */}
                  <div 
                    onClick={() => setActiveNav('bus')}
                    className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Live Bus GPS Telemetry
                        </span>
                        <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                          <Bus className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {busRoute?.eta_mins || 8} Mins ETA
                          </h3>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                            Route 4 Live
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Bus KA-01-EB-4412 approaching Sector 15 crossroad
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '82%' }} />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                      <span>Open Live GPS Telemetry</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Metric 4: Academic Standing */}
                  <div 
                    onClick={() => setActiveNav('marks')}
                    className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Unit Test 2 Results
                        </span>
                        <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                          <Award className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            88.8% Aggregate
                          </h3>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                            Rank #4 · ↑ 2.1%
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Grade A1 Distinction in 6 subjects • Class 8-B
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: '88.8%' }} />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                      <span>View Full Score Breakdown</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                </div>

                {/* ===================================================== */}
                {/* 3. TODAY'S HOMEWORK & REMEDIAL CO-TRACKING            */}
                {/* ===================================================== */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 text-xs font-black border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          Tonight's Parent Verification Tasks
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          18 Oct 2026 • Clutter-Free View
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                        Aarav&apos;s Homework &amp; Remedial Practice Check
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Past completed items are tucked away. Inspect tonight&apos;s practice and co-sign in 1 click.
                      </p>
                    </div>

                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                      2 Tasks Due Today
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Task 1: English Literature Homework */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            English Literature
                          </span>
                          <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                            ⏰ Due Today, 05:00 PM
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          The Merchant of Venice: Portia&apos;s Mercy Speech Critical Analysis
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                          Write a 300-word critical evaluation of Act IV Scene 1. Contrast Portia&apos;s argument on divine mercy against Shylock&apos;s legal bond insistence.
                        </p>
                        <div className="text-[11px] text-slate-500">
                          Teacher: Mrs. Sunitha Rao • Max Marks: 15
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setSelectedHwModal({
                              id: 3,
                              title: "The Merchant of Venice: Portia's Mercy Speech Critical Analysis",
                              subject: 'English Literature',
                              class_name: 'Class 8-B',
                              description: "Write a 300-word critical evaluation of Act IV Scene 1. Contrast Portia's argument on divine mercy against Shylock's legal bond insistence.",
                              task_type: 'DAILY_HOMEWORK',
                              due_date: '2026-10-18',
                              due_time: '17:00',
                              status: 'PENDING',
                              teacher_id: 4,
                              teacher_name: 'Mrs. Sunitha Rao',
                              max_marks: 15,
                              weightage: 'Weekly Essay (10 pts)'
                            });
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Guidelines</span>
                        </button>

                        <button
                          onClick={() => {
                            setParentHwVerifiedMap(prev => ({ ...prev, [3]: !prev[3] }));
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                            parentHwVerifiedMap[3]
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {parentHwVerifiedMap[3] ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                          <span>{parentHwVerifiedMap[3] ? 'Notebook Checked ✓' : 'Verify Notebook'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Task 2: Focus Table Day 2 Remedial Practice */}
                    <div className="rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-600 text-white">
                            Math Focus Plan (Day 2 of 7)
                          </span>
                          <span className="text-[11px] font-mono font-bold text-purple-700 dark:text-purple-300">
                            🎯 30-Min Drill Tonight
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Quadratic Equations: Factorization by Splitting the Middle Term
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                          Practice 8 step-by-step expansions in rough notebook. Teacher review scheduled for tomorrow zero period with Mrs. Ananya Verma.
                        </p>
                        <div className="text-[11px] text-purple-800 dark:text-purple-300 font-medium italic">
                          Teacher Rubric Checkpoint: &ldquo;Monitor negative sign rule in middle term expansion&rdquo;
                        </div>
                      </div>

                      <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/60 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setActiveNav('focus_table')}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
                        >
                          <Target className="h-3 w-3" />
                          <span>Open Focus Sprint Plan</span>
                        </button>

                        <button
                          onClick={() => {
                            setParentHwVerifiedMap(prev => ({ ...prev, [99]: !prev[99] }));
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                            parentHwVerifiedMap[99]
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {parentHwVerifiedMap[99] ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                          <span>{parentHwVerifiedMap[99] ? 'Co-Signed & Synced ✓' : 'Co-Sign Practice'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===================================================== */}
                {/* 4. QUICK MODULE ACCESS DIRECTORY                      */}
                {/* ===================================================== */}
                {/* ===================================================== */}
                {/* 4. QUICK MODULE ACCESS DIRECTORY                      */}
                {/* ===================================================== */}
                <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        Parental Action &amp; Quick Access Directory
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        1-Click shortcuts across all student academic and administrative services
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                      8 Core Modules
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Report Cards & Memo */}
                    <button
                      onClick={() => setActiveNav('marks')}
                      className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="my-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Report Cards &amp; Memo
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">
                          View unit test marks, download report cards and memos.
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Card 2: Shared Focus Table */}
                    <button
                      onClick={() => setActiveNav('focus_table')}
                      className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                        <Target className="h-5 w-5" />
                      </div>
                      <div className="my-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Shared Focus Table
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">
                          Track interventions across 7 subjects and view the 4-day plan.
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Card 3: Child Profile & Vault */}
                    <button
                      onClick={() => setActiveNav('child_sis')}
                      className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center font-bold">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="my-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Child Profile &amp; Vault
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">
                          View attendance, certificates and important documents.
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Card 4: Teacher Connect & PTM */}
                    <button
                      onClick={() => setActiveNav('ptm_connect')}
                      className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="my-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Teacher Connect &amp; PTM
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">
                          Send notes &amp; book video call with teachers.
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Card 5: Live Bus GPS */}
                    <button
                      onClick={() => setActiveNav('bus')}
                      className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center font-bold">
                        <Bus className="h-5 w-5" />
                      </div>
                      <div className="my-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Live Bus GPS
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">
                          Track Route 4 live location and stop updates.
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Card 6: Fees & Receipts */}
                    <button
                      onClick={() => setActiveNav('fees')}
                      className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center font-bold">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="my-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          Fees &amp; Receipts
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">
                          Pay fees, view milestones and download receipts.
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Card 7: Apply Leave */}
                    <button
                      onClick={() => setActiveNav('leave')}
                      className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="my-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Apply Leave
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">
                          Submit leave requests and view approval status.
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    {/* Card 8: TC Exit Handover */}
                    <button
                      onClick={() => setActiveNav('child_sis')}
                      className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60 flex items-center justify-center font-bold">
                        <Stamp className="h-5 w-5" />
                      </div>
                      <div className="my-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          TC Exit Handover
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">
                          Digital sign-off protocol and final clearance.
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Aarav's Weak Concept Focus Intervention Hub (from reference design) */}
                {focusTable && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                          <Target className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Aarav&apos;s Weak Concept Focus Intervention Hub
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            When assessment marks dip below target, EDU360 generates a 4-day revision timetable co-tracked by the teacher and parent.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveNav('focus_table')}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        <span>Open Full Focus Table &amp; Diagnostic Evidence</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Subject Mastery & Weak Concept Tracker (All 7 Subjects) pill bar */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4.5 shadow-xs space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              Subject Mastery &amp; Weak Concept Tracker (All 7 Subjects)
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Click any subject below to switch the 4-day timetable &amp; inspect diagnostic sets
                            </p>
                          </div>
                        </div>

                        {/* Status Legend */}
                        <div className="flex items-center gap-3 text-[11px] font-semibold">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            Critical (2)
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            In Progress (3)
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            On Track (2)
                          </span>
                        </div>
                      </div>

                      {/* 7 Subject Mastery Pills */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {[
                          { name: 'Mathematics', score: '42%', active: true, status: 'critical' },
                          { name: 'Physics', score: '58%', active: false, status: 'inprogress' },
                          { name: 'Chemistry', score: '62%', active: false, status: 'inprogress' },
                          { name: 'Biology', score: '74%', active: false, status: 'inprogress' },
                          { name: 'English', score: '68%', active: false, status: 'inprogress' },
                          { name: 'Computer Science', score: '82%', active: false, status: 'ontrack' },
                          { name: 'Social Science', score: '76%', active: false, status: 'ontrack' },
                        ].map((sub, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveNav('focus_table')}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              sub.active
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                            }`}
                          >
                            <span>{sub.name}</span>
                            <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                              sub.active
                                ? 'bg-blue-700 text-white'
                                : sub.status === 'critical'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : sub.status === 'inprogress'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}>
                              {sub.score}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <FocusTableView
                      table={focusTable}
                      submission={submission}
                      isParentView={true}
                      currentRole="parent"
                      studentInfo={{
                        name: 'Aarav Sharma',
                        rollNo: 'Roll #14',
                        className: 'Class 8-B',
                        parentName: 'Mr. Rajesh Sharma',
                        parentPhone: '+91 98450 12345'
                      }}
                      onToggleParentCheck={handleToggleParentFocusCheck}
                    />
                  </div>
                )}

              </div>
            )}

            {/* ===================================================== */}
            {/* VIEW 2: EXAMS & REPORT CARDS (MARKS)                  */}
            {/* ===================================================== */}
            {activeNav === 'marks' && (
              <ParentMarksView />
            )}

            {/* ===================================================== */}
            {/* ===================================================== */}
            {/* VIEW 3: SHARED FOCUS TABLE & DIAGNOSTIC EVIDENCE        */}
            {/* ===================================================== */}
            {activeNav === 'focus_table' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Shared Student Focus Table &amp; Diagnostic Evidence
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Collaborate directly with Mrs. Ananya Verma on Aarav&apos;s weak concept intervention timetable
                  </p>
                </div>

                {focusTable && (
                  <FocusTableView
                    table={focusTable}
                    submission={submission}
                    isParentView={true}
                    currentRole="parent"
                    studentInfo={{
                      name: 'Aarav Sharma',
                      rollNo: 'Roll #14',
                      className: 'Class 8-B',
                      parentName: 'Mr. Rajesh Sharma',
                      parentPhone: '+91 98450 12345'
                    }}
                    onToggleParentCheck={handleToggleParentFocusCheck}
                  />
                )}
              </div>
            )}

            {/* ===================================================== */}
            {/* VIEW 4: CHILD SIS PROFILE & OFFICIAL VAULT            */}
            {/* ===================================================== */}
            {activeNav === 'child_sis' && (
              <ParentSisView />
            )}

            {/* ===================================================== */}
            {/* VIEW 5: TEACHER CONNECT & ONLINE PTM                  */}
            {/* ===================================================== */}
            {activeNav === 'ptm_connect' && (
              <ParentPtmView />
            )}

            {/* ===================================================== */}
            {/* VIEW 6: LIVE SCHOOL BUS GPS TRACKER                   */}
            {/* ===================================================== */}
            {activeNav === 'bus' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Live School Bus GPS Tracking (Route 4)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live telemetry tracking school bus KA-01-EB-4412 along assigned stops with real-time ETA
                  </p>
                </div>

                {busRoute ? (
                  <BusTracker
                    bus={busRoute}
                    onAdvanceStop={handleAdvanceBus}
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500">Connecting to GPS tracker...</div>
                )}
              </div>
            )}

            {/* ===================================================== */}
            {/* VIEW 7: FEES & ONLINE PAYMENTS                        */}
            {/* ===================================================== */}
            {activeNav === 'fees' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Fee Milestones &amp; Automated Receipts
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Installment breakdown with instant UPI/Card mock payment and downloadable PDF receipts
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {fees.map((m) => {
                    const isPaid = m.status === 'Paid';
                    const isOverdue = m.status === 'Overdue';

                    return (
                      <div 
                        key={m.id}
                        className={`rounded-3xl border p-6 flex flex-col justify-between shadow-sm transition-all ${
                          isPaid 
                            ? 'border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900' 
                            : isOverdue
                            ? 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-100 dark:ring-amber-900/30'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : isOverdue ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {m.status}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Due: {m.due_date}</span>
                          </div>

                          <h3 className="mt-3 text-sm font-black text-slate-900 dark:text-white">{m.title}</h3>
                          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                            ₹{m.amount.toLocaleString()}
                          </div>

                          {isPaid && m.receipt_no && (
                            <div className="mt-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-3 border border-emerald-200 dark:border-emerald-800">
                              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">Receipt #{m.receipt_no}</span>
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Paid on {m.paid_at} via {m.payment_method}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                          {isPaid ? (
                            <button
                              onClick={() => alert(`Downloading Official PDF Receipt for ${m.receipt_no}`)}
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              <Download className="h-3.5 w-3.5 text-blue-600" />
                              <span>Download PDF Receipt</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setPayingMilestone(m)}
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold shadow-md transition-all active:scale-95"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Pay Online (UPI / Card)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                          {payingMilestone.title} • Aarav Sharma (Class 8B)
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
            )}

            {/* ===================================================== */}
            {/* VIEW 8: STUDENT LEAVE REQUESTS                        */}
            {/* ===================================================== */}
            {activeNav === 'leave' && (
              <div className="space-y-6">
                <div className="max-w-xl">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Submit Student Leave Request
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dispatches directly to Class Teacher Mrs. Ananya Verma with auto-attendance sync
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

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                      <span>Submit Leave Application to Class Teacher</span>
                    </button>
                  </form>
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
                    &ldquo;Verify that Aarav has completed this work directly into his ruled study notebook with legible handwriting and clean step work before signing verification.&rdquo;
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

      </div>
    </RoleGuard>
  );
}
