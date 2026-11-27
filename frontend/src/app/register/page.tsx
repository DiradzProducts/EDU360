'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  School, 
  Building2, 
  GraduationCap, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { Footer } from '@/components/footer';

const roleOptions = [
  {
    role: 'student',
    title: 'Student / Scholar',
    desc: 'Attend live classes, submit homework, view Focus Table',
    icon: BookOpen,
    color: 'from-blue-600 via-indigo-600 to-sky-500',
    identifierLabel: 'Admission / Roll Number',
    identifierPlaceholder: 'e.g. EDU-2024-082'
  },
  {
    role: 'teacher',
    title: 'Teaching Faculty',
    desc: 'Host classes, inline grading canvas, parent hub',
    icon: GraduationCap,
    color: 'from-[#0F766E] via-[#0D9488] to-[#14B8A6]',
    identifierLabel: 'Teacher Employee ID',
    identifierPlaceholder: 'e.g. EMP-MTH-44'
  },
  {
    role: 'parent',
    title: 'Parent / Guardian',
    desc: 'Moving sliders, bus GPS tracking, fee milestones',
    icon: Users,
    color: 'from-[#C2410C] via-[#F97316] to-[#FB923C]',
    identifierLabel: 'Child Admission Number',
    identifierPlaceholder: 'e.g. EDU-2024-082'
  },
  {
    role: 'admin',
    title: 'School Administrator',
    desc: 'Priority triage, CRM, TC exit, staff management',
    icon: Building2,
    color: 'from-[#0B0F19] via-[#1E293B] to-[#334155]',
    identifierLabel: 'School Admin Clearance Key',
    identifierPlaceholder: 'e.g. ADM-SEC-KEY-99'
  }
];

const sampleClientCodes = [
  { code: 'EDU-GLOBAL-360', name: 'EDU360 Demonstration Academy' },
  { code: 'DPS-BLR-2026', name: 'Delhi Public School (Bangalore South)' },
  { code: 'OAK-INTL-88', name: 'Oakridge International School' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithCredentials, loginAs } = useAuth();

  // Step state
  const [schoolCode, setSchoolCode] = useState('EDU-GLOBAL-360');
  const [verifiedSchool, setVerifiedSchool] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-verify default code on mount
  useEffect(() => {
    verifyCode(schoolCode);
  }, []);

  const verifyCode = async (code: string) => {
    if (!code || code.length < 3) {
      setVerifiedSchool(null);
      return;
    }
    try {
      const res = await api.verifySchoolCode(code);
      if (res && res.valid) {
        setVerifiedSchool(res);
        setErrorMsg('');
      } else {
        setVerifiedSchool(null);
      }
    } catch {
      setVerifiedSchool(null);
    }
  };

  const handleCodeChange = (val: string) => {
    const formatted = val.toUpperCase().trim();
    setSchoolCode(formatted);
    verifyCode(formatted);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedSchool) {
      setErrorMsg('Please enter a valid Institutional School Code issued to your school.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Both password entries must be identical before creating your account.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.register({
        school_code: schoolCode,
        name,
        email,
        password,
        role: selectedRole,
        identifier,
        phone
      });

      setIsSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        if (res && res.user) {
          loginWithCredentials(res.user);
        } else {
          loginAs(selectedRole as UserRole);
        }
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
      setLoading(false);
    }
  };

  const activeRoleData = roleOptions.find(r => r.role === selectedRole) || roleOptions[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-200">
      {/* Subtle Indigo & Sophisticated Teal Ambient Glows (15% opacity rule) */}
      <div className="absolute top-12 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-1/3 h-96 w-96 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none" />

      <div className="relative mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-[#2563EB]/25 group-hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">EDU<span className="text-blue-600 dark:text-blue-400">360</span></span>
              <span className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Institutional Onboarding</span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Register Under Your School
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Every client institution receives an official School Code. Students, teachers, and parents must provide their school code to enroll.
          </p>
        </div>

        {/* Main Registration Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/60 p-7 sm:p-10 backdrop-blur-md space-y-6">
          {errorMsg && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5] dark:bg-[#065F46]/30 text-[#065F46] dark:text-[#6EE7B7] border border-[#A7F3D0] dark:border-[#065F46]">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Registration Complete!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Welcome to <b>{verifiedSchool?.school_name}</b> on EDU360. Launching your personalized {selectedRole} dashboard now...
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Section 1: Institutional School Client Code */}
              <div className="rounded-2xl border border-[#BFDBFE] dark:border-[#1E40AF] bg-[#EFF6FF]/60 dark:bg-[#2563EB]/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#1E40AF] dark:text-[#93C5FD] uppercase tracking-wider flex items-center gap-1.5">
                    <School className="h-4 w-4 text-[#2563EB] dark:text-[#60A5FA]" />
                    Step 1: Institutional School Client Code
                  </label>
                  <span className="text-[10px] font-semibold text-[#1D4ED8] dark:text-[#93C5FD] bg-[#EFF6FF] dark:bg-[#2563EB]/25 px-2 py-0.5 rounded-full border border-[#BFDBFE] dark:border-[#1E40AF]">
                    Required for all users
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={schoolCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="Enter school client code (e.g. EDU-GLOBAL-360)"
                    className="w-full rounded-xl border border-[#BFDBFE] dark:border-[#1E40AF] bg-[#FFFFFF] dark:bg-[#0B0F19] px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:focus:ring-[#3B82F6] shadow-xs"
                  />
                  {verifiedSchool && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#0D9488] dark:text-[#14B8A6]">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Verified School Feedback Card */}
                {verifiedSchool ? (
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-teal-200 dark:border-teal-800 shadow-xs">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 shrink-0 font-bold">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {verifiedSchool.school_name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {verifiedSchool.campus_city} • {verifiedSchool.affiliation}
                      </span>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800 shrink-0">
                      Code Verified ✓
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-[#64748B] dark:text-[#94A3B8]" />
                    <span>Try testing with demo client codes: </span>
                    {sampleClientCodes.map((s) => (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => handleCodeChange(s.code)}
                        className="font-mono font-bold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer"
                      >
                        {s.code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Choose Role */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Step 2: Select Your Institutional Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedRole === opt.role;

                    return (
                      <button
                        key={opt.role}
                        type="button"
                        onClick={() => setSelectedRole(opt.role)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-[#2563EB] dark:border-[#3B82F6] bg-[#EFF6FF] dark:bg-[#2563EB]/15 ring-2 ring-[#2563EB]/20 shadow-sm'
                            : 'border-[#14726C] bg-[#FFFFFF] dark:bg-[#0B0F19] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60'
                        }`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${opt.color} text-white shadow-xs shrink-0`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{opt.title}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-[#2563EB] dark:text-[#60A5FA]" />}
                          </div>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 block mt-0.5">{opt.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Profile & Identification */}
              <div className="space-y-4 pt-2 border-t border-[#14726C]">
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Step 3: Account & Identity Details
                </label>

                {/* Role-Specific Identifier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {activeRoleData.identifierLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={activeRoleData.identifierPlaceholder}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Diya Patel"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="diya.patel@example.com"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Account Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password (6+ chars)"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password && password.length < 6 && (
                      <span className="text-[10px] text-[#F97316] dark:text-[#FB923C] mt-1 block font-medium">
                        Must be at least 6 characters
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Confirm Password
                      </label>
                      {confirmPassword && (
                        <span className={`text-[10px] font-bold ${
                          password === confirmPassword 
                            ? 'text-[#0D9488] dark:text-[#14B8A6]' 
                            : 'text-rose-500'
                        }`}>
                          {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className={`w-full rounded-xl border pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                          confirmPassword && password !== confirmPassword
                            ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                            : confirmPassword && password === confirmPassword
                            ? 'border-emerald-300 focus:ring-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-[var(--primary)]/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !verifiedSchool}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] hover:opacity-95 active:opacity-90 text-white font-bold px-4 py-3 text-sm shadow-md shadow-[var(--primary)]/25 hover:shadow-lg hover:shadow-[var(--primary)]/35 transition-all active:scale-[0.99] disabled:opacity-50 mt-4 cursor-pointer"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Complete Institutional Registration</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-[#14726C] text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already registered with your school?{' '}
              <Link href="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:text-blue-300 hover:underline">
                Sign in to your account &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Brand Footer */}
        <Footer />
      </div>
    </div>
  );
}
