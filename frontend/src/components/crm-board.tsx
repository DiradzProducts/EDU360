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
  { id: 'new', label: 'New Enquiry', color: 'border-blue-200 bg-blue-50/50' },
  { id: 'followup', label: 'Follow-up Scheduled', color: 'border-amber-200 bg-amber-50/50' },
  { id: 'visit', label: 'Campus Visit Booked', color: 'border-purple-200 bg-purple-50/50' },
  { id: 'converted', label: 'Converted to SIS', color: 'border-emerald-200 bg-emerald-50/50' },
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
            <div key={stage.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Column Header */}
              <div className={`p-3.5 border-b border-slate-200 ${stage.color} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{stage.label}</span>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-700 shadow-sm">
                  {stageEnquiries.length}
                </span>
              </div>

              {/* Cards in column */}
              <div className="p-3 space-y-3 flex-1 min-h-[220px] bg-slate-50/40">
                {stageEnquiries.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 italic py-8">
                    No leads in this stage
                  </div>
                ) : (
                  stageEnquiries.map((enquiry) => (
                    <div 
                      key={enquiry.id} 
                      className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition-all duration-200 space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <Link 
                            href={`/admin/leads/${enquiry.id}`}
                            className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1 group"
                          >
                            <span>{enquiry.student_name}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <span className="text-[11px] text-slate-500 block">{enquiry.target_grade}</span>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                          Parent: {enquiry.parent_name}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{enquiry.notes || 'Inquired about admission criteria & fee milestones.'}"
                      </p>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        <Link
                          href={`/admin/leads/${enquiry.id}`}
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg transition-colors"
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
                            className="ml-auto flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg shadow-sm"
                            title="Enroll directly into Student Information System"
                          >
                            <UserCheck className="h-3 w-3" />
                            <span>{convertingId === enquiry.id ? 'Enrolling...' : 'Convert to SIS'}</span>
                          </button>
                        ) : (
                          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
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
