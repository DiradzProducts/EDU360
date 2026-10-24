'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  Share2, 
  Award, 
  BookOpen,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';

export interface EvaluationQuestion {
  qNo: number;
  title: string;
  questionText: string;
  maxMarks: number;
  marksObtained: number;
  questionType: 'Derivation' | 'Factorization' | 'Word Problem' | 'Conceptual' | 'Application';
  studentAnswerSteps: string[];
  modelEvaluationKey: string[];
  aiRubricAnalysis: {
    status: 'full_credit' | 'partial_credit' | 'needs_work';
    pedagogicalFeedback: string;
    flaggedMisconception?: string;
    deductionReason?: string;
  };
}

interface EvaluationKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: string;
  examTitle?: string;
  studentName?: string;
  totalScore?: number;
  maxTotal?: number;
  grade?: string;
}

export function EvaluationKeyModal({
  isOpen,
  onClose,
  subject = 'Mathematics',
  examTitle = 'Term 1 Periodic Assessment (Mid-Term)',
  studentName = 'Aarav Sharma',
  totalScore = 22.5,
  maxTotal = 25,
  grade = 'A1'
}: EvaluationKeyModalProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: false,
    5: false
  });
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const toggleQuestion = (qNo: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qNo]: !prev[qNo]
    }));
  };

  const sampleQuestions: EvaluationQuestion[] = [
    {
      qNo: 1,
      title: 'Quadratic Factorization by Splitting the Middle Term',
      questionText: 'Factorize completely: 2x² + 7x + 3 = 0 and find the roots.',
      maxMarks: 5.0,
      marksObtained: 5.0,
      questionType: 'Factorization',
      studentAnswerSteps: [
        '1. Product a · c = 2 · 3 = 6, Sum b = 7',
        '2. Pair: 6 and 1 (6 · 1 = 6, 6 + 1 = 7)',
        '3. 2x² + 6x + x + 3 = 0',
        '4. 2x(x + 3) + 1(x + 3) = (2x + 1)(x + 3) = 0',
        '5. Roots: x = -1/2, x = -3'
      ],
      modelEvaluationKey: [
        'Step 1: Identify product (ac = 6) and sum (b = 7) → [1.0 Mark]',
        'Step 2: Correctly split middle term: 2x² + 6x + x + 3 → [1.5 Marks]',
        'Step 3: Correct grouping (2x + 1)(x + 3) = 0 → [1.5 Marks]',
        'Step 4: Distinct root determination x = -1/2, -3 → [1.0 Mark]'
      ],
      aiRubricAnalysis: {
        status: 'full_credit',
        pedagogicalFeedback: 'Flawless algebraic expansion and grouping. Full 5.0 marks awarded by AI vision scanner, verified by Teacher.'
      }
    },
    {
      qNo: 2,
      title: 'Quadratic Formula Calculation & Arithmetic Precision',
      questionText: 'Solve for x using the quadratic formula: 2x² - 5x - 3 = 0.',
      maxMarks: 5.0,
      marksObtained: 4.0,
      questionType: 'Derivation',
      studentAnswerSteps: [
        '1. a = 2, b = -5, c = -3',
        '2. Formula: x = [-b ± √(b² - 4ac)] / 2a',
        '3. x = [-(-5) ± √((-5)² - 4(2)(-3))] / 4',
        '4. Scratch line: 25 - 24 = 1 (Student corrected later to 25 + 24 = 49)',
        '5. x = (5 ± 7) / 4 → x = 3 or x = -2/4 = -1/2'
      ],
      modelEvaluationKey: [
        'Step 1: State quadratic formula accurately → [1.0 Mark]',
        'Step 2: Correct substitution with negative signs: -(-5) and 4(2)(-3) → [1.5 Marks]',
        'Step 3: Correct calculation of discriminant D = 25 - (-24) = 49 → [1.5 Marks]',
        'Step 4: Final simplified roots x = 3, -1/2 → [1.0 Mark]'
      ],
      aiRubricAnalysis: {
        status: 'partial_credit',
        flaggedMisconception: 'Sign error in intermediate discriminant step: -4(2)(-3) initially evaluated with minus sign before correction.',
        deductionReason: '-1.0 Mark deducted for scratch calculation ambiguity in step 3 sign handling as per CBSE step-marking guidelines.',
        pedagogicalFeedback: 'Conceptually strong, but teacher rubric checkpoint requires clean sign evaluation without ambiguous scratch overrides.'
      }
    },
    {
      qNo: 3,
      title: 'Real-World Word Problem: Speed, Distance & Time Modeling',
      questionText: 'An express train takes 1 hour less than a passenger train to travel 132 km between Mysore and Bangalore. If the average speed of the express train is 11 km/h more than that of the passenger train, find their average speeds.',
      maxMarks: 5.0,
      marksObtained: 4.5,
      questionType: 'Word Problem',
      studentAnswerSteps: [
        '1. Let passenger train speed = x km/h, Express train speed = (x + 11) km/h',
        '2. Time difference: 132/x - 132/(x + 11) = 1',
        '3. 132(x + 11 - x) / [x(x + 11)] = 1 → 1452 = x² + 11x',
        '4. x² + 11x - 1452 = 0 → (x + 44)(x - 33) = 0',
        '5. Speed cannot be negative, so x = 33, Express = 44'
      ],
      modelEvaluationKey: [
        'Step 1: Define variables with standard units → [1.0 Mark]',
        'Step 2: Formulate rational time equation 132/x - 132/(x+11) = 1 → [1.5 Marks]',
        'Step 3: Reduce to standard quadratic form x² + 11x - 1452 = 0 → [1.5 Marks]',
        'Step 4: State final speed with explicit units (Passenger: 33 km/h, Express: 44 km/h) → [1.0 Mark]'
      ],
      aiRubricAnalysis: {
        status: 'partial_credit',
        flaggedMisconception: 'Omission of final physical unit (km/h) in step 5 concluding statement.',
        deductionReason: '-0.5 Mark deducted for missing physical unit labels in conclusion.',
        pedagogicalFeedback: 'Superb mathematical modeling and factorization. Ensure final answer explicitly appends "km/h" to both train values.'
      }
    },
    {
      qNo: 4,
      title: 'Discriminant & Nature of Roots Analysis',
      questionText: 'Determine the nature of the roots of the equation: x² - 6x + 9 = 0. If real roots exist, find them.',
      maxMarks: 5.0,
      marksObtained: 5.0,
      questionType: 'Conceptual',
      studentAnswerSteps: [
        '1. a = 1, b = -6, c = 9',
        '2. Discriminant D = b² - 4ac = (-6)² - 4(1)(9) = 36 - 36 = 0',
        '3. Since D = 0, the equation has two equal real roots.',
        '4. Roots are x = -b / 2a = -(-6) / 2 = 6 / 2 = 3 (repeated).'
      ],
      modelEvaluationKey: [
        'Step 1: Compute discriminant D = 0 → [2.0 Marks]',
        'Step 2: Correct theoretical statement: Two equal real roots → [1.5 Marks]',
        'Step 3: Correct value of root x = 3 → [1.5 Marks]'
      ],
      aiRubricAnalysis: {
        status: 'full_credit',
        pedagogicalFeedback: 'Exemplary reasoning and accurate theoretical justification. Full marks awarded.'
      }
    },
    {
      qNo: 5,
      title: 'Geometric Interpretation & Parabola Vertex',
      questionText: 'For y = x² - 4x + 3, identify the coordinates of the vertex, direction of opening, and x-intercepts.',
      maxMarks: 5.0,
      marksObtained: 4.0,
      questionType: 'Application',
      studentAnswerSteps: [
        '1. a = 1 > 0, so parabola opens upwards.',
        '2. x-intercepts: x² - 4x + 3 = 0 → (x - 3)(x - 1) = 0 → (3, 0) and (1, 0).',
        '3. Vertex x-coordinate = -b/2a = 4/2 = 2.',
        '4. Vertex y-coordinate = 2² - 4(2) + 3 = 4 - 8 + 3 = -1 → Vertex is (2, -1).'
      ],
      modelEvaluationKey: [
        'Step 1: State direction (upwards) with reason a > 0 → [1.0 Mark]',
        'Step 2: Intercepts (1,0) and (3,0) → [1.5 Marks]',
        'Step 3: Vertex coordinates (2, -1) with working → [1.5 Marks]',
        'Step 4: Sketch/axis of symmetry line x = 2 representation → [1.0 Mark]'
      ],
      aiRubricAnalysis: {
        status: 'partial_credit',
        deductionReason: '-1.0 Mark: Axis of symmetry line equation x = 2 omitted in rough sketch representation.',
        pedagogicalFeedback: 'Coordinates correctly computed. Ensure axis of symmetry equation is explicitly stated when discussing vertex geometry.'
      }
    }
  ];

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `EDU360 Assessment Key: ${studentName}'s evaluated paper for ${subject} (${examTitle}). Scored ${totalScore}/${maxTotal} (${((totalScore/maxTotal)*100).toFixed(1)}% · Grade ${grade}). Complete question-by-question AI evaluation key & rubric breakdown available.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-0.5 text-xs font-bold">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  AI Vision Graded &amp; Teacher Moderated
                </span>
                <span className="text-xs text-blue-200/80">
                  CBSE Answer Key &amp; Step-Marking Rubric
                </span>
              </div>
              
              <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                {subject} — Official Evaluation Key &amp; Evaluated Script
              </h2>
              <p className="text-xs text-blue-200/90 mt-0.5">
                {studentName} • {examTitle} • Class 8-B (Roll #14) • Faculty: Mrs. Ananya Verma
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-2xl p-2 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Aggregate Highlights Strip */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
            <div className="rounded-xl bg-white/10 backdrop-blur-xs p-3">
              <span className="text-[10px] uppercase font-bold text-blue-200/80 block">Score Scored</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-white">{totalScore}</span>
                <span className="text-xs text-blue-200">/ {maxTotal}</span>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-xs p-3">
              <span className="text-[10px] uppercase font-bold text-blue-200/80 block">Percentage</span>
              <span className="text-2xl font-black text-emerald-300 mt-0.5 block">
                {((totalScore / maxTotal) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-xs p-3">
              <span className="text-[10px] uppercase font-bold text-blue-200/80 block">Grade Standing</span>
              <span className="text-2xl font-black text-amber-300 mt-0.5 block">
                Grade {grade}
              </span>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-xs p-3">
              <span className="text-[10px] uppercase font-bold text-blue-200/80 block">Rubric Compliance</span>
              <span className="text-2xl font-black text-sky-300 mt-0.5 block">
                90% Mastery
              </span>
            </div>
          </div>
        </div>

        {/* Content Body: Question by Question Breakdown */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing All 5 Exam Questions with Step Marks, Student Work &amp; Model Key
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Send evaluation breakdown to Parent WhatsApp"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share via WhatsApp</span>
              </button>
            </div>
          </div>

          {sampleQuestions.map((q) => {
            const isExpanded = expandedQuestions[q.qNo];
            const isFullCredit = q.aiRubricAnalysis.status === 'full_credit';

            return (
              <div 
                key={q.qNo}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isFullCredit 
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900' 
                    : 'border-amber-300 dark:border-amber-800/80 bg-white dark:bg-slate-900 shadow-xs'
                }`}
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleQuestion(q.qNo)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                      isFullCredit 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      Q{q.qNo}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {q.title}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {q.questionType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {q.questionText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white block tabular-nums">
                        {q.marksObtained} / {q.maxMarks}
                      </span>
                      <span className={`text-[10px] font-bold ${
                        isFullCredit ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {isFullCredit ? 'Full Credit ✓' : 'Partial Credit'}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Accordion Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
                    
                    {/* Full Question Text */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Question Prompt</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{q.questionText}</p>
                    </div>

                    {/* Side by Side: Student Answer Steps vs Model Key */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left: Student Working Steps */}
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                            Student Submitted Steps (Aarav)
                          </span>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                            Handwritten OCR / Upload
                          </span>
                        </div>
                        <div className="space-y-1.5 font-mono text-[11px] text-slate-800 dark:text-slate-300">
                          {q.studentAnswerSteps.map((step, idx) => (
                            <div key={idx} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Model Answer Key & Marking Scheme */}
                      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 p-4 bg-blue-50/30 dark:bg-blue-950/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300">
                            CBSE Official Model Answer Key
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            Step-Marking Rubric
                          </span>
                        </div>
                        <div className="space-y-1.5 font-mono text-[11px] text-blue-950 dark:text-blue-200">
                          {q.modelEvaluationKey.map((keyStep, idx) => (
                            <div key={idx} className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/40">
                              {keyStep}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* AI Vision Rubric Checkpoint & Pedagogical Feedback */}
                    <div className={`rounded-2xl p-4 border ${
                      isFullCredit 
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' 
                        : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                    }`}>
                      <div className="flex items-start gap-2.5">
                        <Sparkles className={`h-4 w-4 mt-0.5 shrink-0 ${
                          isFullCredit ? 'text-emerald-600' : 'text-amber-600'
                        }`} />
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 dark:text-white block text-xs">
                            AI Evaluation &amp; Teacher Observation Checkpoint:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                            {q.aiRubricAnalysis.pedagogicalFeedback}
                          </p>
                          {q.aiRubricAnalysis.flaggedMisconception && (
                            <div className="mt-2 text-[11px] font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 p-2 rounded-xl border border-amber-300">
                              <strong>Diagnostic Flag:</strong> {q.aiRubricAnalysis.flaggedMisconception}
                              {q.aiRubricAnalysis.deductionReason && (
                                <div className="text-amber-800 dark:text-amber-300 mt-0.5">
                                  {q.aiRubricAnalysis.deductionReason}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Official digital copy signed by Examination Authority</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert('Downloading annotated exam paper PDF with teacher and AI marks annotations.');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-blue-600" />
              <span>Download Annotated Script PDF</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
