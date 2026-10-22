'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Video, 
  FileEdit, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Users, 
  MessageSquare, 
  Check, 
  X, 
  FileText, 
  Clock, 
  Layers, 
  PhoneCall, 
  Search, 
  Filter, 
  Play, 
  Award, 
  AlertTriangle, 
  AlertCircle, 
  Plus, 
  ArrowRight, 
  Send, 
  Eye, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Briefcase, 
  Radio, 
  BookOpen, 
  CalendarCheck, 
  ShieldCheck, 
  Bell, 
  RefreshCw, 
  ExternalLink, 
  Lock, 
  ChevronDown, 
  Info,
  ChevronUp,
  ClipboardList,
  Edit3,
  LayoutDashboard,
  LayoutGrid,
  List,
  FileSpreadsheet,
  UserPlus,
  TrendingUp,
  Download,
  CheckSquare,
  Save,
  FileCheck,
  Upload,
  Bus,
  HeartPulse,
  Mail,
  Phone,
  MapPin,
  Paperclip,
  Menu,
  CreditCard
} from 'lucide-react';
import { api } from '@/lib/api';
import { 
  AttendanceRecord, 
  HomeworkSubmission, 
  FocusTable, 
  LeaveRequest,
  TeacherScheduleItem,
  TeacherDutyItem,
  TeacherStudentRosterItem,
  TeacherPermissionRequest,
  TeacherPersonalScheduleItem,
  FacultyDutyTask,
  FacultyDutyCategory,
  ParentTeacherNote,
  PTMEventConfig,
  PTMSlot,
  InteractionScope,
  AdminTask,
  CurriculumPacingItem,
  ExamItem,
  ExamSubmissionItem,
  QuestionPaperItem,
  OcrScanResultItem,
  StaffPayslipItem
} from '@/lib/types';

import { AttendanceSimulator } from '@/components/attendance-simulator';
import { HomeworkCanvas } from '@/components/homework-canvas';
import { FocusTableView } from '@/components/focus-table-view';
import { 
  FocusRosterItem, 
  getStoredFocusRoster, 
  saveStoredFocusRoster, 
  updateFocusStudent, 
  CLASS_SECTION_METRICS,
  CLASS_SUBJECT_METRICS, 
  INITIAL_FOCUS_ROSTER 
} from '@/lib/focus-data';
import { RoleGuard } from '@/components/role-guard';
import { Footer } from '@/components/footer';
import { useTheme } from '@/lib/theme-context';

type TeacherTab = 
  | 'dashboard'
  | 'live_class' 
  | 'schedule' 
  | 'homework' 
  | 'focus_table' 
  | 'exams_gradebook'
  | 'roster' 
  | 'parent_hub' 
  | 'parent_chat'
  | 'leave_approvals' 
  | 'duties' 
  | 'my_permissions'
  | 'my_salary';

// Data types for Teacher Exams & Marks (Used in Duties Paper Correction Queue)
interface TeacherExamScoreItem {
  id: number;
  roll_no: string;
  name: string;
  admission_id: string;
  theory_score: number;
  internal_score: number;
  max_theory: number;
  max_internal: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Focus';
  teacher_note: string;
  in_focus_table: boolean;
}

interface TeacherExamConfig {
  id: string;
  title: string;
  subject: string;
  class_name: string;
  max_theory: number;
  max_internal: number;
  status: 'Draft' | 'Published' | 'Under Evaluation';
  date: string;
}

// Data types for Class Homework Roster
interface HomeworkRosterItem {
  id: number;
  roll_no: string;
  name: string;
  admission_id: string;
  status: 'Submitted' | 'Graded' | 'Missing';
  submission_time: string;
  file_name: string;
  file_size: string;
  score?: number;
  max_score: number;
  teacher_remarks?: string;
  annotations_json?: string;
  submission_data: HomeworkSubmission;
}

export default function TeacherPage() {
  const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { theme } = useTheme();

  // Core Data State
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [focusTable, setFocusTable] = useState<FocusTable | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [schedule, setSchedule] = useState<TeacherScheduleItem[]>([]);
  const [duties, setDuties] = useState<TeacherDutyItem[]>([]);
  const [students, setStudents] = useState<TeacherStudentRosterItem[]>([]);
  const [myPermissions, setMyPermissions] = useState<TeacherPermissionRequest[]>([]);
  const [myPayslip, setMyPayslip] = useState<StaffPayslipItem | null>(null);
  const [parentContext, setParentContext] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Master Architecture Spec: Personal Timetable, Duties Center, Dual-Mode Notes, and Sliding PTM
  const [personalSchedule, setPersonalSchedule] = useState<TeacherPersonalScheduleItem[]>([]);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>('Monday');
  const [facultyDuties, setFacultyDuties] = useState<FacultyDutyTask[]>([]);
  const [dutyCategoryFilter, setDutyCategoryFilter] = useState<'ALL' | FacultyDutyCategory>('ALL');
  const [dutyWeeklyFilter, setDutyWeeklyFilter] = useState<'ALL' | 'THIS_WEEK' | 'WEEKLY_ROUTINES' | 'TODAY' | 'UPCOMING'>('THIS_WEEK');
  const [dutySelectedDay, setDutySelectedDay] = useState<string>('ALL');
  const [selectedDutyId, setSelectedDutyId] = useState<string | null>(null);
  const [parentNotes, setParentNotes] = useState<ParentTeacherNote[]>([]);
  const [parentNoteScopeFilter, setParentNoteScopeFilter] = useState<'ALL' | InteractionScope>('ALL');
  const [ptmConfig, setPtmConfig] = useState<PTMEventConfig | null>(null);
  const [ptmSlots, setPtmSlots] = useState<PTMSlot[]>([]);
  const [ptmScopeFilter, setPtmScopeFilter] = useState<'ALL' | InteractionScope>('ALL');
  // Parental Hub PTM UI state
  const [ptmStatusFilter, setPtmStatusFilter] = useState<'ALL' | 'BOOKED' | 'AVAILABLE' | 'BREAK'>('ALL');
  const [homeworkList, setHomeworkList] = useState<HomeworkRosterItem[]>([
    {
      id: 1,
      roll_no: "01",
      name: "Aarav Sharma",
      admission_id: "ADM-2026-0801",
      status: "Submitted",
      submission_time: "Today, 08:45 AM",
      file_name: "Worksheet4_Aarav.pdf",
      file_size: "2.4 MB",
      max_score: 20,
      submission_data: {
        id: 1,
        homework_id: 1,
        student_id: 1,
        student_name: "Aarav Sharma",
        original_file_url: "/samples/math_worksheet.png",
        annotated_file_url: "/samples/math_worksheet.png",
        annotations_json: "",
        marks_obtained: undefined,
        teacher_remarks: "",
        status: "submitted",
        submitted_at: "2026-10-15T14:30:00.000Z"
      }
    },
    {
      id: 2,
      roll_no: "08",
      name: "Tanvi Deshmukh",
      admission_id: "ADM-2026-0808",
      status: "Graded",
      submission_time: "Yesterday, 04:30 PM",
      file_name: "Math_W4_TanviD.pdf",
      file_size: "1.8 MB",
      score: 19.0,
      max_score: 20,
      teacher_remarks: "Flawless quadratic factorization method. Keep it up!",
      annotations_json: JSON.stringify([{ type: 'tick', x: 200, y: 150 }, { type: 'tick', x: 200, y: 280 }]),
      submission_data: {
        id: 2,
        homework_id: 1,
        student_id: 8,
        student_name: "Tanvi Deshmukh",
        original_file_url: "/samples/math_worksheet.png",
        annotated_file_url: "/samples/math_worksheet.png",
        annotations_json: JSON.stringify([{ type: 'tick', x: 200, y: 150 }, { type: 'tick', x: 200, y: 280 }]),
        marks_obtained: 19.0,
        teacher_remarks: "Flawless quadratic factorization method. Keep it up!",
        status: "graded",
        submitted_at: "2026-10-16T08:30:00.000Z"
      }
    },
    {
      id: 3,
      roll_no: "14",
      name: "Rohan Deshmukh",
      admission_id: "ADM-2026-0814",
      status: "Graded",
      submission_time: "Today, 08:30 AM",
      file_name: "HW4_Rohan_Maths.pdf",
      file_size: "3.1 MB",
      score: 17.5,
      max_score: 20,
      teacher_remarks: "Good method in Q2, revise negative formula sign in Q4 before test!",
      annotations_json: JSON.stringify([{ type: 'tick', x: 200, y: 150 }, { type: 'circle', x: 380, y: 280 }]),
      submission_data: {
        id: 3,
        homework_id: 1,
        student_id: 14,
        student_name: "Rohan Deshmukh",
        original_file_url: "/samples/math_worksheet.png",
        annotated_file_url: "/samples/math_worksheet.png",
        annotations_json: JSON.stringify([{ type: 'tick', x: 200, y: 150 }, { type: 'circle', x: 380, y: 280 }]),
        marks_obtained: 17.5,
        teacher_remarks: "Good method in Q2, revise negative formula sign in Q4 before test!",
        status: "graded",
        submitted_at: "2026-10-16T08:30:00.000Z"
      }
    },
    {
      id: 4,
      roll_no: "15",
      name: "Kabir Mehta",
      admission_id: "ADM-2026-0815",
      status: "Missing",
      submission_time: "--",
      file_name: "--",
      file_size: "--",
      max_score: 20,
      submission_data: {
        id: 4,
        homework_id: 1,
        student_id: 15,
        student_name: "Kabir Mehta",
        original_file_url: "",
        status: "pending",
        submitted_at: ""
      }
    },
    {
      id: 5,
      roll_no: "18",
      name: "Rohan Iyer",
      admission_id: "ADM-2026-0818",
      status: "Submitted",
      submission_time: "Today, 09:12 AM",
      file_name: "Worksheet4_Iyer.pdf",
      file_size: "2.1 MB",
      max_score: 20,
      submission_data: {
        id: 5,
        homework_id: 1,
        student_id: 18,
        student_name: "Rohan Iyer",
        original_file_url: "/samples/math_worksheet.png",
        annotated_file_url: "/samples/math_worksheet.png",
        annotations_json: "",
        marks_obtained: undefined,
        teacher_remarks: "",
        status: "submitted",
        submitted_at: "2026-10-16T08:30:00.000Z"
      }
    },
    {
      id: 6,
      roll_no: "21",
      name: "Meera Nambiar",
      admission_id: "ADM-2026-0821",
      status: "Graded",
      submission_time: "Yesterday, 07:15 PM",
      file_name: "Meera_N_Math_4.pdf",
      file_size: "2.8 MB",
      score: 16.0,
      max_score: 20,
      teacher_remarks: "Minor calculation slip in Q3 discriminant calculation.",
      annotations_json: JSON.stringify([{ type: 'tick', x: 200, y: 150 }]),
      submission_data: {
        id: 6,
        homework_id: 1,
        student_id: 21,
        student_name: "Meera Nambiar",
        original_file_url: "/samples/math_worksheet.png",
        annotated_file_url: "/samples/math_worksheet.png",
        annotations_json: JSON.stringify([{ type: 'tick', x: 200, y: 150 }]),
        marks_obtained: 16.0,
        teacher_remarks: "Minor calculation slip in Q3 discriminant calculation.",
        status: "graded",
        submitted_at: "2026-10-16T08:30:00.000Z"
      }
    },
    {
      id: 7,
      roll_no: "22",
      name: "Vivaan Sen",
      admission_id: "ADM-2026-0822",
      status: "Submitted",
      submission_time: "Today, 09:20 AM",
      file_name: "Vivaan_Sen_HW.pdf",
      file_size: "1.9 MB",
      max_score: 20,
      submission_data: {
        id: 7,
        homework_id: 1,
        student_id: 22,
        student_name: "Vivaan Sen",
        original_file_url: "/samples/math_worksheet.png",
        annotated_file_url: "/samples/math_worksheet.png",
        annotations_json: "",
        marks_obtained: undefined,
        teacher_remarks: "",
        status: "submitted",
        submitted_at: "2026-10-16T08:30:00.000Z"
      }
    },
    {
      id: 8,
      roll_no: "28",
      name: "Tanvi Sen",
      admission_id: "ADM-2026-0828",
      status: "Graded",
      submission_time: "Today, 08:15 AM",
      file_name: "Tanvi_Quadratic_W4.pdf",
      file_size: "2.2 MB",
      score: 18.5,
      max_score: 20,
      teacher_remarks: "Neat step-by-step substitution and quadratic curve verification.",
      annotations_json: JSON.stringify([{ type: 'tick', x: 200, y: 150 }, { type: 'tick', x: 200, y: 280 }]),
      submission_data: {
        id: 8,
        homework_id: 1,
        student_id: 28,
        student_name: "Tanvi Sen",
        original_file_url: "/samples/math_worksheet.png",
        annotated_file_url: "/samples/math_worksheet.png",
        annotations_json: JSON.stringify([{ type: 'tick', x: 200, y: 150 }, { type: 'tick', x: 200, y: 280 }]),
        marks_obtained: 18.5,
        teacher_remarks: "Neat step-by-step substitution and quadratic curve verification.",
        status: "graded",
        submitted_at: "2026-10-16T08:30:00.000Z"
      }
    },
    {
      id: 9,
      roll_no: "31",
      name: "Diya Kapoor",
      admission_id: "ADM-2026-0831",
      status: "Missing",
      submission_time: "--",
      file_name: "--",
      file_size: "--",
      max_score: 20,
      submission_data: {
        id: 9,
        homework_id: 1,
        student_id: 31,
        student_name: "Diya Kapoor",
        original_file_url: "",
        status: "pending",
        submitted_at: ""
      }
    },
    {
      id: 10,
      roll_no: "35",
      name: "Arjun Nair",
      admission_id: "ADM-2026-0835",
      status: "Graded",
      submission_time: "Yesterday, 09:00 PM",
      file_name: "Arjun_Maths_HW4.pdf",
      file_size: "1.6 MB",
      score: 17.0,
      max_score: 20,
      teacher_remarks: "Good understanding of roots; remember to write units.",
      annotations_json: JSON.stringify([{ type: 'tick', x: 200, y: 150 }]),
      submission_data: {
        id: 10,
        homework_id: 1,
        student_id: 35,
        student_name: "Arjun Nair",
        original_file_url: "/samples/math_worksheet.png",
        annotated_file_url: "/samples/math_worksheet.png",
        annotations_json: JSON.stringify([{ type: 'tick', x: 200, y: 150 }]),
        marks_obtained: 17.0,
        teacher_remarks: "Good understanding of roots; remember to write units.",
        status: "graded",
        submitted_at: "2026-10-16T08:30:00.000Z"
      }
    }
  ]);

  const [homeworkSearch, setHomeworkSearch] = useState('');
  const [homeworkFilter, setHomeworkFilter] = useState<'All' | 'Needs Grading' | 'Graded' | 'Missing'>('All');
  const [speedGraderOpen, setSpeedGraderOpen] = useState(false);
  const [activeSpeedGraderIndex, setActiveSpeedGraderIndex] = useState<number>(0);

  // =========================================================
  // TASK 2: FOCUS TABLE CLASS ROSTER & 1-WEEK ACTION PLANS
  // =========================================================
  const [focusRoster, setFocusRoster] = useState<FocusRosterItem[]>(INITIAL_FOCUS_ROSTER);
  const [focusSectionFilter, setFocusSectionFilter] = useState<'All' | 'Class 8-B' | 'Class 8-A' | 'Class 9-A' | 'Class 9-B'>('Class 8-B');
  const [focusSearch, setFocusSearch] = useState('');
  const [focusCategoryFilter, setFocusCategoryFilter] = useState<'All' | 'Critical Remedial' | 'Targeted Practice'>('All');
  const [focusSubmissionFilter, setFocusSubmissionFilter] = useState<'All' | 'Needs Verification' | 'Verified' | 'Pending Submission'>('All');
  const [focusViewMode, setFocusViewMode] = useState<'cards' | 'table'>('cards');
  const [focusDrawerOpen, setFocusDrawerOpen] = useState(false);
  const [activeFocusIndex, setActiveFocusIndex] = useState<number>(0);
  const [verifyingFocusItem, setVerifyingFocusItem] = useState<FocusRosterItem | null>(null);
  const [teacherVerificationRemarks, setTeacherVerificationRemarks] = useState<string>('Factoring steps verified; negative sign distribution correctly resolved.');

  // =========================================================
  // UPSTREAM TRIGGER ENGINE: EXAMS & GRADEBOOK PUBLISHING
  // =========================================================
  const [examsList, setExamsList] = useState<ExamItem[]>([]);
  const [activePublishExamId, setActivePublishExamId] = useState<number>(1);
  const [examSubmissionsList, setExamSubmissionsList] = useState<ExamSubmissionItem[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState<boolean>(false);
  const [isPublishingExam, setIsPublishingExam] = useState<boolean>(false);
  const [publishSuccessBanner, setPublishSuccessBanner] = useState<{
    exam_title: string;
    total_published: number;
    remedial_enrolled_count: number;
    remedial_students: any[];
  } | null>(null);
  const [editingExamSubmission, setEditingExamSubmission] = useState<ExamSubmissionItem | null>(null);
  const [editExamMarks, setEditExamMarks] = useState<number>(50);
  const [editExamFeedback, setEditExamFeedback] = useState<string>('');

  // OCR & Question Paper Drafting State
  const [examSubTab, setExamSubTab] = useState<'marks_ledger' | 'qp_desk'>('marks_ledger');
  const [qpFilterStatus, setQpFilterStatus] = useState<'all' | 'pending' | 'under_review' | 'approved'>('all');
  const [draftRemarks, setDraftRemarks] = useState<string>('');
  const [teacherQpList, setTeacherQpList] = useState<QuestionPaperItem[]>([]);
  const [selectedDraftQp, setSelectedDraftQp] = useState<QuestionPaperItem | null>(null);
  const [draftFileUrl, setDraftFileUrl] = useState<string>('/samples/Class8_Math_Term1_Final_QP.pdf');
  const [draftFileName, setDraftFileName] = useState<string>('Class8_Math_Term1_Final_QP.pdf');
  const [answerKeyUrl, setAnswerKeyUrl] = useState<string>('/samples/Class8_Math_Term1_AnswerKey.pdf');

  const [showOcrModal, setShowOcrModal] = useState<boolean>(false);
  const [isScanningOcr, setIsScanningOcr] = useState<boolean>(false);
  const [ocrScannedFileName, setOcrScannedFileName] = useState<string>('Class8B_Math_Marks_Register_Physical.png');
  const [ocrResults, setOcrResults] = useState<OcrScanResultItem[]>([]);
  const [isCommittingOcr, setIsCommittingOcr] = useState<boolean>(false);
  const [ocrStep, setOcrStep] = useState<'upload' | 'scanning' | 'review'>('upload');

  const loadExams = async () => {
    setIsLoadingExams(true);
    try {
      const res = await api.listExams({ subject: 'Mathematics' });
      if (res && res.success && res.exams.length > 0) {
        setExamsList(res.exams);
        setActivePublishExamId(res.exams[0].id);
        const subRes = await api.getExamSubmissions(res.exams[0].id);
        if (subRes && subRes.success) {
          setExamSubmissionsList(subRes.submissions);
        }
      }
      // Load teacher question papers
      const qpRes = await api.getQuestionPapers({ teacher_id: 2 });
      setTeacherQpList(qpRes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingExams(false);
    }
  };

  const handleStartOcrScan = async () => {
    setOcrStep('scanning');
    setIsScanningOcr(true);
    try {
      // Simulate realistic AI handwriting OCR processing delay
      await new Promise(r => setTimeout(r, 1200));
      const res = await api.ocrScanMarksheet(activePublishExamId, {
        file_name: ocrScannedFileName,
        class_name: 'Class 8',
        section: 'B'
      });
      if (res && res.success) {
        setOcrResults(res.results);
        setOcrStep('review');
        triggerToast(`📸 Gemini Vision successfully parsed ${res.parsed_count} student marks from marksheet!`);
      }
    } catch (err: any) {
      triggerToast(err.message || 'OCR parsing failed. Please check image.');
      setOcrStep('upload');
    } finally {
      setIsScanningOcr(false);
    }
  };

  const handleCommitOcrGrades = async (autoPublish: boolean = false) => {
    setIsCommittingOcr(true);
    try {
      const payload = ocrResults.map(r => ({
        student_id: r.student_id,
        marks_obtained: r.marks_obtained,
        teacher_feedback: r.pedagogical_remarks
      }));
      const res = await api.batchGradeCommit(activePublishExamId, {
        grades: payload,
        auto_publish: autoPublish
      });
      if (res && res.success) {
        triggerToast(`✓ Committed ${res.updated_count} student scores to Gradebook!`);
        setShowOcrModal(false);
        setOcrStep('upload');
        await loadExams();
        if (autoPublish) {
          triggerToast('🎉 Exam results published! Remedial students enrolled in Focus Table.');
        }
      }
    } catch (err: any) {
      triggerToast(err.message || 'Failed to commit grades.');
    } finally {
      setIsCommittingOcr(false);
    }
  };

  const handleSubmitQpDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDraftQp) return;
    try {
      await api.submitQuestionPaperDraft(selectedDraftQp.id, {
        draft_file_url: draftFileUrl,
        draft_file_name: draftFileName,
        answer_key_url: answerKeyUrl || undefined
      });
      triggerToast(`Draft '${draftFileName}' submitted to Academic Coordinator for sign-off!`);
      setSelectedDraftQp(null);
      const updatedQp = await api.getQuestionPapers({ teacher_id: 2 });
      setTeacherQpList(updatedQp);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to submit draft.');
    }
  };


  const handleSelectExam = async (examId: number) => {
    setActivePublishExamId(examId);
    setPublishSuccessBanner(null);
    try {
      const subRes = await api.getExamSubmissions(examId);
      if (subRes && subRes.success) {
        setExamSubmissionsList(subRes.submissions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishExam = async (examId: number) => {
    setIsPublishingExam(true);
    try {
      const res = await api.publishExamResults(examId, { teacher_id: 2, notify_parents: true });
      if (res && res.success) {
        setPublishSuccessBanner(res);
        triggerToast(`🎉 Marks Published! ${res.remedial_enrolled_count} students auto-enrolled in Focus Table.`);
        // Reload exams to update publication status
        const exRes = await api.listExams({ subject: 'Mathematics' });
        if (exRes.success) setExamsList(exRes.exams);
        const subRes = await api.getExamSubmissions(examId);
        if (subRes.success) setExamSubmissionsList(subRes.submissions);
        // Refresh Focus Roster in state
        const rosterRes = await api.getRemedialRoster();
        if (rosterRes && Array.isArray(rosterRes)) {
          setFocusRoster(rosterRes);
        }
      }
    } catch {
      triggerToast('Results published successfully.');
    } finally {
      setIsPublishingExam(false);
    }
  };

  const handleSaveExamMarks = async () => {
    if (!editingExamSubmission) return;
    try {
      const res = await api.gradeExamSubmission(activePublishExamId, {
        student_id: editingExamSubmission.student_id,
        marks_obtained: editExamMarks,
        teacher_feedback: editExamFeedback,
        teacher_id: 2
      });
      if (res && res.success) {
        triggerToast(`Updated score: ${editExamMarks}/100 (${res.percentage}%)`);
        setEditingExamSubmission(null);
        // Refresh submissions
        const subRes = await api.getExamSubmissions(activePublishExamId);
        if (subRes.success) setExamSubmissionsList(subRes.submissions);
      }
    } catch {
      triggerToast('Marks updated successfully.');
      setEditingExamSubmission(null);
    }
  };

  // Modals state
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [newPermType, setNewPermType] = useState('Late Arrival');
  const [newPermDate, setNewPermDate] = useState('Today, 11:30 AM - 01:00 PM');
  const [newPermReason, setNewPermReason] = useState('');

  const [showPTMModal, setShowPTMModal] = useState(false);
  const [ptmStudent, setPtmStudent] = useState('Aarav Sharma');
  const [ptmDate, setPtmDate] = useState('Tomorrow, 04:30 PM');
  const [ptmAgenda, setPtmAgenda] = useState('Discuss Quadratic Equations Focus Table progress and homework habits');

  // Academic Tasks & Coordinator Delegations State
  const [academicTasks, setAcademicTasks] = useState<AdminTask[]>([]);
  const [curriculumItems, setCurriculumItems] = useState<CurriculumPacingItem[]>([]);
  const [showReliefModal, setShowReliefModal] = useState<boolean>(false);
  const [reliefSelectedTask, setReliefSelectedTask] = useState<AdminTask | null>(null);
  const [reliefReason, setReliefReason] = useState<'Medical Emergency' | 'Academic Workload Surge'>('Academic Workload Surge');
  const [reliefJustification, setReliefJustification] = useState<string>('');
  const [reliefSuggestedPeer, setReliefSuggestedPeer] = useState<string>('Mrs. Neha Roy');
  const [logUnitCurriculum, setLogUnitCurriculum] = useState<CurriculumPacingItem | null>(null);
  const [logUnitNotes, setLogUnitNotes] = useState<string>('');

  // 360 Student SIS State
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<TeacherStudentRosterItem | null>(null);
  const [sisActiveTab, setSisActiveTab] = useState<'profile' | 'academics' | 'attendance' | 'transport' | 'vault'>('profile');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Dedicated Parent Chat State (PRD Requirement: Chat with parent of any student)
  const [selectedChatStudentId, setSelectedChatStudentId] = useState<number>(1);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatRosterFilter, setChatRosterFilter] = useState<'ALL' | 'FOCUS' | '8B'>('ALL');
  const [chatInput, setChatInput] = useState('');
  const [conversations, setConversations] = useState<Record<number, Array<{ id: number; sender: 'parent' | 'teacher'; text: string; time: string }>>>({
    1: [
      {
        id: 1,
        sender: 'parent',
        text: "Hello Mrs. Verma, I noticed the Quadratic Equations note in Aarav's Focus Table. We completed Day 2 factoring problems in his rough notebook yesterday.",
        time: "Yesterday, 07:45 PM"
      },
      {
        id: 2,
        sender: 'teacher',
        text: "Thank you Mr. Sharma! I reviewed his Worksheet #4 today and he has improved greatly in standard factoring. I will take 5 minutes on Thursday during zero period to clear up the negative sign rule in Q4.",
        time: "Today, 09:15 AM"
      },
      {
        id: 3,
        sender: 'parent',
        text: "Understood, thank you for the personalized attention! We will ensure he practices the sign changes tonight.",
        time: "Today, 09:40 AM"
      }
    ],
    2: [
      {
        id: 1,
        sender: 'parent',
        text: "Good morning Mrs. Verma, Rohan mentioned there is an upcoming Inter-School Science & Math Fair next Friday. Will the school provide lab access after hours?",
        time: "Yesterday, 02:15 PM"
      },
      {
        id: 2,
        sender: 'teacher',
        text: "Good morning Dr. Deshmukh. Yes, physics and chemistry labs will remain open under teacher supervision until 04:30 PM this Wednesday and Thursday.",
        time: "Yesterday, 03:00 PM"
      }
    ],
    3: [
      {
        id: 1,
        sender: 'teacher',
        text: "Dear Mrs. Nambiar, just a reminder regarding Meera's Worksheet #4 on Quadratic Equations which was due yesterday at 5 PM.",
        time: "Today, 08:30 AM"
      },
      {
        id: 2,
        sender: 'parent',
        text: "Apologies Mrs. Verma! Meera had a migraine yesterday evening. She is submitting it during homeroom today. Thank you for your patience.",
        time: "Today, 08:50 AM"
      }
    ],
    4: [
      {
        id: 1,
        sender: 'parent',
        text: "Hello Mrs. Verma, Kabir has been down with viral fever for the past 2 days. We have applied for medical leave on the portal.",
        time: "2 days ago"
      },
      {
        id: 2,
        sender: 'teacher',
        text: "Thank you for the update Mr. Mehta. I have approved the medical leave. I will share the remedial notes and class summary once he recovers.",
        time: "Yesterday, 10:00 AM"
      }
    ],
    5: [
      {
        id: 1,
        sender: 'teacher',
        text: "Congratulations Mrs. Sen! Tanvi scored a perfect 100% in the Algebra Speed Drill today. Excellent conceptual clarity.",
        time: "Today, 10:15 AM"
      },
      {
        id: 2,
        sender: 'parent',
        text: "Thank you so much Mrs. Verma! She loves your math classes and was thrilled when she came home.",
        time: "Today, 10:45 AM"
      }
    ]
  });
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'parent' as const,
      text: "Hello Mrs. Verma, I noticed the Quadratic Equations note in Aarav's Focus Table. We completed Day 2 factoring problems in his rough notebook yesterday.",
      time: "Yesterday, 07:45 PM"
    },
    {
      id: 2,
      sender: 'teacher' as const,
      text: "Thank you Mr. Sharma! I reviewed his Worksheet #4 today and he has improved greatly in standard factoring. I will take 5 minutes on Thursday during zero period to clear up the negative sign rule in Q4.",
      time: "Today, 09:15 AM"
    }
  ]);

  // =========================================================
  // EXAMS & MARKS EVALUATION STATE
  // =========================================================
  const [examConfigs] = useState<TeacherExamConfig[]>([
    {
      id: 'ut-2',
      title: 'Unit Test 2: Quadratic Equations & Polynomials',
      subject: 'Mathematics',
      class_name: 'Class 8-B',
      max_theory: 40,
      max_internal: 10,
      status: 'Under Evaluation',
      date: '15 Oct 2026'
    },
    {
      id: 'term-1',
      title: 'Term 1 Midterm Summative Assessment',
      subject: 'Mathematics',
      class_name: 'Class 8-B',
      max_theory: 80,
      max_internal: 20,
      status: 'Draft',
      date: '28 Oct 2026'
    },
    {
      id: 'mock-board',
      title: 'CBSE Pre-Board Mock Assessment 1',
      subject: 'Mathematics',
      class_name: 'Class 10-A',
      max_theory: 80,
      max_internal: 20,
      status: 'Published',
      date: '10 Nov 2026'
    }
  ]);
  const [selectedExamId, setSelectedExamId] = useState<string>('ut-2');
  const [examSearch, setExamSearch] = useState('');
  const [examGradeFilter, setExamGradeFilter] = useState<'All' | 'A+ & A' | 'Passing' | 'Needs Focus'>('All');
  const [examScores, setExamScores] = useState<TeacherExamScoreItem[]>([
    { id: 1, roll_no: "01", name: "Aarav Sharma", admission_id: "ADM-2026-0801", theory_score: 26, internal_score: 8, max_theory: 40, max_internal: 10, grade: "B", teacher_note: "Sign error in quadratic expansion; Focus Table active.", in_focus_table: true },
    { id: 2, roll_no: "08", name: "Tanvi Deshmukh", admission_id: "ADM-2026-0808", theory_score: 39, internal_score: 10, max_theory: 40, max_internal: 10, grade: "A+", teacher_note: "Exceptional algebraic proof and formula precision.", in_focus_table: false },
    { id: 3, roll_no: "14", name: "Rohan Deshmukh", admission_id: "ADM-2026-0814", theory_score: 35, internal_score: 9, max_theory: 40, max_internal: 10, grade: "A", teacher_note: "Consistent problem solving; neat graphs.", in_focus_table: false },
    { id: 4, roll_no: "15", name: "Kabir Mehta", admission_id: "ADM-2026-0815", theory_score: 18, internal_score: 7, max_theory: 40, max_internal: 10, grade: "Needs Focus", teacher_note: "Frequent absences; struggles with fraction denominators.", in_focus_table: true },
    { id: 5, roll_no: "18", name: "Rohan Iyer", admission_id: "ADM-2026-0818", theory_score: 29, internal_score: 8, max_theory: 40, max_internal: 10, grade: "B", teacher_note: "Solid arithmetic, requires work on word problem framing.", in_focus_table: false },
    { id: 6, roll_no: "21", name: "Meera Nambiar", admission_id: "ADM-2026-0821", theory_score: 33, internal_score: 9, max_theory: 40, max_internal: 10, grade: "A", teacher_note: "Calculated discriminant with high accuracy.", in_focus_table: false },
    { id: 7, roll_no: "22", name: "Vivaan Sen", admission_id: "ADM-2026-0822", theory_score: 21, internal_score: 6, max_theory: 40, max_internal: 10, grade: "Needs Focus", teacher_note: "Missed 2 steps in middle term splitting.", in_focus_table: true },
    { id: 8, roll_no: "28", name: "Tanvi Sen", admission_id: "ADM-2026-0828", theory_score: 37, internal_score: 9, max_theory: 40, max_internal: 10, grade: "A+", teacher_note: "Clean execution and verified roots with substitution.", in_focus_table: false },
    { id: 9, roll_no: "31", name: "Diya Kapoor", admission_id: "ADM-2026-0831", theory_score: 19, internal_score: 7, max_theory: 40, max_internal: 10, grade: "Needs Focus", teacher_note: "Struggling with standard form conversion; needs intervention.", in_focus_table: true },
    { id: 10, roll_no: "35", name: "Arjun Nair", admission_id: "ADM-2026-0835", theory_score: 34, internal_score: 8, max_theory: 40, max_internal: 10, grade: "A", teacher_note: "Good speed and method accuracy.", in_focus_table: false }
  ]);
  const examCsvInputRef = useRef<HTMLInputElement | null>(null);

  // Schedule Tab Live Period Timer Countdown
  const [scheduleActivePeriodSeconds, setScheduleActivePeriodSeconds] = useState(1450);
  
  // Segmented Duties State (Event Tasks, Exam Invigilation, Paper Correction, Substitution)
  const [activeDutySegment, setActiveDutySegment] = useState<'ALL' | 'EVENT_COMMITTEE' | 'EXAM_INVIGILATION' | 'PAPER_CORRECTION' | 'CAMPUS_SUBSTITUTION'>('ALL');
  const [dutyScoringModalOpen, setDutyScoringModalOpen] = useState(false);

  // Subject Parents Section Filter (Homeroom 8-B vs Subject Students 7-A, 8-B, 9-C)
  const [subjectSectionFilter, setSubjectSectionFilter] = useState<'ALL' | '7-A' | '8-B' | '9-C'>('ALL');

  useEffect(() => {
    const timer = setInterval(() => {
      setScheduleActivePeriodSeconds(prev => (prev > 0 ? prev - 1 : 2700));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [
          attRes, 
          subRes, 
          ftRes, 
          lrRes,
          schRes,
          dutRes,
          stuRes,
          permRes,
          ctxRes,
          persSchRes,
          facDutRes,
          pNotesRes,
          ptmCfgRes,
          ptmSlotsRes,
          acadTasksRes,
          currPacingRes,
          payslipRes
        ] = await Promise.all([
          api.getAttendanceRoster(1),
          api.getSubmission(1),
          api.getFocusTable(1),
          api.getLeaveRequests(),
          api.getTeacherSchedule(),
          api.getTeacherDuties(),
          api.getTeacherStudents(),
          api.getMyTeacherPermissions(),
          api.getParentChatContext(1),
          api.getTeacherPersonalSchedule('Monday'),
          api.getFacultyDutyTasks(),
          api.getParentTeacherNotes(),
          api.getPTMEventConfig(),
          api.getPTMSlots(),
          api.getAdminTasks('academic'),
          api.getCurriculumPacing(),
          api.getMyPayslip(2)
        ]);

        setAttendance(attRes);
        setSubmission(subRes);
        setFocusTable(ftRes);
        setLeaveRequests(lrRes);
        setSchedule(schRes);
        setDuties(dutRes);
        setStudents(stuRes);
        setMyPermissions(permRes);
        setParentContext(ctxRes);
        setPersonalSchedule(persSchRes);
        setFacultyDuties(facDutRes);
        setParentNotes(pNotesRes);
        setPtmConfig(ptmCfgRes);
        setPtmSlots(ptmSlotsRes);
        setAcademicTasks(acadTasksRes);
        setCurriculumItems(currPacingRes);
        setMyPayslip(payslipRes);
      } catch (err) {
        console.error("Error loading teacher portal", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    loadExams();

    const handleUrlNavigation = () => {
      if (typeof window === 'undefined') return;
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as TeacherTab | null;
      const subtabParam = urlParams.get('subtab');
      const paperIdParam = urlParams.get('paperId');
      const studentIdParam = urlParams.get('studentId');

      if (tabParam) {
        setActiveTab(tabParam);
      }
      if (studentIdParam) {
        setSelectedChatStudentId(parseInt(studentIdParam, 10));
      }
      if (subtabParam === 'qp_desk') {
        setExamSubTab('qp_desk');
      } else if (subtabParam === 'marks_ledger') {
        setExamSubTab('marks_ledger');
      }
      if (paperIdParam) {
        const pId = parseInt(paperIdParam, 10);
        api.getQuestionPapers({ teacher_id: 2 }).then(res => {
          setTeacherQpList(res);
          const found = res.find(p => p.id === pId);
          if (found) {
            setSelectedDraftQp(found);
            setExamSubTab('qp_desk');
          }
        });
      }
    };

    handleUrlNavigation();
    window.addEventListener('popstate', handleUrlNavigation);
    const customListener = () => handleUrlNavigation();
    window.addEventListener('edu360-navigate-url', customListener);
    return () => {
      window.removeEventListener('popstate', handleUrlNavigation);
      window.removeEventListener('edu360-navigate-url', customListener);
    };
  }, []);

  // Master Spec Handlers:
  const handleDaySelect = async (day: string) => {
    setSelectedScheduleDay(day);
    try {
      const data = await api.getTeacherPersonalSchedule(day);
      setPersonalSchedule(data);
      triggerToast(`Loaded personal schedule for ${day}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdatePapers = async (taskId: string, delta: number) => {
    const task = facultyDuties.find(t => t.id === taskId);
    if (!task) return;
    const current = task.papers_completed || 0;
    const maxPapers = task.papers_assigned || 45;
    const updatedCount = Math.max(0, Math.min(maxPapers, current + delta));
    await api.updateDutyPaperCount(taskId, updatedCount);
    setFacultyDuties(prev => prev.map(t => t.id === taskId ? {
      ...t,
      papers_completed: updatedCount,
      status: updatedCount === maxPapers ? 'COMPLETED' : 'IN_PROGRESS'
    } : t));
    triggerToast(`Grading progress saved: ${updatedCount} / ${maxPapers} scripts.`);
  };

  const handleToggleDutyChecklist = async (taskId: string, itemIdx: number) => {
    await api.toggleDutyChecklist(taskId, itemIdx);
    setFacultyDuties(prev => prev.map(t => {
      if (t.id === taskId && t.action_checklist && t.action_checklist[itemIdx]) {
        const nextList = [...t.action_checklist];
        nextList[itemIdx] = { ...nextList[itemIdx], completed: !nextList[itemIdx].completed };
        const allCompleted = nextList.every(i => i.completed);
        return {
          ...t,
          action_checklist: nextList,
          status: allCompleted ? 'COMPLETED' : t.status
        };
      }
      return t;
    }));
    triggerToast("Duty checklist milestone updated.");
  };

  const handleHoldPTMSlot = async (slotId: string) => {
    await api.holdPTMSlot(slotId);
    setPtmSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: 'HELD' } : s));
    triggerToast("PTM Slot locked for 5 minutes.");
  };

  const handleToggleSlotBlock = (slotId: string) => {
    setPtmSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        const isCurrentlyBreak = s.status === 'BREAK';
        return {
          ...s,
          status: isCurrentlyBreak ? 'AVAILABLE' : 'BREAK',
          subject_name: isCurrentlyBreak ? undefined : 'Faculty Blocked Window'
        };
      }
      return s;
    }));
    triggerToast("Conference slot availability updated.");
  };

  const handleReleasePTMSlot = (slotId: string) => {
    setPtmSlots(prev => prev.map(s => s.id === slotId ? {
      ...s,
      status: 'AVAILABLE',
      booked_student_id: undefined,
      booked_student_name: undefined,
      booked_class: undefined,
      booked_parent_name: undefined,
      is_sibling_combo: false,
      sibling_student_name: undefined,
      focus_table_agenda: []
    } : s));
    triggerToast("PTM Slot has been made available again.");
  };

  const handleBookPTMSlotDirect = async (slotId: string, studentId: number, studentName: string, isSibling: boolean) => {
    const booked = await api.bookPTMSlot({
      slot_id: slotId,
      booked_student_id: studentId,
      booked_student_name: studentName,
      booked_class: "8-B",
      booked_parent_id: "par-01",
      booked_parent_name: "Mr. Rajesh Sharma",
      interaction_scope: "HOMEROOM_CLASS",
      is_sibling_combo: isSibling,
      sibling_student_id: isSibling ? 5 : undefined,
      sibling_student_name: isSibling ? "Kavya Sharma (5-A)" : undefined,
      focus_table_agenda: ["Algebraic Word Problems", "Continuous Remedial Plan"]
    });
    setPtmSlots(prev => prev.map(s => s.id === slotId ? booked : s));
    triggerToast(`Slot ${booked.start_time} confirmed for ${studentName}! Focus Table agenda linked.`);
  };

  // Handlers
  const handleSimulateJoin = async (studentId: number, minutesElapsed: number) => {
    await api.simulateJoin(1, studentId, minutesElapsed);
    const updated = await api.getAttendanceRoster(1);
    setAttendance(updated);
    const ruleText = minutesElapsed <= 10.0 ? 'PRESENT (within 10m)' : 'LATE (exceeded 10m threshold)';
    triggerToast(`10-Minute Engine evaluated Student #${studentId}: Auto-marked ${ruleText}`);
  };

  const handleOverrideAttendance = async (recordId: number, status: string) => {
    await api.overrideAttendance(1, recordId, status);
    const updated = await api.getAttendanceRoster(1);
    setAttendance(updated);
    triggerToast(`Teacher override saved: Record #${recordId} set to ${status}`);
  };

  const handleReviewLeave = async (id: number, status: 'Approved' | 'Rejected') => {
    await api.reviewLeaveRequest(id, status, `Reviewed and ${status.toLowerCase()} by Class Teacher Mrs. Ananya Verma`);
    const updated = await api.getLeaveRequests();
    setLeaveRequests(updated);
    triggerToast(`Student leave request #${id} marked as ${status}`);
  };

  const handleApplyPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermReason.trim()) return;

    await api.applyTeacherPermission({
      type: newPermType,
      date: newPermDate,
      reason: newPermReason
    });

    const updated = await api.getMyTeacherPermissions();
    setMyPermissions(updated);
    setShowPermissionModal(false);
    setNewPermReason('');
    triggerToast(`Permission request forwarded directly to Management / Principal queue`);
  };

  const handleRequestReliefSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reliefSelectedTask) return;
    try {
      await api.requestTaskRelief(reliefSelectedTask.id, {
        relief_reason: reliefReason,
        justification: reliefJustification,
        suggested_peer_teacher: reliefSuggestedPeer || undefined
      });
      triggerToast('Relief request submitted to Academic Coordinator. SLA is paused.');
      setShowReliefModal(false);
      setReliefSelectedTask(null);
      setReliefJustification('');
      const updated = await api.getAdminTasks('academic');
      setAcademicTasks(updated);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to submit relief request');
    }
  };

  const handleTeacherLogUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logUnitCurriculum) return;
    try {
      const res = await api.teacherLogCurriculumUnit(
        logUnitCurriculum.class_name,
        logUnitCurriculum.subject,
        1,
        logUnitNotes.trim() || undefined
      );
      if (res.success) {
        triggerToast(`✓ Logged unit completion: ${res.item.class_name} ${res.item.subject} (${res.item.completed_units}/${res.item.total_units} Units)`);
        setLogUnitCurriculum(null);
        setLogUnitNotes('');
        const updated = await api.getCurriculumPacing();
        setCurriculumItems(updated);
      }
    } catch (err: any) {
      triggerToast(err.message || 'Failed to log unit');
    }
  };

  const handleUpdateTeacherTaskStatus = async (taskId: number, newStatus: string) => {
    await api.updateAdminTask(taskId, { status: newStatus });
    const updated = await api.getAdminTasks('academic');
    setAcademicTasks(updated);
    triggerToast(`Academic task updated to ${newStatus}`);
  };

  const handleSchedulePTM = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPTMModal(false);
    triggerToast(`Online PTM invite sent to ${ptmStudent}'s parent for ${ptmDate}!`);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const currentChat = conversations[selectedChatStudentId] || [];
    const newMsg = {
      id: currentChat.length + 1,
      sender: 'teacher' as const,
      text: chatInput.trim(),
      time: 'Just now'
    };
    const updatedChat = [...currentChat, newMsg];
    setConversations(prev => ({
      ...prev,
      [selectedChatStudentId]: updatedChat
    }));
    setChatMessages(updatedChat);
    const targetStudent = students.find(s => s.id === selectedChatStudentId);
    triggerToast(`Message sent to ${targetStudent?.guardian_name || 'parent'}`);
    const messageText = chatInput.trim();
    setChatInput('');

    // Responsive parent reply simulation
    const activeId = selectedChatStudentId;
    setTimeout(() => {
      setConversations(prev => {
        const studentMessages = prev[activeId] || [];
        return {
          ...prev,
          [activeId]: [
            ...studentMessages,
            {
              id: studentMessages.length + 1,
              sender: 'parent' as const,
              text: `Thank you Mrs. Verma, received and noted regarding ${targetStudent?.name || 'the student'}!`,
              time: 'Just now'
            }
          ]
        };
      });
    }, 1500);
  };

  // SpeedGrader Handlers
  const handleOpenSpeedGrader = (index: number) => {
    setActiveSpeedGraderIndex(index);
    setSpeedGraderOpen(true);
  };

  const handleSaveSpeedGrading = async (marks: number, remarks: string, annotationsJson: string) => {
    const currentItem = homeworkList[activeSpeedGraderIndex];
    if (!currentItem) return;

    await api.saveGradedCanvas(currentItem.id, marks, remarks, annotationsJson);

    // Update local state in homework list
    setHomeworkList(prev => prev.map((item, idx) => {
      if (idx === activeSpeedGraderIndex) {
        return {
          ...item,
          status: 'Graded',
          score: marks,
          teacher_remarks: remarks,
          annotations_json: annotationsJson,
          submission_data: {
            ...item.submission_data,
            status: 'graded',
            marks_obtained: marks,
            teacher_remarks: remarks,
            annotations_json: annotationsJson
          }
        };
      }
      return item;
    }));

    triggerToast(`Graded submission for ${currentItem.name} (${marks}/20)! Parent & Student notified.`);
  };

  const handleRemindMissingStudent = (studentName: string) => {
    triggerToast(`Automated SMS & Push reminder sent to ${studentName}'s parent for Worksheet #4!`);
  };

  // Focus Table Handlers & Remedial Verification
  const handleOpenFocusDrawer = (index: number) => {
    setActiveFocusIndex(index);
    setFocusDrawerOpen(true);
  };

  const handleOpenVerificationModal = (item: FocusRosterItem) => {
    setVerifyingFocusItem(item);
    setTeacherVerificationRemarks(
      item.teacher_verification_notes || 
      `Factoring steps and signs for ${item.weak_concept} verified. Clean methodology.`
    );
  };

  const handleVerifySubmission = (studentId: number, customRemarks?: string) => {
    const finalRemarks = customRemarks || teacherVerificationRemarks || "Remedial solution verified and approved.";
    setFocusRoster(prev => prev.map(s => {
      if (s.student_id !== studentId && s.id !== studentId) return s;
      return {
        ...s,
        submission_status: 'Verified',
        teacher_verification_notes: finalRemarks,
        verified_at: 'Today, Just now',
        current_day: Math.min(s.total_days, s.current_day + 1),
        parent_status: 'Parent Verified ✓'
      };
    }));
    const targetStudent = focusRoster.find(s => s.student_id === studentId || s.id === studentId);
    triggerToast(`✓ Verified ${targetStudent?.name || 'student'}'s remedial submission! Focus record updated.`);
    setVerifyingFocusItem(null);
  };

  const handleReturnSubmission = (studentId: number, remarks: string) => {
    setFocusRoster(prev => prev.map(s => {
      if (s.student_id !== studentId && s.id !== studentId) return s;
      return {
        ...s,
        submission_status: 'Needs Revision',
        teacher_verification_notes: remarks || "Please re-check intermediate signs and re-upload solution."
      };
    }));
    const targetStudent = focusRoster.find(s => s.student_id === studentId || s.id === studentId);
    triggerToast(`Returned practice sheet to ${targetStudent?.name || 'student'} with revision notes.`);
    setVerifyingFocusItem(null);
  };

  const handleQuickVerifyAll = () => {
    const pendingItems = focusRoster.filter(f => f.submission_status === 'Submitted');
    if (pendingItems.length === 0) {
      triggerToast("No remedial submissions currently awaiting verification.");
      return;
    }
    setFocusRoster(prev => prev.map(s => {
      if (s.submission_status === 'Submitted') {
        return {
          ...s,
          submission_status: 'Verified',
          teacher_verification_notes: 'Batch verified by Subject Faculty.',
          verified_at: 'Today, Just now',
          current_day: Math.min(s.total_days, s.current_day + 1),
          parent_status: 'Parent Verified ✓'
        };
      }
      return s;
    }));
    triggerToast(`⚡ Batch verified ${pendingItems.length} remedial practice submissions! All students updated.`);
  };

  const handleRemindRemedialSubmission = (studentName: string) => {
    triggerToast(`Automated SMS & App push reminder sent to ${studentName} & parents for pending remedial upload!`);
  };

  // Calculations
  const presentCount = attendance.filter(r => r.status === 'Present').length;
  const lateCount = attendance.filter(r => r.status === 'Late').length;
  const pendingLeaves = leaveRequests.filter(lr => lr.status === 'Pending').length;

  // Filtered Homework
  const filteredHomework = homeworkList.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(homeworkSearch.toLowerCase()) || 
                        item.roll_no.includes(homeworkSearch) || 
                        item.admission_id.toLowerCase().includes(homeworkSearch.toLowerCase());
    if (!matchSearch) return false;
    if (homeworkFilter === 'Needs Grading') return item.status === 'Submitted';
    if (homeworkFilter === 'Graded') return item.status === 'Graded';
    if (homeworkFilter === 'Missing') return item.status === 'Missing';
    return true;
  });

  const homeworkStats = {
    total: 38,
    submitted: 32,
    graded: homeworkList.filter(h => h.status === 'Graded').length + 26,
    needsGrading: homeworkList.filter(h => h.status === 'Submitted').length,
    missing: 6
  };

  // Filtered Focus Roster (Subject: Mathematics, Filtered by Section)
  const filteredFocus = focusRoster.filter(item => {
    const weakConcept = item.ai_exam_scan?.weak_concept || item.weak_concept || '';
    const matchSearch = item.name.toLowerCase().includes(focusSearch.toLowerCase()) ||
                        item.roll_no.includes(focusSearch) ||
                        weakConcept.toLowerCase().includes(focusSearch.toLowerCase()) ||
                        item.class_name.toLowerCase().includes(focusSearch.toLowerCase());
    if (!matchSearch) return false;
    if (focusSectionFilter !== 'All' && item.class_name !== focusSectionFilter) return false;
    if (focusCategoryFilter !== 'All' && item.category !== focusCategoryFilter) return false;
    if (focusSubmissionFilter === 'Needs Verification') return item.submission_status === 'Submitted';
    if (focusSubmissionFilter === 'Verified') return item.submission_status === 'Verified';
    if (focusSubmissionFilter === 'Pending Submission') return item.submission_status === 'Pending' || !item.submission_status;
    return true;
  });

  const focusStats = {
    total: focusRoster.length,
    needsVerification: focusRoster.filter(f => f.submission_status === 'Submitted').length,
    verified: focusRoster.filter(f => f.submission_status === 'Verified').length,
    pending: focusRoster.filter(f => f.submission_status === 'Pending' || !f.submission_status).length,
    avgProgress: Math.round(
      focusRoster.reduce((acc, f) => acc + (f.current_day / f.total_days) * 100, 0) / (focusRoster.length || 1)
    )
  };

  const activeFocusItem = focusRoster[activeFocusIndex] || focusRoster[0];
  const activeSpeedGraderItem = homeworkList[activeSpeedGraderIndex] || homeworkList[0];

  // =========================================================
  // EXAMS COMPUTED VALUES & HANDLERS
  // =========================================================
  const currentExamConfig = examConfigs.find(c => c.id === selectedExamId) || examConfigs[0];

  const handleUpdateExamScore = (studentId: number, field: 'theory_score' | 'internal_score', value: number) => {
    setExamScores(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const updated = { ...s, [field]: Math.max(0, value) };
      const total = updated.theory_score + updated.internal_score;
      const maxTotal = updated.max_theory + updated.max_internal;
      const pct = (total / maxTotal) * 100;
      let newGrade: TeacherExamScoreItem['grade'] = 'Needs Focus';
      if (pct >= 90) newGrade = 'A+';
      else if (pct >= 80) newGrade = 'A';
      else if (pct >= 70) newGrade = 'B';
      else if (pct >= 60) newGrade = 'C';
      return {
        ...updated,
        grade: newGrade,
        in_focus_table: pct <= 70 || updated.in_focus_table
      };
    }));
  };

  const handleSaveExamRoster = () => {
    triggerToast(`Marks ledger for "${currentExamConfig.title}" saved & synchronized with SIS grade sheets!`);
  };

  const handleFlagAllUnderperformingToFocusTable = () => {
    const underperforming = examScores.filter(s => {
      const pct = ((s.theory_score + s.internal_score) / (s.max_theory + s.max_internal)) * 100;
      return pct <= 70;
    });
    setExamScores(prev => prev.map(s => {
      const pct = ((s.theory_score + s.internal_score) / (s.max_theory + s.max_internal)) * 100;
      return pct <= 70 ? { ...s, in_focus_table: true } : s;
    }));
    triggerToast(`Auto-flagged ${underperforming.length} students (<=70%) into Student Focus Table remedial cycle!`);
  };

  const handleDownloadExamCsv = () => {
    const header = "RollNumber,StudentName,AdmissionId,TheoryScore,InternalScore,MaxTheory,MaxInternal,Remarks\n";
    const rows = examScores.map(s => 
      `"${s.roll_no}","${s.name}","${s.admission_id}",${s.theory_score},${s.internal_score},${s.max_theory},${s.max_internal},"${s.teacher_note || ''}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${currentExamConfig.class_name}_${currentExamConfig.subject}_Marks_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("✓ Downloaded marks ledger CSV template for offline entry.");
  };

  const handleUploadExamCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          triggerToast("CSV file is empty or only contains headers.");
          return;
        }
        let updatedCount = 0;
        const dataRows = lines.slice(1);
        setExamScores(prev => {
          const next = [...prev];
          dataRows.forEach(row => {
            const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 5) {
              const roll = cols[0];
              const theory = parseInt(cols[3], 10);
              const internal = parseInt(cols[4], 10);
              const remarks = cols[7] || cols[5] || '';
              const idx = next.findIndex(s => s.roll_no === roll || s.admission_id === cols[2]);
              if (idx !== -1 && !isNaN(theory) && !isNaN(internal)) {
                const maxTotal = next[idx].max_theory + next[idx].max_internal;
                const total = theory + internal;
                const pct = (total / maxTotal) * 100;
                let grade: TeacherExamScoreItem['grade'] = 'Needs Focus';
                if (pct >= 90) grade = 'A+';
                else if (pct >= 80) grade = 'A';
                else if (pct >= 70) grade = 'B';
                else if (pct >= 60) grade = 'C';
                next[idx] = {
                  ...next[idx],
                  theory_score: theory,
                  internal_score: internal,
                  grade,
                  in_focus_table: pct <= 70,
                  teacher_note: remarks || next[idx].teacher_note
                };
                updatedCount++;
              }
            }
          });
          return next;
        });
        triggerToast(`✓ Successfully imported ${updatedCount} student marks from CSV!`);
      } catch {
        triggerToast("Failed to parse CSV file. Please ensure correct format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredExamScores = examScores.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(examSearch.toLowerCase()) ||
                        s.roll_no.includes(examSearch) ||
                        s.admission_id.toLowerCase().includes(examSearch.toLowerCase());
    if (!matchSearch) return false;
    if (examGradeFilter === 'A+ & A') return s.grade === 'A+' || s.grade === 'A';
    if (examGradeFilter === 'Passing') return s.grade !== 'Needs Focus';
    if (examGradeFilter === 'Needs Focus') return s.grade === 'Needs Focus';
    return true;
  });

  const examStats = {
    totalStudents: examScores.length,
    averagePct: Math.round(
      examScores.reduce((acc, s) => acc + ((s.theory_score + s.internal_score) / (s.max_theory + s.max_internal)) * 100, 0) / examScores.length
    ),
    topScore: Math.max(...examScores.map(s => s.theory_score + s.internal_score)),
    passCount: examScores.filter(s => s.grade !== 'Needs Focus').length,
    remedialCount: examScores.filter(s => s.grade === 'Needs Focus' || s.in_focus_table).length
  };

  
  return (
    <RoleGuard allowedRole="teacher">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 text-white px-4.5 py-3 shadow-2xl border border-blue-500/30 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Layout Container: Locked Height, Non-scrolling shell */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
        
        {/* ===================================================== */}
        {/* 1. LEFT STICKY NON-SCROLLING COLLAPSIBLE SIDEBAR     */}
        {/* ===================================================== */}
      {/* ── Mobile Drawer Backdrop ── */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* ===================================================== */}
      {/* 1. LEFT STICKY NON-SCROLLING COLLAPSIBLE SIDEBAR     */}
      {/* ===================================================== */}
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
        {/* Top Section */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header & Toggle */}
          <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-200/90 dark:border-slate-800/90 shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                  TC
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">Oakridge International</h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">Mrs. Ananya Verma • 8-B</span>
                </div>
              </div>
            ) : (
              <div className="mx-auto h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                TC
              </div>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className={`p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${sidebarCollapsed ? 'hidden' : 'hidden md:flex'}`}
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

          {/* Navigation List */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3.5 text-xs font-semibold select-none scrollbar-thin">
            
            {/* GROUP 0: DASHBOARD */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Command &amp; Overview
                </span>
              )}
              
              {/* 0. Main Dashboard */}
              <button
                onClick={() => { setActiveTab('dashboard'); setMobileDrawerOpen(false); }}
                title="Teacher Dashboard & Daily Pulse"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <LayoutDashboard className={`h-4 w-4 shrink-0 ${activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Dashboard Overview</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                    Daily Pulse
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 1: TEACHING & INSTRUCTION */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Teaching &amp; Classroom
                </span>
              )}
              
              {/* 1. Live Class Studio & 10m Rule */}
              <button
                onClick={() => { setActiveTab('live_class'); setMobileDrawerOpen(false); }}
                title="Live Class & 10-Minute Auto-Attendance"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'live_class'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Radio className={`h-4 w-4 shrink-0 ${activeTab === 'live_class' ? 'text-blue-600 dark:text-blue-400 animate-pulse' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Live Studio &amp; Attendance</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                )}
              </button>

              {/* 2. Schedule & Timetable */}
              <button
                onClick={() => { setActiveTab('schedule'); setMobileDrawerOpen(false); }}
                title="Teacher-Centric Personal Timetable"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Calendar className={`h-4 w-4 shrink-0 ${activeTab === 'schedule' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Personal Timetable</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Today</span>
                )}
              </button>
            </div>

            {/* GROUP 2: ASSESSMENTS, GRADING & CORRECTIONS */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Grading &amp; Corrections
                </span>
              )}

              {/* 3. Homework & Inline Corrections */}
              <button
                onClick={() => { setActiveTab('homework'); setMobileDrawerOpen(false); }}
                title="Homework Submissions, Inline Corrections & SpeedGrader"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'homework'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileEdit className={`h-4 w-4 shrink-0 ${activeTab === 'homework' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Homework &amp; Corrections</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                    {homeworkStats.needsGrading} To Grade
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 3: STUDENT OUTCOMES & INTERVENTION */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Outcomes &amp; Care
                </span>
              )}

              {/* 5. Shared Focus Table */}
              <button
                onClick={() => { setActiveTab('focus_table'); setMobileDrawerOpen(false); }}
                title="Shared Student Focus Table (Class Roster)"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'focus_table'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className={`h-4 w-4 shrink-0 ${activeTab === 'focus_table' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Student Focus Table</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                    {focusRoster.length} On Plan
                  </span>
                )}
              </button>

              {/* 5b. Terminal Exams & Gradebook Publishing Engine */}
              <button
                onClick={() => {
                  setActiveTab('exams_gradebook');
                  setMobileDrawerOpen(false);
                  if (examsList.length === 0) loadExams();
                }}
                title="Terminal Descriptive Exams & Gradebook Publishing Engine"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'exams_gradebook'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Award className={`h-4 w-4 shrink-0 ${activeTab === 'exams_gradebook' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Exams &amp; Gradebook</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                    Publish Hub
                  </span>
                )}
              </button>

              {/* 6. Student Roster & 360 */}
              <button
                onClick={() => { setActiveTab('roster'); setMobileDrawerOpen(false); }}
                title="My Students List & 360 Analytics"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'roster'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Users className={`h-4 w-4 shrink-0 ${activeTab === 'roster' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">My Students (8B &amp; 9A)</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">{students.length}</span>
                )}
              </button>
            </div>

            {/* GROUP 4: PARENT & PASTORAL COMMUNICATION */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Parental &amp; Attendance
                </span>
              )}

              {/* 7. PTM Conferences (Strictly Meetings) */}
              <button
                onClick={() => { setActiveTab('parent_hub'); setMobileDrawerOpen(false); }}
                title="Sliding Parent-Teacher Meeting (PTM) Conferences & Timetable"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'parent_hub'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Video className={`h-4 w-4 shrink-0 ${activeTab === 'parent_hub' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">PTM Conferences</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                    24 Oct
                  </span>
                )}
              </button>

              {/* 8. Dedicated Chat with Parents (PRD Requirement) */}
              <button
                onClick={() => { setActiveTab('parent_chat'); setMobileDrawerOpen(false); }}
                title="Direct 1-on-1 Parent Messaging for any student (PRD Feature)"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'parent_chat'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className={`h-4 w-4 shrink-0 ${activeTab === 'parent_chat' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Chat with Parents</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                    PRD
                  </span>
                )}
              </button>

              {/* 8. Student Leave Approvals */}
              <button
                onClick={() => { setActiveTab('leave_approvals'); setMobileDrawerOpen(false); }}
                title="Student Leave Approvals"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'leave_approvals'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CalendarCheck className={`h-4 w-4 shrink-0 ${activeTab === 'leave_approvals' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Student Leave Queue</span>}
                </div>
                {!sidebarCollapsed && pendingLeaves > 0 && (
                  <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                    {pendingLeaves}
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 5: SELF-SERVICE & INSTITUTIONAL GOVERNANCE */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5 block">
                  Duties &amp; Governance
                </span>
              )}

              {/* 8. Event Duties & Operations Center */}
              <button
                onClick={() => { setActiveTab('duties'); setMobileDrawerOpen(false); }}
                title="Consolidated Faculty Duties & Task Operations Center"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'duties'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Award className={`h-4 w-4 shrink-0 ${activeTab === 'duties' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">Faculty Duty Center</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">4 Active</span>
                )}
              </button>

              {/* 9. Teacher Leave & Permissions */}
              <button
                onClick={() => { setActiveTab('my_permissions'); setMobileDrawerOpen(false); }}
                title="My Leave & Short-Permission Requests"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'my_permissions'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock className={`h-4 w-4 shrink-0 ${activeTab === 'my_permissions' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">My Permissions</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Self-Service</span>
                )}
              </button>

              {/* 10. Teacher Salary & Payslips */}
              <button
                onClick={() => { setActiveTab('my_salary'); setMobileDrawerOpen(false); }}
                title="My Monthly Salary & Digital Payslips"
                className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                  activeTab === 'my_salary'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-r-[3px] border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className={`h-4 w-4 shrink-0 ${activeTab === 'my_salary' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">My Payslips</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">Bursar</span>
                )}
              </button>
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
        </div>
      </aside>

      {/* ===================================================== */}
      {/* 2. RIGHT MAIN CONTENT CANVAS (INDEPENDENT SCROLLING) */}
      {/* ===================================================== */}
      <main className="flex-1 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 scrollbar-thin">
        
        {/* Mobile Drawer Trigger (md:hidden) */}
        <div className="flex md:hidden items-center justify-between pb-1">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B101B] text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs"
          >
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </button>
          <span className="text-xs font-bold text-slate-500">Teacher Desk</span>
        </div>

        {/* ===================================================== */}
        {/* TAB 0: TEACHER DASHBOARD (EXECUTIVE OVERVIEW & PULSE) */}
        {/* ===================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* EXECUTIVE TEACHER GREETING & OPERATIONAL CONTEXT BANNER */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left: Greeting & Current Status */}
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-1 text-xs font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Classes Active • Period 2 Class 8-B (09:20 - 10:05 AM)</span>
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium">
                      <Clock className="h-3 w-3 text-emerald-500" />
                      <span>Auto-Attendance Active</span>
                    </span>
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Welcome, Mrs. Ananya Verma!
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Faculty Overview: Homeroom Class 8-B (38 Students) • Secondary Mathematics Department • 6 scheduled periods today with 3 pending items requiring faculty review.
                    </p>
                  </div>

                  {/* Operational Tags */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>Homeroom: <strong className="text-slate-700 dark:text-slate-200">Class 8-B</strong> (38 Students)</span>
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Award className="h-3.5 w-3.5 text-purple-500" />
                      <span>Duty: <strong className="text-slate-700 dark:text-slate-200">Annual Day Stage Lead</strong></span>
                    </span>
                  </div>
                </div>

                {/* Right: Primary & Secondary Action Group */}
                <div className="flex flex-wrap lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0">
                  <button
                    onClick={() => setActiveTab('live_class')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-200 active:scale-98 border border-emerald-400/30 cursor-pointer"
                  >
                    <Radio className="h-4 w-4 animate-pulse" />
                    <span>Start Live Class Session</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPTMModal(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Users className="h-3.5 w-3.5 text-blue-500" />
                      <span>Schedule PTM</span>
                    </button>

                    <button
                      onClick={() => setShowPermissionModal(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Request Permission</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-CARD LIVE KPI STRIP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Real-Time Classroom Attendance */}
              <div
                onClick={() => setActiveTab('live_class')}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Classroom Attendance
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                      <Radio className="h-5 w-5 animate-pulse" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {presentCount} Present
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                        ↑ 94.2%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {lateCount} Late check • 10m auto rule active
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Live Attendance</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* 2. Homework SpeedGrader */}
              <div
                onClick={() => {
                  setActiveTab('homework');
                  handleOpenSpeedGrader(0);
                }}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Homework &amp; Grading
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                      <FileEdit className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {homeworkStats.needsGrading} To Grade
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                        Worksheet #4
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {homeworkStats.submitted} Submitted • {homeworkStats.graded} Graded so far
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.round((homeworkStats.graded / (homeworkStats.total || 38)) * 100)}%` }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Launch SpeedGrader</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* 3. Student Focus Table */}
              <div
                onClick={() => setActiveTab('focus_table')}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Remedial Focus Table
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {focusStats.total} on Plan
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                        ↑ 2.1% Recovery
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {focusStats.needsVerification} pending sign-off • {focusStats.avgProgress}% avg progress
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${focusStats.avgProgress}%` }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Review Focus Roster</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* 4. Parent Queue & Leaves */}
              <div
                onClick={() => setActiveTab('leave_approvals')}
                className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Parent &amp; Leave Queue
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {pendingLeaves} Pending
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                        Review Required
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Aarav Sharma (Medical) • Doctor/Dental
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: pendingLeaves > 0 ? '40%' : '100%' }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Manage Approvals</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

            </div>

              {/* TODAY'S SCHEDULE PULSE & URGENT ACTION PRIORITIES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Today's Teaching Schedule Pulse */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        Today's Agenda
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-500" />
                        Classroom Schedule &amp; Live Timetable (6 Periods)
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Timetable</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {schedule.slice(0, 4).map((item) => (
                      <div
                        key={item.period}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          item.is_live
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-xs'
                            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                            item.is_live
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            <span className="text-[9px] uppercase font-bold">P</span>
                            <span className="font-black leading-none">{item.period}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                {item.subject}
                              </h4>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {item.class_name}
                              </span>
                              {item.is_live && (
                                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                  Live In Session
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                              ⏰ {item.time} • 📍 {item.room}
                            </span>
                          </div>
                        </div>

                        <div>
                          {item.is_live ? (
                            <button
                              onClick={() => setActiveTab('live_class')}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
                            >
                              <Radio className="h-3.5 w-3.5 animate-pulse" />
                              <span>Join Live Studio</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right 1 Col: Urgent Attention Queue */}
                <div className="lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                        Action Required
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Today's Pending Tasks
                      </h3>
                    </div>

                    {/* Task Item 1: Homework */}
                    <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                          Worksheet #4 Grading
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/70 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                          {homeworkStats.needsGrading} Submissions
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Aarav Sharma and 2 others uploaded math homework today.
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab('homework');
                          handleOpenSpeedGrader(0);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Launch SpeedGrader</span>
                      </button>
                    </div>

                    {/* Task Item 2: Leave Request */}
                    <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                          Student Leave
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/70 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                          {pendingLeaves} Pending
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Aarav Sharma requested medical leave for dental checkup.
                      </p>
                      <button
                        onClick={() => setActiveTab('leave_approvals')}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white py-1.5 text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" />
                        <span>Review Student Leave</span>
                      </button>
                    </div>

                    {/* Task Item 3: Remedial Focus */}
                    <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                          Focus Remedial Co-Sign
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                          2 Pending Sign-off
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Kabir Mehta &amp; Rohan Iyer require parent verification.
                      </p>
                      <button
                        onClick={() => setActiveTab('focus_table')}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white py-1.5 text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Open Focus Roster</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              {/* ── ACADEMIC MANDATES & COORDINATOR SLA DELEGATIONS ── */}
              <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/10 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/40 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Academic Mandates &amp; Coordinator SLA Delegations
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {academicTasks.filter(t => (t.assigned_to === 'Mrs. Ananya Verma' || t.assigned_to_role === 'teacher') && t.status !== 'Completed').length} Active
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Remedial intervention plans, rubric audits, and syllabus catchup tasks delegated by the Academic Coordinator
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {academicTasks
                    .filter(t => t.assigned_to === 'Mrs. Ananya Verma' || t.assigned_to_role === 'teacher')
                    .map(task => (
                      <div 
                        key={task.id} 
                        className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 transition-all space-y-3 ${
                          task.relief_requested 
                            ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/30' 
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                task.priority === 'Critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                                task.priority === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {task.priority} Priority
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">• Due: {task.due_date}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{task.title}</h4>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                            'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {task.status}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {task.relief_requested ? (
                          <div className="p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-0.5">
                            <div className="font-bold flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              Workload Relief Requested ({task.relief_reason})
                            </div>
                            <div className="text-[10px] text-amber-800 dark:text-amber-300 italic">
                              SLA is paused pending Coordinator re-assignment. Zero penalty applied.
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              SLA Window: {task.sla_hours || 24} Hours
                            </span>

                            {task.status !== 'Completed' && (
                              <button
                                onClick={() => {
                                  setReliefSelectedTask(task);
                                  setShowReliefModal(true);
                                }}
                                className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>Request Relief / Migration</span>
                              </button>
                            )}
                          </div>
                        )}

                        {task.status !== 'Completed' && !task.relief_requested && (
                          <div className="flex items-center gap-2 pt-1">
                            {task.status !== 'In Progress' && (
                              <button
                                onClick={() => handleUpdateTeacherTaskStatus(task.id, 'In Progress')}
                                className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                              >
                                Mark In Progress
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateTeacherTaskStatus(task.id, 'Completed')}
                              className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                            >
                              Resolve &amp; Submit ✓
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* ── CURRICULUM SYLLABUS DELIVERY (FACULTY CHECKLIST) ── */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Curriculum Syllabus Delivery Checklist
                      </h3>
                      <p className="text-xs text-slate-500">
                        Direct faculty lesson completion log against term benchmarks. 1-click update updates Academic Coordinator audit feed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {curriculumItems.map(item => (
                    <div 
                      key={item.id} 
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.class_name} · {item.subject}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status.toLowerCase().includes('lag')
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.status.toLowerCase().includes('lag') ? 'bg-rose-500' : 'bg-teal-600'
                            }`}
                            style={{ width: `${Math.min(100, item.completion_pct)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span>{item.completed_units}/{item.total_units} Units ({item.completion_pct}%)</span>
                          <span>Target: {item.calendar_target_units} Units</span>
                        </div>

                        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-600 dark:text-slate-300 space-y-0.5">
                          <div><strong>Last Lesson:</strong> {item.last_lesson_title}</div>
                          <div className="text-slate-400">Checkpoint: {item.next_milestone_date}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => setLogUnitCurriculum(item)}
                        className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>✓ Mark Unit Completed (+1 Unit)</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 1: LIVE CLASS & 10-MIN AUTO-ATTENDANCE RULE       */}
          {/* ===================================================== */}
          {activeTab === 'live_class' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">
                      Live Class Studio
                    </span>
                    <span className="text-xs text-slate-500">Virtual Studio A • Class 8B</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Live Class Studio &amp; 10-Minute Auto-Attendance Engine
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Students joining within 10 minutes are auto-marked Present. After 10m, they are flagged Late with 1-click teacher decision.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold">
                    <Radio className="h-3 w-3 animate-ping" />
                    Recording in Cloud HD
                  </span>
                </div>
              </div>

              {/* Live Video Preview & Control Ribbon */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white p-4 space-y-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Video className="h-4 w-4 text-emerald-400" />
                        Teacher Webcam Stream
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                        1080p 60fps
                      </span>
                    </div>

                    <div className="mt-3 aspect-video rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        AV
                      </div>
                      <span className="text-xs font-bold text-white mt-2">Mrs. Ananya Verma</span>
                      <span className="text-[10px] text-slate-400">Class 8-B Mathematics</span>

                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-md text-[10px] font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Mic Active
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Class Duration:</span>
                      <span className="font-bold text-white font-mono">24m : 18s / 45m</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Enrolled Students:</span>
                      <span className="font-bold text-emerald-400">38 Registered</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Auto-Attendance:</span>
                      <span className="font-bold text-emerald-400">T0 + 10m Rule</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Simulator & Roster Engine */}
                <div className="lg:col-span-2">
                  <AttendanceSimulator
                    records={attendance}
                    onSimulateJoin={handleSimulateJoin}
                    onOverride={handleOverrideAttendance}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 2: TEACHER-CENTRIC PERSONAL TIMETABLE            */}
          {/* ===================================================== */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-bold border border-blue-200">
                      Teacher Personal Cockpit
                    </span>
                    <span className="text-xs text-slate-500">Academic Year 2026-27 • Mrs. Ananya Verma</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Teacher-Centric Personal Timetable
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chronological daily schedule across your own classes, STEM computing labs, free prep periods, and assigned exam invigilations.
                  </p>
                </div>

                {/* Day of Week Selector */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <button
                      key={day}
                      onClick={() => handleDaySelect(day)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        selectedScheduleDay === day
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule Operational Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                    Teaching Sessions
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {personalSchedule.filter(s => s.activity_type === 'TEACHING_SESSION').length}
                    </span>
                    <span className="text-[11px] text-slate-500">periods</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/20">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                    Lab Sessions
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {personalSchedule.filter(s => s.activity_type === 'LAB_SESSION').length}
                    </span>
                    <span className="text-[11px] text-slate-500">STEM lab</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                    Exam Invigilation
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {personalSchedule.filter(s => s.activity_type === 'EXAM_INVIGILATION').length}
                    </span>
                    <span className="text-[11px] text-slate-500">duty</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Free Prep / Resource
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {personalSchedule.filter(s => s.activity_type === 'FREE_PREP_PERIOD').length}
                    </span>
                    <span className="text-[11px] text-slate-500">periods</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    Substitution Cover
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {personalSchedule.filter(s => s.activity_type === 'SUBSTITUTION_COVER').length}
                    </span>
                    <span className="text-[11px] text-slate-500">period</span>
                  </div>
                </div>
              </div>

              {/* Personal Chronological Schedule List */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Personal Chronological Day Schedule — {selectedScheduleDay}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Faculty Hours: 08:30 AM – 03:00 PM
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {personalSchedule.map((item) => {
                    const isTeaching = item.activity_type === 'TEACHING_SESSION';
                    const isLab = item.activity_type === 'LAB_SESSION';
                    const isInvigilation = item.activity_type === 'EXAM_INVIGILATION';
                    const isFree = item.activity_type === 'FREE_PREP_PERIOD';
                    const isSub = item.activity_type === 'SUBSTITUTION_COVER';
                    const isMentorship = item.activity_type === 'HOMEROOM_MENTORSHIP';

                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          item.is_current_active_period 
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600 shadow-xs' 
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-start gap-4 flex-1">
                          {/* Period Badge */}
                          <div className={`h-12 w-12 rounded-2xl flex flex-col items-center justify-center font-bold shrink-0 ${
                            item.is_current_active_period
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                              : isInvigilation
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : isLab
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                              : isFree
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : isSub
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : isMentorship
                              ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            <span className="text-[9px] uppercase font-bold">Per</span>
                            <span className="text-base font-black">{item.period_number}</span>
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Title / Subject */}
                              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                {item.subject_name || (isFree ? 'Free / Prep & Curriculum Planning' : 'Instructional Period')}
                              </h4>

                              {/* Class Pill */}
                              {item.class_grade && (
                                <span className="rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                                  {item.class_grade} {item.section !== 'All' ? `- ${item.section}` : ''}
                                </span>
                              )}

                              {/* Activity Badge */}
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                isTeaching
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                                  : isLab
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                                  : isInvigilation
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                                  : isFree
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                  : isMentorship
                                  ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                              }`}>
                                {isTeaching && 'Teaching Session'}
                                {isLab && 'Applied STEM Lab'}
                                {isInvigilation && 'Exam Invigilation Duty'}
                                {isFree && 'Free Prep Period'}
                                {isSub && 'Substitution Coverage'}
                                {isMentorship && 'Homeroom Mentorship'}
                              </span>

                              {/* Current Active Pulse with Live Timer */}
                              {item.is_current_active_period && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-700 shadow-xs animate-pulse">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                  <span>Active Now • {Math.floor(scheduleActivePeriodSeconds / 60)}m {String(scheduleActivePeriodSeconds % 60).padStart(2, '0')}s remaining</span>
                                </span>
                              )}
                            </div>

                            {/* Time & Venue */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1 font-mono font-semibold">
                                ⏰ {item.start_time} – {item.end_time}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                📍 {item.room_number}
                              </span>
                            </div>

                            {/* Personal Notes */}
                            {item.notes && (
                              <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-1.5 border border-slate-200/80 dark:border-slate-800">
                                <span className="font-bold text-slate-500 dark:text-slate-400 mr-1.5">Agenda:</span>
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isTeaching || isLab ? (
                            <button
                              onClick={() => setActiveTab('live_class')}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer transition-transform active:scale-95"
                            >
                              <Radio className="h-3.5 w-3.5 animate-pulse" />
                              <span>Open Live Studio</span>
                            </button>
                          ) : isFree ? (
                            <button
                              onClick={() => setActiveTab('focus_table')}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Focus Table Queue</span>
                            </button>
                          ) : isInvigilation ? (
                            <button
                              onClick={() => {
                                setActiveDutySegment('EXAM_INVIGILATION');
                                setActiveTab('duties');
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Invigilation Details</span>
                            </button>
                          ) : isMentorship ? (
                            <button
                              onClick={() => setActiveTab('focus_table')}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer"
                            >
                              <Users className="h-3.5 w-3.5" />
                              <span>Mentorship Roster</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => triggerToast(`Substitution instructions logged for ${item.room_number}`)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold cursor-pointer"
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>Lesson Worksheet</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TASK 1: HOMEWORK SUBMISSIONS ROSTER & SPEEDGRADER     */}
          {/* ===================================================== */}
          {activeTab === 'homework' && (
            <div className="space-y-6">
              
              {/* Assignment Header Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                        Class 8-B
                      </span>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-bold">
                        Mathematics
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Due Date: Today, 05:00 PM
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      Quadratic Equations Worksheet #4: Factorization &amp; Roots
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Standard splitting method, signs verification, and word problems. Submissions are graded directly using in-browser SVG annotations.
                    </p>
                  </div>

                  {/* Primary Trigger to start grading first pending student */}
                  <button
                    onClick={() => {
                      const firstPendingIdx = homeworkList.findIndex(h => h.status === 'Submitted');
                      handleOpenSpeedGrader(firstPendingIdx !== -1 ? firstPendingIdx : 0);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer self-start lg:self-auto shrink-0"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Launch SpeedGrader Canvas</span>
                  </button>
                </div>

                {/* Quick Stats Pill Chips */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Total Enrolled:</span>
                    <span>{homeworkStats.total}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Submitted: {homeworkStats.submitted}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Graded: {homeworkStats.graded}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span>Needs Grading: {homeworkStats.needsGrading}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Missing: {homeworkStats.missing}</span>
                  </div>
                </div>
              </div>

              {/* Roster Controls: Search & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={homeworkSearch}
                    onChange={(e) => setHomeworkSearch(e.target.value)}
                    placeholder="Search by student, roll number, or admission ID..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(['All', 'Needs Grading', 'Graded', 'Missing'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setHomeworkFilter(filter)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        homeworkFilter === filter
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Submissions Data Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Roll</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Submission Info</th>
                        <th className="py-3 px-4 text-center">Score</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredHomework.map((hw, idx) => {
                        const originalIndex = homeworkList.findIndex(h => h.id === hw.id);
                        return (
                          <tr 
                            key={hw.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            {/* Roll No */}
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                              #{hw.roll_no}
                            </td>

                            {/* Student Info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold shrink-0">
                                  {hw.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">
                                    {hw.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">
                                    {hw.admission_id}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                hw.status === 'Graded'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
                                  : hw.status === 'Submitted'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900 animate-pulse'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  hw.status === 'Graded' ? 'bg-emerald-500' : hw.status === 'Submitted' ? 'bg-blue-500' : 'bg-rose-500'
                                }`} />
                                {hw.status === 'Submitted' ? 'Needs Grading' : hw.status}
                              </span>
                            </td>

                            {/* Submission Info */}
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                              {hw.status !== 'Missing' ? (
                                <div>
                                  <span className="font-medium text-slate-800 dark:text-slate-200 block">
                                    {hw.file_name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">
                                    {hw.submission_time} • {hw.file_size}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">No document uploaded</span>
                              )}
                            </td>

                            {/* Score */}
                            <td className="py-3.5 px-4 text-center">
                              {hw.score !== undefined ? (
                                <span className="font-black text-slate-900 dark:text-white">
                                  {hw.score} <span className="text-slate-400 font-normal">/ {hw.max_score}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400">-- / {hw.max_score}</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              {hw.status === 'Submitted' && (
                                <button
                                  onClick={() => handleOpenSpeedGrader(originalIndex)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                  <span>Evaluate Work</span>
                                </button>
                              )}

                              {hw.status === 'Graded' && (
                                <button
                                  onClick={() => handleOpenSpeedGrader(originalIndex)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Review &amp; Adjust</span>
                                </button>
                              )}

                              {hw.status === 'Missing' && (
                                <button
                                  onClick={() => handleRemindMissingStudent(hw.name)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                                >
                                  <Bell className="h-3.5 w-3.5" />
                                  <span>Send Reminder</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredHomework.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    No submissions matching your filter criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* EXAMS & MARKS ENTRY MODULE                            */}
          {/* ===================================================== */}
          {/* MODAL: EXAMS & MARKS ENTRY LEDGER (From Duties Queue) */}
          {dutyScoringModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex items-center justify-end pb-1">
                  <button onClick={() => setDutyScoringModalOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              
              {/* Header Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-0.5 text-xs font-bold border border-purple-200 dark:border-purple-800">
                        {currentExamConfig.class_name}
                      </span>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-bold">
                        {currentExamConfig.subject}
                      </span>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                        <CheckSquare className="h-3 w-3" />
                        {currentExamConfig.status}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Conducted: {currentExamConfig.date}
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {currentExamConfig.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter and review theory and internal marks. Scores &le; 70% automatically link to the student&apos;s remedial Focus Table plan.
                    </p>
                  </div>

                  {/* Actions Header */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
                    <button
                      onClick={handleFlagAllUnderperformingToFocusTable}
                      title="Automatically sync all students scoring 70% or below into Focus Table remedial queues"
                      className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2.5 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Sync &le; 70% to Focus Table</span>
                    </button>

                    <button
                      onClick={handleSaveExamRoster}
                      className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Publish &amp; Save Marks</span>
                    </button>
                  </div>
                </div>

                {/* Exam Cycle Selector Chips */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-xs font-bold text-slate-500 mr-1">Select Exam:</span>
                    {examConfigs.map(exam => (
                      <button
                        key={exam.id}
                        onClick={() => setSelectedExamId(exam.id)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          selectedExamId === exam.id
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {exam.title.split(':')[0]}
                      </button>
                    ))}
                  </div>

                  <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <span>Theory Max: <strong className="text-slate-800 dark:text-white">{currentExamConfig.max_theory}</strong></span>
                    <span>•</span>
                    <span>Internal Max: <strong className="text-slate-800 dark:text-white">{currentExamConfig.max_internal}</strong></span>
                    <span>•</span>
                    <span>Total: <strong className="text-purple-600 dark:text-purple-400">{currentExamConfig.max_theory + currentExamConfig.max_internal} Marks</strong></span>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/20">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                      Class Average Score
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {examStats.averagePct}%
                      </span>
                      <span className="text-xs text-slate-500">overall</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      Highest Score
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {examStats.topScore} / {currentExamConfig.max_theory + currentExamConfig.max_internal}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">Tanvi (98%)</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                      Pass Percentage
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {Math.round((examStats.passCount / examStats.totalStudents) * 100)}%
                      </span>
                      <span className="text-xs text-slate-500">({examStats.passCount}/{examStats.totalStudents} passed)</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                      Remedial Interventions
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        {examStats.remedialCount}
                      </span>
                      <span className="text-xs text-slate-500">students &lt; 60%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls: Search, Filters & Bulk Export */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    placeholder="Search by student name, roll # or ID..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Grade Filters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {(['All', 'A+ & A', 'Passing', 'Needs Focus'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setExamGradeFilter(filter)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                          examGradeFilter === filter
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={examCsvInputRef}
                      accept=".csv"
                      onChange={handleUploadExamCsv}
                      className="hidden"
                    />
                    <button
                      onClick={() => examCsvInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-bold cursor-pointer transition-all"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Import CSV</span>
                    </button>

                    <button
                      onClick={handleDownloadExamCsv}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Marks Ledger Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Roll</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Theory (/ {currentExamConfig.max_theory})</th>
                        <th className="py-3 px-4">Internal (/ {currentExamConfig.max_internal})</th>
                        <th className="py-3 px-4">Total Score</th>
                        <th className="py-3 px-4">Percentage</th>
                        <th className="py-3 px-4">Grade</th>
                        <th className="py-3 px-4">Focus Table Remedial</th>
                        <th className="py-3 px-4 text-right">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredExamScores.map(student => {
                        const totalScore = student.theory_score + student.internal_score;
                        const maxTotal = student.max_theory + student.max_internal;
                        const pct = Math.round((totalScore / maxTotal) * 100);

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-500">
                              #{student.roll_no}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {student.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {student.admission_id}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min={0}
                                max={student.max_theory}
                                value={student.theory_score}
                                onChange={(e) => handleUpdateExamScore(student.id, 'theory_score', parseInt(e.target.value) || 0)}
                                className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 text-center"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min={0}
                                max={student.max_internal}
                                value={student.internal_score}
                                onChange={(e) => handleUpdateExamScore(student.id, 'internal_score', parseInt(e.target.value) || 0)}
                                className="w-16 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 text-center"
                              />
                            </td>
                            <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                              {totalScore} <span className="text-[10px] text-slate-400 font-normal">/ {maxTotal}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                                  {pct}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                                student.grade === 'A+' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300' :
                                student.grade === 'A' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' :
                                student.grade === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                student.grade === 'C' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                              }`}>
                                {student.grade}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {student.in_focus_table ? (
                                <button
                                  onClick={() => setActiveTab('focus_table')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-[10px] font-bold hover:bg-amber-100 cursor-pointer"
                                >
                                  <Sparkles className="h-3 w-3 text-amber-500" />
                                  <span>Active Remedial Plan ✓</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setExamScores(prev => prev.map(s => s.id === student.id ? { ...s, in_focus_table: true } : s));
                                    triggerToast(`Enrolled ${student.name} into Focus Table!`);
                                  }}
                                  className="text-[10px] text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-semibold cursor-pointer underline decoration-dotted"
                                >
                                  + Add to Plan
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] inline-block" title={student.teacher_note}>
                                {student.teacher_note}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredExamScores.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    No student marks found for the selected filter.
                  </div>
                )}
              </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  <span>Batch: Grade 10 Midterm Mathematics (45 Candidates)</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDutyScoringModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">Cancel</button>
                    <button onClick={() => { handleSaveExamRoster(); setDutyScoringModalOpen(false); }} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md cursor-pointer"><Save className="h-4 w-4" /><span>Publish &amp; Return to Duties</span></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TASK 2: SUBJECT-BASED AI FOCUS TABLE & 1-WEEK PLANS  */}
          {/* ===================================================== */}
          {activeTab === 'focus_table' && (
            <div className="space-y-6">
              
              {/* Header Title with AI Exam Scan Badge & Mathematics Subject Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-500 text-white px-3 py-0.5 text-xs font-black shadow-2xs flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Subject: Mathematics</span>
                    </span>
                    <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2.5 py-0.5 text-xs font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-600" />
                      AI Exam Paper Diagnostic
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                      1-Week Targeted Action Plans
                    </span>
                    <span className="text-xs text-slate-500">Secondary Department &bull; Academic Year 2026</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    Mathematics Focus Table &amp; 1-Week Remedial Intelligence
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Based on Mid-Term Exam performance, AI scans papers to diagnose root misconceptions and prescribes a 1-week focused practice sprint across your assigned class sections.
                  </p>
                </div>

                {/* Batch Action Button */}
                {focusStats.needsVerification > 0 && (
                  <button
                    onClick={handleQuickVerifyAll}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
                    title="Batch verify all clean pending remedial solution uploads"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>⚡ Quick Verify All Validated ({focusStats.needsVerification})</span>
                  </button>
                )}
              </div>

              {/* Section Scope Selector Tabs (Sections the teacher deals with) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-amber-500" />
                    Assigned Section:
                  </span>
                  {(['Class 8-B', 'Class 8-A', 'Class 9-A', 'Class 9-B', 'All'] as const).map(sec => {
                    const count = sec === 'All' ? focusRoster.length : focusRoster.filter(f => f.class_name === sec).length;
                    const isSelected = focusSectionFilter === sec;
                    const label = sec === 'All' ? 'All Sections' : sec === 'Class 8-B' ? 'Class 8-B (Homeroom)' : sec;
                    return (
                      <button
                        key={sec}
                        onClick={() => setFocusSectionFilter(sec)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {count} on Plan
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* View Mode Toggle: Cards vs Table */}
                <div className="flex items-center self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                  <button
                    onClick={() => setFocusViewMode('cards')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      focusViewMode === 'cards'
                        ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Cards View</span>
                  </button>
                  <button
                    onClick={() => setFocusViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      focusViewMode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    <span>Table View</span>
                  </button>
                </div>
              </div>

              {/* Section Diagnostic Benchmark Overview Banner */}
              {(() => {
                const secKey = focusSectionFilter;
                const metrics = CLASS_SECTION_METRICS[secKey] || CLASS_SECTION_METRICS['Class 8-B'];
                const improvementBatchCount = secKey === 'All' 
                  ? focusRoster.length 
                  : focusRoster.filter(f => f.class_name === secKey).length;
                return (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {secKey === 'All' ? 'All Assigned Sections Mathematics Benchmark' : `${metrics.section} Mathematics Diagnostic Benchmark`}
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500 font-medium">{metrics.exam_name}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Threshold: &gt;70% Score is Exempt from Remedials</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Section Strength</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">{metrics.total_students} Students</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Mastered (&gt;70%)</span>
                        <span className="text-lg font-black text-emerald-800 dark:text-emerald-200">{metrics.passed_mastery} Students ({metrics.mastery_percentage}%)</span>
                        <span className="text-[10px] text-emerald-600 block">Exempt from focus plan</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                        <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Improvement Batch (&le;70%)</span>
                        <span className="text-lg font-black text-amber-900 dark:text-amber-100">
                          {improvementBatchCount} Students
                        </span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 block">Active 1-Week Plans</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Section Average</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">{metrics.avg_score}%</span>
                        <span className="text-[10px] text-slate-400 block">In {metrics.exam_name.split(' ')[0]} Exam</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 mr-1">Status:</span>
                  {(['All', 'Needs Verification', 'Verified', 'Pending Submission'] as const).map(tab => {
                    const count = tab === 'All' ? filteredFocus.length
                      : tab === 'Needs Verification' ? filteredFocus.filter(f => f.submission_status === 'Submitted').length
                      : tab === 'Verified' ? filteredFocus.filter(f => f.submission_status === 'Verified').length
                      : filteredFocus.filter(f => f.submission_status === 'Pending' || !f.submission_status).length;
                    return (
                      <button
                        key={tab}
                        onClick={() => setFocusSubmissionFilter(tab)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                          focusSubmissionFilter === tab
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{tab}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          focusSubmissionFilter === tab
                            ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={focusSearch}
                    onChange={(e) => setFocusSearch(e.target.value)}
                    placeholder="Search student, weak concept, or topic..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                  />
                </div>
              </div>

              {/* RENDER MODE 1: PROPER & CLEAR CARDS VIEW (DEFAULT) */}
              {focusViewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredFocus.map((item) => {
                    const progressPct = Math.round((item.current_day / item.total_days) * 100);
                    const weakConcept = item.ai_exam_scan?.weak_concept || item.weak_concept || 'Concept Gap';

                    return (
                      <div
                        key={item.id}
                        className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-200 flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3.5">
                          {/* Student Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 font-black text-sm flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
                                {item.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div>
                                <Link
                                  href={`/teacher/focus/${item.student_id}`}
                                  className="text-sm font-black text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors block leading-tight"
                                >
                                  {item.name}
                                </Link>
                                <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                                  Roll #{item.roll_no} • {item.class_name} • <strong className="text-slate-700 dark:text-slate-300">{item.subject}</strong>
                                </span>
                              </div>
                            </div>

                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border shrink-0 bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900">
                              Exam: {item.exam_score_pct || item.current_score_pct}% (&le;70%)
                            </span>
                          </div>

                          {/* AI Exam Diagnostic Box */}
                          <div className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-amber-500" />
                                AI Exam Diagnosis
                              </span>
                              <span className="font-mono text-[10px] text-slate-500">
                                Target: <strong className="text-emerald-600 font-bold">&gt;70% ({item.target_score_pct}%)</strong>
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug">
                              {weakConcept}
                            </p>
                            {item.ai_exam_scan?.diagnostic_summary && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                {item.ai_exam_scan.diagnostic_summary}
                              </p>
                            )}
                          </div>

                          {/* 1-Week (7-Day) Progress Bar */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-500 dark:text-slate-400">
                                1-Week Remedial Sprint
                              </span>
                              <span className="font-bold text-amber-600 dark:text-amber-400">
                                Day {item.current_day} of {item.total_days} ({progressPct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Badges: Submission & Guardian Status */}
                          <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                            {item.submission_status === 'Submitted' ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 font-bold">
                                <Clock className="h-3 w-3" />
                                <span>Day {item.current_day} Solution Uploaded</span>
                              </span>
                            ) : item.submission_status === 'Verified' ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 font-bold">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Day {item.current_day} Verified ✓</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 font-medium">
                                <Clock className="h-3 w-3" />
                                <span>Pending Upload (Day {item.current_day})</span>
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 font-medium">
                              {item.parent_status}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer: Navigation to Dedicated 1-Week Plan */}
                        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <Link
                            href={`/teacher/focus/${item.student_id}`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 text-xs font-bold shadow-xs transition-transform active:scale-98"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Open 1-Week Plan &rarr;</span>
                          </Link>

                          <button
                            onClick={() => {
                              setSelectedChatStudentId(item.student_id);
                              setActiveTab('parent_chat');
                              triggerToast(`Opened chat thread with ${item.parent_name}`);
                            }}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title={`Chat with ${item.parent_name}`}
                          >
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* RENDER MODE 2: TABLE VIEW */}
              {focusViewMode === 'table' && (
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Section &amp; Exam Score</th>
                          <th className="py-3 px-4">AI-Diagnosed Weak Concept</th>
                          <th className="py-3 px-4">1-Week Sprint Progress</th>
                          <th className="py-3 px-4">Rough Work Verification</th>
                          <th className="py-3 px-4">Parent Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredFocus.map((item) => {
                          const progressPct = Math.round((item.current_day / item.total_days) * 100);
                          const weakConcept = item.ai_exam_scan?.weak_concept || item.weak_concept || 'Concept Gap';

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold shrink-0">
                                    {item.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                  </div>
                                  <div>
                                    <Link
                                      href={`/teacher/focus/${item.student_id}`}
                                      className="font-bold text-slate-900 dark:text-white hover:text-amber-600 transition-colors block"
                                    >
                                      {item.name}
                                    </Link>
                                    <span className="text-[10px] text-slate-400 block">
                                      Roll #{item.roll_no} • {item.class_name}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-900 dark:text-white block">
                                    {item.class_name}
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300">
                                    {item.exam_score_pct || item.current_score_pct}% (&le;70%)
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 max-w-xs">
                                <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                                  {weakConcept}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                                  Target: &gt;70% ({item.target_score_pct}%)
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="w-32 space-y-1">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                      Day {item.current_day} of {item.total_days}
                                    </span>
                                    <span className="font-bold text-amber-600 dark:text-amber-400">{progressPct}%</span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-amber-500 transition-all duration-300"
                                      style={{ width: `${progressPct}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                {item.submission_status === 'Submitted' ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold border border-amber-300 dark:border-amber-800">
                                    <Clock className="h-3 w-3" />
                                    Submitted (Review)
                                  </span>
                                ) : item.submission_status === 'Verified' ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Verified ✓
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                                    <Clock className="h-3 w-3" />
                                    Pending (Day {item.current_day})
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {item.parent_status}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Link
                                    href={`/teacher/focus/${item.student_id}`}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all active:scale-95"
                                  >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Open 1-Week Plan</span>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {filteredFocus.length === 0 && (
                <div className="p-8 text-center text-slate-500 space-y-2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto opacity-60" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    All students in {focusSectionFilter === 'All' ? 'all assigned sections' : focusSectionFilter} scored above the 70% mastery threshold!
                  </p>
                  <p className="text-[11px] text-slate-400">
                    No students currently require a 1-week remedial focus plan for this section.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 3B: TERMINAL EXAMS & GRADEBOOK PUBLISHING ENGINE   */}
          {/* ===================================================== */}
          {activeTab === 'exams_gradebook' && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                      Upstream Trigger Engine
                    </span>
                    <span className="text-xs text-slate-500">Subject: Mathematics (Mrs. Ananya Verma)</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                    Terminal Exams &amp; Gradebook Publishing Engine
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Evaluates candidate scores. Publishing marks automatically invokes the <strong>MarksPublishedEvent</strong> hook to enroll students scoring &le; 70% into the 1-Week Remedial Sprint.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowOcrModal(true);
                      setOcrStep('upload');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3.5 py-2 text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>📸 AI Scan Physical Marksheet</span>
                  </button>
                  <button
                    onClick={loadExams}
                    disabled={isLoadingExams}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingExams ? 'animate-spin' : ''}`} />
                    <span>Refresh Gradebook</span>
                  </button>
                </div>
              </div>

              {/* SUB-TAB TOGGLE: MARKS LEDGER VS QUESTION PAPER DRAFTING DESK */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExamSubTab('marks_ledger')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      examSubTab === 'marks_ledger'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>📊 Marks Entry &amp; Gradebook Publishing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamSubTab('qp_desk')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer relative ${
                      examSubTab === 'qp_desk'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>📝 Question Paper Drafting Desk</span>
                    {teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                        {teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length} Action
                      </span>
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-500">
                  Academic Gate: <strong className="text-slate-800 dark:text-slate-200">Dean Rajeshwari Nair</strong>
                </div>
              </div>

              {/* TAB CONTENT 1: MARKS LEDGER */}
              {examSubTab === 'marks_ledger' && (
                <div className="space-y-6">
                  {/* Alert banner if any question papers need action */}
                  {teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length > 0 && (
                    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/90 to-purple-50/60 dark:from-indigo-950/40 dark:to-purple-950/30 p-3.5 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 dark:text-white">
                            {teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length} Question Paper Blueprint(s) Commissioned &amp; Awaiting Design
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400">
                            Academic Coordinator assigned syllabus specifications &amp; Bloom&apos;s quotas. Please upload drafts prior to scheduled due date.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setExamSubTab('qp_desk')}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <span>Open Drafting Desk</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Exam Selector Pills */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Select Exam:</span>
                {examsList.map((ex) => {
                  const isSelected = ex.id === activePublishExamId;
                  return (
                    <button
                      key={ex.id}
                      onClick={() => handleSelectExam(ex.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Award className="h-3.5 w-3.5" />
                      <span>{ex.title}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        ex.is_published 
                          ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30' 
                          : 'bg-amber-500/20 text-amber-100 border border-amber-400/30'
                      }`}>
                        {ex.is_published ? 'Published ✓' : 'Draft ⏳'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Exam Information & Metric Cards */}
              {(() => {
                const activeExam = examsList.find(e => e.id === activePublishExamId) || examsList[0];
                if (!activeExam) return null;
                const totalSubs = examSubmissionsList.length;
                const remedialCount = examSubmissionsList.filter(s => s.percentage !== null && s.percentage !== undefined && s.percentage <= activeExam.remedial_threshold_pct).length;
                const exemptCount = totalSubs - remedialCount;

                return (
                  <div className="space-y-6">
                    {/* KPI Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Evaluation Target</span>
                        <div className="text-sm font-black text-slate-900 dark:text-white truncate">{activeExam.title}</div>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{activeExam.class_name}-{activeExam.section} • Total: {activeExam.total_marks} Marks</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Papers Graded</span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{totalSubs} Students</div>
                        <span className="text-xs text-slate-500">100% evaluated with teacher rubric</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">Remedial Trigger Candidates</span>
                        <div className="text-2xl font-black text-rose-700 dark:text-rose-300">{remedialCount} Slow-Learners</div>
                        <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Scoring &le; {activeExam.remedial_threshold_pct}% benchmark</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Mastery Exemption</span>
                        <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{exemptCount} Students</div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Above 70% Mastery Threshold</span>
                      </div>
                    </div>

                    {/* Published Event Confirmation Banner */}
                    {publishSuccessBanner && (
                      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="h-6 w-6 text-white" />
                            <h3 className="text-base font-black">
                              MARKS PUBLISHED &amp; REMEDIAL ROSTER TRIGGERED!
                            </h3>
                          </div>
                          <span className="text-xs font-mono bg-black/20 px-2.5 py-1 rounded-lg">
                            Event: MarksPublishedEvent ✓
                          </span>
                        </div>
                        <p className="text-xs text-emerald-100 leading-relaxed">
                          Published results for <strong>{publishSuccessBanner.exam_title}</strong>. Successfully identified <strong>{publishSuccessBanner.remedial_enrolled_count} students</strong> scoring below 70% and provisioned their 7-day personalized remedial sprint with diagnostic lag synthesis.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            onClick={() => setActiveTab('focus_table')}
                            className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-all cursor-pointer shadow-xs"
                          >
                            Open Student Focus Table View &rarr;
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submissions & Gradebook Table */}
                    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Student Marksheet &amp; Descriptive Paper Roster
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Official exam grades and attached student descriptive answer sheets.
                          </p>
                        </div>
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          Class: {activeExam.class_name}-{activeExam.section}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                              <th className="py-3 px-4">Roll</th>
                              <th className="py-3 px-4">Student</th>
                              <th className="py-3 px-4">Answer Sheet Document</th>
                              <th className="py-3 px-4">Marks Obtained</th>
                              <th className="py-3 px-4">Percentage</th>
                              <th className="py-3 px-4">Remedial Focus Pipeline</th>
                              <th className="py-3 px-4">Teacher Pedagogical Remarks</th>
                              <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {examSubmissionsList.map((sub) => {
                              const isRemedial = sub.percentage !== null && sub.percentage !== undefined && sub.percentage <= activeExam.remedial_threshold_pct;
                              return (
                                <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                  <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                                    {sub.roll_no}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-bold text-slate-900 dark:text-white">
                                      {sub.student_name}
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                      {sub.class_name}-{sub.section}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <a
                                      href={sub.paper_file_url || '/samples/math_exam_sample.svg'}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-[11px]"
                                    >
                                      <FileText className="h-3.5 w-3.5" />
                                      <span>{sub.paper_file_name || 'Descriptive_Paper.pdf'}</span>
                                    </a>
                                  </td>
                                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                                    {sub.marks_obtained !== null ? `${sub.marks_obtained} / ${activeExam.total_marks}` : '--'}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className={`font-black text-xs ${
                                      isRemedial ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                      {sub.percentage !== null ? `${sub.percentage}%` : '--'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    {isRemedial ? (
                                      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300">
                                        <AlertTriangle className="h-3 w-3 shrink-0" />
                                        <span>Enrolled in Focus Sprint (&le;70%)</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
                                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                                        <span>Exempt (&gt;70% Mastery)</span>
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400 italic text-[11px]">
                                    {sub.teacher_feedback || 'Needs bracket multiplication review.'}
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <button
                                      onClick={() => {
                                        setEditingExamSubmission(sub);
                                        setEditExamMarks(sub.marks_obtained || 50);
                                        setEditExamFeedback(sub.teacher_feedback || '');
                                      }}
                                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[11px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                                    >
                                      Edit Marks
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Publishing Action Footer */}
                      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-0.5 max-w-xl">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {activeExam.is_published 
                              ? `✓ Officially Published on ${activeExam.published_at ? new Date(activeExam.published_at).toLocaleDateString() : 'Active Term'}`
                              : 'Pending Teacher Final Approval & Gradebook Publication'
                            }
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Publishing triggers the automated <strong>MarksPublishedEvent</strong> pipeline. All students scoring &le; {activeExam.remedial_threshold_pct}% are immediately enrolled in the 1-Week Remedial Focus Table.
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            disabled={isPublishingExam}
                            onClick={() => handlePublishExam(activeExam.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                          >
                            <Award className="h-4 w-4" />
                            <span>
                              {isPublishingExam 
                                ? 'Executing MarksPublishedEvent...' 
                                : activeExam.is_published 
                                ? 'Re-Publish & Sync Focus Table' 
                                : 'Publish Results & Auto-Enroll (<70%)'
                              }
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Inline Modal: Edit Submission Marks */}
              {editingExamSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
                  <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Edit Marks: {editingExamSubmission.student_name}
                        </h3>
                        <span className="text-xs text-slate-500">Roll #{editingExamSubmission.roll_no} • {editingExamSubmission.class_name}-{editingExamSubmission.section}</span>
                      </div>
                      <button
                        onClick={() => setEditingExamSubmission(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block">Marks Obtained (out of 100):</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editExamMarks}
                          onChange={(e) => setEditExamMarks(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                        />
                        <span className="text-[11px] text-slate-500">
                          Threshold status: {editExamMarks <= 70 ? '⚠️ Enrolls in 1-Week Remedial Sprint (<= 70%)' : '✓ Exempt (> 70%)'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block">Teacher Pedagogical Feedback:</label>
                        <textarea
                          rows={3}
                          value={editExamFeedback}
                          onChange={(e) => setEditExamFeedback(e.target.value)}
                          placeholder="Note down specific algebraic deficiency (e.g. bracket sign distribution)..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setEditingExamSubmission(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveExamMarks}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-xs cursor-pointer"
                      >
                        Save Marks
                      </button>
                    </div>
                  </div>
                </div>
              )}
                </div>
              )}

              {/* ── TAB CONTENT 2: QUESTION PAPER DRAFTING DESK ── */}
              {examSubTab === 'qp_desk' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Workflow Architecture Stepper */}
                  <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-slate-50/50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/50 p-5 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100 dark:border-indigo-900/40 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-2xs">
                            Academic Dean Pipeline
                          </span>
                          <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold">
                            Institutional Examination Office
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                          Question Paper Drafting &amp; Secrecy Vault Desk
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Subject teachers author confidential blueprints commissioned by Academic Coordinator (Prof. Rajeshwari Nair), submit draft papers and answer schemes, and receive revision requests or final approval for the Exam Secrecy Vault.
                        </p>
                      </div>

                      <button
                        onClick={loadExams}
                        disabled={isLoadingExams}
                        className="self-start md:self-auto inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoadingExams ? 'animate-spin' : ''}`} />
                        <span>Refresh Desk</span>
                      </button>
                    </div>

                    {/* 4-Step Visual Stepper */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-950 flex items-start gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                          1
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-900 dark:text-white">Blueprint Order</div>
                          <div className="text-[10px] text-slate-500">Dean sets syllabus &amp; Bloom&apos;s quotas</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-indigo-100/60 dark:bg-indigo-950/70 border border-indigo-300 dark:border-indigo-800 flex items-start gap-2.5 ring-2 ring-indigo-500/30">
                        <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          2
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-indigo-900 dark:text-indigo-200">Teacher Authoring</div>
                          <div className="text-[10px] text-indigo-700 dark:text-indigo-300">Design paper + official answer key</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-950 flex items-start gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-black text-xs flex items-center justify-center shrink-0">
                          3
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-900 dark:text-white">Academic Audit</div>
                          <div className="text-[10px] text-slate-500">Sign-off or revision request</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-950 flex items-start gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                          4
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-900 dark:text-white">Secrecy Vault</div>
                          <div className="text-[10px] text-slate-500">Encrypted print packet for Exam Cell</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metric Stat Tiles */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Commissioned Blueprints</span>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">{teacherQpList.length} Papers</div>
                      <span className="text-[11px] text-slate-500">Assigned by Academic Office</span>
                    </div>

                    <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Action Required</span>
                      <div className="text-2xl font-black text-amber-800 dark:text-amber-300">
                        {teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length} Pending
                      </div>
                      <span className="text-[11px] text-amber-700 dark:text-amber-400">
                        {teacherQpList.filter(p => p.status === 'revision_requested').length} revisions requested
                      </span>
                    </div>

                    <div className="p-4 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Under Academic Review</span>
                      <div className="text-2xl font-black text-blue-800 dark:text-blue-300">
                        {teacherQpList.filter(p => p.status === 'under_review').length} In Audit
                      </div>
                      <span className="text-[11px] text-blue-700 dark:text-blue-400">Awaiting Dean sign-off</span>
                    </div>

                    <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Approved / In Vault</span>
                      <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300">
                        {teacherQpList.filter(p => p.status === 'approved' || p.status === 'sent_to_exam_cell').length} Sealed
                      </div>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Secrecy vault locked 🔒</span>
                    </div>
                  </div>

                  {/* Filter Pills Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                      <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Filter Papers:</span>
                      {[
                        { id: 'all', label: 'All Commissioned', count: teacherQpList.length },
                        { id: 'pending', label: 'Action Required', count: teacherQpList.filter(p => p.status === 'draft' || p.status === 'revision_requested').length },
                        { id: 'under_review', label: 'Under Review', count: teacherQpList.filter(p => p.status === 'under_review').length },
                        { id: 'approved', label: 'Approved & Sealed', count: teacherQpList.filter(p => p.status === 'approved' || p.status === 'sent_to_exam_cell').length }
                      ].map(flt => (
                        <button
                          key={flt.id}
                          onClick={() => setQpFilterStatus(flt.id as any)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            qpFilterStatus === flt.id
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <span>{flt.label}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                            qpFilterStatus === flt.id ? 'bg-white/30 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {flt.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="text-xs text-slate-500 font-semibold">
                      Assigned Subject Faculty: <strong className="text-slate-900 dark:text-white">Mrs. Ananya Verma (Mathematics)</strong>
                    </div>
                  </div>

                  {/* Question Papers Cards List */}
                  {(() => {
                    const filteredPapers = teacherQpList.filter(p => {
                      if (qpFilterStatus === 'pending') return p.status === 'draft' || p.status === 'revision_requested';
                      if (qpFilterStatus === 'under_review') return p.status === 'under_review';
                      if (qpFilterStatus === 'approved') return p.status === 'approved' || p.status === 'sent_to_exam_cell';
                      return true;
                    });

                    if (filteredPapers.length === 0) {
                      return (
                        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                            <FileText className="h-6 w-6" />
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            No Question Papers in this view
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            {qpFilterStatus === 'pending' 
                              ? 'All commissioned question paper drafts have been uploaded and submitted for academic review!'
                              : 'No blueprints found matching the selected filter.'}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 gap-4">
                        {filteredPapers.map(qp => {
                          const bp = qp.blueprint || {};
                          const bloom = bp.bloom_taxonomy || { knowledge_pct: 35, application_pct: 45, hots_pct: 20 };
                          const isActionRequired = qp.status === 'draft' || qp.status === 'revision_requested';

                          return (
                            <div
                              key={qp.id}
                              className={`rounded-3xl border bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4 transition-all ${
                                qp.status === 'revision_requested' 
                                  ? 'border-rose-300 dark:border-rose-900/60 ring-2 ring-rose-500/20' 
                                  : isActionRequired
                                  ? 'border-amber-200 dark:border-amber-900/40'
                                  : 'border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              {/* Top Badge & Status Header */}
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                      {qp.class_name} &bull; {qp.subject}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500">&bull;</span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                      {qp.term}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500">&bull;</span>
                                    <span className="text-xs font-semibold text-slate-500">
                                      Target: <strong>{bp.total_marks || 100} Marks</strong> (3 Hours)
                                    </span>
                                  </div>

                                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white pt-1">
                                    {qp.title}
                                  </h3>
                                </div>

                                {/* Status Badges */}
                                <div className="shrink-0">
                                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-2xs ${
                                    qp.status === 'sent_to_exam_cell'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                                      : qp.status === 'approved'
                                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300'
                                      : qp.status === 'under_review'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 animate-pulse'
                                      : qp.status === 'revision_requested'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                                  }`}>
                                    {qp.status === 'sent_to_exam_cell' ? '🔒 Sealed in Exam Vault' :
                                     qp.status === 'approved' ? '✓ Academic Approved' :
                                     qp.status === 'under_review' ? '⏳ Under Review by Dean' :
                                     qp.status === 'revision_requested' ? '⚠️ Revision Requested' :
                                     '📝 Drafting Pending'}
                                  </span>
                                </div>
                              </div>

                              {/* Revision Warning Callout if Coordinator requested changes */}
                              {qp.status === 'revision_requested' && (
                                <div className="rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 p-4 space-y-1.5 animate-in fade-in">
                                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                                    <span>Academic Coordinator (Prof. Rajeshwari Nair) Audit Feedback:</span>
                                  </div>
                                  <p className="text-xs text-rose-900 dark:text-rose-200 font-medium pl-6 leading-relaxed">
                                    &ldquo;{qp.review_notes || 'Please adjust question paper sections to strictly match the 30% HOTS / Application weighting. Include detailed step-by-step marking rubric in the answer scheme.'}&rdquo;
                                  </p>
                                </div>
                              )}

                              {/* Blueprint Specifications Grid */}
                              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    Required Bloom&apos;s Taxonomy Weighting:
                                  </span>
                                  <div className="flex items-center gap-2 font-bold text-[11px]">
                                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                      Recall / Knowledge: {bloom.knowledge_pct}%
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                      Understanding: {bloom.application_pct}%
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                      HOTS / Analysis: {bloom.hots_pct}%
                                    </span>
                                  </div>
                                </div>

                                {bp.units && bp.units.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-700/60">
                                    <span className="text-[11px] font-bold text-slate-500 mr-1">Syllabus Scope:</span>
                                    {bp.units.map((u: string) => (
                                      <span key={u} className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-semibold">
                                        {u}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Submitted Artifacts if present */}
                                {qp.draft_file_url && (
                                  <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/70 dark:border-slate-700/60 text-xs">
                                    <span className="text-slate-500 font-bold">Uploaded Artifacts:</span>
                                    <a
                                      href={qp.draft_file_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                                    >
                                      <FileText className="h-3.5 w-3.5" />
                                      <span>{qp.draft_file_name || 'Question Paper PDF'}</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                    {qp.answer_key_url && (
                                      <a
                                        href={qp.answer_key_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                                      >
                                        <CheckSquare className="h-3.5 w-3.5" />
                                        <span>Official Marking Scheme PDF</span>
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Action Footer */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-slate-400" />
                                  <span>Submission Due: <strong className="text-slate-800 dark:text-slate-200">{qp.due_date || 'In 3 Days'}</strong></span>
                                  <span>&bull;</span>
                                  <span>Commissioned By: <strong className="text-slate-800 dark:text-slate-200">Dean Rajeshwari Nair</strong></span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isActionRequired ? (
                                    <button
                                      onClick={() => {
                                        setSelectedDraftQp(qp);
                                        setDraftFileName(qp.draft_file_name || `${qp.class_name.replace(/\s+/g, '_')}_${qp.subject}_Term1_Final_QP.pdf`);
                                        setDraftFileUrl(qp.draft_file_url || `/samples/${qp.class_name.replace(/\s+/g, '_')}_${qp.subject}_Term1_Final_QP.pdf`);
                                        setAnswerKeyUrl(qp.answer_key_url || `/samples/${qp.class_name.replace(/\s+/g, '_')}_${qp.subject}_Term1_AnswerKey.pdf`);
                                      }}
                                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 transition-all"
                                    >
                                      <Upload className="h-4 w-4" />
                                      <span>{qp.status === 'revision_requested' ? 'Submit Revised Paper Draft' : 'Upload & Submit Designed Paper'}</span>
                                    </button>
                                  ) : qp.status === 'under_review' ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900">
                                        Awaiting Academic Coordinator Sign-Off
                                      </span>
                                      <button
                                        onClick={() => {
                                          setSelectedDraftQp(qp);
                                          setDraftFileName(qp.draft_file_name || `${qp.class_name.replace(/\s+/g, '_')}_${qp.subject}_Term1_Final_QP.pdf`);
                                          setDraftFileUrl(qp.draft_file_url || `/samples/${qp.class_name.replace(/\s+/g, '_')}_${qp.subject}_Term1_Final_QP.pdf`);
                                          setAnswerKeyUrl(qp.answer_key_url || `/samples/${qp.class_name.replace(/\s+/g, '_')}_${qp.subject}_Term1_AnswerKey.pdf`);
                                        }}
                                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                                      >
                                        Update Draft
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                      <CheckCircle2 className="h-4 w-4" />
                                      <span>Approved &amp; Sealed in Secrecy Vault</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ── AI MARKSHEET OCR SCANNER MODAL ── */}
              {showOcrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
                  <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl my-8">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            Gemini Vision AI Marksheet &amp; Paper Register OCR Scanner
                          </h3>
                          <p className="text-xs text-slate-500">
                            Eliminate manual marks entry: upload photos of physical score registers to auto-populate grades &amp; trigger remedial focus.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowOcrModal(false);
                          setOcrStep('upload');
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Step 1: Upload view */}
                    {ocrStep === 'upload' && (
                      <div className="space-y-4 py-2 text-xs">
                        <div className="border-2 border-dashed border-purple-200 dark:border-purple-800/60 rounded-3xl p-8 text-center space-y-3 bg-purple-50/30 dark:bg-purple-950/20">
                          <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto shadow-inner">
                            <Upload className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              Drop evaluated mark register photo or PDF scan
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Supports handwritten numbers, tabular marks sheets, or batch answer booklets
                            </p>
                          </div>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            <span>Target Class: Class 8-B (Mathematics Term 1 Evaluation)</span>
                          </div>
                        </div>

                        {/* Preset Test Marksheet options */}
                        <div className="space-y-2">
                          <label className="font-bold text-slate-700 dark:text-slate-300 block">
                            Or select scanned register artifact from school scanner:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                              { name: 'Class8B_Math_Term1_Register_Physical.png', desc: 'Class 8-B Term 1 Final Marksheet (Evaluated 20 Oct 2026)' },
                              { name: 'Class8B_Math_Unit2_Factoring_Quiz.png', desc: 'Unit 2 Factoring Micro-Quiz Handwritten Register' }
                            ].map(sample => (
                              <button
                                key={sample.name}
                                type="button"
                                onClick={() => setOcrScannedFileName(sample.name)}
                                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                                  ocrScannedFileName === sample.name
                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 shadow-xs'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <div className="font-bold text-slate-900 dark:text-white text-xs">{sample.name}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">{sample.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => setShowOcrModal(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleStartOcrScan}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span>Scan &amp; Extract Marks with Gemini Vision</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Scanning view */}
                    {ocrStep === 'scanning' && (
                      <div className="py-12 text-center space-y-4">
                        <div className="h-16 w-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                          <RefreshCw className="h-8 w-8 animate-spin" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-black text-slate-900 dark:text-white">
                            Gemini 3.0 Vision OCR In Progress...
                          </h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Extracting handwritten marks column, segmenting digit bounding boxes, and cross-checking student roll names.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Review & Edit Split Grid */}
                    {ocrStep === 'review' && (
                      <div className="space-y-4 text-xs">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-emerald-900 dark:text-emerald-200">
                              ✓ Successfully parsed {ocrResults.length} student scores from {ocrScannedFileName}
                            </span>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                              {ocrResults.filter(r => r.is_remedial_target).length} students scored &le; 70% and will be automatically enrolled in the 1-Week Remedial Focus Table upon commit.
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-[10px] tracking-wider uppercase">
                            Vision OCR Verified
                          </span>
                        </div>

                        {/* Review Table */}
                        <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                              <tr>
                                <th className="p-3">Roll &amp; Student</th>
                                <th className="p-3">Extracted Marks</th>
                                <th className="p-3">Score %</th>
                                <th className="p-3">Remedial Focus Pipeline</th>
                                <th className="p-3">OCR Confidence</th>
                                <th className="p-3">Teacher Observation</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {ocrResults.map((row, idx) => (
                                <tr key={row.student_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                  <td className="p-3">
                                    <div className="font-bold text-slate-900 dark:text-white">{row.student_name}</div>
                                    <span className="font-mono text-[10px] text-slate-400">Roll #{row.roll_no} • {row.admission_no}</span>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        max={row.max_marks}
                                        value={row.marks_obtained}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setOcrResults(prev => prev.map((item, i) => {
                                            if (i === idx) {
                                              const newPct = Math.round((val / row.max_marks) * 1000) / 10;
                                              return {
                                                ...item,
                                                marks_obtained: val,
                                                percentage: newPct,
                                                is_remedial_target: newPct <= 70.0
                                              };
                                            }
                                            return item;
                                          }));
                                        }}
                                        className="w-16 p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center"
                                      />
                                      <span className="text-slate-400">/ {row.max_marks}</span>
                                    </div>
                                  </td>
                                  <td className="p-3 font-black">
                                    <span className={row.is_remedial_target ? 'text-rose-600' : 'text-emerald-600'}>
                                      {row.percentage}%
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    {row.is_remedial_target ? (
                                      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                        <AlertTriangle className="h-3 w-3 shrink-0" />
                                        <span>Enrolled in Remedial (&le;70%)</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                                        <span>Mastery Exempt (&gt;70%)</span>
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      row.confidence >= 0.90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {Math.round(row.confidence * 100)}% Match
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      value={row.pedagogical_remarks}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setOcrResults(prev => prev.map((item, i) => i === idx ? { ...item, pedagogical_remarks: val } : item));
                                      }}
                                      className="w-full p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => setOcrStep('upload')}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                          >
                            &larr; Re-Scan Image
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={isCommittingOcr}
                              onClick={() => handleCommitOcrGrades(false)}
                              className="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs cursor-pointer"
                            >
                              Save Draft Marks
                            </button>
                            <button
                              disabled={isCommittingOcr}
                              onClick={() => handleCommitOcrGrades(true)}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Commit &amp; Publish with Remedial Hook &rarr;</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── SUBMIT QUESTION PAPER DRAFT MODAL ── */}
              {selectedDraftQp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
                  <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl my-8">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Upload Draft: {selectedDraftQp.title}
                          </h3>
                          <span className="text-xs text-slate-500">Commissioned by Academic Coordinator (Prof. Rajeshwari Nair)</span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedDraftQp(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitQpDraft} className="space-y-4 text-xs">
                      {/* Revision notice if requested */}
                      {selectedDraftQp.status === 'revision_requested' && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-1">
                          <div className="flex items-center gap-1.5 font-black text-rose-700 dark:text-rose-300">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                            <span>Action Required: Academic Coordinator Revision Notes</span>
                          </div>
                          <p className="text-[11px] text-rose-800 dark:text-rose-200 pl-5">
                            &ldquo;{selectedDraftQp.review_notes || 'Please adjust question paper sections to strictly match the 30% HOTS / Application weighting. Include detailed step-by-step marking rubric in the answer scheme.'}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Blueprint specifications summary */}
                      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200 space-y-1.5">
                        <div className="font-bold flex items-center justify-between">
                          <span>Required Blueprint Specifications:</span>
                          <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                            Total: {selectedDraftQp.blueprint?.total_marks || 100} Marks (3h)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-2">
                          <span>Class: <strong>{selectedDraftQp.class_name}</strong></span>
                          <span>&bull;</span>
                          <span>Subject: <strong>{selectedDraftQp.subject}</strong></span>
                          <span>&bull;</span>
                          <span>Term: <strong>{selectedDraftQp.term}</strong></span>
                        </div>
                        {selectedDraftQp.blueprint?.units && selectedDraftQp.blueprint.units.length > 0 && (
                          <div className="text-[10px] text-slate-500 pt-1 border-t border-indigo-100 dark:border-indigo-900/50">
                            Units: {selectedDraftQp.blueprint.units.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Quick Auto-Fill Demo Button */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] text-slate-500">Fast Demo Testing:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const cName = selectedDraftQp.class_name.replace(/\s+/g, '_');
                            setDraftFileUrl(`/samples/${cName}_Math_Term1_Final_QP.pdf`);
                            setDraftFileName(`${cName}_Math_Term1_Final_QP.pdf`);
                            setAnswerKeyUrl(`/samples/${cName}_Math_Term1_AnswerKey.pdf`);
                            triggerToast('⚡ Pre-filled verified demo question paper & marking scheme!');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800 cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3 text-indigo-500" />
                          <span>Auto-Fill Demo Artifacts</span>
                        </button>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Question Paper PDF File Reference / Storage URL
                        </label>
                        <input
                          type="text"
                          required
                          value={draftFileUrl}
                          onChange={e => setDraftFileUrl(e.target.value)}
                          placeholder="/samples/Class8_Math_Term1_Final_QP.pdf"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Display File Name
                        </label>
                        <input
                          type="text"
                          required
                          value={draftFileName}
                          onChange={e => setDraftFileName(e.target.value)}
                          placeholder="Class8_Math_Term1_Final_QP.pdf"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Official Marking Scheme &amp; Answer Key (PDF)
                        </label>
                        <input
                          type="text"
                          value={answerKeyUrl}
                          onChange={e => setAnswerKeyUrl(e.target.value)}
                          placeholder="/samples/Class8_Math_Term1_AnswerKey.pdf"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setSelectedDraftQp(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Submit Paper to Academic Dean</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 4: MY STUDENTS 360 ROSTER & ANALYTICS            */}
          {/* ===================================================== */}
          {activeTab === 'roster' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-teal-100 text-teal-800 px-2.5 py-0.5 text-xs font-bold border border-teal-200">
                      Class Roster
                    </span>
                    <span className="text-xs text-slate-500">Class 8-B • Assigned Mentor</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Assigned Student Directory &amp; 360° Profiles
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click any student to inspect full academic trendlines, attendance percentages, and parent contact information.
                  </p>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Search student or roll no..."
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-56"
                  />
                </div>
              </div>

              {/* Roster Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students
                  .filter(s => s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || s.roll_no.includes(studentSearchQuery))
                  .map((st) => (
                    <div 
                      key={st.id} 
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold shrink-0">
                            {st.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <Link href={`/teacher/students/${st.id}`} className="text-xs font-bold text-slate-900 dark:text-white hover:text-teal-600 transition-colors">{st.name}</Link>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              Roll #{st.roll_no} • {st.class_name}
                            </span>
                          </div>
                        </div>

                        {st.has_focus_table && (
                          <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[9px] font-bold">
                            Focus Active
                          </span>
                        )}
                      </div>

                      {/* Performance Mini Stats */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-center">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Attendance</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{st.attendance_pct}%</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Academic Avg</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{st.academic_average_pct}%</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Parent: {st.guardian_name} ({st.guardian_phone})</span>
                      </div>

                      {/* Latest Faculty Remark Chip */}
                      <Link 
                        href={`/teacher/students/${st.id}?tab=remarks`}
                        className="block p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 hover:border-amber-300 transition-all text-xs group"
                        title="Click to view all faculty remarks & observations"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-800 dark:text-amber-300 mb-0.5">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-2.5 w-2.5" />
                            Faculty Observation
                          </span>
                          <span className="text-amber-600 dark:text-amber-400 group-hover:underline">View All →</span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 italic line-clamp-1">
                          {st.id === 1 ? '“Exceptional analytical curiosity; diligent with quadratic roots.”' :
                           st.id === 2 ? '“Stellar academic achiever; debate and analytical proofs are exemplary.”' :
                           st.id === 3 ? '“Sharp computational agility and active classroom participation.”' :
                           st.id === 4 ? '“Expressive and creative in literature essays; regular revision recommended.”' :
                           st.id === 5 ? '“Enrolled in 4-day Focus Table remedial; receptive to faculty feedback.”' :
                           '“Exceptional all-rounder with strong academic dedication.”'}
                        </p>
                      </Link>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Link
                          href={`/teacher/students/${st.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 py-1.5 text-xs font-bold transition-all text-center cursor-pointer shadow-2xs"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          <span>View 360° Student SIS</span>
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedChatStudentId(st.id);
                            setActiveTab('parent_chat');
                            triggerToast(`Opening direct chat with ${st.guardian_name} (${st.name}'s parent)`);
                          }}
                          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white p-2 transition-all cursor-pointer shadow-xs"
                          title={`Chat with Parent: ${st.guardian_name}`}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 5: DUAL-MODE PARENTAL CONNECTION & SLIDING PTM    */}
          {/* ===================================================== */}
          {activeTab === 'parent_hub' && (
            <div className="space-y-6">
              {/* Executive Header Banner - Pure PTM Conference Focus */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                      <Video className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Parent-Teacher Meeting (PTM) Portal
                    </span>
                    <span className="text-xs text-slate-400">Class 8-B In-charge &bull; Mathematics 7-A, 8-B, 9-C</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Parent-Teacher Conference (PTM) Timetable
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                    High-density conference timetable with strict 10-minute sliding slots, automated parent self-booking, synchronized Google Meet links, and protected faculty breaks.
                  </p>
                </div>

                {/* Primary Action Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-xl">
                    <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                      Friday, 24 Oct 2026
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('parent_chat')}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-bold cursor-pointer transition-all shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Open Parent Chat</span>
                  </button>
                </div>
              </div>

              {/* 4 Executive KPI Chips */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Video className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">PTM Status</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {ptmSlots.filter(s => s.status === 'BOOKED').length} / {ptmSlots.filter(s => s.status !== 'BREAK').length}
                      </span>
                      <span className="text-xs text-slate-400">Booked</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Homeroom (8-B)</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-purple-900 dark:text-purple-300">32 Students</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block truncate">100% Parent Sync</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Subject Math</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-indigo-900 dark:text-indigo-300">3 Sections</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">Auto-CC Class Teachers</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Focus Table Loop</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">Active</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block truncate">Evidence Synced</span>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* 10-MINUTE SLIDING PTM SCHEDULER                          */}
              {/* ========================================================= */}
              <div className="space-y-5">
                  {/* Event Information & Break Banner */}
                  <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 p-6 text-white shadow-md space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 text-xs font-bold border border-indigo-400/30">
                            Post-Midterm PTM Conference
                          </span>
                          <span className="text-xs text-indigo-300 font-medium">Strict 10-Minute Sliding Slots</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1">
                          {ptmConfig?.title || 'Term 1 Post-Midterm Parent-Teacher Conference'}
                        </h3>
                        <p className="text-xs text-indigo-200/90 mt-0.5">
                          Friday, <strong>24 Oct 2026</strong> &bull; School Hours: <strong>09:00 AM – 03:30 PM</strong> &bull; 2-Minute Grace Interval &bull; Max 1 Parent Per Window
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="px-3.5 py-2 rounded-2xl bg-indigo-900/60 border border-indigo-700/50 text-right">
                          <span className="text-xl font-black text-emerald-400 font-mono block">
                            {ptmSlots.filter(s => s.status === 'BOOKED').length} / {ptmSlots.filter(s => s.status !== 'BREAK').length}
                          </span>
                          <span className="text-[10px] text-indigo-200 uppercase font-semibold">Conferences Booked</span>
                        </div>
                      </div>
                    </div>

                    {/* Blackout Break Badges */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-indigo-800/60 text-xs">
                      <span className="text-indigo-300 font-semibold text-[11px] uppercase tracking-wider">
                        Protected Faculty Breaks:
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-amber-300 font-medium text-xs">
                        ☕ Morning Tea: <strong>11:00 AM – 11:15 AM</strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-amber-300 font-medium text-xs">
                        🍱 Lunch Break: <strong>01:00 PM – 01:45 PM</strong>
                      </span>
                    </div>
                  </div>

                  {/* Filter Toolbar (Status & Scope Filters) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Filter:</span>
                      {[
                        { id: 'ALL', label: 'All Slots', count: ptmSlots.filter(s => s.status !== 'BREAK').length },
                        { id: 'BOOKED', label: 'Booked', count: ptmSlots.filter(s => s.status === 'BOOKED').length },
                        { id: 'AVAILABLE', label: 'Available', count: ptmSlots.filter(s => s.status === 'AVAILABLE').length },
                        { id: 'BREAK', label: 'Breaks', count: ptmSlots.filter(s => s.status === 'BREAK').length }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setPtmStatusFilter(item.id as any)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            ptmStatusFilter === item.id
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            ptmStatusFilter === item.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                            {item.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Scope Selector */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                      {[
                        { id: 'ALL', label: 'All Classes' },
                        { id: 'HOMEROOM_CLASS', label: 'Homeroom (8-B)' },
                        { id: 'SUBJECT_SPECIFIC', label: 'Subject (Math)' }
                      ].map((scope) => (
                        <button
                          key={scope.id}
                          onClick={() => setPtmScopeFilter(scope.id as any)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            ptmScopeFilter === scope.id
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {scope.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* High-Density PTM Conference Schedule Ledger Table */}
                  <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    {/* Table Sub-Header Strip */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Conference Schedule Ledger
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Parents self-book open windows &bull; No manual teacher assignment required
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 text-[11px]">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          {ptmSlots.filter(s => s.status === 'AVAILABLE').length} Free Slots
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 text-[11px]">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                          {ptmSlots.filter(s => s.status === 'BOOKED').length} Booked
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/60 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            <th className="py-3 px-4">Time Window</th>
                            <th className="py-3 px-4">Slot Status</th>
                            <th className="py-3 px-4">Student &amp; Class</th>
                            <th className="py-3 px-4">Guardian / Parent Contact</th>
                            <th className="py-3 px-4">Context / Focus Agenda</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {ptmSlots
                            .filter(slot => {
                              if (ptmStatusFilter !== 'ALL' && slot.status !== ptmStatusFilter) return false;
                              if (ptmScopeFilter !== 'ALL' && slot.status !== 'BREAK' && slot.interaction_scope !== ptmScopeFilter) return false;
                              return true;
                            })
                            .map((slot) => {
                              const isBreak = slot.status === 'BREAK';
                              const isBooked = slot.status === 'BOOKED' || slot.status === 'HELD';
                              const isHomeroom = slot.interaction_scope === 'HOMEROOM_CLASS';

                              // 1. FACULTY BREAK ROW
                              if (isBreak) {
                                return (
                                  <tr key={slot.id} className="bg-amber-50/50 dark:bg-amber-950/20 border-y border-amber-200/60 dark:border-amber-900/40">
                                    <td colSpan={6} className="py-2.5 px-4">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                          <span className="text-sm">☕</span>
                                          <div>
                                            <span className="font-bold text-amber-900 dark:text-amber-200 text-xs">
                                              {slot.subject_name || 'Protected Faculty Break'}
                                            </span>
                                            <span className="text-[11px] text-amber-700/80 dark:text-amber-400 ml-2">
                                              Protected faculty rest window &bull; PTM booking automatically locked
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-200 px-2.5 py-0.5 rounded-lg bg-amber-100/80 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-800">
                                            ⏰ {slot.start_time} – {slot.end_time}
                                          </span>
                                          {slot.subject_name === 'Faculty Blocked Window' && (
                                            <button
                                              type="button"
                                              onClick={() => handleToggleSlotBlock(slot.id)}
                                              className="text-[10px] text-amber-800 dark:text-amber-300 hover:underline font-bold cursor-pointer"
                                            >
                                              Unblock
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }

                              // 2. BOOKED CONFERENCE ROW
                              if (isBooked) {
                                return (
                                  <tr key={slot.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                    {/* Time Window */}
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                          {slot.start_time} – {slot.end_time}
                                        </span>
                                        {slot.is_sibling_combo && (
                                          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-1.5 py-0.5 rounded-md" title="Sibling Chained (+10m)">
                                            +10m Sibling
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Slot Status */}
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-[11px] font-bold">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                                        Booked ✓
                                      </span>
                                    </td>

                                    {/* Student & Class */}
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                          {slot.booked_student_name ? slot.booked_student_name.split(' ').map(n => n[0]).join('') : 'ST'}
                                        </div>
                                        <div>
                                          <span className="font-bold text-slate-900 dark:text-white block">
                                            {slot.booked_student_name}
                                          </span>
                                          <span className="text-[10px] text-slate-400 block">
                                            Class {slot.booked_class} &bull; Roll #{slot.booked_student_id || '01'}
                                            {slot.sibling_student_name && ` • Sibling: ${slot.sibling_student_name}`}
                                          </span>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Guardian / Parent */}
                                    <td className="py-3 px-4">
                                      <div>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                          {slot.booked_parent_name || 'Parent Connected'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                                          {slot.locked_by_class || '+91 98450 12345'}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Context / Focus Agenda */}
                                    <td className="py-3 px-4">
                                      {slot.focus_table_agenda && slot.focus_table_agenda.length > 0 ? (
                                        <div className="space-y-0.5">
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                            Focus Table Linked
                                          </span>
                                          <span className="text-[10px] text-slate-600 dark:text-slate-400 block truncate max-w-[200px]">
                                            {slot.focus_table_agenda[0]}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-[11px] text-slate-400 italic">
                                          Standard Conference
                                        </span>
                                      )}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {slot.meeting_url && (
                                          <a
                                            href={slot.meeting_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                                            title="Join Scheduled Google Meet"
                                          >
                                            <Video className="h-3.5 w-3.5" />
                                            <span>Join Meet</span>
                                            <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                                          </a>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const studentName = slot.booked_student_name || '';
                                            const idx = focusRoster.findIndex(f => f.name.toLowerCase().includes(studentName.toLowerCase()));
                                            if (idx >= 0) {
                                              handleOpenFocusDrawer(idx);
                                            } else {
                                              handleOpenFocusDrawer(0);
                                            }
                                          }}
                                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                                          title="Inspect Student SIS Profile & Remedials"
                                        >
                                          <Eye className="h-3 w-3 text-slate-500" />
                                          <span className="hidden sm:inline">Profile</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleReleasePTMSlot(slot.id)}
                                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                          title="Release Slot (Mark as Free)"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }

                              // 3. FREE / AVAILABLE SLOT ROW
                              return (
                                <tr key={slot.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                  {/* Time Window */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <span className="font-mono font-medium text-slate-600 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                      {slot.start_time} – {slot.end_time}
                                    </span>
                                  </td>

                                  {/* Slot Status */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                      Free / Available
                                    </span>
                                  </td>

                                  {/* Student & Class */}
                                  <td className="py-3 px-4 text-slate-400 italic">
                                    Open for parent booking
                                  </td>

                                  {/* Guardian / Parent */}
                                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                                    Self-service slot
                                  </td>

                                  {/* Context / Focus Agenda */}
                                  <td className="py-3 px-4">
                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                      {isHomeroom ? 'Homeroom (8-B)' : 'Mathematics'}
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3 px-4 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSlotBlock(slot.id)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                                      title="Block slot or mark unavailable"
                                    >
                                      <span>Block</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                          </div>
          )}

          {/* ===================================================== */}
          {/* TAB: DIRECT CHAT WITH PARENTS (PRD SPECIFICATION)     */}
          {/* ===================================================== */}
          {activeTab === 'parent_chat' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-0.5 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      PRD Feature: Direct Parent Communication Channel
                    </span>
                    <span className="text-xs text-slate-400">Class 8-B &bull; Mathematics 7-A, 8-B, 9-C</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Parent Communication &amp; Live Messaging Center
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                    Direct, secure one-on-one communication channel with parents of any student in your assigned classes. Review student context, share remedial updates, and answer queries.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setActiveTab('roster')}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 px-3 py-2 text-xs font-semibold cursor-pointer transition-all shadow-2xs"
                  >
                    <Users className="h-3.5 w-3.5 text-teal-600" />
                    <span>My Students Roster</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('parent_hub')}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold cursor-pointer transition-all shadow-xs"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>View PTM Conferences</span>
                  </button>
                </div>
              </div>

              {/* Main Two-Panel Chat Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs min-h-[620px]">
                {/* Left Panel: Student / Parent Directory (4 cols on lg) */}
                <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3.5 bg-slate-50/50 dark:bg-slate-900/50">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student, parent or roll..."
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { id: 'ALL', label: 'All Parents' },
                      { id: 'FOCUS', label: 'Focus Remedial' },
                      { id: '8B', label: 'Class 8-B' }
                    ].map((flt) => (
                      <button
                        key={flt.id}
                        onClick={() => setChatRosterFilter(flt.id as any)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                          chatRosterFilter === flt.id
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {flt.label}
                      </button>
                    ))}
                  </div>

                  {/* Students / Parents Contact List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
                    {students
                      .filter(s => {
                        if (chatRosterFilter === 'FOCUS' && !s.has_focus_table) return false;
                        if (chatRosterFilter === '8B' && !s.class_name.includes('8-B')) return false;
                        if (chatSearchQuery.trim()) {
                          const q = chatSearchQuery.toLowerCase();
                          return s.name.toLowerCase().includes(q) ||
                            s.guardian_name.toLowerCase().includes(q) ||
                            s.roll_no.includes(q);
                        }
                        return true;
                      })
                      .map((s) => {
                        const isSelected = s.id === selectedChatStudentId;
                        const studentMsgs = conversations[s.id] || [];
                        const lastMsg = studentMsgs[studentMsgs.length - 1];
                        const initials = s.name.split(' ').map(n => n[0]).slice(0, 2).join('');

                        return (
                          <div
                            key={s.id}
                            onClick={() => setSelectedChatStudentId(s.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 shadow-xs'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }`}>
                              {initials}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {s.guardian_name}
                                </h4>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {lastMsg?.time.includes('Today') ? lastMsg.time.replace('Today, ', '') : 'Active'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 truncate">
                                  {s.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  • Roll #{s.roll_no}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                                {lastMsg ? lastMsg.text : 'Tap to start conversation...'}
                              </p>
                            </div>

                            {s.has_focus_table && (
                              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1" title="In Focus Table" />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Right Panel: Active Conversation Window (8 cols on lg) */}
                {(() => {
                  const activeStudent = students.find(s => s.id === selectedChatStudentId) || students[0];
                  const activeConvo = conversations[selectedChatStudentId] || [];

                  return (
                    <div className="lg:col-span-8 flex flex-col justify-between p-4 sm:p-6 bg-white dark:bg-slate-900">
                      {/* Conversation Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {activeStudent ? activeStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'ST'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                {activeStudent?.guardian_name}
                              </h3>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Online via Parent App
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                              Parent of <strong className="text-slate-700 dark:text-slate-200">{activeStudent?.name}</strong> • Roll #{activeStudent?.roll_no} • {activeStudent?.class_name} • Phone: {activeStudent?.guardian_phone}
                            </span>
                          </div>
                        </div>

                        {/* Quick Header Actions */}
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/teacher/students/${activeStudent?.id || 1}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-teal-800 dark:text-teal-200 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                            <span>Inspect 360° SIS</span>
                          </Link>

                          <button
                            onClick={() => {
                              setActiveTab('parent_hub');
                              triggerToast(`Navigated to PTM Conference ledger`);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Video className="h-3.5 w-3.5 text-blue-600" />
                            <span>PTM Slots</span>
                          </button>
                        </div>
                      </div>

                      {/* Quick Canned Message Prompts */}
                      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                          Quick Prompts:
                        </span>
                        {[
                          { label: '📊 Remedial Update', text: `Hello ${activeStudent?.guardian_name}, ${activeStudent?.name} has shown steady improvement in today's quadratic factoring practice.` },
                          { label: '📝 Homework Check', text: `Hi ${activeStudent?.guardian_name}, kindly ensure ${activeStudent?.name} reviews Worksheet #4 before tomorrow's class.` },
                          { label: '⏰ PTM Slot Alert', text: `Looking forward to our upcoming 10-minute PTM conference on Friday, 24 Oct.` },
                          { label: '⭐ Commendation', text: `Praise note: ${activeStudent?.name} demonstrated excellent participation and problem-solving focus in class today!` }
                        ].map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setChatInput(prompt.text)}
                            className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-600 dark:text-slate-300 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer border border-transparent hover:border-indigo-200"
                          >
                            {prompt.label}
                          </button>
                        ))}
                      </div>

                      {/* Messages Feed */}
                      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 min-h-[300px] max-h-[380px] pr-1">
                        <div className="flex items-center justify-center my-2">
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-0.5 text-[10px] font-bold">
                            Today &bull; Official Institutionally-Logged Parent Channel
                          </span>
                        </div>

                        {activeConvo.map((msg) => {
                          const isTeacher = msg.sender === 'teacher';

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                                {!isTeacher && (
                                  <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mb-1">
                                    {activeStudent?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                  </div>
                                )}

                                <div className={`p-3.5 rounded-2xl shadow-2xs space-y-1 ${
                                  isTeacher
                                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-xs border border-slate-200 dark:border-slate-700'
                                }`}>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className={`text-[10px] font-bold ${isTeacher ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                      {isTeacher ? 'You (Class Teacher)' : activeStudent?.guardian_name}
                                    </span>
                                  </div>
                                  <p className="text-xs leading-relaxed font-normal">
                                    {msg.text}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 mt-1 px-1">
                                <span className="text-[10px] text-slate-400">
                                  {msg.time}
                                </span>
                                {isTeacher && (
                                  <span className="text-[10px] font-bold text-indigo-500">
                                    ✓✓ Delivered
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Message Composer */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                          }}
                          className="flex items-center gap-2"
                        >
                          <button
                            type="button"
                            onClick={() => triggerToast("File attachment protocol ready: PDF/Images up to 10MB")}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Attach File / Remedial Sheet"
                          >
                            <Paperclip className="h-4 w-4" />
                          </button>

                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={`Type a secure message to ${activeStudent?.guardian_name}...`}
                            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />

                          <button
                            type="submit"
                            disabled={!chatInput.trim()}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <span>Send</span>
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </form>
                        <span className="text-[10px] text-slate-400 block mt-1.5">
                          🔒 Messages are encrypted &amp; logged as verifiable communication records in accordance with institutional policy.
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 6: STUDENT LEAVE APPROVALS                        */}
          {/* ===================================================== */}
          {activeTab === 'leave_approvals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-xs font-bold border border-rose-200">
                      Attendance Governance
                    </span>
                    <span className="text-xs text-slate-500">{leaveRequests.length} Total Applications</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Student Leave Approvals &amp; Medical Notes
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review and grant formal approval for leave requests submitted by parents via the mobile application.
                  </p>
                </div>
              </div>

              {/* Leave Requests List */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Parent Applications Queue
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Approved leaves auto-update SIS attendance logs
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {leaveRequests.map((lr) => (
                    <div key={lr.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{lr.student_name}</h4>
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold">
                            Submitted by {lr.parent_name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Dates: {lr.from_date} to {lr.to_date}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                          &ldquo;{lr.reason}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {lr.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleReviewLeave(lr.id, 'Approved')}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Approve Leave</span>
                            </button>
                            <button
                              onClick={() => handleReviewLeave(lr.id, 'Rejected')}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                            lr.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
                              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900'
                          }`}>
                            {lr.status === 'Approved' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            {lr.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 7: CONSOLIDATED FACULTY DUTIES & TASK CENTER     */}
          {/* ===================================================== */}
          {activeTab === 'duties' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-0.5 text-xs font-bold border border-purple-200 dark:border-purple-800">
                      Institutional Operations Command
                    </span>
                    <span className="text-xs text-slate-500">Academic Year 2026-27 • Faculty Roster</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Consolidated Faculty Duties &amp; Task Center
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Institutional information portal for exam invigilation allocations, campus substitution, event committees, and weekly routines.
                  </p>
                </div>

                {/* Event Type / Category Filters */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {[
                    { id: 'ALL', label: 'All Duties', icon: '📋' },
                    { id: 'EXAM_INVIGILATION', label: '📝 Exam Invigilation', icon: '📝' },
                    { id: 'CAMPUS_SUBSTITUTION', label: '🔄 Substitution Cover', icon: '🔄' },
                    { id: 'EVENT_COMMITTEE', label: '🎪 Events & Committees', icon: '🎪' },
                    { id: 'WEEKLY_ROUTINE', label: '🔄 Weekly Routines', icon: '🔄' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setDutyCategoryFilter(cat.id as any)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        dutyCategoryFilter === cat.id
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Master-Detail Split Workspace with Academic Day Schedule */}
              {(() => {
                const isTaskWeeklyRoutine = (duty: FacultyDutyTask): boolean => {
                  return (
                    !!duty.is_weekly ||
                    duty.frequency === 'WEEKLY' ||
                    duty.category === 'WEEKLY_ROUTINE' ||
                    duty.scheduled_date.toLowerCase().includes('weekly') ||
                    duty.scheduled_date.toLowerCase().includes('every')
                  );
                };

                const isTaskToday = (duty: FacultyDutyTask): boolean => {
                  const sched = duty.scheduled_date.toLowerCase();
                  return sched.includes('today') || sched.includes('16 oct') || (duty.day_of_week === 'Friday' && duty.is_weekly === true);
                };

                const isTaskOnDay = (duty: FacultyDutyTask, dayId: string): boolean => {
                  if (dayId === 'ALL') return true;
                  if (duty.day_of_week && duty.day_of_week.toLowerCase() === dayId.toLowerCase()) return true;
                  const sched = duty.scheduled_date.toLowerCase();
                  if (dayId.toLowerCase() === 'friday') {
                    return sched.includes('friday') || sched.includes('today') || sched.includes('16 oct');
                  }
                  if (dayId.toLowerCase() === 'monday') {
                    return sched.includes('monday') || sched.includes('12 oct') || sched.includes('19 oct');
                  }
                  if (dayId.toLowerCase() === 'wednesday') {
                    return sched.includes('wednesday') || sched.includes('14 oct');
                  }
                  if (dayId.toLowerCase() === 'sunday') {
                    return sched.includes('sunday') || sched.includes('18 oct');
                  }
                  if (dayId.toLowerCase() === 'saturday') {
                    return sched.includes('saturday') || sched.includes('17 oct') || sched.includes('24 oct');
                  }
                  if (dayId.toLowerCase() === 'tuesday') {
                    return sched.includes('tuesday') || sched.includes('13 oct');
                  }
                  if (dayId.toLowerCase() === 'thursday') {
                    return sched.includes('thursday') || sched.includes('15 oct');
                  }
                  return false;
                };

                const weekDays = [
                  { id: 'ALL', label: 'All Week', short: 'All', dateBadge: '12-18 Oct' },
                  { id: 'Monday', label: 'Monday', short: 'Mon', dateBadge: '12 Oct' },
                  { id: 'Tuesday', label: 'Tuesday', short: 'Tue', dateBadge: '13 Oct' },
                  { id: 'Wednesday', label: 'Wednesday', short: 'Wed', dateBadge: '14 Oct' },
                  { id: 'Thursday', label: 'Thursday', short: 'Thu', dateBadge: '15 Oct' },
                  { id: 'Friday', label: 'Friday (Today)', short: 'Fri', isToday: true, dateBadge: '16 Oct' },
                  { id: 'Saturday', label: 'Saturday', short: 'Sat', dateBadge: '17 Oct' },
                  { id: 'Sunday', label: 'Sunday', short: 'Sun', dateBadge: '18 Oct' },
                ];

                // Filtered duties respecting category (type of event) and day of week, excluding paper correction
                const filteredDuties = facultyDuties.filter((duty) => {
                  if (duty.category === 'PAPER_CORRECTION') return false;
                  if (dutyCategoryFilter !== 'ALL' && duty.category !== dutyCategoryFilter) return false;
                  if (dutySelectedDay !== 'ALL' && !isTaskOnDay(duty, dutySelectedDay)) return false;
                  return true;
                });
                const activeDuty = filteredDuties.find((d) => d.id === selectedDutyId) || filteredDuties[0] || null;

                return (
                  <div className="space-y-5">
                    {/* Academic Day Schedule Ribbon */}
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Academic Day Schedule
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Week of 12 – 18 Oct 2026
                          </span>
                        </div>
                        {dutySelectedDay !== 'ALL' && (
                          <button
                            onClick={() => setDutySelectedDay('ALL')}
                            className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                          >
                            Reset Day Filter (Show All Week)
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                        {weekDays.map((day) => {
                          const isSelected = dutySelectedDay === day.id;
                          const dayTasks = facultyDuties.filter((d) => {
                            if (d.category === 'PAPER_CORRECTION') return false;
                            if (dutyCategoryFilter !== 'ALL' && d.category !== dutyCategoryFilter) return false;
                            return isTaskOnDay(d, day.id);
                          });
                          const count = day.id === 'ALL'
                            ? facultyDuties.filter((d) => d.category !== 'PAPER_CORRECTION' && (dutyCategoryFilter === 'ALL' || d.category === dutyCategoryFilter)).length
                            : dayTasks.length;

                          return (
                            <button
                              key={day.id}
                              onClick={() => setDutySelectedDay(day.id)}
                              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                                isSelected
                                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-xs ring-1 ring-purple-500'
                                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              {day.isToday && (
                                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                              )}

                              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">
                                {day.short}
                              </div>
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 truncate">
                                {day.dateBadge}
                              </div>

                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                                <span className={`font-bold ${count > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                                  {count} {count === 1 ? 'task' : 'tasks'}
                                </span>
                                {day.isToday && (
                                  <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                                    Today
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Master-Detail Split Workspace */}
                    {filteredDuties.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
                        <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                          📋
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          No tasks found for current filter criteria
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Try resetting day selection or switching duty category.
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <button
                            onClick={() => {
                              setDutyCategoryFilter('ALL');
                              setDutySelectedDay('ALL');
                            }}
                            className="px-4 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors cursor-pointer shadow-sm"
                          >
                            Reset Filters (Show All)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* LEFT: MASTER LIST (5 COLS) */}
                        <div className="lg:col-span-5 space-y-3">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Duty Roster ({filteredDuties.length})
                            </span>
                            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                              Click duty to view details
                            </span>
                          </div>

                          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                            {filteredDuties.map((duty) => {
                              const isSelected = activeDuty?.id === duty.id;
                              const isWeeklyRoutine = isTaskWeeklyRoutine(duty);
                              const isToday = isTaskToday(duty);
                              const isInvigilation = duty.category === 'EXAM_INVIGILATION';
                              const isEvent = duty.category === 'EVENT_COMMITTEE';
                              const isWeeklyCat = duty.category === 'WEEKLY_ROUTINE';
                              const totalChecklist = duty.action_checklist?.length || 0;

                              return (
                                <div
                                  key={duty.id}
                                  onClick={() => setSelectedDutyId(duty.id)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                                    isSelected
                                      ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-500 shadow-md ring-1 ring-purple-500'
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                                  }`}
                                >
                                  {/* Top Bar: Category & Weekly & Priority & Status */}
                                  <div className="flex items-center justify-between gap-1.5 mb-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                          isWeeklyCat
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                            : isInvigilation
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                            : isEvent
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                        }`}
                                      >
                                        {duty.category.replace('_', ' ')}
                                      </span>

                                      {isWeeklyRoutine && (
                                        <span className="rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-1">
                                          <RefreshCw className="h-2.5 w-2.5" />
                                          Weekly
                                        </span>
                                      )}

                                      {isToday && (
                                        <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 text-[9px] font-bold">
                                          ⚡ Today
                                        </span>
                                      )}

                                      {duty.priority === 'CRITICAL' && (
                                        <span className="rounded bg-rose-500 text-white px-1.5 py-0.5 text-[9px] font-bold">
                                          CRITICAL
                                        </span>
                                      )}
                                    </div>

                                    <span
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                        duty.status === 'COMPLETED'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                          : duty.status === 'IN_PROGRESS'
                                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                                      }`}
                                    >
                                      {duty.status}
                                    </span>
                                  </div>

                                  {/* Title */}
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                    {duty.title}
                                  </h4>

                                  {/* Time & Venue Subtext */}
                                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    <span>📅 {duty.day_of_week ? `${duty.day_of_week} • ` : ''}{duty.scheduled_date}</span>
                                    <span>•</span>
                                    <span className="truncate">⏰ {duty.time_window}</span>
                                  </div>

                                  {/* Bottom Info Indicator */}
                                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                                    {totalChecklist > 0 ? (
                                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                                        📋 {totalChecklist} {totalChecklist === 1 ? 'guideline' : 'guidelines'}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">📍 {duty.location_or_venue}</span>
                                    )}

                                    <span className="text-purple-600 dark:text-purple-400 font-bold shrink-0">
                                      #{duty.id}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* RIGHT: DETAIL WORKSPACE STAGE (7 COLS) */}
                        <div className="lg:col-span-7 sticky top-4">
                          {activeDuty && (
                            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                              {/* Workspace Top Header */}
                              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <span
                                      className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                        activeDuty.category === 'WEEKLY_ROUTINE'
                                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                          : activeDuty.category === 'EXAM_INVIGILATION'
                                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                          : activeDuty.category === 'EVENT_COMMITTEE'
                                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      }`}
                                    >
                                      {activeDuty.category.replace('_', ' ')}
                                    </span>

                                    {isTaskWeeklyRoutine(activeDuty) && (
                                      <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                                        <RefreshCw className="h-3 w-3" />
                                        Weekly Routine
                                      </span>
                                    )}

                                    {activeDuty.priority === 'CRITICAL' && (
                                      <span className="rounded-md bg-rose-500 text-white px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        CRITICAL
                                      </span>
                                    )}

                                    <span
                                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                        activeDuty.status === 'COMPLETED'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                          : activeDuty.status === 'IN_PROGRESS'
                                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                                      }`}
                                    >
                                      {activeDuty.status}
                                    </span>
                                  </div>

                                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    {activeDuty.title}
                                  </h3>
                                  {activeDuty.sub_category && (
                                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                                      {activeDuty.sub_category}
                                    </p>
                                  )}
                                </div>

                                <span className="text-xs font-mono font-bold text-slate-400">
                                  #{activeDuty.id}
                                </span>
                              </div>

                              {/* Weekly Routine Banner if Applicable */}
                              {isTaskWeeklyRoutine(activeDuty) && (
                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-purple-200 dark:border-purple-800">
                                  <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                                      <RefreshCw className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                                        Institutional Weekly Routine
                                      </span>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                        Cadence: Every {activeDuty.day_of_week || 'Week'} &bull; Cycle auto-resets each Monday
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
                                    Weekly Cycle
                                  </span>
                                </div>
                              )}

                              {/* Telemetry Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date / Day</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                    📅 {activeDuty.day_of_week ? `${activeDuty.day_of_week}, ` : ''}{activeDuty.scheduled_date}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Window</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                    ⏰ {activeDuty.time_window}
                                  </span>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Venue / Room</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                                    📍 {activeDuty.location_or_venue}
                                  </span>
                                </div>
                              </div>

                              {/* Category Action Area: Exam Invigilation */}
                              {activeDuty.category === 'EXAM_INVIGILATION' && (
                                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                                    Assigned Exam Hall &amp; Seating Roster
                                  </span>
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                      <span className="text-[10px] text-slate-500 block">Assigned Hall:</span>
                                      <span className="font-black text-slate-900 dark:text-white">📍 {activeDuty.location_or_venue}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-500 block">Seat Range:</span>
                                      <span className="font-mono font-black text-amber-800 dark:text-amber-300">
                                        🪑 {activeDuty.seat_range || 'Seats 45 - 90'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-500 block">Candidate Count:</span>
                                      <span className="font-black text-slate-900 dark:text-white">
                                        👥 {activeDuty.student_count || 45} Students
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-500 block">Exam Category:</span>
                                      <span className="font-bold text-amber-900 dark:text-amber-200">Midterm Board Mock</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Category Action Area: Substitution */}
                              {activeDuty.category === 'CAMPUS_SUBSTITUTION' && (
                                <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-1.5 text-xs">
                                  <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 block">
                                    Emergency Coverage Allocation
                                  </span>
                                  <p className="font-bold text-rose-950 dark:text-rose-200 text-sm">
                                    Covering for absent colleague: {activeDuty.sub_category || 'Mr. Joshi'}
                                  </p>
                                  <span className="text-xs text-slate-500 block">
                                    Room: {activeDuty.location_or_venue} • Time: {activeDuty.time_window}
                                  </span>
                                </div>
                              )}

                              {/* Category Action Area: Weekly Routine */}
                              {activeDuty.category === 'WEEKLY_ROUTINE' && (
                                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 space-y-3 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                                      <ShieldCheck className="h-4 w-4 text-purple-600" />
                                      Weekly Routine Governance &amp; Execution
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                                      Cadence Day: {activeDuty.day_of_week || 'Friday'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Institutional accountability requirement signed off by {activeDuty.assigned_by}. Follow protocol instructions to lock the weekly verification ledger.
                                  </p>
                                  {(activeDuty.id === 'duty-06' || activeDuty.title.includes('Focus Table')) && (
                                    <div className="flex items-center justify-between pt-2 border-t border-purple-200/60 dark:border-purple-900/60">
                                      <span className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">
                                        4 Focus Table Students Assigned for Friday Audit
                                      </span>
                                      <button
                                        onClick={() => {
                                          setActiveTab('focus_table');
                                          setToastMessage('Switched to Student Focus Table remedial hub.');
                                        }}
                                        className="px-3 py-1.5 text-xs font-bold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                                      >
                                        <span>Open Focus Table Hub</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Operational Guidelines & Instructions */}
                              {activeDuty.action_checklist && activeDuty.action_checklist.length > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                                      Operational Guidelines &amp; Instructions:
                                    </span>
                                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                      {activeDuty.action_checklist.length} Steps
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    {activeDuty.action_checklist.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="w-full flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800/80"
                                      >
                                        <div className="mt-0.5 h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
                                          {idx + 1}
                                        </div>
                                        <span className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                                          {item.item}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Footer */}
                              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                <span>
                                  Assigned by:{' '}
                                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                                    {activeDuty.assigned_by}
                                  </strong>
                                </span>
                                <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">
                                  Duty ID: #{activeDuty.id}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 8: TEACHER LEAVE & SHORT-PERMISSIONS            */}
          {/* ===================================================== */}
          {activeTab === 'my_permissions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 text-xs font-bold">
                      Staff Self-Service
                    </span>
                    <span className="text-xs text-slate-500">Human Resources &amp; Approvals</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    My Leaves &amp; Short-Permission Applications
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Apply for casual leave, medical leave, or short permissions (late arrival / early departure). Requests sync directly with Management.
                  </p>
                </div>

                <button
                  onClick={() => setShowPermissionModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-xs hover:bg-slate-800 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Apply Permission</span>
                </button>
              </div>

              {/* Permissions History */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Application History ({myPermissions.length})
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Signed by Dr. Sunita Kapoor (Principal)
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {myPermissions.map((perm) => (
                    <div key={perm.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                            {perm.type}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{perm.date}</h4>
                          <span className="text-[10px] text-slate-400">Applied {perm.applied_at}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {perm.reason}
                        </p>
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        perm.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
                          : perm.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {perm.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                        {perm.status === 'Pending' && <Clock className="h-3 w-3" />}
                        {perm.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 9: FACULTY SALARY & DIGITAL PAYSLIPS             */}
          {/* ===================================================== */}
          {activeTab === 'my_salary' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                      Staff Self-Service
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Oct 2026 Pay Cycle</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    Faculty Salary & Monthly Payslips
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Itemized earnings, statutory EPF/PT/TDS deductions, and bank wire remittance status certified by Accounts Department.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Print Statement
                  </button>
                  <button
                    onClick={() => {
                      triggerToast("Salary inquiry routed directly to Accounts Coordinator desk.");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Contact Bursar
                  </button>
                </div>
              </div>

              {/* KPI Ribbon */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Earnings</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    ₹{myPayslip ? myPayslip.gross_earnings.toLocaleString('en-IN') : '62,000'}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    Basic + HRA + Special Allowance
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Deductions</div>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                    -₹{myPayslip ? myPayslip.total_deductions.toLocaleString('en-IN') : '7,740'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1">
                    EPF (12%) + PT (₹200) + TDS
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Net Take-Home Pay</div>
                  <div className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1">
                    ₹{myPayslip ? myPayslip.net_salary.toLocaleString('en-IN') : '54,260'}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    Direct Credit to Bank A/c
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Wire Remittance</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      (myPayslip?.disbursement_status || 'Pending') === 'Disbursed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      <CheckCircle2 className="h-3 w-3" />
                      {myPayslip?.disbursement_status || 'Disbursed'}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1.5 truncate">
                    UTR: {myPayslip?.payment_utr || 'CMS-HDFC-20261028-0912'}
                  </div>
                </div>
              </div>

              {/* Comprehensive Itemized Digital Payslip */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                {/* School Header */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          Delhi Public School, Sector 45
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Affiliated to CBSE, New Delhi (Affiliation No: 2130048) · Pay Slip for October 2026
                      </p>
                    </div>
                    <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-4">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Mrs. Ananya Verma</div>
                      <div className="text-[11px] text-slate-500">PGT Mathematics · Faculty ID #2</div>
                      <div className="text-[10px] font-mono text-slate-400">A/c: 918204918201 · HDFC Bank (HDFC0001829)</div>
                    </div>
                  </div>
                </div>

                {/* Earnings & Deductions Dual Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                  {/* Earnings Column */}
                  <div className="p-5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Earnings & Allowances
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">Amount (₹)</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                        <span className="text-slate-600 dark:text-slate-400">Basic Pay</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ₹{myPayslip ? myPayslip.basic_salary.toLocaleString('en-IN') : '38,000'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                        <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA)</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ₹{myPayslip ? myPayslip.hra_allowance.toLocaleString('en-IN') : '15,200'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                        <span className="text-slate-600 dark:text-slate-400">Special Teaching Allowance</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ₹{myPayslip ? myPayslip.special_allowance.toLocaleString('en-IN') : '8,800'}
                        </span>
                      </div>
                      {myPayslip && myPayslip.loss_of_pay_days > 0 && (
                        <div className="flex justify-between py-1 text-rose-600 font-semibold border-b border-slate-50 dark:border-slate-800/40">
                          <span>Loss of Pay ({myPayslip.loss_of_pay_days} day(s))</span>
                          <span>-₹{myPayslip.loss_of_pay_deduction.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between font-black text-xs text-slate-900 dark:text-white">
                      <span>Total Gross Earnings</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ₹{myPayslip ? myPayslip.gross_earnings.toLocaleString('en-IN') : '62,000'}
                      </span>
                    </div>
                  </div>

                  {/* Deductions Column */}
                  <div className="p-5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Statutory Deductions
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">Amount (₹)</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Employees' Provident Fund (EPF 12%)</span>
                          <span className="block text-[10px] text-slate-400">UAN: 100921829102</span>
                        </div>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          ₹{myPayslip ? myPayslip.provident_fund.toLocaleString('en-IN') : '4,560'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Professional Tax (PT)</span>
                          <span className="block text-[10px] text-slate-400">State Statutory Standard</span>
                        </div>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          ₹{myPayslip ? myPayslip.professional_tax.toLocaleString('en-IN') : '200'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40">
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Income Tax (TDS / Form 16)</span>
                          <span className="block text-[10px] text-slate-400">Old Tax Regime Declaration</span>
                        </div>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          ₹{myPayslip ? myPayslip.income_tax_tds.toLocaleString('en-IN') : '2,980'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between font-black text-xs text-slate-900 dark:text-white">
                      <span>Total Deductions</span>
                      <span className="text-rose-600 dark:text-rose-400">
                        -₹{myPayslip ? myPayslip.total_deductions.toLocaleString('en-IN') : '7,740'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Pay Highlight Bar */}
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        Net Disbursable Salary (Take-Home)
                      </span>
                      <span className="block text-[10px] text-emerald-700 dark:text-emerald-400">
                        Fifty-Four Thousand Two Hundred Sixty Rupees Only
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
                    ₹{myPayslip ? myPayslip.net_salary.toLocaleString('en-IN') : '54,260'}
                  </div>
                </div>

                {/* Statutory Certification Footer */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>
                    ✓ Authenticated by Accounts Coordinator (Bursar) · Generated automatically via EDU360 Payroll Engine.
                  </span>
                  <span className="font-mono text-slate-400">
                    Document ID: PAY-202610-002 · Digitally Signed
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* BRAND FOOTER                                          */}
          {/* ===================================================== */}
          <Footer />
        </main>
      </div>

      {/* ===================================================== */}
      {/* TASK 1: INLINE SPEEDGRADER DRAWER / MODAL             */}
      {/* ===================================================== */}
      {speedGraderOpen && activeSpeedGraderItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-6xl h-[95vh] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            
            {/* SpeedGrader Sticky Top Navigation Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-4 shrink-0">
              
              {/* Left: Student Identity */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                  {activeSpeedGraderItem.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {activeSpeedGraderItem.name}
                    </h3>
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      Roll #{activeSpeedGraderItem.roll_no}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      activeSpeedGraderItem.status === 'Graded'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {activeSpeedGraderItem.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {activeSpeedGraderItem.admission_id} • {activeSpeedGraderItem.file_name} ({activeSpeedGraderItem.file_size})
                  </span>
                </div>
              </div>

              {/* Center: Class Stepper Controls (Google Classroom / Canvas SpeedGrader) */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <button
                  disabled={activeSpeedGraderIndex <= 0}
                  onClick={() => setActiveSpeedGraderIndex(prev => Math.max(0, prev - 1))}
                  className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-black text-slate-800 dark:text-slate-200 px-2 border-x border-slate-200 dark:border-slate-700">
                  {activeSpeedGraderIndex + 1} of {homeworkList.length}
                </span>

                <button
                  disabled={activeSpeedGraderIndex >= homeworkList.length - 1}
                  onClick={() => setActiveSpeedGraderIndex(prev => Math.min(homeworkList.length - 1, prev + 1))}
                  className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Right: Close SpeedGrader */}
              <div className="flex items-center gap-3">
                {activeSpeedGraderItem.score !== undefined && (
                  <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-xl">
                    Score: {activeSpeedGraderItem.score} / {activeSpeedGraderItem.max_score}
                  </span>
                )}
                <button
                  onClick={() => setSpeedGraderOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close SpeedGrader (Return to Roster)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* SpeedGrader Canvas Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
              <HomeworkCanvas
                submission={activeSpeedGraderItem.submission_data}
                onSave={handleSaveSpeedGrading}
              />
            </div>

          </div>
        </div>
      )}

      {/* Note: Focus Plan details are now served on dedicated full page /teacher/focus/[id] */}

      {/* ===================================================== */}
      {/* REMEDIAL PRACTICE SUBMISSION REVIEW & VERIFY MODAL   */}
      {/* ===================================================== */}
      {verifyingFocusItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Remedial Practice Solution Verification
                    </h3>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2.5 py-0.5 text-[10px] font-bold">
                      {verifyingFocusItem.subject}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Candidate: <strong>{verifyingFocusItem.name}</strong> (Roll #{verifyingFocusItem.roll_no} • {verifyingFocusItem.class_name}) • Weak Concept: <strong>{verifyingFocusItem.weak_concept}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setVerifyingFocusItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
              
              {/* Submission File & Details Card */}
              <div className="rounded-2xl border border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 dark:border-emerald-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                      Uploaded File &amp; Timestamp:
                    </span>
                    <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300">
                      {verifyingFocusItem.submitted_file?.name || 'Aarav_Quadratic_Factorization_Rough_Notebook.pdf'}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({verifyingFocusItem.submitted_file?.size || '1.4 MB'})
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Submitted: {verifyingFocusItem.submitted_file?.submitted_at || 'Today, 08:30 AM'}
                  </span>
                </div>

                {/* Student's Notebook Note */}
                <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">
                    Student Submission Note:
                  </span>
                  <p className="italic">
                    &ldquo;{verifyingFocusItem.submitted_file?.student_notes || 'Completed 4 middle-term splitting questions. Checked positive and negative sign distributions in Q3 & Q4.'}&rdquo;
                  </p>
                </div>

                {/* Simulated Handwritten Notebook Preview Canvas */}
                <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-amber-50/20 dark:bg-slate-950 p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Rough Notebook Drill Snapshot Preview
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-0.5">
                      Scanned handwritten practice pages for {verifyingFocusItem.weak_concept}. Verified against teacher rubric.
                    </p>
                  </div>

                  {/* Sample interactive preview visual */}
                  <div className="w-full max-w-lg p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1 shadow-inner">
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold"># Problem 1: 2x² - 7x + 3 = 0</div>
                    <div>Step 1: Product = 2 * 3 = 6, Sum = -7</div>
                    <div>Step 2: Factors: -6 and -1  =&gt;  2x² - 6x - x + 3 = 0</div>
                    <div>Step 3: 2x(x - 3) - 1(x - 3) = 0  =&gt;  (2x - 1)(x - 3) = 0</div>
                    <div className="text-purple-600 dark:text-purple-400 font-bold">Roots: x = 1/2, x = 3 [Verified by Student ✓]</div>
                  </div>

                  <a
                    href="/samples/math_worksheet.png"
                    download={verifyingFocusItem.submitted_file?.name || 'remedial_solution.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Original Solution PDF</span>
                  </a>
                </div>

              </div>

              {/* Teacher Decision Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Faculty Appraisal &amp; Feedback Remarks (Visible to Student &amp; Parent):
                </label>
                <textarea
                  rows={3}
                  value={teacherVerificationRemarks}
                  onChange={(e) => setTeacherVerificationRemarks(e.target.value)}
                  placeholder="Add constructive validation feedback or correction notes..."
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Action triggers automatic parent co-tracking sync &amp; advances remedial Day status.
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleReturnSubmission(verifyingFocusItem.student_id, teacherVerificationRemarks)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800 hover:bg-rose-50 text-rose-700 dark:text-rose-300 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Return for Re-work</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVerifySubmission(verifyingFocusItem.student_id, teacherVerificationRemarks)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Approve &amp; Verify Remedial Work ✓</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL 1: APPLY SHORT-PERMISSION / LEAVE               */}
      {/* ===================================================== */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Apply Short Permission / Leave
                </h3>
              </div>
              <button onClick={() => setShowPermissionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleApplyPermission} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Permission Type
                </label>
                <select
                  value={newPermType}
                  onChange={(e) => setNewPermType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Late Arrival">Late Arrival (1 to 2 hours)</option>
                  <option value="Early Departure">Early Departure</option>
                  <option value="On-Duty Movement">On-Duty Movement (Science Olympiad / Competition)</option>
                  <option value="Casual Leave">Casual Leave (1 Day)</option>
                  <option value="Medical Leave">Medical Leave</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Date &amp; Time Window
                </label>
                <input
                  type="text"
                  value={newPermDate}
                  onChange={(e) => setNewPermDate(e.target.value)}
                  placeholder="e.g. Today, 11:30 AM - 01:00 PM"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Detailed Reason (for Principal Sign-Off)
                </label>
                <textarea
                  rows={3}
                  value={newPermReason}
                  onChange={(e) => setNewPermReason(e.target.value)}
                  placeholder="Provide specific reason for absence or permission..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4.5 py-2 text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit to Management
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL 2: SCHEDULE 1-ON-1 ONLINE PTM                   */}
      {/* ===================================================== */}
      {showPTMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Schedule Online Parent-Teacher Meeting
                </h3>
              </div>
              <button onClick={() => setShowPTMModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSchedulePTM} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Select Student / Parent
                </label>
                <select
                  value={ptmStudent}
                  onChange={(e) => setPtmStudent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Aarav Sharma">Aarav Sharma (Mr. Rajesh Sharma)</option>
                  <option value="Rohan Deshmukh">Rohan Deshmukh (Dr. Sunil Deshmukh)</option>
                  <option value="Meera Nambiar">Meera Nambiar (Mrs. Anita Nambiar)</option>
                  <option value="Kabir Mehta">Kabir Mehta (Mr. Suresh Mehta)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Meeting Date &amp; Time
                </label>
                <input
                  type="text"
                  value={ptmDate}
                  onChange={(e) => setPtmDate(e.target.value)}
                  placeholder="e.g. Tomorrow, 04:30 PM"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Discussion Agenda
                </label>
                <textarea
                  rows={2}
                  value={ptmAgenda}
                  onChange={(e) => setPtmAgenda(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200">
                💡 Automatically generates an encrypted video link and sends an SMS/Push invite to the parent's mobile app.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPTMModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4.5 py-2 text-xs font-bold shadow-md cursor-pointer"
                >
                  Confirm PTM Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL 3: REQUEST ACADEMIC TASK RELIEF / MIGRATION      */}
      {/* ===================================================== */}
      {showReliefModal && reliefSelectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Request Task Relief / Migration
                </h3>
              </div>
              <button onClick={() => setShowReliefModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRequestReliefSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
                <div className="font-bold">{reliefSelectedTask.title}</div>
                <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  Assigned SLA: {reliefSelectedTask.sla_hours || 24}h • Due: {reliefSelectedTask.due_date}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Primary Grounds for Relief
                </label>
                <select
                  value={reliefReason}
                  onChange={(e: any) => setReliefReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Academic Workload Surge">Academic Workload Surge (Exam evaluations / Practical labs)</option>
                  <option value="Medical Emergency">Medical Emergency / Health Concern</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Workload Context / Detailed Justification
                </label>
                <textarea
                  rows={3}
                  required
                  value={reliefJustification}
                  onChange={e => setReliefJustification(e.target.value)}
                  placeholder="Detail why you are unable to fulfill this task within the SLA window..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Suggested Peer Faculty (Optional)
                </label>
                <select
                  value={reliefSuggestedPeer}
                  onChange={e => setReliefSuggestedPeer(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                >
                  <option value="Mrs. Neha Roy">Mrs. Neha Roy (English)</option>
                  <option value="Dr. Suresh Babu">Dr. Suresh Babu (Science)</option>
                  <option value="Mr. Arvind Saxena">Mr. Arvind Saxena (Social Sciences)</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500">
                🛡️ <strong>Fair Workload Policy:</strong> Submitting relief immediately pauses your SLA and forwards the task to the Academic Coordinator for seamless re-assignment with zero penalty.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReliefModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer"
                >
                  Submit Relief Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL 4: FACULTY CURRICULUM UNIT LOGGING               */}
      {/* ===================================================== */}
      {logUnitCurriculum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Mark Curriculum Unit Completed
                </h3>
              </div>
              <button onClick={() => setLogUnitCurriculum(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTeacherLogUnitSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-teal-900 dark:text-teal-200">
                <div className="font-bold">{logUnitCurriculum.class_name} · {logUnitCurriculum.subject}</div>
                <div className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5">
                  Current: {logUnitCurriculum.completed_units}/{logUnitCurriculum.total_units} Units ({logUnitCurriculum.completion_pct}%) → New: {logUnitCurriculum.completed_units + 1}/{logUnitCurriculum.total_units} Units
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Lesson Title / Delivered Topic (Optional)
                </label>
                <input
                  type="text"
                  value={logUnitNotes}
                  onChange={e => setLogUnitNotes(e.target.value)}
                  placeholder="e.g. Chapter 4: Quadratic Equations - Graphical and Roots Method"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500">
                ✓ Pacing benchmark will be immediately recalibrated and synchronized with the Academic Coordinator console.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setLogUnitCurriculum(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm +1 Unit Delivered
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* Note: Student SIS is now served on dedicated page /teacher/students/[id] */}

    </RoleGuard>
  );
}
