'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Award,
  Sparkles,
  Clock,
  Download,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Star,
  MapPin,
  HelpCircle,
  Smile,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { QuizQuestion, JuniorQuizModal } from './JuniorQuizModal';
import { playButtonClick, playStarCollect } from '@/lib/sound-effects';

export interface ExamScheduleItem {
  id: string;
  day: string;
  date: string;
  subject: string;
  subjectIcon: string;
  subjectColor: string;
  timeSlot: string;
  duration: string;
  syllabus: string[];
  venue: string;
  prepPdfName: string;
  status: 'upcoming' | 'ready_to_start' | 'completed';
}

interface JuniorExamsHubProps {
  studentName?: string;
  onEarnStars?: (stars: number) => void;
  onShowToast?: (message: string) => void;
  mathQuizQuestions: QuizQuestion[];
  englishQuizQuestions: QuizQuestion[];
  scienceQuizQuestions: QuizQuestion[];
}

const defaultExamSchedule: ExamScheduleItem[] = [
  {
    id: 'exam-1',
    day: 'Monday',
    date: 'Oct 28, 2026',
    subject: 'Mathematics & Spatial Logic',
    subjectIcon: '🧮',
    subjectColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
    timeSlot: '10:00 AM – 11:30 AM',
    duration: '90 Minutes',
    syllabus: [
      'Unit 1: Numbers up to 1,000 (Place value and expanded forms)',
      'Unit 2: 2-Digit Addition with Regrouping (Carrying tens into star box)',
      'Unit 3: 2D & 3D Shapes (Sides, vertices, and real-life objects)',
      'Unit 4: Number Patterns & Skip Counting (by 2s, 5s, 10s)'
    ],
    venue: 'Virtual Hall Rocket #3A (Zoom Monitored)',
    prepPdfName: 'Math_Term1_Practice_Paper.pdf',
    status: 'upcoming'
  },
  {
    id: 'exam-2',
    day: 'Tuesday',
    date: 'Oct 29, 2026',
    subject: 'Phonics, Reading & Storytelling',
    subjectIcon: '📖',
    subjectColor: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800',
    timeSlot: '10:00 AM – 11:30 AM',
    duration: '90 Minutes',
    syllabus: [
      'Unit 2: Vowel Digraphs (words containing "ea", "ee", "ai", "ay")',
      'Unit 3: Sight Words Flashcards Reading & Sentence Construction',
      'Unit 4: Rhyming Pairs & Poem Recitation',
      'Unit 5: Short Story Comprehension ("The Friendly Dolphin")'
    ],
    venue: 'Virtual Hall Rocket #3A (Zoom Monitored)',
    prepPdfName: 'English_Phonics_Term1_Revision.pdf',
    status: 'upcoming'
  },
  {
    id: 'exam-3',
    day: 'Wednesday',
    date: 'Oct 30, 2026',
    subject: 'Environmental Science (EVS & Nature)',
    subjectIcon: '🌱',
    subjectColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    timeSlot: '10:00 AM – 11:30 AM',
    duration: '90 Minutes',
    syllabus: [
      'Unit 1: Living vs Non-Living Things around our home and school',
      'Unit 2: Parts of a Plant (Roots, Stem, Leaves, Flower functions)',
      'Unit 3: Animals & Habitats (Herbivores, Carnivores, Desert Adaptations)',
      'Unit 4: My Five Sense Organs and Healthy Habits'
    ],
    venue: 'Virtual Hall Rocket #3A (Zoom Monitored)',
    prepPdfName: 'Science_EVS_Study_Blueprint.pdf',
    status: 'upcoming'
  },
  {
    id: 'exam-4',
    day: 'Friday',
    date: 'Oct 31, 2026',
    subject: 'Second Language (Hindi Phonics & Words)',
    subjectIcon: '🗣️',
    subjectColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800',
    timeSlot: '10:00 AM – 11:30 AM',
    duration: '90 Minutes',
    syllabus: [
      'Varnamala: Swar (अ to अः) and Vyanjan (क to ज्ञ) identification',
      'Matras: Aa ki Matra (ा) and Chhoti/Badi Ee ki Matra (ि, ी)',
      '2-letter and 3-letter simple word writing (कमल, घर, जल, फल)',
      'Basic picture identification and greeting words'
    ],
    venue: 'Virtual Hall Rocket #3A (Zoom Monitored)',
    prepPdfName: 'Hindi_Varnamala_Class3A_Prep.pdf',
    status: 'upcoming'
  },
  {
    id: 'exam-5',
    day: 'Monday',
    date: 'Nov 02, 2026',
    subject: 'Creative Art & Clay Craft Practical',
    subjectIcon: '🎨',
    subjectColor: 'text-pink-600 bg-pink-50 dark:bg-pink-950/60 border-pink-300 dark:border-pink-800',
    timeSlot: '10:00 AM – 11:30 AM',
    duration: '90 Minutes',
    syllabus: [
      'Topic 1: Primary & Secondary Color Wheel (Mixing Yellow + Blue = Green)',
      'Topic 2: Autumn Tree Finger-Painting or Crayon Texture Drawing',
      'Topic 3: Modeling Clay Animal Sculpture (Woodland Fox or Tortoise)'
    ],
    venue: 'Virtual Art Studio #3A • Live Camera Demonstration',
    prepPdfName: 'Art_Materials_Checklist.pdf',
    status: 'upcoming'
  }
];

export function JuniorExamsHub({
  studentName = 'Aarav',
  onEarnStars,
  onShowToast,
  mathQuizQuestions,
  englishQuizQuestions,
  scienceQuizQuestions
}: JuniorExamsHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'timetable' | 'quizzes' | 'report_card'>('timetable');
  const [schedule] = useState<ExamScheduleItem[]>(defaultExamSchedule);

  // Active Quiz Modal State
  const [activeQuizModal, setActiveQuizModal] = useState<{
    title: string;
    subject: string;
    questions: QuizQuestion[];
  } | null>(null);

  const handleLaunchQuiz = (title: string, subject: string, questions: QuizQuestion[]) => {
    playButtonClick();
    setActiveQuizModal({
      title,
      subject,
      questions
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="rounded-3xl border-2 border-purple-200 dark:border-purple-800/80 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-pink-950/30 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 tracking-wider shadow-xs">
              Primary Academic Assessments
            </span>
            <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
              CBSE Class 3-A • Term 1 / Periodic Test 2
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Exams Timetable &amp; Star Challenges 🏆
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl font-medium">
            Check your official exam dates, download revision sheets, practice interactive voice quizzes, and view your verified term report card!
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 shadow-xs shrink-0">
          <CalendarDays className="h-5 w-5 text-purple-600 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Next Term Exam</span>
            <span className="text-xs font-black text-purple-900 dark:text-purple-200">
              Maths on Mon, Oct 28
            </span>
          </div>
        </div>
      </div>

      {/* 2. Three Main Sub-Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'timetable', label: '📅 Upcoming Exams Timetable', badge: '5 Papers' },
          { id: 'quizzes', label: '🚀 Practice Star Quizzes (Mock Tests)', badge: 'Voice Readout' },
          { id: 'report_card', label: '📊 Term 1 Grades & Report Card', badge: 'Aggregate: 88.5%' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playButtonClick();
              setActiveSubTab(tab.id as any);
            }}
            className={`rounded-2xl px-4 py-2 text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-102'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                activeSubTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================
          SUB-TAB 1: UPCOMING EXAMS TIMETABLE
      ======================================================== */}
      {activeSubTab === 'timetable' && (
        <div className="space-y-6">
          {/* Exam Guidelines Alert Banner */}
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl shrink-0 shadow-xs">
                💡
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  Junior Explorer Exam Readiness Rules:
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Keep two sharp pencils, eraser, and color crayons ready. Parents are welcome to sit nearby to help read instructions, but all answers must be chosen by our little explorer!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-bold text-xs shadow-xs">
                ⭐ +50 Stars on each exam submission
              </span>
            </div>
          </div>

          {/* Timeline Cards for Exam Schedule */}
          <div className="space-y-4">
            {schedule.map((paper, idx) => (
              <div
                key={paper.id}
                className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition-all space-y-4"
              >
                {/* Header row: Day, Date, Time, Venue */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center h-12 w-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 shrink-0">
                      <span className="text-[10px] font-black uppercase text-purple-600">Day {idx + 1}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{paper.day}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border ${paper.subjectColor}`}>
                          <span>{paper.subjectIcon}</span>
                          <span>{paper.subject}</span>
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          • {paper.date}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-500 mt-0.5 block flex items-center gap-1">
                        <Clock className="h-3 w-3 text-purple-500" />
                        <span>{paper.timeSlot} ({paper.duration})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-emerald-500" />
                      <span>{paper.venue}</span>
                    </span>
                  </div>
                </div>

                {/* Chapters / Syllabus breakdown */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>Chapters &amp; Question Topics Covered:</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {paper.syllabus.map((syl, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <span className="text-purple-500 font-bold shrink-0">✓</span>
                        <span>{syl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() => {
                      playButtonClick();
                      if (onShowToast) onShowToast(`Downloading Practice Revision Sheet: ${paper.prepPdfName}`);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-purple-600" />
                    <span>Download {paper.prepPdfName}</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        playButtonClick();
                        if (paper.subject.includes('Math')) {
                          handleLaunchQuiz('Mental Math Galaxy Mock Exam', 'Mathematics', mathQuizQuestions);
                        } else if (paper.subject.includes('Phonics') || paper.subject.includes('English')) {
                          handleLaunchQuiz('Magic Vocabulary & Phonics Mock', 'Phonics & Storytelling', englishQuizQuestions);
                        } else {
                          handleLaunchQuiz('Nature & EVS Practice Challenge', 'Science EVS', scienceQuizQuestions);
                        }
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Launch Interactive Practice Challenge 🚀</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: PRACTICE STAR QUIZZES (VOICE MOCK TESTS)
      ======================================================== */}
      {activeSubTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 p-4 text-xs font-medium text-slate-600 dark:text-slate-400">
            Interactive voice-narrated quizzes for kids! Click <b>Start Challenge</b> to open the full-screen quiz arena with speech narration, celebratory confetti, and star scores.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Math Quiz */}
            <div className="rounded-3xl border-2 border-amber-200 dark:border-amber-800/60 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/20 dark:via-slate-900 dark:to-orange-950/20 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🧮</span>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black px-2.5 py-0.5 uppercase">
                    5 Questions
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 block tracking-wide">
                    Mathematics &amp; Logic
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    Mental Math Galaxy Quiz
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Addition tricks, number comparisons, and fun shapes with friendly voice hints!
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-100 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Reward: +50 ⭐</span>
                  <span>Untimed ⏰</span>
                </div>
                <button
                  onClick={() => handleLaunchQuiz('Mental Math Galaxy Quiz', 'Mathematics & Logic', mathQuizQuestions)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Start Math Challenge 🚀</span>
                </button>
              </div>
            </div>

            {/* English Quiz */}
            <div className="rounded-3xl border-2 border-sky-200 dark:border-sky-800/60 bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-sky-950/20 dark:via-slate-900 dark:to-blue-950/20 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">📖</span>
                  <span className="rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-black px-2.5 py-0.5 uppercase">
                    5 Questions
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-sky-700 dark:text-sky-400 block tracking-wide">
                    Phonics &amp; English
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    Magic Vocabulary &amp; Rhymes
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Rhyming pairs, action verbs, and spelling mysteries with audio questions!
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-sky-100 dark:border-sky-900/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Reward: +50 ⭐</span>
                  <span>Untimed ⏰</span>
                </div>
                <button
                  onClick={() => handleLaunchQuiz('Magic Vocabulary & Rhymes', 'Phonics & Storytelling', englishQuizQuestions)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-black shadow-md shadow-sky-500/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Start English Challenge 🌟</span>
                </button>
              </div>
            </div>

            {/* Science Quiz */}
            <div className="rounded-3xl border-2 border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/20 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🌱</span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black px-2.5 py-0.5 uppercase">
                    5 Questions
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block tracking-wide">
                    Environmental Science (EVS)
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    Curious Animal &amp; Plant World
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Discover nature secrets, desert animals, green leaves, and planet trivia!
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Reward: +50 ⭐</span>
                  <span>Untimed ⏰</span>
                </div>
                <button
                  onClick={() => handleLaunchQuiz('Curious Animal & Plant World', 'Environmental Science (EVS)', scienceQuizQuestions)}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Start Nature Challenge 🌿</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: TERM 1 REPORT CARD & EVALUATIONS
      ======================================================== */}
      {activeSubTab === 'report_card' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Official Term 1 Subject Evaluation
              </h3>
              <p className="text-xs text-slate-500">
                Verified marks memo published by Oakridge Junior Academic Board
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 text-xs font-black border border-emerald-200 dark:border-emerald-800">
              Aggregate: 88.5% (Grade A1 Distinction)
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50">
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Grade</th>
                    <th className="p-3.5">Teacher Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { sub: 'Mathematics & Logic', score: '46 / 50', grade: 'A1', remark: 'Brilliant spatial geometry and number patterns.' },
                    { sub: 'Phonics & English Storytelling', score: '48 / 50', grade: 'A1', remark: 'Enthusiastic reader; expressive vocabulary.' },
                    { sub: 'Environmental Science (EVS)', score: '44 / 50', grade: 'A2', remark: 'Great curiosity about plants and ecosystems.' },
                    { sub: 'Creative Art & Clay', score: '49 / 50', grade: 'A1+', remark: 'Outstanding imagination in the color wheel project.' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{row.sub}</td>
                      <td className="p-3.5 font-black text-slate-900 dark:text-white">{row.score}</td>
                      <td className="p-3.5 font-bold">
                        <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px]">
                          {row.grade}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">{row.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quiz Modal */}
      {activeQuizModal && (
        <JuniorQuizModal
          isOpen={true}
          onClose={() => setActiveQuizModal(null)}
          quizTitle={activeQuizModal.title}
          subject={activeQuizModal.subject}
          questions={activeQuizModal.questions}
          onQuizCompleted={(score, starsEarned) => {
            if (onEarnStars) onEarnStars(starsEarned);
            playStarCollect();
            if (onShowToast) {
              onShowToast(`🏆 Quiz Completed! Scored ${score} and won +${starsEarned} Stars!`);
            }
          }}
        />
      )}
    </div>
  );
}
