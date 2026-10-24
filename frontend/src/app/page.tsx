'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Clock, 
  Bus, 
  Layers, 
  FileEdit, 
  Trophy, 
  Award, 
  Check, 
  X, 
  ChevronRight, 
  Star, 
  Zap, 
  BarChart3, 
  Lock, 
  Smartphone, 
  HeartHandshake, 
  Compass, 
  FileCheck2, 
  AlertCircle,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';
import { DemoBookingModal } from '@/components/demo-booking-modal';

export default function MarketingLandingPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoDefaultRole, setDemoDefaultRole] = useState('admin');
  const [demoInitialTab, setDemoInitialTab] = useState<'demo' | 'tour' | 'admission'>('admission');
  const [selectedRoleTab, setSelectedRoleTab] = useState<'admin' | 'teacher' | 'parent' | 'student'>('admin');

  // Listen to global open demo events (from MarketingNavbar or other CTA links)
  useEffect(() => {
    const handleOpenDemo = (e: any) => {
      const role = e.detail?.role || 'admin';
      const tab = e.detail?.tab || (role === 'student' ? 'admission' : 'demo');
      setDemoDefaultRole(role);
      setDemoInitialTab(tab);
      setDemoModalOpen(true);
    };

    window.addEventListener('edu360-open-demo', handleOpenDemo);
    return () => window.removeEventListener('edu360-open-demo', handleOpenDemo);
  }, []);

  const openDemoModal = (role: string = 'admin', tab: 'demo' | 'tour' | 'admission' = 'demo') => {
    setDemoDefaultRole(role);
    setDemoInitialTab(tab);
    setDemoModalOpen(true);
  };

  // Role showcase data for the Toddle-style interactive switcher
  const roleShowcase = {
    admin: {
      title: 'School Leadership & Administration',
      subtitle: 'Complete Operational Oversight & Early Triage',
      badge: 'For Principals, Deans & Administrators',
      color: 'indigo',
      tagline: 'Spot critical campus trends weeks before they become crises.',
      bullets: [
        {
          title: 'Priority Triage Action Engine',
          desc: 'Automated early warning system flagging chronic absenteeism, fee payment lag, and academic drops in real time.'
        },
        {
          title: 'Tamper-Proof SIS Document Vault',
          desc: 'Admin-verified storage for bonafide certificates, transfer clearances, and official student dossiers with audit logs.'
        },
        {
          title: 'Admissions Pipeline & CRM',
          desc: 'Seamless lead management from public inquiry to 1-click student conversion without messy Excel spreadsheets.'
        },
        {
          title: 'Dual-Signature Exit Handover',
          desc: 'Formal digitized Transfer Certificate (TC) workflows requiring synchronized clearance across finance, library, and academics.'
        }
      ],
      mockupData: {
        headerBadge: '🔴 PRIORITY ACTION QUEUE • 3 ITEMS REQUIRE REVIEW',
        stat1: { label: 'Campus Attendance', val: '98.4%', trend: '↑ 1.8% vs last week' },
        stat2: { label: 'Triage Alerts Active', val: '3 High', trend: 'Auto-delegated' },
        stat3: { label: 'Fees Collected', val: '94.2%', trend: 'Q2 Target achieved' },
        items: [
          { tag: 'High Risk', name: 'Kabir Sharma (8B)', issue: '3 Days Consecutive Absence without note', action: 'Trigger SMS to Guardian' },
          { tag: 'Academic', name: 'Grade 8B Mathematics', issue: 'Quadratic test average fell to 61%', action: 'Deploy 4-Day Focus Revision' },
          { tag: 'Compliance', name: 'Transfer Certificate #419', issue: 'Pending accounts department clearance', action: 'Review Dual Sign-off' }
        ]
      }
    },
    teacher: {
      title: 'Academic Faculty & Educators',
      subtitle: 'Zero-Burden Grading & Proactive Learning Remediation',
      badge: 'For Subject Faculty & Class Teachers',
      color: 'emerald',
      tagline: 'Reclaim 6 hours every week from repetitive administrative paperwork.',
      bullets: [
        {
          title: 'In-Browser Homework Grading Canvas',
          desc: 'Evaluate submissions with digital red pen annotations, custom rubric stamps, and typed feedback without downloading heavy PDFs.'
        },
        {
          title: '10-Minute Online Class Auto-Attendance Rule',
          desc: 'Automated attendance logging: 0–10 min joins recorded as Present, >10 min marked Late, completely hands-free.'
        },
        {
          title: 'Shared 4-Day Student Focus Table',
          desc: 'Instantly schedule personalized revision timetables for struggling students that synchronize directly with parent dashboards.'
        },
        {
          title: 'Parent Connection Hub',
          desc: 'Manage leave approvals, medical updates, and verified remarks in a single focused drawer without sharing personal WhatsApp numbers.'
        }
      ],
      mockupData: {
        headerBadge: '✍️ IN-BROWSER GRADING CANVAS • CLASS 8B MATHEMATICS',
        stat1: { label: 'Papers Graded', val: '28 / 30', trend: 'Avg time: 42s/paper' },
        stat2: { label: 'Class Average', val: '82.5%', trend: 'Class Rank #1: 49/50' },
        stat3: { label: 'Revision Table', val: '4 Active', trend: 'Math remedial sync' },
        items: [
          { tag: 'Worksheet 4.2', name: 'Aarav Sharma', issue: 'Score: 46/50 (A+) • Remark: Excellent step factorization', action: 'Approved & Stamped' },
          { tag: 'Worksheet 4.2', name: 'Riya Gupta', issue: 'Score: 32/50 • Remark: Sign error in quadratic formula', action: 'Added to Focus Table' },
          { tag: 'Leave Request', name: 'Aryan Mehta', issue: 'Medical leave requested for Oct 18 (Dentist appointment)', action: '1-Click Approved' }
        ]
      }
    },
    parent: {
      title: 'Parents & Guardians',
      subtitle: 'High-Signal Updates & Peace of Mind',
      badge: 'For K-12 Families & Guardians',
      color: 'amber',
      tagline: 'Stay genuinely informed without wading through 500 unread WhatsApp messages.',
      bullets: [
        {
          title: 'Live School Bus GPS with Sub-Minute ETA',
          desc: 'Track the exact route of your child’s morning and afternoon commute with reliable arrival countdowns and driver contact buttons.'
        },
        {
          title: 'Spam-Free Daily Announcements Carousel',
          desc: 'Important school notices presented in a structured daily card digest, ensuring vital homework deadlines are never buried.'
        },
        {
          title: 'Shared Focus Table & Sign-Off Checklist',
          desc: 'Review teacher-assigned homework concepts and sign off on completed revision milestones directly from your smartphone.'
        },
        {
          title: '1-Click Fee Milestones & Digital Receipts',
          desc: 'Transparent term fee schedules with instant UPI/card payment and automatically generated official tax receipts.'
        }
      ],
      mockupData: {
        headerBadge: '💻 LIVE VIRTUAL CLASSROOM • GRADE 8B',
        stat1: { label: 'Next Lecture ETA', val: '4 Mins', trend: 'On schedule · Speed: 32km/h' },
        stat2: { label: 'Next Stop', val: 'Green Glen', trend: 'Mathematics Room' },
        stat3: { label: 'Today’s Tasks', val: '2 / 2 Done', trend: 'Focus practice checked' },
        items: [
          { tag: 'Transport', name: 'Driver: Mr. Ramesh K.', issue: 'Mrs. Ananya Verma started Algebra revision', action: 'Driver Contact: +91 98111-BUS14' },
          { tag: 'Academic', name: 'Math Quiz Published', issue: 'Aarav scored 46/50 in Chapter 4 Evaluation', action: 'View Annotated Worksheet' },
          { tag: 'Fee Milestone', name: 'Term 2 Tuition Due Nov 1', issue: 'Amount: ₹18,500 • Early discount applied', action: '1-Click UPI Pay' }
        ]
      }
    },
    student: {
      title: 'Students & Learners',
      subtitle: 'Holistic Growth, Live LMS & Permanent Vault',
      badge: 'For Elementary, Middle & High School Students',
      color: 'purple',
      tagline: 'Own your academic journey, co-curricular achievements, and verified credentials.',
      bullets: [
        {
          title: 'Unified Live Classroom & Recorded LMS',
          desc: '1-click entry into interactive subject classes with instant access to chapter-wise video replays and teacher lecture slides.'
        },
        {
          title: 'Verified Co-Curricular & Sports Portfolio',
          desc: 'Side-by-side showcase celebrating athletic medals, debate trophies, and school council roles with official institution seals.'
        },
        {
          title: 'Annotated Homework Submission & Vault',
          desc: 'Submit exercises in seconds and review teacher’s red-pen annotations and encouraging feedback marks.'
        },
        {
          title: 'Official School Credential Vault',
          desc: 'Permanent tamper-proof digital archive of quarterly report cards, character certificates, and merit badges.'
        }
      ],
      mockupData: {
        headerBadge: '🏆 STUDENT OUTCOME PORTFOLIO • CLASS 8B • ROLL #14',
        stat1: { label: 'Overall Term GPA', val: '9.4 / 10', trend: 'A+ Grade Honor Roll' },
        stat2: { label: 'Homework Rate', val: '100%', trend: '24/24 on-time submissions' },
        stat3: { label: 'Verified Badges', val: '7 Earned', trend: 'State Science Olympiad' },
        items: [
          { tag: 'Next Class', name: 'Advanced Physics (09:30 AM)', issue: 'Topic: Wave Optics & Refraction (Lab 3)', action: '1-Click Join Classroom' },
          { tag: 'Verified Badge', name: 'Inter-School Debate 2026', issue: '1st Place • Authenticated by Principal Seal', action: 'Export to Certificate Vault' },
          { tag: 'Feedback', name: 'English Literature Essay', issue: 'Mrs. Verma: "Remarkable thesis structure"', action: 'View Ink Remarks' }
        ]
      }
    }
  };

  const currentRole = roleShowcase[selectedRoleTab];

  return (
    <div className="public-marketing min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* =========================================================================
          SECTION 1: HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-100">
        
        {/* Subtle Background Pattern (Soft modern grid) */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
        
        {/* Soft Decorative Gradient Blurs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-200/40 via-indigo-200/40 to-purple-200/40 blur-3xl pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Announcement Pill Tag */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 shadow-xs mb-6 hover:border-indigo-300 transition-colors cursor-pointer group"
            onClick={() => openDemoModal('admin', 'tour')}
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-indigo-600 font-extrabold">✦ Introducing EDU360 v2.4</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium group-hover:text-slate-900">The K–12 Action &amp; Intelligence Suite</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Big Bold Headline (H1) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.12]">
            The Action &amp; Intelligence Platform Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700">Modern Schools</span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Move beyond passive ERP registers. EDU360 empowers school leadership, teachers, parents, and students with <b>proactive triage</b>, <b>zero-burden grading</b>, and <b>unified outcome tracking</b>.
          </p>

          {/* Call-to-Action Group */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openDemoModal('student', 'admission')}
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-7 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/25 hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
            >
              <GraduationCap className="h-5 w-5" />
              <span>Apply for Admission</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => openDemoModal('admin', 'demo')}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-6 py-4 text-base font-bold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-150 cursor-pointer"
            >
              <Building2 className="h-5 w-5 text-indigo-600" />
              <span>Book School Demo</span>
            </button>

            <button
              type="button"
              onClick={() => openDemoModal('admin', 'tour')}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-slate-100/90 px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-200/90 hover:text-slate-900 transition-all duration-150 cursor-pointer"
            >
              <div className="h-6 w-6 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-xs">
                <Play className="h-3 w-3 fill-current ml-0.5" />
              </div>
              <span>2-Min Product Tour</span>
            </button>
          </div>

          {/* Trust reassurance checklist */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" />
              15-minute customized walkthrough
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" />
              Full data migration from existing ERP
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-500" />
              FERPA &amp; GDPR privacy certified
            </span>
          </div>

          {/* =========================================================================
              HERO PRODUCT VISUAL MOCKUP (Browser Frame + Floating Cards)
              ========================================================================= */}
          <div className="relative mt-16 sm:mt-20 max-w-6xl mx-auto">
            
            {/* Ambient Shadow Glow Behind Browser */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/15 via-blue-500/15 to-purple-500/15 rounded-3xl blur-2xl -z-10 transform scale-95" />

            {/* Main Browser Window Frame */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden text-left">
              
              {/* Browser Window Chrome / Titlebar */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400/80 border border-red-500/30"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-400/80 border border-amber-500/30"></div>
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80 border border-emerald-500/30"></div>
                  <div className="hidden sm:flex items-center gap-1.5 ml-4 rounded-lg bg-white px-3 py-1 border border-slate-200 text-[11px] font-mono text-slate-500 shadow-2xs">
                    <Lock className="h-3 w-3 text-emerald-600" />
                    <span>https://app.edu360.internal/leadership/triage-radar</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>LIVE INSTITUTIONAL SYNC</span>
                </div>
              </div>

              {/* Inside Browser: Clean Modern Dashboard Preview */}
              <div className="p-4 sm:p-7 bg-slate-50/40 space-y-5">
                
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">Oakridge World Academy</h2>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        Term 2 • Week 11 Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Centralized Action &amp; Outcomes Command Center</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="rounded-xl bg-indigo-50 text-indigo-700 px-3 py-1.5 border border-indigo-100 font-bold">
                      Grade 8 – Section B
                    </span>
                    <span className="rounded-xl bg-slate-100 text-slate-600 px-3 py-1.5">
                      1,420 Total Students
                    </span>
                  </div>
                </div>

                {/* 4 Metric KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Daily Attendance</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">98.4%</span>
                      <span className="text-[11px] font-bold text-emerald-600">↑ 2.1%</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">1,397 / 1,420 in classes</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Priority Triage Queue</span>
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-rose-600">3 Items</span>
                      <span className="text-[11px] font-bold text-rose-500">Require Action</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">Absenteeism &amp; Math gap</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Homework Turn-in</span>
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">94.2%</span>
                      <span className="text-[11px] font-bold text-indigo-600">Avg 46/50</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">Zero pending grading lag</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Live Online Classes</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">12 / 12</span>
                      <span className="text-[11px] font-bold text-emerald-600">On Time</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">100% active stream uptime</span>
                  </div>
                </div>

                {/* Priority Triage Action Table Preview */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-indigo-600" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Live Priority Triage Radar (Morning Shift)
                      </h3>
                    </div>
                    <span className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer"
                      onClick={() => openDemoModal('admin', 'tour')}
                    >
                      View Live Triage Engine →
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-md bg-rose-50 text-rose-700 px-2 py-0.5 text-[10px] font-bold border border-rose-200">
                          CRITICAL ABSENCE
                        </span>
                        <span className="font-bold text-slate-800">Kabir S. (Grade 8B)</span>
                        <span className="text-slate-500 hidden md:inline">— 3 consecutive days unnotified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-slate-100 text-slate-600 px-2.5 py-1 text-[11px] font-semibold">
                          Auto-SMS Queued
                        </span>
                        <button 
                          onClick={() => openDemoModal('admin', 'demo')}
                          className="rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Triage Now
                        </button>
                      </div>
                    </div>

                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-md bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-bold border border-amber-200">
                          ACADEMIC DIP
                        </span>
                        <span className="font-bold text-slate-800">Grade 8B Mathematics</span>
                        <span className="text-slate-500 hidden md:inline">— 4 students fell below 45% in Quadratic Equations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-semibold">
                          4-Day Focus Revision Table Active
                        </span>
                        <button 
                          onClick={() => openDemoModal('teacher', 'demo')}
                          className="rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          View Plan
                        </button>
                      </div>
                    </div>

                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold border border-blue-200">
                          TRANSPORT ETA
                        </span>
                        <span className="font-bold text-slate-800">Route 14 Bus</span>
                        <span className="text-slate-500 hidden md:inline">— Arriving at Maple Crossing in 4 mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-slate-100 text-slate-600 px-2.5 py-1 text-[11px] font-semibold">
                          Live GPS Signal Locked
                        </span>
                        <button 
                          onClick={() => openDemoModal('parent', 'demo')}
                          className="rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Track Bus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Layered Floating Micro-Cards (Desktop only) */}
            <div className="hidden lg:block absolute -top-8 -left-8 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-200/80 animate-in fade-in duration-500 text-left max-w-[240px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-900">98.4% On-Time Arrival</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                All 12 morning bus routes safely arrived before the 7:55 AM bell.
              </p>
            </div>

            <div className="hidden lg:block absolute -top-8 -right-8 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-200/80 animate-in fade-in duration-500 text-left max-w-[240px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
                <span className="text-xs font-bold text-slate-900">Zero-Stress Grading</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                28 worksheets evaluated with rubric stamps in under 12 minutes.
              </p>
            </div>

            <div className="hidden lg:block absolute -bottom-6 -left-6 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-200/80 animate-in fade-in duration-500 text-left max-w-[260px]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Dual-Signature TC Legal</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                100% paperless student exits with synchronous clearance archive.
              </p>
            </div>

            <div className="hidden lg:block absolute -bottom-6 -right-6 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-200/80 animate-in fade-in duration-500 text-left max-w-[260px]">
              <div className="flex items-center gap-2">
                <Bus className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">Parent Hub GPS Stream</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                Zero front-desk phone calls for morning pickup status.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: SOCIAL PROOF / TRUST BAR & INSTITUTIONAL METRICS
          ========================================================================= */}
      <section className="border-b border-slate-100 bg-slate-50/60 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Trusted by progressive schools and forward-thinking educators
            </span>
          </div>

          {/* School Partner Badges (Clean, Minimalist Typography + Emblems) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2 text-slate-700 font-extrabold text-sm sm:text-base tracking-tight">
              <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-serif text-xs font-bold">O</div>
              <span>Oakridge Academy</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700 font-extrabold text-sm sm:text-base tracking-tight">
              <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-serif text-xs font-bold">C</div>
              <span>Cambridge Heritage</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700 font-extrabold text-sm sm:text-base tracking-tight">
              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-serif text-xs font-bold">G</div>
              <span>Greenwood Global</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700 font-extrabold text-sm sm:text-base tracking-tight">
              <div className="h-7 w-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-serif text-xs font-bold">S</div>
              <span>St. Jude World School</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700 font-extrabold text-sm sm:text-base tracking-tight">
              <div className="h-7 w-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-serif text-xs font-bold">H</div>
              <span>Horizon STEM Academy</span>
            </div>
          </div>

          {/* Institutional Quantitative Metrics */}
          <div className="mt-12 pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">50,000+</div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">Students Actively Tracked</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">40%</div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">Admin Hours Saved Weekly</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">99.4%</div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">Parent App Engagement</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">&lt; 2 Mins</div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">Average Triage Time</p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: INTERACTIVE ROLE SHOWCASE (Inspired by Toddle's Persona Tabs)
          ========================================================================= */}
      <section id="role-showcase" className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Tailored for Every Stakeholder
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              One Unified Platform. Four Tailored Experiences.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              No generic screens. Every role in the school ecosystem gets a purpose-built workspace designed for their daily actions and real-world outcomes.
            </p>
          </div>

          {/* Interactive Persona Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-2xl mx-auto mb-12 border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedRoleTab('admin')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedRoleTab === 'admin'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Leadership &amp; Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRoleTab('teacher')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedRoleTab === 'teacher'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Teachers &amp; Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRoleTab('parent')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedRoleTab === 'parent'
                  ? 'bg-white text-amber-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Parents &amp; Families</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRoleTab('student')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedRoleTab === 'student'
                  ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Students</span>
            </button>
          </div>

          {/* Active Persona Split Card */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Outcome-Driven Bullets */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                  {currentRole.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {currentRole.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 font-normal leading-relaxed">
                  {currentRole.tagline}
                </p>
              </div>

              <div className="space-y-4">
                {currentRole.bullets.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{b.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => openDemoModal(selectedRoleTab, 'demo')}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                >
                  <span>Book Demo for {currentRole.title.split('&')[0]}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Clean Visual Mockup Designed for that Persona */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl space-y-4">
                
                {/* Header Strip of the Mockup */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    {currentRole.mockupData.headerBadge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Real-time sync</span>
                </div>

                {/* 3 Metrics Mini Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">{currentRole.mockupData.stat1.label}</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 block">{currentRole.mockupData.stat1.val}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">{currentRole.mockupData.stat1.trend}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">{currentRole.mockupData.stat2.label}</span>
                    <span className="text-base sm:text-lg font-black text-indigo-600 block">{currentRole.mockupData.stat2.val}</span>
                    <span className="text-[10px] text-indigo-500 font-bold">{currentRole.mockupData.stat2.trend}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">{currentRole.mockupData.stat3.label}</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 block">{currentRole.mockupData.stat3.val}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{currentRole.mockupData.stat3.trend}</span>
                  </div>
                </div>

                {/* Persona Data Feed */}
                <div className="space-y-2.5 pt-1">
                  {currentRole.mockupData.items.map((it, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold rounded-md px-2 py-0.5 bg-slate-100 text-slate-700">
                            {it.tag}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{it.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{it.issue}</p>
                      </div>

                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50/70 border border-indigo-100 px-2.5 py-1 rounded-lg shrink-0 text-center">
                        {it.action}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center text-[11px] text-slate-400">
                  Interactive preview powered by EDU360 Unified Core
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CORE VALUE PROPOSITIONS (4 Feature Pillars with Pastel Cards)
          ========================================================================= */}
      <section id="core-pillars" className="py-20 sm:py-28 bg-slate-50/70 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Core Architectural Pillars
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
              Why Forward-Thinking Schools Choose EDU360
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Engineered from the ground up to solve the real operational bottlenecks of modern education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Pillar 1: Proactive Triage */}
            <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 mb-6 group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 border border-rose-200 inline-block mb-3">
                Early Warning Intelligence
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Proactive Early Warning &amp; Triage
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Legacy ERPs wait until end-of-term report cards to show you failed marks or chronic unnotified absences. EDU360 surfaces learning gaps and attendance drops within 24 hours, giving teachers and deans 3 weeks to intervene before exams.
              </p>
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-rose-700">
                <span>Multi-day absence thresholding • Grade dip radar</span>
              </div>
            </div>

            {/* Pillar 2: Zero-Burden Grading */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 mb-6 group-hover:scale-110 transition-transform">
                <FileEdit className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 inline-block mb-3">
                Faculty Happiness &amp; Velocity
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Zero-Burden Academic Workflows
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Faculty shouldn't spend their Sunday evenings downloading 60 PDF files or manually keying in attendance sheets. With our in-browser red-pen grading canvas, custom stamp rubrics, and 10-minute auto-attendance rules, teachers save an average of 6 hours every week.
              </p>
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <span>In-browser mark annotation • 4-day revision scheduler</span>
              </div>
            </div>

            {/* Pillar 3: Connected Parent Experience */}
            <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 border border-blue-200 inline-block mb-3">
                Anti-Spam Family Trust
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Connected Parent Experience
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Say goodbye to noisy, unmoderated WhatsApp groups with 400 messages about lost lunchboxes. EDU360 gives families high-signal updates, sub-minute school bus GPS tracking with real-time ETA, and 1-click fee settlements with instant receipt downloads.
              </p>
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-blue-700">
                <span>Sub-minute bus telemetry • 1-click UPI &amp; card fees</span>
              </div>
            </div>

            {/* Pillar 4: Holistic Student Portfolio */}
            <div className="rounded-3xl border border-purple-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-bold text-purple-700 border border-purple-200 inline-block mb-3">
                Lifelong Student Ownership
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Holistic Student Portfolio &amp; Vault
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Education is more than just exam marks. EDU360 curates a living portfolio that highlights sports participation, arts, volunteer leadership, and verified certifications alongside grades. Stored tamper-proof in an official credential vault.
              </p>
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-purple-700">
                <span>Dual-signature clearances • Verifiable digital transcripts</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: WHY SWITCH (Legacy ERPs vs EDU360 Comparison Table)
          ========================================================================= */}
      <section id="why-edu360" className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              The Evolution of School Software
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
              Why Schools Are Replacing Legacy ERPs
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Traditional school management systems were designed in 2008 as static data silos. See how EDU360 transforms day-to-day operations.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="p-4 sm:p-5 font-bold text-slate-700 w-1/3">Capability &amp; Workflow</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400 w-1/3">Legacy School ERPs</th>
                  <th className="p-4 sm:p-5 font-bold text-indigo-700 w-1/3 bg-indigo-50/40">EDU360 Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    At-Risk Student Detection
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">Spotting academic or attendance dips</span>
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                      <X className="h-4 w-4" /> End-of-term surprise marks
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">Discovered only after report cards are finalized.</span>
                  </td>
                  <td className="p-4 sm:p-5 bg-indigo-50/20 font-bold text-indigo-900">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <Check className="h-4 w-4" /> Proactive daily triage engine
                    </span>
                    <span className="text-xs text-slate-600 block mt-1 font-normal">Identifies trend slips within 24h; triggers 4-day revision plans.</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Teacher Homework Evaluation
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">Grading and written feedback</span>
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                      <X className="h-4 w-4" /> Clunky PDF download &amp; re-upload
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">Requires third-party PDF readers or paper bundles.</span>
                  </td>
                  <td className="p-4 sm:p-5 bg-indigo-50/20 font-bold text-indigo-900">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <Check className="h-4 w-4" /> Fast in-browser red-pen canvas
                    </span>
                    <span className="text-xs text-slate-600 block mt-1 font-normal">Ink remarks, rubric stamps, and typed comments with zero lag.</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Parent Communication
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">Daily notices and school updates</span>
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                      <X className="h-4 w-4" /> Messy, spammy WhatsApp chats
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">Important announcements get lost in endless replies.</span>
                  </td>
                  <td className="p-4 sm:p-5 bg-indigo-50/20 font-bold text-indigo-900">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <Check className="h-4 w-4" /> High-signal verified parent hub
                    </span>
                    <span className="text-xs text-slate-600 block mt-1 font-normal">Moving daily digest, direct teacher chats, and zero spam.</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    School Bus &amp; Safety Tracking
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">Student transit accountability</span>
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                      <X className="h-4 w-4" /> Phone calls to front-office desk
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">Anxious parents tie up school phone lines every morning.</span>
                  </td>
                  <td className="p-4 sm:p-5 bg-indigo-50/20 font-bold text-indigo-900">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <Check className="h-4 w-4" /> Sub-minute GPS with live ETA
                    </span>
                    <span className="text-xs text-slate-600 block mt-1 font-normal">Real-time telemetry, stop alerts, and verified driver contact.</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Student Records &amp; Clearances
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">Transfer certificates and transcripts</span>
                  </td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                      <X className="h-4 w-4" /> Manual paper slips &amp; stamps
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">Takes 7–10 days of physical department chasing.</span>
                  </td>
                  <td className="p-4 sm:p-5 bg-indigo-50/20 font-bold text-indigo-900">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <Check className="h-4 w-4" /> Dual-signature digital TC vault
                    </span>
                    <span className="text-xs text-slate-600 block mt-1 font-normal">Tamper-proof verifiable PDF certificates issued in 24 hours.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: TESTIMONIALS & EDUCATOR QUOTES
          ========================================================================= */}
      <section id="testimonials" className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Loved by School Communities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
              Hear From Leaders, Teachers &amp; Parents
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Real stories from institutions that made the switch to proactive school intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Testimonial 1 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic font-normal">
                  "EDU360 transformed our morning administrative operations. The Priority Triage radar alone freed up 10 hours a week for our vice-principals by automating chronic absence follow-ups."
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
                  alt="Dr. Aruna Sen"
                  className="h-11 w-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Dr. Aruna Sen</h4>
                  <p className="text-[11px] text-slate-500">Principal • Delhi Public World School</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic font-normal">
                  "The grading canvas is a masterpiece. I evaluate 35 problem sets directly in the browser with custom stamps and zero lag. The 4-day focus table automatically syncs with parents so we're aligned on remedial work."
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
                  alt="Mrs. Ananya Verma"
                  className="h-11 w-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Mrs. Ananya Verma</h4>
                  <p className="text-[11px] text-slate-500">Head of Mathematics • Oakridge International</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-1">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic font-normal">
                  "No more scanning through 500 WhatsApp messages to find tomorrow's syllabus or bus timings. The live bus GPS ETA gives my family total peace of mind every morning, and fees are paid in one tap."
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                  alt="Mr. Rajesh Sharma"
                  className="h-11 w-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">Mr. Rajesh Sharma</h4>
                  <p className="text-[11px] text-slate-500">Parent of Grade 8 Student • Riverdale Academy</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 7: ENTERPRISE DATA SECURITY & COMPLIANCE
          ========================================================================= */}
      <section id="security" className="py-16 sm:py-20 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Institutional Peace of Mind
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Enterprise-Grade Security &amp; Compliance Vault
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Student privacy is non-negotiable. Every record, mark, and message in EDU360 is fortified by global encryption standards.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-center">
              <ShieldCheck className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900">FERPA Compliant</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Student educational record privacy certified</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-center">
              <Lock className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900">GDPR Standard</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Strict data residency and right to be forgotten</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-center">
              <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900">SOC-2 Type II</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Continuous independent security audits</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900">99.99% Uptime</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">High availability with sub-second failover</p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 8: FINAL HIGH-IMPACT CTA BANNER
          ========================================================================= */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 p-8 sm:p-14 text-white text-center shadow-2xl overflow-hidden">
            
            {/* Background Decorative Mesh Orbs */}
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-indigo-200 border border-white/20 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                <span>Transform Your School Operations in Under 14 Days</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Ready to bring your school into the future of education?
              </h2>

              <p className="text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto leading-relaxed font-normal">
                Join over 120+ progressive institutions using EDU360 to eliminate administrative chaos, align faculty with families, and elevate student achievement.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => openDemoModal('admin', 'demo')}
                  className="group inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm sm:text-base font-bold text-indigo-900 shadow-xl hover:bg-indigo-50 hover:scale-105 active:scale-100 transition-all duration-150 cursor-pointer"
                >
                  <span>Schedule a 15-Minute Consultation</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => openDemoModal('admin', 'tour')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 px-6 py-4 text-sm sm:text-base font-bold text-white border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                  <span>Watch 2-Min Tour</span>
                </button>
              </div>

              <p className="text-xs text-indigo-200 pt-2 font-medium">
                No contract required • Free data migration support • Setup completed in days
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 9: MODERN SAAS FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-200 bg-slate-50/80 pt-16 pb-12 text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            
            {/* Col 1: Branding & Mission */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-sm">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  EDU<span className="text-indigo-600">360</span>
                </span>
              </Link>

              <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                The next-generation Action &amp; Intelligence Platform for modern K-12 schools. Unifying leadership, teachers, parents, and students with proactive triage and zero-burden workflows.
              </p>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60 w-fit">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>All Systems Operational • 99.99% Uptime</span>
              </div>
            </div>

            {/* Col 2: Platform & Modules */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#core-pillars" className="hover:text-indigo-600 transition-colors">Priority Triage Engine</a>
                </li>
                <li>
                  <a href="#core-pillars" className="hover:text-indigo-600 transition-colors">In-Browser Grading Canvas</a>
                </li>
                <li>
                  <a href="#core-pillars" className="hover:text-indigo-600 transition-colors">Shared Student Focus Table</a>
                </li>
                <li>
                  <a href="#core-pillars" className="hover:text-indigo-600 transition-colors">Live School Bus GPS</a>
                </li>
                <li>
                  <a href="#core-pillars" className="hover:text-indigo-600 transition-colors">Admissions CRM &amp; Pipeline</a>
                </li>
                <li>
                  <a href="#core-pillars" className="hover:text-indigo-600 transition-colors">Dual-Signature Exit Vault</a>
                </li>
              </ul>
            </div>

            {/* Col 3: Solutions by Role */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Solutions
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setSelectedRoleTab('admin')} className="hover:text-indigo-600 transition-colors text-left cursor-pointer">
                    For Principals &amp; Deans
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedRoleTab('teacher')} className="hover:text-indigo-600 transition-colors text-left cursor-pointer">
                    For Academic Faculty
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedRoleTab('parent')} className="hover:text-indigo-600 transition-colors text-left cursor-pointer">
                    For Parents &amp; Families
                  </button>
                </li>
                <li>
                  <button onClick={() => setSelectedRoleTab('student')} className="hover:text-indigo-600 transition-colors text-left cursor-pointer">
                    For Students
                  </button>
                </li>
                <li>
                  <Link href="/login" className="hover:text-indigo-600 transition-colors font-semibold text-indigo-600">
                    Staff &amp; Student Sign In →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Compliance & Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Compliance &amp; Trust
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#security" className="hover:text-indigo-600 transition-colors">FERPA Certification</a>
                </li>
                <li>
                  <a href="#security" className="hover:text-indigo-600 transition-colors">GDPR Privacy Rights</a>
                </li>
                <li>
                  <a href="#security" className="hover:text-indigo-600 transition-colors">SOC-2 Type II Attestation</a>
                </li>
                <li>
                  <a href="#security" className="hover:text-indigo-600 transition-colors">Student Data Privacy Pledge</a>
                </li>
                <li>
                  <span className="text-slate-400">ISO 27001 Certified</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 EDU360 Technologies, Inc. All rights reserved. Powered by{' '}
              <strong className="text-[#6366f1] font-semibold">Diradz Solutions</strong>
            </div>

            <div className="flex items-center gap-6">
              <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-900 cursor-pointer">Security Whitepaper</span>
              <span className="hover:text-slate-900 cursor-pointer">Cookie Preferences</span>
            </div>
          </div>

          {/* Brand Footer */}
          <div className="brand-footer text-center pt-6 mt-6 border-t border-slate-200/70 text-slate-500 text-[0.85rem]">
            Powered by <strong className="brand-name text-[#6366f1] font-semibold">Diradz Solutions</strong>
          </div>

        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE DEMO / CONSULTATION BOOKING MODAL
          ========================================================================= */}
      <DemoBookingModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        defaultRole={demoDefaultRole}
        initialTab={demoInitialTab}
      />

    </div>
  );
}
