'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Rocket,
  Sparkles,
  Compass,
  Bus,
  Award,
  FileText,
  Target,
  BarChart,
  Trophy,
  CalendarDays,
  FolderLock,
  Lock,
  Volume2,
  VolumeX,
  Flame,
  Star,
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  LogOut,
  Camera
} from 'lucide-react';
import { User } from '@/lib/types';
import { isSoundEffectsEnabled, toggleSoundEffects, soundEngine, playButtonClick } from '@/lib/sound-effects';

export type JuniorTab =
  | 'launchpad'
  | 'quests'
  | 'booster'
  | 'bus'
  | 'homework'
  | 'exams'
  | 'portfolio'
  | 'timetable'
  | 'profile'
  | 'vault';

export interface JuniorSidebarProps {
  user: User;
  activeTab: JuniorTab;
  onTabChange: (tab: JuniorTab) => void;
  starsCount: number;
  streakDays: number;
  level: number;
  levelTitle: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout?: () => void;
  onSwitchToSecondary?: () => void;
}

export function JuniorSidebar({
  user,
  activeTab,
  onTabChange,
  starsCount,
  streakDays,
  level,
  levelTitle,
  sidebarCollapsed,
  onToggleSidebar,
  onLogout,
  onSwitchToSecondary
}: JuniorSidebarProps) {
  const [soundOn, setSoundOn] = useState<boolean>(true);

  useEffect(() => {
    setSoundOn(isSoundEffectsEnabled());
    const unsub = soundEngine.subscribe((val) => setSoundOn(val));
    return () => unsub();
  }, []);

  const handleSoundToggle = () => {
    const next = toggleSoundEffects();
    setSoundOn(next);
    if (next) {
      soundEngine.playStarCollect();
    }
  };

  const navGroups = [
    {
      title: 'ADVENTURE & QUESTS',
      items: [
        {
          id: 'launchpad' as JuniorTab,
          label: 'Adventure Hub',
          icon: Rocket,
          badge: 'Today',
          color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/60 border-sky-400 text-sky-600 dark:text-sky-400'
        },
        {
          id: 'quests' as JuniorTab,
          label: 'Daily Quests',
          icon: Sparkles,
          badge: '2 Due',
          color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-600 dark:text-amber-400'
        },
        {
          id: 'booster' as JuniorTab,
          label: 'Magic Booster',
          icon: Compass,
          badge: `Lvl ${level}`,
          color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/60 border-pink-400 text-pink-600 dark:text-pink-400'
        },
        {
          id: 'bus' as JuniorTab,
          label: 'Yellow Bus Radar',
          icon: Bus,
          badge: 'Live ETA',
          color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/60 border-yellow-400 text-yellow-700 dark:text-yellow-300'
        }
      ]
    },
    {
      title: 'ACADEMICS & CLASSROOM (PRD)',
      items: [
        {
          id: 'homework' as JuniorTab,
          label: 'Homework & Tasks',
          icon: FileText,
          badge: '2 Pending',
          color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-600 dark:text-amber-400'
        },
        {
          id: 'exams' as JuniorTab,
          label: 'Exams & Results',
          icon: BarChart,
          badge: '88.5%',
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-600 dark:text-blue-400'
        },
        {
          id: 'portfolio' as JuniorTab,
          label: 'Dual Portfolio',
          icon: Trophy,
          badge: 'Verified',
          color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-600 dark:text-indigo-400'
        },
        {
          id: 'timetable' as JuniorTab,
          label: 'Class Timetable',
          icon: CalendarDays,
          badge: '6 Periods',
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-600 dark:text-blue-400'
        }
      ]
    },
    {
      title: 'RECORDS & VAULT (PRD)',
      items: [
        {
          id: 'profile' as JuniorTab,
          label: 'Explorer SIS ID',
          icon: Award,
          badge: '94.2%',
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-600 dark:text-emerald-400'
        },
        {
          id: 'vault' as JuniorTab,
          label: 'Official Documents',
          icon: FolderLock,
          badge: 'View Only',
          color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-800 dark:text-slate-200'
        }
      ]
    }
  ];

  return (
    <aside
      className={`h-full z-20 flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none ${
        sidebarCollapsed ? 'w-[72px]' : 'w-[245px]'
      } bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 border-r border-amber-200/90 dark:border-slate-800 shadow-sm`}
    >
      {/* 1. Class & Junior Identity Header */}
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-inherit">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 shadow-md shrink-0 border-b-2 border-amber-600">
              <span className="text-xl select-none">🦊</span>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sky-400 text-[8px] text-white font-black animate-pulse">
                ★
              </span>
            </div>
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">
                  Oakridge Junior
                </span>
                <span className="rounded-full bg-gradient-to-r from-amber-500 to-pink-500 px-1.5 py-0.2 text-[8px] font-black uppercase text-white shadow-xs">
                  K-5
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                {user.name} • Class 3-A
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 shadow-md border-b-2 border-amber-600">
            <span className="text-xl select-none">🦊</span>
          </div>
        )}

        <button
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            sidebarCollapsed ? 'hidden' : 'block'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Collapse/Expand toggle when in compact mode */}
      {sidebarCollapsed && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs font-semibold select-none scrollbar-thin">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!sidebarCollapsed && (
              <span className="px-2.5 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                {group.title}
              </span>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playButtonClick();
                      onTabChange(item.id);
                    }}
                    title={item.label}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'border-l-4 border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:border-amber-400 dark:text-amber-200 font-bold shadow-xs'
                        : 'border-l-4 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isActive ? 'scale-110 text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!sidebarCollapsed && item.badge && (
                      <span
                        className={`ml-1 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                          isActive
                            ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom Gamification Stats & Controls */}
      <div className="p-2.5 border-t border-inherit space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
        {!sidebarCollapsed ? (
          <>
            {/* Gamification Chips (Streak & Stars) */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Streak */}
              <div
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-orange-600 dark:text-orange-400"
                title={`${streakDays}-Day Attendance Fire Streak`}
              >
                <Flame className="h-4 w-4 fill-orange-400 text-orange-500 animate-pulse shrink-0" />
                <div className="flex flex-col text-left leading-none truncate">
                  <span className="text-xs font-black">{streakDays}</span>
                  <span className="text-[8px] font-bold uppercase tracking-tight opacity-80">Streak</span>
                </div>
              </div>

              {/* Stars */}
              <div
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300"
                title={`${starsCount} Shiny Stars`}
              >
                <Star className="h-4 w-4 fill-amber-400 text-amber-500 shrink-0" />
                <div className="flex flex-col text-left leading-none truncate">
                  <span className="text-xs font-black">{starsCount}</span>
                  <span className="text-[8px] font-bold uppercase tracking-tight opacity-80">Stars</span>
                </div>
              </div>
            </div>

            {/* Audio SFX Toggle & Explorer Level Row */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              {/* Audio Toggle */}
              <button
                onClick={handleSoundToggle}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  soundOn
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
                title={soundOn ? 'Sound Effects Active (Click to Mute)' : 'Sound Effects Muted (Click to Unmute)'}
              >
                {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span>{soundOn ? 'Audio ON' : 'Muted'}</span>
              </button>

              {/* Level Badge */}
              <div
                className="px-2 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[10px] font-black flex items-center gap-1 shrink-0"
                title={`Level ${level}: ${levelTitle}`}
              >
                <Shield className="h-3 w-3 fill-purple-200" />
                <span>Lvl {level}</span>
              </div>
            </div>

            {/* Secondary View Switcher */}
            {onSwitchToSecondary && (
              <button
                onClick={() => {
                  playButtonClick();
                  onSwitchToSecondary();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold transition-all cursor-pointer"
                title="Switch to Secondary (Grades 6-12) View"
              >
                <ArrowRightLeft className="h-3 w-3" />
                <span>Secondary (6-12) View</span>
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <button
              onClick={handleSoundToggle}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundOn
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
              title={soundOn ? 'Sound Effects Active' : 'Sound Effects Muted'}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <div
              className="flex items-center justify-center h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 text-[10px] font-black"
              title={`${starsCount} Stars`}
            >
              ★
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
