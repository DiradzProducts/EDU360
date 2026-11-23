'use client';
import { Footer } from '@/components/footer';

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
  AlertCircle,
  Sparkles,
  KeyRound
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

  const handleQuickFill = (userVal: string) => {
    setUsername(userVal);
    setPassword('Password123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white transition-colors duration-200">
      
      {/* Subtle Indigo & Sophisticated Teal Ambient Glows (15% opacity rule) */}
      <div className="fixed top-20 left-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-1/4 h-80 w-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-blue-500/25 mb-3.5 transition-transform hover:scale-105">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Institutional Sign In
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Sign in to access your EDU360 campus workspace
          </p>
        </div>

        {/* Clean, Modern Pure White Authentication Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/60 p-7 sm:p-8 backdrop-blur-xl transition-all">
          
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
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Institutional Client Code
                </label>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <CheckCircle2 className="h-3 w-3" /> Verified Node
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                  <School className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  placeholder="EDU-GLOBAL-360"
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Username / Institutional ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your institutional username"
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Password
                </label>
                <a href="#" className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:text-blue-300 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Remember Session */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="rounded border-[#14726C] accent-[#2563EB] h-3.5 w-3.5 cursor-pointer" 
                />
                <span>Remember session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-4 py-3 text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all active:scale-[0.99] disabled:opacity-50 mt-2 cursor-pointer"
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

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-5 pt-4 border-t border-[#14726C]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <KeyRound className="h-3 w-3 text-[#2563EB] dark:text-[#60A5FA]" />
                Demo Credentials:
              </span>
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">Pass: Password123</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="px-2 py-1.5 rounded-xl border border-[#14726C] bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-[#0B0F19] dark:hover:bg-[#1E293B] text-[11px] font-semibold text-slate-900 dark:text-white transition-colors cursor-pointer text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('teacher_mat')}
                className="px-2 py-1.5 rounded-xl border border-[#14726C] bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-[#0B0F19] dark:hover:bg-[#1E293B] text-[11px] font-semibold text-slate-900 dark:text-white transition-colors cursor-pointer text-center"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('parent')}
                className="px-2 py-1.5 rounded-xl border border-[#14726C] bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-[#0B0F19] dark:hover:bg-[#1E293B] text-[11px] font-semibold text-slate-900 dark:text-white transition-colors cursor-pointer text-center"
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sr_student')}
                className="px-2 py-1.5 rounded-xl border border-[#14726C] bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-[#0B0F19] dark:hover:bg-[#1E293B] text-[11px] font-semibold text-slate-900 dark:text-white transition-colors cursor-pointer text-center"
              >
                Student
              </button>
            </div>
          </div>

          {/* Admissions / Institutional enrollment guidance */}
          <div className="mt-5 pt-4 border-t border-[#14726C] text-center space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Prospective family looking to enroll?{' '}
              <Link href="/" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:text-blue-300 hover:underline">
                Apply for Admission &rarr;
              </Link>
            </p>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Enrolled students &amp; staff: Login credentials are provided directly by your school administrator or admissions desk.
            </p>
          </div>
        </div>

        {/* Security / System Footer */}
        <p className="text-center text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-6">
          Encrypted Institutional Node • EDU360 Unified Outcomes
        </p>
        <Footer className="mt-4 border-t-0 py-2" />
      </div>
    </div>
  );
}
