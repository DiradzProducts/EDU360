'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  CheckCircle2,
  Clock,
  Star,
  Upload,
  X,
  Volume2,
  Eye,
  RefreshCw,
  Folder,
  FileText,
  FileCheck,
  Check,
  Compass,
  ArrowRight
} from 'lucide-react';
import { DailyQuest } from '@/lib/types';
import { playButtonClick, playStarCollect } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

interface DailyQuestsProps {
  studentId?: number;
  quests?: DailyQuest[];
  onQuestCompleted?: (questId: number) => void;
  onEarnStars?: (stars: number) => void;
}

export function DailyQuests({
  studentId = 6,
  quests = [],
  onQuestCompleted,
  onEarnStars
}: DailyQuestsProps) {
  // Initial default quests matching the exact 3 missions from the reference image
  const [missions, setMissions] = useState<DailyQuest[]>([
    {
      id: 1,
      student_id: studentId,
      title: 'Count & Color 10 Stars in Chapter 2 Workbook',
      subject: 'MATH',
      xp_reward: 25,
      stars_reward: 50,
      status: 'active',
      teacher_reaction: 'Super Star! 🌟 You are doing great! ⭐',
      proof_image_url: null,
      due_date: 'Today, 4:00 PM'
    },
    {
      id: 2,
      student_id: studentId,
      title: 'Draw and Name 3 Farm Animals',
      subject: 'ART & NATURE',
      xp_reward: 30,
      stars_reward: 60,
      status: 'active',
      teacher_reaction: 'Creative Genius! 🎨 Keep it up!',
      proof_image_url: null,
      due_date: 'Today, 6:00 PM'
    },
    {
      id: 3,
      student_id: studentId,
      title: 'Read Aloud: The Magic Treehouse (Ch 1)',
      subject: 'ENGLISH PHONICS',
      xp_reward: 20,
      stars_reward: 40,
      status: 'completed',
      teacher_reaction: 'Brilliant Pronunciation! ⭐ Keep reading! ⭐',
      proof_image_url: '/samples/storybook_audio_proof.png',
      due_date: 'Yesterday'
    }
  ]);

  // Tab filter: 'all' | 'todo' | 'completed'
  const [filterTab, setFilterTab] = useState<'all' | 'todo' | 'completed'>('all');

  // Upload Modal State
  const [selectedMission, setSelectedMission] = useState<DailyQuest | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [demoSelected, setDemoSelected] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Success Celebration Modal State
  const [successModalData, setSuccessModalData] = useState<{
    questTitle: string;
    stars: number;
    xp: number;
  } | null>(null);

  // Proof Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  // Stats calculation
  const totalCount = missions.length;
  const completedCount = missions.filter((m) => m.status === 'completed').length;
  const activeCount = missions.filter((m) => m.status === 'active').length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  // Filtered list
  const filteredMissions = missions.filter((m) => {
    if (filterTab === 'todo') return m.status === 'active';
    if (filterTab === 'completed') return m.status === 'completed';
    return true;
  });

  // Voice narration function for "Listen" button
  const handleListen = (title: string, subject: string) => {
    playButtonClick();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `${subject} Mission: ${title}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Open Upload Modal
  const handleOpenUpload = (mission: DailyQuest) => {
    playButtonClick();
    setSelectedMission(mission);
    setSelectedFile(null);
    setDemoSelected(false);
  };

  // Handle Demo Worksheet click
  const handleUseDemo = () => {
    playButtonClick();
    setDemoSelected(true);
    setSelectedFile(null);
  };

  // Submit Mission Homework
  const handleTurnInMission = () => {
    if (!selectedMission) return;
    playStarCollect();
    setIsSubmitting(true);

    try {
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#38BDF8', '#EC4899']
      });
    } catch {
      // Ignore
    }

    setTimeout(() => {
      // Mark as completed
      setMissions((prev) =>
        prev.map((m) =>
          m.id === selectedMission.id
            ? {
                ...m,
                status: 'completed',
                proof_image_url: '/samples/math_worksheet.png',
                teacher_reaction: 'Awesome work submitted! 🌟 - Ms. Priya'
              }
            : m
        )
      );

      const completedReward = {
        questTitle: selectedMission.title,
        stars: selectedMission.stars_reward,
        xp: selectedMission.xp_reward
      };

      if (onEarnStars) onEarnStars(selectedMission.stars_reward);
      if (onQuestCompleted) onQuestCompleted(selectedMission.id);

      setIsSubmitting(false);
      setSelectedMission(null);
      setSuccessModalData(completedReward);
    }, 900);
  };

  const handleSignpostClick = () => {
    playStarCollect();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.85, y: 0.85 },
        colors: ['#10B981', '#F59E0B', '#EF4444', '#38BDF8']
      });
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      
      {/* ========================================================
          1. TOP BANNER: HOMEWORK ADVENTURE ZONE (MATCHING TARGET UI)
      ======================================================== */}
      <section className="relative overflow-hidden rounded-[28px] border-2 border-amber-300/80 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-md backdrop-blur-xs select-none">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
          
          {/* Left Column: Pill, Title, Subtitle */}
          <div className="flex-1 space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 px-3.5 py-1 text-xs font-black border border-amber-300/80 shadow-2xs">
              <span className="text-amber-500">⭐</span>
              <span>Homework Adventure Zone</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl select-none">📖</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Daily Homework Missions</span>
                <span className="text-2xl select-none">🦊</span>
              </h2>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Complete your missions, upload your work, get feedback from your teachers and earn shiny stars!
            </p>
          </div>

          {/* Center: Cute Reading Baby Elephant Illustration from Reference */}
          <div className="hidden md:flex items-center justify-center shrink-0">
            <img
              src="/junior/extracted/quest_banner_elephant_clean.png"
              alt="Baby Elephant Reading Book"
              className="h-20 sm:h-24 w-auto object-contain drop-shadow-sm select-none hover:scale-105 transition-transform"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Right Column: Two Tactile Stats Widgets */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Missions to Do Widget */}
            <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-left shadow-xs flex items-center gap-3 min-w-[130px]">
              <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-lg shrink-0">
                📋
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                  Missions to Do
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                  {activeCount} Active
                </span>
              </div>
            </div>

            {/* Quest Reward Widget */}
            <div className="rounded-2xl border-2 border-amber-400 bg-[#FEF08A] hover:bg-[#FDE047] py-2.5 px-4 text-left shadow-xs flex items-center gap-3 min-w-[130px] transition-colors">
              <div className="h-9 w-9 rounded-xl bg-amber-300/80 flex items-center justify-center text-lg shrink-0">
                ⭐
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase text-amber-900 leading-tight">
                  Quest Reward
                </span>
                <span className="text-sm sm:text-base font-black text-amber-950 leading-tight">
                  +50 Stars
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          2. FILTER TABS & SEGMENTED PROGRESS BAR
      ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {/* All Missions Tab */}
            <button
              onClick={() => {
                playButtonClick();
                setFilterTab('all');
              }}
              className={`rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'all'
                  ? 'bg-[#FACC15] text-slate-950 shadow-md ring-1 ring-amber-400 scale-105'
                  : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-50'
              }`}
            >
              <span>📑</span>
              <span>All Missions ({totalCount})</span>
            </button>

            {/* To Do Tab */}
            <button
              onClick={() => {
                playButtonClick();
                setFilterTab('todo');
              }}
              className={`rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'todo'
                  ? 'bg-[#FACC15] text-slate-950 shadow-md ring-1 ring-amber-400 scale-105'
                  : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-50'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>To Do ({activeCount})</span>
            </button>

            {/* Completed Tab */}
            <button
              onClick={() => {
                playButtonClick();
                setFilterTab('completed');
              }}
              className={`rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'completed'
                  ? 'bg-emerald-500 text-white shadow-md scale-105'
                  : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-50'
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>Completed ({completedCount})</span>
            </button>
          </div>

          {/* Progress Percent Text */}
          <span className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300">
            {completedCount} of {totalCount} Completed ({progressPct}%)
          </span>
        </div>

        {/* Vibrant Emerald Progress Bar */}
        <div className="h-2.5 w-full rounded-full bg-slate-200/90 dark:bg-slate-800 p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.max(progressPct, 5)}%` }}
          />
        </div>
      </div>

      {/* ========================================================
          3. MISSION CARDS GRID (EXACT MATCH TO REFERENCE IMAGE)
      ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        
        {/* ======================================================
            CARD 1: MATH MISSION (TOP LEFT)
        ====================================================== */}
        {filteredMissions.some((m) => m.id === 1) && (
          <div className="group relative rounded-[28px] border-2 border-purple-200/90 dark:border-purple-800/80 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Top Row: Purple Subject Tag + Star Reward */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-black px-3 py-1 flex items-center gap-1.5">
                  <span>📐</span>
                  <span>MATH</span>
                </span>

                <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 text-xs font-black px-3 py-1 flex items-center gap-1">
                  <span>⭐</span>
                  <span>+50 Stars</span>
                </span>
              </div>

              {/* Title & Due Date */}
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                  Count &amp; Color 10 Stars in Chapter 2 Workbook
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Due: Today, 4:00 PM</span>
                </div>
              </div>

              {/* Middle Row: Teacher Review + Boy Character Art */}
              <div className="flex items-center justify-between gap-3 pt-1">
                
                {/* Teacher Review Box */}
                <div className="flex-1 rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center text-sm shrink-0 border border-pink-200">
                    👩‍🏫
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Ms. Priya • Teacher Review
                    </span>
                    <span className="text-xs font-black text-amber-950 dark:text-amber-200 mt-0.5 block">
                      Super Star! 🌟 You are doing great! ⭐
                    </span>
                  </div>
                </div>

                {/* Character Art (Boy holding pencil with stars) */}
                <div className="shrink-0 relative">
                  <img
                    src="/junior/extracted/quest_char_math_boy_clean.png"
                    alt="Boy Workbook Character"
                    className="h-20 sm:h-24 w-auto object-contain select-none group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

              </div>

            </div>

            {/* Action Button: Purple Gradient Upload Pill */}
            <div className="pt-5">
              <button
                onClick={() => handleOpenUpload(missions[0])}
                className="w-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs sm:text-sm py-3 px-4 shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Workbook Photo 📷</span>
              </button>
            </div>

          </div>
        )}

        {/* ======================================================
            CARD 2: ART & NATURE MISSION (TOP RIGHT)
        ====================================================== */}
        {filteredMissions.some((m) => m.id === 2) && (
          <div className="group relative rounded-[28px] border-2 border-pink-200/90 dark:border-pink-800/80 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Top Row: Pink Subject Tag + Star Reward */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 text-xs font-black px-3 py-1 flex items-center gap-1.5">
                  <span>🌸</span>
                  <span>ART &amp; NATURE</span>
                </span>

                <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 text-xs font-black px-3 py-1 flex items-center gap-1">
                  <span>⭐</span>
                  <span>+60 Stars</span>
                </span>
              </div>

              {/* Title & Due Date */}
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                  Draw and Name 3 Farm Animals
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Due: Today, 6:00 PM</span>
                </div>
              </div>

              {/* Middle Row: Teacher Review + Cow/Chick/Easel Character Art */}
              <div className="flex items-center justify-between gap-3 pt-1">
                
                {/* Teacher Review Box */}
                <div className="flex-1 rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center text-sm shrink-0 border border-rose-200">
                    👩‍🎨
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Ms. Neha • Teacher Review
                    </span>
                    <span className="text-xs font-black text-amber-950 dark:text-amber-200 mt-0.5 block">
                      Creative Genius! 🎨 Keep it up!
                    </span>
                  </div>
                </div>

                {/* Character Art (Cow, Chick, Easel) */}
                <div className="shrink-0 relative">
                  <img
                    src="/junior/extracted/quest_char_art_animals_clean.png"
                    alt="Farm Animals Art Easel"
                    className="h-20 sm:h-24 w-auto object-contain select-none group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

              </div>

            </div>

            {/* Action Button: Pink/Rose Gradient Upload Pill */}
            <div className="pt-5">
              <button
                onClick={() => handleOpenUpload(missions[1])}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xs sm:text-sm py-3 px-4 shadow-md hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Workbook Photo 📷</span>
              </button>
            </div>

          </div>
        )}

        {/* ======================================================
            CARD 3: ENGLISH PHONICS MISSION (BOTTOM LEFT)
        ====================================================== */}
        {filteredMissions.some((m) => m.id === 3) && (
          <div className="group relative rounded-[28px] border-2 border-sky-200/90 dark:border-sky-800/80 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3.5">
              
              {/* Top Row: Blue Subject Tag + Star Reward */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-black px-3 py-1 flex items-center gap-1.5">
                  <span>📖</span>
                  <span>ENGLISH PHONICS</span>
                </span>

                <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 text-xs font-black px-3 py-1 flex items-center gap-1">
                  <span>⭐</span>
                  <span>+40 Stars</span>
                </span>
              </div>

              {/* Title & Due Date */}
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                  Read Aloud: The Magic Treehouse (Ch 1)
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Due: Yesterday</span>
                </div>
              </div>

              {/* Proof Submitted Banner */}
              <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-[#F0FDF4] dark:bg-emerald-950/30 p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 flex items-center justify-center text-sm shrink-0">
                    📄
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block leading-tight">
                      Proof Submitted ✓
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block leading-tight">
                      Verified &amp; Graded
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playButtonClick();
                    setPreviewModalOpen(true);
                  }}
                  className="rounded-full bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-3 py-1 text-xs font-black flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View</span>
                </button>
              </div>

              {/* Teacher Review Box + Monkey Reading Illustration */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex-1 rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center text-sm shrink-0 border border-pink-200">
                    👩‍🏫
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Ms. Priya • Teacher Review
                    </span>
                    <span className="text-xs font-black text-amber-950 dark:text-amber-200 mt-0.5 block">
                      Brilliant Pronunciation! ⭐ Keep reading! ⭐
                    </span>
                  </div>
                </div>

                {/* Character Art (Monkey reading on grass) */}
                <div className="shrink-0 relative">
                  <img
                    src="/junior/extracted/quest_char_english_monkey_clean.png"
                    alt="Reading Monkey Mascot"
                    className="h-20 sm:h-24 w-auto object-contain select-none group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================
            CARD 4 / ACCENT: WOODEN DIRECTIONAL SIGNPOST (BOTTOM RIGHT)
        ====================================================== */}
        <div className="relative flex items-center justify-center lg:justify-end p-2 select-none">
          <div
            onClick={handleSignpostClick}
            className="group relative cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300"
            title="Click signpost to explore more jungle milestones!"
          >
            <img
              src="/junior/extracted/quest_signpost_clean.png"
              alt="Directional Signpost: Explore, Learn, Grow"
              className="h-44 sm:h-52 w-auto object-contain drop-shadow-xl select-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

      </section>


      {/* ========================================================
          4. UPLOAD WORKBOOK PROOF MODAL (INTERACTIVE & COMPLETE)
      ======================================================== */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border-4 border-amber-300 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 select-none">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-xl text-amber-800">
                  📷
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Upload Homework Proof
                  </h3>
                  <p className="text-xs font-bold text-slate-500 truncate max-w-xs">
                    {selectedMission.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMission(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Dashed Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-7 text-center cursor-pointer transition-all ${
                demoSelected || selectedFile
                  ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-amber-300 bg-[#FFFDF5] dark:bg-amber-950/20 hover:bg-amber-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setDemoSelected(false);
                    playStarCollect();
                  }
                }}
              />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 text-3xl mb-2">
                📁
              </div>

              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {selectedFile
                  ? `Selected: ${selectedFile.name}`
                  : demoSelected
                  ? 'Demo Worksheet Ready: Chapter2_Stars_Proof.png ✓'
                  : 'Choose Photo from Computer or Tablet'}
              </h4>

              <p className="text-xs font-bold text-slate-500 mt-1 max-w-sm mx-auto">
                Click here to browse your files or drag and drop your workbook photo / drawing
              </p>

              <div className="mt-3">
                <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-3 py-1 text-[10px] font-black uppercase">
                  PNG, JPG, or PDF
                </span>
              </div>
            </div>

            {/* Quick Action Buttons (Take Photo / Use Demo) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border border-pink-300 dark:border-pink-800 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 py-2.5 px-3 text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Take Photo with Camera</span>
              </button>

              <button
                type="button"
                onClick={handleUseDemo}
                className="rounded-2xl border border-sky-300 dark:border-sky-800 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 py-2.5 px-3 text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>⚡ Use Demo Worksheet</span>
              </button>
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedMission(null)}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 font-black text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedFile && !demoSelected}
                onClick={handleTurnInMission}
                className={`flex-1 rounded-2xl py-3 px-4 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  selectedFile || demoSelected
                    ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 text-slate-950 border-b-4 border-amber-600 cursor-pointer active:scale-95'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                <span>Turn in Homework &amp; Claim Stars ⭐</span>
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ========================================================
          5. MISSION TURNED IN! CELEBRATION MODAL
      ======================================================== */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border-4 border-amber-300 bg-white dark:bg-slate-900 p-7 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 select-none">
            
            {/* Green Tick Circle */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white text-4xl shadow-lg shadow-emerald-500/30 animate-bounce">
              ✓
            </div>

            {/* Title */}
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Mission Turned In! ⭐
              </h3>

              {/* Awarded Badge */}
              <div className="mt-2 inline-block">
                <span className="rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] px-4 py-1 text-xs font-black uppercase tracking-wider">
                  +{successModalData.stars} Stars &amp; +{successModalData.xp} XP Awarded!
                </span>
              </div>

              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-3 max-w-xs mx-auto">
                Your teacher has received your submission and will review it!
              </p>
            </div>

            {/* Dismiss Button */}
            <div className="pt-3">
              <button
                onClick={() => {
                  playButtonClick();
                  setSuccessModalData(null);
                }}
                className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 font-black text-sm shadow-lg border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
              >
                Awesome! Back to Missions 🌟
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ========================================================
          6. PROOF PREVIEW MODAL
      ======================================================== */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border-4 border-emerald-300 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 select-none">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>📄 Verified Homework Snapshot</span>
              </h3>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 p-4 text-center">
              <div className="h-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-4">
                <span className="text-5xl mb-2">⭐ 🌟 ⭐</span>
                <p className="text-sm font-black text-slate-800 dark:text-white">
                  Maths Chapter 2: Regrouping Star Workbook
                </p>
                <p className="text-xs font-bold text-emerald-600 mt-1">
                  100% Accuracy Checked by Ms. Priya • Oct 24
                </p>
              </div>
            </div>

            <button
              onClick={() => setPreviewModalOpen(false)}
              className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 py-2.5 font-black text-xs transition-colors cursor-pointer"
            >
              Close Snapshot
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
