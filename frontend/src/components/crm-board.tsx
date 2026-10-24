'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  PhoneCall, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Bot, 
  UserCheck,
  Plus,
  Eye,
  ExternalLink
} from 'lucide-react';
import { AdmissionEnquiry } from '@/lib/types';

interface CRMBoardProps {
  enquiries: AdmissionEnquiry[];
  onStageChange: (id: number, stage: string) => Promise<void>;
  onConvertToStudent: (id: number) => Promise<void>;
}

const stages = [
  { id: 'new', label: '1. Inbound Inquiries', color: 'border-blue-200 bg-blue-50/50' },
  { id: 'followup', label: '2. Follow-up & Counseling', color: 'border-amber-200 bg-amber-50/50' },
  { id: 'visit', label: '3. Virtual Demo & Diagnostic', color: 'border-purple-200 bg-purple-50/50' },
  { id: 'converted', label: '4. Enrolled in SIS ✓', color: 'border-emerald-200 bg-emerald-50/50' },
];

export function CRMBoard({ enquiries, onStageChange, onConvertToStudent }: CRMBoardProps) {
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const handleConvert = async (id: number) => {
    setConvertingId(id);
    try {
      await onConvertToStudent(id);
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Kanban Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageEnquiries = enquiries.filter(e => e.stage === stage.id);

          return (
            <div key={stage.id} className="flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 shadow-sm space-y-3">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stage.label}</span>
                </div>
                <span className="flex h-5 px-2 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                  {stageEnquiries.length}
                </span>
              </div>

              {/* Cards in column */}
              <div className="space-y-3 flex-1 min-h-[220px]">
                {stageEnquiries.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 italic py-8">
                    No leads in this stage
                  </div>
                ) : (
                  stageEnquiries.map((enquiry) => (
                    <div 
                      key={enquiry.id} 
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-3.5 shadow-sm hover:shadow-md transition-all duration-200 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link 
                            href={`/admin/leads/${enquiry.id}`}
                            className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 group"
                          >
                            <span>{enquiry.student_name}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{enquiry.target_grade}</span>
                        </div>
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                          Parent: {enquiry.parent_name}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        &quot;{enquiry.notes || 'Inquired about admission criteria & fee milestones.'}&quot;
                      </p>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                        <Link
                          href={`/admin/leads/${enquiry.id}`}
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded-lg transition-colors"
                          title="Open full lead dossier & AI chat log"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Details</span>
                        </Link>

                        {stage.id !== 'converted' ? (
                          <button
                            type="button"
                            onClick={() => handleConvert(enquiry.id)}
                            disabled={convertingId === enquiry.id}
                            className="ml-auto flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg shadow-sm cursor-pointer"
                            title="Enroll directly into Student Information System"
                          >
                            <UserCheck className="h-3 w-3" />
                            <span>{convertingId === enquiry.id ? 'Enrolling...' : 'Convert to SIS'}</span>
                          </button>
                        ) : (
                          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="h-3 w-3" />
                            Active Student
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
