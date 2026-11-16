'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  BookOpen, 
  X, 
  CheckCircle2, 
  Send, 
  Sparkles,
  FileText,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExamCoordinatorScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduledSuccess?: (exam: any) => void;
}

export function ExamCoordinatorScheduleModal({
  isOpen,
  onClose,
  onScheduledSuccess
}: ExamCoordinatorScheduleModalProps) {
  const [examTitle, setExamTitle] = useState('Term 2 Mathematics Summative Assessment');
  const [subject, setSubject] = useState('Mathematics');
  const [targetClass, setTargetClass] = useState('Class 8-B');
  const [invigilatorName, setInvigilatorName] = useState('Mrs. Ananya Verma');
  const [examDate, setExamDate] = useState('2026-11-12');
  const [examTime, setExamTime] = useState('10:00 AM - 11:30 AM');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [maxMarks, setMaxMarks] = useState(25);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleScheduleExam = () => {
    setIsPublishing(true);

    setTimeout(() => {
      setIsPublishing(false);
      setIsSuccess(true);

      const examPayload = {
        id: `exam-${Date.now()}`,
        title: examTitle,
        subject,
        className: targetClass,
        invigilator: invigilatorName,
        date: examDate,
        time: examTime,
        durationMinutes,
        maxMarks,
        mode: 'MODE_HYBRID_SCAN',
        hall: 'Virtual Room Alpha (LiveKit 2-Camera AI Proctor)',
        hallTicketsIssued: 40,
        scheduledAt: new Date().toLocaleTimeString()
      };

      // Save to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('edu360_scheduled_exams') || '[]');
        localStorage.setItem('edu360_scheduled_exams', JSON.stringify([examPayload, ...existing]));
      } catch {}

      // Broadcast to both Teacher and Student dashboards
      try {
        const channel = new BroadcastChannel('edu360_exam_live_channel');
        // Student notification
        channel.postMessage({
          type: 'EXAM_SCHEDULED',
          ...examPayload
        });
        // Teacher notification
        channel.postMessage({
          type: 'DUTY_ASSIGNED',
          ...examPayload
        });
        channel.close();
      } catch {}

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onScheduledSuccess) {
        onScheduledSuccess(examPayload);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-slate-800 text-white shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Exam Coordinator Scheduling Desk</h3>
              <p className="text-xs text-slate-400">Dispatch live examination schedule &amp; digital hall tickets</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {!isSuccess ? (
            <>
              {/* Exam Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Examination Title</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Grid 2 Cols */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science (Physics &amp; Chemistry)</option>
                    <option value="English Literature">English Literature</option>
                    <option value="Social Studies">Social Studies</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Target Cohort</label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="Class 8-B">Class 8-B (40 Candidates)</option>
                    <option value="Class 8-A">Class 8-A (38 Candidates)</option>
                    <option value="Class 9-B">Class 9-B (42 Candidates)</option>
                  </select>
                </div>
              </div>

              {/* Invigilator Assignment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Assigned Chief Invigilator</label>
                <div className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2">
                  <ShieldCheck className="h-4 w-4 text-violet-400" />
                  <input
                    type="text"
                    value={invigilatorName}
                    onChange={(e) => setInvigilatorName(e.target.value)}
                    className="w-full bg-transparent text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Time Window</label>
                  <input
                    type="text"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500 font-mono"
                  />
                </div>
              </div>

              {/* Submission Mode Protocol Banner */}
              <div className="p-3.5 rounded-2xl bg-violet-950/40 border border-violet-500/30 text-xs space-y-1">
                <span className="font-bold text-violet-300 block">Exam Protocol (Base Version):</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  &bull; AI Proctor &amp; LiveKit 2-Camera studio will monitor live writing.<br />
                  &bull; Upon finish, an ephemeral <b>Security Seal Code</b> pops up.<br />
                  &bull; The live exam closes, and candidates have a <b>15-minute PDF upload window</b> to submit handwritten answer sheets directly into the teacher&apos;s evaluation desk.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handleScheduleExam}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Broadcasting Schedule &amp; Issuing Hall Tickets...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Publish Schedule &amp; Dispatch Hall Tickets</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success confirmation */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">Exam Scheduled &amp; Dispatched!</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Notification alerts have been delivered to Chief Invigilator <b>{invigilatorName}</b> and all 40 students of <b>{targetClass}</b>.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
