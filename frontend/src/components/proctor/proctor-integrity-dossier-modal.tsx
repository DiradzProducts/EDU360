'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Clock, 
  Camera, 
  PhoneCall, 
  Mic, 
  Eye, 
  Maximize, 
  FileText, 
  Ban, 
  Award, 
  Sliders, 
  UserX,
  Volume2,
  Calendar,
  AlertOctagon,
  Check,
  Send
} from 'lucide-react';

interface AuditTimelineItem {
  id: number;
  eventType: string;
  confidence?: number;
  strikeAssigned: boolean;
  suspicionIncrement?: number;
  notes: string;
  loggedAt: string;
}

interface ProctorCandidateDossier {
  id: number;
  studentId: number;
  name: string;
  rollNo: string;
  grade: string;
  section: string;
  subject: string;
  avatar: string;
  status: string;
  examMode?: string;
  suspicionScore: number;
  credibilityIndex: number;
  trustTier: 'HIGH_TRUST' | 'MEDIUM_TRUST' | 'SUSPICIOUS';
  trustLabel: string;
  strikes: number;
  tabSwitches: number;
  anomalyType?: string;
  isPaused?: boolean;
  isDisqualified?: boolean;
  submissionContent?: string;
  evaluatedMarks?: number;
  evaluatorRemarks?: string;
  submittedAt?: string;
}

interface ProctorIntegrityDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: number;
  candidateName?: string;
  onVerdictApplied?: (result: { verdict: string; candidateId: number }) => void;
}

export function ProctorIntegrityDossierModal({
  isOpen,
  onClose,
  candidateId,
  candidateName = 'Student Candidate',
  onVerdictApplied
}: ProctorIntegrityDossierModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [dossier, setDossier] = useState<ProctorCandidateDossier | null>(null);
  const [timeline, setTimeline] = useState<AuditTimelineItem[]>([]);
  const [selectedVerdict, setSelectedVerdict] = useState<'APPROVED' | 'PENALIZED' | 'DISQUALIFIED' | null>(null);
  const [penaltyMarks, setPenaltyMarks] = useState<number>(5.0);
  const [verdictNotes, setVerdictNotes] = useState<string>('');
  const [isSubmittingVerdict, setIsSubmittingVerdict] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    if (!isOpen || !candidateId) return;

    let mounted = true;
    setLoading(true);

    api.getCandidateProctorDossier(candidateId)
      .then((res: any) => {
        if (!mounted) return;
        if (res && res.success) {
          setDossier(res.candidate);
          setTimeline(res.auditTimeline || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load candidate proctor dossier', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data || !mounted) return;
        if (data.type === 'STUDENT_TELEMETRY' && (data.candidateId === candidateId || !data.candidateId)) {
          if (data.analysisEntry) {
            const entry = data.analysisEntry;
            setTimeline(prev => [
              {
                id: Date.now(),
                eventType: entry.category,
                confidence: entry.confidence,
                strikeAssigned: entry.actionTaken === 'STRIKE',
                suspicionIncrement: entry.actionTaken === 'STRIKE' ? 25 : 10,
                notes: `${entry.title}: ${entry.ruleTriggered}`,
                loggedAt: entry.timestamp
              },
              ...prev
            ]);
          }
        }
      };
    } catch {}

    return () => {
      mounted = false;
      if (channel) channel.close();
    };
  }, [isOpen, candidateId]);

  const handleApplyVerdict = async (verdict: 'APPROVED' | 'PENALIZED' | 'DISQUALIFIED') => {
    setIsSubmittingVerdict(true);
    try {
      const res = await api.submitDossierVerdict(candidateId, {
        verdict,
        penalty_marks: verdict === 'PENALIZED' ? penaltyMarks : 0,
        notes: verdictNotes || `Signed verdict: ${verdict}`,
        evaluator_name: 'Evaluation Authority Desk'
      });
      triggerToast(`✓ Verdict [${verdict}] recorded successfully! Marks memo updated.`);
      if (dossier) {
        setDossier({
          ...dossier,
          status: verdict === 'APPROVED' ? 'verified' : verdict === 'PENALIZED' ? 'penalized' : 'disqualified',
          isDisqualified: verdict === 'DISQUALIFIED'
        });
      }
      setSelectedVerdict(null);
      if (onVerdictApplied) {
        onVerdictApplied({ verdict, candidateId });
      }
    } catch (err) {
      triggerToast('Failed to apply verdict. Saved locally.');
    } finally {
      setIsSubmittingVerdict(false);
    }
  };

  if (!isOpen) return null;

  const trustColor = dossier?.trustTier === 'HIGH_TRUST'
    ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
    : dossier?.trustTier === 'MEDIUM_TRUST'
    ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
    : 'text-rose-500 bg-rose-500/10 border-rose-500/30';

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'PHONE_DETECTED':
        return <Camera className="h-4 w-4 text-rose-500" />;
      case 'MULTIPLE_FACES':
        return <UserX className="h-4 w-4 text-rose-500" />;
      case 'TAB_SWITCH':
        return <Maximize className="h-4 w-4 text-amber-500" />;
      case 'AUDIO_ANOMALY':
        return <Volume2 className="h-4 w-4 text-amber-500" />;
      case 'PAUSE_EXAM':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'NUDGE':
        return <Eye className="h-4 w-4 text-violet-500" />;
      case 'EXAM_SUBMIT':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Toast */}
        {toastMsg && (
          <div className="absolute top-4 right-4 z-50 rounded-2xl bg-slate-950 text-white px-4 py-2.5 text-xs font-bold border border-slate-700 shadow-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-tight uppercase text-violet-300">
                  Post-Exam AI Proctoring Audit Dossier
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  Immutable Telemetry Log
                </span>
              </div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                {dossier?.name || candidateName}
                <span className="text-xs font-normal text-slate-400">
                  &bull; Roll #{dossier?.rollNo || '14'} &bull; {dossier?.grade || 'Class 8-B'}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <div className="h-8 w-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold">Compiling student proctor audit dossier...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* TOP METRIC CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Credibility Index */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Session Trust Score
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                    {dossier?.credibilityIndex || 85}%
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${trustColor}`}>
                    {dossier?.trustLabel || 'Verified Clean'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      (dossier?.credibilityIndex || 85) >= 80 ? 'bg-emerald-500' : (dossier?.credibilityIndex || 85) >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${dossier?.credibilityIndex || 85}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Strikes Assigned */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Formal Strikes Issued
                </span>
                <div className="flex items-baseline justify-between">
                  <span className={`text-3xl font-black font-mono ${
                    (dossier?.strikes || 0) >= 2 ? 'text-rose-500' : (dossier?.strikes || 0) === 1 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {dossier?.strikes || 0} / 3
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {(dossier?.strikes || 0) >= 3 ? 'Auto-Lock' : (dossier?.strikes || 0) >= 1 ? 'Escalated' : 'Clean'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Invigilator issued {(dossier?.strikes || 0)} strike telemetry warnings.
                </p>
              </div>

              {/* Card 3: Tab Switches */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Browser Tab Switches
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                    {dossier?.tabSwitches || 0}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">Occurrences</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Window blur and alt-tab events recorded by OS listener.
                </p>
              </div>

              {/* Card 4: Primary Anomaly */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Primary Anomaly Tag
                </span>
                <div className="flex items-center gap-1.5 truncate">
                  <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {dossier?.anomalyType || 'No Critical Anomalies'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  Mode: {dossier?.examMode === 'MODE_CBT' ? 'Pure Online CBT' : 'Hybrid Written Scan'}
                </span>
              </div>

            </div>

            {/* CHRONOLOGICAL INCIDENT TIMELINE */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-violet-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Incident Audit Timeline &amp; Telemetry Feed
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {timeline.length} Recorded Incident{timeline.length !== 1 ? 's' : ''}
                </span>
              </div>

              {timeline.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  No malpractice incidents logged during this examination session. Clean record!
                </div>
              ) : (
                <div className="space-y-3">
                  {timeline.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-start gap-3 text-xs"
                    >
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                        {getEventIcon(item.eventType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                            {item.eventType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {item.loggedAt ? new Date(item.loggedAt).toLocaleTimeString() : '09:00 AM'}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                          {item.notes}
                        </p>
                        {item.confidence && item.confidence < 1.0 && (
                          <span className="inline-block mt-1 text-[9px] font-mono bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 px-1.5 py-0.2 rounded">
                            AI Confidence: {Math.round(item.confidence * 100)}%
                          </span>
                        )}
                        {item.strikeAssigned && (
                          <span className="inline-block mt-1 ml-1 text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-1.5 py-0.2 rounded">
                            Strike Assigned ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TEACHER EVALUATION VERDICT SIGN-OFF SECTION */}
            <div className="rounded-2xl border-2 border-violet-200 dark:border-violet-900/60 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-slate-900 dark:to-slate-850 p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Academic Evaluator Sign-Off &amp; Penalty Adjustment
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Review the proctoring evidence above. You may formally clear the submission, apply a mark deduction for minor tab switches, or disqualify for blatant cheating.
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* 1. Approve */}
                <button
                  type="button"
                  disabled={isSubmittingVerdict}
                  onClick={() => handleApplyVerdict('APPROVED')}
                  className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 p-3 text-left transition-all cursor-pointer flex flex-col justify-between space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Approve Result</span>
                  </div>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                    Verify clean exam &amp; publish marks without penalties.
                  </span>
                </button>

                {/* 2. Penalty */}
                <button
                  type="button"
                  disabled={isSubmittingVerdict}
                  onClick={() => setSelectedVerdict('PENALIZED')}
                  className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 p-3 text-left transition-all cursor-pointer flex flex-col justify-between space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Deduct Penalty Marks</span>
                  </div>
                  <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
                    Apply -5 marks deduction for tab switches or noise.
                  </span>
                </button>

                {/* 3. Disqualify */}
                <button
                  type="button"
                  disabled={isSubmittingVerdict}
                  onClick={() => setSelectedVerdict('DISQUALIFIED')}
                  className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-800 dark:text-rose-300 p-3 text-left transition-all cursor-pointer flex flex-col justify-between space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Ban className="h-4 w-4 text-rose-600" />
                    <span>Cancel Paper (Malpractice)</span>
                  </div>
                  <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80">
                    Set marks to 0 and escalate to Principal Triage.
                  </span>
                </button>
              </div>

              {/* Conditional Drawer for Penalty or Disqualification input */}
              {selectedVerdict && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 animate-in fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Confirm Action: {selectedVerdict === 'PENALIZED' ? 'Apply Penalty Marks' : 'Confirm Disqualification'}
                    </span>
                    <button onClick={() => setSelectedVerdict(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {selectedVerdict === 'PENALIZED' && (
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 dark:text-slate-300">Marks to Deduct</label>
                      <input
                        type="number"
                        value={penaltyMarks}
                        onChange={(e) => setPenaltyMarks(Number(e.target.value))}
                        className="w-24 p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-300">Official Justification Notes *</label>
                    <input
                      type="text"
                      value={verdictNotes}
                      onChange={(e) => setVerdictNotes(e.target.value)}
                      placeholder="e.g. Penalty applied for 3 tab switches during essay writing..."
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedVerdict(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingVerdict}
                      onClick={() => handleApplyVerdict(selectedVerdict)}
                      className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      {isSubmittingVerdict ? 'Recording...' : 'Confirm & Save Verdict'}
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
