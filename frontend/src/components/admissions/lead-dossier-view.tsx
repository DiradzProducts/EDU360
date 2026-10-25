'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Phone,
  Mail,
  Copy,
  Check,
  Calendar,
  Flame,
  Sun,
  Snowflake,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  User,
  GraduationCap,
  Building2,
  Sparkles,
  X,
  Send,
  History,
  MessageSquare,
  ExternalLink,
  Plus,
  UserX,
  RotateCcw,
  Upload,
  Paperclip,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { AdmissionEnquiry, DocumentUploadItem } from '@/lib/types';

interface LeadDossierViewProps {
  enquiryId: number;
  backUrl: string;
  role: 'admissions_coordinator' | 'admin';
}

interface ParsedCallLog {
  id: string;
  timestamp: string;
  outcome: string;
  note: string;
}

export function LeadDossierView({ enquiryId, backUrl, role }: LeadDossierViewProps) {
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);

  // Quick Call Logger Form State
  const [callOutcome, setCallOutcome] = useState<string>('Connected - Positive');
  const [callNote, setCallNote] = useState<string>('');
  const [callNextDate, setCallNextDate] = useState<string>('');
  const [isSubmittingLog, setIsSubmittingLog] = useState<boolean>(false);

  // Drop Lead Modal State
  const [showDropModal, setShowDropModal] = useState<boolean>(false);
  const [standaloneDropReason, setStandaloneDropReason] = useState<string>('Fee Structure High');
  const [standaloneDropNote, setStandaloneDropNote] = useState<string>('');
  const [isDropping, setIsDropping] = useState<boolean>(false);

  // Conversion / Enrollment Modal State
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [enrollSection, setEnrollSection] = useState<string>('Section A');
  const [enrollFeeStatus, setEnrollFeeStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [enrollPaymentMethod, setEnrollPaymentMethod] = useState<string>('UPI Transfer');
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);

  // Intake Documents Verification & Upload State
  const [enrollDocReportCard, setEnrollDocReportCard] = useState<boolean>(true);
  const [reportCardFileName, setReportCardFileName] = useState<string>('');
  const [enrollDocBirthCert, setEnrollDocBirthCert] = useState<boolean>(true);
  const [birthCertFileName, setBirthCertFileName] = useState<string>('');
  const [enrollDocTransferCert, setEnrollDocTransferCert] = useState<boolean>(false);
  const [tcFileName, setTcFileName] = useState<string>('');
  const [tcUndertaking, setTcUndertaking] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadEnquiry = async () => {
    setLoading(true);
    try {
      const data = await api.getEnquiryById(enquiryId);
      if (data) {
        setEnquiry(data);
        if (data.next_followup_date) {
          setCallNextDate(data.next_followup_date);
        }
      }
    } catch (err) {
      console.error('Failed to load lead dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiry();
  }, [enquiryId]);

  // Lock body background scrolling when either modal is active
  useEffect(() => {
    if (showEnrollModal || showDropModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showEnrollModal, showDropModal]);

  // Copy Phone Number
  const handleCopyPhone = () => {
    if (!enquiry?.phone) return;
    navigator.clipboard.writeText(enquiry.phone);
    setCopiedPhone(true);
    triggerToast(`Phone ${enquiry.phone} copied to clipboard!`);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Temperature Cycle: hot -> warm -> cold -> hot
  const handleCycleTemperature = async () => {
    if (!enquiry) return;
    const current = enquiry.lead_temperature || 'warm';
    const nextMap: Record<string, 'hot' | 'warm' | 'cold'> = {
      hot: 'warm',
      warm: 'cold',
      cold: 'hot'
    };
    const nextTemp = nextMap[current] || 'warm';

    try {
      await api.updateEnquiryTemperature(enquiry.id, nextTemp);
      setEnquiry(prev => prev ? { ...prev, lead_temperature: nextTemp } : null);
      triggerToast(`Lead priority updated to ${nextTemp.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to update temperature:', err);
      triggerToast('Failed to update lead temperature.');
    }
  };

  // Submit Call Interaction Log
  const handleAddCallLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || !callNote.trim()) return;

    setIsSubmittingLog(true);
    try {
      await api.logCallOutcome(enquiry.id, {
        outcome: callOutcome,
        note: callNote.trim(),
        next_followup_date: callNextDate || undefined,
        stage: 'followup'
      });

      setCallNote('');
      await loadEnquiry();
      triggerToast('Call interaction logged & timeline updated.');
    } catch (err) {
      console.error('Failed to save call log:', err);
      triggerToast('Failed to save log. Please try again.');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Drop Lead Action
  const handleConfirmDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry) return;
    setIsDropping(true);

    try {
      await api.dropEnquiry(enquiry.id, standaloneDropReason, standaloneDropNote.trim());
      await loadEnquiry();
      setShowDropModal(false);
      triggerToast(`Lead #${enquiry.id} marked as dropped (${standaloneDropReason}).`);
    } catch (err) {
      console.error('Failed to drop lead:', err);
      triggerToast('Failed to drop lead.');
    } finally {
      setIsDropping(false);
    }
  };

  // Reopen Dropped Lead Action
  const handleReopenLead = async () => {
    if (!enquiry) return;
    try {
      await api.updateEnquiryStage(enquiry.id, 'followup');
      await loadEnquiry();
      triggerToast(`Lead #${enquiry.id} restored to Active Pipeline!`);
    } catch (err) {
      console.error('Failed to reopen lead:', err);
      triggerToast('Failed to reopen lead.');
    }
  };

  // Confirm Official SIS Enrollment
  const handleConfirmEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry) return;
    setIsEnrolling(true);

    try {
      // 1. Save document intake verification on inquiry
      await api.updateEnquiryDocs(enquiry.id, {
        doc_report_card: enrollDocReportCard,
        doc_birth_cert: enrollDocBirthCert,
        doc_transfer_cert: enrollDocTransferCert || tcUndertaking
      });

      // 2. Construct uploaded intake documents list for SIS Registry Vault
      const uploadedDocs: DocumentUploadItem[] = [];
      const docSlug = enquiry.student_name.toLowerCase().replace(/\s+/g, '_');

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

      // 3. Convert to student in SIS - route fee to Accounts Desk & docs to Admin Vault
      const res: any = await api.convertEnquiryToStudent(enquiry.id, {
        section: enrollSection,
        feeStatus: enrollFeeStatus,
        paymentMethod: enrollFeeStatus === 'Paid' ? enrollPaymentMethod : undefined,
        uploadedDocs,
        tcUndertaking
      });

      setShowEnrollModal(false);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}

      await loadEnquiry();
      triggerToast(res?.message || `${enquiry.student_name} officially enrolled into SIS! Documents routed to Admin Vault.`);
    } catch (err) {
      console.error('Enrollment failed:', err);
      triggerToast('Failed to enroll student into SIS.');
    } finally {
      setIsEnrolling(false);
    }
  };

  // Parse notes string into structured chronological timeline
  const interactionHistory: ParsedCallLog[] = useMemo(() => {
    if (!enquiry?.notes) return [];

    const segments = enquiry.notes.split(/\n|\|(?=\s*\[)/);
    const parsed: ParsedCallLog[] = [];

    segments.forEach((seg, idx) => {
      const trimmed = seg.trim();
      if (!trimmed) return;

      const bracketMatch = trimmed.match(/^\[([^\]]+)\]\s*(.*)$/);
      if (bracketMatch) {
        const meta = bracketMatch[1];
        const body = bracketMatch[2];
        const parts = meta.split('|').map(s => s.trim());
        const timestamp = parts[0] || 'Earlier Interaction';
        const outcome = parts[1] || 'Call Note';

        parsed.unshift({
          id: `log-${idx}`,
          timestamp,
          outcome,
          note: body || trimmed
        });
      } else {
        parsed.unshift({
          id: `log-${idx}`,
          timestamp: 'General Interaction',
          outcome: 'Logged Note',
          note: trimmed
        });
      }
    });

    return parsed;
  }, [enquiry?.notes]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        <span className="text-xs font-semibold text-slate-500">Loading candidate dossier...</span>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-12 w-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lead Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested student enquiry ID could not be loaded.</p>
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to {role === 'admin' ? 'Admin CRM' : 'Calling Queue'}</span>
        </Link>
      </div>
    );
  }

  const isConverted = enquiry.stage === 'converted';
  const isDropped = enquiry.stage === 'dropped';
  const temp = enquiry.lead_temperature || 'warm';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href={backUrl}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {enquiry.student_name}
              </h1>
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold">
                {enquiry.target_grade}
              </span>

              {/* Lead Stage Badge */}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                isConverted 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900' 
                  : isDropped
                  ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 line-through'
                  : enquiry.stage === 'followup'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
              }`}>
                {isConverted ? 'Enrolled in SIS ✓' : isDropped ? 'Dropped' : enquiry.stage}
              </span>

              {/* Lead Priority / Temperature Pill */}
              {!isConverted && !isDropped && (
                <button
                  type="button"
                  onClick={handleCycleTemperature}
                  title="Click to cycle priority (Hot -> Warm -> Cold)"
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border transition-all cursor-pointer ${
                    temp === 'hot'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                      : temp === 'warm'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
                      : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900'
                  }`}
                >
                  {temp === 'hot' ? <Flame className="h-3 w-3 text-rose-600 animate-pulse" /> :
                   temp === 'warm' ? <Sun className="h-3 w-3 text-amber-600" /> :
                   <Snowflake className="h-3 w-3 text-sky-600" />}
                  <span className="capitalize">{temp} Lead</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Parent: <span className="font-semibold text-slate-700 dark:text-slate-300">{enquiry.parent_name}</span> • Lead #{enquiry.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`tel:${enquiry.phone}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Call Parent</span>
          </a>

          {!isConverted && !isDropped && (
            <>
              <button
                type="button"
                onClick={() => {
                  setStandaloneDropReason('Fee Structure High');
                  setStandaloneDropNote('');
                  setShowDropModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold transition-colors cursor-pointer"
                title="Mark lead as dropped / inactive"
              >
                <UserX className="h-3.5 w-3.5" />
                <span>Drop Lead</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const slug = enquiry.student_name.toLowerCase().replace(/\s+/g, '_');
                  setEnrollDocReportCard(true);
                  setReportCardFileName(`report_card_${slug}.pdf`);
                  setEnrollDocBirthCert(true);
                  setBirthCertFileName(`birth_cert_${slug}.pdf`);
                  setEnrollDocTransferCert(!!enquiry.doc_transfer_cert);
                  setTcFileName(enquiry.doc_transfer_cert ? `tc_${slug}.pdf` : '');
                  setTcUndertaking(!enquiry.doc_transfer_cert);
                  setShowEnrollModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <UserCheck className="h-4 w-4" />
                <span>Enroll to SIS</span>
              </button>
            </>
          )}

          {isDropped && (
            <button
              type="button"
              onClick={handleReopenLead}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reopen Lead &amp; Restore</span>
            </button>
          )}

          {isConverted && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>SIS Enrolment Sealed</span>
            </span>
          )}
        </div>
      </div>

      {/* Main 2-Column Split Dossier Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Student Profile & Key Pipeline Metadata */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card 1: Contact Information */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Student &amp; Parent Profile
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">ID #{enquiry.id}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Candidate Name</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">{enquiry.student_name}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Parent / Guardian</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{enquiry.parent_name}</span>
              </div>

              {/* Phone with 1-click copy */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Contact Phone</span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{enquiry.phone}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Copy phone number"
                  >
                    {copiedPhone ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Email */}
              {enquiry.email && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Email Address</span>
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="font-mono text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                  >
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{enquiry.email}</span>
                  </a>
                </div>
              )}

              {/* Target Grade & Location */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Target Grade</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{enquiry.target_grade}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Lead Source</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block capitalize">{enquiry.source || 'Website'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pipeline Milestones */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Pipeline Milestones
              </h2>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Days in Pipeline:</span>
                <span className="font-bold text-slate-900 dark:text-white">{enquiry.created_at ? Math.max(1, Math.round((Date.now() - new Date(enquiry.created_at).getTime()) / (1000 * 60 * 60 * 24))) : 2} Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Scheduled Follow-Up:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{enquiry.next_followup_date || 'None'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Lifecycle:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">{enquiry.stage}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interaction Logger & History Timeline */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Interaction Logging Form */}
          {!isConverted && !isDropped && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Log Parent Conversation / Call Interaction
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Live Call CRM</span>
              </div>

              <form onSubmit={handleAddCallLog} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Call Outcome / Milestone
                    </label>
                    <select
                      value={callOutcome}
                      onChange={(e) => setCallOutcome(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Connected - Positive">Connected - High Interest (Positive)</option>
                      <option value="Connected - Callback Requested">Connected - Callback Requested</option>
                      <option value="Connected - Campus Visit Booked">Connected - Campus Visit / Demo Booked</option>
                      <option value="Connected - Fee Negotiation">Connected - Fee Negotiation in Progress</option>
                      <option value="Ringing - No Response">Ringing - No Answer</option>
                      <option value="Switched Off / Busy">Switched Off / Busy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Schedule Next Follow-Up Date
                    </label>
                    <input
                      type="date"
                      value={callNextDate}
                      onChange={(e) => setCallNextDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Call Summary &amp; Parent Notes *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter what the parent stated during the call (e.g. Inquired about robotics club, requested syllabus PDF via WhatsApp, father visiting campus on Thursday)..."
                    value={callNote}
                    onChange={(e) => setCallNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Appends to official lead dossier timeline
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingLog || !callNote.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmittingLog ? 'Saving...' : 'Save Interaction Log'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section 2: Chronological Interaction & Call History Timeline */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Follow-Up &amp; Call Notes Timeline
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {interactionHistory.length} Interactions
              </span>
            </div>

            {interactionHistory.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No interaction logs recorded yet</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Use the call logger form above to record parent feedback, conversation notes, and follow-up milestones.
                </p>
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {interactionHistory.map((item) => (
                  <div key={item.id} className="relative pl-8 space-y-1">
                    {/* Timeline bullet dot */}
                    <div className="absolute left-2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 dark:bg-blue-400" />

                    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-3.5 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          {item.outcome}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        {item.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* =========================================================================
          MODAL: 1-CLICK SIS ENROLLMENT CONFIRMATION (RESPONSIVE 2-COLUMN ERGONOMIC LAYOUT)
          ========================================================================= */}
      {showEnrollModal && (
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
                    Enrolling <span className="font-bold text-slate-800 dark:text-slate-200">{enquiry.student_name}</span> • {enquiry.target_grade} • Generated Roll No: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">ADM-2026-08{String(enquiry.id).padStart(2, '0')}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* SCROLLABLE FORM BODY */}
            <form onSubmit={handleConfirmEnrollment} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
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
                          onChange={(e) => setEnrollFeeStatus(e.target.value as any)}
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
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
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
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                            />
                            <span>Previous Academic Report Card</span>
                          </label>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Mandatory</span>
                        </div>
                        {enrollDocReportCard && (
                          <div className="flex items-center justify-between gap-2 pt-1 pl-5">
                            <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate">
                              <Paperclip className="h-3 w-3 shrink-0" />
                              <span className="truncate">{reportCardFileName || `report_card_${enquiry.student_name.toLowerCase().replace(/\s+/g, '_')}.pdf`}</span>
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
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                            />
                            <span>Government Birth Certificate / ID</span>
                          </label>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Statutory</span>
                        </div>
                        {enrollDocBirthCert && (
                          <div className="flex items-center justify-between gap-2 pt-1 pl-5">
                            <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate">
                              <Paperclip className="h-3 w-3 shrink-0" />
                              <span className="truncate">{birthCertFileName || `birth_cert_${enquiry.student_name.toLowerCase().replace(/\s+/g, '_')}.pdf`}</span>
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
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                            />
                            <span>Original Transfer Certificate (TC) Deposited</span>
                          </label>
                        </div>

                        {enrollDocTransferCert ? (
                          <div className="flex items-center justify-between gap-2 pt-1 pl-5">
                            <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-mono truncate">
                              <Paperclip className="h-3 w-3 shrink-0" />
                              <span className="truncate">{tcFileName || `tc_${enquiry.student_name.toLowerCase().replace(/\s+/g, '_')}.pdf`}</span>
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
                                className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
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
                  onClick={() => setShowEnrollModal(false)}
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
      )}

      {/* =========================================================================
          MODAL: DROP LEAD REASON & ARCHIVE
          ========================================================================= */}
      {showDropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <UserX className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Mark Lead as Dropped
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDropModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to drop <b>{enquiry.student_name}</b>? Dropped leads are archived from the active follow-up roster but can be restored anytime.
            </p>

            <form onSubmit={handleConfirmDrop} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Dropping *
                </label>
                <select
                  value={standaloneDropReason}
                  onChange={(e) => setStandaloneDropReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-rose-600 focus:outline-none"
                >
                  <option value="Fee Structure High">Fee Structure Higher than Budget</option>
                  <option value="Opted for Competitor School">Joined Competitor Institution</option>
                  <option value="Relocated to Another City">Relocated to Another City / State</option>
                  <option value="Transport / Route Unavailable">Transport / School Bus Route Unavailable</option>
                  <option value="Parent Unresponsive">Repeated Calls Unanswered / Parent Lost Interest</option>
                  <option value="Other">Other Operational Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Optional Closing Note
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context from parent discussion..."
                  value={standaloneDropNote}
                  onChange={(e) => setStandaloneDropNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:border-rose-600 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDropModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDropping}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <UserX className="h-3.5 w-3.5" />
                  <span>{isDropping ? 'Dropping...' : 'Confirm Drop Lead'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
