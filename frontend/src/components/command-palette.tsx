'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowRight, 
  CornerDownLeft, 
  X, 
  GraduationCap, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Clock,
  User,
  CreditCard,
  BookOpen,
  AlertTriangle,
  Bus,
  Check
} from 'lucide-react';
import { Icon3D } from '@/components/ui/icon-3d';
import { useTheme } from '@/lib/theme-context';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'navigation' | 'students' | 'tasks' | 'actions';
  icon?: string; // 3D icon name or fallback
  href?: string;
  tab?: string;
  role?: string[];
  action?: () => void;
  badge?: string;
  badgeColor?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: string;
}

export function CommandPalette({ isOpen, onClose, currentRole = 'admin' }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling while command palette is active & listen for ESC key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape, true);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEscape, true);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setSelectedCategory('all');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Master index of searchable command items
  const allItems: CommandItem[] = useMemo(() => {
    return [
      // --- NAVIGATION: ADMIN ---
      {
        id: 'nav-admin-cockpit',
        title: 'Executive Command Cockpit',
        subtitle: 'Principal pulse, live morning vitals & campus health',
        category: 'navigation',
        icon: 'rocket',
        href: '/admin',
        tab: 'cockpit',
        role: ['admin', 'super_admin']
      },
      {
        id: 'nav-admin-tasks',
        title: 'Institutional Mandates & Task Operations',
        subtitle: 'CBSE renewal, fire safety, compliance verification',
        category: 'navigation',
        icon: 'memo',
        href: '/admin',
        tab: 'tasks',
        badge: 'Tasks',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'nav-admin-triage',
        title: 'Priority Compliance & Safety Triage',
        subtitle: 'Resolve urgent campus escalations & breach alerts',
        category: 'navigation',
        icon: 'fire',
        href: '/admin',
        tab: 'triage',
        role: ['admin', 'super_admin']
      },
      {
        id: 'nav-admin-sis',
        title: 'Unified SIS & Student Records',
        subtitle: 'Class rosters, demographics, academic history',
        category: 'navigation',
        icon: 'graduation',
        href: '/admin',
        tab: 'sis',
        role: ['admin', 'super_admin']
      },
      {
        id: 'nav-admin-fees',
        title: 'Accounts, Fees & Defaulters Cockpit',
        subtitle: 'Milestone tracking, payments & SMS reminders',
        category: 'navigation',
        icon: 'chart',
        href: '/admin',
        tab: 'fees',
        role: ['admin', 'super_admin']
      },
      {
        id: 'nav-admin-crm',
        title: 'Admissions CRM & Inbound Pipeline',
        subtitle: 'Prospective leads, campus visits & enquiry stages',
        category: 'navigation',
        icon: 'target',
        href: '/admin',
        tab: 'crm',
        role: ['admin', 'super_admin']
      },
      {
        id: 'nav-admin-substitutions',
        title: 'Faculty Period Substitution Desk',
        subtitle: 'Smart auto-substitution for on-leave teachers',
        category: 'navigation',
        icon: 'bulb',
        href: '/admin',
        tab: 'substitutions',
        role: ['admin', 'super_admin']
      },
      {
        id: 'nav-admin-staff',
        title: 'Staff Directory & Permissions Registry',
        subtitle: 'Faculty profiles, roles & access permissions',
        category: 'navigation',
        icon: 'book',
        href: '/admin',
        tab: 'staff',
        role: ['admin', 'super_admin']
      },

      // --- NAVIGATION: TEACHER ---
      {
        id: 'nav-teacher-dashboard',
        title: 'Classroom Attendance & Live Class Desk',
        subtitle: 'Mark daily attendance, launch virtual classrooms',
        category: 'navigation',
        icon: 'graduation',
        href: '/teacher',
        tab: 'dashboard',
        role: ['teacher', 'admin']
      },
      {
        id: 'nav-teacher-schedule',
        title: 'Personal Timetable & Academic Pacing',
        subtitle: 'Daily period roster, room allocations, free periods',
        category: 'navigation',
        icon: 'calendar',
        href: '/teacher',
        tab: 'schedule',
        role: ['teacher', 'admin']
      },
      {
        id: 'nav-teacher-qp',
        title: 'Exam Question Paper & Blueprint Desk',
        subtitle: 'Author blueprints, upload QPs, moderation status',
        category: 'navigation',
        icon: 'memo',
        href: '/teacher',
        tab: 'exams_gradebook',
        role: ['teacher', 'admin', 'exam_coordinator']
      },
      {
        id: 'nav-teacher-duties',
        title: 'Duties & Governance Operations Center',
        subtitle: 'Academic mandates, invigilation slots, submit proof',
        category: 'navigation',
        icon: 'trophy',
        href: '/teacher',
        tab: 'duties',
        role: ['teacher', 'admin']
      },
      {
        id: 'nav-teacher-curriculum',
        title: 'Mathematics & Science Curriculum Pacer',
        subtitle: 'Chapter logs, term milestones & lesson pacing',
        category: 'navigation',
        icon: 'book',
        href: '/teacher',
        tab: 'curriculum',
        role: ['teacher', 'admin']
      },
      {
        id: 'nav-teacher-ptm',
        title: 'Parent PTM Connect Hub',
        subtitle: 'Schedule parent conferences, slot invites & notes',
        category: 'navigation',
        icon: 'bulb',
        href: '/teacher',
        tab: 'parent_hub',
        role: ['teacher', 'admin']
      },

      // --- NAVIGATION: EXAM COORDINATOR ---
      {
        id: 'nav-coord-vault',
        title: 'Secrecy Vault & QP Decryption',
        subtitle: 'Encrypted papers, master key unlocking, paper audit',
        category: 'navigation',
        icon: 'lock',
        href: '/exam_coordinator',
        tab: 'secrecy_vault',
        role: ['exam_coordinator', 'admin']
      },
      {
        id: 'nav-coord-schedules',
        title: 'Examination Schedules & Hall Allocations',
        subtitle: 'Hall tickets, invigilation duty roster, seat mapping',
        category: 'navigation',
        icon: 'calendar',
        href: '/exam_coordinator',
        tab: 'schedules',
        role: ['exam_coordinator', 'admin']
      },
      {
        id: 'nav-coord-remedial',
        title: 'Remedial Re-Exam Mandates Desk',
        subtitle: 'Absentee justifications, medical re-exams, approvals',
        category: 'navigation',
        icon: 'trophy',
        href: '/exam_coordinator',
        tab: 'remedial_reexam',
        role: ['exam_coordinator', 'admin']
      },

      // --- NAVIGATION: STUDENT & PARENT ---
      {
        id: 'nav-parent-fees',
        title: 'Fee Payment Ledger & Milestone Invoices',
        subtitle: 'Online UPI/Card settlement, receipt PDF download',
        category: 'navigation',
        icon: 'chart',
        href: '/parent',
        tab: 'fees',
        role: ['parent', 'admin']
      },
      {
        id: 'nav-parent-leave',
        title: 'Doctor Note & Medical Leave Submission',
        subtitle: 'Upload medical certificate scan for missed exams',
        category: 'navigation',
        icon: 'memo',
        href: '/parent',
        tab: 'leave',
        role: ['parent', 'admin']
      },
      {
        id: 'nav-student-focus',
        title: 'Remedial Focus Table & Study Assistant',
        subtitle: 'Personalized revision plan, Socratic hints, formulas',
        category: 'navigation',
        icon: 'sparkles',
        href: '/student',
        tab: 'focus',
        role: ['student', 'admin']
      },

      // --- STUDENTS & PEOPLE DIRECTORY ---
      {
        id: 'student-arjun-sharma',
        title: 'Arjun Sharma',
        subtitle: 'Class 10-A • Roll #101 • Science & Math • Attendance: 94%',
        category: 'students',
        icon: 'graduation',
        href: currentRole === 'teacher' ? '/teacher' : '/admin',
        tab: currentRole === 'teacher' ? 'roster' : 'sis',
        badge: 'Class 10-A',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
      },
      {
        id: 'student-priya-nair',
        title: 'Priya Nair',
        subtitle: 'Class 9-B • Roll #204 • Rank #1 • Term 1: 96.4%',
        category: 'students',
        icon: 'trophy',
        href: currentRole === 'teacher' ? '/teacher' : '/admin',
        tab: currentRole === 'teacher' ? 'roster' : 'sis',
        badge: 'Class 9-B',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
      },
      {
        id: 'student-rohan-patel',
        title: 'Rohan Patel',
        subtitle: 'Class 10-A • Roll #108 • 1-Week Remedial Focus Active',
        category: 'students',
        icon: 'target',
        href: currentRole === 'teacher' ? '/teacher' : '/admin',
        tab: currentRole === 'teacher' ? 'roster' : 'sis',
        badge: 'Remedial Batch',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
      },
      {
        id: 'student-aarav-kumar',
        title: 'Aarav Kumar',
        subtitle: 'Class 4-A • Junior K-5 Explorer • Level 5 Champion',
        category: 'students',
        icon: 'sparkles',
        href: '/junior',
        badge: 'Junior K-5',
        badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
      },
      {
        id: 'staff-sunita-kapoor',
        title: 'Dr. Sunita Kapoor',
        subtitle: 'Principal & Head of Institution • CBSE Board Lead',
        category: 'students',
        icon: 'graduation',
        href: '/admin',
        tab: 'staff',
        badge: 'Principal',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
      },
      {
        id: 'staff-ananya-verma',
        title: 'Mrs. Ananya Verma',
        subtitle: 'Senior Mathematics Faculty • Class 10-A Head Teacher',
        category: 'students',
        icon: 'book',
        href: '/teacher',
        badge: 'Faculty',
        badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
      },

      // --- TASKS & MANDATES ---
      {
        id: 'task-cbse-affiliation',
        title: 'CBSE Board Affiliation Renewal Dossier Inspection',
        subtitle: 'Assigned: Dr. Sunita Kapoor • Executive Compliance • In Progress',
        category: 'tasks',
        icon: 'memo',
        href: '/admin',
        tab: 'tasks',
        badge: 'Critical SLA 96h',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
      },
      {
        id: 'task-loc-submission',
        title: 'Submit Class 10 Board Exam LOC to CBSE Portal',
        subtitle: 'Assigned: Ms. Rekha Iyer • 312 Candidates • Due Today 5 PM',
        category: 'tasks',
        icon: 'lock',
        href: currentRole === 'exam_coordinator' ? '/exam_coordinator' : '/admin',
        tab: currentRole === 'exam_coordinator' ? 'secrecy_vault' : 'tasks',
        badge: 'Critical SLA 8h',
        badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
      },
      {
        id: 'task-lab-chemistry',
        title: 'Audit Chemistry Laboratory Acid & Apparatus Stock',
        subtitle: 'Assigned: Mrs. Shalini Rao • Inventory & Safety Buffer',
        category: 'tasks',
        icon: 'bulb',
        href: '/admin',
        tab: 'tasks',
        badge: 'Inventory 72h',
        badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      },

      // --- QUICK ACTIONS ---
      {
        id: 'action-toggle-theme',
        title: `Switch to ${theme === 'dark' ? 'Light Theme' : 'Dark Theme'}`,
        subtitle: 'Toggle platform interface color theme instantly',
        category: 'actions',
        icon: theme === 'dark' ? 'bulb' : 'bulb',
        action: () => toggleTheme(),
        badge: 'Theme'
      },
      {
        id: 'action-new-task',
        title: 'Log New Institutional Mandate / Task',
        subtitle: 'Delegate administrative duty with SLA & priority target',
        category: 'actions',
        icon: 'rocket',
        href: '/admin',
        tab: 'tasks',
        badge: 'Admin Action',
        badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
        role: ['admin', 'super_admin']
      },
      {
        id: 'action-author-blueprint',
        title: '+ Author & Upload Blueprint Draft',
        subtitle: 'Create question paper matrix for upcoming term examination',
        category: 'actions',
        icon: 'memo',
        href: '/teacher',
        tab: 'exams_gradebook',
        badge: 'Faculty Action',
        badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        role: ['teacher', 'admin', 'exam_coordinator']
      },
      {
        id: 'action-doctor-note',
        title: 'Upload Doctor Medical Note & Leave Request',
        subtitle: 'Submit medical justification file for excused exam absence',
        category: 'actions',
        icon: 'memo',
        href: '/parent',
        tab: 'leave',
        badge: 'Parent Action',
        badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        role: ['parent', 'admin']
      }
    ];
  }, [currentRole, theme, toggleTheme]);

  // Filter items based on search query, role, and category
  const filteredItems = useMemo(() => {
    let list = allItems;

    // Filter by role if item has role constraints
    list = list.filter(item => {
      if (!item.role) return true;
      return item.role.includes(currentRole) || currentRole === 'admin';
    });

    // Filter by category pill
    if (selectedCategory !== 'all') {
      list = list.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allItems, currentRole, selectedCategory, query]);

  // Reset active index when filtered items change
  useEffect(() => {
    setActiveIndex(0);
  }, [filteredItems]);

  // Execute selected item
  const handleSelect = (item: CommandItem) => {
    onClose();

    if (item.action) {
      item.action();
      return;
    }

    if (item.href) {
      // If target tab specified, broadcast custom event so destination page switches tab immediately
      if (item.tab) {
        window.dispatchEvent(new CustomEvent('edu360:switch-tab', { detail: { tab: item.tab } }));
      }
      
      const targetUrl = item.tab ? `${item.href}?tab=${item.tab}` : item.href;
      router.push(targetUrl);
    }
  };

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[activeIndex]) {
        handleSelect(filteredItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-8 sm:pt-12 px-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[500px] transition-all"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, student name, task, or module..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Close Search (or press ESC)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span>ESC</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-slate-100 dark:border-slate-800/60 overflow-x-auto scrollbar-none bg-slate-50/30 dark:bg-slate-900/20 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'navigation', label: '🧭 Modules' },
            { id: 'students', label: '🎓 People' },
            { id: 'tasks', label: '📋 Tasks' },
            { id: 'actions', label: '⚡ Actions' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Result Items List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[320px] scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Icon3D name="bulb" className="h-8 w-8 mx-auto opacity-40" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching commands found</p>
              <p className="text-xs text-slate-400">Try searching for &quot;Arjun&quot;, &quot;CBSE&quot;, &quot;Fee&quot;, &quot;Blueprint&quot;, or &quot;Theme&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      {item.icon ? (
                        <Icon3D name={item.icon as any} className="h-5 w-5" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold truncate ${
                          isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                            item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        Jump <CornerDownLeft className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">↵</kbd> select
            </span>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">esc</kbd> close
            </button>
          </div>

          <div className="flex items-center gap-1 font-semibold text-slate-400">
            <span>EDU360 Universal Omnisearch</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
