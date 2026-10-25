'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Receipt, 
  BookOpen,
  ArrowRight,
  CheckSquare,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { ExecutivePulseResponse } from '@/lib/types';
import { DocumentViewerModal, DocumentPreviewData } from '@/components/document-viewer-modal';

interface AdminCockpitProps {
  onNavigateTab?: (tab: string) => void;
}

export function AdminCockpit({ onNavigateTab }: AdminCockpitProps) {
  const [pulse, setPulse] = useState<ExecutivePulseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Document Viewer Modal State
  const [previewDocData, setPreviewDocData] = useState<DocumentPreviewData | null>(null);
  const [showDocPreviewModal, setShowDocPreviewModal] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadPulse = async () => {
    setLoading(true);
    try {
      const data = await api.getExecutivePulse();
      setPulse(data);
    } catch (err) {
      console.error('Failed to load executive pulse:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPulse();
  }, []);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Principal Dashboard
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Academic Session 2026–2027 · Term 2
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <span>School Overview &amp; Daily Operations</span>
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
              · Dr. Sunita Kapoor
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Live overview of student admissions, fee collections, teacher attendance, and academic progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPulse}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Refresh School Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 HIGH-LEVEL METRIC CARDS                                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Admissions & Capacity */}
        <div 
          onClick={() => onNavigateTab?.('crm')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Admissions &amp; Capacity
            </span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {pulse?.admissions.total_enrolled || 142}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              / {pulse?.admissions.total_capacity || 180} Seats
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {pulse?.admissions.capacity_percentage || 78.9}% Filled
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {pulse?.admissions.new_inflows_mtd || 45} Inquiries This Month
            </span>
          </div>
        </div>

        {/* Metric 2: Today's Fee Collections */}
        <div 
          onClick={() => onNavigateTab?.('fees')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Today&apos;s Fee Collections
            </span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{(pulse?.accounts.today_collections || 145000).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> {pulse?.accounts.today_transactions_count || 12} Payments Today
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              ₹65k Overdue (&gt;60 Days)
            </span>
          </div>
        </div>

        {/* Metric 3: Teacher Attendance */}
        <div 
          onClick={() => onNavigateTab?.('substitutions')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Teacher Attendance
            </span>
            <div className="p-1.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {pulse?.staff_and_pacing.staff_present || 42}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              / {pulse?.staff_and_pacing.staff_total || 44} Present
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              {pulse?.staff_and_pacing.attendance_pct || 95.5}% on Campus
            </span>
            <span className="text-slate-500 dark:text-slate-400">2 Classes Covered</span>
          </div>
        </div>

        {/* Metric 4: Academic Progress & Remedial Sprints */}
        <div 
          onClick={() => onNavigateTab?.('exams')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              Academic Progress
            </span>
            <div className="p-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {pulse?.exams.remedial_student_count || 8}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Students in Remedial
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              Class 8 Math (+6.0% ↗)
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              1-Week Practice Sprint
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAILED SCHOOL OPERATIONAL CARDS (CLEAN, JUMP DIRECTLY INTO MODULES)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CARD 1: NEW ADMISSIONS & INQUIRIES */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    New Student Admissions &amp; Inquiries
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track parent inquiries, counseling meetings, and seat availability
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg">
                78.9% Filled
              </span>
            </div>

            {/* Inflow breakdown pills */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">New Inquiries</span>
                <span className="text-base font-black text-slate-900 dark:text-white">45</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Follow-ups</span>
                <span className="text-base font-black text-slate-900 dark:text-white">18</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Confirmed</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">142</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Seats Left</span>
                <span className="text-base font-black text-blue-600 dark:text-blue-400">38</span>
              </div>
            </div>

            {/* Class-wise capacity */}
            <div className="space-y-2.5 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Seat Occupancy per Class:</span>
              
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Class 8</span>
                  <span className="font-bold text-slate-900 dark:text-white">92 / 100 Seats (92%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Class 9</span>
                  <span className="font-bold text-slate-900 dark:text-white">78 / 100 Seats (78%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Class 10</span>
                  <span className="font-bold text-slate-900 dark:text-white">84 / 100 Seats (84%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Manage candidate pipeline and admissions</span>
            <button
              onClick={() => onNavigateTab?.('crm')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer"
            >
              <span>Open Admissions &amp; Enquiries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 2: FEE COLLECTIONS & PENDING DUES */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Fee Collections &amp; Pending Dues
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Daily payments received, overdue fees, and payment status
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-lg">
                ₹1.45L Today
              </span>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Today&apos;s Online Collections</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">₹1,45,000</span>
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  12 Receipts Recorded
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Monthly Staff Salaries</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">₹18,20,000</span>
                <span className="block text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                  44 Teachers &amp; Staff
                </span>
              </div>
            </div>

            {/* Pending Dues Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-bold mb-1">
                <span>Pending Fees by Timeline:</span>
                <span className="text-slate-500 dark:text-slate-400">Total Pending: ₹4,15,000</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">Recent (&lt;30 Days)</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">₹2.10 Lakhs</span>
                  <span className="block text-[9px] text-slate-400">Normal Reminders</span>
                </div>
                <div className="p-2 border border-amber-200 dark:border-amber-900/40 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                  <span className="block text-[10px] text-amber-700 dark:text-amber-300 font-semibold">30–60 Days Due</span>
                  <span className="font-extrabold text-amber-800 dark:text-amber-200">₹1.40 Lakhs</span>
                  <span className="block text-[9px] text-amber-600 dark:text-amber-400">2nd Notice Sent</span>
                </div>
                <div className="p-2 border border-rose-200 dark:border-rose-900/40 rounded-lg bg-rose-50/50 dark:bg-rose-950/20">
                  <span className="block text-[10px] text-rose-700 dark:text-rose-300 font-semibold">Over 60 Days Due</span>
                  <span className="font-extrabold text-rose-800 dark:text-rose-200">₹65,000</span>
                  <span className="block text-[9px] text-rose-600 dark:text-rose-400">Meeting with Parents</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Manage fee registers and waivers</span>
            <button
              onClick={() => onNavigateTab?.('fees')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer"
            >
              <span>Open Fee Records &amp; Dues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 3: TEACHER ATTENDANCE & CLASS COVER */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Teacher Attendance &amp; Class Cover
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Daily teacher presence, approved leaves, and substitute coverage
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-lg">
                All Classes Covered ✓
              </span>
            </div>

            {/* Attendance & Proxy Status */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Teachers Present</span>
                <span className="text-base font-black text-slate-900 dark:text-white">42 / 44</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Classes Covered</span>
                <span className="text-base font-black text-purple-600 dark:text-purple-400">2 Classes</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Unattended Periods</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">0 Periods</span>
              </div>
            </div>

            {/* Substitution Highlights */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Today&apos;s Class Coverage:</span>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Class 8-B · Mathematics (Period 3)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Covered
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Absent: Mrs. Ananya Verma ➔ Substitute: Mr. Vikram Sharma
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Manage substitute teachers &amp; timetable</span>
            <button
              onClick={() => onNavigateTab?.('substitutions')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline cursor-pointer"
            >
              <span>View Teacher Cover &amp; Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 4: EXAMINATIONS & STUDENT PROGRESS */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Exams &amp; Student Progress
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Examination timetables, paper evaluation, and remedial learning
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 rounded-lg">
                Term 2 Active
              </span>
            </div>

            {/* Active Exams Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs">
                <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Active Exam Today:
                </span>
                <div className="font-semibold text-slate-900 dark:text-white">Class 10: Math Pre-Board</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Class 8: General Science</div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Upcoming Next Week:
                </span>
                <div className="font-semibold text-slate-900 dark:text-white">Class 9: English (Monday)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">120 Papers in Evaluation</div>
              </div>
            </div>

            {/* Academic Growth */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Class Performance Highlights:</span>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="font-medium text-slate-700 dark:text-slate-300">Class 8 Mathematics:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">68% ➔ 74% (+6.0% ↗)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="font-medium text-slate-700 dark:text-slate-300">Class 10 Board Batch:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">81% ➔ 83% (+2.0% ↗)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">View schedules and hall passes</span>
            <button
              onClick={() => onNavigateTab?.('exams')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline cursor-pointer"
            >
              <span>Open Exam Timetables &amp; Schedules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 5: SCHOOL TASKS & CLEARANCES */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    School Tasks &amp; Delegations
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Coordinator responsibilities, deadlines, and student exit clearances
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-lg">
                4 Active Tasks
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Transfer Certificate (TC) Application</span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Pending Review</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Student: Rohan Deshmukh (Class 9-B) · Accounts &amp; Library Cleared
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Fee Concession Request</span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Single Parent Hardship</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Student: Rahul Verma (Class 9-A) · 25% waiver application
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Track all departmental assignments</span>
            <button
              onClick={() => onNavigateTab?.('tasks')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline cursor-pointer"
            >
              <span>Open School Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 6: SCHOOL EVENTS & ACTIVITIES */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    School Events &amp; Activities
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Annual day, exhibitions, sports meets, and student committees
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-lg">
                Upcoming Event
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                  Annual Day 2026: Navarasa (Rhythms of Tomorrow)
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">24 Oct, 5:30 PM</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Venue: School Main Auditorium &amp; Amphitheatre · 400+ student performers
              </p>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>3 Faculty Committee Leads</span>
                <span>9 Student Volunteers Assigned</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">View committees and vendor trackers</span>
            <button
              onClick={() => onNavigateTab?.('events')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer"
            >
              <span>Open School Events &amp; Activities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Document Viewer / Preview & Download Modal */}
      <DocumentViewerModal
        isOpen={showDocPreviewModal}
        onClose={() => setShowDocPreviewModal(false)}
        document={previewDocData}
      />
    </div>
  );
}
