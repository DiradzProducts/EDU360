'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video,
  Play,
  Pause,
  Clock,
  Sparkles,
  Calendar,
  X,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Star,
  Award,
  Filter,
  Search,
  BookOpen,
  Download,
  PartyPopper,
  Check,
  CheckCheck,
  HelpCircle,
  Film,
  Layers,
  ChevronRight,
  Flame,
  Lightbulb,
  Maximize2
} from 'lucide-react';
import { playButtonClick, playStarCollect, playFanfare } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

export type SubjectCategory = 'Mathematics' | 'Science' | 'English' | 'Art' | 'Hindi';

export interface ClassRecordingItem {
  id: string;
  title: string;
  subject: SubjectCategory;
  subjectLabel: string;
  subjectBadgeColor: string;
  subjectTheme: {
    border: string;
    bg: string;
    bannerGradient: string;
    text: string;
    accent: string;
    btn: string;
  };
  subjectIcon: string;
  chapter: string;
  unitNumber: number;
  teacherName: string;
  teacherRole: string;
  teacherAvatar: string;
  duration: string;
  durationMins: number;
  date: string;
  thumbnailUrl: string;
  videoUrl: string;
  keyTakeaway: string;
  category: 'story' | 'concept' | 'activity';
  summaryPdfName: string;
  quizQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface JuniorRecordingsLibraryProps {
  studentName?: string;
  onEarnStars?: (stars: number) => void;
  onShowToast?: (message: string) => void;
}

const defaultRecordings: ClassRecordingItem[] = [
  // ===================== MATHEMATICS =====================
  {
    id: 'rec-math-1',
    title: 'Chapter 4: Double Digit Regrouping with Stars',
    subject: 'Mathematics',
    subjectLabel: 'MATHEMATICS',
    subjectBadgeColor: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    subjectTheme: {
      border: 'border-blue-300 dark:border-blue-800',
      bg: 'bg-blue-50/40 dark:bg-blue-950/20',
      bannerGradient: 'from-blue-600 to-indigo-700 text-white',
      text: 'text-blue-900 dark:text-blue-200',
      accent: 'bg-blue-600',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_0_0_#1d4ed8]'
    },
    subjectIcon: '🧮',
    chapter: 'Unit 4 • Addition Magic',
    unitNumber: 4,
    teacherName: 'Mrs. Ananya Verma',
    teacherRole: 'Senior Mathematics Specialist',
    teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AnanyaMath',
    duration: '32 mins',
    durationMins: 32,
    date: 'Yesterday at 10:00 AM • Class 3-A',
    thumbnailUrl: '/junior/extracted/rec_thumb_math.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    keyTakeaway: 'Always place the carry-over ten in the top star box before adding the tens column digits!',
    category: 'concept',
    summaryPdfName: 'Math_Ch4_Regrouping_Stars_Summary.pdf',
    quizQuestion: {
      question: 'Where do we write the carry-over ten when adding double digits?',
      options: [
        'In the top star box above the tens column ⭐',
        'At the very bottom of the notebook',
        'In our school pencil box'
      ],
      correctIndex: 0,
      explanation: 'Super job! Carrying over into the top star box makes adding double digits 100% accurate!'
    }
  },
  {
    id: 'rec-math-2',
    title: 'Chapter 5: 2D & 3D Shapes Safari (Cubes & Cones)',
    subject: 'Mathematics',
    subjectLabel: 'MATHEMATICS',
    subjectBadgeColor: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    subjectTheme: {
      border: 'border-blue-300 dark:border-blue-800',
      bg: 'bg-blue-50/40 dark:bg-blue-950/20',
      bannerGradient: 'from-blue-600 to-indigo-700 text-white',
      text: 'text-blue-900 dark:text-blue-200',
      accent: 'bg-blue-600',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_0_0_#1d4ed8]'
    },
    subjectIcon: '🧮',
    chapter: 'Unit 5 • Spatial Geometry',
    unitNumber: 5,
    teacherName: 'Mrs. Ananya Verma',
    teacherRole: 'Senior Mathematics Specialist',
    teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AnanyaMath',
    duration: '28 mins',
    durationMins: 28,
    date: '3 days ago at 11:30 AM • Class 3-A',
    thumbnailUrl: '/junior/extracted/storybook_2_math.png',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    keyTakeaway: 'A cube has 6 flat square faces and 8 corners; a sphere rolls smoothly with zero corners.',
    category: 'concept',
    summaryPdfName: 'Math_Ch5_3D_Shapes_Safari_Summary.pdf',
    quizQuestion: {
      question: 'How many flat square faces does a cube toy block have?',
      options: [
        '4 faces',
        '6 flat faces 🎲',
        '10 faces'
      ],
      correctIndex: 1,
      explanation: 'Brilliant! A cube has 6 identical square faces, 12 straight edges, and 8 vertices!'
    }
  },

  // ===================== EVS & SCIENCE =====================
  {
    id: 'rec-sci-1',
    title: 'Unit 2: How Little Seeds Drink Water & Sprout',
    subject: 'Science',
    subjectLabel: 'EVS & NATURE',
    subjectBadgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    subjectTheme: {
      border: 'border-emerald-300 dark:border-emerald-800',
      bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
      bannerGradient: 'from-emerald-600 to-teal-700 text-white',
      text: 'text-emerald-900 dark:text-emerald-200',
      accent: 'bg-emerald-600',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_0_0_#047857]'
    },
    subjectIcon: '🍃',
    chapter: 'Unit 2 • Plant Kingdom',
    unitNumber: 2,
    teacherName: 'Mr. Rakesh Sharma',
    teacherRole: 'Environmental Science Explorer',
    teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RakeshEVS',
    duration: '35 mins',
    durationMins: 35,
    date: '3 days ago at 01:00 PM • Class 3-A',
    thumbnailUrl: '/junior/extracted/rec_thumb_science.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    keyTakeaway: 'Seeds need nutrient soil, warm sunlight, and clean water to awaken their sleeping green sprout.',
    category: 'activity',
    summaryPdfName: 'Science_Seeds_Sprouting_Handout.pdf',
    quizQuestion: {
      question: 'What three essentials wake up a dormant seed sleeping under the soil?',
      options: [
        'Warm sunlight, clean water, and rich soil 🌱',
        'Ice cubes, salt, and shadows',
        'Chocolate milk and sugar'
      ],
      correctIndex: 0,
      explanation: 'Spot on! Sunlight, moisture, and soil nutrients trigger germination in baby seeds!'
    }
  },
  {
    id: 'rec-sci-2',
    title: 'Unit 3: Animal Habitats (Deserts, Rainforests & Polar Ice)',
    subject: 'Science',
    subjectLabel: 'EVS & NATURE',
    subjectBadgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    subjectTheme: {
      border: 'border-emerald-300 dark:border-emerald-800',
      bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
      bannerGradient: 'from-emerald-600 to-teal-700 text-white',
      text: 'text-emerald-900 dark:text-emerald-200',
      accent: 'bg-emerald-600',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_0_0_#047857]'
    },
    subjectIcon: '🍃',
    chapter: 'Unit 3 • Wildlife Habitats',
    unitNumber: 3,
    teacherName: 'Mr. Rakesh Sharma',
    teacherRole: 'Environmental Science Explorer',
    teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RakeshEVS',
    duration: '30 mins',
    durationMins: 30,
    date: 'Last week at 09:30 AM • Class 3-A',
    thumbnailUrl: '/junior/extracted/storybook_3_science.png',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    keyTakeaway: 'Animals have special adaptations: Camels store fat in humps, penguins have thick blubber for warmth.',
    category: 'concept',
    summaryPdfName: 'EVS_Unit3_Animal_Habitats_Explorer.pdf',
    quizQuestion: {
      question: 'How do emperor penguins stay warm in the freezing Antarctic ice?',
      options: [
        'By drinking hot tea',
        'Thick waterproof feathers and insulating blubber fat 🐧',
        'Wearing woollen sweaters'
      ],
      correctIndex: 1,
      explanation: 'Hooray! Dense feathers and a thick fat layer called blubber shield penguins from icy winds!'
    }
  },

  // ===================== ENGLISH & PHONICS =====================
  {
    id: 'rec-eng-1',
    title: 'The Brave Little Turtle Story & Short "u" Phonics',
    subject: 'English',
    subjectLabel: 'ENGLISH & PHONICS',
    subjectBadgeColor: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    subjectTheme: {
      border: 'border-purple-300 dark:border-purple-800',
      bg: 'bg-purple-50/40 dark:bg-purple-950/20',
      bannerGradient: 'from-purple-600 to-indigo-700 text-white',
      text: 'text-purple-900 dark:text-purple-200',
      accent: 'bg-purple-600',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_4px_0_0_#6b21a8]'
    },
    subjectIcon: '📖',
    chapter: 'Unit 3 • Storytime & Vowels',
    unitNumber: 3,
    teacherName: 'Ms. Priya Nair',
    teacherRole: 'Language & Phonics Mentor',
    teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PriyaEnglish',
    duration: '26 mins',
    durationMins: 26,
    date: '4 days ago at 11:30 AM • Class 3-A',
    thumbnailUrl: '/junior/extracted/rec_thumb_english.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    keyTakeaway: 'The short "u" sound echoes in words like under, umbrella, and turtle shell!',
    category: 'story',
    summaryPdfName: 'English_Brave_Turtle_Phonics_Summary.pdf',
    quizQuestion: {
      question: 'Which word shares the same short "u" vowel sound as turtle and under?',
      options: [
        'Umbrella ☂️',
        'Airplane ✈️',
        'Banana 🍌'
      ],
      correctIndex: 0,
      explanation: 'Hooray! Umbrella starts with the short "u" vowel sound just like under and turtle!'
    }
  },
  {
    id: 'rec-eng-2',
    title: 'Rhyming Magic: Cat, Hat, Bat & Action Verbs',
    subject: 'English',
    subjectLabel: 'ENGLISH & PHONICS',
    subjectBadgeColor: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    subjectTheme: {
      border: 'border-purple-300 dark:border-purple-800',
      bg: 'bg-purple-50/40 dark:bg-purple-950/20',
      bannerGradient: 'from-purple-600 to-indigo-700 text-white',
      text: 'text-purple-900 dark:text-purple-200',
      accent: 'bg-purple-600',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_4px_0_0_#6b21a8]'
    },
    subjectIcon: '📖',
    chapter: 'Unit 4 • Grammar & Poetry',
    unitNumber: 4,
    teacherName: 'Ms. Priya Nair',
    teacherRole: 'Language & Phonics Mentor',
    teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PriyaEnglish',
    duration: '22 mins',
    durationMins: 22,
    date: 'Last week at 10:15 AM • Class 3-A',
    thumbnailUrl: '/junior/extracted/storybook_1_english.png',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    keyTakeaway: 'Action verbs tell what a person or animal does: jump, dance, read, fly, and laugh!',
    category: 'concept',
    summaryPdfName: 'English_Rhymes_Action_Verbs.pdf',
    quizQuestion: {
      question: 'Which of the following is an ACTION VERB showing what someone does?',
      options: [
        'Blue table',
        'Jump high 🏃‍♂️',
        'Sweet mango'
      ],
      correctIndex: 1,
      explanation: '"Jump" is a wonderful action verb describing physical movement!'
    }
  },

  // ===================== ART & CREATIVITY =====================
  {
    id: 'rec-art-1',
    title: 'Color Wheel Magic: Mixing Blue & Yellow for Forest Green',
    subject: 'Art',
    subjectLabel: 'ART & CRAFT',
    subjectBadgeColor: 'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800',
    subjectTheme: {
      border: 'border-pink-300 dark:border-pink-800',
      bg: 'bg-pink-50/40 dark:bg-pink-950/20',
      bannerGradient: 'from-pink-600 to-rose-700 text-white',
      text: 'text-pink-900 dark:text-pink-200',
      accent: 'bg-pink-600',
      btn: 'bg-pink-600 hover:bg-pink-700 text-white shadow-[0_4px_0_0_#be185d]'
    },
    subjectIcon: '🎨',
    chapter: 'Unit 1 • Rainbow Art Lab',
    unitNumber: 1,
    teacherName: 'Ms. Kavita Reddy',
    teacherRole: 'Creative Arts & Expression Coach',
    teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KavitaArt',
    duration: '25 mins',
    durationMins: 25,
    date: 'Last Friday at 02:00 PM • Class 3-A',
    thumbnailUrl: '/junior/extracted/rec_thumb_art.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    keyTakeaway: 'Primary colors (Red, Blue, Yellow) blend to form magic secondary shades like Green and Orange!',
    category: 'activity',
    summaryPdfName: 'Art_Color_Mixing_Palette_Sheet.pdf',
    quizQuestion: {
      question: 'What wonderful secondary color is created by blending Blue and Yellow?',
      options: [
        'Leafy Forest Green 🍃',
        'Bright Cherry Red ❤️',
        'Dark Purple 💜'
      ],
      correctIndex: 0,
      explanation: 'Splendid! Blue and Yellow mix together to make beautiful emerald and forest green!'
    }
  },

  // ===================== HINDI & STORIES =====================
  {
    id: 'rec-hin-1',
    title: 'Bal Kahani: Chatur Khargosh aur Sher (चतुर खरगोश)',
    subject: 'Hindi',
    subjectLabel: 'HINDI & STORIES',
    subjectBadgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    subjectTheme: {
      border: 'border-amber-300 dark:border-amber-800',
      bg: 'bg-amber-50/40 dark:bg-amber-950/20',
      bannerGradient: 'from-amber-600 to-orange-700 text-white',
      text: 'text-amber-900 dark:text-amber-200',
      accent: 'bg-amber-600',
      btn: 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-[0_4px_0_0_#d97706]'
    },
    subjectIcon: '🪔',
    chapter: 'Unit 2 • Panchatantra & Varnamala',
    unitNumber: 2,
    teacherName: 'Ms. Sunita Sharma',
    teacherRole: 'Primary Hindi Educator',
    teacherAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SunitaHindi',
    duration: '24 mins',
    durationMins: 24,
    date: 'Last Thursday at 03:00 PM • Class 3-A',
    thumbnailUrl: '/junior/extracted/storybook_4_geography.png',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    keyTakeaway: 'Buddhi se sabhi kathinaiyan door hoti hain (बुद्धि बल से बड़ी होती है).',
    category: 'story',
    summaryPdfName: 'Hindi_Chatur_Khargosh_Worksheet.pdf',
    quizQuestion: {
      question: 'चतुर खरगोश ने शेर को कुएं में क्या दिखाया?',
      options: [
        'शेर की खुद की परछाई (Reflection) 🦁',
        'एक स्वादिष्ट फल',
        'एक बड़ा हाथी'
      ],
      correctIndex: 0,
      explanation: 'बहुत बढ़िया! खरगोश ने समझदारी से शेर को पानी में उसी की परछाई दिखाकर जंगल को बचाया!'
    }
  }
];

export function JuniorRecordingsLibrary({
  studentName = 'Aarav Kumar',
  onEarnStars,
  onShowToast
}: JuniorRecordingsLibraryProps) {
  const [recordings] = useState<ClassRecordingItem[]>(defaultRecordings);
  const [selectedSubject, setSelectedSubject] = useState<'all' | SubjectCategory>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'story' | 'concept' | 'activity' | 'watched'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [watchedIds, setWatchedIds] = useState<string[]>(['rec-eng-1', 'rec-math-1']);

  // Video Modal Player State
  const [activeVideo, setActiveVideo] = useState<ClassRecordingItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [watchProgress, setWatchProgress] = useState<number>(35);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [claimedReward, setClaimedReward] = useState<boolean>(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Keyboard shortcut listener (Esc to close, Space to toggle play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideo(null);
      }
      if (e.key === ' ' && activeVideo && e.target === document.body) {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo, isPlaying]);

  const togglePlayPause = () => {
    playButtonClick();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const seekRelative = (seconds: number) => {
    playButtonClick();
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const changeSpeed = (speed: number) => {
    playButtonClick();
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleOpenVideo = (item: ClassRecordingItem) => {
    playButtonClick();
    setActiveVideo(item);
    setIsPlaying(true);
    setWatchProgress(25);
    setPlaybackSpeed(1);
    setClaimedReward(watchedIds.includes(item.id));
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
  };

  const handleClaimReward = () => {
    if (!activeVideo || claimedReward) return;
    playStarCollect();
    playFanfare();
    setClaimedReward(true);
    setWatchedIds((prev) => (prev.includes(activeVideo.id) ? prev : [...prev, activeVideo.id]));

    try {
      confetti({
        particleCount: 85,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}

    if (onEarnStars) {
      onEarnStars(20);
    }
    if (onShowToast) {
      onShowToast(`🎉 +20 Curiosity Stars banked for watching ${activeVideo.title}!`);
    }
  };

  const handleAnswerQuiz = (index: number) => {
    playButtonClick();
    setSelectedQuizAnswer(index);
    setQuizSubmitted(true);

    if (activeVideo?.quizQuestion && index === activeVideo.quizQuestion.correctIndex) {
      playStarCollect();
      try {
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { y: 0.7 }
        });
      } catch {}
      if (onEarnStars) {
        onEarnStars(10);
      }
      if (onShowToast) {
        onShowToast('🌟 Spot on! +10 Bonus Brain Stars awarded!');
      }
    }
  };

  const handleDownloadNotes = (item: ClassRecordingItem) => {
    playButtonClick();
    if (onShowToast) {
      onShowToast(`📥 Downloading official study notes for: ${item.title}`);
    }
    try {
      const mockDoc = `====================================================\n      EDU360 CLASSROOM REPLAY COMPANION NOTES       \n====================================================\nLesson: ${item.title}\nSubject: ${item.subject}\nChapter: ${item.chapter}\nFaculty: ${item.teacherName} (${item.teacherRole})\nDate of Lesson: ${item.date}\nDuration: ${item.duration}\n\nKEY CONCEPT & BIG IDEA:\n"${item.keyTakeaway}"\n\nCHECKPOINT PRACTICE QUESTION:\nQ: ${item.quizQuestion.question}\nCorrect Answer: ${item.quizQuestion.options[item.quizQuestion.correctIndex]}\nExplanation: ${item.quizQuestion.explanation}\n\n[Certified by Class 3-A Academic Board • 2026-27]\n====================================================`;
      const blob = new Blob([mockDoc], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.summaryPdfName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  };

  // Group recordings by subject
  const subjectsList: { id: SubjectCategory; name: string; icon: string; count: number; theme: string }[] = [
    {
      id: 'Mathematics',
      name: 'Mathematics',
      icon: '🧮',
      count: recordings.filter((r) => r.subject === 'Mathematics').length,
      theme: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'Science',
      name: 'EVS & Science',
      icon: '🍃',
      count: recordings.filter((r) => r.subject === 'Science').length,
      theme: 'from-emerald-600 to-teal-600'
    },
    {
      id: 'English',
      name: 'English & Phonics',
      icon: '📖',
      count: recordings.filter((r) => r.subject === 'English').length,
      theme: 'from-purple-600 to-indigo-600'
    },
    {
      id: 'Art',
      name: 'Art & Craft',
      icon: '🎨',
      count: recordings.filter((r) => r.subject === 'Art').length,
      theme: 'from-pink-600 to-rose-600'
    },
    {
      id: 'Hindi',
      name: 'Hindi & Stories',
      icon: '🪔',
      count: recordings.filter((r) => r.subject === 'Hindi').length,
      theme: 'from-amber-600 to-orange-600'
    }
  ];

  // Filtered recordings according to subject, type and search
  const filteredRecordings = recordings.filter((item) => {
    const matchesSubject = selectedSubject === 'all' || item.subject === selectedSubject;
    const matchesType =
      typeFilter === 'all'
        ? true
        : typeFilter === 'watched'
        ? watchedIds.includes(item.id)
        : item.category === typeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-14 select-none">
      {/* ========================================================
          1. HERO HEADER: JUNGLE CINEMA REPLAY THEATER
          (Rich 3D Popcorn & Glasses Mascot, stats, continue watching)
      ======================================================== */}
      <div className="relative rounded-3xl border-4 border-rose-300 dark:border-rose-800 bg-gradient-to-r from-rose-100 via-amber-50 to-pink-100 dark:from-slate-900 dark:via-rose-950/30 dark:to-pink-950/30 p-5 sm:p-6 shadow-[0_8px_0_0_#f43f5e] dark:shadow-[0_8px_0_0_#9f1239] overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Side: Mascot & Headline */}
        <div className="flex items-center gap-4 sm:gap-5 z-10 max-w-xl">
          <div className="relative shrink-0">
            <img
              src="/junior/extracted/rec_cinema_mascot_rounded.png"
              alt="Jungle Cinema Mascot"
              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-3xl border-3 border-amber-300 dark:border-amber-700 shadow-md filter drop-shadow-sm select-none transform hover:scale-105 transition-transform"
            />
            <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-sm border border-white">
              HD 🎬
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-200/80 dark:bg-rose-900/60 text-rose-950 dark:text-rose-200 text-xs font-black uppercase tracking-wider mb-1 border border-rose-300/50">
              <Sparkles className="w-3.5 h-3.5 fill-rose-500 text-rose-600 animate-spin" />
              <span>Subject Video Replays</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Class Recordings Library</span>
              <span className="text-2xl sm:text-3xl">🍿</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
              Explore subject-wise video lessons in Mathematics, EVS, English, and Arts! Watch anytime and earn curiosity stars.
            </p>
          </div>
        </div>

        {/* Right Side: Replay Stats Chips */}
        <div className="flex flex-wrap lg:flex-col items-center gap-3 shrink-0 z-10 w-full sm:w-auto justify-end">
          <div className="flex-1 sm:flex-initial flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-800 rounded-2xl px-4 py-2.5 shadow-[0_3px_0_0_#f43f5e] min-w-[180px]">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-xl shrink-0">
              🎥
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Lessons Ready
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {recordings.length} Subject Replays
              </div>
            </div>
          </div>

          <div className="flex-1 sm:flex-initial flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-800 rounded-2xl px-4 py-2.5 shadow-[0_3px_0_0_#f59e0b] min-w-[180px]">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-xl shrink-0">
              ⭐
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Curiosity Reward
              </div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                +20 Stars / Video
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. SUBJECT-BASED NAVIGATION TABS & SEARCH DECK:
          Maths | EVS & Science | English | Art & Craft | Hindi
      ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-3 border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Row 1: Primary Subject Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                playButtonClick();
                setSelectedSubject('all');
              }}
              className={`rounded-2xl px-4 py-2.5 text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-2 shrink-0 ${
                selectedSubject === 'all'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-[0_3px_0_0_#e11d48] translate-y-[-1px]'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>🌟</span>
              <span>All Subjects ({recordings.length})</span>
            </button>

            {subjectsList.map((sub) => {
              const isActive = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    playButtonClick();
                    setSelectedSubject(sub.id);
                  }}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-2 shrink-0 ${
                    isActive
                      ? 'bg-rose-500 text-white border-rose-600 shadow-[0_3px_0_0_#e11d48] translate-y-[-1px]'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">{sub.icon}</span>
                  <span>
                    {sub.name} ({sub.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search Bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, chapter or teacher..."
              className="w-full pl-9 pr-8 py-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Secondary Format / Status Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Film className="w-3.5 h-3.5" />
            <span>Format:</span>
          </span>

          {[
            { id: 'all', label: 'All Formats', icon: '🎬' },
            { id: 'concept', label: 'Core Concepts', icon: '💡' },
            { id: 'story', label: 'Storytime & Phonics', icon: '✨' },
            { id: 'activity', label: 'Interactive Activities', icon: '🎨' },
            { id: 'watched', label: `Watched (${watchedIds.length})`, icon: '✅' }
          ].map((cat) => {
            const isActive = typeFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playButtonClick();
                  setTypeFilter(cat.id as any);
                }}
                className={`rounded-xl px-3 py-1.5 text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          3. SUBJECT-WISE SECTIONS OR FILTERED GRID
          If 'all' selected: Shows each subject grouped under clear
          Subject Section Banners (Maths, EVS, English, Art, Hindi).
          If single subject selected: Shows that subject's shelf.
      ======================================================== */}
      {selectedSubject === 'all' ? (
        <div className="space-y-8">
          {subjectsList.map((subjectMeta) => {
            const subjectRecordings = filteredRecordings.filter(
              (r) => r.subject === subjectMeta.id
            );
            if (subjectRecordings.length === 0) return null;

            return (
              <div
                key={subjectMeta.id}
                className="space-y-4 rounded-3xl bg-slate-50/60 dark:bg-slate-900/40 p-5 sm:p-6 border-2 border-slate-200/80 dark:border-slate-800"
              >
                {/* Subject Section Header Banner */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl shadow-xs">
                      {subjectMeta.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{subjectMeta.name} Recordings</span>
                        <span className="text-xs font-bold text-slate-400">
                          ({subjectRecordings.length} Lessons)
                        </span>
                      </h2>
                      <span className="text-xs text-slate-500 font-medium">
                        Class 3-A curriculum video replays &amp; takeaways
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playButtonClick();
                      setSelectedSubject(subjectMeta.id);
                    }}
                    className="text-xs font-black text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-rose-200 shadow-2xs"
                  >
                    <span>View All {subjectMeta.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards for this subject */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {subjectRecordings.map((item) => (
                    <RecordingCard
                      key={item.id}
                      item={item}
                      isWatched={watchedIds.includes(item.id)}
                      onOpenVideo={handleOpenVideo}
                      onDownloadNotes={handleDownloadNotes}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single Subject Shelf View */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {subjectsList.find((s) => s.id === selectedSubject)?.icon}
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {subjectsList.find((s) => s.id === selectedSubject)?.name} Video Collection
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Showing {filteredRecordings.length} curated lessons for Class 3-A
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playButtonClick();
                setSelectedSubject('all');
              }}
              className="text-xs font-black text-slate-600 dark:text-slate-400 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer"
            >
              ← Back to All Subjects
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRecordings.map((item) => (
              <RecordingCard
                key={item.id}
                item={item}
                isWatched={watchedIds.includes(item.id)}
                onOpenVideo={handleOpenVideo}
                onDownloadNotes={handleDownloadNotes}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State when no recordings match filter */}
      {filteredRecordings.length === 0 && (
        <div className="rounded-3xl border-3 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center space-y-3 bg-white dark:bg-slate-900 shadow-sm">
          <div className="text-5xl animate-bounce">🎬</div>
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
            No Recordings Found for this filter!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Try resetting your search query or switching to another subject tab to discover more recorded lessons.
          </p>
          <button
            type="button"
            onClick={() => {
              playButtonClick();
              setSelectedSubject('all');
              setTypeFilter('all');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 rounded-2xl bg-rose-500 text-white text-xs font-black cursor-pointer shadow-[0_3px_0_0_#be123c] active:shadow-none active:translate-y-0.5"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* ========================================================
          4. FULL THEATER VIDEO REPLAY PLAYER MODAL
          (Cinema marquee, embedded HTML5 player, speed toggle,
          10s forward/rewind, interactive brain check quiz & rewards)
      ======================================================== */}
      {activeVideo && (
        <div
          onClick={() => setActiveVideo(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-slate-900 border-4 border-amber-400 overflow-hidden shadow-2xl space-y-4 my-8 max-h-[92vh] flex flex-col justify-between"
          >
            {/* Cinema Marquee Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between border-b border-amber-400/50">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🍿</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                      Now Showing
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      {activeVideo.subject} • Class 3-A Replay
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white truncate max-w-md sm:max-w-lg mt-0.5">
                    {activeVideo.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setActiveVideo(null);
                }}
                className="p-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Box & Custom Overlay Controls */}
            <div className="px-4 sm:px-6 space-y-3">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl group">
                <video
                  ref={videoRef}
                  src={activeVideo.videoUrl}
                  poster={activeVideo.thumbnailUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  onTimeUpdate={(e) => {
                    const current = e.currentTarget.currentTime;
                    const duration = e.currentTarget.duration || 1;
                    setWatchProgress(Math.round((current / duration) * 100));
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    if (!claimedReward) {
                      handleClaimReward();
                    }
                  }}
                />

                {/* Big Center Play/Pause Overlay Indicator on Hover */}
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-2xl transition-all ring-4 ring-white/40 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 ml-1 fill-current" />
                  )}
                </button>

                {/* Bottom Video Progress Scrub Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center gap-3">
                  <div className="flex-1 bg-slate-700/80 h-2 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${watchProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-white shrink-0">
                    {watchProgress}% Watched
                  </span>
                </div>
              </div>

              {/* Theater Control Deck: Seek -10s, Play/Pause, +10s, Speeds */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-white">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => seekRelative(-10)}
                    className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 cursor-pointer text-xs font-bold flex items-center gap-1"
                    title="Rewind 10 seconds"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>-10s</span>
                  </button>

                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => seekRelative(10)}
                    className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 cursor-pointer text-xs font-bold flex items-center gap-1"
                    title="Fast forward 10 seconds"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>+10s</span>
                  </button>
                </div>

                {/* Playback Speed Multiplier */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 font-medium mr-1 text-[11px]">Speed:</span>
                  {[0.75, 1, 1.25].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => changeSpeed(spd)}
                      className={`px-2 py-1 rounded-lg font-black text-[11px] cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Brain Check / Quick Mini-Quiz */}
              <div className="rounded-2xl border-2 border-indigo-400/60 bg-indigo-950/40 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧠</span>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                      Quick Brain Check (Earn +10 Stars ⭐)
                    </span>
                  </div>
                  {quizSubmitted && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Checked!
                    </span>
                  )}
                </div>

                <p className="text-xs text-white font-bold">
                  {activeVideo.quizQuestion.question}
                </p>

                <div className="space-y-1.5 pt-1">
                  {activeVideo.quizQuestion.options.map((opt, idx) => {
                    const isSelected = selectedQuizAnswer === idx;
                    const isCorrect = idx === activeVideo.quizQuestion.correctIndex;
                    let btnStyle = 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700';

                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-600 text-white border-emerald-400 font-black';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-600/80 text-white border-rose-400';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-indigo-600 text-white border-indigo-400';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAnswerQuiz(idx)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && <CheckCheck className="w-4 h-4 text-emerald-300" />}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <p className="text-[11px] text-amber-200 bg-amber-950/60 p-2 rounded-xl border border-amber-800/80 italic">
                    💡 {activeVideo.quizQuestion.explanation}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions: Claim Stars & Download Notes */}
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDownloadNotes(activeVideo)}
                className="px-4 py-2.5 rounded-2xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Download Lesson Notes</span>
              </button>

              <button
                type="button"
                onClick={handleClaimReward}
                disabled={claimedReward}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all ${
                  claimedReward
                    ? 'bg-emerald-600/80 text-white cursor-default'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-[0_4px_0_0_#d97706] active:shadow-none active:translate-y-1'
                }`}
              >
                {claimedReward ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>+20 Curiosity Stars Banked! ✓</span>
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 fill-amber-300 text-slate-950" />
                    <span>Claim +20 Curiosity Stars ⭐</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual recording card
function RecordingCard({
  item,
  isWatched,
  onOpenVideo,
  onDownloadNotes
}: {
  item: ClassRecordingItem;
  isWatched: boolean;
  onOpenVideo: (item: ClassRecordingItem) => void;
  onDownloadNotes: (item: ClassRecordingItem) => void;
}) {
  return (
    <div className="group rounded-3xl bg-white dark:bg-slate-900 border-3 border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        {/* Card Header Row: Subject Badge, Duration & Stars */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-black border-2 uppercase tracking-wider ${item.subjectBadgeColor}`}
          >
            <span>{item.subjectIcon}</span>
            <span>{item.subjectLabel}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black shadow-xs">
              <Clock className="w-3 h-3" />
              <span>{item.duration}</span>
            </span>

            <span className="text-xs font-black text-amber-500 dark:text-amber-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>+20 Stars</span>
            </span>

            {isWatched && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                Watched ✓
              </span>
            )}
          </div>
        </div>

        {/* 16:9 Thumbnail with Center Pulsing Play Button */}
        <div
          onClick={() => onOpenVideo(item)}
          className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 cursor-pointer shadow-inner border border-slate-200 dark:border-slate-800"
        >
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20" />

          {/* Centered Glowing Play Button */}
          <div className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 active:scale-95 transition-all group-hover:bg-rose-600 ring-4 ring-white/50">
            <Play className="w-7 h-7 ml-1 fill-current" />
          </div>

          {/* Bottom chapter tag */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
            <span className="bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
              {item.chapter}
            </span>
            <span className="bg-rose-600 px-2 py-0.5 rounded-md font-black">
              HD Video
            </span>
          </div>
        </div>

        {/* Title, Date & Teacher Takeaway Box */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>{item.date}</span>
            <span className="text-rose-500 font-extrabold">{item.chapter}</span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            {item.title}
          </h3>

          <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 p-3">
            <div className="flex items-start gap-2">
              <span className="text-sm shrink-0">💡</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                <strong className="text-amber-800 dark:text-amber-300">Big Idea:</strong>{' '}
                {item.keyTakeaway}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Avatar & Bottom Actions */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Faculty info */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <img
            src={item.teacherAvatar}
            alt={item.teacherName}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200"
          />
          <div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
              {item.teacherName}
            </span>
            <span className="text-[10px] text-slate-400 font-bold block">
              {item.teacherRole}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onDownloadNotes(item)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Study Notes</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenVideo(item)}
            className="px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_3px_0_0_#be123c] active:shadow-none active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch Replay (+20 ⭐)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
