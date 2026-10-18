'use client';

import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Play,
  Star,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Volume2,
  X,
  ExternalLink,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { AdventureTimetableItem } from '@/lib/types';
import { playButtonClick, playRocketLaunch, playStarCollect } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

interface LiveLaunchpadProps {
  studentName?: string;
  timetable: AdventureTimetableItem[];
  onOpenQuests?: () => void;
}

export function LiveLaunchpad({ studentName = 'Aarav', timetable, onOpenQuests }: LiveLaunchpadProps) {
  // Live Countdown Timer State (Hours, Minutes, Seconds, Milliseconds)
  const [timeLeft, setTimeLeft] = useState({
    minutes: 6,
    seconds: 20,
    hundredths: 29
  });

  const [activeVideoModal, setActiveVideoModal] = useState<{
    id: number;
    title: string;
    subject: string;
    theme: string;
    coverBg: string;
    badge: string;
    views: string;
    rating: number;
    mascot: string;
    videoUrl: string;
  } | null>(null);

  const [launchModalOpen, setLaunchModalOpen] = useState(false);
  const [mascotBubble, setMascotBubble] = useState("Let's go, Aarav! Class starts soon! 🦊✨");

  // Ticking countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.hundredths > 0) {
          return { ...prev, hundredths: prev.hundredths - 1 };
        } else if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1, hundredths: 99 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59, hundredths: 99 };
        }
        return { minutes: 0, seconds: 0, hundredths: 0 };
      });
    }, 10);

    return () => clearInterval(timer);
  }, []);

  const handleLaunchClick = () => {
    playRocketLaunch();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38BDF8', '#FBBF24', '#F472B6', '#34D399']
      });
    } catch {
      // Ignore
    }
    setLaunchModalOpen(true);
  };

  const handleMascotClick = () => {
    playButtonClick();
    const quotes = [
      "Ready to explore Number Castle? 🏰",
      "You've got 180 Stars already! High five! ⭐",
      "Don't forget snack time at the Oasis! 🍉",
      "Ms. Priya says you're a Super Star today! ⭐",
      "Full steam ahead to outer space! 🚀"
    ];
    setMascotBubble(quotes[Math.floor(Math.random() * quotes.length)]);
    playStarCollect();
  };

  // Storybook Shelves Content
  const storybooks = [
    {
      id: 1,
      title: 'Learners to Storybook',
      subject: 'English Phonics',
      theme: 'Phonics Magic',
      coverBg: 'from-amber-400 to-orange-500',
      badge: '5.0 ★ Top Rated',
      views: '240 Learners',
      rating: 5,
      mascot: '🦁',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
      id: 2,
      title: 'Number Castle Quest',
      subject: 'Math Adventure',
      theme: 'Counting Blocks',
      coverBg: 'from-sky-400 to-indigo-600',
      badge: '4.9 ★ Favorite',
      views: '310 Learners',
      rating: 5,
      mascot: '🏰',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 3,
      title: 'Snack Oasis Science',
      subject: 'Nutrition & Health',
      theme: 'Fruit Chemistry',
      coverBg: 'from-emerald-400 to-teal-600',
      badge: '5.0 ★ Featured',
      views: '190 Learners',
      rating: 5,
      mascot: '🍉',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: 4,
      title: 'Art Treehouse Studio',
      subject: 'Creative Colors',
      theme: 'Clay Sculpting',
      coverBg: 'from-pink-400 to-purple-600',
      badge: '4.9 ★ Loved',
      views: '280 Learners',
      rating: 5,
      mascot: '🎨',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* ========================================================
          1. 3D ROCKET COUNTDOWN CARD
      ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl border-4 border-sky-300 bg-gradient-to-br from-sky-400 via-indigo-600 to-purple-800 p-6 sm:p-8 text-white shadow-2xl">
        
        {/* Floating Stars and Clouds Background Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-4 left-10 text-3xl animate-pulse">✨</div>
          <div className="absolute top-16 right-20 text-2xl animate-bounce">⭐</div>
          <div className="absolute bottom-6 left-1/3 text-4xl animate-pulse">🌟</div>
          <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-pink-400/30 blur-3xl" />
          <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Column: Live Info & Countdown */}
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 border border-white/30 text-xs font-black tracking-wide shadow-sm">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="uppercase text-amber-200">Upcoming Live Class</span>
              <span className="text-white/60">•</span>
              <span>Class 3-A Math</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-md">
              Star Shapes & Number Castle! 🚀
            </h1>

            {/* Teacher Pill */}
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/15 backdrop-blur-md p-2 pr-4 border border-white/20">
              <div className="relative h-11 w-11 rounded-xl bg-amber-400 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-xl">
                👩‍🏫
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-amber-200">Teacher Ms. Priya</p>
                <p className="text-[11px] font-bold text-white/90">Elementary Math & Logic Guide</p>
              </div>
            </div>

            {/* Live Countdown Display Box */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <span className="text-xs font-black uppercase text-amber-200 tracking-wider">Starts in:</span>
              <div className="flex items-center gap-2 text-slate-900 font-mono select-none">
                {/* Minutes */}
                <div className="flex flex-col items-center bg-white rounded-2xl px-3.5 py-2 shadow-lg border-b-4 border-slate-300 min-w-[56px]">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-700">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Min</span>
                </div>
                <span className="text-2xl font-black text-white">:</span>
                {/* Seconds */}
                <div className="flex flex-col items-center bg-white rounded-2xl px-3.5 py-2 shadow-lg border-b-4 border-slate-300 min-w-[56px]">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-700">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Sec</span>
                </div>
                <span className="text-2xl font-black text-white">:</span>
                {/* Hundredths */}
                <div className="flex flex-col items-center bg-amber-100 rounded-2xl px-3 py-2 shadow-lg border-b-4 border-amber-300 min-w-[48px]">
                  <span className="text-2xl sm:text-3xl font-black text-amber-700">
                    {String(timeLeft.hundredths).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-black text-amber-500 uppercase">Ms</span>
                </div>
              </div>
            </div>

            {/* Chunky 3D Launch CTA Button */}
            <div className="pt-3">
              <button
                onClick={handleLaunchClick}
                className="group relative inline-flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-lg px-8 py-4 shadow-xl border-b-6 border-amber-600 active:border-b-0 active:translate-y-2 hover:-translate-y-1 transition-all duration-150 w-full sm:w-auto"
                aria-label="Launch into Live Class"
              >
                <Rocket className="h-6 w-6 text-slate-900 group-hover:rotate-12 transition-transform animate-bounce-short" />
                <span>Launch into Live Class! 🚀</span>
                <span className="rounded-full bg-slate-950/15 px-2.5 py-0.5 text-xs font-black text-slate-900">
                  +25 XP
                </span>
              </button>
            </div>

          </div>

          {/* Right Column: 3D Rocket Graphic & Orbiting Badges */}
          <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 select-none">
            {/* Glowing Aura */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-300/30 to-pink-500/30 blur-2xl animate-pulse" />

            {/* Orbiting Ring */}
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-white/20 animate-spin-slow pointer-events-none" />

            {/* Rocket Illustration Container with Float Animation */}
            <div className="relative z-10 flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              {/* Rocket SVG illustration */}
              <div className="relative text-8xl drop-shadow-2xl animate-bounce-short">
                🚀
              </div>
              {/* Animated Thruster Flame Smoke */}
              <div className="flex gap-1 -mt-2">
                <span className="h-3 w-3 rounded-full bg-yellow-300 animate-ping" />
                <span className="h-4 w-4 rounded-full bg-orange-400 animate-pulse" />
                <span className="h-3 w-3 rounded-full bg-red-400 animate-ping delay-100" />
              </div>
              {/* Floating Pill Tag */}
              <div className="mt-3 rounded-2xl bg-white/90 backdrop-blur-md px-3.5 py-1 text-slate-900 text-xs font-black shadow-lg border-2 border-amber-300">
                ⭐ Aarav's Seat Reserved
              </div>
            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          2. VISUAL ADVENTURE TIMETABLE (ISLAND ROADMAP)
      ======================================================== */}
      <section className="rounded-3xl border-4 border-amber-200 bg-white p-6 sm:p-8 shadow-xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-800 px-3 py-1 text-xs font-black mb-1">
              <span>🗺️ Island Roadmap</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Aarav's Daily Adventure Trail
            </h2>
            <p className="text-xs font-bold text-slate-500">
              Follow the winding island path through today's classes and snack stops!
            </p>
          </div>

          {/* Interactive Mascot Speech Bubble */}
          <div 
            onClick={handleMascotClick}
            className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-2.5 px-4 cursor-pointer hover:scale-102 transition-transform shadow-sm"
          >
            <span className="text-3xl animate-bounce-short">🦊</span>
            <div>
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Mascot Sparky says:</p>
              <p className="text-xs font-black text-slate-800">{mascotBubble}</p>
            </div>
          </div>
        </div>

        {/* Winding Island Road Node Map */}
        <div className="relative py-6">
          
          {/* Connector Winding Path SVG */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-4 pointer-events-none z-0">
            <div className="h-full w-full bg-gradient-to-r from-emerald-300 via-sky-400 via-amber-300 to-pink-400 rounded-full opacity-60" />
            <div className="h-full w-full border-t-2 border-dashed border-white/80 -mt-3.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {timetable.map((item, index) => {
              const isCurrent = item.mascot_at_node;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    playButtonClick();
                    if (item.completed) playStarCollect();
                  }}
                  className={`group relative flex flex-col rounded-3xl p-5 border-4 transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'border-amber-400 bg-gradient-to-b from-amber-50 via-yellow-50 to-white shadow-2xl -translate-y-2 ring-4 ring-amber-300/40'
                      : item.completed
                      ? 'border-emerald-300 bg-emerald-50/70 shadow-md'
                      : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-lg'
                  }`}
                >
                  {/* Node Header Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-xl bg-white px-2.5 py-1 text-[11px] font-black text-slate-700 shadow-sm border border-slate-200">
                      {item.time}
                    </span>
                    {item.completed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-black text-xs bg-emerald-100 px-2 py-0.5 rounded-lg">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Done
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-black text-xs bg-amber-200 px-2 py-0.5 rounded-lg animate-pulse">
                        ⭐ Active Now
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400">
                        Stop #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Node Island Icon and Mascot Station */}
                  <div className="relative my-2 flex items-center justify-center">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-3xl text-4xl shadow-md border-b-4 transition-transform group-hover:scale-110 ${
                      item.completed 
                        ? 'bg-emerald-100 border-emerald-300'
                        : isCurrent
                        ? 'bg-amber-300 border-amber-500 animate-bounce-short'
                        : 'bg-sky-100 border-sky-300'
                    }`}>
                      {item.icon}
                    </div>

                    {/* Mascot Stationed at Active Node */}
                    {isCurrent && (
                      <div className="absolute -top-6 -right-2 flex flex-col items-center select-none animate-bounce">
                        <div className="rounded-xl bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 shadow-md">
                          I'm Here!
                        </div>
                        <span className="text-2xl drop-shadow-md">🦊</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Theme Details */}
                  <div className="text-center mt-3">
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                      {item.island_theme}
                    </span>
                    <h3 className="text-base font-black text-slate-800 mt-0.5 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                      {item.teacher_name} • {item.room}
                    </p>
                  </div>

                  {/* Bottom Action Pill */}
                  <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                    <span className={`text-[11px] font-black inline-flex items-center gap-1 ${
                      isCurrent ? 'text-amber-700 font-black' : 'text-slate-400'
                    }`}>
                      {isCurrent ? 'Tap to Join Classroom' : item.completed ? 'Lesson Notes ✓' : 'Upcoming Station'}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </section>


      {/* ========================================================
          3. CLASS VIDEO RECORDINGS SHELF (STORYBOOK COVERS)
      ======================================================== */}
      <section className="rounded-3xl border-4 border-amber-700/30 bg-[#FFFBEB] p-6 sm:p-8 shadow-xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200 text-amber-900 px-3 py-1 text-xs font-black mb-1">
              <span>📚 Magical Library Shelf</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Storybook Lesson Replays
            </h2>
            <p className="text-xs font-bold text-slate-500">
              Rewatch fun cartoon classes and earn +10 bonus Stars!
            </p>
          </div>

          <span className="rounded-2xl bg-amber-200/80 px-4 py-2 text-xs font-black text-amber-900 border border-amber-300 self-start sm:self-auto">
            ⭐ 4 Storybooks Available
          </span>
        </div>

        {/* Realistic Wooden Bookshelf Display */}
        <div className="relative pt-4 pb-2">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {storybooks.map((book) => (
              <div
                key={book.id}
                onClick={() => {
                  playButtonClick();
                  setActiveVideoModal(book);
                }}
                className="group relative flex flex-col rounded-2xl bg-white p-4 shadow-md hover:shadow-2xl transition-all duration-200 cursor-pointer border-2 border-amber-200 hover:-translate-y-2 border-b-6 border-b-amber-400 active:translate-y-1"
              >
                {/* Book Cover Card */}
                <div className={`relative h-44 w-full rounded-xl bg-gradient-to-tr ${book.coverBg} p-4 flex flex-col justify-between text-white overflow-hidden shadow-inner`}>
                  {/* Subtle Spine Highlight */}
                  <div className="absolute top-0 bottom-0 left-0 w-3 bg-white/20 border-r border-white/30" />
                  
                  {/* Top Rating Badge */}
                  <div className="flex justify-between items-center pl-2">
                    <span className="rounded-full bg-slate-950/30 backdrop-blur-md px-2 py-0.5 text-[10px] font-black text-yellow-300">
                      {book.badge}
                    </span>
                    <span className="text-2xl">{book.mascot}</span>
                  </div>

                  {/* Play Overlay */}
                  <div className="flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 fill-slate-900 text-slate-900 ml-0.5" />
                    </div>
                  </div>

                  {/* Book Title on Cover */}
                  <div className="pl-2">
                    <p className="text-[10px] uppercase font-bold text-white/80">{book.subject}</p>
                    <p className="text-sm font-black leading-tight drop-shadow-sm">{book.title}</p>
                  </div>
                </div>

                {/* Shelf Info */}
                <div className="pt-3 px-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-800">{book.theme}</span>
                    <span className="text-[11px] font-bold text-slate-400">{book.views}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-amber-400">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i} className="text-xs">★</span>
                    ))}
                    <span className="text-[10px] font-black text-slate-500 ml-1">5.0</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Wooden Shelf Edge Base Visual */}
          <div className="mt-4 h-5 w-full rounded-xl bg-gradient-to-b from-[#854D0E] to-[#713F12] shadow-xl border-t-2 border-[#A16207]" />

        </div>

      </section>


      {/* ========================================================
          VIDEO REPLAY MODAL
      ======================================================== */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl border-4 border-amber-300 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeVideoModal.mascot}</span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{activeVideoModal.title}</h3>
                  <p className="text-xs font-bold text-slate-500">{activeVideoModal.subject} • Official Replay</p>
                </div>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative mt-4 aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
              <video
                src={activeVideoModal.videoUrl}
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-black text-amber-600">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>Earn +10 Stars for watching this replay!</span>
              </div>
              <button
                onClick={() => {
                  playStarCollect();
                  setActiveVideoModal(null);
                }}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 font-black text-xs shadow-md border-b-4 border-emerald-700"
              >
                Mark as Watched ✓
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================
          LIVE CLASS LAUNCH CELEBRATION MODAL
      ======================================================== */}
      {launchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border-4 border-sky-300 bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-100 text-4xl shadow-inner animate-bounce">
              🚀
            </div>
            <div>
              <span className="rounded-full bg-sky-100 text-sky-800 px-3 py-1 text-xs font-black uppercase">
                Ready for Takeoff!
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Connecting to Ms. Priya's Room
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1">
                Aarav Kumar (Class 3-A) • Audio and Video checked!
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 text-xs font-bold text-amber-800 text-left space-y-1">
              <p>⭐ <b>Class Topic:</b> Star Shapes & 3D Number Castle</p>
              <p>🦊 <b>Mascot:</b> Sparky is seated next to you!</p>
              <p>🎧 <b>Audio:</b> Kid-friendly volume limiter enabled</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setLaunchModalOpen(false)}
                className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 font-black text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  playStarCollect();
                  alert("Opening EDU360 Interactive Whiteboard Live Classroom...");
                  setLaunchModalOpen(false);
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-600 hover:from-sky-500 hover:to-indigo-700 text-white py-3 font-black text-xs shadow-lg border-b-4 border-indigo-800"
              >
                Enter Classroom Now 🌟
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
