'use client';

import React, { useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Users, 
  PhoneCall,
  Check,
  ShieldAlert
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
  const isGreen = alert.level === 'green';

  const statusConfig = isRed 
    ? {
        dot: 'bg-rose-500',
        label: 'Critical Triage',
        icon: AlertCircle,
        iconColor: 'text-rose-500'
      }
    : isOrange 
    ? {
        dot: 'bg-amber-500',
        label: 'Warning Alert',
        icon: AlertTriangle,
        iconColor: 'text-amber-500'
      }
    : {
        dot: 'bg-emerald-500',
        label: 'Scheduled Task',
        icon: CheckCircle2,
        iconColor: 'text-emerald-500'
      };

  const Icon = statusConfig.icon;

  const handleAct = async () => {
    setLoading(true);
    try {
      await onAction(alert);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 group">
      {/* Corner Status Indicator Mark */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5" title={statusConfig.label}>
        <span className={`h-2.5 w-2.5 rounded-full ${statusConfig.dot} ${isRed ? 'animate-pulse' : ''}`} />
      </div>

      <div className="flex flex-col justify-between h-full space-y-4">
        <div>
          {/* Header row: level badge with dot, category, affected count */}
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {alert.category}
              </span>
            </div>

            {alert.count_affected > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                <Users className="h-3 w-3 text-slate-400" />
                {alert.count_affected}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {alert.title}
          </h4>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {alert.description}
          </p>
        </div>

        {/* Action Button / Resolution Status */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          {alert.resolved ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 w-full">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{alert.resolution_note || 'Action Dispatched & Assigned'}</span>
            </div>
          ) : (
            <button
              onClick={handleAct}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all duration-200 active:scale-98 disabled:opacity-50 w-full cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Executing...
                </span>
              ) : (
                <>
                  <span>{alert.action_label}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
