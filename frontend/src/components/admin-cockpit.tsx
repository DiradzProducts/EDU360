'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Receipt,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  UserPlus,
  Clock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ExecutivePulseResponse, TriageAlert } from '@/lib/types';

interface AdminCockpitProps {
  onNavigateTab?: (tab: string) => void;
}

interface ActionQueueItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  severity: 'critical' | 'warning' | 'info';
  targetTab: string;
  actionLabel: string;
}

function formatINR(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function AdminCockpit({ onNavigateTab }: AdminCockpitProps) {
  const [pulse, setPulse] = useState<ExecutivePulseResponse | null>(null);
  const [alerts, setAlerts] = useState<TriageAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [pulseData, triageData] = await Promise.all([
        api.getExecutivePulse().catch(() => null),
        api.getTriageAlerts().catch(() => []),
      ]);
      if (pulseData) setPulse(pulseData);
      if (Array.isArray(triageData)) setAlerts(triageData);
    } catch (err) {
      console.error('Failed to load executive dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Derive live metrics cleanly from API responses
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);
  const criticalAlertsCount = unresolvedAlerts.filter((a) => a.level === 'red').length;

  const enrolled = pulse?.admissions.total_enrolled ?? 0;
  const capacity = pulse?.admissions.total_capacity ?? 180;
  const capacityPct = pulse?.admissions.capacity_percentage ?? 0;
  const newInquiries = pulse?.admissions.new_inflows_mtd ?? 0;

  const todayCollections = pulse?.accounts.today_collections ?? 0;
  const todayTxCount = pulse?.accounts.today_transactions_count ?? 0;
  const agingUnder30 = pulse?.accounts.aging.under_30_days ?? 0;
  const aging30to60 = pulse?.accounts.aging.days_30_to_60 ?? 0;
  const agingOver60 = pulse?.accounts.aging.over_60_days_critical ?? 0;
  const totalPendingFees = agingUnder30 + aging30to60 + agingOver60;

  const staffPresent = pulse?.staff_and_pacing.staff_present ?? 0;
  const staffTotal = pulse?.staff_and_pacing.staff_total ?? 0;
  const staffPct = pulse?.staff_and_pacing.attendance_pct ?? 0;
  const pacingLags = pulse?.staff_and_pacing.pacing_lag_alerts_count ?? 0;

  const pendingTCs = pulse?.quick_action_counts.pending_tcs ?? 0;
  const pendingPerms = pulse?.quick_action_counts.pending_staff_permissions ?? 0;
  const pendingWaivers = pulse?.quick_action_counts.pending_fee_waivers ?? 0;
  const totalApprovals = pendingTCs + pendingPerms + pendingWaivers;
  const totalAttentionCount = unresolvedAlerts.length + totalApprovals;

  // Build unified, compact "Needs Your Action" queue (max 6 clear rows)
  const actionQueue: ActionQueueItem[] = [
    ...unresolvedAlerts.slice(0, 4).map((alert) => ({
      id: `alert-${alert.id}`,
      title: alert.title,
      subtitle: alert.description,
      category: alert.category || 'Operations',
      severity: (alert.level === 'red' ? 'critical' : alert.level === 'orange' ? 'warning' : 'info') as 'critical' | 'warning' | 'info',
      targetTab:
        alert.category?.toLowerCase().includes('fee')
          ? 'fees'
          : alert.category?.toLowerCase().includes('leave')
            ? 'student_leaves'
            : 'triage',
      actionLabel: 'Review',
    })),
    ...(pendingTCs > 0
      ? [
          {
            id: 'pending-tcs',
            title: `${pendingTCs} Transfer Certificate ${pendingTCs === 1 ? 'Clearance' : 'Clearances'} Pending`,
            subtitle: 'Awaiting Principal dual-signature verification & dues check',
            category: 'Exit & TC',
            severity: 'warning' as const,
            targetTab: 'exit',
            actionLabel: 'Open TC',
          },
        ]
      : []),
    ...(pendingPerms > 0
      ? [
          {
            id: 'pending-perms',
            title: `${pendingPerms} Teacher Leave ${pendingPerms === 1 ? 'Request' : 'Requests'} Awaiting Approval`,
            subtitle: 'Verify substitute coverage and approve faculty permissions',
            category: 'Faculty',
            severity: 'warning' as const,
            targetTab: 'permissions',
            actionLabel: 'Review',
          },
        ]
      : []),
    ...(pendingWaivers > 0
      ? [
          {
            id: 'pending-waivers',
            title: `${pendingWaivers} Fee Concession ${pendingWaivers === 1 ? 'Application' : 'Applications'}`,
            subtitle: 'Hardship waiver requests pending executive sign-off',
            category: 'Accounts',
            severity: 'info' as const,
            targetTab: 'fees',
            actionLabel: 'Open Fees',
          },
        ]
      : []),
  ].slice(0, 6);

  const trajectory = pulse?.exams.trajectory?.slice(0, 4) ?? [];
  const gradeCapacities = pulse?.admissions.grade_capacities?.slice(0, 3) ?? [];
  const activeExams = pulse?.exams.active_exams ?? [];
  const upcomingExams = pulse?.exams.upcoming_exams ?? [];

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* =================================================================== */}
      {/* ZONE 1: CLEAN SINGLE-ROW EXECUTIVE HEADER (NO HEAVY BOX CHROME)     */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Principal Executive Cockpit
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            Academic Session 2026–27 · Term 2 · Dr. Sunita Kapoor
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            aria-label="Refresh dashboard data"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab?.('crm')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white font-bold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ZONE 2: 4 SCANNABLE KPI SUMMARY CARDS (ALL LIVE DATA)               */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Enrolled Students */}
        <button
          type="button"
          onClick={() => onNavigateTab?.('sis')}
          className="text-left p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-400 shadow-xs transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Enrolled Students
            </span>
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {loading && !pulse ? '—' : enrolled}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              / {capacity} seats
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
              {capacityPct}% filled
            </span>
            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
              {newInquiries} new inquiries
            </span>
          </div>
        </button>

        {/* KPI 2: Today's Fee Collections (Sophisticated Teal Accent) */}
        <button
          type="button"
          onClick={() => onNavigateTab?.('fees')}
          className="text-left p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 dark:hover:border-teal-400 shadow-xs transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Today&apos;s Fee Collections
            </span>
            <Receipt className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {loading && !pulse ? '—' : `₹${todayCollections.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-teal-600 dark:text-teal-400 tabular-nums">
              {todayTxCount} receipts today
            </span>
            <span className="font-semibold text-[#F97316] dark:text-[#FB923C] tabular-nums">
              {formatINR(agingOver60)} &gt;60d due
            </span>
          </div>
        </button>

        {/* KPI 3: Faculty Presence */}
        <button
          type="button"
          onClick={() => onNavigateTab?.('substitutions')}
          className="text-left p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-400 shadow-xs transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Faculty Presence
            </span>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {loading && !pulse ? '—' : `${staffPresent} / ${staffTotal}`}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              present
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
              {staffPct}% on duty
            </span>
            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
              {pacingLags > 0 ? `${pacingLags} pacing lag` : 'All classes covered'}
            </span>
          </div>
        </button>

        {/* KPI 4: Priority Alerts & Approvals (Warm Coral Focal Highlight) */}
        <button
          type="button"
          onClick={() => onNavigateTab?.('triage')}
          className={`text-left p-5 rounded-2xl border transition-colors cursor-pointer group ${
            totalAttentionCount > 0
              ? 'bg-amber-50/60 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/40 hover:border-amber-400 shadow-xs'
              : 'bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-blue-500 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs font-semibold ${
                totalAttentionCount > 0
                  ? 'text-amber-800 dark:text-amber-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Needs Attention
            </span>
            <AlertTriangle
              className={`h-4 w-4 ${
                totalAttentionCount > 0
                  ? 'text-[#F97316] dark:text-[#FB923C]'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
              aria-hidden="true"
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-extrabold tracking-tight tabular-nums ${
                totalAttentionCount > 0
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {loading && !pulse ? '—' : totalAttentionCount}
            </span>
            <span
              className={`text-xs font-medium ${
                totalAttentionCount > 0
                  ? 'text-amber-800 dark:text-amber-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              open items
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#B91C1C] dark:text-[#FCA5A5] tabular-nums">
              {criticalAlertsCount} critical
            </span>
            <span className="text-amber-800 dark:text-amber-300 tabular-nums">
              {totalApprovals} approvals pending
            </span>
          </div>
        </button>
      </div>

      {/* =================================================================== */}
      {/* ZONE 3: FOCUSED 2-COLUMN WORKSPACE (65% ACTION QUEUE / 35% PULSE)   */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT (7 cols): UNIFIED PRIORITY ACTION QUEUE */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Priority Action Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Top alerts and executive approvals requiring review today
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.('triage')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0"
            >
              <span>All Alerts</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {actionQueue.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" aria-hidden="true" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                All clear — no urgent items pending
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attendance, fees, and faculty clearances are up to date.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider">
                    <th className="py-3 px-5">Action Item</th>
                    <th className="py-3 px-4">Area</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-5 text-right">Go</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B] text-[13px]">
                  {actionQueue.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => onNavigateTab?.(item.targetTab)}
                      className="cursor-pointer"
                    >
                      <td className="py-3.5 px-5 max-w-[340px]">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.severity === 'critical'
                              ? 'edu-badge-critical'
                              : item.severity === 'warning'
                                ? 'edu-badge-warning'
                                : 'edu-badge-info'
                          }`}
                        >
                          {item.severity === 'critical'
                            ? 'Critical'
                            : item.severity === 'warning'
                              ? 'Needs Review'
                              : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTab?.(item.targetTab);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <span>{item.actionLabel}</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT (5 cols): COMPACT SCHOOL SNAPSHOT (FEES + ACADEMICS + EXAMS) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card A: Pending Fees Breakdown (Clean Single Strip) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Fee Dues Summary
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  Total outstanding: {formatINR(totalPendingFees)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab?.('fees')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <span>Fee Ledger</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="block text-xs text-slate-500 dark:text-slate-400">&lt;30 Days</span>
                <span className="block text-base font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                  {formatINR(agingUnder30)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFF7ED] dark:bg-[#2A190E] border border-[#FED7AA] dark:border-[#7C2D12]">
                <span className="block text-xs font-medium text-amber-800 dark:text-amber-300">30–60 Days</span>
                <span className="block text-base font-extrabold text-amber-700 dark:text-amber-300 mt-1 tabular-nums">
                  {formatINR(aging30to60)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-[#2B1517] border border-[#FECACA] dark:border-[#7F1D1D]">
                <span className="block text-xs font-medium text-[#B91C1C] dark:text-[#FCA5A5]">&gt;60 Days</span>
                <span className="block text-base font-extrabold text-[#991B1B] dark:text-[#FECACA] mt-1 tabular-nums">
                  {formatINR(agingOver60)}
                </span>
              </div>
            </div>
          </div>

          {/* Card B: Class Pacing & Exams */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Academic &amp; Exam Pulse
              </h2>
              <button
                type="button"
                onClick={() => onNavigateTab?.('exams')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <span>Open Exams</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Academic Trajectory or Class Occupancy Bars */}
            <div className="space-y-3">
              {trajectory.length > 0
                ? trajectory.map((item, idx) => {
                    const pct = Math.min(100, Math.max(0, Math.round(item.current_avg)));
                    const isPositive = item.change_pct >= 0;
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {item.class_name}
                          </span>
                          <span className="tabular-nums font-semibold text-slate-500 dark:text-slate-400">
                            {item.current_avg}%{' '}
                            <span
                              className={
                                isPositive
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-[#F97316] dark:text-[#FB923C]'
                              }
                            >
                              ({isPositive ? '+' : ''}
                              {item.change_pct}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isPositive ? 'bg-[#2563EB] dark:bg-[#3B82F6]' : 'bg-[#F97316] dark:bg-[#FB923C]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                : gradeCapacities.map((g, idx) => {
                    const pct = g.capacity > 0 ? Math.round((g.enrolled / g.capacity) * 100) : 0;
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {g.grade}
                          </span>
                          <span className="tabular-nums text-slate-500 dark:text-slate-400">
                            {g.enrolled} / {g.capacity} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#2563EB] dark:bg-[#3B82F6]"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
            </div>

            {/* Active / Upcoming Exams Compact List */}
            {(activeExams.length > 0 || upcomingExams.length > 0) && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                {activeExams.slice(0, 2).map((exam, i) => (
                  <div key={`act-${i}`} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white truncate">
                      <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {exam.class_name} · {exam.subject}
                      </span>
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0 ml-2">
                      {exam.time || 'Today'}
                    </span>
                  </div>
                ))}
                {upcomingExams.slice(0, 2).map((exam, i) => (
                  <div key={`up-${i}`} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 truncate">
                      <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {exam.class_name} · {exam.subject}
                      </span>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                      {exam.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
