'use client';

import React, { useState } from 'react';
import {
  Video,
  Play,
  Clock,
  Sparkles,
  Calendar,
  X,
  RotateCcw,
  RotateCw,
  Volume2,
  CheckCircle2,
  Star,
  Award
} from 'lucide-react';
import { playButtonClick, playStarCollect } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

export interface ClassRecordingItem {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  teacherName: string;
  teacherAvatar: string;
  duration: string;
  date: string;
  thumbnailUrl: string;
  videoUrl: string;
  keyTakeaway: string;
}

export interface JuniorRecordingsLibraryProps {
  onEarnStars?: (stars: number) => void;
}

export function JuniorRecordingsLibrary({ onEarnStars }: JuniorRecordingsLibraryProps) {
  const [recordings] = useState<ClassRecordingItem[]>([
    {
      id: 'rec-1',
      title: 'Chapter 4: Double Digit Regrouping with Stars',
      subject: 'Mathematics',
      chapter: 'Unit 4 • Addition Magic',
      teacherName: 'Ms. Priya Nair',
      teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PriyaMath',
      duration: '32 mins',
      date: 'Yesterday at 10:00 AM',
      thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      keyTakeaway: 'Always place the carry-over ten in the top star box before adding the tens column!'
    },
    {
      id: 'rec-2',
      title: 'The Brave Little Turtle Story & Phonics Sounds',
      subject: 'English & Phonics',
      chapter: 'Unit 3 • Storytime & Vowels',
      teacherName: 'Mrs. Ananya Verma',
      teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AnanyaEnglish',
      duration: '28 mins',
      date: '2 days ago at 11:30 AM',
      thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      keyTakeaway: 'Short "u" sounds like umbrella, under, and turtle!'
    },
    {
      id: 'rec-3',
      title: 'How Little Seeds Drink Water & Sprout',
      subject: 'Environmental Science',
      chapter: 'Unit 2 • Plant Kingdom',
      teacherName: 'Mr. Rakesh Sharma',
      teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RakeshEVS',
      duration: '35 mins',
      date: '3 days ago at 01:00 PM',
      thumbnailUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      keyTakeaway: 'Seeds need soil, sunlight, and clean water to sprout tiny green roots.'
    },
    {
      id: 'rec-4',
      title: 'Color Wheel Magic: Mixing Blue & Yellow for Forest Green',
      subject: 'Creative Art',
      chapter: 'Unit 1 • Primary & Secondary Colors',
      teacherName: 'Ms. Kavita Reddy',
      teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KavitaArt',
      duration: '25 mins',
      date: 'Last Friday at 02:00 PM',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      keyTakeaway: 'Mix equal drops of yellow and blue to create the perfect leafy green tint.'
    }
  ]);

  const [filter, setFilter] = useState<string>('all');
  const [activeVideo, setActiveVideo] = useState<ClassRecordingItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [watchProgress, setWatchProgress] = useState(45);

  const [claimedReward, setClaimedReward] = useState(false);

  const filtered = recordings.filter((r) =>
    filter === 'all' ? true : r.subject.toLowerCase().includes(filter.toLowerCase())
  );

  const handleOpenVideo = (item: ClassRecordingItem) => {
    playButtonClick();
    setActiveVideo(item);
    setIsPlaying(true);
    setWatchProgress(20);
    setClaimedReward(false);
  };

  const handleClaimReward = () => {
    playStarCollect();
    setClaimedReward(true);
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
    if (onEarnStars) {
      onEarnStars(10);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl border border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-amber-950/40 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-200/60 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 text-xs font-black">
            <Video className="h-3.5 w-3.5" />
            <span>Classroom Replay Theater</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Class Recordings Archive 🎬
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl font-medium">
            Missed a morning session or want to re-watch a story lesson? Watch past class recordings anytime and earn curiosity stars!
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 shadow-sm shrink-0">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-black text-slate-800 dark:text-slate-200">
            {recordings.length} Recorded Lessons Available
          </span>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: '🌟 All Subjects' },
          { id: 'math', label: '🔢 Mathematics' },
          { id: 'english', label: '📖 English & Phonics' },
          { id: 'science', label: '🌱 Environmental Science' },
          { id: 'art', label: '🎨 Creative Art' }
        ].map((pill) => (
          <button
            key={pill.id}
            onClick={() => {
              playButtonClick();
              setFilter(pill.id);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === pill.id
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Recordings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            {/* Thumbnail Box */}
            <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

              {/* Subject Tag */}
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                  {item.subject}
                </span>
              </div>

              {/* Duration Tag */}
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-rose-500/90 px-2.5 py-1 text-[10px] font-black text-white shadow-sm">
                <Clock className="h-3 w-3" />
                <span>{item.duration}</span>
              </div>

              {/* Center Play Button Overlay */}
              <button
                onClick={() => handleOpenVideo(item)}
                className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer group-hover:bg-rose-500 group-hover:text-white"
              >
                <Play className="h-6 w-6 ml-1 fill-current" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span>{item.chapter}</span>
                  <span>{item.date}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-medium">
                  💡 {item.keyTakeaway}
                </p>
              </div>

              {/* Faculty Info & Watch Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={item.teacherAvatar}
                    alt={item.teacherName}
                    className="h-7 w-7 rounded-xl bg-slate-100 dark:bg-slate-800"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {item.teacherName}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenVideo(item)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-black hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Play Replay</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border-2 border-slate-700 overflow-hidden shadow-2xl space-y-4">
            
            {/* Top Modal Bar */}
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎬</span>
                <div>
                  <h3 className="text-sm font-black text-white truncate max-w-md">
                    {activeVideo.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {activeVideo.subject} • Taught by {activeVideo.teacherName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Viewport Simulation */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              <img
                src={activeVideo.thumbnailUrl}
                alt="Video playing"
                className="h-full w-full object-cover opacity-60"
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 pointer-events-none">
                <div className="h-16 w-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center text-2xl shadow-2xl">
                  {isPlaying ? '▶' : '⏸'}
                </div>
                <span className="text-xs font-black text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                  Lesson Replay Stream Active
                </span>
              </div>

              {/* Progress Slider Bar */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2">
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden cursor-pointer">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${watchProgress}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white cursor-pointer">
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button onClick={() => setWatchProgress(Math.max(0, watchProgress - 10))} className="flex items-center gap-0.5 hover:text-white cursor-pointer">
                      <RotateCcw className="h-3 w-3" /> 10s
                    </button>
                    <button onClick={() => setWatchProgress(Math.min(100, watchProgress + 10))} className="flex items-center gap-0.5 hover:text-white cursor-pointer">
                      <RotateCw className="h-3 w-3" /> 10s
                    </button>
                  </div>
                  <span>14:20 / {activeVideo.duration}</span>
                </div>
              </div>
            </div>

            {/* Lesson Takeaway & Claim Star */}
            <div className="p-5 pt-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Key Lesson Takeaway:
                </span>
                <p className="text-xs text-slate-300 font-medium">
                  {activeVideo.keyTakeaway}
                </p>
              </div>

              <button
                onClick={handleClaimReward}
                disabled={claimedReward}
                className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer shrink-0 transition-all ${
                  claimedReward
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 active:scale-95'
                }`}
              >
                <Star className={`h-4 w-4 ${claimedReward ? 'fill-white' : 'fill-slate-950'}`} />
                <span>{claimedReward ? '✓ Stars Claimed (+10 ⭐)' : 'Claim +10 Replay Stars'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
