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
  ArrowLeft,
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
import { downloadOfficialDocumentFile } from '@/lib/export-utils';
import { 
  TriageAlert, 
  AdminTask, 
  AdmissionEnquiry, 
  OfficialDocument, 
  ExitClearance, 
  StaffMemberItem,
  Student,
  ReExamRequestItem,
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
import { AdminCockpit } from '@/components/admin-cockpit';

type AdminTab = 
  | 'cockpit'
  | 'triage' 
  | 'tasks'
  | 'crm' 
  | 'sis' 
  | 'substitutions'
  | 'staff' 
  | 'permissions'
  | 'payroll'
  | 'fees' 
  | 'events'
  | 'exams'
  | 'exit' 
  | 'rollover';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('cockpit');
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
  const [reassignTaskId, setReassignTaskId] = useState<number | null>(null);
  const [reassignPeer, setReassignPeer] = useState<string>('Mrs. Neha Roy');
  const [resolveEscalateTaskId, setResolveEscalateTaskId] = useState<number | null>(null);
  const [resolveEscalateNotes, setResolveEscalateNotes] = useState<string>('');

  const [showIssueAssetModal, setShowIssueAssetModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<InventoryRecord | null>(null);
  const [issueToRecipient, setIssueToRecipient] = useState('');
  const [issueQty, setIssueQty] = useState(1);

  // Student Directory & Clarified SIS State
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [selectedStudentForSIS, setSelectedStudentForSIS] = useState<Student | null>(null);
  const [studentClassFilter, setStudentClassFilter] = useState('All');
  const [studentSectionFilter, setStudentSectionFilter] = useState('All');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [sisActiveSubTab, setSisActiveSubTab] = useState<'profile' | 'academic' | 'certificates' | 'fees'>('profile');

  // Staff Directory Search & Modal State
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [selectedStaffForModal, setSelectedStaffForModal] = useState<StaffMemberItem | null>(null);

  // Exams & Re-Exam Requests State
  const [examSubTab, setExamSubTab] = useState<'upcoming' | 'overdue' | 'reexam'>('upcoming');
  const [reExamRequests, setReExamRequests] = useState<ReExamRequestItem[]>([]);
  const [selectedReExamModal, setSelectedReExamModal] = useState<ReExamRequestItem | null>(null);
  const [reExamAdminRemarks, setReExamAdminRemarks] = useState('');

  // Fee Collections Sub-tab State
  const [feeSubTab, setFeeSubTab] = useState<'today' | 'aging' | 'milestones'>('today');

  // Convert to SIS Modal State (Admissions CRM)
  const [convertModalEnquiry, setConvertModalEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [convertSection, setConvertSection] = useState('A');
  const [convertAdmissionFee, setConvertAdmissionFee] = useState(25000);
  const [convertFeeStatus, setConvertFeeStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [convertPaymentMethod, setConvertPaymentMethod] = useState('UPI (Google Pay)');

  // School Events State & Modal
  const [schoolEvents, setSchoolEvents] = useState<any[]>([
    {
      id: 1,
      title: 'Annual Day 2026: Navarasa (Rhythms of Tomorrow)',
      date: '24 Oct 2026 • 5:30 PM',
      location: 'Main Auditorium & Open Air Amphitheatre',
      description: 'Our flagship cultural showcase featuring 400+ student performers, orchestra, and robotics exhibition.',
      category: 'Cultural',
      target_audience: 'All School (Parents, Students, Staff)',
      status: 'Active Preparation'
    },
    {
      id: 2,
      title: 'Inter-School STEM & Robotics Expo',
      date: '12 Nov 2026 • 09:30 AM',
      location: 'STEM Labs & Indoor Sports Complex',
      description: 'Annual inter-school competitive science and coding exhibition with 15 participating schools.',
      category: 'Academic',
      target_audience: 'All School (Parents, Students, Staff)',
      status: 'Upcoming'
    }
  ]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('Academic');
  const [newEventDate, setNewEventDate] = useState('15 Nov 2026');
  const [newEventTime, setNewEventTime] = useState('09:30 AM');
  const [newEventLocation, setNewEventLocation] = useState('Main Auditorium');
  const [newEventAudience, setNewEventAudience] = useState('All School');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Filter State
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [staffRoleFilter, setStaffRoleFilter] = useState('All');
  const [permFilter, setPermFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [alertFilter, setAlertFilter] = useState<'all' | 'urgent' | 'pacing'>('all');
  const [taskOriginFilter, setTaskOriginFilter] = useState<'all' | 'auto' | 'staff' | 'critical' | 'relief'>('all');
  const [examClassFilter, setExamClassFilter] = useState('All');

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
        const results = await Promise.allSettled([
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
          api.getRemedialAdminOverview(),
          api.getStudents(),
          api.getReExamRequests()
        ]);

        if (results[0].status === 'fulfilled') setTriageAlerts(results[0].value);
        if (results[1].status === 'fulfilled') setTasks(results[1].value);
        if (results[2].status === 'fulfilled') setEnquiries(results[2].value);
        if (results[3].status === 'fulfilled') setDocuments(results[3].value);
        if (results[4].status === 'fulfilled') setExitClearances(results[4].value);
        if (results[5].status === 'fulfilled') setStaffMembers(results[5].value);
        if (results[6].status === 'fulfilled') setTeacherPermissions(results[6].value);
        if (results[7].status === 'fulfilled') setInventoryItems(results[7].value);
        if (results[8].status === 'fulfilled') setFeeDefaulters(results[8].value);
        if (results[9].status === 'fulfilled') setSubstitutions(results[9].value);
        if (results[10].status === 'fulfilled') setAvailableFaculty(results[10].value);
        if (results[11].status === 'fulfilled') setAuditLogs(results[11].value);
        if (results[12].status === 'fulfilled') setFeeAnalytics(results[12].value);
        if (results[13].status === 'fulfilled') setRolloverClasses(results[13].value);
        if (results[14].status === 'fulfilled') setTaskCockpit(results[14].value);
        if (results[15].status === 'fulfilled' && results[15].value) setRemedialOverview(results[15].value);
        if (results[16] && results[16].status === 'fulfilled') setStudentsList(results[16].value as Student[]);
        if (results[17] && results[17].status === 'fulfilled') setReExamRequests(results[17].value as ReExamRequestItem[]);
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

  const handleApproveRelief = async (task: AdminTask, targetPeer?: string) => {
    const peer = targetPeer || task.suggested_peer_teacher || 'Mrs. Neha Roy';
    try {
      await api.approveTaskRelief(task.id, {
        new_assigned_to: peer,
        new_sla_hours: 48,
        notes: `Academic Coordinator approved migration to ${peer}`
      });
      const [updated, cockpit] = await Promise.all([
        api.getAdminTasks(taskDomainFilter !== 'all' ? taskDomainFilter : undefined, taskStatusFilter !== 'all' ? taskStatusFilter : undefined),
        api.getTaskExecutiveCockpit()
      ]);
      setTasks(updated);
      setTaskCockpit(cockpit);
      setReassignTaskId(null);
      triggerToast(`Relief approved! Task migrated to ${peer} with fresh 48h SLA.`);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to approve relief');
    }
  };

  const handleExtendSla = async (taskId: number) => {
    try {
      await api.extendTaskSla(taskId, {
        additional_hours: 24,
        extension_reason: 'Coordinator granted +24h extension for faculty workload relief'
      });
      const [updated, cockpit] = await Promise.all([
        api.getAdminTasks(taskDomainFilter !== 'all' ? taskDomainFilter : undefined, taskStatusFilter !== 'all' ? taskStatusFilter : undefined),
        api.getTaskExecutiveCockpit()
      ]);
      setTasks(updated);
      setTaskCockpit(cockpit);
      triggerToast('Granted +24h SLA extension. Assignee notified.');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to extend SLA');
    }
  };

  const handleResolveEscalation = async (taskId: number) => {
    if (!resolveEscalateNotes.trim()) {
      triggerToast('Please provide a brief resolution note.');
      return;
    }
    try {
      await api.resolveTaskEscalation(taskId, resolveEscalateNotes.trim());
      const [updated, cockpit] = await Promise.all([
        api.getAdminTasks(taskDomainFilter !== 'all' ? taskDomainFilter : undefined, taskStatusFilter !== 'all' ? taskStatusFilter : undefined),
        api.getTaskExecutiveCockpit()
      ]);
      setTasks(updated);
      setTaskCockpit(cockpit);
      setResolveEscalateTaskId(null);
      setResolveEscalateNotes('');
      triggerToast('Escalation resolved! Task restored to standard queue.');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to resolve escalation');
    }
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

              {/* Executive Cockpit */}
              <button
                onClick={() => { setActiveTab('cockpit'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'cockpit'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
                }`}
                title="Principal Dashboard"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
                  {!sidebarCollapsed && <span className="truncate">Principal Dashboard</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white">
                    Live
                  </span>
                )}
              </button>

              {/* Priority Triage */}
              <button
                onClick={() => { setActiveTab('triage'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'triage'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Action Alerts"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${urgentTriageCount > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                  <AlertCircle className={`h-4 w-4 shrink-0 ${activeTab === 'triage' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Action Alerts</span>}
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
                title="School Tasks"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckSquare className={`h-4 w-4 shrink-0 ${activeTab === 'tasks' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">School Tasks</span>}
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
                title="New Admissions"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserPlus className={`h-4 w-4 shrink-0 ${activeTab === 'crm' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">New Admissions</span>}
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
                title="Student Directory (SIS)"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Lock className={`h-4 w-4 shrink-0 ${activeTab === 'sis' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Student Directory</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    Roster
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 2: FACULTY & ACADEMIC GOVERNANCE */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Teachers &amp; Academics
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
                title="Teacher Absences & Class Cover"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Shuffle className={`h-4 w-4 shrink-0 ${activeTab === 'substitutions' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Teacher Cover</span>}
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

              {/* Faculty Directory */}
              <button
                onClick={() => { setActiveTab('staff'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Teacher &amp; Staff Directory"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Users className={`h-4 w-4 shrink-0 ${activeTab === 'staff' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Staff Directory</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {staffMembers.length}
                  </span>
                )}
              </button>

              {/* Faculty Permissions & Shifts */}
              <button
                onClick={() => { setActiveTab('permissions'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'permissions'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Teacher Leaves &amp; Permissions"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock className={`h-4 w-4 shrink-0 ${activeTab === 'permissions' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Teacher Leaves</span>}
                </div>
                {!sidebarCollapsed && pendingPermissionCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    {pendingPermissionCount} Req
                  </span>
                )}
              </button>

              {/* Examination Center */}
              <button
                onClick={() => { setActiveTab('exams'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'exams'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Exams &amp; Timetables"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <BookOpen className={`h-4 w-4 shrink-0 ${activeTab === 'exams' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Exams</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60">
                    Term-2
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
                title="Class Promotion &amp; Rollover"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <TrendingUp className={`h-4 w-4 shrink-0 ${activeTab === 'rollover' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Class Promotion</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    Annual
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 3: FINANCE & OPERATIONS */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Finance &amp; Operations
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
                title="Fee Collections &amp; Pending Dues"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className={`h-4 w-4 shrink-0 ${activeTab === 'fees' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Fee Collections</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    {overdueDefaultersCount} Due
                  </span>
                )}
              </button>

              {/* Staff Payroll & Compensation */}
              <button
                onClick={() => { setActiveTab('payroll'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'payroll'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="Staff Salaries &amp; Payroll"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Receipt className={`h-4 w-4 shrink-0 ${activeTab === 'payroll' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Staff Salaries</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    Monthly
                  </span>
                )}
              </button>

              {/* School Event Center */}
              <button
                onClick={() => { setActiveTab('events'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'events'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
                title="School Events &amp; Activities"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className={`h-4 w-4 shrink-0 ${activeTab === 'events' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">School Events</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    Active
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 4: REGULATORY & LEGAL */}
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
                title="Student TC &amp; Clearances"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GraduationCap className={`h-4 w-4 shrink-0 ${activeTab === 'exit' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Student TC</span>}
                </div>
                {!sidebarCollapsed && pendingExitCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    {pendingExitCount} Pending
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
                {activeTab !== 'cockpit' && (
          /* ===================================================== */
          /* ISOLATED MODULE HEADER (CLEAN, NO REDUNDANT DASHBOARD) */
          /* ===================================================== */
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                  {activeTab === 'crm' ? 'Admissions & Inquiries'
                    : activeTab === 'sis' ? 'Student Directory & Records (SIS)'
                    : activeTab === 'triage' ? "Today's Action Alerts"
                    : activeTab === 'substitutions' ? 'Teacher Attendance & Class Cover'
                    : activeTab === 'fees' ? 'Fee Collections & Pending Dues'
                    : activeTab === 'staff' ? 'Teacher & Staff Directory'
                    : activeTab === 'permissions' ? 'Teacher Leaves & Permissions'
                    : activeTab === 'payroll' ? 'Staff Salaries & Payroll'
                    : activeTab === 'tasks' ? 'School Tasks & Delegations'
                    : activeTab === 'exit' ? 'Student TC & Leaving Certificates'
                    : activeTab === 'rollover' ? 'Class Promotion & Rollover'
                    : activeTab === 'exams' ? 'Exams & Timetables'
                    : 'School Events & Activities'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                  {activeTab === 'crm' ? <UserPlus className="h-5 w-5" />
                    : activeTab === 'sis' ? <GraduationCap className="h-5 w-5" />
                    : activeTab === 'triage' ? <AlertCircle className="h-5 w-5" />
                    : activeTab === 'substitutions' ? <Shuffle className="h-5 w-5" />
                    : activeTab === 'fees' ? <CreditCard className="h-5 w-5" />
                    : activeTab === 'staff' ? <Users className="h-5 w-5" />
                    : activeTab === 'permissions' ? <Clock className="h-5 w-5" />
                    : activeTab === 'payroll' ? <Receipt className="h-5 w-5" />
                    : activeTab === 'tasks' ? <CheckSquare className="h-5 w-5" />
                    : activeTab === 'exit' ? <GraduationCap className="h-5 w-5" />
                    : activeTab === 'rollover' ? <TrendingUp className="h-5 w-5" />
                    : activeTab === 'exams' ? <BookOpen className="h-5 w-5" />
                    : <Sparkles className="h-5 w-5" />}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {activeTab === 'crm' ? 'New Student Admissions & Inquiries'
                      : activeTab === 'sis' ? 'Student Directory & Information System (SIS)'
                      : activeTab === 'triage' ? "Today's School Action Alerts"
                      : activeTab === 'substitutions' ? 'Teacher Absences & Class Substitution'
                      : activeTab === 'fees' ? 'Fee Collections & Pending Dues'
                      : activeTab === 'staff' ? 'Teacher & Staff Directory'
                      : activeTab === 'permissions' ? 'Teacher Leave & Permission Requests'
                      : activeTab === 'payroll' ? 'Staff Salaries & Monthly Compensation'
                      : activeTab === 'tasks' ? 'School Tasks & Staff Assignments'
                      : activeTab === 'exit' ? 'Student Transfer Certificates (TC) & Clearances'
                      : activeTab === 'rollover' ? 'Annual Class Promotion & Academic Year Rollover'
                      : activeTab === 'exams' ? 'Examinations & Class Timetables'
                      : 'School Events & Activities'}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeTab === 'crm' ? 'Track prospective student inquiries, counseling stages, and enroll candidates into classes'
                      : activeTab === 'sis' ? 'Complete student roster, class and section filters, 360° student records, and certificates'
                      : activeTab === 'triage' ? 'Immediate school action items requiring principal attention across attendance, fees, and operations'
                      : activeTab === 'substitutions' ? 'Daily teacher absences, substitute teacher assignments, and period coverage'
                      : activeTab === 'fees' ? 'Student fee collection tracking, pending fee installments, and concession requests'
                      : activeTab === 'staff' ? 'Manage teacher profiles, department duties, contact info, and daily attendance'
                      : activeTab === 'permissions' ? 'Review teacher leave applications, half-day permissions, and substitute teacher cover'
                      : activeTab === 'payroll' ? 'Monthly salary disbursements, bank statements, statutory deductions, and digital pay slips'
                      : activeTab === 'tasks' ? 'Delegate administrative and campus tasks to coordinators and track completion'
                      : activeTab === 'exit' ? 'Issue verified transfer certificates (TC), check departmental dues, and complete exit files'
                      : activeTab === 'rollover' ? 'Batch promotion of student classes into the new academic year'
                      : activeTab === 'exams' ? 'Term exam timetables, room seating plans, invigilator assignments, and hall passes'
                      : 'Annual Day celebrations, sports day, science exhibitions, and student committees'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action in Header (NO Dashboard Button) */}
            <div className="flex items-center gap-2 shrink-0">

              {activeTab === 'tasks' && (
                <button
                  type="button"
                  onClick={() => setShowTaskModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Assign Task</span>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cockpit' && (
            <AdminCockpit onNavigateTab={(tab: string) => setActiveTab(tab as AdminTab)} />
          )}

          {activeTab === 'triage' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Filter Tabs for Action Alerts */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mr-1 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    Alert Type:
                  </span>
                  {[
                    { id: 'all', label: 'All Alerts', count: triageAlerts.filter(a => !a.resolved).length + (remedialOverview?.early_warning_pacing_triage.length || 0) },
                    { id: 'urgent', label: '🔴 Urgent School Alerts', count: triageAlerts.filter(a => !a.resolved).length },
                    { id: 'pacing', label: '🟠 Remedial Inactivity', count: remedialOverview?.early_warning_pacing_triage.length || 0 },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAlertFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        alertFilter === tab.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        alertFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Auto-detected exceptions requiring administrative intervention
                </div>
              </div>

              {/* SECTION A: Remedial Pacing Early Warnings (Orange Alert Cards) */}
              {(alertFilter === 'all' || alertFilter === 'pacing') && remedialOverview && remedialOverview.early_warning_pacing_triage.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-900/40 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-orange-800 dark:text-orange-300">
                        🟠 Remedial Pacing Warnings: Students Inactive for 2+ Days
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500">Requires Class Teacher Contact</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {remedialOverview.early_warning_pacing_triage.map((warn) => (
                      <div
                        key={warn.student_id}
                        className="rounded-2xl border border-orange-200/80 dark:border-orange-900/60 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs flex flex-col justify-between"
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
                            <strong>Weak Concept:</strong> {warn.weak_concept}
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
                          <span>Notify Class Teacher &amp; Briefing</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION B: Critical Operational Exceptions (Red / Amber Cards) */}
              {(alertFilter === 'all' || alertFilter === 'urgent') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-rose-800 dark:text-rose-300">
                        🔴 Immediate Operational Alerts (Attendance, Fees &amp; Academics)
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {triageAlerts.filter(a => !a.resolved).length} Pending
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
              )}

            </div>
          )}
          {/* ===================================================== */}
          {/* TAB 2: ADMISSIONS & ENQUIRY CRM                      */}
          {/* ===================================================== */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              <CRMBoard 
                enquiries={enquiries}
                onStageChange={handleEnquiryStageChange}
                onConvertToStudent={async (id: number) => {
                  const enq = enquiries.find(e => e.id === id);
                  if (enq) {
                    setConvertModalEnquiry(enq);
                    setConvertSection(enq.target_grade?.includes('B') ? 'B' : 'A');
                  } else {
                    await handleConvertToStudent(id);
                  }
                }}
              />
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 3: STUDENT DIRECTORY & COMPLETE CLARIFIED SIS     */}
          {/* ===================================================== */}
          {activeTab === 'sis' && (
            <div className="space-y-6">
              {selectedStudentForSIS ? (
                /* ======================================================= */
                /* COMPLETE CLARIFIED SIS (STUDENT INFORMATION SYSTEM)     */
                /* ======================================================= */
                <div className="space-y-6">
                  {/* Top Bar / Navigation */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedStudentForSIS(null)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Student Directory</span>
                      </button>
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>Directory</span>
                        <span>/</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedStudentForSIS.class_name} - {selectedStudentForSIS.section}</span>
                        <span>/</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedStudentForSIS.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Official SIS Record • AY 2026–27</span>
                      </span>
                    </div>
                  </div>

                  {/* Student Hero Header Card */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                          {selectedStudentForSIS.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">
                              {selectedStudentForSIS.name}
                            </h2>
                            <span className="rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                              {selectedStudentForSIS.class_name}-{selectedStudentForSIS.section}
                            </span>
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-mono font-bold">
                              Roll #{selectedStudentForSIS.roll_no}
                            </span>
                            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold border border-emerald-200/80">
                              ✓ {selectedStudentForSIS.status || 'Active Enrolled'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>Admission ID: <strong className="text-slate-700 dark:text-slate-200 font-mono">{selectedStudentForSIS.admission_no}</strong></span>
                            <span>Guardian: <strong className="text-slate-700 dark:text-slate-200">{selectedStudentForSIS.guardian_name}</strong> ({selectedStudentForSIS.guardian_phone})</span>
                            <span>Board: <strong className="text-slate-700 dark:text-slate-200 font-mono">CBSE Affiliation #103049</strong></span>
                          </p>
                        </div>
                      </div>

                      {/* Quick Metrics */}
                      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance</span>
                          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            {selectedStudentForSIS.attendance_pct || 94.2}%
                          </span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic Avg</span>
                          <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                            {selectedStudentForSIS.academic_average_pct || 78.5}%
                          </span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Balance</span>
                          <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                            ₹18,500
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Tabs Switcher */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {[
                        { key: 'profile', label: '📋 Demographic & Personal Profile' },
                        { key: 'academic', label: '📊 Academic Records & Standing' },
                        { key: 'certificates', label: '📑 Legal Certificates Vault (Admin Edit Only)' },
                        { key: 'fees', label: '💳 Fee & Accounts Ledger' }
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setSisActiveSubTab(tab.key as any)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            sisActiveSubTab === tab.key
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SUB-PANEL 1: PERSONAL & GUARDIAN PROFILE */}
                  {sisActiveSubTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span>Personal &amp; Demographic Data</span>
                        </h3>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          <div className="py-2.5 flex justify-between">
                            <span className="text-slate-500">Date of Birth:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">12 May 2012 (14 Yrs)</span>
                          </div>
                          <div className="py-2.5 flex justify-between">
                            <span className="text-slate-500">Gender &amp; Blood Group:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Male • B+ Positive</span>
                          </div>
                          <div className="py-2.5 flex justify-between">
                            <span className="text-slate-500">Aadhaar / National ID:</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">XXXX-XXXX-4819 (Verified)</span>
                          </div>
                          <div className="py-2.5 flex justify-between">
                            <span className="text-slate-500">Mother Tongue &amp; Category:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Telugu / Hindi • General (CBSE)</span>
                          </div>
                          <div className="py-2.5 flex justify-between">
                            <span className="text-slate-500">Permanent Address:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-xs">#42, 4th Cross, Green Glen Layout, Bellandur, Bangalore 560103</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <PhoneCall className="h-4 w-4 text-emerald-600" />
                          <span>Parent &amp; Emergency Guardians</span>
                        </h3>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          <div className="py-2.5 flex justify-between">
                            <span className="text-slate-500">Father / Guardian:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudentForSIS.guardian_name} (Sr. Director)</span>
                          </div>
                          <div className="py-2.5 flex justify-between">
                            <span className="text-slate-500">Father Contact &amp; Email:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudentForSIS.guardian_phone} • {selectedStudentForSIS.guardian_email}</span>
                          </div>
                          <div className="py-2.5 flex justify-between">
                            <span className="text-slate-500">Mother Name:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Mrs. Priya Sharma (Consultant)</span>
                          </div>
                          <div className="py-2.5 flex justify-between">
                            <span className="text-slate-500">Emergency Phone:</span>
                            <span className="font-mono font-bold text-red-600 dark:text-red-400">+91 98450 99881 (24/7 Priority)</span>
                          </div>
                          <div className="py-2.5 flex justify-between">
                            <span className="text-slate-500">Transport Fleet Stop:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">Bus Route #4 (Sarjapur - Bellandur Junction)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-PANEL 2: ACADEMIC RECORDS & STANDING */}
                  {sisActiveSubTab === 'academic' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Performance Ledger • CBSE Class 8 Cohort</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Homeroom Mentor: Mrs. Ananya Verma • Term 1 Assessment Status: Completed</p>
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl">
                          Term GPA: 8.2 / 10.0
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {[
                          { subject: 'Mathematics', score: '72/100', grade: 'B1', status: 'Focus: Quadratic Factorization' },
                          { subject: 'Physics & Chem', score: '84/100', grade: 'A2', status: 'Optimal Lab Performance' },
                          { subject: 'English Lit', score: '88/100', grade: 'A1', status: 'Distinction in Prose' },
                          { subject: 'Social Studies', score: '79/100', grade: 'B1', status: 'Good History Mapping' },
                          { subject: 'Computer Sci', score: '92/100', grade: 'A1', status: 'Exemplary Python Code' }
                        ].map(sub => (
                          <div key={sub.subject} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{sub.subject}</span>
                            <div className="flex items-baseline justify-between">
                              <span className="text-base font-black text-slate-900 dark:text-white">{sub.score}</span>
                              <span className="text-xs font-bold text-blue-600">{sub.grade}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1">{sub.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUB-PANEL 3: OFFICIAL CERTIFICATES VAULT (ADMIN EDIT ONLY) */}
                  {sisActiveSubTab === 'certificates' && (
                    <div className="space-y-6">
                      {/* Security Banner */}
                      <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Lock className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Strict Legal Certificate Authority (Admin Only)</h4>
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">Admin Edit Rights</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                              Only School Administration has rights to upload, sign, and revoke legal certificates. Teachers and parents have strictly read-only access.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowDocModal(true)}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          <Upload className="h-4 w-4" />
                          <span>+ Upload Official Certificate</span>
                        </button>
                      </div>

                      {/* Documents List */}
                      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            Verified Legal Certificates ({documents.length})
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            All certificates sealed with official SHA-256 verification hash
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {documents.map(doc => (
                            <div key={doc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h5>
                                    <span className="rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[9px] font-bold">
                                      {doc.doc_type}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                    Seal: {doc.verified_stamp || 'EDU360 Official Seal - Reg #9921'} &bull; Uploaded by Administrator
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900 px-2.5 py-0.5 text-[10px] font-bold">
                                  <ShieldCheck className="h-3 w-3" />
                                  Official School Seal
                                </span>
                                <button
                                  onClick={() => downloadOfficialDocumentFile(doc.title, selectedStudentForSIS.name, `CERT-${doc.id}`)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                  title="Revoke Certificate"
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

                  {/* SUB-PANEL 4: FEES & TRANSACTION HISTORY */}
                  {sisActiveSubTab === 'fees' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Fee Statement &amp; Cleared Milestone Receipts</h4>
                        <span className="text-xs font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl">
                          Outstanding: ₹18,500 (Term 2)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60">
                          <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">Term 1 Tuition</span>
                          <span className="text-base font-black text-emerald-700 dark:text-emerald-400">₹35,000 Paid</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Cleared 12 Jul 2026 • Ref: UPI-9842</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60">
                          <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">Annual Lab &amp; STEM</span>
                          <span className="text-base font-black text-emerald-700 dark:text-emerald-400">₹15,000 Paid</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Cleared 12 Jul 2026 • Ref: HDFC-4412</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60">
                          <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">Term 2 Tuition &amp; Bus</span>
                          <span className="text-base font-black text-amber-700 dark:text-amber-400">₹18,500 Pending</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Due Date: 25 Oct 2026</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ======================================================= */
                /* STUDENT DIRECTORY PAGE (ROSTER & FILTERS)               */
                /* ======================================================= */
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                          Central Roster
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">AY 2026–27 &bull; CBSE Affiliated</span>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                        👥 Student Directory &amp; Records (SIS)
                      </h1>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Complete student directory with class and section filters. Open student profiles to inspect full clarified SIS and manage official certificates.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                        Total Students: <strong className="text-slate-900 dark:text-white font-mono">{studentsList.length}</strong>
                      </span>
                    </div>
                  </div>

                  {/* FILTERS & SEARCH ROW */}
                  <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Class Filter Chips */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-xs font-bold text-slate-400 shrink-0">Class:</span>
                        {['All', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(cls => (
                          <button
                            key={cls}
                            onClick={() => setStudentClassFilter(cls)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                              studentClassFilter === cls
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {cls}
                          </button>
                        ))}
                      </div>

                      {/* Section Filter Chips */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-xs font-bold text-slate-400 shrink-0">Section:</span>
                        {['All', 'A', 'B'].map(sec => (
                          <button
                            key={sec}
                            onClick={() => setStudentSectionFilter(sec)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                              studentSectionFilter === sec
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {sec === 'All' ? 'All Sections' : `Sec ${sec}`}
                          </button>
                        ))}
                      </div>

                      {/* Search Bar */}
                      <div className="relative min-w-[240px]">
                        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={studentSearchQuery}
                          onChange={e => setStudentSearchQuery(e.target.value)}
                          placeholder="Search by student, roll no, parent..."
                          className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {studentSearchQuery && (
                          <button onClick={() => setStudentSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STUDENTS ROSTER TABLE */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                            <th className="py-3 px-4">Roll</th>
                            <th className="py-3 px-4">Student Name &amp; ID</th>
                            <th className="py-3 px-4">Class &amp; Sec</th>
                            <th className="py-3 px-4">Parent / Guardian Contact</th>
                            <th className="py-3 px-4">Attendance</th>
                            <th className="py-3 px-4">Academic Avg</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {studentsList
                            .filter(s => {
                              const matchClass = studentClassFilter === 'All' || s.class_name.toLowerCase().includes(studentClassFilter.toLowerCase().replace('class ', ''));
                              const matchSec = studentSectionFilter === 'All' || s.section.toUpperCase() === studentSectionFilter.toUpperCase();
                              const q = studentSearchQuery.trim().toLowerCase();
                              const matchQ = !q || s.name.toLowerCase().includes(q) || s.admission_no.toLowerCase().includes(q) || s.guardian_name.toLowerCase().includes(q) || s.roll_no.toLowerCase().includes(q);
                              return matchClass && matchSec && matchQ;
                            })
                            .map((student) => (
                              <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                                  #{student.roll_no}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                                      {student.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 transition-colors">
                                        {student.name}
                                      </span>
                                      <span className="font-mono text-[10px] text-slate-400">
                                        {student.admission_no}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {student.class_name}-{student.section}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                    {student.guardian_name}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    {student.guardian_phone}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    (student.attendance_pct || 90) >= 90
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                      : (student.attendance_pct || 90) >= 75
                                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                        : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                                  }`}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    {student.attendance_pct || 94.2}%
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                  {student.academic_average_pct || 78.5}%
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold">
                                    {student.status || 'Active'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={() => setSelectedStudentForSIS(student)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs"
                                  >
                                    <span>Open Full SIS</span>
                                    <ArrowRight className="h-3 w-3" />
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

          {/* TAB 5: FEE COLLECTIONS, AGING & MILESTONE REALIZATION */}
          {/* ===================================================== */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                      Finance &amp; Accounts
                    </span>
                    <span className="text-xs text-slate-500">AY 2026–27 Collections</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    💳 Student Fee Collections &amp; Pending Dues
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Monitor today&apos;s live collections, track aging dues across maturity buckets, and inspect institutional financial health.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBatchFeeReminders}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Batch Reminders ({feeDefaulters.length} Overdue)</span>
                  </button>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'today', label: "💵 Today's Fee Collections", badge: "₹1.45 Lakhs Today" },
                  { key: 'aging', label: '⏳ Aging & Overdue Dues', badge: `${feeDefaulters.length} Defaulters` },
                  { key: 'milestones', label: '📊 Budget Milestones & Health', badge: 'AY 2026–27' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFeeSubTab(tab.key as any)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      feeSubTab === tab.key
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      feeSubTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {tab.badge}
                    </span>
                  </button>
                ))}
              </div>

              {/* SUB-SECTION 1: TODAY'S FEE COLLECTIONS */}
              {feeSubTab === 'today' && (
                <div className="space-y-5">
                  {/* Today's KPI Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Collected Today</span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹1,45,000</span>
                      <span className="text-[11px] text-slate-500 block">7 Verified Receipts</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">UPI / Razorpay Gateway</span>
                      <span className="text-xl font-black text-blue-600 dark:text-blue-400">₹95,000</span>
                      <span className="text-[11px] text-slate-500 block">4 Instant Auto-Settled</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Transfer / NEFT</span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹35,000</span>
                      <span className="text-[11px] text-slate-500 block">2 Verified by Accounts</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">School Cash Counter</span>
                      <span className="text-xl font-black text-amber-600 dark:text-amber-400">₹15,000</span>
                      <span className="text-[11px] text-slate-500 block">1 Physical Cash Slip</span>
                    </div>
                  </div>

                  {/* Today's Transactions Table */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Today&apos;s Receipts Ledger (28 Oct 2026)
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Real-time Bank Integration Active
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                            <th className="py-3 px-4">Receipt #</th>
                            <th className="py-3 px-4">Student &amp; Class</th>
                            <th className="py-3 px-4">Fee Head</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Payment Mode</th>
                            <th className="py-3 px-4">Ref UTR / Transaction</th>
                            <th className="py-3 px-4">Time</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {[
                            { recNo: 'REC-2026-1028-01', name: 'Aarav Sharma', classSec: 'Class 8-B', head: 'Term 2 Tuition Fee', amount: 25000, mode: 'UPI (GPay)', ref: 'UPI-984210982', time: '10:45 AM', status: 'Bank Cleared' },
                            { recNo: 'REC-2026-1028-02', name: 'Diya Patel', classSec: 'Class 8-B', head: 'Term 2 Tuition & Lab', amount: 28500, mode: 'HDFC NetBanking', ref: 'NEFT-202610289', time: '10:30 AM', status: 'Bank Cleared' },
                            { recNo: 'REC-2026-1028-03', name: 'Kabir Mehta', classSec: 'Class 8-B', head: 'Term 2 Transport Fee', amount: 15000, mode: 'Cash Counter', ref: 'CASH-REC-0082', time: '10:15 AM', status: 'Bank Cleared' },
                            { recNo: 'REC-2026-1028-04', name: 'Rohan Verma', classSec: 'Class 9-A', head: 'Term 2 Tuition Fee', amount: 22000, mode: 'UPI (PhonePe)', ref: 'UPI-778219012', time: '09:50 AM', status: 'Bank Cleared' },
                            { recNo: 'REC-2026-1028-05', name: 'Ananya Iyer', classSec: 'Class 9-A', head: 'Annual STEM & Robotics', amount: 18500, mode: 'UPI (Paytm)', ref: 'UPI-661298411', time: '09:40 AM', status: 'Bank Cleared' },
                            { recNo: 'REC-2026-1028-06', name: 'Ishaan Reddy', classSec: 'Class 10-A', head: 'Term 2 Tuition Fee', amount: 20000, mode: 'ICICI NetBanking', ref: 'NEFT-441298410', time: '09:15 AM', status: 'Bank Cleared' },
                            { recNo: 'REC-2026-1028-07', name: 'Sneha Nair', classSec: 'Class 6-A', head: 'Term 2 Tuition Fee', amount: 16000, mode: 'UPI (GPay)', ref: 'UPI-334190822', time: '08:55 AM', status: 'Bank Cleared' },
                          ].map(row => (
                            <tr key={row.recNo} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                {row.recNo}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-900 dark:text-white block">{row.name}</span>
                                <span className="text-[10px] text-slate-400">{row.classSec}</span>
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                                {row.head}
                              </td>
                              <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                                ₹{row.amount.toLocaleString()}
                              </td>
                              <td className="py-3 px-4">
                                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                  {row.mode}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                                {row.ref}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                                {row.time}
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                                  <Check className="h-3 w-3" />
                                  {row.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => {
                                    downloadOfficialDocumentFile(`Fee Receipt - ${row.recNo}`, row.name, row.recNo);
                                    setToastMessage(`Downloaded Receipt ${row.recNo}`);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>PDF</span>
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

              {/* SUB-SECTION 2: AGING & OVERDUE DEFAULTERS */}
              {feeSubTab === 'aging' && (
                <div className="space-y-5">
                  {/* Aging Analysis Bar */}
                  {feeAnalytics && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/5 via-amber-500/5 to-blue-500/5 border border-red-500/20 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900 dark:text-white">Overdue Dues Aging Maturity Breakdown</span>
                        <span className="text-red-600 font-extrabold">Total Overdue: ₹{(feeAnalytics.total_overdue / 100000).toFixed(2)} L</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-blue-600 block">0–15 Days (Early Overdue)</span>
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            ₹{(feeAnalytics.aging_summary.days_0_to_15 / 100000).toFixed(2)} L
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Gentle WhatsApp Notification</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-amber-600 block">16–30 Days (Mid-Tier Overdue)</span>
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            ₹{(feeAnalytics.aging_summary.days_16_to_30 / 100000).toFixed(2)} L
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Automated SMS &amp; Email Notice</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-red-600 block">30+ Days (Critical Action)</span>
                          <span className="text-base font-black text-red-600 dark:text-red-400">
                            ₹{(feeAnalytics.aging_summary.days_over_30 / 100000).toFixed(2)} L
                          </span>
                          <span className="text-[10px] text-red-500 block mt-0.5">Coordinator Direct Call Priority</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Defaulters Table */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Overdue Student Accounts ({feeDefaulters.length} accounts pending)
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {feeDefaulters.map((defaulter) => (
                        <div key={defaulter.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400 font-bold shrink-0">
                              {defaulter.student_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{defaulter.student_name}</h4>
                                <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[9px] font-bold">
                                  {defaulter.class_name}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                                Guardian: {defaulter.parent_name} • {defaulter.parent_phone}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-red-600 dark:text-red-400 block">
                                ₹{defaulter.amount_due.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {defaulter.days_overdue} days overdue
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

              {/* SUB-SECTION 3: BUDGET MILESTONES & REALIZATION */}
              {feeSubTab === 'milestones' && (
                <div className="space-y-5">
                  {feeAnalytics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Budget Target</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{(feeAnalytics.total_target / 100000).toFixed(1)} Lakhs
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 block">Realized In Bank</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          ₹{(feeAnalytics.total_collected / 100000).toFixed(1)} Lakhs
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-red-600 block">Total Pending Dues</span>
                        <span className="text-lg font-black text-red-600 dark:text-red-400">
                          ₹{(feeAnalytics.total_overdue / 100000).toFixed(1)} Lakhs
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-blue-600 block">Collection Rate</span>
                        <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                          {feeAnalytics.collection_rate_pct}%
                        </span>
                      </div>
                    </div>
                  )}

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
                </div>
              )}
            </div>
          )}

          {/* TAB 6: STAFF & FACULTY DIRECTORY (COMPREHENSIVE)       */}
          {/* ===================================================== */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              {/* Header & Controls */}
              <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      👨‍🏫 Faculty &amp; Teaching Personnel Directory
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Institutional records: salary compensation, experience, assigned classes, leave balances, and pending requests.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                    Total Staff: <strong className="text-slate-900 dark:text-white">{staffMembers.length}</strong>
                  </span>
                </div>

                {/* Filters and Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {['All', 'Academics', 'Sports & Estate', 'Cultural', 'Logistics', 'External Vendor'].map(dept => (
                      <button
                        key={dept}
                        onClick={() => setStaffRoleFilter(dept)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          staffRoleFilter === dept
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>

                  <div className="relative min-w-[240px]">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={staffSearchQuery}
                      onChange={e => setStaffSearchQuery(e.target.value)}
                      placeholder="Search staff, class, role..."
                      className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {staffSearchQuery && (
                      <button onClick={() => setStaffSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Staff Roster Table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                        <th className="py-3 px-4">Faculty / Staff Member</th>
                        <th className="py-3 px-4">Experience &amp; Workload</th>
                        <th className="py-3 px-4">Assigned Classes</th>
                        <th className="py-3 px-4">Monthly Salary</th>
                        <th className="py-3 px-4">Leave Quota</th>
                        <th className="py-3 px-4">Requests</th>
                        <th className="py-3 px-4">Attendance</th>
                        <th className="py-3 px-4 text-right">Dossier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {staffMembers
                        .filter(s => {
                          const matchDept = staffRoleFilter === 'All' || s.department === staffRoleFilter;
                          const q = staffSearchQuery.trim().toLowerCase();
                          const matchQ = !q || s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || (s.assigned_classes && s.assigned_classes.some(c => c.toLowerCase().includes(q)));
                          return matchDept && matchQ;
                        })
                        .map((staff) => (
                          <tr key={staff.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold shrink-0">
                                  {staff.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 dark:text-white">{staff.name}</h4>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{staff.role} • {staff.qualification || staff.department}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {staff.experience || '7 Yrs Experience'}
                              </span>
                              <span className="text-[10px] text-slate-400">{staff.department}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {(staff.assigned_classes || ['Class 8-A', 'Class 8-B']).map((cls, idx) => (
                                  <span key={idx} className="rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 text-[10px] font-bold border border-blue-200/60 dark:border-blue-900/60">
                                    {cls}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">
                              ₹{(staff.salary || 65000).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/mo</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span className="text-slate-600 dark:text-slate-400">{staff.leaves_taken || 2} / {staff.leaves_total || 12} Taken</span>
                                  <span className="text-emerald-600 font-mono">{(staff.leaves_total || 12) - (staff.leaves_taken || 2)} left</span>
                                </div>
                                <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-1.5 rounded-full"
                                    style={{ width: `${Math.min(100, (((staff.leaves_taken || 2) / (staff.leaves_total || 12)) * 100))}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px]">
                                {staff.requests_submitted ?? 1} Submitted
                              </span>
                              <span className="text-[10px] text-slate-400">0 Pending Action</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                (staff.status || 'Present') === 'Present' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${(staff.status || 'Present') === 'Present' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                {staff.status || 'Present'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => setSelectedStaffForModal(staff)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                              >
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

          {/* TAB: FACULTY PERMISSIONS & SHIFTS                    */}
          {/* ===================================================== */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              {/* Permission Status Filter Pills */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Filter Queue:</span>
                  {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPermFilter(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        permFilter === tab
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tab}
                      {tab === 'Pending' && pendingPermissionCount > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                          {pendingPermissionCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {teacherPermissions.filter(p => permFilter === 'All' || p.status === permFilter).length} Records
                </span>
              </div>

              {/* Permissions List */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs divide-y divide-slate-200 dark:divide-slate-800">
                {teacherPermissions
                  .filter(p => permFilter === 'All' || p.status === permFilter)
                  .map((req) => (
                    <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{req.teacher_name}</h4>
                          <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300">
                            {req.type}
                          </span>
                          <span className="text-[10px] text-slate-400">Date: {req.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                          &ldquo;{req.reason}&rdquo;
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>Shift Coverage: Period 3 (Class 8-B)</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Auto-Proxy: Mr. Vikram Sharma</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'Pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReviewPermission(req.id, 'Approved')}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewPermission(req.id, 'Rejected')}
                              className="inline-flex items-center gap-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl ${
                            req.status === 'Approved' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
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
          )}

          {/* ===================================================== */}
          {/* TAB: STAFF PAYROLL & COMPENSATION                    */}
          {/* ===================================================== */}
          {activeTab === 'payroll' && (
            <div className="space-y-6">
              {/* Monthly Payroll Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Total Monthly Budget
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">₹28,50,000</span>
                  <span className="text-xs text-slate-500 block mt-1">44 Full-Time Faculty &amp; Staff</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                    Net Disbursed (Oct 2026)
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹26,20,000</span>
                  <span className="text-xs text-slate-500 block mt-1">42 Disbursed via Bank Direct Transfer</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                    Statutory Deductions (PF/Tax)
                  </span>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400">₹2,30,000</span>
                  <span className="text-xs text-slate-500 block mt-1">EPF &amp; TDS Compliant</span>
                </div>
              </div>

              {/* Payroll Register Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Faculty Compensation Register &amp; Digital Pay Slips
                  </span>
                  <span className="text-[11px] text-slate-500">October 2026 Cycle</span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {staffMembers.map((staff) => {
                    const basic = staff.salary || 65000;
                    const hra = Math.round(basic * 0.2);
                    const deductions = Math.round(basic * 0.1);
                    const net = basic + hra - deductions;
                    return (
                      <div key={staff.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{staff.name}</h4>
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[9px] font-bold">
                              {staff.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-0.5 block">
                            Basic: ₹{basic.toLocaleString()} • HRA: ₹{hra.toLocaleString()} • Deductions: -₹{deductions.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900 dark:text-white block">
                              ₹{net.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              Disbursed ✓
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              downloadOfficialDocumentFile('Salary Pay Slip (Oct 2026)', staff.name, `EMP-${staff.id}`);
                              setToastMessage(`Downloaded Pay Slip for ${staff.name}`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Slip</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 8: SCHOOL EVENTS & ACTIVITY COMMAND CENTER         */}
          {/* ===================================================== */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Header with Add Event Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 text-xs font-bold border border-purple-200 dark:border-purple-800">
                      Campus Life &amp; Calendar
                    </span>
                    <span className="text-xs text-slate-500">AY 2026–27 Activities</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    🎉 Institutional Events &amp; Activity Command Center
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Plan and announce official school events, coordinate staff committees, and broadcast instant notifications to parents and students.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddEventModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Add New School Event</span>
                  </button>
                </div>
              </div>

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {schoolEvents.map((evt) => (
                  <div key={evt.id} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3 relative overflow-hidden group hover:border-purple-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 px-2.5 py-0.5 text-xs font-bold">
                        {evt.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {evt.target_audience}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <Calendar className="h-3.5 w-3.5 text-purple-600" />
                        {evt.date}
                      </span>
                      <span>📍 {evt.location}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Committee Hierarchy */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Staff &amp; Student Task Hierarchy (Committee Mapping)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-2">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block">Mrs. Ananya Verma • Lead Faculty</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 block">Stage Coordination &amp; Choir</span>
                    <div className="pt-2 border-t border-purple-200 dark:border-purple-900 text-[10px] text-slate-600 dark:text-slate-300">
                      Volunteers: Aarav Sharma, Diya Patel, Rohan Iyer
                    </div>
                  </div>
                  <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-2">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200 block">Mr. Vikram Joshi • Lead Faculty</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 block">Discipline &amp; VIP Logistics</span>
                    <div className="pt-2 border-t border-blue-200 dark:border-blue-900 text-[10px] text-slate-600 dark:text-slate-300">
                      Volunteers: Kabir Mehta, Vivaan Sen
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">Dr. K. Raman • Lead Faculty</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 block">Science &amp; Robotics Exhibition Lead</span>
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900 text-[10px] text-slate-600 dark:text-slate-300">
                      Volunteers: Ishaan Reddy, Ananya Iyer
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ONLINE EXAMINATION CENTER & RE-EXAM WORKFLOW   */}
          {/* ===================================================== */}
          {activeTab === 'exams' && (
            <div className="space-y-6">
              {/* Header with Sub-tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 px-2.5 py-0.5 text-xs font-bold border border-violet-200 dark:border-violet-800">
                      Examination Cell
                    </span>
                    <span className="text-xs text-slate-500">CBSE Term Assessments</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    📝 Examinations, Timetables &amp; Re-Exam Approvals
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Review upcoming exam schedules, track overdue papers, and evaluate student medical re-exam requests with coordinator notifications.
                  </p>
                </div>

                {/* Sub-tabs */}
                <div className="flex items-center gap-2">
                  {[
                    { key: 'upcoming', label: '📅 Upcoming Timetables' },
                    { key: 'overdue', label: '⏳ Overdue Exams' },
                    { key: 'reexam', label: '🏥 Re-Exam Requests', count: reExamRequests.filter(r => r.status === 'Pending Admin Review').length }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setExamSubTab(tab.key as any)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        examSubTab === tab.key
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Class Cohort:</span>
                  {['All', 'Class 8', 'Class 9', 'Class 10'].map(cls => (
                    <button
                      key={cls}
                      onClick={() => setExamClassFilter(cls)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        examClassFilter === cls
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">CBSE Term-2 Timetable Active</span>
                </div>
              </div>

              {/* SUB-VIEW 1: UPCOMING EXAMS */}
              {examSubTab === 'upcoming' && (() => {
                const upcomingExams = [
                  { id: 1, name: 'Term 2 Mathematics Pre-Board', class: 'Class 10', date: '28 Oct 2026', time: '09:00 - 12:00', hall: 'Hall A (Auditorium)', invigilator: 'Mrs. Ananya Verma', status: 'Scheduled' },
                  { id: 2, name: 'Midterm Science (Physics / Chemistry)', class: 'Class 9', date: '29 Oct 2026', time: '09:00 - 11:30', hall: 'Science Block 204', invigilator: 'Mr. Vikram Sharma', status: 'Scheduled' },
                  { id: 3, name: 'Homeroom Math Remedial Assessment', class: 'Class 8', date: '30 Oct 2026', time: '10:00 - 11:30', hall: 'Room 102', invigilator: 'Mrs. Ananya Verma', status: 'Scheduled' },
                  { id: 4, name: 'English Language & Literature', class: 'Class 8', date: '02 Nov 2026', time: '09:00 - 11:30', hall: 'Room 104', invigilator: 'Ms. Priya Sen', status: 'Scheduled' },
                  { id: 5, name: 'Social Studies & Civics', class: 'Class 9', date: '04 Nov 2026', time: '09:00 - 11:30', hall: 'Room 201', invigilator: 'Mr. Vikram Joshi', status: 'Scheduled' },
                  { id: 6, name: 'Computer Science Practical Exam', class: 'Class 10', date: '05 Nov 2026', time: '13:00 - 15:00', hall: 'Computer Lab 1', invigilator: 'Mr. Rahul Dave', status: 'Scheduled' },
                ].filter(e => examClassFilter === 'All' || e.class === examClassFilter);

                if (upcomingExams.length === 0) {
                  return (
                    <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2">
                      <BookOpen className="h-10 w-10 text-slate-400 mx-auto opacity-50" />
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Exams Scheduled</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        There are currently no upcoming examinations scheduled for {examClassFilter}.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingExams.map(exam => (
                      <div key={exam.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-violet-300 dark:hover:border-violet-700 transition-all">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-extrabold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-md border border-violet-200 dark:border-violet-900">
                            {exam.class}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{exam.date} • {exam.time}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{exam.name}</h4>
                        <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                          <div>Seating: <strong className="text-slate-700 dark:text-slate-300">{exam.hall}</strong></div>
                          <div>Invigilator: <strong className="text-slate-700 dark:text-slate-300">{exam.invigilator}</strong></div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            Proctor Confirmed
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              downloadOfficialDocumentFile(`Exam Hall Pass - ${exam.name}`, exam.class, `HALL-${exam.id}`);
                              setToastMessage(`Downloaded Hall Pass for ${exam.name}`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 text-violet-700 dark:text-violet-300 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                            <span>Hall Pass</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* SUB-VIEW 2: OVERDUE EXAMS */}
              {examSubTab === 'overdue' && (() => {
                const overdueExams = [
                  { id: 101, name: 'Term 1 Mathematics Paper Re-evaluation', class: 'Class 8', date: '20 Oct 2026', time: '10:00 - 11:30', hall: 'Room 102', invigilator: 'Mrs. Ananya Verma', status: 'Overdue Scoring' }
                ].filter(e => examClassFilter === 'All' || e.class === examClassFilter);

                if (overdueExams.length === 0) {
                  return (
                    <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto opacity-70" />
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Overdue Exams</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        All examination evaluations and mark submissions for {examClassFilter} are on schedule.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overdueExams.map(exam => (
                      <div key={exam.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 shadow-xs">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-extrabold text-red-700 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md">
                            {exam.class} • Overdue
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{exam.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{exam.name}</h4>
                        <div className="mt-2 text-xs text-slate-500">
                          Invigilator: <strong className="text-slate-700 dark:text-slate-300">{exam.invigilator}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* SUB-VIEW 3: RE-EXAM PERMISSION REQUESTS */}
              {examSubTab === 'reexam' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                      Parents raise re-examination permissions for missed assessments due to medical emergencies or excused leaves. Upon Administration approval, an automated instruction is dispatched to the <strong>Exam Coordinator</strong> to schedule the re-test and the student &amp; parent are notified.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {reExamRequests.map(req => (
                      <div key={req.id} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-700 font-bold flex items-center justify-center shrink-0">
                              {req.student_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.student_name}</h4>
                                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold">
                                  {req.class_name}-{req.section}
                                </span>
                                <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                                  {req.reason_category}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 mt-0.5 block">
                                Subject: <strong className="text-slate-800 dark:text-slate-200">{req.subject}</strong> ({req.exam_name}) &bull; Missed Date: {req.missed_date}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              req.status === 'Approved by Admin'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : req.status === 'Rejected'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl">
                          <div>
                            <span className="text-slate-400 font-bold block mb-0.5">Parent Explanation:</span>
                            <p className="text-slate-700 dark:text-slate-300 italic">&ldquo;{req.reason_details}&rdquo;</p>
                            <span className="text-[10px] text-slate-500 block mt-1">Submitted by {req.parent_name} ({req.parent_phone})</span>
                          </div>
                          <div className="sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-3 space-y-1">
                            <span className="text-slate-400 font-bold block mb-0.5">Supporting Medical Evidence:</span>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{req.document_name || 'Medical_Certificate.pdf'}</span>
                            </div>
                            <span className="text-[10px] text-emerald-600 block">✓ Digital Hospital Stamp Verified</span>
                          </div>
                        </div>

                        {req.status === 'Pending Admin Review' && (
                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              onClick={() => {
                                api.reviewReExamRequest(req.id, 'Rejected', 'Reason did not meet medical exemption criteria');
                                setReExamRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Rejected' } : r));
                                triggerToast(`Re-exam request for ${req.student_name} rejected.`);
                              }}
                              className="px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer"
                            >
                              Reject Request
                            </button>
                            <button
                              onClick={async () => {
                                await api.reviewReExamRequest(req.id, 'Approved by Admin', 'Approved by Administration based on verified medical documentation.');
                                // Broadcast notification to exam coordinator
                                await api.sendNotification({
                                  recipient_role: 'exam_coordinator',
                                  sender_name: 'Dr. Radhakrishnan (Principal)',
                                  sender_role: 'admin',
                                  title: `Re-Exam Mandate: ${req.student_name} (${req.subject})`,
                                  message: `Principal has officially APPROVED re-examination for ${req.student_name} (${req.class_name}-${req.section}) in ${req.subject}. Please schedule venue & question paper.`,
                                  priority: 'High'
                                });
                                // Broadcast to parent & student
                                await api.sendNotification({
                                  recipient_role: 'parent',
                                  sender_name: 'Principal Office',
                                  sender_role: 'admin',
                                  title: `Re-Exam Approved: ${req.subject}`,
                                  message: `Your medical re-exam request for ${req.student_name} in ${req.subject} has been officially approved. Exam coordinator is scheduling the re-test.`,
                                  priority: 'Normal'
                                });
                                setReExamRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Approved by Admin' } : r));
                                triggerToast(`✓ Re-exam APPROVED! Notified Exam Coordinator & Parent.`);
                              }}
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                            >
                              ✓ Approve Re-Exam &amp; Dispatch to Coordinator
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: DEDICATED TASK MANAGEMENT                      */}
          {/* ===================================================== */}
          {activeTab === 'tasks' && (() => {
            const DOMAIN_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
              academic:   { label: 'Academic & Curriculum', color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800', icon: '📚' },
              exam:       { label: 'Examination Cell',      color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800', icon: '📝' },
              admissions: { label: 'Admissions & CRM',      color: 'text-sky-700 dark:text-sky-300',       bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',           icon: '🎓' },
              finance:    { label: 'Finance & Accounts',    color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', icon: '₹' },
              executive:  { label: 'Principal Mandates',    color: 'text-rose-700 dark:text-rose-300',     bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',       icon: '⚡' },
              campus_ops: { label: 'Campus Operations',     color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800', icon: '🏫' },
            };

            const PRIORITY_BADGE: Record<string, string> = {
              Critical: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
              High:     'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
              Medium:   'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
              Low:      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
            };

            const STATUS_BADGE: Record<string, string> = {
              'Pending':        'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
              'In Progress':    'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
              'Pending Review': 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
              'Completed':      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
            };

            const filteredTasks = tasks.filter(t => {
              const statusMatch = taskStatusFilter === 'all' || t.status === taskStatusFilter;
              if (taskOriginFilter === 'auto') return t.is_auto_generated && statusMatch;
              if (taskOriginFilter === 'staff') return !t.is_auto_generated && statusMatch;
              if (taskOriginFilter === 'critical') return (t.is_escalated || t.priority === 'Critical') && statusMatch;
              if (taskOriginFilter === 'relief') return t.relief_requested && statusMatch;
              return statusMatch;
            });

            const openCount   = tasks.filter(t => t.status !== 'Completed').length;
            const autoCount   = tasks.filter(t => t.is_auto_generated).length;
            const criticalCount = tasks.filter(t => t.is_escalated || t.priority === 'Critical').length;
            const completedCount = tasks.filter(t => t.status === 'Completed').length;
            const reliefCount = tasks.filter(t => t.relief_requested).length;

            return (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* ── 4 Crisp High-Level KPI Cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {[
                    { label: 'Active School Tasks', value: openCount, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50/70 dark:bg-blue-950/30', border: 'border-blue-200/60 dark:border-blue-800/60', icon: <ClipboardCheck className="h-4 w-4" /> },
                    { label: '⚡ Auto-Triggered Rules', value: autoCount, color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50/70 dark:bg-violet-950/30', border: 'border-violet-200/60 dark:border-violet-800/60', icon: <Sparkles className="h-4 w-4" /> },
                    { label: '🚨 Critical Priorities', value: criticalCount, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50/70 dark:bg-rose-950/30', border: 'border-rose-200/60 dark:border-rose-800/60', icon: <AlertTriangle className="h-4 w-4" /> },
                    { label: '✓ Completed Tasks', value: completedCount, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50/70 dark:bg-emerald-950/30', border: 'border-emerald-200/60 dark:border-emerald-800/60', icon: <CheckCircle2 className="h-4 w-4" /> },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`rounded-2xl border ${kpi.border} ${kpi.bg} p-4 flex items-center gap-3.5 shadow-2xs`}>
                      <span className={`p-2 rounded-xl bg-white dark:bg-slate-900 ${kpi.color} shadow-2xs`}>{kpi.icon}</span>
                      <div>
                        <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">{kpi.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Filter Toolbar ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  {/* Task Origin / Type Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mr-1">Task Type:</span>
                    {[
                      { id: 'all', label: 'All Tasks', count: tasks.length },
                      { id: 'auto', label: '⚡ Auto-Triggered', count: autoCount },
                      { id: 'staff', label: '👤 Staff Delegated', count: tasks.length - autoCount },
                      { id: 'critical', label: '🚨 Critical Only', count: criticalCount },
                      { id: 'relief', label: '⚠️ Workload Relief', count: reliefCount },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setTaskOriginFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          taskOriginFilter === tab.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          taskOriginFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Status:</span>
                    <select
                      value={taskStatusFilter}
                      onChange={e => setTaskStatusFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* ── Clean Task List Cards ── */}
                <div className="space-y-3">
                  {filteredTasks.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No tasks match this filter.</p>
                      <p className="text-xs text-slate-400 mt-1">Try switching to All Tasks or change status filter.</p>
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
                        className={`rounded-2xl border bg-white dark:bg-slate-900 shadow-xs transition-all overflow-hidden ${
                          task.is_escalated
                            ? 'border-rose-300 dark:border-rose-700 ring-1 ring-rose-200 dark:ring-rose-900'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Task Header Row */}
                        <div
                          className="flex items-start justify-between gap-4 p-4.5 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                          onClick={() => setTaskExpandedId(isExpanded ? null : task.id)}
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            {/* Domain Icon */}
                            <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border text-base font-black ${meta.bg}`}>
                              {meta.icon}
                            </div>

                            <div className="space-y-1 min-w-0">
                              {/* Badges */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.bg} ${meta.color}`}>
                                  {meta.label}
                                </span>
                                {task.is_auto_generated && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300 border border-violet-200 dark:border-violet-800 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> Auto-Triggered Rule
                                  </span>
                                )}
                                {task.is_escalated && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                                    🚨 Escalated to Principal
                                  </span>
                                )}
                                {task.relief_requested && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3 text-amber-600" /> Relief Requested ({task.relief_reason || 'Workload'})
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <h4 className={`text-sm font-bold ${
                                task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                              }`}>
                                {task.title}
                              </h4>

                              {/* Meta Info */}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  👤 Assigned: <strong>{task.assigned_to}</strong>
                                </span>
                                <span>•</span>
                                <span>Due: <strong>{task.due_date}</strong></span>
                                {task.sla_hours && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                                      ⏱️ SLA {task.sla_hours}h
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status and Priority Badges */}
                          <div className="shrink-0 flex flex-col items-end gap-1.5">
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${statusClass}`}>
                              {task.status}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${priorityClass}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Panel */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
                            {task.description && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            {/* Faculty Relief Request Callout with 1-Click Approval */}
                            {task.relief_requested && (
                              <div className="rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/40 p-3.5 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    Faculty Relief Request Submitted ({task.relief_reason || 'Workload Surge'})
                                  </span>
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                                    SLA Paused (Zero Penalty)
                                  </span>
                                </div>

                                {task.relief_justification && (
                                  <p className="text-xs text-amber-900 dark:text-amber-200 italic bg-white/80 dark:bg-slate-900/70 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900">
                                    "{task.relief_justification}"
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                                  <span className="text-amber-800 dark:text-amber-300">
                                    Suggested Peer Faculty: <strong>{task.suggested_peer_teacher || 'Mrs. Neha Roy'}</strong>
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReassignTaskId(task.id);
                                        setReassignPeer(task.suggested_peer_teacher || 'Mrs. Neha Roy');
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer transition-all shadow-xs"
                                    >
                                      Approve Peer Migration
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleExtendSla(task.id);
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold cursor-pointer transition-all"
                                    >
                                      +24h SLA Extension
                                    </button>
                                  </div>
                                </div>

                                {/* Inline Peer Selection Confirmation */}
                                {reassignTaskId === task.id && (
                                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-300 dark:border-amber-800 space-y-2 mt-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                      Confirm Peer Faculty to Reassign Mandate (SLA will reset to fresh 48 Hours):
                                    </label>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <select
                                        value={reassignPeer}
                                        onChange={(e) => setReassignPeer(e.target.value)}
                                        className="flex-1 min-w-[200px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
                                      >
                                        <option value="Mrs. Neha Roy">Mrs. Neha Roy (English)</option>
                                        <option value="Dr. Suresh Babu">Dr. Suresh Babu (Science)</option>
                                        <option value="Mr. Vikram Sharma">Mr. Vikram Sharma (Physics)</option>
                                        <option value="Mrs. Rekha Sharma">Mrs. Rekha Sharma (Hindi)</option>
                                      </select>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApproveRelief(task, reassignPeer);
                                        }}
                                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                                      >
                                        Confirm Reassignment
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setReassignTaskId(null);
                                        }}
                                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Escalation Callout with Principal Resolve Action */}
                            {task.is_escalated && (
                              <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 p-3.5 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                                    🚨 Escalation Rationale: {task.escalation_reason || 'Critical Priority'}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setResolveEscalateTaskId(task.id);
                                      setResolveEscalateNotes('Discussed with faculty, issue resolved and resumed normally.');
                                    }}
                                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-all flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolve Escalation
                                  </button>
                                </div>

                                {resolveEscalateTaskId === task.id && (
                                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-300 dark:border-rose-800 space-y-2 mt-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                      Principal Resolution Note (Restores task to standard monitoring queue):
                                    </label>
                                    <input
                                      type="text"
                                      value={resolveEscalateNotes}
                                      onChange={(e) => setResolveEscalateNotes(e.target.value)}
                                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
                                      placeholder="e.g. Counseled teacher, parent contacted, workload stabilized."
                                    />
                                    <div className="flex items-center justify-end gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setResolveEscalateTaskId(null);
                                        }}
                                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleResolveEscalation(task.id);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                                      >
                                        Confirm Resolution
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Status Change Stepper */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-500 mr-1">Update Status:</span>
                                {['Pending', 'In Progress', 'Completed'].map(s => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateTaskStatus(task.id, s);
                                    }}
                                    disabled={task.status === s}
                                    className={`rounded-xl px-3 py-1 text-xs font-bold border transition-all cursor-pointer ${
                                      task.status === s
                                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600 cursor-not-allowed'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600'
                                    }`}
                                  >
                                    {s === 'Completed' ? '✓ Mark Done' : s}
                                  </button>
                                ))}
                              </div>

                              {!task.is_escalated && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEscalateTaskId(task.id);
                                    setEscalateReason('');
                                  }}
                                  className="rounded-xl px-3 py-1 text-xs font-bold border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-all cursor-pointer"
                                >
                                  🚨 Escalate to Principal
                                </button>
                              )}
                            </div>

                            {/* Escalation Form */}
                            {escalateTaskId === task.id && (
                              <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 p-3.5 space-y-2 mt-2">
                                <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
                                  State rationale for escalating this task to Principal:
                                </p>
                                <textarea
                                  rows={2}
                                  value={escalateReason}
                                  onChange={e => setEscalateReason(e.target.value)}
                                  placeholder="e.g. Teacher requested medical relief or deadline exceeded by 48 hours..."
                                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setEscalateTaskId(null)}
                                    className="text-xs px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEscalateTask(task.id)}
                                    className="text-xs px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                                  >
                                    Confirm Escalation
                                  </button>
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
                      Teachers &amp; Academics
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
      
      {/* ========================================================= */}
      {/* MODAL: 1-CLICK SIS ENROLLMENT & DOSSIER (ADMISSIONS CRM)  */}
      {/* ========================================================= */}
      {convertModalEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                  🎓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">1-Click SIS Enrollment &amp; Dossier</h3>
                  <p className="text-[11px] text-slate-500">Verify documents and promote lead to active Student Profile</p>
                </div>
              </div>
              <button onClick={() => setConvertModalEnquiry(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{convertModalEnquiry.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grade / Target Class:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{convertModalEnquiry.target_grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Parent &amp; Phone:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{convertModalEnquiry.parent_name} ({convertModalEnquiry.phone})</span>
                </div>
              </div>

              {/* Document Readiness Summary */}
              <div className="p-2.5 rounded-xl border text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Academic Certificates &amp; Birth Records Verified by Admissions Desk
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Assign Classroom Section</label>
                <select 
                  value={convertSection} 
                  onChange={e => setConvertSection(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
                >
                  <option value="A">{convertModalEnquiry.target_grade}-A (Section A)</option>
                  <option value="B">{convertModalEnquiry.target_grade}-B (Section B)</option>
                </select>
              </div>

              {/* Admission Fee & Accounts Handoff Controls */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    One-Time Admission Fee Structure
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                    Accounts Auto-Sync
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Fee Amount (₹)</label>
                    <input
                      type="number"
                      value={convertAdmissionFee}
                      onChange={e => setConvertAdmissionFee(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Collection Status</label>
                    <select
                      value={convertFeeStatus}
                      onChange={e => setConvertFeeStatus(e.target.value as 'Paid' | 'Pending')}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                    >
                      <option value="Paid">✓ Paid Now (Immediate Receipt)</option>
                      <option value="Pending">⏳ Pending (Queue in Accounts)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Payment Method</label>
                  <select
                    value={convertPaymentMethod}
                    onChange={e => setConvertPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                  >
                    <option value="UPI (Google Pay)">UPI (Google Pay / PhonePe)</option>
                    <option value="Net Banking / NEFT">Net Banking / NEFT</option>
                    <option value="Debit / Credit Card">Debit / Credit Card (POS Counter)</option>
                    <option value="Demand Draft / Cheque">Demand Draft / Cheque</option>
                    <option value="Cash Payment">Cash Payment at Counter</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertModalEnquiry(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await api.convertEnquiryToStudent(convertModalEnquiry.id);
                    const updatedEnq = await api.getEnquiries();
                    setEnquiries(updatedEnq);
                    const updatedStudents = await api.getStudents();
                    setStudentsList(updatedStudents);
                    setConvertModalEnquiry(null);
                    triggerToast(`✓ ${convertModalEnquiry.student_name} officially enrolled into SIS with Section ${convertSection} allotment!`);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm Enrollment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: STAFF DOSSIER INSPECTOR                            */}
      {/* ========================================================= */}
      {selectedStaffForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 font-black flex items-center justify-center">
                  {selectedStaffForModal.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedStaffForModal.name}</h3>
                  <p className="text-xs text-slate-500">{selectedStaffForModal.role} • {selectedStaffForModal.department}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStaffForModal(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Monthly Compensation:</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">₹{selectedStaffForModal.salary.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Teaching Experience:</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedStaffForModal.experience || '8 Yrs Experience'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Leave Quota Balance:</span>
                  <span className="text-sm font-bold text-emerald-600">{(selectedStaffForModal.leaves_total || 12) - (selectedStaffForModal.leaves_taken || 2)} Days Remaining</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Total Leave Requests:</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedStaffForModal.requests_submitted || 2} Submitted</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assigned Classes &amp; Academic Duties:</span>
                <p className="text-slate-600 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  {selectedStaffForModal.assigned_duties || 'Homeroom Mentorship & Subject Classes'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Official Contact:</span>
                <p className="text-slate-600 dark:text-slate-300">{selectedStaffForModal.phone} &bull; {selectedStaffForModal.email}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedStaffForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW SCHOOL EVENT (PRINCIPAL AUTHORITY)          */}
      {/* ========================================================= */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                  🎉
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Announce New School Event</h3>
                  <p className="text-[11px] text-slate-500">Principal authority • Broadcast to all members</p>
                </div>
              </div>
              <button onClick={() => setShowAddEventModal(false)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newEventTitle.trim()) return;

                const createdEvt = {
                  id: schoolEvents.length + 1,
                  title: newEventTitle.trim(),
                  category: newEventCategory,
                  date: `${newEventDate} • ${newEventTime}`,
                  location: newEventLocation,
                  target_audience: newEventAudience,
                  description: newEventDesc || 'Official institutional event coordinated by Principal Office.',
                  status: 'Upcoming'
                };

                setSchoolEvents(prev => [createdEvt, ...prev]);

                // Broadcast notification to Parents, Students, and Staff
                await api.sendNotification({
                  recipient_role: 'parent',
                  sender_name: 'Dr. Radhakrishnan (Principal)',
                  sender_role: 'admin',
                  title: `📢 New School Event: ${newEventTitle}`,
                  message: `All parents and students are invited to "${newEventTitle}" scheduled on ${newEventDate} at ${newEventLocation}.`,
                  priority: 'Normal'
                });

                await api.sendNotification({
                  recipient_role: 'student',
                  sender_name: 'Principal Office',
                  sender_role: 'admin',
                  title: `🎉 School Event: ${newEventTitle}`,
                  message: `Join us for "${newEventTitle}" on ${newEventDate} at ${newEventLocation}.`,
                  priority: 'Normal'
                });

                setShowAddEventModal(false);
                setNewEventTitle('');
                setNewEventDesc('');
                triggerToast(`🎉 Event "${createdEvt.title}" officially announced and notifications broadcast!`);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Inter-School Robotics Championship 2026"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={e => setNewEventCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports Day</option>
                    <option value="Science Expo">Science &amp; Robotics</option>
                    <option value="PTM">Parent-Teacher Meet</option>
                    <option value="Holiday">School Holiday</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Audience</label>
                  <select
                    value={newEventAudience}
                    onChange={e => setNewEventAudience(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="All School">All School (Parents, Students, Staff)</option>
                    <option value="Parents & Students">Parents &amp; Students</option>
                    <option value="Staff Only">Staff Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                  <input
                    type="text"
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    placeholder="15 Nov 2026"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Time</label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={e => setNewEventTime(e.target.value)}
                    placeholder="09:30 AM"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Venue / Location</label>
                <input
                  type="text"
                  value={newEventLocation}
                  onChange={e => setNewEventLocation(e.target.value)}
                  placeholder="Main Auditorium & Open Air Grounds"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description &amp; Agenda</label>
                <textarea
                  rows={2}
                  value={newEventDesc}
                  onChange={e => setNewEventDesc(e.target.value)}
                  placeholder="Details regarding registration, schedule, and participation..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Megaphone className="h-4 w-4" />
                  <span>Broadcast Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
    </RoleGuard>
  );
}
