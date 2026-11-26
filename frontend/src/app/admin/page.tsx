'use client';

import { Icon3D } from '@/components/ui/icon-3d';
import React, { useState, useEffect, useMemo } from 'react';
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
  BadgeCheck,
  FileSpreadsheet,
  Printer,
  CheckCheck,
  MessageSquareQuote,
  MessageSquare,
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
  LogOut,
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
  Menu,
  LayoutGrid,
  List
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
  RemedialEarlyWarning,
  PayrollBatchItem,
  PaymentTransactionItem,
  ExamScheduleItem
} from '@/lib/types';
import { TodayReceiptItem, getLiveTodayReceipts, recordLiveReceipt, resetLiveLedger, formatSystemTime, setupReceiptSync } from '@/lib/fee-ledger';
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
  const [todayReceipts, setTodayReceipts] = useState<TodayReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Unified receipt sync via setupReceiptSync (handles BroadcastChannel, storage, CustomEvent, focus, polling)
  useEffect(() => {
    setTodayReceipts(getLiveTodayReceipts());
    return setupReceiptSync({
      onReceipts: setTodayReceipts
    });
  }, []);

  // Re-sync todayReceipts when switching to fees or cockpit
  useEffect(() => {
    if (activeTab === 'fees' || activeTab === 'cockpit') {
      setTodayReceipts(getLiveTodayReceipts());
    }
  }, [activeTab]);

  const totalCollectedToday = useMemo<number>(() => {
    return todayReceipts.reduce((acc: number, r: TodayReceiptItem) => acc + (Number(r.amount) || 0), 0);
  }, [todayReceipts]);

  const upiReceipts = useMemo<TodayReceiptItem[]>(() => {
    return todayReceipts.filter((r: TodayReceiptItem) => {
      const m = (r.mode || '').toLowerCase();
      return m.includes('upi') || m.includes('gpay') || m.includes('phonepe') || m.includes('paytm');
    });
  }, [todayReceipts]);

  const upiCollectedToday = useMemo<number>(() => {
    return upiReceipts.reduce((acc: number, r: TodayReceiptItem) => acc + (Number(r.amount) || 0), 0);
  }, [upiReceipts]);

  const neftReceipts = useMemo<TodayReceiptItem[]>(() => {
    return todayReceipts.filter((r: TodayReceiptItem) => {
      const m = (r.mode || '').toLowerCase();
      return m.includes('neft') || m.includes('netbanking') || m.includes('wire') || m.includes('bank') || m.includes('sbi') || m.includes('hdfc') || m.includes('icici');
    });
  }, [todayReceipts]);

  const neftCollectedToday = useMemo<number>(() => {
    return neftReceipts.reduce((acc: number, r: TodayReceiptItem) => acc + (Number(r.amount) || 0), 0);
  }, [neftReceipts]);

  const cashReceipts = useMemo<TodayReceiptItem[]>(() => {
    return todayReceipts.filter((r: TodayReceiptItem) => {
      const m = (r.mode || '').toLowerCase();
      return m.includes('cash') || m.includes('counter');
    });
  }, [todayReceipts]);

  const cashCollectedToday = useMemo<number>(() => {
    return cashReceipts.reduce((acc: number, r: TodayReceiptItem) => acc + (Number(r.amount) || 0), 0);
  }, [cashReceipts]);

  const handleSimulateParentPayment = () => {
    const pool = [
      { name: 'Aarav Sharma', class: 'Class 8-B', amount: 35000, head: 'Term 2 Tuition Fee', mode: 'UPI (PhonePe)' },
      { name: 'Diya Patel', class: 'Class 8-B', amount: 28500, head: 'Term 2 Tuition & Lab', mode: 'UPI (Google Pay)' },
      { name: 'Rohan Verma', class: 'Class 9-A', amount: 22000, head: 'Term 2 Tuition Fee', mode: 'UPI (Paytm)' },
      { name: 'Ananya Iyer', class: 'Class 9-A', amount: 18500, head: 'Annual STEM & Robotics', mode: 'UPI (PhonePe)' }
    ];
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const randomUtr = `UPI-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const recNo = `REC-2026-FEE-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowTime = formatSystemTime(new Date());
    const newReceipt: TodayReceiptItem = {
      recNo,
      name: picked.name,
      classSec: picked.class,
      head: picked.head,
      amount: picked.amount,
      mode: picked.mode,
      ref: randomUtr,
      time: nowTime,
      status: 'Bank Cleared'
    };
    const updated = recordLiveReceipt(newReceipt);
    setTodayReceipts(updated);
    setToastMessage(`✓ Captured Live UPI Collection: ₹${picked.amount.toLocaleString('en-IN')} for ${picked.name} (${recNo})`);

    // Dispatch real-time system notifications
    api.publishClientNotification({
      recipient_role: 'admin',
      sender_name: 'UPI Gateway Webhook Engine',
      sender_role: 'system',
      notification_type: 'ONLINE_PAYMENT',
      title: 'Live UPI Collection Captured',
      message: `₹${picked.amount.toLocaleString('en-IN')} received via ${picked.mode} for ${picked.name} (${picked.class}). Receipt #${recNo}.`,
      priority: 'Normal',
      action_url: '/admin'
    });

    api.publishClientNotification({
      recipient_role: 'accounts_coordinator',
      sender_name: 'Parent Online Portal',
      sender_role: 'parent',
      notification_type: 'ONLINE_PAYMENT',
      title: 'Online Fee Payment Captured',
      message: `₹${picked.amount.toLocaleString('en-IN')} received via ${picked.mode} for ${picked.name} (${picked.class}). Receipt #${recNo}.`,
      priority: 'MEDIUM',
      action_url: '/accounts_coordinator?tab=reconciliation'
    });
  };

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

  // Four-Eye Governance: Staff Payroll Batches & Principal Authorization State
  const [adminPayrollBatches, setAdminPayrollBatches] = useState<PayrollBatchItem[]>([]);
  const [isLoadingPayroll, setIsLoadingPayroll] = useState(false);
  const [isAuthorizingPayroll, setIsAuthorizingPayroll] = useState(false);
  const [isRequestingPayrollRevision, setIsRequestingPayrollRevision] = useState(false);
  const [selectedAdminBatchId, setSelectedAdminBatchId] = useState<number | null>(null);
  const [principalAuthNotes, setPrincipalAuthNotes] = useState('Reviewed faculty attendance, EPFO statutory 12%, and TDS withholding. Digitally authorized for bank wire.');

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
  const [studentStatusFilter, setStudentStatusFilter] = useState('All');
  const [sisInitialTab, setSisInitialTab] = useState<'profile' | 'academics' | 'remarks' | 'attendance' | 'vault' | 'fees' | 'exit'>('profile');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentRiskOnly, setStudentRiskOnly] = useState(false);
  const [sisActiveSubTab, setSisActiveSubTab] = useState<'profile' | 'academic' | 'certificates' | 'fees'>('profile');
  const [showInitiateExitModal, setShowInitiateExitModal] = useState(false);
  const [initiateExitStudentId, setInitiateExitStudentId] = useState<number | null>(null);
  const [isInitiatingExit, setIsInitiatingExit] = useState(false);

  // Staff Directory Search & Modal State
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [selectedStaffForModal, setSelectedStaffForModal] = useState<StaffMemberItem | null>(null);

  // Exams & Re-Exam Requests State
  const [examSubTab, setExamSubTab] = useState<'upcoming' | 'overdue' | 'reexam'>('upcoming');
  const [examSchedules, setExamSchedules] = useState<ExamScheduleItem[]>([]);
  const [reExamRequests, setReExamRequests] = useState<ReExamRequestItem[]>([]);
  const [selectedReExamModal, setSelectedReExamModal] = useState<ReExamRequestItem | null>(null);
  const [reExamAdminRemarks, setReExamAdminRemarks] = useState('');

  // Staff Leave Issuance (Admin Direct Mandate) State
  const [showIssueLeaveModal, setShowIssueLeaveModal] = useState(false);
  const [issueLeaveStaffName, setIssueLeaveStaffName] = useState('Mrs. Ananya Verma');
  const [issueLeaveCategory, setIssueLeaveCategory] = useState('On-Duty OD');
  const [issueLeaveFromDate, setIssueLeaveFromDate] = useState('Today, 26 Oct 2026');
  const [issueLeaveToDate, setIssueLeaveToDate] = useState('Today, 26 Oct 2026');
  const [issueLeavePeriods, setIssueLeavePeriods] = useState('Period 2, Period 3');
  const [issueLeaveSubstitute, setIssueLeaveSubstitute] = useState('Mrs. Neha Roy (TGT Science)');
  const [issueLeaveReason, setIssueLeaveReason] = useState('CBSE Regional Academic Seminar & Science Fair Deputation');
  const [issueLeaveTotalDays, setIssueLeaveTotalDays] = useState(1);

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
  const [feeDefaulterStatusFilter, setFeeDefaulterStatusFilter] = useState<'ACTIVE_DUES' | 'SETTLED' | 'ALL'>('ACTIVE_DUES');
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
  const [regCategory, setRegCategory] = useState<'active' | 'passive'>('active');
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
  const [staffViewMode, setStaffViewMode] = useState<'cards' | 'table'>('cards');
  const [staffStatusFilter, setStaffStatusFilter] = useState<'All' | 'in_class' | 'free' | 'leave'>('All');

  // Helper for live classroom occupancy and workload capacity
  const getStaffLiveStatus = (staff: StaffMemberItem) => {
    const name = staff.name || '';
    const status = staff.status || 'Present';
    if (status === 'On Leave') {
      return {
        type: 'leave',
        badge: 'On Leave (Proxy Active)',
        dotColor: 'bg-rose-500',
        bgColor: 'bg-rose-50 dark:bg-rose-950/40',
        textColor: 'text-rose-700 dark:text-rose-300',
        borderColor: 'border-rose-200 dark:border-rose-900',
        currentLocation: 'Home • Approved Leave',
        loadPercent: 0,
        periodsToday: '0 / 6 periods today',
        weeklyLoad: 24,
        weeklyCapacity: 28,
        isOverloaded: false,
      };
    } else if (name.includes('Raman') || name.includes('Ananya') || staff.id % 2 === 0) {
      const cls = (staff.assigned_classes && staff.assigned_classes.length > 0) ? staff.assigned_classes[0] : 'Class 9-A';
      return {
        type: 'in_class',
        badge: `In Class: Period 3 (${cls})`,
        dotColor: 'bg-emerald-500',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        borderColor: 'border-emerald-200 dark:border-emerald-900',
        currentLocation: `${cls} • Science Wing (Room 204)`,
        loadPercent: 82,
        periodsToday: '4 / 6 periods today',
        weeklyLoad: 23,
        weeklyCapacity: 28,
        isOverloaded: false,
      };
    } else if (status === 'Short Permission') {
      return {
        type: 'permission',
        badge: 'Short Permission (Away)',
        dotColor: 'bg-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-950/40',
        textColor: 'text-amber-700 dark:text-amber-300',
        borderColor: 'border-amber-200 dark:border-amber-900',
        currentLocation: 'Approved Early Departure',
        loadPercent: 50,
        periodsToday: '2 / 4 periods completed',
        weeklyLoad: 18,
        weeklyCapacity: 28,
        isOverloaded: false,
      };
    } else {
      return {
        type: 'free',
        badge: 'Free Period • Available for Proxy',
        dotColor: 'bg-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950/40',
        textColor: 'text-blue-700 dark:text-blue-300',
        borderColor: 'border-blue-200 dark:border-blue-900',
        currentLocation: 'Faculty Workroom (Desk 14)',
        loadPercent: 65,
        periodsToday: '3 / 6 periods today',
        weeklyLoad: 20,
        weeklyCapacity: 28,
        isOverloaded: false,
      };
    }
  };
  const [permFilter, setPermFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [permSearchQuery, setPermSearchQuery] = useState<string>('');
  const [permTypeFilter, setPermTypeFilter] = useState<string>('All');
  const [selectedPermForModal, setSelectedPermForModal] = useState<TeacherPermissionRequest | null>(null);
  const [permPrincipalRemarks, setPermPrincipalRemarks] = useState<string>('');
  const [isSubmittingPermReview, setIsSubmittingPermReview] = useState<boolean>(false);

  // Helper metadata for Teacher Leaves, Quotas, and Proxy Matching
  const getTeacherLeaveMeta = (req: TeacherPermissionRequest) => {
    const name = req.teacher_name || '';
    if (name.includes('Verma') || name.includes('Ananya')) {
      return {
        empId: 'EMP-T102',
        department: 'Senior Mathematics & Computing',
        casualLeft: 2,
        casualTotal: 12,
        medicalLeft: 4,
        medicalTotal: 10,
        earnedLeft: 8,
        earnedTotal: 15,
        lopRisk: 'None (Within Entitled Quota)',
        lopAmount: 0,
        affectedPeriod: 'Period 3 (10:30 AM - 11:15 AM)',
        affectedClass: 'Class 8-B • Mathematics',
        proxyTeacher: 'Mr. Vikram Sharma',
        proxyStatus: 'Available & Subject Specialist Match',
        hasMedicalDoc: true,
        phone: '+91 98450 12345',
        dutyShift: '07:45 AM - 03:30 PM',
        avatarBg: 'from-blue-600 to-indigo-600'
      };
    } else if (name.includes('Raman') || name.includes('Dr.')) {
      return {
        empId: 'EMP-T101',
        department: 'Senior Physics & Science HOD',
        casualLeft: 5,
        casualTotal: 12,
        medicalLeft: 8,
        medicalTotal: 10,
        earnedLeft: 12,
        earnedTotal: 15,
        lopRisk: 'None (Official Duty Movement)',
        lopAmount: 0,
        affectedPeriod: 'Period 2 & Period 5',
        affectedClass: 'Class 10-A • Physics',
        proxyTeacher: 'Mrs. Priya Sen',
        proxyStatus: 'Available (Period 2 free)',
        hasMedicalDoc: false,
        phone: '+91 98451 23456',
        dutyShift: '07:45 AM - 03:30 PM',
        avatarBg: 'from-emerald-600 to-teal-700'
      };
    } else if (name.includes('Sen') || name.includes('Priya')) {
      return {
        empId: 'EMP-T103',
        department: 'Middle School English & Drama',
        casualLeft: 0,
        casualTotal: 12,
        medicalLeft: 2,
        medicalTotal: 10,
        earnedLeft: 4,
        earnedTotal: 15,
        lopRisk: 'Casual Quota Exhausted',
        lopAmount: 1650,
        affectedPeriod: 'Period 6 (01:45 PM - 02:30 PM)',
        affectedClass: 'Class 7-A • English',
        proxyTeacher: 'Ms. Sunita Roy',
        proxyStatus: 'Available (Period 6 free)',
        hasMedicalDoc: false,
        phone: '+91 98452 34567',
        dutyShift: '07:45 AM - 03:30 PM',
        avatarBg: 'from-amber-600 to-orange-600'
      };
    } else {
      return {
        empId: `EMP-T${((req.id || 1) * 17) % 89 + 100}`,
        department: 'Academics & General Studies',
        casualLeft: 3,
        casualTotal: 12,
        medicalLeft: 6,
        medicalTotal: 10,
        earnedLeft: 9,
        earnedTotal: 15,
        lopRisk: 'None (Within Quota)',
        lopAmount: 0,
        affectedPeriod: req.affected_periods || 'Period 4 (11:30 AM - 12:15 PM)',
        affectedClass: 'Class 9-B',
        proxyTeacher: req.suggested_substitute || 'Faculty Standby Roster',
        proxyStatus: 'Standby Available',
        hasMedicalDoc: (req.type || '').toLowerCase().includes('medical'),
        phone: '+91 98450 00000',
        dutyShift: '07:45 AM - 03:30 PM',
        avatarBg: 'from-purple-600 to-indigo-600'
      };
    }
  };

  // 7-Day Campus Absence Radar Data
  const campusAbsenceRadar = [
    { day: 'Mon', date: '19 Oct', count: 2, label: 'Today', status: 'normal' },
    { day: 'Tue', date: '20 Oct', count: 1, label: 'Tomorrow', status: 'low' },
    { day: 'Wed', date: '21 Oct', count: 0, label: 'All Present', status: 'zero' },
    { day: 'Thu', date: '22 Oct', count: 2, label: '2 On Leave', status: 'normal' },
    { day: 'Fri', date: '23 Oct', count: 5, label: 'Peak Absence', status: 'critical' },
    { day: 'Sat', date: '24 Oct', count: 1, label: 'Half Day', status: 'low' },
    { day: 'Sun', date: '25 Oct', count: 0, label: 'Holiday', status: 'weekend' },
  ];
  const [alertFilter, setAlertFilter] = useState<'all' | 'urgent' | 'pacing' | 'resolved'>('all');
  const [taskOriginFilter, setTaskOriginFilter] = useState<'all' | 'auto' | 'staff' | 'critical' | 'relief'>('all');
  const [examClassFilter, setExamClassFilter] = useState('All');
  const [examViewMode, setExamViewMode] = useState<'matrix' | 'cards' | 'grading'>('matrix');
  const [selectedReExamForDrawer, setSelectedReExamForDrawer] = useState<ReExamRequestItem | null>(null);
  const [reExamVenueInput, setReExamVenueInput] = useState<string>('Special Testing Lab 2');
  const [reExamDateInput, setReExamDateInput] = useState<string>('28 Oct 2026');
  const [reExamTimeInput, setReExamTimeInput] = useState<string>('02:00 PM - 05:00 PM');
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [selectedClassForExceptionDrawer, setSelectedClassForExceptionDrawer] = useState<any | null>(null);
  const [classExceptions, setClassExceptions] = useState<{ [classId: number]: Array<{ id: number; name: string; roll: string; roadblockType: 'attendance' | 'academic' | 'fees'; description: string; waiverApplied: boolean; waiverType?: string }> }>({
    1: [
      { id: 801, name: "Kavya Sharma", roll: "10A-14", roadblockType: "attendance", description: "Attendance 68% (7% below CBSE 75% threshold) due to viral bronchitis in Nov.", waiverApplied: false },
      { id: 802, name: "Rohan Gupta", roll: "10A-27", roadblockType: "academic", description: "Failed Mathematics Term 2 (31/100, Passing: 35). Needs 4 grace marks.", waiverApplied: false },
      { id: 803, name: "Aarav Patel", roll: "10A-04", roadblockType: "fees", description: "Outstanding Term 2 tuition fees ₹18,000 awaiting parent instalment clearance.", waiverApplied: false }
    ],
    2: [
      { id: 804, name: "Meera Nair", roll: "9B-19", roadblockType: "academic", description: "Failed Science Practical (14/30, Passing: 15). Needs 1 grace mark.", waiverApplied: false },
      { id: 805, name: "Tanvi Deshmukh", roll: "9B-31", roadblockType: "attendance", description: "Attendance 71% due to National Badminton Championship representation.", waiverApplied: false }
    ]
  });

  // Legal & Regulatory TC Vault States
  const [exitSearch, setExitSearch] = useState<string>('');
  const [exitFilter, setExitFilter] = useState<'ALL' | 'PENDING' | 'PARENT_PENDING' | 'ARCHIVED'>('ALL');
  const [selectedTCForPreview, setSelectedTCForPreview] = useState<ExitClearance | null>(null);
  const [showNewTCModal, setShowNewTCModal] = useState<boolean>(false);

  // School Events & Logistics States
  const [eventViewMode, setEventViewMode] = useState<'grid' | 'hierarchy' | 'budget'>('grid');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('ALL');
  const [eventSearch, setEventSearch] = useState<string>('');

  // Staff Payroll & Compensation States
  const [selectedPayrollCycle, setSelectedPayrollCycle] = useState<'Oct 2026' | 'Sep 2026' | 'Aug 2026'>('Oct 2026');
  const [payrollDeptFilter, setPayrollDeptFilter] = useState<string>('ALL');
  const [payrollSearch, setPayrollSearch] = useState<string>('');
  const [selectedPayslipStaff, setSelectedPayslipStaff] = useState<StaffMemberItem | null>(null);
  const [isDisbursingPayroll, setIsDisbursingPayroll] = useState<boolean>(false);

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

  // Guard against on-hold domains (transport, inventory, legacy board exam LOC)
  const isExcludedTriage = (a: TriageAlert) => {
    const cat = (a.category || '').toLowerCase();
    const title = (a.title || '').toLowerCase();
    const desc = (a.description || '').toLowerCase();
    return (
      cat === 'transport' ||
      cat === 'inventory' ||
      title.includes('bus') ||
      title.includes('telemetry delay') ||
      title.includes('board exam') ||
      title.includes('loc verification') ||
      desc.includes('bus route') ||
      desc.includes('cbse loc')
    );
  };

  const isExcludedTask = (t: AdminTask) => {
    const d = (t.domain || '').toLowerCase();
    const title = (t.title || '').toLowerCase();
    return d === 'transport' || d === 'inventory' || title.includes('bus') || title.includes('acid & apparatus');
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
          api.getAdminStudentLeaves(),
          api.getPayrollBatches(),
          api.getPaymentTransactions(),
          api.getExamSchedules()
        ]);

        if (results[0].status === 'fulfilled') setTriageAlerts((results[0].value || []).filter(a => !isExcludedTriage(a)));
        if (results[1].status === 'fulfilled') setTasks((results[1].value || []).filter(t => !isExcludedTask(t)));
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
        if (results[19] && results[19].status === 'fulfilled') setAdminPayrollBatches((results[19].value as PayrollBatchItem[]) || []);
        if (results[21] && results[21].status === 'fulfilled') setExamSchedules((results[21].value as ExamScheduleItem[]) || []);
        // Today receipts initialized via fee-ledger getLiveTodayReceipts()
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

  // Real-time synchronization for Four-Eye Staff Payroll Batches & Notifications
  useEffect(() => {
    if (activeTab === 'payroll') {
      loadAdminPayroll();
    } else if (activeTab === 'substitutions') {
      Promise.all([
        api.getSubstitutions(),
        api.getAvailableFaculty()
      ]).then(([subs, facs]) => {
        setSubstitutions(subs);
        setAvailableFaculty(facs);
      }).catch(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePayrollSync = (e: any) => {
      const notif = e.detail;
      const type = notif?.notification_type || notif?.type;
      if (type === 'ONLINE_PAYMENT') {
        setTodayReceipts(getLiveTodayReceipts());
        triggerToast(`💳 ${notif?.title || 'Live Fee Collection Received'}: ${notif?.message}`);
      } else if (type === 'PAYROLL_READY' || type === 'PAYROLL_AUDIT' || type === 'PAYROLL_RESUBMITTED') {
        loadAdminPayroll();
        triggerToast(`🔔 ${notif?.title || 'Monthly Staff Payroll batch ready for Principal Sign-off!'}`);
      } else if (type === 'SUBSTITUTION_ASSIGNED' || type === 'PROXY_REQUIRED' || type === 'TEACHER_LEAVE_APPROVED') {
        Promise.all([
          api.getSubstitutions(),
          api.getAvailableFaculty(),
          api.getTeacherPermissions()
        ]).then(([subs, facs, perms]) => {
          setSubstitutions(subs);
          setAvailableFaculty(facs);
          setTeacherPermissions(perms);
          triggerToast(notif?.message || '🔔 Timetable substitution gaps updated.');
        }).catch(() => {});
      }
    };
    window.addEventListener('edu360_notification_event', handlePayrollSync);

    const handleNav = (e: any) => {
      const url = typeof e.detail === 'string' ? e.detail : (e.detail?.url || '');
      try {
        const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        const tabParam = parsed.searchParams.get('tab') as AdminTab | null;
        if (tabParam) {
          setActiveTab(tabParam);
          if (tabParam === 'fees') setTodayReceipts(getLiveTodayReceipts());
          else if (tabParam === 'payroll') loadAdminPayroll();
          else if (tabParam === 'substitutions') {
            Promise.all([
              api.getSubstitutions(),
              api.getAvailableFaculty()
            ]).then(([subs, facs]) => {
              setSubstitutions(subs);
              setAvailableFaculty(facs);
            }).catch(() => {});
          }
        }
      } catch {
        if (url.includes('tab=fees')) {
          setActiveTab('fees');
          setTodayReceipts(getLiveTodayReceipts());
        } else if (url.includes('tab=payroll')) {
          setActiveTab('payroll');
          loadAdminPayroll();
        } else if (url.includes('tab=substitutions')) {
          setActiveTab('substitutions');
          Promise.all([
            api.getSubstitutions(),
            api.getAvailableFaculty()
          ]).then(([subs, facs]) => {
            setSubstitutions(subs);
            setAvailableFaculty(facs);
          }).catch(() => {});
        }
      }
    };
    window.addEventListener('edu360-navigate-url', handleNav);

    let bc: BroadcastChannel | null = null;
    let txChannel: BroadcastChannel | null = null;
    try {
      txChannel = new BroadcastChannel('edu360_global_transactions');
      txChannel.onmessage = (msg) => {
        if (msg.data?.type === 'TRANSACTION_RECORDED' || msg.data?.type === 'TRANSACTION_RECONCILED') {
          setTodayReceipts(getLiveTodayReceipts());
        }
      };
    } catch {}

    try {
      bc = new BroadcastChannel('edu360_global_notifications');
      bc.onmessage = (msg) => {
        const type = msg.data?.notification?.notification_type || msg.data?.type;
        if (type === 'ONLINE_PAYMENT') {
          setTodayReceipts(getLiveTodayReceipts());
          triggerToast(`💳 ${msg.data?.notification?.title || 'Fee Collection Received'}: ${msg.data?.notification?.message}`);
        } else if (type === 'PAYROLL_READY' || type === 'PAYROLL_AUDIT' || type === 'PAYROLL_RESUBMITTED') {
          loadAdminPayroll();
          triggerToast('🔔 Accounts Coordinator submitted a monthly staff payroll batch for Principal executive authorization!');
        } else if (type === 'SUBSTITUTION_ASSIGNED' || type === 'PROXY_REQUIRED' || type === 'TEACHER_LEAVE_APPROVED') {
          Promise.all([
            api.getSubstitutions(),
            api.getAvailableFaculty(),
            api.getTeacherPermissions()
          ]).then(([subs, facs, perms]) => {
            setSubstitutions(subs);
            setAvailableFaculty(facs);
            setTeacherPermissions(perms);
          }).catch(() => {});
        }
      };
    } catch {}

    return () => {
      window.removeEventListener('edu360_notification_event', handlePayrollSync);
      window.removeEventListener('edu360-navigate-url', handleNav);
      if (bc) bc.close();
      if (txChannel) txChannel.close();
    };
  }, []);

  const loadAdminPayroll = async () => {
    try {
      setIsLoadingPayroll(true);
      const batches = await api.getPayrollBatches();
      setAdminPayrollBatches(batches || []);
    } catch (err) {
      console.error('Failed to load payroll batches in admin:', err);
    } finally {
      setIsLoadingPayroll(false);
    }
  };

  const handlePrincipalAuthorizeBatch = async (batchId: number) => {
    try {
      setIsAuthorizingPayroll(true);
      await api.authorizePayroll(batchId, {
        authorized_by: 'Dr. Sunita Kapoor (Principal)',
        notes: principalAuthNotes || 'Reviewed faculty attendance, EPFO/TDS reconciliation, and approved for corporate wire.'
      });
      setAdminPayrollBatches(prev => prev.map(b => b.id === batchId ? {
        ...b,
        status: 'Approved for Wire',
        authorized_by: 'Dr. Sunita Kapoor (Principal)',
        authorized_at: new Date().toLocaleDateString('en-GB')
      } : b));
      triggerToast('Monthly Staff Payroll batch digitally authorized with Principal seal!');
      await loadAdminPayroll();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to authorize payroll batch.');
    } finally {
      setIsAuthorizingPayroll(false);
    }
  };

  const handleRequestPayrollRevision = async (batchId: number) => {
    try {
      setIsRequestingPayrollRevision(true);
      const notes = principalAuthNotes.trim() || 'Please re-verify faculty attendance, LOP deductions, and statutory EPF/TDS withholdings.';
      await api.requestPayrollRevision(batchId, {
        requested_by: 'Dr. Sunita Kapoor (Principal)',
        notes
      });
      setAdminPayrollBatches(prev => prev.map(b => b.id === batchId ? {
        ...b,
        status: 'Revision Requested',
        notes: (b.notes || '') + ` | [Revision Requested by Dr. Sunita Kapoor]: ${notes}`
      } : b));
      triggerToast('✓ Revision query successfully dispatched to Accounts Coordinator!');
      await loadAdminPayroll();
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to dispatch revision request.');
    } finally {
      setIsRequestingPayrollRevision(false);
    }
  };

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
    setTriageAlerts((updated || []).filter(a => !isExcludedTriage(a)));
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
      lead_temperature: regCategory === 'passive' ? 'cold' : 'warm',
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
    setRegCategory('active');
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
    const [updatedPerms, updatedSubs] = await Promise.all([
      api.getTeacherPermissions(),
      api.getSubstitutions()
    ]);
    setTeacherPermissions(updatedPerms);
    setSubstitutions(updatedSubs);
    triggerToast(`Teacher permission request marked as ${status}`);
  };

  const handleIssueStaffLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.issueTeacherPermission({
        staff_name: issueLeaveStaffName,
        leave_category: issueLeaveCategory,
        from_date: issueLeaveFromDate,
        to_date: issueLeaveToDate,
        affected_periods: issueLeavePeriods,
        suggested_substitute: issueLeaveSubstitute,
        reason: issueLeaveReason,
        total_days: Number(issueLeaveTotalDays)
      });
      const [updatedPerms, updatedSubs] = await Promise.all([
        api.getTeacherPermissions(),
        api.getSubstitutions()
      ]);
      setTeacherPermissions(updatedPerms);
      setSubstitutions(updatedSubs);
      setShowIssueLeaveModal(false);
      triggerToast(res?.message || `Granted ${issueLeaveCategory} to ${issueLeaveStaffName}`);
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to issue staff leave.');
    }
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('edu360_substitutions_updated', { detail: updatedSubs }));
      try {
        const ch = new BroadcastChannel('edu360_global_notifications');
        ch.postMessage({ type: 'SUBSTITUTION_ASSIGNED', slots: updatedSubs });
        ch.close();
      } catch {}
    }
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('edu360_substitutions_updated', { detail: updatedSubs }));
      try {
        const ch = new BroadcastChannel('edu360_global_notifications');
        ch.postMessage({ type: 'SUBSTITUTION_ASSIGNED', slots: updatedSubs });
        ch.close();
      } catch {}
    }
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

    const matchesStatus = feeDefaulterStatusFilter === 'ALL' ||
      (feeDefaulterStatusFilter === 'ACTIVE_DUES' && d.amount_due > 0) ||
      (feeDefaulterStatusFilter === 'SETTLED' && d.amount_due <= 0);

    const matchesCategory = feeDefaulterCategoryFilter === 'ALL' ||
      (feeDefaulterCategoryFilter === 'NEW_ADMISSION' && d.is_admission_fee) ||
      (feeDefaulterCategoryFilter === 'EXISTING' && !d.is_admission_fee);

    return matchesStatus && matchesSearch && matchesTier && matchesClass && matchesCategory;
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
            const activeAlerts = triageAlerts.filter(a => !isExcludedTriage(a)).filter((a) => !a.resolved);
            const resolvedAlerts = triageAlerts.filter(a => !isExcludedTriage(a)).filter((a) => a.resolved);
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
                  initialTab={sisInitialTab}
                  onBack={() => {
                    setSelectedStudentForSIS(null);
                    setSisInitialTab('profile');
                  }}
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
                    {studentLeaveSearch && (
                      <button
                        type="button"
                        onClick={() => setStudentLeaveSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                        title="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
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

                    {(studentLeaveFilter !== 'ALL' || Boolean(studentLeaveSearch.trim())) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStudentLeaveFilter('ALL');
                          setStudentLeaveSearch('');
                        }}
                        className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-3 py-1.5 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer animate-in fade-in shrink-0"
                        title="Reset all filters"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Clear Filters</span>
                      </button>
                    )}
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
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Executive Header & Financial Operations Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Finance &amp; Bursar Cockpit
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">AY 2026–27 Realization Engine</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      <CheckCircle2 className="h-3 w-3 text-blue-600" />
                      HDFC &amp; Razorpay Gateway 99.8% SLA
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>💳 Student Fee Collections &amp; Aging Recovery</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Live banking reconciliation, automated multi-tier aging recovery ledgers, milestone realization velocity, and instant bursar receipt settlement.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleBatchFeeReminders}
                    className="flex items-center gap-2 rounded-xl bg-primary hover:opacity-95 text-primary-foreground px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Batch Reminders ({feeDefaulters.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportFeeLedger}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Export Audit Ledger</span>
                  </button>
                </div>
              </div>

              {/* Institutional Realization Metric Ribbon */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Total Annual Budget</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Target</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    ₹{feeAnalytics ? (feeAnalytics.total_target / 100000).toFixed(1) : '184.0'} L
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                    <span>1,250 Enrolled Students</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Term 1 &amp; 2 Billed</span>
                  </div>
                  <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">Realized In Bank</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      {feeAnalytics?.collection_rate_pct || 77.2}% Rate
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ₹{feeAnalytics ? (feeAnalytics.total_collected / 100000).toFixed(1) : '142.1'} L
                  </div>
                  <div className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-400/80 flex items-center justify-between font-medium">
                    <span>Cleared into Operating Escrow</span>
                    <span>Direct Deposit</span>
                  </div>
                  <div className="mt-2.5 w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${feeAnalytics?.collection_rate_pct || 77.2}%` }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">Aging Dues &amp; Arrears</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                      {feeDefaulters.length} Accounts
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    ₹{feeAnalytics ? (feeAnalytics.total_overdue / 100000).toFixed(1) : '41.9'} L
                  </div>
                  <div className="mt-2 text-xs text-amber-700/80 dark:text-amber-400/80 flex items-center justify-between font-medium">
                    <span>{feeDefaulters.filter(d => (d.days_overdue || 0) > 60).length} Critical (&gt;60d)</span>
                    <span className="text-amber-600">Recovery Active</span>
                  </div>
                  <div className="mt-2.5 w-full bg-amber-100 dark:bg-amber-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '22.8%' }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-400">Collected Today</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                      Live Feed
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                    ₹1,45,000
                  </div>
                  <div className="mt-2 text-xs text-blue-700/80 dark:text-blue-400/80 flex items-center justify-between font-medium">
                    <span>7 Verified Receipts</span>
                    <span>₹95k UPI Auto-Settled</span>
                  </div>
                  <div className="mt-2.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>

              {/* Sub-tab Navigation Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: 'aging', label: '⏳ Overdue & Recovery Ledger', badge: `${feeDefaulters.length} Defaulters` },
                    { key: 'today', label: "💵 Today's Live Collections", badge: "₹1.45 L Today" },
                    { key: 'milestones', label: '📊 Budget Milestones & Health', badge: 'AY 2026–27' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setFeeSubTab(tab.key as any)}
                      className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        feeSubTab === tab.key
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-blue-500/20'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        feeSubTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {tab.badge}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 px-2 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Last Reconciled: 10 mins ago</span>
                </div>
              </div>

              {/* SUB-SECTION 1: TODAY'S FEE COLLECTIONS */}
              {feeSubTab === 'today' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Today's Payment Gateway Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Collected Today</span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{totalCollectedToday.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {todayReceipts.length} Verified Receipts
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">UPI / Razorpay Gateway</span>
                      <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                        ₹{upiCollectedToday.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {upiReceipts.length} Instant Auto-Settled
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Transfer / NEFT</span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                        ₹{neftCollectedToday.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {neftReceipts.length} Verified by Accounts
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">School Cash Counter</span>
                      <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                        ₹{cashCollectedToday.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {cashReceipts.length} Physical Cash Slip
                      </span>
                    </div>
                  </div>

                  {/* Today's Transactions Table */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Today&apos;s Receipts Ledger (28 Oct 2026)
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCheck className="h-3.5 w-3.5" />
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
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {[
                            { receipt: 'RCP-2026-1042', name: 'Kabir Verma', roll: '10-A', head: 'Term 2 Tuition & Transport', amt: 22500, mode: 'UPI (Google Pay)', utr: 'UPI/329482910482', time: '11:42 AM' },
                            { receipt: 'RCP-2026-1041', name: 'Ananya Deshmukh', roll: '8-B', head: 'Term 2 Tuition', amt: 18000, mode: 'Razorpay NetBanking', utr: 'RZP_PAY_928194', time: '11:15 AM' },
                            { receipt: 'RCP-2026-1040', name: 'Rohan Iyer', roll: '12-Sci', head: 'Term 2 Tuition & Lab Fee', amt: 26000, mode: 'NEFT Direct Deposit', utr: 'HDFC000192837', time: '10:30 AM' },
                            { receipt: 'RCP-2026-1039', name: 'Diya Patel', roll: '6-A', head: 'Term 2 Tuition', amt: 17500, mode: 'UPI (PhonePe)', utr: 'UPI/849201948271', time: '10:04 AM' },
                            { receipt: 'RCP-2026-1038', name: 'Vivaan Sen', roll: '9-C', head: 'Term 2 Tuition & Transport', amt: 23000, mode: 'UPI (Paytm)', utr: 'UPI/194820193847', time: '09:48 AM' },
                            { receipt: 'RCP-2026-1037', name: 'Ishaan Reddy', roll: '11-Com', head: 'Term 2 Tuition', amt: 23000, mode: 'School Cash Counter', utr: 'CSH-REC-2026-89', time: '09:20 AM' },
                            { receipt: 'RCP-2026-1036', name: 'Meera Nair', roll: '7-B', head: 'Term 2 Transport Fee', amt: 15000, mode: 'NEFT Direct Deposit', utr: 'SBIN002938471', time: '08:55 AM' },
                          ].map((rec) => (
                            <tr key={rec.receipt} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                                {rec.receipt}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-900 dark:text-white block">{rec.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">Roll: {rec.roll}</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                                {rec.head}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                                  ₹{rec.amt.toLocaleString()}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  rec.mode.includes('UPI')
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                                    : rec.mode.includes('NEFT')
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                                    : rec.mode.includes('Razorpay')
                                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                                }`}>
                                  {rec.mode}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                  <span>{rec.utr}</span>
                                </div>
                                <span className="text-[10px] text-slate-400">{rec.time}</span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => triggerToast(`Downloaded Official Tax Receipt for ${rec.receipt}`)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                                >
                                  <Printer className="h-3 w-3 text-slate-500" />
                                  <span>Receipt</span>
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

              {/* SUB-SECTION 2: AGING & RECOVERY LEDGER */}
              {feeSubTab === 'aging' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* New Admission Fee Notice Banner */}
                  {feeDefaulters.some(d => d.is_admission_fee) && (
                    <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-slate-900 dark:to-blue-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                          <Users className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-purple-900 dark:text-purple-200">
                              Active Enrolment Intake Queue: {feeDefaulters.filter(d => d.is_admission_fee).length} New Admission(s)
                            </span>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-purple-600 text-white uppercase tracking-wider">
                              Seat Hold
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            New students with pending admission and registration fee clearances awaiting enrolment confirmation.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFeeDefaulterCategoryFilter(feeDefaulterCategoryFilter === 'NEW_ADMISSION' ? 'ALL' : 'NEW_ADMISSION')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          feeDefaulterCategoryFilter === 'NEW_ADMISSION'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        {feeDefaulterCategoryFilter === 'NEW_ADMISSION' ? 'Showing New Admissions' : `Filter Intake (${feeDefaulters.filter(d => d.is_admission_fee).length})`}
                      </button>
                    </div>
                  )}

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={feeDefaulterSearch}
                        onChange={(e) => setFeeDefaulterSearch(e.target.value)}
                        placeholder="Search student by name, roll, or parent..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                      />
                      {feeDefaulterSearch && (
                        <button
                          type="button"
                          onClick={() => setFeeDefaulterSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                          title="Clear search"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                      {/* Status Filter: Active Dues vs Settled vs All */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setFeeDefaulterStatusFilter('ACTIVE_DUES')}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                            feeDefaulterStatusFilter === 'ACTIVE_DUES'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Active Overdue ({feeDefaulters.filter(d => d.amount_due > 0).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeeDefaulterStatusFilter('SETTLED')}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                            feeDefaulterStatusFilter === 'SETTLED'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Settled ({feeDefaulters.filter(d => d.amount_due <= 0).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeeDefaulterStatusFilter('ALL')}
                          className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                            feeDefaulterStatusFilter === 'ALL'
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          All ({feeDefaulters.length})
                        </button>
                      </div>

                      {/* Tier Filter */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                        {(['ALL', '0-15', '16-30', '30+'] as const).map(tier => (

                          <button
                            key={tier}
                            type="button"
                            onClick={() => setFeeDefaulterTierFilter(tier)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              feeDefaulterTierFilter === tier
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            {tier === 'ALL' ? 'All Tiers' : tier === 'TIER_1' ? '1-30d' : tier === 'TIER_2' ? '31-60d' : '>60d'}
                          </button>
                        ))}
                      </div>

                      {/* Class Filter */}
                      <select
                        value={feeDefaulterClassFilter}
                        onChange={(e) => setFeeDefaulterClassFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="All Classes">All Classes</option>
                        {Array.from(new Set(feeDefaulters.map(d => d.class_name).filter(Boolean))).map(cls => (
                          <option key={cls} value={cls as string}>{cls}</option>
                        ))}
                      </select>


                      {/* Clear Filters Button */}
                      {(feeDefaulterStatusFilter !== 'ACTIVE_DUES' || feeDefaulterTierFilter !== 'ALL' || feeDefaulterCategoryFilter !== 'ALL' || feeDefaulterClassFilter !== 'All Classes' || Boolean(feeDefaulterSearch.trim())) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFeeDefaulterStatusFilter('ACTIVE_DUES');
                            setFeeDefaulterTierFilter('ALL');
                            setFeeDefaulterCategoryFilter('ALL');
                            setFeeDefaulterClassFilter('All Classes');
                            setFeeDefaulterSearch('');
                          }}
                          className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-3 py-1.5 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer animate-in fade-in shrink-0"
                          title="Reset fee defaulters filter"

                        >
                          Clear Filter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Defaulters Ledger Table */}
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Accounts in Recovery Queue
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {filteredFeeDefaulters.length} Accounts Displayed
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Total Overdue in Filter: ₹{filteredFeeDefaulters.reduce((acc, d) => acc + (d.amount_due || 0), 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                            <th className="py-3 px-4">Student &amp; Parent</th>
                            <th className="py-3 px-4">Class &amp; Roll</th>
                            <th className="py-3 px-4">Pending Overdue</th>
                            <th className="py-3 px-4">Aging Bracket</th>
                            <th className="py-3 px-4">Fee Head Breakdown</th>
                            <th className="py-3 px-4">Last Reminder Status</th>
                            <th className="py-3 px-4 text-right">Settlement Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredFeeDefaulters.length === 0 ? (
                            <tr>

                              <td colSpan={8} className="py-10 text-center">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Filter className="h-5 w-5" />
                                  </div>
                                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    No fee accounts match the selected filter criteria.
                                  </p>
                                  {(feeDefaulterStatusFilter !== 'ACTIVE_DUES' || feeDefaulterTierFilter !== 'ALL' || feeDefaulterCategoryFilter !== 'ALL' || feeDefaulterClassFilter !== 'All Classes' || Boolean(feeDefaulterSearch.trim())) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFeeDefaulterStatusFilter('ACTIVE_DUES');
                                        setFeeDefaulterTierFilter('ALL');
                                        setFeeDefaulterCategoryFilter('ALL');
                                        setFeeDefaulterClassFilter('All Classes');
                                        setFeeDefaulterSearch('');
                                      }}
                                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                                    >
                                      <RotateCcw className="h-3.5 w-3.5" />
                                      <span>Reset All Filters</span>
                                    </button>
                                  )}
                                </div>

                              </td>
                            </tr>
                          ) : (
                            filteredFeeDefaulters.map((defaulter) => (
                              <tr key={defaulter.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs shrink-0">
                                      {defaulter.student_name?.[0] || 'S'}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-900 dark:text-white">{defaulter.student_name}</span>
                                        {defaulter.is_admission_fee && (
                                          <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                                            New Intake
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-500 block">
                                        Parent: {defaulter.parent_name || 'Primary Contact'}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{defaulter.class_name}</span>
                                  <span className="text-[10px] text-slate-400 block font-mono">Roll: {defaulter.roll_no || 'N/A'}</span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="font-black text-rose-600 dark:text-rose-400 font-mono text-sm block">
                                    ₹{(defaulter.amount_due || 0).toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-slate-400">Total Due</span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    (defaulter.days_overdue || 0) > 60
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                      : (defaulter.days_overdue || 0) > 30
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                  }`}>
                                    {defaulter.days_overdue || 0} Days Overdue
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                                    <div>Tuition: ₹{Math.round((defaulter.amount_due || 0) * 0.7).toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400">Transport: ₹{Math.round((defaulter.amount_due || 0) * 0.3).toLocaleString()}</div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                                    <MessageSquare className="h-3 w-3 text-emerald-600" />
                                    <span>{defaulter.last_reminder_at ? `Sent on ${defaulter.last_reminder_at}` : 'Not Reminded'}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">WhatsApp / SMS Delivered</span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPaymentModalDefaulter(defaulter);
                                        setShowQuickFeeModal(true);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                                      title="Record Fee Payment"
                                    >
                                      Record Pay
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setWaiverModalDefaulter(defaulter);
                                        
                                      }}
                                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                                      title="Apply Principal Fee Waiver or Concession"
                                    >
                                      Waiver
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setHistoryModalDefaulter(defaulter)}
                                      className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                                      title="View Student Receipt History"
                                    >
                                      <History className="h-3.5 w-3.5" />
                                    </button>
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
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Milestone 1 • Closed &amp; Reconciled
                        </span>
                        <span className="text-xs font-bold text-emerald-600">96.8% Realized</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Term 1 Tuition &amp; Curriculum</h4>
                        <span className="text-xs text-slate-500">Maturity Date: 15 Jul 2026 • ₹35,000 / student</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full w-[96.8%]" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>Target: ₹35.0 Lakhs</span>
                        <span className="font-bold text-emerald-600">Collected: ₹33.88 Lakhs</span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-xs relative">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Milestone 2 • Overdue Recovery Active
                        </span>
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">30 Overdue</span>
                      </div>
                      <div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Term 2 Tuition &amp; Infrastructure</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Due: 25 Oct 2026 • ₹18,500 / student</span>

                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full w-[78.2%]" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>Target: ₹25.5 Lakhs</span>
                        <span className="font-bold text-rose-600">Pending: ₹5.55 Lakhs</span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Milestone 3 • Scheduled Pipeline
                        </span>
                        <span className="text-xs font-bold text-blue-600">Upcoming Jan</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Term 3 Activities &amp; Annual Day</h4>
                        <span className="text-xs text-slate-500">Maturity Date: 15 Jan 2027 • ₹15,000 / student</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full w-[15%]" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>Target: ₹30.0 Lakhs</span>
                        <span className="font-bold text-blue-600">Early Birds: ₹4.50 Lakhs</span>
                      </div>
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
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header Banner & View Toggle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        Faculty Intelligence &amp; Roster
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Teaching Personnel Directory</span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      Faculty &amp; Teaching Personnel Directory
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Live classroom occupancy, subject assignments, weekly teaching load, biometric punctuality, and salary compensation.
                    </p>
                  </div>

                  {/* Right: View Switcher (Cards vs Table) & Total Count */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs">
                      Total Personnel: <strong className="text-slate-900 dark:text-white">{staffMembers.length}</strong>
                    </span>

                    <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setStaffViewMode('cards')}
                        title="Visual Faculty Cards"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          staffViewMode === 'cards'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Cards</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStaffViewMode('table')}
                        title="Condensed Table View"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          staffViewMode === 'table'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <List className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Table</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Top Operational Metrics (4 KPI Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Teaching Personnel</span>
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{staffMembers.length}</span>
                      <span className="text-xs font-bold text-slate-500">Full-time Faculty</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">8 Academic Departments</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">In Classroom Sessions</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">28</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">teaching now</span>
                    </div>
                    <span className="text-[10px] text-emerald-600/80 block mt-1">Period 3 active across campus</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Standby Free for Cover</span>
                      <Shuffle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400">12</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">available proxies</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">Zero timetable conflict verified</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Absence / Cover Status</span>
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Today
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {staffMembers.filter(s => s.status === 'On Leave').length || 2}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">100% Proxies Assigned</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">Zero unmanned classroom gaps</span>
                  </div>
                </div>

                {/* Filters, Department & Search Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  {/* Department Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                    {['All', 'Academics', 'Sports & Estate', 'Cultural', 'Logistics', 'External Vendor'].map(dept => (
                      <button
                        key={dept}
                        type="button"
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

                  {/* Status Filter & Search */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={staffStatusFilter}
                      onChange={(e) => setStaffStatusFilter(e.target.value as any)}
                      className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Live Statuses</option>
                      <option value="in_class">In Class Right Now</option>
                      <option value="free">Free Period (Standby)</option>
                      <option value="leave">On Leave / Away</option>
                    </select>

                    <div className="relative min-w-[200px]">
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={staffSearchQuery}
                        onChange={e => setStaffSearchQuery(e.target.value)}
                        placeholder="Search staff, class, role..."
                        className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {staffSearchQuery && (
                        <button onClick={() => setStaffSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* VIEW MODE 1: VISUAL FACULTY CARDS GRID */}
                {staffViewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staffMembers
                      .filter(s => staffRoleFilter === 'All' || s.department === staffRoleFilter || (staffRoleFilter === 'Academics' && ((s.department || '').includes('Science') || (s.department || '').includes('Mathematics') || (s.department || '').includes('Humanities') || (s.department || '').includes('Languages'))))
                      .filter(s => {
                        if (staffStatusFilter === 'All') return true;
                        const live = getStaffLiveStatus(s);
                        return live.type === staffStatusFilter;
                      })
                      .filter(s => {
                        if (!staffSearchQuery) return true;
                        const q = staffSearchQuery.toLowerCase();
                        return (
                          (s.name || '').toLowerCase().includes(q) ||
                          (s.role || '').toLowerCase().includes(q) ||
                          (s.department || '').toLowerCase().includes(q) ||
                          (s.assigned_classes || []).some(c => c.toLowerCase().includes(q))
                        );
                      })
                      .map((staff) => {
                        const live = getStaffLiveStatus(staff);
                        const initials = (staff.name || 'S').split(' ').map(n => n[0]).slice(0, 2).join('');
                        const leavesTaken = staff.leaves_taken ?? 2;
                        const leavesTotal = staff.leaves_total ?? 15;

                        return (
                          <div
                            key={staff.id}
                            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3.5">
                              {/* Card Header: Avatar + Identity + Live Beacon */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                                    {initials}
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                                      {staff.name}
                                    </h3>
                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                                      {staff.role}
                                    </p>
                                    <span className="text-[11px] text-slate-400 block">
                                      {staff.department}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Live Classroom Beacon Tag */}
                              <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${live.bgColor} ${live.borderColor} ${live.textColor}`}>
                                <div className="flex items-center gap-2">
                                  <span className={`h-2 w-2 rounded-full ${live.dotColor} animate-pulse shrink-0`} />
                                  <span>{live.badge}</span>
                                </div>
                                <span className="text-[10px] opacity-75 font-mono">{live.currentLocation}</span>
                              </div>

                              {/* Assigned Classes & Qualification */}
                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                  <span>Assigned Cohorts:</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {staff.experience || '8 Yrs Exp'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {(staff.assigned_classes || ['Class 9-A', 'Class 10-B']).map((cls, idx) => (
                                    <span
                                      key={idx}
                                      className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                                    >
                                      {cls}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Weekly Teaching Workload Capacity Bar */}
                              <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-500 font-medium">Weekly Teaching Load:</span>
                                  <strong className="text-slate-900 dark:text-white font-extrabold">
                                    {live.weeklyLoad} / {live.weeklyCapacity} periods ({live.loadPercent}%)
                                  </strong>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      live.isOverloaded
                                        ? 'bg-amber-500'
                                        : 'bg-blue-600 dark:bg-blue-400'
                                    }`}
                                    style={{ width: `${Math.min(100, live.loadPercent)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Salary & Leaves Micro-row */}
                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                                <div>
                                  <span className="text-slate-400 uppercase text-[9px] font-bold block">Monthly Comp</span>
                                  <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                                    ₹{(staff.salary || 65000).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 uppercase text-[9px] font-bold block">Leave Balance</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {leavesTotal - leavesTaken} of {leavesTotal} left
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Footer Dock */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveTab('substitutions')}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                              >
                                <Shuffle className="h-3 w-3 text-blue-600" />
                                <span>Proxy Cover</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedStaffForModal(staff)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                              >
                                <span>Inspect Dossier</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  /* VIEW MODE 2: CONDENSED ROSTER TABLE */
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="py-3 px-4">Faculty Member &amp; Department</th>
                            <th className="py-3 px-4">Live State &amp; Shift</th>
                            <th className="py-3 px-4">Workload Capacity</th>
                            <th className="py-3 px-4">Assigned Classes</th>
                            <th className="py-3 px-4">Monthly Salary</th>
                            <th className="py-3 px-4">Leave Quota</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {staffMembers
                            .filter(s => staffRoleFilter === 'All' || s.department === staffRoleFilter || (staffRoleFilter === 'Academics' && ((s.department || '').includes('Science') || (s.department || '').includes('Mathematics') || (s.department || '').includes('Humanities') || (s.department || '').includes('Languages'))))
                            .filter(s => {
                              if (staffStatusFilter === 'All') return true;
                              const live = getStaffLiveStatus(s);
                              return live.type === staffStatusFilter;
                            })
                            .filter(s => {
                              if (!staffSearchQuery) return true;
                              const q = staffSearchQuery.toLowerCase();
                              return (
                                (s.name || '').toLowerCase().includes(q) ||
                                (s.role || '').toLowerCase().includes(q) ||
                                (s.department || '').toLowerCase().includes(q)
                              );
                            })
                            .map((staff) => {
                              const live = getStaffLiveStatus(staff);
                              const initials = (staff.name || 'S').split(' ').map(n => n[0]).slice(0, 2).join('');
                              return (
                                <tr key={staff.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                        {initials}
                                      </div>
                                      <div>
                                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                          <span>{staff.name}</span>
                                          <span className={`h-1.5 w-1.5 rounded-full ${live.dotColor}`} />
                                        </div>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                          {staff.role} &bull; {staff.department}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3 px-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${live.bgColor} ${live.borderColor} ${live.textColor}`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${live.dotColor}`} />
                                      <span>{live.badge}</span>
                                    </span>
                                  </td>

                                  <td className="py-3 px-4">
                                    <div className="space-y-1 min-w-[120px]">
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-slate-500 font-medium">{live.weeklyLoad} / {live.weeklyCapacity}</span>
                                        <strong className="text-slate-900 dark:text-white">{live.loadPercent}%</strong>
                                      </div>
                                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div
                                          className="h-full rounded-full bg-blue-600 dark:bg-blue-400"
                                          style={{ width: `${Math.min(100, live.loadPercent)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1 flex-wrap">
                                      {(staff.assigned_classes || ['Class 9-A']).slice(0, 2).map((cls, idx) => (
                                        <span key={idx} className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                          {cls}
                                        </span>
                                      ))}
                                      {(staff.assigned_classes || []).length > 2 && (
                                        <span className="text-[10px] text-slate-400">
                                          +{staff.assigned_classes!.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white tabular-nums">
                                    ₹{(staff.salary || 65000).toLocaleString('en-IN')}
                                  </td>

                                  <td className="py-3 px-4">
                                    <span className="text-slate-700 dark:text-slate-300 font-bold block text-[11px]">
                                      {(staff.leaves_total ?? 15) - (staff.leaves_taken ?? 2)} left
                                    </span>
                                    <span className="text-[10px] text-slate-400">{staff.leaves_taken ?? 2} taken</span>
                                  </td>

                                  <td className="py-3 px-4 text-right">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedStaffForModal(staff)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                                    >
                                      <span>Inspect</span>
                                      <ArrowRight className="h-3 w-3" />
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
              </div>
            )}
          </div>
        )}

          {/* TAB: FACULTY PERMISSIONS & SHIFTS                    */}
          {/* ===================================================== */}
          {activeTab === 'permissions' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Navigation & Operations Switcher */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      Faculty Governance &amp; Shifts
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Leave &amp; Substitution Engine</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    Teacher Leaves, Half-Days &amp; Absence Adjudication
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review faculty absence requests, monitor leave balance quotas, evaluate Loss of Pay (LOP) risks, and ensure zero unmanned classroom periods.
                  </p>
                </div>

                {/* Switcher Pills between Leaves & Cover */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('permissions')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>Teacher Leaves ({pendingPermissionCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('substitutions')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    <span>Class Cover Matrix ({unassignedSubCount} open)</span>
                  </button>
                </div>
              </div>

              {/* Top Operational Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Pending Approvals</span>
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{pendingPermissionCount}</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Requires Principal Review</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Turnaround SLA: &lt; 45 mins</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Today's Affected Periods</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {unassignedSubCount > 0 ? 'Action Needed' : 'Covered'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{unassignedSubCount}</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">periods unmanned</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Class 8-B Maths (Period 3)</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Faculty Duty Ratio</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">95.5%</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">42 / 44 on duty</span>
                  </div>
                  <span className="text-[10px] text-emerald-600/80 block mt-1">2 Planned absences today</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Payroll LOP Exposure</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Current Cycle
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">₹0</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Zero LOP Penalties</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">All active leaves within quota</span>
                </div>
              </div>

              {/* 7-Day Campus Absence Radar Ribbon */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      7-Day Faculty Absence Forecast &amp; Peak Radar
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Calculated from approved &amp; pending leaves
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                  {campusAbsenceRadar.map((slot) => {
                    const isCritical = slot.status === 'critical';
                    const isToday = slot.label === 'Today';
                    return (
                      <div
                        key={slot.day}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isCritical
                            ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                            : isToday
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 ring-1 ring-blue-500/30'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                          <span className="font-extrabold">{slot.day}</span>
                          <span>{slot.date}</span>
                        </div>
                        <div className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                          {slot.count}
                        </div>
                        <span
                          className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            isCritical
                              ? 'bg-rose-200 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200'
                              : isToday
                              ? 'bg-blue-200 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200'
                              : slot.count > 0
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {slot.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mr-1">Status:</span>
                  {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(tab => {
                    const count = tab === 'All' 
                      ? teacherPermissions.length 
                      : teacherPermissions.filter(p => p.status === tab).length;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setPermFilter(tab)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          permFilter === tab
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{tab}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          permFilter === tab
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search & Type Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative min-w-[200px]">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search faculty or subject..."
                      value={permSearchQuery}
                      onChange={(e) => setPermSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={permTypeFilter}
                    onChange={(e) => setPermTypeFilter(e.target.value)}
                    className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Leave Types</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Medical">Medical Leave</option>
                    <option value="Early Departure">Short / Half-Day</option>
                    <option value="On-Duty">On-Duty Movement</option>
                  </select>
                </div>
              </div>

              {/* Elevated Teacher Leave Cards Grid */}
              <div className="space-y-4">
                {teacherPermissions
                  .filter(p => permFilter === 'All' || p.status === permFilter)
                  .filter(p => permTypeFilter === 'All' || (p.type || '').toLowerCase().includes(permTypeFilter.toLowerCase()))
                  .filter(p => !permSearchQuery || (p.teacher_name || '').toLowerCase().includes(permSearchQuery.toLowerCase()) || (p.reason || '').toLowerCase().includes(permSearchQuery.toLowerCase()))
                  .map((req) => {
                    const meta = getTeacherLeaveMeta(req);
                    const isPending = req.status === 'Pending';
                    const isApproved = req.status === 'Approved';
                    const isRejected = req.status === 'Rejected';

                    return (
                      <div
                        key={req.id}
                        className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                      >
                        {/* Card Header: Teacher Avatar + Identity + Leave Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${meta.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0`}>
                              {(req.teacher_name || 'T').split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                  {req.teacher_name}
                                </h3>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                                  {meta.empId}
                                </span>
                                <span className="text-xs text-slate-400">&bull;</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                  {meta.department}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="rounded-lg bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[11px] font-bold border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300">
                                  {req.type}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  Date: <strong className="text-slate-800 dark:text-slate-200">{req.date}</strong>
                                </span>
                                <span className="text-xs text-slate-400">&bull;</span>
                                <span className="text-[11px] text-slate-400">
                                  Duty Shift: {meta.dutyShift}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : isRejected
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse'
                            }`}>
                              {isApproved ? <CheckCircle2 className="h-3.5 w-3.5" /> : isRejected ? <X className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                              <span>{req.status}</span>
                            </span>
                          </div>
                        </div>

                        {/* Leave Reason Quote Box */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Stated Justification
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">
                            &ldquo;{req.reason}&rdquo;
                          </p>
                          {meta.hasMedicalDoc && (
                            <div className="pt-2 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                                <FileCheck className="h-3.5 w-3.5" />
                                <span>Verified Medical Certificate Attached</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Mid-Row: Leave Quota Ledger + Class Cover Radar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {/* Left: Leave Balance Chips */}
                          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-600 dark:text-slate-400">Leave Balance Quotas:</span>
                              <span className={`font-bold ${meta.lopAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {meta.lopRisk}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                                <span className="text-[9px] font-bold text-slate-400 block uppercase">Casual (CL)</span>
                                <span className={`text-xs font-black ${meta.casualLeft === 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                                  {meta.casualLeft} / {meta.casualTotal}
                                </span>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                                <span className="text-[9px] font-bold text-slate-400 block uppercase">Medical (ML)</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {meta.medicalLeft} / {meta.medicalTotal}
                                </span>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                                <span className="text-[9px] font-bold text-slate-400 block uppercase">Earned (EL)</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {meta.earnedLeft} / {meta.earnedTotal}
                                </span>
                              </div>
                            </div>

                            {meta.lopAmount > 0 && (
                              <div className="flex items-center gap-1.5 text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-200 dark:border-rose-900">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                <span>Projected Payroll Deduction: ₹{meta.lopAmount.toLocaleString('en-IN')} (Loss of Pay)</span>
                              </div>
                            )}
                          </div>

                          {/* Right: Affected Periods & Proxy Cover Match */}
                          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                              Classroom Period Impact &amp; Proxy Cover:
                            </span>

                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-slate-900 dark:text-white">
                                  {meta.affectedPeriod}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                  {meta.affectedClass}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] pt-1">
                                <span className="text-slate-500">Auto-Matched Proxy:</span>
                                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  ✓ {meta.proxyTeacher}
                                </strong>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setActiveTab('substitutions')}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Shuffle className="h-3 w-3 text-blue-600" />
                              <span>View &amp; Verify Class Substitution Matrix</span>
                            </button>
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>Submitted: {req.applied_at || 'Today'}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPermForModal(req);
                                setPermPrincipalRemarks(`Approved with ${meta.proxyTeacher} covering ${meta.affectedPeriod}.`);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                            >
                              <ClipboardCheck className="h-3.5 w-3.5 text-blue-600" />
                              <span>Detailed Adjudication</span>
                            </button>

                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleReviewPermission(req.id, 'Approved')}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Quick Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReviewPermission(req.id, 'Rejected')}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {isApproved && (
                              <button
                                type="button"
                                onClick={() => {
                                  downloadOfficialDocumentFile(`Teacher Leave Pass - ${req.teacher_name}`, req.type, `LEAVE-${req.id}`);
                                  triggerToast(`Downloaded Official Leave Gate Pass for ${req.teacher_name}`);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Download Gate Pass</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* TEACHER LEAVE ADJUDICATION MODAL */}
              {selectedPermForModal && (() => {
                const modalMeta = getTeacherLeaveMeta(selectedPermForModal);
                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
                    <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 my-8">
                      {/* Modal Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-2xl bg-gradient-to-tr ${modalMeta.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-xs`}>
                            {(selectedPermForModal.teacher_name || 'T').split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                              Adjudicate Leave: {selectedPermForModal.teacher_name}
                            </h3>
                            <span className="text-xs text-slate-500 font-medium">
                              {modalMeta.department} &bull; {modalMeta.empId}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPermForModal(null)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="space-y-4">
                        {/* Summary Block */}
                        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-400 uppercase font-bold text-[10px] block">Leave Request Type</span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedPermForModal.type}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase font-bold text-[10px] block">Requested Date / Timing</span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedPermForModal.date}</span>
                          </div>
                        </div>

                        {/* Stated Reason */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Teacher's Submitted Note</span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                            &ldquo;{selectedPermForModal.reason}&rdquo;
                          </p>
                        </div>

                        {/* Leave Quota Ledger */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            Annual Entitlement Ledger:
                          </span>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Casual Leaves</span>
                              <span className="text-sm font-black text-slate-900 dark:text-white">{modalMeta.casualLeft} of {modalMeta.casualTotal} left</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Medical Leaves</span>
                              <span className="text-sm font-black text-slate-900 dark:text-white">{modalMeta.medicalLeft} of {modalMeta.medicalTotal} left</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Earned Leaves</span>
                              <span className="text-sm font-black text-slate-900 dark:text-white">{modalMeta.earnedLeft} of {modalMeta.earnedTotal} left</span>
                            </div>
                          </div>
                        </div>

                        {/* Period Proxy Guarantee */}
                        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Classroom Period Cover Confirmed</span>
                          </div>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                            {modalMeta.affectedPeriod} ({modalMeta.affectedClass}) will be covered by <b>{modalMeta.proxyTeacher}</b>. Zero student instructional downtime.
                          </p>
                        </div>

                        {/* Principal Remarks Textarea */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            Executive Determination Remarks (Appears on Gate Pass):
                          </label>
                          <textarea
                            rows={3}
                            value={permPrincipalRemarks}
                            onChange={(e) => setPermPrincipalRemarks(e.target.value)}
                            placeholder="Enter determination note, instructions for proxy teacher, or conditions of approval..."
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setSelectedPermForModal(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            setIsSubmittingPermReview(true);
                            await handleReviewPermission(selectedPermForModal.id, 'Rejected');
                            setIsSubmittingPermReview(false);
                            setSelectedPermForModal(null);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200 transition-colors"
                        >
                          Reject Request
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            setIsSubmittingPermReview(true);
                            await handleReviewPermission(selectedPermForModal.id, 'Approved');
                            setIsSubmittingPermReview(false);
                            setSelectedPermForModal(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve &amp; Dispatch Proxy Notification</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          {/* ===================================================== */}
          {/* TAB: STAFF PAYROLL & COMPENSATION                    */}
          {/* ===================================================== */}
          {activeTab === 'payroll' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Executive Header & Bank Integration Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Executive Faculty Compensation &amp; Payroll
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monthly Disbursement Cycle</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      <Building2 className="h-3 w-3 text-blue-600" />
                      HDFC Corporate Salary Bulk CMS Active
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>💼 Staff Salaries, Compensation &amp; Payslip Vault</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Automated salary calculations with HRA &amp; DA allowances, statutory EPF/TDS compliance withholding, live Leave LOP sync, and 1-click digital payslip dispatch.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDisbursingPayroll(true);
                      setTimeout(() => {
                        setIsDisbursingPayroll(false);
                        triggerToast('Successfully dispatched direct NEFT salary transfer to 42 faculty accounts via HDFC CMS!');
                      }, 1200);
                    }}
                    disabled={isDisbursingPayroll}
                    className="flex items-center gap-2 rounded-xl bg-primary hover:opacity-95 text-primary-foreground px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isDisbursingPayroll ? 'Transmitting NEFT...' : 'Execute Batch Bank Transfer'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerToast('Exported October 2026 Salary CMS Ledger (CSV)')}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Export Bank CMS</span>
                  </button>
                </div>
              </div>

              {/* Monthly Payroll Strategic KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Gross Monthly Outflow</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Liability</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    ₹28,50,000
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                    <span>44 Full-Time Faculty &amp; Staff</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">October 2026 Cycle</span>
                  </div>
                  <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">Net Disbursed Take-Home</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      95.5% Cleared
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ₹26,20,000
                  </div>
                  <div className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-400/80 flex items-center justify-between font-medium">
                    <span>42 Disbursed via Direct NEFT</span>
                    <span>2 Pending Audit</span>
                  </div>
                  <div className="mt-2.5 w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '95.5%' }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-purple-700 dark:text-purple-400">Statutory Deductions</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                      EPF &amp; TDS
                    </span>
                  </div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
                    ₹2,30,000
                  </div>
                  <div className="mt-2 text-xs text-purple-700/80 dark:text-purple-400/80 flex items-center justify-between font-medium">
                    <span>EPF 12% + Prof Tax ₹200 + TDS</span>
                    <span className="text-purple-600">100% Compliant</span>
                  </div>
                  <div className="mt-2.5 w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '8.1%' }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">Leave LOP Adjustments</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                      Auto-Synced
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    -₹45,000
                  </div>
                  <div className="mt-2 text-xs text-amber-700/80 dark:text-amber-400/80 flex items-center justify-between font-medium">
                    <span>2 Faculty with Unapproved Leave</span>
                    <span>Live Quota Sync</span>
                  </div>
                  <div className="mt-2.5 w-full bg-amber-100 dark:bg-amber-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Filter, Search & Payroll Cycle Ribbon */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative flex-1 max-w-sm">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={payrollSearch}
                    onChange={(e) => setPayrollSearch(e.target.value)}
                    placeholder="Search faculty by name, employee code, or role..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Cycle Selector */}
                  <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                    {(['Oct 2026', 'Sep 2026', 'Aug 2026'] as const).map(cycle => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => setSelectedPayrollCycle(cycle)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          selectedPayrollCycle === cycle
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {cycle}
                      </button>
                    ))}
                  </div>

                  {/* Department Filter */}
                  <select
                    value={payrollDeptFilter}
                    onChange={(e) => setPayrollDeptFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Academics">Academics &amp; Faculty</option>
                    <option value="Administration">Administration &amp; Bursar</option>
                    <option value="Transport">Transport &amp; Fleet</option>
                    <option value="Support">Support &amp; Facilities</option>
                  </select>
                </div>
              </div>

              {/* Faculty Compensation Register Table */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Faculty Compensation Register &amp; Digital Pay Slips
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {staffMembers.filter(s => {
                        const matchDept = payrollDeptFilter === 'ALL' || s.department === payrollDeptFilter;
                        const matchSearch = !payrollSearch.trim() || s.name.toLowerCase().includes(payrollSearch.toLowerCase()) || s.role.toLowerCase().includes(payrollSearch.toLowerCase());
                        return matchDept && matchSearch;
                      }).length} Staff Records
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Cycle: <strong className="text-slate-800 dark:text-slate-200">{selectedPayrollCycle}</strong> • Disbursed via Direct Bank Deposit
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                        <th className="py-3 px-4">Employee Details</th>
                        <th className="py-3 px-4">Basic Pay</th>
                        <th className="py-3 px-4">Allowances (HRA/DA)</th>
                        <th className="py-3 px-4">Statutory Deductions</th>
                        <th className="py-3 px-4">Net Take-Home</th>
                        <th className="py-3 px-4">Bank Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {staffMembers
                        .filter(staff => {
                          const matchDept = payrollDeptFilter === 'ALL' || staff.department === payrollDeptFilter;
                          const matchSearch = !payrollSearch.trim() || staff.name.toLowerCase().includes(payrollSearch.toLowerCase()) || staff.role.toLowerCase().includes(payrollSearch.toLowerCase());
                          return matchDept && matchSearch;
                        })
                        .map((staff) => {
                          const basic = staff.salary || 65000;
                          const hra = Math.round(basic * 0.2);
                          const da = Math.round(basic * 0.1);
                          const epf = Math.round(basic * 0.12);
                          const tax = Math.round(basic * 0.05);
                          const lop = staff.id === 3 ? 2500 : 0; // example LOP
                          const deductions = epf + tax + lop;
                          const net = basic + hra + da - deductions;
                          const isDisbursed = staff.id !== 4; // example pending check

                          return (
                            <tr key={staff.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs shrink-0">
                                    {staff.name?.[0] || 'S'}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900 dark:text-white">{staff.name}</span>
                                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        {staff.role}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono block">
                                      EMP-{202400 + staff.id} • {staff.department || 'Academics'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                                ₹{basic.toLocaleString()}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                                  <div>HRA (20%): ₹{hra.toLocaleString()}</div>
                                  <div className="text-[10px] text-slate-400">DA (10%): ₹{da.toLocaleString()}</div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                                  <div>EPF 12%: -₹{epf.toLocaleString()}</div>
                                  <div className="text-[10px] text-slate-400">TDS: -₹{tax.toLocaleString()} {lop > 0 && <span className="text-amber-600 font-semibold">• LOP: -₹{lop}</span>}</div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm block">
                                  ₹{net.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-slate-400">Net Take-Home</span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isDisbursed
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${isDisbursed ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                  {isDisbursed ? 'NEFT Disbursed' : 'Under Audit Review'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPayslipStaff(staff)}
                                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                                    title="View & Print Official Payslip"
                                  >
                                    <FileText className="h-3 w-3 text-slate-500" />
                                    <span>Payslip</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => triggerToast(`Dispatched digital payslip to ${staff.name}'s mobile portal`)}
                                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                                    title="Dispatch Digital Slip to Staff App"
                                  >
                                    <Send className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interactive Itemized Payslip Modal */}
              {selectedPayslipStaff && (() => {
                const basic = selectedPayslipStaff.salary || 65000;
                const hra = Math.round(basic * 0.2);
                const da = Math.round(basic * 0.1);
                const allowance = Math.round(basic * 0.05);
                const gross = basic + hra + da + allowance;
                const epf = Math.round(basic * 0.12);
                const tax = Math.round(basic * 0.05);
                const profTax = 200;
                const lop = selectedPayslipStaff.id === 3 ? 2500 : 0;
                const totalDeductions = epf + tax + profTax + lop;
                const netPay = gross - totalDeductions;

                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-150">
                      {/* Payslip Header */}
                      <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm">
                            E360
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                              EDU360 Central Model Academy
                            </h3>
                            <span className="text-[11px] text-slate-500 block">
                              CBSE Affiliation No. 1930482 • Salary Slip for {selectedPayrollCycle}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPayslipStaff(null)}
                          className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Staff & Payment Metadata */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Employee Name</span>
                          <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{selectedPayslipStaff.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">EMP-{202400 + selectedPayslipStaff.id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Designation</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{selectedPayslipStaff.role}</span>
                          <span className="text-[10px] text-slate-500">{selectedPayslipStaff.department || 'Academics'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Bank &amp; Account</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">HDFC Bank</span>
                          <span className="text-[10px] text-slate-500 font-mono">A/C: ****4928</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance / Days</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{lop > 0 ? '29.5 / 31' : '31 / 31'} Days</span>
                          <span className="text-[10px] text-emerald-600 font-semibold">{lop > 0 ? '1.5 Days LOP' : '100% Present'}</span>
                        </div>
                      </div>

                      {/* Earnings vs Deductions Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* Earnings Box */}
                        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 p-3.5 space-y-2">
                          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block border-b border-emerald-200/80 dark:border-emerald-900/80 pb-1.5">
                            Earnings (Gross: ₹{gross.toLocaleString()})
                          </span>
                          <div className="space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Basic Pay</span>
                              <span className="font-bold font-mono">₹{basic.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA 20%)</span>
                              <span className="font-bold font-mono">₹{hra.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Dearness Allowance (DA 10%)</span>
                              <span className="font-bold font-mono">₹{da.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Academic Research &amp; Special</span>
                              <span className="font-bold font-mono">₹{allowance.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Deductions Box */}
                        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 p-3.5 space-y-2">
                          <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider block border-b border-rose-200/80 dark:border-rose-900/80 pb-1.5">
                            Deductions (Total: ₹{totalDeductions.toLocaleString()})
                          </span>
                          <div className="space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Provident Fund (EPF 12%)</span>
                              <span className="font-bold font-mono text-rose-600">-₹{epf.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Income Tax (TDS)</span>
                              <span className="font-bold font-mono text-rose-600">-₹{tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Professional Tax</span>
                              <span className="font-bold font-mono text-rose-600">-₹{profTax.toLocaleString()}</span>
                            </div>
                            {lop > 0 && (
                              <div className="flex justify-between">
                                <span className="text-amber-600 font-semibold">Unpaid Leave (LOP Adjustment)</span>
                                <span className="font-bold font-mono text-amber-600">-₹{lop.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Net Take-Home Ribbon */}
                      <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Salary Payable</span>
                          <span className="text-xl font-black font-mono text-emerald-400">₹{netPay.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Bank Transfer UTR: HDFCN262849104</span>
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                            <CheckCircle2 className="h-3 w-3" />
                            Direct Deposit Confirmed
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-slate-400">Generated automatically by EDU360 Bursar Engine</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => triggerToast(`Printing official salary slip for ${selectedPayslipStaff.name}`)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            <Printer className="h-3.5 w-3.5 text-slate-500" />
                            <span>Print Slip</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerToast(`Downloaded digitally signed PDF payslip for ${selectedPayslipStaff.name}`)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 transition-all cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Signed PDF</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Executive Header & Logistics Operations Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 px-3 py-0.5 text-xs font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-purple-600 animate-spin" />
                      Campus Operations &amp; Event Command Hub
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">AY 2026–27 Calendar</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Fire, Security &amp; EMT Protocol Cleared
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>🎪 School Events, Logistics &amp; Committee Roster</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Live campus event operations, stage logistics coordination, faculty committee mapping, venue capacity tracking, and vendor procurement budgets.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddEventModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary hover:opacity-95 text-primary-foreground px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Schedule Campus Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerToast('Exported Master Event Calendar (iCal/CSV)')}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Export Calendar</span>
                  </button>
                </div>
              </div>

              {/* Event Operations Strategic KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Scheduled Events</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Term 2</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    {schoolEvents.length} Active Events
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                    <span>Cultural, STEM, Sports &amp; PTM</span>
                    <span className="font-semibold text-purple-600">All Confirmed</span>
                  </div>
                  <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-purple-700 dark:text-purple-400">Total Budget Allocated</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                      71% Deployed
                    </span>
                  </div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
                    ₹8,50,000
                  </div>
                  <div className="mt-2 text-xs text-purple-700/80 dark:text-purple-400/80 flex items-center justify-between font-medium">
                    <span>Max Cap: ₹12,00,000</span>
                    <span>Bursar Approved</span>
                  </div>
                  <div className="mt-2.5 w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '70.8%' }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-400">Expected Footfall</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                      RSVP Verified
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                    1,420 Attendees
                  </div>
                  <div className="mt-2 text-xs text-blue-700/80 dark:text-blue-400/80 flex items-center justify-between font-medium">
                    <span>Parents, Dignitaries &amp; Students</span>
                    <span className="text-blue-600">Passes Issued</span>
                  </div>
                  <div className="mt-2.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">Campus Protocol</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      100% Cleared
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    Zero Risk
                  </div>
                  <div className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-400/80 flex items-center justify-between font-medium">
                    <span>Security, First-Aid &amp; EMT Ready</span>
                    <span>Hospital Standby</span>
                  </div>
                  <div className="mt-2.5 w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              {/* View Mode Switcher & Category Filter Ribbon */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                {/* 3-way View Switcher */}
                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setEventViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      eventViewMode === 'grid'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Event Showcase</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventViewMode('hierarchy')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      eventViewMode === 'hierarchy'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Committee Hierarchy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventViewMode('budget')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      eventViewMode === 'budget'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Logistics &amp; Vendors</span>
                  </button>
                </div>

                {/* Category & Search Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      placeholder="Search events, venues..."
                      className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>

                  <select
                    value={eventCategoryFilter}
                    onChange={(e) => setEventCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Cultural">Cultural &amp; Annual Day</option>
                    <option value="Academic">Academic &amp; STEM</option>
                    <option value="Sports">Sports &amp; Athletics</option>
                  </select>
                </div>
              </div>

              {/* VIEW 1: EVENT SHOWCASE GRID */}
              {eventViewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-150">
                  {schoolEvents
                    .filter(evt => {
                      const matchCat = eventCategoryFilter === 'ALL' || evt.category === eventCategoryFilter;
                      const matchSearch = !eventSearch.trim() || evt.title.toLowerCase().includes(eventSearch.toLowerCase()) || evt.location.toLowerCase().includes(eventSearch.toLowerCase());
                      return matchCat && matchSearch;
                    })
                    .map((evt) => (
                      <div
                        key={evt.id}
                        className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 relative overflow-hidden group hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900 px-3 py-0.5 text-xs font-bold">
                              {evt.category}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {evt.status || 'Active Preparation'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            {evt.target_audience}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {evt.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5">
                            {evt.description}
                          </p>
                        </div>

                        {/* Venue & Capacity Meter */}
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              📍 {evt.location}
                            </span>
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                              520 / 600 Seats (87%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '87%' }} />
                          </div>
                        </div>

                        {/* Event Date & Quick Action Dock */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                            <Calendar className="h-3.5 w-3.5 text-purple-600" />
                            {evt.date}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => triggerToast(`Broadcasting event circular for "${evt.title}" to parent app notifications`)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                            >
                              Broadcast Circular
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerToast(`Opened stage duty checklist for "${evt.title}"`)}
                              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold hover:opacity-95 transition-all cursor-pointer shadow-xs"
                            >
                              Duty Roster
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* VIEW 2: COMMITTEE & FACULTY HIERARCHY */}
              {eventViewMode === 'hierarchy' && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Staff &amp; Student Committee Mapping (Task Hierarchy)
                      </h3>
                      <span className="text-xs text-slate-500">
                        Operational duty distribution and volunteer hierarchy for Annual Day &amp; Science Expo
                      </span>
                    </div>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-900">
                      12 Faculty Leads • 38 Student Volunteers
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 p-4.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                          Stage &amp; Cultural Wing
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                          3 Tasks
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Mrs. Ananya Verma • Lead Faculty</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">Stage Coordination, Choir &amp; Script Supervision</span>
                      </div>
                      <div className="pt-2.5 border-t border-purple-200/80 dark:border-purple-900/80 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                        <div className="font-semibold text-purple-900 dark:text-purple-300 text-[10px] uppercase">Senior Student Prefects:</div>
                        <div>Aarav Sharma (12-Sci) • Stage Audio Cue</div>
                        <div>Diya Patel (11-Arts) • Anchor Coordination</div>
                        <div>Rohan Iyer (12-Com) • VIP Green Room</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-4.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                          Discipline &amp; VIP Logistics
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                          2 Tasks
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Mr. Vikram Joshi • Lead Faculty</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">Gate Pass Management, Parking &amp; Dignitary Escort</span>
                      </div>
                      <div className="pt-2.5 border-t border-blue-200/80 dark:border-blue-900/80 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                        <div className="font-semibold text-blue-900 dark:text-blue-300 text-[10px] uppercase">Senior Student Prefects:</div>
                        <div>Kabir Mehta (12-Sci) • Parking Fleet Lead</div>
                        <div>Vivaan Sen (11-Sci) • Gate 1 Pass Scanners</div>
                        <div>Tanvi Rao (11-Com) • Auditorium Usher Lead</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-4.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          Science Expo &amp; Tech Exhibits
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                          4 Tasks
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Dr. K. Raman • Lead Faculty</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">Robotics Demo, High Voltage Safety &amp; Evaluation Desks</span>
                      </div>
                      <div className="pt-2.5 border-t border-emerald-200/80 dark:border-emerald-900/80 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                        <div className="font-semibold text-emerald-900 dark:text-emerald-300 text-[10px] uppercase">Senior Student Prefects:</div>
                        <div>Ishaan Reddy (11-Sci) • Robotics Arena Lead</div>
                        <div>Ananya Iyer (10-A) • Project Stall Allocation</div>
                        <div>Siddharth Nair (11-Sci) • Power Grid Safety</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 3: LOGISTICS & VENDOR BUDGET LEDGER */}
              {eventViewMode === 'budget' && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs animate-in fade-in duration-150">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Annual Day &amp; Campus Events Procurement Ledger
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Itemized vendor purchase orders, stage rentals, catering and sound contracts
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerToast('Logged new vendor contract proposal for bursar clearance')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Vendor PO</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                          <th className="py-3 px-4">Vendor &amp; Contract</th>
                          <th className="py-3 px-4">Service Category</th>
                          <th className="py-3 px-4">PO Amount</th>
                          <th className="py-3 px-4">Payment Status</th>
                          <th className="py-3 px-4">Delivery Date</th>
                          <th className="py-3 px-4 text-right">Audit Slip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                          { vendor: 'AcousticWave Pro Sound', contract: 'PO-EVT-2026-08', cat: 'Line Array Audio & Mics', amt: 125000, status: 'Bursar Approved (50% Advance)', date: '22 Oct 2026' },
                          { vendor: 'Lumina Stage Lighting', contract: 'PO-EVT-2026-09', cat: 'LED Truss & Moving Heads', amt: 140000, status: 'Direct Bank NEFT Cleared', date: '23 Oct 2026' },
                          { vendor: 'Grand Caterers Pvt Ltd', contract: 'PO-EVT-2026-10', cat: 'VIP High-Tea & Student Snack Boxes', amt: 95000, status: 'Invoice Under Verification', date: '24 Oct 2026' },
                          { vendor: 'Apex Print Media', contract: 'PO-EVT-2026-11', cat: 'Event Backdrop, Standees & Badges', amt: 35000, status: 'Delivered & Accepted', date: '20 Oct 2026' },
                          { vendor: 'Elite Trophies & Mementos', contract: 'PO-EVT-2026-12', cat: 'Annual Excellence Awards & Shields', amt: 55000, status: 'Delivered to Asset Store', date: '21 Oct 2026' },
                        ].map((po) => (
                          <tr key={po.contract} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 dark:text-white block">{po.vendor}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{po.contract}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                              {po.cat}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                              ₹{po.amt.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                po.status.includes('Cleared') || po.status.includes('Delivered')
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {po.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                              {po.date}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => triggerToast(`Viewing signed vendor purchase order ${po.contract}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                              >
                                <FileText className="h-3 w-3 text-slate-500" />
                                <span>PO Slip</span>
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

          {activeTab === 'exams' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header with Sub-tabs and View Switcher */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      Examination Cell &amp; CBSE Assessments
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Academic Session 2026–27</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    Examinations, Timetables &amp; Re-Exam Approvals
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Day-by-day exam schedules, hall seating capacity, marks evaluation velocity, and medical re-exam adjudication.
                  </p>
                </div>

                {/* Sub-tabs (Upcoming, Overdue, Re-Exam) */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { key: 'upcoming', label: 'Upcoming Schedules' },
                    { key: 'overdue', label: 'Overdue Papers' },
                    { key: 'reexam', label: 'Medical Re-Exams', count: reExamRequests.filter(r => r.status === 'Pending Admin Review').length }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setExamSubTab(tab.key as any)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        examSubTab === tab.key
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
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

              {/* Top Operational Metrics (4 KPI Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Active Term</span>
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">CBSE Mid-Term</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">AY 2026–27 &bull; Term 2 Assessments</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Timetabled Papers</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">8</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">papers across 6 cohorts</span>
                  </div>
                  <span className="text-[10px] text-emerald-600/80 block mt-1">Class 8 to Class 12 covered</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Hall Seating Capacity</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Optimal
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">92.4%</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">184 / 200 desks occupied</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">CCTV proctoring operational</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Pending Re-Exams</span>
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                      {reExamRequests.filter(r => r.status === 'Pending Admin Review').length}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">cases awaiting review</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Medical waivers &amp; sports duty</span>
                </div>
              </div>

              {/* Toolbar: Class Filter & View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                {/* Class Cohort Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  <span className="text-xs font-bold text-slate-500 mr-1">Cohort:</span>
                  {['All', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(cls => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setExamClassFilter(cls)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        examClassFilter === cls
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>

                {/* View Switcher: Matrix vs Cards vs Grading */}
                {examSubTab === 'upcoming' && (
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setExamViewMode('matrix')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        examViewMode === 'matrix'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Slot Matrix</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamViewMode('cards')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        examViewMode === 'cards'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span>Hall Cards</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamViewMode('grading')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        examViewMode === 'grading'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      <span>Grading Status</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ===================================================== */}
              {/* SUBTAB 1: UPCOMING EXAMS TIMETABLE                    */}
              {/* ===================================================== */}
              {examSubTab === 'upcoming' && (() => {
                const upcomingExams = [
                  { id: 101, name: "Mathematics Mid-Term", class: "Class 10-A", date: "24 Oct 2026", day: "Mon", timeSlot: "Morning", time: "09:30 AM - 12:30 PM", hall: "Auditorium Hall 1", desks: "38 / 40", capacityPercent: 95, invigilator: "Dr. K. Raman", evaluated: 38, totalStudents: 40, status: "Ready" },
                  { id: 102, name: "Science Practical Lab", class: "Class 8-B", date: "24 Oct 2026", day: "Mon", timeSlot: "Afternoon", time: "01:30 PM - 04:30 PM", hall: "Science Lab 2", desks: "32 / 35", capacityPercent: 91, invigilator: "Mrs. Priya Sen", evaluated: 12, totalStudents: 35, status: "Ready" },
                  { id: 103, name: "Chemistry Theory Paper", class: "Class 12-A", date: "25 Oct 2026", day: "Tue", timeSlot: "Morning", time: "09:30 AM - 12:30 PM", hall: "Auditorium Hall 2", desks: "40 / 40", capacityPercent: 100, invigilator: "Mr. Vikram Sharma", evaluated: 40, totalStudents: 40, status: "Ready" },
                  { id: 104, name: "English Literature", class: "Class 9-A", date: "25 Oct 2026", day: "Tue", timeSlot: "Afternoon", time: "01:30 PM - 04:30 PM", hall: "Room 204", desks: "36 / 40", capacityPercent: 90, invigilator: "Ms. Sunita Roy", evaluated: 22, totalStudents: 36, status: "Ready" },
                  { id: 105, name: "Physics Theory Exam", class: "Class 12-B", date: "26 Oct 2026", day: "Wed", timeSlot: "Morning", time: "09:30 AM - 12:30 PM", hall: "Science Lab 3", desks: "35 / 35", capacityPercent: 100, invigilator: "Ms. Priya Sen", evaluated: 35, totalStudents: 35, status: "Ready" },
                  { id: 106, name: "Computer Applications", class: "Class 10-B", date: "26 Oct 2026", day: "Wed", timeSlot: "Afternoon", time: "01:30 PM - 04:30 PM", hall: "IT Center Lab", desks: "30 / 30", capacityPercent: 100, invigilator: "Mr. Rajesh Iyer", evaluated: 28, totalStudents: 30, status: "Ready" },
                  { id: 107, name: "Economics & Accountancy", class: "Class 11-A", date: "27 Oct 2026", day: "Thu", timeSlot: "Morning", time: "09:30 AM - 12:30 PM", hall: "Hall 3", desks: "28 / 30", capacityPercent: 93, invigilator: "Mrs. Ananya Verma", evaluated: 18, totalStudents: 30, status: "Ready" },
                  { id: 108, name: "CBSE Make-up Practicals", class: "Class 10-A", date: "28 Oct 2026", day: "Fri", timeSlot: "Morning", time: "09:30 AM - 12:30 PM", hall: "Special Testing Lab 2", desks: "8 / 15", capacityPercent: 53, invigilator: "Dr. K. Raman", evaluated: 0, totalStudents: 8, status: "Approved Re-Exam" }
                ].filter(exam => examClassFilter === 'All' || exam.class.includes(examClassFilter));

                if (upcomingExams.length === 0) {
                  return (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                      <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-50" />
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Timetabled Examinations Found</h3>
                      <p className="text-xs text-slate-500 mt-1">There are currently no examinations scheduled for {examClassFilter}.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* VIEW 1: INTERACTIVE DAY-SLOT MATRIX */}
                    {examViewMode === 'matrix' && (
                      <div className="space-y-3">
                        {/* Timetable Conflict Radar Pill */}
                        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-extrabold text-emerald-900 dark:text-emerald-200">
                              Timetable Conflict Radar: Zero Clashes Detected
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium hidden sm:inline">
                            All classrooms, proctors, and student cohorts verified conflict-free
                          </span>
                        </div>

                        {/* Day-by-Day Slot Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {['24 Oct 2026', '25 Oct 2026', '26 Oct 2026', '27 Oct 2026'].map((dateStr, dIdx) => {
                            const dayExams = upcomingExams.filter(e => e.date === dateStr);
                            const dayName = dayExams[0]?.day || (['Mon', 'Tue', 'Wed', 'Thu'][dIdx]);
                            return (
                              <div
                                key={dateStr}
                                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3"
                              >
                                {/* Date Column Header */}
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center justify-between">
                                  <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                                      {dayName}
                                    </span>
                                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                      {dateStr}
                                    </h4>
                                  </div>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    {dayExams.length} {dayExams.length === 1 ? 'Paper' : 'Papers'}
                                  </span>
                                </div>

                                {/* Slot Cards inside this day */}
                                <div className="space-y-2.5">
                                  {dayExams.map((exam) => (
                                    <div
                                      key={exam.id}
                                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:border-slate-300 transition-colors"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                          {exam.timeSlot}
                                        </span>
                                        <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                                          {exam.class}
                                        </span>
                                      </div>

                                      <div>
                                        <h5 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                                          {exam.name}
                                        </h5>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                          {exam.hall} &bull; Proctor: {exam.invigilator}
                                        </p>
                                      </div>

                                      {/* Desk Occupancy Micro Bar */}
                                      <div className="space-y-0.5 pt-1">
                                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                                          <span>Hall Desks: {exam.desks}</span>
                                          <span className="font-bold">{exam.capacityPercent}%</span>
                                        </div>
                                        <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                          <div
                                            className="h-full rounded-full bg-blue-600 dark:bg-blue-400"
                                            style={{ width: `${exam.capacityPercent}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* VIEW 2: HALL PASS CARDS */}
                    {examViewMode === 'cards' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingExams.map(exam => (
                          <div
                            key={exam.id}
                            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                    {exam.class}
                                  </span>
                                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">
                                    {exam.name}
                                  </h4>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                                  Proctor Confirmed
                                </span>
                              </div>

                              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">Date &amp; Time:</span>
                                  <strong className="text-slate-900 dark:text-white">{exam.date} ({exam.time})</strong>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">Examination Venue:</span>
                                  <strong className="text-slate-900 dark:text-white">{exam.hall}</strong>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">Chief Proctor:</span>
                                  <strong className="text-blue-600 dark:text-blue-400">{exam.invigilator}</strong>
                                </div>
                              </div>

                              {/* Capacity Bar */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                  <span>Desk Occupancy:</span>
                                  <strong className="text-slate-900 dark:text-white">{exam.desks} occupied ({exam.capacityPercent}%)</strong>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-blue-600 dark:bg-blue-400"
                                    style={{ width: `${exam.capacityPercent}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                downloadOfficialDocumentFile(`Exam Hall Pass - ${exam.name}`, exam.class, `HALL-${exam.id}`);
                                triggerToast(`Downloaded Hall Pass Roster for ${exam.name}`);
                              }}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5 text-blue-600" />
                              <span>Download Official Hall Pass Roster</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* VIEW 3: GRADING & MARKS SUBMISSION STATUS */}
                    {examViewMode === 'grading' && (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="py-3 px-4">Exam Paper &amp; Cohort</th>
                                <th className="py-3 px-4">Evaluation Velocity</th>
                                <th className="py-3 px-4">Lead Evaluator</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {upcomingExams.map(exam => {
                                const evalPercent = Math.round((exam.evaluated / exam.totalStudents) * 100);
                                const isComplete = evalPercent === 100;
                                return (
                                  <tr key={exam.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="font-extrabold text-slate-900 dark:text-white">{exam.name}</div>
                                      <span className="text-[11px] text-slate-400">{exam.class} &bull; {exam.date}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="space-y-1 min-w-[130px]">
                                        <div className="flex items-center justify-between text-[10px]">
                                          <span className="text-slate-500">{exam.evaluated} / {exam.totalStudents} graded</span>
                                          <strong className="text-slate-900 dark:text-white">{evalPercent}%</strong>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                            style={{ width: `${evalPercent}%` }}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                                      {exam.invigilator}
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                        isComplete
                                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                          : evalPercent > 50
                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      }`}>
                                        {isComplete ? 'Grading Completed' : evalPercent > 50 ? 'In Progress' : 'Pending Evaluation'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <button
                                        type="button"
                                        onClick={() => triggerToast(`Dispatched grading reminder to ${exam.invigilator}`)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                                      >
                                        <Send className="h-3 w-3 text-blue-600" />
                                        <span>Notify Evaluator</span>
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
                  </div>
                );
              })()}

              {/* ===================================================== */}
              {/* SUBTAB 2: OVERDUE EXAMINATIONS                        */}
              {/* ===================================================== */}
              {examSubTab === 'overdue' && (() => {
                const overdueExams = [
                  { id: 201, name: "Class 9-B English Literature Paper", class: "Class 9-B", dueDate: "15 Oct 2026", overdueDays: 4, hall: "Room 102", invigilator: "Ms. Sunita Roy", pendingPapers: 14, totalPapers: 36 },
                  { id: 202, name: "Class 8-A Hindi Language Paper", class: "Class 8-A", dueDate: "17 Oct 2026", overdueDays: 2, hall: "Room 104", invigilator: "Mr. Ramesh Tiwari", pendingPapers: 22, totalPapers: 35 }
                ].filter(exam => examClassFilter === 'All' || exam.class.includes(examClassFilter));

                if (overdueExams.length === 0) {
                  return (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">All Examination Papers Evaluated on Schedule</h3>
                      <p className="text-xs text-slate-500 mt-1">There are no overdue papers or grading submission delays for {examClassFilter}.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overdueExams.map(exam => (
                      <div
                        key={exam.id}
                        className="rounded-3xl border border-rose-200 dark:border-rose-950 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                              {exam.overdueDays} Days Overdue
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-2">
                              {exam.name}
                            </h4>
                            <span className="text-xs text-slate-500">{exam.class} &bull; Due: {exam.dueDate}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-rose-600 block">{exam.pendingPapers}</span>
                            <span className="text-[10px] text-slate-400">papers un-graded</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300">Evaluator: <b>{exam.invigilator}</b></span>
                          <button
                            type="button"
                            onClick={() => triggerToast(`Urgent evaluation summons dispatched to ${exam.invigilator}`)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <Send className="h-3 w-3" />
                            <span>Dispatch Urgent Summons</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* ===================================================== */}
              {/* SUBTAB 3: MEDICAL RE-EXAM REQUESTS                    */}
              {/* ===================================================== */}
              {examSubTab === 'reexam' && (
                <div className="space-y-4">
                  {reExamRequests.map(req => {
                    const isPending = req.status === 'Pending Admin Review';
                    const isApproved = req.status === 'Approved by Admin' || req.status === 'Scheduled';

                    return (
                      <div
                        key={req.id}
                        className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                              {(req.student_name || 'S').split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                  {req.student_name}
                                </h4>
                                <span className="rounded-md bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  {req.class_name}-{req.section}
                                </span>
                                <span className="text-xs text-slate-400">&bull;</span>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  Subject: {req.subject}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                <span>Missed Exam: <strong className="text-slate-800 dark:text-slate-200">{req.exam_name}</strong></span>
                                <span>&bull;</span>
                                <span>Missed Date: {req.missed_date}</span>
                              </div>
                            </div>
                          </div>

                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          }`}>
                            {isApproved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                            <span>{req.status}</span>
                          </span>
                        </div>

                        {/* Stated Justification & Doctor Certificate */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                            <span>Exemption Category: {req.reason_category}</span>
                            <span>Requested: {req.requested_at}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                            &ldquo;{req.reason_details}&rdquo;
                          </p>
                          <div className="pt-1 flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <FileCheck className="h-3.5 w-3.5" />
                              <span>Verified Hospital Certificate Attached</span>
                            </span>
                            <span className="text-[11px] text-slate-400">Parent: {req.parent_name} ({req.parent_phone})</span>
                          </div>
                        </div>

                        {/* Scheduled slot details if approved */}
                        {isApproved && (
                          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-bold block">Officially Scheduled Re-Exam Slot</span>
                              <strong className="text-emerald-950 dark:text-emerald-100 text-sm">
                                {req.re_exam_date || '28 Oct 2026'} &bull; {req.re_exam_time || '02:00 PM - 05:00 PM'} ({req.re_exam_venue || 'Special Testing Lab 2'})
                              </strong>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100">
                              Coordinator Notified
                            </span>
                          </div>
                        )}

                        {/* Action Footer */}
                        {isPending && (
                          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => setSelectedReExamForDrawer(req)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                            >
                              <ClipboardCheck className="h-3.5 w-3.5 text-blue-600" />
                              <span>Adjudicate &amp; Pick Venue Slot</span>
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                await api.reviewReExamRequest(req.id, 'Rejected', 'Reason did not meet medical exemption criteria');
                                setReExamRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Rejected' } : r));
                                triggerToast(`Re-exam request for ${req.student_name} rejected.`);
                              }}
                              className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Reject Request
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                await api.reviewReExamRequest(req.id, 'Approved by Admin', 'Approved based on verified medical certificate.');
                                await api.sendNotification({
                                  recipient_role: 'exam_coordinator',
                                  sender_name: 'Dr. Radhakrishnan (Principal)',
                                  sender_role: 'admin',
                                  title: `Re-Exam Mandate: ${req.student_name} (${req.subject})`,
                                  message: `Principal has officially APPROVED re-examination for ${req.student_name} (${req.subject}). Scheduled on 28 Oct in Special Testing Lab 2.`,
                                  priority: 'High'
                                });
                                setReExamRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Approved by Admin', re_exam_date: '28 Oct 2026', re_exam_time: '02:00 PM - 05:00 PM', re_exam_venue: 'Special Testing Lab 2' } : r));
                                triggerToast(`Re-exam officially approved for ${req.student_name}. Coordinator & Parent notified.`);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Approve &amp; Schedule</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MEDICAL RE-EXAM ADJUDICATION DRAWER */}
              {selectedReExamForDrawer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
                  <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 my-8">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                          {(selectedReExamForDrawer.student_name || 'S').split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                            Medical Re-Exam Determination: {selectedReExamForDrawer.student_name}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">
                            {selectedReExamForDrawer.class_name}-{selectedReExamForDrawer.section} &bull; Missed: {selectedReExamForDrawer.subject}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedReExamForDrawer(null)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Drawer Body */}
                    <div className="space-y-4 text-xs">
                      {/* Medical Exemption Preview Box */}
                      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                        <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-bold">
                          <span className="flex items-center gap-1.5">
                            <FileCheck className="h-4 w-4 text-amber-600" />
                            <span>Hospital / Medical Proof Submitted</span>
                          </span>
                          <span>Category: {selectedReExamForDrawer.reason_category}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 italic pt-1">
                          &ldquo;{selectedReExamForDrawer.reason_details}&rdquo;
                        </p>
                      </div>

                      {/* Re-Exam Slot Allocation Form */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Re-Exam Venue &amp; Time Slot Scheduling
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Testing Date</label>
                            <input
                              type="text"
                              value={reExamDateInput}
                              onChange={(e) => setReExamDateInput(e.target.value)}
                              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white font-semibold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Time Slot</label>
                            <input
                              type="text"
                              value={reExamTimeInput}
                              onChange={(e) => setReExamTimeInput(e.target.value)}
                              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white font-semibold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Exam Venue / Lab</label>
                            <input
                              type="text"
                              value={reExamVenueInput}
                              onChange={(e) => setReExamVenueInput(e.target.value)}
                              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white font-semibold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Principal Remarks Textarea */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Official Adjudication Remarks (Sent to Exam Coordinator &amp; Parent):
                        </label>
                        <textarea
                          rows={3}
                          value={reExamAdminRemarks}
                          onChange={(e) => setReExamAdminRemarks(e.target.value)}
                          placeholder="e.g. Approved based on verified Apollo Hospital admission records. Re-exam assigned to Lab 2."
                          className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedReExamForDrawer(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await api.reviewReExamRequest(selectedReExamForDrawer.id, 'Rejected', reExamAdminRemarks || 'Medical criteria not satisfied');
                          setReExamRequests(prev => prev.map(r => r.id === selectedReExamForDrawer.id ? { ...r, status: 'Rejected' } : r));
                          triggerToast(`Re-exam request rejected.`);
                          setSelectedReExamForDrawer(null);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200 transition-colors"
                      >
                        Reject Request
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await api.reviewReExamRequest(selectedReExamForDrawer.id, 'Approved by Admin', reExamAdminRemarks || 'Official medical waiver granted by Administration.');
                          await api.sendNotification({
                            recipient_role: 'exam_coordinator',
                            sender_name: 'Dr. Radhakrishnan (Principal)',
                            sender_role: 'admin',
                            title: `Re-Exam Mandate: ${selectedReExamForDrawer.student_name} (${selectedReExamForDrawer.subject})`,
                            message: `Principal has officially APPROVED re-examination for ${selectedReExamForDrawer.student_name} (${selectedReExamForDrawer.subject}). Scheduled on ${reExamDateInput} at ${reExamTimeInput} in ${reExamVenueInput}.`,
                            priority: 'High'
                          });
                          setReExamRequests(prev => prev.map(r => r.id === selectedReExamForDrawer.id ? {
                            ...r,
                            status: 'Approved by Admin',
                            re_exam_date: reExamDateInput,
                            re_exam_time: reExamTimeInput,
                            re_exam_venue: reExamVenueInput
                          } : r));
                          triggerToast(`Re-exam scheduled for ${selectedReExamForDrawer.student_name} on ${reExamDateInput}.`);
                          setSelectedReExamForDrawer(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        <span>Confirm &amp; Broadcast Re-Exam Schedule</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
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

            const cleanTasks = tasks.filter(t => !isExcludedTask(t));

            const filteredTasks = cleanTasks.filter(t => {
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

            const openCount = cleanTasks.filter(t => t.status !== 'Completed').length;
            const autoCount = cleanTasks.filter(t => t.is_auto_generated).length;
            const criticalCount = cleanTasks.filter(t => t.is_escalated || t.priority === 'Critical').length;
            const completedCount = cleanTasks.filter(t => t.status === 'Completed').length;
            const reliefCount = cleanTasks.filter(t => t.relief_requested).length;

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

                    {(taskOriginFilter !== 'all' || taskStatusFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setTaskOriginFilter('all');
                          setTaskStatusFilter('all');
                        }}
                        className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-3 py-1.5 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer animate-in fade-in shrink-0"
                        title="Reset task filters"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Clear Filters</span>
                      </button>
                    )}
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
                    type="button"
                    onClick={() => setActiveTab('permissions')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-2xs"
                  >
                    <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Teacher Leaves Queue</span>
                  </button>
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
              {/* Header Banner & Simulation Switcher */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      Academic Year Lifecycle
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Annual Transition &amp; Progression Engine</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    Annual Academic Rollover &amp; Student Promotion Pipeline
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Graduation matrix: promote cohorts to the next academic tier, resolve academic/attendance exceptions, and lock previous year records.
                  </p>
                </div>

                {/* Right: Simulation Mode Toggle & Transition Pill */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setIsSimulationMode(false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !isSimulationMode
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Live Mode</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSimulationMode(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSimulationMode
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Target className="h-3.5 w-3.5" />
                      <span>Dry-Run Simulation</span>
                    </button>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs">
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Cycle Transition</span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">AY 2026–27 ➔ AY 2027–28</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Simulation Mode Banner (When active) */}
              {isSimulationMode && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-amber-950 dark:text-amber-200 block text-xs">
                        Pre-Flight Simulation Mode Active (Sandbox Prediction)
                      </strong>
                      <span className="text-amber-800 dark:text-amber-300 text-[11px]">
                        Changes made here test projected classroom strength and will not commit to the live SIS database until you click Live Mode.
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 shrink-0">
                    Projected Desk Overload Detected (Class 10-A: 42/40)
                  </span>
                </div>
              )}

              {/* Top Operational Metrics (4 KPI Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Active Classes</span>
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{rolloverClasses.length}</span>
                    <span className="text-xs font-bold text-slate-500">Cohort sections</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">All grade tiers mapped</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Auto-Promotion Ready</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {rolloverClasses.reduce((acc, c) => acc + c.eligible_for_promotion, 0)}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">students met criteria</span>
                  </div>
                  <span className="text-[10px] text-emerald-600/80 block mt-1">94.2% academic pass rate</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Under Review / Flags</span>
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                      {rolloverClasses.reduce((acc, c) => acc + c.retention_review, 0)}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">exceptions flagged</span>
                  </div>
                  <span className="text-[10px] text-amber-600/80 block mt-1">Attendance &amp; fee roadblocks</span>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Safety Snapshot</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Active
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">AY 2026–27</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">7-Day historical rollback active</span>
                </div>
              </div>

              {/* Visual Cohort Progression Pipeline (Funnel / Flow Preview) */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Institutional Progression Pipeline &amp; Stream Allocation
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">PowerSchool &amp; Alma progression standard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tier 1: Junior Primary</span>
                    <strong className="text-xs font-extrabold text-slate-900 dark:text-white block">Class 1 to Class 5</strong>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">100% Automatic Cohort Promotion</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tier 2: Middle School</span>
                    <strong className="text-xs font-extrabold text-slate-900 dark:text-white block">Class 6 to Class 8</strong>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 block">Subject Credit Check &bull; 96% Ready</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tier 3: Stream Allocation</span>
                    <strong className="text-xs font-extrabold text-slate-900 dark:text-white block">Class 10 ➔ Class 11</strong>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block">60 Science &bull; 40 Commerce &bull; 20 Arts</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tier 4: Graduation</span>
                    <strong className="text-xs font-extrabold text-slate-900 dark:text-white block">Class 12 ➔ Alumni</strong>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 block">110 Seniors Sealed &bull; Transcripts Issued</span>
                  </div>
                </div>
              </div>

              {/* Class Promotion Cards Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Class Cohort Progression Pipeline ({rolloverClasses.length} Cohorts)
                  </h3>
                  <span className="text-[11px] text-slate-400">Click &ldquo;Under Review&rdquo; to resolve flagged exceptions</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rolloverClasses.map((cls) => {
                    const eligiblePercent = Math.round((cls.eligible_for_promotion / cls.total_students) * 100);
                    const isRolledOver = cls.status === 'Rolled Over';
                    const hasExceptions = cls.retention_review > 0;

                    return (
                      <div
                        key={cls.class_id}
                        className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                      >
                        {/* Class Transition Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 font-extrabold text-sm">
                              {cls.from_class}
                            </span>
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-sm">
                              {cls.to_class}
                            </span>
                          </div>

                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isRolledOver
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}>
                            {cls.status}
                          </span>
                        </div>

                        {/* Cohort Student Breakdown */}
                        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 dark:border-slate-800 text-center">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Enrolled</span>
                            <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">{cls.total_students}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold block">Eligible Ready</span>
                            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">{cls.eligible_for_promotion}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold block">Under Review</span>
                            <button
                              type="button"
                              onClick={() => setSelectedClassForExceptionDrawer(cls)}
                              className="inline-flex items-center gap-1 text-base font-extrabold text-amber-600 dark:text-amber-400 tabular-nums hover:underline cursor-pointer"
                              title="Click to resolve student exceptions"
                            >
                              <span>{cls.retention_review}</span>
                              {hasExceptions && <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">Resolve</span>}
                            </button>
                          </div>
                        </div>

                        {/* Progression Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Auto-Promotion Readiness:</span>
                            <strong className="text-slate-900 dark:text-white font-extrabold">{eligiblePercent}%</strong>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${eligiblePercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Target Teacher & Action Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                          <span className="text-slate-500">
                            Target Teacher: <strong className="text-slate-800 dark:text-slate-200">{cls.target_class_teacher || 'Senior Faculty Coordinator'}</strong>
                          </span>

                          {isRolledOver ? (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Archived &amp; Sealed</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRolloverClass(cls);
                                setShowRolloverModal(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
                            >
                              <span>Execute Rollover</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PROMOTION EXCEPTION ADJUDICATION DRAWER */}
              {selectedClassForExceptionDrawer && (() => {
                const classId = selectedClassForExceptionDrawer.class_id;
                const exceptions = classExceptions[classId] || [
                  { id: 901, name: "Aarav Patel", roll: "10A-04", roadblockType: "attendance" as const, description: "Attendance 69% (Needs Principal medical waiver).", waiverApplied: false },
                  { id: 902, name: "Kavya Sharma", roll: "10A-14", roadblockType: "academic" as const, description: "Failed Mathematics (32/100, Passing is 35). Needs 3 grace marks.", waiverApplied: false }
                ];

                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
                    <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 my-8">
                      {/* Drawer Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                              Promotion Exceptions: {selectedClassForExceptionDrawer.from_class} ➔ {selectedClassForExceptionDrawer.to_class}
                            </h3>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            Adjudicate attendance, academic grace marks, and fee roadblocks before finalizing class rollover.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedClassForExceptionDrawer(null)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Exception Student Cards */}
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                        {exceptions.map((student) => (
                          <div
                            key={student.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              student.waiverApplied
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {student.name}
                                  </h4>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold">
                                    Roll: {student.roll}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                  {student.description}
                                </p>
                              </div>

                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                                student.waiverApplied
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : student.roadblockType === 'attendance'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : student.roadblockType === 'academic'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              }`}>
                                {student.waiverApplied ? 'Waiver Granted' : student.roadblockType.toUpperCase()}
                              </span>
                            </div>

                            {/* Action Buttons for this student */}
                            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                              <span className="text-slate-400 text-[11px]">
                                {student.waiverApplied ? 'Eligible for AY 2027-28 Promotion' : 'Action Required for Eligibility'}
                              </span>

                              {student.waiverApplied ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Promoted (Waiver Recorded)</span>
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {student.roadblockType === 'attendance' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setClassExceptions(prev => ({
                                          ...prev,
                                          [classId]: (prev[classId] || exceptions).map(s => s.id === student.id ? { ...s, waiverApplied: true, waiverType: 'Medical Waiver' } : s)
                                        }));
                                        setRolloverClasses(prev => prev.map(c => c.class_id === classId ? {
                                          ...c,
                                          eligible_for_promotion: c.eligible_for_promotion + 1,
                                          retention_review: Math.max(0, c.retention_review - 1)
                                        } : c));
                                        triggerToast(`Principal Medical Waiver granted for ${student.name}. Student is now eligible for promotion.`);
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Grant Medical Waiver</span>
                                    </button>
                                  )}

                                  {student.roadblockType === 'academic' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setClassExceptions(prev => ({
                                          ...prev,
                                          [classId]: (prev[classId] || exceptions).map(s => s.id === student.id ? { ...s, waiverApplied: true, waiverType: 'Grace Marks' } : s)
                                        }));
                                        setRolloverClasses(prev => prev.map(c => c.class_id === classId ? {
                                          ...c,
                                          eligible_for_promotion: c.eligible_for_promotion + 1,
                                          retention_review: Math.max(0, c.retention_review - 1)
                                        } : c));
                                        triggerToast(`Awarded Moderation Grace Marks (+4) for ${student.name}. Student is now eligible for promotion.`);
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Award +4 Grace Marks</span>
                                    </button>
                                  )}

                                  {student.roadblockType === 'fees' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setClassExceptions(prev => ({
                                          ...prev,
                                          [classId]: (prev[classId] || exceptions).map(s => s.id === student.id ? { ...s, waiverApplied: true, waiverType: 'Fee Undertaking' } : s)
                                        }));
                                        setRolloverClasses(prev => prev.map(c => c.class_id === classId ? {
                                          ...c,
                                          eligible_for_promotion: c.eligible_for_promotion + 1,
                                          retention_review: Math.max(0, c.retention_review - 1)
                                        } : c));
                                        triggerToast(`Approved Conditional Promotion Undertaking for ${student.name}. Report card released.`);
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Authorize Fee Undertaking</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Drawer Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-500 font-medium">
                          Resolved waivers directly update the live class promotion count.
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedClassForExceptionDrawer(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                        >
                          Close &amp; Return to Rollover
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          {/* ===================================================== */}
          {activeTab === 'exit' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Executive Header & CBSE Rule 44 Statutory Compliance Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-3 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                      CBSE Statutory Compliance (Rule 44)
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Legal Exit &amp; Transfer Vault</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Zero-Dispute Dual Custody Active
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>📜 Student Transfer Certificates (TC) &amp; Clearances</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Dual-custody verification engine: 4-department clearance audit, in-app parent digital sign-off, and physical handover scan archiving (CBSE Rule 44 compliance).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button

                    onClick={() => {
                      if (!initiateExitStudentId && studentsList.length > 0) {
                        const candidate = studentsList.find(s => s.id === 32) || studentsList.find(s => s.status !== 'Withdrawn');
                        if (candidate) setInitiateExitStudentId(candidate.id);
                      }
                      setShowInitiateExitModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Initiate Exit Clearance</span>
                  </button>
                  <button

                    onClick={async () => {
                      const updated = await api.getExitClearances();
                      setExitClearances(updated);
                      triggerToast('Refreshed exit clearances from statutory legal ledger');
                    }}

                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer transition-all"

                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                    <span>Refresh Ledger</span>
                  </button>
                </div>
              </div>

              {/* Statutory 4-Department Clearance Workflow Ribbon */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 via-slate-50 to-indigo-50/60 dark:from-blue-950/20 dark:via-slate-900 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-900/60 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    Dual-Custody Statutory Audit Pipeline (CBSE Affiliation Standard)
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    4 Departments Mandatory Sign-Off
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">1. Library Vault</div>
                    <div className="text-[10px] text-slate-500">Books &amp; RFID Cleared</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">2. Accounts Bursar</div>
                    <div className="text-[10px] text-slate-500">Caution Deposit &amp; Dues</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">3. Labs &amp; Sports</div>
                    <div className="text-[10px] text-slate-500">Kit &amp; Apparatus Verified</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                    <div className="font-bold text-slate-800 dark:text-slate-200">4. Parent Sign-Off</div>
                    <div className="text-[10px] text-slate-500">In-App Digital Signature</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-center flex flex-col justify-center">
                    <div>5. Principal Seal</div>
                    <div className="text-[10px] opacity-80">Permanent Archive</div>
                  </div>
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Total TC Applications</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Roster</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                    {exitClearances.length}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                    <span>Departing Student Records</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">AY 2026-27</span>
                  </div>
                  <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">Pending Verification</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                      In Review
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    {exitClearances.filter(e => !e.physical_sign_verified || !e.digital_parent_approved).length}
                  </div>
                  <div className="mt-2 text-xs text-amber-700/80 dark:text-amber-400/80 flex items-center justify-between font-medium">
                    <span>Awaiting Dual-Custody Sign-Off</span>
                    <span className="text-amber-600">Active</span>
                  </div>
                  <div className="mt-2.5 w-full bg-amber-100 dark:bg-amber-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">Permanently Archived</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      Zero-Dispute
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {exitClearances.filter(e => e.physical_sign_verified && e.digital_parent_approved).length}
                  </div>
                  <div className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-400/80 flex items-center justify-between font-medium">
                    <span>Tamper-Proof Digital Vault</span>
                    <span className="text-emerald-600">Sealed</span>
                  </div>
                  <div className="mt-2.5 w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-400">Clearance Turnaround</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                      SLA Fast
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                    1.2 Days
                  </div>
                  <div className="mt-2 text-xs text-blue-700/80 dark:text-blue-400/80 flex items-center justify-between font-medium">
                    <span>CBSE Statutory Benchmark &lt; 3.0 Days</span>
                    <span className="text-blue-600">100% Compliant</span>
                  </div>
                  <div className="mt-2.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative flex-1 max-w-sm">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={exitSearch}
                    onChange={(e) => setExitSearch(e.target.value)}
                    placeholder="Search departing student by name or TC number..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                    {[
                      { key: 'ALL', label: 'All Records' },
                      { key: 'PENDING', label: 'Pending Dept Clearances' },
                      { key: 'PARENT_PENDING', label: 'Awaiting Parent' },
                      { key: 'ARCHIVED', label: 'Archived Vault' }
                    ].map(f => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setExitFilter(f.key as any)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          exitFilter === f.key
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clearances List with Enhanced Container */}
              <div className="space-y-4">
                {exitClearances
                  .filter(c => {
                    const matchSearch = !exitSearch.trim() || c.student_name.toLowerCase().includes(exitSearch.toLowerCase()) || String(c.student_id).includes(exitSearch);
                    const matchFilter = 
                      exitFilter === 'ALL' ? true :
                      exitFilter === 'PENDING' ? (!c.fee_cleared || !c.library_cleared || !c.inventory_cleared) :
                      exitFilter === 'PARENT_PENDING' ? !c.digital_parent_approved :
                      exitFilter === 'ARCHIVED' ? (c.physical_sign_verified && c.digital_parent_approved) : true;
                    return matchSearch && matchFilter;
                  })
                  .map(clearance => (
                    <div key={clearance.id} className="relative group">
                      <ExitClearanceView
                        clearance={clearance}
                        role="admin"
                        onVerifyPhysical={(scanUrl) => handleVerifyPhysicalExit(clearance.id, scanUrl)}
                      />
                    </div>
                  ))}

                {exitClearances.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center bg-white dark:bg-slate-900">
                    <FileCheck className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No student exit clearance records found in current view.</p>
                  </div>
                )}
              </div>

              {/* New TC Application Modal */}
              {showNewTCModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                  <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Initiate Student Exit &amp; TC Clearance</h3>
                          <span className="text-[10px] text-slate-500">CBSE Rule 44 Statutory Workflow</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewTCModal(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Select Departing Student
                        </label>
                        <select className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer">
                          <option value="1">Kavya Sharma (Class 10-A • Roll 14)</option>
                          <option value="2">Rohan Gupta (Class 10-A • Roll 27)</option>
                          <option value="3">Aarav Patel (Class 10-A • Roll 04)</option>
                          <option value="4">Tanvi Deshmukh (Class 9-B • Roll 31)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Reason for Departure / Transfer
                        </label>
                        <select className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium cursor-pointer">
                          <option value="relocation">Parent Job Relocation to Another City/State</option>
                          <option value="higher_studies">Admission to Specialized Higher Secondary Junior College</option>
                          <option value="international">Family Emigration / International Relocation</option>
                          <option value="personal">Personal / Family Hardship</option>
                        </select>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        ⚠️ <strong>Dual-Custody Trigger Notice:</strong> Initiating this exit application will automatically broadcast simultaneous no-dues verification tasks to Library, Accounts Bursar, and Science Labs.
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowNewTCModal(false)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewTCModal(false);
                          triggerToast('Initiated CBSE Transfer Certificate application & dispatched department audits');
                        }}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 cursor-pointer shadow-xs"
                      >
                        Initiate Clearance Audit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal to Initiate Exit Clearance */}
          {showInitiateExitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Initiate Exit Clearance &amp; TC
                      </h4>
                      <span className="text-[10px] text-slate-500">CBSE Rule 44 Statutory Dual-Custody Protocol</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInitiateExitModal(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Departing Student:
                    </label>
                    <select
                      value={initiateExitStudentId || ''}
                      onChange={(e) => setInitiateExitStudentId(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {studentsList
                        .filter(s => s.status !== 'Withdrawn')
                        .map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.class_name}-{s.section} &bull; Roll #{s.roll_no}) {s.id === 32 ? '★ Rohan Deshmukh (Test Candidate)' : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Statutory 4-Department Pre-Check:</p>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-500">
                      <li>Accounts &amp; Fee dues validation</li>
                      <li>Library book return audit</li>
                      <li>Science &amp; Computer laboratory clearance</li>
                      <li>Digital library &amp; LMS access deprovisioning</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowInitiateExitModal(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!initiateExitStudentId || isInitiatingExit}
                    onClick={async () => {
                      if (!initiateExitStudentId) return;
                      setIsInitiatingExit(true);
                      try {
                        await api.initiateExitClearance(initiateExitStudentId);
                        const updated = await api.getExitClearances();
                        setExitClearances(updated);
                        setShowInitiateExitModal(false);
                        triggerToast(`✓ Exit clearance protocol initiated for student #${initiateExitStudentId}!`);
                      } catch (err: any) {
                        triggerToast(err.message || 'Failed to initiate exit clearance');
                      } finally {
                        setIsInitiatingExit(false);
                      }
                    }}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <span>{isInitiatingExit ? 'Initiating...' : 'Start Clearance Protocol'}</span>
                  </button>
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

                <form onSubmit={handleCreateTask} className="space-y-3.5">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
                    <input
                      type="text" required
                      placeholder="e.g. Review & Finalize Term 2 Marks Gradebook"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">About Task / Instructions</label>
                    <textarea
                      rows={2}
                      placeholder="Context, dependencies, or specific action steps..."
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Domain & Assignee */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department Domain *</label>
                      <select
                        value={newTaskDomain}
                        onChange={(e) => setNewTaskDomain(e.target.value as TaskDomain)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        <option value="academic">📚 Academic & Curriculum</option>
                        <option value="exam">📝 Examination Cell</option>
                        <option value="finance">₹ Finance & Accounts</option>
                        <option value="admissions">🎓 Admissions & CRM</option>
                        <option value="executive">⚡ Principal Mandate</option>
                        <option value="campus_ops">🏫 Campus Operations</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Assign To *
                      </label>
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        <optgroup label="Academic Faculty & Subject Leads">
                          <option value="Mrs. Ananya Verma">Mrs. Ananya Verma — Math Lead</option>
                          <option value="Dr. K. Raman">Dr. K. Raman — Science Head</option>
                          <option value="Mrs. Neha Roy">Mrs. Neha Roy — English Lead</option>
                          <option value="Dr. Hemanth Sen">Dr. Hemanth Sen — Senior Science</option>
                          <option value="Mr. Vikram Joshi">Mr. Vikram Joshi — Discipline Lead</option>
                        </optgroup>

                        <optgroup label="Department Coordinators">
                          <option value="Dr. Ananya Krishnan">Dr. Ananya Krishnan — Academic Coordinator</option>
                          <option value="Ms. Rekha Iyer">Ms. Rekha Iyer — Exam Coordinator</option>
                          <option value="Ms. Priya Nair">Ms. Priya Nair — Admissions Lead</option>
                          <option value="Mrs. Lakshmi Narayan">Mrs. Lakshmi Narayan — Accounts Lead</option>
                        </optgroup>

                        <optgroup label="Institutional Leadership">
                          <option value="Dr. Sunita Kapoor">Dr. Sunita Kapoor — Administrator</option>
                          <option value="Principal Sharma">Principal Sharma — Executive Board</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Priority & Deadline (SLA & Category auto-derived) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => {
                          const p = e.target.value as any;
                          setNewTaskPriority(p);
                          const defaultSla = p === 'Critical' ? 12 : p === 'High' ? 24 : p === 'Medium' ? 48 : 72;
                          setNewTaskSlaHours(defaultSla);
                          setNewTaskCategory(p === 'Critical' || p === 'High' ? 'urgent' : 'upcoming');
                        }}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      >
                        <option value="Critical">🔴 Critical (12h)</option>
                        <option value="High">🟠 High (24h)</option>
                        <option value="Medium">🟡 Medium (48h)</option>
                        <option value="Low">⚪ Low (72h)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deadline *</label>
                      <input
                        type="text" required
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        placeholder="e.g. Today, 5:00 PM"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={() => setShowTaskModal(false)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >Cancel</button>
                    <button type="submit"
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold shadow-sm cursor-pointer transition-all active:scale-98"
                    >Assign Task</button>
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
                      {availableFaculty
                        .filter(f => f.name !== selectedSubSlot?.absent_teacher_name)
                        .map(f => (
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
                  <label className="font-bold text-slate-700 dark:text-slate-300">Lead Category</label>
                  <select 
                    value={regCategory} 
                    onChange={e => setRegCategory(e.target.value as 'active' | 'passive')}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 mt-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="active">🟢 Active Lead (High Intent / Campus Visit)</option>
                    <option value="passive">⚪ Passive Lead (Casual / Next Year Inquiry)</option>
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

      {/* ── MODAL: ISSUE STAFF LEAVE / ON-DUTY (ADMIN DIRECT) ── */}
      {showIssueLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Issue Staff Leave / OD</h3>
                  <span className="text-[11px] text-slate-500">Executive Discretionary Administrative Leave</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowIssueLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleIssueStaffLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Staff Member / Faculty
                </label>
                <select
                  value={issueLeaveStaffName}
                  onChange={(e) => setIssueLeaveStaffName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {staffMembers.length > 0 ? (
                    staffMembers.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.role} - {s.department})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Mrs. Ananya Verma">Mrs. Ananya Verma (Teacher - Mathematics)</option>
                      <option value="Mr. Vikram Sharma">Mr. Vikram Sharma (Teacher - Physics)</option>
                      <option value="Ms. Priya Sen">Ms. Priya Sen (Teacher - English)</option>
                      <option value="Dr. Suresh Babu">Dr. Suresh Babu (Teacher - Science)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Leave Category
                  </label>
                  <select
                    value={issueLeaveCategory}
                    onChange={(e) => setIssueLeaveCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="On-Duty OD">On-Duty (OD)</option>
                    <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                    <option value="Medical Leave">Medical Leave</option>
                    <option value="Administrative Leave">Administrative Leave</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Total Duration (Days)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={issueLeaveTotalDays}
                    onChange={(e) => setIssueLeaveTotalDays(parseFloat(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Effective From
                  </label>
                  <input
                    type="text"
                    value={issueLeaveFromDate}
                    onChange={(e) => setIssueLeaveFromDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Affected Timetable Periods
                  </label>
                  <input
                    type="text"
                    value={issueLeavePeriods}
                    onChange={(e) => setIssueLeavePeriods(e.target.value)}
                    placeholder="e.g. Period 2, Period 3"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Suggested Substitute Faculty
                </label>
                <select
                  value={issueLeaveSubstitute}
                  onChange={(e) => setIssueLeaveSubstitute(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {availableFaculty.length > 0 ? (
                    availableFaculty.map(f => (
                      <option key={f.id} value={`${f.name} (${f.department})`}>
                        {f.name} ({f.department} - Free: {f.free_periods?.join(', ') || 'Available'})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Mrs. Neha Roy (TGT Science)">Mrs. Neha Roy (TGT Science)</option>
                      <option value="Mr. Vikram Sharma (PGT Physics)">Mr. Vikram Sharma (PGT Physics)</option>
                      <option value="Ms. Priya Sen (TGT English)">Ms. Priya Sen (TGT English)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Reason / Administrative Order
                </label>
                <textarea
                  rows={2}
                  required
                  value={issueLeaveReason}
                  onChange={(e) => setIssueLeaveReason(e.target.value)}
                  placeholder="e.g. Deputation for CBSE Science Exhibition / Evaluation Duty"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIssueLeaveModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Issue &amp; Open Proxy Gap
                </button>
              </div>
            </form>
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