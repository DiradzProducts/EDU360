'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  UserPlus, 
  School, 
  ChevronDown,
  Layers,
  FileEdit,
  Clock,
  Target,
  MessageSquare,
  Bus,
  CreditCard,
  Video,
  Trophy,
  Lock,
  Bell,
  Sun,
  Moon,
  Calendar,
  Award,
  CheckCircle2,
  X,
  ExternalLink,
  User
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { UserRole } from '@/lib/types';

interface NotificationItem {
  id: string;
  category: 'academic' | 'events' | 'transport' | 'admin';
  title: string;
  description: string;
  time: string;
  unread: boolean;
  targetModule: string;
  icon: any;
  color: string;
}

import { MarketingNavbar } from '@/components/marketing-navbar';

export function Navbar() {
  const pathname = usePathname();

  // If on public marketing landing page, strictly render the dedicated Public Marketing Navbar
  if (pathname === '/') {
    return <MarketingNavbar />;
  }

  const router = useRouter();
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'academic' | 'events' | 'transport'>('all');

  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([
    {
      id: '1',
      category: 'academic',
      title: 'UT-2 Maths Marks Published',
      description: 'Mrs. Ananya Verma posted evaluation. You scored 46/50 (A+). Class Rank #4.',
      time: '12m ago',
      unread: true,
      targetModule: 'exams',
      icon: Award,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: '2',
      category: 'academic',
      title: 'Worksheet 4.2 Pending Submission',
      description: 'Quadratic Equations Exercise 4.2 deadline is tomorrow, 11:59 PM.',
      time: '45m ago',
      unread: true,
      targetModule: 'homework',
      icon: BookOpen,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
    },
    {
      id: '3',
      category: 'transport',
      title: 'Bus Route 14 Static Schedule',
      description: 'Morning pickup at HDFC Circle confirmed at 7:45 AM. Bus #14 · Route 4-B.',
      time: '1h ago',
      unread: false,
      targetModule: 'profile',
      icon: Bus,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
    },
    {
      id: '4',
      category: 'events',
      title: 'Annual Sports Meet 2026',
      description: 'Track & field registrations closing Friday. Event marked on calendar.',
      time: '2h ago',
      unread: false,
      targetModule: 'calendar',
      icon: Calendar,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
    }
  ]);

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const unreadCount = notificationsList.filter(n => n.unread).length;

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark this notification as read
    setNotificationsList(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
    setShowNotifications(false);

    // If currently on student page, dispatch custom navigation event
    if (pathname.startsWith('/student')) {
      window.dispatchEvent(new CustomEvent('edu360-navigate', { detail: item.targetModule }));
    } else {
      router.push(`/student?tab=${item.targetModule}`);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Role-specific navigation links for other portals
  const roleNavItems: Record<UserRole, { label: string; href: string; icon: any }[]> = {
    teacher: [
      { label: 'Inline Grading', href: '/teacher', icon: FileEdit },
      { label: 'Auto-Attendance', href: '/teacher', icon: Clock },
      { label: 'Focus Table', href: '/teacher', icon: Target },
      { label: 'Parent Hub', href: '/teacher', icon: MessageSquare }
    ],
    admin: [
      { label: 'Priority Triage', href: '/admin', icon: Layers },
      { label: 'Admissions CRM', href: '/admin', icon: Users },
      { label: 'SIS Vault', href: '/admin', icon: Lock },
      { label: 'Exit Clearance', href: '/admin', icon: ShieldCheck }
    ],
    parent: [
      { label: 'Child Overview', href: '/parent', icon: Sparkles },
      { label: 'Focus Table', href: '/parent', icon: Target },
      { label: 'Live Bus GPS', href: '/parent', icon: Bus },
      { label: 'Fees & Receipts', href: '/parent', icon: CreditCard }
    ],
    student: [
      { label: 'Live Classes & LMS', href: '/student', icon: Video },
      { label: 'Portfolio', href: '/student', icon: Trophy },
      { label: 'Homework', href: '/student', icon: BookOpen },
      { label: 'Official Vault', href: '/student', icon: Lock }
    ]
  };

  const navItems = roleNavItems[role] || roleNavItems.teacher;

  const roleColors: Record<UserRole, { badge: string; pill: string }> = {
    teacher: { badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', pill: 'text-emerald-700 dark:text-emerald-400' },
    admin: { badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800', pill: 'text-blue-700 dark:text-blue-400' },
    parent: { badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800', pill: 'text-amber-700 dark:text-amber-400' },
    student: { badge: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800', pill: 'text-purple-700 dark:text-purple-400' }
  };

  const currentTheme = roleColors[role] || roleColors.teacher;

  const filteredNotifications = notificationsList.filter(n => {
    if (notificationFilter === 'all') return true;
    return n.category === notificationFilter;
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors duration-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href={`/${role}`} className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white shadow-md shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EDU<span className="text-blue-600 dark:text-blue-400">360</span></span>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  {role.toUpperCase()} PORTAL
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Action &amp; Intelligence Platform</p>
            </div>
          </Link>
        </div>

        {/* Center: Role-Specific Navigation (Hidden on portals with dedicated left sidebars to avoid double navigation) */}
        {!isAuthPage && user && !pathname.startsWith('/student') && !pathname.startsWith('/parent') && !pathname.startsWith('/teacher') && !pathname.startsWith('/admin') && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl p-1 border border-slate-200 dark:border-slate-700">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all shadow-xs"
                >
                  <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Section: Theme Toggle, Notifications, Authenticated User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* THEME TOGGLE BUTTON (Dark / Light) */}
          <button
            type="button"
            id="navbar-theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* NOTIFICATIONS BELL & FLYOUT */}
          {!isAuthPage && user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                title="Notifications"
                className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors shadow-xs ${
                  showNotifications
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Panel Header */}
                  <div className="p-3.5 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Institutional Notifications</span>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.2 text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 p-2 bg-slate-50/30 dark:bg-slate-900/50 text-[11px] overflow-x-auto">
                    {(['all', 'academic', 'events', 'transport'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setNotificationFilter(cat)}
                        className={`capitalize px-2.5 py-1 rounded-lg font-bold transition-all ${
                          notificationFilter === cat
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications in this category.
                      </div>
                    ) : (
                      filteredNotifications.map((n) => {
                        const Icon = n.icon;
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-3 ${
                              n.unread ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                            }`}
                          >
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${n.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-xs font-bold truncate ${n.unread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {n.title}
                                </span>
                                <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                                {n.description}
                              </p>
                              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                <span>Navigate to module</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </div>
                            </div>
                            {n.unread && (
                              <span className="h-2 w-2 rounded-full bg-blue-600 mt-1 shrink-0"></span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Panel Footer */}
                  <div className="p-2.5 text-center bg-slate-50/70 dark:bg-slate-850">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Notifications synced in real time via EDU360 WebSocket
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile & Sign Out Dropdown */}
          {isAuthPage || !user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  pathname === '/login'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  pathname === '/register'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 p-1.5 pr-3 shadow-xs transition-colors"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                  alt={user.name}
                  className="h-8 w-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </span>
                  <span className={`text-[10px] font-bold capitalize flex items-center gap-1 ${currentTheme.pill}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {user.role} Account
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Profile & Security Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl z-50 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                        alt={user.name}
                        className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{user.name}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">{user.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Session Status:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Active &bull; {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {user.role === 'student' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          if (pathname.startsWith('/student')) {
                            window.dispatchEvent(new CustomEvent('edu360-navigate', { detail: 'profile' }));
                          } else {
                            router.push('/student?tab=profile');
                          }
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        <span>View SIS Profile Dossier</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span>Sign Out / Lock Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
