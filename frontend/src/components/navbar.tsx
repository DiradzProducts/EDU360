'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

import { NotificationCenter } from '@/components/notification-center';
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

  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-md transition-colors duration-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo & Uniform Role Pill */}
        <div className="flex items-center gap-3">
          <Link href={`/${role}`} className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white shadow-md shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EDU<span className="text-blue-600 dark:text-blue-400">360</span></span>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 tracking-wide uppercase">
                  {role.replace('_', ' ')} PORTAL
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Action &amp; Intelligence Platform</p>
            </div>
          </Link>
        </div>

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
            <NotificationCenter
              userId={user.id}
              role={role || undefined}
              onNavigate={(url) => {
                router.push(url);
                window.dispatchEvent(new CustomEvent('edu360-navigate-url', { detail: url }));
              }}
            />
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
                  <span className="text-[10px] font-bold capitalize flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {user.role.replace('_', ' ')} Account
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
