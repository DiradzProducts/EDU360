'use client';

import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Play,
  Volume2,
  VolumeX,
  X,
  Star,
  Printer,
  MessageCircle,
  Award,
  ChevronRight,
  BookOpen,
  Apple,
  Palette,
  Calculator
} from 'lucide-react';
import { playButtonClick, playStarCollect, playRocketLaunch } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

interface JuniorTimetableHubProps {
  studentName?: string;
  onOpenLiveClass?: () => void;
  onEarnStars?: (stars: number) => void;
}

type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

interface PeriodDetail {
  id: number;
  periodNum: string;
  timeSlot: string;
  subject: string;
  cardImage: string;
  teacherName: string;
  teacherRole: string;
  roomName: string;
  themeColor: 'emerald' | 'amber' | 'sky' | 'purple';
  status: 'completed' | 'active' | 'next' | 'upcoming';
  statusLabel: string;
  statusBadgeClass: string;
  cardBorderClass: string;
  bgGradientClass: string;
}

export function JuniorTimetableHub({
  studentName = 'Aarav Kumar',
  onOpenLiveClass,
  onEarnStars
}: JuniorTimetableHubProps) {
  // Day filter state: Monday is today
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
  
  // Sound toggle (matches reference pill "Sound: ON")
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active period modal state
  const [activeModalPeriod, setActiveModalPeriod] = useState<PeriodDetail | null>(null);

  // Interactive modal quiz state (for Math 2+3 challenge)
  const [mathAnswerState, setMathAnswerState] = useState<'unanswered' | 'correct' | 'wrong'>('unanswered');
  
  // Interactive modal checklist for Snack
  const [snackItems, setSnackItems] = useState({
    water: false,
    fruit: false,
    milk: false
  });

  // Interactive Art Palette selected color
  const [selectedArtColor, setSelectedArtColor] = useState<string>('#EC4899');

  const days: { key: WeekDay; label: string; icon: string; isToday?: boolean }[] = [
    { key: 'Monday', label: 'Monday', icon: '🌟', isToday: true },
    { key: 'Tuesday', label: 'Tuesday', icon: '🚀' },
    { key: 'Wednesday', label: 'Wednesday', icon: '🎨' },
    { key: 'Thursday', label: 'Thursday', icon: '🏰' },
    { key: 'Friday', label: 'Friday', icon: '🎉' }
  ];

  // Monday schedule matching the exact reference image
  const mondaySchedule: PeriodDetail[] = [
    {
      id: 1,
      periodNum: 'P1',
      timeSlot: '08:30 AM - 09:15 AM',
      subject: 'English Phonics',
      cardImage: '/junior/extracted/tt_card_p1_rounded.png',
      teacherName: 'Ms. Priya Rao',
      teacherRole: 'Teacher',
      roomName: 'Safari Treehouse A',
      themeColor: 'emerald',
      status: 'completed',
      statusLabel: 'Completed ✓',
      statusBadgeClass: 'bg-emerald-500 text-white shadow-xs',
      cardBorderClass: 'border-emerald-300/80 hover:border-emerald-400',
      bgGradientClass: 'from-[#F0FDF4] to-[#DCFCE7]'
    },
    {
      id: 2,
      periodNum: 'P2',
      timeSlot: '09:30 AM - 10:15 AM',
      subject: 'Mathematics',
      cardImage: '/junior/extracted/tt_card_p2_rounded.png',
      teacherName: 'Mrs. Ananya Verma',
      teacherRole: 'Teacher',
      roomName: 'Number Tower 2',
      themeColor: 'amber',
      status: 'active',
      statusLabel: 'Live Now 🔴',
      statusBadgeClass: 'bg-amber-500 text-white ring-2 ring-amber-300 shadow-md animate-pulse',
      cardBorderClass: 'border-amber-300 hover:border-amber-400 ring-2 ring-amber-300/60 shadow-lg',
      bgGradientClass: 'from-[#FFFBEB] to-[#FEF3C7]'
    },
    {
      id: 3,
      periodNum: 'P3',
      timeSlot: '10:30 AM - 11:00 AM',
      subject: 'Snack & Nutrition',
      cardImage: '/junior/extracted/tt_card_p3_rounded.png',
      teacherName: 'Coach Ramesh',
      teacherRole: 'Teacher',
      roomName: 'Oasis Garden Lawn',
      themeColor: 'sky',
      status: 'next',
      statusLabel: 'Next Up ⏰',
      statusBadgeClass: 'bg-sky-500 text-white shadow-xs',
      cardBorderClass: 'border-sky-300/80 hover:border-sky-400',
      bgGradientClass: 'from-[#F0F9FF] to-[#E0F2FE]'
    },
    {
      id: 4,
      periodNum: 'P4',
      timeSlot: '11:15 AM - 12:00 PM',
      subject: 'Creative Arts',
      cardImage: '/junior/extracted/tt_card_p4_rounded.png',
      teacherName: 'Ms. Neha Kapoor',
      teacherRole: 'Teacher',
      roomName: 'Studio Color Splash',
      themeColor: 'purple',
      status: 'upcoming',
      statusLabel: 'Upcoming 🎨',
      statusBadgeClass: 'bg-purple-500 text-white shadow-xs',
      cardBorderClass: 'border-purple-300/80 hover:border-purple-400',
      bgGradientClass: 'from-[#FDF4FF] to-[#F3E8FF]'
    }
  ];

  // Helper sound wrapper respecting the toggle
  const triggerSound = (soundFn: () => void) => {
    if (soundEnabled) {
      soundFn();
    }
  };

  const handleCardClick = (period: PeriodDetail) => {
    triggerSound(playButtonClick);
    setActiveModalPeriod(period);
    setMathAnswerState('unanswered');
  };

  const handleMathAnswer = (val: number) => {
    if (val === 5) {
      setMathAnswerState('correct');
      triggerSound(playStarCollect);
      if (onEarnStars) onEarnStars(10);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899']
        });
      } catch {
        // Ignore
      }
    } else {
      setMathAnswerState('wrong');
    }
  };

  const handleElephantClick = () => {
    triggerSound(playStarCollect);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x: 0.85, y: 0.85 },
        colors: ['#38BDF8', '#60A5FA', '#93C5FD', '#FCD34D']
      });
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">

      {/* ========================================================
          1. HEADER ROW: WOODEN PLANK, VINE MONKEY, SPEECH BUBBLE
      ======================================================== */}
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        
        {/* Left: Carved Wooden Plank 'Weekly Class Schedule' + 'Class 3-A' */}
        <div className="relative shrink-0 flex items-center">
          <div className="relative group">
            <img
              src="/junior/extracted/tt_header_plank_smooth.png"
              alt="Weekly Class Schedule - Class 3-A"
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-md select-none hover:scale-[1.02] transition-transform duration-200"
              onError={(e) => {
                // Fallback styled wooden plank if asset is unavailable
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('tt-header-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />

            {/* Fallback styled wooden plank */}
            <div
              id="tt-header-fallback"
              style={{ display: 'none' }}
              className="flex-col items-center justify-center bg-gradient-to-b from-[#A16207] to-[#78350F] text-amber-50 px-6 py-2.5 rounded-2xl border-2 border-amber-300 shadow-lg"
            >
              <div className="flex items-center gap-2 font-black text-lg sm:text-xl">
                <span>📅</span>
                <span>Weekly Class Schedule</span>
              </div>
              <span className="mt-1 px-3 py-0.5 rounded-full bg-blue-500 text-white text-xs font-bold shadow-xs">
                🎓 Class 3-A
              </span>
            </div>
          </div>
        </div>

        {/* Center: Playful Paw Trail leading towards Speech Bubble */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-3 text-slate-500/70 select-none text-base">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🐾</span>
            <span className="animate-bounce" style={{ animationDelay: '200ms' }}>🐾</span>
            <span className="animate-bounce" style={{ animationDelay: '400ms' }}>🐾</span>
            <span className="animate-bounce" style={{ animationDelay: '600ms' }}>🐾</span>
            <span className="animate-bounce" style={{ animationDelay: '800ms' }}>🐾</span>
          </div>
        </div>

        {/* Right: Friendly Sun Cloud Speech Bubble */}
        <div className="relative shrink-0 flex items-center">
          <div className="relative flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-400/30 rounded-full py-2 px-5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-xl shadow-xs shrink-0 animate-sun-spin">
              ☀️
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                Here&apos;s your class timetable!
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                Be on time and have a fun day!
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          2. WEEKDAY SELECTOR TABS (CRISP HIGH CONTRAST)
      ======================================================== */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white/95 dark:bg-slate-900/95 p-2 rounded-2xl border-2 border-amber-200 dark:border-slate-800 shadow-sm">
        
        {/* Day Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
          {days.map((day) => {
            const isActive = selectedDay === day.key;
            return (
              <button
                key={day.key}
                onClick={() => {
                  triggerSound(playButtonClick);
                  setSelectedDay(day.key);
                }}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#FEF08A] text-amber-950 border-2 border-amber-400 shadow-md scale-105 ring-2 ring-amber-300/40'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-900 dark:hover:bg-slate-700'
                }`}
              >
                <span>{day.icon}</span>
                <span>{day.label}</span>
                {day.isToday && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/80 text-amber-950 font-black">
                    TODAY
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Current Period Alert Pill */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>Current Station: <strong>P2 Mathematics</strong> with Mrs. Ananya Verma</span>
        </div>

      </div>

      {/* ========================================================
          3. MAIN 4 PERIOD CARDS (MATCHING REFERENCE IMAGE 1:1, RAZOR SHARP)
      ======================================================== */}
      <section className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
          
          {mondaySchedule.map((period) => (
            <div
              key={period.id}
              onClick={() => handleCardClick(period)}
              className={`group relative rounded-[26px] overflow-hidden border-2 transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-2 active:scale-95 bg-white dark:bg-slate-900 ${period.cardBorderClass} ${
                period.status === 'active' ? 'ring-4 ring-amber-400 shadow-xl shadow-amber-300/50' : ''
              }`}
            >
              {/* Exact Storybook Illustration Card from Reference Image (2x Sharp Resolution) */}
              <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900">
                <img
                  src={period.cardImage}
                  alt={`${period.periodNum} - ${period.subject}`}
                  className="w-full h-auto object-contain block select-none group-hover:scale-[1.02] transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.getElementById(`tt-card-fallback-${period.id}`);
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />

                {/* Fallback card representation if image is missing */}
                <div
                  id={`tt-card-fallback-${period.id}`}
                  style={{ display: 'none' }}
                  className={`w-full p-4 flex-col justify-between bg-gradient-to-b ${period.bgGradientClass}`}
                >
                  <div className="pt-2">
                    <span className="font-mono text-xs text-slate-500">{period.timeSlot}</span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{period.subject}</h3>
                  </div>
                  <div className="py-6 text-center text-4xl">
                    {period.id === 1 ? '🐒📚' : period.id === 2 ? '🐒🔢' : period.id === 3 ? '🐘🍎' : '🦒🎨'}
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-700">Teacher: {period.teacherName}</p>
                    <p className="font-semibold text-blue-600">{period.roomName}</p>
                  </div>
                </div>

                {/* Subtle Interactive Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 text-white pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1 drop-shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>{period.id === 2 ? 'Join Live Class 🚀' : 'Explore Station 🐾'}</span>
                    </span>
                    <span className="h-6 w-6 rounded-full bg-white/25 flex items-center justify-center text-xs">
                      ➜
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ========================================================
          4. BOTTOM BAR: SOUND TOGGLE PILL & WATER-SPRAY ELEPHANT
      ======================================================== */}
      <div className="relative flex items-center justify-between pt-6 select-none">
        
        {/* Left: Sound Toggle Pill matching target image */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const newState = !soundEnabled;
              setSoundEnabled(newState);
              if (newState) triggerSound(playButtonClick);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs sm:text-sm border-2 shadow-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
              soundEnabled
                ? 'bg-white/95 dark:bg-slate-900/95 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
            }`}
            title="Toggle Jungle Sound Effects"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-emerald-600 animate-pulse" />
                <span>Sound: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-slate-400" />
                <span>Sound: OFF</span>
              </>
            )}
          </button>

          {/* Quick Print Button */}
          <button
            onClick={() => {
              triggerSound(playButtonClick);
              window.print();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
            title="Print weekly timetable for bedroom fridge"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Timetable</span>
          </button>
        </div>

        {/* Right: Water-Spraying Baby Elephant from Target Image */}
        <div className="relative flex items-end">
          <div
            onClick={handleElephantClick}
            className="group relative cursor-pointer"
            title="Click elephant for a cheerful water splash!"
          >
            {/* Water Spray Droplets Micro-Animation */}
            <div className="absolute -top-3 left-4 flex gap-1 pointer-events-none animate-water-spray">
              <span className="text-sm">💦</span>
              <span className="text-xs">💧</span>
              <span className="text-sm">✨</span>
            </div>

            <img
              src="/junior/extracted/tt_bottom_elephant_clean.png"
              alt="Water-spraying baby elephant mascot"
              className="h-20 sm:h-24 w-auto object-contain drop-shadow-lg select-none group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

      </div>

      {/* ========================================================
          5. INTERACTIVE PERIOD DETAILS MODAL
      ======================================================== */}
      {activeModalPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-300 p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white select-none">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${activeModalPeriod.statusBadgeClass}`}>
                  {activeModalPeriod.periodNum}
                </span>
                <h3 className="text-lg font-black">{activeModalPeriod.subject}</h3>
              </div>
              <button
                onClick={() => {
                  triggerSound(playButtonClick);
                  setActiveModalPeriod(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Teacher & Location Info */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">Teacher:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeModalPeriod.teacherName}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">Classroom:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{activeModalPeriod.roomName}</span>
              </div>
            </div>

            {/* SUBJECT-SPECIFIC ACTIVITIES */}

            {/* P1: English Phonics Practice */}
            {activeModalPeriod.id === 1 && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    <span>Today&apos;s Alphabet Safari Story</span>
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    &ldquo;The clever monkey read three funny stories under the treehouse! Can you say the sounds: <strong>A, B, C</strong>?&rdquo;
                  </p>
                  <div className="flex gap-2 pt-2">
                    {['A', 'B', 'C'].map((letter) => (
                      <button
                        key={letter}
                        onClick={() => {
                          triggerSound(playStarCollect);
                          if (onEarnStars) onEarnStars(2);
                        }}
                        className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* P2: Mathematics Live Classroom & Chalkboard Math Challenge */}
            {activeModalPeriod.id === 2 && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-amber-600" />
                      <span>Mrs. Ananya Verma&apos;s Chalkboard Quiz</span>
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                      +10 ⭐ Coins
                    </span>
                  </div>

                  <div className="bg-[#1e293b] text-white p-3 rounded-xl text-center border-2 border-amber-400/40">
                    <span className="font-mono text-xl font-bold tracking-widest text-amber-300">
                      2 + 3 = ?
                    </span>
                  </div>

                  {mathAnswerState === 'correct' ? (
                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Terrific job, Aarav! Mrs. Ananya Verma awarded you 10 Stars! 🌟</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 pt-1">
                      {[4, 5, 6].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleMathAnswer(num)}
                          className="h-11 w-14 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-amber-300 hover:bg-amber-400 hover:text-amber-950 font-black text-lg shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  )}
                  {mathAnswerState === 'wrong' && (
                    <p className="text-[11px] text-rose-500 font-bold text-center">
                      Try counting on your fingers: 2 bananas + 3 bananas!
                    </p>
                  )}
                </div>

                {/* Launch Live Class Button */}
                <button
                  onClick={() => {
                    triggerSound(playRocketLaunch);
                    setActiveModalPeriod(null);
                    if (onOpenLiveClass) onOpenLiveClass();
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all ring-2 ring-amber-300/60"
                >
                  <Play className="h-4 w-4 fill-slate-950" />
                  <span>Connect to Mrs. Ananya Verma&apos;s Live Stream! 🚀</span>
                </button>
              </div>
            )}

            {/* P3: Snack & Nutrition Checklist */}
            {activeModalPeriod.id === 3 && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 space-y-2.5">
                  <h4 className="text-sm font-bold text-sky-900 dark:text-sky-200 flex items-center gap-2">
                    <Apple className="h-4 w-4 text-sky-600" />
                    <span>Coach Ramesh&apos;s Healthy Snack Check</span>
                  </h4>
                  <p className="text-xs text-sky-800 dark:text-sky-300">
                    Check off what you enjoyed during snack time to earn energy points!
                  </p>
                  <div className="space-y-2 pt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {[
                      { key: 'water', label: '💧 Drank fresh water' },
                      { key: 'fruit', label: '🍎 Ate a crisp apple or banana' },
                      { key: 'milk', label: '🥛 Finished nutritious milk' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={snackItems[item.key as keyof typeof snackItems]}
                          onChange={(e) => {
                            triggerSound(playStarCollect);
                            setSnackItems((prev) => ({ ...prev, [item.key]: e.target.checked }));
                          }}
                          className="h-4 w-4 rounded-md text-sky-600 focus:ring-sky-500"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* P4: Creative Arts Color Splash */}
            {activeModalPeriod.id === 4 && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 space-y-2.5">
                  <h4 className="text-sm font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-purple-600" />
                    <span>Ms. Neha Kapoor&apos;s Rainbow Palette</span>
                  </h4>
                  <p className="text-xs text-purple-800 dark:text-purple-300">
                    Pick your favorite color to paint on today&apos;s jungle rainbow:
                  </p>
                  <div className="flex gap-2.5 pt-1">
                    {['#EF4444', '#F97316', '#FACC15', '#10B981', '#3B82F6', '#8B5CF6'].map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          triggerSound(playStarCollect);
                          setSelectedArtColor(color);
                        }}
                        style={{ backgroundColor: color }}
                        className={`h-9 w-9 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                          selectedArtColor === color ? 'ring-4 ring-white dark:ring-slate-900 scale-110' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  triggerSound(playButtonClick);
                  setActiveModalPeriod(null);
                }}
                className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
