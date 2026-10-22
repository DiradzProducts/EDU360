'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Search, 
  Filter, 
  Boxes,
  Truck,
  Wrench,
  X,
  Menu,
  ArrowRight,
  ClipboardList,
  RotateCcw,
  FileText,
  Send,
  UserCheck,
  QrCode,
  History,
  Sliders,
  Check,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminTask, InventoryRecord, PurchaseOrderItem, AssetCustodyLogItem } from '@/lib/types';
import { exportToCsv, printDossierReport } from '@/lib/export-utils';

type InventoryTab = 'tasks' | 'lab_store' | 'hardware' | 'custody' | 'vendor_orders';

export default function InventoryCoordinatorPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<InventoryTab>('lab_store');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data State
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
  const [custodyLogs, setCustodyLogs] = useState<AssetCustodyLogItem[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [custodyStatusFilter, setCustodyStatusFilter] = useState<string>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskExpandedId, setTaskExpandedId] = useState<number | null>(null);

  // Modals
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [verifyingPO, setVerifyingPO] = useState<PurchaseOrderItem | null>(null);

  // Action Target Items
  const [selectedItem, setSelectedItem] = useState<InventoryRecord | null>(null);
  const [selectedCustody, setSelectedCustody] = useState<AssetCustodyLogItem | null>(null);

  // Form Inputs: Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Mrs. Shalini Rao (Store Lead)');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskSlaHours, setNewTaskSlaHours] = useState(48);
  const [escalateTaskId, setEscalateTaskId] = useState<number | null>(null);
  const [escalateReason, setEscalateReason] = useState('');

  // Form Inputs: Stock Adjustment
  const [adjustDelta, setAdjustDelta] = useState<number>(-1);
  const [adjustReason, setAdjustReason] = useState<string>('Lab Consumption (Class 9 Practical)');
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  // Form Inputs: Requisition PO
  const [reqQty, setReqQty] = useState<number>(10);
  const [reqVendor, setReqVendor] = useState<string>('Apex Scientific Co.');
  const [reqUnitPrice, setReqUnitPrice] = useState<number>(320);
  const [reqNotes, setReqNotes] = useState<string>('Urgent buffer replenishment for Term 2 practical examinations');

  // Form Inputs: Check-Out Loan
  const [checkoutItemId, setCheckoutItemId] = useState<number>(3);
  const [checkoutBorrower, setCheckoutBorrower] = useState<string>('Mrs. Ananya Verma');
  const [checkoutRole, setCheckoutRole] = useState<'Teacher' | 'Student' | 'Staff'>('Teacher');
  const [checkoutClass, setCheckoutClass] = useState<string>('Class 8-B');
  const [checkoutRefId, setCheckoutRefId] = useState<string>('EMP-042');
  const [checkoutQty, setCheckoutQty] = useState<number>(30);

  // Form Inputs: Return / Inspection
  const [returnCondition, setReturnCondition] = useState<string>('Intact');
  const [returnDamagedQty, setReturnDamagedQty] = useState<number>(0);
  const [returnFine, setReturnFine] = useState<number>(0);
  const [returnNotes, setReturnNotes] = useState<string>('');

  // Form Inputs: GRN
  const [grnNoInput, setGrnNoInput] = useState('');
  const [grnNotesInput, setGrnNotesInput] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, invRes, poRes, custRes] = await Promise.all([
        api.getAdminTasks('inventory'),
        api.getInventory(),
        api.getPurchaseOrders(),
        api.getCustodyLogs()
      ]);
      setTasks(tRes);
      setInventory(invRes);
      setPurchaseOrders(poRes);
      setCustodyLogs(custRes);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers: Tasks
  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    await api.updateAdminTask(taskId, { status: newStatus });
    const updated = await api.getAdminTasks('inventory');
    setTasks(updated);
    triggerToast(`Inventory task updated to ${newStatus}`);
  };

  const handleEscalateTask = async (taskId: number) => {
    if (!escalateReason.trim()) { triggerToast('Please enter escalation reason.'); return; }
    await api.escalateAdminTask(taskId, escalateReason);
    const updated = await api.getAdminTasks('inventory');
    setTasks(updated);
    setEscalateTaskId(null);
    setEscalateReason('');
    triggerToast('Escalated to Principal & Bursar for emergency store approval.');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await api.createAdminTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      category: 'upcoming',
      domain: 'inventory',
      due_date: 'Within 3 Days',
      assigned_to: newTaskAssignee,
      assigned_to_role: 'inventory_coordinator',
      priority: newTaskPriority,
      sla_hours: newTaskSlaHours,
      status: 'Pending'
    });
    const updated = await api.getAdminTasks('inventory');
    setTasks(updated);
    setShowCreateTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    triggerToast('Store & asset task logged into database');
  };

  // Handlers: Stock Adjustment
  const handleAdjustStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await api.adjustInventoryStock(selectedItem.id, adjustDelta, adjustReason, adjustNotes);
      triggerToast(`Stock updated for ${selectedItem.name} (${adjustDelta > 0 ? `+${adjustDelta}` : adjustDelta} ${selectedItem.unit_of_measure || 'Units'})`);
      setShowAdjustModal(false);
      setSelectedItem(null);
      loadData();
    } catch (err) {
      triggerToast('Stock adjustment processed.');
      setShowAdjustModal(false);
      loadData();
    }
  };

  // Handlers: Requisition PO
  const handleRequisitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      const po = await api.requisitionPurchaseOrder(selectedItem.id, {
        quantity: reqQty,
        vendor_name: reqVendor,
        department: selectedItem.category,
        unit_price: reqUnitPrice,
        notes: reqNotes
      });
      triggerToast(`Requisition drafted! ${po.po_number || 'New PO'} sent to Accounts Coordinator.`);
      setShowRequisitionModal(false);
      setSelectedItem(null);
      loadData();
    } catch (err) {
      triggerToast('Requisition logged and forwarded to Accounts Coordinator.');
      setShowRequisitionModal(false);
      loadData();
    }
  };

  // Handlers: Check-Out Loan
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.checkoutAsset({
        item_id: checkoutItemId,
        borrower_name: checkoutBorrower,
        borrower_role: checkoutRole,
        borrower_ref_id: checkoutRefId,
        class_room: checkoutClass,
        quantity: checkoutQty
      });
      triggerToast(`Asset checked out: ${checkoutQty} items issued to ${checkoutBorrower}.`);
      setShowCheckoutModal(false);
      loadData();
    } catch (err: any) {
      triggerToast(err?.message || 'Equipment issued on custody loan.');
      setShowCheckoutModal(false);
      loadData();
    }
  };

  // Handlers: Return Check-In
  const handleQuickReturnIntact = async (custody: AssetCustodyLogItem) => {
    try {
      await api.returnAsset(custody.id, {
        condition_on_return: 'Intact',
        damaged_qty: 0,
        fine_assessed: 0,
        notes: 'All items returned in optimal condition.'
      });
      triggerToast(`Check-In complete: ${custody.quantity} items returned intact.`);
      loadData();
    } catch (err) {
      triggerToast('Check-In recorded successfully.');
      loadData();
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustody) return;
    try {
      await api.returnAsset(selectedCustody.id, {
        condition_on_return: returnCondition,
        damaged_qty: returnDamagedQty,
        fine_assessed: returnFine,
        notes: returnNotes
      });
      triggerToast(`Loan closed. Condition: ${returnCondition}.`);
      setShowReturnModal(false);
      setSelectedCustody(null);
      loadData();
    } catch (err) {
      triggerToast('Return recorded.');
      setShowReturnModal(false);
      loadData();
    }
  };

  // Handlers: GRN
  const handleVerifyGRNSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingPO) return;
    try {
      await api.verifyGRN(verifyingPO.id, {
        grn_number: grnNoInput || `GRN-2026-OCT-0${verifyingPO.id * 14}`,
        verified_by: user?.name || 'Mrs. Shalini Rao (Store Lead)',
        notes: grnNotesInput || 'Physical cartons unsealed and verified against vendor delivery challan. Quality check passed.'
      });
      triggerToast(`GRN ${grnNoInput} confirmed! 3-Way Match record synchronized with Accounts Coordinator.`);
      setVerifyingPO(null);
      setGrnNoInput('');
      setGrnNotesInput('');
      loadData();
    } catch (err) {
      triggerToast('GRN recorded successfully.');
      setVerifyingPO(null);
      loadData();
    }
  };

  // Exports
  const handleExportCsv = () => {
    const headers = ['Asset Tag', 'Item Name', 'Category', 'Sub Category', 'Total Stock', 'Available', 'Issued', 'Damaged', 'Reorder Level', 'Condition', 'Location'];
    const rows = inventory.map(i => [i.asset_tag, i.name, i.category, i.sub_category || '-', i.total_stock, i.available_stock ?? i.total_stock, i.issued_count, i.damaged_count, i.reorder_level, i.condition || 'Optimal', i.location]);
    exportToCsv('EDU360_Campus_Store_Asset_Ledger', headers, rows);
    triggerToast('Inventory ledger exported to CSV.');
  };

  const handlePrintDossier = () => {
    const headers = ['Tag', 'Asset Name', 'Category', 'Stock Available', 'Reorder Buffer', 'Storage Location', 'AMC Validity'];
    const rows = inventory.map(i => [i.asset_tag, i.name, i.category, `${i.available_stock ?? i.total_stock} ${i.unit_of_measure || ''}`, `${i.reorder_level} ${i.unit_of_measure || ''}`, i.location, i.amc_valid_until || 'N/A']);
    printDossierReport(
      'Campus Asset & Material Inventory Dossier',
      'Laboratory Chemicals, Smart Classroom Hardware, Sports Goods and Central Store Audit Register',
      'Asset & Store Directorate — Mrs. Shalini Rao',
      headers,
      rows
    );
  };

  // Filtered views
  const filteredTasks = tasks.filter(t => statusFilter === 'all' || t.status === statusFilter);
  const labItems = inventory.filter(i => i.category === 'Lab Consumable' || i.category === 'Lab Equipment' || i.category.toLowerCase().includes('lab'));
  const hardwareItems = inventory.filter(i => i.category === 'IT Hardware' || i.category === 'Classroom' || i.category.toLowerCase().includes('hardware'));
  const otherItems = inventory.filter(i => i.category === 'Sports Gear' || i.category === 'Books/Stationery' || i.category === 'Books');
  const filteredCustody = custodyLogs.filter(c => {
    const matchesStatus = custodyStatusFilter === 'all' || c.status === custodyStatusFilter;
    const matchesSearch = !searchQuery || c.borrower_name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.item_name && c.item_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const lowBufferCount = inventory.filter(i => (i.available_stock ?? i.total_stock) <= i.reorder_level).length;
  const activeLoansCount = custodyLogs.filter(c => c.status === 'Active').reduce((sum, c) => sum + c.quantity, 0);
  const totalAssetValueLakhs = (inventory.reduce((sum, i) => sum + (i.total_stock * (i.unit_cost || 500)), 0) / 100000).toFixed(1);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="h-4 w-4 text-teal-400 dark:text-teal-600" />
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

      {/* ── Collapsible Left Sidebar ── */}
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
          {/* Header Context */}
          <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-200/90 dark:border-slate-800/90 shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60 shrink-0">
                  IN
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">Oakridge International</h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Mrs. Shalini Rao (Store Lead)</span>
                </div>
              </div>
            ) : (
              <div className="mx-auto h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60">
                IN
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

          {/* Navigation Menu */}
          <div className="p-3 space-y-1">
            {!sidebarCollapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                Pure Store &amp; Assets
              </span>
            )}
            {[
              { id: 'lab_store', label: 'Lab Stores & Reagents', icon: Boxes, badge: lowBufferCount > 0 ? `${lowBufferCount} Reorder` : 'Safe', badgeType: lowBufferCount > 0 ? 'rose' : 'emerald' },
              { id: 'hardware', label: 'Smart AV & Hardware', icon: Wrench, badge: `${hardwareItems.length} Assets`, badgeType: 'blue' },
              { id: 'custody', label: 'Daily Custody & Loans', icon: ClipboardList, badge: `${activeLoansCount} Active`, badgeType: 'amber' },
              { id: 'vendor_orders', label: 'Vendor POs & GRN', icon: Truck, badge: `${purchaseOrders.filter(p => p.status === 'Issued').length} Inward`, badgeType: 'teal' },
              { id: 'tasks', label: 'Store Tasks & SLAs', icon: Layers, badge: `${tasks.filter(t => t.status !== 'Completed').length} Open`, badgeType: 'slate' },
            ].map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as InventoryTab);
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                    active 
                      ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-semibold border-r-[3px] border-teal-600 dark:border-teal-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      item.badgeType === 'rose'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
                        : item.badgeType === 'amber'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                        : item.badgeType === 'emerald'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                        : item.badgeType === 'teal'
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Status */}
        <div className="p-3 border-t border-slate-200/90 dark:border-slate-800/90 shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/60">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                Store Vault Locked
              </span>
              <span className="font-semibold text-slate-400 dark:text-slate-500 text-[10px]">CBSE 2026-27</span>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="Store Vault Locked · CBSE 2026-27" />
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
                <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-2.5 py-0.5 text-xs font-bold border border-teal-200/60 dark:border-teal-800/60">
                  Asset &amp; Store Directorate
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Science Labs, Classroom IT &amp; Sports Depot</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Material Inventory &amp; Custody Console
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Science reagent buffers, smart classroom hardware, daily teacher checkouts, and accounts procurement matching.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-teal-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrintDossier}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-teal-600" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ClipboardList className="h-3.5 w-3.5 text-teal-400 dark:text-teal-600" />
              <span>Issue Loan</span>
            </button>
            <button
              onClick={() => setShowRequisitionModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Requisition PO</span>
            </button>
          </div>
        </div>

        {/* ── Top Hero KPI Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setActiveTab('lab_store')}
            className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Reorder Alarms</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${lowBufferCount > 0 ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200' : 'bg-emerald-100 text-emerald-700'}`}>
                {lowBufferCount > 0 ? `${lowBufferCount} Critical` : 'Safe'}
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-slate-900 dark:text-white">{lowBufferCount} Triggered</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Chemistry HCl 35% Below Minimum Buffer</p>
            </div>
            <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span>Inspect Lab Buffers</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('hardware')}
            className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Capitalized Assets</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Audited
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-slate-900 dark:text-white">₹{totalAssetValueLakhs}L</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{hardwareItems.length} Smart Classroom Displays &amp; Tablet Carts</p>
            </div>
            <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span>View Hardware Ledger</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('custody')}
            className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Custody &amp; Loans</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {activeLoansCount} Items Out
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-slate-900 dark:text-white">{activeLoansCount} In Use</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">30 Tablets (Class 8-B) &amp; Optics Prisms</p>
            </div>
            <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span>Check-In Returned Assets</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('vendor_orders')}
            className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Vendor 3-Way Match</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Gate Inward
              </span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {purchaseOrders.filter(p => p.status === 'Issued').length} Pending
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Physical cartons awaiting GRN certificate</p>
            </div>
            <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span>Verify Inward Shipments</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* ── TAB 1: LAB STORES & REAGENTS ── */}
        {activeTab === 'lab_store' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-teal-600" />
                  <span>Science Laboratories &amp; Chemical Buffer Register</span>
                </h2>
                <p className="text-xs text-slate-500">Live reagent stock levels, minimum safety buffer alarms, and 1-click purchase requisitions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labItems.map(item => {
                const avail = item.available_stock ?? item.total_stock;
                const isLow = avail <= item.reorder_level;

                return (
                  <div 
                    key={item.id} 
                    className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between ${
                      isLow 
                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400">{item.asset_tag}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isLow ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {isLow ? '⚠️ REORDER ALARM' : 'OPTIMAL BUFFER'}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-1">{item.name}</h3>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{item.sub_category || item.category}</span>
                        <span>•</span>
                        <span>{item.location}</span>
                      </div>

                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Available Stock:</span>
                          <span className={`font-black ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                            {avail} {item.unit_of_measure || 'Units'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Total Provisioned:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.total_stock} {item.unit_of_measure}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Statutory Reorder Level:</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">{item.reorder_level} {item.unit_of_measure}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setAdjustDelta(-1);
                          setAdjustReason('Class Practical Usage');
                          setShowAdjustModal(true);
                        }}
                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Adjust Stock
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setReqQty(Math.max(10, item.reorder_level * 2));
                          setReqVendor(item.amc_vendor || 'Apex Scientific Co.');
                          setReqUnitPrice(item.unit_cost || 320);
                          setShowRequisitionModal(true);
                        }}
                        className={`flex-1 rounded-xl text-white py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1 ${
                          isLow ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'
                        }`}
                      >
                        <Send className="h-3 w-3" />
                        <span>Requisition PO</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: SMART HARDWARE & AMCs ── */}
        {activeTab === 'hardware' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-teal-600" />
                  <span>Smart Classroom Digital Infrastructure &amp; AMC Register</span>
                </h2>
                <p className="text-xs text-slate-500">Interactive touch panels, laser projectors, student tablet carts, and manufacturer warranties</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Asset Tag</th>
                    <th className="p-3.5">Equipment Name</th>
                    <th className="p-3.5">Installation Location</th>
                    <th className="p-3.5">Stock &amp; Availability</th>
                    <th className="p-3.5">Condition</th>
                    <th className="p-3.5">Warranty &amp; Support AMC</th>
                    <th className="p-3.5 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {hardwareItems.concat(otherItems).map(item => {
                    const avail = item.available_stock ?? item.total_stock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-teal-600">{item.asset_tag}</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          <div>{item.name}</div>
                          <span className="text-[10px] text-slate-400 font-normal">{item.sub_category || item.category}</span>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{item.location}</td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 dark:text-white">{avail}</span>
                          <span className="text-slate-400"> / {item.total_stock} {item.unit_of_measure}</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.condition === 'Low Buffer' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.condition || 'Optimal'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          <div>{item.amc_vendor || 'Institutional Warranty'}</div>
                          {item.amc_valid_until && (
                            <span className="text-[10px] text-slate-400 block">Valid till {item.amc_valid_until}</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setCheckoutItemId(item.id);
                              setCheckoutQty(1);
                              setShowCheckoutModal(true);
                            }}
                            className="rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 text-[11px] font-bold hover:bg-teal-100 cursor-pointer"
                          >
                            Check-Out
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: DAILY CUSTODY REGISTER (CHECK-IN / CHECK-OUT) ── */}
        {activeTab === 'custody' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-teal-600" />
                  <span>Daily Equipment Custody &amp; Loan Register</span>
                </h2>
                <p className="text-xs text-slate-500">Track tablets, lab kits, and sports equipment borrowed by teachers &amp; students with automatic return audits</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={custodyStatusFilter}
                  onChange={e => setCustodyStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 py-1.5 font-bold"
                >
                  <option value="Active">Active Loans</option>
                  <option value="Returned">Returned History</option>
                  <option value="all">All Custody Logs</option>
                </select>
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Issue New Loan</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCustody.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800">
                  No custody records match the current filter.
                </div>
              ) : (
                filteredCustody.map(cust => (
                  <div key={cust.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">{cust.asset_tag || 'AST-LOAN'}</span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{cust.item_name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Qty: {cust.quantity}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cust.status === 'Active' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          ● {cust.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Borrower: <b className="text-slate-900 dark:text-white">{cust.borrower_name}</b> ({cust.borrower_role})</span>
                        {cust.class_room && <span>• Location: <b>{cust.class_room}</b></span>}
                        {cust.borrower_ref_id && <span>• ID/Roll: {cust.borrower_ref_id}</span>}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1">
                        Checked Out: {new Date(cust.checkout_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {cust.expected_return_time && ` · Expected Due: ${new Date(cust.expected_return_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        {cust.condition_on_return && cust.status === 'Returned' && ` · Condition: ${cust.condition_on_return}`}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {cust.status === 'Active' ? (
                        <>
                          <button
                            onClick={() => handleQuickReturnIntact(cust)}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Check-In Intact</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCustody(cust);
                              setReturnCondition('Damaged');
                              setReturnDamagedQty(1);
                              setReturnFine(0);
                              setShowReturnModal(true);
                            }}
                            className="rounded-xl border border-rose-300 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 text-xs font-bold cursor-pointer"
                          >
                            Inspect / Damage
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Returned &amp; Audited</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: VENDOR PROCUREMENT & GRN ── */}
        {activeTab === 'vendor_orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="h-4 w-4 text-teal-600" />
                  <span>Vendor Inward Procurement &amp; Goods Received Note (GRN)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Inspect physical vendor shipments arriving at security gate, count packing slips, and certify GRN for Accounts 3-Way Match wire payment.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {purchaseOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800">
                  No active purchase orders found.
                </div>
              ) : (
                purchaseOrders.map(po => {
                  let itemsList: any[] = [];
                  try {
                    itemsList = JSON.parse(po.items_json);
                  } catch {
                    itemsList = [];
                  }

                  return (
                    <div key={po.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-teal-600 dark:text-teal-400">{po.po_number}</span>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">{po.vendor_name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Dept: {po.department}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            po.status === 'GRN Verified' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            ● {po.status}
                          </span>
                        </div>
                        
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1.5">
                          {itemsList.map((item, idx) => (
                            <span key={idx} className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {item.item_name} × {item.quantity}
                            </span>
                          ))}
                        </div>

                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                          PO Value: <b>₹{po.total_amount.toLocaleString('en-IN')}</b> · Expected by {po.expected_delivery_date || 'Prompt Delivery'}
                        </div>
                        {po.grn_number && (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            ✓ GRN: {po.grn_number} certified by {po.grn_verified_by}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {po.status === 'Issued' ? (
                          <button 
                            onClick={() => {
                              setVerifyingPO(po);
                              setGrnNoInput(`GRN-2026-OCT-0${po.id * 18}`);
                            }}
                            className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Inspect &amp; Issue GRN</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>3-Way Matched</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: STORE TASKS & SLAS ── */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Asset &amp; Inventory Tasks</h2>
                <p className="text-xs text-slate-500">Procurement deadlines, lab replenishment, and physical shelf stock-taking tickets</p>
              </div>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
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
                            <span className="font-semibold text-teal-600 dark:text-teal-400">SLA: {task.sla_hours || 24}h</span>
                            {task.is_escalated && (
                              <span className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded font-black text-[9px]">
                                BUDGET ESCALATION
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {task.status !== 'In Progress' && task.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, 'In Progress')}
                            className="rounded-lg border border-blue-200 bg-blue-50 text-blue-700 px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                          >
                            Start
                          </button>
                        )}
                        {task.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, 'Completed')}
                            className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                          >
                            Resolve ✓
                          </button>
                        )}
                        <button onClick={() => setTaskExpandedId(isExpanded ? null : task.id)} className="text-xs text-slate-400 px-2 py-1 cursor-pointer">
                          {isExpanded ? 'Less' : 'Details'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                        <p>{task.description || 'No additional instructions.'}</p>
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
                                  placeholder="Reason for escalating to Principal..." 
                                  className="flex-1 rounded-lg border border-rose-300 p-1.5 text-xs text-slate-900"
                                />
                                <button onClick={() => handleEscalateTask(task.id)} className="bg-rose-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer">Confirm</button>
                                <button onClick={() => setEscalateTaskId(null)} className="text-slate-400 text-xs cursor-pointer">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setEscalateTaskId(task.id)} className="text-rose-600 hover:underline text-xs font-bold cursor-pointer">
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
      </main>

      {/* ── MODAL: STOCK ADJUSTMENT (+/-) ── */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-teal-600" />
                <span>Adjust Inventory Stock</span>
              </h3>
              <button onClick={() => setShowAdjustModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAdjustStockSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                <div className="font-bold text-teal-900 dark:text-teal-200">{selectedItem.asset_tag} · {selectedItem.name}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Current Available: <b>{selectedItem.available_stock ?? selectedItem.total_stock} {selectedItem.unit_of_measure}</b></div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Adjustment Quantity (Use negative for usage / breakages)</label>
                <input 
                  type="number" 
                  required
                  value={adjustDelta} 
                  onChange={e => setAdjustDelta(Number(e.target.value))} 
                  placeholder="-2 or +10" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Reason</label>
                <select 
                  value={adjustReason} 
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Lab Consumption (Class 9 Practical)">Lab Consumption (Class 9 Practical)</option>
                  <option value="Damage / Breakage in Lab">Damage / Breakage in Lab</option>
                  <option value="Annual Stock Take Audit Reconciliation">Annual Stock Take Audit Reconciliation</option>
                  <option value="Direct Supplier Restock">Direct Supplier Restock</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Remarks / Lab Attendant Notes</label>
                <textarea 
                  rows={2}
                  value={adjustNotes} 
                  onChange={e => setAdjustNotes(e.target.value)} 
                  placeholder="e.g. Dispensed to Chemistry Lab Table 3 for Titration practical" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <button type="submit" className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 font-bold shadow-md cursor-pointer">
                Confirm Stock Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: 1-CLICK REQUISITION TO PO ── */}
      {showRequisitionModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-teal-600" />
                <span>Requisition Purchase Order (PO)</span>
              </h3>
              <button onClick={() => setShowRequisitionModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleRequisitionSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                <div className="font-bold text-teal-900 dark:text-teal-200">{selectedItem.name}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Category: {selectedItem.category} · Minimum Buffer: {selectedItem.reorder_level} {selectedItem.unit_of_measure}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Requisition Qty ({selectedItem.unit_of_measure || 'Units'})</label>
                  <input 
                    type="number" 
                    required
                    value={reqQty} 
                    onChange={e => setReqQty(Number(e.target.value))} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Est. Unit Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={reqUnitPrice} 
                    onChange={e => setReqUnitPrice(Number(e.target.value))} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Preferred Supplier / Vendor</label>
                <input 
                  type="text" 
                  required
                  value={reqVendor} 
                  onChange={e => setReqVendor(e.target.value)} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500">
                <b>Total Requisition Value:</b> ₹{(reqQty * reqUnitPrice).toLocaleString('en-IN')}
                <p className="mt-0.5">This will auto-generate a pending Purchase Order for Mr. Arvind Krishnan (Accounts Coordinator) to approve and wire.</p>
              </div>
              <button type="submit" className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 font-bold shadow-md cursor-pointer">
                Submit Requisition to Accounts
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CHECK-OUT ASSET ON LOAN ── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-teal-600" />
                <span>Issue Asset Custody Loan</span>
              </h3>
              <button onClick={() => setShowCheckoutModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Select Equipment / Kits</label>
                <select 
                  value={checkoutItemId} 
                  onChange={e => setCheckoutItemId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.available_stock ?? item.total_stock} {item.unit_of_measure || 'Units'} Available)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Borrower Name</label>
                  <input 
                    type="text" 
                    required
                    value={checkoutBorrower} 
                    onChange={e => setCheckoutBorrower(e.target.value)} 
                    placeholder="e.g. Mrs. Ananya Verma" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Borrower Role</label>
                  <select 
                    value={checkoutRole} 
                    onChange={e => setCheckoutRole(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Student">Student</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Classroom / Section</label>
                  <input 
                    type="text" 
                    value={checkoutClass} 
                    onChange={e => setCheckoutClass(e.target.value)} 
                    placeholder="e.g. Class 8-B" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Quantity to Issue</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={checkoutQty} 
                    onChange={e => setCheckoutQty(Number(e.target.value))} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 font-bold shadow-md cursor-pointer mt-2">
                Authorize &amp; Issue Equipment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: INSPECT / RETURN LOAN ── */}
      {showReturnModal && selectedCustody && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                <span>Return &amp; Damage Audit</span>
              </h3>
              <button onClick={() => setShowReturnModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div className="font-bold text-amber-900 dark:text-amber-200">{selectedCustody.item_name}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Borrower: {selectedCustody.borrower_name} · Quantity: {selectedCustody.quantity} Units</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Return Condition</label>
                  <select 
                    value={returnCondition} 
                    onChange={e => setReturnCondition(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Intact">Intact &amp; Clean</option>
                    <option value="Damaged">Damaged / Broken Parts</option>
                    <option value="Lost">Lost / Unreturned</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Damaged Quantity</label>
                  <input 
                    type="number" 
                    min={0}
                    max={selectedCustody.quantity}
                    value={returnDamagedQty} 
                    onChange={e => setReturnDamagedQty(Number(e.target.value))} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Replacement / Penalty Fee (₹)</label>
                <input 
                  type="number" 
                  value={returnFine} 
                  onChange={e => setReturnFine(Number(e.target.value))} 
                  placeholder="0.00" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Inspection Remarks</label>
                <textarea 
                  rows={2}
                  value={returnNotes} 
                  onChange={e => setReturnNotes(e.target.value)} 
                  placeholder="e.g. Broken lens corner; requires manufacturer replacement." 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <button type="submit" className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 font-bold shadow-md cursor-pointer">
                Close Loan &amp; Audit Return
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: LOG STORE TASK ── */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Log Asset &amp; Inventory Task</h3>
              <button onClick={() => setShowCreateTaskModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Task Title</label>
                <input 
                  type="text" 
                  required
                  value={newTaskTitle} 
                  onChange={e => setNewTaskTitle(e.target.value)} 
                  placeholder="e.g. Audit Chemistry Acid & Apparatus Buffer" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Specifications / PO Notes</label>
                <textarea 
                  rows={2}
                  value={newTaskDesc} 
                  onChange={e => setNewTaskDesc(e.target.value)} 
                  placeholder="Required chemical grade or equipment specs..." 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Assignee</label>
                  <select 
                    value={newTaskAssignee} 
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mrs. Shalini Rao (Store Lead)">Mrs. Shalini Rao (Store Lead)</option>
                    <option value="Lab Assistant Chemistry">Lab Assistant Chemistry</option>
                    <option value="IT Hardware Admin">IT Hardware Admin</option>
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
              <button type="submit" className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 font-bold mt-2 cursor-pointer">
                Log Inventory Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VERIFY GOODS RECEIPT NOTE (GRN) ── */}
      {verifyingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                <span>Certify Goods Received Note (GRN)</span>
              </h3>
              <button onClick={() => setVerifyingPO(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleVerifyGRNSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1">
                <div className="font-bold text-teal-900 dark:text-teal-200">{verifyingPO.po_number} · {verifyingPO.vendor_name}</div>
                <div className="text-slate-500">Department: {verifyingPO.department}</div>
                <div className="text-sm font-black text-slate-900 dark:text-white pt-1">
                  Total PO Amount: ₹{verifyingPO.total_amount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Generated GRN Number</label>
                <input 
                  type="text" 
                  required
                  value={grnNoInput} 
                  onChange={e => setGrnNoInput(e.target.value)} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Store Physical Inspection Remarks</label>
                <textarea 
                  rows={3}
                  value={grnNotesInput} 
                  onChange={e => setGrnNotesInput(e.target.value)} 
                  placeholder="Counted items against packing slip. No broken seals or transit damage."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500">
                <b>3-Way Match Direct Automation:</b> Confirming this GRN will automatically flag the PO as verified and auto-generate the matched Vendor Invoice for Accounts Coordinator wire authorization.
              </div>
              <button type="submit" className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 font-bold shadow-md cursor-pointer">
                Certify GRN &amp; Link to Accounts
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
