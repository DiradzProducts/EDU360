'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
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
  Calendar, 
  ShieldCheck, 
  Search, 
  Filter, 
  ArrowRight,
  TrendingUp,
  FileText,
  Building2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  CalendarRange,
  Lock,
  Menu
} from 'lucide-react';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminTask, SubstitutionSlot, AvailableFacultyItem, StaffMemberItem, CurriculumPacingItem, PTMGovernanceStatus, QuestionPaperItem, ExamScheduleItem } from '@/lib/types';
import { exportToCsv, printDossierReport } from '@/lib/export-utils';

type AcademicTab = 'tasks' | 'substitutions' | 'curriculum' | 'faculty' | 'paper_blueprints' | 'calendar_clearance';

export default function AcademicCoordinatorPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AcademicTab>('tasks');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data State
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionSlot[]>([]);
  const [faculty, setFaculty] = useState<AvailableFacultyItem[]>([]);
  const [staff, setStaff] = useState<StaffMemberItem[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumPacingItem[]>([]);
  const [ptmGovernance, setPtmGovernance] = useState<PTMGovernanceStatus | null>(null);
  
  // Filters
  const [curriculumFilter, setCurriculumFilter] = useState<'all' | 'lagging' | 'ontrack' | 'ahead'>('all');
  const [staffDeptFilter, setStaffDeptFilter] = useState<string>('all');
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');
  
  // Task Board State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [taskExpandedId, setTaskExpandedId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskLabel, setNewTaskLabel] = useState<string>('🔄 Faculty Substitution');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Mrs. Ananya Verma');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskDurationVal, setNewTaskDurationVal] = useState<number>(3);
  const [newTaskDurationUnit, setNewTaskDurationUnit] = useState<'days' | 'hours'>('days');
  const [creatingTask, setCreatingTask] = useState<boolean>(false);
  const [escalateTaskId, setEscalateTaskId] = useState<number | null>(null);
  const [escalateReason, setEscalateReason] = useState('');

  // Human-readable SLA formatter (Days, Weeks, Hours)
  const formatSlaDisplay = (hours?: number) => {
    if (!hours) return '24 Hours (1 Day)';
    if (hours % 168 === 0 && hours >= 168) {
      const weeks = hours / 168;
      return `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'} (${hours}h)`;
    }
    if (hours % 24 === 0 && hours >= 24) {
      const days = hours / 24;
      return `${days} ${days === 1 ? 'Day' : 'Days'} (${hours}h)`;
    }
    return `${hours} Hours`;
  };

  // Task Relief & SLA Extension State
  const [reliefModalTask, setReliefModalTask] = useState<AdminTask | null>(null);
  const [migrationPeer, setMigrationPeer] = useState<string>('Mrs. Neha Roy');
  const [migrationExtensionHours, setMigrationExtensionHours] = useState<number>(24);
  const [migrationNote, setMigrationNote] = useState<string>('Approved peer faculty workload rebalance');
  const [extensionModalTask, setExtensionModalTask] = useState<AdminTask | null>(null);
  const [slaExtensionHours, setSlaExtensionHours] = useState<number>(24);
  const [slaExtensionReason, setSlaExtensionReason] = useState<string>('Granted curriculum preparation extension');
  const [remindingTeachers, setRemindingTeachers] = useState(false);

  // PTM Declaration Modal State
  const [showDeclarePtmModal, setShowDeclarePtmModal] = useState(false);
  const [newPtmTitle, setNewPtmTitle] = useState('Term-1 Post Mid-Term Parent-Teacher Meeting');
  const [newPtmTerm, setNewPtmTerm] = useState('Term 1');
  const [newPtmStartDate, setNewPtmStartDate] = useState('2026-10-24');
  const [newPtmEndDate, setNewPtmEndDate] = useState('2026-10-25');
  const [newPtmStartTime, setNewPtmStartTime] = useState('09:00 AM');
  const [newPtmEndTime, setNewPtmEndTime] = useState('01:00 PM');
  const [newPtmDuration, setNewPtmDuration] = useState(10);
  const [newPtmTargetClasses, setNewPtmTargetClasses] = useState<string[]>(['Class 8-A', 'Class 8-B', 'Class 9-A', 'Class 9-B']);
  const [declaringPtm, setDeclaringPtm] = useState(false);

  const availableClasses = ['Class 8-A', 'Class 8-B', 'Class 9-A', 'Class 9-B', 'Class 10-A', 'Class 10-B', 'Class 11-A', 'Class 12-A'];

  // Substitution Modal State
  const [selectedSubSlot, setSelectedSubSlot] = useState<SubstitutionSlot | null>(null);
  const [chosenFacultyId, setChosenFacultyId] = useState<number | null>(null);

  // Question Paper & Blueprint State
  const [questionPapers, setQuestionPapers] = useState<QuestionPaperItem[]>([]);
  const [examSchedules, setExamSchedules] = useState<ExamScheduleItem[]>([]);
  const [showOrderQpModal, setShowOrderQpModal] = useState(false);
  const [orderQpTitle, setOrderQpTitle] = useState('Term 1 Mathematics Comprehensive Final');
  const [orderQpSubject, setOrderQpSubject] = useState('Mathematics');
  const [orderQpClass, setOrderQpClass] = useState('Class 8');
  const [orderQpTerm, setOrderQpTerm] = useState('Term 1');
  const [orderQpUnits, setOrderQpUnits] = useState('Linear Equations, Quadratic Factoring, Mensuration');
  const [orderQpDueDate, setOrderQpDueDate] = useState('2026-10-25');
  const [orderQpTeacherName, setOrderQpTeacherName] = useState('Mrs. Ananya Verma');
  const [orderQpTeacherId, setOrderQpTeacherId] = useState(2);
  const [orderQpMarks, setOrderQpMarks] = useState(100);
  const [selectedReviewQp, setSelectedReviewQp] = useState<QuestionPaperItem | null>(null);
  const [qpReviewNotes, setQpReviewNotes] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, subRes, facRes, staffRes, curRes, ptmGovRes, qpRes, schedRes] = await Promise.all([
        api.getAdminTasks('academic'),
        api.getSubstitutions(),
        api.getAvailableFaculty(),
        api.getStaff(),
        api.getCurriculumPacing(),
        api.getPTMGovernance(),
        api.getQuestionPapers(),
        api.getExamSchedules()
      ]);
      setTasks(tRes);
      setSubstitutions(subRes);
      setFaculty(facRes);
      setStaff(staffRes);
      setCurriculum(curRes);
      setPtmGovernance(ptmGovRes);
      setQuestionPapers(qpRes);
      setExamSchedules(schedRes);
    } catch (err) {
      console.error('Failed to load academic data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderQpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQpTitle.trim()) return;
    try {
      await api.orderQuestionPaper({
        title: orderQpTitle.trim(),
        subject: orderQpSubject,
        class_name: orderQpClass,
        section: 'All',
        term: orderQpTerm,
        due_date: orderQpDueDate,
        units_covered: orderQpUnits.split(',').map(u => u.trim()),
        total_marks: Number(orderQpMarks) || 100,
        knowledge_pct: 35,
        application_pct: 45,
        hots_pct: 20,
        assigned_teacher_id: orderQpTeacherId,
        assigned_teacher_name: orderQpTeacherName
      });
      triggerToast(`Commissioned question paper blueprint to ${orderQpTeacherName}`);
      setShowOrderQpModal(false);
      const papers = await api.getQuestionPapers();
      setQuestionPapers(papers);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to order question paper');
    }
  };

  const handleReviewQp = async (paperId: number, approved: boolean) => {
    try {
      await api.reviewQuestionPaper(paperId, {
        approved,
        revision_notes: qpReviewNotes.trim() || undefined,
        reviewer_id: 6
      });
      triggerToast(approved ? 'Question paper approved!' : 'Revision requested from teacher.');
      setSelectedReviewQp(null);
      setQpReviewNotes('');
      const papers = await api.getQuestionPapers();
      setQuestionPapers(papers);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to review question paper');
    }
  };

  const handleHandoffToExamCell = async (paperId: number) => {
    try {
      await api.handoffQuestionPaper(paperId);
      triggerToast('Paper successfully handed over to Exam Coordinator Secrecy Vault ✓');
      const papers = await api.getQuestionPapers();
      setQuestionPapers(papers);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to handoff question paper');
    }
  };

  const handleClearanceToggle = async (scheduleId: number, approve: boolean) => {
    try {
      await api.grantScheduleClearance(scheduleId, {
        academic_clearance: approve,
        academic_clearance_notes: approve ? 'Cleared: No instructional syllabus pacing clash.' : 'Flagged: Unit test syllabus incomplete.'
      });
      triggerToast(approve ? 'Granted academic calendar clearance ✓' : 'Flagged exam schedule conflict');
      const scheds = await api.getExamSchedules();
      setExamSchedules(scheds);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update schedule clearance');
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    await api.updateAdminTask(taskId, { status: newStatus });
    const updated = await api.getAdminTasks('academic');
    setTasks(updated);
    triggerToast(`Task moved to ${newStatus}`);
  };

  const handleEscalate = async (taskId: number) => {
    if (!escalateReason.trim()) { triggerToast('Please enter an escalation rationale.'); return; }
    await api.escalateAdminTask(taskId, escalateReason);
    const updated = await api.getAdminTasks('academic');
    setTasks(updated);
    setEscalateTaskId(null);
    setEscalateReason('');
    triggerToast('Escalated to Principal & Super Admin');
  };

  const handleApproveRelief = async (task: AdminTask) => {
    try {
      const updatedTask = await api.approveTaskRelief(task.id, {
        new_assigned_to: migrationPeer,
        new_sla_hours: (task.sla_hours || 24) + migrationExtensionHours,
        notes: migrationNote
      });
      triggerToast(`Task migrated to ${updatedTask.assigned_to}. SLA set to ${updatedTask.sla_hours || 48}h`);
      setReliefModalTask(null);
      const updated = await api.getAdminTasks('academic');
      setTasks(updated);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to approve relief');
    }
  };

  const handleExtendSla = async (task: AdminTask) => {
    try {
      const updatedTask = await api.extendTaskSla(task.id, {
        additional_hours: slaExtensionHours,
        extension_reason: slaExtensionReason
      });
      triggerToast(`SLA extended by +${slaExtensionHours}h. Total SLA: ${updatedTask.sla_hours || 48}h`);
      setExtensionModalTask(null);
      const updated = await api.getAdminTasks('academic');
      setTasks(updated);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to extend SLA');
    }
  };

  const handleRemindPTMTeachers = async () => {
    setRemindingTeachers(true);
    try {
      const res = await api.remindUnreadyPTMTeachers();
      triggerToast(`📢 ${res.message || 'Teachers alerted with emergency PTM scheduling notifications.'}`);
      const updatedPtm = await api.getPTMGovernance();
      setPtmGovernance(updatedPtm);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to send PTM reminders');
    } finally {
      setRemindingTeachers(false);
    }
  };

  const handleDeclarePTMEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPtmTitle.trim()) {
      triggerToast('Please provide a PTM event title.');
      return;
    }
    if (newPtmTargetClasses.length === 0) {
      triggerToast('Please select at least one target class.');
      return;
    }
    setDeclaringPtm(true);
    try {
      const res = await api.declarePTMEvent({
        title: newPtmTitle.trim(),
        academic_term: newPtmTerm.trim(),
        start_date: newPtmStartDate,
        end_date: newPtmEndDate,
        start_time: newPtmStartTime,
        end_time: newPtmEndTime,
        slot_duration_mins: newPtmDuration,
        target_classes: newPtmTargetClasses
      });
      triggerToast(res.message || `PTM event successfully declared for ${newPtmTargetClasses.length} classes!`);
      setShowDeclarePtmModal(false);
      const [updatedGov, updatedTasks] = await Promise.all([
        api.getPTMGovernance(),
        api.getAdminTasks('academic')
      ]);
      setPtmGovernance(updatedGov);
      setTasks(updatedTasks);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to declare PTM event');
    } finally {
      setDeclaringPtm(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      triggerToast('Please provide a task title.');
      return;
    }
    setCreatingTask(true);
    try {
      const totalHours = newTaskDurationUnit === 'days' 
        ? Math.max(1, newTaskDurationVal) * 24 
        : Math.max(1, newTaskDurationVal);

      const targetDate = new Date();
      targetDate.setHours(targetDate.getHours() + totalHours);
      const dueDateStr = targetDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }) + ', 05:00 PM';

      const created = await api.createAdminTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || undefined,
        category: totalHours <= 24 ? 'urgent' : 'upcoming',
        domain: 'academic',
        task_label: newTaskLabel,
        labels: [newTaskLabel],
        due_date: dueDateStr,
        assigned_to: newTaskAssignee,
        assigned_to_role: 'teacher',
        created_by_name: 'Prof. Rajeshwari Nair',
        created_by_role: 'academic_coordinator',
        priority: newTaskPriority,
        sla_hours: totalHours,
        status: 'Pending'
      });

      // Immediately prepend to local state so the user sees it instantly
      setTasks(prev => [created, ...prev.filter(t => t.id !== created.id)]);
      setShowCreateModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDurationVal(3);
      setNewTaskDurationUnit('days');
      triggerToast(`Delegated "${created.title}" to ${newTaskAssignee} with ${formatSlaDisplay(totalHours)} SLA`);

      // Sync fresh copy from server in background
      const updated = await api.getAdminTasks('academic');
      if (updated && updated.length > 0) {
        setTasks(updated);
      }
    } catch (err: any) {
      triggerToast(err.message || 'Failed to create academic task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleAssignSub = async () => {
    if (!selectedSubSlot || !chosenFacultyId) return;
    const fac = faculty.find(f => f.id === chosenFacultyId);
    if (!fac) return;
    await api.assignSubstitution(selectedSubSlot.id, chosenFacultyId, fac.name, 'Cover period assigned by Academic Coordinator');
    const updated = await api.getSubstitutions();
    setSubstitutions(updated);
    const updatedTasks = await api.getAdminTasks('academic');
    setTasks(updatedTasks);
    setSelectedSubSlot(null);
    setChosenFacultyId(null);
    triggerToast(`Period substitution confirmed: ${fac.name} assigned to ${selectedSubSlot.class_name}`);
  };

  const handleLogLesson = async (itemId: number) => {
    const res = await api.logCurriculumLesson(itemId, 1);
    if (res.success) {
      setCurriculum(prev => prev.map(c => c.id === itemId ? res.item : c));
      triggerToast(`Logged unit completion for ${res.item.class_name} ${res.item.subject}`);
    }
  };

  const handleIntervenePacing = async (itemId: number) => {
    const res = await api.interveneCurriculumPacing(itemId);
    if (res.success) {
      const updatedTasks = await api.getAdminTasks('academic');
      setTasks(updatedTasks);
      triggerToast(res.message);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Task ID', 'Title', 'Assigned To', 'Priority', 'Status', 'SLA Hours', 'Escalated'];
    const rows = tasks.map(t => [t.id, t.title, t.assigned_to, t.priority, t.status, t.sla_hours || 24, t.is_escalated ? 'YES' : 'NO']);
    exportToCsv('EDU360_Academic_Operations_Report', headers, rows);
    triggerToast('Academic operations ledger exported to CSV successfully.');
  };

  const handlePrintDossier = () => {
    const headers = ['Task Title', 'Assigned Faculty', 'Priority', 'Current Status', 'SLA Limit'];
    const rows = tasks.map(t => [t.title, t.assigned_to, t.priority, t.status, `${t.sla_hours || 24} Hours`]);
    printDossierReport(
      'Academic Coordination & Timetable Integrity Dossier',
      'Curriculum Pacing, Teacher Substitutions, and Statutory Syllabus Audit',
      'Academic Coordination Office',
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
          <Sparkles className="h-4 w-4 text-indigo-400 dark:text-indigo-600" />
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
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Prof. Rajeshwari Nair</span>
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
                  Academic Governance
                </span>
              )}
              {[
                { id: 'tasks', label: 'Tasks & SLAs', icon: Layers, badge: `${tasks.filter(t => t.status !== 'Completed').length} Open`, badgeType: 'amber' },
                { id: 'paper_blueprints', label: 'Paper Blueprints', icon: FileText, badge: `${questionPapers.filter(p => p.status === 'under_review').length ? `${questionPapers.filter(p => p.status === 'under_review').length} Review` : ''}`, badgeType: 'amber' },
                { id: 'calendar_clearance', label: 'Exam Clearance', icon: CalendarRange, badge: `${examSchedules.filter(s => !s.academic_clearance).length ? `${examSchedules.filter(s => !s.academic_clearance).length} Pending` : ''}`, badgeType: 'amber' },
                { id: 'substitutions', label: 'Substitutions', icon: Users, badge: `${substitutions.filter(s => s.status === 'Unassigned').length} Pending`, badgeType: 'amber' },
                { id: 'curriculum', label: 'Curriculum Pacing', icon: TrendingUp },
                { id: 'faculty', label: 'Faculty Roster', icon: ShieldCheck, badge: `${staff.length} Staff`, badgeType: 'blue' }
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as AcademicTab);
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
          {/* Top Bar Header */}
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
                    Institutional Domain Portal
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Class 6–12 Academic Office</span>
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Academic Coordination &amp; Dean Console
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Timetable integrity, daily period coverage substitutions, lesson plan pacing, and syllabus audits.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                title="Download CSV Dossier"
              >
                <Download className="h-3.5 w-3.5 text-indigo-600" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handlePrintDossier}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                title="Print Official Report"
              >
                <Printer className="h-3.5 w-3.5 text-indigo-600" />
                <span>Print Dossier</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Assign Academic Task</span>
              </button>
            </div>
          </div>

          {/* ── Top KPI Strip (Dual-Theme Harmonized) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => setActiveTab('substitutions')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Unmanned Classrooms</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  100% Covered
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">0</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">All periods staffed today</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>View Timetables</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('substitutions')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Pending Substitutions</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  substitutions.filter(s => s.status === 'Unassigned').length > 0
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  {substitutions.filter(s => s.status === 'Unassigned').length > 0 ? 'Urgent Cover' : 'Clear'}
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {substitutions.filter(s => s.status === 'Unassigned').length}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Immediate proxy cover needed</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Manage Substitutions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('curriculum')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Curriculum Pacing</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  94.2% Track
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">94.2%</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Grades 6–12 syllabus adherence</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Audit Pacing</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('tasks')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Open Academic Tasks</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  SLA Active
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {tasks.filter(t => t.status !== 'Completed').length}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Active delegations &amp; workflows</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>View Task Board</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* ── TAB 1: ACADEMIC TASKS & SLAS ── */}
          {activeTab === 'tasks' && (
            <div className="space-y-5">
              {/* PTM Event Governance Card */}
              {ptmGovernance && (
                <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/20 p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/40 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <CalendarRange className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-black text-slate-900 dark:text-white">{ptmGovernance.active_event_title}</h2>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            ptmGovernance.readiness_percentage >= 90
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {ptmGovernance.readiness_percentage >= 90 ? 'Ready' : 'Pending Slots'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {ptmGovernance.event_date} ({ptmGovernance.time_window}) • Parents self-booking via verified time slots
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setShowDeclarePtmModal(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Schedule / Declare PTM Event</span>
                      </button>

                      <button
                        onClick={handleRemindPTMTeachers}
                        disabled={remindingTeachers}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${remindingTeachers ? 'animate-spin' : ''}`} />
                        <span>📢 Remind Defaulting Teachers ({ptmGovernance.unready_teachers.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Readiness Progress Bar & Metrics */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/30">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Faculty Readiness</div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{ptmGovernance.readiness_percentage}%</span>
                        <span className="text-[11px] text-slate-500 font-semibold">{ptmGovernance.published_teachers_count}/{ptmGovernance.total_teachers} faculty</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${ptmGovernance.readiness_percentage}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/30">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available Slots</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{ptmGovernance.published_teachers_count * 12}</div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Published across departments</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/30">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Focus Table Co-Sign</div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{ptmGovernance.focus_students_requiring_brief}</div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Remedial students to brief</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/30">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Defaulting Faculty</div>
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{ptmGovernance.unready_teachers.length}</div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">No slots published yet</div>
                    </div>
                  </div>

                  {ptmGovernance.unready_teachers.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-indigo-100/70 dark:border-indigo-900/30 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Unpublished Slots:
                      </span>
                      {ptmGovernance.unready_teachers.map(teacher => (
                        <span key={teacher} className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 font-bold text-[10px]">
                          {teacher}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Task Relief Requests Queue */}
              {tasks.some(t => t.relief_requested && t.status !== 'Completed') && (
                <div className="rounded-3xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                      <div>
                        <h3 className="text-sm font-black text-amber-900 dark:text-amber-200">
                          Pending Faculty Task Relief &amp; Migration Requests
                        </h3>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Teachers experiencing medical emergency or workload surges have requested task migration. Zero penalty applies.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-black">
                      {tasks.filter(t => t.relief_requested && t.status !== 'Completed').length} Pending Review
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {tasks.filter(t => t.relief_requested && t.status !== 'Completed').map(rt => (
                      <div key={rt.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                              {rt.relief_reason || 'Academic Surge'}
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rt.title}</h4>
                            <div className="text-[11px] text-slate-500">
                              Current Assignee: <strong className="text-slate-800 dark:text-slate-200">{rt.assigned_to}</strong>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            SLA Paused
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 italic border border-slate-200 dark:border-slate-700">
                          &ldquo;{rt.relief_justification || 'Faculty requested workload migration'}&rdquo;
                        </div>

                        {rt.suggested_peer_teacher && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400">
                            Suggested Peer: <strong className="text-indigo-600 dark:text-indigo-400">{rt.suggested_peer_teacher}</strong>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => {
                              setReliefModalTask(rt);
                              if (rt.suggested_peer_teacher) setMigrationPeer(rt.suggested_peer_teacher);
                            }}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            Approve Migration
                          </button>
                          <button
                            onClick={() => setExtensionModalTask(rt)}
                            className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50"
                          >
                            Grant Extension
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks List Header & Filter */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Academic Tasks &amp; Faculty Delegation</h2>
                  <p className="text-xs text-slate-500">Domain-scoped delegation with human-in-the-loop SLA governance</p>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 py-1.5 font-bold"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredTasks.map(task => {
                  const isExpanded = taskExpandedId === task.id;
                  return (
                    <div 
                      key={task.id} 
                      className={`rounded-2xl border bg-white dark:bg-slate-900 p-4 shadow-xs transition-all hover:border-indigo-300 dark:hover:border-indigo-700 ${
                        task.relief_requested 
                          ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20' 
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                            task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                            task.status === 'Pending Review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {task.status}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xs font-bold text-slate-900 dark:text-white">{task.title}</h3>
                              {(() => {
                                const label = task.task_label || (
                                  task.title.toLowerCase().includes('substitut') ? '🔄 Faculty Substitution' :
                                  task.title.toLowerCase().includes('blueprint') || task.title.toLowerCase().includes('paper') ? '📐 QP Blueprint Draft' :
                                  task.title.toLowerCase().includes('syllabus') || task.title.toLowerCase().includes('pacing') ? '📚 Syllabus Pacing Catch-up' :
                                  '📚 Academic Duty'
                                );
                                const color = 
                                  label.includes('Substitution') ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' :
                                  label.includes('Blueprint') ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800' :
                                  label.includes('Syllabus') ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' :
                                  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
                                return (
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${color}`}>
                                    {label}
                                  </span>
                                );
                              })()}
                              {task.relief_requested && (
                                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">
                                  Relief Requested
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 mt-1">
                              <span>Assignee: <b className="text-slate-800 dark:text-slate-200">{task.assigned_to}</b></span>
                              <span>•</span>
                              <span>Due: {task.due_date}</span>
                              <span>•</span>
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">SLA: {formatSlaDisplay(task.sla_hours)}</span>
                              {task.is_escalated && (
                                <span className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded font-black text-[9px]">
                                  ESCALATED TO PRINCIPAL
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {task.relief_requested && task.status !== 'Completed' && (
                            <button
                              onClick={() => {
                                setReliefModalTask(task);
                                if (task.suggested_peer_teacher) setMigrationPeer(task.suggested_peer_teacher);
                              }}
                              className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 text-[11px] font-bold cursor-pointer shadow-xs"
                            >
                              Review Relief
                            </button>
                          )}
                          {task.status === 'Pending Review' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'Completed')}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold cursor-pointer shadow-xs"
                            >
                              Approve &amp; Close ✓
                            </button>
                          )}
                          <button
                            onClick={() => setTaskExpandedId(isExpanded ? null : task.id)}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-bold px-3 py-1 cursor-pointer transition-all"
                          >
                            {isExpanded ? 'Hide' : 'Details'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                          <p>{task.description || 'No additional notes provided for this task.'}</p>
                          {task.relief_requested && (
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60 space-y-1">
                              <div className="font-bold">Faculty Relief Request ({task.relief_reason}):</div>
                              <div className="italic">&ldquo;{task.relief_justification}&rdquo;</div>
                              {task.suggested_peer_teacher && (
                                <div className="text-[11px] text-amber-700 dark:text-amber-300">
                                  Suggested Replacement: <strong>{task.suggested_peer_teacher}</strong>
                                </div>
                              )}
                            </div>
                          )}
                          {task.escalation_reason && (
                            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200">
                              <b>Escalation Reason:</b> {task.escalation_reason}
                            </div>
                          )}
                          {task.status !== 'Completed' && (
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => setExtensionModalTask(task)}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100"
                              >
                                + Extend SLA Hours
                              </button>
                              <button
                                onClick={() => {
                                  setReliefModalTask(task);
                                  if (task.suggested_peer_teacher) setMigrationPeer(task.suggested_peer_teacher);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100"
                              >
                                Migrate to Peer Faculty
                              </button>
                              {!task.is_escalated && (
                                <div className="inline-block">
                                  {escalateTaskId === task.id ? (
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="text" 
                                        value={escalateReason} 
                                        onChange={e => setEscalateReason(e.target.value)} 
                                        placeholder="Reason for escalating to Principal..." 
                                        className="rounded-lg border border-rose-300 p-1.5 text-xs text-slate-900 bg-white"
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 2: PERIOD SUBSTITUTIONS ── */}
          {activeTab === 'substitutions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daily Period Coverage &amp; Substitutions</h2>
                  <p className="text-xs text-slate-500">Auto-interlocked with Admin leave approvals to ensure zero unmanned classrooms</p>
                </div>
              </div>

              {/* Status Alert Banner */}
              {substitutions.filter(s => s.status === 'Unassigned').length > 0 && (
                <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      {substitutions.filter(s => s.status === 'Unassigned').length} period(s) require proxy teacher assignment due to approved faculty leaves.
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                    Urgent SLA: &lt; 2 Hrs
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {substitutions.map(sub => (
                  <div key={sub.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">Period {sub.period_number} · {sub.time_slot}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'Assigned' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sub.class_name} · {sub.subject}</h3>
                      <div className="text-xs text-slate-500 mt-1">
                        Absent Faculty: <b className="text-rose-600 dark:text-rose-400">{sub.absent_teacher_name}</b> ({sub.absent_reason || sub.reason || 'Leave Approved'})
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Substitute: <b className="text-slate-900 dark:text-white">{sub.substitute_teacher_name || sub.assigned_substitute_name || 'Unassigned — Action Required'}</b>
                      </div>
                    </div>
                    {sub.status === 'Unassigned' && (
                      <button
                        onClick={() => setSelectedSubSlot(sub)}
                        className="w-full mt-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-xs font-bold transition-all shadow-xs"
                      >
                        Assign Substitute Teacher
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: CURRICULUM PACING ── */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Curriculum &amp; Syllabus Pacing Tracker</h2>
                  <p className="text-xs text-slate-500">Live term syllabus completion vs CBSE &amp; IB calendar benchmarks</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(['all', 'lagging', 'ontrack', 'ahead'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setCurriculumFilter(f)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-all ${
                        curriculumFilter === f 
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {f === 'lagging' ? '⚠️ Lagging' : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pacing Overview Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Courses</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{curriculum.length}</div>
                </div>
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">On Track / Ahead</div>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">
                    {curriculum.filter(c => !c.status.toLowerCase().includes('lag')).length}
                  </div>
                </div>
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lagging (Intervention Needed)</div>
                  <div className="text-lg font-black text-rose-600 mt-0.5">
                    {curriculum.filter(c => c.status.toLowerCase().includes('lag')).length}
                  </div>
                </div>
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calendar Benchmark</div>
                  <div className="text-lg font-black text-indigo-600 mt-0.5">Week 8 · Term 2</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {curriculum
                  .filter(item => {
                    if (curriculumFilter === 'lagging') return item.status.toLowerCase().includes('lag');
                    if (curriculumFilter === 'ontrack') return item.status.toLowerCase().includes('track');
                    if (curriculumFilter === 'ahead') return item.status.toLowerCase().includes('ahead');
                    return true;
                  })
                  .map(item => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-900 dark:text-white">{item.class_name} · {item.subject}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status.toLowerCase().includes('lag')
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : item.status.toLowerCase().includes('ahead')
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Faculty: <b className="text-slate-700 dark:text-slate-300">{item.teacher_name}</b></div>
                        
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.status.toLowerCase().includes('lag') ? 'bg-rose-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${Math.min(100, item.completion_pct)}%` }} 
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-2 font-semibold">
                          <span>{item.completed_units}/{item.total_units} Units ({item.completion_pct}%)</span>
                          <span>Calendar Target: {item.calendar_target_units} Units</span>
                        </div>

                        <div className="mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                          <div className="truncate"><span className="text-slate-400 font-bold">Last Lesson:</span> {item.last_lesson_title}</div>
                          <div className="truncate"><span className="text-slate-400 font-bold">Checkpoint:</span> {item.next_milestone_date}</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Faculty direct checkoff
                        </span>
                        {item.status.toLowerCase().includes('lag') && (
                          <button
                            onClick={() => handleIntervenePacing(item.id)}
                            className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
                            title="Create catchup session task with 48h SLA"
                          >
                            Remedial Task (48h SLA)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── TAB 4: FACULTY ROSTER ── */}
          {activeTab === 'faculty' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Institutional Faculty Roster &amp; Workload</h2>
                  <p className="text-xs text-slate-500">Teacher qualification codes, departments, weekly workload, and daily status</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search faculty name..."
                      value={staffSearchQuery}
                      onChange={e => setStaffSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-indigo-500 w-44"
                    />
                  </div>
                  <select
                    value={staffDeptFilter}
                    onChange={e => setStaffDeptFilter(e.target.value)}
                    className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    <option value="all">All Departments</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Sciences</option>
                    <option value="English">English</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Computer">Computer Science</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Faculty Name &amp; Contact</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Qualification</th>
                      <th className="p-3.5">Designation</th>
                      <th className="p-3.5">Weekly Workload</th>
                      <th className="p-3.5">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {staff
                      .filter(member => {
                        const matchDept = staffDeptFilter === 'all' || member.department.toLowerCase().includes(staffDeptFilter.toLowerCase());
                        const matchSearch = !staffSearchQuery || member.name.toLowerCase().includes(staffSearchQuery.toLowerCase());
                        return matchDept && matchSearch;
                      })
                      .map(member => (
                        <tr key={member.id} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{member.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{member.email}</div>
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">{member.department}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-[10px] font-extrabold border border-purple-200 dark:border-purple-800">
                              {member.qualification || 'M.Sc., B.Ed'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500">{member.role}</td>
                          <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">22 Period Hours</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              member.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : member.status === 'On Leave'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 5: QUESTION PAPER BLUEPRINTS & HANDOFF ── */}
          {activeTab === 'paper_blueprints' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                      Curriculum Compliance Gate
                    </span>
                    <span className="text-xs text-slate-500">Academic &rarr; Teacher &rarr; Exam Cell Workflow</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    Question Paper Blueprints &amp; Secrecy Handoff Board
                  </h2>
                  <p className="text-xs text-slate-500">
                    Commission Bloom&apos;s-calibrated papers from faculty, inspect drafts against syllabus units, and hand off to Exam Coordinator for confidential printing.
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderQpModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Commission New Paper</span>
                </button>
              </div>

              {/* Status metric tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Commissioned Papers</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{questionPapers.length} Papers</div>
                  <span className="text-[10px] text-slate-500">All high-school grades</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Academic Review</span>
                  <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-0.5">
                    {questionPapers.filter(p => p.status === 'under_review').length} Drafts
                  </div>
                  <span className="text-[10px] text-amber-600">Requires coordinator sign-off</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">In Exam Secrecy Vault</span>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {questionPapers.filter(p => p.status === 'sent_to_exam_cell').length} Sealed
                  </div>
                  <span className="text-[10px] text-emerald-600">Handed over for printing</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 shadow-2xs">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Faculty Drafting</span>
                  <div className="text-xl font-black text-purple-700 dark:text-purple-300 mt-0.5">
                    {questionPapers.filter(p => p.status === 'draft').length} In Progress
                  </div>
                  <span className="text-[10px] text-purple-600">SLA monitored</span>
                </div>
              </div>

              {/* Question Papers Cards */}
              <div className="space-y-3.5">
                {questionPapers.map(paper => {
                  const bp = paper.blueprint || {};
                  const bloom = bp.bloom_taxonomy || { knowledge_pct: 35, application_pct: 45, hots_pct: 20 };
                  return (
                    <div key={paper.id} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                              {paper.class_name} &bull; {paper.subject}
                            </span>
                            <span className="text-xs text-slate-400">&bull;</span>
                            <span className="text-xs font-semibold text-slate-500">{paper.term}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              paper.status === 'sent_to_exam_cell' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300' :
                              paper.status === 'approved' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300' :
                              paper.status === 'under_review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 animate-pulse' :
                              paper.status === 'revision_requested' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300' :
                              'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                            }`}>
                              {paper.status === 'sent_to_exam_cell' ? 'Secrecy Vault Sealed 🔒' :
                               paper.status === 'approved' ? 'Academic Approved ✓' :
                               paper.status === 'under_review' ? 'Draft Ready for Review ⏳' :
                               paper.status === 'revision_requested' ? 'Revision Requested ⚠️' : 'Faculty Drafting'}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">{paper.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>Author: <strong className="text-slate-800 dark:text-slate-200">{paper.created_by_teacher_name || 'Faculty Lead'}</strong></span>
                            <span>&bull;</span>
                            <span>Target Marks: <strong className="text-slate-800 dark:text-slate-200">{bp.total_marks || 100}m</strong></span>
                            <span>&bull;</span>
                            <span>Due Date: <strong className="text-slate-800 dark:text-slate-200">{paper.due_date || 'Within 4 Days'}</strong></span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {paper.status === 'under_review' && (
                            <button
                              onClick={() => setSelectedReviewQp(paper)}
                              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              <span>Review Draft</span>
                            </button>
                          )}
                          {paper.status === 'approved' && (
                            <button
                              onClick={() => handleHandoffToExamCell(paper.id)}
                              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <Lock className="h-4 w-4" />
                              <span>Handoff to Exam Vault &rarr;</span>
                            </button>
                          )}
                          {paper.status === 'sent_to_exam_cell' && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>In Exam Cell Secrecy</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Blueprint specifications pill matrix */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                          <span className="text-slate-600 dark:text-slate-300">Bloom&apos;s Taxonomy Balancing:</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
                              Knowledge: {bloom.knowledge_pct}%
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold">
                              Application: {bloom.application_pct}%
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                              HOTS: {bloom.hots_pct}%
                            </span>
                          </div>
                        </div>

                        {bp.units && bp.units.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-slate-500">Syllabus Units:</span>
                            {bp.units.map((u: string) => (
                              <span key={u} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                                {u}
                              </span>
                            ))}
                          </div>
                        )}

                        {paper.draft_file_url && (
                          <div className="flex items-center gap-3 pt-1 text-xs border-t border-slate-200/60 dark:border-slate-700/60 mt-2">
                            <span className="font-bold text-slate-500">Faculty Uploaded Files:</span>
                            <a
                              href={paper.draft_file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>{paper.draft_file_name || 'Question_Paper_Draft.pdf'}</span>
                            </a>
                            {paper.answer_key_url && (
                              <a
                                href={paper.answer_key_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Official Answer Scheme.pdf</span>
                              </a>
                            )}
                          </div>
                        )}

                        {paper.revision_notes && (
                          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 text-xs border border-rose-200 dark:border-rose-800">
                            <strong>Coordinator Revision Feedback:</strong> {paper.revision_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 6: EXAM CALENDAR CLEARANCE GATE ── */}
          {activeTab === 'calendar_clearance' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 px-2.5 py-0.5 text-xs font-bold border border-purple-200 dark:border-purple-800">
                      Term Pacing Clearance
                    </span>
                    <span className="text-xs text-slate-500">Exam Coordinator &rarr; Academic Office</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    CBSE &amp; Internal Examination Calendar Clearance Gate
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verify that scheduled exam dates do not clash with required instructional days, syllabus pacing deadlines, or teacher leave.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Proposed Date &amp; Time</th>
                      <th className="p-3.5">Grade &amp; Subject</th>
                      <th className="p-3.5">Allocated Hall</th>
                      <th className="p-3.5">Chief Invigilator</th>
                      <th className="p-3.5">Syllabus Clearance</th>
                      <th className="p-3.5 text-right">Academic Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {examSchedules.map(sched => (
                      <tr key={sched.id} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          <div>{sched.exam_date}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{sched.start_time} - {sched.end_time}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{sched.subject}</div>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{sched.class_name}</span>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {sched.hall_name}
                          <div className="text-[10px] text-slate-400 font-mono">Cap: {sched.capacity} seats</div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">{sched.chief_invigilator_name}</td>
                        <td className="p-3.5">
                          {sched.academic_clearance ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Cleared ✓</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              <Clock className="h-3 w-3" />
                              <span>Under Review ⏳</span>
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400 mt-0.5 max-w-xs truncate">{sched.academic_clearance_notes}</div>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {!sched.academic_clearance ? (
                              <button
                                onClick={() => handleClearanceToggle(sched.id, true)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs cursor-pointer"
                              >
                                Approve Clearance
                              </button>
                            ) : (
                              <button
                                onClick={() => handleClearanceToggle(sched.id, false)}
                                className="px-2.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-[11px] font-bold cursor-pointer"
                              >
                                Flag Revision
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>


      {/* ── CREATE TASK MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assign Academic Task</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              {/* Linear-Style Assignable Task Type Chip Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Select Task Type Label:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🔄 Faculty Substitution', color: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' },
                    { label: '📐 QP Blueprint Draft', color: 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800' },
                    { label: '📚 Syllabus Pacing Catch-up', color: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' }
                  ].map(chip => (
                    <button
                      type="button"
                      key={chip.label}
                      onClick={() => {
                        setNewTaskLabel(chip.label);
                        if (!newTaskTitle || newTaskTitle.startsWith('Grade') || newTaskTitle.startsWith('Cover') || newTaskTitle.startsWith('Submit') || newTaskTitle.startsWith('Syllabus')) {
                          if (chip.label.includes('Substitution')) setNewTaskTitle('Cover Period 3 (Class 9-A) - Faculty Leave');
                          if (chip.label.includes('Blueprint')) setNewTaskTitle('Submit Class 8-B Term 1 Math Paper Blueprint');
                          if (chip.label.includes('Pacing')) setNewTaskTitle('Syllabus Catch-up: Linear Equations Unit Review');
                        }
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newTaskLabel === chip.label
                          ? `${chip.color} shadow-xs ring-2 ring-indigo-500 font-extrabold scale-[1.02]`
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Task Title</label>
                <input 
                  type="text" 
                  required
                  value={newTaskTitle} 
                  onChange={e => setNewTaskTitle(e.target.value)} 
                  placeholder="e.g. Grade 8-B Math Remedial Plan Verification" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Instructions / Rubric Checkpoint</label>
                <textarea 
                  rows={2}
                  value={newTaskDesc} 
                  onChange={e => setNewTaskDesc(e.target.value)} 
                  placeholder="Detail curriculum notes or compliance checkpoints..." 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Assign To Faculty</label>
                  <select 
                    value={newTaskAssignee} 
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mrs. Ananya Verma">Mrs. Ananya Verma (Math)</option>
                    <option value="Dr. Suresh Babu">Dr. Suresh Babu (Science)</option>
                    <option value="Mrs. Neha Roy">Mrs. Neha Roy (English)</option>
                    <option value="Mr. Arvind Saxena">Mr. Arvind Saxena (Social)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Task Priority</label>
                  <select 
                    value={newTaskPriority} 
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical (Immediate)</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Target SLA &amp; Timeline (Days / Hours)
                </label>
                
                {/* Quick Presets for Common Academic Tasks */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    { label: '1 Day (24h)', val: 1, unit: 'days' },
                    { label: '2 Days (48h)', val: 2, unit: 'days' },
                    { label: '3 Days (Question Paper)', val: 3, unit: 'days' },
                    { label: '5 Days (Curriculum)', val: 5, unit: 'days' },
                    { label: '1 Week (7 Days)', val: 7, unit: 'days' },
                    { label: '2 Weeks (14 Days)', val: 14, unit: 'days' },
                    { label: '12 Hours', val: 12, unit: 'hours' },
                    { label: '6 Hours (Urgent)', val: 6, unit: 'hours' }
                  ].map(preset => {
                    const isSelected = newTaskDurationVal === preset.val && newTaskDurationUnit === preset.unit;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setNewTaskDurationVal(preset.val);
                          setNewTaskDurationUnit(preset.unit as 'days' | 'hours');
                        }}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Input */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      min={1}
                      max={365}
                      value={newTaskDurationVal} 
                      onChange={e => setNewTaskDurationVal(Math.max(1, Number(e.target.value)))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
                    />
                  </div>
                  <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5">
                    <button
                      type="button"
                      onClick={() => setNewTaskDurationUnit('days')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        newTaskDurationUnit === 'days'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTaskDurationUnit('hours')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        newTaskDurationUnit === 'hours'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Hours
                    </button>
                  </div>
                </div>

                <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-center justify-between border border-indigo-100 dark:border-indigo-900/40">
                  <span>
                    ⏱️ Target: <strong>{newTaskDurationVal} {newTaskDurationUnit === 'days' ? (newTaskDurationVal === 1 ? 'Day' : 'Days') : 'Hours'} ({newTaskDurationUnit === 'days' ? newTaskDurationVal * 24 : newTaskDurationVal}h SLA)</strong>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Monitored by SLA Engine
                  </span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={creatingTask}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 font-bold mt-2 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {creatingTask ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Delegating Task...</span>
                  </>
                ) : (
                  <span>Delegate Academic Task</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── ASSIGN SUBSTITUTION MODAL ── */}
      {selectedSubSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assign Period Substitute</h3>
              <button onClick={() => setSelectedSubSlot(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="text-xs space-y-3">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 text-indigo-900 dark:text-indigo-200">
                <b>{selectedSubSlot.class_name} · {selectedSubSlot.subject}</b> (Period {selectedSubSlot.period_number})
                <div className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">Absent: {selectedSubSlot.absent_teacher_name}</div>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Select Available Free Faculty</label>
                <div className="space-y-1.5 mt-1.5 max-h-48 overflow-y-auto">
                  {faculty.map(f => (
                    <label 
                      key={f.id} 
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer ${
                        chosenFacultyId === f.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="fac" 
                          checked={chosenFacultyId === f.id} 
                          onChange={() => setChosenFacultyId(f.id)} 
                        />
                        <span className="font-bold text-slate-900 dark:text-white">{f.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">{f.department} · {f.free_periods_today} Free</span>
                    </label>
                  ))}
                </div>
              </div>
              <button 
                disabled={!chosenFacultyId} 
                onClick={handleAssignSub}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 font-bold"
              >
                Confirm Substitute Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── APPROVE TASK RELIEF & MIGRATION MODAL ── */}
      {reliefModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Approve Faculty Task Relief &amp; Migration</h3>
              </div>
              <button onClick={() => setReliefModalTask(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold">{reliefModalTask.title}</div>
                <div className="text-[11px] text-amber-800 dark:text-amber-300">
                  Current Teacher: <strong>{reliefModalTask.assigned_to}</strong> • Reason: <strong>{reliefModalTask.relief_reason || 'Academic Surge'}</strong>
                </div>
                {reliefModalTask.relief_justification && (
                  <div className="text-[11px] italic mt-1 bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-amber-200 dark:border-amber-900/40">
                    &ldquo;{reliefModalTask.relief_justification}&rdquo;
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Migrate Task To Peer Teacher</label>
                <select
                  value={migrationPeer}
                  onChange={e => setMigrationPeer(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Mrs. Neha Roy">Mrs. Neha Roy (English)</option>
                  <option value="Dr. Suresh Babu">Dr. Suresh Babu (Science)</option>
                  <option value="Mr. Arvind Saxena">Mr. Arvind Saxena (Social Sciences)</option>
                  <option value="Mrs. Ananya Verma">Mrs. Ananya Verma (Math)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Zero performance penalty on original teacher. Workload is cleanly re-assigned.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Reset SLA Extension (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    value={migrationExtensionHours}
                    onChange={e => setMigrationExtensionHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Coordinator Approval Note</label>
                  <input
                    type="text"
                    value={migrationNote}
                    onChange={e => setMigrationNote(e.target.value)}
                    placeholder="e.g. Approved medical relief"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleApproveRelief(reliefModalTask)}
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 font-bold shadow-xs"
                >
                  Confirm Migration to {migrationPeer}
                </button>
                <button
                  onClick={() => setReliefModalTask(null)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EXTEND SLA MODAL ── */}
      {extensionModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Grant SLA Extension</h3>
              </div>
              <button onClick={() => setExtensionModalTask(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                <div className="font-bold">{extensionModalTask.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Assigned to: <strong>{extensionModalTask.assigned_to}</strong> • Current SLA: {formatSlaDisplay(extensionModalTask.sla_hours)}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Grant Additional Time</label>
                <div className="grid grid-cols-4 gap-1.5 mt-1">
                  {[
                    { label: '+1 Day (24h)', hrs: 24 },
                    { label: '+2 Days (48h)', hrs: 48 },
                    { label: '+3 Days (72h)', hrs: 72 },
                    { label: '+1 Week', hrs: 168 }
                  ].map(ext => (
                    <button
                      key={ext.hrs}
                      type="button"
                      onClick={() => setSlaExtensionHours(ext.hrs)}
                      className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        slaExtensionHours === ext.hrs
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {ext.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Coordinator Rationale</label>
                <input
                  type="text"
                  value={slaExtensionReason}
                  onChange={e => setSlaExtensionReason(e.target.value)}
                  placeholder="e.g. Granted extra prep time for complex rubric"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleExtendSla(extensionModalTask)}
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 font-bold shadow-xs"
                >
                  Grant +{slaExtensionHours}h Extension
                </button>
                <button
                  onClick={() => setExtensionModalTask(null)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DECLARE / SCHEDULE PTM EVENT MODAL ── */}
      {showDeclarePtmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <CalendarRange className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule / Declare PTM Event</h3>
                  <p className="text-[11px] text-slate-500">Post-exam parent-teacher conference declaration &amp; slot allocation</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeclarePtmModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDeclarePTMEvent} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200 text-[11px] leading-relaxed">
                📢 <strong>How this works:</strong> Declaring this event designates the official meeting window for classes that finished examinations. It creates mandatory 48h SLA tasks for all teachers of selected classes to open slots, and unlocks parent booking.
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">PTM Event Title</label>
                <input
                  type="text"
                  required
                  value={newPtmTitle}
                  onChange={e => setNewPtmTitle(e.target.value)}
                  placeholder="e.g. Term-1 Post Mid-Term Parent-Teacher Meeting"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Academic Term</label>
                  <select
                    value={newPtmTerm}
                    onChange={e => setNewPtmTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Term 1">Term 1 (Mid-Term)</option>
                    <option value="Term 2">Term 2 (Finals)</option>
                    <option value="Diagnostic Assessment">Diagnostic Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Slot Duration</label>
                  <div className="flex items-center gap-1.5 mt-1">
                    {[10, 15, 20].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setNewPtmDuration(mins)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                          newPtmDuration === mins
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newPtmStartDate}
                    onChange={e => setNewPtmStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">End Date (1 or 2 Days)</label>
                  <input
                    type="date"
                    required
                    value={newPtmEndDate}
                    onChange={e => setNewPtmEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Session Start Time</label>
                  <input
                    type="text"
                    value={newPtmStartTime}
                    onChange={e => setNewPtmStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Session End Time</label>
                  <input
                    type="text"
                    value={newPtmEndTime}
                    onChange={e => setNewPtmEndTime(e.target.value)}
                    placeholder="01:00 PM"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Target Cohorts / Exam-Concluded Classes ({newPtmTargetClasses.length} Selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPtmTargetClasses([...availableClasses])}
                      className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setNewPtmTargetClasses([])}
                      className="text-[10px] font-bold text-slate-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {availableClasses.map(cls => {
                    const isSelected = newPtmTargetClasses.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewPtmTargetClasses(prev => prev.filter(c => c !== cls));
                          } else {
                            setNewPtmTargetClasses(prev => [...prev, cls]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border-purple-300 dark:border-purple-800 shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-purple-600 dark:text-purple-400" />}
                        <span>{cls}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={declaringPtm}
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {declaringPtm ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Broadcasting Mandates...</span>
                    </>
                  ) : (
                    <>
                      <CalendarRange className="h-4 w-4" />
                      <span>Declare PTM &amp; Broadcast Mandates</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeclarePtmModal(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ORDER QUESTION PAPER MODAL ── */}
      {showOrderQpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Commission Question Paper Blueprint</h3>
                  <p className="text-[11px] text-slate-500">Assign paper specification to subject lead with Bloom&apos;s distribution</p>
                </div>
              </div>
              <button onClick={() => setShowOrderQpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleOrderQpSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Paper Title</label>
                <input
                  type="text"
                  required
                  value={orderQpTitle}
                  onChange={e => setOrderQpTitle(e.target.value)}
                  placeholder="e.g. Term 1 Mathematics Final Assessment"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Subject</label>
                  <select
                    value={orderQpSubject}
                    onChange={e => setOrderQpSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="General Science">General Science</option>
                    <option value="English Literature">English Literature</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Target Grade / Class</label>
                  <select
                    value={orderQpClass}
                    onChange={e => setOrderQpClass(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Term</label>
                  <select
                    value={orderQpTerm}
                    onChange={e => setOrderQpTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Term 1">Term 1 Final</option>
                    <option value="Mid-Term">Mid-Term Assessment</option>
                    <option value="Term 2">Term 2 Board Mock</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Maximum Marks</label>
                  <input
                    type="number"
                    value={orderQpMarks}
                    onChange={e => setOrderQpMarks(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Syllabus Chapters / Units Covered (Comma-separated)</label>
                <input
                  type="text"
                  value={orderQpUnits}
                  onChange={e => setOrderQpUnits(e.target.value)}
                  placeholder="e.g. Unit 1: Real Numbers, Unit 2: Polynomials, Unit 3: Linear Equations"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Assign Subject Lead</label>
                  <select
                    value={orderQpTeacherName}
                    onChange={e => {
                      setOrderQpTeacherName(e.target.value);
                      if (e.target.value.includes('Ananya')) setOrderQpTeacherId(2);
                      else if (e.target.value.includes('Raman')) setOrderQpTeacherId(12);
                      else if (e.target.value.includes('Sunitha')) setOrderQpTeacherId(14);
                      else setOrderQpTeacherId(2);
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mrs. Ananya Verma">Mrs. Ananya Verma (Math Lead)</option>
                    <option value="Dr. K. Raman">Dr. K. Raman (Science Lead)</option>
                    <option value="Mrs. Sunitha Rao">Mrs. Sunitha Rao (English Lead)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Draft Submission Due Date</label>
                  <input
                    type="date"
                    value={orderQpDueDate}
                    onChange={e => setOrderQpDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 font-bold mt-2 shadow-xs cursor-pointer"
              >
                Dispatch Commissioning Blueprint to Faculty
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── REVIEW QUESTION PAPER MODAL ── */}
      {selectedReviewQp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Review: {selectedReviewQp.title}</h3>
              </div>
              <button onClick={() => setSelectedReviewQp(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                <div className="font-bold text-indigo-900 dark:text-indigo-200">{selectedReviewQp.class_name} &bull; {selectedReviewQp.subject} ({selectedReviewQp.term})</div>
                <div className="text-slate-600 dark:text-slate-300">Author Faculty: <strong>{selectedReviewQp.created_by_teacher_name}</strong></div>
              </div>

              {selectedReviewQp.draft_file_url && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <span className="font-mono text-[11px] font-bold">{selectedReviewQp.draft_file_name || 'Question_Paper_Draft.pdf'}</span>
                  </div>
                  <a
                    href={selectedReviewQp.draft_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-[11px]"
                  >
                    Open PDF &rarr;
                  </a>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Feedback / Revision Instructions</label>
                <textarea
                  rows={3}
                  value={qpReviewNotes}
                  onChange={e => setQpReviewNotes(e.target.value)}
                  placeholder="Optional review remarks or revision requests..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleReviewQp(selectedReviewQp.id, true)}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-bold shadow-xs cursor-pointer"
                >
                  Approve Paper Blueprint ✓
                </button>
                <button
                  onClick={() => handleReviewQp(selectedReviewQp.id, false)}
                  className="rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 px-4 py-2.5 font-bold cursor-pointer"
                >
                  Request Revisions ⚠️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

