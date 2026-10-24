'use client';

import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Upload,
  Download,
  Star,
  FileText,
  Sparkles,
  Filter,
  Eye,
  Check,
  ChevronRight,
  Smile,
  X
} from 'lucide-react';
import { playButtonClick, playStarCollect } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

export interface JuniorHomeworkItem {
  id: string;
  title: string;
  subject: 'Mathematics' | 'English' | 'Science' | 'Art';
  subjectIcon: string;
  subjectColor: string;
  dueDate: string;
  dueTime: string;
  dateKey: 'today' | 'tomorrow' | 'upcoming' | 'past';
  formattedDate: string;
  starsReward: number;
  status: 'pending' | 'submitted' | 'graded';
  description: string;
  instructions: string[];
  worksheetPdfName: string;
  gradedInfo?: {
    teacherName: string;
    score: string;
    teacherRemark: string;
    sticker: string;
    gradedDate: string;
    annotatedPdfName: string;
  };
}

interface JuniorHomeworkHubProps {
  studentName?: string;
  onEarnStars?: (stars: number) => void;
  onShowToast?: (message: string) => void;
}

const defaultHomeworkItems: JuniorHomeworkItem[] = [
  {
    id: 'hw-math-1',
    title: 'Double-Digit Addition with Regrouping (Star Shapes #3)',
    subject: 'Mathematics',
    subjectIcon: '🧮',
    subjectColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
    dueDate: '2026-10-24',
    dueTime: '5:00 PM',
    dateKey: 'today',
    formattedDate: 'Today, Oct 24 • 5:00 PM',
    starsReward: 30,
    status: 'pending',
    description: 'Complete Problems 1 to 10 on carrying over the tens digits into the star box.',
    instructions: [
      'Write your numbers neatly in the grid lines.',
      'Always add the ones place digits first.',
      'Remember to put the carry-over ten in the top star box!'
    ],
    worksheetPdfName: 'Math_Class3A_Worksheet_Ch4.pdf'
  },
  {
    id: 'hw-eng-1',
    title: 'Rhyming Sentences & Vowel Digraphs (Magic Workbook p.14-16)',
    subject: 'English',
    subjectIcon: '📖',
    subjectColor: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800',
    dueDate: '2026-10-25',
    dueTime: '4:00 PM',
    dateKey: 'tomorrow',
    formattedDate: 'Tomorrow, Oct 25 • 4:00 PM',
    starsReward: 30,
    status: 'pending',
    description: 'Read the short phonics story "The Clever Fox" and underline all "ea" and "ee" words.',
    instructions: [
      'Find at least 6 rhyming pairs in the story.',
      'Write two sentences of your own using the word "Dream".',
      'Draw a little picture of the clever fox in the corner box!'
    ],
    worksheetPdfName: 'English_Phonics_Workbook_W4.pdf'
  },
  {
    id: 'hw-sci-1',
    title: 'Autumn Leaves Collection & Plant Parts Scrapbook Activity',
    subject: 'Science',
    subjectIcon: '🌱',
    subjectColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    dueDate: '2026-10-27',
    dueTime: '10:00 AM',
    dateKey: 'upcoming',
    formattedDate: 'Monday, Oct 27 • 10:00 AM',
    starsReward: 40,
    status: 'pending',
    description: 'Collect 3 different fallen leaves from your garden or balcony pot, paste them, and label the veins, stalk, and blade.',
    instructions: [
      'Do not pluck fresh green leaves; collect dried fallen ones safely.',
      'Use glue stick gently on your scrapbook page.',
      'Label the 3 main parts: Leaf Stalk, Leaf Blade, Leaf Vein.'
    ],
    worksheetPdfName: 'Science_EVS_Leaf_Exploration.pdf'
  },
  {
    id: 'hw-art-1',
    title: 'Origami Fox Mask & Clay Wildlife Sanctuary Craft',
    subject: 'Art',
    subjectIcon: '🎨',
    subjectColor: 'text-pink-600 bg-pink-50 dark:bg-pink-950/60 border-pink-300 dark:border-pink-800',
    dueDate: '2026-10-28',
    dueTime: '12:00 PM',
    dateKey: 'upcoming',
    formattedDate: 'Tuesday, Oct 28 • 12:00 PM',
    starsReward: 35,
    status: 'pending',
    description: 'Fold an orange origami paper into a woodland fox face and stick googly eyes or draw eyebrows.',
    instructions: [
      'Follow the 4-fold origami diagram from Art Class #6.',
      'Color the nose with a dark crayon.',
      'Click a nice bright photo of your finished craft to upload!'
    ],
    worksheetPdfName: 'Art_Origami_Fox_Template.pdf'
  },
  {
    id: 'hw-math-graded',
    title: '2D & 3D Shape Counting Scavenger Hunt',
    subject: 'Mathematics',
    subjectIcon: '🧮',
    subjectColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
    dueDate: '2026-10-22',
    dueTime: '5:00 PM',
    dateKey: 'past',
    formattedDate: 'Submitted on Wednesday, Oct 22',
    starsReward: 30,
    status: 'graded',
    description: 'Find 4 cuboids, 2 cylinders, and 1 sphere in your house and calculate total vertices.',
    instructions: ['Write down items found at home', 'Count corners and faces'],
    worksheetPdfName: 'Math_Shapes_Hunt.pdf',
    gradedInfo: {
      teacherName: 'Ms. Priya Nair',
      score: '20 / 20 ⭐',
      teacherRemark: 'Brilliant spatial discovery, Aarav! You identified the soup can cylinder and shoebox cuboid perfectly!',
      sticker: '🌟 Math Champion Sticker',
      gradedDate: 'Graded Oct 23',
      annotatedPdfName: 'Math_Shapes_Corrected_Stamps.pdf'
    }
  },
  {
    id: 'hw-eng-graded',
    title: 'Action Verbs & Sight Words Reading Sheet #2',
    subject: 'English',
    subjectIcon: '📖',
    subjectColor: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800',
    dueDate: '2026-10-21',
    dueTime: '5:00 PM',
    dateKey: 'past',
    formattedDate: 'Submitted on Tuesday, Oct 21',
    starsReward: 30,
    status: 'graded',
    description: 'Identify the action verb doing-words and circle the tricky words with blue crayon.',
    instructions: ['Circle sight words', 'Write 5 action verbs'],
    worksheetPdfName: 'English_SightWords_Sheet.pdf',
    gradedInfo: {
      teacherName: 'Ms. Priya Nair',
      score: '19 / 20 ⭐',
      teacherRemark: 'Super handwriting! 9 out of 10 sight words circled accurately. Keep practicing the word "thought"!',
      sticker: '🎖️ Star Reader Badge',
      gradedDate: 'Graded Oct 22',
      annotatedPdfName: 'English_SightWords_Annotated.pdf'
    }
  }
];

export function JuniorHomeworkHub({
  studentName = 'Aarav',
  onEarnStars,
  onShowToast
}: JuniorHomeworkHubProps) {
  const [items, setItems] = useState<JuniorHomeworkItem[]>(defaultHomeworkItems);
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'Mathematics' | 'English' | 'Science' | 'Art'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'upcoming' | 'graded'>('all');

  // Upload Modal State
  const [activeUploadItem, setActiveUploadItem] = useState<JuniorHomeworkItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSubject = subjectFilter === 'all' || item.subject === subjectFilter;
    const matchesDate =
      dateFilter === 'all'
        ? true
        : dateFilter === 'graded'
        ? item.status === 'graded'
        : item.dateKey === dateFilter && item.status !== 'graded';
    return matchesSubject && matchesDate;
  });

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const gradedCount = items.filter((i) => i.status === 'graded').length;

  const handleOpenUpload = (item: JuniorHomeworkItem) => {
    playButtonClick();
    setActiveUploadItem(item);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitHomework = () => {
    if (!activeUploadItem || !selectedFile) return;
    setIsUploading(true);

    setTimeout(() => {
      setIsUploading(false);
      setItems((prev) =>
        prev.map((i) =>
          i.id === activeUploadItem.id
            ? { ...i, status: 'submitted', formattedDate: 'Submitted Just Now • Awaiting Teacher Stamp' }
            : i
        )
      );

      playStarCollect();
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      if (onEarnStars) {
        onEarnStars(activeUploadItem.starsReward);
      }
      if (onShowToast) {
        onShowToast(`🎉 Worksheet Submitted! +${activeUploadItem.starsReward} Stars earned!`);
      }

      setActiveUploadItem(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="rounded-3xl border-2 border-amber-200 dark:border-amber-800/80 bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-pink-950/30 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 tracking-wider shadow-xs">
              Primary Academic Hub
            </span>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Class 3-A Worksheets &amp; Creative Tasks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Homework &amp; Magic Book 📖
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl font-medium">
            Solve your daily worksheets, snap a photo of your notebook page, and earn shiny stars from your teachers!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 shadow-xs flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center font-black text-sm">
              ⏳
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Pending</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">{pendingCount} Worksheets</span>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-xs flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center font-black text-sm">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Teacher Graded</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{gradedCount} Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dual Filtering Bar (Subject Pills + Date Filters) */}
      <div className="space-y-3 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Subject Filter Axis */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 shrink-0">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter by Subject:</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Subjects (6)', icon: '📚' },
              { id: 'Mathematics', label: 'Mathematics', icon: '🧮' },
              { id: 'English', label: 'Phonics & English', icon: '📖' },
              { id: 'Science', label: 'Science & Nature (EVS)', icon: '🌱' },
              { id: 'Art', label: 'Art & Craft', icon: '🎨' }
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => {
                  playButtonClick();
                  setSubjectFilter(sub.id as any);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  subjectFilter === sub.id
                    ? 'bg-amber-500 text-white shadow-xs scale-102'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Status Filter Axis */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 shrink-0">
            <Calendar className="h-3.5 w-3.5" />
            <span>Date &amp; Status:</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Worksheets' },
              { id: 'today', label: 'Due Today (Oct 24)', highlight: 'text-amber-600' },
              { id: 'tomorrow', label: 'Due Tomorrow (Oct 25)' },
              { id: 'upcoming', label: 'Next Week (Oct 27–28)' },
              { id: 'graded', label: 'Graded & Checked ⭐' }
            ].map((df) => (
              <button
                key={df.id}
                onClick={() => {
                  playButtonClick();
                  setDateFilter(df.id as any);
                }}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === df.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{df.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Subject-Wise & Date-Wise Homework Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-3xl border-2 p-6 shadow-xs transition-all space-y-4 ${
              item.status === 'graded'
                ? 'border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/20 dark:from-emerald-950/20 dark:via-slate-900 dark:to-teal-950/10'
                : item.dateKey === 'today'
                ? 'border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/20 dark:from-amber-950/20 dark:via-slate-900 dark:to-orange-950/10'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
          >
            {/* Top Row: Subject Badge, Due Date, and Status */}
            <div className="flex items-start justify-between gap-3 border-b border-inherit pb-3">
              <div className="space-y-1">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-black border ${item.subjectColor}`}
                >
                  <span>{item.subjectIcon}</span>
                  <span>{item.subject}</span>
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {item.title}
                </h3>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                    item.status === 'graded'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                      : item.status === 'submitted'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300'
                      : item.dateKey === 'today'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.status === 'graded'
                    ? 'Graded ✓'
                    : item.status === 'submitted'
                    ? 'Submitted ⏳'
                    : 'Pending 📝'}
                </span>
                <span className="block text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                  +{item.starsReward} Stars Reward
                </span>
              </div>
            </div>

            {/* Date Details Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>{item.formattedDate}</span>
              </span>
              <span className="text-[11px] text-slate-500">Class 3-A</span>
            </div>

            {/* Description & Step Instructions */}
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {item.description}
            </p>

            <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 p-3 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 block">
                Teacher Instructions:
              </span>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                {item.instructions.map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ul>
            </div>

            {/* Graded Remarks or Submission Actions */}
            {item.status === 'graded' && item.gradedInfo && (
              <div className="space-y-3 pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-600" />
                      <span>{item.gradedInfo.sticker}</span>
                    </span>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                      Score: {item.gradedInfo.score}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed">
                    &quot;{item.gradedInfo.teacherRemark}&quot;
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    — {item.gradedInfo.teacherName} • {item.gradedInfo.gradedDate}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 font-semibold truncate flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{item.gradedInfo.annotatedPdfName}</span>
                  </span>
                  <button
                    onClick={() => {
                      playButtonClick();
                      if (onShowToast) onShowToast(`Opening ${item.gradedInfo?.annotatedPdfName}`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors cursor-pointer shrink-0"
                  >
                    View Teacher Annotations
                  </button>
                </div>
              </div>
            )}

            {item.status !== 'graded' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => {
                    playButtonClick();
                    if (onShowToast) onShowToast(`Downloading ${item.worksheetPdfName}`);
                  }}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-amber-500" />
                  <span>Download Worksheet PDF</span>
                </button>

                {item.status === 'submitted' ? (
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span>Submitted • Waiting for Teacher Review</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenUpload(item)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Finished Worksheet (+{item.starsReward} ⭐)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="text-4xl">🌟</div>
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
            No Worksheets Found for this filter!
          </h3>
          <p className="text-xs text-slate-500">
            You are all caught up on your assignments, or try switching the subject or date filter above!
          </p>
          <button
            onClick={() => {
              setSubjectFilter('all');
              setDateFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 4. Interactive Worksheet Photo Upload Modal */}
      {activeUploadItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 block">
                  Submit {activeUploadItem.subject} Homework
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {activeUploadItem.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveUploadItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Take a bright picture of your written notebook page or scan your worksheet as a PDF.
            </p>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 hover:border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 p-6 text-center transition-all group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg,.pdf"
                className="hidden"
              />
              <Upload className="mx-auto h-8 w-8 text-amber-500 group-hover:scale-110 transition-transform mb-1.5" />
              <div className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-amber-600">
                {selectedFile ? selectedFile.name : 'Click to Browse or Drag Worksheet Photo here'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB file ready to upload`
                  : 'Supports PNG, JPG, or PDF (Max 15MB)'}
              </p>
            </div>

            {selectedFile && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <Check className="h-4 w-4" /> Ready for Teacher Review
                </span>
                <span className="font-mono text-[11px]">{selectedFile.name}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveUploadItem(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || isUploading}
                onClick={handleSubmitHomework}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isUploading ? (
                  <span>Submitting to Ms. Priya...</span>
                ) : (
                  <>
                    <span>🚀 Submit to Teacher (+{activeUploadItem.starsReward} ⭐)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
