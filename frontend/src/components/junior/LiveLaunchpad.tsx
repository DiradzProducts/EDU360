'use client';

import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Play,
  Star,
  Volume2,
  X,
  CheckCircle2
} from 'lucide-react';
import { AdventureTimetableItem } from '@/lib/types';
import { playButtonClick, playRocketLaunch, playStarCollect } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

interface LiveLaunchpadProps {
  studentName?: string;
  timetable?: AdventureTimetableItem[];
  onOpenQuests?: () => void;
  onEarnStars?: (stars: number) => void;
}

export function LiveLaunchpad({
  studentName = 'Aarav Kumar',
  timetable = [],
  onOpenQuests,
  onEarnStars
}: LiveLaunchpadProps) {
  // Countdown Timer state: Minutes and Seconds
  const [timeLeft, setTimeLeft] = useState({
    minutes: 2,
    seconds: 24
  });

  const [activeVideoModal, setActiveVideoModal] = useState<{
    id: number;
    title: string;
    subject: string;
    videoUrl: string;
  } | null>(null);

  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mascotBubble, setMascotBubble] = useState("Ready to blast off, Aarav? 🦊");

  // Countdown clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLaunchClick = () => {
    playRocketLaunch();
    setLaunchModalOpen(true);
  };

  const handleEnterClassroom = () => {
    playStarCollect();
    setIsConnecting(true);
    onEarnStars?.(50);

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#38BDF8', '#EC4899', '#10B981', '#8B5CF6']
      });
    } catch {
      // Ignore
    }

    setTimeout(() => {
      setIsConnecting(false);
      setLaunchModalOpen(false);
    }, 1200);
  };

  // 5 Storybook Replay Lessons matching target screenshot
  const storybooks = [
    {
      id: 1,
      subjectTag: 'ENGLISH',
      bgClass: 'bg-[#4ADE80]',
      artEmoji: '👦👧',
      title: 'English',
      subtitle: 'Phonics & Reading',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 2,
      subjectTag: 'MATH',
      bgClass: 'bg-[#A855F7]',
      artEmoji: '🏰🧱',
      title: 'Math',
      subtitle: 'Shapes & Numbers',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: 3,
      subjectTag: 'CHEMISTRY',
      bgClass: 'bg-[#FACC15]',
      artEmoji: '🧪🔬',
      title: 'Science',
      subtitle: 'Fun Lab Experiments',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
      id: 4,
      subjectTag: 'SCIENCE',
      bgClass: 'bg-[#38BDF8]',
      artEmoji: '🔬🪐',
      title: 'Science',
      subtitle: 'Nature & Space',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    },
    {
      id: 5,
      subjectTag: 'ART',
      bgClass: 'bg-[#F472B6]',
      artEmoji: '🎨🖌️',
      title: 'Art',
      subtitle: 'Colors & Craft',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          1. COSMIC ROYAL BLUE LIVE CLASS BANNER (EXACT TARGET UI)
      ======================================================== */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#1738A5] via-[#1E4FD8] to-[#14349C] p-6 lg:p-7 text-white shadow-2xl border-2 border-sky-300/40 select-none">
        
        {/* Subtle twinkling stars background */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute top-4 left-1/4 text-2xl animate-pulse">✨</div>
          <div className="absolute top-12 right-1/4 text-xl animate-bounce">⭐</div>
          <div className="absolute bottom-6 left-1/3 text-3xl animate-pulse">🌟</div>
          <div className="absolute bottom-4 right-1/3 text-lg animate-bounce">✨</div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left: Cartoon Rocket Illustration from Reference Image */}
          <div className="relative flex items-center justify-center shrink-0">
            <img
              src="/junior/extracted/char_rocket.png"
              alt="Live Class Rocket"
              className="h-24 sm:h-28 w-auto object-contain drop-shadow-2xl animate-rocket-bob select-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Center: Live Class Info & Countdown */}
          <div className="flex-1 text-center lg:text-left space-y-2">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-bold text-sky-200">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-black text-emerald-300">• Live Class</span>
              <span className="text-white/70">Next Live Class: Class 3-A</span>
            </div>

            <div className="space-y-0.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-300 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                Mathematics
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                Shapes &amp; Numbers
              </h2>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-sky-200">
              with Ms. Priya
            </p>

            {/* Countdown Box */}
            <div className="flex items-center justify-center lg:justify-start gap-2.5 pt-1.5">
              <div className="flex items-center gap-2 bg-[#091538]/85 border border-sky-300/30 rounded-2xl px-3.5 py-1.5 font-mono text-white text-xs font-black shadow-inner">
                <span className="text-base text-white font-black">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase text-sky-200">MINUTES</span>
                <span className="text-sky-300 font-bold">:</span>
                <span className="text-base text-white font-black">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase text-sky-200">SECONDS</span>
              </div>

              <button
                onClick={() => playButtonClick()}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                title="Sound alert toggle"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right: Pencil Boy Art & Launch CTA Button from Reference */}
          <div className="flex flex-col items-center lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-4">
              <img
                src="/junior/extracted/char_pencil_boy.png"
                alt="Boy riding giant yellow pencil"
                className="h-24 sm:h-28 w-auto object-contain drop-shadow-2xl animate-float-pencil select-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />

              {/* Monkey Mascot Speech Bubble */}
              <div className="hidden sm:flex items-center gap-2 bg-white rounded-full py-2 px-4 shadow-lg select-none border border-slate-100">
                <span className="text-xl">🐵</span>
                <span className="text-xs font-black text-slate-800">
                  Ready to blast off, Aarav? 🚀
                </span>
              </div>
            </div>

            {/* Tactile Launch Button matching reference */}
            <button
              onClick={handleLaunchClick}
              className="rounded-full bg-gradient-to-r from-[#FACC15] via-[#FBBF24] to-[#F59E0B] hover:from-[#FDE047] hover:to-[#FBBF24] text-slate-950 font-black text-sm sm:text-base px-7 sm:px-9 py-3.5 shadow-xl border-2 border-white hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer ring-2 ring-amber-300/60"
            >
              <Rocket className="h-5 w-5 text-slate-950" />
              <span>Launch into Live Class! 🚀</span>
            </button>
          </div>

        </div>

      </section>


      {/* ========================================================
          2. AARAV'S DAILY ADVENTURE TRAIL (EXACT 4 STATION CARDS)
      ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <img
              src="/junior/extracted/trail_title_plank.png"
              alt="Aarav's Daily Adventure Trail"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs select-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="hidden sm:flex items-center gap-4 opacity-35 text-base text-slate-400 select-none">
              <span>🐾</span>
              <span>🐾</span>
              <span>🐾</span>
              <span>🐾</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          
          {/* Station 1: English Phonics (Completed) */}
          <div
            onClick={() => {
              playButtonClick();
              if (onOpenQuests) onOpenQuests();
            }}
            className="group relative rounded-[26px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer active:scale-95 border-2 border-emerald-300/50 bg-[#F0FDF4]"
          >
            <img
              src="/junior/extracted/card_station_1_english.png"
              alt="Station 1 - English Phonics"
              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-200"
            />
          </div>

          {/* Station 2: Math Castle (Active Now) */}
          <div
            onClick={() => {
              playButtonClick();
              handleLaunchClick();
            }}
            className="group relative rounded-[26px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer active:scale-95 border-2 border-amber-300/70 bg-[#FEF08A] ring-2 ring-amber-300/50"
          >
            <img
              src="/junior/extracted/card_station_2_math.png"
              alt="Station 2 - Math Castle"
              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-200"
            />
          </div>

          {/* Station 3: Lunch & Snack Break */}
          <div
            onClick={() => {
              playButtonClick();
              playStarCollect();
              if (onEarnStars) onEarnStars(5);
            }}
            className="group relative rounded-[26px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer active:scale-95 border-2 border-sky-200/70 bg-[#E0F2FE]"
          >
            <img
              src="/junior/extracted/card_station_3_lunch.png"
              alt="Station 3 - Lunch & Snack Break"
              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-200"
            />
          </div>

          {/* Station 4: Art & Colors */}
          <div
            onClick={() => {
              playButtonClick();
              if (onOpenQuests) onOpenQuests();
            }}
            className="group relative rounded-[26px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer active:scale-95 border-2 border-pink-200/70 bg-[#FCE7F3]"
          >
            <img
              src="/junior/extracted/card_station_4_art.png"
              alt="Station 4 - Art & Colors"
              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-200"
            />
          </div>

        </div>
      </section>


      {/* ========================================================
          3. STORYBOOK LESSON REPLAYS (WOODEN SHELF DISPLAY)
      ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <img
              src="/junior/extracted/replays_title_plank.png"
              alt="Storybook Lesson Replays"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs select-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="hidden sm:flex items-center gap-4 opacity-35 text-base text-slate-400 select-none">
              <span>🐾</span>
              <span>🐾</span>
              <span>🐾</span>
              <span>🐾</span>
              <span>🐾</span>
            </div>
          </div>
        </div>

        {/* 5 Storybook Replay Cards Grid directly from Reference */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {storybooks.map((book) => {
            const cardImages: Record<number, string> = {
              1: '/junior/extracted/storybook_card_1_english.png',
              2: '/junior/extracted/storybook_card_2_math.png',
              3: '/junior/extracted/storybook_card_3_science.png',
              4: '/junior/extracted/storybook_card_4_geography.png',
              5: '/junior/extracted/storybook_card_5_art.png'
            };

            return (
              <div
                key={book.id}
                onClick={() => {
                  playButtonClick();
                  setActiveVideoModal({
                    id: book.id,
                    title: `${book.title}: ${book.subtitle}`,
                    subject: book.title,
                    videoUrl: book.videoUrl
                  });
                }}
                className="group relative rounded-[24px] overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 active:translate-y-0 transition-all duration-200 cursor-pointer select-none bg-white"
              >
                <img
                  src={cardImages[book.id]}
                  alt={`${book.title} - ${book.subtitle}`}
                  className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-200"
                />
              </div>
            );
          })}
        </div>
      </section>



      {/* ========================================================
          4. CLASSROOM LAUNCH CELEBRATION MODAL (EXACT TARGET UI)
      ======================================================== */}
      {launchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border-4 border-amber-300 bg-white dark:bg-slate-900 p-6 sm:p-7 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            
            {/* Top Rocket Icon Box */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-3xl shadow-inner border border-amber-300">
              🚀
            </div>

            {/* Badge & Title */}
            <div>
              <span className="rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] px-3.5 py-1 text-[11px] font-black uppercase tracking-wider inline-block">
                SEAT RESERVED • LIVE NOW
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                Connecting to Ms. Priya&apos;s Room
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                {studentName} (Class 3-A) • Audio and Video checked!
              </p>
            </div>

            {/* Info Card */}
            <div className="rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 text-xs font-bold text-amber-900 dark:text-amber-200 text-left space-y-1.5">
              <p className="flex items-center gap-1.5">
                <span>⭐</span>
                <span><b>Class Topic:</b> Mathematics - Shapes &amp; Numbers</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span>🦊</span>
                <span><b>Mascot:</b> Sparky is seated next to you!</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                disabled={isConnecting}
                onClick={() => setLaunchModalOpen(false)}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 font-black text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isConnecting}
                onClick={handleEnterClassroom}
                className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white py-3 font-black text-xs shadow-lg border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer disabled:opacity-80 flex items-center justify-center gap-1.5"
              >
                {isConnecting ? (
                  <span>Connecting Stream... 🚀</span>
                ) : (
                  <span>Enter Classroom Now 🌟</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ========================================================
          5. STORYBOOK VIDEO REPLAY MODAL (EXACT TARGET UI)
      ======================================================== */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border-4 border-amber-300 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeVideoModal.title}
                </h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Official Class Storybook Replay
                </p>
              </div>

              <button
                onClick={() => setActiveVideoModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
              <video
                src={activeVideoModal.videoUrl}
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  playStarCollect();
                  if (onEarnStars) onEarnStars(10);
                  setActiveVideoModal(null);
                }}
                className="rounded-2xl bg-[#059669] hover:bg-[#047857] text-white px-6 py-2.5 font-black text-xs shadow-md border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Finish Lesson (+10 Stars)</span>
                <span>⭐</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
