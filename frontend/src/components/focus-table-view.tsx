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
  RefreshCw
} from 'lucide-react';
import { FocusTable, RevisionDay, HomeworkSubmission } from '@/lib/types';
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
  table?: FocusTable;
  submission?: HomeworkSubmission | null;
  isParentView?: boolean;
  onToggleParentCheck?: () => Promise<void>;
  onUpdateStatus?: (newStatus: string) => Promise<void>;
}

export function FocusTableView({ 
  table, 
  submission,
  isParentView = false, 
  onToggleParentCheck,
  onUpdateStatus 
}: FocusTableViewProps) {
  // Active subject selection (defaults to mathematics or table.subject)
  const initialSubjectId = table?.subject?.toLowerCase().includes('physic') ? 'physics' : 'math';
  const [activeSubjectId, setActiveSubjectId] = useState<string>(initialSubjectId);
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'critical' | 'in_progress' | 'on_track'>('all');

  // Modals for opening cards & diagnostic evidence
  const [selectedDayModal, setSelectedDayModal] = useState<RevisionDay | null>(null);
  const [selectedSubjectModal, setSelectedSubjectModal] = useState<FocusSubjectItem | null>(null);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [showPracticeSolution, setShowPracticeSolution] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Parent verified state
  const [parentCheckedMap, setParentCheckedMap] = useState<Record<string, boolean>>({
    math: table ? table.parent_check_completed : true,
    physics: false,
    chemistry: true,
    biology: true,
    english: false,
    cs: true,
    social: true
  });

  const activeSubject = ALL_FOCUS_SUBJECTS.find(s => s.id === activeSubjectId) || ALL_FOCUS_SUBJECTS[0];

  const triggerNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleParentCheckForSubject = async (subId: string) => {
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
      {/* 2. ACTIVE 4-DAY REVISION TIMETABLE (CLICKABLE DAY CARDS)  */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-purple-200/90 dark:border-purple-900/60 bg-white dark:bg-slate-900 p-6 shadow-md space-y-5">
        
        {/* Top Header of Active Plan */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-900/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-bold border border-purple-200 dark:border-purple-800">
                <Sparkles className="h-3.5 w-3.5" />
                Active Co-Tracked Plan
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {activeSubject.subject} • {activeSubject.teacherName}
              </span>
            </div>
            <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
              Target Intervention: {activeSubject.conceptTitle}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Identified in {activeSubject.identifiedSource} • 4-Day Targeted Study (30 Mins / Day)
            </span>
          </div>

          {/* Action Buttons: Diagnostic Homework Evidence + Full Diagnostic & Practice Sets */}
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

            <button
              onClick={() => setEvidenceModalOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-3.5 py-3 text-xs font-bold shadow-xs transition-all active:scale-95"
              title="Inspect teacher-annotated homework worksheet where the misconception was identified"
            >
              <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>[ 👁️ View Diagnostic Homework Evidence: Worksheet #4 ({activeSubmission.marks_obtained || 17.5}/20) ]</span>
            </button>

            <button
              onClick={() => setSelectedSubjectModal(activeSubject)}
              className="flex items-center gap-1.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 text-xs font-black shadow-md transition-all active:scale-95"
            >
              <Eye className="h-4 w-4" />
              <span>[ Open Full Diagnostic &amp; Practice Sets ]</span>
            </button>
          </div>
        </div>

        {/* 4-Day Timetable Grid - CLICKABLE CARDS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>4-Day Targeted Revision Timetable (Click any Day card to open exercise &amp; checklist)</span>
            </h4>
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              Co-tracked by Teacher &amp; Parent
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeSubject.revisionDays.map((item, idx) => {
              const isCompleted = item.status === 'Completed';
              const isInProgress = item.status === 'In Progress';

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDayModal(item)}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md ${
                    isCompleted 
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30' 
                      : isInProgress
                      ? 'border-purple-400 dark:border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 ring-2 ring-purple-400/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-purple-300'
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
                    <span className="text-[10px] font-bold text-purple-900 dark:text-purple-300 block">
                      Parent Home Check:
                    </span>
                    <p className="text-[10px] text-purple-800 dark:text-purple-200 line-clamp-1 italic">
                      &quot;{item.parent_checklist}&quot;
                    </p>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-2 block group-hover:underline">
                      Click to open day plan →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Homework Evidence Bar, Teacher Strategy & Parent Verification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-purple-100 dark:border-purple-900/40">
          
          {/* 1. Teacher Strategy */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                <MessageSquareQuote className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Teacher Strategy ({activeSubject.teacherName}):</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-3">
                &quot;{activeSubject.diagnosticObservation}&quot;
              </p>
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">
              Remedial focus: Daily 30-min targeted exercises
            </span>
          </div>

          {/* 2. Diagnostic Homework Evidence Card */}
          <div className="rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 p-4 border border-purple-200 dark:border-purple-800 flex flex-col justify-between">
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
            <button
              onClick={() => setEvidenceModalOpen(true)}
              className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Inspect Graded Worksheet Canvas →</span>
            </button>
          </div>

          {/* 3. Parent Co-Tracking Verification Action */}
          <div className="rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 p-4 border border-purple-200 dark:border-purple-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">
                <CheckCircle2 className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                <span>Parent Practice Co-Sign</span>
              </div>
              <p className="text-xs text-purple-800 dark:text-purple-200">
                {parentCheckedMap[activeSubject.id]
                  ? "✓ Parent verified practice homework in student notebook."
                  : "Awaiting parent verification of Day 2 notebook practice."}
              </p>
            </div>

            <button
              onClick={() => toggleParentCheckForSubject(activeSubject.id)}
              className={`mt-3 flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 ${
                parentCheckedMap[activeSubject.id]
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {parentCheckedMap[activeSubject.id] ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              <span>{parentCheckedMap[activeSubject.id] ? 'Verified ✓' : 'Mark Verified'}</span>
            </button>
          </div>

        </div>
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
                <button
                  onClick={() => {
                    setEvidenceModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 px-3.5 py-2.5 text-xs font-bold text-purple-700 dark:text-purple-300 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Inspect Diagnostic Evidence Canvas</span>
                </button>
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
      {evidenceModalOpen && (
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

    </div>
  );
}
