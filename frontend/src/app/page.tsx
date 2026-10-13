'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  FileCheck2, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const roles = [
  {
    role: 'admin',
    title: 'Administration / Management',
    persona: 'Dr. Sunita Kapoor (Principal & Super Admin)',
    href: '/admin',
    icon: Building2,
    gradient: 'from-blue-600 to-indigo-800',
    border: 'border-blue-200',
    highlight: 'Priority Triage & School Ops',
    features: [
      '🔴/🟠/🟢 Priority Triage Action Engine (Absenteeism, Fee dues, Academics)',
      'Admissions CRM with AI Chatbot logs & 1-click SIS student conversion',
      'Strict Document Control (Admin-only upload/edit for official certificates)',
      'Dual-Signature Exit & Transfer Certificate (TC) clearance archive',
      'Event & Vendor Command Center with staff-to-student volunteer hierarchy'
    ]
  },
  {
    role: 'teacher',
    title: 'Teacher Portal',
    persona: 'Mrs. Ananya Verma (Senior Mathematics Faculty)',
    href: '/teacher',
    icon: GraduationCap,
    gradient: 'from-emerald-600 to-teal-800',
    border: 'border-emerald-200',
    highlight: 'Zero-Burden Academic Workflows',
    features: [
      '10-Minute Online Class Auto-Attendance Rule (0-10m Present, >10m Late)',
      'In-Browser Homework Grading Canvas (Red pen, green tick stamps, typed remarks)',
      'Shared Focus Table with 4-day revision timetable for weak concepts',
      'Parental Connection Hub with 1-click leave approvals & context drawer'
    ]
  },
  {
    role: 'parent',
    title: 'Parent Application',
    persona: 'Mr. Rajesh Sharma (Parent of Aarav Sharma, Class 8B)',
    href: '/parent',
    icon: Users,
    gradient: 'from-amber-600 to-orange-800',
    border: 'border-amber-200',
    highlight: 'Anti-Spam High Signal Engagement',
    features: [
      'Anti-Spam Moving Slider Carousel for routine daily announcements',
      'Live School Bus Route 4 GPS Tracking with ETA & driver contact button',
      'Shared Student Focus Table with home practice sign-off checklist',
      'Fee Milestones with 1-click UPI/Card mock payment & instant receipt download'
    ]
  },
  {
    role: 'student',
    title: 'Student Portal',
    persona: 'Aarav Sharma (Class 8B, Roll #14, Adm #EDU-2024-082)',
    href: '/student',
    icon: BookOpen,
    gradient: 'from-purple-600 to-indigo-800',
    border: 'border-purple-200',
    highlight: 'Outcome-Driven Student LMS',
    features: [
      '1-Click Live Classroom join & Subject/Chapter recorded classes library',
      'Side-by-Side Portfolio: School Participations vs Verified Achievements',
      'Homework upload & view teacher annotated worksheets with red ink remarks',
      'Official School Vault with verified report cards & bonafide certificates'
    ]
  }
];

export default function HomePage() {
  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-12 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 border border-blue-200/60 mb-5 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>K–12 Outcomes & Intelligence Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            The Action & Intelligence Platform for Modern Schools
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate passive digital ERP registers. EDU360 empowers school leadership, teachers, parents, and students with proactive triage, zero-burden grading, and shared outcome focus.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Instant Role Sandbox:</span>
            {roles.map((r) => (
              <Link
                key={r.role}
                href={r.href}
                className="flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 px-4 py-2 text-xs font-bold text-slate-800 border border-slate-300 transition-all hover:scale-105 shadow-xs"
              >
                <span>{r.title.split('/')[0]}</span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Distinct Role Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900">Explore 4 Tailored Roles</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Switch personas instantly without logging out to test cross-role workflows
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.role}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  {/* Top Role Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.gradient} text-white shadow-md shadow-blue-500/10`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <span className="text-xs text-slate-500">{item.persona}</span>
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 border border-slate-200">
                      {item.highlight}
                    </span>
                  </div>

                  {/* Key Capabilities List */}
                  <div className="mt-6 space-y-2.5">
                    {item.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Launch Button */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Full MVP Interactive Playground
                  </span>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all duration-200 group-hover:bg-blue-600"
                  >
                    <span>Launch {item.title.split('/')[0]} Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cross-Role Architecture Section */}
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
            
            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-400/30 mb-4">
                <ShieldCheck className="h-3.5 w-3.5" />
                Next-Gen School Operating System
              </span>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                How EDU360 Unifies the Entire School Community
              </h2>

              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                When a student scores poorly on quadratic equations, the teacher's inline grading triggers a 4-day revision timetable on the <b>Shared Focus Table</b>, visible to parents. When online class begins, join timestamps execute the <b>10-minute auto-attendance rule</b>, streaming consecutive absences straight into the <b>Admin Priority Triage Command Center</b>.
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Strict SIS Document Security</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Dual-Signature TC Legal Handover</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Real-time GPS Route Simulation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
