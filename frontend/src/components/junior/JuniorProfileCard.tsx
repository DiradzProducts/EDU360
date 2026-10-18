'use client';

import React, { useState } from 'react';
import {
  Shield,
  Flame,
  Star,
  Award,
  Lock,
  FileCheck,
  CheckCircle2,
  Download,
  Eye,
  X,
  Sparkles,
  Calendar,
  School
} from 'lucide-react';
import { User, GamificationProfile } from '@/lib/types';
import { playButtonClick, playStarCollect } from '@/lib/sound-effects';

interface JuniorProfileCardProps {
  user: User;
  profile: GamificationProfile;
}

export function JuniorProfileCard({ user, profile }: JuniorProfileCardProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<{
    title: string;
    docType: string;
    date: string;
    seal: string;
    icon: string;
    description: string;
  } | null>(null);

  const certificates = [
    {
      id: 1,
      title: 'Grade 1 Academic Merit Award',
      docType: 'Official Academic Distinction',
      date: 'April 2025',
      seal: 'EDU360 Official Seal - Reg #9921',
      icon: '🏆',
      description: 'Awarded for extraordinary curiosity, number sense, and positive class participation.'
    },
    {
      id: 2,
      title: 'Junior Science & Innovation Fair Runner-Up',
      docType: 'School STEM Exhibition',
      date: 'November 2025',
      seal: 'EDU360 Science Fair Committee',
      icon: '🔬',
      description: 'Demonstrated smart solar garden model with spinning mini windmill.'
    },
    {
      id: 3,
      title: 'Municipal Birth Certificate & SIS Bonafide',
      docType: 'Official SIS Verified Record',
      date: 'Permanent Vault Record',
      seal: 'CBSE Registrar Verified',
      icon: '📜',
      description: 'Certified institutional student record for Aarav Kumar (Admission #EDU-2025-032).'
    }
  ];

  const subjects = [
    { name: 'Mathematics & Puzzles', stars: 88, level: 'Level 4 Star Genius', color: 'bg-amber-400' },
    { name: 'Phonics & Storytelling', stars: 95, level: 'Level 5 Master Reader', color: 'bg-sky-400' },
    { name: 'Creative Arts & Clay', stars: 92, level: 'Level 4 Master Painter', color: 'bg-pink-400' },
    { name: 'Sports & Active Play', stars: 85, level: 'Level 3 Speed Champion', color: 'bg-emerald-400' }
  ];

  return (
    <div className="space-y-8">
      
      {/* ========================================================
          1. JUNIOR EXPLORER SIS PROFILE HERO
      ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl border-4 border-amber-300 bg-white p-6 sm:p-8 shadow-xl">
        
        {/* Top Playful Gradient Banner */}
        <div className="h-32 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 bg-gradient-to-r from-sky-400 via-indigo-500 via-purple-500 to-pink-400 relative overflow-hidden flex items-end px-8 pb-4">
          <div className="absolute top-2 right-4 text-3xl opacity-30 select-none">✨ ⭐ 🚀</div>
          <span className="rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-white text-xs font-black tracking-wide border border-white/30">
            EDU360 Official Student Identity Record
          </span>
        </div>

        <div className="relative -mt-16 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 pb-6 border-b-2 border-slate-100">
          
          {/* Avatar and Basic Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            
            {/* 3D Child Avatar with Golden Shield Ring */}
            <div className="relative group">
              <div className="h-28 w-28 rounded-3xl bg-gradient-to-tr from-amber-300 via-yellow-400 to-orange-400 p-1.5 shadow-2xl border-4 border-white">
                <div className="h-full w-full rounded-2xl bg-sky-200 overflow-hidden flex items-center justify-center">
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=AaravJunior3D'}
                    alt="Aarav Kumar Avatar"
                    className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
              </div>

              {/* Floating Shield Badge */}
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg border-2 border-white">
                <Shield className="h-5 w-5 fill-purple-300 text-white" />
              </div>
            </div>

            {/* Name, Age, and Tier */}
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {user.name}
                </h2>
                <span className="rounded-xl bg-purple-100 border border-purple-300 px-3 py-1 text-xs font-black text-purple-900 shadow-sm">
                  🛡️ Level {profile.level} {profile.level_title}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 mt-1">
                8 Year Old Indian Student • Class 3-A • Roll #08 • Admission #EDU-2025-032
              </p>
              <p className="text-xs font-semibold text-slate-400">
                Guardian: Mr. Rajesh Sharma (+91 98111 00003)
              </p>
            </div>

          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-3 px-4 text-center shadow-sm">
              <span className="block text-[10px] font-black uppercase text-amber-700">Total Stars</span>
              <span className="text-xl font-black text-amber-900 flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
                {profile.total_stars}
              </span>
            </div>
            <div className="rounded-2xl bg-purple-50 border-2 border-purple-300 p-3 px-4 text-center shadow-sm">
              <span className="block text-[10px] font-black uppercase text-purple-700">Total XP</span>
              <span className="text-xl font-black text-purple-900">{profile.xp_points} XP</span>
            </div>
          </div>

        </div>

        {/* 7-DAY ATTENDANCE FIRE STREAK WITH VIBRANT ARC GAUGE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          
          {/* Fire Streak Card */}
          <div className="md:col-span-1 rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-4 border-orange-300 p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-orange-800 tracking-wide">
                  Attendance Streak
                </span>
                <span className="rounded-full bg-orange-200 text-orange-950 px-2.5 py-0.5 text-[10px] font-black">
                  On Fire 🔥
                </span>
              </div>

              {/* 7 Fire Emojis */}
              <div className="flex justify-center gap-1.5 my-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className="text-2xl animate-pulse" title={`Day ${i + 1} Present`}>
                    🔥
                  </span>
                ))}
              </div>

              <div className="text-center mt-2">
                <h4 className="text-4xl font-black text-orange-600">
                  {profile.attendance_streak_days} Days
                </h4>
                <p className="text-xs font-bold text-slate-600 mt-1">
                  Consecutive school attendance without missing a single period!
                </p>
              </div>
            </div>

            {/* Arc / Overall Rate Indicator */}
            <div className="mt-4 pt-3 border-t border-orange-200/80 flex items-center justify-between text-xs font-black text-orange-900">
              <span>Overall Rate:</span>
              <span className="rounded-xl bg-white px-2.5 py-1 text-sm text-orange-600 shadow-sm border border-orange-200">
                94.2% Excellent
              </span>
            </div>
          </div>

          {/* Subject Star Mastery Bars */}
          <div className="md:col-span-2 rounded-3xl bg-slate-50 border-4 border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-slate-800">Subject Star Progress</h4>
                <p className="text-xs font-bold text-slate-400">Mastery levels across core curriculum</p>
              </div>
              <span className="text-xs font-black text-indigo-600">Active Term 1</span>
            </div>

            <div className="space-y-3 pt-1">
              {subjects.map((sub, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-700">{sub.name}</span>
                    <span className="text-slate-500 font-bold">{sub.level} • {sub.stars}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${sub.color}`}
                      style={{ width: `${sub.stars}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>


      {/* ========================================================
          2. OFFICIAL SCHOOL CERTIFICATES VAULT
      ======================================================== */}
      <section className="rounded-3xl border-4 border-amber-300 bg-white p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 px-3.5 py-1 text-xs font-black mb-1">
              <School className="h-4 w-4 text-amber-700" />
              <span>Official School Certificate Vault</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              Tamper-Proof Certificates & Badges
            </h3>
            <p className="text-xs font-bold text-slate-500">
              Digitally verified and sealed by School Administration for Aarav's lifetime portfolio.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 border-2 border-amber-300 px-4 py-2 text-xs font-black text-amber-900">
            <Lock className="h-4 w-4 text-amber-600" />
            <span>Sealed by Principal (View-Only)</span>
          </div>
        </div>

        {/* Parchment Certificate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              onClick={() => {
                playButtonClick();
                setSelectedCertificate(cert);
              }}
              className="group relative flex flex-col justify-between rounded-3xl bg-[#FFFDF5] border-4 border-[#F3E8C8] hover:border-amber-400 p-6 shadow-md hover:shadow-2xl transition-all duration-200 cursor-pointer hover:-translate-y-1.5"
            >
              {/* Golden Padlock Stamp Watermark */}
              <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-amber-100/80 border border-amber-300/80 px-2.5 py-0.5 text-[10px] font-black text-amber-900 shadow-sm">
                <Lock className="h-3 w-3 text-amber-700" />
                <span>Verified</span>
              </div>

              <div>
                {/* Certificate Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/70 text-3xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  {cert.icon}
                </div>

                <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                  {cert.docType}
                </span>

                <h4 className="text-base font-black text-slate-900 mt-1 leading-snug">
                  {cert.title}
                </h4>

                <p className="text-xs font-bold text-slate-500 mt-2 line-clamp-2">
                  {cert.description}
                </p>
              </div>

              {/* Bottom Official Stamp Bar */}
              <div className="mt-6 pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>{cert.date}</span>
                <span className="text-amber-700 font-black flex items-center gap-1 group-hover:underline">
                  <Eye className="h-3.5 w-3.5" /> View Seal
                </span>
              </div>

            </div>
          ))}
        </div>

      </section>


      {/* ========================================================
          OFFICIAL CERTIFICATE PREVIEW MODAL
      ======================================================== */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl border-6 border-amber-400 bg-[#FFFDF5] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b-2 border-amber-200">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{selectedCertificate.icon}</span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedCertificate.title}
                  </h3>
                  <p className="text-xs font-bold text-amber-800">
                    {selectedCertificate.docType} • Issued to Aarav Kumar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Parchment Document Body */}
            <div className="rounded-2xl border-2 border-amber-200 bg-white p-6 text-center space-y-4 shadow-inner">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                EDU360 Demonstration Academy • Bengaluru Central
              </div>
              
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Certificate of Academic Excellence
              </h2>

              <p className="text-xs font-serif italic text-slate-600 max-w-md mx-auto leading-relaxed">
                "This official credential affirms that <b>Aarav Kumar (Class 3-A)</b> has displayed outstanding competence and creativity in {selectedCertificate.title}."
              </p>

              {/* Official Gold Seal Stamp */}
              <div className="mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-900 shadow-xl border-4 border-white">
                <span className="text-2xl">🎖️</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">OFFICIAL SEAL</span>
                <span className="text-[7px] font-bold">EDU360 CBSE</span>
              </div>

              <div className="pt-2 text-[11px] font-mono text-slate-400">
                {selectedCertificate.seal}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedCertificate(null)}
                className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 font-black text-xs"
              >
                Close Viewer
              </button>
              <button
                onClick={() => {
                  playStarCollect();
                  alert("Certificate PDF downloaded with EDU360 Cryptographic Seal.");
                  setSelectedCertificate(null);
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 py-3 font-black text-xs shadow-md border-b-4 border-amber-600"
              >
                Download PDF Copy 📥
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
