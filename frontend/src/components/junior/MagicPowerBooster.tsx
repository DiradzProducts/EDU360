'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  Check,
  Star,
  Award,
  Users,
  Compass,
  Volume2,
  Gift,
  HelpCircle,
  X
} from 'lucide-react';
import { MagicBoosterChest, ChestUnlockResponse } from '@/lib/types';
import { api } from '@/lib/api';
import { playButtonClick, playChestOpen, playStarCollect } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

interface MagicPowerBoosterProps {
  studentId?: number;
  chests: MagicBoosterChest[];
  onChestClaimed?: (res: ChestUnlockResponse) => void;
}

export function MagicPowerBooster({ studentId = 6, chests, onChestClaimed }: MagicPowerBoosterProps) {
  const [chestList, setChestList] = useState<MagicBoosterChest[]>(chests);
  const [celebrationData, setCelebrationData] = useState<ChestUnlockResponse | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleChestClick = async (chest: MagicBoosterChest) => {
    playButtonClick();

    if (chest.status === 'completed_claimed') {
      playStarCollect();
      return;
    }

    if (chest.status === 'locked') {
      alert(`Day ${chest.day_number} is locked! Complete preceding focus adventures with Mom, Dad & Teacher to open this chest! 🗝️`);
      return;
    }

    // Chest is ready_to_open!
    setIsUnlocking(true);
    try {
      // Trigger Web Audio API Triumphant Chime
      playChestOpen();

      // Trigger Confetti Burst
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#F472B6', '#38BDF8', '#34D399', '#A78BFA']
      });

      // Call Backend API
      const res = await api.unlockMagicChest(studentId, chest.id);

      // Update state locally
      setChestList((prev) =>
        prev.map((c) => {
          if (c.id === chest.id) {
            return { ...c, status: 'completed_claimed' };
          }
          if (c.day_number === chest.day_number + 1 && c.status === 'locked') {
            return { ...c, status: 'ready_to_open' };
          }
          return c;
        })
      );

      setCelebrationData(res);
      if (onChestClaimed) {
        onChestClaimed(res);
      }
    } catch (e) {
      console.error("Chest unlock error:", e);
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border-4 border-purple-300 bg-gradient-to-b from-purple-50/70 via-pink-50/40 to-white p-6 sm:p-8 shadow-xl space-y-8">
      
      {/* Background Rainbow Shimmer Arc */}
      <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-gradient-to-tr from-pink-300/20 to-yellow-300/20 blur-3xl pointer-events-none" />

      {/* ========================================================
          HEADER & CONCEPTS
      ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-purple-100">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 px-4 py-1 text-xs font-black text-purple-900 mb-1">
            <Compass className="h-4 w-4 text-purple-600" />
            <span>4-Day Focus Power Booster</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Magic Power Booster Table 🌈
          </h2>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs font-bold text-slate-500">Supercharged revision for:</span>
            <span className="rounded-xl bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-black text-amber-900">
              [🔢 Number Counting]
            </span>
            <span className="rounded-xl bg-sky-100 border border-sky-300 px-2.5 py-0.5 text-xs font-black text-sky-900">
              [📖 Phonics & Rhymes]
            </span>
          </div>
        </div>

        {/* Parent-Teacher Shared Pill */}
        <div className="flex items-center gap-2 rounded-2xl bg-white border-2 border-emerald-300 p-2.5 px-4 shadow-sm self-start lg:self-auto">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-base">
            👨‍👩‍👦
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Parent Sign-Off</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs font-black text-slate-800">Shared with Mom & Dad</p>
          </div>
        </div>
      </div>

      {/* ========================================================
          RAINBOW PATH WITH 4 TREASURE CHESTS
      ======================================================== */}
      <div className="relative py-4">
        
        {/* Animated Curved Rainbow Graphic Path */}
        <div className="relative mx-auto my-6 max-w-4xl">
          
          {/* Rainbow Strip Background */}
          <div className="hidden md:block absolute top-1/2 left-10 right-10 -translate-y-1/2 h-6 rounded-full bg-gradient-to-r from-red-300 via-yellow-300 via-green-300 via-sky-300 to-purple-300 shadow-md opacity-80" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {chestList.map((chest) => {
              const isClaimed = chest.status === 'completed_claimed';
              const isReady = chest.status === 'ready_to_open';
              const isLocked = chest.status === 'locked';

              return (
                <div
                  key={chest.id}
                  onClick={() => handleChestClick(chest)}
                  className={`group relative flex flex-col items-center rounded-3xl p-5 border-4 transition-all duration-200 cursor-pointer text-center select-none ${
                    isClaimed
                      ? 'border-emerald-300 bg-emerald-50/70 shadow-md'
                      : isReady
                      ? 'border-amber-400 bg-gradient-to-b from-amber-50 via-yellow-100 to-white shadow-2xl -translate-y-2 ring-4 ring-amber-300/50 hover:scale-105'
                      : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
                  }`}
                >
                  {/* Day Badge */}
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`rounded-xl px-2.5 py-1 text-[11px] font-black uppercase ${
                      isClaimed 
                        ? 'bg-emerald-200 text-emerald-900' 
                        : isReady 
                        ? 'bg-amber-400 text-slate-900 animate-bounce-short' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      Day {chest.day_number}
                    </span>

                    {chest.parent_signed && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-lg" title="Signed by Parent">
                        Parent ✓
                      </span>
                    )}
                  </div>

                  {/* 3D Chest Visual Box */}
                  <div className="relative my-3 flex items-center justify-center h-28 w-28">
                    {isClaimed ? (
                      <div className="relative flex flex-col items-center">
                        {/* Open Chest with Gold Sparkles */}
                        <div className="text-6xl drop-shadow-md">
                          🎁
                        </div>
                        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-black text-sm shadow-lg border-2 border-white">
                          ✓
                        </div>
                        <span className="mt-1 text-[10px] font-black text-emerald-700 uppercase">Claimed</span>
                      </div>
                    ) : isReady ? (
                      <div className="relative flex flex-col items-center">
                        {/* Pulsing Ready Chest with Glowing Halo */}
                        <div className="absolute inset-0 rounded-full bg-yellow-400/40 blur-xl animate-ping" />
                        <div className="relative text-7xl drop-shadow-2xl animate-bounce-short">
                          🧰
                        </div>
                        <span className="mt-1 inline-block rounded-full bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 shadow-md animate-pulse">
                          TAP TO OPEN! ⭐
                        </span>
                      </div>
                    ) : (
                      <div className="relative flex flex-col items-center opacity-70">
                        {/* Locked Wooden Chest */}
                        <div className="text-6xl filter grayscale-[30%]">
                          📦
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white shadow-md">
                          <Lock className="h-4 w-4" />
                        </div>
                        <span className="mt-2 text-[10px] font-bold text-slate-400">Locked</span>
                      </div>
                    )}
                  </div>

                  {/* Task Description */}
                  <div className="w-full">
                    <h4 className="text-sm font-black text-slate-800 leading-snug min-h-[38px] flex items-center justify-center">
                      {chest.day_task_title}
                    </h4>

                    {/* Reward Pill */}
                    <div className="mt-3 inline-flex items-center gap-1 rounded-xl bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-black text-amber-900">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      <span>+{chest.chest_stars} Stars</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Cheering Mascot Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-purple-100/60 p-4 border border-purple-200">
        <div className="flex items-center gap-3">
          <div className="text-4xl animate-bounce-short">🌈</div>
          <div className="text-left">
            <p className="text-xs font-black text-purple-900">
              Mascot Blobby is cheering for you!
            </p>
            <p className="text-[11px] font-bold text-purple-700">
              Complete each day's quick 5-minute task with mom or dad to unlock the Grand Golden Treasure!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playButtonClick();
            playStarCollect();
            confetti({ particleCount: 40, spread: 50 });
          }}
          className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4 py-2 shadow-md border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 whitespace-nowrap"
        >
          Cheer for Aarav! 📣
        </button>
      </div>


      {/* ========================================================
          CHEST UNLOCK CELEBRATION MODAL
      ======================================================== */}
      {celebrationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border-4 border-amber-400 bg-white p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-90 duration-200 space-y-4">
            
            {/* Glowing Trophy Icon */}
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-300 via-yellow-400 to-orange-400 text-5xl shadow-2xl animate-bounce">
              ⭐
              <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
            </div>

            <div>
              <span className="rounded-full bg-amber-100 border border-amber-300 text-amber-900 px-4 py-1 text-xs font-black uppercase tracking-wider">
                {celebrationData.celebration.badge}
              </span>
              <h3 className="text-3xl font-black text-slate-900 mt-2">
                {celebrationData.celebration.dialog_title}
              </h3>
              <p className="text-xs font-bold text-slate-600 mt-1">
                {celebrationData.message}
              </p>
            </div>

            {/* Reward Box */}
            <div className="grid grid-cols-2 gap-3 bg-amber-50 rounded-2xl p-4 border-2 border-amber-200">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-amber-700">Stars Earned</span>
                <span className="text-2xl font-black text-amber-900">+{celebrationData.awarded_stars} ⭐</span>
              </div>
              <div className="flex flex-col items-center border-l border-amber-200">
                <span className="text-[10px] font-black uppercase text-purple-700">Bonus XP</span>
                <span className="text-2xl font-black text-purple-900">+{celebrationData.awarded_xp} XP</span>
              </div>
            </div>

            {celebrationData.level_up && (
              <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 font-black text-xs shadow-md animate-pulse">
                🏆 LEVEL UP! You are now {celebrationData.level_title} (Level {celebrationData.level})!
              </div>
            )}

            <button
              onClick={() => {
                playStarCollect();
                setCelebrationData(null);
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 py-3.5 font-black text-sm shadow-xl border-b-6 border-amber-600 active:border-b-0 active:translate-y-1 transition-all"
            >
              Collect Rewards & Keep Exploring! 🚀
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
