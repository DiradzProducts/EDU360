'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  AlertOctagon,
  FileText, 
  Sparkles, 
  Award, 
  ExternalLink, 
  X,
  Layers,
  ShieldCheck,
  Video,
  CreditCard,
  Calendar,
  TrendingDown,
  Users
} from 'lucide-react';
import { api } from '@/lib/api';
import { NotificationItem } from '@/lib/types';

interface NotificationCenterProps {
  userId?: number;
  role?: string;
  onNavigate?: (url: string) => void;
  className?: string;
}

export function NotificationCenter({
  userId,
  role,
  onNavigate,
  className = ''
}: NotificationCenterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications({ user_id: userId, role });
      setUnreadCount(res.unread_count);
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, [userId, role]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (notifId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead({ user_id: userId, role });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.action_url) {
      if (onNavigate) {
        onNavigate(notif.action_url);
      } else {
        router.push(notif.action_url);
      }
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recent';
    }
  };

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const getTypeIcon = (type: string, priority: string) => {
    if (priority === 'CRITICAL') {
      return <AlertOctagon className="h-4 w-4 text-rose-600 animate-pulse" />;
    }
    if (priority === 'URGENT') {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
    switch (type) {
      case 'LIVE_CLASS_COUNTDOWN':
        return <Video className="h-4 w-4 text-blue-500" />;
      case 'FEE_OVERDUE':
      case 'PAYMENT_RECEIVED':
      case 'EXAM_HOLD_TRIGGERED':
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case 'PROXY_ASSIGNED':
      case 'UNMANNED_PERIOD':
        return <Calendar className="h-4 w-4 text-indigo-500" />;
      case 'PACING_LAG_CRITICAL':
        return <TrendingDown className="h-4 w-4 text-rose-500" />;
      case 'VIP_REFERRAL':
      case 'NEW_ENROLMENT':
      case 'TOUR_SCHEDULED':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'QP_ASSIGNED':
      case 'QP_SUBMITTED':
      case 'QP_REVISION':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'QP_APPROVED':
      case 'QP_IN_VAULT':
      case 'MODERATION_START':
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case 'TASK_ASSIGNED':
      case 'TASK_RELIEF_REQUESTED':
        return <Layers className="h-4 w-4 text-blue-500" />;
      case 'REMEDIAL_ALERT':
      case 'REMEDIAL_SUBMISSION':
      case 'REMEDIAL_DAY_READY':
      case 'FOCUS_PLAN_REVIEW':
        return <Award className="h-4 w-4 text-amber-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs flex items-center justify-center"
        title="View Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold">
                <Bell className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Notifications
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-all cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Close notifications"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pt-2.5 pb-1 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-2 font-bold transition-all cursor-pointer relative ${
                activeTab === 'all'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`pb-2 font-bold transition-all cursor-pointer relative ${
                activeTab === 'unread'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircleIcon className="h-8 w-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {activeTab === 'unread' ? 'No pending unread alerts.' : 'New task assignments and exam alerts will appear here.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    !notif.is_read ? 'bg-purple-50/30 dark:bg-purple-950/20' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {getTypeIcon(notif.notification_type, notif.priority)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs truncate ${!notif.is_read ? 'font-black text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 font-mono">
                        <Clock className="h-2.5 w-2.5" />
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        From: <strong className="text-slate-600 dark:text-slate-300">{notif.sender_name}</strong>
                      </span>

                      {notif.action_url && (
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline">
                          <span>Open</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {!notif.is_read && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      className="mt-1 p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-all cursor-pointer"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Note */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] font-semibold text-slate-400">
              EDU360 Real-Time Event &amp; Notification Engine
            </span>
          </div>

        </div>
      )}
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
