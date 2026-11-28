
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  User,
  AlertTriangle,
  Search,
  Palette as PaletteIcon,
  Check
} from 'lucide-react';
import { CommandPalette } from '@/components/command-palette';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

import { NotificationCenter } from '@/components/notification-center';
import { MarketingNavbar } from '@/components/marketing-navbar';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme, palette, setPalette, palettes, currentPaletteInfo } = useTheme();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('#navbar-palette-container')) {
        setShowPaletteMenu(false);
      }
    };
    if (showPaletteMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showPaletteMenu]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If on public marketing landing page, strictly render the dedicated Public Marketing Navbar
  if (pathname === '/') {
    return <MarketingNavbar />;
  }

  // If in junior student portal (K-5), the junior dashboard renders its own full-screen illustrated theme
  if (pathname === '/junior' || (mounted && pathname === '/student' && (user?.grade_tier === 'k5' || user?.is_junior_k5 || user?.id === 5 || user?.student_id === 6))) {
    return null;
  }

  const isAuthPage = pathname === '/login' || pathname?.startsWith('/login/') || pathname === '/register' || pathname?.startsWith('/register/');

  // Dedicated Clean Auth Navbar for Login & Registration screens
  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 w-full h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-md transition-colors duration-150">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left: Brand Logo (EDU360 • K-12 Intelligence, Action & Outcomes Platform) */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    EDU<span className="text-indigo-600 dark:text-indigo-400">360</span>
                  </span>
                  <span className="hidden xs:inline-flex sm:inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                    K–12 Intelligence
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">Action &amp; Outcomes Platform</p>
              </div>
            </Link>
          </div>

          {/* Center: Clean whitespace, NO search bar, NO portal text */}
          <div className="flex-1" />

          {/* Right: Theme Toggle & Navigation Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button (Dark / Light) */}
            <button
              type="button"
              id="auth-navbar-theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Navigation Buttons: Register / Sign In + Explore Platform */}
            {pathname?.startsWith('/register') ? (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 shadow-2xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs shadow-indigo-600/20"
                >
                  <span>Explore Platform</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 shadow-2xs"
                >
                  Register
                </Link>
                <Link
                  href="/"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs shadow-indigo-600/20"
                >
                  <span>Explore Platform</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  const safeRole = mounted && role ? role : '';
  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-slate-200/80 bg-white/95 text-slate-900 dark:border-slate-800 dark:bg-[#0B0F19]/95 dark:text-white backdrop-blur-md transition-colors duration-150">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo & Uniform Role Pill */}
        <div className="flex items-center gap-3">
          <Link href={mounted && user ? `/${safeRole || role}` : '/'} className="group flex items-center gap-2.5 rounded-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary via-indigo-600 to-blue-500 text-primary-foreground shadow-md shadow-primary/25 transition-transform duration-150 group-hover:scale-105">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EDU<span className="text-blue-600 dark:text-blue-400">360</span></span>
                {mounted && user && (
                  <span
                    suppressHydrationWarning
                    className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 tracking-wide uppercase"
                  >
                    {safeRole ? `${safeRole.replace('_', ' ')} PORTAL` : `${(role || '').replace('_', ' ')} PORTAL`}
                  </span>
                )}
              </div>
              <p className="hidden sm:block text-xs font-medium text-slate-500 dark:text-slate-400">Action &amp; Intelligence Platform</p>
            </div>
          </Link>
        </div>

        {/* Center: Global Omnisearch / Command Palette Trigger */}
        {mounted && user ? (
          <div className="flex-1 max-w-lg mx-3 sm:mx-6 hidden md:block">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Open global search (Ctrl+K or Command+K)"
              className="w-full flex items-center justify-between px-4 py-2 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" aria-hidden="true" />
                <span className="font-medium text-slate-500 dark:text-slate-400 text-xs">
                  Search students, modules, tasks...
                </span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 shadow-2xs font-mono">
                ⌘K
              </kbd>
            </button>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right Section: Theme Toggle, Notifications, Authenticated User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Mobile Search Button */}
          {mounted && user && (
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Search students, modules, and tasks"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Search (Ctrl + K)"
            >
              <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </button>
          )}

          {/* PALETTE SWITCHER DROPDOWN */}
          <div id="navbar-palette-container" className="relative">
            <button
              type="button"
              id="navbar-palette-toggle"
              onClick={() => setShowPaletteMenu(!showPaletteMenu)}
              aria-label={`Select color layout (Currently ${currentPaletteInfo.name})`}
              title="Change Color Theme / Layout"
              aria-haspopup="true"
              aria-expanded={showPaletteMenu}
              className="flex h-9 items-center gap-1.5 px-2.5 sm:px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 transition-all shadow-xs cursor-pointer text-xs font-bold"
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentPaletteInfo.dotColor }}
                aria-hidden="true"
              />
              <span className="font-semibold hidden sm:inline">
                {currentPaletteInfo.name}
              </span>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${showPaletteMenu ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {showPaletteMenu && (
              <div
                role="menu"
                aria-orientation="vertical"
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Color Layouts
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    6 styles
                  </span>
                </div>

                <div className="py-1 space-y-0.5 max-h-[320px] overflow-y-auto">
                  {palettes.map((p) => {
                    const isSelected = p.id === palette;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setPalette(p.id);
                          setShowPaletteMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="h-3 w-3 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900 shadow-xs"
                            style={{ backgroundColor: p.dotColor }}
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate leading-tight">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                              {p.tagline}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* THEME TOGGLE BUTTON (Dark / Light) */}
          <button
            type="button"
            id="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 transition-transform hover:-rotate-12" aria-hidden="true" />
            )}
          </button>

          {/* NOTIFICATIONS BELL & FLYOUT */}
          {mounted && !isAuthPage && user && (
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
          {!mounted || isAuthPage || !user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  pathname === '/login'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/"
                className="rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Apply / Book Demo
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                }}
                aria-label={`Account menu for ${user.name}`}
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 p-1.5 pr-3 shadow-xs transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                  alt={user.name}
                  className="h-8 w-8 rounded-xl object-cover border border-slate-300 dark:border-slate-700"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </span>
                  <span className="text-xs font-semibold capitalize flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" aria-hidden="true" />
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
                      onClick={() => { setShowLogoutConfirm(true); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left cursor-pointer"
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

      {/* Institutional Sign Out Confirmation Modal (Rendered via React Portal onto document.body to avoid header containing-block clipping) */}
      {showLogoutConfirm && mounted && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0F172A] p-6 sm:p-7 shadow-2xl border border-slate-200/90 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header / Icon */}
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-center shrink-0 shadow-sm">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Sign Out of EDU360
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Active Account: <span className="font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Institutional Account'}</span>
                  <span className="text-[11px] text-slate-400 block font-mono mt-0.5">@{user?.username || role}</span>
                </p>
              </div>
            </div>

            {/* Description / Notice Box */}
            <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Are you sure you want to end your current session?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Any unsaved draft entries, active forms, or unfinished grading records will be closed.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-xs cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white px-4 py-3 text-xs font-bold transition-all shadow-lg shadow-rose-600/25 hover:shadow-rose-600/40 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Global Command Palette / Omnisearch Modal */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
        currentRole={role} 
      />
    </header>
  );
}
