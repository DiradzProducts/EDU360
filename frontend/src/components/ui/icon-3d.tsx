import React from 'react';

export type Icon3DName = 
  | 'target'
  | 'trophy'
  | 'rocket'
  | 'sparkles'
  | 'bulb'
  | 'calendar'
  | 'book'
  | 'shield'
  | 'lock'
  | 'ticket'
  | 'chart'
  | 'video'
  | 'fire'
  | 'memo'
  | 'bus'
  | 'party'
  | 'graduation'
  | 'bell'
  | 'pin'
  | 'star'
  | 'clock'
  | 'teacher'
  | 'check-badge'
  | 'alert-badge'
  | 'dot-green'
  | 'dot-red'
  | 'dot-yellow'
  | 'dot-purple';

interface Icon3DProps {
  name: Icon3DName;
  size?: number | string;
  className?: string;
  title?: string;
}

/**
 * Aesthetic 3D Icon Component for EDU360.
 * Replaces flat, pixelated system OS emojis with ultra-crisp, volumetric 3D rendered SVG icons
 * featuring multi-layer gradients, ambient occlusion, specular highlights, and depth lighting.
 */
export function Icon3D({ name, size = 22, className = 'inline-block shrink-0 align-middle', title }: Icon3DProps) {
  const s = typeof size === 'number' ? `${size}px` : size;

  switch (name) {
    case 'target':
      // 3D Concentric Bullseye Dartboard with Cyan/Blue Fletched Dart at angle
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Target"}>
          <defs>
            <filter id="shadow-target" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#701A75" floodOpacity="0.25" />
            </filter>
            <linearGradient id="ring-red-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="40%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>
            <linearGradient id="ring-white-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="dart-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="dart-fin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          <g filter="url(#shadow-target)">
            {/* Outer Red Ring with 3D Depth */}
            <circle cx="30" cy="34" r="24" fill="#881337" opacity="0.6" />
            <circle cx="30" cy="32" r="24" fill="url(#ring-red-1)" />
            <ellipse cx="26" cy="18" rx="14" ry="4" fill="#FFFFFF" opacity="0.25" />

            {/* White Ring */}
            <circle cx="30" cy="32" r="18" fill="url(#ring-white-1)" />
            <ellipse cx="26" cy="21" rx="10" ry="2.5" fill="#FFFFFF" opacity="0.4" />

            {/* Inner Red Ring */}
            <circle cx="30" cy="32" r="12" fill="url(#ring-red-1)" />

            {/* Bullseye Center */}
            <circle cx="30" cy="32" r="6" fill="url(#ring-white-1)" />
            <circle cx="30" cy="32" r="3" fill="#BE123C" />

            {/* Embedded 3D Dart at 45 degree angle */}
            {/* Shadow of Dart */}
            <path d="M30 32 L50 18 L48 14 L30 32 Z" fill="#4C0519" opacity="0.35" />
            
            {/* Dart Shaft */}
            <path d="M30 32 L46 16 L48 18 L32 34 Z" fill="#94A3B8" />
            {/* Shaft Highlight */}
            <line x1="31" y1="31" x2="46" y2="16" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
            
            {/* Dart Body Segment */}
            <path d="M38 24 L48 14 L52 18 L42 28 Z" fill="url(#dart-body)" />
            
            {/* 3D Flight Fins */}
            {/* Top Fin */}
            <path d="M48 14 L58 4 C58 4 58 10 54 14 Z" fill="url(#dart-fin)" />
            <path d="M48 14 L58 4 L54 14 Z" fill="#93C5FD" opacity="0.4" />
            {/* Bottom Fin */}
            <path d="M42 28 L50 36 C50 36 48 30 46 24 Z" fill="url(#dart-fin)" />
            {/* Right Fin */}
            <path d="M52 18 L60 22 C60 22 56 18 50 16 Z" fill="url(#dart-fin)" />
            
            {/* Dart Tip Impact Glow */}
            <circle cx="30" cy="32" r="1.5" fill="#FEF08A" />
          </g>
        </svg>
      );

    case 'trophy':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Trophy"}>
          <defs>
            <linearGradient id="gold-main" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="45%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="gold-dark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#854D0E" />
            </linearGradient>
            <linearGradient id="pedestal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>
          {/* Base Pedestal */}
          <ellipse cx="32" cy="56" rx="16" ry="4" fill="#0F172A" opacity="0.3" />
          <path d="M22 50 L42 50 L44 56 L20 56 Z" fill="url(#pedestal)" />
          <rect x="24" y="45" width="16" height="5" rx="1.5" fill="url(#gold-dark)" />
          {/* Stem */}
          <path d="M29 36 L35 36 L34 45 L30 45 Z" fill="url(#gold-dark)" />
          {/* Handles */}
          <path d="M16 18 C16 28 24 30 24 30" stroke="url(#gold-main)" strokeWidth="4" strokeLinecap="round" />
          <path d="M48 18 C48 28 40 30 40 30" stroke="url(#gold-main)" strokeWidth="4" strokeLinecap="round" />
          {/* Cup Bowl */}
          <path d="M18 12 L46 12 C46 12 45 36 32 36 C19 36 18 12 18 12 Z" fill="url(#gold-main)" />
          <ellipse cx="32" cy="12" rx="14" ry="3" fill="#FEF08A" />
          {/* Cup Glint */}
          <path d="M22 15 C22 24 26 31 30 33" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          {/* Star Crest */}
          <path d="M32 18 L33.5 22 L37.5 22.5 L34.5 25 L35.5 29 L32 27 L28.5 29 L29.5 25 L26.5 22.5 L30.5 22 Z" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );

    case 'rocket':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Rocket"}>
          <defs>
            <linearGradient id="rocket-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="rocket-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>
            <linearGradient id="flame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          {/* Exhaust Flame */}
          <path d="M22 44 C16 52 14 62 14 62 C14 62 24 60 32 54 C28 50 24 46 22 44 Z" fill="url(#flame)" />
          <path d="M20 46 C17 51 16 57 16 57 C16 57 22 56 27 52 Z" fill="#FEF08A" />
          {/* Fins */}
          <path d="M18 36 L12 44 L22 46 Z" fill="url(#rocket-red)" />
          <path d="M36 18 L44 12 L46 22 Z" fill="url(#rocket-red)" />
          {/* Rocket Fuselage */}
          <path d="M52 12 C38 14 26 26 22 42 L42 22 C48 18 52 12 52 12 Z" fill="url(#rocket-body)" />
          {/* Nosecone */}
          <path d="M52 12 C47 13 43 16 41 18 L46 23 C48 21 51 17 52 12 Z" fill="url(#rocket-red)" />
          {/* Porthole */}
          <circle cx="36" cy="28" r="5" fill="#0284C7" />
          <circle cx="36" cy="28" r="3.5" fill="#38BDF8" />
          <circle cx="35" cy="27" r="1.2" fill="#FFFFFF" />
        </svg>
      );

    case 'sparkles':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Sparkles"}>
          <defs>
            <linearGradient id="sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          {/* Main Big Star */}
          <path d="M30 6 C30 18 38 24 48 26 C38 28 30 34 30 46 C30 34 22 28 12 26 C22 24 30 18 30 6 Z" fill="url(#sparkle-grad)" />
          <circle cx="30" cy="26" r="3" fill="#FFFFFF" opacity="0.9" />
          {/* Smaller Accent Star Top-Right */}
          <path d="M48 34 C48 40 52 42 56 44 C52 46 48 48 48 54 C48 48 44 46 40 44 C44 42 48 40 48 34 Z" fill="url(#sparkle-grad)" />
          <circle cx="48" cy="44" r="1.5" fill="#FFFFFF" />
          {/* Tiny Dot Sparkle */}
          <circle cx="16" cy="46" r="2.5" fill="#FBBF24" />
        </svg>
      );

    case 'bulb':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Lightbulb"}>
          <defs>
            <radialGradient id="bulb-glow" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <linearGradient id="screw-base" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
          </defs>
          {/* Glow backdrop */}
          <circle cx="32" cy="26" r="22" fill="#FEF08A" opacity="0.3" filter="blur(4px)" />
          {/* Glass Dome */}
          <path d="M20 26 C20 16 25 10 32 10 C39 10 44 16 44 26 C44 32 40 36 38 40 L26 40 C24 36 20 32 20 26 Z" fill="url(#bulb-glow)" />
          <ellipse cx="27" cy="18" rx="4" ry="6" fill="#FFFFFF" opacity="0.5" transform="rotate(-20 27 18)" />
          {/* Base screw */}
          <rect x="27" y="42" width="10" height="3" rx="1" fill="url(#screw-base)" />
          <rect x="28" y="46" width="8" height="3" rx="1" fill="url(#screw-base)" />
          <path d="M29 50 C29 52 35 52 35 50 Z" fill="#475569" />
          {/* Filament highlight */}
          <path d="M28 32 Q32 26 32 30 Q32 26 36 32" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.85" />
        </svg>
      );

    case 'calendar':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Calendar"}>
          <defs>
            <linearGradient id="cal-header" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>
            <linearGradient id="cal-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>
          </defs>
          {/* Base Sheet Shadow */}
          <rect x="12" y="16" width="40" height="38" rx="8" fill="#CBD5E1" opacity="0.5" />
          {/* Calendar Body */}
          <rect x="12" y="14" width="40" height="38" rx="8" fill="url(#cal-body)" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Top Red Header */}
          <path d="M12 22 C12 17.5 15.5 14 20 14 L44 14 C48.5 14 52 17.5 52 22 L52 26 L12 26 Z" fill="url(#cal-header)" />
          {/* Binder Rings */}
          <rect x="20" y="10" width="4" height="8" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <rect x="40" y="10" width="4" height="8" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          {/* Date Dots Grid */}
          <circle cx="22" cy="34" r="2.5" fill="#94A3B8" />
          <circle cx="32" cy="34" r="2.5" fill="#94A3B8" />
          <circle cx="42" cy="34" r="2.5" fill="#94A3B8" />
          <circle cx="22" cy="42" r="2.5" fill="#94A3B8" />
          <circle cx="32" cy="42" r="2.5" fill="#E11D48" />
          <circle cx="42" cy="42" r="2.5" fill="#94A3B8" />
        </svg>
      );

    case 'book':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Book"}>
          <defs>
            <linearGradient id="book-cover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="book-pages" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
          {/* 3D Isometric Book */}
          <path d="M12 44 L44 48 L52 40 L20 36 Z" fill="#312E81" />
          {/* Pages block */}
          <path d="M14 40 L44 44 L48 38 L18 34 Z" fill="url(#book-pages)" />
          {/* Top Cover */}
          <path d="M14 18 L46 22 L52 14 L20 10 Z" fill="url(#book-cover)" />
          {/* Spine Curve */}
          <path d="M14 18 C11 20 11 38 14 40 L20 36 C18 34 18 12 20 10 Z" fill="#3730A3" />
          {/* Bookmark Ribbon */}
          <path d="M34 20 L34 32 L37 29 L40 32 L40 21 Z" fill="#F43F5E" />
          {/* Cover Sheen */}
          <line x1="18" y1="13" x2="44" y2="16" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4" />
        </svg>
      );

    case 'shield':
    case 'lock':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Security Vault"}>
          <defs>
            <linearGradient id="lock-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="lock-shackle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="50%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
          </defs>
          {/* Shackle */}
          <path d="M22 28 V19 C22 13.5 26.5 9 32 9 C37.5 9 42 13.5 42 19 V28" stroke="url(#lock-shackle)" strokeWidth="6" strokeLinecap="round" />
          {/* Padlock Body */}
          <rect x="16" y="26" width="32" height="28" rx="7" fill="url(#lock-body)" stroke="#D97706" strokeWidth="1.5" />
          {/* Specular Highlight */}
          <rect x="19" y="29" width="26" height="4" rx="2" fill="#FFFFFF" opacity="0.35" />
          {/* Keyhole */}
          <circle cx="32" cy="38" r="3.5" fill="#451A03" />
          <path d="M30.5 38 L33.5 38 L34 46 L30 46 Z" fill="#451A03" />
        </svg>
      );

    case 'ticket':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Admit Card"}>
          <defs>
            <linearGradient id="ticket-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#7E22CE" />
            </linearGradient>
          </defs>
          <g transform="rotate(-10 32 32)">
            <rect x="10" y="20" width="44" height="24" rx="4" fill="url(#ticket-grad)" stroke="#C084FC" strokeWidth="1.5" />
            {/* Cutouts */}
            <circle cx="10" cy="32" r="4" fill="#0F172A" />
            <circle cx="54" cy="32" r="4" fill="#0F172A" />
            {/* Perforation Line */}
            <line x1="22" y1="21" x2="22" y2="43" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
            {/* Star Stamp */}
            <circle cx="38" cy="32" r="4" fill="#FEF08A" />
          </g>
        </svg>
      );

    case 'chart':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Analytics"}>
          <defs>
            <linearGradient id="bar-green" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="bar-blue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="bar-purple" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          {/* Base Plate */}
          <ellipse cx="32" cy="54" rx="24" ry="6" fill="#64748B" opacity="0.25" />
          {/* Bar 1 */}
          <rect x="16" y="32" width="8" height="20" rx="3" fill="url(#bar-blue)" />
          {/* Bar 2 */}
          <rect x="28" y="20" width="8" height="32" rx="3" fill="url(#bar-purple)" />
          {/* Bar 3 */}
          <rect x="40" y="12" width="8" height="40" rx="3" fill="url(#bar-green)" />
          {/* Trending Arrow Up */}
          <path d="M18 28 L32 16 L44 8 L48 14" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'fire':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Hot/Due"}>
          <defs>
            <linearGradient id="fire-outer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <linearGradient id="fire-inner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <path d="M32 8 C34 16 42 22 46 30 C50 38 48 50 38 56 C46 52 46 44 42 40 C40 48 32 54 26 54 C18 54 14 46 16 38 C18 30 24 24 28 16 C30 22 34 24 34 24 C34 24 30 16 32 8 Z" fill="url(#fire-outer)" />
          <path d="M30 32 C32 36 36 38 38 42 C40 46 38 50 34 52 C38 50 38 46 36 44 C34 48 30 50 28 50 C24 50 22 46 24 42 C26 38 28 36 30 32 Z" fill="url(#fire-inner)" />
        </svg>
      );

    case 'memo':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Report / Memo"}>
          <defs>
            <linearGradient id="doc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>
          </defs>
          <path d="M18 10 H38 L48 20 V52 C48 54.2 46.2 56 44 56 H18 C15.8 56 14 54.2 14 52 V14 C14 11.8 15.8 10 18 10 Z" fill="url(#doc-bg)" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M38 10 V18 C38 19.1 38.9 20 40 20 H48 Z" fill="#94A3B8" />
          {/* Text lines */}
          <line x1="22" y1="28" x2="40" y2="28" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
          <line x1="22" y1="36" x2="36" y2="36" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="44" x2="32" y2="44" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Red Ribbon Seal */}
          <circle cx="40" cy="46" r="4" fill="#E11D48" />
        </svg>
      );

    case 'party':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Celebration"}>
          <path d="M12 52 L26 22 L46 42 Z" fill="#F59E0B" />
          <path d="M12 52 L36 32 L46 42 Z" fill="#EF4444" />
          {/* Confetti pieces */}
          <circle cx="48" cy="18" r="3" fill="#3B82F6" />
          <circle cx="36" cy="12" r="2.5" fill="#10B981" />
          <circle cx="54" cy="30" r="2.5" fill="#EC4899" />
          <path d="M40 22 Q46 16 52 24" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'graduation':
      return (
        <svg width={s} height={s} viewBox="0 0 64 64" fill="none" className={className} aria-label={title || "Graduation"}>
          <defs>
            <linearGradient id="cap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          {/* Cap Cap */}
          <path d="M32 14 L56 24 L32 34 L8 24 Z" fill="url(#cap-grad)" stroke="#475569" strokeWidth="1" />
          {/* Skullcap */}
          <path d="M20 29 V40 C20 44 25.5 48 32 48 C38.5 48 44 44 44 40 V29" fill="url(#cap-grad)" />
          {/* Tassel Button & String */}
          <circle cx="32" cy="24" r="2" fill="#F59E0B" />
          <path d="M32 24 C38 26 44 32 45 38" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
          <rect x="43" y="38" width="4" height="6" rx="1" fill="#D97706" />
        </svg>
      );

    case 'dot-green':
      return (
        <span className={`relative inline-flex items-center justify-center ${className}`}>
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
        </span>
      );

    case 'dot-red':
      return (
        <span className={`relative inline-flex items-center justify-center ${className}`}>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-sm shadow-rose-500/50"></span>
        </span>
      );

    case 'dot-yellow':
      return (
        <span className={`relative inline-flex items-center justify-center ${className}`}>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-sm shadow-amber-400/50"></span>
        </span>
      );

    case 'dot-purple':
      return (
        <span className={`relative inline-flex items-center justify-center ${className}`}>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500 shadow-sm shadow-purple-500/50"></span>
        </span>
      );

    default:
      return null;
  }
}
