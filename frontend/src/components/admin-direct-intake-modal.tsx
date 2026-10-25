'use client';

import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Sparkles, 
  Zap, 
  Crown, 
  CheckCircle2, 
  CreditCard, 
  FileText, 
  Phone, 
  User, 
  GraduationCap, 
  ArrowRight,
  ShieldAlert,
  Building
} from 'lucide-react';
import { api } from '@/lib/api';

interface AdminDirectIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function AdminDirectIntakeModal({
  isOpen,
  onClose,
  onSuccess
}: AdminDirectIntakeModalProps) {
  const [activeTab, setActiveTab] = useState<'direct_sis' | 'forward_vip'>('direct_sis');
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [targetGrade, setTargetGrade] = useState('Class 8');
  const [section, setSection] = useState('A');
  const [admissionFee, setAdmissionFee] = useState(25000);
  const [feeStatus, setFeeStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [vipNotes, setVipNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !parentName.trim() || !phone.trim()) {
      setErrorMsg('Please enter student name, parent name, and phone number.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await api.directEnroll({
        student_name: studentName.trim(),
        parent_name: parentName.trim(),
        phone: phone.trim(),
        email: email.trim() || `${studentName.toLowerCase().replace(/\s+/g, '')}@student.edu360.internal`,
        target_grade: targetGrade,
        section,
        admission_fee: admissionFee,
        fee_status: feeStatus,
        payment_method: paymentMethod,
        action_type: activeTab,
        notes: vipNotes.trim()
      });

      if (res?.success) {
        onSuccess(res.message);
        // Reset form
        setStudentName('');
        setParentName('');
        setPhone('');
        setEmail('');
        setVipNotes('');
        onClose();
      } else {
        setErrorMsg('Failed to process admission request. Please try again.');
      }
    } catch (err: any) {
      console.error('Direct enroll error:', err);
      setErrorMsg(err?.message || 'Server error occurred during admission enrolment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Executive Admission Intake
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Principal Cabin
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct spot enrolment or VIP concierge handoff to Admissions Desk
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('direct_sis')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'direct_sis'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-blue-500" />
              ⚡ Direct SIS Enrolment
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('forward_vip')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'forward_vip'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              👑 Forward as VIP Referral
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-160px)]">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action explanation pill */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
            {activeTab === 'direct_sis' ? (
              <span>
                <strong>Instant Spot Admission:</strong> Creates active student record, auto-generates Admission #, deposits verified TC & Report Card into Official Vault, and dispatches fee invoice to Accounts Coordinator.
              </span>
            ) : (
              <span>
                <strong>Concierge VIP Handoff:</strong> Creates high-priority lead in CRM with <em>"Management Referral"</em> tag and alerts Admissions Coordinator for priority onboarding & follow-up.
              </span>
            )}
          </div>

          {/* Candidate & Parent Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Candidate / Student Name *
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sravya Reddy"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Parent / Guardian Name *
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Venkat Reddy"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Primary Phone *
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Target Grade / Class *
              </label>
              <div className="relative">
                <GraduationCap className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>

          {/* Direct SIS Enrolment Specifics */}
          {activeTab === 'direct_sis' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Admission Fee & Section Allocation
                </span>
                <span className="text-[10px] text-slate-500">Auto-routes to Accounts Coordinator</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Admission Fee (₹)</label>
                  <input
                    type="number"
                    value={admissionFee}
                    onChange={(e) => setAdmissionFee(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Fee Payment Status</label>
                  <select
                    value={feeStatus}
                    onChange={(e) => setFeeStatus(e.target.value as 'Paid' | 'Pending')}
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Paid">Paid (Instant Receipt)</option>
                    <option value="Pending">Pending (Fee Due Alert)</option>
                  </select>
                </div>
              </div>

              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-medium pt-1">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                Transfer Certificate & Marks Card will be automatically sealed in Official Vault.
              </div>
            </div>
          )}

          {/* Forward VIP Specifics */}
          {activeTab === 'forward_vip' && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Principal VIP Note for Admissions Coordinator
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Sibling quota / Trustee referral. Give priority digital orientation and expedite scholarship assessment."
                value={vipNotes}
                onChange={(e) => setVipNotes(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                activeTab === 'direct_sis'
                  ? 'bg-blue-600 hover:bg-blue-500'
                  : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              {submitting ? (
                <span>Processing...</span>
              ) : activeTab === 'direct_sis' ? (
                <>
                  <Zap className="h-3.5 w-3.5" />
                  <span>Enrol Directly to SIS</span>
                </>
              ) : (
                <>
                  <Crown className="h-3.5 w-3.5" />
                  <span>Forward to Coordinator Desk</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
