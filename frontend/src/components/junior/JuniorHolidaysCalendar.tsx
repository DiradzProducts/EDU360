'use client';

import React from 'react';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Sun,
  Flame,
  Star,
  Gift,
  Smile,
  Compass,
  PartyPopper
} from 'lucide-react';

export interface SchoolHolidayEvent {
  id: string;
  title: string;
  dateRange: string;
  month: string;
  type: 'festival' | 'vacation' | 'celebration';
  badgeColor: string;
  icon: string;
  tagline: string;
  daysCount: number;
}

export function JuniorHolidaysCalendar() {
  const holidays: SchoolHolidayEvent[] = [
    {
      id: 'hol-1',
      title: 'Diwali Festival of Lights Break',
      dateRange: '01 Nov – 05 Nov 2026',
      month: 'November 2026',
      type: 'festival',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
      icon: '🪔',
      tagline: 'Light clay diyas, eat sweets, and enjoy family fireworks!',
      daysCount: 5
    },
    {
      id: 'hol-2',
      title: "Children's Day Gala & Magic Show",
      dateRange: '14 Nov 2026 (Friday)',
      month: 'November 2026',
      type: 'celebration',
      badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border-pink-300',
      icon: '🎈',
      tagline: 'No books day! Fun carnival, puppet show & ice cream treat.',
      daysCount: 1
    },
    {
      id: 'hol-3',
      title: 'Winter Snow & New Year Vacation',
      dateRange: '23 Dec 2026 – 02 Jan 2027',
      month: 'December 2026',
      type: 'vacation',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300',
      icon: '❄️',
      tagline: 'Cozy hot chocolate, storybooks, and winter wonderland break!',
      daysCount: 11
    },
    {
      id: 'hol-4',
      title: 'Republic Day Tricolor Celebration',
      dateRange: '26 Jan 2027 (Monday)',
      month: 'January 2027',
      type: 'celebration',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      icon: '🇮🇳',
      tagline: 'National flag hoisting, patriotic songs & cultural parade.',
      daysCount: 1
    },
    {
      id: 'hol-5',
      title: 'Holi Colors Spring Festival',
      dateRange: '24 Mar – 26 Mar 2027',
      month: 'March 2027',
      type: 'festival',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
      icon: '🎨',
      tagline: 'Splash organic flower colors and dance to joyful spring music!',
      daysCount: 3
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl border border-pink-200/80 dark:border-pink-900/60 bg-gradient-to-r from-pink-50 via-amber-50 to-rose-50 dark:from-pink-950/40 dark:via-amber-950/30 dark:to-rose-950/40 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-200/60 dark:bg-pink-900/60 text-pink-900 dark:text-pink-200 text-xs font-black">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>School Fun & Vacations Calendar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Upcoming Holidays & Festivals 🎉
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl font-medium">
            Plan your family trips and celebrate fun school festivals! Here are all the exciting upcoming holidays for CBSE Academic Year 2026-27.
          </p>
        </div>

        {/* Countdown Pill */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-pink-300 dark:border-pink-800 shadow-md shrink-0">
          <span className="text-2xl">🪔</span>
          <div className="text-left">
            <span className="text-[10px] font-black uppercase text-pink-600 dark:text-pink-400 block tracking-wider">
              Next Holiday Coming Up:
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              Diwali Break in 8 Days!
            </span>
          </div>
        </div>
      </div>

      {/* Holiday Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {holidays.map((hol) => (
          <div
            key={hol.id}
            className="group rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-xs group-hover:scale-110 transition-transform">
                  {hol.icon}
                </span>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${hol.badgeColor}`}>
                  {hol.daysCount === 1 ? '1 Fun Day' : `${hol.daysCount} Days Vacation`}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 block">
                  {hol.month}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {hol.title}
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {hol.tagline}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CalendarIcon className="h-3.5 w-3.5 text-pink-500" />
                <span>{hol.dateRange}</span>
              </span>

              <span className="text-pink-600 dark:text-pink-400 text-[11px]">
                No Homework Day 🌟
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
