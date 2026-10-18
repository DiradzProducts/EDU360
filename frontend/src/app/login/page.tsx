'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Users, 
  BookOpen, 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  School,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { Footer } from '@/components/footer';

const demoPersonas = [
  {
    role: 'admin',
    title: 'Dr. Sunita Kapoor',
    sub: 'Principal & Super Admin',
    email: 'principal@edu360.internal',
    password: 'admin123',
    icon: Building2,
    color: 'from-blue-600 to-indigo-700',
    border: 'border-blue-200 hover:border-blue-400',
    target: '/admin'
  },
  {
    role: 'teacher',
    title: 'Mrs. Ananya Verma',
    sub: 'Senior Mathematics (Class 8B)',
    email: 'ananya.verma@edu360.internal',
    password: 'teacher123',
    icon: GraduationCap,
    color: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-200 hover:border-emerald-400',
    target: '/teacher'
  },
  {
    role: 'parent',
    title: 'Mr. Rajesh Sharma',
    sub: 'Father of Aarav Sharma (Class 8B)',
    email: 'rajesh.sharma@example.com',
    password: 'parent123',
    icon: Users,
    color: 'from-amber-600 to-orange-700',
    border: 'border-amber-200 hover:border-amber-400',
    target: '/parent'
  },
  {
    role: 'student',
    title: 'Aarav Sharma (Secondary)',
    sub: 'Class 8B • Grades 6-12 Portal',
    email: 'aarav.sharma@student.edu360.internal',
    password: 'student123',
    icon: BookOpen,
    color: 'from-purple-600 to-indigo-700',
    border: 'border-purple-200 hover:border-purple-400',
    target: '/student'
  },
  {
    role: 'student',
    title: 'Aarav Kumar (Junior)',
    sub: 'Class 3-A • K-5 Junior Explorer 🦊',
    email: 'aarav.junior@student.edu360.internal',
    password: 'student123',
    icon: Sparkles,
    color: 'from-amber-500 via-pink-500 to-indigo-500',
    border: 'border-amber-300 hover:border-amber-500',
    target: '/student'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, loginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolCode, setSchoolCode] = useState('EDU-GLOBAL-360');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login(email, password, schoolCode);
      if (res && res.user) {
        loginWithCredentials(res.user);
      } else if (res && res.portal_redirect) {
        const roleFromPath = (res.portal_redirect.replace('/', '') || 'student') as UserRole;
        loginAs(roleFromPath);
      } else {
        loginAs('student');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
      setLoading(false);
    }
  };

  const handleSelectCredentials = (persona: typeof demoPersonas[0]) => {
    setEmail(persona.email);
    setPassword(persona.password);
    setErrorMessage('');
    loginAs(persona.role as UserRole);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background aesthetic glowing orbs */}
      <div className="absolute top-10 left-1/4 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />

      <div className="relative mx-auto w-full max-w-4xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-slate-900">EDU<span className="text-blue-600">360</span></span>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">K–12 Outcomes &amp; Intelligence</span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Institutional Sign In
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Secure authentication required. Sign in with your official school credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Authorized Institutional Account Directory */}
          <div className="lg:col-span-5 space-y-3.5 order-2 lg:order-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                Authorized Institutional Accounts
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Click to autofill</span>
            </div>

            <div className="space-y-2.5">
              {demoPersonas.map((p) => {
                const Icon = p.icon;
                const isSelected = email === p.email;
                return (
                  <button
                    key={p.email}
                    type="button"
                    onClick={() => handleSelectCredentials(p)}
                    className={`w-full text-left p-3.5 rounded-2xl bg-white border ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : p.border
                    } shadow-xs hover:shadow-md transition-all duration-200 group flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${p.color} text-white shadow-sm shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {p.title}
                          </span>
                          <span className="text-[9px] font-bold uppercase rounded-md px-1.5 py-0.2 bg-slate-100 text-slate-600">
                            {p.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">{p.email}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Pass: {p.password}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Select
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl bg-blue-50/70 p-3.5 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
              <School className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                <b>Institutional School Code:</b> Default demonstration code: <code className="bg-blue-100/80 px-1 py-0.5 rounded font-mono font-bold text-blue-900">EDU-GLOBAL-360</code>.
              </span>
            </div>
          </div>

          {/* Right Column: Aesthetic Sign In Card */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-md p-7 sm:p-9 shadow-xl order-1 lg:order-2">
            <h2 className="text-lg font-bold text-slate-900">Account Credentials</h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-5">
              Enter your email and password registered with your institution
            </p>

            {errorMessage && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Client Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <School className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                    placeholder="e.g. EDU-GLOBAL-360 or DPS-BLR-2026"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@school.edu or your parent/student email"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5" />
                  <span>Remember my school session</span>
                </label>
                <a href="#" className="font-semibold text-blue-600 hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Institutional Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                New student, teacher, or parent?{' '}
                <Link href="/register" className="font-bold text-blue-600 hover:underline">
                  Register with your School Code &rarr;
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <Footer />
      </div>
    </div>
  );
}
