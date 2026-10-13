'use client';

import React, { useState } from 'react';
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
  Plus
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
  const [selectedEnquiry, setSelectedEnquiry] = useState<AdmissionEnquiry | null>(null);
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
                          <h4 className="text-xs font-bold text-slate-900">{enquiry.student_name}</h4>
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
                        {enquiry.chat_transcript && (
                          <button
                            type="button"
                            onClick={() => setSelectedEnquiry(enquiry)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg"
                            title="View AI Chatbot conversation"
                          >
                            <Bot className="h-3 w-3" />
                            <span>Chat Log</span>
                          </button>
                        )}

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

      {/* AI Chatbot Transcript Viewer Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Chatbot Transcript</h3>
                  <span className="text-[11px] text-slate-500">Lead: {selectedEnquiry.student_name} ({selectedEnquiry.parent_name})</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="my-4 max-h-72 overflow-y-auto space-y-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
              {(() => {
                try {
                  const messages = JSON.parse(selectedEnquiry.chat_transcript || '[]');
                  return messages.map((m: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${m.sender === 'parent' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                        m.sender === 'parent' 
                          ? 'bg-blue-600 text-white rounded-br-xs' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}>
                        <p>{m.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
                    </div>
                  ));
                } catch {
                  return <p className="text-xs text-slate-500">No structured transcript found.</p>;
                }
              })()}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleConvert(selectedEnquiry.id);
                  setSelectedEnquiry(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm"
              >
                <UserCheck className="h-4 w-4" />
                <span>1-Click Convert to SIS Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
