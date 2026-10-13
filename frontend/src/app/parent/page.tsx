'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  CreditCard, 
  Bus, 
  Target, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Send, 
  Download, 
  ShieldCheck, 
  ArrowRight,
  Stamp,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { 
  FocusTable, 
  BusRoute, 
  FeeMilestone, 
  HomeworkSubmission,
  ExitClearance,
  LeaveRequest
} from '@/lib/types';
import { BannerCarousel } from '@/components/banner-carousel';
import { FocusTableView } from '@/components/focus-table-view';
import { BusTracker } from '@/components/bus-tracker';
import { HomeworkCanvas } from '@/components/homework-canvas';
import { RoleGuard } from '@/components/role-guard';

export default function ParentPage() {
  const [activeTab, setActiveTab] = useState<'home' | 'focus' | 'bus' | 'fees' | 'leave'>('home');
  const [focusTable, setFocusTable] = useState<FocusTable | null>(null);
  const [busRoute, setBusRoute] = useState<BusRoute | null>(null);
  const [fees, setFees] = useState<FeeMilestone[]>([]);
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [exitClearance, setExitClearance] = useState<ExitClearance | null>(null);
  
  // Payment modal state
  const [payingMilestone, setPayingMilestone] = useState<FeeMilestone | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI (Google Pay)');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paying, setPaying] = useState(false);

  // Leave Form state
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [ftRes, busRes, feesRes, subRes, exitsRes] = await Promise.all([
          api.getFocusTable(1),
          api.getBusTracker(1),
          api.getFees(1),
          api.getSubmission(1),
          api.getExitClearances()
        ]);
        setFocusTable(ftRes);
        setBusRoute(busRes);
        setFees(feesRes);
        setSubmission(subRes);
        if (exitsRes && exitsRes.length > 0) {
          setExitClearance(exitsRes[0]);
        }
      } catch (err) {
        console.error("Error loading parent dashboard", err);
      }
    }
    loadData();
  }, []);

  const handleAdvanceBus = async () => {
    const updated = await api.stepBusRoute(1);
    setBusRoute(updated);
  };

  const handleToggleParentFocusCheck = async () => {
    await api.toggleParentFocusCheck(1);
    const updated = await api.getFocusTable(1);
    setFocusTable(updated);
  };

  const handlePayFee = async () => {
    if (!payingMilestone) return;
    setPaying(true);
    try {
      const updated = await api.payFee(payingMilestone.id, selectedPaymentMethod);
      const allFees = await api.getFees(1);
      setFees(allFees);
      setPaymentSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        setPaymentSuccess(false);
        setPayingMilestone(null);
      }, 3000);
    } finally {
      setPaying(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason) return;
    setLeaveSubmitted(true);
    setTimeout(() => {
      setLeaveSubmitted(false);
      setLeaveReason('');
      setLeaveFrom('');
      setLeaveTo('');
      alert("Leave application dispatched to Mrs. Ananya Verma");
    }, 1500);
  };

  const handleBannerAction = (target: string) => {
    if (target === 'marks' || target === 'focus') setActiveTab('focus');
    else if (target === 'bus') setActiveTab('bus');
    else if (target === 'fees') setActiveTab('fees');
  };

  const handleDigitalSignExit = async () => {
    await api.parentDigitalSignTC(1);
    const updatedExits = await api.getExitClearances();
    if (updatedExits && updatedExits.length > 0) {
      setExitClearance(updatedExits[0]);
    }
  };

  return (
    <RoleGuard allowedRole="parent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Anti-Spam Moving Slider Carousel */}
      <BannerCarousel onActionClick={handleBannerAction} />

      {/* Child Overview Bar & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-base shadow-sm">
            AS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Aarav Sharma • Class 8B</h2>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                Present Today
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Father: Mr. Rajesh Sharma • Roll #14 • Adm #EDU-2024-082
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🏠 Home Overview
          </button>
          <button
            onClick={() => setActiveTab('focus')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'focus'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🎯 Shared Focus Table
          </button>
          <button
            onClick={() => setActiveTab('bus')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'bus'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🚌 Live Bus GPS
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'fees'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            💳 Fees & Receipts
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'leave'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            📝 Apply Leave
          </button>
        </div>
      </div>

      {/* Tab: Home Overview */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">91.4%</span>
                <span className="text-xs font-bold text-emerald-600">On Track</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">No unexcused absences recorded</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Next Fee Milestone</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-600">₹18,500</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Due 25 Oct</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Term 2 Tuition & Transport</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Live Bus Telemetry</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-blue-600">{busRoute?.eta_mins || 8} mins</span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Route 4</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Approaching Sector 15 Crossroad</p>
            </div>
          </div>

          {/* Focus Table Preview */}
          {focusTable && (
            <FocusTableView
              table={focusTable}
              isParentView={true}
              onToggleParentCheck={handleToggleParentFocusCheck}
            />
          )}

          {/* Exit Clearance Digital Sign-off Banner (if active) */}
          {exitClearance && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-200 text-purple-900 px-2.5 py-0.5 text-[10px] font-bold">
                    Official Exit Handover
                  </span>
                  <span className="text-xs text-slate-500">Dual-Signature Verification</span>
                </div>
                <h3 className="mt-1 text-sm font-bold text-slate-900">
                  Transfer Certificate (TC) Digital Approval Request
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Confirm receipt of original certificates in good condition to permanently seal the archive record.
                </p>
              </div>

              {exitClearance.digital_parent_approved ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Digitally Stamped & Approved ✓</span>
                </div>
              ) : (
                <button
                  onClick={handleDigitalSignExit}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold shadow-sm"
                >
                  <Stamp className="h-4 w-4" />
                  <span>Provide Digital Sign-Off</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Shared Focus Table & Teacher Remarks */}
      {activeTab === 'focus' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Shared Student Focus Table & Teacher Annotations
            </h2>
            <p className="text-xs text-slate-500">
              Collaborate directly with Mrs. Ananya Verma on Aarav's weak concept intervention timetable
            </p>
          </div>

          {focusTable && (
            <FocusTableView
              table={focusTable}
              isParentView={true}
              onToggleParentCheck={handleToggleParentFocusCheck}
            />
          )}

          {/* Teacher Annotated Homework Viewer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Teacher-Corrected Homework: Worksheet #4
                </h3>
                <span className="text-xs text-slate-500">
                  View red ink remarks and teacher pedagogical feedback directly
                </span>
              </div>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                Score: 17.5 / 20
              </span>
            </div>

            {submission && (
              <HomeworkCanvas
                submission={submission}
                onSave={async () => {}}
                readOnly={true}
              />
            )}
          </div>
        </div>
      )}

      {/* Tab: Live Bus GPS Tracker */}
      {activeTab === 'bus' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live School Bus GPS Tracking (Route 4)
            </h2>
            <p className="text-xs text-slate-500">
              Live telemetry tracking school bus KA-01-EB-4412 along assigned stops with real-time ETA
            </p>
          </div>

          {busRoute ? (
            <BusTracker
              bus={busRoute}
              onAdvanceStop={handleAdvanceBus}
            />
          ) : (
            <div className="p-8 text-center text-slate-500">Connecting to GPS tracker...</div>
          )}
        </div>
      )}

      {/* Tab: Fees & Online Payments */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Fee Milestones & Automated Receipts
              </h2>
              <p className="text-xs text-slate-500">
                Installment breakdown with instant UPI/Card mock payment and downloadable PDF receipts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {fees.map((m) => {
              const isPaid = m.status === 'Paid';
              const isOverdue = m.status === 'Overdue';

              return (
                <div 
                  key={m.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between shadow-sm transition-all ${
                    isPaid 
                      ? 'border-emerald-200 bg-white' 
                      : isOverdue
                      ? 'border-amber-300 bg-amber-50/40 ring-2 ring-amber-100'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : isOverdue ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {m.status}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">Due: {m.due_date}</span>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-900">{m.title}</h3>
                    <div className="mt-2 text-2xl font-black text-slate-900 tabular-nums">
                      ₹{m.amount.toLocaleString()}
                    </div>

                    {isPaid && m.receipt_no && (
                      <div className="mt-3 rounded-xl bg-emerald-50 p-3 border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-800 block">Receipt #{m.receipt_no}</span>
                        <span className="text-[10px] text-emerald-700">Paid on {m.paid_at} via {m.payment_method}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    {isPaid ? (
                      <button
                        onClick={() => alert(`Downloading Official PDF Receipt for ${m.receipt_no}`)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5 text-blue-600" />
                        <span>Download PDF Receipt</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setPayingMilestone(m)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Pay Online (UPI / Card)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Modal */}
          {payingMilestone && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-900">
                  Instant Fee Payment Gateway (Mock)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {payingMilestone.title} • Aarav Sharma (Class 8B)
                </p>

                <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Total Payable Amount</span>
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    ₹{payingMilestone.amount.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2 mb-5">
                  <label className="block text-xs font-semibold text-slate-700">Select Payment Rail</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['UPI (Google Pay)', 'UPI (PhonePe)', 'Credit/Debit Card', 'Net Banking'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(method)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                          selectedPaymentMethod === method
                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPayingMilestone(null)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePayFee}
                    disabled={paying}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold shadow-md"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{paying ? 'Processing Payment...' : `Authorize ₹${payingMilestone.amount.toLocaleString()}`}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Apply Leave */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          <div className="max-w-xl">
            <h2 className="text-base font-bold text-slate-900">
              Submit Student Leave Request
            </h2>
            <p className="text-xs text-slate-500">
              Dispatches directly to Class Teacher Mrs. Ananya Verma with auto-attendance sync
            </p>

            <form onSubmit={handleApplyLeave} className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    value={leaveFrom}
                    onChange={(e) => setLeaveFrom(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    value={leaveTo}
                    onChange={(e) => setLeaveTo(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Absence</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Dental appointment or family medical commitment..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <Send className="h-4 w-4" />
                <span>Submit Leave Application to Class Teacher</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </RoleGuard>
  );
}
