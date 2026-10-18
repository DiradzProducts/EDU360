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
import { api } from '@/lib/api';
import { JuniorSidebar, JuniorTab } from './JuniorSidebar';
import { LiveLaunchpad } from './LiveLaunchpad';
import { DailyQuests } from './DailyQuests';
import { MagicPowerBooster } from './MagicPowerBooster';
import { JuniorProfileCard } from './JuniorProfileCard';
import { YellowBusRadar } from './YellowBusRadar';
import { playStarCollect, playButtonClick } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

interface JuniorStudentDashboardProps {
  user: User;
  onSwitchToSecondary?: () => void;
  onLogout?: () => void;
}

export function JuniorStudentDashboard({ user, onSwitchToSecondary, onLogout }: JuniorStudentDashboardProps) {
  const studentId = user.student_id || 6;
  const [activeTab, setActiveTab] = useState<JuniorTab>('launchpad');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

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
      const [ovData, ttData, busRes, portRes] = await Promise.all([
        api.getJuniorOverview(studentId),
        api.getAdventureTimetable(studentId),
        api.getJuniorBusRadar(studentId),
        api.getPortfolio(1).catch(() => [])
      ]);

      setOverview(ovData);
      setTimetable(ttData);
      setBusData(busRes);
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

  if (loading || !overview || !busData) {
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
          Loading Island Roadmap, Magic Chests, and Bus Telemetry!
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

        {/* Welcome Greeting Strip with Quick Jumper Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-100 via-pink-100 to-sky-100 dark:from-amber-950/40 dark:via-pink-950/40 dark:to-sky-950/40 rounded-3xl p-4 sm:p-5 px-6 border-2 border-amber-200 dark:border-amber-900/50 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-md text-2xl shrink-0">
              ⭐
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                Welcome to Adventure Island, {user.name}! 🌟
              </h2>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                You have <b>2 quests</b> waiting and Bus #4 is <b>2 stops away</b>!
              </p>
            </div>
          </div>

          {/* Quick Tab Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'launchpad' as JuniorTab, label: '🚀 Launchpad', activeBg: 'bg-sky-600 text-white' },
              { id: 'quests' as JuniorTab, label: '📝 Quests', activeBg: 'bg-pink-600 text-white' },
              { id: 'booster' as JuniorTab, label: '🎁 Magic Booster', activeBg: 'bg-purple-600 text-white' },
              { id: 'bus' as JuniorTab, label: '🚌 Bus Radar', activeBg: 'bg-yellow-500 text-slate-950' },
              { id: 'homework' as JuniorTab, label: '📚 Homework', activeBg: 'bg-amber-600 text-white' },
              { id: 'profile' as JuniorTab, label: '🎖️ Explorer SIS', activeBg: 'bg-emerald-600 text-white' }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => {
                  playButtonClick();
                  setActiveTab(pill.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === pill.id
                    ? `${pill.activeBg} shadow-md`
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================
            VIEW 1: ADVENTURE HUB (LAUNCHPAD)
        ======================================================== */}
        {activeTab === 'launchpad' && (
          <LiveLaunchpad
            studentName={user.name}
            timetable={timetable}
            onOpenQuests={() => setActiveTab('quests')}
          />
        )}

        {/* ========================================================
            VIEW 2: DAILY QUESTS
        ======================================================== */}
        {activeTab === 'quests' && (
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
            VIEW 4: YELLOW BUS RADAR
        ======================================================== */}
        {activeTab === 'bus' && (
          <YellowBusRadar
            busData={busData}
          />
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
            VIEW 6: PRD HOMEWORK & TASKS
        ======================================================== */}
        {activeTab === 'homework' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 text-xs font-bold border border-amber-200 dark:border-amber-800">
                    Junior Homework Hub
                  </span>
                  <span className="text-xs text-slate-500">Class 3-A Assignments</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Worksheets, Activities &amp; Teacher Corrections
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {(['all', 'pending', 'graded'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setHomeworkFilter(filter)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer ${
                      homeworkFilter === filter
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {filter === 'all' ? 'All (3)' : filter === 'pending' ? 'Pending (1)' : 'Graded (2)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Task 1: Pending Addition with Regrouping Worksheet */}
              {(homeworkFilter === 'all' || homeworkFilter === 'pending') && (
                <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-amber-100 dark:border-amber-900/40 pb-3">
                    <div>
                      <span className="rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                        Mathematics
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        Double-Digit Addition with Regrouping (Star Shapes Worksheet #3)
                      </h3>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> Due Tomorrow, 5:00 PM • +30 Stars Reward
                      </span>
                    </div>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 text-xs font-bold">
                      Pending
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Complete Problems 1 to 10 on the regrouping sheet. Remember to place the carry-over tens in the star box at the top. Photograph or scan your finished page and upload below!
                  </p>

                  {/* Drop-zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 hover:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 p-6 text-center transition-all hover:bg-amber-50 dark:hover:bg-amber-950/30 group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFileForUpload(e.target.files[0]);
                        }
                      }}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                    <Upload className="mx-auto h-7 w-7 text-amber-500 group-hover:scale-110 transition-transform mb-1" />
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                      {selectedFileForUpload ? selectedFileForUpload.name : 'Click to Browse or Drag & Drop Worksheet here'}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {selectedFileForUpload ? `${(selectedFileForUpload.size / 1024).toFixed(1)} KB ready` : 'Image or PDF (Max 15MB)'}
                    </p>
                  </div>

                  {selectedFileForUpload && (
                    <button
                      onClick={handleHomeworkSubmit}
                      disabled={isUploadingHomework}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-bold py-2.5 text-xs shadow-md transition-all cursor-pointer"
                    >
                      {isUploadingHomework ? 'Submitting to Teacher...' : '🚀 Submit Worksheet for Grading (+30 Stars)'}
                    </button>
                  )}
                </div>
              )}

              {/* Task 2: Graded Worksheet with Inline Teacher Corrections */}
              {(homeworkFilter === 'all' || homeworkFilter === 'graded') && (
                <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-emerald-100 dark:border-emerald-900/40 pb-3">
                    <div>
                      <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                        Phonics &amp; Reading
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        Vowel Digraphs &amp; Rhyming Sentences
                      </h3>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Graded by Ms. Priya • Score: 20/20 ⭐
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                      Graded
                    </span>
                  </div>

                  {/* Teacher Feedback Note */}
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 block">
                      Teacher Remark &amp; Inline Corrections
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                      &quot;Super handwriting, Aarav! All 10 vowel digraphs identified correctly. Perfect star score! 🌟&quot;
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-5 w-5 text-emerald-500" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Phonics_W3_Corrected.pdf</span>
                        <span className="text-[10px] text-slate-500">Annotated with 10 Green Ticks</span>
                      </div>
                    </div>
                    <button
                      onClick={() => triggerToast('Opening Annotated Homework PDF')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      View Corrections
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 7: PRD EXAMS & REPORT CARDS
        ======================================================== */}
        {activeTab === 'exams' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-800">
                Official Academic Assessment
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Term 1 Report Card &amp; Subject Evaluations
              </h1>
            </div>

            {/* Overall Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Term Aggregate</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">88.5%</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> Grade A (Distinction)
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Class Rank</span>
                <span className="text-2xl font-black text-amber-500 mt-1 block">Rank #3</span>
                <span className="text-[10px] text-slate-500 block mt-1">Class 3-A (28 Students)</span>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Stars Awarded</span>
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">180 ⭐</span>
                <span className="text-[10px] text-slate-500 block mt-1">Explorer Level 3</span>
              </div>
            </div>

            {/* Subject Breakdown Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Primary Subject Scores &amp; Faculty Remarks
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold bg-white dark:bg-slate-900">
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Score</th>
                      <th className="p-3.5">Grade</th>
                      <th className="p-3.5">Teacher Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { sub: 'Mathematics & Logic', score: '46 / 50', grade: 'A1', remark: 'Brilliant spatial geometry and number patterns.' },
                      { sub: 'Phonics & English Storytelling', score: '48 / 50', grade: 'A1', remark: 'Enthusiastic reader; expressive vocabulary.' },
                      { sub: 'Environmental Science (EVS)', score: '44 / 50', grade: 'A2', remark: 'Great curiosity about plants and ecosystems.' },
                      { sub: 'Creative Art & Clay', score: '49 / 50', grade: 'A1+', remark: 'Outstanding imagination in the color wheel project.' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{row.sub}</td>
                        <td className="p-3.5 font-black text-slate-900 dark:text-white">{row.score}</td>
                        <td className="p-3.5 font-bold">
                          <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px]">
                            {row.grade}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400">{row.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 9: PRD DUAL PORTFOLIO (PARTICIPATIONS & ACHIEVEMENTS)
        ======================================================== */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-3 py-1 text-xs font-bold border border-purple-200 dark:border-purple-800">
                  <Trophy className="h-3.5 w-3.5" />
                  Primary Outcomes Portfolio
                </span>
                <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Side-by-Side Participations &amp; Achievements
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  School events &amp; sports on the left; verified badges &amp; certificates on the right.
                </p>
              </div>

              <button
                onClick={() => setIsUploadAwardModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>[+ Upload Achievement Certificate]</span>
              </button>
            </div>

            {/* 50/50 Dual Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Participations (Left 50%) */}
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-blue-100 dark:border-blue-900/40 pb-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Official School Participations
                    </h3>
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
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Verified Medals &amp; Certificates
                    </h3>
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
        )}

        {/* ========================================================
            VIEW 10: PRD TIMETABLE
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

        {/* ========================================================
            VIEW 11: PRD OFFICIAL DOCUMENTS VAULT (VIEW ONLY)
        ======================================================== */}
        {activeTab === 'vault' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 px-2.5 py-0.5 text-xs font-bold border border-slate-300 dark:border-slate-700">
                Official SIS Repository
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Official Documents Vault (View Only)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Strict Security Rule: Official student records are locked. Only Administration can upload or update documents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: 'Student ID Card (2026-27)', type: 'Official ID Proof', date: 'April 2026' },
                { title: 'Bonafide Certificate', type: 'CBSE Institutional Record', date: 'March 2026' },
                { title: 'Birth Certificate (Verified)', type: 'Legal Identification Record', date: 'Permanent' }
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <FolderLock className="h-6 w-6 text-slate-400" />
                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      <Lock className="h-2.5 w-2.5" /> View Only
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{doc.type} • {doc.date}</span>
                  </div>
                  <button
                    onClick={() => triggerToast(`Downloading verified ${doc.title}`)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </button>
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

    </div>
  );
}
