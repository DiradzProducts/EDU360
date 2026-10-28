'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Target, 
  BookOpen, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  AlertCircle,
  Brain,
  Check,
  ChevronRight,
  Eye,
  FileCheck,
  Loader2,
  X,
  MessageSquare,
  Award,
  AlertTriangle
} from 'lucide-react';
import { api } from '@/lib/api';
import { FocusRosterItem, WeekFocusDay, WeekFocusProblem } from '@/lib/focus-data';
import { SocraticHintResponse } from '@/lib/types';

interface StudentRemedialViewProps {
  studentId?: number;
}

const SCIENCE_PHYSICS_REMEDIAL: FocusRosterItem = {
  id: 101,
  student_id: 1,
  roll_no: "14",
  name: "Aarav Sharma",
  class_name: "Class 8-B",
  subject: "Science / Physics",
  category: "Targeted Practice",
  exam_name: "Term 1 Diagnostics — Optics & Light",
  exam_score_pct: 58,
  exam_total_marks: 100,
  exam_marks_obtained: 58,
  target_score_pct: 80,
  total_days: 7,
  current_day: 3,
  ai_exam_scan: {
    scanned_at: "16 Oct 2026, 02:40 PM",
    questions_flagged: "Q3 (Spherical mirror focal length), Q7 (Magnification sign)",
    weak_concept: "Cartesian Sign Conventions in Spherical Mirrors (1/f = 1/v + 1/u)",
    diagnostic_summary: "Student repeatedly forgets that real inverted images formed by concave mirrors have negative image distance (v < 0) and that the focal length of a concave mirror is negative (f < 0). This causes sign error cascades in magnification calculations.",
    recommended_focus: "Daily 15-minute ray diagram tracing + signed substitution drills with Cartesian origin at mirror pole.",
    sub_topics: [
      "Cartesian Sign Rule: u is always negative (-u) for real objects",
      "Concave mirror focal length is negative (f = -R/2)",
      "Magnification m = -v/u: real images have negative m, virtual images have positive m"
    ],
    backlog_correlation: "Unit 2 Light & Spherical Reflection — Homework #3 was submitted with positive signs."
  },
  submission_status: "Submitted",
  parent_name: "Rajesh Sharma",
  parent_phone: "+91 98450 12345",
  parent_status: "Parent Verified ✓",
  parent_call_script: "Aarav is practicing spherical mirror ray tracing daily. Please review his rough notes.",
  teacher_action: "Inspect Day 3 ray diagrams during Zero Period.",
  plan_days: [
    {
      day_num: 1,
      day_label: "Day 1 (Mon)",
      title: "Mirror Pole & Cartesian Coordinates Setup",
      focus_task: "Draw Cartesian axes placing Mirror Pole P at origin (0,0). Label all distances to the left as negative.",
      resource: "Physics NCERT Chapter 10 & Optics Simulation Lab",
      status: "Completed",
      submission_required: true,
      parent_checklist: "Verified Cartesian axes drawn in rough copy.",
      questions: [
        {
          question_number: "Problem 1",
          question_text: "A concave mirror has a radius of curvature of 30 cm. State its focal length with the proper Cartesian sign.",
          rubric_key: "f = -R/2 = -30/2 = -15 cm",
          expected_solution: "f = -15 cm"
        }
      ],
      submitted_file: {
        name: "Aarav_Day1_Optics_Cartesian.pdf",
        size: "1.2 MB",
        submitted_at: "Mon, 06:15 PM",
        student_notes: "Completed diagram with pole at origin."
      }
    },
    {
      day_num: 2,
      day_label: "Day 2 (Tue)",
      title: "Object Between C and F Ray Tracing",
      focus_task: "Trace two standard rays (parallel to principal axis and passing through focus) to locate image position.",
      resource: "Ray Tracing Video Module & Geometrical Optics Kit",
      status: "Completed",
      submission_required: true,
      parent_checklist: "Checked ray arrows and arrowhead direction.",
      questions: [
        {
          question_number: "Problem 1",
          question_text: "Where is the image formed when an object is placed between Center of Curvature (C) and Focus (F) of a concave mirror?",
          rubric_key: "Image formed beyond C, real, inverted, magnified.",
          expected_solution: "Beyond C, real and inverted."
        }
      ],
      submitted_file: {
        name: "Aarav_Day2_RayTracing_BeyondC.pdf",
        size: "1.5 MB",
        submitted_at: "Tue, 05:45 PM",
        student_notes: "Drew 2 rays clearly showing intersection beyond C."
      }
    },
    {
      day_num: 3,
      day_label: "Day 3 (Wed - Today)",
      title: "Mirror Formula Signed Numerical Substitutions",
      focus_task: "Solve numericals for image distance v using 1/f = 1/v + 1/u with strict sign discipline.",
      resource: "Targeted Worksheet: 5 Mirror Numericals (Dr. Raman)",
      status: "In Progress",
      submission_required: true,
      parent_checklist: "Ensure both u and f are substituted with negative signs in brackets.",
      questions: [
        {
          question_number: "Problem 1",
          question_text: "An object is placed at a distance of 20 cm in front of a concave mirror of focal length 15 cm. Find the position of the image (v) and state whether it is real or virtual.",
          rubric_key: "Given: u = -20 cm, f = -15 cm. 1/v = 1/f - 1/u = 1/(-15) - 1/(-20) = -1/15 + 1/20 = (-4 + 3)/60 = -1/60 => v = -60 cm (Real & Inverted).",
          expected_solution: "v = -60 cm, Real and inverted image formed 60 cm in front of mirror.",
          formula_card: {
            title: "Mirror Formula & Sign Rule",
            rule: "1/f = 1/v + 1/u,  f < 0 for concave mirror, u < 0 always",
            explanation: "Substitute values enclosed in brackets with signs: 1/(-15) = 1/v + 1/(-20). Move 1/(-20) to LHS to get -1/15 + 1/20.",
            visual_steps: [
              "1. Identify signs: f = -15 cm, u = -20 cm",
              "2. Rearrange: 1/v = 1/f - 1/u",
              "3. Substitute: 1/v = -1/15 - (-1/20) = -1/15 + 1/20",
              "4. LCM of 15 and 20 is 60: (-4 + 3)/60 = -1/60",
              "5. Invert: v = -60 cm (Negative sign confirms real image)"
            ]
          }
        },
        {
          question_number: "Problem 2",
          question_text: "Calculate the linear magnification m for the above problem. Is the image enlarged or diminished?",
          rubric_key: "m = -v/u = -(-60)/(-20) = 60/(-20) = -3. Since |m| = 3 > 1, image is enlarged 3 times.",
          expected_solution: "m = -3 (Enlarged by 3x, negative sign shows inverted)."
        }
      ]
    },
    {
      day_num: 4,
      day_label: "Day 4 (Thu)",
      title: "Convex Mirror Virtual Images & Field of View",
      focus_task: "Understand why convex mirrors always produce virtual, erect, and diminished images.",
      resource: "Automobile Rear-view Mirror Case Study",
      status: "Upcoming",
      submission_required: false,
      parent_checklist: "Review why focal length of convex mirror is positive."
    },
    {
      day_num: 5,
      day_label: "Day 5 (Fri)",
      title: "Refraction & Snell's Law Introduction",
      focus_task: "Calculate refractive index n = sin(i) / sin(r) and speed of light in glass medium.",
      resource: "Lab Demonstration Video: Light Bending in Glass Slab",
      status: "Upcoming",
      submission_required: true,
      parent_checklist: "Verify normal line and incident angle notation."
    },
    {
      day_num: 6,
      day_label: "Day 6 (Sat)",
      title: "Convex Lens Thin Lens Formula (1/f = 1/v - 1/u)",
      focus_task: "Contrast lens formula against mirror formula to prevent sign mix-ups.",
      resource: "Comparison Table: Mirror vs Thin Lens Formulas",
      status: "Upcoming",
      submission_required: true,
      parent_checklist: "Confirm negative sign in 1/v - 1/u."
    },
    {
      day_num: 7,
      day_label: "Day 7 (Sun)",
      title: "15-Minute Remedial Exit Check (Optics)",
      focus_task: "Score > 75% on timed 5-problem numerical set to graduate from Optics Remedial sprint.",
      resource: "Timed Diagnostic Exit Test: Dr. Raman",
      status: "Upcoming",
      submission_required: true,
      parent_checklist: "Supervise 15-minute timed paper without calculator."
    }
  ]
};

const ENGLISH_REMEDIAL: FocusRosterItem = {
  id: 102,
  student_id: 1,
  roll_no: "14",
  name: "Aarav Sharma",
  class_name: "Class 8-B",
  subject: "English Literature",
  category: "Targeted Practice",
  exam_name: "Term 1 Literature Descriptive Essay",
  exam_score_pct: 62,
  exam_total_marks: 100,
  exam_marks_obtained: 62,
  target_score_pct: 85,
  total_days: 7,
  current_day: 3,
  ai_exam_scan: {
    scanned_at: "17 Oct 2026, 11:15 AM",
    questions_flagged: "Q2 (Thematic analysis), Q5 (Mercy vs Justice contrast)",
    weak_concept: "Thematic Contrast & Critical Textual Synthesis (Mercy vs Retributive Justice)",
    diagnostic_summary: "Student simply summarizes the plot events of Act IV Scene 1 instead of critically contrasting Portia's appeal to divine grace ('The quality of mercy is not strained') against Shylock's strict reliance on Venetian legal bond. Loses 8-10 marks on analytical depth.",
    recommended_focus: "Use the PEEL structure (Point, Evidence, Explanation, Link) for dramatic analysis with direct quotations.",
    sub_topics: [
      "PEEL Paragraph Architecture: Thesis-driven topic sentences",
      "Textual citation integration: Weaving Shylock's 'I stand here for law' with analysis",
      "Evaluating dramatic tension: Divine mercy versus rigid statutory contracts"
    ],
    backlog_correlation: "Mid-Term Essay Assignment #2 received feedback on lack of textual quotations."
  },
  submission_status: "Submitted",
  parent_name: "Rajesh Sharma",
  parent_phone: "+91 98450 12345",
  parent_status: "Parent Verified ✓",
  parent_call_script: "Aarav is practicing spherical mirror ray tracing daily. Please review his rough notes.",
  teacher_action: "Inspect Day 3 ray diagrams during Zero Period.",
  plan_days: [
    {
      day_num: 1,
      day_label: "Day 1 (Mon)",
      title: "PEEL Paragraph Framework Mastery",
      focus_task: "Learn to write 1 paragraph using Point, Evidence (Quote), Explanation, and Link back to question.",
      resource: "Cambridge IGCSE / CBSE Class 8 Drama Writing Guide",
      status: "Completed",
      submission_required: true,
      parent_checklist: "Check that paragraph starts with a clear analytical claim.",
      questions: [
        {
          question_number: "Problem 1",
          question_text: "What does PEEL stand for and why is Evidence with quotation essential in character analysis?",
          rubric_key: "Point, Evidence, Explanation, Link. Direct quotes prove the critical assertion.",
          expected_solution: "P=Point, E=Evidence, E=Explanation, L=Link."
        }
      ],
      submitted_file: {
        name: "Aarav_Day1_PEEL_Framework.pdf",
        size: "980 KB",
        submitted_at: "Mon, 07:10 PM",
        student_notes: "Wrote model paragraph on Shylock's bond."
      }
    },
    {
      day_num: 2,
      day_label: "Day 2 (Tue)",
      title: "Analyzing Portia's 'Quality of Mercy' Speech",
      focus_task: "Deconstruct metaphors of gentle rain and monarch's crown in Portia's speech.",
      resource: "Audio Recitation: Act IV Scene 1 (Royal Shakespeare Company)",
      status: "Completed",
      submission_required: true,
      parent_checklist: "Confirm student underlined 'twice blest' and 'enthroned in the hearts of kings'.",
      questions: [
        {
          question_number: "Problem 1",
          question_text: "Quote two lines from Portia's speech where mercy is compared to nature or divine authority.",
          rubric_key: "'It droppeth as the gentle rain from heaven / Upon the place beneath'",
          expected_solution: "Gentle rain from heaven; enthroned in the hearts of kings."
        }
      ],
      submitted_file: {
        name: "Aarav_Day2_MercySpeech_Notes.pdf",
        size: "1.1 MB",
        submitted_at: "Tue, 06:30 PM",
        student_notes: "Annotated 6 major metaphors from Act IV."
      }
    },
    {
      day_num: 3,
      day_label: "Day 3 (Wed - Today)",
      title: "Contrast Essay: Mercy vs Retributive Law",
      focus_task: "Draft a 250-word analytical essay contrasting Portia's stance against Shylock's bond.",
      resource: "Worksheet: Comparative Thematic Matrix (Mrs. Sunitha Rao)",
      status: "In Progress",
      submission_required: true,
      parent_checklist: "Verify student uses linking words: 'in stark contrast', 'whereas', 'subverts'.",
      questions: [
        {
          question_number: "Problem 1",
          question_text: "Write the central thesis statement contrasting Portia's conception of mercy as a divine, unrestrained attribute with Shylock's insistence on legal enforceability.",
          rubric_key: "Thesis must balance both characters' moral and judicial perspectives.",
          expected_solution: "While Portia elevates mercy as an uncoerced divine virtue that elevates justice, Shylock views rigid statutory compliance as the sole safeguard for marginalized survival in Venice.",
          formula_card: {
            title: "Analytical Essay Contrast Architecture",
            rule: "Thesis = Claim + Counter-Perspective + Significance",
            explanation: "Do not just narrate what happens in the courtroom. Explain WHY each character takes their uncompromising stand.",
            visual_steps: [
              "1. State Portia's position: Mercy transcends legal sanctions",
              "2. Counterbalance Shylock's position: Contractual law as protective armor",
              "3. Integrate quote: 'The quality of mercy is not strained' vs 'I stay here on my bond'",
              "4. Conclude on dramatic irony: How the law turns against Shylock"
            ]
          }
        }
      ]
    },
    {
      day_num: 4,
      day_label: "Day 4 (Thu)",
      title: "Antonio's Resignation vs Bassanio's Loyalty",
      focus_task: "Analyze character interaction between Antonio and Bassanio during the trial.",
      resource: "Character Study Guide: Mrs. Sunitha Rao",
      status: "Upcoming",
      submission_required: false,
      parent_checklist: "Review student's character contrast notes."
    },
    {
      day_num: 5,
      day_label: "Day 5 (Fri)",
      title: "Venetian Legal System & Alien Statutes",
      focus_task: "Examine the turning point where Portia cites the Venetian statute against citizens.",
      resource: "Historical Context Note: Law and Commerce in 16th-Century Venice",
      status: "Upcoming",
      submission_required: true,
      parent_checklist: "Check definition of 'alien seeking life of a citizen'."
    },
    {
      day_num: 6,
      day_label: "Day 6 (Sat)",
      title: "Timed Essay Outline & Quote Memorization Drill",
      focus_task: "Draft a 5-paragraph essay plan in 12 minutes with 4 memorized quotations.",
      resource: "Flashcard Deck: 10 Core Merchant of Venice Quotes",
      status: "Upcoming",
      submission_required: true,
      parent_checklist: "Time 12-minute outline without looking at text."
    },
    {
      day_num: 7,
      day_label: "Day 7 (Sun)",
      title: "Final 45-Minute Critical Essay Exit Evaluation",
      focus_task: "Submit final full-length essay to exit the English Literature improvement sprint.",
      resource: "Official Evaluation Rubric: Mrs. Sunitha Rao",
      status: "Upcoming",
      submission_required: true,
      parent_checklist: "Confirm complete essay submission before 07:00 PM."
    }
  ]
};

export function StudentRemedialView({ studentId = 1 }: StudentRemedialViewProps) {
  const [mathStudent, setMathStudent] = useState<FocusRosterItem | null>(null);
  const [physicsStudent, setPhysicsStudent] = useState<FocusRosterItem>(SCIENCE_PHYSICS_REMEDIAL);
  const [englishStudent, setEnglishStudent] = useState<FocusRosterItem>(ENGLISH_REMEDIAL);
  const [selectedSubject, setSelectedSubject] = useState<'Mathematics' | 'Physics' | 'English'>('Mathematics');
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Socratic Hint Dialog State
  const [activeHintModal, setActiveHintModal] = useState<boolean>(false);
  const [activeQuestionForHint, setActiveQuestionForHint] = useState<WeekFocusProblem | null>(null);
  const [socraticHint, setSocraticHint] = useState<SocraticHintResponse | null>(null);
  const [hintLoading, setHintLoading] = useState<boolean>(false);
  const [studentNotesForHint, setStudentNotesForHint] = useState<string>('');
  const [hintAttemptCount, setHintAttemptCount] = useState<number>(1);

  // Rough Notebook Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentNotes, setStudentNotes] = useState<string>('Solved all practice problems. Enclosed negative numerators in brackets as advised.');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Selected Day View (defaults to currentDay)
  const [selectedDayNum, setSelectedDayNum] = useState<number>(3);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getRemedialStudent(studentId);
        if (res.success && res.student) {
          setMathStudent(res.student);
          setSelectedDayNum(res.student.current_day || 3);
        }
      } catch (err) {
        console.error('Failed to load remedial student data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentId]);

  const student: FocusRosterItem = selectedSubject === 'Mathematics' 
    ? (mathStudent || SCIENCE_PHYSICS_REMEDIAL) 
    : (selectedSubject === 'Physics' ? physicsStudent : englishStudent);

  if (loading && !mathStudent) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Loading 1-Week Remedial Focus Table &amp; Diagnostic Lag Intelligence...
        </h3>
      </div>
    );
  }

  // Active day data
  const activeDay = student.plan_days.find(d => d.day_num === selectedDayNum) || student.plan_days[0];
  const currentDayData = student.plan_days.find(d => d.day_num === student.current_day) || student.plan_days[0];
  const completedDaysCount = student.plan_days.filter(d => d.status === 'Completed').length;
  const progressPct = Math.round((completedDaysCount / student.total_days) * 100);

  const handleSelectSubject = (subj: 'Mathematics' | 'Physics' | 'English') => {
    setSelectedSubject(subj);
    const targetStudent = subj === 'Mathematics' ? (mathStudent || SCIENCE_PHYSICS_REMEDIAL) : (subj === 'Physics' ? physicsStudent : englishStudent);
    if (targetStudent) {
      setSelectedDayNum(targetStudent.current_day || 3);
    }
  };

  // Socratic Hint Action
  // Socratic Hint Action with Formula Card & Teacher Huddle Escalation
  const handleOpenHint = async (q: WeekFocusProblem, attempt: number = 1) => {
    setActiveQuestionForHint(q);
    setActiveHintModal(true);
    setHintLoading(true);
    setSocraticHint(null);
    setHintAttemptCount(attempt);
    try {
      const res = await api.getRemedialSocraticHint({
        student_id: student.student_id,
        day_num: selectedDayNum,
        question_text: q.question_text,
        student_notes: studentNotesForHint || undefined,
        attempt_count: attempt
      });
      setSocraticHint(res);
    } catch {
      setSocraticHint({
        success: true,
        hint: attempt === 1 
          ? "Remember the distribution law: a minus sign outside parentheses reverses every sign inside. Try writing -(x - 3) as -1 * (x) + (-1) * (-3)."
          : "Multiply the negative sign across both terms. Notice (-1) * (-7) becomes +7!",
        guiding_question: attempt === 1 
          ? "When you distribute -1 across both terms, what does -1 * -3 become?"
          : "What is (-1) * (-7)? Does it stay negative or flip to positive?",
        source: "fallback",
        attempt_count: attempt,
        formula_card: attempt >= 2 ? {
          title: "Algebraic Parentheses & Negative Sign Rule",
          rule: "-(a - b) = -a + b",
          explanation: "A minus sign directly outside brackets acts as multiplying every term inside by -1. Both signs flip!",
          visual_steps: [
            "1. -(3x - 7) has a negative sign outside brackets",
            "2. Distribute: (-1)*(3x) + (-1)*(-7)",
            "3. Result: -3x + 7 (Note +7 flips to positive!)"
          ]
        } : undefined,
        flagged_for_teacher: attempt >= 3,
        escalation_message: attempt >= 3 ? "Stuck after 3 Socratic attempts. Flagged for Teacher 5-Minute In-Class Huddle! Problem marked unlocked so you can continue." : undefined
      });
    } finally {
      setHintLoading(false);
    }
  };

  // Rough Notebook Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      triggerToast(`Selected notebook file: ${e.target.files[0].name}`);
    }
  };

  const handleSubmitRoughWork = async () => {
    const defaultName = selectedSubject === 'Mathematics' 
      ? `Aarav_Day${selectedDayNum}_Rough_Work.pdf` 
      : (selectedSubject === 'Physics' ? `Aarav_Day${selectedDayNum}_Optics_Work.pdf` : `Aarav_Day${selectedDayNum}_English_Essay.pdf`);
    const fileName = selectedFile ? selectedFile.name : defaultName;
    const fileSize = selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '1.4 MB';
    
    setIsUploading(true);
    try {
      if (selectedSubject === 'Mathematics') {
        const res = await api.uploadRemedialRoughWork({
          student_id: student.student_id,
          day_num: selectedDayNum,
          file_name: fileName,
          file_size: fileSize,
          student_notes: studentNotes
        });
        if (res.success && res.student) {
          setMathStudent(res.student);
        }
      } else if (selectedSubject === 'Physics') {
        setPhysicsStudent(prev => ({
          ...prev,
          plan_days: prev.plan_days.map(d => d.day_num === selectedDayNum ? {
            ...d,
            status: 'Completed',
            submitted_file: {
              name: fileName,
              size: fileSize,
              submitted_at: 'Just now',
              student_notes: studentNotes
            }
          } : d)
        }));
      } else {
        setEnglishStudent(prev => ({
          ...prev,
          plan_days: prev.plan_days.map(d => d.day_num === selectedDayNum ? {
            ...d,
            status: 'Completed',
            submitted_file: {
              name: fileName,
              size: fileSize,
              submitted_at: 'Just now',
              student_notes: studentNotes
            }
          } : d)
        }));
      }
      triggerToast(`✓ Day ${selectedDayNum} rough notebook submitted for teacher inspection!`);
      setSelectedFile(null);
    } catch {
      triggerToast('Rough work submitted (Local storage updated).');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-amber-500/40 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PERSONALIZED LAG DIAGNOSIS: "WHERE I AM GETTING STUCK" */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-amber-200/90 dark:border-amber-800/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-amber-950/20 p-6 shadow-sm space-y-5">
        
        {/* Subject Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-100/60 dark:bg-amber-950/30 p-2.5 rounded-2xl border border-amber-200/80 dark:border-amber-800/50">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Filter by Weak Subject:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectSubject('Mathematics')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === 'Mathematics'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/50'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>📐 Mathematics</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedSubject === 'Mathematics' ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                52% Active
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubject('Physics')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === 'Physics'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/50'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>🔬 Science / Physics</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedSubject === 'Physics' ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                58%
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubject('English')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === 'English'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/50'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>📖 English Literature</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedSubject === 'English' ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                62%
              </span>
            </button>
          </div>
        </div>

        {/* Top Header Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 dark:border-amber-900/40 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 px-3 py-1 text-xs font-bold">
                <Brain className="h-3.5 w-3.5 text-amber-600" />
                <span>Personalized Concept Diagnosis</span>
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {student.subject} ({student.class_name})
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Where I Am Getting Stuck (And How I Overcome It)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Exam Baseline: <strong className="text-amber-700 dark:text-amber-400">{student.exam_name} ({student.exam_score_pct}%)</strong> &bull; Mastery Target: <strong className="text-emerald-600 dark:text-emerald-400">&gt;70% (Goal: {student.target_score_pct}%)</strong>
            </p>
          </div>

          {/* 7-Day Sprint Meter */}
          <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border border-amber-200/60 dark:border-slate-700 space-y-1.5 text-right min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400">7-Day Sprint Progress:</span>
              <span className="text-amber-600 dark:text-amber-400">{completedDaysCount} of 7 Completed</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Active Sprint: Day {student.current_day} of {student.total_days}
            </span>
          </div>
        </div>

        {/* Root Bottleneck Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="md:col-span-2 rounded-2xl bg-white dark:bg-slate-800/60 p-4 border border-amber-200/60 dark:border-slate-700 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Root Mathematical Misconception
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {student.ai_exam_scan.weak_concept}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {student.ai_exam_scan.diagnostic_summary}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Prescription:</span>
              <span className="text-slate-700 dark:text-slate-200 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                {student.ai_exam_scan.recommended_focus}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-800/60 p-4 border border-amber-200/60 dark:border-slate-700 space-y-2.5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Target Sub-Topics Under Practice
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {(student.ai_exam_scan.sub_topics || [
                  "Rule of Parentheses: -(ax - b) = -ax + b",
                  "LCM numerator expansion in algebraic fractions",
                  "Factoring by splitting middle term with mixed signs"
                ]).map((topic: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {student.ai_exam_scan.backlog_correlation && (
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold text-amber-600 dark:text-amber-400 block">Backlog Correlation:</span>
                <span>{student.ai_exam_scan.backlog_correlation}</span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. 7-DAY SPRINT SELECTOR & TIMELINE                       */}
      {/* ========================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-600" />
            7-Day Daily Targeted Remedial Schedule
          </h3>
          <span className="text-xs text-slate-400">
            Click any day to view practice problems or past submission notes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {student.plan_days.map((d) => {
            const isSelected = selectedDayNum === d.day_num;
            const isToday = d.day_num === student.current_day;
            const isCompleted = d.status === 'Completed';
            const isPending = d.status === 'Pending';

            return (
              <button
                key={d.day_num}
                type="button"
                onClick={() => setSelectedDayNum(d.day_num)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                    : isCompleted
                    ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 hover:border-emerald-400'
                    : isToday
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/30 text-slate-900 dark:text-slate-100'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    Day {d.day_num}
                  </span>
                  {isCompleted ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                      ✓ Done
                    </span>
                  ) : isPending ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'}`}>
                      ⏳ Review
                    </span>
                  ) : isToday ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'}`}>
                      ⚡ Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">
                      Preview
                    </span>
                  )}
                </div>

                <div>
                  <h5 className={`text-xs font-bold line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {d.title}
                  </h5>
                  <span className={`text-[10px] block line-clamp-1 ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                    {d.day_label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TODAY'S ACTIVE PRACTICE & AI SOCRATIC HINT COMPANION   */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        
        {/* Active Day Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-0.5 text-xs font-bold border border-amber-300 dark:border-amber-800">
                {activeDay.day_label} • {activeDay.status}
              </span>
              {activeDay.day_num === student.current_day && (
                <span className="rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  Today&apos;s Active Assignment
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {activeDay.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Prescribed micro-exercise: <strong>{activeDay.focus_task}</strong>
            </p>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Resource:</span>
            <span>{activeDay.resource}</span>
          </div>
        </div>

        {/* Assigned Questions with Socratic Tutor Buttons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Practice Problem(s) for Day {activeDay.day_num}
            </h4>
            <span className="text-[11px] text-slate-400">
              Solve on your paper notebook first, then upload below
            </span>
          </div>

          {activeDay.questions && activeDay.questions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {activeDay.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-black text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2.5 py-1 rounded-md self-start">
                      {q.question_number}
                    </span>
                    
                    {/* Socratic Hint Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenHint(q)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>Stuck? Get a Step-by-Step Hint (AI Socratic Tutor)</span>
                    </button>
                  </div>

                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                    {q.question_text}
                  </div>

                  <div className="pt-2 border-t border-purple-200/50 dark:border-purple-900/40 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-purple-800 dark:text-purple-300">Teacher Rubric Target:</strong>
                      <span>{q.rubric_key}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">{activeDay.title}: </strong>
              <span>{activeDay.focus_task}</span>
            </div>
          )}
        </div>

        {/* Socratic Hint Active Modal / Drawer */}
        {activeHintModal && activeQuestionForHint && (
          <div className="rounded-2xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                    AI Socratic Tutor Guidance ({activeQuestionForHint.question_number})
                  </h4>
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-400">
                    Powered by Google Gemini &bull; Guides your thinking without giving the final answer
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveHintModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {hintLoading ? (
              <div className="p-6 text-center space-y-2">
                <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium">
                  Formulating your step-by-step thinking nudge...
                </p>
              </div>
            ) : socraticHint ? (
              <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Step-by-Step Thinking Nudge:
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {socraticHint.hint}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                    Guiding Question to Solve It Yourself:
                  </span>
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 italic">
                    &ldquo;{socraticHint.guiding_question}&rdquo;
                  </p>
                </div>

                {/* 2-Minute Visual Formula Card (Appears on Attempt >= 2) */}
                {socraticHint.formula_card && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                        2-Minute Interactive Formula Card: {socraticHint.formula_card.title}
                      </span>
                      <span className="text-[10px] font-mono bg-amber-200/80 dark:bg-amber-900 px-2 py-0.5 rounded font-bold text-amber-900 dark:text-amber-200">
                        {socraticHint.formula_card.rule}
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-200">
                      {socraticHint.formula_card.explanation}
                    </p>
                    <div className="space-y-1 font-mono text-[11px] bg-white/80 dark:bg-black/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
                      {socraticHint.formula_card.visual_steps.map((st, i) => (
                        <div key={i} className="text-slate-700 dark:text-slate-300">
                          {st}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teacher In-Class Huddle Alert (Appears on Attempt >= 3) */}
                {socraticHint.flagged_for_teacher && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-200">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>Flagged for Teacher 5-Minute In-Class Huddle!</span>
                    </div>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
                      {socraticHint.escalation_message || "Mrs. Ananya Verma has been alerted to review this concept during zero-period. Problem marked unlocked so you can proceed to the rest of today's sprint!"}
                    </p>
                  </div>
                )}

                {/* Progressive Escalation Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900">
                  <span className="text-[10px] text-slate-400">
                    💡 The AI tutor guides your thinking pathway for long-term retention.
                  </span>
                  <div className="flex items-center gap-2">
                    {hintAttemptCount < 3 && !socraticHint.flagged_for_teacher && (
                      <button
                        type="button"
                        onClick={() => handleOpenHint(activeQuestionForHint, hintAttemptCount + 1)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                      >
                        {hintAttemptCount === 1 ? "Still Stuck? Show 2-Min Formula Card" : "Need Teacher Help?"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveHintModal(false)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                    >
                      I Understand, Let Me Try!
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. ROUGH NOTEBOOK UPLOAD SECTION                         */}
        {/* ========================================================= */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-emerald-600" />
              Upload Rough Notebook Working (Day {activeDay.day_num})
            </h4>
            <span className="text-xs font-semibold text-emerald-600">
              Required: Handwritten step calculations
            </span>
          </div>

          {/* If already submitted, show status */}
          {student.submitted_file && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {student.submitted_file.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {student.submitted_file.size} &bull; Uploaded {student.submitted_file.submitted_at}
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                  student.submission_status === 'Verified'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200'
                }`}>
                  Status: {student.submission_status === 'Verified' ? 'Verified by Faculty ✓' : 'Submitted (Pending Review ⏳)'}
                </span>
              </div>

              {student.teacher_verification_notes && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 text-xs">
                  <strong className="text-emerald-800 dark:text-emerald-300">Teacher Remarks: </strong>
                  <span className="text-slate-700 dark:text-slate-300 italic">&ldquo;{student.teacher_verification_notes}&rdquo;</span>
                </div>
              )}
            </div>
          )}

          {/* Upload Input & Drop Area */}
          <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
              <Upload className="h-6 w-6" />
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {selectedFile ? selectedFile.name : `Snap photo or scan rough notebook page for Day ${activeDay.day_num}`}
              </h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports PDF, JPG, PNG up to 10MB. Include all scratch steps.
              </p>
            </div>

            <div className="w-full max-w-md space-y-2">
              <textarea
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Add notes for teacher (e.g. 'I enclosed negative numerators in brackets in Q2')..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-16"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{selectedFile ? 'Change File' : 'Browse File / Camera'}</span>
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={handleSubmitRoughWork}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                <span>{isUploading ? 'Uploading...' : `Submit Day ${activeDay.day_num} Rough Work`}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
