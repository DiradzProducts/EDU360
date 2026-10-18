'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  CheckCircle2,
  Clock,
  Star,
  Award,
  Upload,
  X,
  FileCheck,
  Check,
  Smile,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { DailyQuest } from '@/lib/types';
import { playButtonClick, playStarCollect } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

interface DailyQuestsProps {
  studentId?: number;
  quests: DailyQuest[];
  onQuestCompleted?: (questId: number) => void;
}

export function DailyQuests({ studentId = 6, quests, onQuestCompleted }: DailyQuestsProps) {
  const [activeQuestsList, setActiveQuestsList] = useState<DailyQuest[]>(quests);
  const [selectedQuestForUpload, setSelectedQuestForUpload] = useState<DailyQuest | null>(null);
  const [scanStep, setScanStep] = useState<'preview' | 'scanning' | 'done'>('preview');
  const [previewImage, setPreviewImage] = useState<string>('/samples/math_worksheet.png');

  const activeCount = activeQuestsList.filter((q) => q.status === 'active').length;
  const completedCount = activeQuestsList.filter((q) => q.status === 'completed').length;
  const totalCount = activeQuestsList.length || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const handleOpenScanner = (quest: DailyQuest) => {
    playButtonClick();
    setSelectedQuestForUpload(quest);
    setScanStep('preview');
  };

  const handleSimulateScanAndUpload = () => {
    playButtonClick();
    setScanStep('scanning');

    setTimeout(() => {
      setScanStep('done');
      playStarCollect();
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FBBF24', '#34D399', '#38BDF8', '#F472B6']
        });
      } catch {
        // Ignore
      }

      // Update quest status
      if (selectedQuestForUpload) {
        setActiveQuestsList((prev) =>
          prev.map((q) =>
            q.id === selectedQuestForUpload.id
              ? { ...q, status: 'completed', teacher_reaction: 'Verified by Ms. Priya! 🌟 100%' }
              : q
          )
        );
        if (onQuestCompleted) {
          onQuestCompleted(selectedQuestForUpload.id);
        }
      }
    }, 1200);
  };

  return (
    <section className="rounded-3xl border-4 border-amber-300 bg-white p-6 sm:p-8 shadow-xl space-y-6">
      
      {/* ========================================================
          HEADER & MISSION COUNTERS
      ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 px-3.5 py-1 text-xs font-black mb-1">
            <Sparkles className="h-4 w-4 text-amber-600 fill-amber-400" />
            <span>Homework Adventure Zone</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Daily Homework Missions
          </h2>
          <p className="text-xs font-bold text-slate-500">
            Complete your missions, scan your paper workbook, and collect shiny Stars!
          </p>
        </div>

        {/* Floating Badges */}
        <div className="flex items-center gap-2.5">
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 px-3.5 py-2 text-center shadow-sm">
            <span className="block text-[10px] font-black uppercase text-amber-700">Missions Remaining</span>
            <span className="text-base font-black text-amber-900">{activeCount} Active</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 border-2 border-yellow-500 px-4 py-2 text-center shadow-md animate-bounce-short">
            <span className="block text-[10px] font-black uppercase text-amber-950">Mission Yield</span>
            <span className="text-base font-black text-slate-900">+50 Stars ⭐</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          MULTI-SEGMENT COLORFUL PROGRESS BAR
      ======================================================== */}
      <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-black text-slate-700">Today's Mission Progress</span>
          <span className="text-xs font-black text-indigo-600">{completedCount} of {totalCount} Completed ({progressPct}%)</span>
        </div>

        {/* Segmented Colorful Bar */}
        <div className="flex h-4 w-full gap-1.5 rounded-full bg-slate-200 p-0.5 overflow-hidden">
          {activeQuestsList.map((q, idx) => {
            const isCompleted = q.status === 'completed';
            const colors = [
              'bg-pink-400',
              'bg-amber-400',
              'bg-emerald-400',
              'bg-sky-400'
            ];
            const activeColor = colors[idx % colors.length];

            return (
              <div
                key={q.id}
                className={`h-full flex-1 rounded-full transition-all duration-500 ${
                  isCompleted ? activeColor : 'bg-slate-300/60'
                }`}
                title={`Mission ${idx + 1}: ${q.title} (${q.status})`}
              />
            );
          })}
        </div>
      </div>

      {/* ========================================================
          CHUNKY QUEST CARDS
      ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeQuestsList.map((quest) => {
          const isDone = quest.status === 'completed';

          return (
            <div
              key={quest.id}
              className={`relative flex flex-col justify-between rounded-3xl p-6 border-4 transition-all duration-200 ${
                isDone
                  ? 'border-emerald-300 bg-emerald-50/50 shadow-md opacity-90'
                  : 'border-amber-300 bg-white hover:border-amber-400 shadow-xl hover:-translate-y-1'
              }`}
            >
              <div>
                {/* Top Pill Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1 text-[11px] font-black text-indigo-700 uppercase tracking-wider">
                    {quest.subject}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 border border-amber-300 px-2.5 py-1 text-xs font-black text-amber-800">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      +{quest.stars_reward} Stars
                    </span>
                    <span className="rounded-xl bg-purple-100 px-2 py-1 text-xs font-black text-purple-700">
                      +{quest.xp_reward} XP
                    </span>
                  </div>
                </div>

                {/* Quest Title */}
                <h3 className="text-lg font-black text-slate-800 leading-snug">
                  {quest.title}
                </h3>

                {/* Due Date Indicator */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Due: {quest.due_date}</span>
                </div>

                {/* Teacher Praise Chip */}
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-50/90 border border-amber-200 p-2.5 px-3">
                  <span className="text-xl">👩‍🏫</span>
                  <div className="text-left leading-tight">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">Teacher Feedback</p>
                    <p className="text-xs font-black text-slate-800">{quest.teacher_reaction}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                {isDone ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-black text-xs bg-emerald-100/90 px-4 py-2.5 rounded-2xl border border-emerald-300 w-full justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Mission Completed & Rewards Collected! ✓</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenScanner(quest)}
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 px-4 font-black text-xs shadow-lg border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all"
                  >
                    <Camera className="h-4 w-4" />
                    <span>📷 Scan & Upload Workbook Photo</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>


      {/* ========================================================
          CAMERA / WORKBOOK PHOTO SCANNER MODAL
      ======================================================== */}
      {selectedQuestForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border-4 border-pink-300 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 text-pink-700 text-xl">
                  📷
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Workbook Scanner</h3>
                  <p className="text-xs font-bold text-slate-500">{selectedQuestForUpload.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuestForUpload(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Camera Viewport Simulation */}
            <div className="relative aspect-4/3 w-full rounded-2xl border-4 border-dashed border-pink-300 bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-white p-4">
              {scanStep === 'scanning' ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-16 w-16 rounded-full border-4 border-pink-400 border-t-transparent animate-spin" />
                  <p className="text-sm font-black text-pink-300 animate-pulse">
                    Scanning Workbook & Counting Stars... ⭐
                  </p>
                </div>
              ) : scanStep === 'done' ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl animate-bounce">
                    ✓
                  </div>
                  <h4 className="text-lg font-black text-white">Workbook Page Verified!</h4>
                  <p className="text-xs font-bold text-emerald-300">
                    +{selectedQuestForUpload.stars_reward} Stars and +{selectedQuestForUpload.xp_reward} XP Added!
                  </p>
                </div>
              ) : (
                <div className="relative h-full w-full flex flex-col items-center justify-center text-center">
                  <img
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600"
                    alt="Sample workbook"
                    className="absolute inset-0 h-full w-full object-cover opacity-40 rounded-xl"
                  />
                  {/* Viewfinder crosshairs */}
                  <div className="relative z-10 space-y-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 text-2xl">
                      🔍
                    </div>
                    <p className="text-xs font-black text-white drop-shadow-md">
                      Align Chapter 2 Worksheet inside the frame
                    </p>
                    <span className="inline-block rounded-full bg-pink-500/80 px-3 py-1 text-[10px] font-black text-white">
                      Camera Ready
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2">
              {scanStep === 'done' ? (
                <button
                  onClick={() => setSelectedQuestForUpload(null)}
                  className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 font-black text-sm shadow-md border-b-4 border-emerald-700"
                >
                  Awesome! Back to Missions 🌟
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedQuestForUpload(null)}
                    className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 font-black text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSimulateScanAndUpload}
                    disabled={scanStep === 'scanning'}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 font-black text-xs shadow-lg border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all"
                  >
                    Snap & Submit 📸
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
