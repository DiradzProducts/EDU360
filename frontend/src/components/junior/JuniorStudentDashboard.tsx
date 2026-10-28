'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Rocket,
  Compass,
  Bus,
  Award,
  Star,
  Flame,
  Volume2,
  RefreshCw,
  Layers,
  FileText,
  Target,
  BarChart,
  Trophy,
  CalendarDays,
  FolderLock,
  Lock,
  Upload,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShieldCheck,
  Eye,
  Download,
  X,
  ChevronRight,
  BookOpen,
  Calendar,
  Search,
  Check,
  Bell,
  ChevronDown,
  LogOut,
  GraduationCap,
  UserCircle
} from 'lucide-react';
import {
  User,
  JuniorDashboardOverview,
  AdventureTimetableItem,
  JuniorBusRadar,
  ChestUnlockResponse,
  StudentPortfolio,
  HomeworkSubmission,
  OfficialDocument
} from '@/lib/types';
import { downloadOfficialDocumentFile } from '@/lib/export-utils';
import { api } from '@/lib/api';
import { JuniorSidebar, JuniorTab } from './JuniorSidebar';
import { LiveLaunchpad } from './LiveLaunchpad';
import { DailyQuests } from './DailyQuests';
import { MagicPowerBooster } from './MagicPowerBooster';
import { JuniorProfileCard } from './JuniorProfileCard';
import { CreativeCorner } from './CreativeCorner';
import { JuniorQuizModal, QuizQuestion } from './JuniorQuizModal';
import { JuniorRecordingsLibrary } from './JuniorRecordingsLibrary';
import { JuniorHolidaysCalendar } from './JuniorHolidaysCalendar';
import { JuniorHomeworkHub } from './JuniorHomeworkHub';
import { JuniorExamsHub } from './JuniorExamsHub';
import { JuniorTimetableHub } from './JuniorTimetableHub';
import { JuniorTrophyHub } from './JuniorTrophyHub';
import { JuniorNotificationDropdown } from './JuniorNotificationDropdown';
import { playStarCollect, playButtonClick } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

interface JuniorStudentDashboardProps {
  user: User;
  onSwitchToSecondary?: () => void;
  onLogout?: () => void;
}

const mathQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is 7 + 8?",
    options: [
      { label: "14", isCorrect: false },
      { label: "15", isCorrect: true, emoji: "⭐" },
      { label: "16", isCorrect: false },
      { label: "17", isCorrect: false }
    ],
    hint: "Think of 7 + 7 = 14, then add 1 more!",
    explanation: "7 plus 8 equals 15! Great math thinking!"
  },
  {
    id: 2,
    question: "Which shape has 3 sides and 3 corners?",
    options: [
      { label: "Square", isCorrect: false },
      { label: "Circle", isCorrect: false },
      { label: "Triangle", isCorrect: true, emoji: "📐" },
      { label: "Rectangle", isCorrect: false }
    ],
    hint: "Like a delicious slice of pizza!",
    explanation: "A triangle always has exactly 3 sides and 3 vertices!"
  },
  {
    id: 3,
    question: "What number comes right after 49?",
    options: [
      { label: "48", isCorrect: false },
      { label: "50", isCorrect: true, emoji: "🎉" },
      { label: "51", isCorrect: false },
      { label: "60", isCorrect: false }
    ],
    hint: "Counting forward: 48, 49...",
    explanation: "Fifty (50) is the next round number after 49!"
  },
  {
    id: 4,
    question: "If you have 12 apples and give away 4, how many are left?",
    options: [
      { label: "6", isCorrect: false },
      { label: "8", isCorrect: true, emoji: "🍎" },
      { label: "10", isCorrect: false },
      { label: "16", isCorrect: false }
    ],
    hint: "Count backwards: 12 minus 4",
    explanation: "12 - 4 = 8 juicy apples left in your basket!"
  },
  {
    id: 5,
    question: "Which number is greater: 65 or 56?",
    options: [
      { label: "65 is greater", isCorrect: true, emoji: "🏆" },
      { label: "56 is greater", isCorrect: false },
      { label: "They are equal", isCorrect: false },
      { label: "Cannot tell", isCorrect: false }
    ],
    hint: "Look at the tens place: 6 tens vs 5 tens",
    explanation: "65 has 6 tens which is larger than 5 tens in 56!"
  }
];

const englishQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Which word rhymes with 'Star'?",
    options: [
      { label: "Moon", isCorrect: false },
      { label: "Car", isCorrect: true, emoji: "🚗" },
      { label: "Sun", isCorrect: false },
      { label: "Sky", isCorrect: false }
    ],
    hint: "Listen to the end sound: -ar!",
    explanation: "Star and Car rhyme with the same -ar sound!"
  },
  {
    id: 2,
    question: "What is the opposite of 'Cold'?",
    options: [
      { label: "Freezing", isCorrect: false },
      { label: "Ice", isCorrect: false },
      { label: "Hot", isCorrect: true, emoji: "☀️" },
      { label: "Winter", isCorrect: false }
    ],
    hint: "Like a warm cup of cocoa on a sunny day!",
    explanation: "The antonym (opposite) of cold is hot!"
  },
  {
    id: 3,
    question: "Find the action verb in: 'The puppy jumped over the fence.'",
    options: [
      { label: "Puppy", isCorrect: false },
      { label: "Jumped", isCorrect: true, emoji: "🐕" },
      { label: "Over", isCorrect: false },
      { label: "Fence", isCorrect: false }
    ],
    hint: "What action did the puppy do?",
    explanation: "'Jumped' is the action doing-word (verb)!"
  },
  {
    id: 4,
    question: "Choose the word with the correct spelling:",
    options: [
      { label: "Beautifull", isCorrect: false },
      { label: "Beautiful", isCorrect: true, emoji: "🌸" },
      { label: "Beutiful", isCorrect: false },
      { label: "Beatiful", isCorrect: false }
    ],
    hint: "B-E-A-U-T-I-F-U-L",
    explanation: "Beautiful has single 'l' at the end: B-E-A-U-T-I-F-U-L!"
  },
  {
    id: 5,
    question: "What punctuation mark belongs at the end: 'Where is my pencil'?",
    options: [
      { label: ".", isCorrect: false },
      { label: "!", isCorrect: false },
      { label: "?", isCorrect: true, emoji: "❓" },
      { label: ",", isCorrect: false }
    ],
    hint: "It is asking a question!",
    explanation: "Questions always finish with a question mark (?)!"
  }
];

const scienceQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Which part of the plant absorbs water from the soil?",
    options: [
      { label: "Leaves", isCorrect: false },
      { label: "Flowers", isCorrect: false },
      { label: "Roots", isCorrect: true, emoji: "🌱" },
      { label: "Stem", isCorrect: false }
    ],
    hint: "They grow deep under the moist ground!",
    explanation: "Roots absorb water and nutrients from the soil!"
  },
  {
    id: 2,
    question: "Which animal is known as the 'Ship of the Desert'?",
    options: [
      { label: "Elephant", isCorrect: false },
      { label: "Camel", isCorrect: true, emoji: "🐪" },
      { label: "Horse", isCorrect: false },
      { label: "Lion", isCorrect: false }
    ],
    hint: "It has big humps and wide padded feet!",
    explanation: "Camels can travel long distances in the desert without water!"
  },
  {
    id: 3,
    question: "How many sense organs do humans have?",
    options: [
      { label: "3", isCorrect: false },
      { label: "4", isCorrect: false },
      { label: "5", isCorrect: true, emoji: "👀" },
      { label: "6", isCorrect: false }
    ],
    hint: "Eyes, ears, nose, tongue, and skin!",
    explanation: "Humans have 5 sensory organs to explore our world!"
  },
  {
    id: 4,
    question: "Which planet is known as the Red Planet?",
    options: [
      { label: "Earth", isCorrect: false },
      { label: "Mars", isCorrect: true, emoji: "🪐" },
      { label: "Jupiter", isCorrect: false },
      { label: "Venus", isCorrect: false }
    ],
    hint: "The 4th planet in our Solar System!",
    explanation: "Mars appears reddish because of iron oxide on its surface!"
  },
  {
    id: 5,
    question: "What gas do humans breathe in to live?",
    options: [
      { label: "Carbon Dioxide", isCorrect: false },
      { label: "Oxygen", isCorrect: true, emoji: "💨" },
      { label: "Nitrogen", isCorrect: false },
      { label: "Helium", isCorrect: false }
    ],
    hint: "Green trees give off this pure gas!",
    explanation: "We breathe in Oxygen (O2) and exhale Carbon Dioxide!"
  }
];


const defaultJuniorOverview: JuniorDashboardOverview = {
  student_id: 6,
  student_name: "Aarav Kumar",
  class_name: "Class 3-A",
  grade_tier: "k5",
  avatar_character_url: "https://api.dicebear.com/7.x/bottts/svg?seed=AaravJunior3D",
  profile: {
    id: 1,
    student_id: 6,
    level: 3,
    level_title: "Explorer",
    xp_points: 450,
    total_stars: 180,
    attendance_streak_days: 7,
    sound_effects_enabled: true
  },
  active_quests: [
    {
      id: 1,
      student_id: 6,
      title: "Count & Color 10 Stars in Chapter 2 Workbook",
      subject: "Math",
      xp_reward: 25,
      stars_reward: 50,
      status: "active",
      teacher_reaction: "Super Star! ⭐ - Ms. Priya",
      proof_image_url: null,
      due_date: "Today, 4:00 PM"
    },
    {
      id: 2,
      student_id: 6,
      title: "Draw and Name 3 Farm Animals",
      subject: "Art & Nature",
      xp_reward: 30,
      stars_reward: 60,
      status: "active",
      teacher_reaction: "Creative Genius! 🎨 - Ms. Neha",
      proof_image_url: null,
      due_date: "Today, 6:00 PM"
    },
    {
      id: 3,
      student_id: 6,
      title: "Read Aloud: The Magic Treehouse (Ch 1)",
      subject: "English Phonics",
      xp_reward: 20,
      stars_reward: 40,
      status: "completed",
      teacher_reaction: "Brilliant Pronunciation! 🌟 - Ms. Priya",
      proof_image_url: "/samples/storybook_audio_proof.png",
      due_date: "Yesterday"
    }
  ],
  magic_booster_chests: [
    {
      id: 1,
      student_id: 6,
      concept_title: "Number Counting & Phonics",
      day_number: 1,
      day_task_title: "Count 1 to 20 with Number Blocks",
      status: "completed_claimed",
      chest_stars: 30,
      parent_signed: true
    },
    {
      id: 2,
      student_id: 6,
      concept_title: "Number Counting & Phonics",
      day_number: 2,
      day_task_title: "Find & Circle 5 Rhyming Words",
      status: "ready_to_open",
      chest_stars: 30,
      parent_signed: true
    },
    {
      id: 3,
      student_id: 6,
      concept_title: "Number Counting & Phonics",
      day_number: 3,
      day_task_title: "Solve 3 Animal Addition Riddles",
      status: "locked",
      chest_stars: 40,
      parent_signed: false
    },
    {
      id: 4,
      student_id: 6,
      concept_title: "Number Counting & Phonics",
      day_number: 4,
      day_task_title: "Draw the Treasure Map & Spell 5 Words",
      status: "locked",
      chest_stars: 50,
      parent_signed: false
    }
  ],
  attendance_streak_days: 7,
  attendance_pct: 94.2,
  bus_route_id: 1
};

const defaultAdventureTimetable: AdventureTimetableItem[] = [
  { id: 1, time: "08:30 AM - 09:15 AM", title: "Alphabet Safari & Phonics Fun", subject: "English Phonics", island_theme: "Phonics Island", mascot_at_node: false, icon: "🦁", duration_mins: 45, teacher_name: "Ms. Priya Rao", room: "Safari Treehouse A", completed: true },
  { id: 2, time: "09:30 AM - 10:15 AM", title: "Magical Numbers & Star Shape Castle", subject: "Mathematics", island_theme: "Number Castle", mascot_at_node: true, icon: "🏰", duration_mins: 45, teacher_name: "Mrs. Ananya Verma", room: "Number Tower 2", completed: false },
  { id: 3, time: "10:30 AM - 11:00 AM", title: "Fruit Feast & Jungle Juice Break", subject: "Snack & Nutrition", island_theme: "Snack Oasis", mascot_at_node: false, icon: "🍎", duration_mins: 30, teacher_name: "Coach Ramesh", room: "Oasis Garden Lawn", completed: false },
  { id: 4, time: "11:15 AM - 12:00 PM", title: "Rainbow Finger Painting & Clay Animals", subject: "Creative Arts", island_theme: "Art Treehouse", mascot_at_node: false, icon: "🎨", duration_mins: 45, teacher_name: "Ms. Neha Kapoor", room: "Studio Color Splash", completed: false }
];

export function JuniorStudentDashboard({ user, onSwitchToSecondary, onLogout }: JuniorStudentDashboardProps) {
  const studentId = user.student_id || 6;
  const [activeTab, setActiveTab] = useState<JuniorTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Active Quiz Modal State
  const [activeQuizModal, setActiveQuizModal] = useState<{
    title: string;
    subject: string;
    questions: QuizQuestion[];
  } | null>(null);

  // Core Junior State
  const [overview, setOverview] = useState<JuniorDashboardOverview>(defaultJuniorOverview);
  const [timetable, setTimetable] = useState<AdventureTimetableItem[]>(defaultAdventureTimetable);
  const [busData, setBusData] = useState<JuniorBusRadar | null>(null);

  const [stars, setStars] = useState<number>(180);
  const [streakDays, setStreakDays] = useState<number>(7);
  const [level, setLevel] = useState<number>(3);
  const [levelTitle, setLevelTitle] = useState<string>('Explorer');

  // Academic PRD States for Junior Student
  const [homeworkFilter, setHomeworkFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [selectedFileForUpload, setSelectedFileForUpload] = useState<File | null>(null);
  const [isUploadingHomework, setIsUploadingHomework] = useState(false);
  const [homeworkSubmittedSuccess, setHomeworkSubmittedSuccess] = useState(false);
  const [portfolio, setPortfolio] = useState<StudentPortfolio[]>([]);
  const [portfolioFilter, setPortfolioFilter] = useState<'all' | 'participation' | 'achievement'>('all');
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [isUploadAwardModalOpen, setIsUploadAwardModalOpen] = useState(false);
  const [newAwardTitle, setNewAwardTitle] = useState('');
  const [newAwardEvent, setNewAwardEvent] = useState('');
  const [newAwardCategory, setNewAwardCategory] = useState<'achievement' | 'participation'>('achievement');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load backend data
  const loadDashboardData = async () => {
    try {
      const [ovData, ttData, portRes] = await Promise.all([
        api.getJuniorOverview(studentId),
        api.getAdventureTimetable(studentId),
        api.getPortfolio(1).catch(() => [])
      ]);

      setOverview(ovData);
      setTimetable(ttData);
      if (portRes && portRes.length > 0) {
        setPortfolio(portRes);
      } else {
        // Fallback default portfolio for Junior student
        setPortfolio([
          {
            id: 101,
            student_id: studentId,
            category: 'achievement',
            title: 'Junior Science & Nature Fair — 1st Place',
            event_name: 'Inter-House Primary STEM Expo 2026',
            date: 'March 2026',
            proof_url: '/samples/certificate_preview.png',
            verified_by_school: true,
            description: 'Built a working solar windmill ecosystem model with recycled components.'
          },
          {
            id: 102,
            student_id: studentId,
            category: 'achievement',
            title: 'Star Reader Medal (100 Books Challenge)',
            event_name: 'Oakridge Primary Reading Guild',
            date: 'February 2026',
            proof_url: '/samples/certificate_preview.png',
            verified_by_school: true,
            description: 'Completed 100 phonics storybooks with full comprehension stars.'
          },
          {
            id: 103,
            student_id: studentId,
            category: 'participation',
            title: 'Junior Annual Day — Choir & Theatrical Play',
            event_name: 'Annual School Showcase 2026',
            date: 'October 2026',
            proof_url: '/samples/certificate_preview.png',
            verified_by_school: true,
            description: 'Participated in the primary choir musical and stage ensemble.'
          },
          {
            id: 104,
            student_id: studentId,
            category: 'participation',
            title: 'Little Olympians 50m Sprint Relay',
            event_name: 'Primary Sports Meet 2026',
            date: 'January 2026',
            proof_url: '/samples/certificate_preview.png',
            verified_by_school: true,
            description: 'Represented Tigers House in the 50m sprint relay.'
          }
        ]);
      }

      if (ovData && ovData.profile) {
        setStars(ovData.profile.total_stars);
        setStreakDays(ovData.profile.attendance_streak_days);
        setLevel(ovData.profile.level);
        setLevelTitle(ovData.profile.level_title);
      }
    } catch (e) {
      console.error('Error loading junior dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [studentId]);

  // Handler for chest claiming
  const handleChestClaimed = (res: ChestUnlockResponse) => {
    setStars(res.total_stars);
    setLevel(res.level);
    setLevelTitle(res.level_title);
    triggerToast(`🎉 Magic Chest Unlocked! Level ${res.level} reached!`);
  };

  // Handler for quest completion
  const handleQuestCompleted = (questId: number) => {
    setStars((prev) => prev + 50);
    triggerToast('⭐ +50 Stars earned for completing quest!');
  };

  // Homework upload simulation
  const handleHomeworkSubmit = () => {
    if (!selectedFileForUpload) return;
    setIsUploadingHomework(true);
    setTimeout(() => {
      setIsUploadingHomework(false);
      setHomeworkSubmittedSuccess(true);
      setStars((prev) => prev + 30);
      playStarCollect();
      triggerToast('Worksheet submitted successfully! +30 Star Bonus!');
    }, 1200);
  };

  // Award upload submission
  const handleCreateAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAwardTitle.trim()) return;

    const newRecord: StudentPortfolio = {
      id: portfolio.length + 200,
      student_id: studentId,
      category: newAwardCategory,
      title: newAwardTitle,
      event_name: newAwardEvent,
      date: 'Oct 2026',
      proof_url: '/samples/certificate_preview.png',
      verified_by_school: false,
      description: 'Submitted certificate awaiting teacher verification.'
    };

    setPortfolio([newRecord, ...portfolio]);
    setIsUploadAwardModalOpen(false);
    setNewAwardTitle('');
    setNewAwardEvent('');
    playStarCollect();
    triggerToast('Certificate submitted! Awaiting teacher verification stamp.');
  };

  // Filtered portfolio
  const filteredPortfolio = portfolio.filter((item) => {
    const matchesCategory = portfolioFilter === 'all' || item.category === portfolioFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
      item.event_name.toLowerCase().includes(portfolioSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentOverview = overview || defaultJuniorOverview;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[url('/junior/junior_jungle_background.webp')] bg-cover bg-center bg-no-repeat text-[#0F172A] dark:text-slate-100 font-sans antialiased transition-colors duration-150">
      
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (Matching Reference Layout)     */}
      {/* ========================================================= */}
      <JuniorSidebar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          playButtonClick();
        }}
        starsCount={stars}
        streakDays={streakDays}
        level={level}
        levelTitle={levelTitle}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSwitchToSecondary={onSwitchToSecondary}
        onLogout={onLogout}
      />

      {/* ========================================================= */}
      {/* 2. MAIN SCROLLABLE CONTENT VIEWPORT                       */}
      {/* ========================================================= */}
      <main className="relative flex-1 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 space-y-5 bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-150">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="fixed top-20 right-8 z-50 flex items-center gap-3 rounded-2xl bg-[#0F172A] text-white px-4 py-3 shadow-2xl border border-amber-400/50 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Framing Header Bar with Top Hanging Monkey and 'Let\'s Learn & Grow!' sign from Reference Image */}
        <div className="relative flex items-center justify-between pb-1 select-none">
          {/* Left: Greeting & Class Tag */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              <span>Welcome back, {user.name}!</span>
              <span className="text-2xl select-none">🌟</span>
            </h1>
            <span className="hidden sm:inline-flex px-3.5 py-1 rounded-full bg-[#FEF08A] hover:bg-[#FDE047] text-amber-900 text-xs font-black border border-amber-300 shadow-2xs items-center gap-1.5 cursor-pointer">
              <span>⭐</span>
              <span>CBSE Class 3-A</span>
            </span>
          </div>

          {/* Center: Cute Hanging Monkey from Reference Image */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 -top-2 z-20 pointer-events-none">
            <img
              src="/junior/extracted/top_hanging_monkey.png"
              alt="Hanging monkey mascot"
              className="h-16 w-auto object-contain drop-shadow-md animate-monkey-swing"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Right: Top Controls & Hanging Wooden Sign matching Reference Image */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Star Coins Widget */}
            <div className="flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-amber-300 px-3 py-1.5 shadow-sm text-xs font-black text-amber-900 dark:text-amber-300">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              <span>{stars}</span>
            </div>

            {/* Gamified Junior Notification Dropdown */}
            <JuniorNotificationDropdown
              studentName={user.name}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                playButtonClick();
              }}
              onEarnStars={(earned) => {
                setStars((prev) => prev + earned);
              }}
              onShowToast={(msg) => triggerToast(msg)}
            />

            {/* Student Profile Pill & Interactive Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setProfileDropdownOpen((prev) => !prev);
                }}
                className="flex items-center gap-2 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 py-1 pl-1.5 pr-3 shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.02] text-slate-800 dark:text-slate-100"
                title="View Student Passport & Profile"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center text-xs shadow-xs border border-white">
                  👦
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none">
                    {user.name}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                    Class 3-A
                  </span>
                </div>
                <ChevronDown className={`h-3 w-3 text-slate-400 ml-0.5 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-3xl border-2 border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-pink-500 flex items-center justify-center text-2xl shadow-md border-2 border-white dark:border-slate-800">
                        👦
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {user.name}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[9px] font-black">
                            Lvl {level}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          Class 3-A • Roll #06 • CBSE Primary
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          ID: {user.school_code || 'EDU-GLOBAL-360'}
                        </p>
                      </div>
                    </div>

                    {/* Mini Stats Banner */}
                    <div className="grid grid-cols-2 gap-2 p-2 rounded-2xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-200/50 dark:border-slate-700/50 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                        <div className="text-left">
                          <div className="text-xs font-black text-amber-900 dark:text-amber-300">{stars}</div>
                          <div className="text-[9px] font-bold text-amber-700/80 dark:text-amber-400/80">Stars Banked</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 border-l border-amber-200 dark:border-slate-700 pl-2">
                        <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
                        <div className="text-left">
                          <div className="text-xs font-black text-orange-900 dark:text-orange-300">{streakDays} Days</div>
                          <div className="text-[9px] font-bold text-orange-700/80 dark:text-orange-400/80">Quest Streak</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Jump Links */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          playButtonClick();
                          setActiveTab('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">🎒</span>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                              My Explorer Passport
                            </div>
                            <div className="text-[10px] text-slate-400">View ID card, badges & bus tracker</div>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        onClick={() => {
                          playButtonClick();
                          setActiveTab('badges');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">🏆</span>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                              Trophies & Treasure Chests
                            </div>
                            <div className="text-[10px] text-slate-400">Open unlocked magic chests</div>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        onClick={() => {
                          playButtonClick();
                          setActiveTab('timetable');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">📅</span>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                              Adventure Timetable
                            </div>
                            <div className="text-[10px] text-slate-400">Explore today's class schedule</div>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        onClick={() => {
                          playButtonClick();
                          setActiveTab('exams');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">📝</span>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                              Exams & Quizzes Hub
                            </div>
                            <div className="text-[10px] text-slate-400">Practice questions & datesheets</div>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        onClick={() => {
                          playButtonClick();
                          setActiveTab('holidays');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">🏖️</span>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                              School Holidays Calendar
                            </div>
                            <div className="text-[10px] text-slate-400">Festivals and upcoming vacations</div>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Divider & Sign Out */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          playButtonClick();
                          setProfileDropdownOpen(false);
                          if (onLogout) {
                            onLogout();
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out (Log Out)</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Hanging Wooden Sign 'Let\'s Learn & Grow!' from Reference */}
            <div className="animate-sign-sway">
              <img
                src="/junior/extracted/top_right_sign.png"
                alt="Let's Learn & Grow!"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>


      {/* ========================================================
          VIEW 1: DASHBOARD / ADVENTURE HUB (LAUNCHPAD)
      ======================================================== */}
      {(activeTab === 'dashboard' || activeTab === 'launchpad') && (
        <div className="space-y-6">
          <LiveLaunchpad
            studentName={user.name}
            timetable={timetable}
            onOpenQuests={() => setActiveTab('adventures')}
            onEarnStars={(earned) => setStars((prev) => prev + earned)}
          />
        </div>
      )}

      {/* ========================================================
          VIEW 2: TODAY'S ADVENTURES (DAILY QUESTS)
      ======================================================== */}
      {(activeTab === 'adventures' || activeTab === 'quests') && (
        <DailyQuests
          studentId={studentId}
          quests={currentOverview.active_quests}
          onQuestCompleted={handleQuestCompleted}
          onEarnStars={(earned) => setStars((prev) => prev + earned)}
        />
      )}

        {/* ========================================================
            VIEW 3: MAGIC POWER BOOSTER
        ======================================================== */}
        {activeTab === 'booster' && (
          <MagicPowerBooster
            studentId={studentId}
            chests={currentOverview.magic_booster_chests}
            onChestClaimed={handleChestClaimed}
          />
        )}

        {/* ========================================================
            VIEW 4: CREATIVE CORNER (ART & ACTIVITY SHOWCASE)
        ======================================================== */}
        {activeTab === 'creative' && (
          <CreativeCorner />
        )}

        {/* ========================================================
            VIEW 5: EXPLORER SIS IDENTITY CARD
        ======================================================== */}
        {activeTab === 'profile' && (
          <JuniorProfileCard
            user={user}
            profile={currentOverview.profile}
          />
        )}

        {/* ========================================================
            VIEW 6: JUNIOR HOMEWORK HUB (SUBJECT-WISE & DATE-WISE)
        ======================================================== */}
        {activeTab === 'homework' && (
          <JuniorHomeworkHub
            studentName={user.name}
            onEarnStars={(earned) => setStars((prev) => prev + earned)}
            onShowToast={(msg) => triggerToast(msg)}
          />
        )}

        {/* ========================================================
            VIEW 7: CLASS RECORDINGS LIBRARY (REPLAYS)
        ======================================================== */}
        {activeTab === 'recordings' && (
          <JuniorRecordingsLibrary
            studentName={user.name}
            onEarnStars={(earned) => {
              setStars((prev) => prev + earned);
            }}
            onShowToast={(msg) => triggerToast(msg)}
          />
        )}

        {/* ========================================================
            VIEW 8: EXAMS & TIMETABLE HUB (SCHEDULE & QUIZZES)
        ======================================================== */}
        {activeTab === 'exams' && (
          <JuniorExamsHub
            studentName={user.name}
            onEarnStars={(earned) => setStars((prev) => prev + earned)}
            onShowToast={(msg) => triggerToast(msg)}
            mathQuizQuestions={mathQuizQuestions}
            englishQuizQuestions={englishQuizQuestions}
            scienceQuizQuestions={scienceQuizQuestions}
          />
        )}

        {/* ========================================================
            VIEW 9: BADGES & TROPHY ROOM (+ MAGIC BOOSTER & PORTFOLIO)
        ======================================================== */}
        {activeTab === 'badges' && (
          <JuniorTrophyHub
            user={user}
            stars={stars}
            level={level}
            levelTitle={levelTitle}
            studentId={studentId}
            chests={currentOverview.magic_booster_chests}
            portfolio={portfolio}
            onChestClaimed={handleChestClaimed}
            onOpenUploadCertificate={() => setIsUploadAwardModalOpen(true)}
            onShowToast={(msg) => triggerToast(msg)}
          />
        )}

        {/* ========================================================
            VIEW 10: HOLIDAYS CALENDAR (FESTIVALS & BREAKS)
        ======================================================== */}
        {activeTab === 'holidays' && (
          <JuniorHolidaysCalendar />
        )}

        {/* ========================================================
            VIEW 11: CLASS TIMETABLE (MATCHING TARGET JUNGLE REFERENCE)
        ======================================================== */}
        {activeTab === 'timetable' && (
          <JuniorTimetableHub
            studentName={user.name}
            onOpenLiveClass={() => {
              setActiveTab('dashboard');
              triggerToast("Launching into Mrs. Ananya Verma's Class! 🚀");
            }}
            onEarnStars={(earned) => setStars((prev) => prev + earned)}
          />
        )}

      </main>

      {/* Upload Award Modal */}
      {isUploadAwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-300 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-purple-600" />
                Upload Achievement Certificate
              </h3>
              <button
                onClick={() => setIsUploadAwardModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAward} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Award / Certificate Title
                </label>
                <input
                  type="text"
                  value={newAwardTitle}
                  onChange={(e) => setNewAwardTitle(e.target.value)}
                  placeholder="e.g. 1st Place Inter-School Math Kangaroo"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Issuing Event or Institution
                </label>
                <input
                  type="text"
                  value={newAwardEvent}
                  onChange={(e) => setNewAwardEvent(e.target.value)}
                  placeholder="e.g. State Science Olympiad Committee"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadAwardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-md cursor-pointer"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Star Quiz Modal */}
      {activeQuizModal && (
        <JuniorQuizModal
          isOpen={true}
          onClose={() => setActiveQuizModal(null)}
          quizTitle={activeQuizModal.title}
          subject={activeQuizModal.subject}
          questions={activeQuizModal.questions}
          onQuizCompleted={(score: number, starsEarned: number) => {
            setStars((prev) => prev + starsEarned);
            playStarCollect();
            triggerToast(`🏆 Star Quiz Completed! You scored ${score} and won +${starsEarned} Stars!`);
          }}
        />
      )}

    </div>
  );
}
