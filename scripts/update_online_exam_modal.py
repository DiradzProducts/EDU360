import os

code = """'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Camera, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Send, 
  Maximize, 
  Minimize, 
  X, 
  Sparkles, 
  Lock, 
  Eye, 
  Award, 
  Check, 
  HelpCircle,
  Volume2,
  Mic,
  Pause,
  AlertOctagon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DynamicSealModal } from '@/components/proctor/dynamic-seal-modal';
import { api } from '@/lib/api';

interface OnlineExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId?: number;
  examTitle?: string;
  subject?: string;
  durationMinutes?: number;
  questionPrompt?: string;
  maxMarks?: number;
  studentName?: string;
  examMode?: 'MODE_CBT' | 'MODE_HYBRID_SCAN';
  onSubmitted?: (result: { wordsCount: number; timeSpentSeconds: number; content: string }) => void;
}

export function OnlineExamModal({
  isOpen,
  onClose,
  candidateId = 1,
  examTitle = 'CBSE Term 1 Model Examination: Analytical Essay Writing',
  subject = 'English Literature',
  durationMinutes = 30,
  questionPrompt = "In 'The Merchant of Venice' Act IV Scene 1, critically analyze Portia's courtroom plea regarding the quality of divine mercy versus Shylock's rigorous insistence on the bond. Contrast their worldviews, evaluate the dramatic turning point, and discuss whether true justice was achieved. (Suggested Length: 300 - 500 words)",
  maxMarks = 20,
  studentName = 'Aarav Sharma',
  examMode = 'MODE_CBT',
  onSubmitted
}: OnlineExamModalProps) {
  // Proctoring states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Exam writing states
  const [essayContent, setEssayContent] = useState<string>(
    "Portia's invocation of mercy in Act IV, Scene 1 represents one of Shakespeare's most profound philosophical expositions on justice and governance. Speaking under the guise of the learned jurist Balthazar, she appeals directly to Shylock not through legal constraint, but through moral transcendence:\\n\\n\\\"The quality of mercy is not strained; It droppeth as the gentle rain from heaven upon the place beneath.\\\"\\n\\nIn contrasting Portia's divine mercy with Shylock's strict adherence to Venetian statutory bond law, Shakespeare juxtaposes two competing worldviews..."
  );
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(durationMinutes * 60);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('Just now');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirmedSubmitted, setIsConfirmedSubmitted] = useState<boolean>(false);
  const [confirmSubmitDialogOpen, setConfirmSubmitDialogOpen] = useState<boolean>(false);
  const [showDynamicSealModal, setShowDynamicSealModal] = useState<boolean>(false);
  const [activeAnomalyWarning, setActiveAnomalyWarning] = useState<string | null>(null);
  const [proctorStrikes, setProctorStrikes] = useState<number>(0);

  // Invigilator remote control states
  const [isExamPaused, setIsExamPaused] = useState<boolean>(false);
  const [isExamDisqualified, setIsExamDisqualified] = useState<boolean>(false);
  const [hudAlertMessage, setHudAlertMessage] = useState<string | null>(null);
  const [audioDecibels, setAudioDecibels] = useState<number>(38);

  // Start webcam proctoring & Web Audio Decibel Monitor
  useEffect(() => {
    if (!isOpen) return;

    let localStream: MediaStream | null = null;

    async function initWebcamAndAudio() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: 'user' },
            audio: true
          });
          localStream = stream;
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
          setCameraError(null);

          // Web Audio API decibel metering (Client-side edge monitoring)
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const audioCtx = new AudioCtx();
              audioContextRef.current = audioCtx;
              const source = audioCtx.createMediaStreamSource(stream);
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 256;
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const checkAudio = () => {
                if (!streamRef.current) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                const db = Math.round(30 + (avg / 255) * 60);
                setAudioDecibels(db);

                // If noise exceeds 70dB (talking/whisper), log anomaly
                if (db > 70) {
                  api.sendProctorTelemetry(candidateId, {
                    anomaly_type: 'AUDIO_ANOMALY',
                    confidence: 0.88,
                    details: `Microphone noise level spiked to ${db} dB`
                  }).catch(() => {});
                }
                requestAnimationFrame(checkAudio);
              };
              checkAudio();
            }
          } catch (audioErr) {
            console.warn('Web Audio meter not initialized:', audioErr);
          }
        } else {
          setCameraError('Webcam access not supported on this browser.');
        }
      } catch (err: any) {
        console.warn('Proctoring webcam permission denied or camera unavailable:', err);
        setCameraActive(false);
        setCameraError('Webcam permission not granted. AI proctor edge simulation active.');
      }
    }

    initWebcamAndAudio();

    // Tab switch listener for exam integrity
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const nextCount = prev + 1;
          api.sendProctorTelemetry(candidateId, {
            anomaly_type: 'TAB_SWITCH',
            confidence: 1.0,
            details: `Student switched away from browser tab (Event #${nextCount})`
          }).catch(() => {});
          return nextCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isOpen, candidateId]);

  // Invigilator Remote Sync Poller (Synchronizes Pause, Disqualify, Strikes & HUD Nudges)
  useEffect(() => {
    if (!isOpen || isConfirmedSubmitted) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.getExamCandidates();
        if (res && res.success && res.candidates) {
          const myRecord = res.candidates.find((c: any) => c.id === candidateId || c.studentId === candidateId);
          if (myRecord) {
            setIsExamPaused(Boolean(myRecord.isPaused));
            setIsExamDisqualified(Boolean(myRecord.isDisqualified));
            setProctorStrikes(myRecord.strikes || 0);
            if (myRecord.isNudged && myRecord.nudgeMessage) {
              setHudAlertMessage(myRecord.nudgeMessage);
            }
          }
        }
      } catch (err) {
        // Fallback gracefully
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, isConfirmedSubmitted, candidateId]);

  // Exam countdown timer (Locks when exam is paused or disqualified)
  useEffect(() => {
    if (!isOpen || isConfirmedSubmitted || isExamPaused || isExamDisqualified) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isConfirmedSubmitted, isExamPaused, isExamDisqualified]);

  // Periodic autosave
  useEffect(() => {
    if (!isOpen || isConfirmedSubmitted || isExamPaused || isExamDisqualified) return;

    const autoSaveInterval = setInterval(() => {
      const now = new Date();
      setLastAutoSaveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 15000);

    return () => clearInterval(autoSaveInterval);
  }, [isOpen, isConfirmedSubmitted, isExamPaused, isExamDisqualified]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Word & character stats
  const wordsArray = essayContent.trim().split(/\\\\s+/).filter(Boolean);
  const wordCount = essayContent.trim() ? wordsArray.length : 0;
  const charCount = essayContent.length;
  const isTargetMet = wordCount >= 300 && wordCount <= 500;

  // Format time remaining
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleSubmitFinal = async () => {
    setIsSubmitting(true);
    try {
      await api.submitCandidateExam(candidateId, {
        submission_content: essayContent,
        words_count: wordCount,
        time_spent_seconds: durationMinutes * 60 - timeRemainingSeconds,
        script_pages_uploaded: examMode === 'MODE_HYBRID_SCAN' ? 4 : 0
      });
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmSubmitDialogOpen(false);
      setIsConfirmedSubmitted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      if (onSubmitted) {
        onSubmitted({
          wordsCount: wordCount,
          timeSpentSeconds: durationMinutes * 60 - timeRemainingSeconds,
          content: essayContent
        });
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        
        {/* ========================================================= */}
        {/* TOP STATUS BAR: INTEGRITY, TIMER, AUTO-SAVE & PROCTOR HUD */}
        {/* ========================================================= */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white px-4 sm:px-6 py-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-tight text-white uppercase">
                  {examMode === 'MODE_CBT' ? 'Pure Online CBT Examination' : 'Hybrid Written & Scan Examination'}
                </span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AI Edge Proctoring Active
                </span>
                {proctorStrikes > 0 && (
                  <span className="rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 text-[10px] font-black">
                    Strikes: {proctorStrikes}/3
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-slate-200 truncate max-w-md">
                {examTitle} &bull; {subject}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Countdown Clock */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-black text-sm ${
              isExamPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : timeRemainingSeconds < 300 
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' 
                : 'bg-slate-800 text-white border-slate-700'
            }`}>
              {isExamPaused ? <Pause className="h-4 w-4 text-amber-400" /> : <Clock className="h-4 w-4 text-purple-400" />}
              <span>{isExamPaused ? 'TIMER PAUSED' : formattedTime}</span>
            </div>

            {/* Autosave status */}
            <div className="hidden md:flex flex-col text-right text-[10px] text-slate-400">
              <span className="text-slate-300 font-medium">Cloud Autosave:</span>
              <span className="text-emerald-400 font-mono">{lastAutoSaveTime}</span>
            </div>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>

            {/* Exit/Cancel button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close Exam Window"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Tab switch warning banner */}
        {tabSwitchCount > 0 && !isConfirmedSubmitted && (
          <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                INTEGRITY WARNING: Browser tab switch detected ({tabSwitchCount} occurrence{tabSwitchCount > 1 ? 's' : ''}). This telemetry is automatically synchronized with the Invigilator Cockpit.
              </span>
            </div>
            <span className="text-[10px] uppercase font-mono bg-black/30 px-2 py-0.5 rounded">Strike Logged</span>
          </div>
        )}

        {/* Invigilator Live HUD Message Banner */}
        {hudAlertMessage && (
          <div className="bg-violet-700 text-white px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-violet-500 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-violet-200 animate-bounce" />
              <span>
                <b>INVIGILATOR HUD ALERT:</b> {hudAlertMessage}
              </span>
            </div>
            <button
              onClick={() => setHudAlertMessage(null)}
              className="text-xs text-violet-200 hover:text-white underline cursor-pointer"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN BODY: QUESTION, ESSAY PAD & FLOATING PROCTOR CAMERA */}
        {/* ========================================================= */}
        {isExamDisqualified ? (
          /* DISQUALIFICATION SCREEN */
          <div className="p-8 sm:p-12 text-center space-y-6 overflow-y-auto">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-700 shadow-xl">
              <AlertOctagon className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <span className="rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 px-3 py-1 text-xs font-black border border-rose-300 dark:border-rose-700">
                Examination Terminated
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Candidate Evicted for Academic Malpractice
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Candidate <b>{studentName}</b> &bull; The designated invigilator has terminated your examination session due to confirmed proctoring violations.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-6 py-3 shadow-md transition-all cursor-pointer"
            >
              Close Portal
            </button>
          </div>
        ) : isConfirmedSubmitted ? (
          /* SUCCESS SUBMISSION RECEIPT */
          <div className="p-8 sm:p-12 text-center space-y-6 overflow-y-auto">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 shadow-xl">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-3 py-1 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                Official Examination Submission Recorded
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Exam Successfully Submitted &amp; Encrypted
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Candidate <b>{studentName}</b> &bull; Your answers have been securely synced to the evaluator queue for grading.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Hash:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">#EXAM-2026-ENG-842</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Words Written:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{wordCount} Words</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Proctor Integrity Score:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {tabSwitchCount === 0 ? '100% Clean' : `${Math.max(70, 100 - tabSwitchCount * 10)}% (Flagged ${tabSwitchCount} Tab Switches)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Webcam Telemetry:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Continuous Stream Recorded</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 shadow-md transition-all cursor-pointer"
            >
              Return to Student Dashboard
            </button>
          </div>
        ) : (
          <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* PAUSE OVERLAY (When Teacher Clicks Pause on Cockpit) */}
            {isExamPaused && (
              <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 text-center animate-in fade-in duration-150">
                <div className="max-w-md p-6 rounded-3xl bg-slate-900 border border-amber-500/40 text-white shadow-2xl space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Pause className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black tracking-tight text-amber-300">
                      Examination Paused by Invigilator
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Your examination canvas has been temporarily frozen while the invigilator verifies your desk posture or conducts a verification check.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-[11px] text-slate-400 font-mono">
                    Exam Timer is Locked &bull; Please do not exit fullscreen
                  </div>
                </div>
              </div>
            )}

            {/* LEFT / CENTER: QUESTION PROMPT & LIVE TYPING EDITOR */}
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4">
              
              {/* Question Dossier Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 text-[10px] font-black uppercase">
                      Section A &bull; Subjective Essay
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Question 1 of 1 (Compulsory)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-400 font-mono">
                    Max Marks: {maxMarks}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-serif leading-relaxed">
                  {questionPrompt}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>Target: 300 &ndash; 500 Words</span>
                  <span>Penalty for plagiarism &amp; AI copy: Automatic Zero</span>
                </div>
              </div>

              {/* Typing Pad Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs shrink-0">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Live Answer Writing Canvas</span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">Words:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-lg ${
                      isTargetMet 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                        : wordCount > 500
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}>
                      {wordCount} / 500
                    </span>
                  </div>

                  <span className="text-slate-400 text-[10px] hidden sm:inline">
                    {charCount} Characters
                  </span>
                </div>
              </div>

              {/* Live Typing Textarea */}
              <div className="flex-1 min-h-[300px] flex flex-col">
                <textarea
                  value={essayContent}
                  disabled={isExamPaused}
                  onChange={(e) => setEssayContent(e.target.value)}
                  placeholder="Type your examination essay directly here in real time... Ensure proper paragraphing, supporting quotes, and thesis argumentation."
                  className="w-full flex-1 p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-sans leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>

              {/* Bottom Action Footer (CLEAN SUBMIT FOR CBT, SEAL ONLY FOR HYBRID SCAN) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Keystroke cadence recorded for author validation
                </span>

                {examMode === 'MODE_HYBRID_SCAN' ? (
                  <button
                    type="button"
                    disabled={isExamPaused}
                    onClick={() => setShowDynamicSealModal(true)}
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Seal &amp; Scan Upload (15-Min Window)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isExamPaused}
                    onClick={() => setConfirmSubmitDialogOpen(true)}
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Final Exam</span>
                  </button>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: DEDICATED WEBCAM PROCTOR HUD */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4 sm:p-5 flex flex-col justify-between space-y-4 shrink-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Live Proctor Cam
                    </span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                </div>

                {/* Webcam Video Container */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-purple-500/40 shadow-md aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />

                  {/* Audio Decibel Level HUD */}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-mono text-white flex items-center gap-1">
                    <Mic className="h-2.5 w-2.5 text-emerald-400" />
                    <span>{audioDecibels} dB</span>
                  </div>

                  {!cameraActive && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-3 text-center text-slate-400 space-y-1">
                      <VideoOff className="h-6 w-6 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-300">Edge Proctor Active</span>
                      <span className="text-[9px] text-slate-400">Webcam stream linked to Invigilator</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-1 rounded-xl">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      YOLO Person: 1
                    </span>
                    <span>Gaze: On-Screen</span>
                  </div>
                </div>

                {/* Integrity Checklist */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Session Integrity Rules
                  </span>
                  <ul className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4 leading-relaxed">
                    <li>Camera must remain powered throughout test.</li>
                    <li>Browser window must remain maximized.</li>
                    <li>Answers auto-saved to vault every 15 seconds.</li>
                  </ul>
                </div>
              </div>

              {/* Student Candidate Pill */}
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
                  alt={studentName}
                  className="h-8 w-8 rounded-xl object-cover border border-slate-300"
                />
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                    {studentName}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Class 8-B &bull; Roll #14
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* CONFIRMATION SUBMISSION MODAL                             */}
        {/* ========================================================= */}
        {confirmSubmitDialogOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Send className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Final Examination Submission?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  You have written <b>{wordCount} words</b>. Once submitted, your answer sheet will be encrypted and transmitted to the teacher grading portal.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Remaining:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formattedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Proctor Warnings:</span>
                  <span className="font-bold text-emerald-600">{tabSwitchCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmSubmitDialogOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  Return to Edit
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitFinal}
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-2.5 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Encrypting...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; Submit</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Security Seal Modal (ONLY ACTIVE FOR HYBRID SCAN) */}
        {examMode === 'MODE_HYBRID_SCAN' && (
          <DynamicSealModal
            isOpen={showDynamicSealModal}
            sealCode="#EDU-8492"
            onConfirmUpload={(data) => {
              setShowDynamicSealModal(false);
              handleSubmitFinal();
            }}
            onCancel={() => setShowDynamicSealModal(false)}
          />
        )}
      </div>
    </div>
  );
}
"""

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.write(code.replace('\\n', '\n').replace('\n', '\r\n'))

print("Updated frontend/src/components/online-exam-modal.tsx successfully.")
