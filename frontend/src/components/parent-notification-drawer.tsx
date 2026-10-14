'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  AlertCircle, 
  CreditCard, 
  Target, 
  FileText, 
  CheckCircle2, 
  Clock, 
  X, 
  ChevronRight, 
  Trash2,
  Calendar
} from 'lucide-react';

export interface ParentNotification {
  id: string;
  level: 'red' | 'orange' | 'purple' | 'blue';
  title: string;
  category: 'Absence & Attendance' | 'Fee Payment' | 'Pedagogical Remark' | 'Exam Marks';
  description: string;
  timestamp: string;
  actionLabel: string;
  targetTab: 'leave' | 'fees' | 'focus' | 'marks' | 'child_sis' | 'ptm_connect';
  unread: boolean;
}

interface ParentNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  notifications: ParentNotification[];
  onDismissNotification: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function ParentNotificationDrawer({
  isOpen,
  onClose,
  onNavigateTab,
  notifications,
  onDismissNotification,
  onMarkAllAsRead
}: ParentNotificationDrawerProps) {
  const [filter, setFilter] = useState<'all' | 'red' | 'orange' | 'purple'>('all');

  // Close on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filter === 'red') return n.level === 'red';
    if (filter === 'orange') return n.level === 'orange';
    if (filter === 'purple') return n.level === 'purple';
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>High-Signal Push Alerts</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-600 text-white text-[10px] font-black px-2 py-0.5">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Urgent alerts for Aarav Sharma (Class 8B)
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filter Pills & Mark Read */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('red')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  filter === 'red'
                    ? 'bg-red-600 text-white'
                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                }`}
              >
                🔴 Urgent
              </button>
              <button
                onClick={() => setFilter('orange')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  filter === 'orange'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                🟠 Fees
              </button>
              <button
                onClick={() => setFilter('purple')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  filter === 'purple'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                🟣 Academic
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark read
              </button>
            )}
          </div>
        </div>

        {/* Notifications Scroll Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500/80" />
              <p className="text-xs font-bold">No active push alerts in this category</p>
            </div>
          ) : (
            filtered.map((item) => {
              const isRed = item.level === 'red';
              const isOrange = item.level === 'orange';
              const isPurple = item.level === 'purple';
              const isBlue = item.level === 'blue';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    isRed
                      ? 'border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30'
                      : isOrange
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30'
                      : isPurple
                      ? 'border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30'
                      : 'border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${
                        isRed ? 'bg-red-500 animate-ping' : isOrange ? 'bg-amber-500' : 'bg-purple-500'
                      }`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isRed ? 'text-red-700 dark:text-red-400' : isOrange ? 'text-amber-700 dark:text-amber-400' : 'text-purple-700 dark:text-purple-400'
                      }`}>
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                      <button
                        onClick={() => onDismissNotification(item.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Dismiss alert"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {item.description}
                  </p>

                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onNavigateTab(item.targetTab);
                        onClose();
                      }}
                      className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95 ${
                        isRed 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : isOrange 
                          ? 'bg-amber-600 hover:bg-amber-700' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      <span>{item.actionLabel}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Footer Info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>High-Signal alerts sync automatically with school SIS</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 dark:text-slate-300 hover:underline"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
}
