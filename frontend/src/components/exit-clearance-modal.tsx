'use client';

import React, { useState } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  Check, 
  Upload, 
  Clock, 
  FileText, 
  AlertCircle,
  Lock,
  Stamp
} from 'lucide-react';
import { ExitClearance } from '@/lib/types';

interface ExitClearanceModalProps {
  clearance: ExitClearance;
  onVerifyPhysical?: () => Promise<void>;
  onDigitalSign?: () => Promise<void>;
  role: 'admin' | 'parent';
}

export function ExitClearanceView({ clearance, onVerifyPhysical, onDigitalSign, role }: ExitClearanceModalProps) {
  const [loading, setLoading] = useState(false);

  const handlePhysicalVerify = async () => {
    if (!onVerifyPhysical) return;
    setLoading(true);
    try {
      await onVerifyPhysical();
    } finally {
      setLoading(false);
    }
  };

  const handleDigitalSign = async () => {
    if (!onDigitalSign) return;
    setLoading(true);
    try {
      await onDigitalSign();
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = clearance.digital_parent_approved && clearance.physical_sign_verified;

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1 text-xs font-bold border border-slate-200 dark:border-slate-700">
              <FileCheck2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Transfer Certificate &amp; Handover Vault
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              isCompleted ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
            }`}>
              {isCompleted ? 'Dual Proof Locked in Legal Archive' : clearance.status}
            </span>
          </div>
          <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
            Exit Clearance: {clearance.student_name} ({clearance.class_name})
          </h3>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Lock className="h-3.5 w-3.5" />
            <span>Zero-Dispute Archive Active</span>
          </div>
        )}
      </div>

      {/* 4-Point Clearance Checklist */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          School Department Clearances
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Fee Dues</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1 flex items-center justify-center gap-1">
              <Check className="h-3.5 w-3.5" /> Cleared (₹0 Due)
            </span>
          </div>

          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Library Books</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1 flex items-center justify-center gap-1">
              <Check className="h-3.5 w-3.5" /> All Returned
            </span>
          </div>

          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Lab &amp; Sports</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1 flex items-center justify-center gap-1">
              <Check className="h-3.5 w-3.5" /> No Asset Dues
            </span>
          </div>

          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Original TC Ready</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1 flex items-center justify-center gap-1">
              <Check className="h-3.5 w-3.5" /> Sealed &amp; Stamped
            </span>
          </div>
        </div>
      </div>

      {/* Dual Verification Proofs (Digital Approval + Physical Handover Scan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Proof 1: Digital Parent Approval */}
        <div className={`rounded-xl border p-4 flex flex-col justify-between ${
          clearance.digital_parent_approved 
            ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20' 
            : 'border-amber-200 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Stamp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Proof 1: Digital Parent Sign-Off
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                clearance.digital_parent_approved ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                {clearance.digital_parent_approved ? 'Digitally Signed' : 'Pending Signature'}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Parent confirmation statement: &ldquo;I confirm receipt of original Transfer Certificate and final marks statement in good condition.&rdquo;
            </p>

            {clearance.digital_approval_timestamp && (
              <span className="mt-2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                Stamped: {clearance.digital_approval_timestamp}
              </span>
            )}
          </div>

          {role === 'parent' && !clearance.digital_parent_approved && (
            <button
              onClick={handleDigitalSign}
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
            >
              <Stamp className="h-3.5 w-3.5" />
              <span>{loading ? 'Signing...' : 'Provide In-App Digital Approval'}</span>
            </button>
          )}
        </div>

        {/* Proof 2: Scanned Physical Handover Register */}
        <div className={`rounded-xl border p-4 flex flex-col justify-between ${
          clearance.physical_sign_verified 
            ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20' 
            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Proof 2: Scanned Physical Handover Register
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                clearance.physical_sign_verified ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {clearance.physical_sign_verified ? 'Physical Scan Stored' : 'Pending Scan Upload'}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Official school register page with wet-ink parent signature and school stamp.
            </p>

            {clearance.physical_sign_verified && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>SHA-256 Verified Scan Document #TC-9921-REG</span>
              </div>
            )}
          </div>

          {role === 'admin' && !clearance.physical_sign_verified && (
            <button
              onClick={handlePhysicalVerify}
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{loading ? 'Uploading & Verifying...' : 'Upload & Verify Handover Scan'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
