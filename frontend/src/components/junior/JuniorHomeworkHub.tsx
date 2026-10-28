'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Upload,
  Download,
  Star,
  FileText,
  Sparkles,
  Filter,
  Eye,
  Check,
  ChevronRight,
  Smile,
  X,
  Lightbulb,
  Camera,
  Award,
  CheckCheck,
  PartyPopper,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Palette,
  Eraser,
  Flame,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { playButtonClick, playStarCollect, playFanfare } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

export interface JuniorHomeworkItem {
  id: string;
  title: string;
  subject: 'Mathematics' | 'English' | 'Science' | 'Art';
  subjectLabel: string;
  subjectIcon: string;
  subjectBadgeColor: string;
  themeColor: {
    border: string;
    bg: string;
    btn: string;
    text: string;
    accent: string;
  };
  dueDate: string;
  dueTime: string;
  dateKey: 'today' | 'past';
  formattedDueDate: string;
  coinsReward: number;
  starsReward: number;
  status: 'pending' | 'submitted' | 'graded';
  characterImg: string;
  characterAlt: string;
  characterCompanion: string;
  instructions: string[];
  practiceQuestions: string[];
  worksheetPdfName: string;
  gradedInfo?: {
    teacherName: string;
    score: string;
    rubric: {
      neatness: string;
      accuracy: string;
      creativity: string;
    };
    stampType: 'champion' | 'wizard' | 'perfection' | 'great_effort';
    stampTitle: string;
    stampSubtitle: string;
    teacherRemark: string;
    gradedDate: string;
    annotatedPdfName: string;
    audioVoiceFeedbackDuration: string;
  };
}

interface JuniorHomeworkHubProps {
  studentName?: string;
  onEarnStars?: (stars: number) => void;
  onShowToast?: (message: string) => void;
}

// 100% Strict Domain Invariant: ZERO Future/Tomorrow homework.
// Only: Today's missions (Oct 24) + Past Backlog / Catch-up missions (Oct 21–23) + Graded & Checked items.
const initialHomeworkItems: JuniorHomeworkItem[] = [
  {
    id: 'hw-math-1',
    title: 'Count & Color 10 Stars in Chapter 2 Workbook',
    subject: 'Mathematics',
    subjectLabel: 'MATHEMATICS',
    subjectIcon: '🧮',
    subjectBadgeColor: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    themeColor: {
      border: 'border-blue-300 dark:border-blue-800',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_0_0_#1d4ed8]',
      text: 'text-blue-900 dark:text-blue-200',
      accent: 'bg-blue-500'
    },
    dueDate: '2026-10-24',
    dueTime: '4:00 PM',
    dateKey: 'today',
    formattedDueDate: 'Due: Today, Oct 24 • 4:00 PM',
    coinsReward: 40,
    starsReward: 50,
    status: 'pending',
    characterImg: '/junior/extracted/hw_char_math_monkey_clean.png',
    characterAlt: 'Math Monkey with Giant Yellow Pencil',
    characterCompanion: 'Chintu the Math Monkey',
    instructions: [
      'Write your numbers neatly in the grid lines provided in Chapter 2.',
      'Always add the ones place digits first before carrying over.',
      'Remember to put the carry-over ten in the top star box!'
    ],
    practiceQuestions: [
      'Q1: 15 + 7 = ? (Show carry-over step)',
      'Q2: Count all 5-pointed yellow stars on page 14',
      'Q3: Color 3 triangles in blue and 7 circles in red'
    ],
    worksheetPdfName: 'Math_Class3A_Count_Color_Stars.pdf'
  },
  {
    id: 'hw-eng-1',
    title: 'Read Aloud & Underline: The Magic Treehouse (Ch 1)',
    subject: 'English',
    subjectLabel: 'ENGLISH & PHONICS',
    subjectIcon: '📖',
    subjectBadgeColor: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    themeColor: {
      border: 'border-purple-300 dark:border-purple-800',
      bg: 'bg-purple-50/50 dark:bg-purple-950/20',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_4px_0_0_#6b21a8]',
      text: 'text-purple-900 dark:text-purple-200',
      accent: 'bg-purple-500'
    },
    dueDate: '2026-10-24',
    dueTime: '5:30 PM',
    dateKey: 'today',
    formattedDueDate: 'Due: Today, Oct 24 • 5:30 PM',
    coinsReward: 35,
    starsReward: 40,
    status: 'pending',
    characterImg: '/junior/extracted/hw_char_english_monkey_clean.png',
    characterAlt: 'English Monkey with Glasses Reading Book',
    characterCompanion: 'Professor Leo the Owl & Monkey',
    instructions: [
      'Read the Chapter 1 excerpt aloud with clear voice expression.',
      'Underline all words with "ea" and "ee" diphthongs in orange crayon.',
      'Write down 3 new vocabulary words you discovered.'
    ],
    practiceQuestions: [
      'Q1: What did Jack find on the top branch of the oak tree?',
      'Q2: Underline 4 action verbs in paragraph 2',
      'Q3: Draw a tiny sketch of the treehouse window'
    ],
    worksheetPdfName: 'English_Phonics_Magic_Treehouse_Ch1.pdf'
  },
  {
    id: 'hw-sci-1',
    title: 'Autumn Leaves Scrapbook & Plant Parts Explorer',
    subject: 'Science',
    subjectLabel: 'SCIENCE & NATURE',
    subjectIcon: '🍃',
    subjectBadgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    themeColor: {
      border: 'border-emerald-300 dark:border-emerald-800',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_0_0_#047857]',
      text: 'text-emerald-900 dark:text-emerald-200',
      accent: 'bg-emerald-500'
    },
    dueDate: '2026-10-23',
    dueTime: 'Yesterday, 5:00 PM',
    dateKey: 'past',
    formattedDueDate: 'Catch-up Backlog • Assigned Oct 23',
    coinsReward: 50,
    starsReward: 45,
    status: 'pending',
    characterImg: '/junior/extracted/hw_char_science_elephant_clean.png',
    characterAlt: 'Science Baby Elephant Holding Autumn Leaves',
    characterCompanion: 'Ellie the Nature Explorer Elephant',
    instructions: [
      'Collect 4 different fallen leaves from your garden or balcony.',
      'Label the four parts: Root, Stem, Leaf, and Petal.',
      'Answer why chlorophyll makes leaves green in sunlight.'
    ],
    practiceQuestions: [
      'Q1: Name two plants with taproots and two with fibrous roots',
      'Q2: Which part of the plant drinks water from the soil?',
      'Q3: Draw your favorite leaf outline'
    ],
    worksheetPdfName: 'Science_EVS_Autumn_Leaves_Plant_Parts.pdf'
  },
  {
    id: 'hw-art-1',
    title: 'Draw & Color 3 Friendly Farm Animals on Easel',
    subject: 'Art',
    subjectLabel: 'ART & CRAFT',
    subjectIcon: '🎨',
    subjectBadgeColor: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800',
    themeColor: {
      border: 'border-pink-300 dark:border-pink-800',
      bg: 'bg-pink-50/50 dark:bg-pink-950/20',
      btn: 'bg-pink-600 hover:bg-pink-700 text-white shadow-[0_4px_0_0_#be185d]',
      text: 'text-pink-900 dark:text-pink-200',
      accent: 'bg-pink-500'
    },
    dueDate: '2026-10-22',
    dueTime: 'Wednesday, 6:00 PM',
    dateKey: 'past',
    formattedDueDate: 'Catch-up Backlog • Assigned Oct 22',
    coinsReward: 45,
    starsReward: 60,
    status: 'pending',
    characterImg: '/junior/extracted/hw_char_art_giraffe_clean.png',
    characterAlt: 'Art Giraffe with Paintbrush and Animal Easel',
    characterCompanion: 'Gigi the Master Artist Giraffe',
    instructions: [
      'Draw and color 3 farm animals using bold crayons or water colors.',
      'Write the sound each animal makes (e.g. Moo, Baa, Cluck).',
      'Add a cheerful bright sun and green grass in the background!'
    ],
    practiceQuestions: [
      'Animal 1: A spotted dairy cow eating green grass',
      'Animal 2: A woolly sheep standing by the barn fence',
      'Animal 3: A colorful rooster greeting the morning sun'
    ],
    worksheetPdfName: 'Art_Craft_3_Farm_Animals_Easel.pdf'
  },
  {
    id: 'hw-math-graded',
    title: '2D & 3D Shape Counting Scavenger Hunt',
    subject: 'Mathematics',
    subjectLabel: 'MATHEMATICS',
    subjectIcon: '🧮',
    subjectBadgeColor: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    themeColor: {
      border: 'border-emerald-300 dark:border-emerald-800',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_0_0_#047857]',
      text: 'text-emerald-900 dark:text-emerald-200',
      accent: 'bg-emerald-500'
    },
    dueDate: '2026-10-22',
    dueTime: '5:00 PM',
    dateKey: 'past',
    formattedDueDate: 'Checked & Graded • Wednesday, Oct 22',
    coinsReward: 50,
    starsReward: 50,
    status: 'graded',
    characterImg: '/junior/extracted/hw_char_math_monkey_clean.png',
    characterAlt: 'Math Monkey Champion',
    characterCompanion: 'Chintu the Math Monkey',
    instructions: [
      'Find 4 cuboids, 2 cylinders, and 1 sphere at home.',
      'Count all corners and flat faces neatly.'
    ],
    practiceQuestions: [
      'Counted: Shoebox (Cuboid), Soup Can (Cylinder), Tennis Ball (Sphere)'
    ],
    worksheetPdfName: 'Math_Shapes_Scavenger_Hunt.pdf',
    gradedInfo: {
      teacherName: 'Mrs. Ananya Verma',
      score: '20 / 20 ⭐ (100% Mastery)',
      rubric: {
        neatness: '5 / 5 ⭐ (Super Clean Lines)',
        accuracy: '10 / 10 ⭐ (All 3D shapes correct)',
        creativity: '5 / 5 ⭐ (Creative items found)'
      },
      stampType: 'champion',
      stampTitle: 'PASSED WITH FLYING COLORS!',
      stampSubtitle: 'MATH WIZARD GOLD ACCREDITED 🌟',
      teacherRemark: 'Brilliant spatial discovery, Aarav! You identified the soup can cylinder and shoebox cuboid with 100% precision. Keep up the shining work in Class 3-A!',
      gradedDate: 'Graded Oct 23, 2026',
      annotatedPdfName: 'Math_Shapes_Corrected_Stamps.pdf',
      audioVoiceFeedbackDuration: '0:14s'
    }
  },
  {
    id: 'hw-eng-graded',
    title: 'Action Verbs & Sight Words Reading Sheet #2',
    subject: 'English',
    subjectLabel: 'ENGLISH & PHONICS',
    subjectIcon: '📖',
    subjectBadgeColor: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    themeColor: {
      border: 'border-emerald-300 dark:border-emerald-800',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_0_0_#047857]',
      text: 'text-emerald-900 dark:text-emerald-200',
      accent: 'bg-emerald-500'
    },
    dueDate: '2026-10-21',
    dueTime: '5:00 PM',
    dateKey: 'past',
    formattedDueDate: 'Checked & Graded • Tuesday, Oct 21',
    coinsReward: 40,
    starsReward: 40,
    status: 'graded',
    characterImg: '/junior/extracted/hw_char_english_monkey_clean.png',
    characterAlt: 'English Star Reader Monkey',
    characterCompanion: 'Professor Leo the Owl',
    instructions: [
      'Circle all 10 sight words with your blue crayon.',
      'Write down 5 fun action verbs.'
    ],
    practiceQuestions: [
      'Circled: always, because, found, great, read, thought, write'
    ],
    worksheetPdfName: 'English_SightWords_Sheet.pdf',
    gradedInfo: {
      teacherName: 'Ms. Priya Nair',
      score: '19 / 20 ⭐ (Outstanding)',
      rubric: {
        neatness: '4.5 / 5 ⭐ (Very neat cursive)',
        accuracy: '9.5 / 10 ⭐ (9 of 10 sight words perfect)',
        creativity: '5 / 5 ⭐ (Excellent action verbs)'
      },
      stampType: 'wizard',
      stampTitle: 'SUPER STAR READER!',
      stampSubtitle: 'READING BADGE EARNED 📖✨',
      teacherRemark: 'Super handwriting, Aarav! 9 out of 10 sight words were circled accurately. Practice the spelling of "thought" once more and you will be unstoppable!',
      gradedDate: 'Graded Oct 22, 2026',
      annotatedPdfName: 'English_SightWords_Annotated.pdf',
      audioVoiceFeedbackDuration: '0:12s'
    }
  }
];

export function JuniorHomeworkHub({
  studentName = 'Aarav Kumar',
  onEarnStars,
  onShowToast
}: JuniorHomeworkHubProps) {
  const [items, setItems] = useState<JuniorHomeworkItem[]>(initialHomeworkItems);
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'Mathematics' | 'English' | 'Science' | 'Art'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'past' | 'graded'>('all');

  // Total banked coins & stars earned in this session
  const [bankedCoins, setBankedCoins] = useState<number>(340);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Audio Speech Narration State
  const [speakingItemId, setSpeakingItemId] = useState<string | null>(null);
  const [isPlayingTeacherAudio, setIsPlayingTeacherAudio] = useState<boolean>(false);

  // Modals
  const [activeUploadItem, setActiveUploadItem] = useState<JuniorHomeworkItem | null>(null);
  const [activePracticeItem, setActivePracticeItem] = useState<JuniorHomeworkItem | null>(null);
  const [viewingGradedItem, setViewingGradedItem] = useState<JuniorHomeworkItem | null>(null);

  // Submission Modal Sub-Tabs: 'camera' | 'draw' | 'file'
  const [submissionMode, setSubmissionMode] = useState<'camera' | 'draw' | 'file'>('camera');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Drawing Whiteboard State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState<string>('#2563eb');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [hasDrawnSomething, setHasDrawnSomething] = useState<boolean>(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveUploadItem(null);
        setActivePracticeItem(null);
        setViewingGradedItem(null);
        stopSpeech();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Web Speech API Voice Reader for Kids
  const speakText = useCallback((text: string, id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onShowToast) onShowToast('Audio narration is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();

    if (speakingItemId === id) {
      setSpeakingItemId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92; // Pleasant, gentle pace for primary students
    utterance.pitch = 1.08; // Friendly, warm tone
    utterance.onend = () => setSpeakingItemId(null);
    utterance.onerror = () => setSpeakingItemId(null);

    setSpeakingItemId(id);
    window.speechSynthesis.speak(utterance);
  }, [speakingItemId, onShowToast]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingItemId(null);
    setIsPlayingTeacherAudio(false);
  }, []);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSubject = subjectFilter === 'all' || item.subject === subjectFilter;
    const matchesDate =
      dateFilter === 'all'
        ? item.status !== 'graded' // active tasks
        : dateFilter === 'graded'
        ? item.status === 'graded'
        : dateFilter === 'today'
        ? item.dateKey === 'today' && item.status !== 'graded'
        : item.dateKey === 'past' && item.status !== 'graded';
    return matchesSubject && matchesDate;
  });

  const activeCount = items.filter((i) => i.status === 'pending').length;
  const todayCount = items.filter((i) => i.dateKey === 'today' && i.status === 'pending').length;
  const pastCount = items.filter((i) => i.dateKey === 'past' && i.status === 'pending').length;
  const gradedCount = items.filter((i) => i.status === 'graded').length;

  // Hatching Progress: (gradedCount / totalItems) * 100
  const progressPercent = Math.min(100, Math.round(((gradedCount + (items.length - activeCount)) / items.length) * 100));

  // Handle Printable Worksheet Download
  const handleDownloadWorksheet = (item: JuniorHomeworkItem) => {
    playButtonClick();
    if (onShowToast) {
      onShowToast(`📥 Downloading official worksheet: ${item.worksheetPdfName}`);
    }

    try {
      const mockPdfDoc = `%PDF-1.4\n%EDU360 Primary School Official Worksheet\nStudent: ${studentName}\nClass: 3-A\nSubject: ${item.subject}\nWorksheet Title: ${item.title}\nDue: ${item.formattedDueDate}\nReward: +${item.coinsReward} Coins, +${item.starsReward} Stars\n\nInstructions from ${item.characterCompanion}:\n${item.instructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}\n\nPractice Questions to Solve:\n${item.practiceQuestions.map((q, i) => `[  ] ${q}`).join('\n')}\n\n[Teacher Stamp Verification Checkpoint: Class 3-A Academic Year 2026-27]`;
      const blob = new Blob([mockPdfDoc], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.worksheetPdfName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback
    }
  };

  // Open Upload Modal
  const handleOpenUpload = (item: JuniorHomeworkItem) => {
    playButtonClick();
    stopSpeech();
    setActiveUploadItem(item);
    setActivePracticeItem(null);
    setSubmissionMode('camera');
    setSelectedFile(null);
    setPreviewUrl(null);
    setHasDrawnSomething(false);
  };

  // Open Practice / Question Preview Modal
  const handleOpenPractice = (item: JuniorHomeworkItem) => {
    playButtonClick();
    stopSpeech();
    setActivePracticeItem(item);
  };

  // Handle Snapshot from Tablet Camera
  const handleSnapCameraPhoto = () => {
    playButtonClick();
    const mockImgUrl = '/junior/extracted/hw_banner_magic_book.png';
    setPreviewUrl(mockImgUrl);
    const mockFile = new File(['mock_worksheet_aarav'], 'Aarav_Workbook_Page14_Snap.jpg', {
      type: 'image/jpeg'
    });
    setSelectedFile(mockFile);
    if (onShowToast) {
      onShowToast('📸 High-resolution photo captured from student workbook!');
    }
  };

  // Handle Drawing Canvas Functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnSomething(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    playButtonClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSomething(false);
  };

  const attachDrawingAsSubmission = () => {
    playButtonClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setPreviewUrl(dataUrl);

    // Convert dataURL to File
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const drawingFile = new File([u8arr], 'Aarav_Math_Drawing_Worksheet.png', { type: mime });
    setSelectedFile(drawingFile);

    if (onShowToast) {
      onShowToast('🎨 Drawing saved & attached to worksheet submission!');
    }
  };

  // Submit Homework with Confetti, Sounds and Banking
  const handleSubmitHomework = () => {
    if (!activeUploadItem || !selectedFile) return;
    setIsSubmitting(true);
    playButtonClick();

    setTimeout(() => {
      setIsSubmitting(false);

      // Update state
      setItems((prev) =>
        prev.map((i) =>
          i.id === activeUploadItem.id
            ? {
                ...i,
                status: 'submitted',
                formattedDueDate: 'Submitted Just Now • Awaiting Teacher Stamp'
              }
            : i
        )
      );

      // Reward points & sound
      setBankedCoins((prev) => prev + activeUploadItem.coinsReward);
      if (onEarnStars) {
        onEarnStars(activeUploadItem.starsReward);
      }

      playStarCollect();
      playFanfare();

      try {
        confetti({
          particleCount: 110,
          spread: 90,
          origin: { y: 0.6 }
        });
      } catch {}

      if (onShowToast) {
        onShowToast(
          `🎉 Mission Completed! Earned +${activeUploadItem.coinsReward} Coins and +${activeUploadItem.starsReward} Stars!`
        );
      }

      setActiveUploadItem(null);
    }, 1100);
  };

  // Teacher Voice Note Audio Playback in Graded Modal
  const toggleTeacherVoiceAudio = (remark: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingTeacherAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingTeacherAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(remark);
    utterance.rate = 0.9;
    utterance.pitch = 1.15; // Pleasant teacher voice
    utterance.onend = () => setIsPlayingTeacherAudio(false);
    utterance.onerror = () => setIsPlayingTeacherAudio(false);

    setIsPlayingTeacherAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* ========================================================
          1. SPLASHLEARN-STYLE TOY-BOX HERO BANNER:
          Pillowy 3D Border, Magic Book Illustration, Mascots Sign,
          Live Coin/Star Bank & Golden Egg Hatching Progress
      ======================================================== */}
      <div className="relative rounded-3xl border-4 border-amber-300 dark:border-amber-800 bg-gradient-to-r from-amber-100 via-sky-50 to-indigo-100 dark:from-slate-900 dark:via-sky-950/40 dark:to-indigo-950/40 p-5 sm:p-6 shadow-[0_8px_0_0_#f59e0b] dark:shadow-[0_8px_0_0_#b45309] overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: 3D Magic Book & Kid Title */}
        <div className="flex items-center gap-4 sm:gap-5 z-10 max-w-xl">
          <div className="relative shrink-0">
            <img
              src="/junior/extracted/hw_banner_magic_book.png"
              alt="Homework & Magic Book"
              className="w-24 h-20 sm:w-28 sm:h-24 object-contain filter drop-shadow-md select-none transform hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
              K-5 HUB
            </span>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800 text-amber-700 dark:text-amber-300 text-xs font-black shadow-xs mb-1 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-spin" />
              <span>Aarav&apos;s Daily Mission Deck</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-indigo-950 dark:text-white tracking-tight flex items-center gap-2">
              <span>Homework &amp; Magic Book</span>
              <span className="text-2xl sm:text-3xl">📖</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
              Solve fun practice worksheets, snap workbook photos or draw solutions, and earn shiny gold coins from your teachers!
            </p>
          </div>
        </div>

        {/* Center: Friendly Mascot Signboard */}
        <div className="hidden md:flex items-center justify-center shrink-0 z-10">
          <img
            src="/junior/extracted/hw_banner_mascots_sign.png"
            alt="Small Steps Big Learning You Can Do It! 🐾"
            className="h-28 lg:h-32 w-auto object-contain filter drop-shadow-md select-none transform hover:scale-105 transition-transform"
          />
        </div>

        {/* Right: Live Coin Bank + Golden Egg Hatching Meter */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 shrink-0 z-10 w-full sm:w-auto justify-end">
          {/* Live Coin Wallet Badge */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border-3 border-amber-300 dark:border-amber-700 rounded-2xl px-4 py-2.5 shadow-[0_4px_0_0_#f59e0b] min-w-[190px]">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 flex items-center justify-center text-2xl shadow-inner border border-amber-500">
              🪙
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Gold Coin Bank
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{bankedCoins}</span>
                <span className="text-xs text-amber-500 font-bold">Coins</span>
              </div>
            </div>
          </div>

          {/* Golden Phoenix Egg Progress Bar */}
          <div className="w-full bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl px-4 py-2 shadow-xs min-w-[190px]">
            <div className="flex items-center justify-between text-[11px] font-black text-indigo-900 dark:text-indigo-300 mb-1">
              <span className="flex items-center gap-1">
                <span>🥚</span>
                <span>Golden Egg Hatching:</span>
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-semibold text-center">
              {progressPercent >= 100 ? '🎉 Baby Phoenix Hatched!' : `${activeCount} worksheets left to hatch mascot!`}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. TOY-BOX DUAL FILTERING BAR:
          Row 1: Filter by Subject (All Subjects, Math, English, Science, Art)
          Row 2: Date & Status (All Active, Due Today, Catch-Up Backlog, Graded & Checked)
      ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-3 border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3.5">
        {/* Row 1: Filter by Subject */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Subject Deck:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `All Subjects (${items.length})`, icon: '📚' },
              { id: 'Mathematics', label: 'Mathematics', icon: '🧮' },
              { id: 'English', label: 'English & Phonics', icon: '📖' },
              { id: 'Science', label: 'Science & Nature', icon: '🍃' },
              { id: 'Art', label: 'Art & Craft', icon: '🎨' }
            ].map((sub) => {
              const isActive = subjectFilter === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    playButtonClick();
                    setSubjectFilter(sub.id as any);
                  }}
                  className={`rounded-2xl px-4 py-2 text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-2 ${
                    isActive
                      ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-[0_3px_0_0_#d97706] translate-y-[-1px]'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 active:translate-y-0.5'
                  }`}
                >
                  <span className="text-sm">{sub.icon}</span>
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Date & Status Filters (STRICT: NO TOMORROW DATES) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 shrink-0">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Mission Timeline:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `Active Worksheets (${activeCount})`, icon: '🎯' },
              { id: 'today', label: `Due Today • Oct 24 (${todayCount})`, icon: '⚡' },
              { id: 'past', label: `Catch-Up Backlog (${pastCount})`, icon: '⏳' },
              { id: 'graded', label: `Graded & Star-Stamped (${gradedCount})`, icon: '🎖️' }
            ].map((df) => {
              const isActive = dateFilter === df.id;
              return (
                <button
                  key={df.id}
                  onClick={() => {
                    playButtonClick();
                    setDateFilter(df.id as any);
                  }}
                  className={`rounded-2xl px-4 py-2 text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-2 ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-700 shadow-[0_3px_0_0_#1d4ed8] translate-y-[-1px]'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 active:translate-y-0.5'
                  }`}
                >
                  <span className="text-sm">{df.icon}</span>
                  <span>{df.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. 2x2 BENTO GRID OF GAMIFIED WORKSHEET CARDS:
          Tactile Claymorphic Cards with 3D drop-borders,
          Audio read-aloud button, mascot companions, bounties,
          Download PDF, Question Preview & Submit Worksheet
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.map((item) => {
          const isSpeakingThis = speakingItemId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-3xl bg-white dark:bg-slate-900 border-3 p-5 sm:p-6 transition-all relative overflow-hidden flex flex-col justify-between ${
                item.status === 'graded'
                  ? 'border-emerald-400 dark:border-emerald-700 shadow-[0_6px_0_0_#10b981]'
                  : item.dateKey === 'today'
                  ? 'border-amber-300 dark:border-amber-700 shadow-[0_6px_0_0_#f59e0b]'
                  : 'border-slate-200 dark:border-slate-800 shadow-[0_6px_0_0_#94a3b8]'
              }`}
            >
              <div>
                {/* Card Header Row: Subject Badge + Coins & Stars Bounty */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black border-2 uppercase tracking-wider ${item.subjectBadgeColor}`}
                  >
                    <span>{item.subjectIcon}</span>
                    <span>{item.subjectLabel}</span>
                  </div>

                  {/* Bounty Badges */}
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 dark:bg-amber-950/80 border border-amber-300 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-2xs">
                      <span>🪙</span>
                      <span>+{item.coinsReward}</span>
                    </span>

                    <span className="bg-blue-100 dark:bg-blue-950/80 border border-blue-300 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-2xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>+{item.starsReward}</span>
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${
                        item.status === 'graded'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                          : item.status === 'submitted'
                          ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                          : item.dateKey === 'today'
                          ? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300'
                          : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.status === 'graded'
                        ? 'Checked ✓'
                        : item.status === 'submitted'
                        ? 'Submitted ⏳'
                        : item.dateKey === 'today'
                        ? 'Today ⚡'
                        : 'Catch-up ⏳'}
                    </span>
                  </div>
                </div>

                {/* Title & Mascot Row */}
                <div className="flex items-center justify-between gap-3 mt-3.5">
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug tracking-tight">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{item.formattedDueDate}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                      <span>Guide:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.characterCompanion}</span>
                    </div>
                  </div>

                  {/* Character Mascot Graphic */}
                  <div className="shrink-0">
                    <img
                      src={item.characterImg}
                      alt={item.characterAlt}
                      className="w-24 h-22 sm:w-28 sm:h-24 object-contain filter drop-shadow-sm select-none transform hover:scale-105 transition-transform"
                    />
                  </div>
                </div>

                {/* Teacher Instructions Box with Listen Aloud Button */}
                <div
                  className={`mt-4 rounded-2xl p-4 border-2 ${item.themeColor.bg} ${item.themeColor.border}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Teacher Instructions:</span>
                    </div>

                    {/* Speech Narration Audio Button */}
                    <button
                      type="button"
                      onClick={() =>
                        speakText(
                          `Here are the instructions for ${item.title}. ${item.instructions.join('. ')}`,
                          item.id
                        )
                      }
                      className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer border transition-all ${
                        isSpeakingThis
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                      title="Listen to teacher instructions aloud"
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Stop ⏹️</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>🔊 Read Aloud</span>
                        </>
                      )}
                    </button>
                  </div>

                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside font-medium leading-relaxed">
                    {item.instructions.map((ins, idx) => (
                      <li key={idx}>{ins}</li>
                    ))}
                  </ul>
                </div>

                {/* Graded Rubber Stamp Graphic Preview (if graded) */}
                {item.status === 'graded' && item.gradedInfo && (
                  <div className="mt-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 p-4 relative overflow-hidden">
                    {/* Tilted Digital Rubber Stamp Graphic */}
                    <div className="absolute right-3 top-2 rotate-[-8deg] pointer-events-none opacity-90 select-none border-2 border-dashed border-emerald-600 dark:border-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/80 px-3 py-1 rounded-lg shadow-sm">
                      <div className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-200 tracking-wider">
                        ★ {item.gradedInfo.stampTitle} ★
                      </div>
                    </div>

                    <div className="space-y-1.5 pr-28">
                      <div className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Score: {item.gradedInfo.score}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed">
                        &quot;{item.gradedInfo.teacherRemark}&quot;
                      </p>
                      <div className="text-[10px] text-slate-500 font-semibold pt-1">
                        — {item.gradedInfo.teacherName} • {item.gradedInfo.gradedDate}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Interactive Claymorphic Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5 justify-between">
                {/* Action 1: Download Printable PDF */}
                <button
                  type="button"
                  onClick={() => handleDownloadWorksheet(item)}
                  className="px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_3px_0_0_#cbd5e1] active:shadow-none active:translate-y-0.5"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Download Worksheet PDF</span>
                </button>

                {/* Action 2: Inspect Questions or Open Submission */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {item.status === 'graded' ? (
                    <button
                      type="button"
                      onClick={() => {
                        playButtonClick();
                        setViewingGradedItem(item);
                      }}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_0_0_#047857] active:shadow-none active:translate-y-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Inspect Teacher Stamp &amp; Audio</span>
                    </button>
                  ) : item.status === 'submitted' ? (
                    <div className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/80 border-2 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 font-black text-xs flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>Submitted • Waiting for Star Stamp</span>
                    </div>
                  ) : (
                    <>
                      {/* Preview Practice Questions */}
                      <button
                        type="button"
                        onClick={() => handleOpenPractice(item)}
                        className="px-3.5 py-2.5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-black flex items-center gap-1.5 shadow-[0_3px_0_0_#c7d2fe] active:shadow-none active:translate-y-0.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Preview Questions</span>
                      </button>

                      {/* Main Big Claymorphic Submit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenUpload(item)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_4px_0_0_#d97706] active:shadow-none active:translate-y-1 transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Submit Work (+{item.coinsReward} 🪙)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when filter yields 0 */}
      {filteredItems.length === 0 && (
        <div className="rounded-3xl border-3 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center space-y-3 bg-white dark:bg-slate-900 shadow-sm">
          <div className="text-5xl animate-bounce">🌟</div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">
            No Worksheets Found in this Filter Deck!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Awesome job! You have cleared all homework tasks in this view. Switch your subject or date filter above to see more missions.
          </p>
          <button
            type="button"
            onClick={() => {
              playButtonClick();
              setSubjectFilter('all');
              setDateFilter('all');
            }}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-black cursor-pointer shadow-[0_3px_0_0_#d97706] active:shadow-none active:translate-y-0.5"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* ========================================================
          4. PRACTICE QUESTIONS PREVIEW MODAL:
          Lets student read all assigned questions, check them off,
          and jump straight to photo upload or whiteboard drawing
      ======================================================== */}
      {activePracticeItem && (
        <div
          onClick={() => setActivePracticeItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-4 border-indigo-300 dark:border-indigo-700 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activePracticeItem.subjectIcon}</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    {activePracticeItem.subjectLabel} WORKSHEET
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {activePracticeItem.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setActivePracticeItem(null);
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mascot Tip */}
            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800 rounded-2xl">
              <img
                src={activePracticeItem.characterImg}
                alt="Guide"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                <span className="font-black block">{activePracticeItem.characterCompanion} says:</span>
                Solve each question in your notebook with pencil, then snap a picture or use the magic drawing board!
              </div>
            </div>

            {/* Questions Checklist */}
            <div className="space-y-2">
              <div className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Assigned Practice Questions:
              </div>
              <div className="space-y-2">
                {activePracticeItem.practiceQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-start gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                      {q}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleDownloadWorksheet(activePracticeItem)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenUpload(activePracticeItem)}
                className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-[0_3px_0_0_#d97706] active:shadow-none active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Submit My Solution Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. INTERACTIVE 3-IN-1 SUBMISSION MODAL:
          Tab 1: 📸 Snap Photo with Tablet Camera
          Tab 2: 🎨 Magic Drawing Whiteboard (Interactive HTML5 Canvas)
          Tab 3: 📁 File Upload Dropzone
      ======================================================== */}
      {activeUploadItem && (
        <div
          onClick={() => {
            setActiveUploadItem(null);
            stopSpeech();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-4 border-amber-400 dark:border-amber-700 p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  Submit {activeUploadItem.subject} Homework
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {activeUploadItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setActiveUploadItem(null);
                  stopSpeech();
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 3 Submission Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setSubmissionMode('camera');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  submissionMode === 'camera'
                    ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>📸 Snap Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setSubmissionMode('draw');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  submissionMode === 'draw'
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>🎨 Magic Canvas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setSubmissionMode('file');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  submissionMode === 'file'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>📁 Upload File</span>
              </button>
            </div>

            {/* TAB CONTENT 1: CAMERA SNAPSHOT */}
            {submissionMode === 'camera' && (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 p-4 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-400 text-white flex items-center justify-center mx-auto shadow-inner text-2xl">
                    📸
                  </div>
                  <h4 className="text-xs font-black text-sky-900 dark:text-sky-200">
                    Hold Your Notebook Page Up to the Camera
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Make sure your handwritten calculations and stars are clear and in good lighting!
                  </p>
                  <button
                    type="button"
                    onClick={handleSnapCameraPhoto}
                    className="w-full py-2.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-[0_3px_0_0_#0369a1] active:shadow-none active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Snapshot of Workbook Page</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: DRAWING WHITEBOARD */}
            {submissionMode === 'draw' && (
              <div className="space-y-2.5">
                {/* Drawing Controls: Palette & Eraser & Clear */}
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    {[
                      { color: '#2563eb', label: 'Blue' },
                      { color: '#dc2626', label: 'Red' },
                      { color: '#16a34a', label: 'Green' },
                      { color: '#d97706', label: 'Gold' },
                      { color: '#9333ea', label: 'Purple' }
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => {
                          playButtonClick();
                          setDrawColor(c.color);
                        }}
                        style={{ backgroundColor: c.color }}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                          drawColor === c.color ? 'ring-3 ring-amber-400 scale-110 shadow-xs' : 'opacity-80'
                        }`}
                        title={c.label}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        playButtonClick();
                        setDrawColor('#ffffff');
                      }}
                      className={`p-1 rounded-lg border text-xs font-bold cursor-pointer ${
                        drawColor === '#ffffff' ? 'bg-amber-200 border-amber-400' : 'bg-white border-slate-300'
                      }`}
                      title="Eraser"
                    >
                      <Eraser className="w-3.5 h-3.5 text-slate-700" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-300 cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>

                {/* HTML5 Canvas */}
                <div className="rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700 overflow-hidden bg-white shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={460}
                    height={210}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[210px] touch-none cursor-crosshair bg-white"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Draw your answers with crayons</span>
                  <button
                    type="button"
                    disabled={!hasDrawnSomething}
                    onClick={attachDrawingAsSubmission}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-black text-xs shadow-xs cursor-pointer"
                  >
                    Attach Drawing 🎨
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: FILE UPLOAD DROPZONE */}
            {submissionMode === 'file' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-3 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 text-center transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setSelectedFile(file);
                      if (file.type.startsWith('image/')) {
                        setPreviewUrl(URL.createObjectURL(file));
                      } else {
                        setPreviewUrl(null);
                      }
                    }
                  }}
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                />
                <Upload className="mx-auto h-8 w-8 text-emerald-500 group-hover:scale-110 transition-transform mb-1.5" />
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">
                  {selectedFile ? selectedFile.name : 'Click to Browse or Drag Worksheet Photo here'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Supports PNG, JPG, or PDF (Max 15MB)
                </p>
              </div>
            )}

            {/* Selected File / Image Preview Confirmation Box */}
            {selectedFile && (
              <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Worksheet Preview"
                      className="w-14 h-14 object-contain rounded-xl bg-white border border-amber-300 shadow-2xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center text-xl">
                      📄
                    </div>
                  )}
                  <div className="text-xs">
                    <span className="font-black text-slate-900 dark:text-white block line-clamp-1">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                      <CheckCheck className="w-3.5 h-3.5" /> Ready for submission
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-amber-600 block">Reward</span>
                  <span className="text-xs font-black text-amber-700">+{activeUploadItem.coinsReward} 🪙</span>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setActiveUploadItem(null);
                  stopSpeech();
                }}
                className="px-4 py-2.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedFile || isSubmitting}
                onClick={handleSubmitHomework}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs shadow-[0_4px_0_0_#d97706] active:shadow-none active:translate-y-1 transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Sending to Teacher...</span>
                ) : (
                  <>
                    <PartyPopper className="w-4 h-4" />
                    <span>Submit &amp; Collect +{activeUploadItem.coinsReward} 🪙</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. TEACHER GRADED & STAMPED REVIEW MODAL:
          Tilted Rubber Stamp, Score Rubric, Audio Voice Playback,
          Teacher Remarks & Download Annotated Sheet
      ======================================================== */}
      {viewingGradedItem && viewingGradedItem.gradedInfo && (
        <div
          onClick={() => {
            setViewingGradedItem(null);
            stopSpeech();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-4 border-emerald-400 dark:border-emerald-700 p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Official Teacher Evaluation • Class 3-A
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {viewingGradedItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setViewingGradedItem(null);
                  stopSpeech();
                }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Realistic Tilted Rubber Stamp Display */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 border-3 border-emerald-300 dark:border-emerald-800 p-5 text-center relative overflow-hidden shadow-inner">
              <div className="inline-block rotate-[-5deg] border-4 border-dashed border-emerald-600 dark:border-emerald-400 bg-white/90 dark:bg-slate-900/90 px-6 py-3 rounded-2xl shadow-md">
                <div className="text-3xl animate-bounce mb-1">🎖️</div>
                <div className="text-sm font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  ★ {viewingGradedItem.gradedInfo.stampTitle} ★
                </div>
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {viewingGradedItem.gradedInfo.stampSubtitle}
                </div>
              </div>

              <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm">
                Final Score: {viewingGradedItem.gradedInfo.score}
              </div>
            </div>

            {/* Rubric Breakdown */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Neatness</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {viewingGradedItem.gradedInfo.rubric.neatness}
                </span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Accuracy</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {viewingGradedItem.gradedInfo.rubric.accuracy}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Creativity</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {viewingGradedItem.gradedInfo.rubric.creativity}
                </span>
              </div>
            </div>

            {/* Teacher Audio Voice Note Simulation */}
            <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👩‍🏫</span>
                  <div>
                    <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 block">
                      Voice Note from {viewingGradedItem.gradedInfo.teacherName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Recorded on {viewingGradedItem.gradedInfo.gradedDate}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleTeacherVoiceAudio(viewingGradedItem.gradedInfo!.teacherRemark)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer border shadow-xs transition-all ${
                    isPlayingTeacherAudio
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700'
                  }`}
                >
                  {isPlayingTeacherAudio ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Voice ⏸️</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>▶️ Listen (0:14s)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Animated Equalizer Waveform Bars when playing */}
              {isPlayingTeacherAudio && (
                <div className="flex items-center justify-center gap-1 py-1">
                  {[40, 70, 90, 60, 100, 50, 80, 45, 95, 65, 30].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-indigo-500 rounded-full animate-bounce"
                      style={{ height: `${h * 0.25}px`, animationDelay: `${i * 0.08}s` }}
                    />
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900">
                &quot;{viewingGradedItem.gradedInfo.teacherRemark}&quot;
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setViewingGradedItem(null);
                  stopSpeech();
                }}
                className="px-4 py-2.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
              >
                Close Review
              </button>

              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  if (onShowToast) {
                    onShowToast(`📥 Downloading annotated copy: ${viewingGradedItem.gradedInfo?.annotatedPdfName}`);
                  }
                  setViewingGradedItem(null);
                  stopSpeech();
                }}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-[0_3px_0_0_#047857] active:shadow-none active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Teacher Annotated Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
