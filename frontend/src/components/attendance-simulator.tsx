'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Users, 
  Sparkles, 
  Radio, 
  Check, 
  X,
  RefreshCw,
  CalendarCheck,
  Sliders,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { AttendanceRecord } from '@/lib/types';
import { playButtonClick } from '@/lib/sound-effects';

interface AttendanceSimulatorProps {
  records: AttendanceRecord[];
  onSimulateJoin: (studentId: number, minutesElapsed: number) => Promise<void>;
  onOverride: (recordId: number, status: string) => Promise<void>;
}

export function AttendanceSimulator({ records, onSimulateJoin, onOverride }: AttendanceSimulatorProps) {
  const [sliderMinutes, setSliderMinutes] = useState<number>(12.5);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [lastEvaluatedText, setLastEvaluatedText] = useState<string | null>(null);

  const handleSimulate = async (studentId: number, minutes: number) => {
    setLoading(true);
    playButtonClick();
    try {
      await onSimulateJoin(studentId, minutes);
      const isPresent = minutes <= 10.0;
      const isLate = minutes > 10.0 && minutes <= 45.0;
      const evalStatus = isPresent ? 'PRESENT' : isLate ? 'LATE' : 'ABSENT';
      const studentName = records.find(r => r.student_id === studentId)?.student_name || `Student #${studentId}`;
      setLastEvaluatedText(
        `${studentName} joined at +${minutes.toFixed(1)}m → Auto-classified as ${evalStatus} (${
          isPresent ? 'Within 10-minute window' : 'Exceeded 10-minute threshold, requires Teacher Approval'
        })`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (minutes: number) => {
    setSliderMinutes(minutes);
    handleSimulate(selectedStudentId, minutes);
  };

  const isCurrentSliderPresent = sliderMinutes <= 10.0;
  const isCurrentSliderLate = sliderMinutes > 10.0 && sliderMinutes <= 45.0;

  const presentCount = records.filter(r => r.status === 'Present').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const leaveCount = records.filter(r => (r.status as string) === 'Leave' || (r.status as string) === 'Excused Leave').length;
  const absentCount = records.filter(r => r.status === 'Absent' && (r.status as string) !== 'Leave' && (r.status as string) !== 'Excused Leave').length;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      
      {/* 1. Header & Live Class Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Class Active
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Class 8B Mathematics • Virtual Studio
            </span>
          </div>
          <h3 className="mt-2 text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>10-Minute Auto-Attendance Stipulation Simulator</span>
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Rule v2.4
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Joins within 0–10 min are automatically verified as <b>Present</b>. Joins &gt;10 min trigger the <b>Late Flag</b> for Teacher review.
          </p>
        </div>

        {/* Attendance stats widgets */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap">
          <div className="px-3 py-1 text-center border-r border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Present</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{presentCount}</span>
          </div>
          <div className="px-3 py-1 text-center border-r border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-amber-600 uppercase block">Late Flag</span>
            <span className="text-sm font-black text-amber-600">{lateCount}</span>
          </div>
          <div className="px-3 py-1 text-center border-r border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-purple-600 uppercase block">Excused</span>
            <span className="text-sm font-black text-purple-600">{leaveCount}</span>
          </div>
          <div className="px-3 py-1 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Absent</span>
            <span className="text-sm font-black text-red-600">{absentCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Simulation Cockpit */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-950 dark:to-indigo-950/20 p-5 border border-slate-200 dark:border-slate-800 space-y-5">
        
        {/* Top Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/20">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Simulate Student Join Time
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Adjust slider or choose quick preset to verify 10m rule execution
              </span>
            </div>
          </div>

          {/* Student Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              Target Student:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white shadow-sm focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              {records.map((r, idx) => (
                <option key={`${r.id}-${r.student_id}-${idx}`} value={r.student_id}>
                  {r.student_name} (#{r.student_id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Slider Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Join Elapsed Time:</span>
              <span className={`px-2 py-0.5 rounded-lg font-mono font-black text-sm ${
                isCurrentSliderPresent 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' 
                  : isCurrentSliderLate 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
              }`}>
                +{sliderMinutes.toFixed(1)} mins into class
              </span>
            </div>

            {/* Live Verdict Pill */}
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              isCurrentSliderPresent 
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' 
                : isCurrentSliderLate 
                  ? 'bg-amber-500 text-black font-black shadow-sm shadow-amber-500/20'
                  : 'bg-rose-600 text-white shadow-sm'
            }`}>
              {isCurrentSliderPresent ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Rule: Auto-Mark PRESENT (≤ 10m)</span>
                </>
              ) : isCurrentSliderLate ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Rule: Flag LATE (&gt; 10m threshold)</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Rule: ABSENT (&gt; 45m cut-off)</span>
                </>
              )}
            </span>
          </div>

          {/* Range Input Slider with visual threshold marker */}
          <div className="relative pt-1 pb-3">
            <input
              type="range"
              min="0"
              max="45"
              step="0.5"
              value={sliderMinutes}
              onChange={(e) => setSliderMinutes(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            {/* Visual 10m Threshold Pin */}
            <div 
              className="absolute top-1 flex flex-col items-center pointer-events-none"
              style={{ left: `${(10 / 45) * 100}%` }}
            >
              <div className="h-4 w-0.5 bg-amber-500" />
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 font-mono -mt-0.5">
                | 10m Limit
              </span>
            </div>
          </div>
        </div>

        {/* Quick Presets & Execute Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">Quick Scenarios:</span>
            <button
              type="button"
              onClick={() => handleQuickPreset(3.5)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 cursor-pointer shadow-xs"
              title="Simulate on-time join at 3.5 mins"
            >
              🟢 On-Time (+3.5m)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(9.5)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 cursor-pointer shadow-xs"
              title="Simulate join just before cutoff"
            >
              🟢 Boundary (+9.5m)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(14.5)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-50 cursor-pointer shadow-xs"
              title="Simulate late join triggering stipulation"
            >
              🟡 Late Stipulation (+14.5m)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(28.0)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-50 cursor-pointer shadow-xs"
              title="Simulate very late join"
            >
              🟡 Late (+28m)
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSimulate(selectedStudentId, sliderMinutes)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/25 transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>{loading ? 'Evaluating...' : 'Run Simulation'}</span>
          </button>
        </div>

        {/* Last Evaluated Toast / Banner */}
        {lastEvaluatedText && (
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
            <span className="font-semibold">{lastEvaluatedText}</span>
            <button
              type="button"
              onClick={() => setLastEvaluatedText(null)}
              className="text-indigo-400 hover:text-indigo-700 ml-2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* 3. Live Attendance Roster Table with 1-Click Teacher Action Overrides */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Live Class Roster &amp; Action Queue ({records.length} Students)
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Teacher Overrides log into SIS permanently
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Join Timestamp</th>
                <th className="px-4 py-3.5">10-Min Rule Verdict</th>
                <th className="px-4 py-3.5 text-right">Teacher Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {records.map((rec, idx) => {
                const isPresent = rec.status === 'Present';
                const isLate = rec.status === 'Late';
                const isLeave = (rec.status as string) === 'Leave' || (rec.status as string) === 'Excused Leave';
                const isAbsent = rec.status === 'Absent' && !isLeave;

                return (
                  <tr key={`${rec.id}-${rec.student_id}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px] text-slate-700 dark:text-slate-300">
                          {rec.student_name[0]}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>{rec.student_name}</span>
                          {isLeave && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              Approved Leave
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {isLeave ? (
                        <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
                          <CalendarCheck className="h-3.5 w-3.5" />
                          <span>{rec.join_timestamp || 'Excused Medical Absence'}</span>
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 font-mono font-semibold ${
                          isLate ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          <Clock className="h-3 w-3 opacity-60" />
                          <span>{rec.join_timestamp || 'Not joined yet'}</span>
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        isPresent 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                          : isLate 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse' 
                            : isLeave
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                      }`}>
                        {isPresent && <CheckCircle2 className="h-3 w-3" />}
                        {isLate && <AlertTriangle className="h-3 w-3" />}
                        {isLeave && <CalendarCheck className="h-3 w-3 text-purple-700" />}
                        {isAbsent && <XCircle className="h-3 w-3" />}
                        <span>{isLeave ? 'Excused Leave' : rec.status}</span>
                        {rec.teacher_override && (
                          <span className="font-mono text-[9px] underline">
                            (Verified)
                          </span>
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {isLeave ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Medical Verified</span>
                        </span>
                      ) : isLate ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOverride(rec.id, 'Present')}
                            className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                            title="Approve student as Present"
                          >
                            <Check className="h-3 w-3" />
                            <span>Approve Present</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOverride(rec.id, 'Absent')}
                            className="flex items-center gap-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                            title="Mark student as Absent"
                          >
                            <X className="h-3 w-3" />
                            <span>Reject (Absent)</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Auto-verified in SIS
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
