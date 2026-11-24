'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Eye,
  UserCheck,
  Check,
  Phone,
  Flame,
  LayoutList,
  Columns3,
  ChevronRight,
  FileText,
  RotateCcw,
  X
} from 'lucide-react';
import { AdmissionEnquiry } from '@/lib/types';

interface CRMBoardProps {
  enquiries: AdmissionEnquiry[];
  onStageChange: (id: number, stage: string) => Promise<void>;
  onConvertToStudent: (id: number) => Promise<void>;
  onOpenIntakeModal?: () => void;
}

type StageFilter = 'all' | 'new' | 'followup' | 'visit' | 'converted' | 'dropped';
type ViewMode = 'table' | 'kanban';

const PIPELINE_STAGES: { id: Exclude<StageFilter, 'all' | 'dropped'>; label: string; shortLabel: string }[] = [
  { id: 'new', label: 'New Inflow', shortLabel: 'New' },
  { id: 'followup', label: 'In Follow-up', shortLabel: 'Follow-up' },
  { id: 'visit', label: 'Counseling / Demo', shortLabel: 'Demo' },
  { id: 'converted', label: 'Enrolled in SIS', shortLabel: 'Enrolled' },
];

export function CRMBoard({
  enquiries,
  onStageChange,
  onConvertToStudent,
}: CRMBoardProps) {
  const [selectedStage, setSelectedStage] = useState<StageFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [convertingId, setConvertingId] = useState<number | null>(null);
  const [updatingStageId, setUpdatingStageId] = useState<number | null>(null);

  const handleConvert = async (id: number) => {
    setConvertingId(id);
    try {
      await onConvertToStudent(id);
    } finally {
      setConvertingId(null);
    }
  };

  const handleQuickStage = async (id: number, nextStage: string) => {
    setUpdatingStageId(id);
    try {
      await onStageChange(id, nextStage);
    } finally {
      setUpdatingStageId(null);
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
      new: enquiries.filter((e) => e.stage === 'new').length,
      followup: enquiries.filter((e) => e.stage === 'followup').length,
      visit: enquiries.filter((e) => e.stage === 'visit').length,
      converted: enquiries.filter((e) => e.stage === 'converted').length,
      dropped: enquiries.filter((e) => e.stage === 'dropped').length,
    };
  }, [enquiries]);

  const conversionRate =
    stageCounts.all > 0 ? Math.round((stageCounts.converted / stageCounts.all) * 100) : 0;

  const renderDocBadges = (e: AdmissionEnquiry) => {
    const docs = [
      { key: 'RC', label: 'Report Card', ok: Boolean(e.doc_report_card) },
      { key: 'BC', label: 'Birth Certificate', ok: Boolean(e.doc_birth_cert) },
      { key: 'TC', label: 'Transfer Certificate', ok: Boolean(e.doc_transfer_cert) },
    ];
    return (
      <div className="inline-flex items-center gap-1" title="Document Readiness: Report Card, Birth Cert, Transfer Cert">
        {docs.map((d) => (
          <span
            key={d.key}
            title={`${d.label}: ${d.ok ? 'Received' : 'Pending'}`}
            className={`px-1.5 py-0.5 rounded-md text-xs font-semibold font-mono border ${
              d.ok
                ? 'bg-[#F0FDFA] dark:bg-[#38BDF8]/25 text-[#38BDF8] border-[#38BDF8]/40'
                : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] opacity-75'
            }`}
          >
            {d.key}
          </span>
        ))}
      </div>
    );
  };

  const renderTempBadge = (temp?: string) => {
    if (!temp) return null;
    const t = temp.toLowerCase();
    if (t === 'hot') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FFF7ED] dark:bg-[#2A190E] text-[#C2410C] dark:text-[#FDBA74] border border-[#FED7AA] dark:border-[#7C2D12]">
          <Flame className="h-3 w-3 text-[#F97316]" aria-hidden="true" />
          Hot
        </span>
      );
    }
    if (t === 'warm') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] border border-[#E2E8F0]">
          Warm
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F8FAFC] dark:bg-[#111827] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0]">
        Cold
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* ── 1. INTERACTIVE 4-STEP FUNNEL STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PIPELINE_STAGES.map((stage, idx) => {
          const count = stageCounts[stage.id];
          const isSelected = selectedStage === stage.id;
          const pctOfTotal = stageCounts.all > 0 ? Math.round((count / stageCounts.all) * 100) : 0;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setSelectedStage(isSelected ? 'all' : stage.id)}
              className={`relative text-left p-4 rounded-2xl border transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#2563EB] text-[#FFFFFF] font-bold border-[#1D4ED8] shadow-sm'
                  : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#2563EB] dark:hover:border-[#3B82F6]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-[#DBEAFE]' : 'text-[#475569]'
                  }`}
                >
                  <span>{stage.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </span>
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    isSelected
                      ? 'text-[#DBEAFE]'
                      : stage.id === 'converted'
                        ? 'text-[#38BDF8] dark:text-[#5EEAD4]'
                        : 'text-[#475569]'
                  }`}
                >
                  {stage.id === 'converted' ? `${conversionRate}% conv.` : `${pctOfTotal}%`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 2. SINGLE-ROW COMPACT SEARCH, CLASS FILTER & VIEW TOGGLE ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0]">
        <div className="relative flex-1 min-w-0">
          <Search className="h-4 w-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search candidate, parent, mobile number, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search admission candidates"
            className="w-full pl-9 pr-8 py-2 text-[13px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {selectedStage !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedStage('all')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F8FAFC] text-[#2563EB] border border-[#E2E8F0] cursor-pointer"
            >
              <span>Stage: {selectedStage}</span>
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            aria-label="Filter by target class"
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] cursor-pointer"
          >
            <option value="ALL">All Classes ({stageCounts.all})</option>
            <option value="Class 6">Class 6</option>
            <option value="Class 7">Class 7</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
          </select>

          {/* Table / Kanban Segmented Switch */}
          <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] dark:bg-[#1E293B] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#FFFFFF] text-[#0F172A] shadow-2xs'
                  : 'text-[#475569] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              aria-label="Kanban pipeline view"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#FFFFFF] text-[#0F172A] shadow-2xs'
                  : 'text-[#475569] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3A. COMPACT CANDIDATE TABLE VIEW ── */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] overflow-hidden">
          {filteredEnquiries.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="h-8 w-8 text-[#475569] mx-auto" aria-hidden="true" />
              <h4 className="text-sm font-bold text-[#0F172A]">No candidate leads found</h4>
              <p className="text-xs text-[#475569]">
                Try clearing your search or selecting another funnel stage.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Parent &amp; Phone</th>
                    <th className="py-3 px-4">Docs</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B] text-[13px]">
                  {filteredEnquiries.map((enquiry) => {
                    const isConverted = enquiry.stage === 'converted';
                    return (
                      <tr key={enquiry.id}>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-[#F8FAFC] text-[#2563EB] border border-[#E2E8F0] font-bold text-xs flex items-center justify-center shrink-0">
                              {enquiry.student_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                  href={`/admin/leads/${enquiry.id}`}
                                  className="font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors"
                                >
                                  {enquiry.student_name}
                                </Link>
                                <span className="px-2 py-0.5 rounded-md text-xs font-semibold font-mono bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569]">
                                  {enquiry.target_grade}
                                </span>
                                {renderTempBadge(enquiry.lead_temperature)}
                              </div>
                              {enquiry.notes && (
                                <p className="text-xs text-[#475569] truncate max-w-xs mt-0.5">
                                  {enquiry.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-[#0F172A] text-xs">
                            {enquiry.parent_name}
                          </div>
                          <a
                            href={`tel:${enquiry.phone}`}
                            className="inline-flex items-center gap-1 text-xs font-mono text-[#475569] hover:text-[#2563EB] mt-0.5"
                          >
                            <Phone className="h-3 w-3" aria-hidden="true" />
                            <span>{enquiry.phone}</span>
                          </a>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">{renderDocBadges(enquiry)}</td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isConverted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold edu-badge-success">
                              <Check className="h-3 w-3" aria-hidden="true" />
                              Enrolled
                            </span>
                          ) : (
                            <select
                              value={enquiry.stage}
                              disabled={updatingStageId === enquiry.id}
                              onChange={(e) => handleQuickStage(enquiry.id, e.target.value)}
                              aria-label={`Change stage for ${enquiry.student_name}`}
                              className="px-2.5 py-1 rounded-xl text-xs font-semibold border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] cursor-pointer"
                            >
                              <option value="new">New Inflow</option>
                              <option value="followup">In Follow-up</option>
                              <option value="visit">Counseling / Demo</option>
                              <option value="dropped">Dropped</option>
                            </select>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/admin/leads/${enquiry.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-xs font-semibold text-[#475569] transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Dossier</span>
                            </Link>
                            {!isConverted && (
                              <button
                                type="button"
                                onClick={() => handleConvert(enquiry.id)}
                                disabled={convertingId === enquiry.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-[#FFFFFF] font-extrabold text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>{convertingId === enquiry.id ? 'Enrolling...' : 'Enroll'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ── 3B. 4-COLUMN KANBAN PIPELINE VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {PIPELINE_STAGES.map((stage) => {
            const stageItems = filteredEnquiries.filter((e) => e.stage === stage.id);
            return (
              <div
                key={stage.id}
                className="rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9]/80 dark:bg-[#0B0F19] p-3 space-y-3"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                    {stage.shortLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold tabular-nums bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0F172A] border border-[#E2E8F0]">
                    {stageItems.length}
                  </span>
                </div>

                {stageItems.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-[#E2E8F0] text-xs text-[#475569]">
                    No leads in this stage
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {stageItems.map((enquiry) => (
                      <div
                        key={enquiry.id}
                        className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/admin/leads/${enquiry.id}`}
                            className="text-[13px] font-bold text-[#0F172A] hover:text-[#2563EB] leading-snug"
                          >
                            {enquiry.student_name}
                          </Link>
                          <span className="px-1.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] shrink-0">
                            {enquiry.target_grade}
                          </span>
                        </div>

                        <div className="text-xs text-[#475569] space-y-0.5">
                          <div className="font-medium text-[#475569]">{enquiry.parent_name}</div>
                          <div className="font-mono">{enquiry.phone}</div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          {renderDocBadges(enquiry)}
                          {renderTempBadge(enquiry.lead_temperature)}
                        </div>

                        <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                          <Link
                            href={`/admin/leads/${enquiry.id}`}
                            className="text-xs font-semibold text-[#475569] hover:text-[#2563EB]"
                          >
                            Dossier →
                          </Link>
                          {enquiry.stage !== 'converted' && (
                            <button
                              type="button"
                              onClick={() => handleConvert(enquiry.id)}
                              disabled={convertingId === enquiry.id}
                              className="px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-[#FFFFFF] font-extrabold text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                              {convertingId === enquiry.id ? '...' : 'Enroll'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
