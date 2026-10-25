'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Filter, 
  Eye, 
  UserCheck, 
  Check, 
  Phone, 
  FileCheck, 
  Clock, 
  UserPlus,
  Flame,
  FileText
} from 'lucide-react';
import { AdmissionEnquiry } from '@/lib/types';

interface CRMBoardProps {
  enquiries: AdmissionEnquiry[];
  onStageChange: (id: number, stage: string) => Promise<void>;
  onConvertToStudent: (id: number) => Promise<void>;
  onOpenIntakeModal?: () => void;
}

type StageFilter = 'all' | 'new' | 'followup' | 'visit' | 'converted' | 'dropped';

export function CRMBoard({ 
  enquiries, 
  onStageChange, 
  onConvertToStudent,
}: CRMBoardProps) {
  const [selectedStage, setSelectedStage] = useState<StageFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const handleConvert = async (id: number) => {
    setConvertingId(id);
    try {
      await onConvertToStudent(id);
    } finally {
      setConvertingId(null);
    }
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (selectedStage !== 'all' && e.stage !== selectedStage) return false;
      if (classFilter !== 'ALL' && e.target_grade !== classFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = e.student_name.toLowerCase().includes(q);
        const matchParent = e.parent_name.toLowerCase().includes(q);
        const matchPhone = e.phone.includes(q);
        const matchGrade = e.target_grade.toLowerCase().includes(q);
        if (!matchName && !matchParent && !matchPhone && !matchGrade) return false;
      }
      return true;
    });
  }, [enquiries, selectedStage, classFilter, searchQuery]);

  const stageCounts = useMemo(() => {
    return {
      all: enquiries.length,
      new: enquiries.filter(e => e.stage === 'new').length,
      followup: enquiries.filter(e => e.stage === 'followup').length,
      visit: enquiries.filter(e => e.stage === 'visit').length,
      converted: enquiries.filter(e => e.stage === 'converted').length,
      dropped: enquiries.filter(e => e.stage === 'dropped').length,
    };
  }, [enquiries]);

  return (
    <div className="space-y-4">
      {/* ── Modern Filter & Search Controls ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Stage Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Candidates', count: stageCounts.all, color: 'blue' },
              { id: 'new', label: 'New Inflow', count: stageCounts.new, color: 'blue' },
              { id: 'followup', label: 'In Follow-up', count: stageCounts.followup, color: 'amber' },
              { id: 'visit', label: 'Counseling / Demo', count: stageCounts.visit, color: 'purple' },
              { id: 'converted', label: 'Enrolled in SIS', count: stageCounts.converted, color: 'emerald' },
            ].map((tab) => {
              const active = selectedStage === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStage(tab.id as StageFilter)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Target Grade Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-xs font-bold text-slate-400">Class:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="relative w-full">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate name, parent name, mobile number, or target grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ── Candidate Roster ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="h-8 w-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No candidate leads found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search criteria or switch to another stage filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredEnquiries.map((enquiry) => {
              const docsCollectedCount = (enquiry.doc_report_card ? 1 : 0) + (enquiry.doc_birth_cert ? 1 : 0) + (enquiry.doc_transfer_cert ? 1 : 0);
              const isConverted = enquiry.stage === 'converted';

              return (
                <div 
                  key={enquiry.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Left: Candidate Avatar & Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
                      {enquiry.student_name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link 
                          href={`/admin/leads/${enquiry.id}`}
                          className="text-xs font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {enquiry.student_name}
                        </Link>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                          {enquiry.target_grade}
                        </span>
                        {enquiry.lead_temperature && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wide ${
                            enquiry.lead_temperature === 'hot'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : enquiry.lead_temperature === 'warm'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {enquiry.lead_temperature === 'hot' && <Flame className="h-2.5 w-2.5 text-rose-500 fill-rose-500" />}
                            {enquiry.lead_temperature.toUpperCase()}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          enquiry.stage === 'converted'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                            : enquiry.stage === 'followup'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                            : enquiry.stage === 'visit'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                        }`}>
                          {enquiry.stage.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>Parent: <strong className="text-slate-700 dark:text-slate-200">{enquiry.parent_name}</strong></span>
                        <span>•</span>
                        <a href={`tel:${enquiry.phone}`} className="hover:text-blue-600 transition-colors flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="h-3 w-3" />
                          <span>{enquiry.phone}</span>
                        </a>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FileCheck className="h-3 w-3 text-slate-400" />
                          <span>Docs: <strong className="text-slate-700 dark:text-slate-200">{docsCollectedCount}/3</strong></span>
                        </span>
                      </div>

                      {enquiry.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                          &ldquo;{enquiry.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: View Dossier & Convert to SIS */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Link
                      href={`/admin/leads/${enquiry.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Counseling Dossier</span>
                    </Link>

                    {isConverted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                        <Check className="h-3.5 w-3.5" />
                        <span>Enrolled in SIS</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConvert(enquiry.id)}
                        disabled={convertingId === enquiry.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        {convertingId === enquiry.id ? (
                          <span>Enrolling...</span>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Convert to SIS Student</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
