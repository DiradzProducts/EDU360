'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CheckSquare, 
  Square, 
  ArrowUpRight, 
  TrendingUp, 
  BrainCircuit, 
  MessageSquareQuote,
  Download,
  BookOpen,
  Video,
  X,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Check,
  FileText,
  Filter,
  Eye,
  Award,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Send,
  Bell,
  UserCheck,
  CheckCheck,
  Printer,
  FileCheck,
  AlertTriangle,
  ExternalLink,
  FileSpreadsheet,
  Copy,
  PhoneCall,
  MessageSquare,
  Share2,
  Upload
} from 'lucide-react';
import { FocusTable, RevisionDay, HomeworkSubmission, ParentTeacherNote, AcademicCompliance, BacklogEvent } from '@/lib/types';
import { api } from '@/lib/api';
import { HomeworkCanvas } from '@/components/homework-canvas';

export interface FocusSubjectItem {
  id: string;
  subject: string;
  category: 'Critical Remedial' | 'Targeted Practice' | 'In Progress' | 'Approaching Target' | 'On Track';
  badgeColor: string;
  conceptTitle: string;
  identifiedSource: string;
  teacherName: string;
  currentMastery: number;
  targetGoal: number;
  diagnosticObservation: string;
  commonMistake: string;
  correctMethod: string;
  actionItems: { text: string; status: 'completed' | 'in_progress' | 'pending' }[];
  practicePdfName: string;
  practiceProblem: {
    question: string;
    hint: string;
    solution: string;
  };
  revisionDays: RevisionDay[];
}

export const ALL_FOCUS_SUBJECTS: FocusSubjectItem[] = [
  {
    id: 'math',
    subject: 'Mathematics',
    category: 'Critical Remedial',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    conceptTitle: 'Algebraic Fractions & Quadratic Equations',
    identifiedSource: 'Unit Test 2 (Questions 7 & 9)',
    teacherName: 'Mrs. Sunitha Rao',
    currentMastery: 42,
    targetGoal: 85,
    diagnosticObservation: 'Aarav correctly factors binomial denominators but loses negative signs during LCM expansion across multiple terms. Practice Set 2 is specifically calibrated to reinforce distributive sign rules.',
    commonMistake: 'Forgetting to distribute negative signs across numerators: -(3x - 5) written as -3x - 5 instead of -3x + 5.',
    correctMethod: 'Enclose the entire numerator in parentheses before expanding negative fraction signs: -(3x - 5) = -3x + 5.',
    actionItems: [
      { text: 'Review recorded video: Chapter 4 LCM Simplification (42 mins)', status: 'completed' },
      { text: 'Solve Practice Set 2 (15 Questions) — Due Oct 16', status: 'in_progress' },
      { text: 'Schedule 15-minute doubt-clearing with Mrs. Rao', status: 'pending' }
    ],
    practicePdfName: 'Mathematics_Algebraic_Fractions_Remedial_Set2.pdf',
    practiceProblem: {
      question: 'Simplify: (3 / (x - 2)) - ((2x + 1) / (x² - 4))',
      hint: 'Notice that x² - 4 factors as (x - 2)(x + 2). The LCM is (x - 2)(x + 2).',
      solution: 'Step 1: Factor denominator: x² - 4 = (x - 2)(x + 2).\nStep 2: Common denominator: [3(x + 2) - (2x + 1)] / [(x - 2)(x + 2)].\nStep 3: Expand numerator: (3x + 6 - 2x - 1) = (x + 5).\nFinal Answer: (x + 5) / ((x - 2)(x + 2)).'
    },
    revisionDays: [
      {
        day: 'Day 1',
        focus: 'Standard Form & Factorization',
        exercise: 'Solve 10 factoring problems (Set 4-A)',
        parent_checklist: 'Review sign convention rules',
        status: 'Completed'
      },
      {
        day: 'Day 2',
        focus: 'Completing the Square Method',
        exercise: 'Practice 8 step-by-step expansions',
        parent_checklist: 'Verify coefficient of x^2 is 1',
        status: 'In Progress'
      },
      {
        day: 'Day 3',
        focus: 'Quadratic Formula & Discriminant',
        exercise: 'Evaluate real vs imaginary roots (12 MCQs)',
        parent_checklist: 'Check b^2 - 4ac computation',
        status: 'Pending'
      },
      {
        day: 'Day 4',
        focus: 'Word Problems & Real-World Modeling',
        exercise: 'Solve 6 kinematic trajectory questions',
        parent_checklist: 'Sign off completion on focus card',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'physics',
    subject: 'Physics',
    category: 'Targeted Practice',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    conceptTitle: 'Convex & Concave Lens Ray Diagrams',
    identifiedSource: 'Lab Assessment 3',
    teacherName: 'Dr. K. Raman',
    currentMastery: 58,
    targetGoal: 85,
    diagnosticObservation: 'Confusion occurs when locating virtual focus points behind concave lenses. Remember: Rays parallel to the principal axis appear to diverge from the principal focus.',
    commonMistake: 'Drawing refracted rays converging inward for concave lenses instead of diverging outwards from the principal focus.',
    correctMethod: 'Extend the refracted divergent ray backward using a dashed line to locate virtual focal point F1.',
    actionItems: [
      { text: 'Completed optical bench physical lab measurements', status: 'completed' },
      { text: 'Draw 6 standard ray positions for convex lenses', status: 'in_progress' },
      { text: 'Submit digital ray tracing worksheet to Dr. Raman', status: 'pending' }
    ],
    practicePdfName: 'Physics_Ray_Optics_Diagram_Mastery_Sheet.pdf',
    practiceProblem: {
      question: 'An object is placed at 2F₁ in front of a convex lens of focal length 15 cm. Determine image position and nature.',
      hint: 'Recall lens formula: 1/f = 1/v - 1/u with sign convention: u = -30 cm, f = +15 cm.',
      solution: 'Step 1: Lens formula: 1/15 = 1/v - 1/(-30) => 1/15 - 1/30 = 1/v.\nStep 2: 1/v = (2 - 1)/30 = 1/30 => v = +30 cm.\nNature: Real, inverted, and same size as object formed at 2F₂ on the opposite side.'
    },
    revisionDays: [
      {
        day: 'Day 1',
        focus: 'Refraction & Lens Maker Principles',
        exercise: 'Calculate focal lengths with optical bench',
        parent_checklist: 'Verify sign conventions of u and v',
        status: 'Completed'
      },
      {
        day: 'Day 2',
        focus: '6 Standard Convex Ray Tracing Rules',
        exercise: 'Construct geometric ray diagrams on graph paper',
        parent_checklist: 'Inspect neatness of geometric compass rays',
        status: 'In Progress'
      },
      {
        day: 'Day 3',
        focus: 'Concave Lens Virtual Images & Divergence',
        exercise: 'Trace virtual rays with dashed extension lines',
        parent_checklist: 'Check dashed virtual ray extensions',
        status: 'Pending'
      },
      {
        day: 'Day 4',
        focus: 'Magnification & Power of Lenses Drill',
        exercise: 'Solve 8 lens power (P = 1/f) numerical problems',
        parent_checklist: 'Review 8 solved numerical problems',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'chemistry',
    subject: 'Chemistry',
    category: 'In Progress',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    conceptTitle: 'Valency Balancing & Polyatomic Ionic Equations',
    identifiedSource: 'Unit Test 2 (Questions 4 & 6)',
    teacherName: 'Mrs. S. Sen',
    currentMastery: 62,
    targetGoal: 85,
    diagnosticObservation: 'Aarav understands single atom oxidation numbers, but struggles when balancing polyatomic ions like SO4²⁻, NO3⁻, and PO4³⁻ in precipitation reactions.',
    commonMistake: 'Modifying the subscript of polyatomic ions (e.g. writing SO4_2 instead of 2 SO4) instead of adjusting stoichiometric coefficients.',
    correctMethod: 'Keep polyatomic ions in brackets as single units and only balance using external stoichiometric coefficients.',
    actionItems: [
      { text: 'Complete Valency Matrix worksheet (20 equations)', status: 'completed' },
      { text: 'Watch 15-min animation on ionic dissociation', status: 'in_progress' },
      { text: 'Verify rough notebook balancing with Mrs. Sen', status: 'pending' }
    ],
    practicePdfName: 'Chemistry_Chemical_Equations_Balancing_Set.pdf',
    practiceProblem: {
      question: 'Balance the precipitation reaction: BaCl₂ + Al₂(SO₄)₃ → BaSO₄ + AlCl₃',
      hint: 'Count polyatomic sulfate (SO₄) ions as a single cluster: 3 on LHS, so put 3 before BaSO₄.',
      solution: 'Step 1: Balance SO₄: 3 BaCl₂ + Al₂(SO₄)₃ → 3 BaSO₄ + AlCl₃.\nStep 2: Balance Al: 3 BaCl₂ + Al₂(SO₄)₃ → 3 BaSO₄ + 2 AlCl₃.\nStep 3: Check Cl: LHS has 3*2 = 6, RHS has 2*3 = 6. Balanced!'
    },
    revisionDays: [
      {
        day: 'Day 1',
        focus: 'Valency Chart of Common Ions',
        exercise: 'Memorize charges of ammonium, sulfate, nitrate',
        parent_checklist: 'Quiz student on valencies of nitrate and sulfate',
        status: 'Completed'
      },
      {
        day: 'Day 2',
        focus: 'Polyatomic Ions & Cross-Over Rule',
        exercise: 'Construct 12 correct ionic formulas',
        parent_checklist: 'Check 10 chemical formulas formed correctly',
        status: 'In Progress'
      },
      {
        day: 'Day 3',
        focus: 'Law of Conservation of Mass',
        exercise: 'Balance 10 single and double displacement reactions',
        parent_checklist: 'Verify atom counts match on both LHS & RHS',
        status: 'Pending'
      },
      {
        day: 'Day 4',
        focus: 'Precipitation Reaction Drill',
        exercise: 'Write balanced equations with states (s, aq, g)',
        parent_checklist: 'Sign off on 8 balanced equation problems',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'biology',
    subject: 'Biology',
    category: 'Approaching Target',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    conceptTitle: 'Cellular Respiration & Plant Tissue Transpiration',
    identifiedSource: 'Term Assessment 1 (Section B)',
    teacherName: 'Dr. P. Nair',
    currentMastery: 74,
    targetGoal: 88,
    diagnosticObservation: 'Aarav grasps stomatal opening and closing mechanisms well, but mixes up xylem vessel tracheids with phloem sieve tubes during active transport explanations.',
    commonMistake: 'Stating that transpiration pull moves sucrose downwards instead of mineral sap upwards.',
    correctMethod: 'Xylem conducts unidirectional water/minerals upward; Phloem translocates bidirectional organic solutes.',
    actionItems: [
      { text: 'Label microscopic cross-sections of dicot stem & leaf', status: 'completed' },
      { text: 'Review differences between aerobic and anaerobic ATP yields', status: 'completed' },
      { text: 'Attempt 10 MCQ rapid-fire quiz on EDU360', status: 'in_progress' }
    ],
    practicePdfName: 'Biology_Cell_Respiration_and_Transpiration_Drill.pdf',
    practiceProblem: {
      question: 'Explain why transpiration is called a "necessary evil" in plants.',
      hint: 'Connect water loss via stomata to the simultaneous requirement for CO₂ intake and cooling.',
      solution: 'Transpiration is necessary because it generates the suction pull required to transport water and minerals to tall trees and provides evaporative cooling. It is an "evil" because excessive water loss during hot dry spells can cause wilting and cellular death if uptake cannot keep pace.'
    },
    revisionDays: [
      {
        day: 'Day 1',
        focus: 'Xylem vs Phloem Microscopic Structure',
        exercise: 'Draw labeled diagram of sieve plates & vessels',
        parent_checklist: 'Review labeled hand-drawn diagram',
        status: 'Completed'
      },
      {
        day: 'Day 2',
        focus: 'Stomatal Osmosis & Transpiration Pull',
        exercise: 'Explain turgor pressure regulation in guard cells',
        parent_checklist: 'Verify explanation of turgor pressure',
        status: 'Completed'
      },
      {
        day: 'Day 3',
        focus: 'Glycolysis vs Fermentation ATP Output',
        exercise: 'Compare 38 ATP vs 2 ATP yield mechanisms',
        parent_checklist: 'Check ATP net equation breakdown',
        status: 'In Progress'
      },
      {
        day: 'Day 4',
        focus: 'Past 5-Year CBSE Question Bank Review',
        exercise: 'Write answers to 6 three-mark board exam questions',
        parent_checklist: 'Review 5 solved 3-mark questions',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'english',
    subject: 'English',
    category: 'In Progress',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    conceptTitle: 'Analytical Essay Structuring & Dangling Modifiers',
    identifiedSource: 'Unit Test 2 Literary Critique',
    teacherName: 'Ms. Deepa Menon',
    currentMastery: 68,
    targetGoal: 85,
    diagnosticObservation: 'Strong vocabulary and creative ideas, but paragraphs lack clear topic sentences, and subordinate clauses frequently dangle without clear subject antecedents.',
    commonMistake: 'Writing: "Walking into the laboratory, the microscope was broken" (the microscope was not walking).',
    correctMethod: '"Walking into the laboratory, Aarav noticed that the microscope was broken."',
    actionItems: [
      { text: 'Complete P.E.E.L (Point, Evidence, Explanation, Link) essay outline', status: 'completed' },
      { text: 'Correct 15 sentences with dangling and misplaced modifiers', status: 'in_progress' },
      { text: 'Submit revised literary critique paragraph to Ms. Menon', status: 'pending' }
    ],
    practicePdfName: 'English_Grammar_and_Essay_Structure_Worksheet.pdf',
    practiceProblem: {
      question: 'Identify and fix the dangling modifier: "Having finished the assignment, the TV was turned on."',
      hint: 'Who finished the assignment? The introductory participle must modify the subject of the main clause.',
      solution: 'Error: The TV did not finish the assignment.\nCorrection: "Having finished the assignment, Aarav turned on the TV." OR "After Aarav finished the assignment, he turned on the TV."'
    },
    revisionDays: [
      {
        day: 'Day 1',
        focus: 'P.E.E.L Paragraph Structure Masterclass',
        exercise: 'Write 1 topic sentence with evidence & commentary',
        parent_checklist: 'Check 1-page essay outline structure',
        status: 'Completed'
      },
      {
        day: 'Day 2',
        focus: 'Dangling & Misplaced Modifiers Identification',
        exercise: 'Identify and rewrite 10 ambiguous sentences',
        parent_checklist: 'Review 10 sentence rewrites',
        status: 'In Progress'
      },
      {
        day: 'Day 3',
        focus: 'Tense Consistency in Analytical Writing',
        exercise: 'Maintain literary present tense across 2 paragraphs',
        parent_checklist: 'Verify past vs literary present tense usage',
        status: 'Pending'
      },
      {
        day: 'Day 4',
        focus: '250-Word Argumentative Synthesis Essay',
        exercise: 'Draft timed essay on Character Evolution',
        parent_checklist: 'Read essay draft aloud with student',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'cs',
    subject: 'Computer Science',
    category: 'On Track',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    conceptTitle: 'Python Nested Loops & Multidimensional Lists',
    identifiedSource: 'Lab Coding Assessment 2',
    teacherName: 'Mr. V. Nair',
    currentMastery: 82,
    targetGoal: 92,
    diagnosticObservation: 'Good algorithmic logic; minor index out-of-range errors when traversing 2D grid matrices.',
    commonMistake: 'Confusing row and col indices in matrix[i][j] when rows and columns have unequal dimensions.',
    correctMethod: 'Use len(matrix) for rows and len(matrix[0]) for columns to prevent index bounds errors.',
    actionItems: [
      { text: 'Code 2D matrix multiplication script in Python', status: 'completed' },
      { text: 'Complete 5 algorithmic pattern challenges (stars & numbers)', status: 'completed' },
      { text: 'Push completed lab tasks to EDU360 student repository', status: 'in_progress' }
    ],
    practicePdfName: 'Python_2D_Arrays_and_Nested_Loops_Exercises.pdf',
    practiceProblem: {
      question: 'Write a Python function to compute the diagonal sum of an N x N square matrix.',
      hint: 'Primary diagonal elements are located where row index equals column index: matrix[i][i].',
      solution: 'def diagonal_sum(matrix):\n    total = 0\n    for i in range(len(matrix)):\n        total += matrix[i][i]\n    return total\n# Runs in O(N) time efficiency.'
    },
    revisionDays: [
      {
        day: 'Day 1',
        focus: '2D Array Memory Allocation & Indexing',
        exercise: 'Declare and print 3x3 matrices using list comprehensions',
        parent_checklist: 'Inspect working Python script on laptop',
        status: 'Completed'
      },
      {
        day: 'Day 2',
        focus: 'Nested For-Loops & Matrix Traversals',
        exercise: 'Iterate through 2D grids row-wise and column-wise',
        parent_checklist: 'Verify grid output printed in console',
        status: 'Completed'
      },
      {
        day: 'Day 3',
        focus: 'List Comprehensions & 2D Filtering',
        exercise: 'Flatten 2D matrix into 1D list in one line of code',
        parent_checklist: 'Check 4 one-liner comprehension examples',
        status: 'In Progress'
      },
      {
        day: 'Day 4',
        focus: 'Mini-Project: 2D Tic-Tac-Toe Grid Validator',
        exercise: 'Check rows, columns, and diagonals for win conditions',
        parent_checklist: 'Play 1 game round on student program',
        status: 'Pending'
      }
    ]
  },
  {
    id: 'social',
    subject: 'Social Science',
    category: 'Approaching Target',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    conceptTitle: 'Cartography, Contour Intervals & Mughal Administration',
    identifiedSource: 'Periodic Test 2 (Section C)',
    teacherName: 'Ms. P. Roy',
    currentMastery: 76,
    targetGoal: 88,
    diagnosticObservation: 'Aarav has thorough chronological recall of historical dates, but loses marks on topographic map interpretation (contour intervals and slope gradients).',
    commonMistake: 'Assuming closely spaced contour lines represent gentle terrain rather than steep cliffs.',
    correctMethod: 'Closely spaced contours = steep slope; widely spaced contours = gentle gradient.',
    actionItems: [
      { text: 'Practice 1:50,000 Survey of India grid map interpretation', status: 'completed' },
      { text: 'Draw comparative diagram of Mansabdari military ranks', status: 'in_progress' },
      { text: 'Complete 15 topographic feature identification exercises', status: 'pending' }
    ],
    practicePdfName: 'SocialScience_Topomap_and_Contour_Interpretation.pdf',
    practiceProblem: {
      question: 'How do you distinguish between a conical hill and a plateau using contour lines?',
      hint: 'Check the shape of the center-most contour line and the spacing in between.',
      solution: 'A conical hill has concentric circular contours that rise uniformly with a single central peak point. A plateau has steep outer slopes with closely spaced contours at the edges, but a broad, flat top represented by widely separated contours or a flat central expanse.'
    },
    revisionDays: [
      {
        day: 'Day 1',
        focus: 'Topographical Symbols & Contour Line Spacing',
        exercise: 'Identify cliffs, ridges, and spurs on sample sheet',
        parent_checklist: 'Review elevation slope diagram',
        status: 'Completed'
      },
      {
        day: 'Day 2',
        focus: '4-Figure and 6-Figure Grid References',
        exercise: 'Pinpoint 8 geographical landmarks with grid coordinates',
        parent_checklist: 'Check 6 map coordinates located accurately',
        status: 'Completed'
      },
      {
        day: 'Day 3',
        focus: 'Akbar\'s Mansabdari & Zabt Revenue System',
        exercise: 'Explain differences between Zat and Sawar numerical ranks',
        parent_checklist: 'Quiz student on Zat vs Sawar rank',
        status: 'In Progress'
      },
      {
        day: 'Day 4',
        focus: 'Map Pointing Mock Test: Rivers & Mountain Passes',
        exercise: 'Mark 10 major physical features on blank India map',
        parent_checklist: 'Sign off on completed blank outline map',
        status: 'Pending'
      }
    ]
  }
];

interface FocusTableViewProps {
  table?: FocusTable | null;
  submission?: HomeworkSubmission | null;
  isParentView?: boolean;
  isNewUser?: boolean;
  currentRole?: 'teacher' | 'parent' | 'student';
  studentInfo?: {
    name: string;
    rollNo?: string;
    className?: string;
    parentName?: string;
    parentPhone?: string;
  };
  onToggleParentCheck?: () => Promise<void>;
  onUpdateStatus?: (newStatus: string) => Promise<void>;
  onSchedulePtm?: () => void;
  onChatWithParent?: () => void;
  onVerifyRemedial?: (subjectId: string, remarks?: string) => void;
  initialRemedialStatus?: Record<string, {
    fileName: string;
    fileSize: string;
    notes?: string;
    submittedAt: string;
    verified?: boolean;
    verifiedAt?: string;
    teacherRemarks?: string;
  }>;
}

export function FocusTableView({ 
  table, 
  submission,
  isParentView = false, 
  isNewUser = false,
  currentRole,
  studentInfo,
  onToggleParentCheck,
  onUpdateStatus,
  onSchedulePtm,
  onChatWithParent,
  onVerifyRemedial,
  initialRemedialStatus
}: FocusTableViewProps) {
  // Determine effective role (parent if isParentView or explicitly passed; student if currentRole === 'student')
  const isStudent = currentRole === 'student';
  const isParent = !isStudent && (Boolean(isParentView) || currentRole === 'parent');
  const isTeacher = !isStudent && !isParent && (currentRole === 'teacher' || (!currentRole && !isParentView));

  // Check for newly registered user without assigned remedial interventions
  const isCleanNewUser = isNewUser || !table || table.status === 'not_enrolled' || (!table.subject && !table.weak_concept);

  // Active subject selection (defaults to mathematics or table.subject)
  const initialSubjectId = table?.subject?.toLowerCase().includes('physic') ? 'physics' : 'math';
  const [activeSubjectId, setActiveSubjectId] = useState<string>(initialSubjectId);
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'critical' | 'in_progress' | 'on_track'>('all');

  // For Parents: default to viewing CURRENT DAY homework/practice only to avoid clutter!
  const [parentViewMode, setParentViewMode] = useState<'today_only' | 'full_plan'>('today_only');
  const [briefingCopied, setBriefingCopied] = useState(false);
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'missed' | 'graded'>('all');

  // Modals for opening cards & diagnostic evidence
  const [selectedDayModal, setSelectedDayModal] = useState<RevisionDay | null>(null);
  const [selectedSubjectModal, setSelectedSubjectModal] = useState<FocusSubjectItem | null>(null);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [showPracticeSolution, setShowPracticeSolution] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState<ParentTeacherNote[]>([]);
  const [complianceData, setComplianceData] = useState<AcademicCompliance | null>(null);
  const [isExportReportModalOpen, setIsExportReportModalOpen] = useState(false);

  // Guardian approval state: NEVER auto-approved by default
  const [guardianApproved, setGuardianApproved] = useState<boolean>(
    Boolean(table?.status === 'approved' && table?.parent_check_completed === true)
  );
  const [guardianNotified, setGuardianNotified] = useState(false);
  const [approvalDate, setApprovalDate] = useState<string | null>(
    table?.status === 'approved' && table?.parent_check_completed ? '13 Oct 2026' : null
  );

  // Remedial Practice Solution Submission State (Per Subject)
  const [remedialSubmissions, setRemedialSubmissions] = useState<Record<string, {
    fileName: string;
    fileSize: string;
    notes?: string;
    submittedAt: string;
    verified?: boolean;
    verifiedAt?: string;
    teacherRemarks?: string;
  }>>(initialRemedialStatus || {
    math: {
      fileName: 'Aarav_Quadratic_Factorization_Rough_Notebook.pdf',
      fileSize: '1.4 MB',
      notes: 'Completed 4 middle-term splitting questions. Checked negative sign distribution in Q3 & Q4.',
      submittedAt: 'Today, 08:30 AM',
      verified: false
    }
  });
  const [currentRemedialFile, setCurrentRemedialFile] = useState<File | null>(null);
  const [currentRemedialNotes, setCurrentRemedialNotes] = useState<string>('');
  const [isSubmittingRemedial, setIsSubmittingRemedial] = useState<boolean>(false);
  const remedialFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleRemedialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentRemedialFile(file);
      triggerNotification(`Practice file selected: ${file.name}`);
    }
  };

  const handleSubmitRemedialWork = () => {
    if (!currentRemedialFile) return;
    setIsSubmittingRemedial(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setRemedialSubmissions(prev => ({
        ...prev,
        [activeSubject.id]: {
          fileName: currentRemedialFile.name,
          fileSize: `${(currentRemedialFile.size / 1024).toFixed(1)} KB`,
          notes: currentRemedialNotes.trim() || undefined,
          submittedAt: timeStr,
          verified: false
        }
      }));
      setIsSubmittingRemedial(false);
      setCurrentRemedialFile(null);
      setCurrentRemedialNotes('');
      triggerNotification('✓ Remedial Practice Solution submitted! Awaiting teacher verification.');
    }, 400);
  };

  const handleResetRemedialSubmission = (subjectId: string) => {
    setRemedialSubmissions(prev => {
      const updated = { ...prev };
      delete updated[subjectId];
      return updated;
    });
    setCurrentRemedialFile(null);
    setCurrentRemedialNotes('');
  };

  const handleTeacherVerifyRemedial = (subjectId: string, remarks?: string) => {
    setRemedialSubmissions(prev => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || {
          fileName: 'Remedial_Practice_Notebook.pdf',
          fileSize: '1.2 MB',
          submittedAt: 'Today'
        }),
        verified: true,
        verifiedAt: 'Just now',
        teacherRemarks: remarks || 'Practice verified. Factoring technique and sign accuracy approved.'
      }
    }));
    if (onVerifyRemedial) {
      onVerifyRemedial(subjectId, remarks);
    }
    triggerNotification(`✓ Verified ${studentInfo?.name || 'Student'}'s remedial practice solution!`);
  };

  const handleTeacherReturnRemedial = (subjectId: string, remarks: string) => {
    setRemedialSubmissions(prev => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || {
          fileName: 'Remedial_Practice_Notebook.pdf',
          fileSize: '1.2 MB',
          submittedAt: 'Today'
        }),
        verified: false,
        teacherRemarks: remarks
      }
    }));
    triggerNotification(`Returned remedial solution to ${studentInfo?.name || 'Student'} with revision notes.`);
  };

  React.useEffect(() => {
    async function loadEvidenceNotes() {
      try {
        const notes = await api.getParentTeacherNotes(1);
        setEvidenceNotes(notes.filter(n => n.is_focus_table_evidence));
      } catch (err) {
        console.error('Error loading Focus Table evidence notes', err);
      }
    }
    loadEvidenceNotes();

    async function loadComplianceData() {
      try {
        const comp = await api.getAcademicCompliance(table?.student_id || 1);
        setComplianceData(comp);
      } catch (err) {
        console.error('Error loading Academic Compliance data', err);
      }
    }
    loadComplianceData();
  }, [table]);

  // Fallback realistic homework submission if not loaded yet
  const activeSubmission: HomeworkSubmission = submission || {
    id: 1,
    homework_id: 1,
    student_id: 1,
    student_name: 'Aarav Sharma',
    original_file_url: '/samples/math_worksheet_4.pdf',
    annotated_file_url: '/samples/math_worksheet_4_annotated.pdf',
    annotations_json: JSON.stringify([
      { type: 'tick', x: 420, y: 140, color: '#16a34a' },
      { type: 'tick', x: 420, y: 220, color: '#16a34a' },
      { type: 'circle', x: 380, y: 310, color: '#dc2626' },
      { type: 'text', x: 390, y: 320, color: '#dc2626', text: 'Sign error: -(3x-5) = -3x+5' },
      { type: 'tick', x: 420, y: 440, color: '#16a34a' }
    ]),
    marks_obtained: 17.5,
    teacher_remarks: 'Aarav demonstrates excellent factoring of denominators. However, in Q3 distributive negative sign was missed (-3x-5). Recommended 4-day revision on sign expansion before Mid-Terms.',
    status: 'graded',
    submitted_at: '2026-10-12T14:30:00Z',
    graded_at: '2026-10-13T09:15:00Z'
  };

  // Close modals on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDayModal(null);
        setSelectedSubjectModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Parent verified state - defaults to false unless explicitly approved
  const [parentCheckedMap, setParentCheckedMap] = useState<Record<string, boolean>>({
    math: Boolean(table?.status === 'approved' && table?.parent_check_completed),
    physics: false,
    chemistry: false,
    biology: false,
    english: false,
    cs: false,
    social: false
  });

  const activeSubject = ALL_FOCUS_SUBJECTS.find(s => s.id === activeSubjectId) || ALL_FOCUS_SUBJECTS[0];

  const triggerNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGuardianApprove = async () => {
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setGuardianApproved(true);
    setApprovalDate(nowStr);
    setParentCheckedMap(prev => ({
      ...prev,
      [activeSubject.id]: true
    }));
    if (onUpdateStatus) {
      await onUpdateStatus('approved');
    }
    triggerNotification('Focus Table Plan successfully reviewed and approved by Guardian!');
  };

  const handleNotifyGuardian = () => {
    setGuardianNotified(true);
    triggerNotification('Notification dispatched to Guardian via WhatsApp & Mobile App!');
  };

  const toggleParentCheckForSubject = async (subId: string) => {
    if (!guardianApproved) {
      triggerNotification('Plan must be approved by Guardian before verifying daily notebooks.');
      return;
    }
    setParentCheckedMap(prev => ({
      ...prev,
      [subId]: !prev[subId]
    }));
    if (onToggleParentCheck) {
      await onToggleParentCheck();
    }
    triggerNotification(`Parent co-tracking status updated for ${activeSubject.subject}!`);
  };

  // Filtered list of subjects for cards below
  const filteredSubjects = ALL_FOCUS_SUBJECTS.filter(item => {
    if (subjectFilter === 'critical') return item.currentMastery < 60;
    if (subjectFilter === 'in_progress') return item.currentMastery >= 60 && item.currentMastery < 75;
    if (subjectFilter === 'on_track') return item.currentMastery >= 75;
    return true;
  });

  // CLEAN EMPTY INITIAL STATE FOR NEW USERS
  if (isCleanNewUser) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center shadow-md space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <ShieldCheck className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-3 py-1 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Clean Initial Academic Record</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Focus Table &mdash; No Active Remedial Plan Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              This newly created account has zero active remediation backlogs, missed assignment deadlines, or flagged misconceptions. Your record is completely clear.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Curriculum Status</span>
              <span className="text-sm font-black text-slate-900 dark:text-white mt-1 block">Regular Track</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">100% On-Schedule</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Guardian Approval</span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400 mt-1 block">Not Required</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">No Active Plan</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Diagnostic Backlogs</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 block">0 Issues Flagged</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">Clean Baseline</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-left text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
              <Target className="h-4 w-4 text-blue-600" />
              <span>How the Focus Table &amp; Guardian Approval Process Works</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Whenever a teacher grades homework or exams and flags an area needing reinforcement, a structured 4-day revision timetable is created. <b>The system will automatically alert your linked guardian, and the plan only enters &quot;Approved&quot; status once the guardian explicitly reviews and signs off on it.</b>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. SUBJECT FILTER STRIP & QUICK STATS                     */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-bold border border-purple-200 dark:border-purple-800">
                <Target className="h-3.5 w-3.5" />
                Curriculum Focus Tracker (All 7 Subjects)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Click any subject below to switch the 4-day timetable &amp; inspect diagnostic sets
              </span>
            </div>
            <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white">
              Subject Mastery &amp; Weak Concept Intervention Hub
            </h3>
          </div>

          {/* Quick Mastery Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSubjectFilter('all')}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                subjectFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Subjects (7)
            </button>
            <button
              onClick={() => setSubjectFilter('critical')}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                subjectFilter === 'critical'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🔴 Critical (2)
            </button>
            <button
              onClick={() => setSubjectFilter('in_progress')}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                subjectFilter === 'in_progress'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🟡 In Progress (3)
            </button>
            <button
              onClick={() => setSubjectFilter('on_track')}
              className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
                subjectFilter === 'on_track'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🟢 On Track (2)
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Subject Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {filteredSubjects.map((item) => {
            const isSelected = item.id === activeSubjectId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSubjectId(item.id);
                  triggerNotification(`Switched 4-Day Timetable to ${item.subject}!`);
                }}
                className={`rounded-2xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{item.subject}</span>
                <span className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-black ${
                  item.currentMastery < 60 
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' 
                    : item.currentMastery < 75 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {item.currentMastery}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1.5 TEACHER PARENTAL CONNECTION & PTM EVIDENCE DOSSIER   */}
      {/* (Exclusively visible to Teachers for parental connect)    */}
      {/* ========================================================= */}
      {isTeacher && (
        <div className="rounded-3xl border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-950 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-black border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  PTM Parental Connection Dossier
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Verifiable Homework &amp; Missed Work Telemetry
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                Teacher Evidence Dossier for Parental Connection
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Target: <strong>{studentInfo?.name || 'Aarav Sharma'}</strong> ({studentInfo?.className || 'Class 8-B'}) • Guardian: <strong>{studentInfo?.parentName || 'Mr. Rajesh Sharma'}</strong> ({studentInfo?.parentPhone || '+91 98450 12345'})
              </p>
            </div>

            {/* Quick Actions for Teacher */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const script = `PTM BRIEFING FOR ${studentInfo?.name || 'Aarav Sharma'}:\n1. Diagnostic Graded HW: Worksheet #4 scored 17.5/20. Misconception identified in distributing negative signs across binomial denominators -(3x-5).\n2. Missed Work / Backlog: Worksheet 4.2 (Factorization) exceeded deadline on 15 Oct 2026. Evidence Code #EVD-BKLOG-884.\n3. Remedial Action: Active 4-Day targeted practice plan. Guardian requested to verify Day 2 rough notebook tonight.`;
                  navigator.clipboard.writeText(script);
                  setBriefingCopied(true);
                  triggerNotification('PTM Evidence & Talking Points copied to clipboard!');
                  setTimeout(() => setBriefingCopied(false), 3000);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 px-3.5 py-2 text-xs font-bold transition-all shadow-2xs active:scale-95"
              >
                {briefingCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{briefingCopied ? 'Briefing Copied ✓' : 'Copy Call Script'}</span>
              </button>

              <button
                onClick={() => {
                  if (onSchedulePtm) {
                    onSchedulePtm();
                  } else {
                    triggerNotification(`Opening PTM Conference Scheduler for ${studentInfo?.parentName || 'Mr. Rajesh Sharma'}`);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call / Schedule PTM</span>
              </button>

              <button
                onClick={() => setIsExportReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-3.5 py-2 text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Export PTM PDF</span>
              </button>
            </div>
          </div>

          {/* Dual Evidence Summary Grid (Homework vs Missed Work) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* EVIDENCE 1: DIAGNOSTIC GRADED HOMEWORK */}
            <div className="rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/30 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  1. Graded Homework Evidence
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                  Score: {activeSubmission.marks_obtained || 17.5} / 20
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Worksheet #4: Algebraic Fractions &amp; Quadratic Roots
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900">
                <strong>Pedagogical Finding:</strong> &ldquo;Aarav accurately factors binomial denominators, but drops negative signs during LCM numerator expansion in Q3: <code>-(3x - 5)</code> written as <code>-3x - 5</code> instead of <code>-3x + 5</code>.&rdquo;
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">Teacher: Mrs. Sunitha Rao</span>
                <button
                  onClick={() => setEvidenceModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
                >
                  <Eye className="h-3 w-3" />
                  <span>Inspect Graded Canvas &rarr;</span>
                </button>
              </div>
            </div>

            {/* EVIDENCE 2: MISSED WORK / ACTIVE BACKLOG */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  2. Missed Work / Overdue Cutoff
                </span>
                <span className="rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 text-[10px] font-bold">
                  UNRESOLVED BACKLOG
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Worksheet 4.2: Solving Quadratics by Factoring
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900">
                <strong>Telemetry Audit:</strong> &ldquo;Student missed scheduled cutoff on 15 Oct 2026, 05:00 PM. Automatically transitioned to Backlog for parent review to ensure study consistency before Mid-Terms.&rdquo;
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-slate-500">Audit Code: #EVD-BKLOG-884</span>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400">Overdue by 3 Days</span>
              </div>
            </div>

          </div>

          {/* Talking Points Call Script Box */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/80 p-3.5 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
              <MessageSquareQuote className="h-3.5 w-3.5" />
              Prepared Talking Points for Call with {studentInfo?.parentName || 'Mr. Rajesh Sharma'}:
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
              &ldquo;Good afternoon Mr. Sharma. Calling to review Aarav&apos;s progress in Mathematics. He scored 17.5/20 on Worksheet #4 showing strong core factoring. However, Worksheet 4.2 missed its deadline on Oct 15 and is logged as an unresolved backlog. We have put him on a 4-day targeted practice plan to master distributive signs. Please inspect his rough notebook for Day 2 practice tonight.&rdquo;
            </p>
          </div>

          {/* FACULTY REMEDIAL PRACTICE SOLUTION VERIFICATION */}
          {(() => {
            const activeRemedial = remedialSubmissions[activeSubject.id];
            return (
              <div className="rounded-2xl border border-emerald-200/90 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 dark:border-emerald-900/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Remedial Practice Solution Verification</span>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                          Teacher Verification Queue
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Target Concept: <strong>{activeSubject.conceptTitle}</strong> ({activeSubject.subject})
                      </p>
                    </div>
                  </div>

                  {activeRemedial?.verified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Verified by Faculty ✓</span>
                    </span>
                  ) : activeRemedial ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-white px-3 py-1 text-xs font-bold shadow-xs">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Awaiting Teacher Verification</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 text-xs font-bold">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Pending Student Upload</span>
                    </span>
                  )}
                </div>

                {activeRemedial ? (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-900">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">Uploaded Solution:</span>
                        <span className="font-mono text-purple-700 dark:text-purple-300 font-semibold truncate max-w-[280px]">
                          {activeRemedial.fileName}
                        </span>
                        <span className="text-slate-400 font-normal">({activeRemedial.fileSize})</span>
                        <span className="text-[10px] text-slate-500">• {activeRemedial.submittedAt}</span>
                      </div>
                      {activeRemedial.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          Student note: &ldquo;{activeRemedial.notes}&rdquo;
                        </p>
                      )}
                      {activeRemedial.teacherRemarks && (
                        <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium bg-emerald-50/80 dark:bg-emerald-950/60 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          Faculty note: &ldquo;{activeRemedial.teacherRemarks}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!activeRemedial.verified ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleTeacherVerifyRemedial(activeSubject.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Check className="h-4 w-4" />
                            <span>Verify &amp; Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTeacherReturnRemedial(activeSubject.id, 'Please recheck negative signs in Q3 & Q4.')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800 hover:bg-rose-50 text-rose-700 dark:text-rose-300 px-3 py-2 text-xs font-bold transition-all cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                            <span>Return with Note</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                            Solution Verified ✓
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Focus table progression synced
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-slate-600 dark:text-slate-400">
                      Student has not uploaded their rough notebook solution for {activeSubject.subject} yet.
                    </span>
                    <button
                      type="button"
                      onClick={() => triggerNotification(`Remind SMS & App prompt sent to ${studentInfo?.name || 'Aarav'} & parent.`)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-3 py-1.5 font-bold hover:bg-amber-100 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Bell className="h-3.5 w-3.5" />
                      <span>Send Reminder</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ACTIVE REVISION PLAN & TIMETABLE                       */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
        
        {/* Top Header of Active Plan */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-bold border border-purple-200 dark:border-purple-800">
                <Sparkles className="h-3.5 w-3.5" />
                Active Co-Tracked Plan
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {activeSubject.subject} • {activeSubject.teacherName}
              </span>

              {/* GUARDIAN APPROVAL STATUS BADGE (NEVER AUTO-APPROVED) */}
              {!isStudent && (
                guardianApproved ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-3 py-1 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Guardian Approved ({approvalDate || 'Verified'})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-3 py-1 text-xs font-bold border border-amber-300 dark:border-amber-700">
                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Awaiting Guardian Review &amp; Approval</span>
                  </span>
                )
              )}
            </div>

            <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
              Target Intervention: {activeSubject.conceptTitle}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Identified in {activeSubject.identifiedSource} • 4-Day Targeted Study (30 Mins / Day)
            </span>

            {/* Workflow Action for Guardian Approval (Teachers & Parents Only) */}
            {!isStudent && !guardianApproved && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-2xl border border-amber-200 dark:border-amber-800/60">
                {isParent ? (
                  <button
                    onClick={handleGuardianApprove}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Review &amp; Confirm Guardian Approval</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNotifyGuardian}
                    disabled={guardianNotified}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    <span>{guardianNotified ? 'Guardian Notification Dispatched ✓' : 'Notify Guardian for Explicit Approval'}</span>
                  </button>
                )}
                <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  {isParent 
                    ? 'As student guardian, confirm approval to unlock co-signed notebook tracking.'
                    : 'System enforces zero auto-approval. Guardian must verify plan.'}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons: Full Diagnostic & Practice Sets (+ Teacher Evidence Inspect) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-purple-50/70 dark:bg-purple-950/40 p-2.5 rounded-2xl border border-purple-200 dark:border-purple-800">
              <div className="text-center px-3 border-r border-purple-200 dark:border-purple-800">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Current</span>
                <span className="text-base font-black text-red-600 dark:text-red-400 tabular-nums">
                  {activeSubject.currentMastery}%
                </span>
              </div>
              <div className="text-center px-3">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">Target Goal</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {activeSubject.targetGoal}%
                </span>
              </div>
              <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

            {/* Inspect Graded Evidence: Strictly for Teachers for parental connection */}
            {isTeacher && (
              <button
                onClick={() => setEvidenceModalOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-3.5 py-3 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Inspect teacher-annotated homework worksheet where the misconception was identified"
              >
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Inspect Graded Evidence ({activeSubmission.marks_obtained || 17.5}/20)</span>
              </button>
            )}

            <button
              onClick={() => setSelectedSubjectModal(activeSubject)}
              className="flex items-center gap-1.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              <span>Full Diagnostic &amp; Practice</span>
            </button>
          </div>
        </div>

        {/* TIMETABLE VIEW / PARENT CURRENT DAY VIEW */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>
                {isParent && parentViewMode === 'today_only'
                  ? "Today's Active Focus & Homework (Current Day Only)"
                  : '4-Day Targeted Revision Timetable'}
              </span>
            </h4>

            {/* Parent Toggle: Current Day Only vs Full 4-Day Plan */}
            {isParent ? (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setParentViewMode('today_only')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    parentViewMode === 'today_only'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Today&apos;s Focus Only (Clean View)
                </button>
                <button
                  onClick={() => setParentViewMode('full_plan')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    parentViewMode === 'full_plan'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  View Full 4-Day Plan
                </button>
              </div>
            ) : (
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                Co-tracked by Teacher &amp; Parent
              </span>
            )}
          </div>

          {/* PARENT CLEAN HERO CARD: TODAY'S HOMEWORK ONLY */}
          {isParent && parentViewMode === 'today_only' ? (
            <div className="rounded-2xl border border-purple-200/90 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-600 text-white px-3 py-0.5 text-xs font-black">
                    Day 2 • Active Today
                  </span>
                  <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-0.5 text-[11px] font-bold">
                    In Progress
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Profile kept clean: Displaying current day homework only
                </span>
              </div>

              <div className="space-y-1">
                <h5 className="text-base font-black text-slate-900 dark:text-white">
                  Focus: Completing the Square Method &amp; Standard Form
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Prescribed 30-Min Practice: <strong>Practice 8 step-by-step expansions</strong> in rough study notebook. Ensure intermediate quadratic steps are written out.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-900 dark:text-purple-300 block">
                    Parent Home Check Requirement:
                  </span>
                  <p className="text-xs font-semibold text-purple-800 dark:text-purple-200 italic">
                    &ldquo;Verify coefficient of x^2 is 1 and check sign before completing square.&rdquo;
                  </p>
                </div>

                <button
                  onClick={() => toggleParentCheckForSubject(activeSubject.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 active:scale-95 ${
                    parentCheckedMap[activeSubject.id]
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {parentCheckedMap[activeSubject.id] ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  <span>{parentCheckedMap[activeSubject.id] ? 'Co-Signed & Verified ✓' : 'Mark Daily Notebook Verified'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* 4-DAY GRID (MODERNIZED & CLEAN) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeSubject.revisionDays.map((item, idx) => {
                const isCompleted = item.status === 'Completed';
                const isInProgress = item.status === 'In Progress';

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedDayModal(item)}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.01] hover:shadow-sm ${
                      isCompleted 
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20' 
                        : isInProgress
                        ? 'border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-400/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {item.day}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          isCompleted 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : isInProgress 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' 
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <h5 className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                        {item.focus}
                      </h5>

                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {item.exercise}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                        Parent Home Check:
                      </span>
                      <p className="text-[10px] text-slate-700 dark:text-slate-300 line-clamp-1 italic">
                        &quot;{item.parent_checklist}&quot;
                      </p>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1.5 block group-hover:underline">
                        Open day plan &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. REFINED STRATEGY & PRACTICE CARDS */}
        {isStudent ? (
          /* ========================================================= */
          /* STUDENT VIEW: PURE LEARNING & DRILL (ZERO EVIDENCE/PTM)   */
          /* ========================================================= */
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Teacher Guidance Strategy */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    <BrainCircuit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Teacher Strategy ({activeSubject.teacherName}):</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-3">
                    &quot;{activeSubject.diagnosticObservation}&quot;
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Remedial focus: Daily 30-min targeted exercises
                </span>
              </div>

              {/* 2. Common Pitfall & How to Solve Correctly (Educational focus, NOT evidence) */}
              <div className="rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-800 flex flex-col justify-between space-y-2 p-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span>Key Rule: Avoid Sign Pitfall</span>
                    </div>
                    <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                      Crucial Step
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200 line-clamp-2">
                    {activeSubject.commonMistake}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubjectModal(activeSubject)}
                  className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Practice Rule &amp; View Solution &rarr;</span>
                </button>
              </div>

              {/* 3. Daily Practice Goal & Student Target */}
              <div className="rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 p-4 border border-purple-200/90 dark:border-purple-800 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">
                    <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Today&apos;s Practice Target</span>
                  </div>
                  <p className="text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
                    Solve 8 step-by-step expansions in rough study notebook. Ensure parentheses are used when distributing signs.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900 flex items-center justify-between text-[11px] text-purple-800 dark:text-purple-300 font-semibold">
                  <span>Zero Period Check Tomorrow</span>
                  <span className="text-emerald-600 font-bold">🎯 In Progress</span>
                </div>
              </div>
            </div>

            {/* 4. DEDICATED REMEDIAL PRACTICE SOLUTION SUBMISSION CARD */}
            {(() => {
              const activeRemedial = remedialSubmissions[activeSubject.id];
              return (
                <div className="rounded-3xl border border-purple-200/90 dark:border-purple-800/80 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Remedial Practice Solution Submission</span>
                          <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 text-[10px] font-bold">
                            Targeted Solution Upload
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Upload snapshots or scanned PDF of your handwritten rough notebook drills for teacher review.
                        </p>
                      </div>
                    </div>

                    {/* Target Topic indicator */}
                    <div className="flex items-center gap-2 bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-900 dark:text-purple-200 self-start sm:self-auto">
                      <Target className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="font-bold">{activeSubject.subject}:</span>
                      <span className="truncate max-w-[220px]">{activeSubject.conceptTitle} (Practice Set 2)</span>
                    </div>
                  </div>

                  {activeRemedial ? (
                    /* Instant visual confirmation state */
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0 mt-0.5">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="rounded-full bg-emerald-600 text-white px-3 py-0.5 text-[11px] font-bold flex items-center gap-1 shadow-xs">
                              <Check className="h-3 w-3" />
                              Submitted — Awaiting Teacher Verification
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {activeRemedial.submittedAt}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Uploaded Solution: <span className="font-mono text-purple-700 dark:text-purple-300 font-medium">{activeRemedial.fileName}</span>{' '}
                            <span className="text-slate-400 font-normal">({activeRemedial.fileSize})</span>
                          </p>
                          {activeRemedial.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 mt-1 max-w-xl">
                              &ldquo;{activeRemedial.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleResetRemedialSubmission(activeSubject.id)}
                        className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold self-start sm:self-center transition-colors cursor-pointer shrink-0"
                      >
                        Re-submit Solution
                      </button>
                    </div>
                  ) : (
                    /* Submission Input Form */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                      {/* File Upload Box */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Handwritten Practice Sheet / Solution (PDF, JPG, PNG)
                        </label>
                        <input
                          type="file"
                          ref={remedialFileInputRef}
                          onChange={handleRemedialFileChange}
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                        />
                        <div
                          onClick={() => remedialFileInputRef.current?.click()}
                          className="rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800/80 p-4 text-center bg-purple-50/30 dark:bg-purple-950/20 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 cursor-pointer transition-colors group flex flex-col items-center justify-center min-h-[110px]"
                        >
                          {currentRemedialFile ? (
                            <div className="flex items-center justify-center gap-3 w-full">
                              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="text-left min-w-0">
                                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-[200px]">
                                  {currentRemedialFile.name}
                                </span>
                                <span className="text-[10px] text-emerald-600 font-semibold block">
                                  Ready &bull; {(currentRemedialFile.size / 1024).toFixed(1)} KB (Click to change)
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="mx-auto h-5 w-5 text-purple-600 dark:text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">
                                Click to upload handwritten practice sheet
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">
                                PDF, PNG, JPG (handwritten notebook camera snapshot)
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Student Notes & Submit Action */}
                      <div className="flex flex-col justify-between space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Student Notes / Problem Doubts (Optional)
                          </label>
                          <textarea
                            rows={2}
                            value={currentRemedialNotes}
                            onChange={(e) => setCurrentRemedialNotes(e.target.value)}
                            placeholder="e.g. Solved 15 questions; stuck on Q12 signs..."
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            disabled={isSubmittingRemedial || !currentRemedialFile}
                            onClick={handleSubmitRemedialWork}
                            className="rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {isSubmittingRemedial ? (
                              <>
                                <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5" />
                                <span>Submit Remedial Work</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          /* ========================================================= */
          /* TEACHER & PARENT VIEW: EVIDENCE & CO-SIGN WORKFLOW        */
          /* ========================================================= */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* 1. Teacher Strategy */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  <MessageSquareQuote className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Teacher Strategy ({activeSubject.teacherName}):</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-3">
                  &quot;{activeSubject.diagnosticObservation}&quot;
                </p>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Remedial focus: Daily 30-min targeted exercises
              </span>
            </div>

            {/* 2. Diagnostic Homework Evidence Card */}
            <div className="rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 p-4 border border-purple-200/90 dark:border-purple-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300">
                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Diagnostic Homework Evidence</span>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                    {activeSubmission.marks_obtained || 17.5}/20
                  </span>
                </div>
                <p className="text-xs text-purple-900 dark:text-purple-200 line-clamp-2">
                  Worksheet #4: Graded with teacher red-ink notes exposing the algebraic sign expansion pitfall.
                </p>
              </div>
              {isTeacher ? (
                <button
                  onClick={() => setEvidenceModalOpen(true)}
                  className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect Graded Worksheet Canvas &rarr;</span>
                </button>
              ) : (
                <div className="text-[11px] text-purple-700 dark:text-purple-300 font-medium pt-1">
                  Verified by Mrs. Sunitha Rao for parent co-tracking
                </div>
              )}
            </div>

            {/* 3. Parent Co-Tracking Verification Action */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Parent Practice Co-Sign</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {guardianApproved
                    ? (parentCheckedMap[activeSubject.id]
                        ? "✓ Parent verified practice homework in student notebook."
                        : "Guardian approved. Awaiting daily parent sign-off on notebook practice.")
                    : "Awaiting initial Guardian Approval before verifying notebook practice."}
                </p>
              </div>

              <div className="mt-2">
                {!guardianApproved ? (
                  isParent ? (
                    <button
                      onClick={handleGuardianApprove}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Review &amp; Confirm Guardian Approval</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block text-center py-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                      Awaiting Guardian Co-Sign
                    </span>
                  )
                ) : (
                  isParent ? (
                    <button
                      onClick={() => toggleParentCheckForSubject(activeSubject.id)}
                      className={`w-full flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer ${
                        parentCheckedMap[activeSubject.id]
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {parentCheckedMap[activeSubject.id] ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      <span>{parentCheckedMap[activeSubject.id] ? 'Co-Signed & Verified ✓' : 'Mark Daily Notebook Verified'}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block text-center py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                      {parentCheckedMap[activeSubject.id] ? '✓ Verified by Guardian' : 'Guardian Approved (Daily Pending)'}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* 3.5 DEDICATED ACADEMIC BACKLOG & COMPLIANCE SECTION    */}
        {/* (Exclusively visible to Teachers for parental connect)*/}
        {/* ===================================================== */}
        {isTeacher && (
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 text-xs font-black border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  PTM Audit Ledger
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Verifiable Academic Deadline &amp; Compliance Telemetry
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                Academic Backlog &amp; Compliance Ledger
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Multi-subject assignment tracking synced to Aarav&apos;s academic profile. Non-compliance events are archived for parent-teacher review.
              </p>
            </div>

            <button
              onClick={() => setIsExportReportModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs px-4 py-2.5 shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Printer className="h-4 w-4" />
              <span>Export PTM Evidence Report (PDF)</span>
            </button>
          </div>

          {/* Compliance Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Assigned Tasks</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {complianceData?.total_assigned || 9}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Daily Drills + Capstones</span>
            </div>

            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">On-Time Submissions</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {complianceData?.on_time_submissions || 2}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5 block">Turned in before cutoff</span>
            </div>

            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Active Backlogs</span>
              </span>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
                {complianceData?.backlog_count || 1}
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 block">Unresolved Missed Cutoffs</span>
            </div>

            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">Compliance Rating</span>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
                {complianceData?.compliance_pct || 88.9}%
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${complianceData?.compliance_pct || 88.9}%` }}
                />
              </div>
            </div>
          </div>

          {/* Itemized Table of Unresolved Backlogs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-600" />
                Itemized Unresolved Backlog Records (Parent Review Evidence)
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {((complianceData?.itemized_backlogs && complianceData.itemized_backlogs.length > 0) ? complianceData.itemized_backlogs : [
                  {
                    id: 1,
                    student_id: 1,
                    homework_id: 1,
                    focus_table_id: 1,
                    evidence_code: '#EVD-BKLOG-884',
                    subject: 'Mathematics',
                    title: 'Worksheet #4.2: Solving Quadratics by Factoring',
                    task_type: 'DAILY_HOMEWORK',
                    due_date: '2026-10-15',
                    due_time: '17:00',
                    status: 'UNRESOLVED',
                    teacher_name: 'Mrs. Ananya Verma',
                    notes: 'Student missed scheduled cutoff. Flagged for parent PTM evidence review.'
                  }
                ]).length} Recorded Evidence Event(s)
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-3">Evidence ID</th>
                      <th className="p-3">Subject &amp; Type</th>
                      <th className="p-3">Task Title</th>
                      <th className="p-3">Scheduled Deadline</th>
                      <th className="p-3">Compliance Status</th>
                      <th className="p-3">Teacher / Flag</th>
                      {isTeacher && <th className="p-3 text-right">PTM Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {((complianceData?.itemized_backlogs && complianceData.itemized_backlogs.length > 0) ? complianceData.itemized_backlogs : [
                      {
                        id: 1,
                        student_id: 1,
                        homework_id: 1,
                        focus_table_id: 1,
                        evidence_code: '#EVD-BKLOG-884',
                        subject: 'Mathematics',
                        title: 'Worksheet #4.2: Solving Quadratics by Factoring',
                        task_type: 'DAILY_HOMEWORK',
                        due_date: '2026-10-15',
                        due_time: '17:00',
                        status: 'UNRESOLVED',
                        teacher_name: 'Mrs. Ananya Verma',
                        notes: 'Student missed scheduled cutoff. Flagged for parent PTM evidence review.'
                      }
                    ]).map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                          {ev.evidence_code}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{ev.subject}</div>
                          <span className="text-[10px] text-slate-400 uppercase">
                            {ev.task_type === 'ASSIGNMENT' ? '📑 Assignment' : '📅 Daily Homework'}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200 max-w-xs">
                          {ev.title}
                        </td>
                        <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {ev.due_date} • {ev.due_time}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {ev.status === 'UNRESOLVED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900 px-2.5 py-0.5 text-[10px] font-bold">
                              <AlertTriangle className="h-3 w-3" />
                              UNRESOLVED BACKLOG
                            </span>
                          ) : ev.status === 'LATE_SUBMITTED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900 px-2.5 py-0.5 text-[10px] font-bold">
                              <Clock className="h-3 w-3" />
                              LATE SUBMITTED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold">
                              RESOLVED
                            </span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{ev.teacher_name || 'Mrs. Ananya Verma'}</span>
                          <span className="block text-[10px] text-slate-400">Auto-Flagged at Deadline</span>
                        </td>
                        {isTeacher && (
                          <td className="p-3 whitespace-nowrap text-right">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`Missed Assignment Evidence: ${ev.title} (${ev.evidence_code}) due on ${ev.due_date} was not turned in.`);
                                triggerNotification(`Copied evidence for ${ev.evidence_code} to clipboard!`);
                              }}
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Cite in Call</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* 4. VERIFIABLE EVIDENCE LOGS & INTERVENTION TIMELINE */}
        {isTeacher && (
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                  Closed-Loop Telemetry Active
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Live Intervention Timeline, Backlogs &amp; Verifiable Evidence Stream
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                Faculty Remarks &amp; Backlog Evidence Logs
              </h3>
            </div>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
              {evidenceNotes.length + 1} Verified Evidence Records
            </span>
          </div>

          <div className="space-y-3">
            {/* Automatic Assignment Deadline Backlog Evidence Card */}
            <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border-l-4 border-l-amber-500 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-600 text-white shadow-2xs">
                    ⚠️ Backlog • Deadline Exceeded
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Quadratic Equations: Factorization Worksheet 4.2
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    Parent Evidence Dossier
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-red-600 dark:text-red-400">
                  Deadline Lapsed: 15 Oct 2026, 11:59 PM (Overdue)
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                &ldquo;Student failed to submit Textbook Exercise 4.2 before the scheduled deadline. The system automatically transitioned the assignment to <b>Backlog / Uncompleted</b> status. This record serves as verified evidence presented to parents during progress review to address study consistency.&rdquo;
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Auto-Flagged Backlog Evidence for PTM Review
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Evidence ID: #EVD-BKLOG-884
                </span>
              </div>
            </div>

            {evidenceNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                      {note.teacher_name} ({note.subject_name || 'Mathematics'})
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Target: {note.student_name} ({note.student_class})
                    </span>
                    {note.focus_concept_tag && (
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-emerald-500" />
                        Concept: {note.focus_concept_tag}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {note.created_at}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  &ldquo;{note.content}&rdquo;
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Evidence Synced to 4-Day Focus Plan
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Parent Notified: {note.parent_name}
                  </span>
                </div>
              </div>
            ))}

            {evidenceNotes.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                No external evidence notes logged yet for this cycle. Teacher observations during speed grading stream here automatically.
              </div>
            )}
          </div>
        </div>
      )}

      </div>

      {/* ========================================================= */}
      {/* 4. MODAL: DAY REVISION WORKSPACE (CLICKED A DAY CARD)     */}
      {/* ========================================================= */}
      {selectedDayModal && (
        <div 
          onClick={() => setSelectedDayModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-3 py-0.5 text-xs font-black">
                    {selectedDayModal.day} • {activeSubject.subject}
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-bold">
                    Status: {selectedDayModal.status}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1.5">
                  {selectedDayModal.focus}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Prescribed 30-min exercise */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                Prescribed 30-Minute Targeted Exercise:
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedDayModal.exercise}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Work through intermediate steps in the rough notebook. If you encounter difficulties, refer to the formula rule card.
              </p>
            </div>

            {/* Teacher Guidance Note */}
            <div className="rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 p-4 border border-blue-100 dark:border-blue-900/40 space-y-1">
              <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <BrainCircuit className="h-3.5 w-3.5" />
                Teacher Strategy Note ({activeSubject.teacherName}):
              </span>
              <p className="text-xs text-blue-900 dark:text-blue-200 italic leading-relaxed">
                &quot;{activeSubject.correctMethod}&quot;
              </p>
            </div>

            {/* Parent Verification Checklist */}
            <div className="rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 p-4 border border-purple-200 dark:border-purple-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-purple-900 dark:text-purple-300 block">
                Parent Verification Criteria:
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 dark:text-purple-200">
                <Check className="h-4 w-4 text-purple-600 shrink-0" />
                <span>&quot;{selectedDayModal.parent_checklist}&quot;</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  triggerNotification(`Marked ${selectedDayModal.day} verified!`);
                  setSelectedDayModal(null);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 text-xs font-bold transition-colors"
              >
                Mark Day Verified
              </button>
              <button
                onClick={() => {
                  triggerNotification(`Starting 30-min drill for ${selectedDayModal.focus}...`);
                  setSelectedDayModal(null);
                }}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 text-xs font-black shadow-md transition-all active:scale-95"
              >
                Start 30-Min Timed Practice Drill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: FULL SUBJECT DIAGNOSTIC & PRACTICE SETS         */}
      {/* ========================================================= */}
      {selectedSubjectModal && (
        <div 
          onClick={() => setSelectedSubjectModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-6"
          >
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${selectedSubjectModal.badgeColor}`}>
                    {selectedSubjectModal.subject}
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-bold">
                    {selectedSubjectModal.category}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Source: {selectedSubjectModal.identifiedSource}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                  {selectedSubjectModal.conceptTitle}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Assigned by {selectedSubjectModal.teacherName} • Target: {selectedSubjectModal.targetGoal}%
                </span>
              </div>
              <button
                onClick={() => setSelectedSubjectModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mastery Score Progress */}
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-900 dark:text-purple-300 block">
                  Diagnostic Score in Unit Test:
                </span>
                <span className="text-2xl font-black text-purple-700 dark:text-purple-300">
                  {selectedSubjectModal.currentMastery}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  Goal for Mid-Term:
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {selectedSubjectModal.targetGoal}%
                </span>
              </div>
            </div>

            {/* Side-by-Side: Common Mistake vs Correct Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-red-50/70 dark:bg-red-950/40 p-4 border border-red-200 dark:border-red-900/50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-red-700 dark:text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>❌ Common Student Mistake</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-mono">
                  {selectedSubjectModal.commonMistake}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-900/50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>✅ Correct Step-by-Step Method</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-mono">
                  {selectedSubjectModal.correctMethod}
                </p>
              </div>
            </div>

            {/* Interactive Practice Question */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Interactive Drill Problem:</span>
                </span>
                <button
                  onClick={() => setShowPracticeSolution(!showPracticeSolution)}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {showPracticeSolution ? 'Hide Solution' : 'Reveal Step-by-Step Solution'}
                </button>
              </div>

              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
                {selectedSubjectModal.practiceProblem.question}
              </p>

              <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                💡 Hint: {selectedSubjectModal.practiceProblem.hint}
              </p>

              {showPracticeSolution && (
                <div className="mt-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1 animate-in fade-in duration-150">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                    Worked Solution &amp; Answer:
                  </span>
                  <pre className="text-xs font-mono text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
                    {selectedSubjectModal.practiceProblem.solution}
                  </pre>
                </div>
              )}
            </div>

            {/* Remedial Action Items List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Remedial Roadmap &amp; Deliverables:
              </span>
              <div className="space-y-2">
                {selectedSubjectModal.actionItems.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      {act.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                      )}
                      <span>{act.text}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      act.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {act.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setActiveSubjectId(selectedSubjectModal.id);
                  triggerNotification(`Loaded ${selectedSubjectModal.subject} into the 4-Day Timetable!`);
                  setSelectedSubjectModal(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Set as Active 4-Day Timetable</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {isTeacher && (
                  <button
                    onClick={() => {
                      setEvidenceModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 px-3.5 py-2.5 text-xs font-bold text-purple-700 dark:text-purple-300 transition-colors cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Inspect Diagnostic Evidence Canvas</span>
                  </button>
                )}
                <button
                  onClick={() => triggerNotification(`Downloading ${selectedSubjectModal.practicePdfName}...`)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Worksheet (PDF)</span>
                </button>
                <button
                  onClick={() => setSelectedSubjectModal(null)}
                  className="rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: DIAGNOSTIC HOMEWORK EVIDENCE & ANNOTATED CANVAS */}
      {/* ========================================================= */}
      {isTeacher && evidenceModalOpen && (
        <div 
          onClick={() => setEvidenceModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-3 py-0.5 text-xs font-bold border border-purple-200 dark:border-purple-800">
                    Diagnostic Source Evidence
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-black">
                    Score: {activeSubmission.marks_obtained || 17.5} / 20 (Grade A1)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Evaluated by {activeSubject.teacherName}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                  Teacher-Corrected Homework: Worksheet #4 ({activeSubject.subject})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Visual proof of misconception in <span className="font-semibold text-slate-700 dark:text-slate-300">{activeSubject.conceptTitle}</span> with teacher red-ink annotations
                </p>
              </div>
              <button
                onClick={() => setEvidenceModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Pedagogical context callout */}
            <div className="rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 p-4 border border-purple-200 dark:border-purple-800 flex items-start gap-3">
              <BrainCircuit className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-purple-950 dark:text-purple-200 block">
                  How This Homework Evidence Powers the Focus Table:
                </span>
                <p className="text-purple-800 dark:text-purple-300 leading-relaxed">
                  During homework evaluation, {activeSubject.teacherName} detected sign expansion errors on Question 3 and Question 7. Instead of just penalizing marks, the system logged the error as diagnostic evidence to construct the 4-Day Targeted Revision Timetable.
                </p>
              </div>
            </div>

            {/* The Homework Canvas */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950">
              <HomeworkCanvas
                submission={activeSubmission}
                onSave={async () => {}}
                readOnly={true}
              />
            </div>

            {/* Teacher Feedback Note */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
              <MessageSquareQuote className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Teacher Pedagogical Remarks ({activeSubject.teacherName}):
                </span>
                <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  &quot;{activeSubmission.teacher_remarks}&quot;
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Official Digital Submission Record • EDU360 Academic Intelligence Vault
              </span>
              <button
                onClick={() => setEvidenceModalOpen(false)}
                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-black shadow-md transition-all active:scale-95"
              >
                Close Evidence Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* 5. PRINTABLE PARENT MEETING EVIDENCE REPORT MODAL     */}
      {/* ===================================================== */}
      {isTeacher && isExportReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto print:border-none print:shadow-none print:p-0">
            {/* Modal Actions Bar (hidden during browser print) */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-xs font-black">
                  Official Record
                </span>
                <span className="text-xs text-slate-500">PTM Progress Review Evidence Report</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => {
                    const csvRows = [
                      ['Evidence Code', 'Subject', 'Title', 'Scheduled Deadline', 'Status', 'Teacher'],
                      ...(complianceData?.itemized_backlogs || []).map(b => [
                        b.evidence_code,
                        b.subject,
                        `"${b.title}"`,
                        `${b.due_date} ${b.due_time}`,
                        b.status,
                        `"${b.teacher_name || ''}"`
                      ])
                    ];
                    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', 'Aarav_Sharma_Academic_Compliance_Report.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 px-3 py-2 text-xs font-bold transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => setIsExportReportModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE DOCUMENT BODY */}
            <div className="print-content space-y-6 text-slate-900 dark:text-slate-100">
              {/* School Header */}
              <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="rounded-lg bg-blue-600 text-white font-black px-2.5 py-1 text-sm">
                      EDU360
                    </span>
                    <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider">
                      Global Outcomes Academy
                    </h1>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    K-12 Diagnostic &amp; Academic Compliance Registry • Affiliation #883921
                  </p>
                </div>
                <div className="sm:text-right space-y-0.5 text-xs text-slate-500">
                  <div className="font-bold text-slate-800 dark:text-slate-200">CONFIDENTIAL PTM DOSSIER</div>
                  <div>Report Date: 17 Oct 2026</div>
                  <div>Term: 2026-2027 Academic Year (Term 1)</div>
                </div>
              </div>

              {/* Student Identification Profile */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Student Name</span>
                  <strong className="text-sm font-black text-slate-900 dark:text-white">Aarav Sharma</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Class &amp; Roll No</span>
                  <span className="font-bold">Class 8-B (Roll #01)</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Guardian Name</span>
                  <span className="font-bold">Mr. Rajesh Sharma</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Class Teacher</span>
                  <span className="font-bold">Mrs. Ananya Verma</span>
                </div>
              </div>

              {/* Executive Compliance Metrics Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Executive Compliance &amp; Submission Velocity Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="rounded-xl border border-slate-200 p-3 bg-white dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Tasks Assigned</span>
                    <strong className="text-xl font-black text-slate-900 dark:text-white">{complianceData?.total_assigned || 9}</strong>
                  </div>
                  <div className="rounded-xl border border-emerald-200 p-3 bg-emerald-50/50 dark:bg-emerald-950/30">
                    <span className="text-[10px] text-emerald-700 block font-bold uppercase">Submitted On-Time</span>
                    <strong className="text-xl font-black text-emerald-700 dark:text-emerald-400">{complianceData?.on_time_submissions || 2}</strong>
                  </div>
                  <div className="rounded-xl border border-red-200 p-3 bg-red-50/50 dark:bg-red-950/30">
                    <span className="text-[10px] text-red-700 block font-bold uppercase">Missed Deadlines (Backlog)</span>
                    <strong className="text-xl font-black text-red-600 dark:text-red-400">{complianceData?.backlog_count || 1}</strong>
                  </div>
                  <div className="rounded-xl border border-blue-200 p-3 bg-blue-50/50 dark:bg-blue-950/30">
                    <span className="text-[10px] text-blue-700 block font-bold uppercase">Compliance Score</span>
                    <strong className="text-xl font-black text-blue-700 dark:text-blue-400">{complianceData?.compliance_pct || 88.9}%</strong>
                  </div>
                </div>
              </div>

              {/* Itemized Audit Table of Unresolved Backlogs */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Itemized Unresolved Backlogs &amp; Deadlines (Verifiable Audit Records)
                </h3>
                <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-200 text-slate-700 dark:text-slate-200">
                    <tr>
                      <th className="p-2.5">Evidence ID</th>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Assignment Description</th>
                      <th className="p-2.5">Cutoff Date &amp; Time</th>
                      <th className="p-2.5">Compliance Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {(complianceData?.itemized_backlogs || []).map((b) => (
                      <tr key={b.id}>
                        <td className="p-2.5 font-mono font-bold text-red-600">{b.evidence_code}</td>
                        <td className="p-2.5 font-semibold">{b.subject}</td>
                        <td className="p-2.5">{b.title}</td>
                        <td className="p-2.5 font-mono text-[11px]">{b.due_date} • {b.due_time}</td>
                        <td className="p-2.5">
                          <span className="rounded bg-red-100 text-red-800 font-bold px-2 py-0.5 text-[10px]">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Focus Table Remediation Action Plan */}
              <div className="space-y-2 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-4 text-xs">
                <h3 className="font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                  3. Remedial Action Plan &amp; Parent Follow-up
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  During this review, the parent agreed to monitor Aarav&apos;s evening study schedule (06:30 PM - 07:30 PM). Mathematics Worksheet 4.2 has been rescheduled as a prioritized Focus Table remedial exercise. Late submission is permitted with full teacher feedback, while the audit backlog remains logged to track long-term recovery.
                </p>
              </div>

              {/* Official Signatures Block */}
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6 text-center text-xs">
                <div className="space-y-8">
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <div>
                    <strong>Mr. Rajesh Sharma</strong>
                    <div className="text-[10px] text-slate-400">Parent / Guardian Signature</div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <div>
                    <strong>Mrs. Ananya Verma</strong>
                    <div className="text-[10px] text-slate-400">Class 8-B Teacher Signature</div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="h-10 border-b border-dashed border-slate-400 flex items-center justify-center">
                    <span className="rounded border border-blue-500 text-blue-600 px-2 py-0.5 text-[9px] font-black uppercase">
                      EDU360 Official Seal
                    </span>
                  </div>
                  <div>
                    <strong>Dr. Sunita Kapoor</strong>
                    <div className="text-[10px] text-slate-400">Academic Principal Verification</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
