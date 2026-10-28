'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Sparkles,
  Star,
  Gift,
  Trophy,
  Check,
  CheckCheck,
  X,
  ChevronRight,
  Flame,
  Rocket,
  Palette,
  BookOpen,
  Calendar,
  Volume2
} from 'lucide-react';
import { JuniorTab } from './JuniorSidebar';
import { playButtonClick, playStarCollect, playFanfare } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

export interface JuniorAlert {
  id: number;
  title: string;
  message: string;
  category: 'reward' | 'quest' | 'classroom' | 'trophy' | 'announcement';
  emoji: string;
  starReward?: number;
  isClaimed?: boolean;
  isRead: boolean;
  timeAgo: string;
  actionTab?: JuniorTab;
  actionLabel?: string;
  teacherReaction?: string;
}

const initialJuniorAlerts: JuniorAlert[] = [
  {
    id: 1,
    title: "Super Star! ⭐ Rated by Ms. Priya",
    message: "Ms. Priya reviewed your 'Animals & Nature' drawing and gave it a 5-Star badge on the creative wall!",
    category: 'reward',
    emoji: "🎨",
    starReward: 25,
    isClaimed: false,
    isRead: false,
    timeAgo: "10m ago",
    actionTab: 'creative',
    actionLabel: "View on Creative Wall",
    teacherReaction: "Creative Genius! 🎨 - Ms. Priya"
  },
  {
    id: 2,
    title: "Golden Mystery Chest Ready! 💎",
    message: "Your Day 2 Phonics Quest was verified by teacher. Unlock your mystery treasure chest now!",
    category: 'trophy',
    emoji: "🎁",
    starReward: 30,
    isClaimed: false,
    isRead: false,
    timeAgo: "25m ago",
    actionTab: 'badges',
    actionLabel: "Open Magic Chest",
    teacherReaction: "Day 2 Task Approved ✓"
  },
  {
    id: 3,
    title: "Next Class: Magical Numbers Castle 🏰",
    message: "Mrs. Ananya Verma's Period 2 Mathematics live adventure starts in 15 mins in Tower 2!",
    category: 'classroom',
    emoji: "🚀",
    isRead: false,
    timeAgo: "40m ago",
    actionTab: 'dashboard',
    actionLabel: "Launch Live Stream",
    teacherReaction: "Room 204 • Seat Ready"
  },
  {
    id: 4,
    title: "English Phonics Homework Mission 🦁",
    message: "Chapter 2 'Rhyming Words' workbook task is waiting for your magic pencil. Complete before 4 PM!",
    category: 'quest',
    emoji: "📝",
    starReward: 15,
    isClaimed: false,
    isRead: false,
    timeAgo: "1h ago",
    actionTab: 'homework',
    actionLabel: "Open Homework Hub",
    teacherReaction: "Assigned by Ms. Priya"
  },
  {
    id: 5,
    title: "Yellow Bus Route #1 Started 🚍",
    message: "Driver Ramesh has completed the morning pickup route. Have a wonderful day at campus!",
    category: 'announcement',
    emoji: "🚌",
    isRead: true,
    timeAgo: "3h ago",
    actionTab: 'profile',
    actionLabel: "Check Bus Radar"
  }
];

interface JuniorNotificationDropdownProps {
  studentName?: string;
  onNavigateTab: (tab: JuniorTab) => void;
  onEarnStars: (stars: number) => void;
  onShowToast: (message: string) => void;
}

export function JuniorNotificationDropdown({
  studentName = 'Aarav Kumar',
  onNavigateTab,
  onEarnStars,
  onShowToast
}: JuniorNotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<JuniorAlert[]>(initialJuniorAlerts);
  const [activeFilter, setActiveFilter] = useState<'all' | 'reward' | 'quest' | 'classroom'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Unread count
  const unreadCount = alerts.filter(a => !a.isRead).length;
  // Unclaimed stars count
  const unclaimedStars = alerts.reduce((acc, a) => (!a.isClaimed && a.starReward ? acc + a.starReward : acc), 0);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    playButtonClick();
    setIsOpen(prev => !prev);
  };

  const handleMarkAllRead = () => {
    playButtonClick();
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    onShowToast("✨ All alerts marked as read!");
  };

  const handleClaimStars = (alertId: number, stars: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playStarCollect();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#F59E0B', '#FBBF24', '#34D399', '#60A5FA', '#EC4899']
      });
    } catch {
      // Ignore
    }

    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId ? { ...a, isClaimed: true, isRead: true } : a
      )
    );
    onEarnStars(stars);
    onShowToast(`⭐ Woohoo! +${stars} Stars Banked to your Treasure Room!`);
  };

  const handleAlertClick = (alert: JuniorAlert) => {
    playButtonClick();
    // Mark as read
    setAlerts(prev =>
      prev.map(a => (a.id === alert.id ? { ...a, isRead: true } : a))
    );
    setIsOpen(false);

    if (alert.actionTab) {
      onNavigateTab(alert.actionTab);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'reward') return a.category === 'reward' || a.category === 'trophy';
    if (activeFilter === 'quest') return a.category === 'quest';
    if (activeFilter === 'classroom') return a.category === 'classroom' || a.category === 'announcement';
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 1. BELL TRIGGER BUTTON WITH GAMIFIED GLOW */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/95 border-2 border-amber-300 dark:border-amber-600/50 shadow-sm text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer group hover:border-amber-400"
        title="Adventure Mailbox & Alerts"
        aria-label="Open Notifications"
      >
        <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform duration-200" />

        {/* Unread Badge / Gamified Star Pill */}
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-black text-[10px] shadow-md border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        ) : (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500" />
        )}
      </button>

      {/* 2. GAMIFIED TOY-BOX NOTIFICATION DROPDOWN */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-40 sm:hidden bg-slate-900/30 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2.5 w-[330px] sm:w-[410px] rounded-3xl border-3 border-amber-300 dark:border-amber-500/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header: Cheerful Wooden & Honey Theme */}
            <div className="relative p-3.5 sm:p-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 dark:text-amber-900 border-b-2 border-amber-500/30 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/90 text-lg shadow-sm border border-amber-200">
                    📬
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black text-slate-950 dark:text-white leading-tight">
                        Adventure Mailbox
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black shadow-xs">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-amber-900/80 dark:text-amber-200/90">
                      Quests, Teacher Badges & Star Rewards
                    </p>
                  </div>
                </div>

                {/* Mark All Read & Close */}
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-amber-900 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      title="Mark all as read"
                    >
                      <CheckCheck className="h-3 w-3" />
                      <span className="hidden sm:inline">Clear All</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Close Mailbox"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Unclaimed Stars Banner */}
              {unclaimedStars > 0 && (
                <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-50/95 dark:bg-slate-900/90 border border-amber-300 dark:border-amber-600/60 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-300">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>{unclaimedStars} Stars Waiting to be Claimed!</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 animate-pulse">
                    Tap to Claim 👇
                  </span>
                </div>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50/50 dark:bg-slate-800/40 border-b border-amber-200/60 dark:border-slate-800 overflow-x-auto no-scrollbar">
              <button
                onClick={() => { playButtonClick(); setActiveFilter('all'); }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-amber-500 text-white shadow-xs scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700'
                }`}
              >
                🌟 All ({alerts.length})
              </button>
              <button
                onClick={() => { playButtonClick(); setActiveFilter('reward'); }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === 'reward'
                    ? 'bg-amber-500 text-white shadow-xs scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700'
                }`}
              >
                ⭐ Rewards ({alerts.filter(a => a.category === 'reward' || a.category === 'trophy').length})
              </button>
              <button
                onClick={() => { playButtonClick(); setActiveFilter('quest'); }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === 'quest'
                    ? 'bg-amber-500 text-white shadow-xs scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700'
                }`}
              >
                🎯 Quests ({alerts.filter(a => a.category === 'quest').length})
              </button>
              <button
                onClick={() => { playButtonClick(); setActiveFilter('classroom'); }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === 'classroom'
                    ? 'bg-amber-500 text-white shadow-xs scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700'
                }`}
              >
                🚀 Classes ({alerts.filter(a => a.category === 'classroom' || a.category === 'announcement').length})
              </button>
            </div>

            {/* Notification Scrollable List */}
            <div className="max-h-[350px] sm:max-h-[380px] overflow-y-auto p-2.5 sm:p-3 space-y-2.5">
              {filteredAlerts.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="text-3xl">🦊✨</div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                    All Clear, Champion!
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    No alerts in this drawer. Sparky is cheering for you on your next class adventure!
                  </p>
                </div>
              ) : (
                filteredAlerts.map(alert => {
                  return (
                    <div
                      key={alert.id}
                      onClick={() => handleAlertClick(alert)}
                      className={`relative rounded-2xl p-3 border-2 transition-all cursor-pointer group active:scale-[0.99] ${
                        alert.isRead
                          ? 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700'
                          : 'bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-pink-50/30 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-slate-800/80 border-amber-300 dark:border-amber-500/40 shadow-xs'
                      }`}
                    >
                      {/* Unread Glow Indicator */}
                      {!alert.isRead && (
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-300 animate-pulse" />
                      )}

                      <div className="flex items-start gap-2.5">
                        {/* Avatar/Category Emoji */}
                        <div className="h-9 w-9 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 flex items-center justify-center text-lg shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                          {alert.emoji}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                              {alert.title}
                            </h4>
                          </div>

                          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                            {alert.message}
                          </p>

                          {/* Teacher Reaction Tag */}
                          {alert.teacherReaction && (
                            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[9px] font-bold">
                              <span>💬</span>
                              <span>{alert.teacherReaction}</span>
                            </div>
                          )}

                          {/* Action Row: Timestamp & Claim Button / Jump Link */}
                          <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                              {alert.timeAgo}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Claim Stars Button */}
                              {alert.starReward && (
                                alert.isClaimed ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1">
                                    <Check className="h-3 w-3" />
                                    <span>Claimed ✓</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => handleClaimStars(alert.id, alert.starReward!, e)}
                                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white text-[10px] font-black shadow-xs border-b-2 border-orange-700 active:border-b-0 active:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer animate-bounce"
                                    style={{ animationDuration: '2.5s' }}
                                    title="Click to claim stars!"
                                  >
                                    <Star className="h-3 w-3 fill-white text-white" />
                                    <span>Claim +{alert.starReward} ⭐</span>
                                  </button>
                                )
                              )}

                              {/* Action Link */}
                              {alert.actionLabel && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline group-hover:translate-x-0.5 transition-transform">
                                  <span>{alert.actionLabel}</span>
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with Cheer Quote */}
            <div className="p-2.5 px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-950 border-t border-amber-200/60 dark:border-slate-800 text-center">
              <p className="text-[10px] font-black text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5">
                <span>🌈</span>
                <span>Keep learning & growing, {studentName}! 🚀</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
