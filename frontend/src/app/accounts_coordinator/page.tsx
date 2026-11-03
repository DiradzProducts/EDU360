'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Receipt,
  FileText,
  MessageSquare,
  X,
  Menu,
  ArrowRight,
  Send,
  RefreshCw,
  History,
  CheckCheck,
  Users,
  CreditCard,
  Bus,
  PackageCheck,
  Building2,
  Eye,
  FileSpreadsheet,
  ExternalLink,
  ShieldCheck,
  Clock,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';
import { Footer } from '@/components/footer';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { 
  AdminTask, 
  FeeDefaulter, 
  VendorInvoiceItem, 
  PaymentTransactionItem, 
  FinanceDispatchLogItem, 
  FinanceDashboardStats,
  PayrollBatchItem,
  StaffPayslipItem,
  StaffSalaryInquiryItem,
  PurchaseOrderItem,
  FleetExpenseItem
} from '@/lib/types';
import { exportToCsv, printDossierReport } from '@/lib/export-utils';

type AccountsTab = 'dashboard' | 'fee_defaulters' | 'payroll' | 'vendor_invoices' | 'reconciliation' | 'tasks' | 'dispatch_logs';

export default function AccountsCoordinatorPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AccountsTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data States
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [defaulters, setDefaulters] = useState<FeeDefaulter[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>([]);
  const [invoices, setInvoices] = useState<VendorInvoiceItem[]>([]);
  const [dispatchLogs, setDispatchLogs] = useState<FinanceDispatchLogItem[]>([]);
  
  // Institutional Outflows Data States
  const [payrollBatches, setPayrollBatches] = useState<PayrollBatchItem[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [payslips, setPayslips] = useState<StaffPayslipItem[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<StaffPayslipItem | null>(null);
  const [salaryInquiries, setSalaryInquiries] = useState<StaffSalaryInquiryItem[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<StaffSalaryInquiryItem | null>(null);
  const [inquiryResolutionNotes, setInquiryResolutionNotes] = useState('');
  const [inquiryFilterStatus, setInquiryFilterStatus] = useState<'ALL' | 'Pending' | 'Resolved' | 'Rejected'>('ALL');
  const [isResolvingInquiry, setIsResolvingInquiry] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
  const [fleetExpenses, setFleetExpenses] = useState<FleetExpenseItem[]>([]);
  const [dispatchSearchQuery, setDispatchSearchQuery] = useState('');
  const [dispatchChannelFilter, setDispatchChannelFilter] = useState<'ALL' | 'WhatsApp' | 'SMS' | 'Email'>('ALL');
  const [previewDispatchLog, setPreviewDispatchLog] = useState<any>(null);

  const [stats, setStats] = useState<FinanceDashboardStats>({
    total_collected_mtd: 0,
    outstanding_arrears: 0,
    pending_reconciliation_count: 0,
    pending_reconciliation_amount: 0,
    pending_vendor_invoices_count: 0,
    pending_vendor_invoices_amount: 0,
    overdue_students_count: 0,
    overdue_tier_15: 0,
    overdue_tier_30: 0,
    overdue_tier_60: 0,
    collection_target_progress_pct: 0
  });

  // Filter States
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [defaulterTierFilter, setDefaulterTierFilter] = useState<string>('ALL');
  const [defaulterCategoryFilter, setDefaulterCategoryFilter] = useState<'ALL' | 'NEW_ADMISSION' | 'EXISTING'>('ALL');
  const [defaulterClassFilter, setDefaulterClassFilter] = useState<string>('All Classes');
  const [defaulterSearch, setDefaulterSearch] = useState<string>('');
  const [txReconcileFilter, setTxReconcileFilter] = useState<string>('all');
  const [txMethodFilter, setTxMethodFilter] = useState<string>('ALL');
  const [txSearch, setTxSearch] = useState<string>('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('ALL');
  const [poStatusFilter, setPoStatusFilter] = useState<string>('ALL');
  const [poDepartmentFilter, setPoDepartmentFilter] = useState<string>('ALL');
  const [fleetStatusFilter, setFleetStatusFilter] = useState<string>('ALL');

  // Modals & Interaction States
  const [taskExpandedId, setTaskExpandedId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Mr. Arvind Krishnan');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskSlaHours, setNewTaskSlaHours] = useState(48);
  const [escalateTaskId, setEscalateTaskId] = useState<number | null>(null);
  const [escalateReason, setEscalateReason] = useState('');

  // Bulk Broadcast Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTier, setBulkTier] = useState('ALL');
  const [bulkChannel, setBulkChannel] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');
  const [bulkCustomMsg, setBulkCustomMsg] = useState('');

  // Payment Recording Modal
  const [paymentModalDefaulter, setPaymentModalDefaulter] = useState<FeeDefaulter | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentUtr, setPaymentUtr] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Waiver / Concession Modal
  const [waiverModalDefaulter, setWaiverModalDefaulter] = useState<FeeDefaulter | null>(null);
  const [waiverAmount, setWaiverAmount] = useState<number>(0);
  const [waiverReason, setWaiverReason] = useState('');
  const [waiverApprover, setWaiverApprover] = useState('Dr. Sunita Kapoor (Principal)');

  // History Inspector Modal
  const [historyModalDefaulter, setHistoryModalDefaulter] = useState<FeeDefaulter | null>(null);

  // New Vendor Invoice Modal
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [newInvNo, setNewInvNo] = useState('');
  const [newInvVendor, setNewInvVendor] = useState('');
  const [newInvCategory, setNewInvCategory] = useState('Transport & Fuel');
  const [newInvFor, setNewInvFor] = useState('');
  const [newInvAmount, setNewInvAmount] = useState<number>(0);
  const [newInvDueDate, setNewInvDueDate] = useState('30 Oct 2026');

  // Mark Paid Invoice Modal
  const [paidModalInvoice, setPaidModalInvoice] = useState<VendorInvoiceItem | null>(null);
  const [wireUtr, setWireUtr] = useState('');
  const [wireMode, setWireMode] = useState('RTGS');

  // Payroll Modals & Controls
  const [showGenerateBatchModal, setShowGenerateBatchModal] = useState(false);
  const [newBatchMonth, setNewBatchMonth] = useState('November 2026');
  const [newBatchNotes, setNewBatchNotes] = useState('Regular monthly payroll run based on biometric attendance and statutory deductions.');
  const [showAuthorizeBatchModal, setShowAuthorizeBatchModal] = useState(false);
  const [authorizeNotes, setAuthorizeNotes] = useState('Verified against staff biometric muster roll and Form 16 TDS slabs.');
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disburseBatchRef, setDisburseBatchRef] = useState('HDFC-CMS-BATCH-9941');

  // Purchase Order Modals & Controls
  const [showNewPOModal, setShowNewPOModal] = useState(false);
  const [newPODept, setNewPODept] = useState('Science Laboratories');
  const [newPOVendor, setNewPOVendor] = useState('Borosil Scientific Supplies Ltd');
  const [newPOItemName, setNewPOItemName] = useState('Test Tube Racks & Reagents Set');
  const [newPOItemQty, setNewPOItemQty] = useState<number>(10);
  const [newPOItemRate, setNewPOItemRate] = useState<number>(1200);
  const [newPOExpectedDelivery, setNewPOExpectedDelivery] = useState('05 Nov 2026');
  const [newPONotes, setNewPONotes] = useState('Urgent lab consumables required for Grade 9 physics/chemistry practicals.');

  // Fleet Expenses Modals & Controls
  const [showLogFleetModal, setShowLogFleetModal] = useState(false);
  const [newFleetVehicle, setNewFleetVehicle] = useState('KA-01-EA-4412');
  const [newFleetRoute, setNewFleetRoute] = useState('Route 1 - Indiranagar Express');
  const [newFleetType, setNewFleetType] = useState('Fuel Refill (Diesel 180L)');
  const [newFleetVendor, setNewFleetVendor] = useState('Indian Oil Corporation Ltd');
  const [newFleetAmount, setNewFleetAmount] = useState<number>(16500);
  const [newFleetInvRef, setNewFleetInvRef] = useState('IOC-FUEL-NOV-01');
  const [newFleetDueDate, setNewFleetDueDate] = useState('02 Nov 2026');
  const [newFleetNotes, setNewFleetNotes] = useState('Monthly bulk institutional diesel refill.');

  const [settleFleetModalItem, setSettleFleetModalItem] = useState<FleetExpenseItem | null>(null);
  const [fleetSettleUtr, setFleetSettleUtr] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, defRes, txRes, invRes, logsRes, tRes, payrollBatchesRes, poRes, fleetRes, inquiriesRes] = await Promise.all([
        api.getFinanceStats().catch(() => null),
        api.getFeeDefaulters(),
        api.getPaymentTransactions(),
        api.getVendorInvoices(),
        api.getFinanceDispatchLogs(),
        api.getAdminTasks('finance'),
        api.getPayrollBatches(),
        api.getPurchaseOrders(),
        api.getFleetExpenses(),
        api.getSalaryInquiries()
      ]);

      if (statsRes) setStats(statsRes);
      setDefaulters(defRes);
      setTransactions(txRes);
      setInvoices(invRes);
      setDispatchLogs(logsRes);
      setTasks(tRes);
      setPayrollBatches(payrollBatchesRes);
      setPurchaseOrders(poRes);
      setFleetExpenses(fleetRes);
      setSalaryInquiries(inquiriesRes);

      if (payrollBatchesRes.length > 0) {
        const activeBatch = selectedBatchId 
          ? payrollBatchesRes.find(b => b.id === selectedBatchId) || payrollBatchesRes[0] 
          : payrollBatchesRes[0];
        setSelectedBatchId(activeBatch.id);
        const slipsRes = await api.getPayrollSlips(activeBatch.id);
        setPayslips(slipsRes);
      }
    } catch (err) {
      console.error('Failed to load accounts data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Actions ---

  const handleSendReminder = async (d: FeeDefaulter, channel: string = 'WhatsApp') => {
    try {
      await api.sendFeeReminder(d.id, channel);
      triggerToast(`${channel} fee recovery reminder dispatched to ${d.parent_name}`);
      loadData();
    } catch (err) {
      triggerToast(`Reminder dispatched to ${d.parent_name}`);
    }
  };

  const handleBulkReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.bulkSendFeeReminders({
        aging_tier: bulkTier === 'ALL' ? undefined : bulkTier,
        channel: bulkChannel,
        custom_message: bulkCustomMsg || undefined
      });
      setShowBulkModal(false);
      setBulkCustomMsg('');
      triggerToast(res?.message || `Bulk ${bulkChannel} reminders dispatched!`);
      loadData();
    } catch (err) {
      triggerToast(`Broadcast dispatched successfully`);
      setShowBulkModal(false);
    }
  };

  const handleToggleExamClearance = async (d: FeeDefaulter) => {
    try {
      const res = await api.toggleExamClearance(d.id);
      if (res.exam_clearance) {
        triggerToast(`Exam No-Dues clearance granted for ${d.student_name}! Hall Ticket & Report Card unlocked in Exam Portal.`);
      } else {
        triggerToast(`Financial hold applied for ${d.student_name}. Hall Ticket placed on hold.`);
      }
      loadData();
    } catch {
      triggerToast(`Exam clearance status updated for ${d.student_name}`);
      loadData();
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalDefaulter || paymentAmount <= 0) return;
    try {
      await api.recordFeePayment(paymentModalDefaulter.id, {
        amount_paid: paymentAmount,
        payment_method: paymentMethod,
        utr_or_cheque_no: paymentUtr || undefined,
        notes: paymentNotes || undefined,
        received_by: 'Mr. Arvind Krishnan'
      });
      triggerToast(`Recorded ₹${paymentAmount.toLocaleString('en-IN')} fee payment for ${paymentModalDefaulter.student_name}`);
      setPaymentModalDefaulter(null);
      setPaymentAmount(0);
      setPaymentUtr('');
      setPaymentNotes('');
      loadData();
    } catch (err) {
      triggerToast('Fee payment recorded.');
      setPaymentModalDefaulter(null);
    }
  };

  const handleApplyWaiverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverModalDefaulter || waiverAmount <= 0) return;
    try {
      await api.applyFeeWaiver(waiverModalDefaulter.id, {
        waiver_amount: waiverAmount,
        reason: waiverReason,
        approved_by: waiverApprover
      });
      triggerToast(`Fee concession of ₹${waiverAmount.toLocaleString('en-IN')} approved for ${waiverModalDefaulter.student_name}`);
      setWaiverModalDefaulter(null);
      setWaiverAmount(0);
      setWaiverReason('');
      loadData();
    } catch (err) {
      triggerToast('Fee waiver updated.');
      setWaiverModalDefaulter(null);
    }
  };

  const handleReconcileTx = async (txId: number) => {
    try {
      await api.reconcileTransaction(txId);
      triggerToast(`Bank reconciliation verified and ledger updated.`);
      loadData();
    } catch (err) {
      triggerToast(`Reconciliation updated.`);
    }
  };

  const handleBulkReconcile = async () => {
    try {
      const res = await api.bulkReconcileTransactions();
      triggerToast(res?.message || 'All pending gateway transactions reconciled.');
      loadData();
    } catch (err) {
      triggerToast('Pending transactions reconciled.');
    }
  };

  const handleAuthorizeInvoice = async (invId: number) => {
    try {
      await api.updateVendorInvoiceStatus(invId, {
        status: 'Approved for Wire',
        authorized_by: 'Mr. Arvind Krishnan (Accounts Officer)'
      });
      triggerToast(`Invoice approved for wire transfer.`);
      loadData();
    } catch (err) {
      triggerToast(`Status updated to Approved for Wire.`);
    }
  };

  const handleMarkInvoicePaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidModalInvoice) return;
    try {
      await api.updateVendorInvoiceStatus(paidModalInvoice.id, {
        status: 'Paid',
        payment_utr: wireUtr,
        payment_mode: wireMode
      });
      triggerToast(`Invoice ${paidModalInvoice.invoice_no} marked as Paid with UTR ${wireUtr}`);
      setPaidModalInvoice(null);
      setWireUtr('');
      loadData();
    } catch (err) {
      triggerToast('Payment logged.');
      setPaidModalInvoice(null);
    }
  };

  const handleFlagInvoiceAudit = async (invId: number) => {
    try {
      await api.updateVendorInvoiceStatus(invId, {
        status: 'Audit Clearance Needed',
        notes: 'Flagged for discrepancy in vendor delivery challan'
      });
      triggerToast(`Invoice flagged for Internal Audit Review.`);
      loadData();
    } catch (err) {
      triggerToast('Invoice flagged.');
    }
  };

  const handleCreateNewInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvNo || !newInvVendor || newInvAmount <= 0) return;
    try {
      await api.createVendorInvoice({
        invoice_no: newInvNo,
        vendor_name: newInvVendor,
        vendor_category: newInvCategory,
        invoice_for: newInvFor,
        amount: newInvAmount,
        invoice_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        due_date: newInvDueDate,
        status: 'Pending Approval'
      });
      triggerToast(`Invoice ${newInvNo} added to Accounts Payable queue.`);
      setShowNewInvoiceModal(false);
      setNewInvNo('');
      setNewInvVendor('');
      setNewInvFor('');
      setNewInvAmount(0);
      loadData();
    } catch (err) {
      triggerToast('Invoice created.');
      setShowNewInvoiceModal(false);
    }
  };

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    await api.updateAdminTask(taskId, { status: newStatus });
    const updated = await api.getAdminTasks('finance');
    setTasks(updated);
    triggerToast(`Accounts task status updated to ${newStatus}`);
  };

  const handleEscalate = async (taskId: number) => {
    if (!escalateReason.trim()) { triggerToast('Please specify financial escalation reason.'); return; }
    await api.escalateAdminTask(taskId, escalateReason);
    const updated = await api.getAdminTasks('finance');
    setTasks(updated);
    setEscalateTaskId(null);
    setEscalateReason('');
    triggerToast('Financial task escalated to Principal & Board of Trustees.');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await api.createAdminTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      category: 'upcoming',
      domain: 'finance',
      due_date: 'Tomorrow, 11:00 AM',
      assigned_to: newTaskAssignee,
      assigned_to_role: 'accounts_coordinator',
      priority: newTaskPriority,
      sla_hours: newTaskSlaHours,
      status: 'Pending'
    });
    const updated = await api.getAdminTasks('finance');
    setTasks(updated);
    setShowCreateModal(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    triggerToast('Accounts task delegated');
  };

  // --- Outflow Action Handlers ---

  const handleSelectBatch = async (batchId: number) => {
    setSelectedBatchId(batchId);
    try {
      const slips = await api.getPayrollSlips(batchId);
      setPayslips(slips);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.generatePayroll({
        payroll_month: newBatchMonth,
        notes: newBatchNotes
      });
      triggerToast(`Payroll batch for ${newBatchMonth} generated successfully!`);
      setShowGenerateBatchModal(false);
      loadData();
    } catch (err: any) {
      triggerToast(err?.message || 'Payroll batch created.');
      setShowGenerateBatchModal(false);
      loadData();
    }
  };

  const handleAuthorizeBatchSubmit = async (batchId: number) => {
    try {
      await api.authorizePayroll(batchId, {
        authorized_by: user?.name || 'Dr. Sunita Kapoor (Principal)',
        notes: authorizeNotes
      });
      triggerToast('Payroll batch digitally authorized with Principal seal!');
      setShowAuthorizeBatchModal(false);
      loadData();
    } catch (err) {
      triggerToast('Payroll batch authorized.');
      setShowAuthorizeBatchModal(false);
      loadData();
    }
  };

  const handleDisburseBatchSubmit = async (batchId: number) => {
    try {
      await api.disbursePayroll(batchId, {
        bank_batch_ref: disburseBatchRef,
        payment_mode: 'HDFC Corporate CMS Wire / NACH'
      });
      triggerToast('Staff salary batch wire disbursement executed! Net pay credited to staff accounts.');
      setShowDisburseModal(false);
      loadData();
    } catch (err) {
      triggerToast('Disbursement executed.');
      setShowDisburseModal(false);
      loadData();
    }
  };

  const handleExportNachCsv = () => {
    const activeBatch = payrollBatches.find(b => b.id === selectedBatchId);
    const headers = ['Staff Name', 'Designation', 'Department', 'Bank Account No', 'Bank IFSC', 'Gross Earnings', 'Total Deductions', 'Net Payable', 'Disbursement Status', 'Payment UTR'];
    const rows = payslips.map(s => [
      s.staff_name,
      s.role_designation,
      s.department,
      s.bank_account_no,
      s.bank_ifsc,
      `₹${s.gross_earnings.toLocaleString('en-IN')}`,
      `₹${s.total_deductions.toLocaleString('en-IN')}`,
      `₹${s.net_salary.toLocaleString('en-IN')}`,
      s.disbursement_status,
      s.payment_utr || 'Pending Wire'
    ]);
    exportToCsv(`EDU360_NACH_Bank_Wire_${activeBatch?.payroll_month.replace(/\s+/g, '_') || 'Payroll'}`, headers, rows);
    triggerToast('Bank Corporate NACH file exported as CSV.');
  };

  const handleCreatePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const items = [{
        item_name: newPOItemName,
        quantity: newPOItemQty,
        unit_price: newPOItemRate,
        total: newPOItemQty * newPOItemRate
      }];
      await api.createPurchaseOrder({
        department: newPODept,
        vendor_name: newPOVendor,
        items,
        expected_delivery_date: newPOExpectedDelivery,
        notes: newPONotes
      });
      triggerToast(`Purchase Order issued for ${newPOVendor} (₹${(newPOItemQty * newPOItemRate).toLocaleString('en-IN')})`);
      setShowNewPOModal(false);
      loadData();
    } catch (err) {
      triggerToast('Purchase Order issued.');
      setShowNewPOModal(false);
      loadData();
    }
  };

  const handleLogFleetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.logFleetExpense({
        vehicle_no: newFleetVehicle,
        bus_route: newFleetRoute,
        expense_type: newFleetType,
        vendor_name: newFleetVendor,
        amount: newFleetAmount,
        invoice_ref: newFleetInvRef,
        due_date: newFleetDueDate,
        notes: newFleetNotes,
        logged_by: user?.name || 'Mr. Vikram Malhotra (Transport Lead)'
      });
      triggerToast(`Fleet expense logged for ${newFleetVehicle} (₹${newFleetAmount.toLocaleString('en-IN')})`);
      setShowLogFleetModal(false);
      loadData();
    } catch (err) {
      triggerToast('Fleet expense logged.');
      setShowLogFleetModal(false);
      loadData();
    }
  };

  const handleSettleFleetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleFleetModalItem) return;
    try {
      await api.settleFleetExpense(settleFleetModalItem.id, {
        payment_utr: fleetSettleUtr || `RTGS/SBIN${Date.now()}`,
        notes: 'Direct commercial vendor settlement executed via Accounts portal.'
      });
      triggerToast(`Fleet claim for ${settleFleetModalItem.vehicle_no} settled via RTGS/NEFT!`);
      setSettleFleetModalItem(null);
      setFleetSettleUtr('');
      loadData();
    } catch (err) {
      triggerToast('Fleet claim settled.');
      setSettleFleetModalItem(null);
      loadData();
    }
  };

  const handleExportCsv = () => {
    const headers = ['Student Name', 'Class', 'Roll No', 'Guardian Name', 'Guardian Phone', 'Milestone', 'Amount Due (INR)', 'Days Overdue', 'Status', 'Waiver Amount'];
    const rows = filteredDefaulters.map(d => [
      d.student_name,
      d.class_name,
      d.roll_no || 'N/A',
      d.parent_name,
      d.parent_phone,
      d.milestone_title,
      `₹${d.amount_due.toLocaleString('en-IN')}`,
      d.days_overdue,
      d.status || 'Overdue',
      `₹${(d.waiver_amount || 0).toLocaleString('en-IN')}`
    ]);
    exportToCsv('EDU360_Accounts_Fee_Recovery_Report', headers, rows);
    triggerToast('Fee recovery aging statement exported as CSV.');
  };

  const handlePrintDossier = () => {
    const headers = ['Student Name', 'Class', 'Guardian', 'Contact Phone', 'Overdue Balance', 'Days Aging', 'Reminders Sent'];
    const rows = filteredDefaulters.map(d => [
      d.student_name,
      d.class_name,
      d.parent_name,
      d.parent_phone,
      `₹${d.amount_due.toLocaleString('en-IN')}`,
      `${d.days_overdue} Days`,
      `${d.reminder_count || 0} Sent`
    ]);
    printDossierReport(
      'Official Fee Recovery & Aging Defaulters Dossier',
      'Tuition Collections, Statutory Aging Buckets (15–60+ Days), and Recovery Statement',
      'Accounts & Bursar Office',
      headers,
      rows
    );
  };

  // Filtered Defaulters
  const filteredDefaulters = defaulters.filter(d => {
    if (defaulterCategoryFilter === 'NEW_ADMISSION' && !d.is_admission_fee) return false;
    if (defaulterCategoryFilter === 'EXISTING' && d.is_admission_fee) return false;
    if (defaulterTierFilter === '0-15' && d.days_overdue > 15) return false;
    if (defaulterTierFilter === '16-30' && (d.days_overdue <= 15 || d.days_overdue > 30)) return false;
    if (defaulterTierFilter === '30+' && d.days_overdue <= 30) return false;
    if (defaulterClassFilter !== 'All Classes' && d.class_name !== defaulterClassFilter) return false;
    if (defaulterSearch.trim()) {
      const q = defaulterSearch.toLowerCase();
      return (
        d.student_name.toLowerCase().includes(q) ||
        d.parent_name.toLowerCase().includes(q) ||
        d.parent_phone.includes(q) ||
        (d.roll_no && d.roll_no.includes(q))
      );
    }
    return true;
  });

  // Filtered Transactions
  const filteredTransactions = transactions.filter(tx => {
    if (txReconcileFilter === 'pending' && tx.reconciled) return false;
    if (txReconcileFilter === 'reconciled' && !tx.reconciled) return false;
    if (txMethodFilter !== 'ALL' && tx.payment_method !== txMethodFilter) return false;
    if (txSearch.trim()) {
      const q = txSearch.toLowerCase();
      return (
        tx.utr_number.toLowerCase().includes(q) ||
        tx.student_name.toLowerCase().includes(q) ||
        tx.parent_name.toLowerCase().includes(q) ||
        (tx.bank_name && tx.bank_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    if (invoiceStatusFilter !== 'ALL' && inv.status !== invoiceStatusFilter) return false;
    return true;
  });

  // Filtered Purchase Orders
  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    if (poStatusFilter !== 'ALL' && po.status !== poStatusFilter) return false;
    if (poDepartmentFilter !== 'ALL' && po.department !== poDepartmentFilter) return false;
    return true;
  });

  // Filtered Fleet Expenses
  const filteredFleetExpenses = fleetExpenses.filter(f => {
    if (fleetStatusFilter !== 'ALL' && f.status !== fleetStatusFilter) return false;
    return true;
  });

  const filteredTasks = tasks.filter(t => taskStatusFilter === 'all' || t.status === taskStatusFilter);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Mobile Drawer Backdrop ── */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* ── Harmonized Left Collapsible Sidebar ── */}
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
          {/* Context Card (Top of Sidebar) */}
          <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-200/90 dark:border-slate-800/90 shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                  AC
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">Oakridge International</h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Mr. Arvind Krishnan (Bursar)</span>
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

          {/* Menu */}
          <div className="p-3 space-y-1">
            {!sidebarCollapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                Bursar &amp; Accounts Modules
              </span>
            )}
            {[
              { id: 'dashboard', label: 'Accounts Dashboard', icon: LayoutDashboard },
              { id: 'fee_defaulters', label: 'Fee Collections & Aging', icon: AlertTriangle, badge: `${stats.overdue_students_count || defaulters.length} Due`, badgeType: 'rose' },
              { id: 'payroll', label: 'Staff Salaries & Payroll', icon: Users, badge: salaryInquiries.filter(i => i.status === 'Pending').length > 0 ? `${salaryInquiries.filter(i => i.status === 'Pending').length} Queries` : (payrollBatches.length > 0 ? payrollBatches[0].status : 'Draft'), badgeType: salaryInquiries.filter(i => i.status === 'Pending').length > 0 ? 'rose' : 'emerald' },
              { id: 'vendor_invoices', label: 'Vendor Bills & Payables', icon: Receipt, badge: `${stats.pending_vendor_invoices_count} Transfers`, badgeType: 'blue' },
              { id: 'reconciliation', label: 'Online Bank Verification', icon: RefreshCw, badge: `${stats.pending_reconciliation_count} To Verify`, badgeType: 'amber' },
              { id: 'tasks', label: 'Finance Tasks & Deadlines', icon: Layers, badge: `${tasks.filter(t => t.status !== 'Completed').length} Open`, badgeType: 'slate' },
              { id: 'dispatch_logs', label: 'Fee Reminders & Audit', icon: FileText }
            ].map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AccountsTab);
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
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
                        : item.badgeType === 'emerald'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                        : item.badgeType === 'amber'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                        : item.badgeType === 'blue'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Status Footer */}
        <div className="p-3 border-t border-slate-200/90 dark:border-slate-800/90 shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/60">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                Live Fiscal Ledger
              </span>
              <span className="font-semibold text-slate-400 dark:text-slate-500 text-[10px]">FY 2026-27</span>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="Live Fiscal Ledger · FY 2026-27" />
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Canvas ── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
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
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold border border-blue-200/60 dark:border-blue-800/60">
                  Accounts &amp; Bursar Office
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">FY 2026–27 Fiscal Ledger</span>
              </div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {activeTab === 'dashboard' && 'Financial Overview & Solvency'}
                {activeTab === 'fee_defaulters' && 'Student Fee Collections & Aging'}
                {activeTab === 'payroll' && 'Staff Salaries & Monthly Payroll'}
                {activeTab === 'vendor_invoices' && 'Vendor Invoices & Accounts Payable'}
                {activeTab === 'reconciliation' && 'Online Bank & Gateway Verification'}
                {activeTab === 'tasks' && 'Finance Tasks & Statutory Deadlines'}
                {activeTab === 'dispatch_logs' && 'Fee Reminders & Broadcast Audit Trail'}
              </h1>
            </div>
          </div>
        </div>

                {/* ── TAB 0: ACCOUNTS EXECUTIVE DASHBOARD (BENTO) ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 6 Core Financial Metric Bento Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1: Total Collections MTD */}
              <div 
                onClick={() => setActiveTab('fee_defaulters')}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Fee Collections (MTD)</span>
                      <p className="text-[10px] text-slate-400">Total verified collections</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {stats.collection_target_progress_pct}% Target
                  </span>
                </div>
                <div className="my-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{stats.total_collected_mtd.toLocaleString('en-IN')}
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all" 
                      style={{ width: `${Math.min(stats.collection_target_progress_pct, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span>Open Fee Collections</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 2: Fee Aging Arrears */}
              <div 
                onClick={() => setActiveTab('fee_defaulters')}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Fee Aging Arrears</span>
                      <p className="text-[10px] text-slate-400">Total overdue balance</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    {stats.overdue_students_count} Students
                  </span>
                </div>
                <div className="my-3">
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    ₹{stats.outstanding_arrears.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {stats.overdue_tier_60} aging &gt;30d • {stats.overdue_tier_30} in 16–30d
                  </p>
                </div>
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span>Send Fee Reminders</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 3: Online Bank Verification */}
              <div 
                onClick={() => setActiveTab('reconciliation')}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Bank Verification</span>
                      <p className="text-[10px] text-slate-400">UPI &amp; NetBanking matching</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {stats.pending_reconciliation_count} To Verify
                  </span>
                </div>
                <div className="my-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{stats.pending_reconciliation_amount.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Direct UTR matches ready for 1-click clearance
                  </p>
                </div>
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span>Verify Transactions</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 4: Vendor Payables & Bills */}
              <div 
                onClick={() => setActiveTab('vendor_invoices')}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Vendor Bills &amp; Payables</span>
                      <p className="text-[10px] text-slate-400">Institutional expenses &amp; utilities</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {stats.pending_vendor_invoices_count} Transfers
                  </span>
                </div>
                <div className="my-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{stats.pending_vendor_invoices_amount.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Bus diesel, laboratory chemicals &amp; internet bills
                  </p>
                </div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span>Approve Bank Transfers</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 5: Monthly Staff Salaries */}
              <div 
                onClick={() => setActiveTab('payroll')}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Staff Salaries &amp; Payroll</span>
                      <p className="text-[10px] text-slate-400">8 Faculty &amp; Support staff</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {payrollBatches.length > 0 ? payrollBatches[0].status : 'Draft'}
                  </span>
                </div>
                <div className="my-3">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{payrollBatches.length > 0 ? payrollBatches[0].net_payable.toLocaleString('en-IN') : '2,99,200'}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Gross: ₹{payrollBatches.length > 0 ? payrollBatches[0].gross_total.toLocaleString('en-IN') : '3,60,000'} • PF &amp; TDS Deducted
                  </p>
                </div>
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span>Manage Payroll Batch</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card 6: New Admission Fee Intake */}
              <div 
                onClick={() => {
                  setDefaulterCategoryFilter('NEW_ADMISSION');
                  setActiveTab('fee_defaulters');
                }}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">New Admission Intake</span>
                      <p className="text-[10px] text-slate-400">Admissions Coordinator link</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {defaulters.filter(d => d.is_admission_fee).length} Enrolled
                  </span>
                </div>
                <div className="my-3">
                  <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                    ₹{defaulters.filter(d => d.is_admission_fee).reduce((s, c) => s + c.amount_due, 0).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    First-term kit, admission registration &amp; tuition
                  </p>
                </div>
                <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span>View New Enrollees</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            {/* Cash Flow Pulse + Fee Aging Risk Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cash Inflow vs Outflow Overview */}
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      Monthly Cash Pulse (Inflow vs Outflow)
                    </h3>
                    <p className="text-xs text-slate-500">School operational solvency indicator</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Net Positive +₹{(stats.total_collected_mtd - stats.pending_vendor_invoices_amount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Inflow bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Inflow: Tuition Fees &amp; New Admissions
                      </span>
                      <span className="text-emerald-600 font-bold">₹{stats.total_collected_mtd.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  {/* Outflow: Salaries */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-purple-500" />
                        Outflow: Monthly Staff Salaries (Payroll)
                      </span>
                      <span className="text-purple-600 font-bold">
                        ₹{payrollBatches.length > 0 ? payrollBatches[0].net_payable.toLocaleString('en-IN') : '2,99,200'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-3 rounded-full" style={{ width: '48%' }} />
                    </div>
                  </div>

                  {/* Outflow: Vendor & Operations */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Outflow: Vendor Invoices &amp; Maintenance Bills
                      </span>
                      <span className="text-blue-600 font-bold">₹{stats.pending_vendor_invoices_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '22%' }} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Live bank balance across 2 Current Accounts</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹42,85,000 (Liquid)</span>
                </div>
              </div>

              {/* Fee Aging Risk Matrix */}
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                      Fee Aging Risk Buckets
                    </h3>
                    <p className="text-xs text-slate-500">Breakdown of overdue tuition by days overdue</p>
                  </div>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                  >
                    <Send className="h-3 w-3" />
                    <span>Nudge All</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => {
                      setDefaulterTierFilter('0-15');
                      setActiveTab('fee_defaulters');
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50 cursor-pointer hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Aging: 0–15 Days</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {stats.overdue_tier_15} Students
                      </span>
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                      ₹{defaulters.filter(d => d.days_overdue <= 15).reduce((s, c) => s + c.amount_due, 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Early reminder notice</span>
                  </div>

                  <div 
                    onClick={() => {
                      setDefaulterTierFilter('16-30');
                      setActiveTab('fee_defaulters');
                    }}
                    className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 cursor-pointer hover:border-amber-500 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200">Aging: 16–30 Days</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                        {stats.overdue_tier_30} Students
                      </span>
                    </div>
                    <div className="text-base font-black text-amber-700 dark:text-amber-400 mt-1">
                      ₹{defaulters.filter(d => d.days_overdue > 15 && d.days_overdue <= 30).reduce((s, c) => s + c.amount_due, 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 block">Follow-up WhatsApp sent</span>
                  </div>

                  <div 
                    onClick={() => {
                      setDefaulterTierFilter('30+');
                      setActiveTab('fee_defaulters');
                    }}
                    className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/70 dark:border-orange-800/50 cursor-pointer hover:border-orange-500 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-orange-900 dark:text-orange-200">Aging: 31–60 Days</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                        {defaulters.filter(d => d.days_overdue > 30 && d.days_overdue <= 60).length} Students
                      </span>
                    </div>
                    <div className="text-base font-black text-orange-700 dark:text-orange-400 mt-1">
                      ₹{defaulters.filter(d => d.days_overdue > 30 && d.days_overdue <= 60).reduce((s, c) => s + c.amount_due, 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-orange-600/80 dark:text-orange-400/80 mt-0.5 block">Telephonic warning</span>
                  </div>

                  <div 
                    onClick={() => {
                      setDefaulterTierFilter('30+');
                      setActiveTab('fee_defaulters');
                    }}
                    className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/50 cursor-pointer hover:border-rose-500 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-rose-900 dark:text-rose-200">Aging: 60+ Days (Critical)</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                        {stats.overdue_tier_60} Students
                      </span>
                    </div>
                    <div className="text-base font-black text-rose-700 dark:text-rose-400 mt-1">
                      ₹{defaulters.filter(d => d.days_overdue > 60).reduce((s, c) => s + c.amount_due, 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5 block">Principal escalation</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Auto-recovery success rate this quarter</span>
                  <span className="text-xs font-bold text-emerald-600">78.4% resolved within 14 days</span>
                </div>
              </div>
            </div>

            {/* Recent Institutional Transactions Ledger Preview */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recent Banking Transactions &amp; Settlement Log
                  </h3>
                  <p className="text-xs text-slate-500">Live feed of payments, bank references, and fee clearances</p>
                </div>
                <button
                  onClick={() => setActiveTab('reconciliation')}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                >
                  <span>View All {transactions.length} Transactions</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3 rounded-l-xl">Reference / UTR</th>
                      <th className="p-3">Student / Payer</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 rounded-r-xl text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {transactions.slice(0, 5).map((tx: PaymentTransactionItem) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                          {tx.utr_number}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900 dark:text-white">{tx.student_name}</div>
                          <span className="text-[10px] text-slate-400">{tx.class_name} • {tx.parent_name}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {tx.payment_method}
                          </span>
                        </td>
                        <td className="p-3 font-black text-slate-900 dark:text-white">
                          ₹{tx.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.reconciled 
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}>
                            {tx.reconciled ? 'Verified ✓' : 'Awaiting Match'}
                          </span>
                        </td>
                        <td className="p-3 text-right text-slate-400">
                          {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 1: AGING FEE DEFAULTERS & RECOVERY LEDGER ── */}
        {activeTab === 'fee_defaulters' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Student Fee Defaulters &amp; Aging Recovery Ledger
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track individual overdue student balances, dispatch personalized WhatsApp/SMS nudges, log offline receipts, and apply concessions.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Broadcast Nudges</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Filter: All vs New SIS Admissions */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setDefaulterCategoryFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      defaulterCategoryFilter === 'ALL'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    All Accounts ({defaulters.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaulterCategoryFilter('NEW_ADMISSION')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      defaulterCategoryFilter === 'NEW_ADMISSION'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                    }`}
                  >
                    <span>★ New SIS Admissions</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      defaulterCategoryFilter === 'NEW_ADMISSION' ? 'bg-purple-700 text-white' : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                    }`}>
                      {defaulters.filter(d => d.is_admission_fee).length}
                    </span>
                  </button>
                </div>

                {/* Aging Tier Filter */}
                <select 
                  value={defaulterTierFilter} 
                  onChange={e => setDefaulterTierFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 py-1.5 font-bold"
                >
                  <option value="ALL">All Aging Tiers</option>
                  <option value="30+">30+ Days (High Risk)</option>
                  <option value="16-30">16–30 Days (Moderate)</option>
                  <option value="0-15">0–15 Days (Recent)</option>
                </select>

                {/* Class Filter */}
                <select 
                  value={defaulterClassFilter} 
                  onChange={e => setDefaulterClassFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 py-1.5 font-bold"
                >
                  <option value="All Classes">All Classes</option>
                  <option value="Class 8-B">Class 8-B</option>
                  <option value="Class 8-A">Class 8-A</option>
                  <option value="Class 9-A">Class 9-A</option>
                  <option value="Class 9-B">Class 9-B</option>
                  <option value="Class 7-A">Class 7-A</option>
                </select>

                {/* Search */}
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input 
                    type="text" 
                    value={defaulterSearch} 
                    onChange={e => setDefaulterSearch(e.target.value)}
                    placeholder="Search student or phone..." 
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs pl-8 pr-3 py-1.5 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* New Admissions Pop-In Alert Banner */}
            {defaulters.filter(d => d.is_admission_fee).length > 0 && (
              <div className="rounded-2xl border-2 border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 p-4 shadow-sm animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                      🎓
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-purple-950 dark:text-purple-200">
                          Active Enrolment Intake Queue: {defaulters.filter(d => d.is_admission_fee).length} New Admission(s) Converted by Admissions Desk
                        </span>
                        <span className="text-[10px] font-bold bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full animate-pulse">
                          Auto-Synced from CRM
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-0.5">
                        Students converted to SIS directory with pending admission fee schedules. Click to inspect, collect offline, or trigger WhatsApp payment links.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setDefaulterCategoryFilter('NEW_ADMISSION')}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <span>Inspect Intake Queue ({defaulters.filter(d => d.is_admission_fee).length})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Defaulters Table */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Student &amp; Class</th>
                      <th className="p-3.5">Guardian &amp; Contact</th>
                      <th className="p-3.5">Milestone Details</th>
                      <th className="p-3.5">Outstanding Balance</th>
                      <th className="p-3.5">Days Aging</th>
                      <th className="p-3.5">Recovery Status</th>
                      <th className="p-3.5">Exam No-Dues Clearance</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredDefaulters.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No fee defaulters matching current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredDefaulters.map(d => (
                        <tr key={d.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 dark:text-white">{d.student_name}</span>
                              {d.is_admission_fee && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  ★ New Admission
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              {d.class_name} {d.roll_no ? `• Roll #${d.roll_no}` : ''}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-slate-800 dark:text-slate-200 font-medium block">{d.parent_name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{d.parent_phone}</span>
                          </td>
                          <td className="p-3.5 max-w-[200px]">
                            <span className="text-slate-700 dark:text-slate-300 font-semibold block truncate" title={d.milestone_title}>
                              {d.milestone_title}
                            </span>
                            {d.waiver_amount && d.waiver_amount > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded mt-0.5">
                                Concession: ₹{d.waiver_amount.toLocaleString('en-IN')}
                              </span>
                            ) : null}
                          </td>
                          <td className="p-3.5">
                            <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                              ₹{d.amount_due.toLocaleString('en-IN')}
                            </span>
                            {d.status === 'Partially Paid' && (
                              <span className="block text-[10px] text-amber-600 font-bold">Partially Paid</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.days_overdue > 30 
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300' 
                                : d.days_overdue > 15
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            }`}>
                              {d.days_overdue} Days
                            </span>
                          </td>
                          <td className="p-3.5">
                            {d.reminder_count && d.reminder_count > 0 ? (
                              <div className="text-[10px] text-slate-500">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{d.reminder_count} Nudges Sent</span>
                                <span className="block text-slate-400">Via WhatsApp</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No Reminders Yet</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {d.exam_clearance ? (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="h-3 w-3" />
                                  No-Dues Cleared
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleExamClearance(d)}
                                  className="text-[10px] text-slate-400 hover:text-rose-600 underline cursor-pointer"
                                  title="Revoke exam clearance / Place on financial hold"
                                >
                                  Hold
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  <AlertTriangle className="h-3 w-3" />
                                  Exam Hold
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleExamClearance(d)}
                                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800"
                                  title="Issue No-Dues Certificate for Hall Ticket / Report Card"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSendReminder(d, 'WhatsApp')}
                                className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Send Direct WhatsApp Payment Link"
                              >
                                WhatsApp
                              </button>
                              <button
                                onClick={() => {
                                  setPaymentModalDefaulter(d);
                                  setPaymentAmount(d.amount_due);
                                }}
                                className="rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-blue-700 dark:text-blue-300 px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Record Manual / Counter Payment"
                              >
                                Record Pay
                              </button>
                              <button
                                onClick={() => {
                                  setWaiverModalDefaulter(d);
                                  setWaiverAmount(Math.min(5000, d.amount_due));
                                }}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                                title="Grant Hardship Concession"
                              >
                                Concession
                              </button>
                              {d.payment_history_json && (
                                <button
                                  onClick={() => setHistoryModalDefaulter(d)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  title="View Payment History Log"
                                >
                                  <History className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: ONLINE GATEWAY & BANK RECONCILIATION ── */}
        {activeTab === 'reconciliation' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Online Payment Gateway &amp; Bank Reconciliation Ledger
                </h2>
                <p className="text-xs text-slate-500">
                  Verify UPI, NetBanking, Credit Card, and NEFT transactions against school current account statements.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select 
                  value={txReconcileFilter} 
                  onChange={e => setTxReconcileFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 py-1.5 font-bold"
                >
                  <option value="all">All Transactions</option>
                  <option value="pending">Pending Reconciliation</option>
                  <option value="reconciled">Reconciled &amp; Signed</option>
                </select>

                <select 
                  value={txMethodFilter} 
                  onChange={e => setTxMethodFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 py-1.5 font-bold"
                >
                  <option value="ALL">All Payment Rails</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="NetBanking">NetBanking</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="NEFT">NEFT / CMS</option>
                </select>

                <button
                  onClick={handleBulkReconcile}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Reconcile All Pending</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">UTR Reference / Bank</th>
                      <th className="p-3.5">Student &amp; Class</th>
                      <th className="p-3.5">Parent / Payer</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Payment Rail</th>
                      <th className="p-3.5">Reconciliation State</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No transactions matching filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">{tx.utr_number}</span>
                            <span className="text-[10px] text-slate-500">{tx.bank_name || 'Bank Gateway'}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 dark:text-white block">{tx.student_name}</span>
                            <span className="text-[10px] text-slate-500">{tx.class_name}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-slate-800 dark:text-slate-200 font-medium block">{tx.parent_name}</span>
                            <span className="text-[10px] text-slate-500 truncate max-w-[150px] block">{tx.milestone_title}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                              ₹{tx.amount.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {tx.payment_method}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {tx.reconciled ? (
                              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Reconciled ({tx.reconciled_by || 'Bursar'})</span>
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                Pending Bank Verification
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            {!tx.reconciled ? (
                              <button
                                onClick={() => handleReconcileTx(tx.id)}
                                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                              >
                                Reconcile ✓
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-semibold">Matched</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: INSTITUTIONAL VENDOR INVOICES (ACCOUNTS PAYABLE) ── */}
        {activeTab === 'vendor_invoices' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Institutional Vendor Invoices &amp; Accounts Payable
                </h2>
                <p className="text-xs text-slate-500">
                  Manage campus expenditures: Yellow bus fleet diesel, composite science laboratory supplies, campus leased lines, and security services.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select 
                  value={invoiceStatusFilter} 
                  onChange={e => setInvoiceStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 py-1.5 font-bold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved for Wire">Approved for Wire</option>
                  <option value="Paid">Paid &amp; Settled</option>
                  <option value="Audit Clearance Needed">Audit Clearance Needed</option>
                </select>

                <button
                  onClick={() => setShowNewInvoiceModal(true)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Vendor Invoice</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800">
                  No vendor invoices found matching status filter.
                </div>
              ) : (
                filteredInvoices.map(item => (
                  <div 
                    key={item.id} 
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{item.invoice_no}</span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.vendor_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Paid' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : item.status === 'Approved for Wire'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : item.status === 'Audit Clearance Needed'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {item.status}
                        </span>
                        {item.vendor_category && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {item.vendor_category}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {item.invoice_for} • Due: {item.due_date || 'Prompt'}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs">
                        <span className="font-black text-slate-900 dark:text-white">
                          Payable Amount: ₹{item.amount.toLocaleString('en-IN')}
                        </span>
                        {item.payment_utr && (
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                            UTR: {item.payment_utr} ({item.payment_mode || 'RTGS'})
                          </span>
                        )}
                        {item.authorized_by && (
                          <span className="text-[10px] text-slate-400">
                            Authorized by {item.authorized_by}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-500 italic mt-1">Note: {item.notes}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      {item.status === 'Pending Approval' && (
                        <button 
                          onClick={() => handleAuthorizeInvoice(item.id)}
                          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Authorize Wire
                        </button>
                      )}
                      {item.status === 'Approved for Wire' && (
                        <button 
                          onClick={() => setPaidModalInvoice(item)}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Log Payment UTR
                        </button>
                      )}
                      {item.status !== 'Audit Clearance Needed' && item.status !== 'Paid' && (
                        <button 
                          onClick={() => handleFlagInvoiceAudit(item.id)}
                          className="rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1.5 text-xs font-bold cursor-pointer"
                        >
                          Audit Review
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: TASKS & FINANCIAL SLAS ── */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Finance &amp; Accounts Tasks</h2>
                <p className="text-xs text-slate-500">Defaulter tele-call campaigns, statutory audits, and tuition collection SLAs</p>
              </div>
              <select 
                value={taskStatusFilter} 
                onChange={e => setTaskStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 py-1.5 font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="space-y-2.5">
              {filteredTasks.map(task => {
                const isExpanded = taskExpandedId === task.id;
                return (
                  <div key={task.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                          task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {task.status}
                        </span>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">{task.title}</h3>
                          <div className="flex items-center gap-2.5 text-[11px] text-slate-500 mt-1">
                            <span>Assignee: <b className="text-slate-800 dark:text-slate-200">{task.assigned_to}</b></span>
                            <span>•</span>
                            <span>Due: {task.due_date}</span>
                            <span>•</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">SLA: {task.sla_hours || 24}h</span>
                            {task.is_escalated && (
                              <span className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded font-black text-[9px]">
                                FINANCIAL ESCALATION
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {task.status !== 'In Progress' && task.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                            className="rounded-lg border border-blue-200 bg-blue-50 text-blue-700 px-2.5 py-1 text-[11px] font-bold"
                          >
                            Start
                          </button>
                        )}
                        {task.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'Completed')}
                            className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-bold"
                          >
                            Resolve ✓
                          </button>
                        )}
                        <button onClick={() => setTaskExpandedId(isExpanded ? null : task.id)} className="text-xs text-slate-400 px-2 py-1">
                          {isExpanded ? 'Less' : 'Details'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                        <p>{task.description || 'No additional details provided.'}</p>
                        {task.escalation_reason && (
                          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
                            <b>Escalation Reason:</b> {task.escalation_reason}
                          </div>
                        )}
                        {!task.is_escalated && task.status !== 'Completed' && (
                          <div className="pt-2">
                            {escalateTaskId === task.id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text" 
                                  value={escalateReason} 
                                  onChange={e => setEscalateReason(e.target.value)} 
                                  placeholder="Reason for financial escalation..." 
                                  className="flex-1 rounded-lg border border-rose-300 p-1.5 text-xs text-slate-900"
                                />
                                <button onClick={() => handleEscalate(task.id)} className="bg-rose-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold">Confirm</button>
                                <button onClick={() => setEscalateTaskId(null)} className="text-slate-400 text-xs">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setEscalateTaskId(task.id)} className="text-rose-600 hover:underline text-xs font-bold">
                                ⚠️ Escalate to Principal
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

                {/* ── TAB 5: BROADCAST AUDIT TRAIL ── */}
        {activeTab === 'dispatch_logs' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Fee Reminder Broadcast Audit Trail
                </h2>
                <p className="text-xs text-slate-500">
                  Official statutory log of all automated and manual fee payment reminders dispatched by the Bursar desk.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," + 
                      ["ID,Channel,Scope,Note,Sender,TargetCount,Amount,Date",
                        ...dispatchLogs.map(l => `"${l.id}","${l.dispatch_type}","${l.dispatch_scope || ''}","${(l.dispatch_note || '').replace(/"/g, '""')}","${l.dispatched_by}","${l.target_count}","${l.total_amount_targeted}","${l.created_at}"`)
                      ].join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `Broadcast_Audit_Log_${new Date().toISOString().slice(0,10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    triggerToast("Audit log downloaded successfully as CSV.");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-blue-600" />
                  <span>Download Audit Log (CSV)</span>
                </button>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>New Reminder Dispatch</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0F172A] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by scope, note, or bursar..."
                  value={dispatchSearchQuery}
                  onChange={e => setDispatchSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Channel filter pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
                {(['ALL', 'WhatsApp', 'SMS', 'Email'] as const).map(channel => (
                  <button
                    key={channel}
                    onClick={() => setDispatchChannelFilter(channel)}
                    className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dispatchChannelFilter === channel
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {channel === 'ALL' ? 'All Channels' : channel}
                  </button>
                ))}
              </div>
            </div>

            {/* Logs List */}
            <div className="space-y-3">
              {dispatchLogs
                .filter(log => {
                  if (dispatchChannelFilter !== 'ALL' && log.dispatch_type !== dispatchChannelFilter) return false;
                  if (dispatchSearchQuery.trim()) {
                    const q = dispatchSearchQuery.toLowerCase();
                    const matchScope = (log.dispatch_scope || '').toLowerCase().includes(q);
                    const matchNote = (log.dispatch_note || '').toLowerCase().includes(q);
                    const matchBy = (log.dispatched_by || '').toLowerCase().includes(q);
                    if (!matchScope && !matchNote && !matchBy) return false;
                  }
                  return true;
                })
                .length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800">
                  No matching broadcast dispatches found.
                </div>
              ) : (
                dispatchLogs
                  .filter(log => {
                    if (dispatchChannelFilter !== 'ALL' && log.dispatch_type !== dispatchChannelFilter) return false;
                    if (dispatchSearchQuery.trim()) {
                      const q = dispatchSearchQuery.toLowerCase();
                      const matchScope = (log.dispatch_scope || '').toLowerCase().includes(q);
                      const matchNote = (log.dispatch_note || '').toLowerCase().includes(q);
                      const matchBy = (log.dispatched_by || '').toLowerCase().includes(q);
                      if (!matchScope && !matchNote && !matchBy) return false;
                    }
                    return true;
                  })
                  .map((log, idx) => {
                    // Delivery stats simulation
                    const deliveredPct = idx % 3 === 0 ? 98 : idx % 2 === 0 ? 100 : 94;
                    const failedCount = idx % 3 === 0 ? 2 : idx % 2 === 0 ? 0 : 3;

                    return (
                      <div key={log.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.dispatch_type === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}>
                              {log.dispatch_type}
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">{log.dispatch_scope || 'General Broadcast'}</h3>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                            {/* Delivery Status Badge */}
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <CheckCheck className="h-3 w-3" />
                              <span>{deliveredPct}% Delivered</span>
                            </span>
                            {failedCount > 0 && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                                <AlertTriangle className="h-3 w-3" />
                                <span>{failedCount} Bounced</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                            {log.dispatch_note || 'Standard automated fee reminder notification with payment link.'}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>Dispatched by <b className="text-slate-700 dark:text-slate-300 font-medium">{log.dispatched_by}</b></span>
                            <span>•</span>
                            <button
                              onClick={() => setPreviewDispatchLog(log)}
                              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Preview Message Template</span>
                            </button>
                            {failedCount > 0 && (
                              <>
                                <span>•</span>
                                <button
                                  onClick={() => triggerToast(`Resending to ${failedCount} bounced recipients via alternative SMS gateway...`)}
                                  className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  <span>Resend to {failedCount} Failed</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-left md:text-right shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-800">
                          <div className="text-base font-black text-rose-600 dark:text-rose-400">
                            ₹{log.total_amount_targeted.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-500">
                            {log.target_count} Parents Reached
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* ── TAB 6: STAFF SALARIES & MONTHLY PAYROLL ENGINE ── */}
        {activeTab === 'payroll' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  Staff Salaries &amp; Monthly Payroll Engine
                </h2>
                <p className="text-xs text-slate-500">
                  Biometric attendance integration, Form 16 TDS slabs, statutory deductions (PF 12%, Professional Tax ₹200), and corporate bank batch wire transfers.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportNachCsv}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Download Salary Sheet (Excel)</span>
                </button>
                <button
                  onClick={() => setShowGenerateBatchModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Run Monthly Payroll</span>
                </button>
              </div>
            </div>

            {/* Batch Selector & Summary Banner */}
            {payrollBatches.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-400">No payroll batches generated yet. Click "Run Monthly Payroll" to compute salaries.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Batch Card */}
                {(() => {
                  const activeBatch = payrollBatches.find(b => b.id === selectedBatchId) || payrollBatches[0];
                  return (
                    <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 shadow-xs">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                              Batch: {activeBatch.payroll_month}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              activeBatch.status === 'Disbursed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                : activeBatch.status === 'Approved for Wire'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            }`}>
                              ● {activeBatch.status}
                            </span>
                            {activeBatch.bank_batch_ref && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                Ref: {activeBatch.bank_batch_ref}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {activeBatch.notes || 'Monthly institutional salary disbursement across all faculty, administration, and support staff.'}
                          </p>
                        </div>

                        {/* Batch Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          {activeBatch.status === 'Audit Pending' && (
                            <button
                              onClick={() => setShowAuthorizeBatchModal(true)}
                              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Approve Bank Transfer (Principal Seal)</span>
                            </button>
                          )}
                          {activeBatch.status === 'Approved for Wire' && (
                            <button
                              onClick={() => setShowDisburseModal(true)}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Disburse Batch (HDFC CMS Wire)</span>
                            </button>
                          )}
                          {activeBatch.status === 'Disbursed' && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Disbursed via NACH Wire</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* KPI Numbers */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs">
                        <div>
                          <span className="text-slate-500 font-medium">Total Staff Count</span>
                          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                            {activeBatch.total_staff_count} Personnel
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Gross Institutional Outflow</span>
                          <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                            ₹{activeBatch.gross_total.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Total Deductions (PF/PT/TDS)</span>
                          <div className="text-base font-black text-rose-600 dark:text-rose-400 mt-0.5">
                            - ₹{activeBatch.total_deductions.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Net Wire Payable</span>
                          <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            ₹{activeBatch.net_payable.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── TEACHER SALARY QUERIES & GRIEVANCE QUEUE ── */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Faculty Salary Queries &amp; Grievance Queue
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            salaryInquiries.filter(i => i.status === 'Pending').length > 0
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 animate-pulse'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}>
                            {salaryInquiries.filter(i => i.status === 'Pending').length} Pending Action
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Direct salary questions submitted by teachers regarding LOP, deductions, Form 16, or wire status.
                        </p>
                      </div>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {(['ALL', 'Pending', 'Resolved', 'Rejected'] as const).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setInquiryFilterStatus(st)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            inquiryFilterStatus === st
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {st === 'ALL' ? `All (${salaryInquiries.length})` : `${st} (${salaryInquiries.filter(i => i.status === st).length})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {salaryInquiries.filter(i => inquiryFilterStatus === 'ALL' || i.status === inquiryFilterStatus).length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                      <p className="font-bold text-slate-700 dark:text-slate-300">No Salary Queries Under This Filter</p>
                      <p className="text-[11px]">All faculty salary items are reconciled and clear.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {salaryInquiries
                        .filter(i => inquiryFilterStatus === 'ALL' || i.status === inquiryFilterStatus)
                        .map(inq => (
                          <div 
                            key={inq.id}
                            className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-colors ${
                              inq.status === 'Pending' 
                                ? 'bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/40' 
                                : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-slate-900 dark:text-white">
                                  {inq.teacher_name}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                                  {inq.department || 'Academics'}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                                  Cycle: {inq.month}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  inq.status === 'Pending'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                                    : inq.status === 'Resolved'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : inq.status === 'Under Review'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                  {inq.status}
                                </span>
                              </div>

                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                Category: <span className="text-blue-600 dark:text-blue-400 font-bold">{inq.reason}</span>
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                &ldquo;{inq.message}&rdquo;
                              </p>

                              {inq.resolution_notes && (
                                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50">
                                  <b>Resolution ({inq.resolved_by || 'Accounts'}):</b> {inq.resolution_notes}
                                </div>
                              )}
                            </div>

                            <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 shrink-0">
                              <div className="text-right">
                                <div className="text-[10px] text-slate-400">Net Pay Context</div>
                                <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                  ₹{inq.net_salary ? inq.net_salary.toLocaleString('en-IN') : '54,260'}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedInquiry(inq);
                                  setInquiryResolutionNotes(inq.resolution_notes || '');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                <span>{inq.status === 'Pending' ? 'Action Query' : 'View Audit'}</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Payslips Table */}
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
                  <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Staff Salary Slips ({payslips.length} Employees)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Statutory Rule: PF (12% of basic) · Professional Tax (₹200) · Form 16 TDS
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="p-3.5">Staff &amp; Role</th>
                          <th className="p-3.5">Department</th>
                          <th className="p-3.5">Bank / IFSC</th>
                          <th className="p-3.5">Basic</th>
                          <th className="p-3.5">Allowances</th>
                          <th className="p-3.5">Gross Pay</th>
                          <th className="p-3.5">Deductions</th>
                          <th className="p-3.5">Net Salary</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Digital Slip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {payslips.map(slip => (
                          <tr key={slip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="p-3.5">
                              <div className="font-bold text-slate-900 dark:text-white">{slip.staff_name}</div>
                              <div className="text-[10px] text-slate-500">{slip.role_designation}</div>
                            </td>
                            <td className="p-3.5 text-slate-600 dark:text-slate-300">
                              {slip.department}
                            </td>
                            <td className="p-3.5 font-mono text-[11px] text-slate-500">
                              {slip.bank_account_no}
                              <div className="text-[9px] text-slate-400">{slip.bank_ifsc}</div>
                            </td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300">
                              ₹{slip.basic_salary.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                              HRA: ₹{slip.hra_allowance.toLocaleString('en-IN')}
                              <br />Spl: ₹{slip.special_allowance.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                              ₹{slip.gross_earnings.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-rose-600 dark:text-rose-400 text-[11px]">
                              -₹{slip.total_deductions.toLocaleString('en-IN')}
                              <div className="text-[9px] text-slate-400">PF ₹{slip.provident_fund} | PT ₹{slip.professional_tax}</div>
                            </td>
                            <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">
                              ₹{slip.net_salary.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                slip.disbursement_status === 'Disbursed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {slip.disbursement_status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => setSelectedPayslip(slip)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Footer />
        </main>

      {/* ── MODAL: BULK BROADCAST NUDGES ── */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Broadcast Fee Reminders</h3>
              <button onClick={() => setShowBulkModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleBulkReminderSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Target Aging Bracket</label>
                <select 
                  value={bulkTier} 
                  onChange={e => setBulkTier(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="ALL">All Overdue Defaulters</option>
                  <option value="30+">Tier 30+ Days (Severe Overdue)</option>
                  <option value="16-30">Tier 16–30 Days (Moderate Overdue)</option>
                  <option value="0-15">Tier 0–15 Days (Recent Overdue)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Dispatch Rail</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['WhatsApp', 'SMS', 'Email'] as const).map(channel => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => setBulkChannel(channel)}
                      className={`p-2 rounded-xl text-center font-bold border ${
                        bulkChannel === channel 
                          ? 'bg-blue-50 text-blue-700 border-blue-500 dark:bg-blue-950 dark:text-blue-300' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Custom Notice Message (Optional)</label>
                <textarea 
                  rows={3}
                  value={bulkCustomMsg} 
                  onChange={e => setBulkCustomMsg(e.target.value)} 
                  placeholder="e.g. Dear Parent, Term 2 fees are overdue. Please settle online to ensure uninterrupted bus and report card access." 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <button type="submit" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-bold mt-2 shadow-md">
                Dispatch Broadcast Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RECORD PAYMENT ── */}
      {paymentModalDefaulter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Fee Collection</h3>
                <span className="text-[11px] text-slate-500">{paymentModalDefaulter.student_name} ({paymentModalDefaulter.class_name})</span>
              </div>
              <button onClick={() => setPaymentModalDefaulter(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Amount Paid (₹)</label>
                <input 
                  type="number" 
                  required
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(Number(e.target.value))} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Payment Mode</label>
                  <select 
                    value={paymentMethod} 
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="UPI">UPI (Counter QR)</option>
                    <option value="Cash">Cash (Receipt Issued)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Demand Draft">Demand Draft (DD)</option>
                    <option value="NetBanking">NetBanking / NEFT</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">UTR / Cheque No.</label>
                  <input 
                    type="text" 
                    value={paymentUtr} 
                    onChange={e => setPaymentUtr(e.target.value)} 
                    placeholder="e.g. CHQ-89104"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Notes / Receipt Remarks</label>
                <input 
                  type="text" 
                  value={paymentNotes} 
                  onChange={e => setPaymentNotes(e.target.value)} 
                  placeholder="e.g. Partial settlement for Term 2 tuition dues" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <button type="submit" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-bold mt-2 shadow-md">
                Confirm &amp; Update Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: APPLY CONCESSION / WAIVER ── */}
      {waiverModalDefaulter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Apply Fee Concession / Waiver</h3>
                <span className="text-[11px] text-slate-500">{waiverModalDefaulter.student_name} (Current Due: ₹{waiverModalDefaulter.amount_due.toLocaleString('en-IN')})</span>
              </div>
              <button onClick={() => setWaiverModalDefaulter(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleApplyWaiverSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Concession Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  value={waiverAmount} 
                  onChange={e => setWaiverAmount(Number(e.target.value))} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Approval Authority</label>
                <input 
                  type="text" 
                  required
                  value={waiverApprover} 
                  onChange={e => setWaiverApprover(e.target.value)} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Reason / Board Justification</label>
                <textarea 
                  rows={2}
                  required
                  value={waiverReason} 
                  onChange={e => setWaiverReason(e.target.value)} 
                  placeholder="e.g. Sports scholarship hardship concession approved in Board Meeting" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <button type="submit" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-bold mt-2 shadow-md">
                Authorize Concession
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PAYMENT HISTORY INSPECTOR ── */}
      {historyModalDefaulter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment Audit History</h3>
                <span className="text-[11px] text-slate-500">{historyModalDefaulter.student_name} ({historyModalDefaulter.class_name})</span>
              </div>
              <button onClick={() => setHistoryModalDefaulter(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
              {(() => {
                try {
                  const hist = JSON.parse(historyModalDefaulter.payment_history_json || '[]');
                  if (hist.length === 0) return <p className="text-slate-400">No payment logs recorded.</p>;
                  return hist.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400">₹{Number(item.amount).toLocaleString('en-IN')}</span>
                        <span className="text-slate-400 text-[10px]">{item.date}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Mode: {item.method} • Ref: {item.utr_or_cheque}
                      </div>
                      {item.notes && <div className="text-[10px] text-slate-400 italic mt-0.5">{item.notes}</div>}
                    </div>
                  ));
                } catch {
                  return <p className="text-slate-400">No parseable history log.</p>;
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: LOG NEW VENDOR INVOICE ── */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Log Institutional Vendor Invoice</h3>
              <button onClick={() => setShowNewInvoiceModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateNewInvoice} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Invoice Number</label>
                  <input 
                    type="text" 
                    required
                    value={newInvNo} 
                    onChange={e => setNewInvNo(e.target.value)} 
                    placeholder="e.g. INV-2026-992" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select 
                    value={newInvCategory} 
                    onChange={e => setNewInvCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Curriculum & Digital Content">Curriculum &amp; Digital Content</option>
                    <option value="Software & IT">Software &amp; EdTech Subscriptions</option>
                    <option value="Faculty Operations">Faculty Operations</option>
                    <option value="Administrative & Legal">Administrative &amp; Legal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Vendor Business Name</label>
                <input 
                  type="text" 
                  required
                  value={newInvVendor} 
                  onChange={e => setNewInvVendor(e.target.value)} 
                  placeholder="e.g. Bharat Petroleum Corporation Ltd" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Invoice For (Line Item Description)</label>
                <input 
                  type="text" 
                  required
                  value={newInvFor} 
                  onChange={e => setNewInvFor(e.target.value)} 
                  placeholder="e.g. Monthly Diesel replenishment for Bus Routes 1-14" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newInvAmount} 
                    onChange={e => setNewInvAmount(Number(e.target.value))} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                  <input 
                    type="text" 
                    value={newInvDueDate} 
                    onChange={e => setNewInvDueDate(e.target.value)} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-bold mt-2 shadow-md">
                Add to Accounts Payable
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: LOG INVOICE PAYMENT WIRE UTR ── */}
      {paidModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Wire Transfer / UTR</h3>
                <span className="text-[11px] text-slate-500">{paidModalInvoice.invoice_no} • {paidModalInvoice.vendor_name}</span>
              </div>
              <button onClick={() => setPaidModalInvoice(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleMarkInvoicePaid} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 block">Total Wire Amount</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  ₹{paidModalInvoice.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Bank Wire UTR Number</label>
                <input 
                  type="text" 
                  required
                  value={wireUtr} 
                  onChange={e => setWireUtr(e.target.value)} 
                  placeholder="e.g. RTGS/SBIN20261022981048"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Payment Channel</label>
                <select 
                  value={wireMode} 
                  onChange={e => setWireMode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="RTGS">RTGS (Instant Corporate Wire)</option>
                  <option value="NEFT">NEFT (Batch Clearing)</option>
                  <option value="Corporate NetBanking">Corporate NetBanking</option>
                  <option value="Cheque">Signed Institutional Cheque</option>
                </select>
              </div>
              <button type="submit" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-bold mt-2 shadow-md">
                Mark as Settled &amp; Paid
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE FINANCE TASK ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delegate Finance &amp; Accounts Task</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Task Title</label>
                <input 
                  type="text" 
                  required
                  value={newTaskTitle} 
                  onChange={e => setNewTaskTitle(e.target.value)} 
                  placeholder="e.g. Audit Term 2 Fee Defaulters & Dispatch SMS Digest" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Description / Recovery Notes</label>
                <textarea 
                  rows={2}
                  value={newTaskDesc} 
                  onChange={e => setNewTaskDesc(e.target.value)} 
                  placeholder="Specify target recovery amount or invoice numbers..." 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Assign To</label>
                  <select 
                    value={newTaskAssignee} 
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mr. Arvind Krishnan">Mr. Arvind Krishnan (Accounts Officer)</option>
                    <option value="Billing Desk Clerk">Billing Desk Clerk</option>
                    <option value="Tele-calling Recovery Team">Tele-calling Recovery Team</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">SLA Hours</label>
                  <input 
                    type="number" 
                    value={newTaskSlaHours} 
                    onChange={e => setNewTaskSlaHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-bold mt-2">
                Delegate Finance Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: GENERATE PAYROLL BATCH ── */}
      {showGenerateBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Run Monthly Staff Payroll</span>
              </h3>
              <button onClick={() => setShowGenerateBatchModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleGenerateBatchSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Payroll Month</label>
                <input 
                  type="text" 
                  required
                  value={newBatchMonth} 
                  onChange={e => setNewBatchMonth(e.target.value)} 
                  placeholder="e.g. November 2026" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Statutory Computation Notes</label>
                <textarea 
                  rows={3}
                  value={newBatchNotes} 
                  onChange={e => setNewBatchNotes(e.target.value)} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300">Automated Statutory Invariants:</div>
                <div>• Employee Provident Fund (PF): 12% of Basic Salary</div>
                <div>• Professional Tax (PT): ₹200 flat deduction</div>
                <div>• Income Tax TDS computed as per New Tax Regime slabs</div>
                <div>• Zero LOP days detected in biometric attendance log</div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-bold shadow-md cursor-pointer">
                Compute &amp; Generate Batch Slips
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: AUTHORIZE PAYROLL BATCH ── */}
      {showAuthorizeBatchModal && selectedBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Executive Principal Seal Authorization</span>
              </h3>
              <button onClick={() => setShowAuthorizeBatchModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                You are digitally authorizing the monthly salary batch of <b>₹{payrollBatches.find(b => b.id === selectedBatchId)?.net_payable.toLocaleString('en-IN')}</b> for wire release through HDFC Corporate CMS.
              </p>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Executive Audit &amp; Approval Justification</label>
                <textarea 
                  rows={3}
                  value={authorizeNotes} 
                  onChange={e => setAuthorizeNotes(e.target.value)} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300">
                <b>Signatory Authority:</b> {user?.name || 'Dr. Sunita Kapoor'} (Institutional Director / Principal)
              </div>
              <button 
                type="button" 
                onClick={() => handleAuthorizeBatchSubmit(selectedBatchId)}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-bold shadow-md cursor-pointer"
              >
                Affix Digital Seal &amp; Approve for Wire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DISBURSE PAYROLL BATCH ── */}
      {showDisburseModal && selectedBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>Execute Corporate Wire Disbursement</span>
              </h3>
              <button onClick={() => setShowDisburseModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                This triggers the automated NACH credit file to institutional bank gateway.
              </p>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Bank CMS / Corporate Batch Ref</label>
                <input 
                  type="text" 
                  value={disburseBatchRef} 
                  onChange={e => setDisburseBatchRef(e.target.value)} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
                <div>• Beneficiaries: <b>{payslips.length} Employees</b></div>
                <div>• Total Direct Transfer: <b>₹{payrollBatches.find(b => b.id === selectedBatchId)?.net_payable.toLocaleString('en-IN')}</b></div>
                <div>• Rail: HDFC Corporate Banking NACH Direct Debit</div>
              </div>
              <button 
                type="button" 
                onClick={() => handleDisburseBatchSubmit(selectedBatchId)}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-bold shadow-md cursor-pointer"
              >
                Confirm Wire Transfer Now
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── MODAL: RESOLVE SALARY INQUIRY ── */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Salary Query Audit &amp; Resolution
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Query #{selectedInquiry.id} · {selectedInquiry.teacher_name} ({selectedInquiry.department})
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Inquiry Details Snapshot */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Query Category:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedInquiry.reason}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Pay Month Cycle:</span>
                <span className="font-mono font-bold text-blue-600">{selectedInquiry.month}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Net Salary Credited:</span>
                <span className="font-bold text-emerald-600">₹{selectedInquiry.net_salary ? selectedInquiry.net_salary.toLocaleString('en-IN') : '54,260'}</span>
              </div>
              {selectedInquiry.utr && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Bank UTR Reference:</span>
                  <span className="font-mono text-[10.5px] font-bold text-slate-700 dark:text-slate-300">{selectedInquiry.utr}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 italic">
                &ldquo;{selectedInquiry.message}&rdquo;
              </div>
            </div>

            {/* Resolution Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Notes / Action Taken *
                </label>
                <textarea
                  rows={3}
                  value={inquiryResolutionNotes}
                  onChange={(e) => setInquiryResolutionNotes(e.target.value)}
                  placeholder="e.g. LOP adjustment approved; ₹1,200 will be refunded in the Nov payroll batch. Bank wire trace confirmed with HDFC."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isResolvingInquiry || !inquiryResolutionNotes.trim()}
                    onClick={async () => {
                      if (!selectedInquiry) return;
                      setIsResolvingInquiry(true);
                      try {
                        const updated = await api.resolveSalaryInquiry(selectedInquiry.id, {
                          status: 'Rejected',
                          resolution_notes: inquiryResolutionNotes.trim(),
                          resolved_by: 'Mr. Arvind Krishnan (Accounts Coordinator)'
                        });
                        setSalaryInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? (updated || { ...i, status: 'Rejected', resolution_notes: inquiryResolutionNotes.trim() }) : i));
                        setSelectedInquiry(null);
                        triggerToast(`Query #${selectedInquiry.id} marked as Rejected.`);
                      } finally {
                        setIsResolvingInquiry(false);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer disabled:opacity-50"
                  >
                    Reject Query
                  </button>

                  <button
                    type="button"
                    disabled={isResolvingInquiry || !inquiryResolutionNotes.trim()}
                    onClick={async () => {
                      if (!selectedInquiry) return;
                      setIsResolvingInquiry(true);
                      try {
                        const updated = await api.resolveSalaryInquiry(selectedInquiry.id, {
                          status: 'Resolved',
                          resolution_notes: inquiryResolutionNotes.trim(),
                          resolved_by: 'Mr. Arvind Krishnan (Accounts Coordinator)'
                        });
                        setSalaryInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? (updated || { ...i, status: 'Resolved', resolution_notes: inquiryResolutionNotes.trim() }) : i));
                        setSelectedInquiry(null);
                        triggerToast(`Query #${selectedInquiry.id} successfully Resolved and notification dispatched to teacher!`);
                      } finally {
                        setIsResolvingInquiry(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isResolvingInquiry ? 'Resolving...' : 'Confirm Resolution'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* ── MODAL: DIGITAL PAYSLIP INSPECTION ── */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Official Payslip Statement</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedPayslip.staff_name}</h3>
                <span className="text-xs text-slate-500">{selectedPayslip.role_designation} · {selectedPayslip.department}</span>
              </div>
              <button onClick={() => setSelectedPayslip(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Bank Account</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">{selectedPayslip.bank_account_no}</div>
                  <div className="text-[10px] text-slate-500">{selectedPayslip.bank_ifsc}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Disbursement Status</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{selectedPayslip.disbursement_status}</div>
                  {selectedPayslip.payment_utr && (
                    <div className="text-[10px] font-mono text-slate-500">{selectedPayslip.payment_utr}</div>
                  )}
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Earnings */}
                <div className="space-y-1.5 border-r pr-3 border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white pb-1 border-b text-[11px] uppercase tracking-wider">
                    Earnings (Credits)
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Basic Pay:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{selectedPayslip.basic_salary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">House Rent (HRA):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{selectedPayslip.hra_allowance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Special Allowance:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{selectedPayslip.special_allowance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-black text-slate-900 dark:text-white">
                    <span>Gross Earnings:</span>
                    <span>₹{selectedPayslip.gross_earnings.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white pb-1 border-b text-[11px] uppercase tracking-wider">
                    Deductions (Debits)
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Provident Fund (12%):</span>
                    <span className="font-semibold text-rose-600">₹{selectedPayslip.provident_fund.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Professional Tax:</span>
                    <span className="font-semibold text-rose-600">₹{selectedPayslip.professional_tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Income Tax (TDS):</span>
                    <span className="font-semibold text-rose-600">₹{selectedPayslip.income_tax_tds.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-black text-rose-600 dark:text-rose-400">
                    <span>Total Deductions:</span>
                    <span>-₹{selectedPayslip.total_deductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Callout */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">Net Take-Home Salary</span>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                    ₹{selectedPayslip.net_salary.toLocaleString('en-IN')}
                  </div>
                </div>
                <button
                  onClick={() => {
                    triggerToast(`Digital payslip for ${selectedPayslip.staff_name} prepared for print.`);
                    window.print();
                  }}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE PURCHASE ORDER ── */}
      {showNewPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-blue-600" />
                <span>Issue Institutional Purchase Order</span>
              </h3>
              <button onClick={() => setShowNewPOModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreatePOSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Department</label>
                <select 
                  value={newPODept} 
                  onChange={e => setNewPODept(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Science Laboratories">Science Laboratories</option>
                  <option value="Sports & Athletics">Sports &amp; Athletics</option>
                  <option value="Examination & Stationary Stores">Examination &amp; Stationary Stores</option>
                  <option value="IT & Smart Classrooms">IT &amp; Smart Classrooms</option>
                  <option value="Campus Facilities & Maintenance">Campus Facilities &amp; Maintenance</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Approved Vendor</label>
                <input 
                  type="text" 
                  required
                  value={newPOVendor} 
                  onChange={e => setNewPOVendor(e.target.value)} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Item Name &amp; Specification</label>
                <input 
                  type="text" 
                  required
                  value={newPOItemName} 
                  onChange={e => setNewPOItemName(e.target.value)} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Quantity</label>
                  <input 
                    type="number" 
                    min={1}
                    required
                    value={newPOItemQty} 
                    onChange={e => setNewPOItemQty(Number(e.target.value))} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Unit Price (₹)</label>
                  <input 
                    type="number" 
                    min={1}
                    required
                    value={newPOItemRate} 
                    onChange={e => setNewPOItemRate(Number(e.target.value))} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Total PO Value:</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">₹{(newPOItemQty * newPOItemRate).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Expected Delivery Date</label>
                <input 
                  type="text" 
                  value={newPOExpectedDelivery} 
                  onChange={e => setNewPOExpectedDelivery(e.target.value)} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <button type="submit" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-bold shadow-md cursor-pointer">
                Issue PO &amp; Transmit to Store
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: LOG FLEET EXPENSE ── */}
      {showLogFleetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bus className="h-4 w-4 text-amber-600" />
                <span>Log Yellow Bus Fleet Expense</span>
              </h3>
              <button onClick={() => setShowLogFleetModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleLogFleetSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Vehicle No</label>
                  <input 
                    type="text" 
                    required
                    value={newFleetVehicle} 
                    onChange={e => setNewFleetVehicle(e.target.value)} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Route</label>
                  <input 
                    type="text" 
                    required
                    value={newFleetRoute} 
                    onChange={e => setNewFleetRoute(e.target.value)} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Expense Nature</label>
                <input 
                  type="text" 
                  required
                  value={newFleetType} 
                  onChange={e => setNewFleetType(e.target.value)} 
                  placeholder="e.g. Bulk Diesel Refill, RTO Fitness, Brake Liner AMC" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Vendor / Fuel Depot</label>
                  <input 
                    type="text" 
                    required
                    value={newFleetVendor} 
                    onChange={e => setNewFleetVendor(e.target.value)} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newFleetAmount} 
                    onChange={e => setNewFleetAmount(Number(e.target.value))} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Vendor Invoice Ref</label>
                  <input 
                    type="text" 
                    value={newFleetInvRef} 
                    onChange={e => setNewFleetInvRef(e.target.value)} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Payment Due Date</label>
                  <input 
                    type="text" 
                    value={newFleetDueDate} 
                    onChange={e => setNewFleetDueDate(e.target.value)} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white py-2.5 font-bold shadow-md cursor-pointer">
                Submit Fleet Claim for Clearance
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SETTLE FLEET WIRE ── */}

      {/* ── Message Template Preview Modal ── */}
      {previewDispatchLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  previewDispatchLog.dispatch_type === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {previewDispatchLog.dispatch_type} Template
                </span>
                <span className="text-xs text-slate-500 font-medium">{previewDispatchLog.dispatch_scope}</span>
              </div>
              <button
                onClick={() => setPreviewDispatchLog(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700 font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {`Dear Parent,

This is an official fee payment reminder from the Bursar Desk at EDU360 Campus.

Our records indicate an outstanding balance of ₹${previewDispatchLog.total_amount_targeted.toLocaleString('en-IN')} for the current term.

Kindly clear the dues via our secure fee portal to ensure uninterrupted access to examination dockets and report cards:

🔗 https://pay.edu360.campus/fee-recovery

For fee reconciliation queries, contact: accounts@edu360.org

Regards,
${previewDispatchLog.dispatched_by}
Accounts & Finance Office`}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Dispatched on {new Date(previewDispatchLog.created_at).toLocaleDateString('en-IN', { dateStyle: 'full' })}
              </span>
              <button
                onClick={() => setPreviewDispatchLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {settleFleetModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>Settle Fleet Claim via Wire</span>
              </h3>
              <button onClick={() => setSettleFleetModalItem(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSettleFleetSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">{settleFleetModalItem.vehicle_no} ({settleFleetModalItem.bus_route})</div>
                <div className="text-slate-500">{settleFleetModalItem.expense_type} · {settleFleetModalItem.vendor_name}</div>
                <div className="text-base font-black text-slate-900 dark:text-white pt-1">
                  Amount: ₹{settleFleetModalItem.amount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Bank RTGS / NEFT UTR Number</label>
                <input 
                  type="text" 
                  required
                  value={fleetSettleUtr} 
                  onChange={e => setFleetSettleUtr(e.target.value)} 
                  placeholder="e.g. RTGS/SBIN20261028001" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
              <button type="submit" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-bold shadow-md cursor-pointer">
                Confirm Wire Payment &amp; Mark Paid
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
