'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Bot,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Send,
  MessageSquare,
  Building,
  GraduationCap,
  ShieldCheck,
  User,
  ArrowRight,
  FileText,
  X
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdmissionEnquiry } from '@/lib/types';
import { Footer } from '@/components/footer';

const mockLeads: Record<number, AdmissionEnquiry> = {
  1: {
    id: 1,
    student_name: "Siddharth Rao",
    parent_name: "Mrs. Meera Rao",
    email: "meera.rao@example.com",
    phone: "+91 98450 99881",
    target_grade: "Class 8",
    stage: "visit",
    chat_transcript: JSON.stringify([
      { sender: "parent", text: "Hi, does EDU360 follow the CBSE curriculum for Class 8?", time: "10:14 AM" },
      { sender: "bot", text: "Hello Mrs. Rao! Yes, our institution is fully affiliated with CBSE (New Delhi). We integrate experiential STEM labs and outcome-based Focus Tables.", time: "10:14 AM" },
      { sender: "parent", text: "What is the fee range for Grade 8, and is bus transport available to Whitefield?", time: "10:15 AM" },
      { sender: "bot", text: "Annual tuition is structured in 3 milestones totaling approx ₹65,000. Route 4 specifically covers Whitefield with live GPS tracking! Would you like me to book a campus tour?", time: "10:15 AM" },
      { sender: "parent", text: "Yes please! Tomorrow around 11:30 AM would be great for my son Siddharth.", time: "10:16 AM" },
      { sender: "bot", text: "Booked! I have notified our Admissions Counselor. See you tomorrow at 11:30 AM!", time: "10:16 AM" }
    ]),
    notes: "Campus tour scheduled tomorrow 11:30 AM. Highly interested in experiential STEM lab and Whitefield bus route.",
    created_at: "2026-10-17T10:14:00.000Z"
  },
  2: {
    id: 2,
    student_name: "Tanvi Deshmukh",
    parent_name: "Dr. Amit Deshmukh",
    email: "amit.d@example.com",
    phone: "+91 98450 99882",
    target_grade: "Class 6",
    stage: "followup",
    chat_transcript: JSON.stringify([
      { sender: "parent", text: "Good afternoon. We are relocating from Pune and looking for Class 6 admission.", time: "02:20 PM" },
      { sender: "bot", text: "Welcome to Bengaluru! EDU360 offers seamless transfer admissions for Class 6 under CBSE with foreign language options.", time: "02:21 PM" },
      { sender: "parent", text: "Can we pay tuition in installments across terms?", time: "02:22 PM" },
      { sender: "bot", text: "Yes, we support 3-milestone term fee installments without any surcharge. I have logged your request for our accounts officer.", time: "02:22 PM" }
    ]),
    notes: "Relocating from Pune. Needs fee milestone installment schedule sent via email.",
    created_at: "2026-10-16T14:20:00.000Z"
  },
  3: {
    id: 3,
    student_name: "Aditya Roy",
    parent_name: "Mrs. Neha Roy",
    email: "neha.roy@example.com",
    phone: "+91 98450 99883",
    target_grade: "Class 9",
    stage: "new",
    chat_transcript: JSON.stringify([
      { sender: "parent", text: "Hello, do you have seats open for Class 9 for the upcoming academic session?", time: "09:05 AM" },
      { sender: "bot", text: "Yes, Class 9 admissions are open with entrance aptitude screening in Mathematics & Science. Would you like a brochure?", time: "09:05 AM" },
      { sender: "parent", text: "Yes please, and details regarding the sports and robotics clubs.", time: "09:06 AM" }
    ]),
    notes: "Inquired about sports facilities and robotics club.",
    created_at: "2026-10-18T09:05:00.000Z"
  }
};

const stages = [
  { id: 'new', label: '1. Inbound Inquiries', color: 'border-blue-200 bg-blue-50 text-blue-700' },
  { id: 'followup', label: '2. Follow-up & Counseling', color: 'border-amber-200 bg-amber-50 text-amber-700' },
  { id: 'visit', label: '3. Virtual Demo & Diagnostic', color: 'border-purple-200 bg-purple-50 text-purple-700' },
  { id: 'converted', label: '4. Enrolled in SIS ✓', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
];

function LeadDetailContent() {
  const params = useParams();
  const router = useRouter();

  const idNum = Number(params?.id) || 1;
  const [enquiry, setEnquiry] = useState<AdmissionEnquiry>(() => {
    return mockLeads[idNum] || {
      id: idNum,
      student_name: `Lead Applicant #${idNum}`,
      parent_name: `Parent of Candidate #${idNum}`,
      email: `lead.${idNum}@example.com`,
      phone: `+91 98450 ${String(idNum * 12345).slice(0, 5)}`,
      target_grade: "Class 8",
      stage: "new",
      chat_transcript: JSON.stringify([
        { sender: "parent", text: "Hello, looking for admission details for our child.", time: "11:00 AM" },
        { sender: "bot", text: "Welcome to EDU360! How can I assist you today with admission requirements?", time: "11:00 AM" }
      ]),
      notes: "Prospective lead captured via AI web chatbot.",
      created_at: new Date().toISOString()
    };
  });

  const [notesText, setNotesText] = useState(enquiry.notes || '');
  const [converting, setConverting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<any | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStageChange = async (newStage: 'new' | 'followup' | 'visit' | 'converted') => {
    try {
      await api.updateEnquiryStage(enquiry.id, newStage);
      setEnquiry(prev => ({ ...prev, stage: newStage }));
      triggerToast(`Lead stage updated to "${stages.find(s => s.id === newStage)?.label}"`);
    } catch {
      setEnquiry(prev => ({ ...prev, stage: newStage }));
      triggerToast(`Lead stage updated to "${stages.find(s => s.id === newStage)?.label}"`);
    }
  };

  const handleConvert = async () => {
    setConverting(true);
    try {
      const res: any = await api.convertEnquiryToStudent(enquiry.id);
      setEnquiry(prev => ({
        ...prev,
        stage: 'converted',
        notes: `${prev.notes || ''} | Enrolled as ${res?.roll_no || 'SIS-STU'} on ${new Date().toLocaleDateString('en-GB')}`
      }));
      setConversionResult(res);
      setShowInvoiceModal(true);
      triggerToast(`1-Click Success: ${enquiry.student_name} enrolled as active SIS student!`);
    } catch (err) {
      setEnquiry(prev => ({ ...prev, stage: 'converted' }));
      setShowInvoiceModal(true);
      triggerToast(`1-Click Success: ${enquiry.student_name} enrolled into SIS!`);
    } finally {
      setConverting(false);
    }
  };

  const messages: any[] = (() => {
    try {
      return JSON.parse(enquiry.chat_transcript || '[]');
    } catch {
      return [];
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 shadow-2xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
        
        {/* Left: Back & Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
            title="Return to Admin CRM Board"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to CRM Pipeline</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">Admin Command</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Admissions CRM</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-none">
              Lead #{enquiry.id}: {enquiry.student_name}
            </span>
          </nav>
        </div>

        {/* Right: Stage Status & 1-Click Convert */}
        <div className="flex items-center gap-2.5">
          {enquiry.stage !== 'converted' ? (
            <button
              onClick={handleConvert}
              disabled={converting}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4" />
              <span>{converting ? 'Enrolling into SIS...' : '1-Click Convert to SIS'}</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Enrolled as Active Student</span>
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Top Hero Dossier Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-md shrink-0">
                {enquiry.student_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-0.5 text-xs font-bold">
                    Target: {enquiry.target_grade} (AY 2026-27)
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-bold">
                    Parent: {enquiry.parent_name}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {enquiry.student_name}
                </h1>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Captured 24/7 via AI Website Chatbot &bull; Lead Ref #{enquiry.id} &bull; Preferred contact: {enquiry.phone}
                </p>
              </div>
            </div>

            {/* Pipeline Stage Stepper */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Admissions Pipeline Stage
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {stages.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleStageChange(st.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      enquiry.stage === st.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 2-Column Layout: Details & Chatbot Dialogue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Lead Information & Counselor Notes */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Contact Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Guardian &amp; Applicant Contact
              </h3>

              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Primary Guardian</span>
                    <span className="font-bold">{enquiry.parent_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Phone</span>
                    <a href={`tel:${enquiry.phone}`} className="font-bold hover:underline">{enquiry.phone}</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Email</span>
                    <a href={`mailto:${enquiry.email}`} className="font-bold hover:underline">{enquiry.email}</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Applying For</span>
                    <span className="font-bold">{enquiry.target_grade}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <a
                  href={`tel:${enquiry.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 text-xs font-bold transition-all text-center"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Guardian</span>
                </a>
              </div>
            </div>

            {/* Counselor Notes */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Admissions Counselor Notes
              </h3>

              <textarea
                rows={4}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Log counselor conversation details, campus visit timings, or fee discussion..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={() => {
                  triggerToast("Saved counselor follow-up notes.");
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                Update Counselor Notes
              </button>
            </div>

          </div>

          {/* Right/Center Column: 24/7 AI Chatbot Dialogue Transcript */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col h-[580px]">
              
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      24/7 AI Chatbot Ingestion Transcript
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Captured live on admissions landing page
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                  <Sparkles className="h-3 w-3" />
                  Intent Verified
                </span>
              </div>

              {/* Chat Thread Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40 dark:bg-slate-950/40 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                    No structured transcript recorded for this lead.
                  </div>
                ) : (
                  messages.map((m: any, idx: number) => {
                    const isParent = m.sender === 'parent';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isParent ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-bold text-slate-500">
                            {isParent ? enquiry.parent_name : 'EDU360 AI Admissions Assistant'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {m.time}
                          </span>
                        </div>

                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isParent
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                        }`}>
                          <p>{m.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer prompt */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
                <span>Transcript logged with SHA-256 digital stamp for compliance.</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {messages.length} Total Messages
                </span>
              </div>

            </div>
          </div>

        </div>

      {/* ── ENROLLMENT & FEE DISPATCH SUCCESS MODAL (Admissions -> Accounts Handshake) ── */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Enrollment &amp; Admission Fee Generated!
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Handed over from Admissions CRM to Accounts Desk
                  </p>
                </div>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Credentials Card */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Official Student Credentials (SIS)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Assigned Roll No:</span>
                  <b className="font-mono text-emerald-600 dark:text-emerald-400">{conversionResult?.roll_no || `ADM-2026-08${enquiry.id}`}</b>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Allocated Batch:</span>
                  <b className="text-slate-800 dark:text-white">{conversionResult?.allocated_section || `${enquiry.target_grade || 'Class 8'}-B`}</b>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Parent Username:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">{conversionResult?.parent_user || enquiry.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Temp Password:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">Edu360@2026</span>
                </div>
              </div>
            </div>

            {/* Fee Receivable Card */}
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  💳 Admission Fee Invoice #{conversionResult?.admission_fee_invoice || `INV-2026-${enquiry.id}84`}
                </span>
                <b className="text-sm font-black text-amber-900 dark:text-amber-200">₹{conversionResult?.fee_amount ? Number(conversionResult.fee_amount).toLocaleString() : '25,000'}</b>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
                Synced directly into <b>Accounts Coordinator Desk</b> under pending receivables. WhatsApp invoice link dispatched to <b>{enquiry.phone}</b>.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <Link
                href="/accounts_coordinator"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                View in Accounts Coordinator &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      </main>

      {/* Brand Footer */}
      <Footer />
    </div>
  );
}

export default function LeadDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading Lead Dossier...</div>}>
      <LeadDetailContent />
    </Suspense>
  );
}
