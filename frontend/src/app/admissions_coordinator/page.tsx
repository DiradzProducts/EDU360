'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
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
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdmissionEnquiry } from '@/lib/types';
import { exportToCsv } from '@/lib/export-utils';

type CrmFilter = 'due_today' | 'hot' | 'active' | 'followup' | 'converted' | 'dropped';

export default function AdmissionsCoordinatorPage() {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Enquiries State
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [crmFilter, setCrmFilter] = useState<CrmFilter>('due_today');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [callModalEnquiry, setCallModalEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [convertModalEnquiry, setConvertModalEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [dropModalEnquiry, setDropModalEnquiry] = useState<AdmissionEnquiry | null>(null);

  // Register Form State
  const [regStudentName, setRegStudentName] = useState('');
  const [regParentName, setRegParentName] = useState('');
  const [regPhone, setRegPhone] = useState('');
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

  // 4. Register New Enquiry
  const handleRegisterEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regStudentName.trim() || !regParentName.trim() || !regPhone.trim()) {
      triggerToast('Please provide Student Name, Parent Name, and Phone.');
      return;
    }
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
    await api.updateEnquiryStage(id, 'new');
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    triggerToast('Lead reopened and restored to active pipeline.');
  };

  // 10. Export CSV
  const handleExportCsv = () => {
    const headers = ['Enquiry ID', 'Student Name', 'Parent Name', 'Target Grade', 'Phone', 'Source', 'Priority', 'Report Card', 'Birth Cert', 'Stage', 'Next Call Date', 'Drop Reason'];
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
      e.stage,
      e.next_followup_date || 'None',
      e.drop_reason || 'N/A'
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

      {/* ── Left Sidebar ── */}
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
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
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

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-sky-600" />
              <span>Export Pipeline</span>
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Register New Enquiry</span>
            </button>
          </div>
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

        {/* ── Filter Bar & Search ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Stage Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            {[
              { id: 'due_today', label: `Today's Calls 🔔 (${dueTodayCount})`, accent: dueTodayCount > 0 },
              { id: 'hot', label: `Hot Leads 🔥 (${hotCount})`, hotBadge: hotCount > 0 },
              { id: 'active', label: `All Active (${activeCount})` },
              { id: 'followup', label: `In Follow-Up (${followupCount})` },
              { id: 'converted', label: `Enrolled in SIS (${convertedCount})` },
              { id: 'dropped', label: `Dropped (${droppedCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCrmFilter(tab.id as CrmFilter)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  crmFilter === tab.id
                    ? tab.hotBadge
                      ? 'bg-rose-600 text-white shadow-xs'
                      : tab.accent 
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : tab.hotBadge
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                    : tab.accent
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student, phone, source..."
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
                  className={`rounded-2xl border bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs transition-all flex flex-col justify-between ${
                    due 
                      ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20' 
                      : enq.stage === 'converted'
                      ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/10'
                      : enq.stage === 'dropped'
                      ? 'border-slate-200 dark:border-slate-800 opacity-80'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Top: Student Name & Priority / Source Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {enq.student_name}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {enq.target_grade}
                          </span>
                        </div>

                        {/* Parent & 1-Click Phone Dial/Copy */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{enq.parent_name}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1 font-mono font-bold text-blue-600 dark:text-blue-400">
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
                      <div className="flex flex-col items-end gap-1 shrink-0">
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

                    {/* Basic Document Checklist (3 Interactive Checkboxes) */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <FileCheck className="h-3 w-3" />
                          Documents Collected:
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {((enq.doc_report_card ? 1 : 0) + (enq.doc_birth_cert ? 1 : 0) + (enq.doc_transfer_cert ? 1 : 0))}/3
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        {/* Report Card Toggle */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleDoc(enq, 'doc_report_card', enq.doc_report_card, e)}
                          className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            enq.doc_report_card 
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                              : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                          }`}
                          title="Click to toggle Report Card received"
                        >
                          {enq.doc_report_card ? <Check className="h-3 w-3 text-emerald-600" /> : <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
                          <span>Report Card</span>
                        </button>

                        {/* Birth Cert Toggle */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleDoc(enq, 'doc_birth_cert', enq.doc_birth_cert, e)}
                          className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            enq.doc_birth_cert 
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                              : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                          }`}
                          title="Click to toggle Birth Certificate received"
                        >
                          {enq.doc_birth_cert ? <Check className="h-3 w-3 text-emerald-600" /> : <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
                          <span>Birth/ID</span>
                        </button>

                        {/* TC Toggle */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleDoc(enq, 'doc_transfer_cert', enq.doc_transfer_cert, e)}
                          className={`px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            enq.doc_transfer_cert 
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' 
                              : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                          }`}
                          title="Click to toggle TC received"
                        >
                          {enq.doc_transfer_cert ? <Check className="h-3 w-3 text-emerald-600" /> : <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
                          <span>TC</span>
                        </button>
                      </div>
                    </div>

                    {/* Drop Reason (If dropped) */}
                    {enq.stage === 'dropped' && enq.drop_reason && (
                      <div className="flex items-center justify-between text-[11px] p-2 rounded-xl font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                        <span>Drop Reason:</span>
                        <span className="font-bold">{enq.drop_reason}</span>
                      </div>
                    )}

                    {/* Call History & Discussion Notes */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Call History &amp; Discussion Notes:
                      </span>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 max-h-24 overflow-y-auto space-y-1 whitespace-pre-line">
                        {enq.notes ? (
                          enq.notes
                        ) : (
                          <span className="text-slate-400 italic">No call notes logged yet. Call parent &amp; record notes below.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                    {enq.stage !== 'converted' && enq.stage !== 'dropped' ? (
                      <>
                        <button
                          onClick={() => openCallModal(enq)}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          title="Call parent and record what they said"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          <span>Log Call Outcome</span>
                        </button>

                        <button
                          onClick={() => {
                            setConvertModalEnquiry(enq);
                            setConvertSection('A');
                          }}
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                          title="1-Click Enroll into SIS"
                        >
                          <span>Enroll SIS ✓</span>
                        </button>

                        <button
                          onClick={() => {
                            setDropModalEnquiry(enq);
                            setStandaloneDropReason('Fee Structure High');
                            setStandaloneDropNote('');
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                          title="Mark as Dropped"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </>
                    ) : enq.stage === 'converted' ? (
                      <div className="w-full flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold py-1">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Active in SIS Directory
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">EDU-ADM</span>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs py-1">
                        <span className="text-[11px] text-slate-400">Lead Archived</span>
                        <button
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
                    onChange={e => setRegPhone(e.target.value)} 
                    placeholder="e.g. +91 98450 12345" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
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

              {/* Initial Docs Check */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Documents Already Submitted:</span>
                <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-medium">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={regDocReportCard} onChange={e => setRegDocReportCard(e.target.checked)} className="rounded" />
                    <span>Report Card</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={regDocBirthCert} onChange={e => setRegDocBirthCert(e.target.checked)} className="rounded" />
                    <span>Birth/ID</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={regDocTransferCert} onChange={e => setRegDocTransferCert(e.target.checked)} className="rounded" />
                    <span>TC</span>
                  </label>
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
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">1-Click SIS Enrollment</h3>
                  <p className="text-[11px] text-slate-500">Promote enquiry to active Student Profile</p>
                </div>
              </div>
              <button onClick={() => setConvertModalEnquiry(null)} className="cursor-pointer">
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-white" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{convertModalEnquiry.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grade / Class:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{convertModalEnquiry.target_grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Parent &amp; Phone:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{convertModalEnquiry.parent_name} ({convertModalEnquiry.phone})</span>
                </div>
              </div>

              {/* Document Readiness Summary */}
              <div className={`p-2.5 rounded-xl border text-[11px] font-semibold ${
                convertModalEnquiry.doc_report_card && convertModalEnquiry.doc_birth_cert
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}>
                {convertModalEnquiry.doc_report_card && convertModalEnquiry.doc_birth_cert ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Essential Academic Documents Verified (Ready for Enrollment)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    Note: Report Card or Birth Cert pending (Can enroll provisionally)
                  </span>
                )}
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

                {convertFeeStatus === 'Paid' ? (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Payment Method</label>
                    <select
                      value={convertPaymentMethod}
                      onChange={e => setConvertPaymentMethod(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                    >
                      <option value="UPI (Google Pay)">UPI (Google Pay / PhonePe)</option>
                      <option value="Bank POS Card">Bank POS Debit/Credit Card</option>
                      <option value="Cash Counter">Cash Counter Settlement</option>
                      <option value="Demand Draft / Cheque">Demand Draft / Cheque</option>
                    </select>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                      ✓ Instant receipt will be issued &amp; forwarded to Accounts Coordinator for bank reconciliation.
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    ⏳ Unpaid invoice of ₹{convertAdmissionFee.toLocaleString()} will immediately pop into the Accounts Coordinator recovery queue.
                  </p>
                )}
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
                  Confirm &amp; Enroll in SIS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: STANDALONE DROP LEAD ── */}
      {dropModalEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mark Lead as Dropped</h3>
                <p className="text-[11px] text-slate-500">{dropModalEnquiry.student_name} ({dropModalEnquiry.parent_name})</p>
              </div>
              <button onClick={() => setDropModalEnquiry(null)} className="cursor-pointer">
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleConfirmStandaloneDrop} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Reason for Dropping *</label>
                <select 
                  value={standaloneDropReason} 
                  onChange={e => setStandaloneDropReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Fee Structure High">Fee Structure High (Budget Mismatch)</option>
                  <option value="Timing Conflict">Online Timing / Schedule Conflict</option>
                  <option value="Joined Another School">Joined Another School / Competitor</option>
                  <option value="Not Interested / Invalid Contact">Not Interested / Phone Unreachable</option>
                  <option value="Other">Other / Personal Reasons</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Additional Remarks (Optional)</label>
                <textarea 
                  rows={2}
                  value={standaloneDropNote} 
                  onChange={e => setStandaloneDropNote(e.target.value)} 
                  placeholder="e.g. Parent enrolled in another local school." 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDropModalEnquiry(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Confirm Drop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
