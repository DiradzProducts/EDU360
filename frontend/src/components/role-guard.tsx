'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { ShieldAlert, ArrowRight, LogIn, Lock } from 'lucide-react';

interface RoleGuardProps {
  allowedRole: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { user, role, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Authentication Required</h2>
          <p className="text-xs text-slate-600">
            Please sign in with your institutional credentials to access the <b>{allowedRole.toUpperCase()}</b> portal.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all w-full"
          >
            <LogIn className="h-4 w-4" />
            <span>Go to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  // If user role does NOT match the page role
  if (user.role !== allowedRole) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          
          <div>
            <span className="rounded-full bg-red-100 text-red-800 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
              403 Forbidden • Access Restricted
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Role Permission Boundary Enforced
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
            You are currently signed in as <b>{user.name}</b> with the role <b>{user.role.toUpperCase()}</b>.
            <br className="mb-1" />
            According to the <b>EDU360 Role & Permission Matrix (Section 3 of PRD)</b>, access to this module is restricted to <b>{allowedRole.toUpperCase()}</b> accounts only.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/${user.role}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all"
            >
              <span>Return to My {user.role.toUpperCase()} Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={logout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 text-xs font-bold transition-all"
            >
              <span>Sign In as Another Role</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
