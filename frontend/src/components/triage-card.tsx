'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Users,
  Check,
} from 'lucide-react';
import { TriageAlert } from '@/lib/types';

interface TriageCardProps {
  alert: TriageAlert;
  onAction: (alert: TriageAlert) => Promise<void>;
}

export function TriageCard({ alert, onAction }: TriageCardProps) {
  const [loading, setLoading] = useState(false);

  const isRed = alert.level === 'red';
  const isOrange = alert.level === 'orange';

  const severity = alert.resolved
    ? {
        border: 'border-l-[#0D9488] dark:border-l-[#14B8A6]',
        badge: 'edu-badge-teal',
        label: 'Resolved',
        icon: CheckCircle2,
        iconColor: 'text-[#38BDF8]',
      }
    : isRed
      ? {
          border: 'border-l-[#DC2626] dark:border-l-[#EF4444]',
          badge: 'edu-badge-critical',
          label: 'Critical',
          icon: AlertCircle,
          iconColor: 'text-[#DC2626] dark:text-[#FCA5A5]',
        }
      : isOrange
        ? {
            border: 'border-l-[#F97316] dark:border-l-[#FB923C]',
            badge: 'edu-badge-warning',
            label: 'Warning',
            icon: AlertTriangle,
            iconColor: 'text-[#F97316] dark:text-[#FB923C]',
          }
        : {
            border: 'border-l-[#2563EB] dark:border-l-[#3B82F6]',
            badge: 'edu-badge-info',
            label: 'Scheduled',
            icon: CheckCircle2,
            iconColor: 'text-[#2563EB]',
          };

  const Icon = severity.icon;

  const handleAct = async () => {
    setLoading(true);
    try {
      await onAction(alert);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] border-l-4 ${severity.border} bg-[#FFFFFF] px-5 py-4 transition-colors hover:border-[#CBD5E1] dark:hover:border-[#334155]`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Severity + Context */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${severity.badge}`}>
              <Icon className={`h-3.5 w-3.5 ${severity.iconColor}`} aria-hidden="true" />
              {severity.label}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
              {alert.category}
            </span>
            {alert.count_affected > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] px-2 py-0.5 text-xs font-semibold text-[#475569] tabular-nums">
                <Users className="h-3 w-3 text-[#475569]" aria-hidden="true" />
                {alert.count_affected} affected
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold text-[#0F172A] leading-snug">
            {alert.title}
          </h4>
          <p className="text-[13px] text-[#475569] leading-relaxed max-w-3xl">
            {alert.description}
          </p>
        </div>

        {/* Right: Single Compact Action / Resolution Status */}
        <div className="shrink-0 flex items-center sm:justify-end">
          {alert.resolved ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#38BDF8] dark:text-[#5EEAD4] bg-[#F0FDFA] dark:bg-[#38BDF8]/20 px-3 py-2 rounded-xl border border-[#38BDF8]/40">
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{alert.resolution_note || 'Dispatched'}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAct}
              disabled={loading}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap ${
                isRed
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
                  : isOrange
                    ? 'bg-[#F97316] hover:bg-[#EA580C] text-white'
                    : 'bg-[#2563EB] hover:bg-[#3B82F6] text-[#FFFFFF] font-extrabold'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Working...
                </span>
              ) : (
                <>
                  <span>{alert.action_label}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
