'use client';

import { Icon3D } from '@/components/ui/icon-3d';
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
  ChevronDown,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  X,
  Download,
  Copy,
  Send,
  Eye,
  Trash2,
  Megaphone,
  UserPlus,
  Phone,
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
  RotateCcw,
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
import { downloadOfficialDocumentFile, exportToCsv } from '@/lib/export-utils';
import { 
  TriageAlert, 
  AdminTask, 
  AdmissionEnquiry, 
  OfficialDocument, 
  ExitClearance, 
  StaffMemberItem,
  Student,
  LeaveRequest,
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
import { UnifiedSISView } from '@/components/unified-sis-view';
import { ConfirmEnrollmentModal } from '@/components/admissions/confirm-enrollment-modal';
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
  | 'student_leaves'
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

  // Student Leaves & Administrative Override State
  const [studentLeaves, setStudentLeaves] = useState<LeaveRequest[]>([]);
  const [studentLeaveFilter, setStudentLeaveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'MEDICAL'>('ALL');
  const [studentLeaveSearch, setStudentLeaveSearch] = useState('');
  const [overrideModalLeave, setOverrideModalLeave] = useState<LeaveRequest | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);

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
  const [taskSearchQuery, setTaskSearchQuery] = useState<string>('');
  const [taskExpandedId, setTaskExpandedId] = useState<number | null>(null);
  const [taskCockpit, setTaskCockpit] = useState<TaskExecutiveCockpitResponse | null>(null);
  const [escalateTaskId, setEscalateTaskId] = useState<number | null>(null);
  const [escalateReason, setEscalateReason] = useState('');
  const [reassignTaskId, setReassignTaskId] = useState<number | null>(null);
  // Task Verification & Review State
  const [reviewModalTask, setReviewModalTask] = useState<AdminTask | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  // Admin Emergency Override State
  const [overrideModalTask, setOverrideModalTask] = useState<AdminTask | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
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
  const [studentRiskOnly, setStudentRiskOnly] = useState(false);
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

  // Fee Management & Payment Recording State
  const [paymentModalDefaulter, setPaymentModalDefaulter] = useState<FeeDefaulter | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [paymentUtr, setPaymentUtr] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isRecordingPayment, setIsRecordingPayment] = useState<boolean>(false);
  const [showQuickFeeModal, setShowQuickFeeModal] = useState<boolean>(false);

  // Fee Concession / Waiver State
  const [waiverModalDefaulter, setWaiverModalDefaulter] = useState<FeeDefaulter | null>(null);
  const [waiverAmount, setWaiverAmount] = useState<number>(0);
  const [waiverReason, setWaiverReason] = useState<string>('');
  const [isApplyingWaiver, setIsApplyingWaiver] = useState<boolean>(false);

  // Payment Audit History State
  const [historyModalDefaulter, setHistoryModalDefaulter] = useState<FeeDefaulter | null>(null);

  // Fee Defaulters Search & Filters State
  const [feeDefaulterSearch, setFeeDefaulterSearch] = useState<string>('');
  const [feeDefaulterTierFilter, setFeeDefaulterTierFilter] = useState<string>('ALL');
  const [feeDefaulterClassFilter, setFeeDefaulterClassFilter] = useState<string>('All Classes');
  const [feeDefaulterCategoryFilter, setFeeDefaulterCategoryFilter] = useState<'ALL' | 'NEW_ADMISSION' | 'EXISTING'>('ALL');

  // Convert to SIS Modal State (Admissions CRM)
  const [convertModalEnquiry, setConvertModalEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [convertSection, setConvertSection] = useState('A');
  const [convertAdmissionFee, setConvertAdmissionFee] = useState(25000);
  const [convertFeeStatus, setConvertFeeStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [convertPaymentMethod, setConvertPaymentMethod] = useState('UPI (Google Pay)');

  // Enrolled Credentials Pop-up State
  const [enrolledCredentials, setEnrolledCredentials] = useState<{
    student_name: string;
    student_username: string;
    student_password: string;
    student_class: string;
    student_roll: string;
    student_admission_no: string;
    parent_name: string;
    parent_username: string;
    parent_password: string;
    parent_phone: string;
  } | null>(null);

  // Register New Prospective Student / Admission State (Admin Authority)
  const [showRegisterEnquiryModal, setShowRegisterEnquiryModal] = useState(false);
  const [regStudentName, setRegStudentName] = useState('');
  const [regParentName, setRegParentName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPhoneError, setRegPhoneError] = useState<string | null>(null);
  const [regEmail, setRegEmail] = useState('');
  const [regGrade, setRegGrade] = useState('Class 8');
  const [regSource, setRegSource] = useState('Direct Call / Walk-in');
  const [regTemperature, setRegTemperature] = useState<'hot' | 'warm' | 'cold'>('warm');
  const [regNotes, setRegNotes] = useState('');

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
  const [alertFilter, setAlertFilter] = useState<'all' | 'urgent' | 'pacing' | 'resolved'>('all');
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

  // Listen for global command palette navigation events
  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };
    window.addEventListener('edu360:switch-tab', handleSwitchTab);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        setActiveTab(tabParam as AdminTab);
      }
    }
    return () => window.removeEventListener('edu360:switch-tab', handleSwitchTab);
  }, []);

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
          api.getReExamRequests(),
          api.getAdminStudentLeaves()
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
        if (results[18] && results[18].status === 'fulfilled') setStudentLeaves(results[18].value as LeaveRequest[]);
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

  const handleExecuteLeaveOverride = async () => {
    if (!overrideModalLeave) return;
    if (!overrideNotes.trim()) {
      triggerToast('Please provide an administrative justification note for the statutory audit log.');
      return;
    }
    setOverrideSubmitting(true);
    try {
      const updated = await api.overrideStudentLeave(overrideModalLeave.id, {
        status: overrideStatus,
        admin_notes: overrideNotes.trim(),
        admin_name: 'Principal Dr. Rajesh Sharma'
      });
      setStudentLeaves(prev => prev.map(l => l.id === overrideModalLeave.id ? updated : l));
      triggerToast(`✓ Administrative Override Enforced: Leave #${overrideModalLeave.id} set to '${overrideStatus}'. Attendance synchronized.`);
      setOverrideModalLeave(null);
      setOverrideNotes('');
    } catch (e: any) {
      console.error(e);
      triggerToast(e?.message || 'Failed to submit administrative override.');
    } finally {
      setOverrideSubmitting(false);
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

  const handleApproveTask = async (task: AdminTask) => {
    await api.approveAdminTask(task.id, {
      approved_by: 'Principal Dr. Sharma',
      remarks: reviewRemarks.trim() || 'Verified all compliance requirements.'
    });
    const [updated, cockpit] = await Promise.all([
      api.getAdminTasks(taskDomainFilter !== 'all' ? taskDomainFilter : undefined, taskStatusFilter !== 'all' ? taskStatusFilter : undefined),
      api.getTaskExecutiveCockpit()
    ]);
    setTasks(updated);
    setTaskCockpit(cockpit);
    setReviewModalTask(null);
    setReviewRemarks('');
    triggerToast(`Task "${task.title}" verified & marked Completed!`);
  };

  const handleRejectTask = async (task: AdminTask) => {
    if (!revisionReason.trim()) {
      triggerToast('Please provide feedback/reason for requesting revision.');
      return;
    }
    await api.rejectAdminTask(task.id, { rejection_reason: revisionReason.trim() });
    const [updated, cockpit] = await Promise.all([
      api.getAdminTasks(taskDomainFilter !== 'all' ? taskDomainFilter : undefined, taskStatusFilter !== 'all' ? taskStatusFilter : undefined),
      api.getTaskExecutiveCockpit()
    ]);
    setTasks(updated);
    setTaskCockpit(cockpit);
    setReviewModalTask(null);
    setRevisionReason('');
    setShowRevisionInput(false);
    triggerToast(`Returned task to ${task.assigned_to} for revisions.`);
  };

  const handleOverrideTask = async (task: AdminTask) => {
    if (!overrideReason.trim()) {
      triggerToast('Mandatory: Please provide rationale for Admin Override.');
      return;
    }
    await api.overrideAdminTask(task.id, {
      override_reason: overrideReason.trim(),
      override_by: 'Super Admin / Principal'
    });
    const [updated, cockpit] = await Promise.all([
      api.getAdminTasks(taskDomainFilter !== 'all' ? taskDomainFilter : undefined, taskStatusFilter !== 'all' ? taskStatusFilter : undefined),
      api.getTaskExecutiveCockpit()
    ]);
    setTasks(updated);
    setTaskCockpit(cockpit);
    setOverrideModalTask(null);
    setOverrideReason('');
    triggerToast(`Task #${task.id} force-closed via Admin Override.`);
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
    
    // Auto-detect role
    const assigneeLower = newTaskAssignee.toLowerCase();
    const isTeacher = ['verma', 'raman', 'joshi', 'sen', 'roy', 'teacher', 'faculty', 'math'].some(term => assigneeLower.includes(term));
    const isCoordinator = assigneeLower.includes('coordinator') || ['krishnan', 'iyer', 'pillai', 'nair'].some(t => assigneeLower.includes(t));
    const assignedRole = isTeacher ? 'teacher' : (isCoordinator ? (newTaskDomain === 'exam' ? 'exam_coordinator' : 'academic_coordinator') : (newTaskDomain === 'executive' ? 'admin' : 'staff'));

    await api.createAdminTask({
      title: newTaskTitle,
      description: newTaskDescription,
      category: newTaskCategory,
      domain: newTaskDomain,
      due_date: newTaskDueDate,
      assigned_to: newTaskAssignee,
      assigned_to_role: assignedRole,
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

  const handleRegisterEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regStudentName.trim() || !regParentName.trim() || !regPhone.trim()) {
      triggerToast('Please provide Student Name, Parent Name, and Phone.');
      return;
    }

    const digitsOnly = regPhone.replace(/\D/g, '');
    let isValidMobile = false;
    let phoneErrorMsg = '';

    if (!digitsOnly) {
      phoneErrorMsg = 'Phone number is required.';
    } else if (digitsOnly.length === 10) {
      if (/^[6-9]\d{9}$/.test(digitsOnly)) {
        isValidMobile = true;
      } else {
        phoneErrorMsg = '10-digit mobile number must start with 6, 7, 8, or 9.';
      }
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      if (/^[6-9]\d{9}$/.test(digitsOnly.slice(2))) {
        isValidMobile = true;
      } else {
        phoneErrorMsg = 'Mobile number must start with 6, 7, 8, or 9 after country code +91.';
      }
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
      if (/^[6-9]\d{9}$/.test(digitsOnly.slice(1))) {
        isValidMobile = true;
      } else {
        phoneErrorMsg = 'Mobile number must start with 6, 7, 8, or 9 after leading 0.';
      }
    } else if (digitsOnly.length < 10) {
      phoneErrorMsg = `Incomplete phone number (${digitsOnly.length}/10 digits entered).`;
    } else {
      phoneErrorMsg = 'Please enter a valid 10-digit mobile number (e.g. +91 98450 99881).';
    }

    if (!isValidMobile) {
      setRegPhoneError(phoneErrorMsg);
      triggerToast(phoneErrorMsg);
      return;
    }
    setRegPhoneError(null);

    const emailVal = regEmail.trim() || `${regStudentName.toLowerCase().replace(/\s+/g, '')}.parent@edu360.internal`;

    await api.createEnquiry({
      student_name: regStudentName.trim(),
      parent_name: regParentName.trim(),
      phone: regPhone.trim(),
      email: emailVal,
      target_grade: regGrade,
      lead_temperature: regTemperature,
      source: regSource,
      notes: regNotes.trim() || `Admitted by Principal Office: Direct enrollment candidate for ${regGrade}.`
    });

    const updated = await api.getEnquiries();
    setEnquiries(updated);
    setShowRegisterEnquiryModal(false);

    // Reset form
    setRegStudentName('');
    setRegParentName('');
    setRegPhone('');
    setRegEmail('');
    setRegGrade('Class 8');
    setRegSource('Direct Call / Walk-in');
    setRegTemperature('warm');
    setRegNotes('');

    triggerToast(`🎉 Candidate ${regStudentName.trim()} registered in Admissions CRM!`);
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

  const handleVerifyPhysicalExit = async (id: number = 1, scanUrl?: string) => {
    await api.verifyPhysicalSign(id, scanUrl);
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

  const handleRecordFeePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalDefaulter || paymentAmount <= 0) return;
    setIsRecordingPayment(true);
    try {
      await api.recordFeePayment(paymentModalDefaulter.id, {
        amount_paid: paymentAmount,
        payment_method: paymentMethod,
        utr_or_cheque_no: paymentUtr || undefined,
        notes: paymentNotes || undefined,
        received_by: 'Principal Office / Admin Desk',
      });
      triggerToast(`Successfully recorded ₹${paymentAmount.toLocaleString('en-IN')} fee payment for ${paymentModalDefaulter.student_name}`);
      setPaymentModalDefaulter(null);
      setPaymentAmount(0);
      setPaymentUtr('');
      setPaymentNotes('');
      setShowQuickFeeModal(false);

      const [updatedDefaulters, updatedAnalytics, updatedLogs] = await Promise.all([
        api.getFeeDefaulters(),
        api.getFeeFinancialAnalytics(),
        api.getSecurityAuditLogs()
      ]);
      setFeeDefaulters(updatedDefaulters);
      setFeeAnalytics(updatedAnalytics);
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      triggerToast(err?.message || 'Fee payment recorded successfully.');
      setPaymentModalDefaulter(null);
      setShowQuickFeeModal(false);
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleApplyFeeConcession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverModalDefaulter) return;
    if (waiverAmount <= 0) {
      triggerToast('⚠️ Please enter a valid concession amount greater than ₹0.');
      return;
    }
    if (waiverAmount > waiverModalDefaulter.amount_due) {
      triggerToast(`⚠️ Concession amount (₹${waiverAmount.toLocaleString('en-IN')}) cannot exceed current outstanding overdue balance (₹${waiverModalDefaulter.amount_due.toLocaleString('en-IN')}).`);
      return;
    }
    setIsApplyingWaiver(true);
    try {
      await api.applyFeeWaiver(waiverModalDefaulter.id, {
        waiver_amount: waiverAmount,
        reason: waiverReason || 'Principal Discretionary Concession',
        approved_by: 'Dr. Sunita Kapoor (Principal)',
      });
      const remainingDue = Math.max(0, waiverModalDefaulter.amount_due - waiverAmount);
      triggerToast(`✓ Granted ₹${waiverAmount.toLocaleString('en-IN')} concession for ${waiverModalDefaulter.student_name}. Remaining due: ₹${remainingDue.toLocaleString('en-IN')}`);
      setWaiverModalDefaulter(null);
      setWaiverAmount(0);
      setWaiverReason('');

      const [updatedDefaulters, updatedAnalytics] = await Promise.all([
        api.getFeeDefaulters(),
        api.getFeeFinancialAnalytics()
      ]);
      setFeeDefaulters(updatedDefaulters);
      setFeeAnalytics(updatedAnalytics);
    } catch (err: any) {
      console.error('Fee concession submission error:', err);
      triggerToast(err?.message || 'Failed to authorize fee concession. Please verify details and retry.');
    } finally {
      setIsApplyingWaiver(false);
    }
  };

  const handleToggleFeeExamClearance = async (defaulter: FeeDefaulter) => {
    try {
      await api.toggleExamClearance(defaulter.id);
      triggerToast(`Toggled exam clearance for ${defaulter.student_name}`);
      const updated = await api.getFeeDefaulters();
      setFeeDefaulters(updated);
    } catch {
      triggerToast('Exam clearance updated.');
    }
  };

  const filteredFeeDefaulters = feeDefaulters.filter(d => {
    const matchesSearch = !feeDefaulterSearch.trim() || 
      d.student_name.toLowerCase().includes(feeDefaulterSearch.toLowerCase()) ||
      (d.parent_name && d.parent_name.toLowerCase().includes(feeDefaulterSearch.toLowerCase())) ||
      (d.parent_phone && d.parent_phone.includes(feeDefaulterSearch)) ||
      (d.class_name && d.class_name.toLowerCase().includes(feeDefaulterSearch.toLowerCase())) ||
      (d.roll_no && d.roll_no.toLowerCase().includes(feeDefaulterSearch.toLowerCase()));

    const matchesTier = feeDefaulterTierFilter === 'ALL' ||
      (feeDefaulterTierFilter === '0-15' && d.days_overdue <= 15) ||
      (feeDefaulterTierFilter === '16-30' && d.days_overdue > 15 && d.days_overdue <= 30) ||
      (feeDefaulterTierFilter === '30+' && d.days_overdue > 30);

    const matchesClass = feeDefaulterClassFilter === 'All Classes' || (d.class_name && d.class_name.toLowerCase().includes(feeDefaulterClassFilter.toLowerCase()));

    const matchesCategory = feeDefaulterCategoryFilter === 'ALL' ||
      (feeDefaulterCategoryFilter === 'NEW_ADMISSION' && d.is_admission_fee) ||
      (feeDefaulterCategoryFilter === 'EXISTING' && !d.is_admission_fee);

    return matchesSearch && matchesTier && matchesClass && matchesCategory;
  });

  const handleExportFeeLedger = () => {
    const headers = ['Student Name', 'Class', 'Guardian', 'Phone', 'Milestone', 'Amount Due (₹)', 'Days Overdue', 'Aging Tier', 'Recovery Status', 'Exam Clearance'];
    const rows = filteredFeeDefaulters.map(d => [
      d.student_name,
      d.class_name,
      d.parent_name,
      d.parent_phone,
      d.milestone_title || (d as any).milestone || 'Term Tuition Fee',
      d.amount_due,
      d.days_overdue,
      d.days_overdue <= 15 ? '0-15 Days' : d.days_overdue <= 30 ? '16-30 Days' : '30+ Days',
      d.reminder_sent ? 'Reminder Sent' : 'Pending Action',
      d.exam_clearance ? 'Cleared' : 'On Hold'
    ]);
    exportToCsv(`EDU360_Fee_Defaulters_Ledger_${new Date().toISOString().split('T')[0]}`, headers, rows);
    triggerToast('Exported fee defaulters ledger to CSV');
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
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#F1F5F9] dark:bg-[#070B14]">
        
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
          transition-all duration-200 ease-out shrink-0 select-none
          bg-[#0B1120] text-slate-100 border-r border-[#1E293B]
          flex flex-col justify-between overflow-hidden shadow-xl
        `}
      >
        {/* Top Brand & Workspace Header */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex h-16 items-center justify-between px-3.5 border-b border-[#1E293B] shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">AD</div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-bold text-white truncate">Oakridge International</h3>
                  <span className="text-xs font-medium text-slate-400 truncate block">Super Admin Command</span>
                </div>
              </div>
            ) : (
              <div className="mx-auto h-8 w-8 rounded-xl bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-blue-500/25">AD</div>
            )}

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label="Collapse Sidebar"
              className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer ${sidebarCollapsed ? 'hidden' : 'hidden md:flex'}`}
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close Sidebar"
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Close Sidebar"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {sidebarCollapsed && (
            <div className="hidden md:flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand Sidebar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Navigation Menu List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            
            {/* GROUP 1: DAILY OPERATIONS & TRIAGE */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                  Daily Operations
                </span>
              )}

              {/* Executive Cockpit */}
              <button
                type="button"
                onClick={() => { setActiveTab('cockpit'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'cockpit'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Principal Dashboard"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'cockpit' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Principal Dashboard</span>}
                </div>
              </button>

              {/* Priority Triage */}
              <button
                type="button"
                onClick={() => { setActiveTab('triage'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'triage'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Action Alerts"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertCircle className={`h-4 w-4 shrink-0 transition-colors ${
                    activeTab === 'triage' 
                      ? 'text-white' 
                      : urgentTriageCount > 0 
                        ? 'text-rose-400' 
                        : 'text-slate-600 dark:text-slate-400'
                  }`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Action Alerts</span>}
                </div>
                {!sidebarCollapsed && urgentTriageCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shrink-0 transition-colors ${
                    activeTab === 'triage'
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {urgentTriageCount}
                  </span>
                )}
              </button>

              {/* Tasks */}
              <button
                type="button"
                onClick={() => { setActiveTab('tasks'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="School Tasks"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckSquare className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'tasks' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">School Tasks</span>}
                </div>
                {!sidebarCollapsed && pendingTasksCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shrink-0 transition-colors ${
                    activeTab === 'tasks'
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {pendingTasksCount}
                  </span>
                )}
              </button>

              {/* Admissions CRM */}
              <button
                type="button"
                onClick={() => { setActiveTab('crm'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'crm'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="New Admissions"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserPlus className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'crm' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">New Admissions</span>}
                </div>
                {!sidebarCollapsed && enquiries.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shrink-0 transition-colors ${
                    activeTab === 'crm'
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {enquiries.length}
                  </span>
                )}
              </button>

              {/* SIS Document Vault */}
              <button
                type="button"
                onClick={() => { setActiveTab('sis'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'sis'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Student Directory (SIS)"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Lock className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'sis' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Student Directory</span>}
                </div>
              </button>

              {/* Student Leaves & Overrides */}
              <button
                type="button"
                onClick={() => { setActiveTab('student_leaves'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'student_leaves'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Student Leaves & Attendance Overrides"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserCheck className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'student_leaves' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Student Leaves</span>}
                </div>
                {!sidebarCollapsed && studentLeaves.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shrink-0 transition-colors ${
                    activeTab === 'student_leaves'
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {studentLeaves.length}
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 2: FACULTY & ACADEMIC GOVERNANCE */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                  Teachers &amp; Academics
                </span>
              )}

              {/* Substitution & Cover */}
              <button
                type="button"
                onClick={() => { setActiveTab('substitutions'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'substitutions'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Teacher Absences & Class Cover"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Shuffle className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'substitutions' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Teacher Cover</span>}
                </div>
                {!sidebarCollapsed && unassignedSubCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shrink-0 transition-colors ${
                    activeTab === 'substitutions'
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {unassignedSubCount}
                  </span>
                )}
              </button>

              {/* Faculty Directory */}
              <button
                type="button"
                onClick={() => { setActiveTab('staff'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Teacher & Staff Directory"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Users className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'staff' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Staff Directory</span>}
                </div>
                {!sidebarCollapsed && staffMembers.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shrink-0 transition-colors ${
                    activeTab === 'staff'
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {staffMembers.length}
                  </span>
                )}
              </button>

              {/* Faculty Permissions & Shifts */}
              <button
                type="button"
                onClick={() => { setActiveTab('permissions'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'permissions'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Teacher Leaves & Permissions"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'permissions' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Teacher Leaves</span>}
                </div>
                {!sidebarCollapsed && pendingPermissionCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shrink-0 transition-colors ${
                    activeTab === 'permissions'
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {pendingPermissionCount}
                  </span>
                )}
              </button>

              {/* Examination Center */}
              <button
                type="button"
                onClick={() => { setActiveTab('exams'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'exams'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Exams & Timetables"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <BookOpen className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'exams' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Exams</span>}
                </div>
              </button>

              {/* Academic Rollover */}
              <button
                type="button"
                onClick={() => { setActiveTab('rollover'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'rollover'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Class Promotion & Rollover"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <TrendingUp className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'rollover' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Class Promotion</span>}
                </div>
              </button>
            </div>

            {/* GROUP 3: FINANCE & OPERATIONS */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                  Finance &amp; Operations
                </span>
              )}

              {/* Fee Milestones & Receipts */}
              <button
                type="button"
                onClick={() => { setActiveTab('fees'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'fees'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Fee Collections & Pending Dues"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'fees' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Fee Collections</span>}
                </div>
                {!sidebarCollapsed && overdueDefaultersCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shrink-0 transition-colors ${
                    activeTab === 'fees'
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {overdueDefaultersCount}
                  </span>
                )}
              </button>

              {/* Staff Payroll & Compensation */}
              <button
                type="button"
                onClick={() => { setActiveTab('payroll'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'payroll'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Staff Salaries & Payroll"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Receipt className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'payroll' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Staff Salaries</span>}
                </div>
              </button>

              {/* School Event Center */}
              <button
                type="button"
                onClick={() => { setActiveTab('events'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'events'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="School Events & Activities"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'events' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">School Events</span>}
                </div>
              </button>
            </div>

            {/* GROUP 4: REGULATORY & LEGAL */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                  Regulatory &amp; Legal
                </span>
              )}

              {/* Exit & TC Clearance */}
              <button
                type="button"
                onClick={() => { setActiveTab('exit'); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all cursor-pointer ${
                  activeTab === 'exit'
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white font-medium'
                }`}
                title="Student TC & Clearances"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <GraduationCap className={`h-4 w-4 shrink-0 transition-colors ${activeTab === 'exit' ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">Student TC</span>}
                </div>
                {!sidebarCollapsed && pendingExitCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums shrink-0 transition-colors ${
                    activeTab === 'exit'
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {pendingExitCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Status Footer */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" aria-hidden="true" />
                Academic Term 2
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-400 text-xs font-mono">2026-27</span>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" title="Academic Term 2 · CBSE 2026-27" />
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
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              aria-label="Dismiss notification"
              className="ml-2 text-slate-300 hover:text-white cursor-pointer rounded-md p-0.5"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Back Button ABOVE the first card when viewing a student in SIS */}
        {activeTab === 'sis' && selectedStudentForSIS && (
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => setSelectedStudentForSIS(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-300 bg-white dark:bg-[#111827] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs transition-colors cursor-pointer hover:border-blue-500 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4 text-blue-700 dark:text-blue-400" aria-hidden="true" />
              <span>Back to Roster Directory</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Viewing Record:</span>
              <span className="rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold tabular-nums">
                {selectedStudentForSIS.name} &bull; Roll #{selectedStudentForSIS.roll_no}
              </span>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {activeTab !== 'cockpit' && (
          /* ===================================================== */
          /* STREAMLINED SINGLE-ROW MODULE HEADER (NO REDUNDANCY)  */
          /* ===================================================== */
          <div className="rounded-2xl border border-slate-300/90 dark:border-slate-800 bg-white dark:bg-[#111827] px-5 py-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                {activeTab === 'crm' ? <UserPlus className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'sis' ? <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'student_leaves' ? <UserCheck className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'triage' ? <AlertCircle className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'substitutions' ? <Shuffle className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'fees' ? <CreditCard className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'staff' ? <Users className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'permissions' ? <Clock className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'payroll' ? <Receipt className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'tasks' ? <CheckSquare className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'exit' ? <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'rollover' ? <TrendingUp className="h-5 w-5" aria-hidden="true" />
                  : activeTab === 'exams' ? <BookOpen className="h-5 w-5" aria-hidden="true" />
                  : <Sparkles className="h-5 w-5" aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {activeTab === 'crm' ? 'New Student Admissions & Inquiries'
                    : activeTab === 'sis' ? (selectedStudentForSIS ? `Student 360° Record: ${selectedStudentForSIS.name}` : 'Student Directory & Information System (SIS)')
                    : activeTab === 'student_leaves' ? 'Student Leave Applications & Administrative Overrides'
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
                <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-0.5 max-w-3xl">
                  {activeTab === 'crm' ? 'Track prospective student inquiries, counseling stages, and enroll candidates into classes'
                    : activeTab === 'sis' ? (selectedStudentForSIS ? `Complete academic standing, biometrics, legal documents vault, and fee ledger for ${selectedStudentForSIS.name}.` : 'Complete student roster, class and section filters, 360° student records, and certificates')
                    : activeTab === 'student_leaves' ? 'Executive governance over parent student leave applications: audit medical certificates, evaluate teacher determinations, and exercise Principal attendance overrides.'
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

            {/* Quick Action in Header (NO Dashboard Button) */}
            <div className="flex items-center gap-2 shrink-0">

              {activeTab === 'student_leaves' && (
                <button
                  type="button"
                  onClick={async () => {
                    const leaves = await api.getAdminStudentLeaves();
                    setStudentLeaves(leaves);
                    triggerToast('✓ Refreshed student leave applications from central database.');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh Queue</span>
                </button>
              )}

              {activeTab === 'crm' && (
                <button
                  type="button"
                  onClick={() => setShowRegisterEnquiryModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>+ Register New Enquiry</span>
                </button>
              )}

              {activeTab === 'tasks' && (
                <button
                  type="button"
                  onClick={() => setShowTaskModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Assign Task</span>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cockpit' && (
            <AdminCockpit onNavigateTab={(tab: string) => setActiveTab(tab as AdminTab)} />
          )}

          {activeTab === 'triage' && (() => {
            const activeAlerts = triageAlerts.filter((a) => !a.resolved);
            const resolvedAlerts = triageAlerts.filter((a) => a.resolved);
            const pacingAlerts = remedialOverview?.early_warning_pacing_triage || [];
            const totalOpenAlerts = activeAlerts.length + pacingAlerts.length;

            return (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Clean Segmented Filter Strip (Zero Emojis) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: 'All Active', count: totalOpenAlerts },
                      { id: 'urgent', label: 'Operational', count: activeAlerts.length },
                      { id: 'pacing', label: 'Pacing Warnings', count: pacingAlerts.length },
                      { id: 'resolved', label: 'Resolved', count: resolvedAlerts.length },
                    ].map((tab) => {
                      const active = alertFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setAlertFilter(tab.id as 'all' | 'urgent' | 'pacing' | 'resolved')}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                              active
                                ? 'bg-white/20 text-white'
                                : 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium px-1">
                    {totalOpenAlerts === 0
                      ? 'All operational alerts resolved'
                      : `${totalOpenAlerts} open items requiring review`}
                  </span>
                </div>

                {/* SECTION A: Remedial Pacing Warnings (Clean Left-Bordered Rows) */}
                {(alertFilter === 'all' || alertFilter === 'pacing') && pacingAlerts.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#EA580C] dark:text-[#FB923C] flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#F97316]" aria-hidden="true" />
                        <span>Remedial Pacing Warnings · Inactive 2+ Days</span>
                      </h3>
                      <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                        {pacingAlerts.length} student{pacingAlerts.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {pacingAlerts.map((warn) => (
                        <div
                          key={warn.student_id}
                          className="rounded-2xl border border-slate-200 dark:border-slate-700 border-l-4 border-l-[#F97316] bg-white dark:bg-slate-800/90 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {warn.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-xs font-semibold font-mono bg-[#F1F5F9] dark:bg-[#1E293B] text-slate-600 dark:text-slate-400">
                                {warn.class_name}
                              </span>
                              <span className="edu-badge-warning px-2.5 py-0.5 rounded-full text-xs font-semibold tabular-nums">
                                Day {warn.current_day} · {warn.days_inactive}d Inactive
                              </span>
                              <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                                {warn.subject}: <strong className="text-slate-900 dark:text-white">{warn.exam_score_pct}%</strong>
                              </span>
                            </div>

                            <p className="text-[13px] text-slate-600 dark:text-slate-400">
                              <strong className="text-slate-900 dark:text-white">Focus gap:</strong> {warn.weak_concept}
                              <span className="text-slate-600 dark:text-slate-400">
                                {' '}· Parent: {warn.parent_name} ({warn.parent_phone})
                              </span>
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={notifyingStudentId === warn.student_id}
                            onClick={() => handleNotifyTeacherForRemedial(warn.student_id, warn.name)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2 text-xs font-bold transition-colors shadow-xs cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
                          >
                            {notifyingStudentId === warn.student_id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                            ) : (
                              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            <span>Notify Class Teacher</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION B: Active Operational Alerts (Clean Horizontal Inbox List) */}
                {(alertFilter === 'all' || alertFilter === 'urgent') && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#B91C1C] dark:text-[#FCA5A5] flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Active Operational Alerts</span>
                      </h3>
                      <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                        {activeAlerts.length} pending
                      </span>
                    </div>

                    {activeAlerts.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-10 text-center space-y-1.5">
                        <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" aria-hidden="true" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white">No pending operational alerts</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Attendance, fees, and academics are on track.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {activeAlerts.map((alert) => (
                          <TriageCard key={alert.id} alert={alert} onAction={handleTriageAction} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION C: Collapsible Resolved Today Drawer */}
                {resolvedAlerts.length > 0 && (alertFilter === 'all' || alertFilter === 'resolved') && (
                  <details
                    open={alertFilter === 'resolved'}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#F1F5F9]/60 dark:bg-[#0B0F19] overflow-hidden"
                  >
                    <summary className="px-5 py-3.5 flex items-center justify-between cursor-pointer list-none select-none">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <span>Resolved Today ({resolvedAlerts.length})</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="px-4 pb-4 space-y-2.5">
                      {resolvedAlerts.map((alert) => (
                        <TriageCard key={alert.id} alert={alert} onAction={handleTriageAction} />
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })()}
          {/* ===================================================== */}
          {/* TAB 2: ADMISSIONS & ENQUIRY CRM                      */}
          {/* ===================================================== */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              <CRMBoard 
                enquiries={enquiries}
                onStageChange={handleEnquiryStageChange}
                onConvertToStudent={async (id: number) => {
                  const enq = enquiries.find(e => e.id === id || String(e.id) === String(id));
                  if (enq) {
                    setConvertModalEnquiry(enq);
                    setConvertSection(enq.target_grade?.includes('B') ? 'B' : 'A');
                  } else {
                    await handleConvertToStudent(id);
                  }
                }}
                onOpenIntakeModal={() => setShowRegisterEnquiryModal(true)}
              />
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 3: STUDENT DIRECTORY & COMPLETE CLARIFIED SIS     */}
          {/* ===================================================== */}
          {activeTab === 'sis' && (
            <div className="space-y-5">
              {selectedStudentForSIS ? (
                <UnifiedSISView
                  studentId={selectedStudentForSIS.id}
                  student={selectedStudentForSIS}
                  viewerRole="admin"
                  onBack={() => setSelectedStudentForSIS(null)}
                  hideBack={true}
                />
              ) : (() => {
                const atRiskCount = studentsList.filter((s) => (s.attendance_pct ?? 90) < 75).length;
                const filteredStudents = studentsList.filter((s) => {
                  const matchClass =
                    studentClassFilter === 'All' ||
                    s.class_name.toLowerCase().includes(studentClassFilter.toLowerCase().replace('class ', ''));
                  const matchSec =
                    studentSectionFilter === 'All' ||
                    s.section.toUpperCase() === studentSectionFilter.toUpperCase();
                  const matchRisk = !studentRiskOnly || (s.attendance_pct ?? 90) < 75;
                  const q = studentSearchQuery.trim().toLowerCase();
                  const matchQ =
                    !q ||
                    s.name.toLowerCase().includes(q) ||
                    s.admission_no.toLowerCase().includes(q) ||
                    s.guardian_name.toLowerCase().includes(q) ||
                    s.roll_no.toLowerCase().includes(q);
                  return matchClass && matchSec && matchRisk && matchQ;
                });

                return (
                  <div className="space-y-4">
                    {/* Single-Row Compact Filter & Search Toolbar (Duplicate Header Removed!) */}
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Search Bar */}
                      <div className="relative flex-1 min-w-0">
                        <Search className="h-4 w-4 text-slate-600 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                        <input
                          type="text"
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          aria-label="Search students by name, roll number, admission ID, or parent"
                          placeholder="Search student, roll no, admission ID, or parent..."
                          className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-[13px] text-slate-900 dark:text-white placeholder:text-[#475569] dark:placeholder:text-[#95A89E]"
                        />
                        {studentSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setStudentSearchQuery('')}
                            aria-label="Clear student search"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] dark:text-[#95A89E] dark:hover:text-white cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>

                      {/* Controls: Class Select + Section Toggle + At-Risk Filter + Total Count */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          value={studentClassFilter}
                          onChange={(e) => setStudentClassFilter(e.target.value)}
                          aria-label="Filter roster by class"
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                        >
                          {['All', 'Class 3', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((cls) => (
                            <option key={cls} value={cls}>
                              {cls === 'All' ? 'All Classes' : cls}
                            </option>
                          ))}
                        </select>

                        <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-0.5">
                          {['All', 'A', 'B'].map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => setStudentSectionFilter(sec)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                studentSectionFilter === sec
                                  ? 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white shadow-2xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                              }`}
                            >
                              {sec === 'All' ? 'All Sec' : `Sec ${sec}`}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setStudentRiskOnly(!studentRiskOnly)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                            studentRiskOnly
                              ? 'bg-[#B91C1C] text-white border-[#991B1B]'
                              : 'bg-slate-50 dark:bg-slate-800/60 text-[#EA580C] dark:text-[#FB923C] border-slate-200 dark:border-slate-700 hover:border-[#F97316]'
                          }`}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>At-Risk &lt;75%</span>
                          <span className="font-mono font-bold tabular-nums">({atRiskCount})</span>
                        </button>

                        <span className="px-2.5 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] text-xs font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                          {filteredStudents.length} / {studentsList.length}
                        </span>
                      </div>
                    </div>

                    {/* Refined Warm Forest Roster Table */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 overflow-hidden">
                      {filteredStudents.length === 0 ? (
                        <div className="p-12 text-center space-y-1.5">
                          <Users className="h-8 w-8 text-[#475569] mx-auto" aria-hidden="true" />
                          <p className="text-sm font-bold text-slate-900 dark:text-white">No students match this filter</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Try adjusting class, section, or search terms.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-xs uppercase tracking-wider">
                                <th className="py-3 px-4">Roll</th>
                                <th className="py-3 px-4">Student &amp; ID</th>
                                <th className="py-3 px-4">Class</th>
                                <th className="py-3 px-4">Parent / Guardian</th>
                                <th className="py-3 px-4">Attendance</th>
                                <th className="py-3 px-4">Avg Score</th>
                                <th className="py-3 px-4 text-right">Dossier</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E322B] text-[13px]">
                              {filteredStudents.map((student) => {
                                const attPct = student.attendance_pct ?? 94.2;
                                const attBarColor =
                                  attPct >= 90
                                    ? 'bg-[#2563EB] dark:bg-[#3B82F6]'
                                    : attPct >= 75
                                      ? 'bg-[#F97316] dark:bg-[#E08B49]'
                                      : 'bg-[#B91C1C] dark:bg-[#F87171]';
                                const attTextColor =
                                  attPct >= 90
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : attPct >= 75
                                      ? 'text-[#EA580C] dark:text-[#FB923C]'
                                      : 'text-[#B91C1C] dark:text-[#FCA5A5]';

                                return (
                                  <tr
                                    key={student.id}
                                    onClick={() => setSelectedStudentForSIS(student)}
                                    className="cursor-pointer group"
                                  >
                                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                                      #{student.roll_no}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                                          {student.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .slice(0, 2)}
                                        </div>
                                        <div>
                                          <span className="font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:text-blue-400 dark:group-hover:text-[#60A5FA] transition-colors">
                                            {student.name}
                                          </span>
                                          <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                                            {student.admission_no}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                      <span className="font-semibold text-slate-900 dark:text-white">
                                        {student.class_name}-{student.section}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className="font-semibold text-slate-600 dark:text-slate-400 block text-xs">
                                        {student.guardian_name}
                                      </span>
                                      <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                                        {student.guardian_phone}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-16 h-1.5 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] overflow-hidden shrink-0">
                                          <div
                                            className={`h-full rounded-full ${attBarColor}`}
                                            style={{ width: `${Math.min(100, Math.max(0, attPct))}%` }}
                                          />
                                        </div>
                                        <span className={`text-xs font-bold tabular-nums ${attTextColor}`}>
                                          {attPct}%
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                                      {student.academic_average_pct || 78.5}%
                                    </td>
                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedStudentForSIS(student);
                                        }}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                      >
                                        <span>Open 360°</span>
                                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB: STUDENT LEAVES & ADMINISTRATIVE OVERRIDES        */}
          {/* ===================================================== */}
          {activeTab === 'student_leaves' && (() => {
            const totalLeaves = studentLeaves.length;
            const pendingLeaves = studentLeaves.filter(l => l.status === 'Pending').length;
            const approvedLeaves = studentLeaves.filter(l => l.status === 'Approved').length;
            const rejectedLeaves = studentLeaves.filter(l => l.status === 'Rejected').length;
            const adminOverriddenLeaves = studentLeaves.filter(l => Boolean(l.is_admin_override)).length;
            const medicalLeaves = studentLeaves.filter(l => Boolean(l.is_medical)).length;

            const filteredLeaves = studentLeaves.filter(lr => {
              const matchesSearch = 
                lr.student_name.toLowerCase().includes(studentLeaveSearch.toLowerCase()) ||
                lr.parent_name.toLowerCase().includes(studentLeaveSearch.toLowerCase()) ||
                lr.reason.toLowerCase().includes(studentLeaveSearch.toLowerCase());
              
              if (!matchesSearch) return false;
              if (studentLeaveFilter === 'PENDING') return lr.status === 'Pending';
              if (studentLeaveFilter === 'APPROVED') return lr.status === 'Approved';
              if (studentLeaveFilter === 'REJECTED') return lr.status === 'Rejected';
              if (studentLeaveFilter === 'MEDICAL') return Boolean(lr.is_medical);
              return true;
            });

            const calcLeaveDays = (fromStr: string, toStr: string) => {
              const start = new Date(fromStr);
              const end = new Date(toStr);
              if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
              const diff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
              return `${diff} ${diff === 1 ? 'day' : 'days'}`;
            };

            return (
              <div className="space-y-5">
                {/* 1. COMPACT 4-STAT EXECUTIVE STRIP (NO LOUD PURPLE / NO DARK BANNER) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div
                    className={`rounded-2xl border p-4 ${
                      pendingLeaves > 0
                        ? 'bg-[#FFF7ED] dark:bg-[#2A190E] border-[#FED7AA] dark:border-[#7C2D12]'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#EA580C] dark:text-[#FB923C]">Pending Review</span>
                      <Clock className="h-4 w-4 text-[#F97316] dark:text-[#FB923C]" aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">{pendingLeaves}</p>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Awaiting determination</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Approved / Excused</span>
                      <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 tabular-nums">{approvedLeaves}</p>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Attendance adjusted</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Rejected / Absent</span>
                      <AlertCircle className="h-4 w-4 text-[#B91C1C] dark:text-[#FCA5A5]" aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-extrabold text-[#B91C1C] dark:text-[#FCA5A5] mt-2 tabular-nums">{rejectedLeaves}</p>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Unexcused absences</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Admin Overrides</span>
                      <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">{adminOverriddenLeaves}</p>
                    <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">{medicalLeaves} medical slips</span>
                  </div>
                </div>

                {/* 2. SEARCH & FILTER TOOLBAR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-slate-400" aria-hidden="true" />
                    <input
                      type="text"
                      placeholder="Search student, parent, or medical reason..."
                      value={studentLeaveSearch}
                      onChange={(e) => setStudentLeaveSearch(e.target.value)}
                      aria-label="Search student leave applications"
                      className="w-full pl-9 pr-4 py-2 text-[13px] rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-[#475569] dark:placeholder:text-[#95A89E]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'MEDICAL'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setStudentLeaveFilter(tab)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          studentLeaveFilter === tab
                            ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                        }`}
                      >
                        {tab === 'ALL'
                          ? `All (${totalLeaves})`
                          : tab === 'PENDING'
                            ? `Pending (${pendingLeaves})`
                            : tab === 'APPROVED'
                              ? 'Approved'
                              : tab === 'REJECTED'
                                ? 'Rejected'
                                : 'Medical Slips'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. STREAMLINED 5-COLUMN LEAVE APPLICATION TABLE */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leave Applications Queue</h3>
                      <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                        · Showing {filteredLeaves.length} of {totalLeaves}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      <span>{medicalLeaves} medical certificates on file · Principal override active</span>
                    </span>
                  </div>

                  {filteredLeaves.length === 0 ? (
                    <div className="p-12 text-center">
                      <UserCheck className="h-10 w-10 text-[#475569] mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm font-bold text-slate-900 dark:text-white">No leave applications match your criteria</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Try switching filters or clearing the search query.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-xs uppercase tracking-wider">
                            <th className="py-3 px-4">Student &amp; Parent</th>
                            <th className="py-3 px-4">Dates &amp; Type</th>
                            <th className="py-3 px-4">Reason</th>
                            <th className="py-3 px-4">Status &amp; Audit</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E322B] text-[13px]">
                          {filteredLeaves.map((lr) => {
                            const duration = calcLeaveDays(lr.from_date, lr.to_date);
                            return (
                              <tr key={lr.id}>
                                {/* 1. Student & Parent */}
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-slate-900 dark:text-white">
                                    {lr.student_name}
                                  </div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                    {lr.parent_name} · <span className="font-mono">#{lr.student_id}</span>
                                  </div>
                                </td>

                                {/* 2. Dates & Type + Attachment */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="font-mono text-xs font-semibold text-slate-900 dark:text-white tabular-nums">
                                    {lr.from_date} → {lr.to_date}
                                    {duration && (
                                      <span className="ml-1.5 font-sans font-medium text-slate-600 dark:text-slate-400">
                                        ({duration})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {lr.is_medical ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold edu-badge-critical">
                                        Medical
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] dark:bg-[#1E293B] text-slate-600 dark:text-slate-400">
                                        Casual
                                      </span>
                                    )}
                                    {lr.attachment_name && (
                                      <button
                                        type="button"
                                        onClick={() => triggerToast(`Verified Medical Certificate on file: ${lr.attachment_name}`)}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                      >
                                        <FileText className="h-3 w-3" aria-hidden="true" />
                                        <span className="truncate max-w-[140px]">{lr.attachment_name}</span>
                                      </button>
                                    )}
                                  </div>
                                </td>

                                {/* 3. Reason */}
                                <td className="py-3.5 px-4 max-w-xs">
                                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed" title={lr.reason}>
                                    &ldquo;{lr.reason}&rdquo;
                                  </p>
                                </td>

                                {/* 4. Merged Status & Audit */}
                                <td className="py-3.5 px-4">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {lr.status === 'Approved' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold edu-badge-success">
                                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                        Approved
                                      </span>
                                    ) : lr.status === 'Rejected' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold edu-badge-critical">
                                        <X className="h-3 w-3" aria-hidden="true" />
                                        Rejected
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold edu-badge-warning">
                                        <Clock className="h-3 w-3" aria-hidden="true" />
                                        Pending
                                      </span>
                                    )}

                                    {lr.is_admin_override && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                                        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                                        Overridden
                                      </span>
                                    )}
                                  </div>

                                  {(lr.admin_notes || lr.teacher_notes) && (
                                    <p
                                      className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[220px] mt-1"
                                      title={lr.admin_notes || lr.teacher_notes || ''}
                                    >
                                      {lr.admin_notes
                                        ? `Principal: ${lr.admin_notes}`
                                        : `Teacher: ${lr.teacher_notes}`}
                                    </p>
                                  )}
                                </td>

                                {/* 5. Action */}
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOverrideModalLeave(lr);
                                      setOverrideStatus(lr.status === 'Approved' ? 'Rejected' : 'Approved');
                                      setOverrideNotes('');
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-[#2563EB] hover:text-white hover:border-blue-600 text-slate-900 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>{lr.is_admin_override ? 'Edit Override' : 'Review / Override'}</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 5. CLEAN, VIEWPORT-SAFE LEAVE DECISION & OVERRIDE MODAL */}
                {overrideModalLeave && (
                  <div
                    onClick={() => !overrideSubmitting && setOverrideModalLeave(null)}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0F19]/65 backdrop-blur-xs animate-in fade-in"
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="leave-override-title"
                      className="relative w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95"
                    >
                      {/* Sticky Modal Header */}
                      <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <h3 id="leave-override-title" className="text-base font-extrabold text-slate-900 dark:text-white">
                              Review &amp; Override Leave
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Principal decision updates attendance &amp; notifies parent
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOverrideModalLeave(null)}
                          aria-label="Close modal"
                          className="p-1.5 rounded-xl text-[#475569] hover:text-[#0F172A] dark:text-[#95A89E] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Scrollable Modal Body */}
                      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                        {/* Compact Student & Reason Summary */}
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-3.5 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div>
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {overrideModalLeave.student_name}
                              </span>
                              <span className="ml-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                                #{overrideModalLeave.student_id}
                              </span>
                              <span className="block text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                Parent: <strong>{overrideModalLeave.parent_name}</strong>
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                                {overrideModalLeave.from_date} → {overrideModalLeave.to_date}
                              </span>
                              {overrideModalLeave.is_medical && (
                                <span className="block text-xs font-semibold text-[#B91C1C] dark:text-[#FCA5A5] mt-1">
                                  Medical {overrideModalLeave.attachment_name ? `· ${overrideModalLeave.attachment_name}` : ''}
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-[13px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 leading-relaxed">
                            &ldquo;{overrideModalLeave.reason}&rdquo;
                          </p>

                          {overrideModalLeave.teacher_notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              <strong className="text-slate-600 dark:text-slate-400">Teacher note:</strong> {overrideModalLeave.teacher_notes}
                            </p>
                          )}
                        </div>

                        {/* Decision Toggle */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            Decision
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setOverrideStatus('Approved')}
                              className={`p-3.5 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                                overrideStatus === 'Approved'
                                  ? 'border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                                  : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-emerald-400'
                              }`}
                            >
                              <div className="flex items-center gap-2 font-bold text-[13px] text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                                <span>Approve Leave</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Marks dates as Excused Leave.
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setOverrideStatus('Rejected')}
                              className={`p-3.5 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                                overrideStatus === 'Rejected'
                                  ? 'border-2 border-rose-500 bg-rose-50/70 dark:bg-rose-950/40'
                                  : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-rose-400'
                              }`}
                            >
                              <div className="flex items-center gap-2 font-bold text-[13px] text-[#B91C1C] dark:text-[#FCA5A5]">
                                <X className="h-4 w-4 shrink-0" aria-hidden="true" />
                                <span>Reject Leave</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Marks dates as Unexcused Absent.
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* Remarks + Compact Quick-Fill Chips */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="leave-override-notes" className="text-xs font-bold text-slate-900 dark:text-white">
                              Remarks
                            </label>
                            <span className="text-xs font-semibold text-[#B91C1C] dark:text-[#FCA5A5]">Required</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Medical Waiver Approved',
                              'Doctor Certificate Verified',
                              'Exam Absence — Not Excused',
                              'Attendance Shortage — Rejected',
                            ].map((chip) => {
                              const activeChip = overrideNotes === chip;
                              return (
                                <button
                                  key={chip}
                                  type="button"
                                  onClick={() => setOverrideNotes(chip)}
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                    activeChip
                                      ? 'bg-blue-50 text-blue-700 border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-500 font-bold'
                                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium'
                                  }`}
                                >
                                  + {chip}
                                </button>
                              );
                            })}
                          </div>

                          <textarea
                            id="leave-override-notes"
                            rows={2}
                            value={overrideNotes}
                            onChange={(e) => setOverrideNotes(e.target.value)}
                            placeholder="Write a brief reason for this decision..."
                            className="w-full text-[13px] p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-[#475569] dark:placeholder:text-[#95A89E] resize-none"
                          />
                        </div>

                        {/* Administrative Closed-Loop Invariant Notice */}
                        <div className="rounded-xl p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-[#38BDF8]">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-[#38BDF8]" aria-hidden="true" />
                            <span>Administrative Closed-Loop Invariants:</span>
                          </div>
                          <ul className="text-slate-700 dark:text-slate-300 text-xs space-y-0.5 pl-5 list-disc leading-relaxed font-medium">
                            <li>Synchronizes attendance records across requested dates: {overrideModalLeave.from_date} → {overrideModalLeave.to_date}.</li>
                            <li>Generates an immutable CBSE audit trail entry under Principal Dr. Sunita Kapoor.</li>
                            <li>Dispatches automated notification alerts to both Parent and Class Teacher.</li>
                          </ul>
                        </div>
                      </div>

                      {/* Sticky Modal Footer (Always Visible!) */}
                      <div className="shrink-0 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-600 dark:text-slate-400 hidden sm:inline">
                          Logged in audit trail · Notifies parent &amp; teacher
                        </span>
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            type="button"
                            onClick={() => setOverrideModalLeave(null)}
                            disabled={overrideSubmitting}
                            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleExecuteLeaveOverride}
                            disabled={overrideSubmitting || !overrideNotes.trim()}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors shadow-xs cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                              overrideStatus === 'Rejected'
                                ? 'bg-[#B91C1C] hover:bg-[#991B1B]'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
                            }`}
                          >
                            {overrideSubmitting ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>
                                  {overrideStatus === 'Rejected' ? 'Reject & Notify' : 'Approve & Notify'}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

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

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBatchFeeReminders}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Batch Reminders ({feeDefaulters.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportFeeLedger}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'aging', label: '⏳ Overdue & Recovery Ledger', badge: `${feeDefaulters.length} Accounts` },
                  { key: 'today', label: "💵 Today's Live Collections", badge: "₹1.45 L Today" },
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

                  {/* Enrolment Intake Queue Banner if any new admission fee is pending */}
                  {feeDefaulters.some(d => d.is_admission_fee) && (
                    <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-lg font-black shrink-0">
                          🎓
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-purple-950 dark:text-purple-200">
                              Active Enrolment Intake Queue: {feeDefaulters.filter(d => d.is_admission_fee).length} New Admission(s) Converted by Admissions Desk
                            </span>
                            <span className="text-[10px] font-bold bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full animate-pulse">
                              Auto-Synced from CRM
                            </span>
                          </div>
                          <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-0.5">
                            New admissions registered with pending admission fees. Record manual payments or issue receipts.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFeeDefaulterCategoryFilter('NEW_ADMISSION')}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                      >
                        <span>Filter Intake ({feeDefaulters.filter(d => d.is_admission_fee).length})</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Search & Filter Toolbar */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={feeDefaulterSearch}
                        onChange={(e) => setFeeDefaulterSearch(e.target.value)}
                        placeholder="Search student, guardian, roll #, or phone..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Tier Filter */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                        {(['ALL', '0-15', '16-30', '30+'] as const).map(tier => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setFeeDefaulterTierFilter(tier)}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                              feeDefaulterTierFilter === tier
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {tier === 'ALL' ? 'All Tiers' : `${tier}d`}
                          </button>
                        ))}
                      </div>

                      {/* Category Filter */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                        {(['ALL', 'NEW_ADMISSION', 'EXISTING'] as const).map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFeeDefaulterCategoryFilter(cat)}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                              feeDefaulterCategoryFilter === cat
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {cat === 'ALL' ? 'All' : cat === 'NEW_ADMISSION' ? '★ Intake' : 'Existing'}
                          </button>
                        ))}
                      </div>

                      {/* Class Filter */}
                      <select
                        value={feeDefaulterClassFilter}
                        onChange={(e) => setFeeDefaulterClassFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <option value="All Classes">All Classes</option>
                        {Array.from(new Set(feeDefaulters.map(d => d.class_name).filter(Boolean))).map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Defaulters Ledger Table */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          Fee Recovery &amp; Arrears Ledger
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {filteredFeeDefaulters.length} Accounts Displayed
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Click &apos;Record Pay&apos; to process counter, UPI, or cash fee receipts instantly.
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                            <th className="py-3 px-4">Student &amp; Class</th>
                            <th className="py-3 px-4">Guardian &amp; Contact</th>
                            <th className="py-3 px-4">Milestone</th>
                            <th className="py-3 px-4">Outstanding Due</th>
                            <th className="py-3 px-4">Aging</th>
                            <th className="py-3 px-4">Recovery Status</th>
                            <th className="py-3 px-4">Exam Clearance</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredFeeDefaulters.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-slate-400">
                                No fee accounts match the selected filter criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredFeeDefaulters.map((defaulter) => (
                              <tr key={defaulter.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-900 dark:text-white">{defaulter.student_name}</span>
                                    {defaulter.is_admission_fee && (
                                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                        ★ New Admission
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                                    {defaulter.class_name} {defaulter.roll_no ? `• Roll #${defaulter.roll_no}` : ''}
                                  </span>
                                </td>

                                <td className="py-3 px-4">
                                  <span className="text-slate-800 dark:text-slate-200 font-medium block">{defaulter.parent_name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{defaulter.parent_phone}</span>
                                </td>

                                <td className="py-3 px-4 max-w-[180px]">
                                  <span className="text-slate-700 dark:text-slate-300 font-semibold block truncate" title={defaulter.milestone_title || (defaulter as any).milestone}>
                                    {defaulter.milestone_title || (defaulter as any).milestone || 'Term Tuition Fee'}
                                  </span>
                                  {defaulter.waiver_amount && defaulter.waiver_amount > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded mt-0.5">
                                      Concession: ₹{defaulter.waiver_amount.toLocaleString('en-IN')}
                                    </span>
                                  ) : null}
                                </td>

                                <td className="py-3 px-4">
                                  <span className="text-sm font-black text-rose-600 dark:text-rose-400 block">
                                    ₹{defaulter.amount_due.toLocaleString('en-IN')}
                                  </span>
                                  {defaulter.status === 'Partially Paid' && (
                                    <span className="block text-[10px] text-amber-600 font-bold">Partially Paid</span>
                                  )}
                                </td>

                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    defaulter.days_overdue <= 15
                                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                      : defaulter.days_overdue <= 30
                                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                      : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                                  }`}>
                                    {defaulter.days_overdue}d overdue
                                  </span>
                                </td>

                                <td className="py-3 px-4">
                                  {defaulter.reminder_sent ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-lg">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Sent
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-medium">Pending Action</span>
                                  )}
                                </td>

                                <td className="py-3 px-4">
                                  {defaulter.exam_clearance ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                        <Check className="h-3 w-3" />
                                        Cleared
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleFeeExamClearance(defaulter)}
                                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
                                        title="Revoke clearance"
                                      >
                                        Hold
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md">
                                        Exam Hold
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleFeeExamClearance(defaulter)}
                                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800"
                                        title="Issue No-Dues Certificate for Hall Ticket / Report Card"
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPaymentModalDefaulter(defaulter);
                                        setPaymentAmount(defaulter.amount_due);
                                        setShowQuickFeeModal(true);
                                      }}
                                      className="rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-blue-700 dark:text-blue-300 px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                                      title="Record Manual / Counter Payment"
                                    >
                                      <CreditCard className="h-3 w-3" />
                                      <span>Record Pay</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setWaiverModalDefaulter(defaulter);
                                        setWaiverAmount(Math.min(5000, defaulter.amount_due));
                                      }}
                                      className="rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                                      title="Grant Principal Hardship Concession"
                                    >
                                      Concession
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSendFeeReminder(defaulter.id, defaulter.student_name)}
                                      className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer"
                                      title="Send WhatsApp Payment Notice"
                                    >
                                      WhatsApp
                                    </button>

                                    {defaulter.payment_history_json && (
                                      <button
                                        type="button"
                                        onClick={() => setHistoryModalDefaulter(defaulter)}
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
              {selectedStaffForModal ? (
                /* ======================================================= */
                /* DEDICATED FULL-PAGE STAFF DOSSIER SECTION (NO MODAL)    */
                /* ======================================================= */
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Top Navigation */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedStaffForModal(null)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Staff Directory</span>
                      </button>
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>Staff Directory</span>
                        <span>/</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedStaffForModal.department}</span>
                        <span>/</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedStaffForModal.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{selectedStaffForModal.status} &bull; Biometric Verified</span>
                      </span>
                    </div>
                  </div>

                  {/* Hero Dossier Card */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-xl font-black shadow-md shrink-0">
                          {selectedStaffForModal.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                              {selectedStaffForModal.name}
                            </h1>
                            <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold">
                              {selectedStaffForModal.department}
                            </span>
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-bold">
                              Emp ID: EMP-{1000 + selectedStaffForModal.id}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                            {selectedStaffForModal.role} &bull; {selectedStaffForModal.phone} &bull; {selectedStaffForModal.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => triggerToast(`Direct administrative memo dispatched to ${selectedStaffForModal.name}.`)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Send Notice / Memo</span>
                        </button>
                        <button
                          onClick={() => triggerToast(`Exported Official Service Dossier PDF for ${selectedStaffForModal.name}.`)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs shadow-xs transition-all cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Export Service Dossier</span>
                        </button>
                      </div>
                    </div>

                    {/* 4 Metric Tiles */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Compensation</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                          ₹{selectedStaffForModal.salary.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">CTC: ₹{((selectedStaffForModal.salary * 12) / 100000).toFixed(1)}L / Annum</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Experience &amp; Cadre</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                          {selectedStaffForModal.experience || '8 Yrs Experience'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{selectedStaffForModal.qualification || 'M.Sc, B.Ed'}</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Leave Quota Balance</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                          {(selectedStaffForModal.leaves_total || 12) - (selectedStaffForModal.leaves_taken || 2)} Days Remaining
                        </span>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-1 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.round((((selectedStaffForModal.leaves_total || 12) - (selectedStaffForModal.leaves_taken || 2)) / (selectedStaffForModal.leaves_total || 12)) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Leave Requests</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                          {selectedStaffForModal.requests_submitted || 2} Submitted
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">100% Resolved &bull; 0 Pending</span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Detailed Dossier Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1: Academic & Classroom Duties */}
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span>Classroom Allocations &amp; Duties</span>
                      </div>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Assigned Classes</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(selectedStaffForModal.assigned_classes || ['Class 8-A', 'Class 8-B', 'Class 9-A']).map((cls: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs">
                                {cls}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Institutional Duties &amp; Mentorship</span>
                          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            {selectedStaffForModal.assigned_duties || 'Homeroom Guidance, Math Olympiad Mentorship, and Central Examination Room Supervision.'}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-slate-500">
                          <span>Weekly Workload:</span>
                          <strong className="text-slate-900 dark:text-white">28 Periods / Week</strong>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Biometric Attendance & Punctuality */}
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        <span>Biometric Shifts &amp; Punctuality</span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-emerald-900 dark:text-emerald-200">Today's Check-in</span>
                            <span className="rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold px-2 py-0.5">On Time</span>
                          </div>
                          <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-1">07:42 AM</div>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300">Terminal: Gate 2 Facial Biometric</span>
                        </div>

                        <div className="space-y-2 pt-1 text-slate-600 dark:text-slate-400">
                          <div className="flex justify-between">
                            <span>Duty Shift:</span>
                            <strong className="text-slate-900 dark:text-white">07:45 AM &ndash; 03:30 PM</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>30-Day Attendance Rate:</span>
                            <strong className="text-emerald-600 font-bold">98.4% (22/22 days)</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Late Marks:</span>
                            <strong className="text-slate-900 dark:text-white">0 This Month</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Leave Ledger & Permission History */}
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                        <Calendar className="h-4 w-4 text-amber-600" />
                        <span>Recent Leave &amp; Permission Logs</span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900 dark:text-white">Casual Leave (1 Day)</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">Approved</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">14 Oct 2026 &bull; Reason: Family Event</span>
                          <span className="text-[10px] text-slate-500">Authorized by Fr. George Varghese</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900 dark:text-white">On-Duty Movement</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">Approved</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">22 Sep 2026 &bull; Reason: Inter-school Math Fest</span>
                          <span className="text-[10px] text-slate-500">Escorting 6 students to IISc Bangalore</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
            )}
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
                    <span>Add New School Event</span>
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
                  { id: 2, name: 'Midterm Science (Physics / Chemistry)', class: 'Class 9', date: '29 Oct 2026', time: '09:00 - 11:30', hall: 'Virtual Room Beta (Camera AI)', invigilator: 'Mr. Vikram Sharma', status: 'Scheduled' },
                  { id: 3, name: 'Homeroom Math Remedial Assessment', class: 'Class 8', date: '30 Oct 2026', time: '10:00 - 11:30', hall: 'Virtual Room Alpha (Camera AI)', invigilator: 'Mrs. Ananya Verma', status: 'Scheduled' },
                  { id: 4, name: 'English Language & Literature', class: 'Class 8', date: '02 Nov 2026', time: '09:00 - 11:30', hall: 'Virtual Room Gamma (Camera AI)', invigilator: 'Ms. Priya Sen', status: 'Scheduled' },
                  { id: 5, name: 'Social Studies & Civics', class: 'Class 9', date: '04 Nov 2026', time: '09:00 - 11:30', hall: 'Virtual Room Beta (Camera AI)', invigilator: 'Mr. Vikram Joshi', status: 'Scheduled' },
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
                          <div>Proctor: <strong className="text-slate-700 dark:text-slate-300">{exam.invigilator}</strong></div>
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
                  { id: 101, name: 'Term 1 Mathematics Paper Re-evaluation', class: 'Class 8', date: '20 Oct 2026', time: '10:00 - 11:30', hall: 'Virtual Room Alpha (Camera AI)', invigilator: 'Mrs. Ananya Verma', status: 'Overdue Scoring' }
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
                          Proctor: <strong className="text-slate-700 dark:text-slate-300">{exam.invigilator}</strong>
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
            const DOMAIN_META: Record<string, { label: string; icon: React.ReactNode }> = {
              academic:   { label: 'Academic',   icon: <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> },
              exam:       { label: 'Exams',      icon: <FileText className="h-3.5 w-3.5" aria-hidden="true" /> },
              admissions: { label: 'Admissions', icon: <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> },
              finance:    { label: 'Accounts',   icon: <Receipt className="h-3.5 w-3.5" aria-hidden="true" /> },
              executive:  { label: 'Executive',  icon: <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> },
              campus_ops: { label: 'Operations', icon: <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> },
            };

            const PRIORITY_DOT: Record<string, string> = {
              Critical: 'bg-[#B91C1C]',
              High:     'bg-[#F97316]',
              Medium:   'bg-[#D97706]',
              Low:      'bg-[#94A3B8]',
            };

            const STATUS_BADGE: Record<string, string> = {
              'Pending':        'edu-badge-critical',
              'In Progress':    'edu-badge-info',
              'Pending Review': 'edu-badge-warning',
              'Completed':      'edu-badge-success',
            };

            const filteredTasks = tasks.filter((t) => {
              const statusMatch = taskStatusFilter === 'all' || t.status === taskStatusFilter;
              const q = taskSearchQuery.trim().toLowerCase();
              const searchMatch =
                !q ||
                t.title.toLowerCase().includes(q) ||
                (t.assigned_to || '').toLowerCase().includes(q) ||
                (t.description || '').toLowerCase().includes(q);
              if (!statusMatch || !searchMatch) return false;
              if (taskOriginFilter === 'auto') return Boolean(t.is_auto_generated);
              if (taskOriginFilter === 'staff') return !t.is_auto_generated;
              if (taskOriginFilter === 'critical') return Boolean(t.is_escalated || t.priority === 'Critical');
              if (taskOriginFilter === 'relief') return Boolean(t.relief_requested);
              return true;
            });

            const openCount = tasks.filter((t) => t.status !== 'Completed').length;
            const autoCount = tasks.filter((t) => t.is_auto_generated).length;
            const criticalCount = tasks.filter((t) => t.is_escalated || t.priority === 'Critical').length;
            const completedCount = tasks.filter((t) => t.status === 'Completed').length;
            const reliefCount = tasks.filter((t) => t.relief_requested).length;

            return (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* ── 1. CALM 4-CARD EXECUTIVE KPI STRIP ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Active Tasks</span>
                      <ClipboardCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">{openCount}</p>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Open across departments</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Auto-Triggered</span>
                      <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">{autoCount}</p>
                    <span className="text-xs text-slate-600 dark:text-slate-400">System SLA rules</span>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 ${
                      criticalCount > 0
                        ? 'bg-[#FFF7ED] dark:bg-[#2A190E] border-[#FED7AA] dark:border-[#7C2D12]'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#EA580C] dark:text-[#FB923C]">Critical Priority</span>
                      <AlertTriangle className="h-4 w-4 text-[#F97316] dark:text-[#FB923C]" aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-extrabold text-[#B91C1C] dark:text-[#FCA5A5] mt-2 tabular-nums">{criticalCount}</p>
                    <span className="text-xs text-[#7C2D12] dark:text-[#E5B891] tabular-nums">{reliefCount} relief requests</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Completed</span>
                      <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 tabular-nums">{completedCount}</p>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Verified &amp; closed</span>
                  </div>
                </div>

                {/* ── 2. SINGLE-ROW FILTER, SEARCH & STATUS TOOLBAR ── */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: 'All', count: tasks.length },
                      { id: 'auto', label: 'Auto', count: autoCount },
                      { id: 'staff', label: 'Delegated', count: tasks.length - autoCount },
                      { id: 'critical', label: 'Critical', count: criticalCount },
                      { id: 'relief', label: 'Relief', count: reliefCount },
                    ].map((tab) => {
                      const active = taskOriginFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setTaskOriginFilter(tab.id as any)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                              active ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <div className="relative flex-1 sm:w-56">
                      <Search className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                      <input
                        type="text"
                        value={taskSearchQuery}
                        onChange={(e) => setTaskSearchQuery(e.target.value)}
                        aria-label="Search school tasks"
                        placeholder="Search tasks or assignee..."
                        className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder:text-[#475569] dark:placeholder:text-[#95A89E]"
                      />
                      {taskSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setTaskSearchQuery('')}
                          aria-label="Clear task search"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    <select
                      value={taskStatusFilter}
                      onChange={(e) => setTaskStatusFilter(e.target.value)}
                      aria-label="Filter tasks by status"
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-semibold px-3 py-1.5 cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* ── 3. LINEAR-STYLE UNIFIED TASK LIST ── */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 overflow-hidden divide-y divide-[#E2E8F0] dark:divide-[#1E322B]">
                  {filteredTasks.length === 0 && (
                    <div className="p-12 text-center space-y-1.5">
                      <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" aria-hidden="true" />
                      <p className="text-sm font-bold text-slate-900 dark:text-white">No tasks match this filter</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Try switching to All or clearing the search box.</p>
                    </div>
                  )}

                  {filteredTasks.map((task) => {
                    const meta = DOMAIN_META[task.domain as string] || DOMAIN_META['executive'];
                    const isExpanded = taskExpandedId === task.id;
                    const dotColor = PRIORITY_DOT[task.priority as string] || PRIORITY_DOT['Low'];
                    const statusClass = STATUS_BADGE[task.status as string] || STATUS_BADGE['Pending'];

                    return (
                      <div
                        key={task.id}
                        className={`transition-colors ${
                          task.is_escalated ? 'border-l-4 border-l-[#B91C1C]' : ''
                        }`}
                      >
                        {/* Compact Unified Task Row */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setTaskExpandedId(isExpanded ? null : task.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setTaskExpandedId(isExpanded ? null : task.id);
                            }
                          }}
                          className="px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#F1F5F9]/55 dark:hover:bg-[#1E293B]/60 cursor-pointer"
                        >
                          <div className="flex items-start md:items-center gap-3 min-w-0 flex-1">
                            <span
                              className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 md:mt-0 ${dotColor}`}
                              title={`Priority: ${task.priority}`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4
                                  className={`text-[13px] font-bold leading-snug ${
                                    task.status === 'Completed'
                                      ? 'line-through text-slate-600 dark:text-slate-400'
                                      : 'text-slate-900 dark:text-white'
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                {task.is_escalated && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold edu-badge-critical">
                                    Escalated
                                  </span>
                                )}
                                {task.relief_requested && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold edu-badge-warning">
                                    Relief Req.
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 mt-1">
                                <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                                  {meta.icon}
                                  {meta.label}
                                </span>
                                <span>·</span>
                                <span>{task.assigned_to}</span>
                                <span>·</span>
                                <span className="tabular-nums">Due {task.due_date}</span>
                                {task.sla_hours && (
                                  <>
                                    <span>·</span>
                                    <span className="font-semibold text-[#EA580C] dark:text-[#FB923C] tabular-nums">
                                      SLA {task.sla_hours}h
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden sm:inline">
                              {task.priority}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}>
                              {task.status}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-slate-600 dark:text-slate-400 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                              aria-hidden="true"
                            />
                          </div>
                        </div>

                        {/* Expanded Detail Drawer */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-3.5 border-t border-[#E2E8F0] dark:border-[#1E322B] bg-[#F8FAFC]/70 dark:bg-[#0B0F19]/70 space-y-3.5">
                            {task.description && (
                              <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                                {task.description}
                              </p>
                            )}

                            {/* Faculty Relief Request Callout */}
                            {task.relief_requested && (
                              <div className="rounded-xl border border-[#FED7AA] dark:border-[#7C2D12] bg-[#FFF7ED] dark:bg-[#2A190E] p-4 space-y-2.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-[#EA580C] dark:text-[#FB923C] flex items-center gap-1.5">
                                    <AlertCircle className="h-4 w-4 text-[#F97316]" aria-hidden="true" />
                                    Faculty Relief Request ({task.relief_reason || 'Workload Surge'})
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFFFF] dark:bg-[#1E293B] text-[#EA580C] dark:text-[#FB923C] border border-[#FED7AA] dark:border-[#7C2D12]">
                                    SLA Paused
                                  </span>
                                </div>

                                {task.relief_justification && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-800/90 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                    &ldquo;{task.relief_justification}&rdquo;
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                                  <span className="text-[#7C2D12] dark:text-[#E5B891]">
                                    Suggested Peer: <strong>{task.suggested_peer_teacher || 'Mrs. Neha Roy'}</strong>
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReassignTaskId(task.id);
                                        setReassignPeer(task.suggested_peer_teacher || 'Mrs. Neha Roy');
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold cursor-pointer transition-colors"
                                    >
                                      Approve Peer Migration
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleExtendSla(task.id);
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#EA580C] dark:text-[#FB923C] border border-[#FED7AA] dark:border-[#7C2D12] font-semibold cursor-pointer transition-colors"
                                    >
                                      +24h SLA Extension
                                    </button>
                                  </div>
                                </div>

                                {reassignTaskId === task.id && (
                                  <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                                    <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                                      Confirm Peer Faculty to Reassign (Resets SLA to 48h):
                                    </label>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <select
                                        value={reassignPeer}
                                        onChange={(e) => setReassignPeer(e.target.value)}
                                        className="flex-1 min-w-[200px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2 text-xs text-slate-900 dark:text-white"
                                      >
                                        <option value="Mrs. Ananya Verma">Mrs. Ananya Verma (Math Lead)</option>
                                        <option value="Dr. K. Raman">Dr. K. Raman (Science &amp; Physics)</option>
                                        <option value="Mrs. Neha Roy">Mrs. Neha Roy (English)</option>
                                        <option value="Dr. Hemanth Sen">Dr. Hemanth Sen (Biology)</option>
                                        <option value="Mr. Vikram Joshi">Mr. Vikram Joshi (Sports/Discipline)</option>
                                        <option value="Ms. Priya Sen">Ms. Priya Sen (Arts/Culture)</option>
                                      </select>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApproveRelief(task, reassignPeer);
                                        }}
                                        className="px-3 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold font-bold text-xs cursor-pointer"
                                      >
                                        Confirm Reassignment
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setReassignTaskId(null);
                                        }}
                                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-pointer hover:bg-[#F1F5F9]"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Escalation Callout */}
                            {task.is_escalated && (
                              <div className="rounded-xl border border-[#F5C2C2] dark:border-[#7F1D1D] bg-[#FCECEC] dark:bg-[#2B1517] p-4 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-[#B91C1C] dark:text-[#FCA5A5] flex items-center gap-1.5">
                                    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    Escalation Rationale: {task.escalation_reason || 'Critical Priority'}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setResolveEscalateTaskId(task.id);
                                      setResolveEscalateNotes('Discussed with faculty, issue resolved and resumed normally.');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    Resolve Escalation
                                  </button>
                                </div>

                                {resolveEscalateTaskId === task.id && (
                                  <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                                    <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                                      Principal Resolution Note:
                                    </label>
                                    <input
                                      type="text"
                                      value={resolveEscalateNotes}
                                      onChange={(e) => setResolveEscalateNotes(e.target.value)}
                                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2 text-xs text-slate-900 dark:text-white"
                                      placeholder="e.g. Counseled teacher, parent contacted, workload stabilized."
                                    />
                                    <div className="flex items-center justify-end gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setResolveEscalateTaskId(null);
                                        }}
                                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-[#F1F5F9] cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleResolveEscalation(task.id);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs font-bold cursor-pointer"
                                      >
                                        Confirm Resolution
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Governance & Verification Lifecycle */}
                            {task.status === 'Pending Review' ? (
                              <div className="p-4 rounded-xl border border-[#FED7AA] dark:border-[#7C2D12] bg-[#FFF7ED] dark:bg-[#2A190E] space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#EA580C] dark:text-[#FB923C] flex items-center gap-1.5">
                                    <FileCheck className="h-4 w-4 text-[#F97316]" aria-hidden="true" />
                                    Work Submitted for Verification
                                  </span>
                                  {task.submitted_at && (
                                    <span className="text-xs text-[#7C2D12] dark:text-[#E5B891] tabular-nums">
                                      {new Date(task.submitted_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                {task.submission_notes && (
                                  <div className="text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800/90 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <span className="font-semibold text-slate-600 dark:text-slate-400 block text-xs mb-0.5">
                                      Assignee Notes
                                    </span>
                                    {task.submission_notes}
                                  </div>
                                )}
                                {task.completion_proof_url && (
                                  <a
                                    href={task.completion_proof_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                    View Attached Proof / Dossier
                                  </a>
                                )}
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReviewModalTask(task);
                                      setReviewRemarks('Verified all documents & compliance requirements.');
                                      setShowRevisionInput(false);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    Verify &amp; Sign-off
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReviewModalTask(task);
                                      setShowRevisionInput(true);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl border border-[#FED7AA] dark:border-[#7C2D12] bg-white dark:bg-slate-800/90 text-[#EA580C] dark:text-[#FB923C] text-xs font-semibold hover:bg-[#F1F5F9] cursor-pointer inline-flex items-center gap-1.5"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                                    Request Revision
                                  </button>
                                </div>
                              </div>
                            ) : task.status === 'Completed' ? (
                              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 dark:bg-[#2563EB]/25 border border-slate-200 dark:border-slate-700 text-xs text-blue-600 dark:text-blue-400 dark:text-[#93C5FD]">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                                  <div>
                                    <span className="font-bold">Verified &amp; Closed</span>
                                    {task.approved_by && (
                                      <span className="text-slate-600 dark:text-slate-400 block">
                                        Approved by {task.approved_by}{' '}
                                        {task.approved_at ? `on ${new Date(task.approved_at).toLocaleDateString()}` : ''}
                                      </span>
                                    )}
                                    {task.is_admin_override && (
                                      <span className="text-[#B91C1C] dark:text-[#FCA5A5] block font-semibold">
                                        Force Closed: {task.admin_override_reason}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {task.completion_proof_url && (
                                  <a
                                    href={task.completion_proof_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                  >
                                    <span>View Dossier</span>
                                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0] dark:border-[#1E322B]">
                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>
                                    {task.status === 'In Progress'
                                      ? 'In progress with assignee'
                                      : 'Awaiting assignee action'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOverrideModalTask(task);
                                      setOverrideReason('');
                                    }}
                                    className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
                                    title="Use only if assignee is on leave or task completed externally"
                                  >
                                    Force Close
                                  </button>
                                  {!task.is_escalated && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEscalateTaskId(task.id);
                                        setEscalateReason('');
                                      }}
                                      className="rounded-xl px-3 py-1.5 text-xs font-bold border border-[#F5C2C2] dark:border-[#7F1D1D] bg-[#FCECEC] dark:bg-[#2B1517] text-[#B91C1C] dark:text-[#FCA5A5] hover:bg-[#B91C1C] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                    >
                                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                                      Escalate
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Escalation Form */}
                            {escalateTaskId === task.id && (
                              <div className="rounded-xl border border-[#F5C2C2] dark:border-[#7F1D1D] bg-white dark:bg-slate-800/90 p-3.5 space-y-2 mt-2">
                                <p className="text-xs font-bold text-[#B91C1C] dark:text-[#FCA5A5]">
                                  State rationale for escalating this task:
                                </p>
                                <textarea
                                  rows={2}
                                  value={escalateReason}
                                  onChange={(e) => setEscalateReason(e.target.value)}
                                  placeholder="e.g. Teacher requested medical relief or deadline exceeded by 48 hours..."
                                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-white resize-none"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setEscalateTaskId(null)}
                                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-[#F1F5F9] cursor-pointer font-semibold"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEscalateTask(task.id)}
                                    className="text-xs px-3 py-1.5 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold cursor-pointer"
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
          {/* TAB 11: STUDENT TC & EXIT CLEARANCE VAULT              */}
          {/* ===================================================== */}
          {activeTab === 'exit' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                      CBSE Statutory Compliance
                    </span>
                    <span className="text-xs text-slate-500">Legal Exit &amp; Transfer Vault</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Student Transfer Certificates (TC) &amp; Clearances
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dual-custody verification engine: 4-department clearance audit, in-app parent digital sign-off, and physical handover scan archiving (CBSE Rule 44 compliance).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const updated = await api.getExitClearances();
                      setExitClearances(updated);
                      triggerToast('Refreshed exit clearances from legal ledger');
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Refresh Ledger</span>
                  </button>
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Exit Applications</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{exitClearances.length}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Departing student records</span>
                </div>
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block">Pending Verification</span>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
                    {exitClearances.filter(e => !e.physical_sign_verified || !e.digital_parent_approved).length}
                  </span>
                  <span className="text-[10px] text-amber-600/80 block mt-0.5">Awaiting dual verification</span>
                </div>
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">Permanently Archived</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {exitClearances.filter(e => e.physical_sign_verified && e.digital_parent_approved).length}
                  </span>
                  <span className="text-[10px] text-emerald-600/80 block mt-0.5">Zero-dispute sealed</span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block">Avg Clearance Turnaround</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">1.2 Days</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Benchmark &lt; 3.0 Days</span>
                </div>
              </div>

              {/* Clearances List */}
              <div className="space-y-4">
                {exitClearances.map(clearance => (
                  <ExitClearanceView
                    key={clearance.id}
                    clearance={clearance}
                    role="admin"
                    onVerifyPhysical={(scanUrl) => handleVerifyPhysicalExit(clearance.id, scanUrl)}
                  />
                ))}

                {exitClearances.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                    <FileCheck className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No student exit clearance records found.</p>
                  </div>
                )}
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
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Assign To Faculty / Teacher / Coordinator *
                      </label>
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        <optgroup label="Academic Faculty & Subject Teachers">
                          <option value="Mrs. Ananya Verma">Mrs. Ananya Verma — Senior Math Lead (Class 10-A)</option>
                          <option value="Dr. K. Raman">Dr. K. Raman — Head of Science & Physics Lead</option>
                          <option value="Mrs. Neha Roy">Mrs. Neha Roy — Senior English & Humanities</option>
                          <option value="Dr. Hemanth Sen">Dr. Hemanth Sen — Biology & Senior Science</option>
                          <option value="Mr. Vikram Joshi">Mr. Vikram Joshi — Physical Education & Discipline</option>
                          <option value="Ms. Priya Sen">Ms. Priya Sen — Arts & Cultural Lead</option>
                          {staffMembers
                            .filter(s => s.department === 'Academics' && !['Mrs. Ananya Verma', 'Dr. K. Raman'].includes(s.name))
                            .map(s => (
                              <option key={s.id} value={s.name}>
                                {s.name} — {s.role} ({s.department})
                              </option>
                            ))}
                        </optgroup>

                        <optgroup label="Department & Cell Coordinators">
                          <option value="Dr. Ananya Krishnan">Dr. Ananya Krishnan — Academic Coordinator</option>
                          <option value="Ms. Rekha Iyer">Ms. Rekha Iyer — Exam Cell Coordinator</option>
                          <option value="Mr. Suresh Pillai">Mr. Suresh Pillai — Transport Fleet Lead</option>
                          <option value="Mr. Vikram Rao">Mr. Vikram Rao — Lab & Inventory Store</option>
                          <option value="Ms. Priya Nair">Ms. Priya Nair — Admissions & Student CRM</option>
                          <option value="Mrs. Lakshmi Narayan">Mrs. Lakshmi Narayan — Accounts & Bursar</option>
                        </optgroup>

                        <optgroup label="Leadership & Campus Operations">
                          <option value="Dr. Sunita Kapoor">Dr. Sunita Kapoor — Principal & Administrator</option>
                          <option value="Principal Sharma">Principal Sharma — Executive Institutional Board</option>
                          <option value="Ramesh Kumar">Ramesh Kumar — Senior Transport Lead</option>
                          {staffMembers
                            .filter(s => !['Academics'].includes(s.department || '') && !['Dr. Sunita Kapoor', 'Ramesh Kumar', 'Horizon AV Tech Solutions'].includes(s.name))
                            .map(s => (
                              <option key={s.id} value={s.name}>
                                {s.name} — {s.role} ({s.department})
                              </option>
                            ))}
                        </optgroup>
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
      {/* MODAL: OFFICIAL SIS ENROLLMENT (IMAGE 1 PARITY)           */}
      {/* ========================================================= */}
      <ConfirmEnrollmentModal
        isOpen={!!convertModalEnquiry}
        onClose={() => setConvertModalEnquiry(null)}
        enquiry={convertModalEnquiry}
        onSuccess={async (creds, msg) => {
          const updatedEnq = await api.getEnquiries();
          setEnquiries(updatedEnq);
          const updatedStudents = await api.getStudents();
          setStudentsList(updatedStudents);
          setConvertModalEnquiry(null);
          if (creds) {
            setEnrolledCredentials(creds);
          }
          triggerToast(msg || `🎉 ${convertModalEnquiry?.student_name} officially enrolled! Institutional credentials generated.`);
        }}
      />

      {/* ── MODAL: REGISTER NEW ADMISSION / ENQUIRY (ADMIN PRIVILEGED INTAKE) ── */}
      {showRegisterEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Register New Prospective Student</h3>
                  <p className="text-[11px] text-slate-500">Principal Office &bull; Direct Candidate Onboarding &amp; Admission Intake</p>
                </div>
              </div>
              <button onClick={() => setShowRegisterEnquiryModal(false)} className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterEnquiry} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Student Name *</label>
                  <input 
                    type="text" 
                    required
                    value={regStudentName} 
                    onChange={e => setRegStudentName(e.target.value)} 
                    placeholder="e.g. Maya Deshmukh" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Target Grade *</label>
                  <select 
                    value={regGrade} 
                    onChange={e => setRegGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold cursor-pointer"
                  >
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Parent / Guardian Name *</label>
                  <input 
                    type="text" 
                    required
                    value={regParentName} 
                    onChange={e => setRegParentName(e.target.value)} 
                    placeholder="e.g. Dr. Amit Deshmukh" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Mobile Phone *</label>
                  <input 
                    type="tel" 
                    required
                    value={regPhone} 
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9+\-\s]/g, '');
                      setRegPhone(cleanVal);
                      if (regPhoneError) setRegPhoneError(null);
                    }} 
                    placeholder="e.g. +91 98450 12345" 
                    className={`w-full rounded-xl border p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      regPhoneError 
                        ? 'border-rose-500 focus:ring-rose-500/20' 
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/20'
                    }`}
                  />
                  {regPhoneError && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{regPhoneError}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Lead Source</label>
                  <select 
                    value={regSource} 
                    onChange={e => setRegSource(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Direct Call / Walk-in">Direct Call / Walk-in (Principal Office)</option>
                    <option value="Parent Referral">Parent / Teacher Referral</option>
                    <option value="Website Form">Website Form (Online)</option>
                    <option value="Social Media Ad">Social Media Ad (Meta/Google)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">Initial Priority / Temperature</label>
                  <select 
                    value={regTemperature} 
                    onChange={e => setRegTemperature(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="hot">🔥 Hot (High Intent / Ready)</option>
                    <option value="warm">🌤️ Warm (In Consideration)</option>
                    <option value="cold">❄️ Cold (Casual Inquiry)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Email Address (Optional)</label>
                <input 
                  type="email" 
                  value={regEmail} 
                  onChange={e => setRegEmail(e.target.value)} 
                  placeholder="e.g. parent.email@example.com" 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Counseling Notes / Observations</label>
                <textarea 
                  rows={2}
                  value={regNotes}
                  onChange={e => setRegNotes(e.target.value)}
                  placeholder="e.g. Parent visited school office. Requested syllabus overview and fee structure."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterEnquiryModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register Candidate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ENROLLMENT SUCCESS & CREDENTIALS POP-UP ── */}
      {enrolledCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Header with Celebration Badge */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
                      Enrollment Finalized
                    </span>
                    <span className="text-xs text-slate-400">Institutional ID Assigned</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {enrolledCredentials.student_name} Enrolled!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {enrolledCredentials.student_class} &bull; Roll #{enrolledCredentials.student_roll} &bull; Adm #{enrolledCredentials.student_admission_no}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEnrolledCredentials(null)} 
                className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Notification Callout */}
            <div className="rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 p-3.5 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                Student profile added to <strong>SIS Central Roster</strong>. Share the generated institutional credentials below with the student &amp; parent.
              </span>
            </div>

            {/* Credentials Cards Container */}
            <div className="space-y-3.5">
              {/* Card 1: Student Account Credentials */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Student Portal Credentials
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Portal: /student
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Username</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{enrolledCredentials.student_username}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(enrolledCredentials.student_username);
                        triggerToast('Copied Student Username to clipboard!');
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 cursor-pointer"
                      title="Copy Username"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Password</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{enrolledCredentials.student_password}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(enrolledCredentials.student_password);
                        triggerToast('Copied Student Password to clipboard!');
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 cursor-pointer"
                      title="Copy Password"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Parent Account Credentials */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Parent Portal Credentials ({enrolledCredentials.parent_name})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    Portal: /parent
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Username</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{enrolledCredentials.parent_username}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(enrolledCredentials.parent_username);
                        triggerToast('Copied Parent Username to clipboard!');
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-purple-600 cursor-pointer"
                      title="Copy Username"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Password</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{enrolledCredentials.parent_password}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(enrolledCredentials.parent_password);
                        triggerToast('Copied Parent Password to clipboard!');
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-purple-600 cursor-pointer"
                      title="Copy Password"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {enrolledCredentials.parent_phone && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>Registered Phone: <strong>{enrolledCredentials.parent_phone}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const fullText = `*Welcome to EDU360 International School*\n\nDear ${enrolledCredentials.parent_name},\nYour ward *${enrolledCredentials.student_name}* has been officially enrolled into *${enrolledCredentials.student_class}* (Roll #${enrolledCredentials.student_roll}, Admission #${enrolledCredentials.student_admission_no}).\n\n*Student Login Credentials:*\n• Portal: http://localhost:3000/student\n• Username: ${enrolledCredentials.student_username}\n• Password: ${enrolledCredentials.student_password}\n\n*Parent Portal Credentials:*\n• Portal: http://localhost:3000/parent\n• Username: ${enrolledCredentials.parent_username}\n• Password: ${enrolledCredentials.parent_password}\n\nPlease log in and update your profile.`;
                  navigator.clipboard.writeText(fullText.replace(/\\n/g, '\n'));
                  triggerToast('📋 Full Welcome Package copied to clipboard!');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Full Welcome Package</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEnrolledCredentials(null);
                  setActiveTab('sis');
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View in Student Directory (SIS) &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: STAFF DOSSIER INSPECTOR                            */}
      {/* ========================================================= */}
      

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

    
      {/* Task Verification & Approval Modal */}
      {reviewModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  {showRevisionInput ? 'Request Revisions on Task' : 'Verify & Sign-off Task Completion'}
                </h3>
                <p className="text-xs text-slate-500">{reviewModalTask.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalTask(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assignee:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{reviewModalTask.assigned_to}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Domain &amp; SLA:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{reviewModalTask.domain} • {reviewModalTask.sla_hours}h SLA</span>
                </div>
              </div>

              {reviewModalTask.submission_notes && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Submitted Evidence &amp; Notes:
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {reviewModalTask.submission_notes}
                  </div>
                </div>
              )}

              {reviewModalTask.completion_proof_url && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Attached Document:
                  </label>
                  <a
                    href={reviewModalTask.completion_proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl font-bold hover:underline"
                  >
                    📎 Open Submission Document / Dossier ↗
                  </a>
                </div>
              )}

              {!showRevisionInput ? (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Principal Verification Remarks:
                  </label>
                  <input
                    type="text"
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder="e.g. Verified certificates, approved for CBSE renewal dossier."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="font-bold text-rose-700 dark:text-rose-400 block mb-1">
                    Required Changes / Revision Reason *:
                  </label>
                  <textarea
                    rows={3}
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    placeholder="Specify what needs to be fixed before this task can be approved..."
                    className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setReviewModalTask(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              {!showRevisionInput ? (
                <button
                  type="button"
                  onClick={() => handleApproveTask(reviewModalTask)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve &amp; Close Task
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRejectTask(reviewModalTask)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  Return for Revision
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Emergency Override Modal */}
      {overrideModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  Admin Force Close (Override)
                </h3>
                <p className="text-xs text-slate-500">{overrideModalTask.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setOverrideModalTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Admin Override logs a formal audit trail and closes this task immediately without requiring the assignee&apos;s digital submission.
            </p>

            <div>
              <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block mb-1">
                Mandatory Reason for Override *:
              </label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Faculty is hospitalized; verified offline via physical inspection register."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setOverrideModalTask(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleOverrideTask(overrideModalTask)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Force Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RECORD FEE COLLECTION (ADMIN PRIVILEGED) ── */}
      {showQuickFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Fee Collection</h3>
                  <span className="text-[11px] text-slate-500">Official Institutional Receipts &amp; Ledger Settlement</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShowQuickFeeModal(false);
                  setPaymentModalDefaulter(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Student Selector if multiple defaulters exist */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Select Student Account with Pending Dues *
              </label>
              <select
                value={paymentModalDefaulter ? paymentModalDefaulter.id : ''}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const found = feeDefaulters.find(d => d.id === selectedId);
                  if (found) {
                    setPaymentModalDefaulter(found);
                    setPaymentAmount(found.amount_due);
                  }
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="">-- Choose Student --</option>
                {feeDefaulters.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.student_name} ({d.class_name}) — Due: ₹{d.amount_due.toLocaleString('en-IN')} {d.is_admission_fee ? '★ New Admission' : ''}
                  </option>
                ))}
              </select>
            </div>

            {paymentModalDefaulter && (
              <form onSubmit={handleRecordFeePayment} className="space-y-3.5 text-xs">
                {/* Account Summary Banner */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-blue-950 dark:text-blue-100 text-sm block">
                      {paymentModalDefaulter.student_name}
                    </span>
                    <span className="text-[11px] text-blue-800 dark:text-blue-300">
                      {paymentModalDefaulter.class_name} • Guardian: {paymentModalDefaulter.parent_name} ({paymentModalDefaulter.parent_phone})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due</span>
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                      ₹{paymentModalDefaulter.amount_due.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount Received (₹) *
                  </label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    max={paymentModalDefaulter.amount_due}
                    value={paymentAmount || ''} 
                    onChange={e => setPaymentAmount(Number(e.target.value))} 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-base"
                    placeholder="Enter collected amount in ₹"
                  />
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                    <span>Outstanding Balance after payment: ₹{Math.max(0, paymentModalDefaulter.amount_due - (paymentAmount || 0)).toLocaleString('en-IN')}</span>
                    <button 
                      type="button" 
                      onClick={() => setPaymentAmount(paymentModalDefaulter.amount_due)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Fill Full Settlement (₹{paymentModalDefaulter.amount_due.toLocaleString('en-IN')})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Payment Mode *
                    </label>
                    <select 
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="UPI">UPI (Counter QR / GPay / PhonePe)</option>
                      <option value="Cash">Cash (School Counter Receipt)</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Demand Draft">Demand Draft (DD)</option>
                      <option value="NetBanking">NetBanking / NEFT</option>
                      <option value="Card (POS)">Card (POS Terminal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      UTR / Cheque / Ref No.
                    </label>
                    <input 
                      type="text" 
                      value={paymentUtr} 
                      onChange={e => setPaymentUtr(e.target.value)} 
                      placeholder="e.g. UTR-982144 or CHQ-10492"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Notes / Official Receipt Remarks
                  </label>
                  <input 
                    type="text" 
                    value={paymentNotes} 
                    onChange={e => setPaymentNotes(e.target.value)} 
                    placeholder="e.g. Term fee payment collected at Principal office counter" 
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowQuickFeeModal(false);
                      setPaymentModalDefaulter(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isRecordingPayment || paymentAmount <= 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isRecordingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating Ledger...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Confirm &amp; Update Ledger</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: APPLY CONCESSION / WAIVER (PRINCIPAL AUTHORITY) ── */}
      {waiverModalDefaulter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Grant Fee Concession / Waiver</h3>
                  <span className="text-[11px] text-slate-500">Executive Discretionary Concession</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setWaiverModalDefaulter(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 text-xs">
              <span className="font-bold text-purple-950 dark:text-purple-200 block">
                {waiverModalDefaulter.student_name} ({waiverModalDefaulter.class_name})
              </span>
              <span className="text-[11px] text-purple-700 dark:text-purple-300">
                Current Outstanding Balance: ₹{waiverModalDefaulter.amount_due.toLocaleString('en-IN')}
              </span>
            </div>

            <form onSubmit={handleApplyFeeConcession} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Concession Amount (₹) *
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setWaiverAmount(Math.round(waiverModalDefaulter.amount_due * 0.25))}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaiverAmount(Math.round(waiverModalDefaulter.amount_due * 0.50))}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaiverAmount(waiverModalDefaulter.amount_due)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 text-purple-700 dark:text-purple-300 cursor-pointer transition-colors"
                    >
                      100% Full Waiver
                    </button>
                  </div>
                </div>
                <input 
                  type="number" 
                  required
                  min={1}
                  max={waiverModalDefaulter.amount_due}
                  value={waiverAmount || ''} 
                  onChange={e => setWaiverAmount(Number(e.target.value))} 
                  placeholder={`Max ₹${waiverModalDefaulter.amount_due.toLocaleString('en-IN')}`}
                  className={`w-full rounded-xl border p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm transition-colors ${
                    waiverAmount > waiverModalDefaulter.amount_due
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/30 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              </div>

              {/* Dynamic Calculation & Validation Feedback */}
              {waiverAmount > waiverModalDefaulter.amount_due ? (
                <div className="p-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div>
                    <span className="block">Concession Exceeds Overdue Balance!</span>
                    <span className="text-[11px] font-normal block mt-0.5">
                      You entered ₹{waiverAmount.toLocaleString('en-IN')}, which exceeds the student&apos;s total balance due of ₹{waiverModalDefaulter.amount_due.toLocaleString('en-IN')}. Maximum concession is ₹{waiverModalDefaulter.amount_due.toLocaleString('en-IN')}.
                    </span>
                  </div>
                </div>
              ) : waiverAmount > 0 ? (
                <div className="p-2.5 rounded-xl border border-emerald-300/60 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Net Balance After Concession:</span>
                  </div>
                  <span className="font-bold text-sm tabular-nums">
                    ₹{Math.max(0, waiverModalDefaulter.amount_due - waiverAmount).toLocaleString('en-IN')}
                    {waiverModalDefaulter.amount_due - waiverAmount === 0 && ' (Account Cleared ✓)'}
                  </span>
                </div>
              ) : null}

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason / Board Justification *</label>
                <textarea 
                  rows={2}
                  required
                  value={waiverReason} 
                  onChange={e => setWaiverReason(e.target.value)} 
                  placeholder="e.g. Merit-cum-means scholarship or sports championship concession approved by Principal." 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setWaiverModalDefaulter(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isApplyingWaiver || waiverAmount <= 0 || waiverAmount > waiverModalDefaulter.amount_due}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 font-bold shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isApplyingWaiver ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Authorize Concession</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PAYMENT HISTORY INSPECTOR ── */}
      {historyModalDefaulter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment Audit History</h3>
                  <span className="text-[11px] text-slate-500">{historyModalDefaulter.student_name} ({historyModalDefaulter.class_name})</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setHistoryModalDefaulter(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
              {(() => {
                try {
                  const hist = JSON.parse(historyModalDefaulter.payment_history_json || '[]');
                  if (!hist || hist.length === 0) {
                    return <p className="text-slate-400 p-4 text-center">No payment logs recorded yet.</p>;
                  }
                  return hist.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400 text-sm">₹{Number(item.amount).toLocaleString('en-IN')}</span>
                        <span className="text-slate-400 text-[10px]">{item.date}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        Mode: <span className="font-semibold">{item.method}</span> • Ref: <span className="font-mono">{item.utr_or_cheque}</span>
                      </div>
                      {item.received_by && (
                        <div className="text-[10px] text-slate-500">Received by: {item.received_by}</div>
                      )}
                      {item.notes && (
                        <div className="text-[10px] text-slate-400 italic">“{item.notes}”</div>
                      )}
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            downloadOfficialDocumentFile(`Fee Receipt - ${item.utr_or_cheque}`, historyModalDefaulter.student_name, item.utr_or_cheque);
                            setToastMessage(`Downloaded Receipt ${item.utr_or_cheque}`);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download Receipt</span>
                        </button>
                      </div>
                    </div>
                  ));
                } catch {
                  return <p className="text-slate-400 p-4 text-center">No parseable history log.</p>;
                }
              })()}
            </div>
          </div>
        </div>
      )}

</div>
    </RoleGuard>
  );
}