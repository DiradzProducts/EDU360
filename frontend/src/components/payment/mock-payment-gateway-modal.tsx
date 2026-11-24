'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  Building2, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Smartphone
} from 'lucide-react';

interface MockPaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  studentName: string;
  className?: string;
  onSuccess: (method: string, referenceNo: string) => Promise<void> | void;
}

export function MockPaymentGatewayModal({
  isOpen,
  onClose,
  amount,
  title,
  studentName,
  className = '',
  onSuccess
}: MockPaymentGatewayModalProps) {
  const [tab, setTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Countdown timer for UPI QR
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  if (amount <= 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">All Dues Cleared ✓</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {studentName} ({title}) has an outstanding balance of ₹0. All milestone fees have been fully settled or waived. No payment is required.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-2.5 text-xs font-bold transition-all cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timerDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const vpaAddress = 'edu360.fees@icici';

  const handleCopyVpa = () => {
    navigator.clipboard?.writeText(vpaAddress);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleFillTestCard = () => {
    setCardNumber('4532 •••• •••• 8892');
    setCardHolder('RAJESH SHARMA');
    setExpiry('08/29');
    setCvv('782');
  };

  const handleAuthorize = async () => {
    setLoading(true);
    try {
      const refId = `TXN-${Date.now().toString().slice(-8)}`;
      let methodLabel = 'UPI';
      if (tab === 'upi') methodLabel = 'UPI (QR Code)';
      if (tab === 'card') methodLabel = `Credit/Debit Card (Ending ${cardNumber.slice(-4) || '8892'})`;
      if (tab === 'netbanking') methodLabel = `Net Banking (${selectedBank} Bank)`;

      await onSuccess(methodLabel, refId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-0">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight">EDU360 Virtual Fee Gateway</h3>
                <span className="text-[10px] uppercase font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded">
                  Sandbox Mock
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate max-w-xs">
                {title} • {studentName} {className && `(${className})`}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Amount Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Payable Dues</span>
          <div className="text-right">
            <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
              ₹{amount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
              0% Gateway Convenience Fee
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-2 bg-slate-100 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-center gap-1">
          <button
            type="button"
            onClick={() => setTab('upi')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'upi'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>UPI &amp; QR</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('card')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'card'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Card (Credit/Debit)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('netbanking')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'netbanking'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Net Banking</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* TAB 1: UPI / QR CODE */}
          {tab === 'upi' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Visual Dummy QR Code */}
                <div className="relative p-3 bg-white rounded-2xl border-2 border-indigo-200 shadow-sm shrink-0 flex flex-col items-center">
                  <div className="h-36 w-36 bg-slate-950 p-2 rounded-xl flex items-center justify-center relative overflow-hidden">
                    {/* SVG Realistic QR Matrix Pattern */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                      <rect x="0" y="0" width="30" height="30" rx="4" fill="white" />
                      <rect x="4" y="4" width="22" height="22" rx="2" fill="black" />
                      <rect x="8" y="8" width="14" height="14" fill="white" />
                      
                      <rect x="70" y="0" width="30" height="30" rx="4" fill="white" />
                      <rect x="74" y="4" width="22" height="22" rx="2" fill="black" />
                      <rect x="78" y="8" width="14" height="14" fill="white" />

                      <rect x="0" y="70" width="30" height="30" rx="4" fill="white" />
                      <rect x="4" y="74" width="22" height="22" rx="2" fill="black" />
                      <rect x="8" y="78" width="14" height="14" fill="white" />

                      <circle cx="50" cy="50" r="10" fill="#4f46e5" />
                      <path d="M42 42h16v16h-16z" fill="#ffffff" />
                      <circle cx="50" cy="50" r="4" fill="#4f46e5" />

                      {/* Random QR matrix blocks */}
                      <rect x="36" y="8" width="6" height="6" fill="white" />
                      <rect x="48" y="14" width="6" height="6" fill="white" />
                      <rect x="58" y="24" width="6" height="6" fill="white" />
                      <rect x="14" y="42" width="6" height="6" fill="white" />
                      <rect x="24" y="52" width="6" height="6" fill="white" />
                      <rect x="68" y="48" width="6" height="6" fill="white" />
                      <rect x="82" y="62" width="6" height="6" fill="white" />
                      <rect x="42" y="78" width="6" height="6" fill="white" />
                      <rect x="54" y="86" width="6" height="6" fill="white" />
                      <rect x="80" y="80" width="6" height="6" fill="white" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 mt-1.5 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-500" />
                    Expires in {timerDisplay}
                  </span>
                </div>

                {/* Scan Instructions & Supported Apps */}
                <div className="space-y-3 flex-1 text-left w-full">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Scan &amp; Pay using any UPI App:
                    </span>
                    <div className="flex items-center gap-2 pt-1">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'CRED'].map(app => (
                        <span key={app} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 block">School Registered UPI VPA</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {vpaAddress}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyVpa}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedVpa ? 'Copied!' : 'Copy VPA'}</span>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Once payment is completed on your phone, click the confirmation button below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREDIT / DEBIT CARD */}
          {tab === 'card' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enter Card Credentials
                </span>
                <button
                  type="button"
                  onClick={handleFillTestCard}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Autofill Sandbox Test Card</span>
                </button>
              </div>

              {/* Card Form */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8892"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 pl-9 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <CreditCard className="h-4 w-4 text-slate-400 absolute left-2.5 top-3" />
                    <span className="absolute right-2.5 top-2.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      VISA / RuPay
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Cardholder Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RAJESH SHARMA"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      maxLength={5}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      CVV / Security Code
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="•••"
                        value={cvv}
                        onChange={e => setCvv(e.target.value)}
                        maxLength={4}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                      />
                      <Lock className="h-3 w-3 text-slate-400 absolute right-2.5 top-3" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>PCI-DSS Level 1 &amp; 256-bit TLS Encrypted. OTP will be sent to registered mobile.</span>
              </div>
            </div>
          )}

          {/* TAB 3: NET BANKING */}
          {tab === 'netbanking' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Your Bank
              </span>

              {/* Popular Banks Grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC' },
                  { id: 'SBI', name: 'State Bank of India', code: 'SBI' },
                  { id: 'ICICI', name: 'ICICI Bank', code: 'ICICI' },
                  { id: 'AXIS', name: 'Axis Bank', code: 'AXIS' },
                  { id: 'KOTAK', name: 'Kotak Mahindra', code: 'KOTAK' },
                  { id: 'PNB', name: 'Punjab National Bank', code: 'PNB' }
                ].map(bank => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedBank(bank.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedBank === bank.id
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-mono font-black text-xs block text-slate-900 dark:text-white">
                      {bank.code}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                      {bank.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* All Other Banks Dropdown */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Or Select Another Scheduled Commercial Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={e => setSelectedBank(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="HDFC">HDFC Bank Retail NetBanking</option>
                  <option value="SBI">State Bank of India INB</option>
                  <option value="ICICI">ICICI Bank Retail NetBanking</option>
                  <option value="AXIS">Axis Bank Internet Banking</option>
                  <option value="KOTAK">Kotak Mahindra NetBanking</option>
                  <option value="PNB">Punjab National Bank Corporate/Retail</option>
                  <option value="BOB">Bank of Baroda Connect</option>
                  <option value="CANARA">Canara Bank NetBanking</option>
                  <option value="INDUSIND">IndusInd Bank IndusNet</option>
                  <option value="YES">YES Bank Retail NetBanking</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <Building2 className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>You will be securely redirected to <b>{selectedBank} Bank</b> gateway to complete authorization.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAuthorize}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {loading 
                ? 'Simulating Gateway Response...' 
                : tab === 'upi'
                ? `Confirm UPI Payment (₹${amount.toLocaleString('en-IN')})`
                : tab === 'card'
                ? `Authorize Card (₹${amount.toLocaleString('en-IN')})`
                : `Pay via ${selectedBank} (₹${amount.toLocaleString('en-IN')})`
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
