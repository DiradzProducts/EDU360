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
  UserCheck
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
  LeaveRequest
} from '@/lib/types';
import { BannerCarousel } from '@/components/banner-carousel';
import { FocusTableView } from '@/components/focus-table-view';
import { BusTracker } from '@/components/bus-tracker';
import { RoleGuard } from '@/components/role-guard';
import { ParentMarksView } from '@/components/parent-marks-view';
import { ParentSisView } from '@/components/parent-sis-view';
import { ParentPtmView } from '@/components/parent-ptm-view';
import { ParentNotificationDrawer, ParentNotification } from '@/components/parent-notification-drawer';

export type ParentNavSection = 
  | 'dashboard'
  | 'marks'
  | 'focus_table'
  | 'child_sis'
  | 'ptm_connect'
  | 'bus'
  | 'fees'
  | 'leave'
  | 'exit_clearance';

export default function ParentPage() {
  // Navigation & Layout State
  const [activeNav, setActiveNav] = useState<ParentNavSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  // Load Parent Portal Data
  useEffect(() => {
    async function loadData() {
      try {
        const [ftRes, busRes, feesRes, subRes, exitsRes] = await Promise.all([
          api.getFocusTable(1),
          api.getBusTracker(1),
          api.getFees(1),
          api.getSubmission(1),
          api.getExitClearances()
        ]);
        setFocusTable(ftRes);
        setBusRoute(busRes);
        setFees(feesRes);
        setSubmission(subRes);
        if (exitsRes && exitsRes.length > 0) {
          setExitClearance(exitsRes[0]);
        }
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
          badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
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
          badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
        },
        {
          id: 'focus_table' as ParentNavSection,
          label: 'Shared Focus Table',
          icon: Target,
          badge: '7 Subjects',
          badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
        },
        {
          id: 'child_sis' as ParentNavSection,
          label: 'Child SIS Profile & Vault',
          icon: ShieldCheck,
          badge: '94.2% Safe',
          badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
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
          badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
        },
        {
          id: 'bus' as ParentNavSection,
          label: 'Live Bus GPS Tracker',
          icon: Bus,
          badge: 'Route 4 · 8m',
          badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
        },
        {
          id: 'leave' as ParentNavSection,
          label: 'Student Leave Requests',
          icon: FileText,
          badge: '1 Pending',
          badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
        }
      ]
    },
    {
      title: 'FINANCE & CLEARANCES',
      items: [
        {
          id: 'fees' as ParentNavSection,
          label: 'Fee Milestones & Receipts',
          icon: CreditCard,
          badge: 'Due Oct 25',
          badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
        },
        {
          id: 'exit_clearance' as ParentNavSection,
          label: 'TC & Exit Clearance',
          icon: Stamp,
          badge: 'Handover Active',
          badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
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
      case 'exit_clearance':
        return { title: 'Transfer Certificate (TC) & Dual-Verification Clearance', subtitle: 'Official zero-dispute digital sign-off and certificate archive protocol' };
      default:
        return { title: 'Parent Portal', subtitle: 'EDU360 K–12 Outcomes & Intelligence Platform' };
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <RoleGuard allowedRole="parent">
      <div className="flex min-h-[calc(100vh-4rem)] w-full bg-[#F8FAFC] dark:bg-[#070B14] text-[#0F172A] dark:text-slate-100 font-sans antialiased transition-colors duration-150">
        
        {/* ========================================================= */}
        {/* 1. COLLAPSIBLE LEFT SIDEBAR NAVIGATION (240px / 72px)     */}
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
                    <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      PARENT
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
              title={sidebarCollapsed ? 'Expand Sidebar (240px)' : 'Collapse Sidebar'}
              className={`p-1.5 rounded-lg transition-colors ${
                sidebarTheme === 'dark'
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              } ${sidebarCollapsed ? 'hidden' : 'block'}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Expand Toggle when collapsed */}
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
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                          isActive
                            ? 'border-l-4 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-400 font-bold shadow-xs'
                            : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                        }`}
                        title={item.label}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#2563EB] dark:text-blue-400' : 'text-slate-400'}`} />
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

          {/* Bottom Guardian Bio Card */}
          <div className="p-3 border-t border-inherit">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                  RS
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Mr. Rajesh Sharma
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Parent of Aarav (8B)
                  </span>
                </div>
              </div>
            ) : (
              <div className="mx-auto h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 text-white font-black text-xs flex items-center justify-center">
                RS
              </div>
            )}
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. MAIN VIEW CONTAINER (TOP BAR + DYNAMIC MODULE CONTENT) */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Top Sticky Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070B14]/95 px-5 sm:px-8 backdrop-blur-md">
            
            {/* Left: Breadcrumbs & Section Title */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Parent Portal</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-blue-600 dark:text-blue-400 font-bold capitalize">
                  {activeNav.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-base font-black text-slate-900 dark:text-white truncate max-w-lg">
                {headerMeta.title}
              </h1>
            </div>

            {/* Right: Child Status Chip, Alerts Bell & Theme Toggle */}
            <div className="flex items-center gap-3">
              
              {/* Child Info Badge */}
              <div className="hidden lg:flex items-center gap-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 shadow-xs">
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
                    Class 8B • Roll #14 • Adm #EDU-2024-082
                  </span>
                </div>
              </div>

              {/* High-Signal Push Alerts Bell */}
              <button
                onClick={() => setNotificationDrawerOpen(true)}
                className="relative flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all active:scale-95"
                title="Open High-Signal Push Alerts Log"
              >
                <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                <span className="hidden sm:inline">Alerts</span>
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-xs">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
              </button>

            </div>
          </header>

          {/* Main Scrollable Body */}
          <main className="p-5 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">

            {/* ===================================================== */}
            {/* VIEW 1: PARENT DASHBOARD (HOME OVERVIEW)             */}
            {/* ===================================================== */}
            {activeNav === 'dashboard' && (
              <div className="space-y-8">
                
                {/* Moving Banner Slider Carousel */}
                <BannerCarousel onActionClick={handleBannerAction} />

                {/* Quick Pulse Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Metric 1: Attendance Compliance */}
                  <div 
                    onClick={() => setActiveNav('child_sis')}
                    className="group cursor-pointer rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Attendance Rate
                      </span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                        CBSE Safe ✓
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">94.2%</span>
                      <span className="text-xs text-slate-500">146 / 155 Days</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Above 75% board exam cutoff. 0 unexcused absences this week.
                    </p>
                    <div className="pt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>View Full Attendance Ledger</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Metric 2: Next Fee Milestone */}
                  <div 
                    onClick={() => setActiveNav('fees')}
                    className="group cursor-pointer rounded-3xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 p-5 shadow-sm hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 tracking-wider">
                        Upcoming Fee Due
                      </span>
                      <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                        Due in 5 Days
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-600 dark:text-amber-400">₹18,500</span>
                      <span className="text-xs text-slate-500">Milestone 2</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Term 2 Tuition &amp; AC Transport installment open for online pay.
                    </p>
                    <div className="pt-2 text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Pay Online via UPI/Card</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Metric 3: Live Bus Telemetry */}
                  <div 
                    onClick={() => setActiveNav('bus')}
                    className="group cursor-pointer rounded-3xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 p-5 shadow-sm hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-400 tracking-wider">
                        Live Bus GPS
                      </span>
                      <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                        Route 4 Live
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{busRoute?.eta_mins || 8} mins</span>
                      <span className="text-xs text-slate-500">to Sector 15 Stop</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Bus KA-01-EB-4412 approaching Sector 15 crossroad.
                    </p>
                    <div className="pt-2 text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Open Live GPS Telemetry</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Metric 4: Academic Standing */}
                  <div 
                    onClick={() => setActiveNav('marks')}
                    className="group cursor-pointer rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 p-5 shadow-sm hover:shadow-md transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-purple-800 dark:text-purple-400 tracking-wider">
                        Unit Test 2 Results
                      </span>
                      <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 text-[10px] font-bold">
                        Rank #4
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-purple-700 dark:text-purple-300">88.8%</span>
                      <span className="text-xs text-slate-500">Grade A1</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Distinction in 6 subjects. Top 10% academic standing in Class 8B.
                    </p>
                    <div className="pt-2 text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>View Full Score Breakdown</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>

                </div>

                {/* Quick Module Jump Grid */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Parental Action &amp; Quick Access Directory
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        1-Click shortcuts across all student academic and administrative services
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">8 Core Modules</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => setActiveNav('marks')}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 text-left transition-all space-y-2 group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <Award className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-blue-600">
                        Report Cards &amp; Memo
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Unit Test 2 marks &amp; email PDF
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveNav('focus_table')}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 text-left transition-all space-y-2 group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                        <Target className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-purple-600">
                        Shared Focus Table
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Interventions across 7 subjects
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveNav('child_sis')}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-300 text-left transition-all space-y-2 group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-teal-600">
                        Child Profile &amp; Vault
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        94.2% attendance &amp; certificates
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveNav('ptm_connect')}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 text-left transition-all space-y-2 group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-blue-600">
                        Teacher Connect &amp; PTM
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Send notes &amp; book video call
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveNav('bus')}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 text-left transition-all space-y-2 group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <Bus className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-emerald-600">
                        Live Bus GPS
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Route 4 live stop telemetry
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveNav('fees')}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-300 text-left transition-all space-y-2 group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-amber-600">
                        Fees &amp; Receipts
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Pay UPI &amp; download receipts
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveNav('leave')}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all space-y-2 group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-blue-600">
                        Apply Leave
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Direct to Class Teacher 8B
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveNav('exit_clearance')}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 text-left transition-all space-y-2 group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                        <Stamp className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-purple-600">
                        TC Exit Handover
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Digital sign-off protocol
                      </span>
                    </button>
                  </div>
                </div>

                {/* Shared Focus Table Preview on Dashboard */}
                {focusTable && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-600 animate-pulse" />
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          Aarav’s Weak Concept Focus Intervention Hub
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveNav('focus_table')}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <span>Open Full Focus Table &amp; Diagnostic Evidence</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <FocusTableView
                      table={focusTable}
                      submission={submission}
                      isParentView={true}
                      onToggleParentCheck={handleToggleParentFocusCheck}
                    />
                  </div>
                )}

                {/* Exit Clearance Digital Sign-off Banner (if active) */}
                {exitClearance && (
                  <div className="rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 px-2.5 py-0.5 text-[10px] font-bold">
                          Official Exit Handover Protocol
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Dual-Signature Verification</span>
                      </div>
                      <h3 className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                        Transfer Certificate (TC) Digital Approval Request
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Confirm receipt of original certificates in good condition to permanently seal the archive record.
                      </p>
                    </div>

                    {exitClearance.digital_parent_approved ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Digitally Stamped &amp; Approved ✓</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleDigitalSignExit}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold shadow-sm"
                      >
                        <Stamp className="h-4 w-4" />
                        <span>Provide Digital Sign-Off</span>
                      </button>
                    )}
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

            {/* ===================================================== */}
            {/* VIEW 9: TC & EXIT CLEARANCE PROTOCOL                   */}
            {/* ===================================================== */}
            {activeNav === 'exit_clearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Transfer Certificate (TC) &amp; Student Exit Handover
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Official zero-dispute dual verification handover checklist (PRD Section 4.4 #6)
                  </p>
                </div>

                <div className="rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
                  <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-bold">
                        Dual Verification Legal Archive Protocol
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                        Exit Clearance Record #EDU-EXIT-2026-001
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Aarav Sharma • Class 8B • Initiated on 10 Oct 2026
                      </span>
                    </div>

                    <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 text-xs font-bold">
                      {exitClearance?.status || 'Active Handover Protocol'}
                    </span>
                  </div>

                  {/* Checklist */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-200 block">1. Accounts Clearance</span>
                      <span className="text-emerald-600 dark:text-emerald-300 text-[11px] block">No pending fee arrears</span>
                      <span className="font-black text-emerald-700 text-xs">✓ Cleared</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-200 block">2. Library &amp; Lab Assets</span>
                      <span className="text-emerald-600 dark:text-emerald-300 text-[11px] block">All books &amp; sports gear returned</span>
                      <span className="font-black text-emerald-700 text-xs">✓ Cleared</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                      <span className="font-bold text-purple-800 dark:text-purple-200 block">3. Parent Digital Sign-Off</span>
                      <span className="text-purple-600 dark:text-purple-300 text-[11px] block">Receipt of original certificates</span>
                      <span className="font-black text-purple-700 text-xs">
                        {exitClearance?.digital_parent_approved ? '✓ Confirmed' : 'Pending Parent Sign'}
                      </span>
                    </div>
                  </div>

                  {/* Digital Signature Action */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">
                        Guardian Confirmation (Legal Acknowledgment):
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        &quot;I confirm receipt of original Transfer Certificate, Unit Test Marks Cards, and Bonafide records in good condition.&quot;
                      </p>
                    </div>

                    {exitClearance?.digital_parent_approved ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-3.5 py-2 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Digitally Approved by Mr. Rajesh Sharma ✓</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleDigitalSignExit}
                        className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        <Stamp className="h-4 w-4" />
                        <span>Provide Digital Approval</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </main>
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

      </div>
    </RoleGuard>
  );
}
