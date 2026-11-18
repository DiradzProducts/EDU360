'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  X, 
  Building2, 
  Clock, 
  FileText, 
  Paperclip, 
  Upload, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { AdmissionEnquiry, DocumentUploadItem } from '@/lib/types';
import { api } from '@/lib/api';

export interface ConfirmEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: AdmissionEnquiry | null;
  onSuccess: (credentials: any, message?: string) => void;
}

export function ConfirmEnrollmentModal({
  isOpen,
  onClose,
  enquiry,
  onSuccess
}: ConfirmEnrollmentModalProps) {
  const [enrollSection, setEnrollSection] = useState<string>('Section A');
  const [enrollFeeStatus, setEnrollFeeStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [enrollPaymentMethod, setEnrollPaymentMethod] = useState<string>('UPI Transfer');
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Intake Documents Verification & Upload State
  const [enrollDocReportCard, setEnrollDocReportCard] = useState<boolean>(true);
  const [reportCardFileName, setReportCardFileName] = useState<string>('');
  const [enrollDocBirthCert, setEnrollDocBirthCert] = useState<boolean>(true);
  const [birthCertFileName, setBirthCertFileName] = useState<string>('');
  const [enrollDocTransferCert, setEnrollDocTransferCert] = useState<boolean>(false);
  const [tcFileName, setTcFileName] = useState<string>('');
  const [tcUndertaking, setTcUndertaking] = useState<boolean>(false);

  // Reset or initialize state when enquiry changes or modal opens
  useEffect(() => {
    if (enquiry) {
      setEnrollSection('Section A');
      setEnrollFeeStatus('Paid');
      setEnrollPaymentMethod('UPI Transfer');
      setEnrollDocReportCard(true);
      setReportCardFileName('');
      setEnrollDocBirthCert(true);
      setBirthCertFileName('');
      setEnrollDocTransferCert(false);
      setTcFileName('');
      setTcUndertaking(false);
      setErrorMessage(null);
    }
  }, [enquiry, isOpen]);

  if (!isOpen || !enquiry) return null;

  const docSlug = (enquiry.student_name || 'student').toLowerCase().replace(/\s+/g, '_');
  const rollNo = `ADM-2026-08${String(enquiry.id).padStart(2, '0')}`;

  const handleConfirmEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry) return;
    setErrorMessage(null);
    setIsEnrolling(true);

    try {
      // 1. Update intake document verification on inquiry
      try {
        await api.updateEnquiryDocs(enquiry.id, {
          doc_report_card: enrollDocReportCard,
          doc_birth_cert: enrollDocBirthCert,
          doc_transfer_cert: enrollDocTransferCert || tcUndertaking
        });
      } catch (docErr) {
        console.warn('Doc status update non-fatal:', docErr);
      }

      // 2. Construct uploaded intake documents list for SIS Registry Vault
      const uploadedDocs: DocumentUploadItem[] = [];

      if (enrollDocReportCard) {
        uploadedDocs.push({
          title: `Previous Grade Academic Record - ${enquiry.student_name}`,
          doc_type: 'Marks Card',
          filename: reportCardFileName || `report_card_${docSlug}.pdf`,
          file_url: `/documents/report_card_${docSlug}.pdf`
        });
      }

      if (enrollDocBirthCert) {
        uploadedDocs.push({
          title: `Government Birth Certificate & Identity Proof - ${enquiry.student_name}`,
          doc_type: 'Birth Certificate',
          filename: birthCertFileName || `birth_cert_${docSlug}.pdf`,
          file_url: `/documents/birth_cert_${docSlug}.pdf`
        });
      }

      if (enrollDocTransferCert) {
        uploadedDocs.push({
          title: `Transfer Certificate (Incoming TC Deposited) - ${enquiry.student_name}`,
          doc_type: 'Transfer Certificate',
          filename: tcFileName || `tc_${docSlug}.pdf`,
          file_url: `/documents/tc_${docSlug}.pdf`
        });
      }

      // 3. Convert to student in SIS
      const res: any = await api.convertEnquiryToStudent(enquiry.id, {
        section: enrollSection,
        feeAmount: 25000,
        feeStatus: enrollFeeStatus,
        paymentMethod: enrollFeeStatus === 'Paid' ? enrollPaymentMethod : undefined,
        uploadedDocs,
        tcUndertaking
      });

      // Formulate credentials object
      const cleanStudent = (enquiry.student_name || 'student').toLowerCase().replace(/\s+/g, '_');
      const cleanParent = (enquiry.parent_name || 'parent').toLowerCase().replace(/\s+/g, '_');
      const creds = res?.credentials || {
        student_name: enquiry.student_name,
        student_username: `${cleanStudent}_${enquiry.id + 30}`,
        student_password: 'Password123',
        student_roll: `${enquiry.id + 30}`,
        student_class: `${enquiry.target_grade || 'Class 8'}-${enrollSection.replace(/Section\s*/i, '').trim() || 'A'}`,
        student_admission_no: `EDU-2026-${enquiry.id + 100}`,
        parent_name: enquiry.parent_name,
        parent_username: `parent_${cleanParent}_${enquiry.id + 30}`,
        parent_password: 'Password123',
        parent_phone: enquiry.phone || ''
      };

      onClose();
      onSuccess(creds, res?.message || `${enquiry.student_name} officially enrolled into SIS! Documents routed to Admin Vault.`);
    } catch (err: any) {
      console.error('Enrollment failed:', err);
      setErrorMessage(err?.message || err?.detail || 'Enrollment request failed. Please check network connection and try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* FIXED STICKY HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Confirm Official SIS Enrollment
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enrolling <span className="font-bold text-slate-800 dark:text-slate-200">{enquiry.student_name}</span> • {enquiry.target_grade || 'Class 8'} • Generated Roll No: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{rollNo}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <form onSubmit={handleConfirmEnrollment} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold">Enrollment Failed</div>
                  <div className="text-[11px] opacity-90">{errorMessage}</div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* LEFT COLUMN: Section Allocation & Fee Setup */}
              <div className="space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>1. Academic &amp; Fee Allocation</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Allocated Section *
                    </label>
                    <select
                      value={enrollSection}
                      onChange={(e) => setEnrollSection(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Section A">Section A (Room 201)</option>
                      <option value="Section B">Section B (Room 202)</option>
                      <option value="Section C">Section C (Room 203)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Admission Fee Status (₹25,000) *
                    </label>
                    <select
                      value={enrollFeeStatus}
                      onChange={(e) => setEnrollFeeStatus(e.target.value as 'Paid' | 'Pending')}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Paid">Term 1 Fee Paid ✓</option>
                      <option value="Pending">Payment Pending Invoice</option>
                    </select>
                  </div>

                  {/* Dynamic Payment Mode */}
                  {enrollFeeStatus === 'Paid' ? (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Payment Mode Recorded *
                      </label>
                      <select
                        value={enrollPaymentMethod}
                        onChange={(e) => setEnrollPaymentMethod(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
                      >
                        <option value="UPI Transfer">Direct Bank UPI (Instant Receipt)</option>
                        <option value="Cheque / DD">Bank Demand Draft / Cheque</option>
                        <option value="Card Payment">Campus Card Terminal</option>
                        <option value="Cash at Front Desk">Cash Received at Front Desk</option>
                      </select>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 space-y-1 animate-in fade-in duration-150">
                      <span className="font-bold flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        Fee Invoice Dispatched to Accounts Desk
                      </span>
                      <span className="text-[10.5px] leading-relaxed block">
                        Payment mode is hidden because payment is pending. An invoice (₹25,000) will be routed to Accounts Coordinator for follow-up.
                      </span>
                    </div>
                  )}

                  {/* Compact System Actions Pill */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">✓ Automated System Actions:</span>
                    <div className="text-[10.5px] space-y-0.5">
                      <div>• Generates permanent SIS record &amp; Timetable access</div>
                      <div>• Stage automatically shifts to &apos;converted&apos;</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Intake Documents Vault */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    <span>2. Mandatory Intake Documents</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    Requires Admin Seal
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* 1. Academic Report Card */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={enrollDocReportCard}
                          onChange={(e) => setEnrollDocReportCard(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>Previous Academic Report Card</span>
                      </label>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Mandatory</span>
                    </div>
                    {enrollDocReportCard && (
                      <div className="flex items-center justify-between gap-2 pt-1 pl-5">
                        <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate">
                          <Paperclip className="h-3 w-3 shrink-0" />
                          <span className="truncate">{reportCardFileName || `report_card_${docSlug}.pdf`}</span>
                        </div>
                        <label className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1 shrink-0">
                          <Upload className="h-2.5 w-2.5" />
                          <span>Browse</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) setReportCardFileName(e.target.files[0].name);
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 2. Birth Certificate */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={enrollDocBirthCert}
                          onChange={(e) => setEnrollDocBirthCert(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>Government Birth Certificate / ID</span>
                      </label>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Statutory</span>
                    </div>
                    {enrollDocBirthCert && (
                      <div className="flex items-center justify-between gap-2 pt-1 pl-5">
                        <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate">
                          <Paperclip className="h-3 w-3 shrink-0" />
                          <span className="truncate">{birthCertFileName || `birth_cert_${docSlug}.pdf`}</span>
                        </div>
                        <label className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1 shrink-0">
                          <Upload className="h-2.5 w-2.5" />
                          <span>Browse</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) setBirthCertFileName(e.target.files[0].name);
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 3. Transfer Certificate */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={enrollDocTransferCert}
                          onChange={(e) => {
                            setEnrollDocTransferCert(e.target.checked);
                            if (e.target.checked) setTcUndertaking(false);
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>Original Transfer Certificate (TC) Deposited</span>
                      </label>
                    </div>

                    {enrollDocTransferCert ? (
                      <div className="flex items-center justify-between gap-2 pt-1 pl-5">
                        <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate">
                          <Paperclip className="h-3 w-3 shrink-0" />
                          <span className="truncate">{tcFileName || `tc_${docSlug}.pdf`}</span>
                        </div>
                        <label className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1 shrink-0">
                          <Upload className="h-2.5 w-2.5" />
                          <span>Browse</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) setTcFileName(e.target.files[0].name);
                            }}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="pl-5 pt-0.5 space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer text-amber-700 dark:text-amber-400 font-medium">
                          <input
                            type="checkbox"
                            checked={tcUndertaking}
                            onChange={(e) => setTcUndertaking(e.target.checked)}
                            className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>Parent signed 30-Day Provisional TC Undertaking</span>
                        </label>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          Allows provisional admission while previous school processes TC dispatch. Flagged for Admin registry tracking.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Dual-Gate: Forwarded to Admin Vault for Principal Inspection &amp; Seal.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* STICKY FOOTER */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEnrolling}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <UserCheck className="h-4 w-4" />
              <span>{isEnrolling ? 'Enrolling...' : 'Confirm & Issue SIS Roll Number'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
