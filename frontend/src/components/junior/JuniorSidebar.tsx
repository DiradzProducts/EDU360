'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  Compass,
  CalendarDays,
  Video,
  BookOpen,
  Trophy,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { User } from '@/lib/types';
import { isSoundEffectsEnabled, toggleSoundEffects, soundEngine, playButtonClick } from '@/lib/sound-effects';

export type JuniorTab =
  | 'dashboard'
  | 'adventures'
  | 'timetable'
  | 'recordings'
  | 'homework'
  | 'exams'
  | 'badges'
  | 'holidays'
  | 'profile'
  | 'launchpad'
  | 'quests'
  | 'booster'
  | 'creative'
  | 'bus'
  | 'portfolio'
  | 'vault';

export interface JuniorSidebarProps {
  user: User;
  activeTab: JuniorTab;
  onTabChange: (tab: JuniorTab) => void;
  starsCount?: number;
  streakDays?: number;
  level?: number;
  levelTitle?: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout?: () => void;
  onSwitchToSecondary?: () => void;
}

export function JuniorSidebar({
  user,
  activeTab,
  onTabChange,
  starsCount = 340,
  streakDays = 5,
  level = 5,
  levelTitle = 'Explorer',
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

  const navItems = [
    {
      id: 'dashboard' as JuniorTab,
      label: 'Explorer Dashboard',
      iconImg: '/junior/extracted/icon_dashboard.png',
      iconEmoji: '🏠'
    },
    {
      id: 'adventures' as JuniorTab,
      label: 'Daily Quests',
      iconImg: '/junior/extracted/icon_quests.png',
      iconEmoji: '🏆'
    },
    {
      id: 'timetable' as JuniorTab,
      label: 'Timetable',
      iconImg: '/junior/extracted/icon_timetable.png',
      iconEmoji: '🗓️'
    },
    {
      id: 'recordings' as JuniorTab,
      label: 'Video Replays',
      iconImg: '/junior/extracted/icon_replays.png',
      iconEmoji: '📺'
    },
    {
      id: 'homework' as JuniorTab,
      label: 'Homework',
      iconImg: '/junior/extracted/icon_homework.png',
      iconEmoji: '📝'
    },
    {
      id: 'badges' as JuniorTab,
      label: 'Trophy Room',
      iconImg: '/junior/extracted/icon_trophy.png',
      iconEmoji: '🏆'
    }
  ];

  return (
    <aside
      className={`h-full z-20 flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none ${
        sidebarCollapsed ? 'w-[76px]' : 'w-[230px]'
      } bg-[#FFFDEB] dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 border-r-2 border-amber-200 dark:border-slate-800 shadow-xl`}
    >
      {/* 1. Header: EDU360 Student Portal Logo from Reference */}
      <div className="flex h-16 items-center justify-between px-3 border-b border-amber-200/40 dark:border-slate-800">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden py-1">
            <img
              src="/junior/extracted/edu360_monkey_logo.png"
              alt="EDU360 Student Portal"
              className="h-10 w-auto object-contain drop-shadow-xs"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 shadow-md border border-amber-500">
            <span className="text-xl select-none">🐵</span>
          </div>
        )}

        <button
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-amber-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            sidebarCollapsed ? 'hidden' : 'block'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

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

      {/* 2. Flat List of 6 Nav Items matching target reference */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5 text-xs font-bold select-none">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.id ||
            (item.id === 'adventures' && activeTab === 'quests') ||
            (item.id === 'badges' && (activeTab === 'booster' || activeTab === 'creative'));

          return (
            <button
              key={item.id}
              onClick={() => {
                playButtonClick();
                onTabChange(item.id);
              }}
              title={item.label}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FDE047] text-slate-950 font-black shadow-md shadow-amber-300/40 ring-1 ring-amber-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-amber-100/50 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white font-bold'
              }`}
            >
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                isActive ? 'bg-orange-500/10' : 'bg-transparent'
              }`}>
                <img
                  src={item.iconImg}
                  alt={item.label}
                  className="h-5 w-5 object-contain"
                  onError={(e) => {
                    // Fallback to emoji if image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              {!sidebarCollapsed && <span className="truncate tracking-tight font-black">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* 3. Bottom Mascot: Baby Monkey holding bamboo behind fence */}
      {!sidebarCollapsed && (
        <div className="relative px-2 pt-1 pb-2 select-none pointer-events-none flex justify-center">
          <img
            src="/junior/extracted/sidebar_monkey_mascot.png"
            alt="Mascot holding bamboo"
            className="w-full max-h-48 object-contain drop-shadow-md transition-transform hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* 4. Bottom Sound Effects Toggle */}
      <div className="p-2.5 border-t border-amber-200/50 dark:border-slate-800 bg-amber-50/40 dark:bg-slate-900/40">
        {!sidebarCollapsed ? (
          <button
            onClick={handleSoundToggle}
            className={`w-full rounded-xl py-1.5 px-2.5 text-[11px] font-black flex items-center justify-center gap-1.5 border shadow-2xs transition-all active:scale-95 cursor-pointer ${
              soundOn
                ? 'bg-[#ECFDF5] hover:bg-[#D1FAE5] dark:bg-emerald-950/40 border-[#A7F3D0] dark:border-emerald-800 text-[#059669] dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title={soundOn ? 'Sound Effects Active (Click to Mute)' : 'Sound Effects Muted (Click to Unmute)'}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Sound: {soundOn ? 'ON' : 'OFF'}</span>
          </button>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleSoundToggle}
              className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300"
              title="Sound Effects"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 5. Bottom Sign Out Button */}
      {onLogout && (
        <div className="p-2 border-t border-amber-200/40 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          {!sidebarCollapsed ? (
            <button
              onClick={() => {
                playButtonClick();
                onLogout();
              }}
              className="w-full rounded-xl py-1.5 px-2.5 text-[11px] font-black flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Sign Out of Junior Portal"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  playButtonClick();
                  onLogout();
                }}
                className="p-1.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:scale-105 transition-transform cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

