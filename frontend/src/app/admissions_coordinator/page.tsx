'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users,
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Phone, 
  Calendar, 
  ArrowRight, 
  X, 
  Menu, 
  PhoneCall, 
  UserX, 
  RotateCcw, 
  BellRing, 
  UserCheck,
  Copy,
  Flame,
  Sun,
  Snowflake,
  FileCheck,
  Share2,
  Check,
  AlertCircle,
  Eye,
  ShieldCheck,
  Upload,
  ExternalLink,
  FileSpreadsheet
} from 'lucide-react';
import { Footer } from '@/components/footer';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdmissionEnquiry } from '@/lib/types';
import { exportToCsv } from '@/lib/export-utils';
import { DocumentViewerModal, DocumentPreviewData } from '@/components/document-viewer-modal';

type CrmFilter = 'all' | 'due_today' | 'hot' | 'active' | 'followup' | 'converted' | 'dropped';

export default function AdmissionsCoordinatorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Enquiries State
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [crmFilter, setCrmFilter] = useState<CrmFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Bulk Import Modal State ──
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkPreviewRows, setBulkPreviewRows] = useState<Array<{
    student_name: string;
    target_grade: string;
    parent_name: string;
    phone: string;
    source: string;
    lead_temperature: 'hot' | 'warm' | 'cold';
    notes: string;
    next_followup_date: string;
    isValid: boolean;
    errorMsg?: string;
  }>>([]);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [callModalEnquiry, setCallModalEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [convertModalEnquiry, setConvertModalEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [dropModalEnquiry, setDropModalEnquiry] = useState<AdmissionEnquiry | null>(null);

  // Register Form State
  const [regStudentName, setRegStudentName] = useState('');
  const [regParentName, setRegParentName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPhoneError, setRegPhoneError] = useState<string | null>(null);
  const [regEmail, setRegEmail] = useState('');
  const [regGrade, setRegGrade] = useState('Class 8');
  const [regSource, setRegSource] = useState('Website Form');
  const [regTemperature, setRegTemperature] = useState<'hot' | 'warm' | 'cold'>('warm');
  const [regDocReportCard, setRegDocReportCard] = useState(false);
  const [regDocBirthCert, setRegDocBirthCert] = useState(false);
  const [regDocTransferCert, setRegDocTransferCert] = useState(false);
  const [regNotes, setRegNotes] = useState('');
  const [regFollowupDate, setRegFollowupDate] = useState('');

  // Log Call Modal State
  const [callOutcome, setCallOutcome] = useState<'Connected - Positive' | 'Callback Requested' | 'Ringing / No Answer' | 'Not Interested / Drop'>('Callback Requested');
  const [callNotes, setCallNotes] = useState('');
  const [nextCallDate, setNextCallDate] = useState('');
  const [modalDropReason, setModalDropReason] = useState('Fee Structure High');

  // Convert Modal State
  const [convertSection, setConvertSection] = useState('A');
  const [convertAdmissionFee, setConvertAdmissionFee] = useState(25000);
  const [convertFeeStatus, setConvertFeeStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [convertPaymentMethod, setConvertPaymentMethod] = useState('UPI (Google Pay)');

  // Standalone Drop Modal State
  const [standaloneDropReason, setStandaloneDropReason] = useState('Fee Structure High');
  const [standaloneDropNote, setStandaloneDropNote] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Document Preview Modal State
  const [previewDocData, setPreviewDocData] = useState<DocumentPreviewData | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleOpenPreview = (
    enq: AdmissionEnquiry,
    docType: 'Report Card' | 'Birth Certificate' | 'Transfer Certificate'
  ) => {
    setPreviewDocData({
      title: `${docType} - ${enq.student_name}`,
      doc_type: docType === 'Report Card' ? 'Marks Card' : docType,
      student_name: enq.student_name,
      admission_no: `ENQ-2026-${enq.id + 100}`,
      class_name: enq.target_grade,
      guardian_name: enq.parent_name,
      status: enq.stage === 'converted' ? 'Verified' : 'Pending Admin Digital Seal',
      verified_stamp: enq.stage === 'converted' ? 'EDU360 Official Seal' : 'Admissions Desk Draft (Verified by Coordinator)',
      upload_date: new Date().toISOString()
    });
    setShowPreviewModal(true);
  };

  const handleSubmitDocsToAdmin = (enq: AdmissionEnquiry) => {
    triggerToast(`All 3 documents for ${enq.student_name} submitted to Principal Office for Official Vault Sealing!`);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const enqRes = await api.getEnquiries();
      setEnquiries(enqRes);
      
      const today = new Date().toISOString().split('T')[0];
      const hasDueToday = enqRes.some(e => e.stage !== 'converted' && e.stage !== 'dropped' && e.next_followup_date && e.next_followup_date <= today);
      if (!hasDueToday) {
        setCrmFilter('active');
      }
    } catch (err) {
      console.error('Failed to load admissions data', err);
    } finally {
      setLoading(false);
    }
  };

  const [todayStr, setTodayStr] = useState<string>('2026-10-24');

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
    loadData();
  }, []);

  // Helper: Is Call Due Today or Overdue?
  const isDueToday = (enq: AdmissionEnquiry) => {
    if (enq.stage === 'converted' || enq.stage === 'dropped') return false;
    if (!enq.next_followup_date) return false;
    return enq.next_followup_date <= todayStr;
  };

  // Pipeline Metrics
  const dueTodayCount = useMemo(() => enquiries.filter(isDueToday).length, [enquiries, todayStr]);
  const hotCount = useMemo(() => enquiries.filter(e => e.stage !== 'converted' && e.stage !== 'dropped' && e.lead_temperature === 'hot').length, [enquiries]);
  const activeCount = useMemo(() => enquiries.filter(e => e.stage !== 'converted' && e.stage !== 'dropped').length, [enquiries]);
  const followupCount = useMemo(() => enquiries.filter(e => e.stage === 'followup').length, [enquiries]);
  const convertedCount = useMemo(() => enquiries.filter(e => e.stage === 'converted').length, [enquiries]);
  const droppedCount = useMemo(() => enquiries.filter(e => e.stage === 'dropped').length, [enquiries]);

  // Filtered Enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(enq => {
      // Search
      const matchesSearch = 
        enq.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enq.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enq.phone.includes(searchQuery) ||
        (enq.source && enq.source.toLowerCase().includes(searchQuery.toLowerCase())) ||
        enq.target_grade.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Tab filter
      if (crmFilter === 'due_today') return isDueToday(enq);
      if (crmFilter === 'hot') return enq.stage !== 'converted' && enq.stage !== 'dropped' && enq.lead_temperature === 'hot';
      if (crmFilter === 'active') return enq.stage !== 'converted' && enq.stage !== 'dropped';
      if (crmFilter === 'followup') return enq.stage === 'followup';
      if (crmFilter === 'converted') return enq.stage === 'converted';
      if (crmFilter === 'dropped') return enq.stage === 'dropped';
      return true;
    });
  }, [enquiries, crmFilter, searchQuery, todayStr]);

  // 1. Copy Phone Number
  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    triggerToast(`Copied phone: ${phone}`);
  };

  // 2. Quick Toggle Lead Temperature (Hot -> Warm -> Cold -> Hot)
  const handleToggleTemperature = async (enq: AdmissionEnquiry, e: React.MouseEvent) => {
    e.stopPropagation();
    const cycle: Record<'hot' | 'warm' | 'cold', 'hot' | 'warm' | 'cold'> = {
      hot: 'warm',
      warm: 'cold',
      cold: 'hot'
    };
    const nextTemp = cycle[enq.lead_temperature || 'warm'];
    await api.updateEnquiryTemperature(enq.id, nextTemp);
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    triggerToast(`Priority updated to ${nextTemp.toUpperCase()} for ${enq.student_name}`);
  };

  // 3. Quick Toggle Document Collection
  const handleToggleDoc = async (enq: AdmissionEnquiry, docKey: 'doc_report_card' | 'doc_birth_cert' | 'doc_transfer_cert', currentVal: boolean | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedVal = !currentVal;
    await api.updateEnquiryDocs(enq.id, { [docKey]: updatedVal });
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    const label = docKey === 'doc_report_card' ? 'Report Card' : docKey === 'doc_birth_cert' ? 'Birth Certificate' : 'Transfer Certificate';
    triggerToast(`${label} ${updatedVal ? 'collected ✓' : 'marked pending'}`);
  };

  // ── Parse Bulk CSV Text ──
  const handleParseCsvInput = (text: string) => {
    setBulkCsvText(text);
    if (!text.trim()) {
      setBulkPreviewRows([]);
      return;
    }

    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      setBulkPreviewRows([]);
      return;
    }

    // Check if line 0 is a header row
    const firstLineLower = lines[0].toLowerCase();
    const hasHeader = firstLineLower.includes('name') || firstLineLower.includes('student') || firstLineLower.includes('phone') || firstLineLower.includes('grade');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const parsed = dataLines.map((line, idx) => {
      // Split by comma or tab, taking quotes into account
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)|\t/).map(p => p.trim().replace(/^["]|["]$/g, ''));
      
      const student_name = parts[0] || '';
      const target_grade = parts[1] || 'Grade 8';
      const parent_name = parts[2] || 'Parent / Guardian';
      const rawPhone = parts[3] || '';
      const source = parts[4] || 'Website';
      const tempRaw = (parts[5] || 'warm').toLowerCase();
      const lead_temperature: 'hot' | 'warm' | 'cold' = 
        tempRaw.includes('hot') ? 'hot' : tempRaw.includes('cold') ? 'cold' : 'warm';
      const notes = parts[6] || 'Bulk imported inquiry';
      const next_followup_date = parts[7] || todayStr;

      // Validate
      const isValid = student_name.trim().length >= 2 && rawPhone.trim().length >= 7;
      let errorMsg = '';
      if (student_name.trim().length < 2) errorMsg = 'Student name required';
      else if (rawPhone.trim().length < 7) errorMsg = 'Valid phone number required';

      return {
        student_name: student_name.trim(),
        target_grade: target_grade.trim(),
        parent_name: parent_name.trim(),
        phone: rawPhone.trim(),
        source: source.trim(),
        lead_temperature,
        notes: notes.trim(),
        next_followup_date: next_followup_date.trim(),
        isValid,
        errorMsg
      };
    });

    setBulkPreviewRows(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleParseCsvInput(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const sample = `student_name,target_grade,parent_name,phone,source,lead_temperature,notes,next_followup_date
Aarav Sharma,Grade 8,Dr. Rajeev Sharma,+91 98490 22114,Website,hot,Inquired for CBSE Class 8 Science,2026-10-30
Meera Patel,Grade 6,Suresh Patel,+91 98220 11223,Walk-in,warm,Relocating from Pune in November,2026-11-02
Kavya Reddy,Grade 9,Venkatesh Reddy,+91 97010 33445,Referral,hot,Interested in IIT Foundation stream,2026-10-29
Vihaan Iyer,Grade 7,Narayanan Iyer,+91 98401 55667,Social Media,cold,Requested fee structure brochure,2026-11-05`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admission_enquiries_bulk_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Sample CSV template downloaded!');
  };

  const handleExecuteBulkImport = async () => {
    const validRows = bulkPreviewRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      triggerToast('No valid inquiries to import. Please check format.');
      return;
    }

    setBulkImporting(true);
    let count = 0;
    for (const row of validRows) {
      try {
        await api.createEnquiry({
          student_name: row.student_name,
          parent_name: row.parent_name,
          email: `${row.student_name.toLowerCase().replace(/\s+/g, '.')}@inquiry.local`,
          phone: row.phone,
          target_grade: row.target_grade,
          lead_temperature: row.lead_temperature,
          source: row.source,
          notes: row.notes,
          next_followup_date: row.next_followup_date
        });
        count++;
      } catch (err) {
        console.error('Error importing lead:', row, err);
      }
    }

    const updated = await api.getEnquiries();
    setEnquiries(updated);
    setBulkImporting(false);
    setShowBulkImportModal(false);
    setBulkCsvText('');
    setBulkPreviewRows([]);
    triggerToast(`✓ Successfully imported ${count} new student inquiries into the Admissions Pipeline!`);
  };

  // 4. Register New Enquiry
  const handleRegisterEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regStudentName.trim() || !regParentName.trim() || !regPhone.trim()) {
      triggerToast('Please provide Student Name, Parent Name, and Phone.');
      return;
    }

    // Phone Number Strict Validation (Indian 10-digit mobile with optional +91 / 0)
    const digitsOnly = regPhone.replace(/\D/g, '');
    let isValidMobile = false;
    let phoneErrorMsg = '';

    if (!digitsOnly) {
      phoneErrorMsg = 'Phone number is required.';
    } else if (digitsOnly.length === 10) {
      if (/^[6-9]\d{9}$/.test(digitsOnly)) {
        isValidMobile = true;
      } else {
        phoneErrorMsg = '10-digit mobile number must start with 6, 7, 8, or 9.';
      }
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      if (/^[6-9]\d{9}$/.test(digitsOnly.slice(2))) {
        isValidMobile = true;
      } else {
        phoneErrorMsg = 'Mobile number must start with 6, 7, 8, or 9 after country code +91.';
      }
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
      if (/^[6-9]\d{9}$/.test(digitsOnly.slice(1))) {
        isValidMobile = true;
      } else {
        phoneErrorMsg = 'Mobile number must start with 6, 7, 8, or 9 after leading 0.';
      }
    } else if (digitsOnly.length < 10) {
      phoneErrorMsg = `Incomplete phone number (${digitsOnly.length}/10 digits entered).`;
    } else {
      phoneErrorMsg = 'Please enter a valid 10-digit mobile number (e.g. +91 98450 99881).';
    }

    if (!isValidMobile) {
      setRegPhoneError(phoneErrorMsg);
      triggerToast(phoneErrorMsg);
      return;
    }
    setRegPhoneError(null);
    const emailVal = regEmail.trim() || `${regStudentName.toLowerCase().replace(/\s+/g, '')}.parent@edu360.internal`;
    await api.createEnquiry({
      student_name: regStudentName.trim(),
      parent_name: regParentName.trim(),
      phone: regPhone.trim(),
      email: emailVal,
      target_grade: regGrade,
      lead_temperature: regTemperature,
      source: regSource,
      doc_report_card: regDocReportCard,
      doc_birth_cert: regDocBirthCert,
      doc_transfer_cert: regDocTransferCert,
      notes: regNotes.trim() ? `• [${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}] Initial Note: ${regNotes.trim()}` : undefined,
      next_followup_date: regFollowupDate || undefined
    });
    
    setShowRegisterModal(false);
    setRegStudentName('');
    setRegParentName('');
    setRegPhone('');
    setRegPhoneError(null);
    setRegEmail('');
    setRegNotes('');
    setRegFollowupDate('');
    setRegDocReportCard(false);
    setRegDocBirthCert(false);
    setRegDocTransferCert(false);
    
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    triggerToast('New student enquiry registered successfully!');
  };

  // 5. Open Call Log Modal
  const openCallModal = (enq: AdmissionEnquiry) => {
    setCallModalEnquiry(enq);
    setCallOutcome('Callback Requested');
    setCallNotes('');
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    setNextCallDate(tmrw.toISOString().split('T')[0]);
    setModalDropReason('Fee Structure High');
  };

  // 6. Save Call Outcome
  const handleSaveCallOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callModalEnquiry) return;
    if (!callNotes.trim()) {
      triggerToast('Please enter what you discussed during this call.');
      return;
    }

    await api.logCallOutcome(callModalEnquiry.id, {
      outcome: callOutcome,
      note: callNotes.trim(),
      next_followup_date: callOutcome === 'Callback Requested' ? nextCallDate : callOutcome === 'Ringing / No Answer' ? nextCallDate : undefined,
      drop_reason: callOutcome === 'Not Interested / Drop' ? modalDropReason : undefined
    });

    setCallModalEnquiry(null);
    setCallNotes('');
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    triggerToast(`Call outcome logged for ${callModalEnquiry.student_name}!`);
  };

  // 7. Confirm SIS Convert
  const handleConfirmConvert = async () => {
    if (!convertModalEnquiry) return;
    const studentName = convertModalEnquiry.student_name;
    const feeAmt = Number(convertAdmissionFee);
    const feeStat = convertFeeStatus;
    const sec = convertSection;

    await api.convertEnquiryToStudent(convertModalEnquiry.id, {
      section: sec,
      feeAmount: feeAmt,
      feeStatus: feeStat,
      paymentMethod: convertPaymentMethod
    });

    setConvertModalEnquiry(null);
    const updated = await api.getEnquiries();
    setEnquiries(updated);

    if (feeStat === 'Paid') {
      triggerToast(`✓ ${studentName} enrolled in Section ${sec}! Admission Fee ₹${feeAmt.toLocaleString()} paid. Forwarded to Accounts for reconciliation.`);
    } else {
      triggerToast(`✓ ${studentName} enrolled in Section ${sec}! Admission Fee ₹${feeAmt.toLocaleString()} pending. Popped into Accounts Coordinator queue.`);
    }
  };

  // 8. Confirm Standalone Drop
  const handleConfirmStandaloneDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropModalEnquiry) return;
    await api.dropEnquiry(dropModalEnquiry.id, standaloneDropReason, standaloneDropNote.trim() || undefined);
    setDropModalEnquiry(null);
    setStandaloneDropReason('Fee Structure High');
    setStandaloneDropNote('');
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    triggerToast('Lead marked as dropped and archived.');
  };

  // 9. Reopen Dropped Lead
  const handleReopenLead = async (id: number) => {
    await api.reopenEnquiry(id);
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    triggerToast('Lead reopened and restored to active pipeline (previous drop reason saved to history).');
  };

  // 10. Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Enquiry ID', 
      'Student Name', 
      'Parent Name', 
      'Target Grade', 
      'Phone', 
      'Source', 
      'Priority', 
      'Report Card', 
      'Birth Cert', 
      'Transfer Cert',
      'Stage', 
      'Next Call Date', 
      'Drop Reason',
      'Call History & Discussion Notes'
    ];
    const rows = enquiries.map(e => [
      e.id, 
      e.student_name, 
      e.parent_name, 
      e.target_grade, 
      e.phone, 
      e.source || 'Website',
      e.lead_temperature || 'warm',
      e.doc_report_card ? 'Yes' : 'No',
      e.doc_birth_cert ? 'Yes' : 'No',
      e.doc_transfer_cert ? 'Yes' : 'No',
      e.stage,
      e.next_followup_date || 'None',
      e.drop_reason || 'N/A',
      e.notes ? e.notes.replace(/\r?\n/g, ' | ') : 'No notes recorded'
    ]);
    exportToCsv('EDU360_Admissions_Pipeline', headers, rows);
    triggerToast('Admissions pipeline exported as CSV.');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="h-4 w-4 text-sky-400 dark:text-sky-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* ── Left Sidebar (Vertical Calling Menu) ── */}
      <aside className={`
        fixed md:sticky top-0 md:top-16 inset-y-0 md:inset-y-auto left-0 z-40 md:z-20
        h-screen md:h-[calc(100vh-4rem)] md:self-start
        ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${sidebarCollapsed ? 'md:w-[72px] w-[256px]' : 'w-[256px]'}
        transition-all duration-300 ease-in-out shrink-0 select-none
        bg-white text-slate-800 border-r border-slate-200/90
        dark:bg-[#0B101B] dark:text-slate-200 dark:border-r dark:border-slate-800/90
        flex flex-col justify-between overflow-hidden
      `}>
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header Card */}
          <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-200/90 dark:border-slate-800/90 shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                  AC
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">Admissions Desk</h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Calling &amp; Intake Console</span>
                </div>
              </div>
            ) : (
              <div className="mx-auto h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                AC
              </div>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${sidebarCollapsed ? 'hidden' : 'hidden md:flex'}`}
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Close Sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {sidebarCollapsed && (
            <div className="hidden md:flex justify-center pt-2">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Quick Menu */}
          <div className="p-3 space-y-1">
            {!sidebarCollapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                Calling Views
              </span>
            )}
            {[
              { id: 'all', label: 'All Inquiries', icon: Users, badge: `${enquiries.length}`, badgeType: 'slate' },
              { id: 'due_today', label: "Today's Calling Queue", icon: BellRing, badge: dueTodayCount > 0 ? `${dueTodayCount} Due` : 'Clear', badgeType: dueTodayCount > 0 ? 'amber' : 'emerald' },
              { id: 'hot', label: "Hot Leads 🔥", icon: Flame, badge: `${hotCount}`, badgeType: 'rose' },
              { id: 'active', label: 'All Active Leads', icon: Users, badge: `${activeCount}`, badgeType: 'blue' },
              { id: 'followup', label: 'Follow-ups Pipeline', icon: Calendar, badge: `${followupCount}`, badgeType: 'blue' },
              { id: 'converted', label: 'Enrolled Students (SIS)', icon: UserCheck, badge: `${convertedCount}`, badgeType: 'emerald' },
              { id: 'dropped', label: 'Dropped Inquiries', icon: UserX, badge: `${droppedCount}`, badgeType: 'slate' }
            ].map(item => {
              const Icon = item.icon;
              const active = crmFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCrmFilter(item.id as CrmFilter);
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                    active 
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      item.badgeType === 'rose'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        : item.badgeType === 'amber'
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                        : item.badgeType === 'emerald'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : item.badgeType === 'slate'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200/90 dark:border-slate-800/90 shrink-0">
          {!sidebarCollapsed ? (
            <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/60">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                CBSE 2026-27 Active Intake
              </span>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="CBSE 2026-27 Active Intake" />
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">

            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Open Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200/60 dark:border-blue-800/60">
                  Admissions Coordinator Desk
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Call Follow-ups &amp; SIS Enrollment</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Prospective Student Inquiries &amp; Calling Queue
              </h1>
            </div>
          </div>

          {/* Action Buttons: ONLY visible in All Inquiries / Active Pipeline view as requested */}
          {(crmFilter === 'all' || crmFilter === 'active') && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-sky-600" />
                <span>Export Pipeline</span>
              </button>

              <button
                onClick={() => {
                  setBulkCsvText('');
                  setBulkPreviewRows([]);
                  setShowBulkImportModal(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Bulk Import (CSV/Excel)</span>
              </button>

              <button
                onClick={() => {
                  setRegPhoneError(null);
                  setShowRegisterModal(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Register New Enquiry</span>
              </button>
            </div>
          )}
        </div>

        {/* ── PRIORITY BANNER: Today's Calling Queue ── */}
        <div className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          dueTodayCount > 0 
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200' 
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              dueTodayCount > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
            }`}>
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold">
                {dueTodayCount > 0 
                  ? `Today's Follow-up Queue: ${dueTodayCount} Call${dueTodayCount > 1 ? 's' : ''} Scheduled for Today`
                  : `All Follow-up Calls Completed for Today!`}
              </h3>
              <p className="text-[11px] opacity-80 mt-0.5">
                {dueTodayCount > 0 
                  ? 'Connect with parents, log what they said, and either schedule the next date or convert to SIS.'
                  : 'No pending calls in queue right now. You can check hot leads, register new inquiries, or verify documents.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dueTodayCount > 0 && crmFilter !== 'due_today' && (
              <button
                onClick={() => setCrmFilter('due_today')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <span>View Today's Calls ({dueTodayCount})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            {hotCount > 0 && crmFilter !== 'hot' && (
              <button
                onClick={() => setCrmFilter('hot')}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
              >
                <Flame className="h-3 w-3" />
                <span>Hot Leads ({hotCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Search Bar & View Title ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>
              {crmFilter === 'due_today' ? "Today's Calling Queue"
                : crmFilter === 'hot' ? "Hot Leads (High Intent)"
                : crmFilter === 'active' ? "All Active Leads"
                : crmFilter === 'followup' ? "Scheduled Follow-ups Pipeline"
                : crmFilter === 'converted' ? "Enrolled Students (SIS)"
                : crmFilter === 'dropped' ? "Dropped / Archived Inquiries"
                : "All Inquiries"}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 text-[11px] font-mono">
              {filteredEnquiries.length} Inquiries
            </span>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student, parent, phone, grade..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* ── Enquiry Cards Grid ── */}
        {filteredEnquiries.length === 0 ? (
          <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {crmFilter === 'due_today' ? "No Calls Due for Today" : crmFilter === 'hot' ? "No Hot Leads Currently" : "No Leads Found"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {crmFilter === 'due_today' 
                ? "You have finished all scheduled calls for today, or no calls are due right now." 
                : "No student records matched this filter."}
            </p>
            {crmFilter !== 'active' && (
              <button
                onClick={() => setCrmFilter('active')}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                View All Active Leads
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEnquiries.map(enq => {
              const due = isDueToday(enq);
              const temp = enq.lead_temperature || 'warm';
              return (
                <div 
                  key={enq.id}
                  onClick={() => router.push(`/admissions_coordinator/leads/${enq.id}`)}
                  className={`rounded-2xl border bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs transition-all flex flex-col justify-between cursor-pointer group hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 ${
                    due 
                      ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20' 
                      : enq.stage === 'converted'
                      ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/10'
                      : enq.stage === 'dropped'
                      ? 'border-slate-200 dark:border-slate-800 opacity-80'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Top: Student Name & Priority / Source Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span 
                            className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1 truncate"
                            title="Open 360° Lead Dossier"
                          >
                            <span>{enq.student_name}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-blue-600 dark:text-blue-400" />
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {enq.target_grade}
                          </span>
                        </div>

                        {/* Parent & 1-Click Phone Dial/Copy */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{enq.parent_name}</span>
                          <span>•</span>
                          <div 
                            className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={`tel:${enq.phone}`} className="hover:underline flex items-center gap-1" title="Call directly">
                              <Phone className="h-3 w-3" />
                              {enq.phone}
                            </a>
                            <button
                              onClick={(e) => handleCopyPhone(enq.phone, e)}
                              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              title="Copy Phone Number"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Badges: Temperature (Click to toggle) & Source */}
                      <div className="flex flex-col items-end gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* 1-Click Temperature Pill */}
                        {enq.stage !== 'converted' && enq.stage !== 'dropped' && (
                          <button
                            onClick={(e) => handleToggleTemperature(enq, e)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${
                              temp === 'hot' 
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                : temp === 'warm'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                            }`}
                            title="Click to cycle priority: Hot -> Warm -> Cold"
                          >
                            {temp === 'hot' && <Flame className="h-3 w-3 text-rose-500 fill-rose-500" />}
                            {temp === 'warm' && <Sun className="h-3 w-3 text-amber-500" />}
                            {temp === 'cold' && <Snowflake className="h-3 w-3 text-slate-400" />}
                            <span className="capitalize">{temp}</span>
                          </button>
                        )}

                        {/* Source Pill */}
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                          {enq.source || 'Website'}
                        </span>
                      </div>
                    </div>

                    {/* Due Today Alert / Next Call Date */}
                    {enq.next_followup_date && enq.stage !== 'converted' && enq.stage !== 'dropped' && (
                      <div className={`flex items-center justify-between text-[11px] p-2 rounded-xl font-bold ${
                        due 
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {due ? '🔔 Follow-up Due Today!' : 'Next Scheduled Call:'}
                        </span>
                        <span className="font-mono">{enq.next_followup_date}</span>
                      </div>
                    )}

                    {/* Drop Reason (If dropped) */}
                    {enq.stage === 'dropped' && enq.drop_reason && (
                      <div className="flex items-center justify-between text-[11px] p-2 rounded-xl font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                        <span>Drop Reason:</span>
                        <span className="font-bold">{enq.drop_reason}</span>
                      </div>
                    )}

                    {/* Call History & Discussion Notes Snippet */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Recent Call Notes &amp; Discussion:
                      </span>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 max-h-20 overflow-y-auto space-y-1 whitespace-pre-line">
                        {enq.notes ? (
                          enq.notes
                        ) : (
                          <span className="text-slate-400 italic">No notes recorded yet. Click card to view dossier &amp; log call.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                    {enq.stage !== 'converted' && enq.stage !== 'dropped' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCallModal(enq);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Add New Follow-Up Call & Outcome"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          <span>Add Follow-up</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/admissions_coordinator/leads/${enq.id}`)}
                          className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="View Full Lead Dossier & Enrollment"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span>View Details</span>
                        </button>
                      </div>
                    ) : enq.stage === 'converted' ? (
                      <div className="w-full flex items-center justify-between text-xs py-1">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Enrolled in SIS
                        </span>
                        <button
                          type="button"
                          onClick={() => router.push(`/admissions_coordinator/leads/${enq.id}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs py-1">
                        <button
                          type="button"
                          onClick={() => router.push(`/admissions_coordinator/leads/${enq.id}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:underline cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReopenLead(enq.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" /> Reopen Lead
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Footer />
        </main>

      {/* ── MODAL 1: LOG CALL OUTCOME (COMPLETE CALL) ── */}
      {callModalEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-blue-600" />
                  Log Call Outcome &amp; Notes
                </h3>
                <p className="text-[11px] text-slate-500">
                  Student: <b>{callModalEnquiry.student_name}</b> ({callModalEnquiry.target_grade}) · Parent: {callModalEnquiry.parent_name} ({callModalEnquiry.phone})
                </p>
              </div>
              <button onClick={() => setCallModalEnquiry(null)} className="cursor-pointer">
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveCallOutcome} className="space-y-4 text-xs">
              {/* Call Result Selection */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  How did the call go? (Call Result) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Callback Requested', label: '🟡 Callback Requested', desc: 'Asked to call later' },
                    { id: 'Connected - Positive', label: '🟢 Positive / Intrigued', desc: 'Ready for next step' },
                    { id: 'Ringing / No Answer', label: '🟠 Ringing / No Answer', desc: 'Retry tomorrow' },
                    { id: 'Not Interested / Drop', label: '🔴 Not Interested', desc: 'Drop this lead' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCallOutcome(item.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        callOutcome === item.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-500/20' 
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold block text-slate-900 dark:text-white">{item.label}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discussion Notes Input */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  What did the parent say? (Call Notes) *
                </label>
                <textarea 
                  rows={3}
                  required
                  value={callNotes} 
                  onChange={e => setCallNotes(e.target.value)} 
                  placeholder="e.g. Spoke with mother. She inquired about online timing & math fee discount. Asked to call back on Monday." 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Next Call Date (if callback requested) */}
              {(callOutcome === 'Callback Requested' || callOutcome === 'Ringing / No Answer') && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Next Follow-up Call Date *
                  </label>
                  <input 
                    type="date" 
                    required
                    value={nextCallDate} 
                    onChange={e => setNextCallDate(e.target.value)} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    On this date, this student will appear in "Today's Calling Queue 🔔".
                  </p>
                </div>
              )}

              {/* Drop Reason (if Not Interested) */}
              {callOutcome === 'Not Interested / Drop' && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Reason for Dropping</label>
                  <select 
                    value={modalDropReason} 
                    onChange={e => setModalDropReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Fee Structure High">Fee Structure High (Budget Mismatch)</option>
                    <option value="Timing Conflict">Online Timing / Schedule Conflict</option>
                    <option value="Joined Another School">Joined Another School / Competitor</option>
                    <option value="Not Interested / Phone Unreachable">Not Interested / Phone Unreachable</option>
                    <option value="Other">Other Reasons</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCallModalEnquiry(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Save Call Outcome ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Bulk Import Prospective Student Inquiries (CSV / Excel) ── */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Bulk Import Student Inquiries (CSV / Excel)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fast-track prospective student onboarding matching the standard enquiry intake form.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowBulkImportModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step 1: Format Guidance & Example Table */}
            <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                    Required Column Format (Matching Standard Single Registration)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold shadow-xs hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Example CSV Template</span>
                </button>
              </div>

              <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                Your CSV or Excel columns should follow this structure. You can download the pre-filled template above or copy-paste directly.
              </p>

              {/* Example Format Visual Table */}
              <div className="overflow-x-auto rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-white/80 dark:bg-slate-900/80">
                <table className="w-full text-left text-[11px] border-collapse font-sans">
                  <thead>
                    <tr className="bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold border-b border-emerald-200/60 dark:border-emerald-900/40">
                      <th className="p-2">student_name *</th>
                      <th className="p-2">target_grade *</th>
                      <th className="p-2">parent_name *</th>
                      <th className="p-2">phone *</th>
                      <th className="p-2">source</th>
                      <th className="p-2">lead_temperature</th>
                      <th className="p-2">notes</th>
                      <th className="p-2">next_followup_date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/50 dark:divide-emerald-900/20 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                    <tr>
                      <td className="p-2 font-bold font-sans">Aarav Sharma</td>
                      <td className="p-2">Grade 8</td>
                      <td className="p-2 font-sans">Dr. Rajeev Sharma</td>
                      <td className="p-2">+91 98490 22114</td>
                      <td className="p-2">Website</td>
                      <td className="p-2 text-rose-600 font-bold">hot</td>
                      <td className="p-2 font-sans truncate max-w-[120px]">CBSE Class 8 Inquiry</td>
                      <td className="p-2">2026-10-30</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold font-sans">Meera Patel</td>
                      <td className="p-2">Grade 6</td>
                      <td className="p-2 font-sans">Suresh Patel</td>
                      <td className="p-2">+91 98220 11223</td>
                      <td className="p-2">Walk-in</td>
                      <td className="p-2 text-amber-600 font-bold">warm</td>
                      <td className="p-2 font-sans truncate max-w-[120px]">Relocating from Pune</td>
                      <td className="p-2">2026-11-02</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 2: Upload or Paste CSV */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <label className="text-xs font-black text-slate-900 dark:text-white">
                    Upload CSV File OR Paste Raw CSV Rows
                  </label>
                </div>

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">
                  <Upload className="h-3.5 w-3.5 text-blue-600" />
                  <span>Browse .CSV File</span>
                  <input
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={5}
                value={bulkCsvText}
                onChange={e => handleParseCsvInput(e.target.value)}
                placeholder="Paste CSV rows here (e.g. Aarav Sharma, Grade 8, Dr. Rajeev Sharma, 9849022114, Website, hot, CBSE admission, 2026-10-30)..."
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 font-mono text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Step 3: Parsed Rows Preview & Validation */}
            {bulkPreviewRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                      3
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Parsed Leads Preview ({bulkPreviewRows.filter(r => r.isValid).length} Valid, {bulkPreviewRows.filter(r => !r.isValid).length} Invalid)
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    bulkPreviewRows.every(r => r.isValid)
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {bulkPreviewRows.filter(r => r.isValid).length} Ready for Pipeline
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold sticky top-0">
                      <tr>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Student</th>
                        <th className="p-2.5">Grade</th>
                        <th className="p-2.5">Parent</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5">Priority</th>
                        <th className="p-2.5">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {bulkPreviewRows.map((row, idx) => (
                        <tr key={idx} className={row.isValid ? '' : 'bg-rose-50/50 dark:bg-rose-950/20'}>
                          <td className="p-2.5">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                <Check className="h-3 w-3" />
                                Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800" title={row.errorMsg}>
                                <AlertCircle className="h-3 w-3" />
                                {row.errorMsg || 'Invalid'}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.student_name || '—'}</td>
                          <td className="p-2.5 font-medium">{row.target_grade}</td>
                          <td className="p-2.5">{row.parent_name}</td>
                          <td className="p-2.5 font-mono text-[11px]">{row.phone}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              row.lead_temperature === 'hot'
                                ? 'bg-rose-100 text-rose-700'
                                : row.lead_temperature === 'cold'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {row.lead_temperature}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500 truncate max-w-[120px]">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowBulkImportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={bulkImporting || bulkPreviewRows.filter(r => r.isValid).length === 0}
                onClick={handleExecuteBulkImport}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {bulkImporting ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    <span>Importing into Pipeline...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Import {bulkPreviewRows.filter(r => r.isValid).length} Inquiries into Pipeline</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL 2: REGISTER NEW ENQUIRY (WITH SOURCE & PRIORITY) ── */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Register New Prospective Student</h3>
                <p className="text-[11px] text-slate-500">Capture initial student details, source, and priority</p>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="cursor-pointer">
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleRegisterEnquiry} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Student Name *</label>
                  <input 
                    type="text" 
                    required
                    value={regStudentName} 
                    onChange={e => setRegStudentName(e.target.value)} 
                    placeholder="e.g. Kavya Reddy" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Target Grade *</label>
                  <select 
                    value={regGrade} 
                    onChange={e => setRegGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Parent / Guardian Name *</label>
                  <input 
                    type="text" 
                    required
                    value={regParentName} 
                    onChange={e => setRegParentName(e.target.value)} 
                    placeholder="e.g. Mr. Rajesh Reddy" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number *</label>
                  <input 
                    type="tel" 
                    required
                    value={regPhone} 
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9+\-\s]/g, '');
                      setRegPhone(cleanVal);
                      if (regPhoneError) setRegPhoneError(null);
                    }} 
                    placeholder="e.g. +91 98450 12345" 
                    className={`w-full rounded-xl border p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      regPhoneError 
                        ? 'border-rose-500 focus:ring-rose-500/20' 
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/20'
                    }`}
                  />
                  {regPhoneError && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{regPhoneError}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Source & Priority Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Lead Source</label>
                  <select 
                    value={regSource} 
                    onChange={e => setRegSource(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Website Form">Website Form (Online)</option>
                    <option value="Parent Referral">Parent / Teacher Referral</option>
                    <option value="Social Media Ad">Social Media Ad (Meta/Google)</option>
                    <option value="Direct Call / Walk-in">Direct Call / Walk-in</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Initial Priority / Temperature</label>
                  <select 
                    value={regTemperature} 
                    onChange={e => setRegTemperature(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="hot">🔥 Hot (High Intent / Ready)</option>
                    <option value="warm">🌤️ Warm (In Consideration)</option>
                    <option value="cold">❄️ Cold (Casual Inquiry)</option>
                  </select>
                </div>
              </div>



              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Initial Note (Optional)</label>
                  <input 
                    type="text" 
                    value={regNotes} 
                    onChange={e => setRegNotes(e.target.value)} 
                    placeholder="e.g. Inquired about online schedule" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">First Call Date (Optional)</label>
                  <input 
                    type="date" 
                    value={regFollowupDate} 
                    onChange={e => setRegFollowupDate(e.target.value)} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: 1-CLICK SIS CONVERT ── */}
      {convertModalEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                  🎓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">1-Click SIS Enrollment &amp; Dossier</h3>
                  <p className="text-[11px] text-slate-500">Verify documents and promote lead to active Student Profile</p>
                </div>
              </div>
              <button onClick={() => setConvertModalEnquiry(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Student Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{convertModalEnquiry.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Grade / Target Class:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{convertModalEnquiry.target_grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Parent &amp; Phone:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{convertModalEnquiry.parent_name} ({convertModalEnquiry.phone})</span>
                </div>
              </div>

              {/* Mandatory Document Verification & TC Upload Vault */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                    Document Verification &amp; TC Upload Vault
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    3/4 Documents Ready
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  {/* Transfer Certificate (TC / SLC) */}
                  <div className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">Transfer Certificate (TC / SLC) *</span>
                        <span className="text-[10px] text-slate-500">Official migration slip from previous recognized school</span>
                      </div>
                    </div>
                    <label className="shrink-0 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer shadow-xs transition-all flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      <span>Attach TC</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            alert(`Transfer Certificate attached: ${e.target.files[0].name}`);
                          }
                        }} 
                      />
                    </label>
                  </div>

                  {/* Other Vital Documents */}
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <span className="text-[9px] font-bold text-emerald-600 block">✓ Verified</span>
                      <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Birth Certificate</span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <span className="text-[9px] font-bold text-emerald-600 block">✓ Verified</span>
                      <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Marks Card</span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <span className="text-[9px] font-bold text-emerald-600 block">✓ Verified</span>
                      <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Aadhaar Card</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Assign Classroom Section</label>
                <select 
                  value={convertSection} 
                  onChange={e => setConvertSection(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
                >
                  <option value="A">{convertModalEnquiry.target_grade}-A (Section A)</option>
                  <option value="B">{convertModalEnquiry.target_grade}-B (Section B)</option>
                </select>
              </div>

              {/* Admission Fee & Accounts Handoff Controls */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    One-Time Admission Fee Structure
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                    Accounts Auto-Sync
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Fee Amount (₹)</label>
                    <input
                      type="number"
                      value={convertAdmissionFee}
                      onChange={e => setConvertAdmissionFee(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Collection Status</label>
                    <select
                      value={convertFeeStatus}
                      onChange={e => setConvertFeeStatus(e.target.value as 'Paid' | 'Pending')}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                    >
                      <option value="Paid">✓ Paid Now (Immediate Collection)</option>
                      <option value="Pending">⏳ Pending (Queue in Accounts)</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Payment Method: Disabled when Pending, Enabled/Popped when Paid */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Payment Method
                    </label>
                    {convertFeeStatus === 'Pending' ? (
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                        Disabled (Pending Status)
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                        Active Immediate Receipt
                      </span>
                    )}
                  </div>
                  <select
                    disabled={convertFeeStatus === 'Pending'}
                    value={convertPaymentMethod}
                    onChange={e => setConvertPaymentMethod(e.target.value)}
                    className={`w-full rounded-xl border p-2 text-xs font-bold transition-all ${
                      convertFeeStatus === 'Pending'
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed opacity-50'
                        : 'border-emerald-500/60 dark:border-emerald-500/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-emerald-500/20 animate-in fade-in zoom-in-95'
                    }`}
                  >
                    <option value="UPI (Google Pay)">UPI (Google Pay / PhonePe)</option>
                    <option value="Bank POS Card">Bank POS Debit/Credit Card</option>
                    <option value="Cash Counter">Cash Counter Settlement</option>
                    <option value="Demand Draft / Cheque">Demand Draft / Cheque</option>
                  </select>
                  {convertFeeStatus === 'Pending' ? (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      Mode of payment is locked because collection status is set to Pending. Accounts team will collect later.
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      Instant receipt will be issued &amp; forwarded to Accounts Coordinator for bank reconciliation.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setConvertModalEnquiry(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmConvert}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm &amp; Enroll in SIS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer / Preview & Download Modal */}
      <DocumentViewerModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        document={previewDocData}
      />
    </div>
  );
}
