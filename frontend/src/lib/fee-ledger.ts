import { PaymentTransactionItem } from './types';

export interface TodayReceiptItem {
  recNo: string;
  name: string;
  classSec: string;
  head: string;
  amount: number;
  mode: string;
  ref: string;
  time: string;
  status: string;
}

export function formatSystemTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatSystemDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Baseline verified morning school receipts.
 */
export function generateDynamicBaselineReceipts(): TodayReceiptItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const now = new Date();
  const dateNum = now.getDate().toString().padStart(2, '0');
  const monthNum = (now.getMonth() + 1).toString().padStart(2, '0');
  const yearNum = now.getFullYear();

  const fixedTimes = ['11:45 AM', '11:20 AM', '10:50 AM', '10:15 AM', '09:40 AM', '09:15 AM', '08:45 AM'];

  const students = [
    { name: 'Ritik Sanyal', classSec: 'Class 7-A', head: 'Term 2 Tuition Fee', amount: 28000, mode: 'UPI (GPay)', ref: 'UPI-984210982' },
    { name: 'Diya Patel', classSec: 'Class 8-B', head: 'Term 2 Tuition & Lab', amount: 20000, mode: 'HDFC NetBanking', ref: 'NEFT-202610289' },
    { name: 'Kabir Mehta', classSec: 'Class 8-B', head: 'Term 2 Transport Fee', amount: 15000, mode: 'Cash Counter', ref: 'CASH-REC-0082' },
    { name: 'Rohan Verma', classSec: 'Class 9-A', head: 'Term 2 Tuition Fee', amount: 22000, mode: 'UPI (PhonePe)', ref: 'UPI-778219012' },
    { name: 'Ananya Iyer', classSec: 'Class 9-A', head: 'Annual STEM & Robotics', amount: 22000, mode: 'UPI (Paytm)', ref: 'UPI-661298411' },
    { name: 'Ishaan Reddy', classSec: 'Class 10-A', head: 'Term 2 Tuition Fee', amount: 15000, mode: 'ICICI NetBanking', ref: 'NEFT-441298410' },
    { name: 'Sneha Nair', classSec: 'Class 6-A', head: 'Term 2 Tuition Fee', amount: 16000, mode: 'UPI (GPay)', ref: 'UPI-334190822' },
  ];

  return students.map((st, idx) => ({
    recNo: `REC-${yearNum}-${monthNum}${dateNum}-0${idx + 1}`,
    name: st.name,
    classSec: st.classSec,
    head: st.head,
    amount: st.amount,
    mode: st.mode,
    ref: st.ref,
    time: fixedTimes[idx] || '09:00 AM',
    status: 'Bank Cleared'
  }));
}

export const INITIAL_TODAY_RECEIPTS: TodayReceiptItem[] = generateDynamicBaselineReceipts();

/**
 * Baseline payment transactions for Online Bank Verification.
 */
export function generateBaselineTransactions(): PaymentTransactionItem[] {
  return [
    {
      id: 101,
      utr_number: "UPI-984210982",
      student_name: "Aarav Sharma",
      class_name: "Class 8-B",
      parent_name: "Mr. Rajesh Sharma",
      amount: 35000,
      payment_method: "UPI (Google Pay)",
      bank_name: "HDFC School Collections Gateway",
      milestone_title: "Term 2 Tuition Fee",
      status: "Success",
      transaction_date: "Today",
      reconciled: true,
      reconciled_at: "Instant Auto-Settled",
      reconciled_by: "UPI Gateway Engine",
      gateway_ref: "REC-2026-1028-01",
      notes: "Settled via Parent Online Portal (PhonePe/UPI)",
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 102,
      utr_number: "NEFT-202610289",
      student_name: "Diya Patel",
      class_name: "Class 8-B",
      parent_name: "Mrs. Shobha Patel",
      amount: 20000,
      payment_method: "HDFC NetBanking",
      bank_name: "HDFC School Core Account",
      milestone_title: "Term 2 Tuition & Lab",
      status: "Success",
      transaction_date: "Today",
      reconciled: false, // Pending verification in Online Gateway ledger!
      reconciled_at: null,
      reconciled_by: null,
      gateway_ref: "REC-2026-1028-02",
      notes: "Direct bank transfer credited to school account.",
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 103,
      utr_number: "CASH-REC-0082",
      student_name: "Kabir Mehta",
      class_name: "Class 8-B",
      parent_name: "Mrs. Rekha Mehta",
      amount: 15000,
      payment_method: "Cash Counter",
      bank_name: "School Cash Counter Vault",
      milestone_title: "Term 2 Transport Fee",
      status: "Success",
      transaction_date: "Today",
      reconciled: true,
      reconciled_at: "Physical Cash Slip",
      reconciled_by: "Accounts Cash Desk",
      gateway_ref: "REC-2026-1028-03",
      notes: "Paid in cash at front counter desk.",
      created_at: new Date(Date.now() - 9000000).toISOString()
    },
    {
      id: 104,
      utr_number: "UPI-778219012",
      student_name: "Rohan Verma",
      class_name: "Class 9-A",
      parent_name: "Mr. S. Verma",
      amount: 22000,
      payment_method: "UPI (PhonePe)",
      bank_name: "HDFC School Collections Gateway",
      milestone_title: "Term 2 Tuition Fee",
      status: "Success",
      transaction_date: "Today",
      reconciled: false, // Pending verification!
      reconciled_at: null,
      reconciled_by: null,
      gateway_ref: "REC-2026-1028-04",
      notes: "Online QR checkout via PhonePe.",
      created_at: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 105,
      utr_number: "UPI-661298411",
      student_name: "Ananya Iyer",
      class_name: "Class 9-A",
      parent_name: "Mrs. Sangeeta Roy",
      amount: 22000,
      payment_method: "UPI (Paytm)",
      bank_name: "HDFC School Collections Gateway",
      milestone_title: "Annual STEM & Robotics",
      status: "Success",
      transaction_date: "Today",
      reconciled: true,
      reconciled_at: "Instant Auto-Settled",
      reconciled_by: "UPI Gateway Engine",
      gateway_ref: "REC-2026-1028-05",
      notes: "Settled via Parent Mobile UPI.",
      created_at: new Date(Date.now() - 12000000).toISOString()
    },
    {
      id: 106,
      utr_number: "NEFT-441298410",
      student_name: "Ishaan Reddy",
      class_name: "Class 10-A",
      parent_name: "Dr. K. V. Reddy",
      amount: 15000,
      payment_method: "ICICI NetBanking",
      bank_name: "ICICI Merchant Services",
      milestone_title: "Term 2 Tuition Fee",
      status: "Success",
      transaction_date: "Today",
      reconciled: false, // Pending verification!
      reconciled_at: null,
      reconciled_by: null,
      gateway_ref: "REC-2026-1028-06",
      notes: "Direct Corporate NetBanking transfer.",
      created_at: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: 107,
      utr_number: "UPI-334190822",
      student_name: "Sneha Nair",
      class_name: "Class 6-A",
      parent_name: "Mr. R. Nair",
      amount: 16000,
      payment_method: "UPI (Google Pay)",
      bank_name: "HDFC School Collections Gateway",
      milestone_title: "Term 2 Tuition Fee",
      status: "Success",
      transaction_date: "Today",
      reconciled: true,
      reconciled_at: "Instant Auto-Settled",
      reconciled_by: "UPI Gateway Engine",
      gateway_ref: "REC-2026-1028-07",
      notes: "Instant settlement via Google Pay.",
      created_at: new Date(Date.now() - 16000000).toISOString()
    }
  ];
}

const LIVE_RECEIPTS_KEY = 'edu360_live_paid_receipts';
const LEGACY_RECEIPTS_KEY = 'edu360_live_today_receipts';
const LIVE_TRANSACTIONS_KEY = 'edu360_payment_transactions';

const studentProfiles: Record<number, { name: string; classSec: string }> = {
  1: { name: 'Aarav Sharma', classSec: 'Class 8-B' },
  2: { name: 'Ananya Sharma', classSec: 'Class 3-A' },
  7: { name: 'Ananya Sharma', classSec: 'Class 3-A' },
  5: { name: 'Aarav Kumar', classSec: 'Class 3-A' },
  8: { name: 'Aarav Kumar', classSec: 'Class 3-A' },
  12: { name: 'John Fernandes', classSec: 'Class 10-A' }
};

// -------------------------------------------------------------
// LIVE RECEIPTS
// -------------------------------------------------------------

function saveLiveReceipts(receipts: TodayReceiptItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LIVE_RECEIPTS_KEY, JSON.stringify(receipts));
    localStorage.setItem(LEGACY_RECEIPTS_KEY, JSON.stringify(receipts));
  } catch {}
}

function readLiveReceipts(): TodayReceiptItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIVE_RECEIPTS_KEY) || localStorage.getItem(LEGACY_RECEIPTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy baseline seeds if present
        return parsed.filter(r => !r.recNo?.startsWith('REC-2026-1028-') && !r.recNo?.match(/REC-\d{4}-\d{4}-0\d$/));
      }
    }
  } catch {}
  return [];
}

/**
 * Returns today's consolidated live fee receipts list:
 * 1. Live paid receipts from primary store
 * 2. Scanned freshly settled milestones from parent portal storage (edu360_parent_fees_*)
 * 3. Scanned live payment transactions (edu360_payment_transactions)
 * 4. Verified morning school baseline receipts
 *
 * Deduplicated by recNo and guaranteed to have live parent payments at the TOP.
 */
export function getLiveTodayReceipts(): TodayReceiptItem[] {
  if (typeof window === 'undefined') return [];
  const dynamicBaseline = generateDynamicBaselineReceipts();

  const liveList: TodayReceiptItem[] = [];

  // 1. Direct live receipts from storage
  liveList.push(...readLiveReceipts());

  // 2. Scan all parent fee milestones in storage (edu360_parent_fees_*, edu360_stored_fees_*)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('edu360_parent_fees_') || key.startsWith('edu360_stored_fees_'))) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const items = JSON.parse(raw);
        if (!Array.isArray(items)) continue;

        const matchId = key.match(/_(\d+)$/);
        const sId = matchId ? Number(matchId[1]) : 1;
        const prof = studentProfiles[sId] || { name: 'Aarav Sharma', classSec: 'Class 8-B' };

        for (const m of items) {
          if (m && m.status === 'Paid') {
            const isHistorical = (sId === 1 && m.id <= 3) ||
                                 ((sId === 7 || sId === 2 || sId === 5 || sId === 8) && (m.id <= 3 || (m.id >= 101 && m.id <= 103))) ||
                                 (sId === 12 && m.id === 201);
            if (!isHistorical) {
              const recNo = m.receipt_no || `REC-2026-FEE-${sId}-${m.id}`;
              const tStr = m.paid_at && m.paid_at.includes(',')
                ? m.paid_at.split(',')[1].trim()
                : (m.paid_at || formatSystemTime(new Date()));

              const sName = (m as any).student_name || prof.name;
              const sClass = (m as any).class_name || prof.classSec;
              const sAmount = Number(m.amount) || (m.id === 5 ? 14500 : (m.id === 4 || m.id === 104 ? 15300 : 35000));

              liveList.push({
                recNo,
                name: sName,
                classSec: sClass,
                head: (m.title || 'Term 2 Tuition Fee').replace(/^Milestone \d+:\s*/, ''),
                amount: sAmount,
                mode: m.payment_method || 'UPI (PhonePe)',
                ref: `UPI-${Math.abs((m.id * 18492031) % 900000000) + 100000000}`,
                time: tStr,
                status: 'Bank Cleared'
              });
            }
          }
        }
      }
    }
  } catch {}

  // 3. Scan live payment transactions
  try {
    const rawTxs = localStorage.getItem(LIVE_TRANSACTIONS_KEY);
    if (rawTxs) {
      const txs = JSON.parse(rawTxs);
      if (Array.isArray(txs)) {
        for (const tx of txs) {
          if (tx && tx.gateway_ref && tx.gateway_ref.startsWith('REC-2026-FEE-')) {
            let txTime = '';
            if (tx.transaction_date) {
              const dStr = String(tx.transaction_date);
              const normalized = (!dStr.endsWith('Z') && !dStr.includes('+')) ? `${dStr}Z` : dStr;
              txTime = new Date(normalized).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            } else if ((tx as any).time) {
              txTime = (tx as any).time;
            } else {
              txTime = formatSystemTime(new Date());
            }

            liveList.push({
              recNo: tx.gateway_ref,
              name: tx.student_name,
              classSec: tx.class_name,
              head: tx.milestone_title,
              amount: Number(tx.amount),
              mode: tx.payment_method,
              ref: tx.utr_number,
              time: txTime,
              status: 'Bank Cleared'
            });
          }
        }
      }
    }
  } catch {}

  // 4. Combine: live receipts take first priority, followed by baseline
  const combined = [...liveList, ...dynamicBaseline];
  const seen = new Set<string>();
  const result: TodayReceiptItem[] = [];
  for (const item of combined) {
    if (item && item.recNo && !seen.has(item.recNo)) {
      seen.add(item.recNo);
      result.push(item);
    }
  }

  // Keep live receipts key synchronized
  try {
    const onlyLive = result.filter(r => !r.recNo.match(/REC-\d{4}-\d{4}-0\d$/));
    localStorage.setItem(LIVE_RECEIPTS_KEY, JSON.stringify(onlyLive));
    localStorage.setItem(LEGACY_RECEIPTS_KEY, JSON.stringify(result));
  } catch {}

  return result;
}

// -------------------------------------------------------------
// LIVE PAYMENT TRANSACTIONS (Online Bank Verification)
// -------------------------------------------------------------

function saveLiveTransactions(txs: PaymentTransactionItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LIVE_TRANSACTIONS_KEY, JSON.stringify(txs));
  } catch {}
}

export function getLivePaymentTransactions(): PaymentTransactionItem[] {
  const baseline = generateBaselineTransactions();
  if (typeof window === 'undefined') return baseline;

  try {
    const raw = localStorage.getItem(LIVE_TRANSACTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  saveLiveTransactions(baseline);
  return baseline;
}

export function reconcileLiveTransaction(id: number, reconciledBy: string = 'Mr. Arvind Krishnan'): PaymentTransactionItem[] {
  const current = getLivePaymentTransactions();
  const updated = current.map(tx => {
    if (tx.id === id) {
      return {
        ...tx,
        reconciled: true,
        reconciled_at: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        reconciled_by: reconciledBy
      };
    }
    return tx;
  });
  saveLiveTransactions(updated);
  broadcastStateChange({ updatedTransactions: updated });
  return updated;
}

export function bulkReconcileLiveTransactions(ids?: number[], reconciledBy: string = 'Mr. Arvind Krishnan'): PaymentTransactionItem[] {
  const current = getLivePaymentTransactions();
  const updated = current.map(tx => {
    if (!tx.reconciled && (!ids || ids.includes(tx.id))) {
      return {
        ...tx,
        reconciled: true,
        reconciled_at: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        reconciled_by: reconciledBy
      };
    }
    return tx;
  });
  saveLiveTransactions(updated);
  broadcastStateChange({ updatedTransactions: updated });
  return updated;
}

// -------------------------------------------------------------
// UNIFIED BROADCAST ENGINE (Multi-Channel + Multi-Key)
// -------------------------------------------------------------

function broadcastStateChange(payload: {
  receipt?: TodayReceiptItem;
  transaction?: PaymentTransactionItem;
  updatedReceipts?: TodayReceiptItem[];
  updatedTransactions?: PaymentTransactionItem[];
}): void {
  if (typeof window === 'undefined') return;

  const allReceipts = payload.updatedReceipts || getLiveTodayReceipts();
  const allTxs = payload.updatedTransactions || getLivePaymentTransactions();

  // 1. BroadcastChannel: 'edu360_fee_sync'
  if ('BroadcastChannel' in window) {
    try {
      const bc1 = new BroadcastChannel('edu360_fee_sync');
      bc1.postMessage({
        type: 'FEE_STATE_UPDATE',
        receipt: payload.receipt,
        transaction: payload.transaction,
        allReceipts,
        allTransactions: allTxs
      });
      setTimeout(() => { try { bc1.close(); } catch {} }, 2500);
    } catch {}

    // Legacy broadcast channel for backward compatibility
    try {
      const bc2 = new BroadcastChannel('edu360_global_transactions');
      bc2.postMessage({
        type: 'RECEIPT_RECORDED',
        receipt: payload.receipt,
        all: allReceipts,
        allReceipts
      });
      setTimeout(() => { try { bc2.close(); } catch {} }, 2500);
    } catch {}
  }

  // 2. CustomEvent: 'edu360_receipt_update' (same tab)
  try {
    window.dispatchEvent(new CustomEvent('edu360_receipt_update', {
      detail: {
        receipt: payload.receipt,
        transaction: payload.transaction,
        all: allReceipts,
        allTransactions: allTxs
      }
    }));
  } catch {}

  // 3. Storage trigger for other tabs
  try {
    localStorage.setItem('edu360_receipt_signal', Date.now().toString());
  } catch {}
}

/**
 * Records a new live receipt and optionally a matching payment transaction.
 */
export function recordLiveReceipt(item: TodayReceiptItem, tx?: PaymentTransactionItem): TodayReceiptItem[] {
  if (!item.time) {
    item.time = formatSystemTime(new Date());
  }

  const currentLive = readLiveReceipts();
  const updatedLive = [item, ...currentLive.filter(r => r.recNo !== item.recNo)];
  saveLiveReceipts(updatedLive);

  let updatedTxs: PaymentTransactionItem[] | undefined;
  const transaction = tx || {
    id: Date.now(),
    utr_number: item.ref,
    student_name: item.name,
    class_name: item.classSec,
    parent_name: 'Parent / Guardian',
    amount: item.amount,
    payment_method: item.mode,
    bank_name: 'HDFC School Collections Gateway',
    milestone_title: item.head,
    status: 'Success' as const,
    transaction_date: 'Today',
    reconciled: false,
    reconciled_at: null,
    reconciled_by: null,
    gateway_ref: item.recNo,
    notes: `Settled via Parent Online Portal (${item.mode})`,
    created_at: new Date().toISOString()
  };

  const currentTxs = getLivePaymentTransactions();
  updatedTxs = [transaction, ...currentTxs.filter(t => t.utr_number !== transaction.utr_number)];
  saveLiveTransactions(updatedTxs);

  const fullReceipts = getLiveTodayReceipts();
  broadcastStateChange({
    receipt: item,
    transaction,
    updatedReceipts: fullReceipts,
    updatedTransactions: updatedTxs
  });

  return fullReceipts;
}

/**
 * Records a live payment: adds both receipt and transaction atomically.
 */
export function recordLivePayment(receipt: TodayReceiptItem, tx: PaymentTransactionItem): {
  receipts: TodayReceiptItem[];
  transactions: PaymentTransactionItem[];
} {
  const receipts = recordLiveReceipt(receipt, tx);
  const transactions = getLivePaymentTransactions();
  return { receipts, transactions };
}

/**
 * Completely resets and clears all live parent-paid receipts & transactions,
 * reverting the ledger back to the verified morning baseline.
 */
export function resetLiveLedger(): {
  receipts: TodayReceiptItem[];
  transactions: PaymentTransactionItem[];
} {
  const baselineReceipts = generateDynamicBaselineReceipts();
  const baselineTxs = generateBaselineTransactions();

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LIVE_RECEIPTS_KEY);
      localStorage.removeItem(LEGACY_RECEIPTS_KEY);
      localStorage.removeItem(LIVE_TRANSACTIONS_KEY);

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('edu360_parent_fees_') || k.startsWith('edu360_stored_fees_'))) {
          localStorage.removeItem(k);
        }
      }

      saveLiveTransactions(baselineTxs);
      localStorage.setItem('edu360_receipt_signal', Date.now().toString());
    } catch {}

    broadcastStateChange({
      updatedReceipts: baselineReceipts,
      updatedTransactions: baselineTxs
    });
  }

  return { receipts: baselineReceipts, transactions: baselineTxs };
}

/**
 * React hook helper: sets up all cross-tab + same-tab listeners.
 * Call from useEffect. Returns cleanup function.
 */
export function setupReceiptSync(options: {
  onReceipts?: (receipts: TodayReceiptItem[]) => void;
  onTransactions?: (transactions: PaymentTransactionItem[]) => void;
}): () => void {
  const refresh = () => {
    if (options.onReceipts) options.onReceipts(getLiveTodayReceipts());
    if (options.onTransactions) options.onTransactions(getLivePaymentTransactions());
  };

  // Initial populate
  refresh();

  // 1. Same-tab CustomEvent listener
  const handleCustom = (e: any) => {
    if (e.detail?.all && options.onReceipts) {
      options.onReceipts(e.detail.all);
    } else if (options.onReceipts) {
      options.onReceipts(getLiveTodayReceipts());
    }

    if (e.detail?.allTransactions && options.onTransactions) {
      options.onTransactions(e.detail.allTransactions);
    } else if (options.onTransactions) {
      options.onTransactions(getLivePaymentTransactions());
    }
  };
  window.addEventListener('edu360_receipt_update', handleCustom);

  // 2. Cross-tab native storage event listener
  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === LIVE_RECEIPTS_KEY || 
      e.key === LEGACY_RECEIPTS_KEY || 
      e.key === LIVE_TRANSACTIONS_KEY || 
      e.key === 'edu360_receipt_signal' ||
      (e.key && e.key.startsWith('edu360_parent_fees_'))
    ) {
      refresh();
    }
  };
  window.addEventListener('storage', handleStorage);

  // 3. Cross-tab BroadcastChannel listener
  let bc1: BroadcastChannel | null = null;
  let bc2: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    try {
      bc1 = new BroadcastChannel('edu360_fee_sync');
      bc1.onmessage = (msg) => {
        if (msg.data?.allReceipts && options.onReceipts) {
          options.onReceipts(msg.data.allReceipts);
        } else if (options.onReceipts) {
          options.onReceipts(getLiveTodayReceipts());
        }

        if (msg.data?.allTransactions && options.onTransactions) {
          options.onTransactions(msg.data.allTransactions);
        } else if (options.onTransactions) {
          options.onTransactions(getLivePaymentTransactions());
        }
      };
    } catch {}

    try {
      bc2 = new BroadcastChannel('edu360_global_transactions');
      bc2.onmessage = (msg) => {
        refresh();
      };
    } catch {}
  }

  // 4. Window focus re-sync (when user clicks on this tab)
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', refresh);

  // 5. Polling fallback every 1.5 seconds for instant reactivity
  const pollInterval = setInterval(refresh, 1500);

  // Cleanup
  return () => {
    window.removeEventListener('edu360_receipt_update', handleCustom);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('focus', refresh);
    document.removeEventListener('visibilitychange', refresh);
    clearInterval(pollInterval);
    if (bc1) {
      try { bc1.close(); } catch {}
    }
    if (bc2) {
      try { bc2.close(); } catch {}
    }
  };
}
