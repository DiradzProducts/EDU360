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
  Check
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

export function JuniorStudentDashboard({ user, onSwitchToSecondary, onLogout }: JuniorStudentDashboardProps) {
  const studentId = user.student_id || 6;
  const [activeTab, setActiveTab] = useState<JuniorTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active Quiz Modal State
  const [activeQuizModal, setActiveQuizModal] = useState<{
    title: string;
    subject: string;
    questions: QuizQuestion[];
  } | null>(null);

  // Core Junior State
  const [overview, setOverview] = useState<JuniorDashboardOverview | null>(null);
  const [timetable, setTimetable] = useState<AdventureTimetableItem[]>([]);
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

  if (loading || !overview) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-gradient-to-b from-sky-50 via-amber-50 to-pink-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-400 text-4xl shadow-2xl animate-bounce">
          🚀
          <span className="absolute -top-2 -right-2 text-xl animate-spin">✨</span>
        </div>
        <h2 className="text-xl font-black text-slate-800 mt-4 tracking-tight">
          Packing {user.name}'s Explorer Backpack...
        </h2>
        <p className="text-xs font-bold text-slate-500 mt-1">
          Loading Live Class Rocket, Star Vault, and Daily Adventures!
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#070B14] text-[#0F172A] dark:text-slate-100 font-sans antialiased transition-colors duration-150">
      
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (Matching other roles layout) */}
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
      <main className="flex-1 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="fixed top-20 right-8 z-50 flex items-center gap-3 rounded-2xl bg-[#0F172A] text-white px-4 py-3 shadow-2xl border border-amber-400/50 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Welcome Greeting Strip (Clean - Left Sidebar Handles All Navigation) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-100 via-pink-100 to-sky-100 dark:from-amber-950/40 dark:via-pink-950/40 dark:to-sky-950/40 rounded-3xl p-5 px-6 border-2 border-amber-200 dark:border-amber-900/50 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-md text-2xl shrink-0">
              ⭐
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                Welcome to Adventure Island, {user.name}! 🌟
              </h2>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                Next live class is <b>Mathematics with Ms. Priya</b> at 10:00 AM • <b>3 daily adventures</b> waiting!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-black shadow-xs flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CBSE Class 3-A • Term 2</span>
            </span>
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
          />

          {/* Quick Academic Hub Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              onClick={() => setActiveTab('adventures')}
              className="cursor-pointer group rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-900/40 p-5 hover:shadow-md transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">🧭</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full">
                  3 Quests Active
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-3 group-hover:text-amber-600 transition-colors">
                Today&apos;s Adventures
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Complete daily missions in Math &amp; Phonics to earn bonus stars!
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 mt-3">
                <span>Start Daily Quest</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('recordings')}
              className="cursor-pointer group rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 border-2 border-rose-200 dark:border-rose-900/40 p-5 hover:shadow-md transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">🎬</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded-full">
                  6 Replays Ready
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-3 group-hover:text-rose-600 transition-colors">
                Class Recordings Library
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Missed a live session? Watch video replays anytime &amp; claim curiosity stars.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 mt-3">
                <span>Explore Replays</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('exams')}
              className="cursor-pointer group rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 border-2 border-purple-200 dark:border-purple-900/40 p-5 hover:shadow-md transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">🏆</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2.5 py-0.5 rounded-full">
                  Star Challenges
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-3 group-hover:text-purple-600 transition-colors">
                Interactive Star Quizzes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Voice-guided challenges in Math, English &amp; Science with instant feedback!
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 mt-3">
                <span>Play Star Quiz</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 2: TODAY'S ADVENTURES (DAILY QUESTS)
      ======================================================== */}
      {(activeTab === 'adventures' || activeTab === 'quests') && (
        <DailyQuests
          studentId={studentId}
          quests={overview.active_quests}
          onQuestCompleted={handleQuestCompleted}
        />
      )}

        {/* ========================================================
            VIEW 3: MAGIC POWER BOOSTER
        ======================================================== */}
        {activeTab === 'booster' && (
          <MagicPowerBooster
            studentId={studentId}
            chests={overview.magic_booster_chests}
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
            profile={overview.profile}
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
            onEarnStars={(earned) => {
              setStars((prev) => prev + earned);
              triggerToast(`⭐ +${earned} Curiosity Stars for watching class replay!`);
            }}
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
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 text-xs font-bold border border-amber-200 dark:border-amber-800">
                  <Trophy className="h-3.5 w-3.5 text-amber-600" />
                  Explorer Badges &amp; Trophy Room
                </span>
                <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user.name}&apos;s Hall of Fame &amp; Rewards 🏆
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Unlock trophies by completing live classes, daily quests, and star challenges!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 px-4 py-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Stars</span>
                    <span className="text-base font-black text-amber-900 dark:text-amber-200">{stars} Stars</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsUploadAwardModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>[+ Upload Certificate]</span>
                </button>
              </div>
            </div>

            {/* Level 3 Progression Card */}
            <div className="rounded-3xl border-2 border-amber-200 dark:border-amber-800/80 bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 dark:from-amber-950/20 dark:via-pink-950/20 dark:to-purple-950/20 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-3xl shadow-md border-b-4 border-amber-600">
                    🦊
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-amber-500 text-white px-2 py-0.5 text-[10px] font-black uppercase">
                        Level {level}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {levelTitle} {user.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      120 more stars to unlock <b>Level 4: Little Astronaut 🚀</b>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-500">180 / 300 Stars</span>
                  <div className="w-48 sm:w-60 h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(180 / 300) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Badges Grid */}
            <div>
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Unlocked Achievement Badges (6 of 9)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                {[
                  { name: 'Star Reader', icon: '📚', desc: 'Read 20 Phonics books', unlocked: true },
                  { name: 'Math Wizard', icon: '🧮', desc: 'Perfect addition quiz', unlocked: true },
                  { name: '7-Day Streak', icon: '🔥', desc: 'Attended live daily', unlocked: true },
                  { name: 'Little Picasso', icon: '🎨', desc: 'Creative corner art', unlocked: true },
                  { name: 'Eco Ranger', icon: '🌱', desc: 'Science fair winner', unlocked: true },
                  { name: 'Quiz Master', icon: '🏆', desc: '3 Star quizzes done', unlocked: true },
                  { name: 'Speed Solver', icon: '⚡', desc: 'Solve in 30 seconds', unlocked: false },
                  { name: 'Kind Helper', icon: '🤝', desc: 'Helped classmate', unlocked: false },
                  { name: 'Grand Master', icon: '👑', desc: 'Reach Level 10', unlocked: false }
                ].map((badge, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 text-center transition-all ${
                      badge.unlocked
                        ? 'border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 shadow-xs hover:scale-105'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-50'
                    }`}
                  >
                    <div className="text-3xl mb-1.5">{badge.icon}</div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block truncate">
                      {badge.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">
                      {badge.desc}
                    </span>
                    <span
                      className={`mt-2 inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        badge.unlocked
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {badge.unlocked ? 'Unlocked ✓' : 'Locked 🔒'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Magic Power Booster Chests Section */}
            <div className="pt-2">
              <MagicPowerBooster
                studentId={studentId}
                chests={overview.magic_booster_chests}
                onChestClaimed={handleChestClaimed}
              />
            </div>

            {/* Side-by-Side Dual Outcomes Portfolio */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    School Participations &amp; Verified Certificates
                  </h3>
                  <p className="text-xs text-slate-500">Official portfolio record for K–5 development</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Participations (Left 50%) */}
                <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-blue-100 dark:border-blue-900/40 pb-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold">
                      <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Official School Participations
                      </h4>
                      <span className="text-[10px] text-slate-500">Events, Assemblies, and Sports</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredPortfolio
                      .filter((p) => p.category === 'participation')
                      .map((item) => (
                        <div key={item.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.title}</span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">{item.description}</p>
                          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 block">{item.event_name} • {item.date}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Achievements (Right 50%) */}
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-amber-100 dark:border-amber-900/40 pb-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Trophy className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Verified Medals &amp; Certificates
                      </h4>
                      <span className="text-[10px] text-slate-500">Uploaded Certificates &amp; Awards</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredPortfolio
                      .filter((p) => p.category === 'achievement')
                      .map((item) => (
                        <div key={item.id} className="p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</span>
                            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-2 py-0.5">
                              Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">{item.description}</p>
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 block">{item.event_name} • {item.date}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 10: HOLIDAYS CALENDAR (FESTIVALS & BREAKS)
        ======================================================== */}
        {activeTab === 'holidays' && (
          <JuniorHolidaysCalendar />
        )}

        {/* ========================================================
            VIEW 11: CLASS TIMETABLE
        ======================================================== */}
        {activeTab === 'timetable' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                Weekly Class Schedule
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Class 3-A Adventure Timetable
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timetable.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                      P{item.period_number ?? item.id}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{item.time_slot ?? item.time}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.subject}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Teacher: {item.teacher_name}</p>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block mt-1">
                      {item.room_or_link ?? item.room}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
