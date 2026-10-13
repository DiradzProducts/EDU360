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
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';

const roleOptions = [
  {
    role: 'student',
    title: 'Student / Scholar',
    desc: 'Attend live classes, submit homework, view Focus Table',
    icon: BookOpen,
    color: 'from-purple-600 to-indigo-700',
    identifierLabel: 'Admission / Roll Number',
    identifierPlaceholder: 'e.g. EDU-2024-082'
  },
  {
    role: 'teacher',
    title: 'Teaching Faculty',
    desc: 'Host classes, inline grading canvas, parent hub',
    icon: GraduationCap,
    color: 'from-emerald-600 to-teal-700',
    identifierLabel: 'Teacher Employee ID',
    identifierPlaceholder: 'e.g. EMP-MTH-44'
  },
  {
    role: 'parent',
    title: 'Parent / Guardian',
    desc: 'Moving sliders, bus GPS tracking, fee milestones',
    icon: Users,
    color: 'from-amber-600 to-orange-700',
    identifierLabel: 'Child Admission Number',
    identifierPlaceholder: 'e.g. EDU-2024-082'
  },
  {
    role: 'admin',
    title: 'School Administrator',
    desc: 'Priority triage, CRM, TC exit, staff management',
    icon: Building2,
    color: 'from-blue-600 to-indigo-700',
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

  // Step state
  const [schoolCode, setSchoolCode] = useState('EDU-GLOBAL-360');
  const [verifiedSchool, setVerifiedSchool] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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
        if (res && res.portal_redirect) {
          router.push(res.portal_redirect);
        } else {
          router.push(`/${selectedRole}`);
        }
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
      setLoading(false);
    }
  };

  const activeRoleData = roleOptions.find(r => r.role === selectedRole) || roleOptions[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-12 left-1/3 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-1/3 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />

      <div className="relative mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-slate-900">EDU<span className="text-blue-600">360</span></span>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Institutional Onboarding</span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Register Under Your School
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Every client institution receives an official School Code. Students, teachers, and parents must provide their school code to enroll.
          </p>
        </div>

        {/* Main Registration Card */}
        <div className="rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-md p-7 sm:p-10 shadow-xl space-y-6">
          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Registration Complete!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Welcome to <b>{verifiedSchool?.school_name}</b> on EDU360. Launching your personalized {selectedRole} dashboard now...
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Section 1: Institutional School Client Code */}
              <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                    <School className="h-4 w-4 text-blue-600" />
                    Step 1: Institutional School Client Code
                  </label>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
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
                    className="w-full rounded-xl border border-blue-300 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                  {verifiedSchool && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Verified School Feedback Card */}
                {verifiedSchool ? (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-emerald-200 shadow-xs">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0 font-bold">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {verifiedSchool.school_name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {verifiedSchool.campus_city} • {verifiedSchool.affiliation}
                      </span>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                      Code Verified ✓
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                    <span>Try testing with demo client codes: </span>
                    {sampleClientCodes.map((s) => (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => handleCodeChange(s.code)}
                        className="font-mono font-bold text-blue-600 hover:underline"
                      >
                        {s.code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Choose Role */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
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
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50/80'
                        }`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${opt.color} text-white shadow-xs shrink-0`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                          </div>
                          <span className="text-[11px] text-slate-500 line-clamp-1 block mt-0.5">{opt.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Profile & Identification */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Step 3: Account & Identity Details
                </label>

                {/* Role-Specific Identifier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {activeRoleData.identifierLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={activeRoleData.identifierPlaceholder}
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Diya Patel"
                        className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
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
                        placeholder="diya.patel@example.com"
                        className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 00000"
                        className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password (6+ chars)"
                        className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !verifiedSchool}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-4"
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

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already registered with your school?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:underline">
                Sign in to your account &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
