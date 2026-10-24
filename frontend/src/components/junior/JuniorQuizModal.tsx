'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle2,
  X,
  Volume2,
  ArrowRight,
  RefreshCw,
  Trophy,
  Smile,
  Star
} from 'lucide-react';
import { playButtonClick, playStarCollect } from '@/lib/sound-effects';
import confetti from 'canvas-confetti';

export interface QuizQuestion {
  id: number;
  question: string;
  options: { label: string; isCorrect: boolean; emoji?: string }[];
  hint?: string;
  explanation: string;
}

interface JuniorQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizTitle: string;
  subject: string;
  questions: QuizQuestion[];
  onQuizCompleted?: (score: number, starsEarned: number) => void;
}

export function JuniorQuizModal({
  isOpen,
  onClose,
  quizTitle,
  subject,
  questions,
  onQuizCompleted
}: JuniorQuizModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx] || questions[0];

  const handleSpeakQuestion = () => {
    playButtonClick();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQ.question);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    playButtonClick();
    setSelectedOptionIdx(idx);
    setIsAnswered(true);

    const correct = currentQ.options[idx]?.isCorrect || false;
    setIsCorrect(correct);

    if (correct) {
      playStarCollect();
      setScore((prev) => prev + 1);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FBBF24', '#34D399', '#38BDF8', '#F472B6']
        });
      } catch {}
    }
  };

  const handleNext = () => {
    playButtonClick();
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionIdx(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setIsFinished(true);
      playStarCollect();
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 }
        });
      } catch {}
      if (onQuizCompleted) {
        onQuizCompleted(score, score * 10);
      }
    }
  };

  const handleRestart = () => {
    playButtonClick();
    setCurrentIdx(0);
    setSelectedOptionIdx(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border-4 border-amber-300 dark:border-amber-700/80 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Background Sparkle Dots */}
        <div className="absolute top-2 right-4 text-3xl opacity-20 pointer-events-none select-none">
          ⭐ ✨ 🌟
        </div>

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 text-white text-lg shadow-md">
              ⭐
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                {subject} • Star Challenge
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {quizTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isFinished ? (
          <div className="space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                <span>Score: {score} Stars</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-pink-500 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Box */}
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800/60 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {currentQ.question}
                </h4>
                <button
                  type="button"
                  onClick={handleSpeakQuestion}
                  className="p-2 rounded-xl bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0"
                  title="Listen to question aloud"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOptionIdx === idx;
                let btnStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-400 hover:bg-amber-50/30';

                if (isAnswered) {
                  if (opt.isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 shadow-md ring-2 ring-emerald-400';
                  } else if (isSelected && !opt.isCorrect) {
                    btnStyle = 'border-rose-400 bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 shadow-md animate-wobble';
                  } else {
                    btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`p-4 rounded-2xl border-3 font-black text-sm text-left flex items-center justify-between gap-3 transition-all cursor-pointer active:scale-98 ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
                      <span>{opt.label}</span>
                    </div>

                    {isAnswered && opt.isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next Button */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{isCorrect ? '🎉' : '💡'}</span>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {isCorrect ? 'Super Job! That is 100% correct!' : 'Good try! Here is a tip:'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {currentQ.explanation}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <span>{currentIdx + 1 < questions.length ? 'Next Question' : 'See Results'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished Screen */
          <div className="py-6 text-center space-y-5">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 via-pink-400 to-purple-500 text-5xl shadow-2xl border-4 border-white animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Challenge Completed!
              </h3>
              <p className="text-xs font-bold text-slate-500">
                You showed amazing curiosity in {subject}!
              </p>
            </div>

            {/* Stars Scorecard */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200">
              <Star className="h-6 w-6 fill-amber-400 text-amber-500" />
              <div className="text-left">
                <span className="text-xl font-black block">{score} / {questions.length} Stars</span>
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300">+{score * 10} Stars added to your vault!</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={() => {
                  playButtonClick();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-black text-xs shadow-md cursor-pointer"
              >
                Back to Missions 🌟
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
