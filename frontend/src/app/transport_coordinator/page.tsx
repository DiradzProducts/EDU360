'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Truck, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  X,
  Gauge,
  FileText,
  Menu,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminTask } from '@/lib/types';
import { exportToCsv, printDossierReport } from '@/lib/export-utils';

type TransportTab = 'tasks' | 'fleet_radar' | 'rto_compliance' | 'driver_roster';

export default function TransportCoordinatorPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TransportTab>('tasks');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data State
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [taskExpandedId, setTaskExpandedId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Mr. Vikram Malhotra');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskSlaHours, setNewTaskSlaHours] = useState(24);
  const [escalateTaskId, setEscalateTaskId] = useState<number | null>(null);
  const [escalateReason, setEscalateReason] = useState('');

  // Fleet state
  const [fleetList] = useState([
    { id: 1, busNo: 'Bus #1 · KA-01-AB-1201', route: 'Route 1 · Indiranagar Express', driver: 'Ramesh Kumar (+91 98765 00011)', status: 'On Route', speed: '38 km/h', students: 42, rtoFitnessDays: 140 },
    { id: 2, busNo: 'Bus #2 · KA-01-AB-1202', route: 'Route 2 · Koramangala Ring', driver: 'Suresh Gowda (+91 98765 00012)', status: 'On Route', speed: '42 km/h', students: 38, rtoFitnessDays: 95 },
    { id: 3, busNo: 'Bus #3 · KA-01-AB-1203', route: 'Route 3 · Whitefield IT Corridor', driver: 'Manjunath N (+91 98765 00013)', status: 'On Route', speed: '35 km/h', students: 46, rtoFitnessDays: 180 },
    { id: 4, busNo: 'Bus #4 · KA-01-AB-1204', route: 'Route 4 · HSR Layout Loop', driver: 'Praveen Yadav (+91 98765 00014)', status: 'In Inspection', speed: '0 km/h', students: 0, rtoFitnessDays: 15 },
    { id: 5, busNo: 'Bus #5 · KA-01-AB-1205', route: 'Route 5 · Electronic City Phase 1', driver: 'Gopal Reddy (+91 98765 00015)', status: 'Standby', speed: '0 km/h', students: 0, rtoFitnessDays: 210 },
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const tRes = await api.getAdminTasks('transport');
      setTasks(tRes);
    } catch (err) {
      console.error('Failed to load transport tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    await api.updateAdminTask(taskId, { status: newStatus });
    const updated = await api.getAdminTasks('transport');
    setTasks(updated);
    triggerToast(`Fleet task status updated to ${newStatus}`);
  };

  const handleEscalate = async (taskId: number) => {
    if (!escalateReason.trim()) { triggerToast('Please enter escalation reason.'); return; }
    await api.escalateAdminTask(taskId, escalateReason);
    const updated = await api.getAdminTasks('transport');
    setTasks(updated);
    setEscalateTaskId(null);
    setEscalateReason('');
    triggerToast('Escalated to Principal & Safety Committee.');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await api.createAdminTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      category: 'urgent',
      domain: 'transport',
      due_date: 'Today, 6:00 PM',
      assigned_to: newTaskAssignee,
      assigned_to_role: 'transport_coordinator',
      priority: newTaskPriority,
      sla_hours: newTaskSlaHours,
      status: 'Pending'
    });
    const updated = await api.getAdminTasks('transport');
    setTasks(updated);
    setShowCreateModal(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    triggerToast('Transport operation task logged into database');
  };

  const handleExportCsv = () => {
    const headers = ['Bus ID', 'Vehicle Plate', 'Route Name', 'Assigned Driver', 'Operating Status', 'RTO Fitness Days Remaining'];
    const rows = fleetList.map(b => [b.id, b.busNo, b.route, b.driver, b.status, `${b.rtoFitnessDays} Days`]);
    exportToCsv('EDU360_Fleet_Operations_Telemetry_Report', headers, rows);
    triggerToast('Transport fleet & telemetry exported as CSV.');
  };

  const handlePrintDossier = () => {
    const headers = ['Vehicle Registration', 'Assigned Route', 'Driver & Phone', 'Speed & Telemetry', 'RTO Fitness'];
    const rows = fleetList.map(b => [b.busNo, b.route, b.driver, `${b.status} (${b.speed})`, `${b.rtoFitnessDays} Days Left`]);
    printDossierReport(
      'Yellow Bus Fleet Safety & RTO Regulatory Dossier',
      'Daily Telemetry Status, Speed Governor Calibration, and Statutory Fleet Compliance',
      'Transport & Fleet Operations Directorate',
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
          <Sparkles className="h-4 w-4 text-amber-400 dark:text-amber-600" />
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
                    TR
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">Oakridge International</h3>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Mr. Vikram Malhotra</span>
                  </div>
                </div>
              ) : (
                <div className="mx-auto h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                  TR
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
                  Fleet &amp; Logistics
                </span>
              )}
              {[
                { id: 'tasks', label: 'Fleet Tasks & SLAs', icon: Layers, badge: `${tasks.filter(t => t.status !== 'Completed').length} Open`, badgeType: 'amber' },
                { id: 'fleet_radar', label: 'Live Bus Radar', icon: MapPin, badge: '5 Active', badgeType: 'emerald' },
                { id: 'rto_compliance', label: 'RTO Compliance', icon: ShieldCheck, badge: 'Bus #4 Due', badgeType: 'amber' },
                { id: 'driver_roster', label: 'Driver Contacts', icon: PhoneCall }
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TransportTab);
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
                    Fleet &amp; Logistics
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Campus Yellow Bus Transport Directorate</span>
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Transport &amp; Fleet Operations Center
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Yellow bus tracking, speed governor calibration, driver rosters, emergency SOS response, and RTO statutory renewals.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-amber-600" />
                <span>Export Fleet CSV</span>
              </button>
              <button
                onClick={handlePrintDossier}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-amber-600" />
                <span>Print Dossier</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Assign Fleet Task</span>
              </button>
            </div>
          </div>

          {/* ── Top KPI Strip (Dual-Theme Harmonized) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => setActiveTab('fleet_radar')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Yellow Buses</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  100% Operational
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">5 / 5</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">All fleet vehicles in active service</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>View Fleet Radar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('fleet_radar')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Arrival Precision</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  ±3m SLA
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">98.4%</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">On-time student boarding rate</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Inspect Telemetry</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('rto_compliance')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">RTO Fitness Alert</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  15 Days Left
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">Bus #4</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Statutory speed governor renewal</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>RTO Compliance Desk</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('tasks')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Open Fleet Tasks</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Tracked
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {tasks.filter(t => t.status !== 'Completed').length}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Maintenance &amp; driver checks</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>View Task Ledger</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* ── TAB 1: TASKS ── */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Transport &amp; Fleet Tasks</h2>
                  <p className="text-xs text-slate-500">Vehicle inspections, driver background clearances, and trip logistics</p>
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
                              <span className="font-semibold text-amber-600 dark:text-amber-400">SLA: {task.sla_hours || 24}h</span>
                              {task.is_escalated && (
                                <span className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded font-black text-[9px]">
                                  SAFETY ESCALATION
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
                          <p>{task.description || 'No additional details.'}</p>
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
                                    placeholder="Reason for safety escalation..." 
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

          {/* ── TAB 2: LIVE FLEET RADAR ── */}
          {activeTab === 'fleet_radar' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Campus Bus Fleet Radar</h2>
                <p className="text-xs text-slate-500">Real-time GPS telemetry, speed governor compliance, and passenger boarding rosters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {fleetList.map(bus => (
                  <div key={bus.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">{bus.busNo}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bus.status === 'On Route' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {bus.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{bus.route}</div>
                    <div className="text-xs text-slate-500">Driver: <b>{bus.driver}</b></div>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <span>Live Speed: <b>{bus.speed}</b></span>
                      <span>Onboard: <b>{bus.students} Students</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: RTO COMPLIANCE ── */}
          {activeTab === 'rto_compliance' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">RTO Statutory Fitness &amp; Safety Ledger</h2>
                <p className="text-xs text-slate-500">Government RTO vehicle fitness, speed governor certification, and fire extinguisher expiry</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Vehicle</th>
                      <th className="p-3.5">Assigned Route</th>
                      <th className="p-3.5">Speed Governor Limit</th>
                      <th className="p-3.5">RTO Fitness Expiry</th>
                      <th className="p-3.5">Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {fleetList.map(b => (
                      <tr key={b.busNo} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{b.busNo}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{b.route}</td>
                        <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">40 km/h (Strict Sealed)</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{b.rtoFitnessDays} Days Remaining</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.rtoFitnessDays < 30 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {b.rtoFitnessDays < 30 ? 'Inspection Due' : 'Certified'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 4: DRIVER ROSTER ── */}
          {activeTab === 'driver_roster' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Institutional Driver Directory &amp; Verification</h2>
                <p className="text-xs text-slate-500">Police verification records, heavy vehicle driving license numbers, and emergency contact details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {fleetList.map(b => (
                  <div key={b.driver} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{b.driver}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">Verified</span>
                    </div>
                    <div className="text-xs text-slate-500">Assigned: <b className="text-slate-800 dark:text-slate-200">{b.busNo}</b></div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">Heavy Vehicle License: <b>KA-01-2019-981244</b></div>
                    <div className="text-[10px] text-slate-400">Police Background Verification: Passed (Expires Oct 2027)</div>
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assign Transport Fleet Task</h3>
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
                  placeholder="e.g. Bus #4 Brake & Speed Governor Inspection" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Inspection Checkpoints</label>
                <textarea 
                  rows={2}
                  value={newTaskDesc} 
                  onChange={e => setNewTaskDesc(e.target.value)} 
                  placeholder="Specify RTO or mechanical requirements..." 
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
                    <option value="Mr. Vikram Malhotra (Transport Lead)">Mr. Vikram Malhotra (Transport Lead)</option>
                    <option value="Mechanic Workshop Bangalore">Mechanic Workshop Bangalore</option>
                    <option value="Route 4 Driver Team">Route 4 Driver Team</option>
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
              <button type="submit" className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white py-2.5 font-bold mt-2">
                Assign Fleet Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
