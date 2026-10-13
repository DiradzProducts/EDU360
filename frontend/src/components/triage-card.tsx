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

  const theme = isRed 
    ? {
        border: 'border-red-200 hover:border-red-300',
        bg: 'bg-red-50/40',
        badge: 'bg-red-100 text-red-700 border-red-200',
        icon: AlertCircle,
        iconColor: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700 text-white',
        accentBar: 'bg-red-500'
      }
    : isOrange 
    ? {
        border: 'border-amber-200 hover:border-amber-300',
        bg: 'bg-amber-50/40',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: AlertTriangle,
        iconColor: 'text-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700 text-white',
        accentBar: 'bg-amber-500'
      }
    : {
        border: 'border-emerald-200 hover:border-emerald-300',
        bg: 'bg-emerald-50/40',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: CheckCircle2,
        iconColor: 'text-emerald-600',
        button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        accentBar: 'bg-emerald-500'
      };

  const Icon = theme.icon;

  const handleAct = async () => {
    setLoading(true);
    try {
      await onAction(alert);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${theme.border} ${theme.bg} p-5 shadow-sm transition-all duration-200 hover:shadow-md`}>
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.accentBar}`} />

      <div className="flex flex-col justify-between h-full space-y-4">
        <div>
          {/* Header row: level badge, category, affected count */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${theme.badge}`}>
                <Icon className="h-3 w-3" />
                {isRed ? '🔴 Critical Triage' : isOrange ? '🟠 Warning Alert' : '🟢 Scheduled Task'}
              </span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {alert.category}
              </span>
            </div>

            {alert.count_affected > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200">
                <Users className="h-3 w-3 text-slate-500" />
                {alert.count_affected} Affected
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h4 className="mt-3 text-sm font-bold text-slate-900 leading-snug">
            {alert.title}
          </h4>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
            {alert.description}
          </p>
        </div>

        {/* Action Button / Resolution Status */}
        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3">
          {alert.resolved ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-full">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{alert.resolution_note || 'Action Dispatched & Assigned'}</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleAct}
                disabled={loading}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 w-full ${theme.button}`}
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Executing...
                  </span>
                ) : (
                  <>
                    <span>{alert.action_label}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
