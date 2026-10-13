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
  RefreshCw
} from 'lucide-react';
import { AttendanceRecord } from '@/lib/types';

interface AttendanceSimulatorProps {
  records: AttendanceRecord[];
  onSimulateJoin: (studentId: number, minutesElapsed: number) => Promise<void>;
  onOverride: (recordId: number, status: string) => Promise<void>;
}

export function AttendanceSimulator({ records, onSimulateJoin, onOverride }: AttendanceSimulatorProps) {
  const [classLive, setClassLive] = useState(true);
  const [elapsedMinutes, setElapsedMinutes] = useState(12.5);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (studentId: number, minutes: number) => {
    setLoading(true);
    try {
      await onSimulateJoin(studentId, minutes);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = records.filter(r => r.status === 'Present').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
      {/* Header & Live Class Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Class Active
            </span>
            <span className="text-xs font-bold text-slate-500">
              Class 8B Mathematics • Quadratic Equations
            </span>
          </div>
          <h3 className="mt-2 text-base font-bold text-slate-900">
            10-Minute Rule Auto-Attendance Engine
          </h3>
        </div>

        {/* Attendance stats */}
        <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="px-2.5 py-1 text-center border-r border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Present</span>
            <span className="text-sm font-bold text-emerald-600">{presentCount}</span>
          </div>
          <div className="px-2.5 py-1 text-center border-r border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Late Flag</span>
            <span className="text-sm font-bold text-amber-600">{lateCount}</span>
          </div>
          <div className="px-2.5 py-1 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Absent</span>
            <span className="text-sm font-bold text-red-600">{absentCount}</span>
          </div>
        </div>
      </div>

      {/* Simulator Rule explanation banner */}
      <div className="rounded-xl bg-blue-50/70 p-4 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm">
            10m
          </div>
          <div>
            <span className="text-xs font-bold text-blue-900 block">
              Auto-Attendance Rule Protocol
            </span>
            <p className="text-[11px] text-blue-800 mt-0.5">
              Joins at <b>T ≤ 10 mins</b> are automatically marked <b>Present</b>. Joins at <b>T &gt; 10 mins</b> are flagged <b>Late</b> requiring teacher 1-click decision.
            </p>
          </div>
        </div>

        {/* Live join simulator trigger */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleSimulate(1, 4.0)}
            disabled={loading}
            className="flex-1 sm:flex-initial rounded-xl bg-white border border-blue-300 hover:bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800 shadow-sm"
            title="Simulate student joining at T=4 mins"
          >
            Simulate On-Time (+4m)
          </button>
          <button
            onClick={() => handleSimulate(3, 14.5)}
            disabled={loading}
            className="flex-1 sm:flex-initial rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
            title="Simulate student joining at T=14.5 mins"
          >
            Simulate Late (+14.5m)
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Join Timestamp</th>
              <th className="px-4 py-3">Rule Status</th>
              <th className="px-4 py-3 text-right">Teacher Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {records.map((rec) => {
              const isPresent = rec.status === 'Present';
              const isLate = rec.status === 'Late';
              const isAbsent = rec.status === 'Absent';

              return (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-700">
                        {rec.student_name[0]}
                      </div>
                      <span>{rec.student_name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-slate-600 font-mono">
                    {rec.join_timestamp || <span className="text-slate-400 italic">Not joined yet</span>}
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isPresent 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isLate 
                        ? 'bg-amber-100 text-amber-800 animate-pulse' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isPresent && <CheckCircle2 className="h-3 w-3" />}
                      {isLate && <AlertTriangle className="h-3 w-3" />}
                      {isAbsent && <XCircle className="h-3 w-3" />}
                      {rec.status} {rec.teacher_override ? '(Overridden)' : ''}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {isLate ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOverride(rec.id, 'Present')}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-sm"
                          title="Approve student as Present"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => onOverride(rec.id, 'Absent')}
                          className="flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-sm"
                          title="Mark student as Absent"
                        >
                          <X className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Auto-captured in SIS</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
