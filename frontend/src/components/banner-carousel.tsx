'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Sparkles, 
  CreditCard, 
  Navigation, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  Clock
} from 'lucide-react';

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  badge_color: string;
  action_text: string;
  action_target: string;
  gradient: string;
  icon: any;
}

const defaultSlides: BannerSlide[] = [
  {
    id: 1,
    title: "Unit Test 2 Results Are Live",
    subtitle: "Class 8 Mathematics & Science report cards published.",
    badge: "Academic Report",
    badge_color: "bg-blue-100 text-blue-700 border-blue-200",
    action_text: "View Report Card",
    action_target: "marks",
    gradient: "from-blue-700 via-indigo-700 to-blue-900",
    icon: FileText
  },
  {
    id: 2,
    title: "Annual Day in 7 Days — Stage Committees",
    subtitle: "Aarav assigned to Western Choir & Stage Coordination committee.",
    badge: "Event Spotlight",
    badge_color: "bg-purple-100 text-purple-700 border-purple-200",
    action_text: "Check Stage Committee",
    action_target: "events",
    gradient: "from-purple-800 via-indigo-800 to-slate-900",
    icon: Sparkles
  },
  {
    id: 3,
    title: "Fee Milestone 2 Due on 25th Oct",
    subtitle: "Term 2 tuition & transport fee installment open for online payment.",
    badge: "Payment Due",
    badge_color: "bg-amber-100 text-amber-700 border-amber-200",
    action_text: "Pay via UPI / Card",
    action_target: "fees",
    gradient: "from-amber-600 via-orange-700 to-red-800",
    icon: CreditCard
  },
  {
    id: 4,
    title: "School Bus Route 4 — Live En Route",
    subtitle: "Bus is 8 mins away from Sector 15 Crossroad Stop.",
    badge: "Live GPS",
    badge_color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    action_text: "Open Live Bus Tracker",
    action_target: "bus",
    gradient: "from-emerald-700 via-teal-800 to-slate-900",
    icon: Navigation
  }
];

interface BannerCarouselProps {
  onActionClick?: (target: string) => void;
}

export function BannerCarousel({ onActionClick }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % defaultSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentSlide = defaultSlides[currentIndex];
  const Icon = currentSlide.icon;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % defaultSlides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + defaultSlides.length) % defaultSlides.length);

  return (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-lg border border-slate-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative min-h-[170px] sm:min-h-[160px] bg-gradient-to-r ${currentSlide.gradient} p-5 sm:p-7 text-white transition-colors duration-500`}>
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Top Bar: Badge & Navigation Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md bg-white/20 border border-white/25 text-white shadow-sm`}>
                <Icon className="h-3.5 w-3.5 text-white/90" />
                {currentSlide.badge}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-white/70">
                <Clock className="h-3 w-3" />
                Anti-Spam Moving Banner
              </span>
            </div>

            {/* Slider arrows */}
            <div className="flex items-center gap-1.5 bg-black/20 rounded-full p-1 backdrop-blur-sm border border-white/10">
              <button 
                onClick={prevSlide}
                className="rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                title="Previous Announcement"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={nextSlide}
                className="rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                title="Next Announcement"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Slide Content */}
          <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="max-w-xl">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-sm">
                {currentSlide.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-white/85 line-clamp-2 leading-relaxed">
                {currentSlide.subtitle}
              </p>
            </div>

            <div>
              <button
                onClick={() => onActionClick && onActionClick(currentSlide.action_target)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-50 hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                <span>{currentSlide.action_text}</span>
                <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Indicator dots */}
          <div className="mt-4 flex items-center gap-1.5">
            {defaultSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-6 bg-white' 
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
