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
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminTask, InventoryRecord } from '@/lib/types';
import { exportToCsv, printDossierReport } from '@/lib/export-utils';

type InventoryTab = 'tasks' | 'lab_store' | 'hardware' | 'vendor_orders';

export default function InventoryCoordinatorPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<InventoryTab>('tasks');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data State
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [taskExpandedId, setTaskExpandedId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Mrs. Shalini Rao (Store Lead)');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskSlaHours, setNewTaskSlaHours] = useState(48);
  const [escalateTaskId, setEscalateTaskId] = useState<number | null>(null);
  const [escalateReason, setEscalateReason] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, invRes] = await Promise.all([
        api.getAdminTasks('inventory'),
        api.getInventory()
      ]);
      setTasks(tRes);
      setInventory(invRes);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    await api.updateAdminTask(taskId, { status: newStatus });
    const updated = await api.getAdminTasks('inventory');
    setTasks(updated);
    triggerToast(`Inventory task updated to ${newStatus}`);
  };

  const handleEscalate = async (taskId: number) => {
    if (!escalateReason.trim()) { triggerToast('Please enter escalation reason.'); return; }
    await api.escalateAdminTask(taskId, escalateReason);
    const updated = await api.getAdminTasks('inventory');
    setTasks(updated);
    setEscalateTaskId(null);
    setEscalateReason('');
    triggerToast('Escalated to Principal & Bursar for emergency purchase order.');
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
    setShowCreateModal(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    triggerToast('Store & asset task logged into database');
  };

  const handleExportCsv = () => {
    const headers = ['Item Name', 'Category', 'Total Stock', 'Issued Count', 'Damaged Count', 'Reorder Level', 'Location'];
    const rows = inventory.map(i => [i.name, i.category, i.total_stock, i.issued_count, i.damaged_count, i.reorder_level, i.location]);
    exportToCsv('EDU360_Asset_Store_Consumables_Report', headers, rows);
    triggerToast('Inventory ledger exported to CSV.');
  };

  const handlePrintDossier = () => {
    const headers = ['Asset Name', 'Category', 'Total Stock', 'Issued', 'Reorder Threshold', 'Storage Location'];
    const rows = inventory.map(i => [i.name, i.category, i.total_stock, i.issued_count, i.reorder_level, i.location]);
    printDossierReport(
      'Campus Asset, Lab Consumables & Capital Inventory Dossier',
      'Science Reagents Audit, Smart Classroom Hardware, and Annual Depreciation Register',
      'Inventory & Asset Management Directorate',
      headers,
      rows
    );
  };

  const filteredTasks = tasks.filter(t => statusFilter === 'all' || t.status === statusFilter);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="h-4 w-4 text-teal-400 dark:text-teal-600" />
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
                    IN
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">Oakridge International</h3>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Mrs. Shalini Rao</span>
                  </div>
                </div>
              ) : (
                <div className="mx-auto h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
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

            {/* Menu */}
            <div className="p-3 space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Asset &amp; Store
                </span>
              )}
              {[
                { id: 'tasks', label: 'Store Tasks & SLAs', icon: Layers, badge: `${tasks.filter(t => t.status !== 'Completed').length} Open`, badgeType: 'amber' },
                { id: 'lab_store', label: 'Lab Consumables', icon: Boxes, badge: 'Low Stock Alert', badgeType: 'amber' },
                { id: 'hardware', label: 'Smart Hardware', icon: Wrench, badge: `${inventory.filter(i => i.category === 'IT Hardware').length} Assets`, badgeType: 'blue' },
                { id: 'vendor_orders', label: 'Vendor Procurement', icon: Truck }
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
                        item.badgeType === 'amber'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                          : item.badgeType === 'emerald'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
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
                  Academic Term 2
                </span>
                <span className="font-semibold text-slate-400 dark:text-slate-500 text-[10px]">CBSE 2026-27</span>
              </div>
            ) : (
              <div className="flex justify-center py-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="Academic Term 2 · CBSE 2026-27" />
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Content Canvas ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
                    Asset &amp; Store Directorate
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Science Labs, Sports Depot &amp; Smart Campus</span>
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Inventory &amp; Asset Management Console
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Consumable stock tracking, chemical acid safety buffers, smart classroom repairs, and supplier procurement handovers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-teal-600" />
                <span>Export Inventory CSV</span>
              </button>
              <button
                onClick={handlePrintDossier}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-teal-600" />
                <span>Print Dossier</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Log Store Task</span>
              </button>
            </div>
          </div>

          {/* ── Top KPI Strip (Dual-Theme Harmonized) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => setActiveTab('lab_store')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Reorder Alarms</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Critical
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">1 Triggered</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Chemistry Lab HCl Below 20%</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>View Lab Buffers</span>
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
                <div className="text-2xl font-black text-slate-900 dark:text-white">₹48.5L</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Audited in SIS Register</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Inspect Hardware</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('lab_store')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Exam Readiness</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  100% Certified
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">Ready</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Class 9 &amp; 10 Practicals Certified</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Verify Reagents</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('tasks')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Open Store Tasks</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Active
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {tasks.filter(t => t.status !== 'Completed').length}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Procurement &amp; stock delegations</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>View Task Board</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* ── TAB 1: STORE TASKS & SLAS ── */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Asset &amp; Inventory Tasks</h2>
                  <p className="text-xs text-slate-500">Procurement deadlines, lab replenishment, and hardware maintenance tickets</p>
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

          {/* ── TAB 2: LAB CONSUMABLES ── */}
          {activeTab === 'lab_store' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Science Laboratories Consumables &amp; Buffer Alarms</h2>
                <p className="text-xs text-slate-500">Real-time chemical reagent levels and auto-reorder trigger status</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  { name: 'Hydrochloric Acid (HCl 35%)', dept: 'Chemistry Lab', stock: '2 Litres', minBuffer: '5 Litres', status: 'Reorder Alarm Triggered', urgent: true },
                  { name: 'Microscope Slides & Coverslips', dept: 'Biology Lab', stock: '240 Units', minBuffer: '100 Units', status: 'Optimal Buffer', urgent: false },
                  { name: 'Optical Prisms & Lenses Set', dept: 'Physics Lab', stock: '18 Sets', minBuffer: '15 Sets', status: 'Optimal Buffer', urgent: false },
                  { name: 'Sodium Hydroxide Pellets (NaOH)', dept: 'Chemistry Lab', stock: '1.2 kg', minBuffer: '1.0 kg', status: 'Optimal Buffer', urgent: false },
                  { name: 'Dissection Needles & Trays', dept: 'Biology Lab', stock: '32 Units', minBuffer: '30 Units', status: 'Near Threshold', urgent: false },
                  { name: 'Digital Stopwatches & Verniers', dept: 'Physics Lab', stock: '25 Units', minBuffer: '20 Units', status: 'Calibrated & Ready', urgent: false },
                ].map(item => (
                  <div key={item.name} className={`rounded-2xl border p-4 ${item.urgent ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white">{item.name}</span>
                      <span className={`text-[10px] font-black ${item.urgent ? 'text-rose-600' : 'text-emerald-600'}`}>{item.status}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Location: {item.dept}</div>
                    <div className="flex items-center justify-between text-xs pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 font-semibold">
                      <span>In Stock: <b className="text-slate-900 dark:text-white">{item.stock}</b></span>
                      <span className="text-slate-400">Min Buffer: {item.minBuffer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: SMART HARDWARE ── */}
          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Smart Classroom Digital Infrastructure</h2>
                <p className="text-xs text-slate-500">Interactive touch panels, laser projectors, student tablet carts, and maintenance status</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Asset Tag</th>
                      <th className="p-3.5">Equipment Name</th>
                      <th className="p-3.5">Installed Location</th>
                      <th className="p-3.5">Condition</th>
                      <th className="p-3.5">Warranty &amp; AMC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {inventory.filter(i => i.category === 'IT Hardware').map(item => (
                      <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-teal-600">AST-{item.id}092</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{item.name}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{item.location}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.total_stock - item.issued_count <= item.reorder_level 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.total_stock - item.issued_count <= item.reorder_level ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">Valid till Dec 2027</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 4: VENDOR ORDERS ── */}
          {activeTab === 'vendor_orders' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Vendor Procurement &amp; Delivery Orders</h2>
                <p className="text-xs text-slate-500">Active purchase orders, chemical suppliers, and equipment handover verification</p>
              </div>

              <div className="space-y-3">
                {[
                  { po: 'PO-2026-081', vendor: 'BioChem Lab Supplies Bangalore', items: 'Hydrochloric Acid 10L, Reagent Bottles', value: '₹14,500', due: '24 Oct 2026', status: 'Dispatched' },
                  { po: 'PO-2026-082', vendor: 'SmartEdu Tech Solutions', items: '2x 4K Interactive Touch Panels (Grade 10)', value: '₹1,85,000', due: '28 Oct 2026', status: 'PO Approved' },
                  { po: 'PO-2026-083', vendor: 'Olympic Sports Equipment Depot', items: '40x FIFA Size 5 Footballs & Badminton Rackets', value: '₹38,000', due: '30 Oct 2026', status: 'Delivered & Inspected' }
                ].map(po => (
                  <div key={po.po} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-teal-600 dark:text-teal-400">{po.po}</span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{po.vendor}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">{po.status}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Items: {po.items}</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">Value: <b>{po.value}</b> · Expected by {po.due}</div>
                    </div>
                    <button 
                      onClick={() => triggerToast(`PO ${po.po} verification sign-off logged.`)}
                      className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold"
                    >
                      Inspect Delivery Handover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

      {/* ── CREATE TASK MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Log Asset &amp; Inventory Task</h3>
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
              <button type="submit" className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 font-bold mt-2">
                Log Inventory Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
