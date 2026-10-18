'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Building2, 
  Mail, 
  User, 
  ShieldCheck, 
  Play, 
  ArrowRight,
  ExternalLink,
  Layers,
  FileEdit,
  Bus,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
  initialTab?: 'demo' | 'tour';
}

export function DemoBookingModal({ isOpen, onClose, defaultRole = 'admin', initialTab = 'demo' }: DemoModalProps) {
  const [activeTab, setActiveTab] = useState<'demo' | 'tour'>(initialTab);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tourChapter, setTourChapter] = useState<number>(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    schoolName: '',
    role: defaultRole,
    studentCount: '500-1500',
    preferredDate: '',
    notes: ''
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (defaultRole) {
      setFormData(prev => ({ ...prev, role: defaultRole }));
    }
  }, [defaultRole]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore if not supported
      }
    }, 700);
  };

  const tourChapters = [
    {
      title: 'Proactive Morning Triage',
      duration: '0:45',
      icon: Layers,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      description: 'See how leadership spots multi-day absences and fee bottlenecks before they escalate.',
      highlight: 'Resolves triage alerts 4x faster than manual call logs.'
    },
    {
      title: 'In-Browser Grading Canvas',
      duration: '0:35',
      icon: FileEdit,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      description: 'Watch teachers grade 30 worksheets in 15 minutes with red pen annotations and 4-day revision plans.',
      highlight: 'Saves 6 hours of weekend grading per faculty member.'
    },
    {
      title: 'Anti-Spam Parent Experience',
      duration: '0:25',
      icon: Bus,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      description: 'Sub-minute school bus GPS updates with live ETA, eliminating 90% of front-office morning phone calls.',
      highlight: '99.4% verified parent satisfaction rate.'
    },
    {
      title: 'Holistic Student Vault',
      duration: '0:20',
      icon: Trophy,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      description: 'Official digital report cards and verified co-curricular badges stored tamper-proof for life.',
      highlight: '100% legal compliance with dual-signature clearances.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 z-10 flex flex-col max-h-[90vh]">
        
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('demo'); setSubmitted(false); }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'demo'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              📅 Schedule 15-Min Live Demo
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('tour'); setSubmitted(false); }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'tour'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              ▶ Watch 2-Min Interactive Tour
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          {activeTab === 'demo' ? (
            submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  Demo Consultation Confirmed!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <b>{formData.name || 'Educator'}</b>. A customized calendar invitation has been dispatched to <b>{formData.email || 'your email'}</b>.
                </p>

                <div className="my-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 max-w-md mx-auto text-left space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Scheduled Institution:</span>
                    <span className="font-bold text-slate-900">{formData.schoolName || 'Your School'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Tailored Session:</span>
                    <span className="font-bold text-indigo-700 capitalize">{formData.role} Action &amp; Intelligence Walkthrough</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Dedicated Specialist:</span>
                    <span className="font-bold text-slate-900">Aarav Singhal (Senior EdTech Consultant)</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-600 transition-colors"
                  >
                    Done / Return to Site
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200 mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Personalized Institutional Walkthrough</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    See EDU360 tailored for your campus
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Zero sales pressure. A focused 15-minute screen sharing session with an experienced school solutions architect.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Kavita Nair"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Work / Institutional Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="principal@school.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        School / Academy Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Greenwood World Academy"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Primary Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none bg-white"
                      >
                        <option value="admin">Principal / School Leader</option>
                        <option value="admin">Administrator / Operations Head</option>
                        <option value="teacher">Academic Faculty / Teacher</option>
                        <option value="parent">Parent Association Representative</option>
                        <option value="it_director">IT &amp; Systems Director</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Student Enrollment
                      </label>
                      <select
                        value={formData.studentCount}
                        onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none bg-white"
                      >
                        <option value="under-500">Under 500 Students</option>
                        <option value="500-1500">500 – 1,500 Students</option>
                        <option value="1500-3500">1,500 – 3,500 Students</option>
                        <option value="3500+">3,500+ (Multi-Branch Trust)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span>Strict Privacy • No spam guarantee</span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <span>Reserving Slot...</span>
                      ) : (
                        <>
                          <span>Confirm 15-Min Demo</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )
          ) : (
            // Interactive 2-Minute Tour Player
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Interactive 2-Minute Product Tour
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Click any module below to preview the live experience in high-fidelity.
                </p>
              </div>

              {/* Video Mockup Display */}
              <div className="relative aspect-video w-full rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-white shadow-xl flex flex-col justify-between overflow-hidden border border-slate-800">
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span>PREVIEW DEMO • 1080P HD</span>
                </div>

                {/* Central Tour Preview Box */}
                <div className="my-auto space-y-2 max-w-md">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">
                    Chapter {tourChapter + 1} of {tourChapters.length}
                  </span>
                  <h4 className="text-lg font-bold text-white">
                    {tourChapters[tourChapter].title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {tourChapters[tourChapter].description}
                  </p>
                  <div className="pt-2">
                    <span className="inline-block rounded-lg bg-indigo-500/20 px-2.5 py-1 text-[10px] font-semibold text-indigo-200 border border-indigo-400/30">
                      ★ {tourChapters[tourChapter].highlight}
                    </span>
                  </div>
                </div>

                {/* Video Playback Bar */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setTourChapter((tourChapter + 1) % tourChapters.length)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 hover:scale-105 transition-transform"
                    >
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                    </button>
                    <span className="text-[11px] text-slate-300">
                      Playing: {tourChapters[tourChapter].duration} clip
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('demo')}
                    className="text-[11px] font-bold text-indigo-300 hover:text-white underline cursor-pointer"
                  >
                    Want a full live demo? Book here →
                  </button>
                </div>
              </div>

              {/* Chapter Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {tourChapters.map((ch, idx) => {
                  const Icon = ch.icon;
                  const isSelected = tourChapter === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTourChapter(idx)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center mb-2 border ${ch.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 block">
                        {ch.duration}
                      </span>
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">
                        {ch.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
