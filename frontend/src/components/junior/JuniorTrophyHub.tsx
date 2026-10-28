'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Star,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Upload,
  Download,
  Flame,
  ShieldCheck,
  Medal,
  Crown,
  Gift,
  ExternalLink,
  PartyPopper
} from 'lucide-react';
import { User, MagicBoosterChest, StudentPortfolio, ChestUnlockResponse } from '@/lib/types';
import { playButtonClick, playStarCollect, playChestOpen, playFanfare } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

export interface JuniorTrophyHubProps {
  user: User;
  stars: number;
  level: number;
  levelTitle: string;
  studentId: number;
  chests?: MagicBoosterChest[];
  portfolio?: StudentPortfolio[];
  onChestClaimed?: (res: ChestUnlockResponse) => void;
  onOpenUploadCertificate?: () => void;
  onShowToast?: (msg: string) => void;
}

interface JuniorBadge {
  id: string;
  title: string;
  category: 'academic' | 'streak' | 'creative' | 'curiosity';
  icon: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
  progressText?: string;
  starsValue: number;
  badgeColor: string;
}

const defaultBadges: JuniorBadge[] = [
  {
    id: 'badge-math-champ',
    title: 'Math Wizard 🧙‍♂️',
    category: 'academic',
    icon: '🧮',
    description: 'Solved 10 double-digit regrouping problems in Chapter 2 without mistakes!',
    earned: true,
    earnedDate: 'Earned Oct 23, 2026',
    starsValue: 100,
    badgeColor: 'from-amber-400 to-yellow-500 border-amber-300'
  },
  {
    id: 'badge-star-reader',
    title: 'Super Bookworm 📖',
    category: 'academic',
    icon: '📚',
    description: 'Read aloud 5 storybook chapters with excellent phonics expression.',
    earned: true,
    earnedDate: 'Earned Oct 22, 2026',
    starsValue: 80,
    badgeColor: 'from-purple-400 to-indigo-500 border-purple-300'
  },
  {
    id: 'badge-streak-fire',
    title: '7-Day Explorer Streak 🔥',
    category: 'streak',
    icon: '⚡',
    description: 'Logged into your daily adventure trail 7 days in a row without missing.',
    earned: true,
    earnedDate: 'Earned Today',
    starsValue: 70,
    badgeColor: 'from-orange-400 to-red-500 border-orange-300'
  },
  {
    id: 'badge-eco-hero',
    title: 'Nature Detective 🍃',
    category: 'curiosity',
    icon: '🌱',
    description: 'Collected 5 autumn leaves and identified root & petal functions perfectly.',
    earned: true,
    earnedDate: 'Earned Oct 21, 2026',
    starsValue: 50,
    badgeColor: 'from-emerald-400 to-teal-500 border-emerald-300'
  },
  {
    id: 'badge-creative-artist',
    title: 'Rainbow Artist 🎨',
    category: 'creative',
    icon: '🎭',
    description: 'Painted 3 friendly farm animals with primary & secondary color blends.',
    earned: false,
    progressText: '2 of 3 drawings completed',
    starsValue: 60,
    badgeColor: 'from-pink-400 to-rose-500 border-pink-300'
  },
  {
    id: 'badge-grand-master',
    title: 'Grand Champion Crown 👑',
    category: 'academic',
    icon: '🏆',
    description: 'Earn 500 Stars and complete all Term 1 assessments to unlock the golden crown.',
    earned: false,
    progressText: '340 / 500 Stars banked',
    starsValue: 200,
    badgeColor: 'from-yellow-400 to-amber-600 border-yellow-300'
  }
];

export function JuniorTrophyHub({
  user,
  stars = 340,
  level = 5,
  levelTitle = 'Explorer',
  studentId,
  chests = [],
  portfolio = [],
  onChestClaimed,
  onOpenUploadCertificate,
  onShowToast
}: JuniorTrophyHubProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'badges' | 'chests' | 'certificates'>('all');
  const [badges, setBadges] = useState<JuniorBadge[]>(defaultBadges);

  // Local chests state if none provided
  const fallbackChests: MagicBoosterChest[] = [
    {
      id: 1,
      student_id: studentId || 6,
      concept_title: 'Number Counting & Phonics',
      day_number: 1,
      day_task_title: 'Count 1 to 20 with Number Blocks',
      status: 'completed_claimed',
      chest_stars: 30,
      parent_signed: true
    },
    {
      id: 2,
      student_id: studentId || 6,
      concept_title: 'Number Counting & Phonics',
      day_number: 2,
      day_task_title: 'Find & Circle 5 Rhyming Words',
      status: 'ready_to_open',
      chest_stars: 40,
      parent_signed: true
    },
    {
      id: 3,
      student_id: studentId || 6,
      concept_title: 'Number Counting & Phonics',
      day_number: 3,
      day_task_title: 'Solve 3 Animal Addition Riddles',
      status: 'locked',
      chest_stars: 50,
      parent_signed: false
    },
    {
      id: 4,
      student_id: studentId || 6,
      concept_title: 'Number Counting & Phonics',
      day_number: 4,
      day_task_title: 'Draw the Treasure Map & Spell 5 Words',
      status: 'locked',
      chest_stars: 60,
      parent_signed: false
    }
  ];

  const currentChests = chests.length > 0 ? chests : fallbackChests;

  const handleOpenChest = (chest: MagicBoosterChest) => {
    if (chest.status !== 'ready_to_open') return;
    playChestOpen();
    playFanfare();

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}

    if (onChestClaimed) {
      onChestClaimed({
        success: true,
        message: `Unlocked chest ${chest.id}`,
        chest_id: chest.id,
        status: 'completed_claimed',
        awarded_stars: chest.chest_stars,
        awarded_xp: 50,
        total_stars: stars + chest.chest_stars,
        xp_points: 500,
        level: level,
        level_title: levelTitle,
        level_up: false,
        celebration: {
          trigger: 'chest_opened',
          badge: 'Treasure Explorer',
          sound_effect: 'playChestOpen',
          animation: 'confetti',
          dialog_title: 'Chest Unlocked!',
          dialog_message: `Awesome job! Day ${chest.day_number} chest opened!`
        }
      });
    }
    if (onShowToast) {
      onShowToast(`🎉 Woohoo! Opened Day ${chest.day_number} Treasure Chest! +${chest.chest_stars} Stars collected!`);
    }
  };

  const handleDownloadCertificate = (title: string) => {
    playButtonClick();
    if (onShowToast) {
      onShowToast(`📥 Downloading official certificate for: ${title}`);
    }
    try {
      const mockCert = `====================================================\n        EDU360 PRIMARY EXCELLENCE CERTIFICATE       \n====================================================\n\nThis certifies that ${user.name} of Class 3-A\nhas achieved outstanding honors in: ${title}\n\nAward Date: October 2026\nTeacher: Mrs. Ananya Verma\nPrincipal: Dr. K. Radhakrishnan\n====================================================`;
      const blob = new Blob([mockCert], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${user.name}_${title.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };

  const earnedBadgesCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* ========================================================
          1. HERO HEADER: GOLDEN TROPHY ROOM & LEVEL BANNER
      ======================================================== */}
      <div className="relative rounded-3xl border-4 border-yellow-300 dark:border-yellow-700 bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-100 dark:from-slate-900 dark:via-yellow-950/30 dark:to-orange-950/30 p-5 sm:p-6 shadow-[0_8px_0_0_#d97706] overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5 z-10 max-w-xl">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 border-3 border-white dark:border-yellow-300 flex items-center justify-center text-4xl sm:text-5xl shadow-md transform hover:rotate-6 transition-transform">
              🏆
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white shadow-xs">
              Lvl {level}
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800 text-amber-700 dark:text-amber-300 text-xs font-black shadow-xs mb-1 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-spin" />
              <span>Aarav&apos;s Hall of Fame</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Trophy Room &amp; Badges</span>
              <span className="text-2xl sm:text-3xl">🎖️</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
              Celebrate your learning achievements, open daily magic booster chests, and collect certified awards!
            </p>
          </div>
        </div>

        {/* Center: Chintu the Cheering Monkey Mascot Buddy */}
        <div
          onClick={() => {
            playStarCollect();
            if (onShowToast) onShowToast("🐵 Chintu says: 'You are doing fantastic, Aarav! Keep collecting those stars!'");
          }}
          className="hidden md:flex items-center gap-3 shrink-0 z-10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xs px-3.5 py-2.5 rounded-2xl border-2 border-amber-300 dark:border-amber-700 shadow-[0_3px_0_0_#f59e0b] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Click Chintu for a cheer!"
        >
          <img
            src="/junior/extracted/sidebar_monkey_mascot.png"
            alt="Chintu the Explorer Monkey"
            className="w-12 h-12 object-contain select-none drop-shadow-xs"
          />
          <div className="text-[11px] font-black text-amber-950 dark:text-amber-200 leading-snug">
            <span>&quot;You&apos;re a star champ,</span><br/>
            <span className="text-amber-600 dark:text-amber-400">Aarav! Keep shining!&quot; ⭐</span>
          </div>
        </div>

        {/* Right Stats Chips */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 z-10 justify-end">
          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border-2 border-amber-300 rounded-2xl px-4 py-2 shadow-[0_3px_0_0_#f59e0b]">
            <span className="text-2xl">⭐</span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-600">Total Stars</div>
              <div className="text-base font-black text-slate-900 dark:text-white">{stars} Banked</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border-2 border-orange-300 rounded-2xl px-4 py-2 shadow-[0_3px_0_0_#f97316]">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-orange-600">Streak</div>
              <div className="text-base font-black text-slate-900 dark:text-white">7 Days</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border-2 border-indigo-300 rounded-2xl px-4 py-2 shadow-[0_3px_0_0_#6366f1]">
            <span className="text-2xl">🎖️</span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Badges</div>
              <div className="text-base font-black text-slate-900 dark:text-white">{earnedBadgesCount} / {badges.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. TOY-BOX TAB CONTROLS:
          All Trophies | Badges | Magic Booster Chests | Certificates
      ======================================================== */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white dark:bg-slate-900 p-2 rounded-3xl border-3 border-slate-200 dark:border-slate-800 shadow-sm">
        {[
          { id: 'all', label: 'All Achievements', icon: '🌟' },
          { id: 'badges', label: `My Badges (${earnedBadgesCount})`, icon: '🎖️' },
          { id: 'chests', label: 'Magic Booster Chests 🎁', icon: '📦' },
          { id: 'certificates', label: 'Verified Certificates', icon: '📜' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playButtonClick();
                setActiveTab(tab.id as any);
              }}
              className={`rounded-2xl px-4 py-2.5 text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-2 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-[0_3px_0_0_#d97706] translate-y-[-1px]'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 active:translate-y-0.5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          3. MAGIC BOOSTER CHESTS SECTION (IF 'all' OR 'chests')
      ======================================================== */}
      {(activeTab === 'all' || activeTab === 'chests') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-3 border-indigo-200 dark:border-indigo-900/60 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xl">
                🎁
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  1-Week Remedial Magic Booster Chests
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Unlock one mystery treasure crate each day by finishing your core learning sprint!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                <img
                  src="/junior/extracted/char_elephant_lunch.png"
                  alt="Ellie Elephant"
                  className="w-8 h-8 object-contain select-none"
                />
                <span className="text-[11px] font-black text-indigo-800 dark:text-indigo-300">
                  Ellie&apos;s Loot Crates
                </span>
              </div>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200">
                Sprint Week 1
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {currentChests.map((chest) => (
              <div
                key={chest.id}
                className={`rounded-2xl border-3 p-4 flex flex-col justify-between transition-all relative overflow-hidden ${
                  chest.status === 'completed_claimed'
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-[0_4px_0_0_#10b981]'
                    : chest.status === 'ready_to_open'
                    ? 'border-amber-400 dark:border-amber-600 bg-amber-50/70 dark:bg-amber-950/30 shadow-[0_4px_0_0_#f59e0b] animate-pulse'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-75 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-black mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      Day {chest.day_number}
                    </span>
                    <span className="text-amber-600 font-black flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      +{chest.chest_stars}
                    </span>
                  </div>

                  <div className="text-center py-3">
                    <div className="text-4xl select-none mb-1">
                      {chest.status === 'completed_claimed'
                        ? '✨'
                        : chest.status === 'ready_to_open'
                        ? '🎁'
                        : '🔒'}
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                      {chest.day_task_title}
                    </h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {chest.concept_title}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  {chest.status === 'completed_claimed' ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-xs text-center flex items-center justify-center gap-1 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Claimed ✓</span>
                    </div>
                  ) : chest.status === 'ready_to_open' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenChest(chest)}
                      className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs text-center shadow-[0_3px_0_0_#d97706] active:shadow-none active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>OPEN CHEST! 🔓</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-xs text-center flex items-center justify-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          4. BADGES GRID (IF 'all' OR 'badges')
      ======================================================== */}
      {(activeTab === 'all' || activeTab === 'badges') && (
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl border-3 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4 overflow-hidden">
          {/* Subtle playful hanging monkey peeking from top edge */}
          <div className="absolute top-0 right-6 pointer-events-none hidden md:block">
            <img
              src="/junior/extracted/top_hanging_monkey_clean.png"
              alt="Playful Monkey"
              className="h-14 w-auto object-contain opacity-90 select-none"
            />
          </div>

          <div className="flex items-center justify-between pr-0 md:pr-14">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-xl">
                🎖️
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Collectible Explorer Badges
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Earned by solving homework quests, daily reading, and attending live sessions!
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-amber-700 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full border border-amber-300">
              {earnedBadgesCount} / {badges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`rounded-2xl border-3 p-4 flex flex-col justify-between transition-all ${
                  b.earned
                    ? 'border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50/60 via-white to-yellow-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-amber-950/20 shadow-[0_4px_0_0_#f59e0b]'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 opacity-70 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-200 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {b.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {b.title}
                        </h4>
                        <span className="text-[10px] text-amber-600 font-bold block">
                          +{b.starsValue} Star Value
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        b.earned
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      {b.earned ? 'Earned ✓' : 'In Progress'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 font-medium leading-relaxed">
                    {b.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500">
                  {b.earned ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {b.earnedDate}
                    </span>
                  ) : (
                    <span className="text-amber-600">
                      ⚡ {b.progressText}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          5. VERIFIED CERTIFICATES & PORTFOLIO (IF 'all' OR 'certificates')
      ======================================================== */}
      {(activeTab === 'all' || activeTab === 'certificates') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-3 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-xl">
                📜
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Verified Certificates &amp; Special Awards
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Official certificates issued by Class 3-A teachers &amp; principal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <img
                  src="/junior/extracted/hw_char_art_giraffe_clean.png"
                  alt="Gigi Giraffe"
                  className="w-8 h-8 object-contain select-none"
                />
                <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                  Gigi&apos;s Honors Gallery
                </span>
              </div>

              {onOpenUploadCertificate && (
                <button
                  type="button"
                  onClick={() => {
                    playButtonClick();
                    onOpenUploadCertificate();
                  }}
                  className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-[0_3px_0_0_#4338ca] active:shadow-none active:translate-y-0.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload External Award</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              {
                title: 'Math Olympiad Junior Gold Finalist',
                issuer: 'National Science & Math Forum',
                date: 'October 15, 2026',
                grade: 'Grade A+ with Distinction',
                badge: '🏆 Distinction'
              },
              {
                title: 'Clean Handwritting & Creative Phonics Star',
                issuer: 'EDU360 Primary Faculty',
                date: 'October 20, 2026',
                grade: 'Top 5% of Class 3-A',
                badge: '🌟 Star Honor'
              }
            ].map((cert, idx) => (
              <div
                key={idx}
                className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                      {cert.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">• {cert.date}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {cert.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Issued by {cert.issuer} • {cert.grade}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadCertificate(cert.title)}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-300 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 font-black text-xs flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                  title="Download Certificate"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Certificate</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
