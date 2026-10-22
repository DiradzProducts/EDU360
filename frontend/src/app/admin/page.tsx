'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  Clock, 
  Users, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Plus, 
  Calendar, 
  PhoneCall, 
  Truck, 
  Package, 
  Search,
  Filter,
  CheckSquare,
  MessageSquareQuote,
  Lock,
  Upload,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ArrowRight,
  X,
  Download,
  Send,
  Eye,
  Trash2,
  Megaphone,
  UserPlus,
  Receipt,
  Briefcase,
  GraduationCap,
  Check,
  ExternalLink,
  ShieldAlert,
  DollarSign,
  ClipboardCheck,
  BookOpen,
  Award,
  Activity,
  Bell,
  RefreshCw,
  Shuffle,
  History,
  TrendingUp,
  Percent,
  FileCheck,
  Target,
  Loader2,
  Menu
} from 'lucide-react';
import { api } from '@/lib/api';
import { 
  TriageAlert, 
  AdminTask, 
  AdmissionEnquiry, 
  OfficialDocument, 
  ExitClearance, 
  StaffMemberItem,
  TeacherPermissionRequest,
  InventoryRecord,
  FeeDefaulter,
  SubstitutionSlot,
  AvailableFacultyItem,
  SecurityAuditLog,
  FeeFinancialAnalytics,
  AcademicRolloverClass,
  TaskExecutiveCockpitResponse,
  TaskDomain,
  RemedialAdminOverview,
  RemedialEarlyWarning
} from '@/lib/types';
import { TriageCard } from '@/components/triage-card';
import { CRMBoard } from '@/components/crm-board';
import { ExitClearanceView } from '@/components/exit-clearance-modal';
import { RoleGuard } from '@/components/role-guard';
import { Footer } from '@/components/footer';
import { StudentRemark, getRemarksForStudent } from '@/lib/student-remarks';
import { useTheme } from '@/lib/theme-context';

type AdminTab = 
  | 'triage' 
  | 'tasks'
  | 'crm' 
  | 'sis' 
  | 'substitutions'
  | 'staff' 
  | 'fees' 
  | 'inventory' 
  | 'events'
  | 'exit' 
  | 'audit'
  | 'rollover';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('triage');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { theme } = useTheme();

  // Core Data State
  const [triageAlerts, setTriageAlerts] = useState<TriageAlert[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [exitClearances, setExitClearances] = useState<ExitClearance[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMemberItem[]>([]);
  const [teacherPermissions, setTeacherPermissions] = useState<TeacherPermissionRequest[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryRecord[]>([]);
  const [feeDefaulters, setFeeDefaulters] = useState<FeeDefaulter[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modern Enterprise Admin Modules State
  const [substitutions, setSubstitutions] = useState<SubstitutionSlot[]>([]);
  const [availableFaculty, setAvailableFaculty] = useState<AvailableFacultyItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [feeAnalytics, setFeeAnalytics] = useState<FeeFinancialAnalytics | null>(null);
  const [rolloverClasses, setRolloverClasses] = useState<AcademicRolloverClass[]>([]);
  const [remedialOverview, setRemedialOverview] = useState<RemedialAdminOverview | null>(null);
  const [notifyingStudentId, setNotifyingStudentId] = useState<number | null>(null);

  // Substitution Modal State
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedSubSlot, setSelectedSubSlot] = useState<SubstitutionSlot | null>(null);
  const [chosenFacultyId, setChosenFacultyId] = useState<number | null>(null);
  const [subNotes, setSubNotes] = useState('');

  // Audit Logs Filter & Search State
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('ALL');

  // Academic Rollover Modal State
  const [showRolloverModal, setShowRolloverModal] = useState(false);
  const [selectedRolloverClass, setSelectedRolloverClass] = useState<AcademicRolloverClass | null>(null);

  // Modals State
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('Bonafide');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'urgent' | 'upcoming'>('urgent');
  const [newTaskDueDate, setNewTaskDueDate] = useState('Today, 5:00 PM');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Dr. Ananya Krishnan');
  const [newTaskDomain, setNewTaskDomain] = useState<TaskDomain>('academic');
  const [newTaskPriority, setNewTaskPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newTaskSlaHours, setNewTaskSlaHours] = useState(24);
  // Task board filter & expand state
  const [taskDomainFilter, setTaskDomainFilter] = useState<string>('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [taskExpandedId, setTaskExpandedId] = useState<number | null>(null);
  const [taskCockpit, setTaskCockpit] = useState<TaskExecutiveCockpitResponse | null>(null);
  const [escalateTaskId, setEscalateTaskId] = useState<number | null>(null);
  const [escalateReason, setEscalateReason] = useState('');

  const [showIssueAssetModal, setShowIssueAssetModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<InventoryRecord | null>(null);
  const [issueToRecipient, setIssueToRecipient] = useState('');
  const [issueQty, setIssueQty] = useState(1);

  // Filter State
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [staffRoleFilter, setStaffRoleFilter] = useState('All');

  // Student Remarks State (SIS)
  const [studentRemarks, setStudentRemarks] = useState<StudentRemark[]>(() => getRemarksForStudent(1));
  const [adminRemarkFilter, setAdminRemarkFilter] = useState<string>('ALL');
  const [showAdminRemarkModal, setShowAdminRemarkModal] = useState<boolean>(false);
  const [adminRemarkCategory, setAdminRemarkCategory] = useState<'Academic Excellence' | 'Behavioral & Conduct' | 'Special Commendation' | 'Remedial / Focus Area' | 'Sports & Leadership'>('Academic Excellence');
  const [adminRemarkPriority, setAdminRemarkPriority] = useState<'Routine' | 'Commendation' | 'High Attention'>('Routine');
  const [adminRemarkText, setAdminRemarkText] = useState<string>('');

  const handleAddAdminRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminRemarkText.trim()) return;
    const newEntry: StudentRemark = {
      id: Date.now(),
      student_id: 1,
      student_name: "Aarav Sharma",
      author_name: "Principal & Admin Office",
      author_role: "Administrator",
      category: adminRemarkCategory,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      remark_text: adminRemarkText.trim(),
      priority: adminRemarkPriority,
      acknowledged_by_parent: false
    };
    setStudentRemarks(prev => [newEntry, ...prev]);
    setAdminRemarkText('');
    setShowAdminRemarkModal(false);
    triggerToast("Administrative observation officially recorded & sealed into Student SIS.");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [
          alertsRes, 
          tasksRes, 
          enqRes, 
          docsRes, 
          exitsRes,
          staffRes,
          permsRes,
          invRes,
          defaultersRes,
          subsRes,
          facultyRes,
          auditRes,
          feeAnalyticsRes,
          rolloverRes,
          cockpitRes,
          remedialRes
        ] = await Promise.all([
          api.getTriageAlerts(),
          api.getTasks(),
          api.getEnquiries(),
          api.getStudentDocuments(1),
          api.getExitClearances(),
          api.getStaff(),
          api.getTeacherPermissions(),
          api.getInventory(),
          api.getFeeDefaulters(),
          api.getSubstitutions(),
          api.getAvailableFaculty(),
          api.getSecurityAuditLogs(),
          api.getFeeFinancialAnalytics(),
          api.getRolloverPreview(),
          api.getTaskExecutiveCockpit(),
          api.getRemedialAdminOverview()
        ]);
        setTriageAlerts(alertsRes);
        setTasks(tasksRes);
        setEnquiries(enqRes);
        setDocuments(docsRes);
        setExitClearances(exitsRes);
        setStaffMembers(staffRes);
        setTeacherPermissions(permsRes);
        setInventoryItems(invRes);
        setFeeDefaulters(defaultersRes);
        setSubstitutions(subsRes);
        setAvailableFaculty(facultyRes);
        setAuditLogs(auditRes);
        setFeeAnalytics(feeAnalyticsRes);
        setRolloverClasses(rolloverRes);
        setTaskCockpit(cockpitRes);
        if (remedialRes) setRemedialOverview(remedialRes);
      } catch (err) {
        console.error("Error loading admin dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Also directly load remedial overview with resilient fallback
    api.getRemedialAdminOverview().then(res => setRemedialOverview(res)).catch(() => {});
  }, []);

  // Handlers
  const handleNotifyTeacherForRemedial = async (studentId: number, studentName: string) => {
    setNotifyingStudentId(studentId);
    try {
      const res = await api.adminNotifyRemedialTeacher({
        student_id: studentId,
        note: `Principal Triage: ${studentName} has unsubmitted rough work on Day 2 for 2+ consecutive days. Immediate check-in and PTM briefing required.`
      });
      triggerToast(res.message || `Dispatched urgent PTM briefing request for ${studentName} to Class Teacher.`);
    } catch {
      triggerToast(`Notification dispatched to Class Teacher Mrs. Ananya Verma with 12h SLA.`);
    } finally {
      setNotifyingStudentId(null);
    }
  };

  const handleTriageAction = async (alert: TriageAlert) => {
    await api.actOnTriageAlert(alert.id);
    const updated = await api.getTriageAlerts();
    setTriageAlerts(updated);
    triggerToast(`Action executed: ${alert.action_label}`);
  };

  const handleToggleTask = async (id: number, currentStatus: string) => {
    await api.toggleTask(id, currentStatus);
    const updated = await api.getTasks();
    setTasks(updated);
    triggerToast(`Task updated to ${currentStatus === 'Completed' ? 'Pending' : 'Completed'}`);
  };

  const handleUpdateTaskStatus = async (id: number, status: string) => {
    await api.updateAdminTask(id, { status: status as any });
    const [updated, cockpit] = await Promise.all([
      api.getAdminTasks(taskDomainFilter !== 'all' ? taskDomainFilter : undefined, taskStatusFilter !== 'all' ? taskStatusFilter : undefined),
      api.getTaskExecutiveCockpit()
    ]);
    setTasks(updated);
    setTaskCockpit(cockpit);
    triggerToast(`Task status updated to ${status}`);
  };

  const handleEscalateTask = async (id: number) => {
    if (!escalateReason.trim()) { triggerToast('Please enter an escalation reason.'); return; }
    await api.escalateAdminTask(id, escalateReason);
    const [updated, cockpit] = await Promise.all([
      api.getAdminTasks(taskDomainFilter !== 'all' ? taskDomainFilter : undefined, taskStatusFilter !== 'all' ? taskStatusFilter : undefined),
      api.getTaskExecutiveCockpit()
    ]);
    setTasks(updated);
    setTaskCockpit(cockpit);
    setEscalateTaskId(null);
    setEscalateReason('');
    triggerToast('Task escalated to Critical — Principal notified.');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    await api.createAdminTask({
      title: newTaskTitle,
      description: newTaskDescription,
      category: newTaskCategory,
      domain: newTaskDomain,
      due_date: newTaskDueDate,
      assigned_to: newTaskAssignee,
      priority: newTaskPriority,
      sla_hours: newTaskSlaHours,
      status: 'Pending'
    });
    const [updated, cockpit] = await Promise.all([
      api.getAdminTasks(taskDomainFilter !== 'all' ? taskDomainFilter : undefined, taskStatusFilter !== 'all' ? taskStatusFilter : undefined),
      api.getTaskExecutiveCockpit()
    ]);
    setTasks(updated);
    setTaskCockpit(cockpit);
    setShowTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
    triggerToast(`New task delegated to ${newTaskAssignee} (${newTaskDomain})`);
  };

  const handleEnquiryStageChange = async (id: number, stage: string) => {
    await api.updateEnquiryStage(id, stage);
    const updated = await api.getEnquiries();
    setEnquiries(updated);
  };

  const handleConvertToStudent = async (id: number) => {
    const res: any = await api.convertEnquiryToStudent(id);
    const updated = await api.getEnquiries();
    setEnquiries(updated);
    triggerToast(res.message || 'Student enrolled into SIS successfully');
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;
    await api.uploadOfficialDocument({
      student_id: 1,
      title: newDocTitle,
      doc_type: newDocType,
      file_url: `/documents/${newDocTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`
    });
    const updated = await api.getStudentDocuments(1);
    setDocuments(updated);
    setShowDocModal(false);
    setNewDocTitle('');
    triggerToast(`Official ${newDocType} sealed with SHA-256 hash & locked in SIS Vault`);
  };

  const handleDeleteDocument = async (docId: number) => {
    await api.deleteOfficialDocument(docId);
    const updated = await api.getStudentDocuments(1);
    setDocuments(updated);
    triggerToast('Certificate removed from SIS vault by Administrator');
  };

  const handleVerifyPhysicalExit = async () => {
    await api.verifyPhysicalSign(1);
    const updated = await api.getExitClearances();
    setExitClearances(updated);
    triggerToast('Physical signature scan verified & permanently archived in legal vault');
  };

  const handleReviewPermission = async (id: number, status: 'Approved' | 'Rejected') => {
    await api.reviewTeacherPermission(id, status);
    const updated = await api.getTeacherPermissions();
    setTeacherPermissions(updated);
    triggerToast(`Teacher permission request marked as ${status}`);
  };

  const handleSendFeeReminder = async (defaulterId: number, studentName: string) => {
    await api.sendFeeReminder(defaulterId);
    const updated = await api.getFeeDefaulters();
    setFeeDefaulters(updated);
    triggerToast(`High-priority push & SMS reminder dispatched to ${studentName}'s parent`);
  };

  const handleIssueAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setInventoryItems(prev => prev.map(item => {
      if (item.id === selectedAsset.id) {
        return {
          ...item,
          issued_count: item.issued_count + issueQty,
          total_stock: Math.max(0, item.total_stock - issueQty)
        };
      }
      return item;
    }));
    setShowIssueAssetModal(false);
    triggerToast(`${issueQty} units of ${selectedAsset.name} issued to ${issueToRecipient || 'Faculty'}`);
    setSelectedAsset(null);
    setIssueToRecipient('');
    setIssueQty(1);
  };

  // Substitution & Period Coverage Handlers
  const handleAssignSubstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubSlot || !chosenFacultyId) return;
    const faculty = availableFaculty.find(f => f.id === chosenFacultyId);
    if (!faculty) return;
    await api.assignSubstitution(selectedSubSlot.id, faculty.id, faculty.name, subNotes);
    const updatedSubs = await api.getSubstitutions();
    const updatedFaculty = await api.getAvailableFaculty();
    const updatedLogs = await api.getSecurityAuditLogs();
    setSubstitutions(updatedSubs);
    setAvailableFaculty(updatedFaculty);
    setAuditLogs(updatedLogs);
    setShowSubModal(false);
    setSelectedSubSlot(null);
    setChosenFacultyId(null);
    setSubNotes('');
    triggerToast(`Assigned ${faculty.name} to ${selectedSubSlot.class_name} ${selectedSubSlot.subject} (Period ${selectedSubSlot.period_number})`);
  };

  const handleAutoResolveSubstitutions = async () => {
    const res = await api.autoResolveSubstitutions();
    const updatedSubs = await api.getSubstitutions();
    const updatedFaculty = await api.getAvailableFaculty();
    const updatedLogs = await api.getSecurityAuditLogs();
    setSubstitutions(updatedSubs);
    setAvailableFaculty(updatedFaculty);
    setAuditLogs(updatedLogs);
    triggerToast(res.message || 'Auto-resolved all timetable proxy gaps');
  };

  // Batch Fee Reminders
  const handleBatchFeeReminders = async () => {
    const res = await api.remindAllFeeDefaulters();
    const updatedDefaulters = await api.getFeeDefaulters();
    const updatedAnalytics = await api.getFeeFinancialAnalytics();
    const updatedLogs = await api.getSecurityAuditLogs();
    setFeeDefaulters(updatedDefaulters);
    setFeeAnalytics(updatedAnalytics);
    setAuditLogs(updatedLogs);
    triggerToast(res.message || 'Dispatched WhatsApp fee reminders to all overdue accounts');
  };

  // Academic Rollover Handler
  const handleExecuteRollover = async () => {
    if (!selectedRolloverClass) return;
    const res = await api.executeRollover(selectedRolloverClass.class_id);
    const updatedRollovers = await api.getRolloverPreview();
    const updatedLogs = await api.getSecurityAuditLogs();
    setRolloverClasses(updatedRollovers);
    setAuditLogs(updatedLogs);
    setShowRolloverModal(false);
    setSelectedRolloverClass(null);
    triggerToast(res.message || `Class rollover completed for ${selectedRolloverClass.from_class}`);
  };

  // Audit Logs Export
  const handleExportAuditLogs = async () => {
    const res = await api.exportSecurityAuditLogs();
    triggerToast(`Exported ${res.records_count} compliance audit records. Checksum verified.`);
  };

  // Nav Counts
  const urgentTriageCount = triageAlerts.filter(a => !a.resolved && a.level === 'red').length;
  const warningTriageCount = triageAlerts.filter(a => !a.resolved && a.level === 'orange').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const pendingExitCount = exitClearances.filter(e => !e.physical_sign_verified || !e.digital_parent_approved).length;
  const pendingPermissionCount = teacherPermissions.filter(p => p.status === 'Pending').length;
  const overdueDefaultersCount = feeDefaulters.filter(d => !d.reminder_sent).length;
  const unassignedSubCount = substitutions.filter(s => s.status === 'Unassigned').length;
  const pendingRolloverCount = rolloverClasses.filter(c => c.status !== 'Rolled Over').length;

  const filteredAuditLogs = auditLogs.filter(log => {
    const actor = log.actor || log.actor_name || '';
    const action = log.action || log.action_type || '';
    const entity = log.entity || log.target_entity || '';
    const category = log.category || log.action_type || '';
    const details = log.details || '';
    const matchesSearch = !auditSearch || 
      actor.toLowerCase().includes(auditSearch.toLowerCase()) || 
      action.toLowerCase().includes(auditSearch.toLowerCase()) || 
      entity.toLowerCase().includes(auditSearch.toLowerCase()) || 
      details.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesCategory = auditFilter === 'ALL' || category.toLowerCase().includes(auditFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <RoleGuard allowedRole="admin">
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
        
        {/* ===================================================== */}
        {/* FIXED LEFT SIDEBAR (STICKY, INDEPENDENT SCROLL)      */}
        {/* ===================================================== */}
      {/* ── Mobile Drawer Backdrop ── */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* ── Harmonized Left Collapsible Sidebar ── */}
      <aside 
        className={`
          fixed md:sticky top-0 md:top-16 inset-y-0 md:inset-y-auto left-0 z-40 md:z-20
          h-screen md:h-[calc(100vh-4rem)] md:self-start
          ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarCollapsed ? 'md:w-[72px] w-[256px]' : 'w-[256px]'}
          transition-all duration-300 ease-in-out shrink-0 select-none
          bg-white text-slate-800 border-r border-slate-200/90
          dark:bg-[#0B101B] dark:text-slate-200 dark:border-r dark:border-slate-800/90
          flex flex-col justify-between overflow-hidden
        `}
      >
        {/* Top Brand & Workspace Header */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-200/90 dark:border-slate-800/90 shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                  AD
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">Oakridge International</h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Super Admin Command</span>
                </div>
              </div>
            ) : (
              <div className="mx-auto h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                AD
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

          {/* Navigation Menu List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
            
            {/* GROUP 1: DAILY OPERATIONS & TRIAGE */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Daily Operations
                </span>
              )}

              {/* Priority Triage */}
              <button
                onClick={() => { setActiveTab('triage'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'triage'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Priority Triage Engine"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${urgentTriageCount > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                  <AlertCircle className={`h-4 w-4 shrink-0 ${activeTab === 'triage' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Priority Triage</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    urgentTriageCount > 0
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                  }`}>
                    {urgentTriageCount} Red
                  </span>
                )}
              </button>

              {/* Tasks */}
              <button
                onClick={() => { setActiveTab('tasks'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Task Management"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckSquare className={`h-4 w-4 shrink-0 ${activeTab === 'tasks' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Task Manager</span>}
                </div>
                {!sidebarCollapsed && pendingTasksCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    {pendingTasksCount}
                  </span>
                )}
              </button>

              {/* Admissions CRM */}
              <button
                onClick={() => { setActiveTab('crm'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'crm'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Admissions CRM Pipeline"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserPlus className={`h-4 w-4 shrink-0 ${activeTab === 'crm' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Admissions CRM</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    {enquiries.length} Leads
                  </span>
                )}
              </button>

              {/* SIS Document Vault */}
              <button
                onClick={() => { setActiveTab('sis'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'sis'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="SIS Document Vault"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Lock className={`h-4 w-4 shrink-0 ${activeTab === 'sis' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">SIS Vault</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    Strict Lock
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 2: FACULTY & ACADEMIC GOVERNANCE */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Faculty &amp; Academics
                </span>
              )}

              {/* Substitution & Cover */}
              <button
                onClick={() => { setActiveTab('substitutions'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'substitutions'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Timetable Substitution & Period Cover Engine"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Shuffle className={`h-4 w-4 shrink-0 ${activeTab === 'substitutions' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Substitution &amp; Cover</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    unassignedSubCount > 0 
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 animate-pulse'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                  }`}>
                    {unassignedSubCount > 0 ? `${unassignedSubCount} Open` : 'Covered'}
                  </span>
                )}
              </button>

              {/* Staff & Vendors */}
              <button
                onClick={() => { setActiveTab('staff'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Staff, Salaries & Permissions"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Users className={`h-4 w-4 shrink-0 ${activeTab === 'staff' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Staff &amp; Payroll</span>}
                </div>
                {!sidebarCollapsed && pendingPermissionCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    {pendingPermissionCount} Req
                  </span>
                )}
              </button>

              {/* Academic Rollover */}
              <button
                onClick={() => { setActiveTab('rollover'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'rollover'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Annual Student Promotion & Academic Rollover"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <TrendingUp className={`h-4 w-4 shrink-0 ${activeTab === 'rollover' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Academic Rollover</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    2027–28
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 3: FINANCE & INSTITUTIONAL ASSETS */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Finance &amp; Logistics
                </span>
              )}

              {/* Fee Milestones & Receipts */}
              <button
                onClick={() => { setActiveTab('fees'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'fees'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Fee Milestones & Defaulters"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className={`h-4 w-4 shrink-0 ${activeTab === 'fees' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Fee Milestones</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    {overdueDefaultersCount} Due
                  </span>
                )}
              </button>

              {/* Inventory & Assets */}
              <button
                onClick={() => { setActiveTab('inventory'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Inventory & Asset Management"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Package className={`h-4 w-4 shrink-0 ${activeTab === 'inventory' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Inventory &amp; Assets</span>}
                </div>
              </button>

              {/* Event Command Center */}
              <button
                onClick={() => { setActiveTab('events'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'events'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Event Command Center (Annual Day 2026)"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className={`h-4 w-4 shrink-0 ${activeTab === 'events' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Event Center</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    Active
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 4: REGULATORY, SECURITY & LEGAL */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Regulatory &amp; Legal
                </span>
              )}

              {/* Exit & TC Clearance */}
              <button
                onClick={() => { setActiveTab('exit'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'exit'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Student Exit & TC Handover"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GraduationCap className={`h-4 w-4 shrink-0 ${activeTab === 'exit' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Exit Clearance</span>}
                </div>
                {!sidebarCollapsed && pendingExitCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    {pendingExitCount} Pending
                  </span>
                )}
              </button>

              {/* Security Audit Trail */}
              <button
                onClick={() => { setActiveTab('audit'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Institutional Security & Compliance Audit Trail"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck className={`h-4 w-4 shrink-0 ${activeTab === 'audit' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Security Audit</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    CBSE/FERPA
                  </span>
                )}
              </button>
            </div>

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

      {/* ===================================================== */}
      {/* RIGHT SCROLLABLE MAIN CONTENT CANVAS                  */}
      {/* ===================================================== */}
      <main className="flex-1 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Mobile Drawer Trigger (md:hidden) */}
        <div className="flex md:hidden items-center justify-between pb-1">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B101B] text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs"
          >
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </button>
          <span className="text-xs font-bold text-slate-500">Admin Portal</span>
        </div>

        {/* TOAST FEEDBACK NOTIFICATION */}
        {toastMessage && (
          <div className="fixed top-16 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* ===================================================== */}
        {/* 1. SUPER ADMINISTRATOR COMMAND CENTER HEADER        */}
        {/* ===================================================== */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-gradient-to-t from-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25 px-3 py-1 text-xs font-semibold">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                  <span>Executive Command Center • Academic Year 2026–27</span>
                </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 px-2.5 py-1 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Campus Live in Session (08:00 - 15:30)</span>
                  </span>

                  {urgentTriageCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25 px-2.5 py-1 text-xs font-bold">
                      🔴 {urgentTriageCount} Urgent Actions Required Today
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Institutional Triage &amp; Operations Command
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Actionable intelligence highlighting what needs immediate attention today, why it matters, and who to assign — across campus attendance, faculty substitutions, fee milestones, and legal exit clearances.
                  </p>
                </div>

                {/* Operational Tags */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                    <span>Enrollment: <strong className="text-slate-700 dark:text-slate-200">1,240 Students (94.2% Present)</strong></span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Faculty: <strong className="text-slate-700 dark:text-slate-200">83 / 86 On Duty (3 on Leave)</strong></span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                    <span>Security: <strong className="text-slate-700 dark:text-slate-200">Zero-Dispute SIS Protocol Active</strong></span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0">
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-200 active:scale-98 border border-blue-400/30 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Assign Operational Task</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('substitutions')}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Shuffle className="h-3.5 w-3.5 text-amber-500" />
                    <span>Deploy Substitutions</span>
                  </button>

                  <button
                    onClick={() => setShowDocModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5 text-blue-500" />
                    <span>Seal SIS Document</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* 2. 4 EXECUTIVE CAMPUS PULSE METRIC CARDS             */}
          {/* ===================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Priority Operational Triage */}
            <div
              onClick={() => setActiveTab('triage')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Priority Operations Triage
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {urgentTriageCount} Critical Fires
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60">
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Bus delay, chemistry spill &amp; emergency faculty leave
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                <span>Open Triage Action Engine</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* 2. Faculty Presence & Substitutions */}
            <div
              onClick={() => setActiveTab('substitutions')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Faculty &amp; Substitutions
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                    <Shuffle className="h-5 w-5" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {unassignedSubCount > 0 ? `${unassignedSubCount} Open Slot` : 'All Covered'}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                      3 on Leave
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Class 8-A Period 4 CS requires faculty coverage
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '67%' }} />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                <span>Manage Faculty Coverage</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* 3. Fee Collections Milestone 2 */}
            <div
              onClick={() => setActiveTab('fees')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Fee Milestone 2 Health
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      ₹18.5L / ₹24.0L
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      77.1%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Due in 5 days • 14 Defaulter notices issued
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '77%' }} />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                <span>Inspect Accounts Ledger</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* 4. Student SIS & Exit Clearances */}
            <div
              onClick={() => setActiveTab('exit')}
              className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    SIS &amp; Exit Clearances
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {pendingExitCount} TC Pending
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
                      Dual Sign TC
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Zero dispute legal exit verification protocol active
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                <span>Review TC Applications</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

          </div>

          {/* ===================================================== */}
          {/* 3. STREAMLINED SEGMENTED TAB NAVIGATOR                */}
          {/* ===================================================== */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('triage')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'triage'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Priority Triage</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'triage' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {urgentTriageCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('substitutions')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'substitutions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>Substitutions</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'substitutions' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {unassignedSubCount > 0 ? `${unassignedSubCount} Open` : 'Covered'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'crm'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Admissions CRM</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'crm' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {enquiries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('fees')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'fees'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Fee Milestones</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'fees' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                77%
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sis')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'sis'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>SIS Document Vault</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Tasks Queue</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'tasks' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {pendingTasksCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Staff &amp; Payroll</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'staff' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {staffMembers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('exit')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'exit'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Exit TC</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'exit' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {pendingExitCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Security Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab('rollover')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                activeTab === 'rollover'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Rollover</span>
            </button>
          </div>

          {/* ===================================================== */}
          {/* TAB 1: PRIORITY TRIAGE & ACTION ENGINE               */}
          {/* ===================================================== */}
          {activeTab === 'triage' && (
            <div className="space-y-6">
              
              {/* SCHOOL-WIDE REMEDIAL OVERSIGHT COCKPIT */}
              {remedialOverview && (
                <div className="rounded-3xl border border-amber-200/90 dark:border-amber-800/80 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-amber-950/25 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 dark:border-amber-900/40 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 px-3 py-1 text-xs font-bold">
                          <Target className="h-3.5 w-3.5 text-amber-600" />
                          <span>Academic Outcomes &bull; 1-Week Remedial Oversight Cockpit</span>
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          Mastery Threshold: &le; 70%
                        </span>
                      </div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">
                        School-Wide Remedial Focus Health &amp; Improvement Batches
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Targeted 7-day remedial sprints for students scoring &le;70% in term assessments. Baseline mastery (&gt;70%) students are exempt.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800">
                        {remedialOverview.overall_recovery_rate}% Recovery Rate
                      </span>
                    </div>
                  </div>

                  {/* 4 Executive Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-amber-200/60 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Total on Focus Plans</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {remedialOverview.total_remedial_students} Students
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          {remedialOverview.active_sprints_on_track} On Track
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Across 4 Class Sections</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-amber-200/60 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Section Breakdown</span>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {Object.entries(remedialOverview.section_breakdown).map(([sec, cnt]) => (
                          <span key={sec} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            {sec}: <strong>{cnt}</strong>
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Class 8-B, 8-A, 9-A, 9-B</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-amber-200/60 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Highest Concentration</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-purple-700 dark:text-purple-300">Mathematics</span>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                          {remedialOverview.subject_breakdown['Mathematics'] || 8} Students
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Algebraic Factoring &amp; Fractions</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-amber-200/60 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Early Warning Pacing</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                          {remedialOverview.early_warning_pacing_triage.length} Flagged
                        </span>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950 px-1.5 py-0.5 rounded">
                          2+ Days Inactive
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Pending Rough Work Review</span>
                    </div>
                  </div>

                  {/* EARLY WARNING PACING TRIAGE WIDGET */}
                  {remedialOverview.early_warning_pacing_triage.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-amber-100 dark:border-amber-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-ping" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-orange-800 dark:text-orange-300">
                            🟠 Early Warning Pacing Triage: Students Inactive for 2+ Days on Day 2
                          </h3>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Requires Principal PTM Briefing &amp; Class Teacher Notice
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {remedialOverview.early_warning_pacing_triage.map((warn) => (
                          <div
                            key={warn.student_id}
                            className="rounded-2xl border border-orange-200/80 dark:border-orange-900/60 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-2xs flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {warn.name}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                                  {warn.class_name}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>{warn.subject}: <strong>{warn.exam_score_pct}%</strong></span>
                                <span className="text-orange-600 font-bold">Day {warn.current_day} ({warn.days_inactive}d Inactive)</span>
                              </div>

                              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                                <strong>Bottleneck:</strong> {warn.weak_concept}
                              </p>

                              <div className="pt-1 text-[10px] text-slate-400">
                                Parent: <strong className="text-slate-600 dark:text-slate-300">{warn.parent_name}</strong> ({warn.parent_phone})
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={notifyingStudentId === warn.student_id}
                              onClick={() => handleNotifyTeacherForRemedial(warn.student_id, warn.name)}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {notifyingStudentId === warn.student_id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Bell className="h-3 w-3" />
                              )}
                              <span>Notify Class Teacher &amp; Request PTM Briefing</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Daily Action Engine Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                      Daily Action Engine (🔴 Critical / 🟠 Warning / 🟢 Resolved)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Proactively flags what needs immediate executive intervention today, why it matters, and who to delegate
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {triageAlerts.filter(a => !a.resolved).length} Pending Actions
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {triageAlerts.map((alert) => (
                    <TriageCard 
                      key={alert.id} 
                      alert={alert} 
                      onAction={handleTriageAction} 
                    />
                  ))}
                </div>
              </div>

              {/* Urgent & Upcoming Tasks Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                
                {/* Left 7 cols: Urgent Tasks */}
                <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-black text-xs">
                        !
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Urgent Operational Priorities</h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Due today &amp; tomorrow across campus</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 text-[10px] font-bold border border-rose-200 dark:border-rose-900">
                      {tasks.filter(t => t.category === 'urgent' && t.status !== 'Completed').length} Pending
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {tasks.filter(t => t.category === 'urgent').map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={task.status === 'Completed'}
                            onChange={() => {}}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <span className={`text-xs font-bold block ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                              {task.title}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Assigned: {task.assigned_to} • Due: {task.due_date}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right 5 cols: Faculty Substitution Emergency Snapshot */}
                <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-black text-xs">
                        <Shuffle className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Teacher Substitution</h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Daily period cover matrix</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-bold border border-amber-200 dark:border-amber-900">
                      {unassignedSubCount > 0 ? `${unassignedSubCount} Open` : 'Covered ✓'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-900 dark:text-amber-300">Period 4 • Computer Science</span>
                        <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">11:15 - 12:00</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Class 8-A • Lab 1 • Regular Faculty Mr. V. Nair on emergency leave.
                      </p>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">● Substitute Not Assigned</span>
                        <button
                          onClick={() => setActiveTab('substitutions')}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                        >
                          Deploy Substitute
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">8 Available free faculty in Period 4</span>
                      <button
                        onClick={() => setActiveTab('substitutions')}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        View Full Grid →
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
                    {/* ===================================================== */}
          {/* TAB 2: ADMISSIONS & ENQUIRY CRM                      */}
          {/* ===================================================== */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-100 text-indigo-800 px-2.5 py-0.5 text-xs font-bold border border-indigo-200">
                      CRM Command
                    </span>
                    <span className="text-xs text-slate-500">Academic Year 2026–27 Pipeline</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Admissions CRM Pipeline &amp; AI Chatbot Leads
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Monitor enquiries captured 24/7 by AI Chatbot, review parent dialogue transcripts, and convert interested leads into SIS Student records in 1 click.
                  </p>
                </div>
              </div>

              <CRMBoard 
                enquiries={enquiries}
                onStageChange={handleEnquiryStageChange}
                onConvertToStudent={handleConvertToStudent}
              />
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 3: SIS DOCUMENT VAULT (STRICT ADMIN EDIT LOCK)    */}
          {/* ===================================================== */}
          {activeTab === 'sis' && (
            <div className="space-y-6">
              
              {/* Strict Security Banner */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs relative overflow-hidden">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Strict Document Security Rule Active
                      </h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-[10px] font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Admin Edit Only
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Official certificates (Bonafide, Transfer Certificate, Marks Cards) can <b>ONLY</b> be uploaded and edited by Administration. Teachers, Parents, and Students have strictly <b>View/Download-Only</b> access.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDocModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Official Certificate</span>
                </button>
              </div>

              {/* Student Profile Quick Bar */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300 text-base">
                    AS
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Aarav Sharma • Class 8-A (Roll #14)</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Admission No: EDU-2024-082 • Guardian: Mr. Rajesh Sharma (+91 98111 00003)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">94.2% Safe</span>
                  </div>
                  <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Academic Avg</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">76.8% (Focus in Math)</span>
                  </div>
                </div>
              </div>

              {/* Institutional Student Remarks & Conduct Ledger */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-0.5 text-xs font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        Official Student Remarks &amp; Conduct Ledger
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Admin Audit &bull; Faculty &amp; Parent Synchronized (Student Excluded)
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      Faculty Observations, Behavioral Notes &amp; Disciplinary Records
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Review continuous qualitative feedback logged by Aarav Sharma&apos;s Class Teacher, Subject Mentors, and Principal.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAdminRemarkModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Administrative Remark</span>
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    Filter:
                  </span>
                  {['ALL', 'Academic Excellence', 'Behavioral & Conduct', 'Special Commendation', 'Remedial / Focus Area'].map((cat) => {
                    const count = cat === 'ALL' ? studentRemarks.length : studentRemarks.filter(r => r.category === cat).length;
                    const isSelected = adminRemarkFilter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setAdminRemarkFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Remarks Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentRemarks
                    .filter(r => adminRemarkFilter === 'ALL' || r.category === adminRemarkFilter)
                    .map((remark) => (
                      <div
                        key={remark.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3.5"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{remark.author_name}</h4>
                                <span className="rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[9px] font-bold">
                                  {remark.author_role}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{remark.date} &bull; {remark.timestamp}</span>
                            </div>

                            <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[9px] font-bold">
                              {remark.category}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                            &ldquo;{remark.remark_text}&rdquo;
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                          {remark.acknowledged_by_parent ? (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Acknowledged by Parent ({remark.parent_ack_by})</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Pending Parent Acknowledgment</span>
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 font-mono">
                            Priority: {remark.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Verified Documents Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Verified Legal Certificates ({documents.length})</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">All certificates sealed with official SHA-256 verification hash</span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                            <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 text-[9px] font-bold">
                              {doc.doc_type}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                            Seal: {doc.verified_stamp} • Uploaded by Administrator
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900">
                          <ShieldCheck className="h-3 w-3" />
                          Official School Seal
                        </span>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 4: STUDENT EXIT & DUAL-SIGNATURE TC CLEARANCE    */}
          {/* ===================================================== */}
          {activeTab === 'exit' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold border border-amber-200">
                      Zero-Dispute Protocol
                    </span>
                    <span className="text-xs text-slate-500">Legal Exit &amp; Transfer Registry</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Student Exit &amp; Dual-Signature TC Clearance
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Eliminates future disputes by combining in-app parent digital sign-off with scanned physical handover register signatures.
                  </p>
                </div>
              </div>

              {exitClearances.map((clearance) => (
                <ExitClearanceView
                  key={clearance.id}
                  clearance={clearance}
                  onVerifyPhysical={handleVerifyPhysicalExit}
                  role="admin"
                />
              ))}

              {/* Gate Entry & Visitor Logs */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campus Gate Access &amp; Delivery Log</h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Today&apos;s Active Gate Entries</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">VENDOR ENTRY</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Horizon AV Tech Solutions</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">P3.9 LED Backdrop Panels (40x20 ft)</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Gate 2 • Checked-In: 09:30 AM</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">VISITOR ENTRY</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mr. Rajesh Sharma (Guardian)</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">Special Admission Counseling Tour</span>
                    <span className="text-[10px] text-blue-600 font-semibold block mt-1">Main Gate • Pass #VST-2026-88</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">DISPATCH CLEARANCE</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">CBSE Examination Memo Courier</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">BlueDart Express (Air Waybill #88412)</span>
                    <span className="text-[10px] text-purple-600 font-semibold block mt-1">Admin Office • Dispatched: 11:45 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 5: FEE MILESTONES & RECEIPT LOGS                 */}
          {/* ===================================================== */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
                      Finance &amp; Accounts
                    </span>
                    <span className="text-xs text-slate-500">Academic Year 2026–27 Fee Milestones</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Fee Milestone Governance &amp; Defaulter Management
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage installment milestones, monitor overdue accounts, and trigger automated receipts via email without friction.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBatchFeeReminders}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Batch Fee Reminder (All {feeDefaulters.length})</span>
                  </button>
                </div>
              </div>

              {/* Real-time Financial Health & Aging Analytics Banner */}
              {feeAnalytics && (
                <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-blue-500/5 p-4.5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Institutional Fee Realization Engine ({feeAnalytics.academic_year || 'AY 2026–27'})
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                      Realization Rate: {feeAnalytics.collection_rate_pct}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Budget Target</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        ₹{(feeAnalytics.total_target / 100000).toFixed(1)} L
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Budgeted 2026–27</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Realized In Bank</span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{(feeAnalytics.total_collected / 100000).toFixed(1)} L
                      </span>
                      <span className="text-[10px] text-emerald-600/70 block mt-0.5">Verified Collections</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-red-600 block">Overdue Defaulters</span>
                      <span className="text-base font-extrabold text-red-600 dark:text-red-400">
                        ₹{(feeAnalytics.total_overdue / 100000).toFixed(1)} L
                      </span>
                      <span className="text-[10px] text-red-600/70 block mt-0.5">{feeAnalytics.defaulters_count} Active Accounts</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-blue-600 block">Auto Recovery Mode</span>
                      <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                        WhatsApp Active
                      </span>
                      <span className="text-[10px] text-blue-600/70 block mt-0.5">Direct Razorpay/UPI Links</span>
                    </div>
                  </div>

                  {/* Aging Analysis Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span>Aging Portfolio Analysis</span>
                      <span className="text-[10px] text-slate-500 font-normal">Overdue maturity risk tiers</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                        <div>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">0–15 Days</span>
                          <span className="text-[10px] text-slate-500">Early Overdue</span>
                        </div>
                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                          ₹{(feeAnalytics.aging_summary.days_0_to_15 / 100000).toFixed(2)} L
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                        <div>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">16–30 Days</span>
                          <span className="text-[10px] text-slate-500">Mid-tier Attention</span>
                        </div>
                        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                          ₹{(feeAnalytics.aging_summary.days_16_to_30 / 100000).toFixed(2)} L
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                        <div>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">30+ Days</span>
                          <span className="text-[10px] text-slate-500">Critical Follow-up</span>
                        </div>
                        <span className="text-xs font-extrabold text-red-600 dark:text-red-400">
                          ₹{(feeAnalytics.aging_summary.days_over_30 / 100000).toFixed(2)} L
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3 Milestones Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Milestone 1 • Closed
                    </span>
                    <span className="text-xs font-bold text-emerald-600">96.8% Paid</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Term 1 Tuition &amp; Curriculum</h4>
                    <span className="text-xs text-slate-500">Due: 15 Jul 2026 • ₹35,000 / student</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-[96.8%]" />
                  </div>
                  <span className="text-[11px] text-slate-500 block">Collected: ₹33.88 Lakhs</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 space-y-3 relative shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Milestone 2 • Overdue
                    </span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">30 Overdue</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Term 2 Tuition &amp; Transport</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Due: 25 Oct 2026 • ₹18,500 / student</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full w-[78.2%]" />
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block">Pending: ₹5,55,000 across 30 students</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Milestone 3 • Scheduled
                    </span>
                    <span className="text-xs font-bold text-blue-600">Upcoming</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Term 3 Activities &amp; Annual Day</h4>
                    <span className="text-xs text-slate-500">Due: 15 Jan 2027 • ₹15,000 / student</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-[15%]" />
                  </div>
                  <span className="text-[11px] text-slate-500 block">Early bird prepayments: ₹4.5 Lakhs</span>
                </div>
              </div>

              {/* Defaulters Call List Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Milestone 2 Defaulters Registry (Targeted Tele-caller List)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Parents receive automated push notifications + SMS payment links
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {feeDefaulters.map((defaulter) => (
                    <div key={defaulter.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{defaulter.student_name}</h4>
                            <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-mono">
                              {defaulter.class_name} • Roll #{defaulter.roll_no}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                            Parent: {defaulter.parent_name} ({defaulter.parent_phone}) • {defaulter.milestone_title}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-black text-red-600 dark:text-red-400 block">
                            ₹{defaulter.amount_due.toLocaleString()} Due
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {defaulter.days_overdue} Days Overdue
                          </span>
                        </div>

                        {defaulter.reminder_sent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Reminder Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendFeeReminder(defaulter.id, defaulter.student_name)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
                          >
                            <Send className="h-3 w-3" />
                            <span>Remind Parent</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 6: STAFF & VENDOR HUB                             */}
          {/* ===================================================== */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-teal-100 text-teal-800 px-2.5 py-0.5 text-xs font-bold border border-teal-200">
                      Human Resources &amp; Vendors
                    </span>
                    <span className="text-xs text-slate-500">52 Active Personnel</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Staff Directory, Teacher Leave Approvals &amp; Vendor Hub
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Approve teacher permissions, monitor daily attendance, manage monthly payroll, and track contractor duties.
                  </p>
                </div>
              </div>

              {/* Teacher Permissions / Leave Approvals Queue */}
              <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Teacher Leave &amp; Short-Permission Approval Queue
                    </h3>
                  </div>
                  <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold">
                    {teacherPermissions.filter(p => p.status === 'Pending').length} Pending Management Sign-Off
                  </span>
                </div>

                <div className="divide-y divide-amber-200/60 dark:divide-amber-900/60">
                  {teacherPermissions.map((req) => (
                    <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{req.teacher_name}</h4>
                          <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold border border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                            {req.type}
                          </span>
                          <span className="text-[10px] text-slate-500">{req.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                          &ldquo;{req.reason}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleReviewPermission(req.id, 'Approved')}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
                            >
                              <Check className="h-3 w-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewPermission(req.id, 'Rejected')}
                              className="inline-flex items-center gap-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl ${
                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {req.status === 'Approved' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Directory Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Personnel &amp; Vendor Directory ({staffMembers.length})
                  </span>
                  <div className="flex items-center gap-2">
                    {['All', 'Academics', 'Sports & Estate', 'Logistics', 'External Vendor'].map(dept => (
                      <button
                        key={dept}
                        onClick={() => setStaffRoleFilter(dept)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                          staffRoleFilter === dept
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {staffMembers
                    .filter(s => staffRoleFilter === 'All' || s.department === staffRoleFilter)
                    .map((staff) => (
                      <div key={staff.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold shrink-0">
                            {(staff.name || 'Staff Member').split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{staff.name}</h4>
                              <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[9px] font-bold">
                                {staff.role}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                              {staff.department} • {staff.phone} • {staff.assigned_duties || 'Campus Operations'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                            ₹{(staff.salary || 65000).toLocaleString()}/mo
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            (staff.status || 'Present') === 'Present' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${(staff.status || 'Present') === 'Present' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {staff.status || 'Present'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 7: INVENTORY & ASSET MANAGEMENT                  */}
          {/* ===================================================== */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 text-xs font-bold">
                      Institutional Assets
                    </span>
                    <span className="text-xs text-slate-500">Central Stores &amp; Lab Audits</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Inventory, Equipment &amp; Asset Management
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track stock counts across Books, Science Labs, Sports Gear, and IT hardware with reorder alerts.
                  </p>
                </div>
              </div>

              {/* Inventory Categories & Reorder Alert Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {['All', 'Books', 'Lab Equipment', 'IT Hardware', 'Sports Gear', 'Classroom'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setInventoryCategoryFilter(cat)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      inventoryCategoryFilter === cat
                        ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{cat}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {cat === 'All' 
                        ? inventoryItems.reduce((acc, i) => acc + (i.total_stock ?? (i as any).total_quantity ?? 0), 0) 
                        : inventoryItems.filter(i => i.category === cat).reduce((acc, i) => acc + (i.total_stock ?? (i as any).total_quantity ?? 0), 0)} Units
                    </span>
                  </button>
                ))}
              </div>

              {/* Inventory List */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Cataloged Asset Registry ({inventoryItems.length})
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Audited under ISO 9001 School Facilities Standards
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {inventoryItems
                    .filter(i => inventoryCategoryFilter === 'All' || i.category === inventoryCategoryFilter)
                    .map((item) => (
                      <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                              <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[9px] font-bold">
                                {item.category}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                              Location: {item.location || 'Main Store Room'} • Last Audited: {item.last_audited || 'Recent'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900 dark:text-white block">
                              {item.total_stock ?? (item as any).total_quantity ?? 0} Available / {item.issued_count ?? (item as any).issued_quantity ?? 0} Issued
                            </span>
                            {(item.damaged_count ?? (item as any).damaged_quantity ?? 0) > 0 && (
                              <span className="text-[10px] text-red-500 font-semibold block">
                                {item.damaged_count ?? (item as any).damaged_quantity} Under Repair
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setSelectedAsset(item);
                              setShowIssueAssetModal(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            Issue Asset
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 8: TRANSPARENT EVENT & VENDOR COMMAND CENTER     */}
          {/* ===================================================== */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              
              {/* Flagship Event Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 p-6 text-white shadow-xl relative overflow-hidden border border-purple-500/30">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <span className="rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 px-3 py-1 text-xs font-bold inline-block">
                    Flagship Institutional Event
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Annual Day 2026: Navarasa (Rhythms of Tomorrow)
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    24 Oct 2026 • 5:30 PM • Main Auditorium &amp; Open Air Amphitheatre. 400+ student performers, orchestra, and robotics exhibition.
                  </p>
                </div>
              </div>

              {/* Committee Hierarchy: Staff -> Student Volunteers Tree */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Staff &amp; Student Task Hierarchy (Committee Mapping)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Committee 1 */}
                  <div className="rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200">Mrs. Ananya Verma</span>
                      <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">Lead Faculty</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">Stage Coordination &amp; Choir</span>
                    <div className="pt-2 border-t border-purple-200 dark:border-purple-900">
                      <span className="text-[10px] font-bold text-purple-900 dark:text-purple-300 block mb-1">Student Volunteers Assigned:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-purple-200 dark:border-purple-900">Aarav Sharma</span>
                        <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-purple-200 dark:border-purple-900">Diya Patel</span>
                        <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-purple-200 dark:border-purple-900">Rohan Iyer</span>
                      </div>
                    </div>
                  </div>

                  {/* Committee 2 */}
                  <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-200">Mr. Vikram Joshi</span>
                      <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">Lead Faculty</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">Discipline &amp; VIP Logistics</span>
                    <div className="pt-2 border-t border-blue-200 dark:border-blue-900">
                      <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 block mb-1">Student Volunteers Assigned:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-blue-200 dark:border-blue-900">Kabir Mehta</span>
                        <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-blue-200 dark:border-blue-900">Vivaan Sen</span>
                      </div>
                    </div>
                  </div>

                  {/* Committee 3 */}
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Ms. Priya Sen</span>
                      <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">Lead Faculty</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">Costume Design &amp; Green Room</span>
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900">
                      <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-300 block mb-1">Student Volunteers Assigned:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-emerald-200 dark:border-emerald-900">Ananya Gupta</span>
                        <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-emerald-200 dark:border-emerald-900">Pooja Hegde</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Vendor Equipment & Handover Tracker */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Vendor Equipment &amp; Timestamped Handover Tracker
                </h3>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Digital P3.9 LED Backdrop Wall (40 x 20 ft)</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Vendor: Horizon AV Tech Solutions (+91 98765 43210)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
                        Delivered: 22 Oct, 09:30 AM
                      </span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold">
                        Delivered
                      </span>
                    </div>
                  </div>

                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Concert Sound System + 8 Wireless Shure Mics</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Vendor: AcousticPro Live Bangalore (+91 98765 43211)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
                        Delivered: 22 Oct, 11:15 AM
                      </span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold">
                        Delivered
                      </span>
                    </div>
                  </div>

                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">600 Velvet Banquet Chairs &amp; Canopies</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Vendor: Royal Events &amp; Tenting (+91 98765 43212)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900">
                        Scheduled Handover: 23 Oct, 2:00 PM
                      </span>
                      <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 px-2.5 py-0.5 text-[10px] font-bold">
                        Ordered
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 9: DEDICATED TASK MANAGEMENT                      */}
          {/* ===================================================== */}
          {activeTab === 'tasks' && (() => {
            const DOMAIN_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
              academic:   { label: 'Academic & Curriculum', color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800', icon: '📚' },
              exam:       { label: 'Examination Cell',      color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800', icon: '📝' },
              transport:  { label: 'Yellow Bus Fleet',      color: 'text-amber-700 dark:text-amber-300',   bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',   icon: '🚌' },
              inventory:  { label: 'Asset & Lab Store',     color: 'text-teal-700 dark:text-teal-300',     bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',       icon: '📦' },
              admissions: { label: 'Admissions & CRM',      color: 'text-sky-700 dark:text-sky-300',       bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',           icon: '🎓' },
              finance:    { label: 'Finance & Bursar',      color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', icon: '₹' },
              executive:  { label: 'Executive Mandates',    color: 'text-rose-700 dark:text-rose-300',     bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',       icon: '⚡' },
              campus_ops: { label: 'Campus Operations',     color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800', icon: '🏫' },
            };
            const PRIORITY_BADGE: Record<string, string> = {
              Critical: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
              High:     'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
              Medium:   'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
              Low:      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
            };
            const STATUS_BADGE: Record<string, string> = {
              'Pending':        'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
              'In Progress':    'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
              'Pending Review': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
              'Completed':      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
            };

            const filteredTasks = tasks.filter(t => {
              const domainMatch = taskDomainFilter === 'all' || t.domain === taskDomainFilter;
              const statusMatch = taskStatusFilter === 'all' || t.status === taskStatusFilter;
              return domainMatch && statusMatch;
            });

            const openCount   = tasks.filter(t => t.status !== 'Completed').length;
            const criticalCount = tasks.filter(t => t.is_escalated || t.priority === 'Critical').length;
            const overdueCount = tasks.filter(t => t.category === 'urgent' && t.status !== 'Completed').length;
            const autoCount   = tasks.filter(t => t.is_auto_generated).length;

            return (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                        Decentralized Operations Center
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">6 Coordinator Domains · SLA-Tracked</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      Institutional Task Operations Board
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Domain-scoped task delegation, SLA enforcement, auto-triggered operations and executive escalation.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Delegate New Task</span>
                  </button>
                </div>

                {/* ── Executive Cockpit KPIs ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Open Tasks',      value: openCount,    color: 'text-blue-700 dark:text-blue-300',    bg: 'bg-blue-50 dark:bg-blue-950/30',    icon: <ClipboardCheck className="h-4 w-4" /> },
                    { label: 'Escalated / Critical', value: criticalCount, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/30', icon: <AlertTriangle className="h-4 w-4" /> },
                    { label: 'Urgent Overdue',  value: overdueCount, color: 'text-amber-700 dark:text-amber-300',  bg: 'bg-amber-50 dark:bg-amber-950/30',  icon: <Clock className="h-4 w-4" /> },
                    { label: 'Auto-Triggered',  value: autoCount,    color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-950/30', icon: <Sparkles className="h-4 w-4" /> },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`rounded-2xl border border-slate-200 dark:border-slate-800 ${kpi.bg} p-4 flex items-center gap-3`}>
                      <span className={`${kpi.color}`}>{kpi.icon}</span>
                      <div>
                        <div className={`text-xl font-black ${kpi.color}`}>{kpi.value}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{kpi.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Department SLA Progress Strip ── */}
                {taskCockpit?.department_stats && taskCockpit.department_stats.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        Live Department Resolution &amp; SLA Compliance Rates
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Database Synced</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {taskCockpit.department_stats.map((dept: any) => {
                        const meta = DOMAIN_META[dept.domain];
                        const rate = dept.completion_rate_pct ?? 100;
                        return (
                          <div 
                            key={dept.domain} 
                            onClick={() => setTaskDomainFilter(dept.domain)}
                            className={`rounded-xl border p-2 cursor-pointer transition-all hover:scale-[1.02] ${
                              taskDomainFilter === dept.domain 
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500' 
                                : 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="truncate text-slate-800 dark:text-slate-200">{meta?.icon || '•'} {dept.domain.slice(0, 5).toUpperCase()}</span>
                              <span className={`text-[10px] font-black ${rate === 100 ? 'text-emerald-600 dark:text-emerald-400' : rate < 50 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {rate}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  rate === 100 ? 'bg-emerald-500' : rate < 50 ? 'bg-rose-500' : 'bg-amber-500'
                                }`} 
                                style={{ width: `${Math.max(5, rate)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                              <span>{dept.open_tasks} open</span>
                              <span>{dept.total_tasks} total</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Domain Filter Bar ── */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mr-1">Domain</span>
                  {['all', 'academic', 'exam', 'transport', 'inventory', 'admissions', 'finance', 'executive'].map(d => {
                    const meta = DOMAIN_META[d];
                    const active = taskDomainFilter === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setTaskDomainFilter(d)}
                        className={`rounded-full px-3 py-1 text-[10px] font-bold border transition-all cursor-pointer ${
                          active
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {d === 'all' ? 'All Domains' : `${meta?.icon} ${meta?.label}`}
                      </button>
                    );
                  })}
                  <div className="ml-auto flex items-center gap-2">
                    <select
                      value={taskStatusFilter}
                      onChange={e => setTaskStatusFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[11px] font-semibold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* ── Task Cards ── */}
                <div className="space-y-3">
                  {filteredTasks.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-10 text-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No tasks match this filter.</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Try a different domain or status filter.</p>
                    </div>
                  )}
                  {filteredTasks.map((task) => {
                    const meta = DOMAIN_META[task.domain as string] || DOMAIN_META['executive'];
                    const isExpanded = taskExpandedId === task.id;
                    const priorityClass = PRIORITY_BADGE[task.priority as string] || PRIORITY_BADGE['Low'];
                    const statusClass = STATUS_BADGE[task.status as string] || STATUS_BADGE['Pending'];
                    return (
                      <div
                        key={task.id}
                        className={`rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all overflow-hidden ${
                          task.is_escalated
                            ? 'border-rose-300 dark:border-rose-700 ring-1 ring-rose-200 dark:ring-rose-900'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Card Top Row */}
                        <div
                          className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                          onClick={() => setTaskExpandedId(isExpanded ? null : task.id)}
                        >
                          {/* Domain Icon Badge */}
                          <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black ${meta.bg}`}>
                            {meta.icon}
                          </div>

                          {/* Main Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}>
                                {meta.label}
                              </span>
                              {task.is_auto_generated && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                                  ⚡ Auto-Triggered
                                </span>
                              )}
                              {task.is_escalated && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
                                  🔺 ESCALATED
                                </span>
                              )}
                            </div>
                            <p className={`text-xs font-bold ${ task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white' }`}>
                              {task.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                              <span>👤 {task.assigned_to}</span>
                              <span>•</span>
                              <span>🕐 {task.due_date}</span>
                              {task.sla_hours && <><span>•</span><span>SLA {task.sla_hours}h</span></>}
                              {task.created_by_name && <><span>•</span><span>By {task.created_by_name}</span></>}
                            </div>
                          </div>

                          {/* Right: Status + Priority */}
                          <div className="shrink-0 flex flex-col items-end gap-1.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusClass}`}>
                              {task.status}
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${priorityClass}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Detail Panel */}
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3 bg-slate-50/60 dark:bg-slate-800/20">
                            {task.description && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{task.description}</p>
                            )}
                            {task.escalation_reason && (
                              <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-3 py-2">
                                <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300">🔺 Escalation Reason: {task.escalation_reason}</p>
                              </div>
                            )}

                            {/* Action Buttons Row */}
                            <div className="flex flex-wrap gap-2">
                              {['Pending','In Progress','Pending Review','Completed'].map(s => (
                                <button
                                  key={s}
                                  onClick={() => handleUpdateTaskStatus(task.id, s)}
                                  disabled={task.status === s}
                                  className={`rounded-xl px-3 py-1.5 text-[10px] font-bold border transition-all cursor-pointer ${
                                    task.status === s
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                              {!task.is_escalated && (
                                <button
                                  onClick={() => { setEscalateTaskId(task.id); setEscalateReason(''); }}
                                  className="rounded-xl px-3 py-1.5 text-[10px] font-bold border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-all cursor-pointer ml-auto"
                                >
                                  🔺 Escalate to Principal
                                </button>
                              )}
                            </div>

                            {/* Inline Escalation Form */}
                            {escalateTaskId === task.id && (
                              <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 p-3 space-y-2">
                                <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300">Enter escalation reason:</p>
                                <textarea
                                  rows={2}
                                  value={escalateReason}
                                  onChange={e => setEscalateReason(e.target.value)}
                                  placeholder="e.g. Vendor threatens to pull out 48 hrs before Annual Day..."
                                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-[11px] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setEscalateTaskId(null)} className="text-[10px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer">Cancel</button>
                                  <button onClick={() => handleEscalateTask(task.id)} className="text-[10px] px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer">Confirm Escalation</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ===================================================== */}
          {/* TAB 8: SUBSTITUTION & TIMETABLE COVERAGE ENGINE        */}
          {/* ===================================================== */}
          {activeTab === 'substitutions' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 px-2.5 py-0.5 text-xs font-bold border border-violet-200 dark:border-violet-800">
                      Faculty &amp; Academics
                    </span>
                    <span className="text-xs text-slate-500">Live Period Coverage Matrix</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Timetable Substitution &amp; Proxy Allocation Engine
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time detection of unmanned periods caused by faculty leaves, paired with 1-click proxy matching (Toddle &amp; Teachmint standard).
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleAutoResolveSubstitutions}
                    disabled={unassignedSubCount === 0}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer ${
                      unassignedSubCount === 0
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Auto-Resolve Free Faculty Matrix</span>
                  </button>
                </div>
              </div>

              {/* Status Metric Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Uncovered Gaps</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      unassignedSubCount > 0 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {unassignedSubCount > 0 ? 'Urgent Action' : 'All Covered'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {unassignedSubCount} <span className="text-xs font-normal text-slate-500">periods unmanned</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Proxy Covered</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Confirmed
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {substitutions.filter(s => s.status === 'Assigned').length} <span className="text-xs font-normal text-slate-500">slots protected</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">On-Duty Free Faculty</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Available Today
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {availableFaculty.length} <span className="text-xs font-normal text-slate-500">teachers ready</span>
                  </div>
                </div>
              </div>

              {/* Main Content Grid: Substitution Table + Free Faculty Roster */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Substitution Slots Column */}
                <div className="xl:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Today&apos;s Affected Timetable Periods ({substitutions.length})
                    </h3>
                    <span className="text-[11px] text-slate-400">Classrooms monitored live</span>
                  </div>

                  <div className="space-y-3">
                    {substitutions.map((slot) => (
                      <div 
                        key={slot.id}
                        className={`rounded-2xl border p-4 transition-all bg-white dark:bg-slate-900 shadow-sm ${
                          slot.status === 'Unassigned'
                            ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/10 dark:bg-rose-950/10'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs ${
                              slot.status === 'Unassigned'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              P{slot.period_number}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {slot.class_name} • {slot.subject}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  slot.status === 'Unassigned'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                  {slot.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                <Clock className="h-3 w-3" />
                                <span>{slot.time_slot}</span>
                                <span>•</span>
                                <span>Absent: <b className="text-slate-700 dark:text-slate-300">{slot.absent_teacher_name}</b> ({slot.absent_reason || slot.reason || 'On Leave'})</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {slot.status === 'Assigned' ? (
                              <div className="text-right">
                                <span className="text-[11px] text-slate-500 block">Proxy Assigned:</span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  ✓ {slot.substitute_teacher_name || slot.assigned_substitute_name}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedSubSlot(slot);
                                  setChosenFacultyId(slot.substitute_teacher_id || availableFaculty[0]?.id || null);
                                  setShowSubModal(true);
                                }}
                                className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                                <span>Assign Proxy</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {slot.notes && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                            <b>Notes:</b> {slot.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Free Faculty Standby Roster */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Standby Free Faculty ({availableFaculty.length})
                    </h3>
                    <span className="text-[11px] text-blue-500 font-semibold">Zero conflict verified</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm">
                    {availableFaculty.map((fac) => (
                      <div key={fac.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{fac.name}</h4>
                          <span className="text-[11px] text-slate-500 block">{fac.department} • {fac.free_periods_today} periods free</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Status: {fac.current_status}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          Ready
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 9: REGULATORY & SECURITY AUDIT LEDGER             */}
          {/* ===================================================== */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 px-2.5 py-0.5 text-xs font-bold border border-slate-200 dark:border-slate-700">
                      Regulatory &amp; Legal
                    </span>
                    <span className="text-xs text-slate-500">Immutable Compliance Log</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Security &amp; Regulatory Compliance Audit Ledger
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cryptographically stamped audit trail tracking SIS document seals, permissions, financial receipts, and administrative changes (Veracross &amp; PowerSchool standard).
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleExportAuditLogs}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Tamper-Proof Audit (SHA-256)</span>
                  </button>
                </div>
              </div>

              {/* Search & Category Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by actor, action, IP, or entity context..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Category:</span>
                  <select
                    value={auditFilter}
                    onChange={(e) => setAuditFilter(e.target.value)}
                    className="rounded-xl px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Categories ({auditLogs.length})</option>
                    <option value="Document Control">Document Control</option>
                    <option value="Financial">Financial / Fees</option>
                    <option value="Faculty Permission">Faculty Permission</option>
                    <option value="Timetable">Timetable &amp; Proxy</option>
                    <option value="Academic Policy">Academic Rollover</option>
                    <option value="Identity & Access">Identity &amp; Access</option>
                  </select>
                </div>
              </div>

              {/* Audit Ledger List */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Live Verified Event Stream ({filteredAuditLogs.length} events)
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Ledger Integrity Validated
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredAuditLogs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No audit records match your query.
                    </div>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {log.action_type || log.category || 'Audit'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              log.status === 'SUCCESS' || log.status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {log.status}
                            </span>
                          </div>

                          <div className="font-mono text-[10px] text-slate-400">
                            Seal: <span className="text-slate-600 dark:text-slate-300">{log.hash_seal || 'SHA256:VERIFIED'}</span>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{log.action_type || log.action}</span>
                              <span className="text-[11px] font-normal text-slate-500">➔ {log.target_entity || log.entity}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{log.details}</p>
                          </div>

                          <div className="text-right sm:shrink-0 text-[11px] text-slate-500">
                            <div>Actor: <b className="text-slate-700 dark:text-slate-300">{log.actor_name || log.actor}</b> ({log.actor_role})</div>
                            <span className="font-mono text-[10px] text-slate-400">IP: {log.ip_address}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 10: ANNUAL ACADEMIC ROLLOVER & STUDENT PROMOTION */}
          {/* ===================================================== */}
          {activeTab === 'rollover' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 text-xs font-bold border border-amber-200 dark:border-amber-800">
                      Academic Year Lifecycle
                    </span>
                    <span className="text-xs text-slate-500">Annual Transition Engine</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Annual Academic Rollover &amp; Student Promotion Pipeline
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Graduation and tier progression matrix: graduate students to the next academic grade, allocate target sections, and lock previous year records (PowerSchool &amp; Alma benchmark).
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cycle Transition</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">AY 2026–27 ➔ AY 2027–28</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-amber-500" />
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Active Classes</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{rolloverClasses.length}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Cohort sections</span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Auto-Promotion Ready</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {rolloverClasses.reduce((acc, c) => acc + c.eligible_for_promotion, 0)}
                  </span>
                  <span className="text-[10px] text-emerald-600/70 block mt-0.5">Met academic threshold</span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">Retention / Review</span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {rolloverClasses.reduce((acc, c) => acc + c.retention_review, 0)}
                  </span>
                  <span className="text-[10px] text-amber-600/70 block mt-0.5">Academic / Attendance flags</span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">Pending Rollovers</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{pendingRolloverCount}</span>
                  <span className="text-[10px] text-blue-600/70 block mt-0.5">Awaiting Administrator seal</span>
                </div>
              </div>

              {/* Class Promotion Cards Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Class Cohort Progression Pipeline
                  </h3>
                  <span className="text-[11px] text-slate-400">Select a class to execute progression</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rolloverClasses.map((cls) => (
                    <div 
                      key={cls.class_id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm hover:border-amber-400/60 dark:hover:border-amber-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-extrabold text-sm">
                            {cls.from_class}
                          </span>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-sm">
                            {cls.to_class}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          cls.status === 'Rolled Over'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {cls.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Enrolled</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{cls.total_students}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-600 uppercase font-semibold block">Eligible</span>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{cls.eligible_for_promotion}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-600 uppercase font-semibold block">Under Review</span>
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{cls.retention_review}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Target Class Teacher: <b className="text-slate-700 dark:text-slate-300">{cls.target_class_teacher || 'Senior Faculty Coordinator'}</b>
                        </span>
                        {cls.status === 'Rolled Over' ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Archived &amp; Sealed
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedRolloverClass(cls);
                              setShowRolloverModal(true);
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
                          >
                            <span>Execute Rollover</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* MODAL 1: UPLOAD OFFICIAL SIS DOCUMENT                 */}
          {/* ===================================================== */}
          {showDocModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload Official SIS Document</h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Strict Document Control Clearance</span>
                    </div>
                  </div>
                  <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleUploadDocument} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Certificate Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Migration Certificate 2026"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Document Type
                    </label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Bonafide">Bonafide Certificate</option>
                      <option value="Transfer Certificate">Transfer Certificate (TC)</option>
                      <option value="Marks Card">Marks Card / Report Memo</option>
                      <option value="Birth Certificate">Birth Certificate</option>
                      <option value="Medical Fitness">Medical Fitness Certificate</option>
                    </select>
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">Audit Security Protocol:</span>
                    <p className="leading-relaxed">
                      This document will be automatically stamped with <b>SHA-256 seal &ldquo;EDU360 Official Seal - Reg #9921&rdquo;</b> and locked into Aarav Sharma&apos;s SIS vault.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowDocModal(false)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm cursor-pointer"
                    >
                      Seal &amp; Lock into Vault
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* MODAL 2: ASSIGN OPERATIONAL TASK                      */}
          {/* ===================================================== */}
          {showTaskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assign Operational Task</h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Institutional Delegation Engine</span>
                    </div>
                  </div>
                  <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
                    <input
                      type="text" required
                      placeholder="e.g. Audit Lab Inventory for Pre-Board Practicals"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Instructions</label>
                    <textarea
                      rows={2}
                      placeholder="Brief context, dependencies, or action steps..."
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Domain + Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department Domain *</label>
                      <select
                        value={newTaskDomain}
                        onChange={(e) => setNewTaskDomain(e.target.value as TaskDomain)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="academic">📚 Academic & Curriculum</option>
                        <option value="exam">📝 Examination Cell</option>
                        <option value="transport">🚌 Yellow Bus Fleet</option>
                        <option value="inventory">📦 Asset & Lab Store</option>
                        <option value="admissions">🎓 Admissions & CRM</option>
                        <option value="finance">₹ Finance & Bursar</option>
                        <option value="executive">⚡ Executive Mandates</option>
                        <option value="campus_ops">🏫 Campus Operations</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                      <select
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="urgent">Urgent (Today/Tomorrow)</option>
                        <option value="upcoming">Upcoming Operational</option>
                      </select>
                    </div>
                  </div>

                  {/* Coordinator + Priority */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign To Coordinator *</label>
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Dr. Ananya Krishnan">Dr. Ananya Krishnan — Academic</option>
                        <option value="Ms. Rekha Iyer">Ms. Rekha Iyer — Exam Cell</option>
                        <option value="Mr. Suresh Pillai">Mr. Suresh Pillai — Transport</option>
                        <option value="Mr. Vikram Rao">Mr. Vikram Rao — Inventory</option>
                        <option value="Ms. Priya Nair">Ms. Priya Nair — Admissions</option>
                        <option value="Mrs. Lakshmi Narayan">Mrs. Lakshmi Narayan — Finance</option>
                        <option value="Principal Sharma">Principal Sharma — Executive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Critical">🔴 Critical</option>
                        <option value="High">🟠 High</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="Low">⚪ Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Deadline + SLA */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                      <input
                        type="text" required
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        placeholder="e.g. Today, 5:00 PM"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">SLA Hours</label>
                      <input
                        type="number" min={1} max={720}
                        value={newTaskSlaHours}
                        onChange={(e) => setNewTaskSlaHours(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={() => setShowTaskModal(false)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >Cancel</button>
                    <button type="submit"
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm cursor-pointer"
                    >Delegate Task</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* MODAL 3: QUICK ISSUE ASSET                            */}
          {/* ===================================================== */}
          {showIssueAssetModal && selectedAsset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Issue Inventory Asset</h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{selectedAsset.name}</span>
                    </div>
                  </div>
                  <button onClick={() => setShowIssueAssetModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleIssueAsset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient (Faculty / Department / Student)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. K. Raman (Physics Lab 2)"
                      value={issueToRecipient}
                      onChange={(e) => setIssueToRecipient(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Quantity to Issue (Available: {selectedAsset.total_stock})
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={selectedAsset.total_stock}
                      value={issueQty}
                      onChange={(e) => setIssueQty(parseInt(e.target.value) || 1)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowIssueAssetModal(false)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm cursor-pointer"
                    >
                      Confirm Issue
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* MODAL 4: ASSIGN PROXY FACULTY (SUBSTITUTION)          */}
          {/* ===================================================== */}
          {showSubModal && selectedSubSlot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold">
                      <Shuffle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assign Proxy Faculty</h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {selectedSubSlot.class_name} • {selectedSubSlot.subject} (Period {selectedSubSlot.period_number})
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleAssignSubstitution} className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Absent Teacher:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedSubSlot.absent_teacher_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Leave Reason:</span>
                      <span className="text-rose-600 font-semibold">{selectedSubSlot.absent_reason || selectedSubSlot.reason || 'Medical / Personal Leave'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Period Slot:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedSubSlot.time_slot}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Select Available Proxy Faculty
                    </label>
                    <select
                      value={chosenFacultyId || ''}
                      onChange={(e) => setChosenFacultyId(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {availableFaculty.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.department}) — {f.free_periods_today} periods free
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Classroom Handover Notes / Lesson Plan
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Conduct Exercise 4.2 revision questions from textbook page 78"
                      value={subNotes}
                      onChange={(e) => setSubNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowSubModal(false)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-xs font-bold shadow-sm cursor-pointer"
                    >
                      Confirm Proxy Assignment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* MODAL 5: EXECUTE ACADEMIC ROLLOVER PROMOTION         */}
          {/* ===================================================== */}
          {showRolloverModal && selectedRolloverClass && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Execute Academic Rollover</h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {selectedRolloverClass.from_class} ➔ {selectedRolloverClass.to_class}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setShowRolloverModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3.5 text-xs space-y-2">
                    <span className="font-bold text-amber-900 dark:text-amber-300 block">
                      Promotion Impact Summary:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300/90 text-[11px]">
                      <li><b>{selectedRolloverClass.eligible_for_promotion}</b> students will be promoted to {selectedRolloverClass.to_class}.</li>
                      <li><b>{selectedRolloverClass.retention_review}</b> students flagged for academic / attendance retention review.</li>
                      <li>Assigned Class Teacher: <b>{selectedRolloverClass.target_class_teacher || 'Senior Faculty Coordinator'}</b>.</li>
                      <li>Historical 2026–27 transcripts will be archived with SHA-256 seal.</li>
                    </ul>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Are you sure you want to execute this cohort rollover? This administrative action is logged to the regulatory compliance ledger.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowRolloverModal(false)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteRollover}
                      className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 text-xs font-bold shadow-sm cursor-pointer"
                    >
                      Confirm Class Rollover
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </RoleGuard>
  );
}
