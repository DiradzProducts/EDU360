// =========================================================================
// EDU360 AI FOCUS TABLE & 1-WEEK REMEDIAL INTELLIGENCE DATA STORE (V4)
// =========================================================================
// Research-grounded, section-based remedial tracking for Subject Faculty.
// Scope: Mathematics (Faculty: Mrs. Ananya Verma).
// Sections: Class 8-B (Primary/Homeroom), Class 8-A, Class 9-A, Class 9-B.
// Rule 1: Students with exam scores > 70% have demonstrated baseline mastery
//         and are EXEMPT from the improvement batch.
// Rule 2: Only students scoring <= 70% have an active 1-Week (7-Day) plan.
// Rule 3: Any previous day work can NEVER be 'Upcoming'. Previous days are
//         strictly 'Completed' or 'Pending'.
// Rule 4: Rough paper verification displays the specific assigned question(s)
//         and rubric checkpoints alongside the student's solution.
// =========================================================================

export interface WeekFocusProblem {
  question_number: string; // e.g. "Problem 1"
  question_text: string;
  rubric_key: string;
  expected_solution?: string;
}

export interface WeekFocusDay {
  day_num: number;
  day_label: string; // e.g. "Day 1 (Mon)"
  title: string;
  focus_task: string;
  resource: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Upcoming';
  submission_required: boolean;
  parent_checklist: string;
  questions?: WeekFocusProblem[];
  student_solution_steps?: string[];
  submitted_file?: {
    name: string;
    size: string;
    submitted_at: string;
    student_notes?: string;
    preview_url?: string;
  };
}

export interface FocusRosterItem {
  id: number;
  student_id: number;
  roll_no: string;
  name: string;
  class_name: string; // e.g. "Class 8-B", "Class 8-A", "Class 9-A", "Class 9-B"
  subject: string; // "Mathematics"
  category: 'Critical Remedial' | 'Targeted Practice';
  
  // EXAM & AI SCAN TELEMETRY
  exam_name: string;
  exam_score_pct: number; // <= 70%
  current_score_pct?: number; // legacy alias for exam_score_pct
  target_score_pct: number; // Target goal, e.g. 75%+
  weak_concept?: string; // legacy alias for ai_exam_scan.weak_concept
  exam_total_marks: number;
  exam_marks_obtained: number;
  ai_exam_scan: {
    scanned_at: string;
    questions_flagged: string;
    weak_concept: string;
    diagnostic_summary: string;
    recommended_focus: string;
  };
  
  // 1-WEEK (7-DAY) SPRINT
  current_day: number; // 1 to 7
  total_days: number; // 7 (Full 1-Week Focus Plan)
  plan_days: WeekFocusDay[];
  
  // DAILY SUBMISSION & VERIFICATION
  submission_status: 'Submitted' | 'Pending' | 'Verified' | 'Needs Revision';
  submitted_file?: {
    name: string;
    size: string;
    submitted_at: string;
    preview_url?: string;
    student_notes?: string;
  };
  teacher_verification_notes?: string;
  verified_at?: string;
  
  // GUARDIAN CO-TRACKING
  parent_name: string;
  parent_phone: string;
  parent_status: 'Parent Verified ✓' | 'Pending Parent Review ⏳';
  parent_call_script: string;
  teacher_action: string;
}

export interface SectionMetrics {
  section: string;
  subject: string;
  exam_name: string;
  total_students: number;
  passed_mastery: number; // > 70%
  mastery_percentage: number;
  improvement_batch_count: number; // <= 70%
  avg_score: number;
}

export const CLASS_SECTION_METRICS: Record<string, SectionMetrics> = {
  'Class 8-B': {
    section: 'Class 8-B',
    subject: 'Mathematics',
    exam_name: 'Mid-Term Examination (100 Marks)',
    total_students: 28,
    passed_mastery: 25,
    mastery_percentage: 89.3,
    improvement_batch_count: 3,
    avg_score: 76.4
  },
  'Class 8-A': {
    section: 'Class 8-A',
    subject: 'Mathematics',
    exam_name: 'Mid-Term Examination (100 Marks)',
    total_students: 30,
    passed_mastery: 28,
    mastery_percentage: 93.3,
    improvement_batch_count: 2,
    avg_score: 78.5
  },
  'Class 9-A': {
    section: 'Class 9-A',
    subject: 'Mathematics',
    exam_name: 'Mid-Term Examination (100 Marks)',
    total_students: 32,
    passed_mastery: 30,
    mastery_percentage: 93.8,
    improvement_batch_count: 2,
    avg_score: 79.2
  },
  'Class 9-B': {
    section: 'Class 9-B',
    subject: 'Mathematics',
    exam_name: 'Mid-Term Examination (100 Marks)',
    total_students: 29,
    passed_mastery: 28,
    mastery_percentage: 96.5,
    improvement_batch_count: 1,
    avg_score: 81.0
  },
  'All': {
    section: 'All Assigned Sections',
    subject: 'Mathematics',
    exam_name: 'Mid-Term Examination (100 Marks)',
    total_students: 119,
    passed_mastery: 111,
    mastery_percentage: 93.3,
    improvement_batch_count: 8,
    avg_score: 78.8
  }
};

// Backwards compatibility alias for imports expecting CLASS_SUBJECT_METRICS
export const CLASS_SUBJECT_METRICS = CLASS_SECTION_METRICS as any;

// Initial roster strictly containing students scoring <= 70% in that subject's exam
export const INITIAL_FOCUS_ROSTER: FocusRosterItem[] = [
  // ==========================================
  // MATHEMATICS - SECTION 8-B (3 Students <= 70%)
  // ==========================================
  {
    id: 1,
    student_id: 1,
    roll_no: "01",
    name: "Aarav Sharma",
    class_name: "Class 8-B",
    subject: "Mathematics",
    category: "Critical Remedial",
    exam_name: "Mid-Term Examination",
    exam_score_pct: 52, // <= 70% (Needs Improvement)
    current_score_pct: 52,
    weak_concept: "Quadratic Equations: Factorization by Splitting & Sign Distribution",
    target_score_pct: 75,
    exam_total_marks: 100,
    exam_marks_obtained: 52,
    ai_exam_scan: {
      scanned_at: "14 Oct 2026, 04:15 PM",
      questions_flagged: "Section B: Q7 & Q9 (Algebraic Fractions & Factoring)",
      weak_concept: "Quadratic Equations: Factorization by Splitting & Sign Distribution",
      diagnostic_summary: "Aarav accurately factors positive binomial denominators, but drops negative signs when expanding LCM numerators in Q7 & Q9: -(3x - 5) was written as -3x - 5 instead of -3x + 5.",
      recommended_focus: "7-Day Targeted Algebra Sprint: Rule of Parentheses and Distributive Signs."
    },
    current_day: 3,
    total_days: 7,
    submission_status: "Submitted",
    submitted_file: {
      name: "Aarav_Day3_Quadratic_Splitting_Rough_Work.pdf",
      size: "1.4 MB",
      submitted_at: "Today, 08:30 AM",
      student_notes: "Solved all 4 middle-term questions. Enclosed negative numerators in brackets as advised.",
      preview_url: "/samples/math_worksheet.png"
    },
    teacher_verification_notes: "Factoring steps clean. Check question 3 sign change before moving to Day 4.",
    verified_at: "Today, 10:15 AM",
    parent_name: "Mr. Rajesh Sharma",
    parent_phone: "+91 98450 12345",
    parent_status: "Parent Verified ✓",
    teacher_action: "Review rough notebook solution and approve Day 3 progression.",
    parent_call_script: "Aarav has completed Day 1 and Day 2 of his 7-day Math plan. Day 3 practice on Quadratic Factorization is submitted and ready for verification. Please inspect his rough notebook tonight.",
    plan_days: [
      {
        day_num: 1,
        day_label: "Day 1 (Mon)",
        title: "Standard Form & Quadratic Coefficient Identification",
        focus_task: "Watch 12-min AI video recap on ax² + bx + c = 0 and identify a, b, c for 6 equations.",
        resource: "Video: Quadratic Foundations & Sign Conventions (Portal)",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Verified concept notes written in Math rough notebook.",
        questions: [
          {
            question_number: "Problem 1",
            question_text: "Identify the coefficients a, b, and c in: 3x² - 5x + 2 = 0. State whether the middle coefficient is positive or negative.",
            rubric_key: "Check: a = 3, b = -5, c = 2. Verify negative sign on -5 is retained.",
            expected_solution: "a = 3, b = -5, c = 2. Middle coefficient is negative (-5)."
          },
          {
            question_number: "Problem 2",
            question_text: "Rewrite (2x - 1)(x + 4) = 7 in standard quadratic form ax² + bx + c = 0.",
            rubric_key: "Check: 2x² + 7x - 4 = 7 => 2x² + 7x - 11 = 0.",
            expected_solution: "2x² + 8x - x - 4 - 7 = 0  =>  2x² + 7x - 11 = 0."
          }
        ],
        student_solution_steps: [
          "1. For 3x² - 5x + 2 = 0 => a = 3, b = -5, c = 2.",
          "2. For (2x - 1)(x + 4) = 7 => 2x² + 8x - x - 4 = 7 => 2x² + 7x - 11 = 0.",
          "Verified by Teacher on Mon ✓"
        ]
      },
      {
        day_num: 2,
        day_label: "Day 2 (Tue)",
        title: "Splitting the Middle Term with Worked Examples",
        focus_task: "Work through 4 guided problems step-by-step with sign verification.",
        resource: "Worksheet 4.1: Middle Term Splitting Guide",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Inspected 4 worked problems and signed study diary.",
        questions: [
          {
            question_number: "Problem 1",
            question_text: "Solve for x by splitting the middle term: x² - 8x + 12 = 0.",
            rubric_key: "Check factors of 12 that sum to -8: must be -6 and -2.",
            expected_solution: "(x - 6)(x - 2) = 0 => x = 6 or x = 2."
          },
          {
            question_number: "Problem 2",
            question_text: "Factorize: x² - 3x - 10 = 0. Pay attention to opposite signs.",
            rubric_key: "Check factors of -10 summing to -3: -5 and +2.",
            expected_solution: "(x - 5)(x + 2) = 0 => x = 5 or x = -2."
          }
        ],
        student_solution_steps: [
          "1. x² - 8x + 12 = 0 => Product = 12, Sum = -8 => Factors: -6, -2.",
          "2. x(x - 6) - 2(x - 6) = 0 => (x - 6)(x - 2) = 0 => x = 6, 2.",
          "3. x² - 3x - 10 = 0 => (x - 5)(x + 2) = 0 => x = 5, -2.",
          "Verified by Teacher on Tue ✓"
        ]
      },
      {
        day_num: 3,
        day_label: "Day 3 (Wed)",
        title: "Targeted Practice: Negative Sign Distribution",
        focus_task: "Solve 4 quadratic equations involving negative middle & constant terms.",
        resource: "Practice Set #3: Negative Signs in Algebra",
        status: "In Progress",
        submission_required: true,
        parent_checklist: "Check rough notebook for step-by-step sign checks.",
        questions: [
          {
            question_number: "Problem 1",
            question_text: "Solve for x by splitting the middle term: 2x² - 7x + 3 = 0. Show all intermediate grouping steps.",
            rubric_key: "Check Product = 6, Sum = -7 => Factors: -6, -1. Grouping: 2x(x - 3) - 1(x - 3) = 0.",
            expected_solution: "(2x - 1)(x - 3) = 0 => x = 1/2, x = 3."
          },
          {
            question_number: "Problem 2",
            question_text: "Simplify the algebraic fraction: (3 / (x - 2)) - ((2x + 1) / (x² - 4)). Watch the distributive negative sign.",
            rubric_key: "Common denominator is (x - 2)(x + 2). Numerator: 3(x + 2) - (2x + 1) = 3x + 6 - 2x - 1 = x + 5.",
            expected_solution: "(x + 5) / ((x - 2)(x + 2))."
          }
        ],
        student_solution_steps: [
          "Problem 1: 2x² - 7x + 3 = 0",
          "Step 1: Product = 2 * 3 = 6, Sum = -7",
          "Step 2: Factors: -6 and -1 => 2x² - 6x - x + 3 = 0",
          "Step 3: 2x(x - 3) - 1(x - 3) = 0 => (2x - 1)(x - 3) = 0",
          "Step 4: Roots: x = 1/2, x = 3 [Verified by Student ✓]",
          "Problem 2: 3(x+2) - (2x+1) = 3x + 6 - 2x - 1 = (x + 5) / (x² - 4)"
        ]
      },
      {
        day_num: 4,
        day_label: "Day 4 (Thu)",
        title: "Discriminant & Root Verification Drill",
        focus_task: "Calculate discriminant D = b² - 4ac and determine nature of roots for 5 equations.",
        resource: "Drill Sheet 4.4: Discriminant Mastery",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Verify formula applied accurately.",
        questions: [
          {
            question_number: "Problem 1",
            question_text: "Find the discriminant of 2x² - 4x + 5 = 0. Does it have real roots?",
            rubric_key: "D = (-4)² - 4(2)(5) = 16 - 40 = -24 < 0. No real roots.",
            expected_solution: "D = -24. Since D < 0, roots are non-real (complex)."
          }
        ]
      },
      {
        day_num: 5,
        day_label: "Day 5 (Fri)",
        title: "Mixed Algebraic Fractions & Quadratic Roots",
        focus_task: "Combine LCM fraction reduction with quadratic factoring across 4 complex questions.",
        resource: "Challenge Set #5: Advanced Simplification",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Review student rough work.",
        questions: [
          {
            question_number: "Problem 1",
            question_text: "Solve: (x + 1) / (x - 1) - (x - 1) / (x + 1) = 5/6.",
            rubric_key: "Common denominator (x² - 1). Numerator: (x + 1)² - (x - 1)² = 4x.",
            expected_solution: "4x / (x² - 1) = 5/6 => 5x² - 24x - 5 = 0 => x = 5, -1/5."
          }
        ]
      },
      {
        day_num: 6,
        day_label: "Day 6 (Sat)",
        title: "Timed 15-Minute Portal Micro-Diagnostic Assessment",
        focus_task: "Attempt 6 timed micro-quiz questions on the EDU360 portal to measure retention.",
        resource: "Online Micro-Diagnostic Quiz #2 (Adaptive)",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Supervise 15-minute uninterrupted portal test.",
        questions: [
          {
            question_number: "Problem 1",
            question_text: "Micro-Assessment: 6 mixed quadratic equations and distributive sign fractions.",
            rubric_key: "Threshold: 80% score required to clear the portal checkpoint.",
            expected_solution: "Adaptive online portal test."
          }
        ]
      },
      {
        day_num: 7,
        day_label: "Day 7 (Sun)",
        title: "1-on-1 Faculty Review & Re-test Mastery Clearance",
        focus_task: "Final review of rough notebook with teacher and clearance to exit the focus batch.",
        resource: "Teacher Clearance Rubric (>70% Target Reached)",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Confirm teacher clearance sign-off in student logbook.",
        questions: [
          {
            question_number: "Problem 1",
            question_text: "Whiteboard demonstration: Factor 3x² - 11x - 4 = 0 and explain negative sign handling.",
            rubric_key: "Must demonstrate verbal understanding: (3x + 1)(x - 4) = 0.",
            expected_solution: "Exit clearance interview."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    student_id: 4,
    roll_no: "15",
    name: "Kabir Mehta",
    class_name: "Class 8-B",
    subject: "Mathematics",
    category: "Critical Remedial",
    exam_name: "Mid-Term Examination",
    exam_score_pct: 48, // <= 70%
    current_score_pct: 48,
    weak_concept: "Algebraic Fractions & Negative Signs in Simplification",
    target_score_pct: 75,
    exam_total_marks: 100,
    exam_marks_obtained: 48,
    ai_exam_scan: {
      scanned_at: "14 Oct 2026, 04:22 PM",
      questions_flagged: "Section B: Q5, Q8 & Section C: Q11 (Fractions & Decimals)",
      weak_concept: "Algebraic Fractions & Negative Signs in Simplification",
      diagnostic_summary: "Kabir struggles with finding common denominators when polynomials are present. He leaves complex fractions unreduced and drops signs during subtraction.",
      recommended_focus: "7-Day Targeted Algebra Sprint: Denominator LCM and Bracket Rule."
    },
    current_day: 2,
    total_days: 7,
    submission_status: "Pending",
    submitted_file: {
      name: "Kabir_Fractions_Day2_Draft.pdf",
      size: "950 KB",
      submitted_at: "Yesterday, 06:15 PM",
      student_notes: "Attempted first 2 questions. Need help on LCM step for Q3.",
      preview_url: "/samples/math_worksheet.png"
    },
    teacher_verification_notes: "Advised to review LCM factoring video before attempting question 3.",
    parent_name: "Mr. Suresh Mehta",
    parent_phone: "+91 98111 00015",
    parent_status: "Pending Parent Review ⏳",
    teacher_action: "Dispatched WhatsApp prompt to parent to verify Day 2 rough work tonight.",
    parent_call_script: "Kabir has finished Day 1 of his 7-day Math plan. Day 2 practice on algebraic fractions is due tonight. Please verify his rough notebook.",
    plan_days: [
      {
        day_num: 1,
        day_label: "Day 1 (Mon)",
        title: "Monomial & Binomial Denominator Factoring",
        focus_task: "Practice finding the Lowest Common Multiple (LCM) of 5 algebraic expressions.",
        resource: "Video: LCM of Polynomials Made Easy",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Check 5 completed LCM problems in rough notebook.",
        questions: [
          {
            question_number: "Problem 1",
            question_text: "Find the LCM of: 4x²y and 6xy³.",
            rubric_key: "Coefficients: LCM(4,6) = 12. Variables: max powers x² and y³ => LCM = 12x²y³.",
            expected_solution: "LCM = 12x²y³."
          }
        ],
        student_solution_steps: [
          "Factors of 4x²y = 2² * x² * y",
          "Factors of 6xy³ = 2 * 3 * x * y³",
          "LCM = 4 * 3 * x² * y³ = 12x²y³ [Checked ✓]"
        ]
      },
      {
        day_num: 2,
        day_label: "Day 2 (Tue)",
        title: "Negative Parentheses & Fraction Subtraction",
        focus_task: "Rewrite 4 algebraic fraction subtractions enclosing numerators in brackets.",
        resource: "Worksheet: Sign Distribution in Fractions",
        status: "In Progress",
        submission_required: true,
        parent_checklist: "Verify all 4 fraction problems written in study book.",
        questions: [
          {
            question_number: "Problem 1",
            question_text: "Simplify: (5 / 2x) - ((3x - 1) / 4x²).",
            rubric_key: "LCM = 4x². Numerator: 5(2x) - (3x - 1) = 10x - 3x + 1 = 7x + 1.",
            expected_solution: "(7x + 1) / 4x²."
          }
        ],
        student_solution_steps: [
          "Common denominator: 4x²",
          "Numerator: 5*(2x) - (3x - 1) = 10x - 3x + 1",
          "Answer: (7x + 1) / 4x² [In Progress]"
        ]
      },
      {
        day_num: 3,
        day_label: "Day 3 (Wed)",
        title: "Cross-Multiplication Technique for Equations",
        focus_task: "Solve 4 fractional equations using cross-multiplication with verification steps.",
        resource: "Practice Set #4: Cross-Multiplication Method",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Review step-by-step cross multiplication checks.",
        questions: [
          {
            question_number: "Problem 1",
            question_text: "Solve: (2x + 3) / (x - 1) = 5.",
            rubric_key: "Cross multiply: 2x + 3 = 5(x - 1) = 5x - 5 => 3x = 8 => x = 8/3.",
            expected_solution: "x = 8/3."
          }
        ]
      },
      {
        day_num: 4,
        day_label: "Day 4 (Thu)",
        title: "Canceling Common Factors: Avoiding Illegal Reduction",
        focus_task: "Identify 5 illegal cancellation mistakes in provided worksheet and correct them.",
        resource: "Error Spotting Worksheet: Fraction Traps",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Check student error notes."
      },
      {
        day_num: 5,
        day_label: "Day 5 (Fri)",
        title: "Mixed Practice: 6 Multi-Step Problems",
        focus_task: "Complete 6 mixed algebraic fraction problems under untimed conditions.",
        resource: "Mixed Remedial Set #5",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Sign completed practice sheet."
      },
      {
        day_num: 6,
        day_label: "Day 6 (Sat)",
        title: "Adaptive Portal Micro-Quiz (15 Mins)",
        focus_task: "Complete 5 online multiple-choice and short-answer questions.",
        resource: "Portal Remedial Quiz #3",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Verify quiz score on EDU360 app."
      },
      {
        day_num: 7,
        day_label: "Day 7 (Sun)",
        title: "Faculty Sign-Off & Diagnostic Re-Assessment",
        focus_task: "Submit final notebook to teacher for evaluation and exit batch clearance.",
        resource: "Mastery Re-test Paper (>70% Target)",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Confirm completion with teacher signature."
      }
    ]
  },
  {
    id: 3,
    student_id: 9,
    roll_no: "09",
    name: "Priya Patel",
    class_name: "Class 8-B",
    subject: "Mathematics",
    category: "Targeted Practice",
    exam_name: "Mid-Term Examination",
    exam_score_pct: 61, // <= 70%
    current_score_pct: 61,
    weak_concept: "Translating Verbal Word Problems into Linear Equations",
    target_score_pct: 78,
    exam_total_marks: 100,
    exam_marks_obtained: 61,
    ai_exam_scan: {
      scanned_at: "14 Oct 2026, 04:30 PM",
      questions_flagged: "Section C: Q12 & Q14 (Linear Word Problems)",
      weak_concept: "Translating Verbal Word Problems into Linear Equations",
      diagnostic_summary: "Priya solves standard equations with 90% accuracy, but struggles to translate real-world speed/distance/time scenarios into mathematical expressions.",
      recommended_focus: "7-Day Targeted Algebra Sprint: Equation Modeling from Word Problems."
    },
    current_day: 4,
    total_days: 7,
    submission_status: "Verified",
    submitted_file: {
      name: "Priya_Word_Problems_Day4.pdf",
      size: "1.1 MB",
      submitted_at: "Yesterday, 05:00 PM",
      student_notes: "Solved speed-time-distance word problems 1 through 4.",
      preview_url: "/samples/math_worksheet.png"
    },
    teacher_verification_notes: "Variable definitions clear and equations formulated correctly. Approved.",
    verified_at: "Today, 09:00 AM",
    parent_name: "Mrs. Meena Patel",
    parent_phone: "+91 98450 77881",
    parent_status: "Parent Verified ✓",
    teacher_action: "Approved Day 4 work. Encouraged student to tackle Day 5 mixed challenges.",
    parent_call_script: "Priya has completed Days 1, 2, 3 and 4 of her 7-day Math plan. She is on track to clear the 70% mastery threshold.",
    plan_days: [
      {
        day_num: 1,
        day_label: "Day 1 (Mon)",
        title: "Keyword Mapping: Identifying Operations in Word Problems",
        focus_task: "Map 10 English phrases (e.g. 'sum of', 'decreased by', 'times') to math operators.",
        resource: "Vocabulary Guide: Language of Algebra",
        status: "Completed",
        submission_required: false,
        parent_checklist: "Check keyword table in notebook."
      },
      {
        day_num: 2,
        day_label: "Day 2 (Tue)",
        title: "Variable Declaration & Defining 'x'",
        focus_task: "Write 'Let x be...' statements for 5 real-world age and number problems.",
        resource: "Worksheet 2: Setting up Unknowns",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Confirm 5 problems attempted."
      },
      {
        day_num: 3,
        day_label: "Day 3 (Wed)",
        title: "Speed, Distance & Time Equation Setup",
        focus_task: "Apply Distance = Speed × Time formula to model 4 train & vehicle scenarios.",
        resource: "Problem Set 3: Motion Scenarios",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Verify formulas verified."
      },
      {
        day_num: 4,
        day_label: "Day 4 (Thu)",
        title: "Geometric Perimeter & Area Word Problems",
        focus_task: "Solve 4 rectangle and triangle dimensions problems involving linear relations.",
        resource: "Geometry-Algebra Crossover Sheet",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Check rough notebook diagrams."
      },
      {
        day_num: 5,
        day_label: "Day 5 (Fri)",
        title: "Cost, Profit & Money Word Problems",
        focus_task: "Model 4 commercial algebra scenarios involving tickets, coins, and total revenue.",
        resource: "Practice Set #5: Commercial Word Problems",
        status: "In Progress",
        submission_required: true,
        parent_checklist: "Review step-by-step solutions."
      },
      {
        day_num: 6,
        day_label: "Day 6 (Sat)",
        title: "Timed 15-Minute Portal Micro-Diagnostic Test",
        focus_task: "Take 5-question timed scenario diagnostic on portal.",
        resource: "Portal Word Problem Diagnostic #1",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Verify score on portal."
      },
      {
        day_num: 7,
        day_label: "Day 7 (Sun)",
        title: "Final Review & Exit Clearance",
        focus_task: "Submit notebook to teacher and achieve >75% on exit challenge questions.",
        resource: "Mastery Clearance Assessment",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Sign off completion with teacher."
      }
    ]
  },

  // ==========================================
  // MATHEMATICS - SECTION 8-A (2 Students <= 70%)
  // ==========================================
  {
    id: 4,
    student_id: 22,
    roll_no: "22",
    name: "Vivaan Sen",
    class_name: "Class 8-A",
    subject: "Mathematics",
    category: "Critical Remedial",
    exam_name: "Mid-Term Examination",
    exam_score_pct: 54, // <= 70%
    current_score_pct: 54,
    weak_concept: "Linear Equations in Two Variables: Elimination & Substitution",
    target_score_pct: 75,
    exam_total_marks: 100,
    exam_marks_obtained: 54,
    ai_exam_scan: {
      scanned_at: "14 Oct 2026, 04:45 PM",
      questions_flagged: "Section B: Q6 & Section C: Q11 (Simultaneous Equations)",
      weak_concept: "Linear Equations in Two Variables: Elimination & Substitution",
      diagnostic_summary: "Vivaan multiplies coefficients correctly for elimination but frequently forgets to subtract equations across all terms, introducing sign slips on the constant term.",
      recommended_focus: "7-Day Targeted Algebra Sprint: Step-by-Step Elimination Methodology."
    },
    current_day: 3,
    total_days: 7,
    submission_status: "Submitted",
    submitted_file: {
      name: "Vivaan_Simultaneous_Eq_Day3.pdf",
      size: "1.2 MB",
      submitted_at: "Today, 08:15 AM",
      student_notes: "Checked all constant subtractions with red pen as instructed.",
      preview_url: "/samples/math_worksheet.png"
    },
    teacher_verification_notes: "Elimination signs on constant terms verified. Clean work.",
    verified_at: "Today, 10:30 AM",
    parent_name: "Mr. Alok Sen",
    parent_phone: "+91 98450 33221",
    parent_status: "Parent Verified ✓",
    teacher_action: "Approved Day 3 progress. Guide through substitution checks on Day 4.",
    parent_call_script: "Vivaan completed Day 1 and 2 of his 7-day Linear Equations sprint. Day 3 work is submitted.",
    plan_days: [
      {
        day_num: 1,
        day_label: "Day 1 (Mon)",
        title: "Standard Form & Alignment of 2-Variable Equations",
        focus_task: "Align ax + by = c variables in vertical columns for 5 equation pairs.",
        resource: "Worksheet 1: Aligning Linear Systems",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Check 5 aligned pairs in rough book.",
        questions: [
          {
            question_number: "Problem 1",
            question_text: "Align into ax + by = c form: 3x = 5y - 7 and 2y + 4x = 10.",
            rubric_key: "Check: 3x - 5y = -7 and 4x + 2y = 10.",
            expected_solution: "3x - 5y = -7 and 4x + 2y = 10."
          }
        ]
      },
      {
        day_num: 2,
        day_label: "Day 2 (Tue)",
        title: "Multiplying Equations to Equalize Coefficients",
        focus_task: "Practice finding the LCM of x or y coefficients for 4 simultaneous pairs.",
        resource: "Video: Elimination Made Simple",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Signed homework diary."
      },
      {
        day_num: 3,
        day_label: "Day 3 (Wed)",
        title: "Elimination by Subtraction & Sign Distribution",
        focus_task: "Solve 4 simultaneous systems showing the sign reversal on the subtracted row.",
        resource: "Practice Set #3: Sign Inversion in Subtraction",
        status: "In Progress",
        submission_required: true,
        parent_checklist: "Verify red pen sign checks in notebook."
      },
      {
        day_num: 4,
        day_label: "Day 4 (Thu)",
        title: "Back-Substitution into Original Equations",
        focus_task: "Substitute solved variable back into both equations to ensure consistency.",
        resource: "Drill 4: Verification via Back-Substitution",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Confirm checks signed."
      },
      {
        day_num: 5,
        day_label: "Day 5 (Fri)",
        title: "Method of Substitution for Word Scenarios",
        focus_task: "Express y in terms of x for 4 age and geometry word problems.",
        resource: "Worksheet 5: Substitution Strategy",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Review notebook."
      },
      {
        day_num: 6,
        day_label: "Day 6 (Sat)",
        title: "Adaptive Portal Timed Micro-Quiz",
        focus_task: "Attempt 5 simultaneous equation questions on portal.",
        resource: "Portal Algebra Quiz #4",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Verify score on app."
      },
      {
        day_num: 7,
        day_label: "Day 7 (Sun)",
        title: "Faculty Clearance Review",
        focus_task: "Complete 1-on-1 whiteboard problem solving with teacher.",
        resource: "Mastery Clearance Rubric",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Teacher exit confirmation."
      }
    ]
  },
  {
    id: 5,
    student_id: 31,
    roll_no: "31",
    name: "Diya Kapoor",
    class_name: "Class 8-A",
    subject: "Mathematics",
    category: "Critical Remedial",
    exam_name: "Mid-Term Examination",
    exam_score_pct: 59, // <= 70%
    current_score_pct: 59,
    weak_concept: "Exponents & Powers: Negative Index Multiplication Rules",
    target_score_pct: 75,
    exam_total_marks: 100,
    exam_marks_obtained: 59,
    ai_exam_scan: {
      scanned_at: "14 Oct 2026, 04:50 PM",
      questions_flagged: "Section A: Q3 & Section B: Q8 (Laws of Exponents)",
      weak_concept: "Exponents & Powers: Negative Index Multiplication Rules",
      diagnostic_summary: "Diya correctly applies a^m * a^n = a^(m+n) for positive integers, but confuses a^(-n) = 1/(a^n) with negative base numbers like (-a)^n.",
      recommended_focus: "7-Day Targeted Exponents Sprint: Negative Powers and Reciprocal Laws."
    },
    current_day: 2,
    total_days: 7,
    submission_status: "Pending",
    submitted_file: {
      name: "Diya_Exponents_Day2.pdf",
      size: "890 KB",
      submitted_at: "Yesterday, 07:45 PM",
      student_notes: "Completed laws 1 to 4. Revising negative bases.",
      preview_url: "/samples/math_worksheet.png"
    },
    teacher_verification_notes: "Review reciprocal rule for fractional bases.",
    parent_name: "Mrs. Sunita Kapoor",
    parent_phone: "+91 98450 88990",
    parent_status: "Pending Parent Review ⏳",
    teacher_action: "Prompt parent to supervise Day 2 study.",
    parent_call_script: "Diya has completed Day 1 of her Exponents focus plan. Day 2 is pending review.",
    plan_days: [
      {
        day_num: 1,
        day_label: "Day 1 (Mon)",
        title: "Reciprocal Definition of Negative Indices: a^(-n) = 1/a^n",
        focus_task: "Convert 10 expressions with negative exponents to positive fractions.",
        resource: "Video: Exponents Negative Powers",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Check 10 conversions in book."
      },
      {
        day_num: 2,
        day_label: "Day 2 (Tue)",
        title: "Negative Bases vs Negative Exponents",
        focus_task: "Contrast (-2)^4 vs 2^(-4) across 6 numerical examples.",
        resource: "Worksheet 2: Distinguishing Bases and Powers",
        status: "In Progress",
        submission_required: true,
        parent_checklist: "Signed study log."
      },
      {
        day_num: 3,
        day_label: "Day 3 (Wed)",
        title: "Division of Powers with Mixed Signs: a^m / a^n = a^(m-n)",
        focus_task: "Simplify 6 expressions containing negative exponents in denominators.",
        resource: "Practice Set #3: Quotient Law",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Review notebook."
      },
      {
        day_num: 4,
        day_label: "Day 4 (Thu)",
        title: "Power of a Power: (a^m)^n = a^(m*n)",
        focus_task: "Multiply mixed negative power towers across 5 problems.",
        resource: "Drill 4: Power of Powers",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Check work."
      },
      {
        day_num: 5,
        day_label: "Day 5 (Fri)",
        title: "Standard Scientific Notation with Negative Powers of 10",
        focus_task: "Express 5 very small numbers (e.g. 0.000045) in scientific form.",
        resource: "Worksheet 5: Scientific Notation",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Sign diary."
      },
      {
        day_num: 6,
        day_label: "Day 6 (Sat)",
        title: "Timed 15-Minute Exponent Speed Quiz",
        focus_task: "Attempt 6 timed exponent simplification problems on portal.",
        resource: "Portal Exponent Quiz #1",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Verify score on app."
      },
      {
        day_num: 7,
        day_label: "Day 7 (Sun)",
        title: "Exit Clearance Review",
        focus_task: "Demonstrate law mastery to teacher to exit remedial batch.",
        resource: "Mastery Clearance Rubric",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Teacher sign-off."
      }
    ]
  },

  // ==========================================
  // MATHEMATICS - SECTION 9-A (2 Students <= 70%)
  // ==========================================
  {
    id: 6,
    student_id: 14,
    roll_no: "14",
    name: "Rohan Deshmukh",
    class_name: "Class 9-A",
    subject: "Mathematics",
    category: "Targeted Practice",
    exam_name: "Mid-Term Examination",
    exam_score_pct: 63, // <= 70%
    current_score_pct: 63,
    weak_concept: "Coordinate Geometry: Distance & Section Formula Calculations",
    target_score_pct: 80,
    exam_total_marks: 100,
    exam_marks_obtained: 63,
    ai_exam_scan: {
      scanned_at: "14 Oct 2026, 05:00 PM",
      questions_flagged: "Section B: Q5 & Section C: Q13 (Coordinate Systems)",
      weak_concept: "Coordinate Geometry: Distance & Section Formula Calculations",
      diagnostic_summary: "Rohan correctly memorizes d = sqrt((x2 - x1)^2 + (y2 - y1)^2), but subtracts negative coordinates incorrectly (e.g., 3 - (-4) treated as 3 - 4 = -1 instead of 7).",
      recommended_focus: "7-Day Targeted Coordinate Sprint: Negative Coordinates & Section Formula."
    },
    current_day: 3,
    total_days: 7,
    submission_status: "Submitted",
    submitted_file: {
      name: "Rohan_Coordinate_Distance_Day3.pdf",
      size: "1.3 MB",
      submitted_at: "Today, 08:00 AM",
      student_notes: "Plotted points on cartesian grid before applying distance formula.",
      preview_url: "/samples/math_worksheet.png"
    },
    teacher_verification_notes: "Cartesian plots clear. Minus sign inside square root handled cleanly.",
    verified_at: "Today, 09:45 AM",
    parent_name: "Dr. K. Deshmukh",
    parent_phone: "+91 98450 11447",
    parent_status: "Parent Verified ✓",
    teacher_action: "Approved Day 3 work. Ready for internal section formula practice on Day 4.",
    parent_call_script: "Rohan has completed Day 1 and 2 of his Coordinate Geometry plan. Day 3 is submitted.",
    plan_days: [
      {
        day_num: 1,
        day_label: "Day 1 (Mon)",
        title: "Cartesian Quadrant Mapping & Negative Sign Rules",
        focus_task: "Plot 8 points across all 4 quadrants with negative coordinates labeled.",
        resource: "Video: Cartesian Signs and Distance",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Check 8 plotted points in notebook."
      },
      {
        day_num: 2,
        day_label: "Day 2 (Tue)",
        title: "Distance Formula: Handling Double Negatives (x2 - (-x1))",
        focus_task: "Calculate distance between 4 point pairs where coordinates are negative.",
        resource: "Worksheet 2: Distance Formula Traps",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Verify calculations."
      },
      {
        day_num: 3,
        day_label: "Day 3 (Wed)",
        title: "Collinearity of 3 Points via Distance Formula",
        focus_task: "Verify AB + BC = AC for 3 sets of collinear points.",
        resource: "Practice Set #3: Collinearity Checks",
        status: "In Progress",
        submission_required: true,
        parent_checklist: "Review step-by-step proofs."
      },
      {
        day_num: 4,
        day_label: "Day 4 (Thu)",
        title: "Internal Section Formula: m1*x2 + m2*x1 / (m1 + m2)",
        focus_task: "Find coordinates of division points for 4 line segments in given ratios.",
        resource: "Worksheet 4: Section Formula Ratio Method",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Check ratio calculations."
      },
      {
        day_num: 5,
        day_label: "Day 5 (Fri)",
        title: "Midpoint Formula & Triangle Centroid Coordinates",
        focus_task: "Calculate midpoints of polygon vertices across 4 geometric shapes.",
        resource: "Practice Set #5: Midpoints & Centroids",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Sign diary."
      },
      {
        day_num: 6,
        day_label: "Day 6 (Sat)",
        title: "Timed 15-Minute Coordinate Speed Quiz",
        focus_task: "Complete 5 online multiple-choice coordinate problems on portal.",
        resource: "Portal Coordinate Quiz #2",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Verify quiz score on app."
      },
      {
        day_num: 7,
        day_label: "Day 7 (Sun)",
        title: "Exit Clearance Review",
        focus_task: "Demonstrate distance formula calculation without slip to teacher.",
        resource: "Mastery Clearance Rubric",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Teacher sign-off."
      }
    ]
  },
  {
    id: 7,
    student_id: 7,
    roll_no: "07",
    name: "Ananya Rao",
    class_name: "Class 9-A",
    subject: "Mathematics",
    category: "Critical Remedial",
    exam_name: "Mid-Term Examination",
    exam_score_pct: 57, // <= 70%
    current_score_pct: 57,
    weak_concept: "Polynomials: Remainder Theorem & Factor Theorem Factorization",
    target_score_pct: 75,
    exam_total_marks: 100,
    exam_marks_obtained: 57,
    ai_exam_scan: {
      scanned_at: "14 Oct 2026, 05:10 PM",
      questions_flagged: "Section B: Q7 & Section C: Q12 (Polynomial Division)",
      weak_concept: "Polynomials: Remainder Theorem & Factor Theorem Factorization",
      diagnostic_summary: "Ananya solves linear factoring well, but fails to set divisor equal to zero correctly (e.g. testing x = +2 instead of x = -2 when divisor is x + 2), resulting in wrong remainders.",
      recommended_focus: "7-Day Targeted Polynomials Sprint: Root Substitution and Factor Theorems."
    },
    current_day: 2,
    total_days: 7,
    submission_status: "Pending",
    submitted_file: {
      name: "Ananya_Remainder_Theorem_Day2.pdf",
      size: "920 KB",
      submitted_at: "Yesterday, 06:45 PM",
      student_notes: "Checked zero of linear divisors.",
      preview_url: "/samples/math_worksheet.png"
    },
    teacher_verification_notes: "Zero of divisor clearly marked in red. Good progress.",
    parent_name: "Mr. V. Rao",
    parent_phone: "+91 98450 66551",
    parent_status: "Pending Parent Review ⏳",
    teacher_action: "Remind student to complete Day 2 synthetic check.",
    parent_call_script: "Ananya has finished Day 1 of her 7-day Polynomials focus sprint.",
    plan_days: [
      {
        day_num: 1,
        day_label: "Day 1 (Mon)",
        title: "Finding the Zero of Linear Divisor (x - a = 0 => x = a)",
        focus_task: "Identify roots of 8 linear polynomials including fractions and negative terms.",
        resource: "Video: Remainder Theorem Basics",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Check 8 roots in notebook."
      },
      {
        day_num: 2,
        day_label: "Day 2 (Tue)",
        title: "Evaluating P(a) by Direct Polynomial Substitution",
        focus_task: "Calculate remainder for 4 cubic polynomials using Remainder Theorem.",
        resource: "Worksheet 2: Cubic Substitution",
        status: "In Progress",
        submission_required: true,
        parent_checklist: "Signed homework sheet."
      },
      {
        day_num: 3,
        day_label: "Day 3 (Wed)",
        title: "Factor Theorem: Condition for P(a) = 0",
        focus_task: "Test whether (x - 2) and (x + 3) are factors of 4 given polynomials.",
        resource: "Practice Set #3: Factor Theorem Checks",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Review notebook."
      },
      {
        day_num: 4,
        day_label: "Day 4 (Thu)",
        title: "Splitting Cubic Polynomials using Trial Factor + Long Division",
        focus_task: "Completely factorize 2 cubic polynomials step-by-step.",
        resource: "Drill 4: Cubic Factorization",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Check long division steps."
      },
      {
        day_num: 5,
        day_label: "Day 5 (Fri)",
        title: "Algebraic Identities: (a + b + c)² and a³ + b³ + c³ - 3abc",
        focus_task: "Expand and factor 4 multi-variable polynomial expressions.",
        resource: "Worksheet 5: Higher Degree Identities",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Sign diary."
      },
      {
        day_num: 6,
        day_label: "Day 6 (Sat)",
        title: "Timed 15-Minute Polynomials Micro-Diagnostic",
        focus_task: "Complete 5 adaptive polynomial questions on portal.",
        resource: "Online Diagnostic Quiz #5",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Verify quiz score on portal."
      },
      {
        day_num: 7,
        day_label: "Day 7 (Sun)",
        title: "Faculty Clearance Review",
        focus_task: "Factor cubic equation on whiteboard to exit focus batch.",
        resource: "Mastery Clearance Rubric",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Teacher sign-off."
      }
    ]
  },

  // ==========================================
  // MATHEMATICS - SECTION 9-B (1 Student <= 70%)
  // ==========================================
  {
    id: 8,
    student_id: 18,
    roll_no: "18",
    name: "Nikhil Joshi",
    class_name: "Class 9-B",
    subject: "Mathematics",
    category: "Critical Remedial",
    exam_name: "Mid-Term Examination",
    exam_score_pct: 50, // <= 70%
    current_score_pct: 50,
    weak_concept: "Surface Areas & Volumes: Frustum & Cylinder Formulas",
    target_score_pct: 75,
    exam_total_marks: 100,
    exam_marks_obtained: 50,
    ai_exam_scan: {
      scanned_at: "14 Oct 2026, 05:20 PM",
      questions_flagged: "Section C: Q11 & Section D: Q15 (Mensuration)",
      weak_concept: "Surface Areas & Volumes: Frustum & Cylinder Formulas",
      diagnostic_summary: "Nikhil confuses total surface area (including end circles) with curved surface area and makes arithmetic calculation errors when substituting pi = 22/7 into R^2 - r^2.",
      recommended_focus: "7-Day Targeted Mensuration Sprint: Surface Area Formulas & Unit Conversions."
    },
    current_day: 2,
    total_days: 7,
    submission_status: "Pending",
    submitted_file: {
      name: "Nikhil_Mensuration_Day2_Draft.pdf",
      size: "810 KB",
      submitted_at: "Yesterday, 07:15 PM",
      student_notes: "Attempted cylinder TSA vs CSA comparisons.",
      preview_url: "/samples/math_worksheet.png"
    },
    teacher_verification_notes: "Formula distinctions clear. Calculate final answers to 2 decimal places.",
    parent_name: "Mr. S. Joshi",
    parent_phone: "+91 98450 77112",
    parent_status: "Pending Parent Review ⏳",
    teacher_action: "Follow up on Day 2 practice sheet completion.",
    parent_call_script: "Nikhil completed Day 1 of his 7-day Mensuration sprint. Day 2 practice is due tonight.",
    plan_days: [
      {
        day_num: 1,
        day_label: "Day 1 (Mon)",
        title: "Curved Surface Area (CSA) vs Total Surface Area (TSA)",
        focus_task: "Draw 3D diagrams of Cylinder and Cone labeling base areas vs curved walls.",
        resource: "Video: Mensuration Visualized",
        status: "Completed",
        submission_required: true,
        parent_checklist: "Check 3D diagrams in notebook."
      },
      {
        day_num: 2,
        day_label: "Day 2 (Tue)",
        title: "Hollow Cylinder Formula: 2πh(R + r) + 2π(R² - r²)",
        focus_task: "Calculate volume and surface area for 3 hollow metal pipes.",
        resource: "Worksheet 2: Hollow Cylinders",
        status: "In Progress",
        submission_required: true,
        parent_checklist: "Signed study diary."
      },
      {
        day_num: 3,
        day_label: "Day 3 (Wed)",
        title: "Frustum of a Cone: Slant Height l = sqrt(h² + (R - r)²)",
        focus_task: "Compute slant height and CSA for 3 bucket and lampshade problems.",
        resource: "Practice Set #3: Frustum Formulas",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Review student rough work."
      },
      {
        day_num: 4,
        day_label: "Day 4 (Thu)",
        title: "Volume Conversion: Melting and Recasting Shapes",
        focus_task: "Solve 4 conservation of volume problems (sphere melted into wire).",
        resource: "Drill 4: Recasting Solids",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Check calculations."
      },
      {
        day_num: 5,
        day_label: "Day 5 (Fri)",
        title: "Unit Conversion Precision: cm³ to Litres and m² to cm²",
        focus_task: "Convert water tank capacities into litres for 4 word problems.",
        resource: "Worksheet 5: Capacity & Unit Traps",
        status: "Upcoming",
        submission_required: true,
        parent_checklist: "Sign diary."
      },
      {
        day_num: 6,
        day_label: "Day 6 (Sat)",
        title: "Timed 15-Minute Mensuration Speed Quiz",
        focus_task: "Complete 5 formula calculation questions on portal.",
        resource: "Portal Mensuration Quiz #1",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Verify quiz score."
      },
      {
        day_num: 7,
        day_label: "Day 7 (Sun)",
        title: "Faculty Clearance Review",
        focus_task: "Demonstrate frustum formula application to teacher to exit remedial batch.",
        resource: "Mastery Clearance Rubric",
        status: "Upcoming",
        submission_required: false,
        parent_checklist: "Teacher exit sign-off."
      }
    ]
  }
];

const STORAGE_KEY = 'edu360_focus_roster_cache_v4';

export function getStoredFocusRoster(): FocusRosterItem[] {
  if (typeof window === 'undefined') return INITIAL_FOCUS_ROSTER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FOCUS_ROSTER));
      return INITIAL_FOCUS_ROSTER;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0 || !parsed[0].ai_exam_scan) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FOCUS_ROSTER));
      return INITIAL_FOCUS_ROSTER;
    }
    return parsed;
  } catch {
    return INITIAL_FOCUS_ROSTER;
  }
}

export function saveStoredFocusRoster(roster: FocusRosterItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
  } catch (err) {
    console.error('Failed to save focus roster', err);
  }
}

export function getFocusStudentById(studentId: number): FocusRosterItem | undefined {
  const roster = getStoredFocusRoster();
  return roster.find(s => s.student_id === studentId || s.id === studentId);
}

export function updateFocusStudent(studentId: number, patch: Partial<FocusRosterItem>): FocusRosterItem[] {
  const roster = getStoredFocusRoster();
  const updated = roster.map(item => {
    if (item.student_id === studentId || item.id === studentId) {
      return { ...item, ...patch };
    }
    return item;
  });
  saveStoredFocusRoster(updated);
  return updated;
}
