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
  Lock
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, switchRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Role-specific navigation links
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
    teacher: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', pill: 'text-emerald-700' },
    admin: { badge: 'bg-blue-100 text-blue-800 border-blue-200', pill: 'text-blue-700' },
    parent: { badge: 'bg-amber-100 text-amber-800 border-amber-200', pill: 'text-amber-700' },
    student: { badge: 'bg-purple-100 text-purple-800 border-purple-200', pill: 'text-purple-700' }
  };

  const currentTheme = roleColors[role] || roleColors.teacher;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href={`/${role}`} className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white shadow-md shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">EDU<span className="text-blue-600">360</span></span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200/60">
                  {role.toUpperCase()} PORTAL
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Action & Intelligence Platform</p>
            </div>
          </Link>
        </div>

        {/* Center: Role-Specific Navigation (Shows ONLY the logged-in role's modules) */}
        {!isAuthPage && user && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 rounded-2xl p-1 border border-slate-200">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white transition-all shadow-xs"
                >
                  <Icon className="h-3.5 w-3.5 text-slate-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Section: Authenticated User Profile & Sign Out */}
        <div className="flex items-center gap-3">
          {isAuthPage || !user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  pathname === '/login'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  pathname === '/register'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 p-1.5 pr-3 shadow-xs transition-colors"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                  alt={user.name}
                  className="h-8 w-8 rounded-xl object-cover border border-slate-200"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
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
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 space-y-2">
                  <div className="p-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Signed in as</span>
                    <span className="text-xs font-bold text-slate-900 block truncate">{user.name}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-semibold bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-600">School Client Code:</span>
                      <span className="font-mono font-bold text-blue-700">{user.school_code || 'EDU-GLOBAL-360'}</span>
                    </div>
                  </div>

                  {/* Demo Persona Switcher (Cleanly tucked in menu for testing) */}
                  <div className="p-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                      Switch Active Persona (Demo Sandbox)
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => { switchRole('admin'); setShowUserMenu(false); }}
                        className={`text-left p-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                          user.role === 'admin' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Building2 className="h-3 w-3" /> Admin
                      </button>
                      <button
                        onClick={() => { switchRole('teacher'); setShowUserMenu(false); }}
                        className={`text-left p-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                          user.role === 'teacher' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <GraduationCap className="h-3 w-3" /> Teacher
                      </button>
                      <button
                        onClick={() => { switchRole('parent'); setShowUserMenu(false); }}
                        className={`text-left p-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                          user.role === 'parent' ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Users className="h-3 w-3" /> Parent
                      </button>
                      <button
                        onClick={() => { switchRole('student'); setShowUserMenu(false); }}
                        className={`text-left p-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                          user.role === 'student' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <BookOpen className="h-3 w-3" /> Student
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
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
