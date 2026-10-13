'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CheckSquare, 
  Square,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  MessageSquareQuote
} from 'lucide-react';
import { FocusTable, RevisionDay } from '@/lib/types';

interface FocusTableViewProps {
  table: FocusTable;
  isParentView?: boolean;
  onToggleParentCheck?: () => Promise<void>;
  onUpdateStatus?: (newStatus: string) => Promise<void>;
}

export function FocusTableView({ 
  table, 
  isParentView = false, 
  onToggleParentCheck,
  onUpdateStatus 
}: FocusTableViewProps) {
  const [updating, setUpdating] = useState(false);

  let planData: { days: RevisionDay[] } = { days: [] };
  try {
    planData = JSON.parse(table.revision_plan_json);
  } catch (e) {
    planData = { days: [] };
  }

  const handleToggleCheck = async () => {
    if (!onToggleParentCheck) return;
    setUpdating(true);
    try {
      await onToggleParentCheck();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-md">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-xs font-bold border border-purple-200">
              <Sparkles className="h-3.5 w-3.5" />
              Shared Focus Table
            </span>
            <span className="text-xs font-bold text-slate-500">
              {table.student_name} • {table.subject}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            Target Intervention: {table.weak_concept}
          </h3>
        </div>

        {/* Score comparison metrics */}
        <div className="flex items-center gap-3 bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
          <div className="text-center px-3 border-r border-purple-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Current</span>
            <span className="text-base font-black text-red-600 tabular-nums">{table.current_score_pct}%</span>
          </div>
          <div className="text-center px-3">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Target</span>
            <span className="text-base font-black text-emerald-600 tabular-nums">{table.target_score_pct}%</span>
          </div>
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* 4-Day Timetable Grid */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-purple-600" />
            4-Day Targeted Revision Timetable (30 Mins / Day)
          </h4>
          <span className="text-[11px] font-medium text-slate-500">
            Co-tracked by Class Teacher & Parent
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {planData.days?.map((item, idx) => {
            const isCompleted = item.status === 'Completed';
            const isInProgress = item.status === 'In Progress';

            return (
              <div 
                key={idx}
                className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                  isCompleted 
                    ? 'border-emerald-200 bg-emerald-50/40' 
                    : isInProgress
                    ? 'border-purple-200 bg-purple-50/40 ring-2 ring-purple-100'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.day}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' : isInProgress ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <h5 className="mt-2 text-xs font-bold text-slate-800 line-clamp-1">
                    {item.focus}
                  </h5>

                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                    {item.exercise}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-purple-900 block">Parent Home Check:</span>
                  <p className="text-[10px] text-purple-800 line-clamp-1 italic">
                    "{item.parent_checklist}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teacher Action Plan & Parent Sign-Off */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 border-t border-purple-100">
        {/* Teacher Strategy */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
            <MessageSquareQuote className="h-4 w-4 text-blue-600" />
            <span>Teacher Pedagogical Strategy:</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {table.teacher_action}
          </p>
        </div>

        {/* Parent Co-Tracking Verification Action */}
        <div className="rounded-xl bg-purple-50/80 p-4 border border-purple-200 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
              <CheckCircle2 className="h-4 w-4 text-purple-700" />
              <span>Parent Practice Sign-off</span>
            </div>
            <p className="text-[11px] text-purple-800 mt-0.5">
              {table.parent_check_completed 
                ? "Parent verified Day 2 factoring homework in rough book." 
                : "Awaiting parent verification of Day 2 notebook practice."}
            </p>
          </div>

          {isParentView && (
            <button
              onClick={handleToggleCheck}
              disabled={updating}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition-all ${
                table.parent_check_completed
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {table.parent_check_completed ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              <span>{table.parent_check_completed ? 'Verified ✓' : 'Mark Verified'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
