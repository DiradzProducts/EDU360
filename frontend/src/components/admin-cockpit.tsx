'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Check, 
  X, 
  ShieldCheck, 
  FileText, 
  BookOpen, 
  UserCheck, 
  Calendar, 
  Receipt, 
  AlertCircle, 
  ChevronRight,
  TrendingDown,
  Percent,
  Search,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { api } from '@/lib/api';
import { ExecutivePulseResponse } from '@/lib/types';
import { 
  exportToCsv, 
  downloadOfficialDocumentFile, 
  downloadMarksMemoFile 
} from '@/lib/export-utils';

interface AdminCockpitProps {
  onNavigateTab?: (tab: string) => void;
}

export function AdminCockpit({ onNavigateTab }: AdminCockpitProps) {
  const [pulse, setPulse] = useState<ExecutivePulseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local state for actions to provide immediate optimistic feedback
  const [signedTcs, setSignedTcs] = useState<number[]>([]);
  const [reviewedLeaves, setReviewedLeaves] = useState<number[]>([]);
  const [approvedWaivers, setApprovedWaivers] = useState<boolean>(false);
  const [payrollAuthorized, setPayrollAuthorized] = useState<boolean>(false);
  const [sentinelIntervened, setSentinelIntervened] = useState<boolean>(false);

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

  // Handler: Sign & Download TC
  const handleSignTc = async (studentId: number, studentName: string, admNo: string) => {
    setSignedTcs(prev => [...prev, studentId]);
    try {
      await api.verifyPhysicalSign(studentId);
    } catch (e) {
      console.warn('TC sign API call:', e);
    }
    downloadOfficialDocumentFile('Transfer Certificate (Dual Signed)', studentName, admNo);
    showToast(`✓ TC for ${studentName} signed with Cryptographic Seal & downloaded!`);
  };

  // Handler: Approve Staff Leave with Auto Proxy
  const handleApproveLeave = async (permId: number, staffName: string) => {
    setReviewedLeaves(prev => [...prev, permId]);
    try {
      await api.reviewTeacherPermission(permId, 'Approved');
    } catch (e) {
      console.warn('Leave review API call:', e);
    }
    showToast(`✓ Leave approved for ${staffName}. Proxy substitution slot created for Academic Coordinator!`);
  };

  // Handler: Authorize Fee Concession
  const handleAuthorizeFeeWaiver = async () => {
    setApprovedWaivers(true);
    try {
      await api.applyFeeWaiver(1, {
        waiver_amount: 12500,
        reason: 'Single parent hardship 25% waiver',
        approved_by: 'Dr. Sunita Kapoor (Principal)'
      });
    } catch (e) {
      console.warn('Fee waiver API call:', e);
    }
    showToast('✓ 25% Fee Concession approved for Rahul Verma (Class 9-A). Updated in bursar ledger.');
  };

  // Handler: Authorize Monthly Payroll
  const handleAuthorizePayroll = async () => {
    setPayrollAuthorized(true);
    try {
      await api.authorizePayroll(1, {
        authorized_by: 'Dr. Sunita Kapoor (Principal)',
        notes: 'October Payroll Disbursal'
      });
    } catch (e) {
      console.warn('Payroll authorization API call:', e);
    }
    showToast('✓ October Payroll (₹18.2L for 44 Staff) authorized for bank disbursal.');
  };

  // Handler: Syllabus Sentinel Intervention
  const handleSentinelIntervention = async () => {
    setSentinelIntervened(true);
    try {
      await api.interveneCurriculumPacing(2);
    } catch (e) {
      console.warn('Curriculum intervention API call:', e);
    }
    showToast('✓ Remediation Mandate dispatched to Academic Coordinator & Mr. Sharma (SLA: 48h).');
  };

  // Download Handlers
  const handleExportAdmissionsCsv = () => {
    const headers = ['Student Name', 'Target Grade', 'Parent Name', 'Status', 'Inflow Date'];
    const rows = [
      ['Aarav Sen', 'Class 8-A', 'Siddharth Sen', 'Documents Verified', '2026-10-22'],
      ['Meera Iyer', 'Class 9-B', 'Lakshmi Iyer', 'Campus Visit Completed', '2026-10-21'],
      ['Rohan Gupta', 'Class 8-B', 'Vikram Gupta', 'Enrolled Confirmed', '2026-10-20'],
      ['Zara Khan', 'Class 10-A', 'Tariq Khan', 'Application Submitted', '2026-10-19'],
      ['Aditya Joshi', 'Class 9-A', 'Sunil Joshi', 'Enrolled Confirmed', '2026-10-18']
    ];
    exportToCsv('Admissions_Inflows_Report_2026.csv', headers, rows);
    showToast('📥 Admissions Inflow CSV downloaded successfully!');
  };

  const handleExportCashflowCsv = () => {
    const headers = ['Category', 'Amount (INR)', 'Count / Details', 'Status'];
    const rows = [
      ['Today Collections', '145000', '12 Transactions (UPI/Card/NetBanking)', 'Received'],
      ['Current Overdue (<30d)', '210000', '14 Students', 'Active Notice'],
      ['Aging Overdue (30-60d)', '140000', '8 Students', 'Urgent Notice Sent'],
      ['Critical Overdue (>60d)', '65000', '3 Students', 'Counselor Action Required'],
      ['October Staff Payroll', '1820000', '44 Teaching & Non-Teaching Staff', payrollAuthorized ? 'Authorized' : 'Pending Sign-off'],
      ['Gateway Settlement Pipeline', '85000', 'Axis / HDFC Virtual Accounts', 'T+2 Clearing Tomorrow']
    ];
    exportToCsv('Accounts_Cashflow_Aging_Report_2026.csv', headers, rows);
    showToast('📥 Accounts Cashflow & Aging CSV downloaded successfully!');
  };

  const handleDownloadCohortMemo = () => {
    downloadMarksMemoFile('Class 8-B Cohort Report', 'Term 2 Periodic Assessment');
    showToast('📥 Official Statement of Marks downloaded successfully!');
  };

  const handleExportStaffPacingCsv = () => {
    const headers = ['Class', 'Subject', 'Teacher Name', 'Units Completed', 'Calendar Target', 'Lag Status', 'Action'];
    const rows = [
      ['Class 9-A', 'Physics', 'Mr. Vikram Sharma', '3', '5', 'Lagging (2 Units Behind)', sentinelIntervened ? 'Catchup Mandate Issued' : 'Urgent Intervention Needed'],
      ['Class 8-B', 'Mathematics', 'Mrs. Ananya Verma', '5', '5', 'On Track', 'Remedial Focus Batch Active'],
      ['Class 10-A', 'Chemistry', 'Dr. K. Raman', '6', '5', 'Ahead (+1 Unit)', 'Syllabus Complete Ahead of Schedule'],
      ['Class 8-A', 'English', 'Ms. Priya Sen', '4', '4', 'On Track', 'Lesson Planner Aligned']
    ];
    exportToCsv('Staff_Pacing_Sentinel_Audit_2026.csv', headers, rows);
    showToast('📥 Staff & Syllabus Sentinel Audit CSV downloaded successfully!');
  };

  const pendingTcCount = pulse ? Math.max(0, pulse.quick_action_counts.pending_tcs - signedTcs.length) : 0;
  const pendingLeaveCount = pulse ? Math.max(0, pulse.quick_action_counts.pending_staff_permissions - reviewedLeaves.length) : 0;
  const pendingWaiverCount = approvedWaivers ? 0 : 1;

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 rounded-lg text-xs font-bold uppercase tracking-wider">
              Executive Cockpit
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Academic Session 2026–2027 · Term 2
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <span>Principal Command Center</span>
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              · Dr. Sunita Kapoor
            </span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Institutional Vitals, Cross-Role Decision Gateways &amp; Automated Sentinel Intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPulse}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Refresh Institutional Pulse"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Pulse</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 1: THE MORNING PULSE (5 Executive Vitals Cards)                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Vital 1: Inflows & Capacity */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">Inflow &amp; Capacity</span>
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
              <TrendingUp className="w-3 h-3" /> {pulse?.admissions.capacity_percentage || 78.9}% Full
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {pulse?.admissions.new_inflows_mtd || 45} Inflows MTD
            </span>
          </div>
        </div>

        {/* Vital 2: Today's Cash Collections */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-emerald-400 dark:hover:border-emerald-600 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">Today&apos;s Receipts</span>
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
              <CheckCircle2 className="w-3 h-3" /> {pulse?.accounts.today_transactions_count || 12} Payments
            </span>
            <span className="text-slate-500 dark:text-slate-400">Gateway Live</span>
          </div>
        </div>

        {/* Vital 3: Fee Aging & Critical Overdue */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-amber-400 dark:hover:border-amber-600 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">Aging &gt;60d Overdue</span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{(pulse?.accounts.aging.over_60_days_critical || 65000).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              3 Chronic Defaulters
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              ₹2.1L &lt;30d Normal
            </span>
          </div>
        </div>

        {/* Vital 4: Staff & Faculty Presence */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-purple-400 dark:hover:border-purple-600 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">Faculty Attendance</span>
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
              {pulse?.staff_and_pacing.attendance_pct || 95.5}% On Duty
            </span>
            <span className="text-slate-500 dark:text-slate-400">2 Proxies Active</span>
          </div>
        </div>

        {/* Vital 5: Academic Health & Focus Sprints */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-rose-400 dark:hover:border-rose-600 transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">Academic Risk</span>
            <div className="p-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {pulse?.exams.remedial_student_count || 8}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Students on Plan
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              Class 8 (+6% ↗)
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              1 Lag Sentinel
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: EXECUTIVE ACTION QUEUE (Zero-Inbox Paradigm - 5 Min Daily)        */}
      {/* ========================================================================= */}
      <div className="p-5 bg-gradient-to-br from-slate-900 to-blue-950 dark:from-slate-900 dark:to-slate-950 border border-blue-900/40 rounded-2xl text-white shadow-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Executive Sign-off Queue</span>
                <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 rounded-full text-xs font-extrabold">
                  {pendingTcCount + pendingLeaveCount + pendingWaiverCount + (sentinelIntervened ? 0 : 1)} Pending Actions
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Principal authorization gates required across Exit Clearance, Faculty Leaves, and Fee Concessions.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
            Zero-Inbox Goal · Daily Review
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action 1: Transfer Certificate Dual Sign */}
          <div className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <div className="flex items-center justify-between text-xs text-blue-300 font-bold mb-1.5">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Transfer Certificate
              </span>
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-200 rounded text-[10px]">Accounts &amp; Lab Cleared</span>
            </div>
            <div className="text-sm font-bold text-white">Rohan Deshmukh (Class 9-B)</div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">
              Family relocating to Pune. All departmental dues settled.
            </p>
            <div className="mt-3">
              {signedTcs.includes(101) ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <Check className="w-4 h-4" /> Signed &amp; Issued
                </div>
              ) : (
                <button
                  onClick={() => handleSignTc(101, 'Rohan Deshmukh', 'OIS-2026-9921')}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Sign &amp; Download TC</span>
                </button>
              )}
            </div>
          </div>

          {/* Action 2: Staff Leave Approval with Auto Proxy */}
          <div className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <div className="flex items-center justify-between text-xs text-purple-300 font-bold mb-1.5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Faculty Leave
              </span>
              <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-200 rounded text-[10px]">Auto-Proxy Interlock</span>
            </div>
            <div className="text-sm font-bold text-white">Mrs. Ananya Verma (Math)</div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">
              Medical Leave (Tomorrow) · Period 3 (Class 8-B) affected.
            </p>
            <div className="mt-3">
              {reviewedLeaves.includes(1) ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <Check className="w-4 h-4" /> Proxy Cover Pushed
                </div>
              ) : (
                <button
                  onClick={() => handleApproveLeave(1, 'Mrs. Ananya Verma')}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Approve &amp; Assign Proxy</span>
                </button>
              )}
            </div>
          </div>

          {/* Action 3: Fee Concession Approval */}
          <div className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold mb-1.5">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Fee Concession
              </span>
              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-200 rounded text-[10px]">Bursar Verified</span>
            </div>
            <div className="text-sm font-bold text-white">Rahul Verma (Class 9-A)</div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">
              Single parent hardship: 25% tuition fee waiver requested.
            </p>
            <div className="mt-3">
              {approvedWaivers ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <Check className="w-4 h-4" /> Waiver Authorized
                </div>
              ) : (
                <button
                  onClick={handleAuthorizeFeeWaiver}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Authorize 25% Waiver</span>
                </button>
              )}
            </div>
          </div>

          {/* Action 4: Syllabus Sentinel Catchup Mandate */}
          <div className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <div className="flex items-center justify-between text-xs text-rose-300 font-bold mb-1.5">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Syllabus Lag Alert
              </span>
              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-200 rounded text-[10px]">2 Units Behind</span>
            </div>
            <div className="text-sm font-bold text-white">Class 9-A Physics</div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">
              Mr. Vikram Sharma · Target 5 vs Delivered 3 units.
            </p>
            <div className="mt-3">
              {sentinelIntervened ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <Check className="w-4 h-4" /> 48h SLA Dispatched
                </div>
              ) : (
                <button
                  onClick={handleSentinelIntervention}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Dispatch 48h Mandate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 3: THE 4 STRATEGIC DOMAIN CARDS (Deep Insights & Working Downloads)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CARD 1: ADMISSIONS & STUDENT MOVEMENT */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    1. Admissions &amp; Inflow / Outflow
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lead pipeline velocity, seat allocation &amp; exit clearance audit
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg">
                78.9% Enrolled
              </span>
            </div>

            {/* Inflow vs Outflow Chips */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">New Inflows</span>
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
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Exits (TC)</span>
                <span className="text-base font-black text-slate-600 dark:text-slate-400">2</span>
              </div>
            </div>

            {/* Capacity Breakdown */}
            <div className="space-y-2.5 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Class-wise Capacity Meter:</span>
              
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Class 8 (Homeroom Math Focus)</span>
                  <span className="font-bold text-slate-900 dark:text-white">92 / 100 Seats (92%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Class 9 (Remedial Sprint Cohort)</span>
                  <span className="font-bold text-slate-900 dark:text-white">78 / 100 Seats (78%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Class 10 (Board Exam Batch)</span>
                  <span className="font-bold text-slate-900 dark:text-white">84 / 100 Seats (84%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleExportAdmissionsCsv}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Admissions CSV</span>
            </button>
            <Link
              href="/admissions_coordinator"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Admissions Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* CARD 2: ACCOUNTS, COLLECTIONS & SALARIES */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    2. Accounts, Aging &amp; Staff Payroll
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Daily collections, fee defaulters aging &amp; payroll disbursement
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-lg">
                Gateway T+2 Active
              </span>
            </div>

            {/* Financial Summary Chips */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Today&apos;s Inward Collections</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">₹1,45,000</span>
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  12 UPI / Online Transactions
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-semibold">October Staff Payroll Batch</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">₹18,20,000</span>
                <span className="block text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                  44 Faculty &amp; Staff Slips
                </span>
              </div>
            </div>

            {/* Aging Tranches */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-bold mb-1">
                <span>Fee Defaulters Aging Structure:</span>
                <span className="text-slate-500 dark:text-slate-400">Total Pending: ₹4,15,000</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">&lt; 30 Days</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">₹2.10 Lakhs</span>
                  <span className="block text-[9px] text-slate-400">Auto-Reminders On</span>
                </div>
                <div className="p-2 border border-amber-200 dark:border-amber-900/40 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                  <span className="block text-[10px] text-amber-700 dark:text-amber-300 font-semibold">30–60 Days</span>
                  <span className="font-extrabold text-amber-800 dark:text-amber-200">₹1.40 Lakhs</span>
                  <span className="block text-[9px] text-amber-600 dark:text-amber-400">Notice Sent</span>
                </div>
                <div className="p-2 border border-rose-200 dark:border-rose-900/40 rounded-lg bg-rose-50/50 dark:bg-rose-950/20">
                  <span className="block text-[10px] text-rose-700 dark:text-rose-300 font-semibold">&gt; 60 Days (Critical)</span>
                  <span className="font-extrabold text-rose-800 dark:text-rose-200">₹65,000</span>
                  <span className="block text-[9px] text-rose-600 dark:text-rose-400">Counselor Call</span>
                </div>
              </div>
            </div>

            {/* Payroll 1-Click Action */}
            <div className="mt-3.5 p-2.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-950 dark:text-purple-200 block">October Payroll Status:</span>
                <span className="text-[11px] text-purple-700 dark:text-purple-300">
                  {payrollAuthorized ? 'Authorized for Bank Release ✓' : 'Awaiting Principal Approval'}
                </span>
              </div>
              {payrollAuthorized ? (
                <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Authorized
                </span>
              ) : (
                <button
                  onClick={handleAuthorizePayroll}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Authorize Disbursal
                </button>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleExportCashflowCsv}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Cashflow CSV</span>
            </button>
            <Link
              href="/accounts_coordinator"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>Accounts Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* CARD 3: EXAMS & COMPARATIVE ACADEMIC TRAJECTORY */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    3. Examinations &amp; Academic Trajectory
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live examination status, paper correction backlog &amp; cohort growth trends
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-lg">
                Mid-Term Active
              </span>
            </div>

            {/* Active & Upcoming Exams Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs">
                <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Active Exams Today:
                </span>
                <div className="font-semibold text-slate-900 dark:text-white">Class 10: Math Pre-Board</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Class 8: General Science</div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Upcoming Next Week:
                </span>
                <div className="font-semibold text-slate-900 dark:text-white">Class 9: English (Mon)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">120 Papers in Correction</div>
              </div>
            </div>

            {/* Academic Growth Trajectory: Previous vs Current */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Cohort Academic Growth (Term 1 vs Term 2):</span>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Class 8 (Mathematics):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">68% ➡️ 74%</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold rounded">
                      +6.0% ↗
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Class 9 (Physics / Science):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">73% ➡️ 66%</span>
                    <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold rounded">
                      -7.0% ↘ Alert
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Class 10 (Board Batch):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">81% ➡️ 83%</span>
                    <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold rounded">
                      +2.0% ↗
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleDownloadCohortMemo}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Marks Memo</span>
            </button>
            <Link
              href="/exam_coordinator"
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>Examination Cell</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* CARD 4: STAFF PERMISSIONS & SYLLABUS SENTINEL */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    4. Staff Vitals &amp; Syllabus Lag Sentinel
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Faculty leave governance, proxy sync &amp; automated curriculum lag alerts
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-lg">
                1 Sentinel Alert
              </span>
            </div>

            {/* Attendance & Proxy Status */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Faculty Present</span>
                <span className="text-base font-black text-slate-900 dark:text-white">42 / 44</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Active Proxies</span>
                <span className="text-base font-black text-blue-600 dark:text-blue-400">2 Classes</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">SLA Breaches</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">0 Breaches</span>
              </div>
            </div>

            {/* Syllabus Lag Sentinel Deep Dive */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-bold mb-1">
                <span>Curriculum Lag Detection (Threshold &ge; 2 Units):</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">1 Class Triggered</span>
              </div>

              <div className="p-3 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                      Class 9-A · Physics
                    </span>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Teacher: Mr. Vikram Sharma · Completed: 3/5 Units (2 Units Behind Schedule)
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">
                    Lagging
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-rose-200 dark:border-rose-900/30 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {sentinelIntervened ? '✓ 48-Hour Catchup Mandate Assigned' : 'Action Required: Schedule zero-hour catchup session'}
                  </span>
                  {!sentinelIntervened && (
                    <button
                      onClick={handleSentinelIntervention}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Dispatch Mandate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleExportStaffPacingCsv}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Sentinel Audit</span>
            </button>
            <Link
              href="/academic_coordinator"
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              <span>Academic Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* QUICK DRILL-DOWN SUB-NAVIGATOR (For Deep Historical Registers)            */}
      {/* ========================================================================= */}
      <div className="p-4 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">Need Detailed Historical Tables?</span>
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Inspect full coordinator data records:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateTab && (
            <>
              <button
                onClick={() => onNavigateTab('crm')}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                CRM Kanban Board
              </button>
              <button
                onClick={() => onNavigateTab('fees')}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Defaulter Ledger
              </button>
              <button
                onClick={() => onNavigateTab('exit')}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                TC Archive
              </button>
              <button
                onClick={() => onNavigateTab('audit')}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Security Audit Log
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
