'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ChevronDown, 
  ArrowRight, 
  Menu, 
  X, 
  ShieldCheck, 
  Layers, 
  FileEdit, 
  Users, 
  BookOpen, 
  Bus, 
  Award, 
  Building2, 
  GraduationCap, 
  Lock, 
  FileCheck2,
  CalendarCheck,
  Zap,
  BarChart3
} from 'lucide-react';

interface MarketingNavbarProps {
  onOpenDemo?: (role?: string) => void;
}

export function MarketingNavbar({ onOpenDemo }: MarketingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'platform' | 'solutions' | 'resources' | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBookDemo = (rolePref?: string) => {
    if (onOpenDemo) {
      onOpenDemo(rolePref);
    } else {
      window.dispatchEvent(new CustomEvent('edu360-open-demo', { detail: { role: rolePref || 'admin' } }));
    }
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <header 
      ref={navRef}
      className={`public-marketing-header sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/90' 
          : 'bg-white/80 backdrop-blur-sm border-b border-slate-200/60'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  EDU<span className="text-indigo-600">360</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  K–12 Intelligence
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-tight">Action &amp; Outcomes Platform</p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links with Clean Dropdowns */}
        <nav className="hidden lg:flex items-center gap-1">
          
          {/* Platform / Features Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'platform' ? null : 'platform')}
              onMouseEnter={() => setActiveDropdown('platform')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                activeDropdown === 'platform'
                  ? 'text-indigo-600 bg-indigo-50/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <span>Platform</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'platform' ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
            </button>

            {activeDropdown === 'platform' && (
              <div 
                onMouseLeave={() => setActiveDropdown(null)}
                className="absolute left-0 top-full mt-1.5 w-[540px] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xl shadow-slate-900/10 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div 
                  onClick={() => {
                    const el = document.getElementById('core-pillars');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    setActiveDropdown(null);
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 group-hover:scale-105 transition-transform">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Priority Triage Engine</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Auto-surface chronic absences and academic dips 3 weeks before exams.</p>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    const el = document.getElementById('core-pillars');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    setActiveDropdown(null);
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition-transform">
                    <FileEdit className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">In-Browser Grading Canvas</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Fast rubric evaluation with red pen remarks and 4-day revision timetables.</p>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    const el = document.getElementById('core-pillars');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    setActiveDropdown(null);
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                    <Bus className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Live Transport &amp; Parent Hub</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Sub-minute school bus GPS with live ETA &amp; spam-free announcements.</p>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    const el = document.getElementById('core-pillars');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    setActiveDropdown(null);
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-105 transition-transform">
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Student Portfolio &amp; Vault</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Verified certificates, holistic co-curriculars, and permanent records.</p>
                  </div>
                </div>

                <div className="col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between px-2">
                  <span className="text-[11px] text-slate-500">Looking for a custom SIS migration?</span>
                  <button 
                    onClick={() => handleBookDemo('admin')}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Talk to Solution Architect</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'solutions' ? null : 'solutions')}
              onMouseEnter={() => setActiveDropdown('solutions')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                activeDropdown === 'solutions'
                  ? 'text-indigo-600 bg-indigo-50/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <span>Solutions</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
            </button>

            {activeDropdown === 'solutions' && (
              <div 
                onMouseLeave={() => setActiveDropdown(null)}
                className="absolute left-0 top-full mt-1.5 w-80 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/10 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div 
                  onClick={() => {
                    const el = document.getElementById('role-showcase');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    setActiveDropdown(null);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">For Leadership &amp; Admin</h4>
                    <p className="text-[11px] text-slate-500">Triage control, admissions CRM &amp; exit records</p>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    const el = document.getElementById('role-showcase');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    setActiveDropdown(null);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">For Teachers &amp; Faculty</h4>
                    <p className="text-[11px] text-slate-500">Auto-attendance, grading canvas &amp; parent notes</p>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    const el = document.getElementById('role-showcase');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    setActiveDropdown(null);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">For Parents &amp; Families</h4>
                    <p className="text-[11px] text-slate-500">Live bus GPS, fee milestones &amp; high-signal updates</p>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    const el = document.getElementById('role-showcase');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    setActiveDropdown(null);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">For Students</h4>
                    <p className="text-[11px] text-slate-500">Outcome-driven LMS, co-curriculars &amp; vault</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Why EDU360 */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('why-edu360');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-xl transition-colors cursor-pointer"
          >
            Why EDU360
          </button>

          {/* Resources / Case Studies */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
              onMouseEnter={() => setActiveDropdown('resources')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                activeDropdown === 'resources'
                  ? 'text-indigo-600 bg-indigo-50/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <span>Resources</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
            </button>

            {activeDropdown === 'resources' && (
              <div 
                onMouseLeave={() => setActiveDropdown(null)}
                className="absolute left-0 top-full mt-1.5 w-72 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/10 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div 
                  onClick={() => {
                    const el = document.getElementById('testimonials');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    setActiveDropdown(null);
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-900 block">Case Studies &amp; Impact</span>
                  <span className="text-[11px] text-slate-500">How 120+ institutions modernized operations</span>
                </div>

                <div 
                  onClick={() => {
                    const el = document.getElementById('security');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    setActiveDropdown(null);
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-900 block">Security &amp; Compliance Vault</span>
                  <span className="text-[11px] text-slate-500">FERPA, GDPR, and ISO 27001 data governance</span>
                </div>
              </div>
            )}
          </div>

        </nav>

        {/* Right Action Buttons: Sign In (Ghost) + Book a Demo (Primary) */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Sign In
          </Link>

          <button
            type="button"
            onClick={() => handleBookDemo()}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
          >
            <span>Book a Demo</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Sign In
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl space-y-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <button
              onClick={() => {
                const el = document.getElementById('core-pillars');
                el?.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Platform &amp; Core Pillars
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('role-showcase');
                el?.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Solutions by Role (Admin, Teachers, Parents, Students)
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('why-edu360');
                el?.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Why EDU360 vs Legacy ERPs
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('testimonials');
                el?.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Case Studies &amp; Testimonials
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => handleBookDemo()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/25"
            >
              <span>Book a School Demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/login"
              className="w-full text-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Sign In to School Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
