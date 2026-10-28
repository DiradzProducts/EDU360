'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  School,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, loginAs, user, isAuthenticated, mounted } = useAuth();
  
  // Real authentication inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [schoolCode, setSchoolCode] = useState('EDU-GLOBAL-360');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isLoggingInRef = useRef(false);

  // Auto-forward active sessions away from /login back to their rightful portal
  useEffect(() => {
    if (mounted && isAuthenticated && user?.role && !isLoggingInRef.current) {
      if (typeof window !== 'undefined') {
        window.location.replace(`/${user.role}`);
      } else {
        router.replace(`/${user.role}`);
      }
    }
  }, [mounted, isAuthenticated, user]);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    isLoggingInRef.current = true;
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login(username.trim(), password, schoolCode.trim());
      if (res && res.user) {
        loginWithCredentials(res.user);
      } else if (res && res.portal_redirect) {
        const roleFromPath = (res.portal_redirect.replace('/', '') || 'student') as UserRole;
        loginAs(roleFromPath);
      } else {
        throw new Error('Invalid authentication response. Please verify credentials.');
      }
    } catch (err: any) {
      isLoggingInRef.current = false;
      setErrorMessage(err.message || 'Incorrect credentials. Please verify your institutional username and password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Subtle Background Glows (Active in both light and dark modes) */}
      <div className="fixed top-20 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-1/3 h-72 w-72 rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        
        {/* Title Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Institutional Sign In
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in with your assigned institutional credentials
          </p>
        </div>

        {/* Clean, Aesthetic Authentication Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xl dark:shadow-2xl dark:shadow-black/50 p-7 sm:p-8 backdrop-blur-xl transition-all">
          
          {errorMessage && (
            <div className="mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3.5 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            
            {/* School Code Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Institutional Client Code
                </label>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <School className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  placeholder="EDU-GLOBAL-360"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 pl-10 pr-3 py-2.5 text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 tracking-wider transition-all"
                />
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username / Institutional ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your institutional username"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <a href="#" className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Session */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5" 
                />
                <span>Remember session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-3 text-xs font-bold shadow-md shadow-blue-600/20 hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying credentials...
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Admissions / Institutional enrollment guidance */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Prospective family looking to enroll?{' '}
              <Link href="/" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Apply for Admission &rarr;
              </Link>
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Enrolled students &amp; staff: Login credentials are provided directly by your school administrator or admissions desk.
            </p>
          </div>
        </div>

        {/* Security / System Footer */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-6">
          Encrypted Institutional Node • EDU360 Unified Outcomes
        </p>
      </div>
    </div>
  );
}
