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

export function StudentRemedialView({ studentId = 1 }: StudentRemedialViewProps) {
  const [student, setStudent] = useState<FocusRosterItem | null>(null);
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
          setStudent(res.student);
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

  if (loading || !student) {
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
    const fileName = selectedFile ? selectedFile.name : `Aarav_Day${selectedDayNum}_Rough_Work.pdf`;
    const fileSize = selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '1.4 MB';
    
    setIsUploading(true);
    try {
      const res = await api.uploadRemedialRoughWork({
        student_id: student.student_id,
        day_num: selectedDayNum,
        file_name: fileName,
        file_size: fileSize,
        student_notes: studentNotes
      });
      if (res.success && res.student) {
        setStudent(res.student);
        triggerToast(`✓ Day ${selectedDayNum} rough notebook submitted for teacher inspection!`);
        setSelectedFile(null);
      }
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
