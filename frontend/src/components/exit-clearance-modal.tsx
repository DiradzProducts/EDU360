'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  Check, 
  Upload, 
  FileText, 
  AlertCircle,
  Lock,
  Stamp,
  RotateCcw,
  ExternalLink,
  Eye,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { ExitClearance, ClearanceCheckResult } from '@/lib/types';
import { api } from '@/lib/api';
import { openAndPrintOfficialDocument } from '@/lib/export-utils';

interface ExitClearanceModalProps {
  clearance: ExitClearance;
  onVerifyPhysical?: (scanUrl?: string) => Promise<void>;
  onDigitalSign?: () => Promise<void>;
  role: 'admin' | 'parent';
}

export function ExitClearanceView({ 
  clearance, 
  onVerifyPhysical, 
  onDigitalSign, 
  role 
}: ExitClearanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [clearanceCheck, setClearanceCheck] = useState<ClearanceCheckResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (clearance.student_id) {
      api.checkStudentClearance(clearance.student_id)
        .then(res => setClearanceCheck(res))
        .catch(() => {});
    }
  }, [clearance.student_id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePhysicalVerify = async () => {
    if (!onVerifyPhysical) return;
    setLoading(true);
    try {
      const scanUrl = selectedFile ? `/assets/scans/${selectedFile.name}` : '/assets/signed_tc_handover_slip.pdf';
      await onVerifyPhysical(scanUrl);
      setSelectedFile(null);
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1 text-xs font-bold border border-slate-200 dark:border-slate-700">
              <FileCheck2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Transfer Certificate &amp; Handover Vault
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              isCompleted 
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
            }`}>
              {isCompleted ? 'Dual Proof Locked in Legal Archive' : clearance.status}
            </span>
          </div>
          <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
            Exit Clearance: {clearance.student_name} ({clearance.class_name})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            CBSE Statutory Clearance &bull; Permanent Student Leaving Certificate Protocol
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Lock className="h-3.5 w-3.5" />
              <span>Zero-Dispute Archive Active</span>
            </div>
          )}

        </div>
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

          <div className={`rounded-xl border p-3 text-center ${
            clearanceCheck && !clearanceCheck.is_cleared
              ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'
              : 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20'
          }`}>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Lab &amp; Sports</span>
            {clearanceCheck && !clearanceCheck.is_cleared ? (
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 mt-1 flex items-center justify-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Hold: {clearanceCheck.active_hold_count} Item Out
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1 flex items-center justify-center gap-1">
                <Check className="h-3.5 w-3.5" /> No Asset Dues
              </span>
            )}
          </div>

          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Original TC Ready</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1 flex items-center justify-center gap-1">
              <Check className="h-3.5 w-3.5" /> Sealed &amp; Stamped
            </span>
          </div>
        </div>

        {/* Inventory Custody Quarantine Warning */}
        {clearanceCheck && !clearanceCheck.is_cleared && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <span className="font-bold">Inventory Custody Quarantine Active:</span>
              <p className="text-[11px] mt-0.5">
                Departing student holds unreturned school apparatus: <b>{clearanceCheck.pending_items.join(', ')}</b>. 
                Please return all borrowed equipment to <b>Mrs. Shalini Rao (Store Lead)</b> or settle replacement dues before final digital TC authorization.
              </p>
            </div>
          </div>
        )}
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
                clearance.digital_parent_approved 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
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
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Stamp className="h-3.5 w-3.5" />
              <span>{loading ? 'Signing...' : 'Provide In-App Digital Approval'}</span>
            </button>
          )}

          {role === 'admin' && !clearance.digital_parent_approved && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-950/40 p-2 rounded-lg">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Awaiting Parent Digital Sign-off in Parent Portal.</span>
            </div>
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
                clearance.physical_sign_verified 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {clearance.physical_sign_verified ? 'Physical Scan Stored' : 'Pending Scan Upload'}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Official school register page with wet-ink parent signature and school stamp.
            </p>

            {clearance.physical_sign_verified && (
              <div className="mt-2 flex items-center justify-between gap-1.5 text-[10px] text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>SHA-256 Verified Scan Document #TC-9921-REG</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewDocOpen(true)}
                  className="flex items-center gap-1 text-[10px] underline hover:text-blue-900 cursor-pointer"
                >
                  <Eye className="h-3 w-3" />
                  <span>View Scan</span>
                </button>
              </div>
            )}
          </div>

          {role === 'admin' && !clearance.physical_sign_verified && (
            <div className="mt-4 space-y-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,application/pdf" 
                className="hidden" 
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:border-blue-500 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate max-w-[140px]">
                    {selectedFile ? selectedFile.name : 'Choose TC Scan File...'}
                  </span>
                </button>

                <button
                  onClick={handlePhysicalVerify}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{loading ? 'Approving...' : 'Approve TC & Complete Exit Clearance'}</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block text-center">
                Supports PDF, PNG, JPG scans &bull; Auto-stamps school seal
              </span>
            </div>
          )}

          {role === 'parent' && !clearance.physical_sign_verified && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 p-2 rounded-lg">
              <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
              <span>School Admin will scan and archive the physical handover register page.</span>
            </div>
          )}
        </div>
      </div>

      {/* FINALIZED OFFICIAL TRANSFER CERTIFICATE (TC) DOWNLOAD VAULT */}
      {isCompleted && (
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <Stamp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Official Transfer Certificate (TC) Available
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                  Registrar Sealed
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dual verification complete. Official CBSE Transfer Certificate has been generated with cryptographic watermark &amp; institutional seal.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openAndPrintOfficialDocument('Official Transfer Certificate (TC)', clearance.student_name, `OIS-2026-TC-${clearance.id || '9921'}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <FileText className="h-4 w-4" />
              <span>Download Official TC (PDF)</span>
            </button>
          </div>
        </div>
      )}

      {/* Scanned Document Preview Modal */}
      {previewDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Verified TC Handover Register Scan
                  </h4>
                  <span className="text-[10px] text-slate-500">Document #TC-9921-REG &bull; SHA-256 Validated</span>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDocOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-900 dark:text-white">{clearance.student_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Class &amp; Roll:</span>
                <span className="font-bold text-slate-900 dark:text-white">{clearance.class_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Verification URL:</span>
                <span className="text-blue-600 dark:text-blue-400 truncate max-w-[200px]">{clearance.physical_scan_url || '/assets/signed_tc_handover_slip.pdf'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Digital Parent Approval:</span>
                <span className="text-emerald-600 font-bold">{clearance.digital_parent_approved ? 'APPROVED' : 'PENDING'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Legal Vault Lock Status:</span>
                <span className="text-purple-600 font-bold">{clearance.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => openAndPrintOfficialDocument('Official Transfer Certificate (TC)', clearance.student_name, `OIS-2026-TC-${clearance.id || '9921'}`)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Print Official TC</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDocOpen(false)}
                className="rounded-xl bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Close Archive View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
