'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Users, 
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
  PhoneCall, 
  Calendar,
  MessageSquare,
  ArrowRight,
  UserCheck,
  X,
  Menu
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminTask, AdmissionEnquiry } from '@/lib/types';
import { exportToCsv, printDossierReport } from '@/lib/export-utils';

type AdmissionsTab = 'tasks' | 'crm_funnel' | 'campus_tours' | 'chatbot_leads';

export default function AdmissionsCoordinatorPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdmissionsTab>('tasks');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data State
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [taskExpandedId, setTaskExpandedId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Ms. Sneha Kulkarni');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskSlaHours, setNewTaskSlaHours] = useState(24);
  const [escalateTaskId, setEscalateTaskId] = useState<number | null>(null);
  const [escalateReason, setEscalateReason] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, enqRes] = await Promise.all([
        api.getAdminTasks('admissions'),
        api.getEnquiries()
      ]);
      setTasks(tRes);
      setEnquiries(enqRes);
    } catch (err) {
      console.error('Failed to load admissions data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    await api.updateAdminTask(taskId, { status: newStatus });
    const updated = await api.getAdminTasks('admissions');
    setTasks(updated);
    triggerToast(`Admissions task updated to ${newStatus}`);
  };

  const handleEscalate = async (taskId: number) => {
    if (!escalateReason.trim()) { triggerToast('Please enter escalation reason.'); return; }
    await api.escalateAdminTask(taskId, escalateReason);
    const updated = await api.getAdminTasks('admissions');
    setTasks(updated);
    setEscalateTaskId(null);
    setEscalateReason('');
    triggerToast('Escalated to Principal.');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await api.createAdminTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      category: 'upcoming',
      domain: 'admissions',
      due_date: 'Tomorrow, 2:00 PM',
      assigned_to: newTaskAssignee,
      assigned_to_role: 'admissions_coordinator',
      priority: newTaskPriority,
      sla_hours: newTaskSlaHours,
      status: 'Pending'
    });
    const updated = await api.getAdminTasks('admissions');
    setTasks(updated);
    setShowCreateModal(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    triggerToast('Admissions lead task delegated');
  };

  const handleStageChange = async (id: number, stage: string) => {
    await api.updateEnquiryStage(id, stage);
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    triggerToast(`Lead stage updated to ${stage.toUpperCase()}`);
  };

  const handleConvertToStudent = async (id: number) => {
    await api.convertEnquiryToStudent(id);
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    triggerToast('Student officially converted and enrolled in SIS directory!');
  };

  const handleExportCsv = () => {
    const headers = ['Enquiry ID', 'Student Name', 'Parent Name', 'Target Grade', 'Phone', 'Stage'];
    const rows = enquiries.map(e => [e.id, e.student_name, e.parent_name, e.target_grade, e.phone, e.stage]);
    exportToCsv('EDU360_Admissions_CRM_Pipeline_Report', headers, rows);
    triggerToast('Admissions CRM pipeline exported as CSV.');
  };

  const handlePrintDossier = () => {
    const headers = ['Applicant Name', 'Parent Name', 'Target Grade', 'Contact Phone', 'Admission Stage'];
    const rows = enquiries.map(e => [e.student_name, e.parent_name, e.target_grade, e.phone, (e.stage || '').toUpperCase()]);
    printDossierReport(
      'Admissions & Prospective Enrollment CRM Dossier',
      'Lead Qualification, Campus Tour Schedules, and Onboarding Status',
      'Admissions & Outreach Office',
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
          <Sparkles className="h-4 w-4 text-sky-400 dark:text-sky-600" />
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
                    AM
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">Oakridge International</h3>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Ms. Sneha Kulkarni</span>
                  </div>
                </div>
              ) : (
                <div className="mx-auto h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                  AM
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
                  Admissions CRM
                </span>
              )}
              {[
                { id: 'tasks', label: 'Admissions Tasks', icon: Layers, badge: `${tasks.filter(t => t.status !== 'Completed').length} Open`, badgeType: 'amber' },
                { id: 'crm_funnel', label: 'CRM Pipeline', icon: Users, badge: `${enquiries.length} Leads`, badgeType: 'blue' },
                { id: 'campus_tours', label: 'Campus Tours', icon: Calendar, badge: '4 Booked', badgeType: 'emerald' },
                { id: 'chatbot_leads', label: 'AI Chatbot Leads', icon: MessageSquare }
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as AdmissionsTab);
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
                    Admissions &amp; Outreach
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Prospective Student Intake &amp; Tour Management</span>
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Admissions CRM &amp; Lead Funnel Console
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Prospect qualification, campus tour scheduling, entrance assessments, document collection, and SIS student enrollment.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-sky-600" />
                <span>Export Pipeline CSV</span>
              </button>
              <button
                onClick={handlePrintDossier}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-sky-600" />
                <span>Print Dossier</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Delegate Lead Task</span>
              </button>
            </div>
          </div>

          {/* ── Top KPI Strip (Dual-Theme Harmonized) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => setActiveTab('crm_funnel')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Inquiries</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  Pipeline Active
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{enquiries.length}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Captured across web &amp; bot</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>View CRM Pipeline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('campus_tours')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tour Conversion</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  84.2% Yield
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">84.2%</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Campus visit to enrollment rate</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>View Scheduled Tours</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('chatbot_leads')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Lead Response Time</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  &lt; 2h SLA
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">18 Mins</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Average lead callback latency</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Review Inquiries</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('tasks')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Open Admissions Tasks</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Active
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {tasks.filter(t => t.status !== 'Completed').length}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Counselor calls &amp; paperwork</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>View Task Board</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* ── TAB 1: TASKS ── */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Admissions &amp; CRM Tasks</h2>
                  <p className="text-xs text-slate-500">Phone qualification calls, campus tour prep, and entrance assessment follow-ups</p>
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
                              <span className="font-semibold text-sky-600 dark:text-sky-400">SLA: {task.sla_hours || 24}h</span>
                              {task.is_escalated && (
                                <span className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded font-black text-[9px]">
                                  HIGH VALUE LEAD ESCALATION
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
                          <p>{task.description || 'No notes provided.'}</p>
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
                                    placeholder="Reason for lead escalation..." 
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

          {/* ── TAB 2: CRM FUNNEL ── */}
          {activeTab === 'crm_funnel' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Admissions CRM Pipeline</h2>
                <p className="text-xs text-slate-500">Track prospect journey from initial enquiry through campus visit to official enrollment</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {enquiries.map(enq => (
                  <div key={enq.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{enq.student_name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 uppercase">
                        {enq.stage}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">Parent: <b>{enq.parent_name}</b> · {enq.phone}</div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Grade: <b>{enq.target_grade}</b></div>
                    <div className="text-[11px] text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                      "{enq.notes || 'Interested in STEM & Robotics curriculum.'}"
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {enq.stage !== 'converted' ? (
                        <>
                          <button 
                            onClick={() => handleStageChange(enq.id, 'visit')}
                            className="flex-1 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100"
                          >
                            Schedule Visit
                          </button>
                          <button 
                            onClick={() => handleConvertToStudent(enq.id)}
                            className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                          >
                            Enroll in SIS ✓
                          </button>
                        </>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" /> Enrolled in SIS Directory
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: CAMPUS TOURS ── */}
          {activeTab === 'campus_tours' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Scheduled Prospective Family Campus Tours</h2>
                <p className="text-xs text-slate-500">Guided campus walkthroughs, lab demonstrations, and leadership meetings</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Tour Date &amp; Time</th>
                      <th className="p-3.5">Family &amp; Student</th>
                      <th className="p-3.5">Target Grade</th>
                      <th className="p-3.5">Assigned Counselor</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {[
                      { time: 'Tomorrow, 10:30 AM', family: 'Mr. & Mrs. Singhania (Aanya)', grade: 'Grade 6', counselor: 'Ms. Sneha Kulkarni', status: 'Confirmed' },
                      { time: 'Tomorrow, 02:00 PM', family: 'Dr. Ramesh Prasad (Rhea)', grade: 'Grade 9 (CBSE)', counselor: 'Counselor Priya', status: 'Confirmed' },
                      { time: '24 Oct, 11:00 AM', family: 'Mrs. Fatima Sheikh (Zaid)', grade: 'Grade 8', counselor: 'Ms. Sneha Kulkarni', status: 'Reminder Sent' },
                      { time: '25 Oct, 03:30 PM', family: 'Mr. S. Balasubramanian (Kavya)', grade: 'Grade 11 (Science)', counselor: 'Dean Radhika Sen', status: 'Confirmed' }
                    ].map(t => (
                      <tr key={t.family} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{t.time}</td>
                        <td className="p-3.5 font-bold text-sky-600 dark:text-sky-400">{t.family}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{t.grade}</td>
                        <td className="p-3.5 text-slate-500">{t.counselor}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 4: CHATBOT LEADS ── */}
          {activeTab === 'chatbot_leads' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Chatbot Lead Capture &amp; Transcripts</h2>
                <p className="text-xs text-slate-500">Prospective parent enquiries captured automatically from the school homepage</p>
              </div>

              <div className="space-y-3">
                {[
                  { parent: 'Mr. Deepak Verma', phone: '+91 98450 11223', grade: 'Grade 8', query: 'What is the fee structure for Grade 8 CBSE with bus transport to Koramangala?', time: '25m ago' },
                  { parent: 'Dr. Meenakshi Sundaram', phone: '+91 98450 33445', grade: 'Grade 11', query: 'Do you offer integrated JEE coaching alongside CBSE curriculum?', time: '1h ago' },
                  { parent: 'Mrs. Kavita Reddy', phone: '+91 98450 55667', grade: 'Grade 4', query: 'Interested in primary school campus tour this Saturday morning.', time: '2h ago' }
                ].map(chat => (
                  <div key={chat.phone} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{chat.parent} · {chat.phone}</h3>
                      <span className="text-[10px] text-slate-400 font-semibold">{chat.time}</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                      <b>Captured Query:</b> "{chat.query}"
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button 
                        onClick={() => triggerToast(`Tele-counselor dispatched for ${chat.parent}`)}
                        className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 text-xs font-bold"
                      >
                        Initiate Counselor Call
                      </button>
                    </div>
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delegate Admissions Lead Task</h3>
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
                  placeholder="e.g. Follow up on Grade 6 Campus Tour Enquiry" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Prospect Details / Notes</label>
                <textarea 
                  rows={2}
                  value={newTaskDesc} 
                  onChange={e => setNewTaskDesc(e.target.value)} 
                  placeholder="Parent phone, target class, and scholarship requirements..." 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Assign Counselor</label>
                  <select 
                    value={newTaskAssignee} 
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Ms. Sneha Kulkarni">Ms. Sneha Kulkarni</option>
                    <option value="Counselor Priya Nair">Counselor Priya Nair</option>
                    <option value="Front Desk Team">Front Desk Team</option>
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
              <button type="submit" className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white py-2.5 font-bold mt-2">
                Delegate Lead Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
