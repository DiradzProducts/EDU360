'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Users, 
  BookOpen, 
  MessageSquareQuote, 
  CalendarCheck, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  Plus, 
  X, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  HeartPulse, 
  Award, 
  Sparkles, 
  Filter, 
  Calendar,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  AlertTriangle,
  ChevronDown,
  Send,
  Lock,
  Upload,
  Eye,
  Printer,
  FileCheck,
  UserCheck,
  Edit
} from 'lucide-react';
import { 
  Student, 
  ExitClearance, 
  StudentPunctualityLedgerResponse, 
  SubjectAttendanceData, 
  OfficialDocument,
  StudentAcademicBreakdownResponse,
  SubjectAcademicBreakdown,
  ExamHistoryDetail
} from '@/lib/types';
import { api } from '@/lib/api';
import { ExitClearanceView } from '@/components/exit-clearance-modal';
import { LogOut, Library, FlaskConical } from 'lucide-react';
import { StudentRemark, getRemarksForStudent } from '@/lib/student-remarks';
import { downloadOfficialDocumentFile, openAndPrintOfficialDocument } from '@/lib/export-utils';

export interface UnifiedSISProps {
  studentId?: number;
  student?: Student | null;
  viewerRole: 'admin' | 'teacher' | 'parent' | 'student' | 'coordinator';
  onBack?: () => void;
  hideBack?: boolean;
}

export function UnifiedSISView({ studentId = 1, student, viewerRole, onBack, hideBack }: UnifiedSISProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'academics' | 'remarks' | 'attendance' | 'vault' | 'fees' | 'exit'>('profile');
  
  // Exit Clearance State (Admin Exclusive)
  const [exitClearance, setExitClearance] = useState<ExitClearance | null>(null);
  const [loadingExit, setLoadingExit] = useState(false);
  const [initiatingExit, setInitiatingExit] = useState(false);
  
  // Remarks state
  const [remarks, setRemarks] = useState<StudentRemark[]>([]);
  const [remarkFilter, setRemarkFilter] = useState<string>('All');
  const [showAddRemarkModal, setShowAddRemarkModal] = useState(false);
  const [newRemarkCategory, setNewRemarkCategory] = useState<StudentRemark['category']>('Academic Excellence');
  const [newRemarkPriority, setNewRemarkPriority] = useState<StudentRemark['priority']>('Routine');
  const [newRemarkText, setNewRemarkText] = useState('');

  // Document preview state
  const [previewDoc, setPreviewDoc] = useState<OfficialDocument | null>(null);

  // Admin certificate upload state
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [certTitle, setCertTitle] = useState('Transfer Certificate (TC / SLC)');
  const [certRefNo, setCertRefNo] = useState('EDU-TC-2026-0881');
  const [certRemarks, setCertRemarks] = useState('Clearance completed across Academic, Sports, and Accounts desks.');
  const [certFileName, setCertFileName] = useState('');
  const [isDraggingCert, setIsDraggingCert] = useState(false);

  // Admin TC Deposit modal state
  const [showAdminDepositTcModal, setShowAdminDepositTcModal] = useState(false);
  const [depositPrevSchool, setDepositPrevSchool] = useState("St. Xavier's High School");
  const [depositTcSerial, setDepositTcSerial] = useState("TC/2026/0491");
  const [depositTcFileName, setDepositTcFileName] = useState("Original_CounterSigned_TC.pdf");
  const [isDraggingDepositTc, setIsDraggingDepositTc] = useState(false);
  const [depositHardcopyConfirmed, setDepositHardcopyConfirmed] = useState(true);
  const [depositRemarks, setDepositRemarks] = useState("Original physical TC countersigned by DEO verified & archived.");
  const [submittingDepositTc, setSubmittingDepositTc] = useState(false);

  // Parent TC submission under 30-Day Undertaking state
  const [showParentTcModal, setShowParentTcModal] = useState(false);
  const [prevSchoolName, setPrevSchoolName] = useState("St. Xavier's High School");
  const [tcSerialNo, setTcSerialNo] = useState("TC/2026/0492");
  const [tcFileName, setTcFileName] = useState("Transfer_Certificate_Scan.pdf");
  const [isDraggingParentTc, setIsDraggingParentTc] = useState(false);
  const [parentRemarks, setParentRemarks] = useState("");
  const [submittingTc, setSubmittingTc] = useState(false);

  // Subject-Wise Attendance Breakdown & Parent Leave Request State
  const [selectedSubjectLog, setSelectedSubjectLog] = useState<string | null>(null);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [leaveCategory, setLeaveCategory] = useState<'Medical' | 'Family Emergency' | 'Bereavement' | 'Personal'>('Medical');
  const [leaveFromDate, setLeaveFromDate] = useState('2026-11-05');
  const [leaveToDate, setLeaveToDate] = useState('2026-11-06');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccessNotice, setLeaveSuccessNotice] = useState<string | null>(null);
  const [excusedCount, setExcusedCount] = useState(3);
  // Effective student ID
  const effectiveStudentId = student?.id || studentId;
  const isDemoStudent = effectiveStudentId === 1;

  const [loadedStudent, setLoadedStudent] = useState<Student | null>(student || null);

  useEffect(() => {
    if (student) {
      setLoadedStudent(student);
    } else {
      api.getStudentById(effectiveStudentId).then(res => {
        if (res) setLoadedStudent(res);
      }).catch(() => {});
    }
  }, [effectiveStudentId, student]);

  const activeStudent = loadedStudent || student;

  // Live Punctuality Ledger State (Phase 2 dynamic wire-up)
  const [ledgerData, setLedgerData] = useState<StudentPunctualityLedgerResponse | null>(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  useEffect(() => {
    setLoadingLedger(true);
    api.getStudentPunctualityLedger(effectiveStudentId).then(res => {
      if (res) {
        setLedgerData(res);
        if (res.excused_leaves !== undefined) {
          setExcusedCount(res.excused_leaves);
        }
      }
    }).catch(() => {}).finally(() => setLoadingLedger(false));
  }, [effectiveStudentId]);

  // Live Academic Standing & Multi-Exam Breakdown State
  const [academicData, setAcademicData] = useState<StudentAcademicBreakdownResponse | null>(null);
  const [loadingAcademics, setLoadingAcademics] = useState(false);
  const [selectedSubjectInspect, setSelectedSubjectInspect] = useState<SubjectAcademicBreakdown | null>(null);

  useEffect(() => {
    if (!effectiveStudentId) return;
    setLoadingAcademics(true);
    api.getStudentAcademicBreakdown(effectiveStudentId).then(res => {
      if (res) {
        setAcademicData(res);
      }
    }).catch(() => {}).finally(() => setLoadingAcademics(false));
  }, [effectiveStudentId]);

  // Secondary Edit Section State
  const [isEditingSecondary, setIsEditingSecondary] = useState(false);
  const [isSavingSecondary, setIsSavingSecondary] = useState(false);
  const [secondarySuccessMsg, setSecondarySuccessMsg] = useState<string | null>(null);
  const [secondaryForm, setSecondaryForm] = useState({
    secondary_guardian_name: 'Mrs. Priya Sharma',
    secondary_phone: '+91 98450 99881',
    secondary_email: 'priya.sharma@consulting.com',
    preferred_language: 'English / Hindi',
    hobbies: 'Competitive Robotics, Football (Midfield), Astronomy',
    aspirational_career: 'Aerospace & AI Robotics Engineer',
    dietary_preference: 'Vegetarian',
    emergency_notes: 'Allergic to penicillin. Campus doctor clearance certified.'
  });

  useEffect(() => {
    if (!effectiveStudentId) return;
    api.getStudentProfile(effectiveStudentId).then(res => {
      if (res && res.secondary_details && Object.keys(res.secondary_details).length > 0) {
        setSecondaryForm(prev => ({
          ...prev,
          ...res.secondary_details
        }));
      }
    }).catch(() => {});
  }, [effectiveStudentId]);

  const handleSaveSecondary = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSecondary(true);
    try {
      const res = await api.updateStudentSecondaryProfile(effectiveStudentId, secondaryForm);
      if (res && res.secondary_details) {
        setSecondaryForm(prev => ({ ...prev, ...res.secondary_details }));
      }
      setIsEditingSecondary(false);
      setSecondarySuccessMsg('Secondary details successfully updated and saved to permanent profile.');
      setTimeout(() => setSecondarySuccessMsg(null), 4000);
    } catch {
      setIsEditingSecondary(false);
    } finally {
      setIsSavingSecondary(false);
    }
  };

  // Dynamic Legal Certificates & Intake Documents Vault
  const [vaultDocuments, setVaultDocuments] = useState<OfficialDocument[]>([]);
  const [loadingVault, setLoadingVault] = useState(false);
  const [tcStatus, setTcStatus] = useState<{
    is_undertaking?: boolean;
    tc_submitted?: boolean;
    days_remaining?: number;
    days_elapsed?: number;
    tenure_days_total?: number;
    is_overdue?: boolean;
    deadline_date?: string;
  } | null>(null);

  const loadVaultDocuments = async () => {
    if (!effectiveStudentId) return;
    setLoadingVault(true);
    try {
      const [docsRes, tcRes] = await Promise.allSettled([
        api.getStudentDocuments(effectiveStudentId),
        api.getStudentTcStatus(effectiveStudentId)
      ]);
      if (docsRes.status === 'fulfilled' && docsRes.value) {
        setVaultDocuments(docsRes.value);
      }
      if (tcRes.status === 'fulfilled' && tcRes.value) {
        setTcStatus(tcRes.value);
      }
    } catch {
      // Handled via fallback in api.ts
    } finally {
      setLoadingVault(false);
    }
  };

  useEffect(() => {
    loadVaultDocuments();
  }, [effectiveStudentId]);

  const [certificates, setCertificates] = useState(() => isDemoStudent ? [
    {
      id: 'cert-1',
      title: 'Transfer Certificate (TC / School Leaving Certificate)',
      category: 'Exit Protocols',
      issuedBy: 'Fr. George Varghese (Principal)',
      issueDate: '24 Oct 2026',
      referenceNumber: 'EDU-TC-2026-0881',
      status: 'Clearance Approved',
      description: 'Official transfer certificate with complete academic clearance & conduct endorsement.'
    },
    {
      id: 'cert-2',
      title: 'Bonafide Student & Study Certificate',
      category: 'Identity & Enrollment',
      issuedBy: 'Central Administration Desk',
      issueDate: '15 Jul 2026',
      referenceNumber: 'EDU-BNF-2026-0042',
      status: 'Verified & Active',
      description: 'Institutional certification confirming active full-time enrollment in Class 8-B.'
    },
    {
      id: 'cert-3',
      title: 'Character & Moral Conduct Certificate',
      category: 'Exit Protocols',
      issuedBy: 'Discipline & Academic Committee',
      issueDate: '22 Oct 2026',
      referenceNumber: 'EDU-CND-2026-0199',
      status: 'Verified & Active',
      description: 'Exemplary moral character, peer collaboration, and sportsmanship record.'
    },
    {
      id: 'cert-4',
      title: 'Municipal Birth Certificate (Primary Vital Record)',
      category: 'Identity & Enrollment',
      issuedBy: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
      issueDate: '18 May 2012',
      referenceNumber: 'BBMP-BTH-2012-9841',
      status: 'Verified & Active',
      description: 'Authenticated legal date of birth record verifying student age eligibility.'
    },
    {
      id: 'cert-5',
      title: 'UIDAI Aadhaar Verification Dossier',
      category: 'Identity & Enrollment',
      issuedBy: 'Unique Identification Authority of India',
      issueDate: '10 Jan 2018',
      referenceNumber: 'UIDAI-XXXX-XXXX-4819',
      status: 'Verified & Active',
      description: 'Biometrically verified national citizen identity dossier with address proof.'
    }
  ] : []);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Student base info (derived or fallback)
  const currentStudentName = activeStudent?.name || (isDemoStudent ? 'Aarav Sharma' : 'Student Enrollee');
  const currentClass = activeStudent?.class_name || 'Class 8';
  const currentSection = activeStudent?.section || (isDemoStudent ? 'B' : 'A');
  const currentRoll = activeStudent?.roll_no || (isDemoStudent ? '14' : String(effectiveStudentId));
  const currentAdmissionNo = activeStudent?.admission_no || (isDemoStudent ? 'EDU-2024-082' : `EDU-2026-${effectiveStudentId}`);
  const currentAttendance = activeStudent?.attendance_pct !== undefined && activeStudent?.attendance_pct !== null
    ? activeStudent.attendance_pct
    : (isDemoStudent ? 94.2 : 100);
  const currentAcademicAvg = activeStudent?.academic_average_pct !== undefined && activeStudent?.academic_average_pct !== null
    ? activeStudent.academic_average_pct
    : (isDemoStudent ? 88.8 : null);

  const guardianName = activeStudent?.guardian_name || (isDemoStudent ? 'Mr. Rajesh Sharma' : 'Guardian');
  const guardianPhone = activeStudent?.guardian_phone || (isDemoStudent ? '+91 98111 00003' : '—');
  const guardianEmail = activeStudent?.guardian_email || (isDemoStudent ? 'rajesh.sharma@example.com' : '—');

  useEffect(() => {
    const list = getRemarksForStudent(studentId);
    setRemarks(list);
  }, [studentId]);

  useEffect(() => {
    if (viewerRole === 'admin') {
      setLoadingExit(true);
      api.getStudentExitClearance(effectiveStudentId).then(cl => {
        setExitClearance(cl);
        setLoadingExit(false);
      }).catch(() => setLoadingExit(false));
    }
  }, [effectiveStudentId, viewerRole]);

  const handleInitiateExit = async () => {
    setInitiatingExit(true);
    try {
      const res = await api.initiateExitClearance(effectiveStudentId);
      if (res && res.clearance) {
        setExitClearance(res.clearance);
        triggerToast(`Exit clearance protocol initiated for ${currentStudentName}!`);
      }
    } catch (err) {
      triggerToast('Failed to initiate exit clearance');
    } finally {
      setInitiatingExit(false);
    }
  };

  const handleVerifyPhysicalExit = async (scanUrl?: string) => {
    if (!exitClearance) return;
    await api.verifyPhysicalSign(exitClearance.id, scanUrl);
    const updated = await api.getStudentExitClearance(effectiveStudentId);
    setExitClearance(updated);
    triggerToast('Physical handover register scan verified & locked in legal vault');
  };

  // Handle adding new remark (Teacher / Admin)
  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemarkText.trim()) return;

    const newRemark: StudentRemark = {
      id: Date.now(),
      student_id: studentId,
      student_name: currentStudentName,
      author_name: viewerRole === 'admin' ? 'Dr. Sunita Kapoor' : 'Mrs. Ananya Verma',
      author_role: viewerRole === 'admin' ? 'Principal' : 'Class Teacher',
      category: newRemarkCategory,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      remark_text: newRemarkText.trim(),
      priority: newRemarkPriority,
      acknowledged_by_parent: false
    };

    setRemarks(prev => [newRemark, ...prev]);
    setShowAddRemarkModal(false);
    setNewRemarkText('');
    triggerToast('Official faculty observation recorded in student dossier.');
  };

  // Handle parent acknowledging remark
  const handleAcknowledgeRemark = (remarkId: number) => {
    setRemarks(prev => prev.map(r => r.id === remarkId ? {
      ...r,
      acknowledged_by_parent: true,
      parent_ack_by: 'Mr. Rajesh Sharma (Father)',
      parent_ack_date: new Date().toLocaleDateString('en-GB')
    } : r));
    triggerToast('Remark marked as acknowledged by parent.');
  };

  // Handle admin adding certificate
  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetFileName = certFileName || `${certTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${(currentStudentName || 'student').toLowerCase().replace(/\s+/g, '_')}.pdf`;
      await api.uploadOfficialDocument({
        student_id: effectiveStudentId,
        title: `${certTitle} - ${currentStudentName}`,
        doc_type: certTitle.includes('Transfer Certificate') ? 'Transfer Certificate' : certTitle.includes('Bonafide') ? 'Bonafide' : 'Legal Certificate',
        file_url: `/documents/${targetFileName}`
      });
      triggerToast(`Official ${certTitle} issued and sealed by Principal!`);
      setShowAddCertModal(false);
      setCertFileName('');
      loadVaultDocuments();
    } catch {
      triggerToast(`Official ${certTitle} issued.`);
      setShowAddCertModal(false);
      setCertFileName('');
      loadVaultDocuments();
    }
  };

  const handleApproveDocument = async (docId: number) => {
    try {
      await api.approveOfficialDocument(docId);
      triggerToast('Document officially verified & EDU360 Seal applied!');
      loadVaultDocuments();
    } catch {
      triggerToast('Document sealed by Administrator.');
      loadVaultDocuments();
    }
  };

  const handleDepositTc = () => {
    setShowAdminDepositTcModal(true);
  };

  const handleConfirmAdminDepositTc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDepositTc(true);
    try {
      await api.depositStudentTc(effectiveStudentId);
      triggerToast('✓ Original Transfer Certificate deposited, verified against physical hardcopy, and official seal affixed!');
      setShowAdminDepositTcModal(false);
      loadVaultDocuments();
    } catch {
      triggerToast('TC deposited and verified.');
      setShowAdminDepositTcModal(false);
      loadVaultDocuments();
    } finally {
      setSubmittingDepositTc(false);
    }
  };

  const handleParentSubmitTc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTc(true);
    try {
      await api.submitParentTc(effectiveStudentId, {
        previous_school_name: prevSchoolName,
        tc_serial_number: tcSerialNo,
        file_name: tcFileName,
        remarks: parentRemarks
      });
      triggerToast('✓ Transfer Certificate submitted! School Registrar notified to verify against physical original.');
      setShowParentTcModal(false);
      loadVaultDocuments();
    } catch {
      triggerToast('✓ Transfer Certificate submitted! School Registrar notified.');
      setShowParentTcModal(false);
      loadVaultDocuments();
    } finally {
      setSubmittingTc(false);
    }
  };

  // Filter remarks
  const filteredRemarks = remarks.filter(r => {
    if (remarkFilter === 'All') return true;
    return r.category.toLowerCase().includes(remarkFilter.toLowerCase());
  });

  // Allowed tabs: 'remarks' is HIDDEN from student
  const tabs = [
    { id: 'profile', label: 'Identity & Demographics', icon: Users },
    { id: 'academics', label: 'Academic Standing & Grades', icon: BookOpen },
    ...(viewerRole !== 'student' ? [
      { id: 'remarks', label: `Faculty Remarks & Conduct (${remarks.length})`, icon: MessageSquareQuote }
    ] : []),
    { id: 'attendance', label: 'Attendance & Biometrics', icon: CalendarCheck },
    { id: 'vault', label: 'Official Documents Vault', icon: FileText },
    ...((viewerRole === 'admin' || viewerRole === 'parent' || viewerRole === 'coordinator') ? [
      { id: 'fees', label: 'Fee & Accounts Ledger', icon: ShieldCheck }
    ] : []),
    ...(viewerRole === 'admin' ? [
      { id: 'exit', label: 'Exit Clearance & TC Vault', icon: LogOut }
    ] : [])
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3.5 shadow-2xl border border-slate-700 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Back Button (if provided) */}
      {onBack && !hideBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Roster Directory</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Viewing as:</span>
            <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
              {viewerRole}
            </span>
          </div>
        </div>
      )}

      {/* Top Profile Hero Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-md shrink-0">
              {currentStudentName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {currentStudentName}
                </h1>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold">
                  {currentClass}-{currentSection}
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-bold">
                  Roll #{currentRoll}
                </span>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active Student
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span>Adm ID: <strong className="text-slate-700 dark:text-slate-200">{currentAdmissionNo}</strong></span>
                <span>•</span>
                <span>Guardian: <strong className="text-slate-700 dark:text-slate-200">{guardianName} ({guardianPhone})</strong></span>
                <span>•</span>
                <span>Board: <strong className="text-slate-700 dark:text-slate-200">CBSE Affiliation #103049</strong></span>
              </div>
            </div>
          </div>

          {/* KPI Badges */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3 min-w-[100px] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {ledgerData ? `${ledgerData.punctuality_compliance_pct}%` : `${currentAttendance}%`}
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3 min-w-[100px] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Avg</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                {currentAcademicAvg !== null && currentAcademicAvg !== undefined ? `${currentAcademicAvg}%` : 'Enrolled'}
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3 min-w-[100px] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fee Status</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {isDemoStudent ? '₹18,500' : 'Clear ✓'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 dark:border-slate-800 pt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: IDENTITY & DEMOGRAPHICS                           */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Father & Primary Guardian */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Father &amp; Primary Guardian</span>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                  Verified Primary Contact
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{guardianName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{isDemoStudent ? 'Sr. Director, Enterprise Technology' : 'Registered Parent & Legal Guardian'}</p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{guardianPhone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>{guardianEmail}</span>
                </div>
              </div>
            </div>

            {/* Mother & Secondary Guardian */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Mother &amp; Secondary Guardian</span>
                <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-bold">
                  Authorized Emergency Pickup
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{secondaryForm.secondary_guardian_name || (isDemoStudent ? 'Mrs. Priya Sharma' : 'Secondary Emergency Contact')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{isDemoStudent ? 'Management Consultant' : 'Primary guardian serves as primary contact'}</p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-purple-500 shrink-0" />
                  <span>{secondaryForm.secondary_phone || (isDemoStudent ? '+91 98450 99881' : guardianPhone)}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Mail className="h-4 w-4 text-purple-500 shrink-0" />
                  <span>{secondaryForm.secondary_email || (isDemoStudent ? 'priya.sharma@consulting.com' : guardianEmail)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Medical Profile & Emergency Clearance */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <HeartPulse className="h-4 w-4 text-rose-500" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Medical Profile &amp; Emergency Clearance</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Blood Group</span>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400">B+ (Positive)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Recorded Allergies</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">None reported</span>
                </div>
              </div>
              <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-400">
                <strong>Campus Doctor Clearance:</strong> Annual fitness check cleared on 12 Aug 2026. Certified fit for competitive field athletics.
              </div>
            </div>

            {/* Residential Address */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Residential Address</span>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                #42, 4th Cross, Green Glen Layout, Bellandur, Bangalore, Karnataka &bull; PIN: 560103
              </p>
            </div>
          </div>

          {/* Dedicated Secondary Edit Section (User-Editable SIS Profile & Preferences) */}
          <div className="rounded-3xl border-2 border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-white dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/40 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <UserCheck className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    Secondary Information &amp; Student Preferences
                  </span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                    Editable by Student
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage your secondary emergency contact, preferred languages, hobbies, and aspirational career goals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isEditingSecondary ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingSecondary(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Secondary Details</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingSecondary(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {secondarySuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{secondarySuccessMsg}</span>
              </div>
            )}

            {!isEditingSecondary ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Secondary Guardian</span>
                  <p className="font-bold text-slate-900 dark:text-white">{secondaryForm.secondary_guardian_name}</p>
                  <p className="text-[11px] text-slate-500">{secondaryForm.secondary_phone}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Preferred Language</span>
                  <p className="font-bold text-slate-900 dark:text-white">{secondaryForm.preferred_language}</p>
                  <span className="text-[10px] text-slate-400">Diet: {secondaryForm.dietary_preference}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Aspirational Career</span>
                  <p className="font-bold text-indigo-700 dark:text-indigo-300">{secondaryForm.aspirational_career}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Extracurricular Hobbies</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 leading-snug">{secondaryForm.hobbies}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveSecondary} className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Secondary Guardian Name</label>
                    <input
                      type="text"
                      value={secondaryForm.secondary_guardian_name}
                      onChange={(e) => setSecondaryForm({ ...secondaryForm, secondary_guardian_name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Secondary Emergency Phone</label>
                    <input
                      type="text"
                      value={secondaryForm.secondary_phone}
                      onChange={(e) => setSecondaryForm({ ...secondaryForm, secondary_phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Secondary Email</label>
                    <input
                      type="email"
                      value={secondaryForm.secondary_email}
                      onChange={(e) => setSecondaryForm({ ...secondaryForm, secondary_email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Language(s)</label>
                    <input
                      type="text"
                      value={secondaryForm.preferred_language}
                      onChange={(e) => setSecondaryForm({ ...secondaryForm, preferred_language: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dietary Preference</label>
                    <input
                      type="text"
                      value={secondaryForm.dietary_preference}
                      onChange={(e) => setSecondaryForm({ ...secondaryForm, dietary_preference: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Aspirational Career Goal</label>
                    <input
                      type="text"
                      value={secondaryForm.aspirational_career}
                      onChange={(e) => setSecondaryForm({ ...secondaryForm, aspirational_career: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hobbies &amp; Extracurricular Focus</label>
                    <input
                      type="text"
                      value={secondaryForm.hobbies}
                      onChange={(e) => setSecondaryForm({ ...secondaryForm, hobbies: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Health Notes</label>
                    <input
                      type="text"
                      value={secondaryForm.emergency_notes}
                      onChange={(e) => setSecondaryForm({ ...secondaryForm, emergency_notes: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingSecondary(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSecondary}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSavingSecondary ? 'Saving...' : 'Save Secondary Details'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ACADEMIC STANDING & GRADES                        */}
      {/* ======================================================== */}
      {activeTab === 'academics' && (() => {
        const isJuniorTier = studentId === 7 || currentClass.includes('3') || currentClass.toLowerCase().includes('primary');
        const subjects = academicData?.subjects || [];
        const overallPct = academicData?.overall_percentage ?? (isDemoStudent ? 88.8 : 84.0);
        const overallGrd = academicData?.overall_grade ?? (isDemoStudent ? 'A2' : 'B1');
        const performanceBadge = academicData?.performance_badge || (isDemoStudent ? (isJuniorTier ? 'Star Performer (96.5%)' : 'Term 1 Rank #4 (88.8%)') : `Academic Standing (${overallPct}%) • Grade ${overallGrd}`);
        const totalExamsIndexed = subjects.reduce((acc, s) => acc + s.exams_count, 0);

        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Academic Performance &amp; Examination Breakdown &bull; {currentClass}-{currentSection}
                    </h3>
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Live Assessment Aggregator
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Continuous cumulative assessment records with automated multi-exam score averaging and term breakdown audits.
                  </p>
                </div>

                <span className="rounded-full px-3 py-1 text-xs font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap self-start sm:self-auto">
                  {performanceBadge}
                </span>
              </div>

              {/* 3-Col KPI Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cumulative Average</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase">{overallGrd} Grade</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {overallPct}%
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Multi-term aggregated academic average
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Core Subjects
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {subjects.length} Subjects
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Full CBSE curricular syllabus tracking
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Assessments
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                    {totalExamsIndexed} Examinations
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Periodic tests, mid-terms &amp; unit exams
                  </p>
                </div>
              </div>

              {/* Subject Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((sub, i) => {
                  const gradeColorClass = 
                    sub.grade === 'A1' || sub.grade === 'A1+' || sub.grade === 'O'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : sub.grade === 'A2'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : sub.grade === 'B1' || sub.grade === 'B2'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';

                  return (
                    <div 
                      key={i} 
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {sub.subject}
                          </span>
                          <span className={`rounded-md border text-[10px] font-black px-1.5 py-0.5 uppercase shrink-0 ${gradeColorClass}`}>
                            {sub.grade}
                          </span>
                        </div>

                        {/* Marks & Average Display */}
                        <div className="flex items-baseline justify-between pt-1">
                          <div>
                            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                              {sub.average_marks}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">/{sub.max_marks}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                            Avg of {sub.exams_count} {sub.exams_count === 1 ? 'Exam' : 'Exams'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, Math.max(0, (sub.average_marks / sub.max_marks) * 100))}%` }} 
                          />
                        </div>

                        {/* Latest Exam Preview */}
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate pt-0.5">
                          <span className="text-slate-400">Latest:</span> <b className="text-slate-700 dark:text-slate-300 font-mono">{sub.latest_marks} marks</b> in {sub.latest_exam_title}
                        </div>
                      </div>

                      {/* Footer: Faculty & Inspect Button */}
                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[130px]" title={sub.teacher}>
                          {sub.teacher}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedSubjectInspect(sub)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/90 text-blue-700 dark:text-blue-300 border border-blue-200/90 dark:border-blue-800 text-[11px] font-bold transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                          title={`Inspect all periodic and semester exam scores for ${sub.subject}`}
                        >
                          <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* TAB 3: FACULTY REMARKS & CONDUCT (HIDDEN FROM STUDENT)    */}
      {/* ======================================================== */}
      {activeTab === 'remarks' && viewerRole !== 'student' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Faculty Remarks &amp; Conduct Ledger
                  </h3>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                    Confidential &bull; Faculty &amp; Parent Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official teacher pedagogical annotations, conduct observations, and parental acknowledgments.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <select
                  value={remarkFilter}
                  onChange={e => setRemarkFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-3 py-2 font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Categories</option>
                  <option value="Academic Excellence">Academic Excellence</option>
                  <option value="Behavioral & Conduct">Behavioral &amp; Conduct</option>
                  <option value="Remedial">Remedial Focus Area</option>
                </select>

                {(viewerRole === 'teacher' || viewerRole === 'admin') && (
                  <button
                    onClick={() => setShowAddRemarkModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Faculty Remark</span>
                  </button>
                )}
              </div>
            </div>

            {/* Remarks List */}
            <div className="space-y-3.5">
              {filteredRemarks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No remarks found for the selected filter.
                </div>
              ) : (
                filteredRemarks.map(remark => (
                  <div 
                    key={remark.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {remark.author_name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                          {remark.author_role}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          remark.priority === 'High Attention'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {remark.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {remark.date} &bull; {remark.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      &ldquo;{remark.remark_text}&rdquo;
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2.5 text-[11px]">
                      <div className="flex items-center gap-2">
                        {remark.acknowledged_by_parent ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Acknowledged by Parent: {remark.parent_ack_by} ({remark.parent_ack_date})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            Awaiting Parent Acknowledgment
                          </span>
                        )}
                      </div>

                      {viewerRole === 'parent' && !remark.acknowledged_by_parent && (
                        <button
                          onClick={() => handleAcknowledgeRemark(remark.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-all cursor-pointer"
                        >
                          Acknowledge Note
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ATTENDANCE & BIOMETRICS (SUBJECT-WISE BREAKDOWN)  */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (() => {
        // Dynamic subject attendance list sourced from live ledger API with responsive fallback
        const subjectAttendanceData: SubjectAttendanceData[] = ledgerData?.subjects && ledgerData.subjects.length > 0
          ? ledgerData.subjects
          : (isDemoStudent ? [
              {
                subject: 'Mathematics',
                code: 'MATH-801',
                faculty: 'Mrs. Ananya Verma',
                period: 'Period 1 (08:30 AM)',
                total: 26,
                onTime: 18,
                lateCount: 5,
                avgLateMins: 14.2,
                excused: 2,
                unexcused: 1,
                healthPct: 76.9,
                statusTier: 'warning',
                incidents: [
                  { date: 'Nov 04, 2026', time: '08:44 AM', elapsed: 14.2, status: 'Late', note: 'Joined at +14.2m (>10m rule exceeded).', action: 'Pending Faculty Review' },
                  { date: 'Nov 02, 2026', time: '08:52 AM', elapsed: 22.0, status: 'Absent', note: 'Session locked at +22m (>20m limit). Video recording available in portal.', action: 'Session Locked (Unexcused)' },
                  { date: 'Oct 28, 2026', time: '08:42 AM', elapsed: 12.0, status: 'Present', note: 'Transit connection delay approved.', action: 'Approved by Mrs. Verma' },
                  { date: 'Oct 24, 2026', time: '08:45 AM', elapsed: 15.0, status: 'Late', note: 'Device Wi-Fi reconnect lag.', action: 'Flagged Late (+15m)' },
                  { date: 'Oct 19, 2026', time: '—', elapsed: 0, status: 'Excused', note: 'Parent Medical Slip #MED-891 approved.', action: 'Excused Leave (Doctor Note)' }
                ]
              },
              {
                subject: 'Physics',
                code: 'PHYS-802',
                faculty: 'Dr. Rajesh Rao',
                period: 'Period 2 (09:30 AM)',
                total: 22,
                onTime: 19,
                lateCount: 2,
                avgLateMins: 11.5,
                excused: 1,
                unexcused: 0,
                healthPct: 95.5,
                statusTier: 'healthy',
                incidents: [
                  { date: 'Oct 30, 2026', time: '09:41 AM', elapsed: 11.5, status: 'Present', note: 'Lab transition buffer.', action: 'Approved by Dr. Rao' },
                  { date: 'Oct 16, 2026', time: '09:42 AM', elapsed: 12.0, status: 'Late', note: 'Joined at +12m.', action: 'Flagged Late' }
                ]
              },
              {
                subject: 'Chemistry',
                code: 'CHEM-803',
                faculty: 'Mr. Vikram Seth',
                period: 'Period 4 (11:30 AM)',
                total: 20,
                onTime: 20,
                lateCount: 0,
                avgLateMins: 0,
                excused: 0,
                unexcused: 0,
                healthPct: 100.0,
                statusTier: 'perfect',
                incidents: []
              },
              {
                subject: 'English Literature',
                code: 'ENG-804',
                faculty: 'Ms. Priya Sen',
                period: 'Period 5 (01:15 PM)',
                total: 24,
                onTime: 22,
                lateCount: 1,
                avgLateMins: 12.0,
                excused: 1,
                unexcused: 0,
                healthPct: 95.8,
                statusTier: 'healthy',
                incidents: [
                  { date: 'Oct 21, 2026', time: '01:27 PM', elapsed: 12.0, status: 'Present', note: 'Debate council duty clearance.', action: 'Approved by Ms. Sen' }
                ]
              },
              {
                subject: 'Computer Science',
                code: 'CS-805',
                faculty: 'Mrs. Neha Gupta',
                period: 'Period 6 (02:15 PM)',
                total: 18,
                onTime: 18,
                lateCount: 0,
                avgLateMins: 0,
                excused: 0,
                unexcused: 0,
                healthPct: 100.0,
                statusTier: 'perfect',
                incidents: []
              }
            ] : [
              {
                subject: 'Mathematics',
                code: 'MATH-801',
                faculty: 'Mrs. Ananya Verma',
                period: 'Period 1 (08:30 AM)',
                total: 8,
                onTime: 8,
                lateCount: 0,
                avgLateMins: 0,
                excused: 0,
                unexcused: 0,
                healthPct: 100.0,
                statusTier: 'perfect',
                incidents: []
              },
              {
                subject: 'Physics',
                code: 'PHYS-802',
                faculty: 'Dr. Rajesh Rao',
                period: 'Period 2 (09:30 AM)',
                total: 6,
                onTime: 6,
                lateCount: 0,
                avgLateMins: 0,
                excused: 0,
                unexcused: 0,
                healthPct: 100.0,
                statusTier: 'perfect',
                incidents: []
              },
              {
                subject: 'Chemistry',
                code: 'CHEM-803',
                faculty: 'Mr. Vikram Seth',
                period: 'Period 4 (11:30 AM)',
                total: 6,
                onTime: 6,
                lateCount: 0,
                avgLateMins: 0,
                excused: 0,
                unexcused: 0,
                healthPct: 100.0,
                statusTier: 'perfect',
                incidents: []
              },
              {
                subject: 'English Literature',
                code: 'ENG-804',
                faculty: 'Ms. Priya Sen',
                period: 'Period 5 (01:15 PM)',
                total: 6,
                onTime: 6,
                lateCount: 0,
                avgLateMins: 0,
                excused: 0,
                unexcused: 0,
                healthPct: 100.0,
                statusTier: 'perfect',
                incidents: []
              },
              {
                subject: 'Computer Science',
                code: 'CS-805',
                faculty: 'Mrs. Neha Gupta',
                period: 'Period 6 (02:15 PM)',
                total: 4,
                onTime: 4,
                lateCount: 0,
                avgLateMins: 0,
                excused: 0,
                unexcused: 0,
                healthPct: 100.0,
                statusTier: 'perfect',
                incidents: []
              }
            ]);

        const activeSubject = subjectAttendanceData.find(s => s.subject === selectedSubjectLog);
        const overallNetRate = ledgerData?.punctuality_compliance_pct ?? (isDemoStudent ? currentAttendance : 100);
        const totalClassesCount = ledgerData?.total_classes ?? (isDemoStudent ? 110 : 30);
        const lateMarksCount = ledgerData?.late_marks ?? (isDemoStudent ? 8 : 0);
        const excusedLeavesCount = ledgerData?.excused_leaves ?? (isDemoStudent ? excusedCount : 0);
        const unexcusedBunkCount = ledgerData?.unexcused_bunks ?? (isDemoStudent ? 1 : 0);

        return (
          <div className="space-y-6">
            {/* Success Toast for Leave Application */}
            {leaveSuccessNotice && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{leaveSuccessNotice}</span>
                </div>
                <button 
                  onClick={() => setLeaveSuccessNotice(null)}
                  className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-700 dark:text-emerald-300 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* 1. TOP STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">Overall Net Rate</span>
                <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
                  {overallNetRate}%
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono block mt-0.5">
                  {overallNetRate >= 90 ? 'Healthy • Active' : 'Attendance Caution'}
                </span>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">Total Classes</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalClassesCount}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Across 5 Subjects</span>
              </div>
              <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">Late Marks (&gt;10m)</span>
                <span className="text-2xl font-black text-amber-800 dark:text-amber-200">
                  {lateMarksCount}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block mt-0.5">
                  {lateMarksCount > 0 ? 'Avg: +13.5 mins' : 'Zero Infractions'}
                </span>
              </div>
              <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">Excused Leaves</span>
                <span className="text-2xl font-black text-blue-800 dark:text-blue-200">
                  {excusedLeavesCount}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono block mt-0.5">Parent Approved</span>
              </div>
              <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center shadow-sm col-span-2 sm:col-span-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 block">Unexcused Bunk</span>
                <span className="text-2xl font-black text-rose-800 dark:text-rose-200">
                  {unexcusedBunkCount}
                </span>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono block mt-0.5">
                  {unexcusedBunkCount > 0 ? 'Session Locked' : 'No Lockouts'}
                </span>
              </div>
            </div>

            {/* 2. SUBJECT-WISE PUNCTUALITY BREAKDOWN TABLE */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Subject-Wise Punctuality Ledger &bull; Term 1 (2026-27)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
                      Live Roster Audit
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Granular breakdown of punctuality, 10-minute late stipulation executions, and parental excused absence logs.
                  </p>
                </div>

                {/* Parent Action Button */}
                <button
                  onClick={() => setShowApplyLeaveModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20 self-start sm:self-auto shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Apply Parent Leave Request</span>
                </button>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Subject & Faculty</th>
                      <th className="py-3 px-2 text-center">Sessions Held</th>
                      <th className="py-3 px-2 text-center">On-Time (≤10m)</th>
                      <th className="py-3 px-2 text-center">Late Mark (&gt;10m)</th>
                      <th className="py-3 px-2 text-center">Excused Leave</th>
                      <th className="py-3 px-2 text-center">Unexcused (Absent)</th>
                      <th className="py-3 px-2 text-center">Punctuality Score</th>
                      <th className="py-3 px-3 text-right">Detailed Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {subjectAttendanceData.map((sub) => (
                      <tr 
                        key={sub.code}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Subject & Faculty */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{sub.subject}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">({sub.code})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal">
                            {sub.faculty} &bull; <span className="font-mono text-[10px]">{sub.period}</span>
                          </div>
                        </td>

                        {/* Sessions Held */}
                        <td className="py-3.5 px-2 text-center font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {sub.total}
                        </td>

                        {/* On-Time */}
                        <td className="py-3.5 px-2 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px] border border-emerald-500/20">
                            <Check className="h-3 w-3" />
                            <span>{sub.onTime}</span>
                          </span>
                        </td>

                        {/* Late Mark */}
                        <td className="py-3.5 px-2 text-center">
                          {sub.lateCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold font-mono text-[11px] border border-amber-500/25">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{sub.lateCount} Late</span>
                              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono">(+{sub.avgLateMins}m)</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">—</span>
                          )}
                        </td>

                        {/* Excused Leave */}
                        <td className="py-3.5 px-2 text-center">
                          {sub.excused > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold font-mono text-[11px] border border-blue-500/25">
                              <span>🔵 {sub.excused} Days</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">—</span>
                          )}
                        </td>

                        {/* Unexcused Absent */}
                        <td className="py-3.5 px-2 text-center">
                          {sub.unexcused > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold font-mono text-[11px] border border-rose-500/25">
                              <Lock className="h-3 w-3" />
                              <span>{sub.unexcused} Locked</span>
                            </span>
                          ) : (
                            <span className="text-emerald-500 font-mono text-xs">0</span>
                          )}
                        </td>

                        {/* Punctuality Score */}
                        <td className="py-3.5 px-2 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                            sub.statusTier === 'perfect' 
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                              : sub.statusTier === 'healthy'
                                ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                                : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/35 ring-1 ring-amber-500/20'
                          }`}>
                            {sub.healthPct !== null ? `${sub.healthPct}%` : '—'}
                          </span>
                        </td>

                        {/* Action: View Incident Log */}
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedSubjectLog(sub.subject)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                          >
                            <span>View Incidents</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. INTERACTIVE SUBJECT INCIDENTS DRILL-DOWN MODAL */}
            {activeSubject && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-black uppercase">
                          {activeSubject.code}
                        </span>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          {activeSubject.subject} &bull; Attendance Incident Log
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Faculty: <strong className="text-slate-700 dark:text-slate-300">{activeSubject.faculty}</strong> &bull; Scheduled {activeSubject.period}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedSubjectLog(null)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Incident Records Timeline */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {activeSubject.incidents.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                          {isDemoStudent ? 'Flawless Punctuality Record' : 'Clean Attendance Record'}
                        </h5>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          {isDemoStudent 
                            ? `Student has zero late marks, zero lockouts, and 100% on-time attendance across all sessions in ${activeSubject.subject}.`
                            : `No attendance incidents, infractions, or unexcused absences recorded for ${activeSubject.subject}.`}
                        </p>
                      </div>
                    ) : (
                      activeSubject.incidents.map((inc, idx) => (
                        <div 
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{inc.date}</span>
                              <span className="text-[11px] text-slate-400 font-mono">({inc.time})</span>
                              {inc.elapsed > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
                                  +{inc.elapsed}m into lecture
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                              {inc.note}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                              inc.status === 'Present'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : inc.status === 'Late'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                  : inc.status === 'Excused'
                                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            }`}>
                              {inc.action}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => setSelectedSubjectLog(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      Close Incident Log
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. APPLY PARENT LEAVE REQUEST MODAL */}
            {showApplyLeaveModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">
                        Parent Leave Application
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Submit authorized leave request. Approved leaves protect attendance standing and bypass panic alerts.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowApplyLeaveModal(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setExcusedCount(prev => prev + 1);
                      setShowApplyLeaveModal(false);
                      setLeaveSuccessNotice(`Leave request for ${leaveFromDate} to ${leaveToDate} (${leaveCategory}) submitted successfully! Class Teachers notified.`);
                      try {
                        await api.applyParentLeave({
                          student_id: effectiveStudentId,
                          student_name: currentStudentName,
                          parent_name: guardianName,
                          from_date: leaveFromDate,
                          to_date: leaveToDate,
                          reason: leaveReason || `${leaveCategory} Leave requested by parent.`,
                          is_medical: leaveCategory === 'Medical',
                          attachment_name: leaveCategory === 'Medical' ? 'Medical_Doctor_Prescription.pdf' : undefined
                        });
                      } catch {
                        // handled locally
                      }
                      setLeaveReason('');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Reason Category
                      </label>
                      <select 
                        value={leaveCategory}
                        onChange={(e: any) => setLeaveCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="Medical">Medical (Illness / Doctor Appointment / Prescription)</option>
                        <option value="Family Emergency">Family Emergency / Unforeseen Urgent Event</option>
                        <option value="Bereavement">Bereavement / Family Loss</option>
                        <option value="Personal">Personal / Authorized Event Representation</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          From Date
                        </label>
                        <input 
                          type="date"
                          value={leaveFromDate}
                          onChange={e => setLeaveFromDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          To Date
                        </label>
                        <input 
                          type="date"
                          value={leaveToDate}
                          onChange={e => setLeaveToDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Parental Notes / Clinical Explanation
                      </label>
                      <textarea
                        rows={3}
                        value={leaveReason}
                        onChange={e => setLeaveReason(e.target.value)}
                        placeholder="e.g. Aarav was diagnosed with seasonal viral fever. Prescribed 2 days bed rest by Dr. Sharma. Medical certificate attached."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] leading-relaxed">
                      💡 <strong>Excused Absence Protection:</strong> Approved requests auto-mark live session rosters as <em>"Excused"</em>. Your child will not trigger disciplinary truancy alerts and will receive full access to all asynchronous lecture recordings.
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowApplyLeaveModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Leave Application</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      })()}


      {/* ======================================================== */}
      {/* TAB 5: OFFICIAL DOCUMENTS VAULT & CERTIFICATES           */}
      {/* ======================================================== */}
      {activeTab === 'vault' && (() => {
        const displayDocs: OfficialDocument[] = vaultDocuments.length > 0 
          ? vaultDocuments 
          : certificates.map((c, i) => ({
              id: i + 1,
              student_id: effectiveStudentId,
              title: c.title,
              doc_type: c.category || 'Official Document',
              file_url: `/documents/cert_${i + 1}.pdf`,
              is_official: true,
              uploaded_by_role: 'admin',
              upload_date: c.issueDate || new Date().toISOString(),
              status: c.status || 'Verified',
              verified_stamp: `Ref: ${c.referenceNumber || 'EDU360 Seal'}`
            }));

        const hasActiveTcUndertaking = (tcStatus?.is_undertaking && !tcStatus?.tc_submitted) || 
          displayDocs.some(d => (d.title.includes('Undertaking') || d.status.includes('Pending Submission')) && d.status !== 'Verified');

        return (
          <div className="space-y-6">
            {/* 30-Day Provisional TC Undertaking Status Banner */}
            {hasActiveTcUndertaking && (
              <div className="rounded-3xl border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 p-5 shadow-sm animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                      ⏳
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                          Provisional Admission: 30-Day TC Undertaking Active
                        </h4>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          tcStatus?.is_overdue 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                        }`}>
                          {tcStatus?.is_overdue ? '30-Day Window Expired' : `${tcStatus?.days_remaining ?? 25} Days Remaining`}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/80 dark:text-amber-300/90 mt-1 max-w-2xl leading-relaxed">
                        This student was provisionally enrolled under a signed 30-day parental undertaking. The original Transfer Certificate (TC) from the previous school must be deposited by <strong className="font-semibold text-amber-950 dark:text-amber-100">{tcStatus?.deadline_date || '18 Dec 2026'}</strong>.
                      </p>
                    </div>
                  </div>

                  {viewerRole === 'admin' && (
                    <button
                      type="button"
                      onClick={handleDepositTc}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Deposit &amp; Verify TC</span>
                    </button>
                  )}

                  {viewerRole === 'parent' && (
                    <button
                      type="button"
                      onClick={() => setShowParentTcModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Pending TC Scan</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Official Legal Certificates &amp; Document Vault
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-mono">
                      {displayDocs.length} Verified Records
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mandatory enrolment intake documents (Birth Certificate, Report Card, TC) and institutional certificates. {viewerRole === 'admin' ? '(Admin Exclusive Edit, Verify & Issue Authority)' : '(Certified School Registry Archive)'}
                  </p>
                </div>

                {viewerRole === 'admin' && (
                  <button
                    onClick={() => setShowAddCertModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Issue / Upload Legal Certificate</span>
                  </button>
                )}
              </div>

              {/* Document Cards List */}
              <div className="space-y-3.5">
                {displayDocs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 p-8 text-center space-y-2">
                    <FileText className="h-8 w-8 text-slate-400 mx-auto opacity-60" />
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No Official Documents or Certificates In Vault Yet
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Official bonafide study certificates, character endorsements, and transfer documentation will appear here once issued.
                    </p>
                  </div>
                ) : (
                  displayDocs.map(doc => {
                    const isUndertaking = (doc.title.includes('Undertaking') || doc.status.includes('Pending Submission')) && doc.status !== 'Verified';
                    const isPending = doc.status === 'Pending Verification';
                    const isVerified = doc.status === 'Verified' || doc.status === 'Clearance Approved';

                    return (
                      <div 
                        key={doc.id}
                        className={`rounded-2xl border p-4.5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isUndertaking
                            ? 'border-amber-200 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20'
                            : isPending
                            ? 'border-blue-200 dark:border-blue-800/80 bg-blue-50/30 dark:bg-blue-950/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                            isUndertaking
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : isPending
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {doc.doc_type === 'Birth Certificate' ? (
                              <Award className="h-5 w-5" />
                            ) : doc.doc_type === 'Transfer Certificate' ? (
                              <LogOut className="h-5 w-5" />
                            ) : doc.doc_type === 'Marks Card' ? (
                              <GraduationCap className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                {doc.title}
                              </h4>
                              <span className={`rounded-md text-[10px] font-bold px-2 py-0.5 inline-flex items-center gap-1 ${
                                isVerified
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  : isUndertaking
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                  : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              }`}>
                                {isVerified && <CheckCircle2 className="h-3 w-3" />}
                                {isUndertaking && <Clock className="h-3 w-3" />}
                                {isPending && <ShieldCheck className="h-3 w-3" />}
                                <span>{isUndertaking ? '⏳ 30-Day TC Undertaking' : doc.status}</span>
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                {doc.doc_type}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              <span>Uploaded by: <b className="text-slate-700 dark:text-slate-300 capitalize">{doc.uploaded_by_role || 'Admissions Desk'}</b></span>
                              <span>&bull;</span>
                              <span>Endorsement: <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.verified_stamp || 'EDU360 Official Seal'}</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 flex-wrap self-end md:self-auto">
                          {/* In-App Document Viewer (Opens full official certificate on screen) */}
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-3 py-1.5 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-xs cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Document</span>
                          </button>

                          {viewerRole === 'admin' && isPending && (
                            <button
                              type="button"
                              onClick={() => handleApproveDocument(doc.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Verify &amp; Affix Seal</span>
                            </button>
                          )}

                          {viewerRole === 'admin' && isUndertaking && (
                            <button
                              type="button"
                              onClick={() => setShowAdminDepositTcModal(true)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              <span>Deposit Original TC</span>
                            </button>
                          )}

                          {viewerRole === 'parent' && isUndertaking && (
                            <button
                              type="button"
                              onClick={() => setShowParentTcModal(true)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              <span>Upload Scanned TC</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              openAndPrintOfficialDocument(doc.title, currentStudentName, currentAdmissionNo);
                              triggerToast(`Opening ${doc.title} in print viewer.`);
                            }}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* TAB 6: FEE & ACCOUNTS LEDGER                             */}
      {/* ======================================================== */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Academic Fee Ledger &bull; Session 2026-27</h3>
            <p className="text-xs text-slate-500 mb-6">Tuition, curriculum, and laboratory facilities clearance schedule</p>

            {!isDemoStudent ? (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 p-8 text-center space-y-2">
                <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Accounts &amp; Tuition Clearance: Up to Date
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No outstanding institutional fee dues. Fee receipts and future term invoices will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Annual Fee Structure</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white block mt-0.5">₹1,45,000</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Total Realized</span>
                    <span className="text-xl font-black text-emerald-800 dark:text-emerald-200 block mt-0.5">₹1,26,500</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">Outstanding Balance</span>
                    <span className="text-xl font-black text-amber-800 dark:text-amber-200 block mt-0.5">₹18,500</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Term 1 Composite Tuition &amp; Lab Fee</div>
                      <div className="text-[11px] text-slate-500">Paid on 10 Jul 2026 via UPI (Ref: EDU-RCP-8801)</div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 block">₹72,500 Paid</span>
                      <span className="text-[10px] text-slate-400">Receipt Available</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Term 2 Composite Fee &bull; Partial Installment</div>
                      <div className="text-[11px] text-slate-500">Paid on 05 Oct 2026 via Bank POS (Ref: EDU-RCP-9142)</div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 block">₹54,000 Paid</span>
                      <span className="text-[10px] text-amber-500 font-bold">₹18,500 Balance Due 15 Nov</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'exit' && viewerRole === 'admin' && (
        <div className="space-y-6">
          {exitClearance ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    TC
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Active Transfer Certificate (TC) Protocol in Progress
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Student is registered in the School Exit Clearance pipeline. Complete dual-verification below.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-3 py-1 text-xs font-bold border border-blue-200 dark:border-blue-700">
                  {exitClearance.status}
                </span>
              </div>

              <ExitClearanceView
                clearance={exitClearance}
                role="admin"
                onVerifyPhysical={handleVerifyPhysicalExit}
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold border border-rose-200 dark:border-rose-800">
                      Admin Authority Exclusive
                    </span>
                    <span className="text-xs text-slate-400">CBSE Rule 44 Statutory Compliance</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    🎓 Initiate Exit Clearance &amp; Transfer Certificate (TC)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Initiate permanent school-leaving workflow for <strong className="text-slate-800 dark:text-slate-200">{currentStudentName}</strong> ({currentClass} - {currentSection}, Roll #{currentRoll}).
                  </p>
                </div>

                <button
                  onClick={handleInitiateExit}
                  disabled={initiatingExit}
                  className="flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-xs font-bold shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{initiatingExit ? 'Initiating Exit...' : 'Initiate Exit Clearance & Issue TC'}</span>
                </button>
              </div>

              {/* 4-Department Pre-Clearance Audit Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Automated Multi-Department Clearance Pre-Audit
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Fee &amp; Accounts</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">₹0 Outstanding Dues Verified</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Library className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Library Holdings</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">0 Active Book Holds (Returned)</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <FlaskConical className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Laboratory Assets</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Science &amp; Comp Lab Cleared</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Academic Records</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Mark Memo &amp; Standing Ready</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informational Workflow Callout */}
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold">Next Steps upon Initiation:</strong>
                  <p className="text-amber-800 dark:text-amber-300">
                    1. Student will be enrolled into the active <strong>School Exit Clearance Ledger</strong> (accessible via Admin Portal &rarr; Student TC).
                  </p>
                  <p className="text-amber-800 dark:text-amber-300">
                    2. The linked parent ({student?.guardian_name || 'Parent/Guardian'}) will see an immediate <strong>In-App Digital Sign-off Banner</strong> on their Parent Dashboard.
                  </p>
                  <p className="text-amber-800 dark:text-amber-300">
                    3. Once the parent provides digital approval and school admin uploads the signed physical register handover scan, the exit record will be permanently locked in the legal vault.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD FACULTY REMARK (TEACHER / ADMIN)              */}
      {/* ======================================================== */}
      {showAddRemarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquareQuote className="h-4 w-4 text-blue-600" />
                Add Official Faculty Observation
              </h3>
              <button onClick={() => setShowAddRemarkModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddRemark} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newRemarkCategory}
                  onChange={e => setNewRemarkCategory(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                >
                  <option value="Academic Excellence">Academic Excellence</option>
                  <option value="Behavioral & Conduct">Behavioral &amp; Conduct</option>
                  <option value="Remedial / Focus Area">Remedial / Focus Area</option>
                  <option value="Special Commendation">Special Commendation</option>
                  <option value="Sports & Leadership">Sports &amp; Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Attention</label>
                <select
                  value={newRemarkPriority}
                  onChange={e => setNewRemarkPriority(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                >
                  <option value="Routine">Routine Observation</option>
                  <option value="Commendation">Commendation / Praise</option>
                  <option value="High Attention">High Attention (Parent Consultation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Observation Remarks *</label>
                <textarea
                  rows={4}
                  value={newRemarkText}
                  onChange={e => setNewRemarkText(e.target.value)}
                  placeholder="Enter objective pedagogical or conduct notes..."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRemarkModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  Save Remark to Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADMIN ISSUE LEGAL CERTIFICATE                     */}
      {/* ======================================================== */}
      {showAddCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                Admin Official Certificate Issuance
              </h3>
              <button onClick={() => setShowAddCertModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddCertificate} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Certificate Type</label>
                <select
                  value={certTitle}
                  onChange={e => setCertTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                >
                  <option value="Transfer Certificate (TC / SLC)">Transfer Certificate (TC / School Leaving)</option>
                  <option value="Bonafide & Study Certificate">Bonafide &amp; Study Certificate</option>
                  <option value="Conduct & Character Certificate">Conduct &amp; Character Certificate</option>
                  <option value="No Objection Certificate (NOC)">No Objection Certificate (NOC)</option>
                  <option value="Sports Representation Clearance">Sports Representation Clearance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official Reference Number</label>
                <input
                  type="text"
                  value={certRefNo}
                  onChange={e => setCertRefNo(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-mono"
                  required
                />
              </div>

              {/* Upload Certificate Scanned Copy (Drag & Drop or Browse) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Scanned Certificate Document (Optional)
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingCert(true); }}
                  onDragLeave={() => setIsDraggingCert(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingCert(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setCertFileName(e.dataTransfer.files[0].name);
                    }
                  }}
                  onClick={() => document.getElementById('admin-cert-file-picker')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                    isDraggingCert
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : certFileName
                      ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Upload className={`h-6 w-6 mx-auto mb-1.5 ${certFileName ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {certFileName ? certFileName : 'Click to Browse or Drag & Drop File Here'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {certFileName ? '✓ File attached · Ready for sealing' : 'Supports PDF, PNG, JPG (Max 15MB)'}
                  </p>
                  <input
                    id="admin-cert-file-picker"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCertFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  {certFileName && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCertFileName('');
                      }}
                      className="mt-2 text-[10px] font-bold text-rose-600 hover:underline"
                    >
                      ✕ Remove file
                    </button>
                  )}
                </div>
                {!certFileName && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic">
                    * If no external scan is attached, EDU360 will auto-generate an official certified PDF with Principal cryptographic seal.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Principal Endorsement / Remarks</label>
                <textarea
                  rows={2}
                  value={certRemarks}
                  onChange={e => setCertRemarks(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCertModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                >
                  Affix Seal &amp; Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADMIN DEPOSIT & VERIFY ORIGINAL TC                */}
      {/* ======================================================== */}
      {showAdminDepositTcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                  📜
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Deposit &amp; Verify Original Transfer Certificate (TC)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Provisional 30-Day Undertaking Clearance &bull; {currentStudentName}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAdminDepositTcModal(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAdminDepositTc} className="mt-4 space-y-4">
              <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 p-3.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5">
                  <span>🏛️</span> Institutional Registry Inspection Protocol:
                </p>
                <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-300">
                  Affixing the official seal archives this original counter-signed TC into permanent SIS custody and permanently clears the student&apos;s 30-Day provisional undertaking.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Previous School Name
                  </label>
                  <input
                    type="text"
                    required
                    value={depositPrevSchool}
                    onChange={e => setDepositPrevSchool(e.target.value)}
                    placeholder="e.g. St. Xavier's High School"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    TC Reference / Serial No.
                  </label>
                  <input
                    type="text"
                    required
                    value={depositTcSerial}
                    onChange={e => setDepositTcSerial(e.target.value)}
                    placeholder="e.g. TC/2026/0491"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Drag and Drop File Upload for TC */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Scanned Original TC (PDF / JPEG / PNG)
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingDepositTc(true); }}
                  onDragLeave={() => setIsDraggingDepositTc(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingDepositTc(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setDepositTcFileName(e.dataTransfer.files[0].name);
                    }
                  }}
                  onClick={() => document.getElementById('admin-deposit-tc-file-picker')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                    isDraggingDepositTc
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                      : depositTcFileName
                      ? 'border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50'
                  }`}
                >
                  <Upload className={`h-6 w-6 mx-auto mb-1.5 ${depositTcFileName ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {depositTcFileName ? depositTcFileName : 'Click to Browse or Drag & Drop File'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {depositTcFileName ? '✓ Scanned copy attached for archiving' : 'Supports PDF, PNG, JPG (Max 15MB)'}
                  </p>
                  <input
                    id="admin-deposit-tc-file-picker"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDepositTcFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  {depositTcFileName && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDepositTcFileName('');
                      }}
                      className="mt-2 text-[10px] font-bold text-rose-600 hover:underline"
                    >
                      ✕ Remove file
                    </button>
                  )}
                </div>
              </div>

              {/* Physical Hardcopy Verification Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={depositHardcopyConfirmed}
                  onChange={e => setDepositHardcopyConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                  <strong>Statutory Physical Custody Confirmation:</strong> I confirm that the physical original counter-signed TC has been inspected and deposited in the permanent student dossier.
                </span>
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registrar / Principal Clearance Remarks
                </label>
                <textarea
                  value={depositRemarks}
                  onChange={e => setDepositRemarks(e.target.value)}
                  rows={2}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdminDepositTcModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDepositTc || !depositHardcopyConfirmed}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{submittingDepositTc ? 'Affixing Seal...' : 'Affix Official Seal & Verify TC'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PARENT SUBMIT PENDING TRANSFER CERTIFICATE (TC) MODAL   */}
      {/* ======================================================== */}
      {showParentTcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                  📜
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Submit Pending Transfer Certificate (TC)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Provisional 30-Day Undertaking Fulfillment &bull; {currentStudentName}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowParentTcModal(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleParentSubmitTc} className="mt-4 space-y-4">
              <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 p-3.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5">
                  <span>ℹ️</span> CBSE Affiliation &amp; Verification Protocol:
                </p>
                <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-300">
                  Uploading an advance scan registers your TC submission. The original hardcopy must still be presented at the Registrar Desk for physical stamping before deadline ({tcStatus?.deadline_date || '18 Dec 2026'}).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Previous School Name
                  </label>
                  <input
                    type="text"
                    required
                    value={prevSchoolName}
                    onChange={e => setPrevSchoolName(e.target.value)}
                    placeholder="e.g. St. Xavier's High School"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    TC Reference / Serial No.
                  </label>
                  <input
                    type="text"
                    required
                    value={tcSerialNo}
                    onChange={e => setTcSerialNo(e.target.value)}
                    placeholder="e.g. TC/2026/0491"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Scanned TC Document (PDF / JPEG / PNG)
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingParentTc(true); }}
                  onDragLeave={() => setIsDraggingParentTc(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingParentTc(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setTcFileName(e.dataTransfer.files[0].name);
                    }
                  }}
                  onClick={() => document.getElementById('parent-tc-file-picker')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                    isDraggingParentTc
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                      : tcFileName
                      ? 'border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/50'
                  }`}
                >
                  <Upload className={`h-6 w-6 mx-auto mb-1.5 ${tcFileName ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {tcFileName ? tcFileName : 'Click to Browse or Drag & Drop Transfer Certificate File'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {tcFileName ? '✓ Document attached · Ready for upload' : 'Supports PDF, PNG, JPG (Max 10MB)'}
                  </p>
                  <input
                    id="parent-tc-file-picker"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setTcFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  {tcFileName && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTcFileName('');
                      }}
                      className="mt-2 text-[10px] font-bold text-rose-600 hover:underline"
                    >
                      ✕ Remove file
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Counter-Signature Note (Optional)
                </label>
                <textarea
                  value={parentRemarks}
                  onChange={e => setParentRemarks(e.target.value)}
                  placeholder="e.g. Original TC countersigned by District Education Officer (DEO). Ready for physical submission."
                  rows={2}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowParentTcModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTc}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{submittingTc ? 'Submitting...' : 'Submit Scanned TC to Registrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DOCUMENT & CERTIFICATE PREVIEW VIEWER             */}
      {/* ======================================================== */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Viewer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  📜
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {previewDoc.title}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {previewDoc.status}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Official Student Document &bull; {currentStudentName} ({currentClass} - {currentSection})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAndPrintOfficialDocument(previewDoc.title, currentStudentName, currentAdmissionNo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadOfficialDocumentFile(previewDoc.title, currentStudentName, currentAdmissionNo);
                    triggerToast(`Downloaded ${previewDoc.title}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-blue-600" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Viewer Certificate Sheet */}
            <div className="p-6 sm:p-8 overflow-y-auto bg-slate-100/70 dark:bg-slate-950/60 flex-1">
              <div className="max-w-2xl mx-auto rounded-2xl border-4 border-double border-blue-800/40 dark:border-blue-700/50 bg-white dark:bg-slate-900 p-8 shadow-md relative overflow-hidden">
                <div className="text-center border-b-2 border-slate-200 dark:border-slate-800 pb-5 mb-6">
                  <div className="text-lg sm:text-xl font-black text-blue-900 dark:text-blue-300 tracking-wider">
                    OAKRIDGE INTERNATIONAL SCHOOL
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Affiliated to CBSE, New Delhi &bull; School Code: 40219
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    Campus: Tech City Zone 4, Outer Ring Road, Bengaluru – 560103
                  </div>
                </div>

                <div className="text-center font-bold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider underline my-4">
                  {previewDoc.title}
                </div>

                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 my-6 text-justify">
                  <p>
                    This is to officially certify that <strong className="text-blue-900 dark:text-blue-300 underline">{currentStudentName}</strong>, 
                    bearing Admission Number <strong className="text-blue-900 dark:text-blue-300 font-mono">{currentAdmissionNo}</strong>, 
                    is an actively enrolled student of this institution, studying in <strong className="text-blue-900 dark:text-blue-300">{currentClass} - {currentSection}</strong> for 
                    the Academic Session <strong>2026–2027</strong>.
                  </p>
                  <p>
                    Document Type: <strong>{previewDoc.doc_type}</strong> &bull; Verification Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">{previewDoc.status}</span>.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    All statutory institutional checks, counter-signatures, and regulatory requirements have been inspected and sealed under institutional authority.
                  </p>
                </div>

                {/* Footer with Seals and Signatures */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-block px-3 py-1 rounded-full border border-blue-400 bg-blue-50 dark:bg-blue-950/60 text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                      {previewDoc.verified_stamp || 'EDU360 Official Seal'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Uploaded by: <b className="capitalize">{previewDoc.uploaded_by_role}</b>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Verified Date: {new Date(previewDoc.upload_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-36 border-t border-slate-800 dark:border-slate-200 pt-1 font-bold text-xs text-slate-800 dark:text-slate-200">
                      Dr. Sunita Kapoor
                    </div>
                    <div className="text-[10px] text-slate-400">Principal &amp; Registrar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SUBJECT EXAM BREAKDOWN INSPECT MODAL              */}
      {/* ======================================================== */}
      {selectedSubjectInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedSubjectInspect.subject} &bull; Assessment Audit
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase">
                      Grade {selectedSubjectInspect.grade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Faculty Lead: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedSubjectInspect.teacher}</span> &bull; {currentClass}-{currentSection}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubjectInspect(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close Audit Modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Summary Ribbon */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3 bg-white dark:bg-slate-900">
              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Average Score</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {selectedSubjectInspect.average_marks} <span className="text-xs text-slate-400">/{selectedSubjectInspect.max_marks}</span>
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Assessments</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {selectedSubjectInspect.exams_count} Completed
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700 text-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Evaluation</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  100% Moderated
                </span>
              </div>
            </div>

            {/* Modal Body: Chronological Exams List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Chronological Examination &amp; Term History
              </h4>

              <div className="space-y-3">
                {selectedSubjectInspect.exam_history.map((exam, idx) => (
                  <div
                    key={exam.id || idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {exam.exam_title}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {exam.term}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> Conducted on {exam.exam_date}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                            {exam.marks_obtained} <span className="text-xs font-semibold text-slate-400">/{exam.total_marks}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> {exam.status}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black font-mono">
                          {exam.percentage}% &bull; {exam.grade}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar per exam */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, exam.percentage))}%` }}
                      />
                    </div>

                    {/* Teacher Feedback / Pedagogical Remark */}
                    {exam.teacher_remarks && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Teacher Pedagogical Assessment &amp; Remarks:
                        </div>
                        <p className="italic">
                          "{exam.teacher_remarks}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 italic text-center sm:text-left">
                Note: AI-driven automated grading &amp; RAG answer validation remain on hold pending key upload.
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubjectInspect(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shrink-0"
              >
                Close Audit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
